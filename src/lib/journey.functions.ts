import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import {
  FIRST_STAGE,
  FIRST_OWNER_STAGE,
  nextStage,
  stageById,
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

    if (isAdmin) {
      state = {
        ...state,
        messages: state.messages.filter(
          (message) =>
            trackOf(message.stage) !== "owner" ||
            message.role !== "assistant" ||
            !isFounderIdentityDiscovery(message.content),
        ),
      };
    }

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
    await sb
      .from("builder_journey_messages")
      .insert({ user_id: userId, stage: stage.id, role: "user", content: userText });

    const { data: profile } = await sb
      .from("profiles")
      .select("display_name, full_name")
      .eq("id", userId)
      .maybeSingle();
    const displayName: string | null =
      activeTrack === "owner"
        ? "Nicky"
        : profile?.display_name ?? profile?.full_name ?? null;

    const history = state.messages
      .filter((message) => trackOf(message.stage) === activeTrack)
      // Founder history created before the engines were separated can contain
      // Builder-discovery questions. Never send that contamination back to the model.
      .filter((message) =>
        activeTrack !== "owner" ||
        message.role !== "assistant" ||
        !isFounderIdentityDiscovery(message.content),
      )
      .slice(-40)
      .map((m) => ({ role: m.role, content: m.content }));
    history.push({ role: "user", content: userText });


    const { createLovableAiGatewayProvider } = await import("@/lib/ai-gateway.server");
    const { streamText } = await import("ai");

    const gateway = createLovableAiGatewayProvider(apiKey);
    const system = activeTrack === "owner"
      ? buildFounderSystemPrompt(stage.id, state.memory, displayName)
      : buildBuilderSystemPrompt(stage.id, state.memory, displayName);
    const result = streamText({
      model: gateway("google/gemini-3.6-flash"),
      system,
      messages: history as { role: "user" | "assistant"; content: string }[],
    });

    const raw = await result.text;
    const parsed = parseJourneyMarkers(raw);
    const rejectedFounderReply = activeTrack === "owner" && isFounderIdentityDiscovery(parsed.text);
    const text = rejectedFounderReply ? founderSafetyReply(stage.id, displayName) : parsed.text;

    // ── WORKFLOW ENGINE (independent of the conversation engine) ───────────────
    // Progress moves only on an explicit instruction from the Founder/Builder.
    // A direct advance word ("next", "continue", "proceed", "move on") always
    // advances the step; a plain approval ("yes", "approved") advances only when
    // the conversation engine proposed completion. The conversation text itself
    // never restarts or rewinds the workflow.
    const advanceWord = /^(next|continue|proceed|move on|skip)(\b|[.!,])/i.test(userText.trim());
    const stageComplete =
      advanceWord || (isExplicitStageApproval(userText) && parsed.stageComplete && !rejectedFounderReply);
    const memory = rejectedFounderReply ? [] : parsed.memory;
    const reply = text || (activeTrack === "owner"
      ? founderSafetyReply(stage.id, displayName)
      : "I'm here. Take your time — tell me a little more.");


    await sb
      .from("builder_journey_messages")
      .insert({ user_id: userId, stage: stage.id, role: "assistant", content: reply });

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
        fallback: rejectedFounderReply ? "founder_safety_interceptor" : "disabled",
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
