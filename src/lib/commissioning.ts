// The Founder Commissioning model — phases and the Launch Readiness board.
// Client-safe: shared by the commissioning journey UI and Founder Mode.

import { OWNER_STAGES, type JourneyStage } from "@/lib/journey";
import { DISTRICTS } from "@/lib/districts";

export type ReadinessState = "complete" | "in_progress" | "not_started";

export type CommissioningPhase = {
  /** Chapter label used on the stages, e.g. "Phase 1 · Platform Identity". */
  chapter: string;
  number: number;
  name: string;
  stages: JourneyStage[];
};

export const COMMISSIONING_PHASES: CommissioningPhase[] = (() => {
  const seen: string[] = [];
  for (const s of OWNER_STAGES) if (!seen.includes(s.chapter)) seen.push(s.chapter);
  return seen.map((chapter, i) => ({
    chapter,
    number: i + 1,
    name: chapter.split("·").slice(-1)[0].trim(),
    stages: OWNER_STAGES.filter((s) => s.chapter === chapter),
  }));
})();

export type ReadinessItem = {
  id: string;
  label: string;
  /** Everyday-language note about what "complete" means here. */
  note: string;
  /** Commissioning stages that settle this item. */
  stageIds?: string[];
  /** District whose build status also gates this item. */
  districtId?: string;
};

export const READINESS_ITEMS: ReadinessItem[] = [
  {
    id: "brand_identity",
    label: "Brand Identity",
    note: "Name, mission, vision, values, voice, and Founder profile are settled.",
    stageIds: [
      "op_brand_name",
      "op_mission",
      "op_vision",
      "op_values",
      "op_voice",
      "op_founder_profile",
    ],
  },
  {
    id: "storefront",
    label: "Storefront",
    note: "Products, collections, pricing, payments, shipping, policies, taxes.",
    stageIds: [
      "op_products",
      "op_collections",
      "op_pricing",
      "op_payments",
      "op_shipping",
      "op_policies",
      "op_taxes",
    ],
  },
  {
    id: "builder_journey",
    label: "Builder Journey",
    note: "The journey every Builder takes has been reviewed and approved.",
    stageIds: ["op_builder_journey"],
  },
  {
    id: "welcome_hall",
    label: "Welcome Hall",
    note: "What greets a Builder on arrival is configured.",
    stageIds: ["op_welcome_hall"],
    districtId: "welcome_hall",
  },
  {
    id: "builder_vault",
    label: "Builder Vault",
    note: "Vault defaults, privacy, and starting collections are set.",
    stageIds: ["op_vault_defaults"],
    districtId: "vault",
  },
  {
    id: "creation",
    label: "Creation District",
    note: "Builders can create products, collections, and drops.",
    districtId: "creation",
  },
  {
    id: "opportunity",
    label: "Opportunity Center",
    note: "Builders can track opportunities and money in and out.",
    districtId: "opportunity",
  },
  {
    id: "academy",
    label: "Academy",
    note: "Builder Paths and Passport are configured and the campus is open.",
    stageIds: ["op_builder_paths", "op_passport"],
    districtId: "academy",
  },
  {
    id: "marketplace",
    label: "Marketplace",
    note: "Selling rules, fees, reputation, and disputes are decided.",
    stageIds: ["op_marketplace"],
    districtId: "marketplace",
  },
  {
    id: "community",
    label: "Community",
    note: "Posting, moderation, and collaboration standards are set.",
    stageIds: ["op_community"],
    districtId: "community",
  },
  {
    id: "foundation",
    label: "Foundation",
    note: "Causes, contribution, and impact reporting are defined.",
    stageIds: ["op_foundation"],
    districtId: "foundation",
  },
  {
    id: "executive",
    label: "Executive Tower",
    note: "Governance and institutional memory are in place.",
    districtId: "executive",
  },
  {
    id: "frassy",
    label: "Frassy",
    note: "Voice, guidance boundaries, and hand-off rules are configured.",
    stageIds: ["op_voice", "op_frassy_config"],
  },
  {
    id: "ai_memory",
    label: "AI Memory",
    note: "What Frassy remembers, and the privacy defaults around it.",
    stageIds: ["op_vault_defaults", "op_frassy_config"],
  },
  {
    id: "security",
    label: "Security",
    note: "Access, roles, logging, and recovery have been reviewed.",
    stageIds: ["op_roles", "op_security"],
  },
  {
    id: "domain",
    label: "Domain",
    note: "The platform answers on its own domain, live and secure.",
    stageIds: ["op_launch"],
  },
  {
    id: "analytics",
    label: "Analytics",
    note: "You can see what happens after launch and what to watch.",
    stageIds: ["op_notifications", "op_launch"],
  },
];

function districtState(id: string): ReadinessState | null {
  const d = DISTRICTS.find((x) => x.id === id);
  if (!d) return null;
  if (d.status === "open") return "complete";
  if (d.status === "building") return "in_progress";
  return "not_started";
}

export function readinessFor(
  item: ReadinessItem,
  completedStageIds: string[],
): ReadinessState {
  const states: ReadinessState[] = [];

  if (item.stageIds?.length) {
    const done = item.stageIds.filter((id) => completedStageIds.includes(id)).length;
    states.push(
      done === item.stageIds.length
        ? "complete"
        : done > 0
          ? "in_progress"
          : "not_started",
    );
  }

  if (item.districtId) {
    const d = districtState(item.districtId);
    if (d) states.push(d);
  }

  if (!states.length) return "not_started";
  if (states.every((s) => s === "complete")) return "complete";
  if (states.some((s) => s !== "not_started")) return "in_progress";
  return "not_started";
}

export type ReadinessRow = ReadinessItem & { state: ReadinessState };

export function readinessBoard(completedStageIds: string[]): ReadinessRow[] {
  return READINESS_ITEMS.map((item) => ({
    ...item,
    state: readinessFor(item, completedStageIds),
  }));
}

export function isCommissioned(rows: ReadinessRow[]): boolean {
  return rows.every((r) => r.state === "complete");
}

export const READINESS_LABEL: Record<ReadinessState, string> = {
  complete: "Complete",
  in_progress: "In Progress",
  not_started: "Not Started",
};
