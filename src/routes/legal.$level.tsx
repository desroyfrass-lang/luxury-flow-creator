import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { AGREEMENTS, FRASS_PROMISE, type AgreementLevel } from "@/lib/legal/agreements";

function parse(level: string): AgreementLevel | null {
  return level === "visitor" || level === "builder" ? level : null;
}

export const Route = createFileRoute("/legal/$level")({
  loader: ({ params }) => {
    const level = parse(params.level);
    if (!level) throw notFound();
    return { level };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Agreement not found — Frass" }, { name: "robots", content: "noindex" }] };
    }
    const a = AGREEMENTS[loaderData.level];
    const description = `${a.title} (v${a.version}) — ${a.who} Plain English first, full terms underneath.`;
    return {
      meta: [
        { title: `${a.title} — Frass` },
        { name: "description", content: description },
        { property: "og:title", content: `${a.title} — Frass` },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
  component: AgreementPage,
});

function AgreementPage() {
  const { level } = Route.useLoaderData();
  const a = AGREEMENTS[level];

  return (
    <SiteShell>
      <article className="mx-auto w-full max-w-3xl px-4 py-12">
        <Link to="/legal" className="text-xs uppercase tracking-[0.2em] text-muted-foreground underline">
          All agreements
        </Link>
        <h1 className="mt-3 font-display text-3xl uppercase tracking-[0.06em]">{a.title}</h1>
        <p className="mt-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Version {a.version} · {a.who}
        </p>

        <p className="mt-5 rounded-3xl border border-[color:var(--gold,#d4af37)]/30 bg-[color:var(--gold,#d4af37)]/[0.05] p-5 text-sm leading-relaxed">
          {FRASS_PROMISE}
        </p>

        <div className="mt-8 space-y-6">
          {a.sections.map((s) => (
            <section key={s.heading}>
              <h2 className="font-display text-lg uppercase tracking-[0.05em]">{s.heading}</h2>
              <p className="mt-2 rounded-2xl bg-white/[0.04] p-4 text-sm leading-relaxed">
                <span className="mr-2 text-[11px] uppercase tracking-[0.2em] text-[color:var(--gold,#d4af37)]">
                  Plain English
                </span>
                {s.plain}
              </p>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {s.legal.map((l, i) => (
                  <li key={i} className="leading-relaxed">
                    {i + 1}. {l}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <p className="mt-10 text-xs text-muted-foreground">
          Questions about anything here? Ask Frassy — she'll explain it twice: once properly, once in plain
          English.
        </p>
      </article>
    </SiteShell>
  );
}
