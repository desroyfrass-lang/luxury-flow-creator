// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0464 — Coco Vintage Collection Builder · One Piece at a Time
// Not a catalogue uploader. A daily ritual: photograph a piece, tell Frassy
// about it, approve the page she writes, watch the boutique come alive.
// ─────────────────────────────────────────────────────────────────────────────

import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Camera, Check, Clock, Sparkles, Upload, Wand2 } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { uploadCardPhoto } from "@/lib/card-media";
import { money } from "@/lib/card-commerce";
import {
  COLLECTION_BRAND,
  CONDITIONS,
  DAILY_GOAL,
  EMPTY_DRAFT,
  EMPTY_FACTS,
  SHOT_LIST,
  STORY_PROMPTS,
  coachNotes,
  missingShots,
  progressOf,
  readPhoto,
  readyToDraft,
  readyToTalk,
  type PhotoNote,
  type PieceDraft,
  type PieceFacts,
} from "@/lib/collection-builder";
import { craftPiece, getCollection, publishPiece } from "@/lib/collection-builder.functions";

export const Route = createFileRoute("/_authenticated/collection")({
  head: () => ({
    meta: [
      { title: "Coco Vintage Collection Builder — One Piece at a Time" },
      {
        name: "description",
        content:
          "Photograph one piece, tell its story, and Frassy writes the product page. A boutique built a few beautiful pieces a day — never a catalogue upload.",
      },
      { property: "og:title", content: "Coco Vintage Collection Builder" },
      {
        property: "og:description",
        content: "One garment. One story. One product page. Every day the boutique gets more beautiful.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: CollectionBuilderPage,
});

const panel = "rounded-2xl border border-border/60 bg-background/60 p-6 backdrop-blur";
const heading = "text-xs uppercase tracking-[0.25em] text-muted-foreground";

type Photo = { shot: string; url: string; notes: PhotoNote[] };

function CollectionBuilderPage() {
  const qc = useQueryClient();
  const collectionFn = useServerFn(getCollection);
  const craftFn = useServerFn(craftPiece);
  const publishFn = useServerFn(publishPiece);

  const { data } = useQuery({
    queryKey: ["coco-collection"],
    queryFn: () => collectionFn({ data: { collection: COLLECTION_BRAND } }),
  });

  const [target, setTarget] = useState("148");
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [uploading, setUploading] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [facts, setFacts] = useState<PieceFacts>(EMPTY_FACTS);
  const [draft, setDraft] = useState<PieceDraft | null>(null);

  const progress = useMemo(
    () => progressOf(data?.published ?? 0, Number(target) || 0, data?.todayPublished ?? 0),
    [data, target],
  );

  const taken = photos.map((p) => p.shot);
  const missing = missingShots(taken);

  const attach = async (shot: string, file: File | null) => {
    if (!file) return;
    setUploading(shot);
    try {
      const reading = await readPhoto(file);
      const url = await uploadCardPhoto(file);
      setPhotos((p) => [...p.filter((x) => x.shot !== shot), { shot, url, notes: coachNotes(reading) }]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "That photo could not be added.");
    } finally {
      setUploading(null);
    }
  };

  const craft = useMutation({
    mutationFn: () =>
      craftFn({
        data: {
          answers,
          facts: {
            size: facts.size,
            condition: facts.condition,
            material: facts.material,
            price: facts.price,
          },
          brand: COLLECTION_BRAND,
        },
      }),
    onSuccess: (d) => {
      setDraft({ ...EMPTY_DRAFT, ...d });
      toast.success("Frassy has written the page. Read it before it goes out.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const publish = useMutation({
    mutationFn: () => {
      const d = draft!;
      const front = photos.find((p) => p.shot === "front") ?? photos[0];
      return publishFn({
        data: {
          title: d.title.trim(),
          description: d.description.trim().slice(0, 600),
          price: Number(facts.price) || 0,
          quantity: Math.max(1, Number(facts.quantity) || 1),
          image_url: front?.url ?? null,
          gallery: photos.map((p) => p.url),
          brand: COLLECTION_BRAND,
          collection: COLLECTION_BRAND,
          details: {
            story: d.story,
            styling: d.styling,
            features: d.features,
            condition_summary: d.condition_summary,
            size_info: d.size_info,
            material_info: d.material_info,
            care: d.care,
            seo_description: d.seo_description,
            keywords: d.keywords,
            tags: d.tags,
            answers,
            shots: photos.map((p) => ({ shot: p.shot, url: p.url })),
          },
        },
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["coco-collection"] });
      qc.invalidateQueries({ queryKey: ["card-listings"] });
      setPhotos([]);
      setAnswers({});
      setFacts(EMPTY_FACTS);
      setDraft(null);
      toast.success("Published. Your boutique just got one piece more beautiful.");
    },
    onError: (e: Error) => toast.error(e.message || "That piece could not be published."),
  });

  return (
    <SiteShell>
      <div className="mx-auto max-w-[1100px] px-5 py-10">
        <span className="text-[10px] uppercase tracking-[0.4em] text-[color:var(--hill-gold)]">
          {COLLECTION_BRAND} · selling through FrassKicks
        </span>
        <h1 className="mt-3 font-display text-3xl uppercase md:text-4xl">Collection Builder</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          One garment. One story. One product page. We are not uploading a catalogue — we are building
          a boutique you are proud to share.
        </p>

        {/* ── Today's mission ─────────────────────────────────────────────── */}
        <section className={`${panel} mt-8 border-[color:var(--hill-gold)]/30`}>
          <h2 className={heading}>
            <Sparkles className="mr-2 inline h-3.5 w-3.5" /> Today's {COLLECTION_BRAND} mission
          </h2>
          <p className="mt-2 text-lg">
            {progress.launchReady
              ? "The collection is launch ready. Today belongs to marketing and customers."
              : `Let's add ${progress.todayRemaining || DAILY_GOAL} beautiful ${
                  (progress.todayRemaining || DAILY_GOAL) === 1 ? "piece" : "pieces"
                } to your collection today.`}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <span>{progress.sentence}</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> Estimated time: {progress.estimatedMinutes} minutes
            </span>
            <label className="flex items-center gap-2">
              Collection size
              <input
                className="h-7 w-16 rounded-md border border-border/60 bg-background px-2"
                inputMode="numeric"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
              />
            </label>
          </div>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full bg-[color:var(--hill-gold)]"
              style={{
                width: `${Math.min(100, ((progress.published / (Number(target) || 1)) * 100) || 0)}%`,
              }}
            />
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <strong>Let's break it down:</strong> like a shop window you dress two garments
            at a time — by launch day the whole window is done, and none of it felt like admin.
          </p>
        </section>

        {/* ── Step 1 + 2 · photographs ────────────────────────────────────── */}
        <section className={`${panel} mt-6`}>
          <h2 className={heading}>Step one · photograph the piece</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Front, back and one detail are all we need to begin. Add the label and fabric if you can —
            those are the shots that sell vintage.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {SHOT_LIST.map((s) => {
              const p = photos.find((x) => x.shot === s.id);
              return (
                <div key={s.id} className="rounded-xl border border-border/50 bg-black/10 p-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold">
                      {s.label}
                      {s.required && <span className="ml-1 text-[color:var(--hill-gold)]">·</span>}
                    </span>
                    {p && <Check className="h-3.5 w-3.5 text-emerald-400" />}
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground">{s.plain}</p>
                  {p ? (
                    <img src={p.url} alt={s.label} className="mt-2 h-28 w-full rounded-lg object-cover" />
                  ) : (
                    <div className="mt-2 flex h-28 items-center justify-center rounded-lg border border-dashed border-border/50 text-[11px] text-muted-foreground">
                      No photo yet
                    </div>
                  )}
                  <div className="mt-2 flex gap-2">
                    <label className="ws-chip cursor-pointer text-[11px]">
                      <Camera className="h-3 w-3" />
                      {uploading === s.id ? "Reading…" : "Take"}
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        onChange={(e) => attach(s.id, e.target.files?.[0] ?? null)}
                      />
                    </label>
                    <label className="ws-chip cursor-pointer text-[11px]">
                      <Upload className="h-3 w-3" /> Choose
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => attach(s.id, e.target.files?.[0] ?? null)}
                      />
                    </label>
                  </div>
                  {p?.notes.map((n, i) => (
                    <p
                      key={i}
                      className={`mt-2 text-[11px] ${
                        n.tone === "fix" ? "text-amber-400" : "text-emerald-400"
                      }`}
                    >
                      {n.text}
                    </p>
                  ))}
                </div>
              );
            })}
          </div>
          {missing.length > 0 && (
            <p className="mt-4 text-xs text-muted-foreground">
              Frassy still needs: {missing.map((m) => m.label).join(", ")}.
            </p>
          )}
        </section>

        {/* ── Step 3 · the conversation ───────────────────────────────────── */}
        {readyToTalk(taken) && (
          <section className={`${panel} mt-6`}>
            <h2 className={heading}>Step two · tell me about this piece</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Answer in your own words — a line each is plenty. Frassy writes from what you say, and
              never invents anything you didn't tell her.
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {STORY_PROMPTS.map((q) => (
                <div key={q.id} className="space-y-1.5">
                  <Label className="text-xs">{q.question}</Label>
                  <Textarea
                    rows={2}
                    maxLength={1200}
                    placeholder={q.hint}
                    value={answers[q.id] ?? ""}
                    onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                  />
                </div>
              ))}
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Size</Label>
                <Input
                  value={facts.size}
                  maxLength={80}
                  placeholder="UK 12 / fits like a modern 10"
                  onChange={(e) => setFacts((f) => ({ ...f, size: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Condition</Label>
                <select
                  className="h-10 w-full rounded-md border border-border/60 bg-background px-3 text-sm"
                  value={facts.condition}
                  onChange={(e) => setFacts((f) => ({ ...f, condition: e.target.value }))}
                >
                  <option value="">Choose honestly…</option>
                  {CONDITIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Material</Label>
                <Input
                  value={facts.material}
                  maxLength={160}
                  placeholder="100% Irish linen"
                  onChange={(e) => setFacts((f) => ({ ...f, material: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Price (USD)</Label>
                <Input
                  inputMode="decimal"
                  value={facts.price}
                  onChange={(e) => setFacts((f) => ({ ...f, price: e.target.value }))}
                  placeholder="85.00"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">How many exist</Label>
                <Input
                  inputMode="numeric"
                  value={facts.quantity}
                  onChange={(e) => setFacts((f) => ({ ...f, quantity: e.target.value }))}
                />
              </div>
            </div>

            <Button
              className="mt-5"
              disabled={!readyToDraft(answers) || craft.isPending}
              onClick={() => craft.mutate()}
            >
              <Wand2 className="mr-2 h-4 w-4" />
              {craft.isPending ? "Frassy is writing…" : "Write the page"}
            </Button>
            {!readyToDraft(answers) && (
              <p className="mt-2 text-xs text-muted-foreground">
                Answer any three questions and Frassy has enough to write from.
              </p>
            )}
          </section>
        )}

        {/* ── Step 4 · review before publishing ───────────────────────────── */}
        {draft && (
          <section className={`${panel} mt-6 border-[color:var(--hill-gold)]/30`}>
            <h2 className={heading}>Step three · read it before it goes out</h2>
            <div className="mt-4 grid gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Title</Label>
                <Input
                  value={draft.title}
                  maxLength={120}
                  onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Description</Label>
                <Textarea
                  rows={3}
                  maxLength={600}
                  value={draft.description}
                  onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Story</Label>
                <Textarea
                  rows={3}
                  value={draft.story}
                  onChange={(e) => setDraft({ ...draft, story: e.target.value })}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <DraftList label="Styling" items={draft.styling} />
                <DraftList label="Features" items={draft.features} />
                <DraftLine label="Condition" text={draft.condition_summary} />
                <DraftLine label="Size" text={draft.size_info} />
                <DraftLine label="Material" text={draft.material_info} />
                <DraftLine label="Care" text={draft.care} />
                <DraftLine label="Search description" text={draft.seo_description} />
                <DraftList label="Keywords" items={draft.keywords} />
                <DraftList label="Marketplace tags" items={draft.tags} />
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <Button disabled={publish.isPending || !draft.title.trim()} onClick={() => publish.mutate()}>
                {publish.isPending ? "Publishing…" : "Publish this piece"}
              </Button>
              <Button variant="outline" onClick={() => craft.mutate()} disabled={craft.isPending}>
                Write it again
              </Button>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Payments switch on at launch. Until then every published piece sits ready in your Frass
              Card shop with photographs, story and price already in place.
            </p>
          </section>
        )}

        {/* ── The boutique coming alive ───────────────────────────────────── */}
        <section className={`${panel} mt-6`}>
          <h2 className={heading}>Your boutique</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Not a spreadsheet — the actual storefront, exactly as a customer will meet it.
          </p>
          {(data?.pieces?.length ?? 0) === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              Nothing published yet. The first piece is always the slowest.
            </p>
          ) : (
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {(data?.pieces ?? []).map((p) => (
                <article key={p.id} className="overflow-hidden rounded-xl border border-border/50 bg-black/10">
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.title} className="h-44 w-full object-cover" />
                  ) : (
                    <div className="h-44 w-full bg-white/5" />
                  )}
                  <div className="p-3">
                    <h3 className="text-sm font-semibold">{p.title}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {money(Number(p.price), p.currency)} · {p.status === "sold_out" ? "Sold" : "Available"}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
          <div className="mt-5 flex flex-wrap gap-3 text-xs">
            <Link to="/workspace/wallet" className="ws-chip">
              Wallet & orders
            </Link>
            <Link to="/money-moves" className="ws-chip">
              Money Moves
            </Link>
            <Link to="/workspace/card" className="ws-chip">
              Frass Card
            </Link>
          </div>
        </section>
      </div>
    </SiteShell>
  );
}

function DraftLine({ label, text }: { label: string; text: string }) {
  if (!text) return null;
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">{label}</div>
      <p className="mt-1 text-sm">{text}</p>
    </div>
  );
}

function DraftList({ label, items }: { label: string; items: string[] }) {
  if (!items?.length) return null;
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">{label}</div>
      <ul className="mt-1 space-y-1 text-sm">
        {items.map((i, n) => (
          <li key={n}>· {i}</li>
        ))}
      </ul>
    </div>
  );
}
