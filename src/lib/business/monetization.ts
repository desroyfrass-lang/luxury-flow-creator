// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0480 — Money Moves Constitutional Amendment · "Build it. Monetize it."
//
// This does NOT replace the Money Moves engine (money-moves.ts / accelerator.ts).
// It is a thin layer ON TOP of moves that already exist, answering one question:
//
//   "What is the next action that moves this member closer to earning?"
//
// Constitutional rule (locked wording):
//   Every Money Move ends with the highest practical level of monetization
//   available at that stage. Learning never ends the journey. When an external
//   dependency blocks earning (Marketplace not live, payments not switched on,
//   inventory not landed), Frassy switches the member into Preparation Mode —
//   productive work that makes monetization trigger the moment the block clears.
// ─────────────────────────────────────────────────────────────────────────────

import { allMoves, type LaunchState, type ResolvedMove } from "./accelerator";

export const BUILD_IT_MONETIZE_IT = "Build it. Monetize it.";

export const MONETIZATION_RULE =
  "Every Money Move ends with the highest practical level of monetization available at that stage.";

export const MONETIZATION_PROMISE =
  "Frass Hill doesn't stop at ideas. We help people build them, launch them, and create real opportunities to earn.";

/** Learn → Build → Monetize. Never learn alone. */
export type MonetizationPhase = "learn" | "build" | "monetize";

export const PHASE_LABEL: Record<MonetizationPhase, string> = {
  learn: "Learn",
  build: "Build",
  monetize: "Monetize",
};

/**
 * Which part of Learn → Build → Monetize a move belongs to. Derived from the
 * existing catalogue, so no move has to be rewritten to gain a phase.
 */
export function phaseOfMove(move: Pick<ResolvedMove, "id" | "stageId" | "label">): MonetizationPhase {
  const hay = `${move.stageId} ${move.id} ${move.label}`.toLowerCase();
  if (/(list|publish|launch|sell|sale|price|checkout|book|payout|invoice|drop|offer live|go live|monetis|monetiz|sponsor)/.test(hay)) {
    return "monetize";
  }
  if (/(learn|lesson|study|research|understand|watch|read|plan|choose|decide)/.test(hay)) return "learn";
  return "build";
}

// ── Monetization Outcomes ───────────────────────────────────────────────────
// The endpoint each business must reach. A Money Move chain is only complete
// when its outcome is live — or, when blocked, fully launch-ready.

export type MonetizationOutcome = {
  /** The live endpoint, in the member's language. */
  outcome: string;
  /** The visible checkpoints on the way there. */
  checkpoints: string[];
  /** What the member does while an external dependency is unresolved. */
  preparation: string[];
  /** Where the outcome actually goes live inside Frass. */
  href: string;
};

export const MONETIZATION_OUTCOMES: Record<string, MonetizationOutcome> = {
  wellness: {
    outcome: "Store active — products priced, listed and ready for sales",
    checkpoints: ["Brand built", "Products organised", "Store prepared", "Ready for sales"],
    preparation: ["Photograph the range", "Write product stories", "Grow the wellness audience"],
    href: "/marketplace",
  },
  "coco-vintage": {
    outcome: "Collection live — pieces listed with stories and prices",
    checkpoints: ["Inventory organised", "Pieces photographed", "Stories written", "Collection published"],
    preparation: ["Build the next collection", "Bank photography", "Warm the waitlist"],
    href: "/collection",
  },
  faceless: {
    outcome: "Content published with a live earning link on every post",
    checkpoints: ["Channel branded", "Content calendar running", "Published consistently", "Earning link attached"],
    preparation: ["Bank a content library", "Grow reach", "Prepare the link-in-bio"],
    href: "/studio",
  },
  affiliate: {
    outcome: "Affiliate campaign active — approved products earning commission",
    checkpoints: ["Audience built", "Content engine running", "Brand credible", "Campaign live"],
    preparation: ["Build audience", "Build content", "Build brand", "Build marketing assets"],
    href: "/workspace/affiliate",
  },
  podcast: {
    outcome: "Podcast published with sponsorship and support links live",
    checkpoints: ["Podcast created", "Branding complete", "Episodes recorded", "Published", "Monetisation connected"],
    preparation: ["Record ahead", "Build the listener base", "Prepare the sponsor one-pager"],
    href: "/studio",
  },
  gallery: {
    outcome: "Gallery live — originals and prints available to buy",
    checkpoints: ["Gallery created", "Originals listed", "Prints available", "Published for sale"],
    preparation: ["Photograph the work", "Write the artist story", "Prepare print files"],
    href: "/marketplace",
  },
  services: {
    outcome: "Service published and bookable from your Frass Card",
    checkpoints: ["Service defined", "Frass Card updated", "Booking enabled", "Ready to accept customers"],
    preparation: ["Define the offer", "Set the price", "Prepare the booking page"],
    href: "/workspace/card",
  },
};

/** Generic fallback so a new business is never left without an endpoint. */
export const DEFAULT_OUTCOME: MonetizationOutcome = {
  outcome: "Offer live — something a customer can actually buy",
  checkpoints: ["Offer defined", "Assets prepared", "Published", "Ready to earn"],
  preparation: ["Prepare the offer", "Build the audience", "Ready the launch assets"],
  href: "/room",
};

export function outcomeFor(streamId: string): MonetizationOutcome {
  return MONETIZATION_OUTCOMES[streamId] ?? DEFAULT_OUTCOME;
}

// ── Progress toward monetization ────────────────────────────────────────────

export type MonetizationTrack = {
  streamId: string;
  label: string;
  emoji: string;
  outcome: string;
  href: string;
  /** 0–100 across the whole Learn → Build → Monetize chain. */
  pct: number;
  phase: MonetizationPhase;
  /** The single next action that moves them closer to earning. */
  nextStep: string | null;
  /** Set when an external dependency blocks earning — productive work instead. */
  preparation: string | null;
  /** Plain-English sentence for the Daily. */
  line: string;
};

/**
 * Progress toward the monetization endpoint for one business, computed from
 * the moves the member has already completed. Nothing is invented.
 */
export function monetizationTrack(
  state: LaunchState,
  stream: { id: string; label: string; emoji: string },
  blocked?: { reason: string } | null,
): MonetizationTrack {
  const spec = outcomeFor(stream.id);
  const moves = allMoves(state).filter((m) => m.businessId === stream.id);
  const total = moves.length || 1;
  const done = moves.filter((m) => m.done).length;
  const pct = Math.min(100, Math.round((done / total) * 100));

  const open = moves.filter((m) => !m.done);
  const next = open[0] ?? null;
  const phase: MonetizationPhase = next ? phaseOfMove(next) : "monetize";

  const preparation = blocked
    ? `${blocked.reason} Preparation Mode is not waiting — it is the work that makes earning instant the moment this clears: ${spec.preparation.join(" · ")}.`
    : null;

  const line = preparation
    ? `${stream.emoji} ${stream.label} — ${pct}% built. Earning is blocked outside Frass, so today builds the launch assets instead.`
    : next
      ? `${stream.emoji} ${stream.label} — ${pct}% of the way to "${spec.outcome}". Next: ${next.label}.`
      : `${stream.emoji} ${stream.label} — monetized. ${spec.outcome}.`;

  return {
    streamId: stream.id,
    label: stream.label,
    emoji: stream.emoji,
    outcome: spec.outcome,
    href: spec.href,
    pct,
    phase,
    nextStep: next ? next.label : null,
    preparation,
    line,
  };
}

export function monetizationTracks(
  state: LaunchState,
  streams: { id: string; label: string; emoji: string }[],
  blockedBy?: Record<string, string>,
): MonetizationTrack[] {
  return streams.map((s) => {
    const reason = blockedBy?.[s.id];
    return monetizationTrack(state, s, reason ? { reason } : null);
  });
}

/** One sentence Frassy can say in the Daily about where earning stands. */
export function monetizationSummary(tracks: MonetizationTrack[]): string {
  if (tracks.length === 0) return `${BUILD_IT_MONETIZE_IT} Pick a business and I'll take you all the way to earning.`;
  const live = tracks.filter((t) => t.pct >= 100 && !t.preparation);
  const prepping = tracks.filter((t) => t.preparation);
  const closest = [...tracks].sort((a, b) => b.pct - a.pct)[0]!;
  if (live.length) {
    return `${live.length} of your businesses can take money today. ${closest.label} is the closest to its next earning milestone.`;
  }
  if (prepping.length === tracks.length) {
    return "Everything you're building is in Preparation Mode — the work still counts, and earning switches on the moment the outside blocks clear.";
  }
  return `${closest.emoji} ${closest.label} is ${closest.pct}% of the way to "${closest.outcome}". That's today's road to earning.`;
}
