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

const MEMORY_MARK = "[[MEMORY]]";
const STAGE_MARK = "[[STAGE_COMPLETE]]";

function parseMarkers(raw: string) {
  let text = raw;
  let stageComplete = false;
  const memory: { key: string; value: string }[] = [];

  if (text.includes(STAGE_MARK)) {
    stageComplete = true;
    text = text.split(STAGE_MARK).join("");
  }

  const mi = text.indexOf(MEMORY_MARK);
  if (mi >= 0) {
    const tail = text.slice(mi + MEMORY_MARK.length).trim();
    text = text.slice(0, mi);
    const start = tail.indexOf("[");
    const end = tail.lastIndexOf("]");
    if (start >= 0 && end > start) {
      try {
        const parsed = JSON.parse(tail.slice(start, end + 1)) as unknown;
        if (Array.isArray(parsed)) {
          for (const item of parsed) {
            const rec = item as { key?: unknown; value?: unknown };
            if (typeof rec?.key === "string" && typeof rec?.value === "string") {
              memory.push({ key: rec.key.slice(0, 120), value: rec.value.slice(0, 2000) });
            }
          }
        }
      } catch {
        /* ignore malformed memory line */
      }
    }
  }

  return { text: text.trim(), stageComplete, memory };
}

type Sb = { from: (t: string) => any; rpc?: unknown };

async function loadState(sb: Sb, userId: string): Promise<JourneyState> {
  const { data: existing } = await sb
    .from("builder_journeys")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  let journey = existing;
  if (!journey) {
    const { data, error } = await sb
      .from("builder_journeys")
      .insert({ user_id: userId, current_stage: FIRST_STAGE })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    journey = data;
  }

  const [{ data: messages }, { data: memory }] = await Promise.all([
    sb
      .from("builder_journey_messages")
      .select("id, role, content, stage, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: true }),
    sb
      .from("builder_memory")
      .select("category, key, value")
      .eq("user_id", userId)
      .order("created_at", { ascending: true }),
  ]);

  return {
    status: journey.status,
    currentStage: journey.current_stage,
    stageProgress: (journey.stage_progress ?? {}) as JourneyState["stageProgress"],
    startedAt: journey.started_at,
    lastActiveAt: journey.last_active_at,
    completedAt: journey.completed_at,
    messages: (messages ?? []) as JourneyMessage[],
    memory: (memory ?? []) as BuilderMemoryEntry[],
  };
}

export const getBuilderJourney = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<JourneyState> => {
    const sb = context.supabase as unknown as Sb;
    const state = await loadState(sb, context.userId);
    const { data: isAdmin, error: roleError } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (roleError) throw new Error(roleError.message);

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
    const sb = context.supabase as unknown as Sb;
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
      .object({ message: z.string(), opening: z.boolean().optional() })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    const sb = context.supabase as unknown as Sb;
    const userId = context.userId;

    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) throw new Error("Frassy is not configured yet.");

    let state = await loadState(sb, userId);
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
    if (userText) {
      await sb
        .from("builder_journey_messages")
        .insert({ user_id: userId, stage: stage.id, role: "user", content: userText });
    }

    const { data: profile } = await sb
      .from("profiles")
      .select("display_name, full_name")
      .eq("id", userId)
      .maybeSingle();
    const displayName: string | null =
      profile?.display_name ?? profile?.full_name ?? null;

    const history = state.messages
      .filter((message) => trackOf(message.stage) === activeTrack)
      .slice(-40)
      .map((m) => ({ role: m.role, content: m.content }));
    if (userText) history.push({ role: "user", content: userText });
    if (!history.length) {
      history.push({
        role: "user",
        content:
          activeTrack === "owner"
            ? "Open the control room. Continue commissioning Frass Operating System with me — greet me as the Founder and take us straight to the platform decision waiting in this step. Do not ask me about myself."
            : "I've just created my account. Begin my journey — welcome me and start where we should start.",
      });
    }


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
    const parsed = parseMarkers(raw);
    const rejectedFounderReply = activeTrack === "owner" && isFounderIdentityDiscovery(parsed.text);
    const text = rejectedFounderReply ? founderSafetyReply(stage.id) : parsed.text;
    const stageComplete = rejectedFounderReply ? false : parsed.stageComplete;
    const memory = rejectedFounderReply ? [] : parsed.memory;
    const reply = text || (activeTrack === "owner"
      ? founderSafetyReply(stage.id)
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
    };
  });

export const startJourneyTrack = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ track: z.enum(["builder", "owner"]) }).parse(d),
  )
  .handler(async ({ context, data }) => {
    const sb = context.supabase as unknown as Sb;
    if (data.track === "owner") {
      const { data: isAdmin, error: roleError } = await context.supabase.rpc("has_role", {
        _user_id: context.userId,
        _role: "admin",
      });
      if (roleError) throw new Error(roleError.message);
      if (!isAdmin) throw new Error("Founder Commissioning is restricted to the Founder.");
    }
    await loadState(sb, context.userId);
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
