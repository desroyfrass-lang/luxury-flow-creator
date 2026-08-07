import { Link } from "@tanstack/react-router";

export type DirectoryStore = {
  title: string;
  description: string;
  image: string;
  to: string;
};

export type DirectoryColumn = {
  heading: string;
  stores: DirectoryStore[];
};

type Props = {
  /** e.g. "Walk Wid Power" */
  headline: string;
  lines?: string[];
  intro?: string;
  columns: [DirectoryColumn, DirectoryColumn];
};

/**
 * Reusable district directory — the practical navigation layer that sits
 * beneath a district's cinematic hero. Any future district can pass its own
 * two columns of stores and keep the same visual language.
 */
export function DistrictDirectory({ headline, lines, intro, columns }: Props) {
  return (
    <section className="mx-auto max-w-[1600px] px-6 py-20 lg:px-10">
      <header className="mx-auto max-w-3xl text-center">
        <h2 className="font-display text-4xl uppercase leading-[0.9] text-[color:var(--gold)] md:text-6xl">
          {headline}
        </h2>
        {lines && lines.length > 0 && (
          <p className="mt-4 text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
            {lines.join(" · ")}
          </p>
        )}
        {intro && (
          <p className="mx-auto mt-5 max-w-xl text-sm text-muted-foreground md:text-base">{intro}</p>
        )}
      </header>

      <div className="mt-16 grid gap-14 lg:grid-cols-2 lg:gap-20">
        {columns.map((col) => (
          <div key={col.heading}>
            <div className="flex items-center gap-4">
              <h3 className="font-display text-2xl uppercase leading-none md:text-3xl">
                {col.heading}
              </h3>
              <span aria-hidden className="h-px flex-1 bg-border" />
            </div>

            <div className="mt-8 grid gap-8">
              {col.stores.map((s) => (
                <Link
                  key={s.to}
                  to={s.to}
                  className="group relative block overflow-hidden rounded-[1.75rem] border border-border bg-card shadow-[0_30px_80px_-60px_rgba(0,0,0,0.9)] transition duration-500 hover:-translate-y-1.5 hover:border-[color:var(--gold)]"
                >
                  <div className="relative h-[300px] overflow-hidden md:h-[360px]">
                    <img
                      src={s.image}
                      alt={s.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-[1600ms] ease-out group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.92),rgba(0,0,0,0.25)_55%,transparent)]" />
                    <div className="absolute inset-x-0 bottom-0 p-7 md:p-8">
                      <h4 className="font-display text-2xl uppercase leading-none text-white md:text-3xl">
                        {s.title}
                      </h4>
                      <p className="mt-3 max-w-sm text-sm text-white/70">{s.description}</p>
                      <span className="mt-6 inline-flex items-center rounded-full border border-[color:var(--gold)] px-7 py-3 text-[10px] font-bold uppercase tracking-[0.28em] text-[color:var(--gold)] transition group-hover:bg-[color:var(--gold)] group-hover:text-black">
                        Enter Store
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
