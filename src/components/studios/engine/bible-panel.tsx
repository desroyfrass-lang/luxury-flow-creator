// FRASS-0601 — Series Bible retrieval. The Founder can always see what Frassy is using.
import { Link } from "@tanstack/react-router";
import { StudioCard } from "@/components/studios/studio-ui";
import { ageDirectiveFor } from "@/lib/studios/age-rules";

const BIBLE_FIELDS: Array<[string, string]> = [
  ["world_rules", "World rules"],
  ["story_rules", "Story rules"],
  ["visual_style", "Visual style"],
  ["language_style", "Language style"],
  ["character_relationships", "Character relationships"],
  ["canon_events", "Canon"],
  ["timeline", "Timeline"],
  ["locations", "Locations"],
  ["recurring_objects", "Recurring objects"],
  ["unresolved_storylines", "Unresolved storylines"],
  ["educational_standards", "Educational standards"],
  ["forbidden_changes", "Continuity restrictions"],
];

export function BiblePanel({
  production,
  series,
  bible,
  characters,
  previousEpisodes,
  voices,
}: {
  production: any;
  series: any;
  bible: any;
  characters: any[];
  previousEpisodes: any[];
  voices: any[];
}) {
  const loaded = Boolean(bible);

  return (
    <div className="space-y-5">
      <StudioCard
        eyebrow={loaded ? "Series Bible Loaded ✓" : "No Series Bible yet"}
        title={series?.name ?? "No series attached"}
        footer="Frassy is only allowed to use what is shown on this page. Anything else would be inventing canon."
      >
        {!series ? (
          <p className="text-sm text-muted-foreground">
            This production isn't attached to a series, so there is no canon to protect. Attach one in{" "}
            <Link to="/studios/series" className="text-[color:var(--gold)] underline">
              Series
            </Link>{" "}
            if it belongs to a show.
          </p>
        ) : !loaded ? (
          <p className="text-sm text-muted-foreground">
            {series.name} has no Series Bible written yet. Frassy will not invent one — she'll propose canon and wait for
            your word.{" "}
            <Link to="/studios/series" className="text-[color:var(--gold)] underline">
              Write the Bible
            </Link>
            .
          </p>
        ) : (
          <dl className="grid gap-3 sm:grid-cols-2">
            {BIBLE_FIELDS.filter(([k]) => bible[k]).map(([k, label]) => (
              <div key={k} className="rounded-sm border border-border/60 bg-background/40 p-3">
                <dt className="text-[10px] uppercase tracking-[0.24em] text-[color:var(--gold)]">{label}</dt>
                <dd className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{bible[k]}</dd>
              </div>
            ))}
          </dl>
        )}
      </StudioCard>

      <div className="grid gap-4 lg:grid-cols-3">
        <StudioCard eyebrow={`${characters.length} on file`} title="Approved characters">
          {characters.length === 0 ? (
            <p className="text-sm text-muted-foreground">No characters recorded yet.</p>
          ) : (
            <ul className="space-y-1.5 text-sm">
              {characters.slice(0, 14).map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-2">
                  <span>{c.name}</span>
                  <span className={`text-[10px] uppercase tracking-[0.2em] ${c.approved ? "text-emerald-400" : "text-muted-foreground"}`}>
                    {c.approved ? "Approved" : "Draft"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </StudioCard>

        <StudioCard eyebrow={`${voices.length} on file`} title="Approved voices">
          {voices.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No voices recorded yet. Recurring characters keep their voice once you save it.
            </p>
          ) : (
            <ul className="space-y-1.5 text-sm">
              {voices.slice(0, 14).map((v) => (
                <li key={v.id} className="flex items-center justify-between gap-2">
                  <span>{v.name}</span>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{v.accent ?? v.tone ?? "—"}</span>
                </li>
              ))}
            </ul>
          )}
        </StudioCard>

        <StudioCard eyebrow={`${previousEpisodes.length} before this`} title="Previous episodes">
          {previousEpisodes.length === 0 ? (
            <p className="text-sm text-muted-foreground">This is the first one.</p>
          ) : (
            <ul className="space-y-1.5 text-sm">
              {previousEpisodes.slice(0, 14).map((e) => (
                <li key={e.id} className="text-muted-foreground">
                  <span className="text-foreground">{e.episode_number ? `Ep ${e.episode_number}` : "—"}</span> {e.title}
                </li>
              ))}
            </ul>
          )}
        </StudioCard>
      </div>

      <StudioCard eyebrow="Binding on every word Frassy writes" title="Age rules in force">
        <pre className="whitespace-pre-wrap text-xs leading-relaxed text-muted-foreground">{ageDirectiveFor(production.age_group)}</pre>
      </StudioCard>
    </div>
  );
}
