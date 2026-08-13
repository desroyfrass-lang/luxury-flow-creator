// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0520 — Founder Design Authority. Natural-language platform editing,
// inside strict constitutional boundaries.
//
// The Founder describes a visual change in plain words. Frassy prepares it,
// previews it, and only applies it on approval. Nothing here can reach source
// code, security policy, authentication, financial logic, the database,
// permissions, constitutional rules or a production deployment.
// ─────────────────────────────────────────────────────────────────────────────

export type DesignSurface = "daily" | "view-mode" | "navigation" | "labels" | "unknown";

export type DesignChangeType =
  | "layout"
  | "position"
  | "spacing"
  | "visibility"
  | "navigation"
  | "label"
  | "icon"
  | "order"
  | "theme"
  | "page-organization"
  | "default-view";

export const DESIGN_AUTHORITY_MAY = [
  "Layout",
  "Component positioning",
  "Navigation arrangement",
  "Typography (within the design system)",
  "Colours (within the design system)",
  "Spacing",
  "Visibility",
  "Labels and icons",
  "Default view modes",
] as const;

export const DESIGN_AUTHORITY_MAY_NEVER = [
  "Source code",
  "Security policies",
  "Authentication",
  "Financial logic",
  "Database structure",
  "Constitutional rules",
  "User permissions",
  "Production deployments",
] as const;

export type DesignProposal = {
  allowed: boolean;
  surface: DesignSurface;
  changeType: DesignChangeType | null;
  /** Plain English of what will happen. Always shown before anything is applied. */
  plain: string;
  /** Why Frassy refused, when she did. */
  refusal: string | null;
};

const FORBIDDEN: Array<{ any: RegExp; reason: string }> = [
  { any: /\b(source ?code|deploy|publish to production|ship it live|edit the code|write code)\b/i, reason: "Source code and deployments go through the engineering workflow." },
  { any: /\b(security polic|rls|row level|encryption|fraud rule)\b/i, reason: "Security policy is never edited from the interface." },
  { any: /\b(auth|authentication|sign ?in|password|passkey|session)\b/i, reason: "Authentication is never edited from the interface." },
  { any: /\b(payout|commission|price|pricing logic|refund|invoice|tax rule|financial logic)\b/i, reason: "Financial logic must stay server-derived." },
  { any: /\b(database|table|column|schema|migration)\b/i, reason: "Database structure requires engineering." },
  { any: /\b(constitution|amendment|principle)\b/i, reason: "Constitutional rules change by amendment, not by editing." },
  { any: /\b(permission|role|admin access|grant access)\b/i, reason: "Permissions are never edited from the interface." },
];

const TYPES: Array<{ any: RegExp; type: DesignChangeType }> = [
  { any: /\b(hide|show|reveal|collapse|visib)/i, type: "visibility" },
  { any: /\b(move|above|below|top|bottom|cent(er|re)|left|right)\b/i, type: "position" },
  { any: /\b(reorder|swap|order|first|last|before|after)\b/i, type: "order" },
  { any: /\b(rename|call it|label|title it)\b/i, type: "label" },
  { any: /\b(icon)\b/i, type: "icon" },
  { any: /\b(spacing|padding|tighter|looser|breathing room|bigger|larger|smaller|wider|narrower)\b/i, type: "spacing" },
  { any: /\b(colou?r|theme|dark|light|font|typography)\b/i, type: "theme" },
  { any: /\b(simplified|simple version|standard view|default view)\b/i, type: "default-view" },
  { any: /\b(navigation|nav bar|menu)\b/i, type: "navigation" },
  { any: /\b(cluttered|busy|simpler|cleaner|organi[sz])\b/i, type: "page-organization" },
  { any: /\b(layout|arrange|rearrange)\b/i, type: "layout" },
];

function surfaceOf(text: string): DesignSurface {
  if (/\b(simplified|standard view|default view|view mode)\b/i.test(text)) return "view-mode";
  if (/\b(nav|navigation|menu|tab)\b/i.test(text)) return "navigation";
  if (/\b(rename|call it|label)\b/i.test(text)) return "labels";
  if (/\b(daily|dashboard|card|section|panel|page)\b/i.test(text)) return "daily";
  return "unknown";
}

/**
 * Decide whether a spoken Founder instruction is inside Design Authority.
 * Refusals are always explained; they are never silent.
 */
export function proposeDesignChange(instruction: string): DesignProposal {
  const text = instruction.trim();
  const blocked = FORBIDDEN.find((f) => f.any.test(text));
  if (blocked) {
    return {
      allowed: false,
      surface: "unknown",
      changeType: null,
      plain: "That one goes to engineering, not to me.",
      refusal: blocked.reason,
    };
  }
  const type = TYPES.find((t) => t.any.test(text))?.type ?? null;
  if (!type) {
    return {
      allowed: false,
      surface: surfaceOf(text),
      changeType: null,
      plain: "I couldn't tell which part of the interface you meant.",
      refusal: "Tell me the section and what should change — move it, hide it, rename it, or make it simpler.",
    };
  }
  return {
    allowed: true,
    surface: surfaceOf(text),
    changeType: type,
    plain: `I've prepared a ${type.replace("-", " ")} change. Preview it before I apply it?`,
    refusal: null,
  };
}

/** The Design Studio phrases the Founder can point-and-say. */
export const DESIGN_STUDIO_EXAMPLES = [
  "Move this card below the title.",
  "Hide this section.",
  "Rename this section to Business Builder.",
  "Swap these two.",
  "This feels too busy.",
  "Make this simpler.",
  "Show the simplified version by default.",
] as const;
