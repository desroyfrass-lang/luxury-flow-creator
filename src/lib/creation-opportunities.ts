// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0411 — Every Creation Has a Business.
//
// Constitutional principle: nothing made inside Frass is "just a file". Every
// finished creation is an asset that can earn, teach, promote or fund something
// in the ecosystem. This module turns a creation into the honest list of
// pathways already built in Frass — no invented destinations, no hype.
//
// Plain English: when you finish something, Frass shows you every real door
// that thing can walk through next.
// ─────────────────────────────────────────────────────────────────────────────

export type CreationKind =
  | "video"
  | "audio"
  | "music"
  | "image"
  | "writing"
  | "product"
  | "design";

export type OpportunityPathway = {
  id: string;
  title: string;
  /** Expert framing. */
  what: string;
  /** "What this means in plain English" — always required. */
  plain: string;
  /** Where this actually happens today. */
  to: string;
  cta: string;
  /** How value returns to the Builder. */
  earns: string;
};

const PATHWAYS: Record<string, OpportunityPathway> = {
  radio: {
    id: "radio",
    title: "Place it on Frass Radio",
    what: "Submit the master to Frass Radio rotation for ecosystem-wide distribution.",
    plain: "Put your track on the Frass station so people hear it while they shop and build.",
    to: "/frass-radio",
    cta: "Open Frass Radio",
    earns: "Rotation participation earnings through your Radio ledger.",
  },
  brandDeals: {
    id: "brandDeals",
    title: "Turn it into a brand campaign",
    what: "Attach the asset to your media kit and pitch matched sponsorship campaigns.",
    plain: "Show this to brands as proof of your work so they'll pay you to make more of it.",
    to: "/brand-partnerships",
    cta: "See matched campaigns",
    earns: "Campaign fees paid through escrow, minus the platform fee.",
  },
  marketplace: {
    id: "marketplace",
    title: "Sell it in the Marketplace",
    what: "List the creation — or a product built from it — as a Builder offer.",
    plain: "Put it up for sale so people can buy it directly from you.",
    to: "/marketplace",
    cta: "Open the Marketplace",
    earns: "Direct sales revenue through your commerce ledger.",
  },
  merch: {
    id: "merch",
    title: "Make it merchandise",
    what: "Route the artwork through the merch proposal pipeline for print production.",
    plain: "Put the design on real clothing and gear people can order.",
    to: "/workspace/merch",
    cta: "Open Merch Studio",
    earns: "Product margin after blank, print and platform costs.",
  },
  academy: {
    id: "academy",
    title: "Teach how you made it",
    what: "Convert the process into a project-based Academy lesson.",
    plain: "Show other Builders how you did it — and get credit for teaching.",
    to: "/academy",
    cta: "Open the Academy",
    earns: "Teaching participation and Builder reputation.",
  },
  forUs: {
    id: "forUs",
    title: "Tell the story behind it",
    what: "Submit to For Us for Founder-approved community publishing.",
    plain: "Share the human story of this work with the community.",
    to: "/for-us",
    cta: "Open For Us",
    earns: "Visibility and community standing — never published without approval.",
  },
  vault: {
    id: "vault",
    title: "Preserve it in your Vault",
    what: "Version the asset into the Builder Vault as durable, searchable memory.",
    plain: "Keep a safe copy you can find and reuse forever.",
    to: "/vault",
    cta: "Open the Vault",
    earns: "Compounding value — future work starts from what you already made.",
  },
  studios: {
    id: "studios",
    title: "Take it to FV Studios",
    what: "Develop the asset into a production under a Frass Vision Studios division.",
    plain: "Turn this into a proper production project with the Studios behind it.",
    to: "/fv-studios",
    cta: "Open Frass Vision Studios",
    earns: "Revenue participation — partnership, never ownership of your work.",
  },
  foundation: {
    id: "foundation",
    title: "Point it at the Foundation",
    what: "Dedicate a share of proceeds to a Foundation pillar.",
    plain: "Let part of what this earns go to helping someone else.",
    to: "/foundation",
    cta: "Open the Foundation",
    earns: "Impact — every number carries its purpose chain.",
  },
};

const BY_KIND: Record<CreationKind, string[]> = {
  video: ["studios", "brandDeals", "academy", "forUs", "vault", "foundation"],
  audio: ["radio", "studios", "brandDeals", "academy", "vault"],
  music: ["radio", "studios", "brandDeals", "marketplace", "vault"],
  image: ["merch", "marketplace", "brandDeals", "forUs", "vault"],
  writing: ["forUs", "academy", "marketplace", "vault"],
  product: ["marketplace", "merch", "brandDeals", "academy", "vault", "foundation"],
  design: ["merch", "marketplace", "studios", "academy", "vault"],
};

/** Every real business pathway open to a finished creation. */
export function opportunitiesFor(kind: CreationKind): OpportunityPathway[] {
  return (BY_KIND[kind] ?? []).map((id) => PATHWAYS[id]).filter(Boolean);
}

/** Best-effort creation kind from a filename or media type. */
export function creationKindFrom(nameOrType: string): CreationKind {
  const s = nameOrType.toLowerCase();
  if (/video|mp4|mov|webm|reel/.test(s)) return "video";
  if (/mp3|wav|m4a|aac|song|track|music/.test(s)) return "music";
  if (/audio|voice|podcast/.test(s)) return "audio";
  if (/png|jpe?g|webp|svg|image|art/.test(s)) return "image";
  if (/doc|txt|md|story|article|writing/.test(s)) return "writing";
  if (/product|sku|listing/.test(s)) return "product";
  return "design";
}

export const CREATION_PRINCIPLE = {
  headline: "Every creation has a business.",
  plain:
    "Anything you finish here can become income, a lesson, a product, or help for someone else. Frass shows you the real doors — you choose which ones to walk through.",
};
