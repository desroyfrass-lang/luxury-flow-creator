// F1 Fashion Studio: honest section map and role-aware visibility.
// Only Founder/admin can enter today (parent /studios gate). Member roles are
// declared so future isolation has one place to grow; none are opened yet.

export type FashionStudioRole = "founder" | "admin" | "designer" | "brand" | "stylist";
/** Roles allowed into the room in F1. Members are intentionally absent. */
export const FASHION_STUDIO_OPEN_ROLES: readonly FashionStudioRole[] = ["founder", "admin"];

export type FashionSection = {
  id: string;
  title: string;
  plain: string;
  status: "connected" | "not_connected";
  /** Existing working destination, only when it genuinely works today. */
  link?: { to: "/studios/assets" | "/studios/review" | "/workspace/merch" | "/workspace/vendors" | "/admin/capsules"; label: string };
  blocker?: string;
};

export const FASHION_SECTIONS: readonly FashionSection[] = [
  { id: "designs", title: "Designs & Artwork", plain: "Slogans, logos and artwork Frass owns.", status: "connected", link: { to: "/workspace/merch", label: "Open Merchandise Studio (slogans & logos)" } },
  { id: "specs", title: "Garment Specs", plain: "Measurements, fabrics and construction notes.", status: "not_connected", blocker: "No spec record exists yet (planned F2)." },
  { id: "mockups", title: "Mockups", plain: "Pictures of a design on a garment. A mockup is not a sample.", status: "not_connected", blocker: "Mockups are not linked to products yet. Studio assets can be browsed separately." },
  { id: "samples", title: "Samples", plain: "Real physical items someone received and checked.", status: "not_connected", blocker: "No sample log exists yet (planned F3)." },
  { id: "products", title: "Products", plain: "Private canonical product drafts.", status: "connected", link: { to: "/workspace/vendors", label: "Open Vendor Brands (product drafts)" } },
  { id: "looks", title: "Looks · Capsules · Try-on", plain: "Styling the product into looks.", status: "not_connected", blocker: "Capsules only hold live-shop products and try-on is the shopper version. Drafts cannot be added yet (P2-1/P2-2)." },
  { id: "approvals", title: "Approvals", plain: "What waits on the Founder's word.", status: "connected", link: { to: "/studios/review", label: "Open Review Queue" } },
  { id: "makers", title: "Makers & Fulfilment", plain: "CJ, print-on-demand or local makers. None is required.", status: "not_connected", blocker: "No maker or printer is connected; nothing can be ordered from here." },
];

/** Search params carry IDs only; everything shown is re-read on the server. */
export function parseFashionSearch(s: Record<string, unknown>): { productId?: string; variantId?: string } {
  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const productId = typeof s.productId === "string" && uuid.test(s.productId) ? s.productId : undefined;
  const variantId = typeof s.variantId === "string" && uuid.test(s.variantId) ? s.variantId : undefined;
  return productId && variantId ? { productId, variantId } : {};
}
