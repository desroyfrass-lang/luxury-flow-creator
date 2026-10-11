// Founder/admin-only, READ-ONLY CJ freight quotes. CJ's freightCalculate only
// calculates — it creates nothing on CJ. Each option is saved (insert-only,
// with source, time and expiry) so pricing can fail closed on stale quotes.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { QUOTE_TTL_HOURS, zoneForCountry } from "@/lib/commerce/shipping-zones";

const CJ_BASE = "https://developers.cjdropshipping.com/api2.0/v1";

async function cjToken(): Promise<string> {
  const email = process.env.CJ_EMAIL;
  const apiKey = process.env.CJ_API_KEY;
  if (!email || !apiKey) throw new Error("CJ connection is not set up.");
  const r = await fetch(`${CJ_BASE}/authentication/getAccessToken`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password: apiKey }),
  });
  const j = (await r.json()) as { data?: { accessToken?: string }; message?: string };
  if (!j.data?.accessToken) throw new Error(`CJ sign-in failed: ${j.message ?? "unknown"}`);
  return j.data.accessToken;
}

type CjOption = { logisticName: string; logisticPrice: number; logisticAging?: string | null; error?: string | null };

export const fetchCjShippingQuotes = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ productId: z.string().uuid(), country: z.string().length(2) }).parse(i))
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (isAdmin !== true) throw new Error("Founder access only.");
    const country = data.country.toUpperCase();
    if (!zoneForCountry(country)) throw new Error(`${country} is not a FRASS shipping zone yet.`);

    const { data: variants, error } = await context.supabase
      .from("canonical_product_variants").select("id, source_variant_ref").eq("product_id", data.productId).limit(100);
    if (error) throw new Error(error.message);
    if (!variants?.length) throw new Error("No saved variants for this product.");

    const token = await cjToken();
    const now = new Date();
    const expires = new Date(now.getTime() + QUOTE_TTL_HOURS * 3600_000).toISOString();
    const results: Array<{ variantId: string; options: number; error: string | null }> = [];
    for (const v of variants) {
      try {
        const r = await fetch(`${CJ_BASE}/logistic/freightCalculate`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "CJ-Access-Token": token },
          body: JSON.stringify({ startCountryCode: "CN", endCountryCode: country, products: [{ quantity: 1, vid: v.source_variant_ref }] }),
        });
        const j = (await r.json()) as { result?: boolean; message?: string; data?: CjOption[] };
        if (!j.result) { results.push({ variantId: v.id, options: 0, error: j.message ?? "CJ refused the quote" }); continue; }
        const rows = (j.data ?? [])
          .filter((o) => !o.error && typeof o.logisticPrice === "number" && Number.isFinite(o.logisticPrice))
          .map((o) => ({
            variant_id: v.id, cj_vid: v.source_variant_ref, dest_country: country, method: o.logisticName,
            price: o.logisticPrice, currency: "USD", aging_days: o.logisticAging ?? null,
            fetched_at: now.toISOString(), expires_at: expires, fetched_by: context.userId,
          }));
        if (rows.length) {
          const { error: insErr } = await context.supabase.from("cj_shipping_quotes").insert(rows);
          if (insErr) throw new Error(insErr.message);
        }
        results.push({ variantId: v.id, options: rows.length, error: rows.length ? null : "No shipping option to this destination (quote required)." });
      } catch (e) {
        results.push({ variantId: v.id, options: 0, error: e instanceof Error ? e.message : "Quote failed" });
      }
    }
    return { country, fetchedAt: now.toISOString(), expiresAt: expires, results };
  });

export const listCjShippingQuotes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ variantIds: z.array(z.string().uuid()).max(100), country: z.string().length(2) }).parse(i))
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (isAdmin !== true || !data.variantIds.length) return [];
    const { data: rows, error } = await context.supabase
      .from("cj_shipping_quotes")
      .select("variant_id, method, price, currency, aging_days, fetched_at, expires_at")
      .in("variant_id", data.variantIds).eq("dest_country", data.country.toUpperCase())
      .order("fetched_at", { ascending: false }).limit(1000);
    if (error) throw new Error(error.message);
    return (rows ?? []).map((r) => ({ ...r, price: Number(r.price) }));
  });
