// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0463 — The First Partner Journal.
// One question a night. Private by default. Shared with the Founder only if the
// Partner chooses to share it.
// ─────────────────────────────────────────────────────────────────────────────

import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { SiteShell } from "@/components/site-shell";
import { LaunchModeBanner } from "@/components/launch-mode-banner";
import { listMyJournal, saveJournalEntry } from "@/lib/partner-journal.functions";
import {
  FIRST_WEEK_PROMISE,
  JOURNAL_MOODS,
  journalPromptFor,
  journalToday,
  type JournalEntry,
} from "@/lib/partner-journal";

export const Route = createFileRoute("/_authenticated/journal")({
  head: () => ({
    meta: [
      { title: "Partner Journal — Frass" },
      {
        name: "description",
        content:
          "A private nightly reflection for Frass Partners: what got done, what was confusing, and what would make tomorrow easier.",
      },
      { property: "og:title", content: "Partner Journal — Frass" },
      { property: "og:description", content: "One question a night. Private unless you choose to share it." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: JournalPage,
});

function JournalPage() {
  const loadFn = useServerFn(listMyJournal);
  const saveFn = useServerFn(saveJournalEntry);

  const entries = useQuery({ queryKey: ["partner-journal"], queryFn: () => loadFn({}) });
  const today = journalToday();
  const prompt = useMemo(() => journalPromptFor(today), [today]);

  const [body, setBody] = useState("");
  const [mood, setMood] = useState<string | null>(null);
  const [shared, setShared] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const rows: JournalEntry[] = entries.data ?? [];
  const todayEntry = rows.find((r) => r.entry_date === today) ?? null;

  useEffect(() => {
    if (!todayEntry) return;
    setBody(todayEntry.body);
    setMood(todayEntry.mood);
    setShared(todayEntry.shared);
  }, [todayEntry?.id]);

  async function save() {
    if (!body.trim() || saving) return;
    setSaving(true);
    try {
      await saveFn({ data: { entryDate: today, prompt, body, mood, shared } });
      await entries.refetch();
      setNote(
        shared
          ? "Saved, and shared with the Founder. Thank you — this is how Frass gets better."
          : "Saved. This one stays with you.",
      );
    } catch (e) {
      setNote(e instanceof Error ? e.message : "Something went wrong saving that.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <SiteShell>
      <div className="mx-auto w-full max-w-3xl px-4 py-10 md:py-14">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">First Partner</p>
        <h1 className="mt-2 font-display text-3xl uppercase tracking-[0.06em] md:text-4xl">Partner Journal</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          One question a night. Nobody reads this but you — unless you tick the box and send it to the Founder.
        </p>

        <LaunchModeBanner className="mt-5" />

        <section className="mt-6 rounded-3xl border border-[color:var(--gold,#d4af37)]/35 bg-[color:var(--gold,#d4af37)]/[0.06] p-6">
          <p className="text-[11px] uppercase tracking-[0.2em] text-[color:var(--gold,#d4af37)]">Tonight's question</p>
          <h2 className="mt-2 font-display text-xl">{prompt}</h2>

          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={7}
            maxLength={5000}
            placeholder="Say it plainly. Nothing is too small."
            className="mt-4 w-full rounded-2xl border border-white/15 bg-black/30 px-4 py-3 text-sm outline-none focus:border-[color:var(--gold,#d4af37)]/60"
          />

          <div className="mt-3 flex flex-wrap gap-2">
            {JOURNAL_MOODS.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMood(mood === m ? null : m)}
                className={`rounded-full border px-4 py-1.5 text-xs ${
                  mood === m
                    ? "border-[color:var(--gold,#d4af37)] text-[color:var(--gold,#d4af37)]"
                    : "border-white/15 text-muted-foreground hover:bg-white/[0.06]"
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          <label className="mt-4 flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              checked={shared}
              onChange={(e) => setShared(e.target.checked)}
              className="mt-1 h-4 w-4 accent-[color:var(--gold,#d4af37)]"
            />
            <span>
              Share this with the Founder.
              <span className="block text-xs text-muted-foreground">
                Off by default. Only entries you tick are ever visible to anyone else.
              </span>
            </span>
          </label>

          <button
            type="button"
            onClick={() => void save()}
            disabled={!body.trim() || saving}
            className="mt-5 rounded-full bg-[color:var(--gold,#d4af37)] px-6 py-2.5 text-sm font-medium text-black disabled:opacity-50"
          >
            {saving ? "Saving…" : todayEntry ? "Update tonight's entry" : "Save tonight's entry"}
          </button>

          {note && <p className="mt-3 text-sm text-muted-foreground">{note}</p>}
        </section>

        <section className="mt-8">
          <h2 className="font-display text-lg uppercase tracking-[0.06em]">The First Week Promise</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Seven days, seven things that should simply make sense. If one isn't true, that's the work.
          </p>
          <ol className="mt-4 space-y-2">
            {FIRST_WEEK_PROMISE.map((p) => (
              <li key={p.day} className="rounded-2xl border border-white/12 bg-white/[0.03] px-4 py-3">
                <p className="text-sm">
                  <span className="text-[color:var(--gold,#d4af37)]">Day {p.day} · </span>
                  {p.promise}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{p.plain}</p>
              </li>
            ))}
          </ol>
        </section>

        {rows.length > 0 && (
          <section className="mt-8">
            <h2 className="font-display text-lg uppercase tracking-[0.06em]">Earlier nights</h2>
            <div className="mt-4 space-y-3">
              {rows
                .filter((r) => r.entry_date !== today)
                .map((r) => (
                  <article key={r.id} className="rounded-2xl border border-white/12 bg-white/[0.03] px-4 py-3">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                      {r.entry_date}
                      {r.mood ? ` · ${r.mood}` : ""}
                      {r.shared ? " · shared with the Founder" : " · private"}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">{r.prompt}</p>
                    <p className="mt-2 whitespace-pre-wrap text-sm">{r.body}</p>
                  </article>
                ))}
            </div>
          </section>
        )}
      </div>
    </SiteShell>
  );
}
