import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getTrustProfile } from "@/lib/trust.functions";
import {
  BUILDER_STAGES,
  FEEDBACK_EXPERIENCE,
  FEEDBACK_RULE,
  REPUTATION_NEVER_RULE,
} from "@/lib/trust";

/**
 * FRASS-0493 — the Trust Profile.
 *
 * Deliberately not a score. No "92/100", no stars out of five, no ranking.
 * Verified accomplishments only, each one traceable to something that actually
 * happened on Frass. Followers, likes and views are never read here.
 *
 * This extends the existing Frass Card / identity architecture. It is not a
 * second profile and not a review platform.
 */
export function TrustProfilePanel({ handle }: { handle: string }) {
  const fn = useServerFn(getTrustProfile);
  const { data } = useQuery({
    queryKey: ["trust-profile", handle],
    queryFn: () => fn({ data: { handle } }),
    enabled: handle.length > 0,
    staleTime: 60_000,
  });

  if (!data) return null;
  const stage = BUILDER_STAGES[data.stage];

  return (
    <section className="living-card-block" id="reputation">
      <h2 className="living-card-block-title">
        <span aria-hidden className="mr-2">
          {stage.icon}
        </span>
        {stage.label}
      </h2>
      <p className="living-card-prose">{stage.plain}</p>

      {data.facts.length > 0 ? (
        <ul className="card-trust-list">
          {data.facts.map((f) => (
            <li key={f.label} className="card-trust-item card-trust-yes">
              <span aria-hidden>{f.icon}</span>
              <div>
                <strong>{f.label}</strong>
                <span>{f.plain}</span>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">
          Nothing verified yet. That is not a mark against anyone — reputation on Frass starts the day the
          first commitment is completed.
        </p>
      )}

      {data.feedback.length > 0 && (
        <div className="mt-8 space-y-4">
          <h3 className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            From verified customers
          </h3>
          {data.feedback.map((f) => (
            <figure key={f.id} className="rounded-sm border border-border bg-background/40 px-5 py-4">
              <figcaption className="flex items-center gap-2 text-xs text-muted-foreground">
                <span aria-hidden>{FEEDBACK_EXPERIENCE[f.experience].icon}</span>
                {f.author} · {f.source} ·{" "}
                {new Date(f.createdAt).toLocaleDateString(undefined, { month: "short", year: "numeric" })}
              </figcaption>
              {f.body && <blockquote className="mt-2 text-sm leading-relaxed">“{f.body}”</blockquote>}
            </figure>
          ))}
        </div>
      )}

      <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
        {FEEDBACK_RULE} {REPUTATION_NEVER_RULE}
      </p>
    </section>
  );
}
