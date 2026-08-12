// FRASS-P002-E — First Business Venture · Hidden Assets Monetization.
//
// The best first business is often one that already exists. Photograph it,
// identify it, research it, and — only if you choose — sell it.

import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Camera, Loader2, Search, Sparkles, Tag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageFeedback } from "@/components/page-feedback";
import { supabase } from "@/integrations/supabase/client";
import { IMAGE_ACCEPT, assertImageFile } from "@/lib/uploads";
import {
  ASSET_CATEGORIES,
  CATEGORY_BY_ID,
  FIRST_DOLLAR,
  HIDDEN_ASSETS_BUCKET,
  HIDDEN_ASSETS_PRINCIPLE,
  LEARNING_BY_DOING,
  PHASE_BY_ID,
  STATUS_LABEL,
  VALUATION_HONESTY,
  VENTURE_PHASES,
  collectionEstimate,
  estimateRange,
  isFullyPhotographed,
  money,
  phaseOf,
  todaysAssetMove,
  ventureProgress,
  type AssetCategoryId,
  type HiddenAsset,
} from "@/lib/business/hidden-assets";
import {
  addAsset,
  listMyAssets,
  prepareMyListing,
  removeAsset,
  researchMyAsset,
  saveAsset,
  signMyAssetPhotos,
} from "@/lib/business/hidden-assets.functions";

export const Route = createFileRoute("/_authenticated/workspace/first-venture")({
  head: () => ({
    meta: [
      { title: "First Business Venture — Turn What You Own Into Income" },
      {
        name: "description",
        content:
          "Photograph, identify, research and sell the valuables you already own. Frassy organises your collection one small step at a time, all the way to your first dollar earned.",
      },
      { property: "og:title", content: "First Business Venture — Frass" },
      {
        property: "og:description",
        content: "Discover the value you already own, organise it properly, and sell it when you're ready.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: FirstVenturePage,
});

const panel = "rounded-2xl border border-border/60 bg-background/60 p-6 backdrop-blur";
const heading = "text-xs uppercase tracking-[0.25em] text-muted-foreground";

async function uploadPhoto(file: File): Promise<string> {
  assertImageFile(file);
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth.user?.id;
  if (!uid) throw new Error("Please sign in again.");
  const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const path = `${uid}/${crypto.randomUUID()}.${ext || "jpg"}`;
  const { error } = await supabase.storage
    .from(HIDDEN_ASSETS_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw new Error(error.message);
  return path;
}

function PhotoSlot({
  label,
  path,
  url,
  onPicked,
  busy,
}: {
  label: string;
  path: string | null;
  url?: string;
  onPicked: (file: File) => void;
  busy?: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="flex-1">
      <button
        type="button"
        onClick={() => ref.current?.click()}
        className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl border border-dashed border-border/70 bg-muted/20 text-muted-foreground transition hover:border-primary/60"
        aria-label={`${label} photo`}
      >
        {busy ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : url ? (
          <img src={url} alt={`${label} of this item`} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <span className="flex flex-col items-center gap-1 text-xs">
            <Camera className="h-5 w-5" />
            {path ? "Photo saved" : label}
          </span>
        )}
      </button>
      <input
        ref={ref}
        type="file"
        accept={IMAGE_ACCEPT}
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (f) onPicked(f);
        }}
      />
    </div>
  );
}

function FirstVenturePage() {
  const qc = useQueryClient();
  const listFn = useServerFn(listMyAssets);
  const addFn = useServerFn(addAsset);
  const saveFn = useServerFn(saveAsset);
  const removeFn = useServerFn(removeAsset);
  const signFn = useServerFn(signMyAssetPhotos);
  const researchFn = useServerFn(researchMyAsset);
  const listingFn = useServerFn(prepareMyListing);

  const { data: assets = [], isLoading } = useQuery({
    queryKey: ["hidden-assets"],
    queryFn: () => listFn() as Promise<HiddenAsset[]>,
  });

  const paths = useMemo(
    () => assets.flatMap((a) => [a.front_path, a.back_path].filter(Boolean) as string[]),
    [assets],
  );
  const { data: urls = {} } = useQuery({
    queryKey: ["hidden-asset-photos", paths.join(",")],
    queryFn: () => signFn({ data: { paths } }) as Promise<Record<string, string>>,
    enabled: paths.length > 0,
  });

  const [category, setCategory] = useState<AssetCategoryId>("coins");
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [front, setFront] = useState<string | null>(null);
  const [back, setBack] = useState<string | null>(null);
  const [frontPreview, setFrontPreview] = useState<string | undefined>();
  const [backPreview, setBackPreview] = useState<string | undefined>();
  const [uploading, setUploading] = useState<"front" | "back" | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const progress = useMemo(() => ventureProgress(assets), [assets]);
  const estimate = useMemo(() => collectionEstimate(assets), [assets]);
  const catLabel = CATEGORY_BY_ID[category]?.label.toLowerCase().replace(" collection", "") ?? "item";
  const move = useMemo(() => todaysAssetMove(assets, catLabel), [assets, catLabel]);

  const invalidate = () => qc.invalidateQueries({ queryKey: ["hidden-assets"] });

  const pick = async (side: "front" | "back", file: File) => {
    setUploading(side);
    try {
      const path = await uploadPhoto(file);
      const preview = URL.createObjectURL(file);
      if (side === "front") {
        setFront(path);
        setFrontPreview(preview);
      } else {
        setBack(path);
        setBackPreview(preview);
      }
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setUploading(null);
    }
  };

  const create = useMutation({
    mutationFn: () =>
      addFn({
        data: {
          venture: "coin-collection",
          category,
          name: name.trim() || `${CATEGORY_BY_ID[category]?.label} piece`,
          notes: notes.trim() || null,
          frontPath: front,
          backPath: back,
        },
      }),
    onSuccess: () => {
      setName("");
      setNotes("");
      setFront(null);
      setBack(null);
      setFrontPreview(undefined);
      setBackPreview(undefined);
      invalidate();
      toast.success("Saved. That's one more piece organised.");
    },
    onError: (e: Error) => toast.error(e.message || "Could not save that."),
  });

  const runResearch = async (id: string) => {
    setBusyId(id);
    try {
      await researchFn({ data: { id } });
      invalidate();
      toast.success("Researched. Correct anything I got wrong.");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusyId(null);
    }
  };

  const runListing = async (id: string) => {
    setBusyId(id);
    try {
      await listingFn({ data: { id } });
      invalidate();
      toast.success("Listing prepared for your approval.");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusyId(null);
    }
  };

  const patch = async (id: string, data: Record<string, unknown>) => {
    try {
      await saveFn({ data: { id, ...data } as never });
      invalidate();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const drop = async (id: string) => {
    try {
      await removeFn({ data: { id } });
      invalidate();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <main className="mx-auto w-full max-w-5xl space-y-6 px-4 py-10">
      <header className="space-y-3">
        <p className={heading}>FRASS-P002-E · First Business Venture</p>
        <h1 className="font-display text-3xl sm:text-4xl">Your first business is something you already own</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          {HIDDEN_ASSETS_PRINCIPLE.vision} {HIDDEN_ASSETS_PRINCIPLE.goal}
        </p>
      </header>

      {/* Today's Money Move — one winnable step, never a backlog */}
      <section className={panel}>
        <p className={heading}>Today's Money Move</p>
        <p className="mt-2 text-lg font-medium">{move.label}</p>
        <p className="mt-1 text-sm text-muted-foreground">{move.why}</p>
        <p className="mt-2 text-xs text-muted-foreground">
          {move.minutes} minutes · {move.impact} · {PHASE_BY_ID[move.phase].emoji} Phase{" "}
          {PHASE_BY_ID[move.phase].number}: {PHASE_BY_ID[move.phase].label}
        </p>
      </section>

      {/* First Dollar Earned */}
      <section className={panel}>
        <p className={heading}>
          {FIRST_DOLLAR.emoji} {FIRST_DOLLAR.label}
        </p>
        <p className="mt-2 text-sm leading-relaxed">
          {progress.firstDollarEarned ? FIRST_DOLLAR.after : FIRST_DOLLAR.before}
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          {[
            { label: "Photographed", value: `${progress.photographed}` },
            { label: "Identified", value: `${progress.identified}` },
            { label: "Listed", value: `${progress.listed}` },
            { label: "Earned", value: money(progress.earned) },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-border/50 bg-muted/10 p-3">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="font-display text-xl">{s.value}</p>
            </div>
          ))}
        </div>
        {estimate.counted > 0 && (
          <p className="mt-3 text-xs text-muted-foreground">
            Research across {estimate.counted} researched {estimate.counted === 1 ? "piece" : "pieces"}:{" "}
            {money(estimate.low)} – {money(estimate.high)}. {VALUATION_HONESTY.never}
          </p>
        )}
      </section>

      {/* The four phases */}
      <section className={panel}>
        <p className={heading}>How this works</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {VENTURE_PHASES.map((p) => (
            <div
              key={p.id}
              className={`rounded-xl border p-4 ${progress.phase === p.id ? "border-primary/60 bg-primary/5" : "border-border/50 bg-muted/10"}`}
            >
              <p className="text-sm font-medium">
                {p.emoji} Phase {p.number} — {p.label}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{p.plain}</p>
              <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                {p.steps.map((s) => (
                  <li key={s}>· {s}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Add a piece */}
      <section className={panel}>
        <p className={heading}>Add a piece</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {ASSET_CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategory(c.id)}
              aria-pressed={category === c.id}
              className={`rounded-full border px-3 py-1 text-xs transition ${
                category === c.id
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border/60 text-muted-foreground hover:border-primary/40"
              }`}
            >
              {c.emoji} {c.label}
            </button>
          ))}
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-[220px_1fr]">
          <div className="flex gap-3">
            <PhotoSlot
              label="Front"
              path={front}
              url={frontPreview}
              busy={uploading === "front"}
              onPicked={(f) => pick("front", f)}
            />
            <PhotoSlot
              label="Back"
              path={back}
              url={backPreview}
              busy={uploading === "back"}
              onPicked={(f) => pick("back", f)}
            />
          </div>
          <div className="space-y-3">
            <div>
              <Label htmlFor="asset-name">What is it?</Label>
              <Input
                id="asset-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Old Jamaican penny"
              />
            </div>
            <div>
              <Label htmlFor="asset-notes">Anything you already know (optional)</Label>
              <Textarea
                id="asset-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Where it came from, who gave it to you, how long you've had it."
                rows={3}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Photograph the front and the back, close and clear. That's the whole first step.
            </p>
            <Button
              onClick={() => create.mutate()}
              disabled={create.isPending || (!front && !back && !name.trim())}
            >
              {create.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save this piece
            </Button>
          </div>
        </div>
      </section>

      {/* The collection */}
      <section className="space-y-4">
        <p className={heading}>Your collection {assets.length ? `· ${assets.length}` : ""}</p>
        {isLoading && <p className="text-sm text-muted-foreground">Opening your collection…</p>}
        {!isLoading && assets.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Nothing here yet. One photograph is the whole beginning.
          </p>
        )}
        {assets.map((a) => {
          const phase = PHASE_BY_ID[phaseOf(a)];
          const range = estimateRange(a);
          const busy = busyId === a.id;
          return (
            <article key={a.id} className={panel}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-base font-medium">
                    {CATEGORY_BY_ID[a.category]?.emoji ?? "✨"} {a.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {phase.emoji} Phase {phase.number}: {phase.label} · {STATUS_LABEL[a.status]}
                    {isFullyPhotographed(a) ? "" : " · needs both photos"}
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => drop(a.id)} aria-label="Remove this piece">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-[200px_1fr]">
                <div className="flex gap-2">
                  {[a.front_path, a.back_path].map((p, i) =>
                    p ? (
                      <img
                        key={p}
                        src={urls[p]}
                        alt={`${i === 0 ? "Front" : "Back"} of ${a.name}`}
                        className="aspect-square w-full rounded-xl border border-border/50 object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div
                        key={`missing-${i}`}
                        className="flex aspect-square w-full items-center justify-center rounded-xl border border-dashed border-border/60 text-[11px] text-muted-foreground"
                      >
                        {i === 0 ? "Front" : "Back"} missing
                      </div>
                    ),
                  )}
                </div>

                <div className="space-y-3">
                  <div className="grid gap-2 sm:grid-cols-2">
                    {[
                      ["Country", a.country],
                      ["Year", a.year_text],
                      ["Denomination", a.denomination],
                      ["Condition", a.condition_note],
                    ].map(([label, value]) => (
                      <p key={label as string} className="text-xs text-muted-foreground">
                        <span className="text-foreground">{label}:</span> {value || "—"}
                      </p>
                    ))}
                  </div>

                  {range && (
                    <p className="text-sm">
                      Research estimate: <span className="font-medium">{range}</span>{" "}
                      <span className="text-xs text-muted-foreground">— {VALUATION_HONESTY.label}</span>
                    </p>
                  )}
                  {a.appraisal_recommended && (
                    <p className="text-xs text-muted-foreground">
                      🧾 Worth having this one appraised professionally before you sell.
                    </p>
                  )}
                  {a.research_notes && (
                    <p className="whitespace-pre-line text-xs leading-relaxed text-muted-foreground">
                      {a.research_notes}
                    </p>
                  )}
                  {a.listing_description && (
                    <div className="rounded-xl border border-border/50 bg-muted/10 p-3">
                      <p className="text-sm font-medium">{a.listing_title}</p>
                      <p className="mt-1 whitespace-pre-line text-xs leading-relaxed text-muted-foreground">
                        {a.listing_description}
                      </p>
                      {a.listing_price != null && (
                        <p className="mt-2 text-sm">Suggested price: {money(Number(a.listing_price))}</p>
                      )}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="secondary" disabled={busy} onClick={() => runResearch(a.id)}>
                      {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                      Identify &amp; research
                    </Button>
                    <Button size="sm" variant="secondary" disabled={busy} onClick={() => runListing(a.id)}>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Prepare listing
                    </Button>
                    {a.status !== "sold" && (
                      <>
                        <Button size="sm" variant="outline" onClick={() => patch(a.id, { status: "listed" })}>
                          <Tag className="mr-2 h-4 w-4" />
                          Mark as listed
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => {
                            const entered = window.prompt("What did it sell for?");
                            if (entered == null) return;
                            const amount = Number(entered.replace(/[^0-9.]/g, ""));
                            if (!Number.isFinite(amount) || amount < 0) {
                              toast.error("Please enter a number.");
                              return;
                            }
                            patch(a.id, { status: "sold", soldAmount: amount });
                          }}
                        >
                          Mark as sold
                        </Button>
                      </>
                    )}
                    {a.status === "sold" && a.sold_amount != null && (
                      <span className="self-center text-sm">
                        ⭐ Sold for {money(Number(a.sold_amount))}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </section>

      <section className={panel}>
        <p className={heading}>What you're learning without being taught</p>
        <p className="mt-2 text-sm text-muted-foreground">{LEARNING_BY_DOING.join(" · ")}</p>
        <p className="mt-3 text-sm leading-relaxed">{HIDDEN_ASSETS_PRINCIPLE.founder}</p>
      </section>

      <PageFeedback pageTitle="First Business Venture" />
    </main>
  );
}
