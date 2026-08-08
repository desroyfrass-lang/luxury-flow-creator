import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { WEDDING_JOURNEY } from "@/lib/bridal";
import { useBridalVault } from "@/hooks/use-bridal-vault";
import gardenPath from "@/assets/bridal-garden-path.jpg";

export const Route = createFileRoute("/bridal/journey")({
  head: () => ({
    meta: [
      { title: "The Wedding Journey — Frass Bridal" },
      {
        name: "description",
        content:
          "Walk the garden path from 'We got engaged' to your first anniversary. Every milestone opens another part of the Bridal estate.",
      },
      { property: "og:title", content: "The Wedding Journey — Frass Bridal" },
      {
        property: "og:description",
        content: "A wedding presented as a walk you take together, not a checklist you survive.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: JourneyPage,
});

function JourneyPage() {
  const { vault, ready } = useBridalVault();

  const progressFor = (categories: string[]) => {
    const tasks = vault.tasks.filter((t) => categories.includes(t.category));
    if (!tasks.length) return 0;
    return Math.round((tasks.filter((t) => t.done).length / tasks.length) * 100);
  };

  const reached = WEDDING_JOURNEY.findIndex((m) => progressFor(m.categories) < 100);
  const current = reached === -1 ? WEDDING_JOURNEY.length - 1 : reached;

  return (
    <SiteShell>
      <div className="bg-[oklch(0.14_0.01_75)] text-[oklch(0.96_0.01_80)]">
        <section className="relative h-[46vh] min-h-[300px] overflow-hidden">
          <img
            src={gardenPath}
            alt="A stone garden path through white flowers"
            width={1600}
            height={912}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.14_0.01_75)] via-[oklch(0.14_0.01_75)]/50 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 mx-auto max-w-[1100px] px-6 pb-8">
            <span className="text-[10px] uppercase tracking-[0.4em] text-[color:var(--hill-gold)]">
              Frass Bridal
            </span>
            <h1 className="mt-3 font-display text-3xl uppercase md:text-5xl">The Wedding Journey</h1>
            <p className="mt-3 max-w-xl text-sm text-[oklch(0.85_0.01_80)]">
              You are not ticking boxes. You are walking through the gardens together — and every
              milestone you finish opens the next part of the estate.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-[1100px] px-6 py-12">
          <ol className="relative space-y-3 border-l border-[color:var(--hill-gold)]/30 pl-6">
            {WEDDING_JOURNEY.map((m, i) => {
              const pct = ready ? progressFor(m.categories) : 0;
              const state = pct === 100 ? "done" : i === current ? "here" : "ahead";
              return (
                <li key={m.id} className="relative">
                  <span
                    className={`absolute -left-[1.95rem] top-4 h-3 w-3 rounded-full border ${
                      state === "done"
                        ? "border-[color:var(--hill-gold)] bg-[color:var(--hill-gold)]"
                        : state === "here"
                          ? "border-[color:var(--hill-gold)] bg-transparent"
                          : "border-white/25 bg-transparent"
                    }`}
                  />
                  <div
                    className={`rounded-2xl border p-5 transition ${
                      state === "here"
                        ? "border-[color:var(--hill-gold)]/50 bg-white/[0.06]"
                        : "border-white/10 bg-white/[0.02]"
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-display text-lg uppercase">{m.title}</span>
                      <span className="text-[10px] uppercase tracking-[0.22em] text-[oklch(0.66_0.01_80)]">
                        {m.place}
                      </span>
                    </div>
                    <p className="mt-2 text-sm italic text-[oklch(0.8_0.01_80)]">{m.says}</p>
                    <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-[color:var(--hill-gold)] transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-[oklch(0.66_0.01_80)]">
                      <span>{m.categories.join(" · ")}</span>
                      <span>{pct}%</span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/bridal/vault"
              className="rounded-full bg-[color:var(--hill-gold)] px-6 py-3 text-[10px] font-bold uppercase tracking-[0.24em] text-black"
            >
              Work the checklist in the Vault
            </Link>
            <Link
              to="/bridal"
              className="rounded-full border border-white/25 px-6 py-3 text-[10px] font-bold uppercase tracking-[0.24em]"
            >
              Back to the village
            </Link>
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
