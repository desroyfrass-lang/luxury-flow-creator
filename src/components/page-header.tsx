import { Link } from "@tanstack/react-router";

interface Crumb {
  label: string;
  to?: string;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  crumbs,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  crumbs?: Crumb[];
}) {
  return (
    <section className="relative pt-16 md:pt-24 pb-10 md:pb-16">
      <div className="mx-auto max-w-[1600px] px-6 lg:px-12">
        {crumbs && (
          <nav className="mb-6 flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
            {crumbs.map((c, i) => (
              <span key={i} className="flex items-center gap-2">
                {c.to ? (
                  <Link to={c.to} className="hover:text-foreground transition">
                    {c.label}
                  </Link>
                ) : (
                  <span className="text-foreground">{c.label}</span>
                )}
                {i < crumbs.length - 1 && <span className="opacity-40">/</span>}
              </span>
            ))}
          </nav>
        )}
        {eyebrow && (
          <div className="mb-4 inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
            <span className="h-px w-8 bg-[color:var(--gold)]" />
            {eyebrow}
          </div>
        )}
        <h1 className="font-display text-5xl md:text-7xl lg:text-8xl leading-[0.95] max-w-5xl">
          {title}
        </h1>
        {description && (
          <p className="mt-6 max-w-2xl text-base md:text-lg text-muted-foreground">{description}</p>
        )}
      </div>
    </section>
  );
}
