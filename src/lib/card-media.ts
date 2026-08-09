// FRASS-0429 — Quick Sell photo capture.
// A member should be able to point their phone at the thing and sell it.
// Photos live in the member's own folder; the card shows a long-lived link.

import { supabase } from "@/integrations/supabase/client";

export const CARD_MEDIA_BUCKET = "card-media";
const TEN_YEARS = 60 * 60 * 24 * 365 * 10;
const MAX_BYTES = 8 * 1024 * 1024;

export async function uploadCardPhoto(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("That file is not a photo.");
  if (file.size > MAX_BYTES) throw new Error("That photo is larger than 8MB. Try a smaller one.");

  const { data: auth } = await supabase.auth.getUser();
  const userId = auth.user?.id;
  if (!userId) throw new Error("Sign in to upload a photo.");

  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().slice(0, 5);
  const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error: upErr } = await supabase.storage
    .from(CARD_MEDIA_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });
  if (upErr) throw new Error(upErr.message);

  const { data: signed, error: signErr } = await supabase.storage
    .from(CARD_MEDIA_BUCKET)
    .createSignedUrl(path, TEN_YEARS);
  if (signErr || !signed?.signedUrl) throw new Error(signErr?.message || "Could not prepare that photo.");

  return signed.signedUrl;
}
