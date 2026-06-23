import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

interface CartItemInput {
  title: string;
  imageUrl: string;
  variantTitle?: string;
}

interface TryOnInput {
  sourcePhotoId?: string;
  sourcePhotoUrl: string;
  items: CartItemInput[];
}

async function fetchAsDataUrl(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch image (${res.status}): ${url.slice(0, 80)}`);
  const contentType = res.headers.get("content-type") ?? "image/jpeg";
  const buf = new Uint8Array(await res.arrayBuffer());
  let binary = "";
  for (let i = 0; i < buf.length; i++) binary += String.fromCharCode(buf[i]);
  const base64 = btoa(binary);
  return `data:${contentType};base64,${base64}`;
}

export const generateTryOn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: TryOnInput) => {
    if (!input?.sourcePhotoUrl) throw new Error("sourcePhotoUrl required");
    if (!Array.isArray(input.items) || input.items.length === 0) throw new Error("At least one item required");
    if (input.items.length > 4) throw new Error("Up to 4 items per look");
    return input;
  })
  .handler(async ({ data, context }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("Missing LOVABLE_API_KEY");

    const { supabase, userId } = context;

    // Insert look as pending
    const { data: lookRow, error: insertErr } = await supabase
      .from("tryon_looks")
      .insert({
        user_id: userId,
        source_photo_id: data.sourcePhotoId ?? null,
        source_photo_url: data.sourcePhotoUrl,
        cart_items: data.items as never,
        status: "pending",
      })
      .select("id")
      .single();
    if (insertErr) throw insertErr;
    const lookId = lookRow.id;

    try {
      // Convert all referenced images to base64 data URLs so Gemini can read them
      const sourceDataUrl = await fetchAsDataUrl(data.sourcePhotoUrl);
      const itemDataUrls = await Promise.all(data.items.map((i) => fetchAsDataUrl(i.imageUrl)));

      const itemDescriptions = data.items
        .map((i, idx) => `Garment ${idx + 1}: ${i.title}${i.variantTitle ? ` (${i.variantTitle})` : ""}`)
        .join("\n");

      const prompt = `Compose a single realistic full-body photograph of the person from the first image, now wearing the garment(s) shown in the following ${data.items.length} image(s). 

${itemDescriptions}

Critical rules:
- Keep the person's face, skin tone, body shape, pose, and the background EXACTLY the same as the first image.
- Realistically replace their clothing with the garments shown. Match fabric, color, logos, and prints faithfully.
- If a shoe is shown, replace the footwear; if a top is shown, replace the top, etc.
- Natural lighting and shadows that match the original photo.
- Photorealistic quality, no cartoonish rendering, no text overlays, no watermarks.`;

      const content: Array<{ type: string; text?: string; image_url?: { url: string } }> = [
        { type: "text", text: prompt },
        { type: "image_url", image_url: { url: sourceDataUrl } },
        ...itemDataUrls.map((url) => ({ type: "image_url" as const, image_url: { url } })),
      ];

      const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/images/generations", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3.1-flash-image",
          messages: [{ role: "user", content }],
          modalities: ["image", "text"],
        }),
      });

      if (aiRes.status === 429) {
        await supabase.from("tryon_looks").update({ status: "failed", error: "Rate limit — try again in a moment." }).eq("id", lookId);
        throw new Error("Rate limit reached. Please try again in a moment.");
      }
      if (aiRes.status === 402) {
        await supabase.from("tryon_looks").update({ status: "failed", error: "AI credits exhausted." }).eq("id", lookId);
        throw new Error("AI credits exhausted on this workspace.");
      }
      if (!aiRes.ok) {
        const txt = await aiRes.text();
        await supabase.from("tryon_looks").update({ status: "failed", error: txt.slice(0, 500) }).eq("id", lookId);
        throw new Error(`AI gateway error ${aiRes.status}: ${txt.slice(0, 200)}`);
      }

      const json = (await aiRes.json()) as { data?: Array<{ b64_json?: string }> };
      const b64 = json?.data?.[0]?.b64_json;
      if (!b64) {
        await supabase.from("tryon_looks").update({ status: "failed", error: "No image returned" }).eq("id", lookId);
        throw new Error("AI did not return an image. Try a clearer full-body photo.");
      }

      // Decode and upload to storage
      const binary = atob(b64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      const path = `${userId}/looks/${lookId}.png`;
      const { error: upErr } = await supabase.storage
        .from("tryon-photos")
        .upload(path, bytes, { upsert: true, contentType: "image/png" });
      if (upErr) throw upErr;

      const { data: signed, error: signErr } = await supabase.storage
        .from("tryon-photos")
        .createSignedUrl(path, 60 * 60 * 24 * 365);
      if (signErr) throw signErr;

      await supabase
        .from("tryon_looks")
        .update({ status: "ready", result_url: signed.signedUrl, prompt })
        .eq("id", lookId);

      return { id: lookId, resultUrl: signed.signedUrl };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      await supabase.from("tryon_looks").update({ status: "failed", error: msg.slice(0, 500) }).eq("id", lookId);
      throw err;
    }
  });
