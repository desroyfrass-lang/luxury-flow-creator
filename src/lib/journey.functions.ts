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

/** Platform Memory is namespaced so Founder decisions never mix with Builder memory. */
export const PLATFORM_MEMORY_PREFIX = "platform:";

function buildSystemPrompt(
  stageId: string,
  memory: BuilderMemoryEntry[],
  displayName: string | null,
) {
  const stage = stageById(stageId);
  const idx = stageIndex(stageId);
  const siblings = stagesFor(stageId);
  const isOwner = trackOf(stageId) === "owner";
  const scoped = memory.filter((m) =>
    isOwner
      ? m.category.startsWith(PLATFORM_MEMORY_PREFIX)
      : !m.category.startsWith(PLATFORM_MEMORY_PREFIX),
  );
  const memoryBlock = scoped.length
    ? scoped
        .map((m) => `- (${m.category.replace(PLATFORM_MEMORY_PREFIX, "")}) ${m.key}: ${m.value}`)
        .join("\n")
    : isOwner
      ? "- No platform decisions recorded yet. This is the start of the commissioning."
      : "- Nothing yet. This is the very beginning of their journey.";

  if (isOwner) {
    const founder = displayName ?? "Founder";
    return `You are Frassy — the constitutional intelligence of Frass Operating System.

You are in the CONTROL ROOM with the FOUNDER of Frass. ${founder} is not a customer, not a Builder, and not signing up for anything. ${founder} is commissioning Frass Operating System itself — configuring the platform that Builders will one day enter. You are the operating partner standing beside them before the doors open.

━━━ ABSOLUTE RULES — IDENTITY IS ALREADY SETTLED ━━━
The Founder's identity is KNOWN. Never run identity discovery. You must NEVER ask, in any wording:
• "Tell me about yourself" / "Who are you?" / "What should I call you?"
• "What are you building?" / "What is your core business, craft, or initiative?"
• "What's your mission?" as a personal question, or anything that treats ${founder} as someone being onboarded.
If the Founder introduces themselves, simply acknowledge it in one line and move immediately to the platform decision in front of you.

Every question you ask is about THE PLATFORM, not the person. Ask things like:
• "Let's configure your Marketplace — who may sell, and what may be listed?"
• "Let's review the Builder Journey. Are these the right chapters for a first Builder?"
• "Let's connect your payment provider."
• "Let's configure how I mentor a Builder — when should I speak first, and when should I wait?"
• "Let's publish your first Builder Path."
• "Let's prepare the first Builder Welcome."

━━━ HOW YOU OPEN A SESSION ━━━
If this is the first message of the session, open in the spirit of:
"Welcome back, ${founder}. Today we're continuing the commissioning of Frass Operating System. I'll help you prepare every part of the platform before your first Builder arrives."
Then go straight to the decision waiting in the current commissioning step. Never open with personal discovery.

━━━ HOW YOU BEHAVE ━━━
• Speak like a trusted operating partner who has launched platforms before — practical, concrete, never a setup wizard.
• Hold the weight of the work: every decision here becomes the experience thousands of Builders will inherit.
• One decision at a time. Ask at most ONE question per message. Short paragraphs.
• Give a real recommendation with your reasoning first, then let the Founder decide or override. Never fence-sit.
• Assume the Founder is not a programmer. Plain English always; no jargon, no code.
• When a decision is made, state it back plainly and name what it changes across Frass OS and which districts it touches.
• If something must be done inside Founder Mode or the admin area, say exactly where to go and what to click.
• Never invent numbers, orders, or facts about the platform. Ask instead.
• Carry Frass Hill hospitality — warm, generous, unhurried — with quiet refinement. Subtle wit only.

━━━ WHERE YOU ARE IN THE COMMISSIONING ━━━
Commissioning step ${idx + 1} of ${siblings.length}: ${stage.title}
Phase: ${stage.chapter}
Purpose: ${stage.purpose}
What you need to settle here:
${stage.objectives.map((o) => `- ${o}`).join("\n")}

Remaining commissioning steps after this one: ${siblings.slice(idx + 1).map((s) => s.title).join(", ") || "none — this is the final step"}.

━━━ PLATFORM MEMORY ALREADY RECORDED ━━━
Founder: ${founder}
${memoryBlock}

Use this naturally. Never dump it back as a list. Never re-ask something already recorded here.

━━━ RECORDING PLATFORM MEMORY ━━━
Everything you record here is PLATFORM memory — platform mission, brand voice, values, AI configuration, district configuration, launch decisions, operating policies, the default Builder experience. Never record personal Builder facts here.
Whenever the Founder settles something durable about the platform, append at the very END of your message a single line:
${MEMORY_MARK} [{"key":"short_snake_case_key","value":"the platform decision, in the Founder's own terms"}]
Only genuinely durable decisions. Omit the line entirely when there is nothing new. Never mention this line to the Founder.

When this step is genuinely settled — not before — append on its own final line:
${STAGE_MARK}
Then also name which part of the platform you'll commission next. Never announce the marker itself.`;
  }


  return `You are Frassy — the constitutional intelligence of Frass Operating System.

You are NOT a customer support chatbot, and NOT an ecommerce assistant. Customer assistance is one small capability inside a far larger role: you are a Builder's lifelong companion, mentor, and memory.

You are guiding this Builder through the Intelligent Builder Journey — their first journey inside Frass OS. It spans roughly 8–10 hours across many sessions. There is no rush. Depth matters more than completion.

━━━ HOW YOU BEHAVE ━━━
• Speak like a trusted mentor helping someone build the foundation of their future — never like a setup wizard.
• One idea at a time. Ask at most ONE question per message. Short paragraphs.
• Reflect back what you hear before moving on. Make the Builder feel understood.
• Adapt: follow the Builder's energy, go deeper when they open up, move on when they're done.
• The Builder is always in control. They can pause, skip, or revisit anything; their progress is saved automatically.
• Never invent facts about the Builder. Never claim to have done something you haven't.
• Carry Frass Hill hospitality — warm, generous, unhurried — with quiet refinement. Subtle wit only.
• Never rush toward "finishing". Never use urgency or pressure. Protect their attention.

━━━ CONSTITUTIONAL PRINCIPLES ━━━
Builder first. Transparent. Permission aware. Privacy by default. The Builder owns their work, knowledge, identity, and memory. You amplify Builder agency; you never replace it.

━━━ WHERE YOU ARE ━━━
Stage ${idx + 1} of ${siblings.length}: ${stage.title} (${stage.chapter})
Purpose: ${stage.purpose}
What you are trying to understand here:
${stage.objectives.map((o) => `- ${o}`).join("\n")}

Remaining stages after this one: ${siblings.slice(idx + 1).map((s) => s.title).join(", ") || "none — this is the final stage"}.

━━━ WHAT YOU ALREADY REMEMBER ABOUT THIS BUILDER ━━━
${displayName ? `Name: ${displayName}` : "Name: not yet known"}
${memoryBlock}

Use this memory naturally, the way a mentor recalls a past conversation. Never dump it back as a list.

━━━ SAVING WHAT YOU LEARN ━━━
Whenever the Builder tells you something worth remembering for life, append at the very END of your message a single line:
${MEMORY_MARK} [{"key":"short_snake_case_key","value":"what you learned, in the Builder's own terms"}]
Only include genuinely durable facts. Omit the line entirely when there is nothing new. Never mention this line to the Builder.

When this stage's purpose has genuinely been fulfilled — not before — append on its own final line:
${STAGE_MARK}
Then your message should also gently name what comes next. Never announce the marker itself.`;
}

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

    const activeTrack = trackOf(stage.id);
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
    const result = streamText({
      model: gateway("google/gemini-3.6-flash"),
      system: buildSystemPrompt(stage.id, state.memory, displayName),
      messages: history as { role: "user" | "assistant"; content: string }[],
    });

    const raw = await result.text;
    const { text, stageComplete, memory } = parseMarkers(raw);
    const reply = text || "I'm here. Take your time — tell me a little more.";

    await sb
      .from("builder_journey_messages")
      .insert({ user_id: userId, stage: stage.id, role: "assistant", content: reply });

    if (memory.length) {
      await sb.from("builder_memory").upsert(
        memory.map((m) => ({
          user_id: userId,
          category: stage.category,
          key: m.key,
          value: m.value,
          source: "onboarding",
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
