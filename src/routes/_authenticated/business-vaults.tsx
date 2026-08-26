// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0469 — Future Business Vault Library
//
// A shelf for tomorrow's businesses. Nothing on this page schedules work,
// generates Money Moves or moves Launch Readiness. Ideas wait here until the
// partner says the word.
// ─────────────────────────────────────────────────────────────────────────────

import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Archive, Check, Lock, Plus, Trash2 } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import {
  ACTIVE_LAUNCH_PRIORITIES,
  PLAIN_ENGLISH,
  VAULT_IDEAS,
  activationPhrase,
  ideaByKey,
  type FutureVaultRow,
} from "@/lib/business/future-vaults";
import { FREEDOM_LEVELS, THREE_LEVELS_PRINCIPLE } from "@/lib/business/three-levels";
import {
  BUSINESS_VAULTS,
  FAMILY_PRINCIPLE,
  STAGE_LABEL,
  STAGE_PLAIN,
  movesByStage,
  pathwayMinutes,
  type VaultStage,
  type BusinessVault,
} from "@/lib/business/vault-family";
import {
  ADAPTIVE_PRINCIPLE,
  COACHING_STYLE,
  FASHION_TRACKS,
  SKILL_LABEL,
  SKILL_PLAIN,
  genericTracks,
  trackFor,
  type SkillLevel,
} from "@/lib/business/skill-levels";
import {
  activateFutureVault,
  listFutureVaults,
  removeFutureVault,
  saveFutureVault,
  updateFutureVaultNotes,
} from "@/lib/business/future-vaults.functions";
import { VaultPriorityTag } from "@/components/builder-os/vault-priority-tag";
import { ViewModeFrame } from "@/components/view-mode/simplified-view";
import { ViewModeToggle } from "@/components/view-mode/view-mode-toggle";

export const Route = createFileRoute("/_authenticated/business-vaults")({
  head: () => ({
    meta: [
      { title: "Future Business Vaults — Frass Business Builder" },
      {
        name: "description",
        content:
          "Park future business ideas — freight, a book, a restaurant, a clothing line — without letting them distract from the businesses you're launching now.",
      },
      { property: "og:title", content: "Future Business Vaults — Frass Business Builder" },
      {
        property: "og:description",
        content: "Ideas are remembered, never activated until you're ready. Nothing here touches your Daily.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: FutureVaultsPage,
});

function FutureVaultsPage() {
  const listFn = useServerFn(listFutureVaults);
  const saveFn = useServerFn(saveFutureVault);
  const notesFn = useServerFn(updateFutureVaultNotes);
  const activateFn = useServerFn(activateFutureVault);
  const removeFn = useServerFn(removeFutureVault);
  const qc = useQueryClient();

  const vaults = useQuery({ queryKey: ["future-vaults"], queryFn: () => listFn({}) });
  const rows = useMemo<FutureVaultRow[]>(() => vaults.data ?? [], [vaults.data]);

  const invalidate = () => qc.invalidateQueries({ queryKey: ["future-vaults"] });

  const save = useMutation({ mutationFn: (v: any) => saveFn({ data: v }), onSuccess: invalidate });
  const setNotes = useMutation({
    mutationFn: (v: { id: string; notes: string }) => notesFn({ data: v }),
    onSuccess: invalidate,
  });
  const activate = useMutation({
    mutationFn: (v: { id: string }) => activateFn({ data: v }),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: (v: { id: string }) => removeFn({ data: v }),
    onSuccess: invalidate,
  });

  const [openKey, setOpenKey] = useState<string | null>(null);
  const [openFamily, setOpenFamily] = useState<string | null>(null);
  const [draftNotes, setDraftNotes] = useState<Record<string, string>>({});
  const [customLabel, setCustomLabel] = useState("");

  const shelved = new Set(rows.map((r) => r.key));
  const familyKeys = new Set(BUSINESS_VAULTS.map((v) => v.key));
  const suggestions = VAULT_IDEAS.filter((i) => !shelved.has(i.key) && !familyKeys.has(i.key));

  return (
    // FRASS-0517 — every Business Vault works either way: the full workshop,
    // or the same vault as a guided conversation with Frassy.
    <ViewModeFrame
      place="Business Vaults"
      task={{
        title: "Which business would you like to work on?",
        detail:
          "Say the name of a vault — Seamstress, Freight, Wellness, Photography, Music — and I'll open it and walk you through the next step.",
      }}
    >
    <SiteShell>
      <div className="mx-auto max-w-4xl px-4 py-10">
        <header className="relative">
          <ViewModeToggle className="absolute right-0 top-0" />
          <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">FRASS-0469</p>
          <h1 className="mt-2 font-display text-3xl uppercase tracking-[0.06em] sm:text-4xl">
            Future Business Vaults
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
            A shelf for the businesses that come <em>after</em> the ones you're launching now. Nothing here appears in
            your Daily, generates Money Moves or counts toward Launch Readiness — until you activate it yourself.
          </p>
        </header>

        {/* FRASS-0610 — ideas are not ownership. */}
        <div className="mt-6 rounded-3xl border border-[color:var(--gold)]/40 bg-black/25 p-5">
          <p className="text-sm">
            Everything on this page is a <strong>suggestion</strong>. A workspace you actually own —
            with your own clients, work, dates and money in it — is a Vault.
          </p>
          <Link
            to="/vaults"
            className="mt-3 inline-block rounded-sm border border-[color:var(--gold)] px-5 py-2.5 text-[11px] uppercase tracking-[0.28em] text-[color:var(--gold)]"
          >
            Go to My Vaults
          </Link>
        </div>


        {/* What is actually getting attention today */}
        <section className="mt-8 rounded-3xl border border-white/12 bg-white/[0.03] p-5">
          <h2 className="font-display text-lg uppercase tracking-[0.06em]">Getting all the attention right now</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {ACTIVE_LAUNCH_PRIORITIES.map((b) => (
              <li key={b.label} className="rounded-full border border-white/15 bg-black/25 px-3 py-1.5 text-sm">
                {b.emoji} {b.label}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted-foreground">
            These five carry the Daily until they reach launch readiness. Everything on the shelf below stays quiet.
          </p>
        </section>

        {/* FRASS-0533-A — Three Levels of Financial Freedom */}
        <section className="mt-10 rounded-3xl border border-[color:var(--gold)]/25 bg-[color:var(--gold)]/5 p-5">
          <h2 className="font-display text-lg uppercase tracking-[0.06em]">
            Three Levels of Financial Freedom
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            {THREE_LEVELS_PRINCIPLE.headline} {THREE_LEVELS_PRINCIPLE.founderPrinciple}
          </p>
          <ul className="mt-4 grid gap-3 sm:grid-cols-3">
            {FREEDOM_LEVELS.map((l) => (
              <li key={l.id} className="rounded-2xl border border-white/12 bg-black/25 p-4">
                <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">{l.stage}</p>
                <h3 className="mt-1 font-display text-base">
                  {l.emoji} {l.label}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">{l.plain}</p>
                <p className="mt-2 text-xs text-muted-foreground">{l.examples.join(" · ")}</p>
                <p className="mt-2 text-xs text-muted-foreground/80">{l.ceiling}</p>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted-foreground">{THREE_LEVELS_PRINCIPLE.plain}</p>
        </section>

        {/* FRASS-0503 — the family of Business Vaults */}
        <section className="mt-10">
          <h2 className="font-display text-lg uppercase tracking-[0.06em]">The family of Business Vaults</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            {FAMILY_PRINCIPLE.headline} Each Vault is a complete pathway — <em>Discover → Build → Monetize</em> — and
            every one of them ends somewhere real: a listing, a bookable service, a live collection.
          </p>
          <ul className="mt-5 grid gap-4">
            {BUSINESS_VAULTS.map((v) => {
              const open = openFamily === v.key;
              const already = shelved.has(v.key);
              return (
                <li key={v.key} className="rounded-3xl border border-white/12 bg-white/[0.03] p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-display text-xl uppercase tracking-[0.05em]">
                        {v.emoji} {v.label}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">{v.summary}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{v.forWho}</p>
                      {/* SPEC-BLUEPRINT-001-FINAL §4 — every Vault carries one classification. */}
                      <div className="mt-3">
                        <VaultPriorityTag vaultKey={v.key} />
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setOpenFamily(open ? null : v.key)}
                        className="rounded-full border border-white/15 px-3 py-1.5 text-xs uppercase tracking-[0.14em]"
                      >
                        {open ? "Hide pathway" : "See the pathway"}
                      </button>
                      <button
                        type="button"
                        disabled={already}
                        onClick={() =>
                          save.mutate({
                            key: v.key,
                            emoji: v.emoji,
                            label: v.label,
                            summary: v.summary,
                            rationale: `Ends at: ${v.monetizationOutcome}`,
                          })
                        }
                        className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1.5 text-xs uppercase tracking-[0.14em] disabled:opacity-40"
                      >
                        <Plus className="h-3.5 w-3.5" /> {already ? "On the shelf" : "Shelve for later"}
                      </button>
                    </div>
                  </div>

                  {open && (
                    <div className="mt-4 space-y-5 border-t border-white/10 pt-4">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                          Ways to run it
                        </p>
                        <ul className="mt-2 flex flex-wrap gap-2">
                          {v.paths.map((p) => (
                            <li
                              key={p}
                              className="rounded-full border border-white/12 bg-black/25 px-3 py-1 text-xs text-muted-foreground"
                            >
                              {p}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {v.designSupport && (
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                            Creative support
                          </p>
                          <p className="mt-2 text-sm text-muted-foreground">{v.designSupport.join(" · ")}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Frassy organises the process. The vision stays yours.
                          </p>
                        </div>
                      )}

                      <VaultDepth vault={v} />


                      <div className="grid gap-4 sm:grid-cols-3">
                        {(["discover", "build", "monetize"] as VaultStage[]).map((stage) => (
                          <div key={stage} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                            <p className="font-display text-sm uppercase tracking-[0.14em]">{STAGE_LABEL[stage]}</p>
                            <p className="mt-1 text-[11px] text-muted-foreground">{STAGE_PLAIN[stage]}</p>
                            <ol className="mt-3 grid gap-1.5 text-sm text-muted-foreground">
                              {movesByStage(v, stage).map((m) => (
                                <li key={m.title}>
                                  · {m.title} <span className="text-xs opacity-70">({m.minutes} min)</span>
                                </li>
                              ))}
                            </ol>
                          </div>
                        ))}
                      </div>

                      <p className="text-sm text-green-200">
                        Ends at: {v.monetizationOutcome}{" "}
                        <span className="text-muted-foreground">
                          — about {Math.round(pathwayMinutes(v) / 60)}h of real work, spread over as many days as you
                          have.
                        </span>
                      </p>
                      {(v.showcase || v.manufacturing) && (
                        <div className="flex flex-wrap items-center gap-2">
                          {v.showcase && (
                            <Link
                              to={v.showcase.to as never}
                              className="rounded-full border border-white/15 px-3 py-1.5 text-xs uppercase tracking-[0.14em]"
                            >
                              Show the work in {v.showcase.label}
                            </Link>
                          )}
                          {v.manufacturing && (
                            <Link
                              to="/manufacturing"
                              className="rounded-full border border-white/15 px-3 py-1.5 text-xs uppercase tracking-[0.14em]"
                            >
                              🏭 Have it made for you
                            </Link>
                          )}
                          {v.showcase && (
                            <span className="text-xs text-muted-foreground">{v.showcase.note}</span>
                          )}
                        </div>
                      )}

                      <p className="text-xs text-muted-foreground">
                        Nothing here touches your Daily until you activate it. When you're ready, tell Frassy:{" "}
                        <span className="italic">“{activationPhrase(v.label.replace(" Vault", ""))}”</span>
                      </p>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
          <p className="mt-4 text-xs text-muted-foreground">{FAMILY_PRINCIPLE.plain}</p>
        </section>


        {/* The shelf */}
        <section className="mt-8">
          <h2 className="font-display text-lg uppercase tracking-[0.06em]">On the shelf</h2>
          {vaults.isLoading && <p className="mt-3 text-sm text-muted-foreground">Opening the shelf…</p>}
          {!vaults.isLoading && rows.length === 0 && (
            <p className="mt-3 text-sm text-muted-foreground">
              Nothing shelved yet. Add an idea below and Frassy will remember it without ever bringing it up.
            </p>
          )}
          <ul className="mt-4 grid gap-4">
            {rows.map((r) => {
              const idea = ideaByKey(r.key);
              const open = openKey === r.key;
              const activated = r.status === "activated";
              return (
                <li
                  key={r.id}
                  className={`rounded-3xl border p-5 ${
                    activated ? "border-green-400/40 bg-green-400/[0.06]" : "border-white/12 bg-white/[0.03]"
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-display text-xl uppercase tracking-[0.05em]">
                        {r.emoji} {r.label}
                      </h3>
                      {r.summary && <p className="mt-1 text-sm text-muted-foreground">{r.summary}</p>}
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.16em] ${
                        activated
                          ? "bg-green-400/15 text-green-200"
                          : "bg-white/8 text-muted-foreground"
                      }`}
                    >
                      {activated ? "Activated" : "Future build"}
                    </span>
                  </div>

                  {r.rationale && <p className="mt-3 text-sm text-muted-foreground">{r.rationale}</p>}

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setOpenKey(open ? null : r.key)}
                      className="rounded-full border border-white/15 px-3 py-1.5 text-xs uppercase tracking-[0.14em]"
                    >
                      {open ? "Hide details" : "Details & notes"}
                    </button>
                    {!activated && (
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Start building ${r.label} now? This adds it to your Daily.`)) {
                            activate.mutate({ id: r.id });
                          }
                        }}
                        className="inline-flex items-center gap-2 rounded-full bg-[var(--gold,#d4af37)] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-black"
                      >
                        <Check className="h-3.5 w-3.5" /> Activate
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Remove ${r.label} from the shelf?`)) remove.mutate({ id: r.id });
                      }}
                      className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1.5 text-xs uppercase tracking-[0.14em] text-muted-foreground"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Remove
                    </button>
                  </div>

                  {open && (
                    <div className="mt-4 space-y-4 border-t border-white/10 pt-4">
                      {!activated && (
                        <p className="flex items-start gap-2 text-xs text-muted-foreground">
                          <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                          Sleeping. No Daily tasks, no Money Moves, no readiness score, no reminders. When you're ready,
                          tell Frassy: <span className="ml-1 italic">“{activationPhrase(r.label)}”</span>
                        </p>
                      )}
                      {idea && (
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                            What Frassy would build on activation
                          </p>
                          <ol className="mt-2 grid gap-1.5 text-sm">
                            {idea.roadmap.map((step, i) => (
                              <li key={step} className="text-muted-foreground">
                                {i + 1}. {step}
                              </li>
                            ))}
                          </ol>
                        </div>
                      )}
                      <div>
                        <label className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                          Private notes
                        </label>
                        <textarea
                          value={draftNotes[r.id] ?? r.notes ?? ""}
                          onChange={(e) => setDraftNotes((d) => ({ ...d, [r.id]: e.target.value }))}
                          rows={4}
                          placeholder="Contacts, carriers, lane ideas, anything you want to keep for later."
                          className="mt-2 w-full rounded-2xl border border-white/12 bg-black/30 p-3 text-sm outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setNotes.mutate({ id: r.id, notes: draftNotes[r.id] ?? r.notes ?? "" })}
                          className="mt-2 rounded-full border border-white/15 px-3 py-1.5 text-xs uppercase tracking-[0.14em]"
                        >
                          Save notes
                        </button>
                      </div>
                      {activated && (
                        <p className="text-sm text-green-200">
                          Activated. Build it out in the{" "}
                          <Link to="/business-builder" className="underline">
                            Business Builder
                          </Link>{" "}
                          and it will start showing up in your{" "}
                          <Link to="/money-moves" className="underline">
                            Money Moves
                          </Link>
                          .
                        </p>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </section>

        {/* Add to the shelf */}
        <section className="mt-10 rounded-3xl border border-white/12 bg-white/[0.03] p-5">
          <h2 className="flex items-center gap-2 font-display text-lg uppercase tracking-[0.06em]">
            <Archive className="h-4 w-4" /> Add an idea to the shelf
          </h2>
          {suggestions.length > 0 && (
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {suggestions.map((i) => (
                <li key={i.key} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="font-display text-base uppercase tracking-[0.05em]">
                    {i.emoji} {i.label}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{i.summary}</p>
                  <button
                    type="button"
                    onClick={() =>
                      save.mutate({
                        key: i.key,
                        emoji: i.emoji,
                        label: i.label,
                        summary: i.summary,
                        rationale: i.rationale,
                      })
                    }
                    className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1.5 text-xs uppercase tracking-[0.14em]"
                  >
                    <Plus className="h-3.5 w-3.5" /> Shelve for later
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <input
              value={customLabel}
              onChange={(e) => setCustomLabel(e.target.value)}
              placeholder="Your own idea — e.g. Trucking school"
              className="min-w-[240px] flex-1 rounded-full border border-white/12 bg-black/30 px-4 py-2 text-sm outline-none"
            />
            <button
              type="button"
              disabled={!customLabel.trim()}
              onClick={() => {
                const label = customLabel.trim();
                if (!label) return;
                save.mutate({
                  key: label.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 60),
                  emoji: "💡",
                  label,
                  summary: "Saved for a future phase.",
                  rationale: "Parked by you. Frassy will keep it safe and stay quiet about it.",
                });
                setCustomLabel("");
              }}
              className="rounded-full bg-[var(--gold,#d4af37)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-black disabled:opacity-40"
            >
              Add to shelf
            </button>
          </div>
        </section>

        <p className="mt-8 text-xs text-muted-foreground">
          Part of the Business Builder —{" "}
          <Link to="/launch-accelerator" className="underline">
            Launch Accelerator
          </Link>{" "}
          ·{" "}
          <Link to="/money-moves" className="underline">
            Money Moves
          </Link>{" "}
          ·{" "}
          <Link to="/business-builder" className="underline">
            Build a business
          </Link>
        </p>
        <p className="mt-2 text-xs text-muted-foreground">{PLAIN_ENGLISH}</p>
      </div>
    </SiteShell>
    </ViewModeFrame>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0511-A — Adaptive depth. The Vault never assumes what you already know.
// Same destination for everyone; only the depth of guidance changes.
// ─────────────────────────────────────────────────────────────────────────────
function VaultDepth({ vault }: { vault: BusinessVault }) {
  const [level, setLevel] = useState<SkillLevel>("beginner");
  const tracks = vault.key === "seamstress" ? FASHION_TRACKS : genericTracks(vault.craft ?? "this work");
  const track = trackFor(tracks, level);

  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        Where are you starting from?
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {(["beginner", "intermediate", "advanced"] as SkillLevel[]).map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => setLevel(l)}
            aria-pressed={l === level}
            className={`rounded-full px-3 py-1.5 text-xs uppercase tracking-[0.14em] ${
              l === level ? "bg-white text-black" : "border border-white/15"
            }`}
          >
            {SKILL_LABEL[l]}
          </button>
        ))}
      </div>
      <p className="mt-3 text-sm text-muted-foreground">{SKILL_PLAIN[level]}</p>
      <p className="mt-1 text-xs text-muted-foreground">{COACHING_STYLE[level]}</p>
      <p className="mt-3 text-sm">
        <span className="text-muted-foreground">You'll learn:</span> {track.teaches.join(" · ")}
      </p>
      <p className="mt-2 text-sm text-green-200">💰 {track.moneyMove}</p>
      <p className="mt-1 text-xs text-muted-foreground">{track.firstResult}</p>
      <p className="mt-3 text-xs text-muted-foreground">{ADAPTIVE_PRINCIPLE.rule}</p>
    </div>
  );
}
