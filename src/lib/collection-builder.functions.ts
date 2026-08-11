// FRASS-0464 — Collection Builder server functions.
// Frassy drafts the page from Kanko's own words; Kanko approves; the piece is
// published as an ordinary Frass Card Shop listing.

import { createServerFn } from "@tanstack/react-start";
import { generateText, Output } from "ai";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import { COLLECTION_BRAND, type PieceDraft } from "@/lib/collection-builder";

const DraftSchema = z.object({
  title: z.string(),
  description: z.string(),
  story: z.string(),
  styling: z.array(z.string()),
  features: z.array(z.string()),
  condition_summary: z.string(),
  size_info: z.string(),
  material_info: z.string(),
  care: z.string(),
  seo_description: z.string(),
  keywords: z.array(z.string()),
  tags: z.array(z.string()),
});

const CraftInput = z.object({
  answers: z.record(z.string(), z.string().max(1200)),
  facts: z.object({
    size: z.string().max(80),
    condition: z.string().max(120),
    material: z.string().max(160),
    price: z.string().max(20),
  }),
  brand: z.string().max(60).default(COLLECTION_BRAND),
});

export const craftPiece = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: z.input<typeof CraftInput>) => CraftInput.parse(d))
  .handler(async ({ data }): Promise<PieceDraft> => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) throw new Error("Frassy's writing desk is not connected yet.");

    const conversation = Object.entries(data.answers)
      .filter(([, v]) => v.trim())
      .map(([k, v]) => `${k}: ${v.trim()}`)
      .join("\n");

    const gateway = createLovableAiGatewayProvider(key);
    try {
      const { output } = await generateText({
        model: gateway("google/gemini-3.6-flash"),
        output: Output.object({ schema: DraftSchema }),
        system: [
          `You write product pages for ${data.brand}, a curated vintage clothing brand.`,
          "Voice: warm, precise, quietly luxurious. Never exaggerated, never salesy, never invented.",
          "Only state facts the seller gave you. If something is unknown, describe what is known instead.",
          "Name flaws honestly and kindly — honesty is part of the luxury.",
          "Title: 3-8 words, no ALL CAPS, no emoji. Description: 2-4 sentences.",
          "Story: 2-3 sentences in the seller's own spirit. Styling: 3 short suggestions.",
          "Features: 3-5 short factual bullets. Care: sensible instructions for the material given.",
          "SEO description: under 155 characters. Keywords: 6-10 lowercase search phrases.",
          "Tags: 4-8 short marketplace tags (era, garment type, colour, style).",
        ].join(" "),
        prompt: [
          "The seller's answers about this piece:",
          conversation || "(the seller did not say much — stay general and honest)",
          "",
          `Size: ${data.facts.size || "not stated"}`,
          `Condition: ${data.facts.condition || "not stated"}`,
          `Material: ${data.facts.material || "not stated"}`,
          `Price: ${data.facts.price || "not stated"} USD`,
        ].join("\n"),
      });
      return output as PieceDraft;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      if (msg.includes("429")) throw new Error("Frassy is writing for a lot of people right now. Try again in a moment.");
      if (msg.includes("402")) throw new Error("The workspace is out of AI credits. Top up to keep writing pages.");
      throw new Error("Frassy could not draft this page. Your words are safe — try again.");
    }
  });

const PublishInput = z.object({
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().max(600),
  price: z.number().min(0).max(1_000_000),
  quantity: z.number().int().min(1).max(1000).default(1),
  image_url: z.string().trim().max(1000).nullable(),
  gallery: z.array(z.string().max(1000)).max(12).default([]),
  brand: z.string().trim().max(60).default(COLLECTION_BRAND),
  collection: z.string().trim().max(60).default(COLLECTION_BRAND),
  details: z.record(z.string(), z.any()).default({}),
});

export const publishPiece = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: z.input<typeof PublishInput>) => PublishInput.parse(d))
  .handler(async ({ context, data }) => {
    const payload = {
      user_id: context.userId,
      kind: "product",
      title: data.title,
      description: data.description || null,
      image_url: data.image_url,
      price: data.price,
      currency: "USD",
      quantity: data.quantity,
      is_quick_sell: false,
      status: "live",
      brand: data.brand,
      collection: data.collection,
      gallery: data.gallery,
      details: data.details,
    };
    const { data: row, error } = await context.supabase
      .from("card_listings")
      .insert(payload as never)
      .select("id, title, image_url, price, created_at")
      .single();
    if (error) throw error;
    return row;
  });

/** Everything the boutique preview and the progress line need, in one read. */
export const getCollection = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { collection?: string } | undefined) =>
    z.object({ collection: z.string().max(60).default(COLLECTION_BRAND) }).parse(d ?? {}),
  )
  .handler(async ({ context, data }) => {
    const { data: rows, error } = await context.supabase
      .from("card_listings")
      .select("id, title, image_url, price, currency, status, created_at, details")
      .eq("user_id", context.userId)
      .eq("collection", data.collection)
      .neq("status", "archived")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw error;

    const list = rows ?? [];
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const todayPublished = list.filter((r) => new Date(r.created_at) >= startOfDay).length;

    return { pieces: list, published: list.length, todayPublished };
  });
