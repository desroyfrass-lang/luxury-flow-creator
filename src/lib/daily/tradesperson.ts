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
import {
  rankOnlineFirst,
  type EarningShape,
  type OnlineFirstContext,
} from "@/lib/business/online-first";

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
// FRASS-0532-A — the question changed. It is no longer "the fastest way to make
// money"; it is "the fastest way to financial freedom through online income."
export const TRADESPERSON_QUESTION =
  "What's the easiest way to earn online today — without picking up a tool?";

export const TRADESPERSON_VISION =
  "Your experience is already worth money. My job is to turn it into something that keeps earning " +
  "online — guides, videos, recommendations and advice people pay for — while you enjoy your time.";

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
  /** FRASS-0532-A — how this move earns. Online and scalable comes first. */
  shape: EarningShape;
};

/**
 * FRASS-0532-A — ONLINE-FIRST. These moves turn a lifetime of skill into
 * digital assets, content, recommendations and remote advice. Hands-on work is
 * listed last and only ever appears when the member asks for it or their
 * situation requires it.
 */
export const TRADESPERSON_MOVES: TradeMove[] = [
  {
    label: "Turn one thing you know into a guide people can buy",
    why: "A safety checklist, a maintenance guide, an inspection form. Made once, sold many times.",
    layer: "financial-freedom",
    minutes: 15,
    href: "/vault",
    shape: "digital-asset",
  },
  {
    label: "Record two minutes of advice in your own voice",
    why: "You talk, I turn it into a video, an article and a post. Your face is optional.",
    layer: "business-builder",
    minutes: 10,
    href: "/workspace/composer",
    shape: "digital-asset",
  },
  {
    label: "Recommend the tools you actually trust",
    why: "Tools, safety gear, materials. You get paid when people buy on your word — no lifting.",
    layer: "immediate-income",
    minutes: 15,
    href: "/affiliate",
    shape: "leveraged",
  },
  {
    label: "Open one paid online consultation slot",
    why: "People pay for thirty minutes of your judgement, by video or voice. No travel, no site.",
    layer: "immediate-income",
    minutes: 15,
    href: "/services",
    shape: "online-service",
  },
  {
    label: "Package what you know into a small course or membership",
    why: "The step after guides: it keeps earning every month without you starting over.",
    layer: "financial-freedom",
    minutes: 20,
    href: "/business-vaults",
    shape: "recurring",
  },
  {
    label: "Pass a job you don't want to a tradesperson you trust",
    why: "You still benefit from work you send on — without picking up a tool.",
    layer: "business-builder",
    minutes: 10,
    href: "/services",
    shape: "leveraged",
  },
  {
    label: "Put your finished work where people can see it",
    why: "Before-and-after photos are what make strangers trust you online.",
    layer: "business-builder",
    minutes: 15,
    href: "/workspace/card",
    shape: "digital-asset",
  },
  // ── Hands-on work. Hidden unless the member asks, or the day requires it.
  {
    label: "Answer today's job enquiries",
    why: "Real money on the table. I'll write the replies; you just say yes or no.",
    layer: "immediate-income",
    minutes: 10,
    href: "/money-moves",
    shape: "offline-service",
  },
  {
    label: "Send the invoice for the last job",
    why: "Work you already did should already be paid. I prepare it, you approve it.",
    layer: "immediate-income",
    minutes: 10,
    href: "/financial-center",
    shape: "offline-service",
  },
];

/** FRASS-0532 pace rule — never more than this in one sitting. */
export const TRADESPERSON_MOVE_LIMIT = 3;
export const TRADESPERSON_MINUTES_PER_DAY = 45;

/**
 * FRASS-0532-A — the constitutional order. Digital assets, recurring income and
 * leveraged income first; hands-on work only by request or necessity.
 */
export function todaysTradeMoves(
  ctxOrMoves: OnlineFirstContext | TradeMove[] = {},
  maybeCtx: OnlineFirstContext = {},
): TradeMove[] {
  const all = Array.isArray(ctxOrMoves) ? ctxOrMoves : TRADESPERSON_MOVES;
  const ctx = Array.isArray(ctxOrMoves) ? maybeCtx : ctxOrMoves;
  return rankOnlineFirst(all, ctx).slice(0, TRADESPERSON_MOVE_LIMIT);
}

/** Unless asked, these never appear on this Daily (FRASS-0532-A). */
export const TRADESPERSON_AVOID = [
  "Local job boards",
  "Construction contracts",
  "Renovation projects",
  "Manual electrical work",
  "Physical labour",
  "Daily commuting",
];

/** Knowledge-based income — expertise beyond physical labour. */
export const KNOWLEDGE_PRODUCTS = [
  "Electrical and site safety guides",
  "Homeowner maintenance checklists",
  "Renovation planning resources",
  "Printable inspection forms",
  "Digital reference manuals",
  "Short educational videos and voice recordings",
  "E-books and answers to the questions people always ask",
  "Small courses, memberships and downloadable resources",
];

/** He teaches. Frassy produces. His face is optional. */
export const CONTENT_PARTNERSHIP = {
  member: "You talk. You explain it the way you'd explain it on a job site.",
  frassy:
    "I write it, record it, edit it, post it and keep it selling — videos, articles, posts, e-books.",
  facelessOk: true,
} as const;

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
  priority: "Income today still matters — it just doesn't have to come from your back.",
  direction:
    "Everything we build is meant to keep earning when the hands rest: guides, courses, recommendations, memberships and a reputation people come to.",
  question:
    "How do we turn a lifetime of experience into an online business that keeps earning while you enjoy your time?",
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
