// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0532 — Personalized Daily · The Tradesperson
// "A lifetime of skill turned into a business."
//
// AMENDED SCOPE: this Daily is not for one person. It is for tradespeople —
// builders, contractors, masons, electricians, carpenters, plumbers, welders,
// painters, roofers, tilers, handymen — and especially for the many skilled
// Jamaican tradespeople who are highly experienced but not formally certified,
// and not comfortable with technology.
//
// Their challenge is never expertise. Their challenge is technology. Frassy
// removes technology as a barrier and helps them turn decades of skill into
// income. It inherits the ENTREPRENEURIAL blueprint (FRASS-P001-Z) — no new
// architecture, only different words, pace and priorities.
// ─────────────────────────────────────────────────────────────────────────────

import { ENTREPRENEURIAL_BLUEPRINT } from "./blueprints";
import type { LayerId } from "@/lib/business/financial-layers";

export const TRADESPERSON_BLUEPRINT = ENTREPRENEURIAL_BLUEPRINT;

/** Simplified View (FRASS-0517) is the DEFAULT for this Daily. */
export const TRADESPERSON_DEFAULT_VIEW = "simplified" as const;

export const TRADES = [
  "Builder",
  "Contractor",
  "Mason",
  "Electrician",
  "Carpenter",
  "Plumber",
  "HVAC technician",
  "Roofer",
  "Painter",
  "Welder",
  "Drywall installer",
  "Tile setter",
  "Handyman",
  "Renovation specialist",
] as const;

export type Trade = (typeof TRADES)[number];

export function isTradespersonDaily(
  trade?: string | null,
  blueprintId?: string | null,
): boolean {
  if (blueprintId === "tradesperson") return true;
  const t = (trade ?? "").trim().toLowerCase();
  if (!t) return false;
  return TRADES.some((x) => x.toLowerCase() === t);
}

/** The one question every interaction answers. */
export const TRADESPERSON_QUESTION = "What's the easiest way to make money today?";

export const TRADESPERSON_VISION =
  "Your skill is already worth money. Frassy handles the computer part so people can find you, " +
  "trust you, and pay you properly.";

/**
 * Certification honesty (Jamaica and everywhere else). Many excellent
 * tradespeople have no paperwork. Frass never pretends they are certified, and
 * never treats them as less skilled because they are not.
 */
export const CERTIFICATION_STANCE = {
  rule: "Experience is shown honestly; certification is shown only when it is real.",
  proof: [
    "Completed work photos (before and after)",
    "Years of experience",
    "Customer reviews from real jobs",
    "Referrals from people who hired you",
  ],
  never: [
    "Claim a licence or certification the member does not hold",
    "Treat an uncertified tradesperson as unskilled",
    "Hide a certification requirement where the law requires one",
  ],
  plain:
    "Papers help, but proof of work is what wins jobs. When a job legally needs a licence, Frassy says so plainly.",
} as const;

/** Frassy does the technology. The member provides the knowledge. */
export const FRASSY_HANDLES = [
  "Filling out forms",
  "Writing advertisements",
  "Creating invoices",
  "Organising jobs",
  "Scheduling appointments",
  "Preparing estimates",
  "Managing customers",
  "Writing the words for your listing",
  "Tidying up job photos",
];

export type TradeMove = {
  label: string;
  why: string;
  layer: LayerId;
  minutes: number;
  href: string;
};

/** Immediate income first, always. One at a time. */
export const TRADESPERSON_MOVES: TradeMove[] = [
  {
    label: "Answer today's job enquiries",
    why: "Fastest money on the table. I'll write the replies; you just say yes or no.",
    layer: "immediate-income",
    minutes: 10,
    href: "/money-moves",
  },
  {
    label: "Send one estimate you've been meaning to send",
    why: "An estimate sitting in your head earns nothing. I'll write it out properly.",
    layer: "immediate-income",
    minutes: 15,
    href: "/services",
  },
  {
    label: "List one service people can book",
    why: "Small repairs, call-outs, renovations — one clear service beats a long list.",
    layer: "immediate-income",
    minutes: 15,
    href: "/services",
  },
  {
    label: "Add photos of one finished job",
    why: "Before and after pictures sell your work better than any advert.",
    layer: "business-builder",
    minutes: 15,
    href: "/workspace/card",
  },
  {
    label: "Ask one past customer for a review",
    why: "One honest review from a real job is worth more than a certificate.",
    layer: "business-builder",
    minutes: 10,
    href: "/workspace/card",
  },
  {
    label: "Send the invoice for the last job",
    why: "Work you already did should already be paid. I'll prepare it; you approve it.",
    layer: "immediate-income",
    minutes: 10,
    href: "/financial-center",
  },
  {
    label: "Record one thing you know, in your own voice",
    why: "A safety check, a maintenance tip, a way to do it right. Later this can be sold.",
    layer: "financial-freedom",
    minutes: 15,
    href: "/vault",
  },
  {
    label: "Pass on a job you can't take — to someone you trust",
    why: "You still benefit from work you send to a good tradesperson.",
    layer: "business-builder",
    minutes: 10,
    href: "/services",
  },
];

/** FRASS-0532 pace rule — never more than this in one sitting. */
export const TRADESPERSON_MOVE_LIMIT = 3;
export const TRADESPERSON_MINUTES_PER_DAY = 45;

export function todaysTradeMoves(all: TradeMove[] = TRADESPERSON_MOVES): TradeMove[] {
  const income = all.filter((m) => m.layer === "immediate-income");
  const rest = all.filter((m) => m.layer !== "immediate-income");
  return [...income, ...rest].slice(0, TRADESPERSON_MOVE_LIMIT);
}

/** Knowledge-based income — expertise beyond physical labour. */
export const KNOWLEDGE_PRODUCTS = [
  "Home maintenance guides",
  "Electrical and site safety checklists",
  "Renovation planning consultations",
  "Simple DIY courses",
  "Video demonstrations",
  "Voice coaching sessions for younger tradespeople",
];

/** Digital presence, built for them — never by them. */
export const DIGITAL_PRESENCE = [
  { label: "A professional profile", to: "/workspace/card" },
  { label: "Your Frass Card", to: "/workspace/card" },
  { label: "Service listings people can book", to: "/services" },
  { label: "Customer reviews", to: "/workspace/card" },
  { label: "Before-and-after project gallery", to: "/vault" },
  { label: "Booking information", to: "/services" },
];

/** Long term: less dependence on the body, more on the knowledge. */
export const LONG_TERM_SHIFT = {
  priority: "Immediate income stays the priority. Always.",
  direction:
    "Slowly, Frassy builds things that keep earning when the hands rest — guides, courses, referrals and a reputation people come to.",
} as const;

export const TRADESPERSON_ENCOURAGEMENTS = [
  "Your experience is your greatest asset. Technology just helps people find it.",
  "You already know the work. I'll handle the paperwork.",
  "One job at a time. That's how a business gets built.",
  "Decades of skill — we just need people to see it.",
];

export function tradespersonEncouragement(day: number): string {
  return (
    TRADESPERSON_ENCOURAGEMENTS[day % TRADESPERSON_ENCOURAGEMENTS.length] ??
    TRADESPERSON_ENCOURAGEMENTS[0]!
  );
}

export const TRADESPERSON_OUTCOMES = [
  "Jobs won",
  "Money collected",
  "Customers served",
  "Reviews earned",
  "Work shown",
  "Knowledge saved",
];

export const TRADESPERSON_NEVER_MEASURED = ["Clicks", "Hours online", "Tasks ticked"];

export const TRADESPERSON_PRINCIPLE =
  "A lifetime of experience should never be limited by unfamiliar technology. Frass exists to help " +
  "skilled tradespeople turn decades of knowledge into sustainable income through simple, guided " +
  "experiences that remove digital barriers and maximise the value of their expertise.";
