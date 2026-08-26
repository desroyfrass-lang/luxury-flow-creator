// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0610 — Frassy's Vault Setup Interview.
//
// Not a database form. A conversation. Frassy asks only what matters, adapts to
// what she hears, and then recommends a workspace the person can change.
//
// The rule: no profession is hard-coded. "Other" always works, because the
// recommendation is assembled from the answers, not from a lookup table of
// approved careers.
// ─────────────────────────────────────────────────────────────────────────────

import { modulesFor, resolveDependencies, type VaultCategory } from "./registry";

export type Answers = Record<string, string | string[] | boolean | undefined>;

export type Question = {
  id: string;
  ask: string;
  help?: string;
  kind: "text" | "long" | "yesno" | "choice";
  choices?: { id: string; label: string }[];
  /** Only asked when this returns true. */
  when?: (a: Answers) => boolean;
  optional?: boolean;
  placeholder?: string;
};

const yes = (a: Answers, id: string) => a[id] === true || a[id] === "yes";

export const INTERVIEW: Question[] = [
  {
    id: "name",
    ask: "First things first — what should we call this Vault?",
    help: "The name you'd use out loud. You can change it later.",
    kind: "text",
    placeholder: "e.g. Salon Grid Studios",
  },
  {
    id: "what_you_do",
    ask: "Tell me what you do.",
    help: "In your own words. I'm listening, not marking an exam.",
    kind: "long",
    placeholder: "I run a marketing studio for salons…",
  },
  {
    id: "managing",
    ask: "What are you trying to manage in here?",
    help: "The thing that's currently living in your head, your phone or a notebook.",
    kind: "long",
    optional: true,
  },
  {
    id: "alone",
    ask: "Do you work alone, or with others?",
    kind: "choice",
    choices: [
      { id: "alone", label: "On my own for now" },
      { id: "others", label: "With other people" },
    ],
  },
  {
    id: "clients",
    ask: "Do you have clients or customers?",
    kind: "yesno",
  },
  {
    id: "client_word",
    ask: "Do you call them clients or customers?",
    kind: "choice",
    when: (a) => yes(a, "clients"),
    choices: [
      { id: "clients", label: "Clients" },
      { id: "customers", label: "Customers" },
    ],
  },
  {
    id: "leads",
    ask: "Do you chase new work — people who haven't bought yet?",
    kind: "yesno",
    when: (a) => yes(a, "clients"),
  },
  {
    id: "projects",
    ask: "Does your work come in projects or jobs?",
    kind: "yesno",
  },
  {
    id: "campaigns",
    ask: "Do you run campaigns — pushes with a start and an end?",
    kind: "yesno",
    when: (a) => a["category"] !== "personal",
  },
  {
    id: "sell",
    ask: "Do you sell anything?",
    kind: "yesno",
  },
  {
    id: "sell_what",
    ask: "Products, services, or both?",
    kind: "choice",
    when: (a) => yes(a, "sell"),
    choices: [
      { id: "products", label: "Products" },
      { id: "services", label: "Services" },
      { id: "both", label: "Both" },
    ],
  },
  {
    id: "content",
    ask: "Do you create content — posts, video, episodes?",
    kind: "yesno",
  },
  {
    id: "music",
    ask: "Is music part of the work?",
    kind: "yesno",
    when: (a) => a["category"] === "creator",
  },
  {
    id: "releases",
    ask: "Do you put music out on release dates?",
    kind: "yesno",
    when: (a) => yes(a, "music"),
  },
  {
    id: "rights",
    ask: "Do you need to keep track of who owns what — splits, licences, rights?",
    kind: "yesno",
    when: (a) => yes(a, "music") || a["category"] === "creator",
  },
  {
    id: "assets",
    ask: "Do you keep files or assets you reuse — artwork, logos, masters?",
    kind: "yesno",
  },
  {
    id: "calendar",
    ask: "Do dates matter here — bookings, deadlines, sessions?",
    kind: "yesno",
  },
  {
    id: "money",
    ask: "Do you want to track money in this Vault?",
    kind: "yesno",
  },
  {
    id: "invoices",
    ask: "Do you send invoices?",
    kind: "yesno",
    when: (a) => yes(a, "money") && yes(a, "clients"),
  },
  {
    id: "most_important",
    ask: "Last one — what's the most important thing you want this Vault to help you with?",
    help: "I'll put that first on your Home.",
    kind: "long",
  },
];

/** The questions that still apply, given what's already been answered. */
export function activeQuestions(answers: Answers): Question[] {
  return INTERVIEW.filter((q) => !q.when || q.when(answers));
}

export function nextQuestion(answers: Answers): Question | null {
  for (const q of activeQuestions(answers)) {
    const v = answers[q.id];
    const empty = v === undefined || v === "" || v === null;
    if (empty && !q.optional) return q;
    if (empty && q.optional && !(`${q.id}:skipped` in answers)) return q;
  }
  return null;
}

export type Recommendation = {
  modules: string[];
  reasons: Record<string, string>;
  headline: string;
};

/**
 * Assemble a workspace from the answers. Every module comes with a reason in
 * plain English, so "Ask Frassy why" always has a real answer.
 */
export function recommendModules(category: string, answers: Answers): Recommendation {
  const reasons: Record<string, string> = {
    home: "Every Vault has a Home. It answers one question: what needs you today?",
  };
  const picked = new Set<string>(["home"]);
  const allowed = new Set(modulesFor(category).map((m) => m.id));

  const add = (id: string, why: string) => {
    if (!allowed.has(id)) return;
    picked.add(id);
    reasons[id] = why;
  };

  if (yes(answers, "clients")) {
    if (answers["client_word"] === "customers") {
      add("customers", "You told me you have customers, so this is where they live.");
    } else {
      add("clients", "You told me you have clients, so this is where they live.");
    }
  }
  if (yes(answers, "leads")) add("leads", "You chase new work, so leads stay separate from paying clients.");
  if (yes(answers, "projects")) add("projects", "Your work comes in projects, so each one gets its own place.");
  if (yes(answers, "campaigns")) add("campaigns", "You run campaigns, and a campaign is not the same thing as a project.");
  if (yes(answers, "content")) add("content", "You create content, so planned and published work sits together.");
  if (yes(answers, "music")) add("music", "Music is the work, so songs get their own room.");
  if (yes(answers, "releases")) add("releases", "You release on dates, and a release deserves more than a diary entry.");
  if (yes(answers, "rights")) add("rights", "You need to know who owns what. That belongs written down, not remembered.");
  if (yes(answers, "assets")) add("assets", "You reuse artwork and files, so they need one home you trust.");
  if (yes(answers, "calendar")) add("calendar", "Dates matter here, so the diary comes with you.");
  if (yes(answers, "money")) add("money", "You want to see money moving, honestly, with nothing assumed.");
  if (yes(answers, "invoices")) {
    add("invoices", "You bill people, so what's owed stays visible.");
    add("expenses", "Once you're billing, what the work costs you matters just as much.");
  }
  if (answers["sell_what"] === "products" || answers["sell_what"] === "both") {
    add("products", "You sell products, so the catalogue lives here.");
    add("orders", "Products need somewhere for orders to land.");
  }
  if (answers["sell_what"] === "services" || answers["sell_what"] === "both") {
    add("services", "You sell services, so what you offer is written down plainly.");
  }

  // Always-useful spine.
  add("tasks", "Everything else is planning. Tasks are the doing.");
  add("notes", "Somewhere to think, kept beside the work instead of in another app.");
  add("goals", "So this Vault always knows what it's for.");

  const modules = resolveDependencies([...picked]);
  const what = typeof answers["what_you_do"] === "string" ? (answers["what_you_do"] as string) : "";
  const headline = what.trim()
    ? `Based on what you told me — ${what.trim().slice(0, 140)} — here's how I'd set this up.`
    : "Here's how I'd set this up.";

  return { modules, reasons, headline };
}

/** How far through the conversation the person is, for the progress line. */
export function interviewProgress(answers: Answers): { done: number; total: number } {
  const qs = activeQuestions(answers);
  const done = qs.filter((q) => {
    const v = answers[q.id];
    return !(v === undefined || v === "" || v === null);
  }).length;
  return { done, total: qs.length };
}

export const VAULT_ENGINE_PROMISE = [
  "You can build your Vault yourself, inside Frass Hill.",
  "No developer. No database. No waiting on anybody.",
  "If your work isn't on my list, tell me what you do and I'll build around it.",
] as const;

export type { VaultCategory };
