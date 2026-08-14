// FRASS-0539 — AI Approval Rule (Constitutional Amendment, P0).
//
// Frassy may look at anything. She may change nothing on her own.
//
//   read   → she may act automatically.
//   write  → she must prepare the change, show it, and wait for the Founder.
//   delete → she must ask, and the Founder must confirm a second time.
//
// This module is the single place that decides which of the three an action is,
// so no surface can quietly grant Frassy more authority than the Constitution
// gives her.

export type AiActionKind = "read" | "write" | "delete";

export type AiApprovalPolicy = {
  kind: AiActionKind;
  /** May Frassy carry this out with no Founder involvement? */
  autoAllowed: boolean;
  /** Must the Founder see the exact change before it is applied? */
  requiresPreview: boolean;
  /** Must the Founder confirm a second time (delete only)? */
  requiresConfirmation: boolean;
  /** everyday language, shown to the Founder. */
  plain: string;
};

export function approvalPolicy(kind: AiActionKind): AiApprovalPolicy {
  if (kind === "read")
    return {
      kind,
      autoAllowed: true,
      requiresPreview: false,
      requiresConfirmation: false,
      plain: "Frassy can look at this on her own. Nothing changes.",
    };
  if (kind === "write")
    return {
      kind,
      autoAllowed: false,
      requiresPreview: true,
      requiresConfirmation: false,
      plain: "Frassy prepares the change and shows it to you. Nothing is applied until you approve.",
    };
  return {
    kind,
    autoAllowed: false,
    requiresPreview: true,
    requiresConfirmation: true,
    plain: "Deleting always needs your approval and a second confirmation. Nothing is removed quietly.",
  };
}

/** A change Frassy has prepared but has not applied. */
export type AiProposal = {
  id: string;
  kind: AiActionKind;
  /** What the change touches, in the Founder's language. */
  target: string;
  /** One sentence: what Frassy wants to do. */
  summary: string;
  /** What it looks like now, and what it would look like. */
  before?: string;
  after?: string;
  createdAt: string;
};

export function proposalQuestion(p: AiProposal): string {
  if (p.kind === "delete") return `I've prepared to remove ${p.target}. Would you like me to delete it?`;
  if (p.kind === "write") return `I've prepared an updated ${p.target}. Would you like to apply it?`;
  return `I've reviewed ${p.target}.`;
}

/** Guard for any code path that is about to let Frassy act. */
export function assertAiActionAllowed(kind: AiActionKind, founderApproved: boolean, confirmed = false) {
  const policy = approvalPolicy(kind);
  if (policy.autoAllowed) return;
  if (!founderApproved) throw new Error("FRASS-0539: this change needs Founder approval before it is applied.");
  if (policy.requiresConfirmation && !confirmed)
    throw new Error("FRASS-0539: deleting needs a second confirmation from the Founder.");
}
