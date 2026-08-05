// Client-safe Creation District definitions.

export const PRODUCT_STATUSES = [
  { id: "draft", label: "Draft" },
  { id: "ready", label: "Ready" },
  { id: "published", label: "Published" },
] as const;

export const DROP_STATUSES = [
  { id: "planned", label: "Planned" },
  { id: "scheduled", label: "Scheduled" },
  { id: "live", label: "Live" },
  { id: "archived", label: "Archived" },
] as const;

export function statusLabel(
  list: readonly { id: string; label: string }[],
  id: string,
): string {
  return list.find((s) => s.id === id)?.label ?? id;
}
