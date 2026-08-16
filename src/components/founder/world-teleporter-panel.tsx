// FRASS-0570 — World Teleporter (Founder inspection only).
//
// Read-only. No saving, no deleting, no updating. It simply shows every page
// that exists in the Frass world, whether it is reachable, and lets the Founder
// step into any of them and come straight back.
import { useMemo, useState } from "react";
import {
  WORLD_ROUTES,
  WORLD_DISTRICTS,
  STATUS_META,
  type WorldStatus,
} from "@/lib/founder/world-teleporter";
import { beginTeleport } from "@/lib/founder/teleport-session";

const GROUPS: { status: WorldStatus; heading: string }[] = [
  { status: "live", heading: "🟢 Live & Linked" },
  { status: "built", heading: "🟡 Built but Unlinked" },
  { status: "legacy", heading: "🔴 Legacy / Duplicate Candidates" },
];

export function WorldTeleporterPanel() {
  const [query, setQuery] = useState("");
  const [district, setDistrict] = useState<string>("All");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return WORLD_ROUTES.filter((r) => {
      if (district !== "All" && r.district !== district) return false;
      if (!q) return true;
      return (
        r.path.toLowerCase().includes(q) ||
        r.title.toLowerCase().includes(q) ||
        r.component.toLowerCase().includes(q) ||
        r.file.toLowerCase().includes(q)
      );
    });
  }, [query, district]);

  return (
    <section>
      <h2 className="font-display text-2xl">🗺️ World Teleporter</h2>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Every page that exists in Frass, grouped by whether people can actually reach it. This is a
        looking glass only — nothing here changes, renames, deletes or connects anything. Tap any
        page to visit it, then use the floating chip to come straight back here.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search route, title or component…"
          className="w-64 rounded-full border border-border bg-transparent px-4 py-1.5 text-sm outline-none focus:border-[color:var(--gold)]"
        />
        <select
          value={district}
          onChange={(e) => setDistrict(e.target.value)}
          className="rounded-full border border-border bg-transparent px-3 py-1.5 text-xs uppercase tracking-wide"
        >
          {["All", ...WORLD_DISTRICTS].map((d) => (
            <option key={d} value={d} className="bg-background">
              {d}
            </option>
          ))}
        </select>
        <span className="text-xs text-muted-foreground">
          {rows.length} of {WORLD_ROUTES.length} pages
        </span>
      </div>

      <div className="mt-8 space-y-10">
        {GROUPS.map(({ status, heading }) => {
          const group = rows.filter((r) => r.status === status);
          if (!group.length) return null;
          return (
            <div key={status}>
              <h3 className="text-sm font-bold uppercase tracking-wide">
                {heading}{" "}
                <span className="text-muted-foreground">({group.length})</span>
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">{STATUS_META[status].plain}</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {group.map((r) => (
                  <button
                    key={r.path + r.file}
                    type="button"
                    onClick={() => beginTeleport(r.path)}
                    className="rounded-xl border border-border/70 p-3 text-left transition hover:border-[color:var(--gold)]"
                  >
                    <span className="flex items-center gap-2">
                      <span aria-hidden>{STATUS_META[r.status].icon}</span>
                      <span className="text-sm font-semibold">
                        {r.title || r.component || r.path}
                      </span>
                    </span>
                    <span className="mt-1 block font-mono text-xs text-[color:var(--gold)]">
                      {r.path}
                      {r.path.includes("$") ? " (needs a real value)" : ""}
                    </span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {r.component || "—"} · {r.district}
                      {r.redirect ? " · redirects elsewhere" : ""}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
