// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0534 — 📖 Legacy Publication
//
// Blueprint-driven, not hardcoded. When a member's Blueprint carries a book
// project (or a manuscript exists in legacy_publications), the Daily shows it
// here — the pipeline stage, chapters drafted, pending handwritten amendments,
// and the formats the same knowledge can become.
//
// Frassy is the editor, never the author. The member reviews and approves
// every draft. For the Mother blueprint the card is voice-first ("Tell me a
// story"); for the Founder's republishing journey it tracks amendments.
// ─────────────────────────────────────────────────────────────────────────────

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { BookOpen, Check, Mic } from "lucide-react";
import { listMemberBlueprints } from "@/lib/blueprints/member-blueprint.functions";
import type { MemberBlueprint } from "@/lib/blueprints/member-blueprint";
import {
  listLegacyPublications,
  applyAmendment,
} from "@/lib/legacy/publication.functions";
import type { LegacyPublication } from "@/lib/legacy/publication-engine";
import {
  PUBLICATION_FORMATS,
  PUBLICATION_STAGES,
  MANUSCRIPT_STATUS_LABEL,
  PUBLICATION_KIND_LABEL,
  COMPLETION_QUESTION,
  EDITOR_PRINCIPLES,
} from "@/lib/legacy/publication-engine";

function statusBadge(status: string) {
  return MANUSCRIPT_STATUS_LABEL[status as keyof typeof MANUSCRIPT_STATUS_LABEL] ?? status;
}

function ManuscriptCard({
  pub,
  onApply,
  applying,
}: {
  pub: LegacyPublication;
  onApply: (publicationId: string, index: number) => void;
  applying: boolean;
}) {
  const pending = pub.amendments
    .map((a, i) => ({ a, i }))
    .filter((x) => !x.a.approved_at);
  const drafted = pub.chapters.filter((c) => c.draft_text).length;

  return (
    <article className="rounded-2xl border border-white/12 bg-white/[0.03] p-4">
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <h4 className="font-display text-lg">
          📖 {pub.title}
        </h4>
        <span className="text-[10px] uppercase tracking-[0.24em] text-[color:var(--gold)]">
          {PUBLICATION_KIND_LABEL[pub.kind]} · {statusBadge(pub.status)}
        </span>
      </header>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {PUBLICATION_STAGES.map((s) => (
          <li
            key={s.id}
            title={s.plain}
            className="rounded-full border border-white/12 bg-black/25 px-2.5 py-1 text-[11px] text-white/60"
          >
            {s.emoji} {s.label}
          </li>
        ))}
      </div>

      <p className="mt-3 text-sm text-white/70">
        {drafted} of {pub.chapters.length || "—"} chapters drafted.
        {pub.versions.length > 0 && ` ${pub.versions.length} version${pub.versions.length === 1 ? "" : "s"} saved.`}
      </p>

      {/* Formats the same knowledge can become. */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {(pub.formats.length ? pub.formats : PUBLICATION_FORMATS.slice(0, 1).map((f) => ({ format: f.id, status: "pending", artifact_url: null }))).map((f, i) => {
          const meta = PUBLICATION_FORMATS.find((m) => m.id === f.format);
          if (!meta) return null;
          return (
            <span
              key={i}
              className="rounded-full border border-white/10 bg-black/20 px-2 py-0.5 text-[11px] text-white/55"
              title={meta.plain}
            >
              {meta.emoji} {meta.label}
              {f.status === "published" ? " ✓" : ""}
            </span>
          );
        })}
      </div>

      {/* Founder republishing — handwritten amendments. */}
      {pub.kind === "republish" && pending.length > 0 && (
        <div className="mt-4 rounded-xl border border-[color:var(--gold)]/25 bg-[color:var(--gold)]/5 p-3">
          <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--gold)]">
            Handwritten amendments to apply
          </p>
          <ul className="mt-2 space-y-2">
            {pending.map(({ a, i }) => (
              <li key={i} className="rounded-lg border border-white/10 bg-black/25 p-2 text-sm">
                <p className="text-white/50">
                  Page {a.page} · {a.reason ?? "no reason given"}
                </p>
                {a.original && (
                  <p className="mt-1 text-white/40 line-through">{a.original}</p>
                )}
                <p className="mt-1 text-white/85">{a.proposed}</p>
                <button
                  type="button"
                  disabled={applying}
                  onClick={() => onApply(pub.id, i)}
                  className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[color:var(--gold)] px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-black disabled:opacity-40"
                >
                  <Check className="h-3 w-3" /> Apply amendment
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="mt-3 text-xs text-white/45">{EDITOR_PRINCIPLES[0]}</p>
    </article>
  );
}

export function LegacyPublicationProgress({ name }: { name?: string }) {
  const listPubs = useServerFn(listLegacyPublications);
  const listBlueprints = useServerFn(listMemberBlueprints);
  const applyFn = useServerFn(applyAmendment);
  const qc = useQueryClient();

  const pubsQuery = useQuery({
    queryKey: ["legacy-publications"],
    queryFn: () => listPubs({}),
    retry: false,
    staleTime: 60_000,
  });
  const bpQuery = useQuery({
    queryKey: ["member-blueprints", "legacy"],
    queryFn: () => listBlueprints({}),
    retry: false,
    staleTime: 60_000,
  });

  const isVoiceFirst = useMemo(() => {
    const rows: MemberBlueprint[] = bpQuery.data ?? [];
    const mine = name
      ? rows.filter((b) => b.member_name?.toLowerCase().includes(name.toLowerCase()))
      : rows;
    return mine.some((b) => b.blueprint_kind === "knowledge-economy");
  }, [bpQuery.data, name]);

  const publications = useMemo<LegacyPublication[]>(() => pubsQuery.data ?? [], [pubsQuery.data]);

  const apply = useMutation({
    mutationFn: (vars: { publication_id: string; index: number }) =>
      applyFn({ data: vars }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["legacy-publications"] }),
  });

  if (publications.length === 0) return null;

  return (
    <div className="space-y-3">
      <p className="flex items-center gap-2 text-sm text-white/60">
        <BookOpen className="h-4 w-4 text-[color:var(--gold)]" />
        Your book projects — every completed journey can become a book, an audiobook, a course and more.
        I'm the editor; you're the author.
      </p>

      {/* Mother blueprint — voice-first storytelling. */}
      {isVoiceFirst && (
        <div className="rounded-2xl border border-[color:var(--gold)]/25 bg-[color:var(--gold)]/5 p-4">
          <p className="flex items-center gap-2 font-display text-lg">
            <Mic className="h-5 w-5 text-[color:var(--gold)]" /> Tell me a story
          </p>
          <p className="mt-2 text-sm text-white/70">
            When you're ready, just start talking — I'll capture the chapter, tidy it up, and bring it
            back for your approval. You always have the final word.
          </p>
        </div>
      )}

      {publications.map((pub) => (
        <ManuscriptCard
          key={pub.id}
          pub={pub}
          onApply={(pid, idx) => apply.mutate({ publication_id: pid, index: idx })}
          applying={apply.isPending}
        />
      ))}

      <p className="rounded-xl border border-white/10 bg-black/20 p-3 text-xs text-white/55">
        💡 {COMPLETION_QUESTION}
      </p>
    </div>
  );
}
