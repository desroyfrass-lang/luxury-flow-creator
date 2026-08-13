// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0532-B — Member Success Blueprints
//
// The next evolution of Frass: we stop ENGINEERING a Daily for each person and
// start TEACHING Frassy who they are. A Blueprint is knowledge, not code.
// Frassy reads it and generates the experience — Daily sections, Money Moves
// order, pace, tone, view mode — dynamically.
//
// New Founder workflow:  Idea → Frassy → 🟢 do it · 🟡 configure · 🟠 approve ·
// 🔴 engineering. Only 🔴 becomes an engineering request (FRASS-0527).
//
// Adding a new partner (Kanko, Mother, Father, Brother, Son, Vladimir, Sheldon,
// BimBim, Laka Joe, Chiki) = writing a Blueprint. Never a new route, never a new
// component, never a deployment.
// ─────────────────────────────────────────────────────────────────────────────

import type { BlueprintId } from "@/lib/daily/blueprints";

export type BlueprintKind = BlueprintId | "tradesperson";
export type TechComfort = "low" | "moderate" | "high";
export type BlueprintStatus = "draft" | "active" | "archived";

/**
 * FRASS-0533 — a recurring creative project (a series, a channel, a book).
 * It lives on the Blueprint, never in code, so Frassy simply knows it is one of
 * this member's highest-priority weekly projects.
 */
export type CreativeProject = {
  name: string;
  /** e.g. "Active Weekly Money Move". */
  status?: string | null;
  /** How often a new instalment is made. */
  cadence?: string | null;
  /** Which instalment is in production right now. */
  current_episode?: string | null;
  script_status?: string | null;
  production_status?: string | null;
  upload_status?: string | null;
  thumbnail_status?: string | null;
  publish_date?: string | null;
  /** Where it is published. */
  channel?: string | null;
  notes?: string | null;
};

/**
 * FRASS-0534 — a lightweight pointer from a Blueprint to a book project. The
 * manuscript itself (chapters, versions, amendments) lives in the
 * `legacy_publications` table; this is just so Frassy knows, from the Blueprint,
 * that the member is writing a book.
 */
export type LegacyPublicationPointer = {
  title: string;
  /** "new-book" — written from a completed journey. "republish" — reclaiming existing work. */
  kind: "new-book" | "republish";
  /** The legacy_publications row id, when one exists. */
  publication_id?: string | null;
  /** outline | drafting | editing | review | published */
  status?: string | null;
};

export type MemberBlueprint = {
  id: string;
  user_id: string | null;
  created_by: string;
  member_name: string;
  relationship: string | null;
  blueprint_kind: BlueprintKind;
  financial_urgency: string | null;
  long_term_vision: string | null;
  strengths: string[];
  technology_comfort: TechComfort;
  communication_style: string | null;
  daily_priorities: string[];
  money_moves_philosophy: string | null;
  business_vaults: string[];
  /** FRASS-0533 — recurring creative projects Frassy produces alongside them. */
  creative_projects: CreativeProject[];
  /** FRASS-0534 — pointers to the member's book projects (manuscript lives in legacy_publications). */
  legacy_publications: LegacyPublicationPointer[];
  learning_style: string | null;
  motivation_style: string | null;
  simplified_view: boolean;
  accessibility_notes: string | null;
  online_first: boolean;
  avoid: string[];
  hours_per_day: number | null;
  status: BlueprintStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
};


/** The thirteen things Frassy needs to know to serve someone well. */
export const BLUEPRINT_FIELDS = [
  { key: "member_name", label: "Who this person is", plain: "Their name and, in one line, who they are." },
  { key: "financial_urgency", label: "Their financial urgency", plain: "How badly income is needed right now." },
  { key: "long_term_vision", label: "Their long-term vision", plain: "Where they want to end up." },
  { key: "strengths", label: "Their strengths", plain: "What they're genuinely good at already." },
  { key: "technology_comfort", label: "Technology comfort", plain: "How much of the computer part Frassy should do." },
  { key: "communication_style", label: "Communication style", plain: "How they like to be spoken to." },
  { key: "daily_priorities", label: "Daily priorities", plain: "What their day should be built around." },
  { key: "money_moves_philosophy", label: "Money Moves philosophy", plain: "What kind of income fits their life." },
  { key: "business_vaults", label: "Business Vaults", plain: "Which trades or pathways apply to them." },
  { key: "creative_projects", label: "Creative projects", plain: "Recurring projects Frassy produces with them each week." },
  { key: "legacy_publications", label: "Book projects", plain: "Books Frassy is editing from their completed journeys (FRASS-0534)." },

  { key: "learning_style", label: "Learning style", plain: "How they take in something new." },
  { key: "motivation_style", label: "Motivation style", plain: "What keeps them going." },
  { key: "simplified_view", label: "Simplified View preference", plain: "Calm conversation, or full dashboards." },
  { key: "accessibility_notes", label: "Accessibility", plain: "Sight, hearing, hands, patience, language." },
] as const;

export const BLUEPRINT_KINDS: { id: BlueprintKind; label: string; plain: string }[] = [
  {
    id: "entrepreneurial",
    label: "Builder (Kanko blueprint)",
    plain: "Actively building toward financial independence.",
  },
  {
    id: "knowledge-economy",
    label: "Experience (Mother blueprint)",
    plain: "A lifetime of wisdom becoming income and legacy.",
  },
  {
    id: "tradesperson",
    label: "Trade (Tradesperson blueprint)",
    plain: "A skilled hand-trade turning experience into online income.",
  },
];

export const BLANK_BLUEPRINT: Omit<
  MemberBlueprint,
  "id" | "user_id" | "created_by" | "created_at" | "updated_at"
> = {
  member_name: "",
  relationship: null,
  blueprint_kind: "entrepreneurial",
  financial_urgency: null,
  long_term_vision: null,
  strengths: [],
  technology_comfort: "moderate",
  communication_style: null,
  daily_priorities: [],
  money_moves_philosophy: null,
  business_vaults: [],
  creative_projects: [],

  legacy_publications: [],
  learning_style: null,
  motivation_style: null,
  simplified_view: false,
  accessibility_notes: null,
  online_first: true,
  avoid: [],
  hours_per_day: null,
  status: "draft",
  notes: null,
};

/** Constitutional guarantees no Blueprint may override. */
export const BLUEPRINT_INVARIANTS = [
  "A Blueprint changes words, order and pace — never architecture (FRASS-0494).",
  "Every Blueprint inherits one of the founding blueprints; none invents a new one.",
  "Online-first (FRASS-0532-A) stays on unless the member asks for hands-on work.",
  "Security, legal and financial notices can never be hidden by a Blueprint.",
  "Simplified View changes presentation only — never capability (FRASS-0517).",
  "The member owns their Blueprint. They may read it, correct it and delete it.",
];

/** Turn a Blueprint into the instructions Frassy actually follows. */
export function blueprintToPrompt(b: MemberBlueprint): string {
  const list = (label: string, xs: string[]) =>
    xs.length ? `${label}: ${xs.join(" · ")}` : null;
  const lines = [
    `MEMBER SUCCESS BLUEPRINT — ${b.member_name}${b.relationship ? ` (${b.relationship})` : ""}`,
    `Foundation: ${BLUEPRINT_KINDS.find((k) => k.id === b.blueprint_kind)?.label ?? b.blueprint_kind}.`,
    b.financial_urgency ? `Financial urgency: ${b.financial_urgency}` : null,
    b.long_term_vision ? `Long-term vision: ${b.long_term_vision}` : null,
    list("Strengths", b.strengths),
    `Technology comfort: ${b.technology_comfort}${
      b.technology_comfort === "low" ? " — do the computer work for them, always." : ""
    }`,
    b.communication_style ? `Speak to them like this: ${b.communication_style}` : null,
    list("Build the day around", b.daily_priorities),
    b.money_moves_philosophy ? `Money Moves philosophy: ${b.money_moves_philosophy}` : null,
    list("Business Vaults", b.business_vaults),
    // FRASS-0533 — recurring creative projects. Frassy is the production
    // partner; the member always remains the creator.
    (b.creative_projects ?? []).length
      ? "Creative projects (ask about these every week, by name):\n" +
        (b.creative_projects ?? [])
          .map((p) =>
            [
              `· ${p.name}${p.status ? ` — ${p.status}` : ""}${p.cadence ? ` (${p.cadence})` : ""}`,
              p.current_episode ? `  current: ${p.current_episode}` : null,
              p.script_status ? `  script: ${p.script_status}` : null,
              p.production_status ? `  production: ${p.production_status}` : null,
              p.upload_status ? `  upload: ${p.upload_status}` : null,
              p.publish_date ? `  publishing: ${p.publish_date}` : null,
              p.notes ? `  notes: ${p.notes}` : null,
            ]
              .filter(Boolean)
              .join("\n"),
          )
          .join("\n") +
        "\nYou are their creative producer: brainstorm, script, jokes, storytelling, continuity, production " +
        "tracking, publishing schedule, titles, descriptions, thumbnails, keywords and monetization progress. " +
        "They remain the creator — never take the creative decision away from them."
      : null,

    // FRASS-0534 — book projects. Frassy is the editor, never the author; the
    // member reviews and approves every draft. The manuscript lives in
    // legacy_publications; this is just so Frassy knows the book exists.
    (b.legacy_publications ?? []).length
      ? "Book projects (FRASS-0534):\n" +
        (b.legacy_publications ?? [])
          .map(
            (p) =>
              `· ${p.title} (${p.kind === "republish" ? "republishing" : "new book"}${
                p.status ? `, ${p.status}` : ""
              })`,
          )
          .join("\n") +
        "\nYou are the editor, never the author. Improve clarity, organise chapters, write introductions and " +
        "summaries, format consistently — but the voice is always theirs. They review and approve every draft."
      : null,

    b.learning_style ? `Learning style: ${b.learning_style}` : null,
    b.motivation_style ? `Motivation: ${b.motivation_style}` : null,
    b.hours_per_day != null ? `Available time: about ${b.hours_per_day} hours a day. Never plan more.` : null,
    b.simplified_view ? "Simplified View is their default: voice, big text, one task, Approve / Next." : null,
    b.accessibility_notes ? `Accessibility: ${b.accessibility_notes}` : null,
    b.online_first
      ? "ONLINE-FIRST (FRASS-0532-A): recommend scalable online income first; hands-on work only if they ask."
      : "This member has chosen hands-on and local work; support it without arguing.",
    list("Never recommend", b.avoid),
    b.notes ? `Notes: ${b.notes}` : null,
  ].filter(Boolean);
  return lines.join("\n");
}

/** Everything Frassy still needs before the Blueprint can go live. */
export function blueprintGaps(b: MemberBlueprint): string[] {
  const gaps: string[] = [];
  if (!b.financial_urgency) gaps.push("How urgently they need income");
  if (!b.long_term_vision) gaps.push("Where they want to end up");
  if (b.strengths.length === 0) gaps.push("What they're already good at");
  if (b.daily_priorities.length === 0) gaps.push("What their day should be built around");
  if (!b.communication_style) gaps.push("How they like to be spoken to");
  if (b.hours_per_day == null) gaps.push("How many hours a day they actually have");
  return gaps;
}

export function blueprintCompleteness(b: MemberBlueprint): number {
  const total = 6;
  return Math.round(((total - blueprintGaps(b).length) / total) * 100);
}

/**
 * Supabase returns JSON columns (creative_projects, legacy_publications) as
 * opaque `Json`. This normaliser casts them back to their typed shapes so the
 * rest of the app can use them safely. It is the single place that knows the
 * DB row is not yet a clean MemberBlueprint.
 */
export function normalizeBlueprint(row: Record<string, unknown>): MemberBlueprint {
  const r = row as Record<string, unknown>;
  return {
    ...(r as unknown as Omit<
      MemberBlueprint,
      "creative_projects" | "legacy_publications" | "business_vaults" | "strengths" | "daily_priorities" | "avoid"
    >),
    creative_projects: Array.isArray(r.creative_projects)
      ? (r.creative_projects as CreativeProject[])
      : [],
    legacy_publications: Array.isArray(r.legacy_publications)
      ? (r.legacy_publications as LegacyPublicationPointer[])
      : [],
    business_vaults: Array.isArray(r.business_vaults) ? (r.business_vaults as string[]) : [],
    strengths: Array.isArray(r.strengths) ? (r.strengths as string[]) : [],
    daily_priorities: Array.isArray(r.daily_priorities) ? (r.daily_priorities as string[]) : [],
    avoid: Array.isArray(r.avoid) ? (r.avoid as string[]) : [],
  };
}
