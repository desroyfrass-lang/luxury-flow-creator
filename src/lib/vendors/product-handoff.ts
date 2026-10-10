// P2-0 shared product handoff: a read-only contract built only from saved
// records. Future Capsules / Try-On / FV Studios steps consume it; nothing here
// writes, publishes, generates or charges.
import { classificationBreadcrumb } from "@/lib/taxonomy/hierarchy";
import { groupVisualVariants } from "./variant-selection";

export type HandoffProductRow = {
  id: string; title: string; category_key: string | null; draft_status: string;
  publication_status: string; vendor_id: string; vendor_owner_id: string | null;
};
export type HandoffVariantRow = {
  id: string; product_id: string; source_variant_ref: string; sku: string | null;
  option_label: string | null; image_url: string | null;
};
export type ProductHandoff = {
  productId: string; name: string; categoryKey: string; categoryPath: string;
  variant: { id: string; sourceVariantRef: string; sku: string | null; label: string | null; colour: string; size: string | null };
  photo: { url: string; source: "supplier_variant" } | { url: null; reason: string };
  status: { draft: string; publication: string };
};

export function buildProductHandoff(
  caller: { userId: string; isFounderStaff: boolean },
  product: HandoffProductRow | null,
  variant: HandoffVariantRow | null,
): ProductHandoff {
  if (!product) throw new Error("Product not found or not available to you.");
  if (!caller.isFounderStaff && product.vendor_owner_id !== caller.userId) throw new Error("Only the Founder or the brand owner can use this product.");
  if (product.publication_status !== "unpublished") throw new Error("Handoff is for private drafts only.");
  if (product.draft_status === "rejected") throw new Error("Rejected products cannot be handed off.");
  if (!product.category_key) throw new Error("Product has no saved category.");
  if (!variant || variant.product_id !== product.id) throw new Error("That colour/size does not belong to this product.");
  const g = groupVisualVariants([{ ref: variant.source_variant_ref, sku: variant.sku, label: variant.option_label, image: variant.image_url }])[0]!;
  const v = g.variants[0]!;
  return {
    productId: product.id, name: product.title, categoryKey: product.category_key,
    categoryPath: classificationBreadcrumb(product.category_key),
    variant: { id: variant.id, sourceVariantRef: variant.source_variant_ref, sku: variant.sku, label: variant.option_label, colour: g.colour, size: v.size },
    photo: v.image ? { url: v.image, source: "supplier_variant" } : { url: null, reason: "No authentic photo is linked to this variant." },
    status: { draft: product.draft_status, publication: product.publication_status },
  };
}
