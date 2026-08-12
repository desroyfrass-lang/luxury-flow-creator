import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ClientOnly } from "@tanstack/react-router";
import { DrawingCanvas } from "@/components/gallery/studio/drawing-canvas";
import { supabase } from "@/integrations/supabase/client";
import {
  STUDIO_AI_RULE,
  STUDIO_PLAIN_ENGLISH,
  STUDIO_PRINCIPLE,
  STYLUS_NOTE,
} from "@/lib/gallery/studio";
import { slugify } from "@/lib/gallery/gallery";

export const Route = createFileRoute("/gallery/studio")({
  component: StudioPage,
  head: () => ({
    meta: [
      { title: "Gallery Studio — Frass Gallery" },
      {
        name: "description",
        content:
          "A professional painting and illustration studio inside Frass. Pressure-sensitive brushes, layers and assistants — then one tap to your gallery.",
      },
      { property: "og:title", content: "Gallery Studio — Frass Gallery" },
      {
        property: "og:description",
        content: "Paint, illustrate and publish. The Frass Gallery Studio runs on any tablet you already own.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function StudioPage() {
  const [status, setStatus] = useState<string | null>(null);

  /** Sends the finished piece straight into the artist's gallery as a draft. */
  const handleExport = async (blob: Blob, thumbnail: string) => {
    const { data: auth } = await supabase.auth.getUser();
    const user = auth.user;
    if (!user) {
      setStatus("Sign in first and I'll file this straight into your gallery.");
      return;
    }
    const { data: gallery } = await supabase
      .from("artist_galleries")
      .select("id, handle")
      .eq("user_id", user.id)
      .maybeSingle();
    if (!gallery) {
      setStatus("You don't have a gallery yet — ask Frassy to build one and this piece goes in first.");
      return;
    }

    const title = `Studio piece — ${new Date().toLocaleDateString()}`;
    const path = `${user.id}/${Date.now()}-${slugify(title)}.png`;
    const upload = await supabase.storage.from("gallery-art").upload(path, blob, {
      contentType: "image/png",
      upsert: false,
    });
    if (upload.error) {
      setStatus("The upload didn't complete. Your work is still safe on this device.");
      return;
    }
    const { error } = await supabase.from("gallery_artworks").insert({
      gallery_id: gallery.id,
      title,
      slug: `${slugify(title)}-${Date.now().toString(36)}`,
      medium: "Digital painting",
      image_url: upload.data.path,
      thumb_url: thumbnail,
      availability: "not_for_sale",
      source: "studio",
      is_published: false,
    });
    setStatus(
      error
        ? "Saved the image, but the listing didn't file. Try sending it again."
        : "Filed in your gallery as a private draft. Nothing is public until you say so.",
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/60 px-4 py-3">
        <h1 className="text-lg font-semibold tracking-tight">Gallery Studio</h1>
        <p className="mt-0.5 max-w-3xl text-xs text-muted-foreground">{STUDIO_PRINCIPLE}</p>
        <p className="mt-1 max-w-3xl text-xs text-muted-foreground/80">{STUDIO_PLAIN_ENGLISH}</p>
        <p className="mt-1 text-[11px] text-muted-foreground/70">
          {STYLUS_NOTE} · {STUDIO_AI_RULE}
        </p>
        {status ? (
          <p className="mt-2 rounded-md bg-primary/10 px-3 py-1.5 text-xs text-primary">{status}</p>
        ) : null}
      </header>
      <ClientOnly fallback={<div className="p-10 text-sm text-muted-foreground">Opening the studio…</div>}>
        <DrawingCanvas onExport={handleExport} />
      </ClientOnly>
    </div>
  );
}
