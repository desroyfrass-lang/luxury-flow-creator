import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { fetchProducts } from "@/lib/shopify";
import type { VisualAttributes } from "@/lib/visual-embed.server";

// ----- Types (client-safe) -----
export type VisualMatch = {
  id: string;
  source_type: "shopify" | "viral";
  source_id: string;
  title: string;
  image_url: string;
  handle: string | null;
  category_slug: string | null;
  sub_slug: string | null;
  price: string | null;
  attributes: VisualAttributes;
  similarity: number;
  why: string;
};

// ============================================================
// Admin: backfill catalog embeddings (Shopify + Viral)
// ============================================================
const BackfillInput = z.object({
  source: z.enum(["shopify", "viral", "both"]).default("both"),
  limit: z.number().min(1).max(500).default(250),
  force: z.boolean().default(false),
});

export const backfillVisualEmbeddings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => BackfillInput.parse(i))
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Forbidden");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { embedImage, analyzeImageAttributes, toPgVector } = await import(
      "@/lib/visual-embed.server"
    );

    type Item = {
      source_type: "shopify" | "viral";
      source_id: string;
      title: string;
      image_url: string;
      handle?: string | null;
      category_slug?: string | null;
      sub_slug?: string | null;
      price?: number | null;
    };
    const items: Item[] = [];

    if (data.source === "shopify" || data.source === "both") {
      const products = await fetchProducts({ first: data.limit });
      for (const p of products) {
        const img = p.node.images?.edges?.[0]?.node?.url;
        if (!img) continue;
        items.push({
          source_type: "shopify",
          source_id: p.node.id,
          title: p.node.title,
          image_url: img,
          handle: p.node.handle,
          category_slug: p.node.productType?.toLowerCase() ?? null,
          sub_slug: p.node.vendor?.toLowerCase() ?? null,
          price: parseFloat(p.node.priceRange.minVariantPrice.amount) || null,
        });
      }
    }

    if (data.source === "viral" || data.source === "both") {
      const { data: virals } = await supabaseAdmin
        .from("viral_products")
        .select("id, title, image, category_slug, sub_slug, slug, price")
        .limit(data.limit);
      for (const v of virals ?? []) {
        if (!v.image) continue;
        items.push({
          source_type: "viral",
          source_id: v.id,
          title: v.title,
          image_url: v.image,
          handle: v.slug,
          category_slug: v.category_slug,
          sub_slug: v.sub_slug,
          price: v.price != null ? Number(v.price) : null,
        });
      }
    }

    // Skip already-indexed unless force=true
    let toProcess = items;
    if (!data.force) {
      const { data: existing } = await supabaseAdmin
        .from("product_visual_embeddings")
        .select("source_type, source_id");
      const seen = new Set((existing ?? []).map((r) => `${r.source_type}:${r.source_id}`));
      toProcess = items.filter((i) => !seen.has(`${i.source_type}:${i.source_id}`));
    }

    let ok = 0;
    let fail = 0;
    const errors: string[] = [];

    for (const item of toProcess) {
      try {
        const [vec, attrs] = await Promise.all([
          embedImage(item.image_url, item.title),
          analyzeImageAttributes(item.image_url).catch(() => ({})),
        ]);

        const payload = {
          source_type: item.source_type,
          source_id: item.source_id,
          title: item.title,
          image_url: item.image_url,
          handle: item.handle ?? null,
          category_slug: item.category_slug ?? null,
          sub_slug: item.sub_slug ?? null,
          price: item.price ?? null,
          attributes: attrs as unknown,
          embedding: toPgVector(vec),
          model_version: "google/gemini-embedding-2",
          indexed_at: new Date().toISOString(),
        };
        const { error } = await supabaseAdmin
          .from("product_visual_embeddings")
          .upsert(payload as never, { onConflict: "source_type,source_id" });
        if (error) throw error;
        ok++;
      } catch (e) {
        fail++;
        if (errors.length < 5) errors.push(`${item.source_type}:${item.source_id} — ${(e as Error).message}`);
      }
    }

    return {
      considered: items.length,
      processed: toProcess.length,
      indexed: ok,
      failed: fail,
      errors,
    };
  });

// ============================================================
// Customer: analyze + embed an uploaded image, then search
// ============================================================
const SearchInput = z.object({
  storage_path: z.string().min(1),
  source_filter: z.enum(["shopify", "viral", "both"]).default("both"),
  match_count: z.number().min(1).max(24).default(12),
});

export const runVisualSearch = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => SearchInput.parse(i))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { embedImage, analyzeImageAttributes, toPgVector } = await import(
      "@/lib/visual-embed.server"
    );

    // Signed URL for the private upload (short-lived, server-only)
    const { data: signed, error: signErr } = await supabaseAdmin.storage
      .from("visual-uploads")
      .createSignedUrl(data.storage_path, 300);
    if (signErr || !signed?.signedUrl) {
      throw new Error(signErr?.message || "Could not sign upload URL");
    }
    const url = signed.signedUrl;

    // Vision first — if refused, stop before embedding
    const attrs = await analyzeImageAttributes(url);
    if (attrs.refuse_reason) {
      return {
        attributes: attrs,
        results: [] as VisualMatch[],
        upload_id: null as string | null,
        refused: true,
      };
    }

    const vec = await embedImage(url, attrs.category ?? "fashion inspiration");

    // Persist the upload row (temp — expires_at defaults to now()+24h)
    const uploadPayload = {
      user_id: context.userId,
      storage_path: data.storage_path,
      attributes: attrs as unknown,
      embedding: toPgVector(vec),
    };
    const { data: uploadRow } = await context.supabase
      .from("visual_uploads")
      .insert(uploadPayload as never)
      .select("id")
      .single();

    // Similarity search
    const rpcArgs: Record<string, unknown> = {
      query_embedding: toPgVector(vec),
      match_count: data.match_count,
    };
    if (data.source_filter !== "both") rpcArgs.source_filter = data.source_filter;
    const { data: matches, error: matchErr } = await supabaseAdmin.rpc(
      "match_product_visuals",
      rpcArgs as never,
    );
    if (matchErr) throw new Error(matchErr.message);

    type RawMatch = {
      id: string;
      source_type: string;
      source_id: string;
      title: string;
      image_url: string;
      handle: string | null;
      category_slug: string | null;
      sub_slug: string | null;
      price: number | null;
      attributes: unknown;
      similarity: number;
    };
    const results: VisualMatch[] = ((matches ?? []) as RawMatch[]).map((m) => ({
      id: m.id,
      source_type: (m.source_type === "viral" ? "viral" : "shopify") as "shopify" | "viral",
      source_id: m.source_id,
      title: m.title,
      image_url: m.image_url,
      handle: m.handle,
      category_slug: m.category_slug,
      sub_slug: m.sub_slug,
      price: m.price != null ? String(m.price) : null,
      attributes: (m.attributes ?? {}) as Record<string, unknown>,
      similarity: m.similarity,
      why: buildWhy(attrs, (m.attributes ?? {}) as VisualAttrs, m.similarity),
    }));

    return {
      attributes: attrs,
      results,
      upload_id: uploadRow?.id ?? null,
      refused: false,
    };
  });

type VisualAttrs = { category?: string; primary_color?: string; silhouette?: string; mood?: string };
function buildWhy(q: VisualAttrs, p: VisualAttrs, sim: number): string {
  const bits: string[] = [];
  if (q.primary_color && p.primary_color && q.primary_color.toLowerCase() === p.primary_color.toLowerCase())
    bits.push(`matches the ${p.primary_color} tone`);
  else if (p.primary_color) bits.push(`${p.primary_color} palette`);
  if (q.silhouette && p.silhouette && q.silhouette.toLowerCase() === p.silhouette.toLowerCase())
    bits.push(`same ${p.silhouette} silhouette`);
  else if (p.silhouette) bits.push(`${p.silhouette} silhouette`);
  if (q.mood && p.mood && q.mood.toLowerCase() === p.mood.toLowerCase()) bits.push(`same ${p.mood} feeling`);
  const pct = Math.round(sim * 100);
  return `${bits.slice(0, 2).join(" · ") || "Visually similar"} (${pct}% match)`;
}

// ============================================================
// List / delete customer uploads (memory controls)
// ============================================================
export const listMyVisualUploads = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("visual_uploads")
      .select("id, storage_path, attributes, is_saved, created_at, expires_at")
      .order("created_at", { ascending: false })
      .limit(50);
    return data ?? [];
  });

const DeleteInput = z.object({ id: z.string().uuid() });
export const deleteVisualUpload = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => DeleteInput.parse(i))
  .handler(async ({ data, context }) => {
    const { data: row } = await context.supabase
      .from("visual_uploads")
      .select("storage_path")
      .eq("id", data.id)
      .maybeSingle();
    if (row?.storage_path) {
      await context.supabase.storage.from("visual-uploads").remove([row.storage_path]);
    }
    await context.supabase.from("visual_uploads").delete().eq("id", data.id);
    return { ok: true };
  });

// ============================================================
// Admin: purge expired uploads (also removes storage objects)
// ============================================================
export const purgeExpiredUploads = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Forbidden");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: expired } = await supabaseAdmin
      .from("visual_uploads")
      .select("id, storage_path")
      .eq("is_saved", false)
      .lt("expires_at", new Date().toISOString())
      .limit(500);

    const paths = (expired ?? []).map((r) => r.storage_path).filter(Boolean);
    if (paths.length) {
      await supabaseAdmin.storage.from("visual-uploads").remove(paths);
    }
    await supabaseAdmin.rpc("purge_expired_visual_uploads");
    return { removed: paths.length };
  });
