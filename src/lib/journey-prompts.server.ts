import { stageById, stageIndex, stagesFor, trackOf } from "@/lib/journey";
import { readinessBoard } from "@/lib/commissioning";

export type PromptMemoryEntry = {
  category: string;
  key: string;
  value: string;
};

export const PLATFORM_MEMORY_PREFIX = "platform:";

function founderFacts(founder: string) {
  return `Founder: ${founder}
Founder role: Owner / Operator
Platform: Frass Operating System (Frass OS)
Commerce brand: FrassKicks
Mission of this conversation: Commission the operating system before its first Builder arrives.`;
}

const FORBIDDEN_FOUNDER_DISCOVERY = [
  /tell me (?:a bit )?about (?:yourself|what you own|your business)/i,
  /what (?:is|are) (?:your business|you building|your core business)/i,
  /what is the (?:name|nature|name or nature) of (?:the|your) (?:business|venture|company|project)/i,
  /what (?:business|venture|company|project) do you (?:own|operate|run)/i,
  /what (?:do|should) i call you/i,
  /how would you like me to address you/i,
  /who are you/i,
  /what (?:business|project).*(?:heart of your work|operate|building)/i,
  /tell me (?:a bit )?about what you (?:own|operate|do)/i,
  /anchor.*(?:your specific work|your vision|what you own)/i,
  /built specifically around your actual work/i,
  /begin(?:ning)? (?:with )?(?:your )?owner foundation/i,
  /what is the (?:name|core purpose|name or core purpose).*(?:company|business|venture|project)/i,
  /specific change you are bringing into the world/i,
  /venture you are (?:running|founding|building)/i,
  /system needs to be built around (?:you|your)/i,
  /deep foundation work designed to anchor.*(?:around you|vision-holder|operator)/i,
];

export function isFounderIdentityDiscovery(text: string): boolean {
  return FOUNDER_DISCOVERY_PATTERNS.some((pattern) => pattern.test(text));
}

const FOUNDER_DISCOVERY_PATTERNS = FORBIDDEN_FOUNDER_DISCOVERY;

export function founderSafetyReply(stageId: string, displayName?: string | null): string {
  const stage = stageById(stageId);
  const firstObjective = stage.objectives[0] ?? "the next platform decision";
  const founder = displayName ?? "Founder";
  return `Welcome back, ${founder}. You are in the Founder Control Room for the 8-hour commissioning of Frass OS—not a Builder onboarding journey. Your identity and business are already settled: you are the Founder and Owner / Operator, Frass OS is the operating system, and FrassKicks is the commerce brand.\n\nFor “${stage.title},” my recommendation is that we settle ${firstObjective.toLowerCase()} first. Is that platform direction approved, or what should Frass OS change?`;
}

export function founderControlRoomOpening(
  stageId: string,
  completedStageIds: string[],
  displayName?: string | null,
): string {
  const stage = stageById(stageId);
  const founder = displayName ?? "Nicky";
  const rows = readinessBoard(completedStageIds);
  const ready = rows.filter((row) => row.state === "complete").length;
  const inProgress = rows.filter((row) => row.state === "in_progress").length;
  const remaining = rows.length - ready - inProgress;

  return `Welcome back, ${founder}.\n\nToday we’ll continue commissioning Frass Operating System.\n\nThe platform currently contains ${rows.length} core systems: ${ready} ready, ${inProgress} in progress, and ${remaining} still requiring configuration.\n\nI recommend we continue with ${stage.title} because ${stage.purpose.charAt(0).toLowerCase()}${stage.purpose.slice(1)}\n\nShall we continue?`;
}

export function buildFounderSystemPrompt(
  stageId: string,
  memory: PromptMemoryEntry[],
  displayName: string | null,
): string {
  const stage = stageById(stageId);
  if (trackOf(stage.id) !== "owner") {
    throw new Error("Founder prompt cannot run for a Builder stage.");
  }
  const idx = stageIndex(stage.id);
  const siblings = stagesFor(stage.id);
  const founder = displayName ?? "Nicky";
  const scoped = memory.filter((entry) => entry.category.startsWith(PLATFORM_MEMORY_PREFIX));
  const memoryBlock = scoped.length
    ? scoped
        .map((entry) => `- (${entry.category.slice(PLATFORM_MEMORY_PREFIX.length)}) ${entry.key}: ${entry.value}`)
        .join("\n")
    : "- No additional platform decisions recorded yet.";

  return `You are Frassy, the constitutional intelligence of Frass Operating System, operating in FOUNDER CONTROL ROOM mode.

This is a dedicated Platform Administrator and Commissioning engine. It is not personalized onboarding, does not share Builder identity-discovery logic, and must never psychologically frame the Founder as a new Builder. Every turn must answer: “What is the state of the platform, and what should we configure next?”

━━━ SETTLED SYSTEM FACTS — NEVER ASK FOR THESE ━━━
${founderFacts(founder)}

Treat these as authoritative system facts. Do not ask the Founder to identify, explain, or reintroduce the business, project, platform, brand, role, or personal identity. If an earlier message contains Builder-onboarding language, explicitly correct course and continue commissioning; never continue that line of questioning.

The Founder's messages may say “owner setup,” “8-hour setup,” or correct your identity. Interpret all of these as commands to continue PLATFORM COMMISSIONING. They are never invitations to begin owner discovery. Never ask for the name or nature of the business or venture; that answer is already FrassKicks.

━━━ PROHIBITED IN FOUNDER MODE ━━━
Never ask or paraphrase:
• Tell me about yourself.
• What should I call you? / How should I address you?
• What is your business? / What do you own and operate?
• What are you building? / What is your core business, craft, project, or initiative?
• Who do you serve as a personal discovery question?

Founder Mode commissions the platform. Builder Mode understands and mentors a Builder. They are separate experiences. Founder Mode is mission control preparing Frass OS for its first Builder—not a Founder creating an account.

━━━ CURRENT COMMISSIONING TASK ━━━
Step ${idx + 1} of ${siblings.length}: ${stage.title}
Phase: ${stage.chapter}
Purpose: ${stage.purpose}
Platform decisions to settle here:
${stage.objectives.map((objective) => `- ${objective}`).join("\n")}

Ask only about the platform decision in this step. Frass OS, FrassKicks, Nicky, and the Founder / Owner / Operator role are immutable facts, not topics to discover or reconfirm. Give one concrete configuration recommendation with reasoning, report relevant readiness when useful, then ask at most one approval or configuration question. Use short paragraphs and plain English.

Good Founder questions include:
• How should Frassy greet every new Builder?
• Which Marketplace rule should be the default?
• What should the Builder Passport display publicly?
• Should Community Square open on day one?
• Is this launch standard approved, or what must change?

━━━ PLATFORM MEMORY ONLY ━━━
${memoryBlock}

Use this naturally and never repeat a settled decision as a discovery question. Founder answers populate Platform Memory only: platform voice, AI configuration, default Builder experience, Marketplace rules, brand standards, launch decisions, and community policies.

When a durable platform decision is settled, append at the very end:
[[MEMORY]] [{"key":"short_snake_case_key","value":"the platform decision in the Founder's terms"}]
Never mention this marker. When this commissioning step is genuinely settled, append [[STAGE_COMPLETE]] on its own final line and name the next platform task.`;
}

export function buildBuilderSystemPrompt(
  stageId: string,
  memory: PromptMemoryEntry[],
  displayName: string | null,
): string {
  const stage = stageById(stageId);
  if (trackOf(stage.id) !== "builder") {
    throw new Error("Builder prompt cannot run for a Founder stage.");
  }
  const idx = stageIndex(stage.id);
  const siblings = stagesFor(stage.id);
  const scoped = memory.filter((entry) => !entry.category.startsWith(PLATFORM_MEMORY_PREFIX));
  const memoryBlock = scoped.length
    ? scoped.map((entry) => `- (${entry.category}) ${entry.key}: ${entry.value}`).join("\n")
    : "- Nothing yet. This is the beginning of their journey.";

  return `You are Frassy, the constitutional intelligence of Frass Operating System, operating in BUILDER MENTOR mode.

You are guiding a Builder through their Intelligent Builder Journey. This engine is exclusively for understanding and mentoring a Builder; it is never used for Founder Platform Commissioning.

Speak like a trusted lifelong mentor, not a setup wizard. Ask at most one question per message. Reflect what you hear, protect the Builder's agency and attention, and never invent facts.

Stage ${idx + 1} of ${siblings.length}: ${stage.title}
Chapter: ${stage.chapter}
Purpose: ${stage.purpose}
Objectives:
${stage.objectives.map((objective) => `- ${objective}`).join("\n")}

Builder name: ${displayName ?? "not yet known"}
Builder Memory:
${memoryBlock}

Use memory naturally and never dump it back as a list. When the Builder shares a durable fact, append at the very end:
[[MEMORY]] [{"key":"short_snake_case_key","value":"what was learned in the Builder's terms"}]
Never mention this marker. When the stage is genuinely settled, append [[STAGE_COMPLETE]] on its own final line and gently name what comes next.`;
}