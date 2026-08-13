import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Loader2, AlertTriangle, CheckCircle2, CornerDownRight, ExternalLink } from "lucide-react";
import { runLinkCheck, type LinkCheckReport } from "@/lib/link-check.functions";
import { CoreRouteAuditPanel } from "@/components/founder/core-route-audit";

export const Route = createFileRoute("/_authenticated/admin/link-check")({
  component: LinkCheckPage,
});

function LinkCheckPage() {
  const checkFn = useServerFn(runLinkCheck);
  const [baseUrl, setBaseUrl] = useState("https://frasskicks.com");
  const [report, setReport] = useState<LinkCheckReport | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setBaseUrl((prev) => (window.location.hostname === "localhost" ? window.location.origin : prev));
    }
  }, []);

  const mutation = useMutation({
    mutationFn: () => checkFn({ data: { baseUrl, maxPages: 30 } }),
    onSuccess: (data) => setReport(data),
  });

  const broken = report?.results.filter((r) => !r.ok) ?? [];
  const redirects = report?.results.filter((r) => r.ok && r.redirectedTo) ?? [];
  const healthy = report?.results.filter((r) => r.ok && !r.redirectedTo) ?? [];

  return (
    <div>
      <div className="mb-8">
        <div className="text-[11px] uppercase tracking-[0.3em] text-[color:var(--gold)]">
          Owner console · Temporary tool
        </div>
        <h2 className="mt-2 font-display text-4xl">Link &amp; card checker</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Frassy crawls the live site, follows every card, button and navigation link it can reach,
          and reports anything broken or redirecting. This is a temporary diagnostic tool — remove it
          once the walkthrough is complete.
        </p>
      </div>

      {/* FRASS-0514 — core routes are audited first: they are launch blocking. */}
      <div className="mb-10">
        <CoreRouteAuditPanel />
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-sm border border-border/60 bg-card/40 p-4">
        <input
          value={baseUrl}
          onChange={(e) => setBaseUrl(e.target.value)}
          placeholder="https://frasskicks.com"
          className="min-w-[260px] flex-1 rounded-sm border border-border bg-background px-4 py-3 text-sm"
        />
        <button
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
          className="lux-press rounded-sm border border-[color:var(--gold)] bg-[color:var(--gold)] px-6 py-3 text-xs font-bold uppercase tracking-[0.3em] text-[color:var(--ink)] disabled:opacity-50"
        >
          {mutation.isPending ? "Scanning…" : "Run scan"}
        </button>
      </div>

      {mutation.isPending && (
        <div className="mt-8 flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Crawling pages and testing every link… this can take a minute.</span>
        </div>
      )}

      {mutation.isError && (
        <div className="mt-8 rounded-sm border border-red-500/30 bg-red-500/10 p-6 text-sm text-red-200">
          {mutation.error instanceof Error ? mutation.error.message : "Scan failed"}
        </div>
      )}

      {report && (
        <div className="mt-10 space-y-10">
          <div className="grid gap-4 sm:grid-cols-4">
            <Stat label="Pages scanned" value={report.scannedPages.length} />
            <Stat label="Links tested" value={report.totalLinks} />
            <Stat label="Broken" value={report.brokenCount} tone={report.brokenCount ? "bad" : "good"} />
            <Stat label="Redirecting" value={report.redirectCount} tone={report.redirectCount ? "warn" : "good"} />
          </div>

          <Section
            title="Broken links"
            icon={<AlertTriangle className="h-4 w-4 text-red-400" />}
            empty="Nothing broken — every card and button resolved."
            items={broken}
          />
          <Section
            title="Redirecting links"
            icon={<CornerDownRight className="h-4 w-4 text-amber-400" />}
            empty="No redirects detected."
            items={redirects}
          />
          <Section
            title="Healthy links"
            icon={<CheckCircle2 className="h-4 w-4 text-emerald-400" />}
            empty="No links found."
            items={healthy}
            collapsedByDefault
          />

          <div className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
            Last run {new Date(report.ranAt).toLocaleString()}
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: "good" | "bad" | "warn" }) {
  const color =
    tone === "bad" ? "text-red-400" : tone === "warn" ? "text-amber-400" : tone === "good" ? "text-emerald-400" : "";
  return (
    <div className="rounded-sm border border-border/60 bg-card/40 p-5">
      <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">{label}</div>
      <div className={`mt-2 font-display text-3xl ${color}`}>{value}</div>
    </div>
  );
}

function Section({
  title,
  icon,
  items,
  empty,
  collapsedByDefault,
}: {
  title: string;
  icon: React.ReactNode;
  items: LinkCheckReport["results"];
  empty: string;
  collapsedByDefault?: boolean;
}) {
  const [open, setOpen] = useState(!collapsedByDefault);
  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-foreground"
      >
        {icon}
        {title} ({items.length})
      </button>
      {open && (
        <div className="mt-4 space-y-2">
          {items.length === 0 && <p className="text-sm text-muted-foreground">{empty}</p>}
          {items.map((r) => (
            <div key={r.url} className="rounded-sm border border-border/60 bg-card/30 p-4 text-sm">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-sm border border-border px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  {r.status ?? "ERR"}
                </span>
                <a
                  href={r.url}
                  target="_blank"
                  rel="noreferrer"
                  className="break-all text-foreground underline-offset-4 hover:underline"
                >
                  {r.url}
                </a>
                {r.external && <ExternalLink className="h-3 w-3 text-muted-foreground" />}
              </div>
              {r.redirectedTo && (
                <div className="mt-2 break-all text-xs text-amber-300">→ redirects to {r.redirectedTo}</div>
              )}
              {r.error && <div className="mt-2 text-xs text-red-300">{r.error}</div>}
              {r.foundOn.length > 0 && (
                <div className="mt-2 break-all text-[11px] text-muted-foreground">
                  Found on: {r.foundOn.join(", ")}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
