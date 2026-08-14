// FRASS-5P000 — the Daily Design Library.
// Twenty arrangements of the same Daily. No layout is more capable than another.

import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Check, LayoutGrid, Share2 } from "lucide-react";
import {
  DAILY_DESIGNS,
  DESIGN_BY_ID,
  RECOMMENDED_ORDER,
  SECTION_BY_ID,
  applyDesign,
} from "@/lib/daily/customization";
import { CUSTOMIZATION_EXAMPLES } from "@/lib/daily/conversational";
import {
  DailyCustomizationProvider,
  useDailyCustomization,
} from "@/components/workspace/daily-customization";
import { listSavedLayouts, saveLayoutPreset } from "@/lib/daily/customization.functions";

export const Route = createFileRoute("/_authenticated/workspace/daily-design")({
  head: () => ({
    meta: [
      { title: "Daily Design Library — Choose how your Daily is organised" },
      {
        name: "description",
        content:
          "Twenty ready-made arrangements of your Frass Daily. Every layout shows the same information with the same capability — only the organisation changes. Rename it, rearrange it, or just tell Frassy.",
      },
      { property: "og:title", content: "Daily Design Library — Frass" },
      {
        property: "og:description",
        content: "Pick a Daily layout, then customise it by talking to Frassy. Same engine underneath.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <DailyCustomizationProvider>
      <DesignLibrary />
    </DailyCustomizationProvider>
  ),
});

function DesignLibrary() {
  const { prefs, update } = useDailyCustomization();
  const saveFn = useServerFn(saveLayoutPreset);
  const listFn = useServerFn(listSavedLayouts);
  const qc = useQueryClient();
  const [presetName, setPresetName] = useState("");

  const saved = useQuery({ queryKey: ["daily-layout-presets"], queryFn: () => listFn(), retry: false });
  const savePreset = useMutation({
    mutationFn: (shared: boolean) =>
      saveFn({ data: { name: presetName.trim() || prefs.name, prefs, shared } }),
    onSuccess: () => {
      setPresetName("");
      void qc.invalidateQueries({ queryKey: ["daily-layout-presets"] });
    },
  });

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Your Daily. Your workflow.</p>
      <h1 className="mt-2 font-display text-3xl uppercase tracking-[0.06em]">Daily Design Library</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        Twenty ways to organise the same Daily. Every one of them shows the same information and does exactly the
        same work — Money Moves, Frassy, your businesses, your money, your security. Only the arrangement changes.
        Pick one, then make it yours.
      </p>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        <strong className="text-foreground">Here's the practical version:</strong> this is like rearranging the furniture. It's
        the same house, the same doors, the same everything — it just sits where you like it.
      </p>

      <div className="mt-6 rounded-2xl border border-border/60 bg-background/60 p-5">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">You don't need this page</p>
        <p className="mt-2 text-sm">
          You can change any of this by talking to Frassy. Try:{" "}
          {CUSTOMIZATION_EXAMPLES.map((e) => `“${e}”`).join(" · ")}
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {DAILY_DESIGNS.map((d) => {
          const active = d.id === prefs.designId;
          return (
            <article
              key={d.id}
              className={`rounded-2xl border p-5 ${
                active ? "border-[color:var(--gold,#d4af37)] bg-[color:var(--gold,#d4af37)]/[0.06]" : "border-border/60 bg-background/60"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-display text-lg uppercase tracking-[0.05em]">{d.name}</h2>
                {active && <Check className="h-4 w-4 text-[color:var(--gold,#d4af37)]" aria-label="Currently in use" />}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{d.feel}</p>

              <DesignSketch designId={d.id} />

              <p className="mt-3 text-xs text-muted-foreground">
                Opens with: {d.order.slice(0, 3).map((id) => SECTION_BY_ID[id]?.label).filter(Boolean).join(" · ")}
              </p>
              <button
                type="button"
                className="mt-4 w-full rounded-full border border-border/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] hover:border-[color:var(--gold,#d4af37)]"
                onClick={() => update(applyDesign(prefs, d.id))}
                disabled={active}
              >
                {active ? "In use" : `Use ${d.name}`}
              </button>
            </article>
          );
        })}
      </div>

      <section className="mt-10 rounded-2xl border border-border/60 bg-background/60 p-6">
        <h2 className="font-display text-lg uppercase tracking-[0.05em]">
          <LayoutGrid className="mr-2 inline h-4 w-4" /> Save this as your own layout
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Give it a name — “My Focus Layout”, “Morning Dashboard”, “Weekend View”. Sharing sends the arrangement
          only: never your businesses, your money or anything personal.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <input
            className="rounded-full border border-border/70 bg-transparent px-4 py-2 text-sm"
            placeholder={prefs.name}
            maxLength={60}
            value={presetName}
            onChange={(e) => setPresetName(e.target.value)}
          />
          <button
            type="button"
            className="rounded-full bg-[color:var(--gold,#d4af37)] px-5 py-2 text-xs font-bold uppercase tracking-[0.2em] text-black disabled:opacity-50"
            onClick={() => savePreset.mutate(false)}
            disabled={savePreset.isPending}
          >
            Save layout
          </button>
          <button
            type="button"
            className="rounded-full border border-border/70 px-5 py-2 text-xs uppercase tracking-[0.2em] disabled:opacity-50"
            onClick={() => savePreset.mutate(true)}
            disabled={savePreset.isPending}
          >
            <Share2 className="mr-1.5 inline h-3.5 w-3.5" /> Save &amp; share with the community
          </button>
        </div>

        {(saved.data?.length ?? 0) > 0 && (
          <ul className="mt-5 grid gap-2 sm:grid-cols-2">
            {saved.data!.map((p) => (
              <li key={p.id} className="flex items-center justify-between rounded-xl border border-border/60 px-4 py-2">
                <span className="text-sm">
                  {p.name}
                  {p.shared && <span className="ml-2 text-xs text-muted-foreground">shared</span>}
                </span>
                <button
                  type="button"
                  className="text-xs uppercase tracking-[0.2em] underline"
                  onClick={() => update({ ...prefs, ...p.prefs, name: p.name })}
                >
                  Use
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="mt-8 text-xs text-muted-foreground">
        Security alerts, account warnings, fraud notifications and legal notices appear in every layout and cannot be
        hidden. <Link to="/room" className="underline">Back to my workspace</Link>
      </p>
    </div>
  );
}

/** A tiny wireframe so a member can see the shape before choosing it. */
function DesignSketch({ designId }: { designId: string }) {
  const design = DESIGN_BY_ID[designId];
  const shape = design?.shape ?? "stack";
  const blocks = (design?.order ?? RECOMMENDED_ORDER).slice(0, 6);
  const grid =
    shape === "two-column"
      ? "grid-cols-2"
      : shape === "mosaic"
        ? "grid-cols-3"
        : shape === "wide-cards"
          ? "grid-cols-1"
          : "grid-cols-1";
  return (
    <div aria-hidden className={`mt-4 grid gap-1.5 rounded-xl bg-foreground/[0.06] p-3 ${grid}`}>
      {blocks.map((id, i) => (
        <span
          key={id}
          className="block rounded-sm bg-foreground/15"
          style={{
            height: shape === "tight-list" ? 8 : shape === "focus" ? 22 : i === 0 ? 20 : 12,
          }}
        />
      ))}
    </div>
  );
}
