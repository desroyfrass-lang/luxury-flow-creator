// FRASS-0486B — the Parent Connection.
//
// A grown-up can always see the whole of a child's street: what they explored,
// what they made, and exactly which doors do not exist here. No hidden feed,
// no private inbox, nothing a parent cannot look at.

import { Link } from "@tanstack/react-router";
import { useKidsProgress } from "@/lib/kids-progress";
import { FORBIDDEN_IN_STREET, TOPIC_LABEL, type StreetTopic } from "@/lib/kids/frass-street";

export function StreetParentPanel() {
  const { progress } = useKidsProgress();
  const made = progress.badges.slice(-6).reverse();
  const explored = Object.keys(progress.completed).length;
  const topics = Object.entries(progress.skills)
    .filter(([k]) => k in TOPIC_LABEL)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4) as [StreetTopic, number][];

  return (
    <div className="rounded-[2rem] border border-border bg-card p-7">
      <p className="text-[10px] uppercase tracking-[0.38em] text-[color:var(--gold)]">Frass Street</p>
      <h3 className="mt-2 font-display text-xl uppercase">Parent connection</h3>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <Stat label="Things explored" value={explored} />
        <Stat label="Things made" value={progress.badges.length} />
      </div>

      {topics.length ? (
        <>
          <p className="mt-6 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            What they lean toward
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {topics.map(([t, n]) => (
              <span key={t} className="rounded-full bg-muted px-3 py-1 text-xs">
                {TOPIC_LABEL[t].emoji} {TOPIC_LABEL[t].label} · {n}
              </span>
            ))}
          </div>
        </>
      ) : null}

      {made.length ? (
        <>
          <p className="mt-6 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            Recently made
          </p>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            {made.map((b) => (
              <li key={b.slug}>
                <span aria-hidden>{b.emoji}</span> {b.name}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="mt-6 text-sm text-muted-foreground">
          Nothing made yet — the street is waiting.
        </p>
      )}

      <p className="mt-6 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
        Not built into this street
      </p>
      <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
        {FORBIDDEN_IN_STREET.map((item: string) => (
          <li key={item}>· {item}</li>
        ))}
      </ul>

      <Link
        to="/kids-world/street"
        className="mt-6 inline-block rounded-full border border-border px-6 py-2.5 text-[11px] font-bold uppercase tracking-[0.26em]"
      >
        Open Frass Street
      </Link>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border bg-background p-4">
      <p className="font-display text-3xl leading-none">{value}</p>
      <p className="mt-1 text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}
