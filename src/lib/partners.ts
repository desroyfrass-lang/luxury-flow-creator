/**
 * FRASS-0456 — First Partner Welcome Hall.
 *
 * The personalization layer that sits on top of the ONE onboarding engine.
 * Frass never builds a second onboarding system for a named person. An invited
 * arrival walks the same hall as everyone else; the invitation only changes
 * what Frassy already knows when the doors open.
 */

export type PartnerDesignation =
  | "first_partner"
  | "early_partner"
  | "beta_partner"
  | "brand_partner";

export type DesignationMeta = {
  id: PartnerDesignation;
  badge: string;
  label: string;
  /** Plain-English meaning — the Founder's second-explanation rule. */
  plainEnglish: string;
  /** How Frassy greets this arrival at the gate. */
  greeting: (name: string) => string;
};

export const DESIGNATIONS: Record<PartnerDesignation, DesignationMeta> = {
  first_partner: {
    id: "first_partner",
    badge: "⭐",
    label: "First Partner",
    plainEnglish:
      "You are the first person invited onto Frass Hill outside the founding household. Your name sits in the record permanently — not as a marketing title, but as history.",
    greeting: (name) =>
      `${name}. You're the first one through these gates, and I've been expecting you.`,
  },
  early_partner: {
    id: "early_partner",
    badge: "🌱",
    label: "Early Partner",
    plainEnglish:
      "You arrived while the Hill was still being built, so you help shape it rather than just use it.",
    greeting: (name) => `${name} — welcome. You're early, and early counts here.`,
  },
  beta_partner: {
    id: "beta_partner",
    badge: "🧪",
    label: "Beta Partner",
    plainEnglish:
      "You are here to test things honestly and tell us what breaks before the doors open wide.",
    greeting: (name) => `${name}, good to see you. Break things — that's the job.`,
  },
  brand_partner: {
    id: "brand_partner",
    badge: "🤝",
    label: "Brand Partner",
    plainEnglish:
      "You bring your own brand onto the Hill and keep full ownership of it. Frass hosts you; it never absorbs you.",
    greeting: (name) => `${name} — your brand is welcome here, and it stays yours.`,
  },
};

export function designationMeta(id: string | null | undefined): DesignationMeta | null {
  if (!id) return null;
  return DESIGNATIONS[id as PartnerDesignation] ?? null;
}

export const DESIGNATION_OPTIONS = Object.values(DESIGNATIONS);

/** The two doors. One identity behind both — a shopper can walk up the Hill later. */
export type WelcomeDoor = "frasskicks" | "frass-hill";

export const DOORS: Record<
  WelcomeDoor,
  { title: string; kicker: string; line: string; plainEnglish: string; to: string }
> = {
  frasskicks: {
    title: "Frass Kicks",
    kicker: "The store",
    line: "Shop the districts, save your fits, track your orders. Nothing else asked of you.",
    plainEnglish:
      "This is the shopping door. You get an account so your cart, sizes and orders follow you — that's it. No business tools, no homework.",
    to: "/join/frasskicks",
  },
  "frass-hill": {
    title: "Frass Hill",
    kicker: "The ecosystem",
    line: "A Frass Card, a Builder Vault, a Daily, and Frassy walking beside you while you build.",
    plainEnglish:
      "This is the builder door. Same account, more of the town unlocked: your own identity page, a place to keep your work, and a short daily plan so building never feels like a pile.",
    to: "/join/frass-hill",
  },
};

/**
 * The arrival narration. Frassy speaks as a friend walking beside you — never
 * a product tour, never a feature list.
 */
export function arrivalScript(opts: {
  name: string;
  designation: DesignationMeta | null;
}): string[] {
  const { name, designation } = opts;
  const lines: string[] = [];
  if (designation) {
    lines.push(designation.greeting(name));
    lines.push(
      `You're registered as ${designation.badge} ${designation.label}. Here's the practical version: ${designation.plainEnglish}`,
    );
  } else {
    lines.push(`Welcome to Frass Hill, ${name}. Walk with me a minute.`);
  }
  lines.push(
    "I've already set a few things up so you're not starting from an empty room. Nothing here is a test you can fail.",
  );
  return lines;
}
