// FRASS-0450 Amendment 4 — the Platform Audit tab.
//
// The Financial Audit asks "do the numbers add up?". This asks "is the thing
// the numbers run on healthy?". Honest by construction: a check is only green
// when a real signal says so. Anything unverified reads grey and says how to
// verify it — never green by assumption.

import { STATUS_DOT, type StatusLevel } from "@/lib/platform-status";
import { BLUEPRINT_COMPONENTS } from "@/lib/construction/blueprint-registry";

export { STATUS_DOT };

export type PlatformAuditCheck = {
  id: string;
  label: string;
  level: StatusLevel;
  detail: string;
  /** Plain English, always. */
  plain: string;
  source: string;
  to?: string;
};

export type PlatformAuditInputs = {
  online: boolean;
  brokenLinks: number | null;
  deadRoutes: number | null;
  scannedPages: number | null;
  linkCheckedAt: string | null;
  securityFindings: number | null;
  creditBalance: number | null;
};

const UNVERIFIED = "Not verified — no live signal is connected yet.";

function missingSpecs(): number {
  return BLUEPRINT_COMPONENTS.filter((c) => !c.specification || c.specification === "—").length;
}

export function platformAudit(input: PlatformAuditInputs): PlatformAuditCheck[] {
  const linkLevel: StatusLevel =
    input.brokenLinks === null ? "unknown" : input.brokenLinks === 0 ? "green" : input.brokenLinks > 5 ? "red" : "orange";
  const routeLevel: StatusLevel =
    input.deadRoutes === null ? "unknown" : input.deadRoutes === 0 ? "green" : "orange";
  const specs = missingSpecs();

  return [
    {
      id: "stability",
      label: "Platform Stability",
      level: input.online ? "green" : "red",
      detail: input.online ? "The app is serving this session." : "The app is not responding.",
      plain: "The doors are open and people can walk in.",
      source: "This session is being served by the live app",
      to: "/",
    },
    {
      id: "security",
      label: "Security Status",
      level:
        input.securityFindings === null
          ? "unknown"
          : input.securityFindings === 0
            ? "green"
            : "orange",
      detail:
        input.securityFindings === null
          ? UNVERIFIED
          : `${input.securityFindings} finding${input.securityFindings === 1 ? "" : "s"} recorded as open.`,
      plain: "Whether anyone has found a way in that we haven't closed.",
      source: "Founder-recorded security review log (FRASS-0449)",
    },
    {
      id: "performance",
      label: "Performance",
      level: "unknown",
      detail: UNVERIFIED,
      plain: "How fast pages feel to somebody on an ordinary phone.",
      source: "No performance monitor connected yet",
    },
    {
      id: "links",
      label: "Broken Links",
      level: linkLevel,
      detail:
        input.brokenLinks === null
          ? "No crawl has been run in this session."
          : `${input.brokenLinks} broken across ${input.scannedPages ?? 0} pages${
              input.linkCheckedAt ? ` · ${new Date(input.linkCheckedAt).toLocaleString()}` : ""
            }.`,
      plain: "Doors in the building that open onto nothing.",
      source: "Link check crawl",
      to: "/admin/link-check",
    },
    {
      id: "routes",
      label: "Dead Routes",
      level: routeLevel,
      detail:
        input.deadRoutes === null
          ? "No crawl has been run in this session."
          : `${input.deadRoutes} internal address${input.deadRoutes === 1 ? "" : "es"} returned an error.`,
      plain: "Rooms that exist on the map but not in the building.",
      source: "Link check crawl (internal addresses only)",
      to: "/admin/link-check",
    },
    {
      id: "duplicates",
      label: "Duplicate Components",
      level: "unknown",
      detail: UNVERIFIED,
      plain: "Two things doing the same job, which is how a platform gets confusing.",
      source: "Consolidation audit — reviewed by hand (FRASS-0442)",
    },
    {
      id: "specs",
      label: "Missing Founder Specifications",
      level: specs === 0 ? "green" : "orange",
      detail:
        specs === 0
          ? `Every one of the ${BLUEPRINT_COMPONENTS.length} registry components cites a specification.`
          : `${specs} registry component${specs === 1 ? "" : "s"} have no specification recorded.`,
      plain: "Nothing was built without you saying what it was for.",
      source: "Blueprint registry",
    },
    {
      id: "accessibility",
      label: "Accessibility",
      level: "unknown",
      detail: UNVERIFIED,
      plain: "Whether somebody using a screen reader or keyboard can still use Frass.",
      source: "No accessibility audit connected yet",
    },
    {
      id: "mobile",
      label: "Mobile Health",
      level: "unknown",
      detail: UNVERIFIED,
      plain: "Whether the phone experience is as good as the desktop one.",
      source: "No mobile monitor connected yet",
    },
    {
      id: "build",
      label: "Build Status",
      level: input.online ? "green" : "unknown",
      detail: input.online
        ? "The current build compiled and is being served."
        : "Cannot confirm the current build.",
      plain: "The latest version actually made it out of the workshop.",
      source: "This session is running the current build",
    },
    {
      id: "route-health",
      label: "Route Health",
      level: routeLevel,
      detail:
        input.scannedPages === null
          ? "No crawl has been run in this session."
          : `${input.scannedPages} pages reachable from the front door.`,
      plain: "Every place can be reached by walking, not just by typing an address.",
      source: "Link check crawl",
      to: "/admin/link-check",
    },
    {
      id: "navigation",
      label: "Navigation Consistency",
      level: "unknown",
      detail: "Trails and back arrows are present platform-wide; not machine-verified.",
      plain: "You can always find your way home from anywhere.",
      source: "Frass Trail component, reviewed by hand",
    },
    {
      id: "images",
      label: "Image Optimization",
      level: "unknown",
      detail: UNVERIFIED,
      plain: "Big pictures made small enough that pages still load fast.",
      source: "No asset audit connected yet",
      to: "/admin/images",
    },
    {
      id: "storage",
      label: "Storage Usage",
      level: "unknown",
      detail: UNVERIFIED,
      plain: "How much room the uploads and media are taking up.",
      source: "No storage meter connected yet",
    },
    {
      id: "ai-credits",
      label: "AI Credit Usage",
      level:
        input.creditBalance === null
          ? "unknown"
          : input.creditBalance <= 25
            ? "red"
            : input.creditBalance <= 100
              ? "orange"
              : "green",
      detail:
        input.creditBalance === null
          ? "No balance recorded."
          : `${input.creditBalance} recorded on the founder ledger.`,
      plain: "The fuel Frassy and the studios run on.",
      source: "Founder-recorded balance",
      to: "/admin/ai-credits",
    },
  ];
}

export function platformAuditHeadline(rows: PlatformAuditCheck[]): string {
  const red = rows.filter((r) => r.level === "red").length;
  const watch = rows.filter((r) => r.level === "orange" || r.level === "amber").length;
  const unknown = rows.filter((r) => r.level === "unknown").length;
  if (red) return `${red} check${red > 1 ? "s" : ""} need immediate attention.`;
  if (watch) return `${watch} check${watch > 1 ? "s" : ""} worth a look.`;
  return `Everything verified is healthy · ${unknown} check${unknown === 1 ? "" : "s"} not connected to a live signal yet.`;
}
