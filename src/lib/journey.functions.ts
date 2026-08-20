import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import {
  FIRST_STAGE,
  FIRST_OWNER_STAGE,
  nextStage,
  stageById,
  stageIndex,
  stagesFor,
  trackOf,
} from "@/lib/journey";
import {
  buildBuilderSystemPrompt,
  buildFounderSystemPrompt,
  founderSafetyReply,
  isFounderIdentityDiscovery,
  PLATFORM_MEMORY_PREFIX,
} from "@/lib/journey-prompts.server";
import {
  loadJourneyState,
  isExplicitStageApproval,
  parseJourneyMarkers,
  type JourneyDatabase,
} from "@/lib/journey-state.server";
import { isTeleporterAuditTurn } from "@/lib/frassy/engine-registry";


export type JourneyMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  stage: string;
  created_at: string;
};

export type BuilderMemoryEntry = {
  category: string;
  key: string;
  value: string;
};

export type JourneyState = {
  status: string;
  currentStage: string;
  stageProgress: Record<string, { completedAt?: string }>;
  startedAt: string;
  lastActiveAt: string;
  completedAt: string | null;
  messages: JourneyMessage[];
  memory: BuilderMemoryEntry[];
};

export type ConversationDiagnostics = {
  conversationMode: "Founder" | "Builder";
  systemPrompt: "founder_control_room" | "builder_mentor";
  promptVersion: "v4";
  sessionType: "platform_commissioning" | "builder_journey";
  memoryNamespace: "platform" | "builder";
  routingDecision: string;
  historySource: "platform_session" | "builder_session";
  fallback: "disabled" | "founder_safety_interceptor" | "deterministic_opening";
  identityDiscovery: "disabled" | "enabled";
  stageId: string;
  historyMessages: number;
};

export const getBuilderJourney = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<JourneyState> => {
    const sb = context.supabase as unknown as JourneyDatabase;
    let state = await loadJourneyState(sb, context.userId);
    const { data: isAdmin, error: roleError } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (roleError) throw new Error(roleError.message);

    // The full transcript is always returned. Frassy's words are never hidden
    // from the Founder — every sentence she said stays in the record.


    // Founder identity is authoritative on the server. This also repairs accounts
    // that entered the Builder journey before Founder Commissioning existed.
    if (isAdmin && trackOf(state.currentStage) !== "owner") {
      const now = new Date().toISOString();
      const { error } = await context.supabase
        .from("builder_journeys")
        .update({ current_stage: FIRST_OWNER_STAGE, status: "in_progress", completed_at: null, last_active_at: now })
        .eq("user_id", context.userId);
      if (error) throw new Error(error.message);
      return { ...state, status: "in_progress", currentStage: FIRST_OWNER_STAGE, completedAt: null, lastActiveAt: now };
    }

    return state;
  });

export const setJourneyStage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ stageId: z.string() }).parse(d))
  .handler(async ({ context, data }) => {
    const sb = context.supabase as unknown as JourneyDatabase;
    const target = stageById(data.stageId);
    if (trackOf(target.id) === "owner") {
      const { data: isAdmin, error: roleError } = await context.supabase.rpc("has_role", {
        _user_id: context.userId,
        _role: "admin",
      });
      if (roleError) throw new Error(roleError.message);
      if (!isAdmin) throw new Error("Founder Commissioning is restricted to the Founder.");
    }
    const { error } = await sb
      .from("builder_journeys")
      .update({ current_stage: target.id, last_active_at: new Date().toISOString() })
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const journeyTurn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({ message: z.string().trim().min(1), opening: z.literal(false).optional() })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    const sb = context.supabase as unknown as JourneyDatabase;
    const userId = context.userId;

    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) throw new Error("Frassy is not configured yet.");

    let state = await loadJourneyState(sb, userId);
    const { data: isAdmin, error: roleError } = await context.supabase.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });
    if (roleError) throw new Error(roleError.message);
    if (isAdmin && trackOf(state.currentStage) !== "owner") {
      const now = new Date().toISOString();
      const { error } = await context.supabase
        .from("builder_journeys")
        .update({ current_stage: FIRST_OWNER_STAGE, status: "in_progress", completed_at: null, last_active_at: now })
        .eq("user_id", userId);
      if (error) throw new Error(error.message);
      state = { ...state, status: "in_progress", currentStage: FIRST_OWNER_STAGE, completedAt: null, lastActiveAt: now };
    }
    const stage = stageById(state.currentStage);
    const activeTrack = isAdmin ? "owner" : "builder";
    if (trackOf(stage.id) !== activeTrack) {
      throw new Error("Conversation route did not resolve to the authenticated role.");
    }

    const userText = data.message.trim();
    // Saving is never assumed. The row id comes back so the page can prove this
    // exact message was written, instead of clearing it on faith.
    const userSave = await sb
      .from("builder_journey_messages")
      .insert({ user_id: userId, stage: stage.id, role: "user", content: userText })
      .select("id")
      .maybeSingle();
    const userMessageId: string | null = userSave.error ? null : (userSave.data?.id ?? null);

    const { data: profile } = await sb
      .from("profiles")
      .select("display_name, full_name")
      .eq("id", userId)
      .maybeSingle();
    const displayName: string | null =
      activeTrack === "owner"
        ? "Nicky"
        : profile?.display_name ?? profile?.full_name ?? null;

    // FRASS-0572 — One intelligence layer, many modes.
    // The Journey pipeline is Journey Mode only. Teleporter card reviews belong
    // to the shared engine, so any audit turn that was ever recorded into this
    // journey history is dropped before the model reads it. Without this, an old
    // "Card #011" review keeps being replayed as if it were today's conversation.
    const history = state.messages
      .filter((message) => trackOf(message.stage) === activeTrack)
      .filter((message) => !isTeleporterAuditTurn(message.content))
      .slice(-40)
      .map((m) => ({ role: m.role, content: m.content }));
    history.push({ role: "user", content: userText });

    // If the Founder asks for a card review here, she says where it happens
    // instead of inventing one from memory.
    const auditRequested = isTeleporterAuditTurn(userText);



    const { createLovableAiGatewayProvider } = await import("@/lib/ai-gateway.server");
    const { streamText } = await import("ai");

    const gateway = createLovableAiGatewayProvider(apiKey);
    const basePrompt = activeTrack === "owner"
      ? buildFounderSystemPrompt(stage.id, state.memory, displayName)
      : buildBuilderSystemPrompt(stage.id, state.memory, displayName);
    // FRASS-0572 — Journey Mode boundary. She is the same Frassy, but this room
    // does not run Teleporter audits.
    const system = `${basePrompt}

━━━ MODE: JOURNEY (FRASS-0572) ━━━
This conversation is the stage-driven journey. You are NOT in Teleporter Audit Mode here.
Never open with "VISUAL VERIFICATION", never name a Teleporter card number, never say "ready for the next card".${
      auditRequested
        ? `
The person just asked about a Teleporter card review. Answer in one short line: card reviews happen in the Founder Control Room → World Teleporter, where the active card is read from the page itself. Then continue this journey step.`
        : ""
    }`;

    const result = streamText({
      model: gateway("google/gemini-3.6-flash"),
      system,
      messages: history as { role: "user" | "assistant"; content: string }[],
    });

    const raw = await result.text;
    const parsed = parseJourneyMarkers(raw);
    // Identity-drift detection is now advisory only. It is reported in the
    // diagnostics strip, but it NEVER rewrites, replaces or discards what
    // Frassy actually said — that substitution was the repeating generic line.
    const identityDrift = activeTrack === "owner" && isFounderIdentityDiscovery(parsed.text);
    const text = parsed.text;

    // ── WORKFLOW ENGINE (independent of the conversation engine) ───────────────
    // Progress moves only on an explicit instruction from the Founder/Builder.
    // A direct advance word ("next", "continue", "proceed", "move on") always
    // advances the step; a plain approval ("yes", "approved") advances only when
    // the conversation engine proposed completion. The conversation text itself
    // never restarts or rewinds the workflow.
    const advanceWord = /^(next|continue|proceed|move on|skip)(\b|[.!,])/i.test(userText.trim());
    const stageComplete =
      advanceWord || (isExplicitStageApproval(userText) && parsed.stageComplete);
    // Everything she learns is recorded, every turn.
    const memory = parsed.memory;
    const reply = text || (activeTrack === "owner"
      ? founderSafetyReply(stage.id, displayName)
      : "I'm here. Take your time — tell me a little more.");



    const assistantSave = await sb
      .from("builder_journey_messages")
      .insert({ user_id: userId, stage: stage.id, role: "assistant", content: reply })
      .select("id")
      .maybeSingle();
    const assistantMessageId: string | null = assistantSave.error
      ? null
      : (assistantSave.data?.id ?? null);

    if (memory.length) {
      // Founder sessions write Platform Memory; Builder sessions write Builder Memory.
      const category =
        activeTrack === "owner"
          ? `${PLATFORM_MEMORY_PREFIX}${stage.category}`
          : stage.category;
      await sb.from("builder_memory").upsert(
        memory.map((m) => ({
          user_id: userId,
          category,
          key: m.key,
          value: m.value,
          source: activeTrack === "owner" ? "commissioning" : "onboarding",
        })),
        { onConflict: "user_id,category,key" },
      );
    }


    const now = new Date().toISOString();
    const update: Record<string, unknown> = { last_active_at: now };
    let movedTo: string | null = null;

    if (stageComplete) {
      const progress = { ...state.stageProgress, [stage.id]: { completedAt: now } };
      update.stage_progress = progress;
      const next = nextStage(stage.id);
      if (next) {
        update.current_stage = next.id;
        movedTo = next.id;
      } else {
        update.status = "complete";
        update.completed_at = now;
      }
    }

    await sb.from("builder_journeys").update(update).eq("user_id", userId);

    return {
      reply,
      // Proof of persistence, per message. Null means "not saved" — the page
      // keeps its own copy visible and says so, rather than losing the words.
      userMessageId,
      assistantMessageId,
      stageId: stage.id,
      movedTo,
      completed: stageComplete && !nextStage(stage.id),
      remembered: memory.length,
      diagnostics: {
        conversationMode: activeTrack === "owner" ? "Founder" : "Builder",
        systemPrompt: activeTrack === "owner" ? "founder_control_room" : "builder_mentor",
        promptVersion: "v4",
        sessionType: activeTrack === "owner" ? "platform_commissioning" : "builder_journey",
        memoryNamespace: activeTrack === "owner" ? "platform" : "builder",
        routingDecision: isAdmin
          ? "authenticated admin → owner track"
          : "authenticated participant → builder track",
        historySource: activeTrack === "owner" ? "platform_session" : "builder_session",
        fallback: identityDrift ? "founder_safety_interceptor" : "disabled",
        identityDiscovery: activeTrack === "owner" ? "disabled" : "enabled",
        stageId: stage.id,
        historyMessages: history.length,
      } satisfies ConversationDiagnostics,
    };
  });

export const startJourneyTrack = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ track: z.enum(["builder", "owner"]) }).parse(d),
  )
  .handler(async ({ context, data }) => {
    const sb = context.supabase as unknown as JourneyDatabase;
    if (data.track === "owner") {
      const { data: isAdmin, error: roleError } = await context.supabase.rpc("has_role", {
        _user_id: context.userId,
        _role: "admin",
      });
      if (roleError) throw new Error(roleError.message);
      if (!isAdmin) throw new Error("Founder Commissioning is restricted to the Founder.");
    }
    await loadJourneyState(sb, context.userId);
    const stageId = data.track === "owner" ? FIRST_OWNER_STAGE : FIRST_STAGE;
    const { error } = await sb
      .from("builder_journeys")
      .update({
        current_stage: stageId,
        status: "in_progress",
        completed_at: null,
        last_active_at: new Date().toISOString(),
      })
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true, stageId };
  });

/**
 * FRASS-0563 — The Welcome Hall is a conversation, not a page.
 *
 * Frassy always speaks first. This returns (and records, once) her opening
 * words for the member's current stage, so nobody ever arrives in silence
 * waiting to be asked "what do I do now?".
 */
export const journeyOpening = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const sb = context.supabase as unknown as JourneyDatabase;
    const userId = context.userId;
    const state = await loadJourneyState(sb, userId);

    const { data: isAdmin, error: roleError } = await context.supabase.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });
    if (roleError) throw new Error(roleError.message);
    const activeTrack: "owner" | "builder" = isAdmin ? "owner" : "builder";

    const stage = stageById(
      trackOf(state.currentStage) === activeTrack
        ? state.currentStage
        : activeTrack === "owner"
          ? FIRST_OWNER_STAGE
          : FIRST_STAGE,
    );

    // Already talking? Never re-introduce herself.
    // FRASS-0572 — an old Teleporter audit turn is not this room's conversation,
    // so it can never be re-served as Frassy's opening words here.
    const existing = state.messages.filter(
      (m) => trackOf(m.stage) === activeTrack && !isTeleporterAuditTurn(m.content),
    );
    if (existing.length) {
      const lastAssistant = [...existing].reverse().find((m) => m.role === "assistant");
      if (lastAssistant?.content) {
        return {
          reply: lastAssistant.content,
          messageId: lastAssistant.id ?? null,
          alreadyOpened: true,
          stageId: stage.id,
        };
      }
    }


    const { data: profile } = await sb
      .from("profiles")
      .select("display_name, full_name")
      .eq("id", userId)
      .maybeSingle();
    const displayName: string | null =
      activeTrack === "owner" ? "Nicky" : profile?.display_name ?? profile?.full_name ?? null;

    const who = displayName ? ` ${displayName}` : "";
    let reply =
      activeTrack === "owner"
        ? `Welcome back${who}. This is the Control Room. We're on "${stage.title}" — tell me where you want to start and I'll keep the record.`
        : `Hi${who} — I'm Frassy, and I host this place. I'm glad you're here. Before anything else I'd like to know you a little: what are you building, or hoping to build? Take your time, there's no wrong answer.`;

    const apiKey = process.env["LOVABLE_API_KEY"];
    if (apiKey) {
      try {
        const { createLovableAiGatewayProvider } = await import("@/lib/ai-gateway.server");
        const { streamText } = await import("ai");
        const gateway = createLovableAiGatewayProvider(apiKey);
        const system =
          activeTrack === "owner"
            ? buildFounderSystemPrompt(stage.id, state.memory, displayName)
            : buildBuilderSystemPrompt(stage.id, state.memory, displayName);
        const result = streamText({
          model: gateway("google/gemini-3.6-flash"),
          system,
          messages: [
            {
              role: "user" as const,
              content:
                "[SYSTEM: The member has just arrived and has said nothing yet. Speak first. Greet them warmly by name if you know it, introduce yourself in one line, and ask your first question for this stage. Two or three short sentences, no lists, no markers.]",
            },
          ],
        });
        const raw = await result.text;
        const text = parseJourneyMarkers(raw).text.trim();
        if (text) reply = text;

      } catch {
        /* Frassy still speaks — the scripted greeting stands in. */
      }
    }

    const openingSave = await sb
      .from("builder_journey_messages")
      .insert({ user_id: userId, stage: stage.id, role: "assistant", content: reply })
      .select("id")
      .maybeSingle();
    const messageId: string | null = openingSave.error ? null : (openingSave.data?.id ?? null);

    await sb
      .from("builder_journeys")
      .update({ status: "in_progress", last_active_at: new Date().toISOString() })
      .eq("user_id", userId);

    return { reply, messageId, alreadyOpened: false, stageId: stage.id };
  });

/**
 * FRASS-0571 — Founder AI Status.
 *
 * A single honest read-out of the three things that can quietly break Frassy:
 * whether she is recording memory, whether anything is rewriting her words,
 * and which step of the journey she is actually standing on. Read-only.
 */
export const founderAiStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isAdmin, error: roleError } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (roleError) throw new Error(roleError.message);
    if (!isAdmin) throw new Error("Founder AI Status is restricted to the Founder.");

    const sb = context.supabase as unknown as JourneyDatabase;
    const state = await loadJourneyState(sb, context.userId);
    const stage = stageById(state.currentStage);
    const track = trackOf(stage.id);
    const stages = stagesFor(stage.id);
    const stepNumber = stageIndex(stage.id) + 1;

    const { data: memoryRows } = await context.supabase
      .from("builder_memory")
      .select("updated_at, category")
      .eq("user_id", context.userId)
      .order("updated_at", { ascending: false })
      .limit(200);

    const rows = memoryRows ?? [];
    const namespace = track === "owner" ? PLATFORM_MEMORY_PREFIX : "";
    const inNamespace = rows.filter((r) =>
      namespace ? String(r.category).startsWith(namespace) : !String(r.category).startsWith(PLATFORM_MEMORY_PREFIX),
    );
    const lastMemoryAt = (inNamespace[0]?.updated_at as string | undefined) ?? null;

    const trackMessages = state.messages.filter((m) => trackOf(m.stage) === track);
    const lastAssistant = [...trackMessages].reverse().find((m) => m.role === "assistant");

    return {
      memoryRecording: "active" as const,
      memoryNamespace: track === "owner" ? ("platform" as const) : ("builder" as const),
      memoryEntries: inNamespace.length,
      lastMemoryAt,
      responseFilter: "advisory_only" as const,
      safetyOverride: "inactive" as const,
      conversationMode: track === "owner" ? ("Founder" as const) : ("Builder" as const),
      stageId: stage.id,
      stageTitle: stage.title,
      stepNumber,
      stepTotal: stages.length,
      transcriptMessages: trackMessages.length,
      lastReplyAt: lastAssistant?.created_at ?? null,
      lastReplyPreview: lastAssistant ? lastAssistant.content.slice(0, 160) : null,
      checkedAt: new Date().toISOString(),
    };
  });

/**
 * FRASS-0571A — Founder AI Timeline.
 *
 * A plain, time-ordered log of what Frassy actually did: what she heard, what
 * she said, when a step advanced, and when memory was committed. Derived from
 * the real records, so it works retroactively. Read-only, Founder only.
 */
export type FounderAiEvent = {
  at: string;
  kind: "message_received" | "response_delivered" | "journey_advanced" | "memory_saved" | "safety_override";
  title: string;
  detail: string | null;
};

export const founderAiTimeline = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isAdmin, error: roleError } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (roleError) throw new Error(roleError.message);
    if (!isAdmin) throw new Error("Founder AI Timeline is restricted to the Founder.");

    const sb = context.supabase as unknown as JourneyDatabase;
    const state = await loadJourneyState(sb, context.userId);

    const events: FounderAiEvent[] = [];
    let previousStage: string | null = null;

    for (const message of [...state.messages].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    )) {
      if (previousStage && message.stage !== previousStage) {
        const from = stageIndex(previousStage as never) + 1;
        const to = stageIndex(message.stage as never) + 1;
        events.push({
          at: message.created_at,
          kind: "journey_advanced",
          title: "Journey Advanced",
          detail: `Step ${from} → ${to} · ${stageById(message.stage as never).title}`,
        });
      }
      previousStage = message.stage;

      const preview = message.content.replace(/\s+/g, " ").slice(0, 120);
      if (message.role === "user") {
        events.push({
          at: message.created_at,
          kind: "message_received",
          title: "Message Received",
          detail: preview,
        });
      } else {
        const overridden = message.content.startsWith(founderSafetyReply(message.stage).slice(0, 40));
        events.push({
          at: message.created_at,
          kind: overridden ? "safety_override" : "response_delivered",
          title: overridden ? "Safety Override Used" : "Response Delivered",
          detail: preview,
        });
      }
    }

    const { data: memoryRows } = await context.supabase
      .from("builder_memory")
      .select("category, key, updated_at")
      .eq("user_id", context.userId)
      .order("updated_at", { ascending: false })
      .limit(100);

    for (const row of memoryRows ?? []) {
      events.push({
        at: row.updated_at as string,
        kind: "memory_saved",
        title: "Memory Saved",
        detail: `${String(row.category).replace(PLATFORM_MEMORY_PREFIX, "")} · ${String(row.key)}`,
      });
    }

    events.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());

    return {
      events: events.slice(0, 120),
      generatedAt: new Date().toISOString(),
    };
  });
