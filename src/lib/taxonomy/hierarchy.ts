import { TAXONOMY, PRIMARY_STORES, type TaxonomyNode } from "./registry";

/** Presentation paths derived only from the existing registry, never new categories. */
export function taxonomyPath(node: TaxonomyNode) {
  const department = PRIMARY_STORES.find((s) => s.id === node.store)?.title ?? node.store;
  const handle = node.handle ?? node.key;
  const audience = /(?:womens|women)(?:-|\/|$)/.test(handle) ? "Women"
    : /(?:mens|men)(?:-|\/|$)/.test(handle) ? "Men"
    : node.store === "kids" ? (handle.match(/^kids-(.+?)-(?:school|casual|party|street|vacay|sport|kicks|bare|extra|crown)-/)?.[1] ?? "Children").replaceAll("-", " ")
    : "All audiences";
  const parts = node.title.split(" — ");
  let collection = parts.length > 1 ? parts[0] : node.title;
  if (node.store === "luxury-house") collection = "Luxury House";
  const subcategory = parts.length > 1 ? parts.slice(1).join(" — ") : node.title;
  return { department, audience, collection, subcategory };
}

export const TAXONOMY_PATHS = TAXONOMY.map((node) => ({ node, ...taxonomyPath(node) }));

export function classificationBreadcrumb(categoryKey: string | null) {
  const entry = TAXONOMY_PATHS.find((p) => p.node.key === categoryKey);
  return entry ? [entry.department, entry.audience, entry.collection, entry.subcategory]
    .filter((part, index, all) => index === 0 || part !== all[index - 1]).join(" → ") : categoryKey ?? "No category";
}