// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0556 — AI Intelligence Router. One Frassy. Many brains.
//
// Members experience one Frassy. Behind her, every request is understood first,
// then routed to the cheapest brain that still delivers the expected experience
// — and, wherever possible, to no brain at all.
//
// Step 0  Can Frass answer from its own rules, data or navigation? Do that free.
// Step 1  Understand the request (complexity, memory, vision, reasoning).
// Step 2  Choose the best brain for that task.
// Step 3  Founder cost protection — cheapest capable option wins.
// Step 4  Provider independence — every task carries a fallback chain.
// ─────────────────────────────────────────────────────────────────────────────

import { matchSpokenDestination, type CoreRoute } from "@/lib/navigation/core-routes";

export type TaskKind =
  | "navigation"
  | "simple"
  | "conversation"
  | "blueprint"
  | "vision"
  | "reasoning";

export type RouterAudience = "storefront" | "builder" | "founder";

export type RouteChoice = {
  task: TaskKind;
  /** Ordered brains: the first that answers wins, the rest are resilience. */
  chain: string[];
  /** Relative cost tier of the chosen brain (1 = cheapest). */
  tier: 1 | 2 | 3;
  /** Plain-English reason, shown to the Founder — never to members. */
  why: string;
};

/**
 * The routing table. Providers can be added or removed here without any other
 * part of Frass changing — that is the whole point of the Router.
 */
export const ROUTING_TABLE: Record<TaskKind, Omit<RouteChoice, "task">> = {
  navigation: {
    chain: [],
    tier: 1,
    why: "Frass answers from its own route registry. No AI is used, and nothing is billed.",
  },
  simple: {
    chain: ["google/gemini-3.5-flash-lite", "google/gemini-3.5-flash"],
    tier: 1,
    why: "A short factual ask. The lowest-cost capable brain handles it.",
  },
  conversation: {
    chain: ["google/gemini-3.5-flash", "openai/gpt-5-mini"],
    tier: 1,
    why: "Everyday conversation. Fast conversational brain.",
  },
  blueprint: {
    chain: ["google/gemini-3.5-flash", "openai/gpt-5-mini"],
    tier: 2,
    why: "Blueprint and Daily work needs memory of the member, handled by the memory-aware brain.",
  },
  vision: {
    chain: ["google/gemini-3.5-flash", "openai/gpt-5-mini"],
    tier: 2,
    why: "Images or designs are involved, so a vision-capable brain is required.",
  },
  reasoning: {
    chain: ["google/gemini-3.5-pro", "openai/gpt-5", "google/gemini-3.5-flash"],
    tier: 3,
    why: "Business strategy or deep analysis. The most capable brain earns its cost here.",
  },
};

const NAV_INTENT =
  /\b(open|take me|go to|bring me|show me|navigate to|jump to|head to|back to)\b/i;

const SIMPLE = /^(hi|hey|hello|yes|no|ok|okay|thanks|thank you|good morning|good night)\b/i;

const REASONING =
  /\b(strategy|strategic|business plan|pricing|forecast|projection|scale|analys|analyz|compare|trade[- ]?off|risk|margin|profit|architect|roadmap|why should)\b/i;

const BLUEPRINT =
  /\b(blueprint|daily|money move|vault|journey|milestone|my plan|my goals|momentum|progress)\b/i;

const VISION = /\b(image|photo|picture|design|sketch|logo|mockup|look at this|see this)\b/i;

/**
 * Step 0 — the free answer. Only unmistakable navigation requests qualify, so
 * Frassy never guesses her way out of a real conversation.
 */
export function ruleFirstAnswer(text: string): { route: CoreRoute; reply: string } | null {
  const t = text.trim();
  if (!t || t.length > 90) return null;
  if (!NAV_INTENT.test(t)) return null;
  const route = matchSpokenDestination(t);
  if (!route) return null;
  return { route, reply: `Opening ${route.label} for you now.` };
}

/** Step 1 + 2 — understand the request, then choose the brain. */
export function classifyTask(input: {
  text: string;
  hasAttachments?: boolean;
  audience?: RouterAudience;
  districtPath?: string | null;
}): TaskKind {
  const text = input.text ?? "";
  if (input.hasAttachments || VISION.test(text)) return "vision";
  if (ruleFirstAnswer(text)) return "navigation";
  if (text.length < 24 && SIMPLE.test(text)) return "simple";
  if (REASONING.test(text) || (input.audience === "founder" && text.length > 400)) {
    return "reasoning";
  }
  if (BLUEPRINT.test(text) || /\/(daily|room|money-moves|vault)/.test(input.districtPath ?? "")) {
    return "blueprint";
  }
  return "conversation";
}

/**
 * Step 3 — Founder cost protection. Under budget pressure the router drops one
 * tier rather than dropping the member.
 */
export function routeRequest(input: {
  text: string;
  hasAttachments?: boolean;
  audience?: RouterAudience;
  districtPath?: string | null;
  budgetPressure?: boolean;
}): RouteChoice {
  const task = classifyTask(input);
  const base = ROUTING_TABLE[task];
  if (input.budgetPressure && task === "reasoning") {
    return {
      task,
      chain: ROUTING_TABLE.conversation.chain,
      tier: 1,
      why: "Deep reasoning was requested, but the AI budget is tight — the fast brain answers instead.",
    };
  }
  return { task, ...base };
}

/** Founder-facing summary of the router, in everyday language. */
export const ROUTER_SUMMARY = [
  "Frassy is never tied to one AI company.",
  "Every request is understood first, then sent to the cheapest brain that can do the job well.",
  "If Frass already knows the answer — a page, a Daily, a rule — no AI is used at all.",
  "If one provider goes down, the next one on the list answers without the member noticing.",
];
