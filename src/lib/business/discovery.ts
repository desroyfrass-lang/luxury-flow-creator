// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0483 — Business Discovery Engine
// "Discover the business already inside the person."
//
// This is NOT a new onboarding flow. It extends the Discovery Interview that
// already exists (partner-profile.ts) with two constitutional guarantees:
//
//   1. Continuous Discovery — the interview never ends. Skills Frassy overhears
//      months later become offers, not silence.
//   2. Business Matching — every discovered asset routes to a business surface
//      that ALREADY exists in Frass. Nothing new is invented here.
//
// Everything stays on the member's device (partner-profile storage).
// ─────────────────────────────────────────────────────────────────────────────

import {
  assetById,
  acceptPending,
  dismissPending,
  loadProfile,
  type HiddenAsset,
  type PartnerProfile,
} from "./partner-profile";

export const DISCOVERY_PRINCIPLE =
  "Frass does not give people businesses. Frass discovers the businesses already inside them and helps them Build It. Monetize It.";

export const DISCOVERY_PLAIN_ENGLISH =
  "Here's the idea: Frassy keeps listening. If you mention something you used to do — teaching aerobics, packing houses, painting — she offers to turn it into a business you already know how to run, using rooms Frass has already built.";

/** Where a discovered asset lands. Every destination is an existing surface. */
export type Destination = {
  /** Existing Frass room this asset plugs into. */
  label: string;
  to: string;
  /** Frassy's offer, in her voice, one sentence. */
  offer: (label: string) => string;
};

const MONEY_MOVES: Destination = {
  label: "Money Moves",
  to: "/money-moves",
  offer: (l) => `You mentioned ${l.toLowerCase()}. Want me to build Money Moves around it?`,
};

const BUSINESS_BUILDER: Destination = {
  label: "Business Builder",
  to: "/business-builder",
  offer: (l) => `You mentioned ${l.toLowerCase()}. Want me to open a Business Vault for it and plan the first week?`,
};

const VAULTS: Destination = {
  label: "Business Vaults",
  to: "/business-vaults",
  offer: (l) => `You mentioned ${l.toLowerCase()}. Want me to shelve that as a Business Vault until you're ready?`,
};

/**
 * Asset → the existing Frass business surface it belongs to.
 * Unmapped assets fall back to Money Moves, which every business feeds.
 */
export const ASSET_DESTINATION: Record<string, Destination> = {
  wellness: BUSINESS_BUILDER,
  esthetics: BUSINESS_BUILDER,
  fitness: BUSINESS_BUILDER,
  cooking: MONEY_MOVES,
  style: BUSINESS_BUILDER,
  teaching: MONEY_MOVES,
  care: MONEY_MOVES,
  craft: MONEY_MOVES,
  logistics: VAULTS,
  music: MONEY_MOVES,
  garden: MONEY_MOVES,
  tech: MONEY_MOVES,
};

export function destinationFor(assetId: string): Destination {
  return ASSET_DESTINATION[assetId] ?? MONEY_MOVES;
}

export type DiscoveryOffer = {
  asset: HiddenAsset;
  destination: Destination;
  /** Frassy's spoken-style line. */
  line: string;
  /** Plain-English reason this is worth money. */
  worth: string;
};

/**
 * Continuous Discovery: skills Frassy overheard in conversation that the
 * member has not confirmed yet. She never assumes — she asks.
 */
export function pendingOffers(profile: PartnerProfile = loadProfile()): DiscoveryOffer[] {
  return (profile.pending ?? [])
    .map((id) => assetById(id))
    .filter((a): a is HiddenAsset => !!a)
    .map((asset) => {
      const destination = destinationFor(asset.id);
      return {
        asset,
        destination,
        line: destination.offer(asset.label),
        worth: asset.worth,
      };
    });
}

/** Member said yes: the asset joins their profile and shapes every Daily after. */
export function confirmOffer(assetId: string): PartnerProfile {
  return acceptPending(assetId);
}

/** Member said not now: Frassy drops it without comment. */
export function declineOffer(assetId: string): PartnerProfile {
  return dismissPending(assetId);
}

/** One line for the Daily when Frassy is holding a discovery. */
export function discoveryHeadline(profile: PartnerProfile = loadProfile()): string | null {
  const offers = pendingOffers(profile);
  if (offers.length === 0) return null;
  if (offers.length === 1) return offers[0]!.line;
  return `I picked up ${offers.length} things you've done before — want me to turn any of them into a business?`;
}
