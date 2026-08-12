/**
 * FRASS-0494 — Architectural Integrity Engine.
 *
 * "Build once. Extend forever."
 *
 * This file adds no member-facing feature. It exists to protect every future
 * feature. It is the machine-readable form of the rule the Founder has
 * repeated since the beginning: audit first, extend second, never duplicate.
 *
 * Frassy reads this, the Founder reviews against it, and every builder working
 * inside Frass answers its questions before creating anything new.
 */

export const INTEGRITY_PRINCIPLE =
  "Every new capability should make Frass simpler, not more complicated. The platform grows by enriching what already exists — not by multiplying systems that solve the same problem.";

export const INTEGRITY_PLAIN_ENGLISH =
  "It's the difference between a well-built house and a house with three kitchens. Every time somebody needed to cook they added another kitchen instead of walking to the one that was already there. Each kitchen works. The house becomes unlivable. Frass adds a better stove to the one kitchen it has.";

export const INTEGRITY_LAW =
  "Before anything new is built, determine whether the capability already exists somewhere in Frass. If it exists, extend it. If it does not, build it once — then make it reusable everywhere.";

/** The mandatory audit. Nothing new is created until every one of these is checked. */
export const MANDATORY_AUDIT = [
  "Daily",
  "Workspace",
  "Welcome Hall",
  "Money Moves",
  "Frassy",
  "Builder Vault",
  "Business Builder",
  "FOR ME",
  "Frass Card",
  "Marketplace",
  "Financial Center",
  "Founder Mode",
  "Services Marketplace",
  "Existing APIs",
  "Existing databases",
  "Existing navigation",
  "Existing permissions",
  "Existing UI components",
] as const;

/** One authoritative implementation per responsibility. These are the singletons. */
export const SOURCES_OF_TRUTH = [
  { capability: "Assistant", system: "Frassy", never: "Never create another assistant. Teach Frassy." },
  { capability: "Wallet", system: "Frass Card Wallet", never: "Never create another wallet." },
  {
    capability: "Money and receipts",
    system: "Financial Center",
    never: "Never create another ledger, payout path or receipt store.",
  },
  { capability: "Daily rhythm", system: "The Daily", never: "Never create another daily briefing." },
  { capability: "Working surface", system: "Workspace", never: "Never create another workspace." },
  {
    capability: "Earning engine",
    system: "Money Moves",
    never: "Never create another opportunity or earning engine.",
  },
  { capability: "Notifications", system: "Notifications", never: "Never create another alert system." },
  {
    capability: "Authentication",
    system: "Supabase auth + Identity Gate",
    never: "Never create another sign-in path or identity store.",
  },
  {
    capability: "Profile and identity",
    system: "Frass Card + FOR ME",
    never: "Never create another profile architecture.",
  },
  {
    capability: "Reputation",
    system: "Trust Profile (FRASS-0493)",
    never: "Never create another rating or review system.",
  },
  {
    capability: "Content protection",
    system: "Digital Rights (FRASS-0492)",
    never: "Never create another media pipeline or rights service.",
  },
  { capability: "Chat", system: "FrassyChat", never: "Never create another chat surface." },
  {
    capability: "Sharing images",
    system: "Frassy share cards (FRASS-0492)",
    never: "Never create another share-image renderer.",
  },
] as const;

/** Extension examples, stated as decisions rather than suggestions. */
export const EXTENSION_RULES = [
  "If chat already exists — extend the existing chat.",
  "If notifications already exist — extend notifications.",
  "If a Wallet exists — extend the Wallet.",
  "If Money Moves exists — extend Money Moves.",
  "If Frassy already performs the task — teach Frassy.",
] as const;

/** The questions every major feature must answer before implementation. */
export const FOUNDER_REVIEW_QUESTIONS = [
  "Does this already exist?",
  "Can an existing system be extended?",
  "Will this confuse members?",
  "Does this introduce duplicate navigation?",
  "Does this create duplicate data?",
  "Does this strengthen or weaken the overall architecture?",
] as const;

export const CONSTITUTIONAL_LAWS = [
  "Audit before building.",
  "Extend before creating.",
  "One system per responsibility.",
  "One source of truth.",
  "No duplicate engines.",
  "No duplicate identities.",
  "No duplicate financial systems.",
  "No duplicate AI assistants.",
  "No duplicate navigation.",
  "No duplicate business logic.",
] as const;

export const UI_CONSISTENCY_RULE =
  "Reuse existing layouts, buttons, components, permissions, styling and animation. Members should feel they are using one platform — not dozens of disconnected apps.";

export const DATABASE_INTEGRITY_RULE =
  "Extend existing tables through configuration before creating new ones. Avoid duplicate tables, duplicate business logic, duplicate APIs and duplicate permissions.";

/**
 * Frassy's guidance when someone asks for something that already exists.
 * She never invents a parallel workflow; she points at the real one.
 */
export function redirectToExisting(capability: string): string | null {
  const match = SOURCES_OF_TRUTH.find(
    (s) =>
      capability.toLowerCase().includes(s.capability.toLowerCase()) ||
      s.system.toLowerCase().includes(capability.toLowerCase()),
  );
  if (!match) return null;
  return `${match.capability} already lives in ${match.system}. ${match.never} Let's extend what's there instead — it'll be faster and it'll stay consistent for everyone.`;
}
