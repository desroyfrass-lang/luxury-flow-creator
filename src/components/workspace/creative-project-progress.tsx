// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0533 — 🎬 Episode Progress
//
// Blueprint-driven, not hardcoded. Whatever creative projects a member's
// Blueprint carries, the Daily shows them here — current instalment, script,
// production, upload, thumbnail and publishing date — and Frassy asks the one
// weekly question that keeps the series moving.
// ─────────────────────────────────────────────────────────────────────────────

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Clapperboard } from "lucide-react";
import { listMemberBlueprints } from "@/lib/blueprints/member-blueprint.functions";
import type { CreativeProject, MemberBlueprint } from "@/lib/blueprints/member-blueprint";
import { EPISODE_STAGES, seriesForProject } from "@/lib/creative/series";

function statusLine(label: string, value?: string | null) {
  if (!value) return null;
  return (
    <div className="rounded-xl border border-white/12 bg-black/25 px-3 py-2">
      <p className="text-[10px] uppercase tracking-[0.24em] text-white/40">{label}</p>
      <p className="mt-0.5 text-sm">{value}</p>
    </div>
  );
}

function ProjectCard({ p }: { p: CreativeProject }) {
  const series = seriesForProject(p.name);
  return (
    <article className="rounded-2xl border border-white/12 bg-white/[0.03] p-4">
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <h4 className="font-display text-lg">
          {series?.emoji ?? "🎬"} {p.name}
        </h4>
        <span className="text-[10px] uppercase tracking-[0.24em] text-[color:var(--gold)]">
          {p.status ?? "Active weekly project"}
        </span>
      </header>

      <p className="mt-2 text-sm text-white/70">
        {series
          ? series.weeklyQuestion
          : `Are we creating this week's instalment of ${p.name}?`}
      </p>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {statusLine("Current", p.current_episode)}
        {statusLine("Script", p.script_status)}
        {statusLine("Animation", p.production_status)}
        {statusLine("Upload", p.upload_status)}
        {statusLine("Thumbnail", p.thumbnail_status)}
        {statusLine("Publishing", p.publish_date)}
      </div>

      <ol className="mt-3 flex flex-wrap gap-1.5">
        {EPISODE_STAGES.map((s) => (
          <li
            key={s.id}
            title={s.plain}
            className="rounded-full border border-white/12 bg-black/25 px-2.5 py-1 text-[11px] text-white/60"
          >
            {s.emoji} {s.label}
          </li>
        ))}
      </ol>

      {p.notes && <p className="mt-3 text-xs text-white/50">{p.notes}</p>}
      <p className="mt-3 text-xs text-white/45">
        You stay the creator. I'm the production partner — ideas, script, jokes, continuity, titles,
        descriptions, thumbnails and the publishing schedule.
      </p>
    </article>
  );
}

export function CreativeProjectProgress({ name }: { name?: string }) {
  const listFn = useServerFn(listMemberBlueprints);
  const query = useQuery({
    queryKey: ["member-blueprints", "creative"],
    queryFn: () => listFn({}),
    retry: false,
    staleTime: 60_000,
  });

  const projects = useMemo<CreativeProject[]>(() => {
    const rows: MemberBlueprint[] = query.data ?? [];
    const mine = name
      ? rows.filter((b) => b.member_name?.toLowerCase().includes(name.toLowerCase()))
      : rows;
    const source = mine.length ? mine : rows;
    return source
      .filter((b) => b.status !== "archived")
      .flatMap((b) => b.creative_projects ?? []);
  }, [query.data, name]);

  if (projects.length === 0) return null;

  return (
    <div className="space-y-3">
      <p className="flex items-center gap-2 text-sm text-white/60">
        <Clapperboard className="h-4 w-4 text-[color:var(--gold)]" />
        Your recurring creative projects — from your Blueprint, so nothing had to be built for them.
      </p>
      {projects.map((p) => (
        <ProjectCard key={p.name} p={p} />
      ))}
    </div>
  );
}
