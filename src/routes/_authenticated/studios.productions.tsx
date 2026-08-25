// FRASS-0600 — every production, filterable.
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useProductions, useSeries } from "@/lib/studios/use-studios";
import { StatusPill, EmptyState, inputClass } from "@/components/studios/studio-ui";
import { PRODUCTION_STATUSES, PRODUCTION_TYPES, prettify, labelFor } from "@/lib/studios/studios";

type Search = { status?: string; type?: string; series?: string };

export const Route = createFileRoute("/_authenticated/studios/productions")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    status: typeof search.status === "string" ? search.status : undefined,
    type: typeof search.type === "string" ? search.type : undefined,
    series: typeof search.series === "string" ? search.series : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Productions | Frassy Studios" },
      { name: "description", content: "Every Frass Hill production, from first idea to published episode." },
      { property: "og:title", content: "Productions | Frassy Studios" },
      { property: "og:description", content: "Every production the studio is making." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: ProductionsPage,
});

function ProductionsPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { data: series = [] } = useSeries();
  const { data: rows = [], isLoading } = useProductions({
    status: search.status,
    type: search.type,
    seriesId: search.series,
  });

  const set = (patch: Search) => navigate({ to: "/studios/productions", search: { ...search, ...patch } });

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl uppercase tracking-tight">Productions</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Every piece of media begins here as a production, and stays linked to everything cut from it.
          </p>
        </div>
        <Link
          to="/studios/create"
          className="rounded-sm border border-[color:var(--gold)] px-4 py-2 text-[11px] uppercase tracking-[0.25em] text-[color:var(--gold)]"
        >
          + Create Production
        </Link>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <select className={inputClass} value={search.status ?? ""} onChange={(e) => set({ status: e.target.value || undefined })}>
          <option value="">All statuses</option>
          {PRODUCTION_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <select className={inputClass} value={search.type ?? ""} onChange={(e) => set({ type: e.target.value || undefined })}>
          <option value="">All types</option>
          {PRODUCTION_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <select className={inputClass} value={search.series ?? ""} onChange={(e) => set({ series: e.target.value || undefined })}>
          <option value="">All series</option>
          {series.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Opening the studio…</p>
        ) : rows.length === 0 ? (
          <EmptyState title="Nothing here yet" body="No production matches that filter. Start a new one, or clear the filters." />
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border/70">
            <table className="w-full min-w-[860px] text-sm">
              <thead className="bg-card/60 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left">Title</th>
                  <th className="px-4 py-3 text-left">Series</th>
                  <th className="px-4 py-3 text-left">Type</th>
                  <th className="px-4 py-3 text-left">Format</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Rights</th>
                  <th className="px-4 py-3 text-left">Updated</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => (
                  <tr key={p.id} className="border-t border-border/50 hover:bg-card/40">
                    <td className="px-4 py-3">
                      <Link to="/studios/production/$id" params={{ id: p.id }} className="text-[color:var(--gold)]">
                        {p.title}
                      </Link>
                      {p.episode_number ? (
                        <span className="ml-2 text-xs text-muted-foreground">
                          S{p.season ?? 1}·E{p.episode_number}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{p.studio_series?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{labelFor(PRODUCTION_TYPES, p.production_type)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.aspect_ratio}</td>
                    <td className="px-4 py-3">
                      <StatusPill status={p.status} />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{prettify(p.rights_status)}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {new Date(p.updated_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
