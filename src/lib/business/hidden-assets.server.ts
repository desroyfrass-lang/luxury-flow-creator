// FRASS-P002-E — First Business Venture: runtime.
//
// Documentation → Identification → Valuation → Monetization.
// Frassy organises and researches. She never guarantees a value or a sale price,
// and she says plainly when a professional appraisal is the honest next step.

import { assertStoredImage } from "@/lib/uploads.server";
import { HIDDEN_ASSETS_BUCKET, categoryFields, type HiddenAsset } from "./hidden-assets";
import type { CreateAssetInput, UpdateAssetInput } from "./hidden-assets.schema";

type AnySupabase = {
  from: (t: string) => any;
  storage: { from: (b: string) => any };
};

const TABLE = "hidden_assets";
const GATEWAY = "https://ai.gateway.lovable.dev/v1";
const SIGNED_SECONDS = 60 * 30;

function clean(v: string | null | undefined): string | null {
  const s = (v ?? "").trim();
  return s.length ? s : null;
}

export async function listAssets(sb: AnySupabase, userId: string) {
  const { data, error } = await sb
    .from(TABLE)
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as HiddenAsset[];
}

export async function createAsset(sb: AnySupabase, userId: string, input: CreateAssetInput) {
  for (const p of [input.frontPath, input.backPath]) {
    if (p) await assertStoredImage(HIDDEN_ASSETS_BUCKET, p, userId);
  }
  const { data, error } = await sb
    .from(TABLE)
    .insert({
      user_id: userId,
      venture: input.venture,
      category: input.category,
      name: input.name,
      notes: clean(input.notes),
      front_path: clean(input.frontPath),
      back_path: clean(input.backPath),
      status: "documented",
    })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as unknown as HiddenAsset;
}

export async function updateAsset(sb: AnySupabase, userId: string, input: UpdateAssetInput) {
  for (const p of [input.frontPath, input.backPath]) {
    if (p) await assertStoredImage(HIDDEN_ASSETS_BUCKET, p, userId);
  }
  const patch: Record<string, unknown> = {};
  const map: Record<string, string> = {
    name: "name",
    notes: "notes",
    country: "country",
    yearText: "year_text",
    denomination: "denomination",
    markings: "markings",
    conditionNote: "condition_note",
    frontPath: "front_path",
    backPath: "back_path",
    listingTitle: "listing_title",
    listingDescription: "listing_description",
    listingPrice: "listing_price",
    soldAmount: "sold_amount",
    status: "status",
  };
  for (const [key, column] of Object.entries(map)) {
    const value = (input as Record<string, unknown>)[key];
    if (value === undefined) continue;
    patch[column] = typeof value === "string" ? clean(value) : value;
  }
  if (patch["status"] === "sold") patch["sold_at"] = new Date().toISOString();

  const { data, error } = await sb
    .from(TABLE)
    .update(patch)
    .eq("id", input.id)
    .eq("user_id", userId)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as unknown as HiddenAsset;
}

export async function deleteAsset(sb: AnySupabase, userId: string, id: string) {
  const { data } = await sb
    .from(TABLE)
    .select("front_path, back_path")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();
  const paths = [data?.front_path, data?.back_path].filter(Boolean) as string[];
  const { error } = await sb.from(TABLE).delete().eq("id", id).eq("user_id", userId);
  if (error) throw new Error(error.message);
  if (paths.length) await sb.storage.from(HIDDEN_ASSETS_BUCKET).remove(paths);
  return { ok: true };
}

/** Short-lived links so her own photos can be shown back to her (and to the model). */
export async function signAssetPhotos(userId: string, paths: string[]) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const out: Record<string, string> = {};
  for (const raw of paths) {
    const path = raw.replace(/^\/+/, "");
    if (path.includes("..") || !path.startsWith(`${userId}/`)) continue;
    const { data } = await supabaseAdmin.storage
      .from(HIDDEN_ASSETS_BUCKET)
      .createSignedUrl(path, SIGNED_SECONDS);
    if (data?.signedUrl) out[raw] = data.signedUrl;
  }
  return out;
}

// ── Phases 2 & 3 — identification and organised valuation research ──────────

type Research = {
  name: string | null;
  country: string | null;
  year: string | null;
  denomination: string | null;
  markings: string | null;
  condition: string | null;
  rarity: string | null;
  value_factors: string[];
  estimated_low: number | null;
  estimated_high: number | null;
  appraisal_recommended: boolean;
  appraisal_reason: string | null;
  research_notes: string | null;
  selling_options: string[];
};

const RESEARCH_RULES = `You are Frassy, helping a member understand something they already own.
Rules you never break:
- You organise and research. You never guarantee a value or a sale price.
- If the photos or details are not enough to be confident, say so plainly and recommend a professional appraisal instead of inventing a number.
- Any range you give is a research estimate based on comparable public listings and auction results, clearly caveated.
- Speak plainly. No jargon. Short sentences an older person can read comfortably.`;

export async function researchAsset(sb: AnySupabase, userId: string, id: string) {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("Research is not available right now.");

  const { data: row, error } = await sb
    .from(TABLE)
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single();
  if (error || !row) throw new Error("That item could not be found.");

  const signed = await signAssetPhotos(
    userId,
    [row.front_path, row.back_path].filter(Boolean) as string[],
  );

  const content: Record<string, unknown>[] = [
    {
      type: "text",
      text: [
        `Category: ${row.category}`,
        `What the owner calls it: ${row.name}`,
        row.notes ? `What the owner already knows: ${row.notes}` : null,
        `Details worth recording for this category: ${categoryFields(String(row.category)).join(", ")}`,
        "Identify it as precisely as the photos allow, then research what comparable pieces sell for.",
      ]
        .filter(Boolean)
        .join("\n"),
    },
    ...Object.values(signed).map((url) => ({ type: "image_url", image_url: { url } })),
  ];

  const res = await fetch(`${GATEWAY}/chat/completions`, {
    method: "POST",
    headers: { "Lovable-API-Key": key, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-3.6-flash",
      messages: [
        { role: "system", content: RESEARCH_RULES },
        { role: "user", content },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "record_research",
            description: "Record the identification and valuation research for one item.",
            parameters: {
              type: "object",
              properties: {
                name: { type: "string" },
                country: { type: "string" },
                year: { type: "string" },
                denomination: { type: "string" },
                markings: { type: "string" },
                condition: { type: "string" },
                rarity: { type: "string" },
                value_factors: { type: "array", items: { type: "string" } },
                estimated_low: { type: "number" },
                estimated_high: { type: "number" },
                appraisal_recommended: { type: "boolean" },
                appraisal_reason: { type: "string" },
                research_notes: { type: "string" },
                selling_options: { type: "array", items: { type: "string" } },
              },
              required: ["appraisal_recommended", "research_notes"],
              additionalProperties: false,
            },
          },
        },
      ],
      tool_choice: { type: "function", function: { name: "record_research" } },
    }),
  });

  if (res.status === 429) throw new Error("Too many requests just now. Try again in a moment.");
  if (res.status === 402) throw new Error("Research credits are exhausted. Add credits to continue.");
  if (!res.ok) throw new Error("Research failed. Nothing was changed.");

  const payload = (await res.json()) as any;
  const call = payload?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
  let out: Research;
  try {
    out = JSON.parse(call ?? "{}") as Research;
  } catch {
    throw new Error("Research came back unreadable. Nothing was changed.");
  }

  const notes = [
    out.research_notes,
    out.rarity ? `Rarity: ${out.rarity}` : null,
    out.value_factors?.length ? `What affects the value: ${out.value_factors.join("; ")}` : null,
    out.selling_options?.length ? `Ways to sell: ${out.selling_options.join("; ")}` : null,
    out.appraisal_recommended && out.appraisal_reason
      ? `Worth a professional appraisal: ${out.appraisal_reason}`
      : null,
    "This is a research estimate, not a guarantee.",
  ]
    .filter(Boolean)
    .join("\n\n");

  const low = typeof out.estimated_low === "number" && out.estimated_low >= 0 ? out.estimated_low : null;
  const highRaw = typeof out.estimated_high === "number" && out.estimated_high >= 0 ? out.estimated_high : null;
  const high = low != null && highRaw != null && highRaw < low ? low : highRaw;

  const patch: Record<string, unknown> = {
    country: clean(out.country) ?? row.country,
    year_text: clean(out.year) ?? row.year_text,
    denomination: clean(out.denomination) ?? row.denomination,
    markings: clean(out.markings) ?? row.markings,
    condition_note: clean(out.condition) ?? row.condition_note,
    research_notes: notes,
    estimated_low: low,
    estimated_high: high,
    appraisal_recommended: Boolean(out.appraisal_recommended),
    status: row.status === "listed" || row.status === "sold" ? row.status : low != null ? "valued" : "identified",
  };
  if (clean(out.name) && !clean(row.notes)) patch["name"] = clean(out.name);

  const { data, error: upErr } = await sb
    .from(TABLE)
    .update(patch)
    .eq("id", id)
    .eq("user_id", userId)
    .select("*")
    .single();
  if (upErr) throw new Error(upErr.message);
  return data as unknown as HiddenAsset;
}

// ── Phase 4 — listing prepared for her approval ─────────────────────────────

export async function prepareListing(sb: AnySupabase, userId: string, id: string) {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("Listing preparation is not available right now.");

  const { data: row, error } = await sb
    .from(TABLE)
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single();
  if (error || !row) throw new Error("That item could not be found.");

  const res = await fetch(`${GATEWAY}/chat/completions`, {
    method: "POST",
    headers: { "Lovable-API-Key": key, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-3.6-flash",
      messages: [
        {
          role: "system",
          content:
            "You write honest, professional marketplace listings for a private seller. Describe only what the recorded details support. Never invent provenance, grading or certification. Note condition honestly. Plain, warm, factual English.",
        },
        {
          role: "user",
          content: JSON.stringify({
            category: row.category,
            name: row.name,
            country: row.country,
            year: row.year_text,
            denomination: row.denomination,
            markings: row.markings,
            condition: row.condition_note,
            research: row.research_notes,
            owner_notes: row.notes,
          }),
        },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "record_listing",
            description: "A listing prepared for the seller's approval.",
            parameters: {
              type: "object",
              properties: {
                title: { type: "string" },
                description: { type: "string" },
                suggested_price: { type: "number" },
                marketplaces: { type: "array", items: { type: "string" } },
                shipping_notes: { type: "string" },
                buyer_message: { type: "string" },
              },
              required: ["title", "description"],
              additionalProperties: false,
            },
          },
        },
      ],
      tool_choice: { type: "function", function: { name: "record_listing" } },
    }),
  });

  if (res.status === 429) throw new Error("Too many requests just now. Try again in a moment.");
  if (res.status === 402) throw new Error("Credits are exhausted. Add credits to continue.");
  if (!res.ok) throw new Error("Listing preparation failed. Nothing was changed.");

  const payload = (await res.json()) as any;
  let out: {
    title?: string;
    description?: string;
    suggested_price?: number;
    marketplaces?: string[];
    shipping_notes?: string;
    buyer_message?: string;
  };
  try {
    out = JSON.parse(payload?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments ?? "{}");
  } catch {
    throw new Error("The listing came back unreadable. Nothing was changed.");
  }

  const description = [
    out.description,
    out.marketplaces?.length ? `Where to sell it: ${out.marketplaces.join(", ")}` : null,
    out.shipping_notes ? `Posting it: ${out.shipping_notes}` : null,
    out.buyer_message ? `If a buyer asks: "${out.buyer_message}"` : null,
  ]
    .filter(Boolean)
    .join("\n\n");

  const price =
    typeof out.suggested_price === "number" && out.suggested_price >= 0 && out.suggested_price <= 1_000_000
      ? out.suggested_price
      : (row.listing_price ?? null);

  const { data, error: upErr } = await sb
    .from(TABLE)
    .update({
      listing_title: clean(out.title) ?? row.name,
      listing_description: description,
      listing_price: price,
    })
    .eq("id", id)
    .eq("user_id", userId)
    .select("*")
    .single();
  if (upErr) throw new Error(upErr.message);
  return data as unknown as HiddenAsset;
}
