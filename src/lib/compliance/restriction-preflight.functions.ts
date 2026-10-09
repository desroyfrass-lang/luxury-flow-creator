import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import {
  evaluateCart,
  isCartId,
  resolveEnforcementMode,
  rowToRule,
  sanitizeDestination,
  type PreflightResult,
  type RestrictionRuleRow,
  type ServerCartLine,
} from "./restriction-preflight";
import { storefrontApiRequest } from "@/lib/shopify";

const CART_LINES_QUERY = `
  query PreflightCart($id: ID!) {
    cart(id: $id) {
      lines(first: 100) {
        edges { node { merchandise { ... on ProductVariant { id title product { id title } } } } }
      }
    }
  }
`;

type CartResp = {
  cart: {
    lines: { edges: Array<{ node: { merchandise: { id?: string; title?: string; product?: { id: string; title: string } } } }> };
  } | null;
};

/**
 * Restriction preflight for the FRASS checkout redirect. Public (guests can
 * check out). Only the cart id and declared destination come from the browser;
 * cart contents are read from Shopify server-side and rules from the database.
 */
export const restrictionPreflight = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => {
    const o = (input ?? {}) as Record<string, unknown>;
    return { cartId: isCartId(o.cartId) ? o.cartId : null, destination: sanitizeDestination(o.destination) };
  })
  .handler(async ({ data }): Promise<PreflightResult> => {
    const mode = resolveEnforcementMode(getRequestHeader("host"), {
      production: process.env["RESTRICTIONS_ENFORCEMENT_PRODUCTION"],
      preview: process.env["RESTRICTIONS_ENFORCEMENT_PREVIEW"],
    });
    if (mode === "off") return { mode, allowCheckout: true, blocked: false, reasons: [], items: [] };

    try {
      let lines: ServerCartLine[] | null = null;
      if (data.cartId) {
        try {
          const resp = await storefrontApiRequest<CartResp>(CART_LINES_QUERY, { id: data.cartId });
          lines = resp.cart
            ? resp.cart.lines.edges
                .map((e) => e.node.merchandise)
                .filter((m) => m.id && m.product)
                .map((m) => ({ variantId: m.id!, productId: m.product!.id, title: `${m.product!.title}${m.title && m.title !== "Default Title" ? ` — ${m.title}` : ""}` }))
            : null;
        } catch (e) {
          console.error("[restriction-preflight] cart lookup failed", e instanceof Error ? e.message : e);
        }
      }

      let rules = null;
      if (data.destination) {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: rows, error } = await supabaseAdmin
          .from("restriction_rules")
          .select("*")
          .eq("country", data.destination.country)
          .eq("approval", "approved");
        if (error) console.error("[restriction-preflight] rules load failed", error.message);
        else rules = (rows as RestrictionRuleRow[]).map(rowToRule);
      }

      const result = evaluateCart({ mode, destination: data.destination, lines, rules });
      if (mode === "shadow") {
        console.log("[restriction-preflight][shadow]", JSON.stringify({ blocked: result.blocked, reasons: result.reasons, items: result.items.map((i) => i.decision) }));
      }
      return result;
    } catch (e) {
      console.error("[restriction-preflight] failed", e instanceof Error ? e.message : e);
      // Fail closed when enforcing.
      return { mode, allowCheckout: mode !== "enforce", blocked: true, reasons: ["preflight_error"], items: [] };
    }
  });
