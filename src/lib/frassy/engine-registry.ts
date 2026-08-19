// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0572 — One Frassy intelligence layer, many modes.
//
// There is ONE Frassy. What changes from place to place is her *mode*, never
// her brain. This file is the authoritative register of every surface that can
// invoke her, which conversation pipeline that surface uses, and which mode she
// is expected to operate in there.
//
// Plain English: this is the switchboard diagram. It shows every phone in the
// building and which line it is plugged into, so we can never again "fix" one
// line while the Founder is talking on another.
//
// RULES (constitutional):
//   1. Only two pipelines may exist:
//        · "shared"  — /api/chat (src/routes/api/chat.ts). The default.
//        · "journey" — the stage-driven onboarding workflow
//                      (src/lib/journey.functions.ts). Journey Mode ONLY.
//   2. The Journey pipeline may never conduct a Teleporter audit, and may never
//      replay audit history. Audits belong to Teleporter Audit Mode on the
//      shared pipeline.
//   3. No third pipeline may be created. New surfaces pick a mode, not an engine.
// ─────────────────────────────────────────────────────────────────────────────

export type FrassyMode =
  | "journey" // first-time orientation and commissioning stages
  | "founder" // platform operations, Control Room
  | "audit" // Teleporter card review (founder, path-authoritative)
  | "builder" // daily workspace, business building
  | "customer"; // storefront, shopping, public surfaces

export type FrassyPipeline = "shared" | "journey";

export type FrassyEntryPoint = {
  surface: string;
  pipeline: FrassyPipeline;
  mode: FrassyMode;
  /** Where the conversation history for this surface lives. */
  memory: "shared_transcript" | "builder_journey_messages" | "clean_room";
  note: string;
};

/** Every place in Frass that can start a conversation with Frassy. */
export const FRASSY_ENTRY_POINTS: FrassyEntryPoint[] = [
  {
    surface: "/onboarding (Welcome Hall journey)",
    pipeline: "journey",
    mode: "journey",
    memory: "builder_journey_messages",
    note: "Stage-driven orientation. Never audits, never reviews Teleporter cards.",
  },
  {
    surface: "/control-room (Founder Control Room)",
    pipeline: "shared",
    mode: "founder",
    memory: "shared_transcript",
    note: "Platform operations, security, telemetry. Founder only.",
  },
  {
    surface: "World Teleporter card review (any inspected route)",
    pipeline: "shared",
    mode: "audit",
    memory: "clean_room",
    note: "Card resolved from the current path; zero prior turns are sent.",
  },
  {
    surface: "/room, /workspace/* (Builder Hall)",
    pipeline: "shared",
    mode: "builder",
    memory: "shared_transcript",
    note: "Workspace room renders the shared composer against /api/chat.",
  },
  {
    surface: "/daily (The Frass Daily)",
    pipeline: "shared",
    mode: "builder",
    memory: "shared_transcript",
    note: "Executive assistant mode over the shared pipeline.",
  },
  {
    surface: "Floating beacon (storefront, marketplace, card, public pages)",
    pipeline: "shared",
    mode: "customer",
    memory: "shared_transcript",
    note: "Surface rules in src/lib/frassy/surfaces.ts decide beacon vs silence.",
  },
];

const JOURNEY_PREFIXES = ["/onboarding"];

/** Which mode should Frassy operate in on this path (before audit overrides)? */
export function frassyPipelineFor(pathname: string): FrassyPipeline {
  return JOURNEY_PREFIXES.some((p) => pathname.startsWith(p)) ? "journey" : "shared";
}

/**
 * A Teleporter audit is never a Journey conversation. If an audit card is active
 * while the Founder stands on a Journey surface, the audit does not happen here.
 */
export function auditAllowedOn(pathname: string): boolean {
  return frassyPipelineFor(pathname) === "shared";
}

/** Does this text look like a Teleporter audit turn from some other card? */
export function isTeleporterAuditTurn(content: string): boolean {
  return /visual verification\s*:\s*card|ready for card|teleporter card|card\s*#\s*\d{1,3}/i.test(
    content,
  );
}
