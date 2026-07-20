import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { SiteShell } from "@/components/site-shell";
import { runVisualSearch, type VisualMatch } from "@/lib/visual-discovery.functions";

export const Route = createFileRoute("/visual-search")({
  component: VisualSearchPage,
  head: () => ({
    meta: [
      { title: "Visual Discovery · Frass Hill" },
      {
        name: "description",
        content:
          "Show Frassy a photo — she'll find the Frass Hill pieces that share the same feeling, silhouette, or palette.",
      },
    ],
  }),
});

type SearchResponse = Awaited<ReturnType<typeof runVisualSearch>>;

function VisualSearchPage() {
  const search = useServerFn(runVisualSearch);
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [response, setResponse] = useState<SearchResponse | null>(null);
  const [uploading, setUploading] = useState(false);
  const [source, setSource] = useState<"both" | "shopify" | "viral">("both");

  const run = useMutation({
    mutationFn: async (storagePath: string) =>
      search({ data: { storage_path: storagePath, source_filter: source, match_count: 12 } }),
    onSuccess: (r) => {
      setResponse(r);
      if (r.refused) {
        toast.error(r.attributes.refuse_reason || "I can't analyze that image.");
      } else if (r.results.length === 0) {
        toast("No close matches yet — try a clearer image or a different angle.");
      }
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const onPick = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image is too large. Please choose one under 10 MB.");
      return;
    }
    setUploading(true);
    setPreview(URL.createObjectURL(file));
    setResponse(null);

    try {
      const { data: userRes } = await supabase.auth.getUser();
      const uid = userRes.user?.id;
      if (!uid) {
        toast.error("Please sign in to use visual discovery.");
        setUploading(false);
        return;
      }
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${uid}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("visual-uploads")
        .upload(path, file, { contentType: file.type, upsert: false });
      if (upErr) throw upErr;
      run.mutate(path);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const busy = uploading || run.isPending;

  return (
    <SiteShell>
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-6xl px-6 py-16 space-y-12">
        <header className="text-center space-y-4">
          <p className="text-xs uppercase tracking-[0.4em] text-white/50">Visual Discovery</p>
          <h1 className="text-4xl font-light tracking-wide sm:text-5xl">
            Show me a piece of inspiration.
          </h1>
          <p className="mx-auto max-w-xl text-sm text-white/60">
            Upload any image — a screenshot, a magazine shot, a moment from your camera roll.
            Frassy will find Frass Hill pieces with the same feeling. Your image auto-deletes after 24 hours unless you save it.
          </p>
        </header>

        <section className="mx-auto max-w-2xl">
          <div className="flex items-center justify-center gap-2 mb-4 text-xs uppercase tracking-widest text-white/50">
            <button
              onClick={() => setSource("both")}
              className={`rounded-full px-3 py-1 border ${source === "both" ? "border-white bg-white/10" : "border-white/20"}`}
            >
              All Frass Hill
            </button>
            <button
              onClick={() => setSource("shopify")}
              className={`rounded-full px-3 py-1 border ${source === "shopify" ? "border-white bg-white/10" : "border-white/20"}`}
            >
              Drip · Kicks · Bare
            </button>
            <button
              onClick={() => setSource("viral")}
              className={`rounded-full px-3 py-1 border ${source === "viral" ? "border-white bg-white/10" : "border-white/20"}`}
            >
              Virals
            </button>
          </div>

          <label
            htmlFor="visual-upload"
            className="group relative flex aspect-square w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-3xl border border-dashed border-white/20 bg-white/[0.02] transition hover:border-white/40"
          >
            {preview ? (
              <img src={preview} alt="Your inspiration" className="h-full w-full object-cover" />
            ) : (
              <div className="text-center px-8">
                <div className="text-6xl font-thin text-white/40">+</div>
                <p className="mt-3 text-sm text-white/70">Upload or drop an image</p>
                <p className="mt-1 text-xs text-white/40">JPG, PNG, or HEIC · up to 10 MB</p>
              </div>
            )}
            {busy && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-sm tracking-wide">
                {uploading ? "Uploading…" : "Frassy is looking…"}
              </div>
            )}
          </label>
          <input
            id="visual-upload"
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onPick(f);
            }}
          />
        </section>

        {response && !response.refused && (
          <section className="space-y-6">
            {(response.attributes.primary_color || response.attributes.silhouette || response.attributes.mood) && (
              <div className="mx-auto max-w-2xl rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-sm text-white/70">
                <p className="text-xs uppercase tracking-widest text-white/40 mb-2">What Frassy sees</p>
                <p>
                  {[
                    response.attributes.category,
                    response.attributes.primary_color && `${response.attributes.primary_color} palette`,
                    response.attributes.silhouette && `${response.attributes.silhouette} silhouette`,
                    response.attributes.mood && `${response.attributes.mood} feeling`,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                {response.attributes.uncertainty_notes && (
                  <p className="mt-2 text-xs text-white/40 italic">
                    {response.attributes.uncertainty_notes}
                  </p>
                )}
              </div>
            )}

            {response.results.length > 0 && (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {response.results.map((m) => (
                  <MatchCard key={m.id} match={m} />
                ))}
              </div>
            )}
          </section>
        )}

        {response?.refused && (
          <div className="mx-auto max-w-xl text-center text-sm text-white/60">
            {response.attributes.refuse_reason ||
              "I'd rather not analyze that image. Try uploading a fashion photo instead."}
          </div>
        )}
      </div>
    </div>
  );
}

function MatchCard({ match }: { match: VisualMatch }) {
  const href =
    match.source_type === "shopify"
      ? `/product/${match.handle}`
      : `/social-media-virals/${match.category_slug}/${match.sub_slug}/${match.handle}`;
  return (
    <Link
      to={href}
      className="group block overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] transition hover:border-white/30"
    >
      <div className="aspect-square overflow-hidden bg-black">
        <img
          src={match.image_url}
          alt={match.title}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
      </div>
      <div className="p-4 space-y-1">
        <p className="text-sm text-white/90 truncate">{match.title}</p>
        {match.price && <p className="text-xs text-white/50">${match.price}</p>}
        <p className="text-[11px] uppercase tracking-widest text-white/40 pt-1">{match.why}</p>
      </div>
    </Link>
  );
}
