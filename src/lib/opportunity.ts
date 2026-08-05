// Client-safe constants for the Opportunity Center.

export const OPPORTUNITY_KINDS = [
  { value: "idea", label: "Product idea" },
  { value: "client", label: "Client / customer" },
  { value: "partnership", label: "Partnership" },
  { value: "collab", label: "Collaboration" },
  { value: "grant", label: "Grant / funding" },
  { value: "channel", label: "New channel" },
  { value: "other", label: "Other" },
] as const;

export const OPPORTUNITY_STAGES = [
  { value: "spotted", label: "Spotted", blurb: "You noticed it. Nothing done yet." },
  { value: "exploring", label: "Exploring", blurb: "You're looking into whether it's real." },
  { value: "building", label: "Building", blurb: "You're doing the work to make it happen." },
  { value: "pitching", label: "Pitching", blurb: "It's in front of someone who can say yes." },
  { value: "won", label: "Won", blurb: "It happened." },
  { value: "parked", label: "Parked", blurb: "Not now — kept for later." },
] as const;

export const EFFORT_LEVELS = [
  { value: "low", label: "Light lift" },
  { value: "medium", label: "Real work" },
  { value: "high", label: "Heavy lift" },
] as const;

export const FINANCE_CATEGORIES = [
  "Sales",
  "Commissions",
  "Materials",
  "Production",
  "Marketing",
  "Tools",
  "Shipping",
  "Other",
];

export function stageLabel(value: string) {
  return OPPORTUNITY_STAGES.find((s) => s.value === value)?.label ?? value;
}

export function kindLabel(value: string) {
  return OPPORTUNITY_KINDS.find((k) => k.value === value)?.label ?? value;
}

export function money(amount: number, currency = "USD") {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${Math.round(amount)}`;
  }
}
