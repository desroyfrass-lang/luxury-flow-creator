// FRASS-0602 — Publishing Destination Matrix: "Where should this go?"
// Frassy recommends. The Founder decides. The safety gate has the final say.
import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { useProduction } from "@/lib/studios/use-studios";
import { useConnectionAccounts, usePackages } from "@/lib/studios/use-distribution";
import { assignContentIds, checkSafetyGate, queueDistribution } from "@/lib/studios/distribution.functions";
import { EmptyState, Field, GoldButton, QuietButton, StudioCard, StudioSection, inputClass } from "@/components/studios/studio-ui";
import { PUBLISH_MODES, platformMeta, type GateResult } from "@/lib/studios/distribution";

export const Route = createFileRoute("/_authenticated/studios/distribution/$id")({
  head: () => ({
    meta: [
      { title: "Where should this go? | Frassy Studios" },
      { name: "description", content: "Choose every destination for one approved Frass production." },
      { property: "og:title", content: "Publishing Destination Matrix | Frassy Studios" },
      { property: "og:description", content: "One master, many destinations, one record of ownership." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: Matrix,
});

type Target = { packageId: string; connectionId: string };

function Matrix() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const { data: production } = useProduction(id);
  const { data: packages = [] } = usePackages(id);
  const { data: accounts = [] } = useConnectionAccounts();
  const queue = useServerFn(queueDistribution);
  const gateCheck = useServerFn(checkSafetyGate);
  const assignIds = useServerFn(assignContentIds);

  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [mode, setMode] = useState("schedule");
  const [when, setWhen] = useState("");
  const [consent, setConsent] = useState(false);
  const [gate, setGate] = useState<{ key: string; checks: GateResult[] } | null>(null);
  const [busy, setBusy] = useState(false);

  const timezone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone, []);
  const key = (t: Target) => `${t.packageId}|${t.connectionId}`;

  const pairs: Target[] = useMemo(
    () =>
      packages.flatMap((p) =>
        accounts.filter((a) => a.platform === p.platform).map((a) => ({ packageId: p.id, connectionId: a.id })),
      ),
    [packages, accounts],
  );

  const chosen = pairs.filter((p) => selected[key(p)]);

  const send = async () => {
    if (!chosen.length) return toast.error("Pick at least one destination.");
    setBusy(true);
    try {
      const r = await queue({
        data: {
          targets: chosen.map((t) => ({
            ...t,
            mode,
            scheduledFor: mode === "schedule" && when ? new Date(when).toISOString() : null,
            timezone,
            consent,
          })),
        },
      });
      const blocked = r.results.filter((x: { ok: boolean; status?: string }) => !x.ok || x.status === "waiting_approval");
      toast.success(`${r.results.length} queued. ${blocked.length ? `${blocked.length} held by the safety gate.` : "All clear."}`);
      qc.invalidateQueries({ queryKey: ["studio"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not queue that.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Link to="/studios/distribution" className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground hover:text-foreground">
        ← Distribution Network
      </Link>
      <h1 className="mt-2 font-display text-3xl uppercase tracking-tight">Where should this go?</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {production?.title ?? "Loading"} — {production?.content_id ?? "no Frass content ID yet"}. Tick the destinations you
        want. Nothing leaves until every safety check passes.
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        <QuietButton
          onClick={async () => {
            const r = await assignIds({ data: { productionId: id } });
            toast.success(`Frass content ID ${r.master} assigned.`);
            qc.invalidateQueries({ queryKey: ["studio"] });
          }}
        >
          Assign Frass content IDs
        </QuietButton>
        <QuietButton onClick={() => setSelected(Object.fromEntries(pairs.map((p) => [key(p), true])))}>Select all appropriate</QuietButton>
        <QuietButton onClick={() => setSelected({})}>Clear</QuietButton>
      </div>

      <StudioSection title="Destination matrix" hint="One row per platform package, one tick per channel.">
        {packages.length === 0 ? (
          <EmptyState
            title="No platform packages yet"
            body="Prepare the platform versions of this production first — the packaging step keeps the canonical master untouched."
          />
        ) : (
          <div className="space-y-3">
            {packages.map((p) => {
              const channels = accounts.filter((a) => a.platform === p.platform);
              return (
                <StudioCard key={p.id} eyebrow={platformMeta(p.platform).label} title={p.title ?? p.derivative_type ?? "Package"}>
                  <p className="text-xs text-muted-foreground">{p.caption ?? p.description ?? "No wording yet."}</p>
                  {channels.length === 0 ? (
                    <p className="mt-2 text-xs text-amber-400">No {platformMeta(p.platform).label} channel added yet.</p>
                  ) : (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {channels.map((a) => {
                        const k = key({ packageId: p.id, connectionId: a.id });
                        return (
                          <label
                            key={a.id}
                            className={`flex cursor-pointer items-center gap-2 rounded-sm border px-3 py-1.5 text-xs ${
                              selected[k] ? "border-[color:var(--gold)]/60 text-[color:var(--gold)]" : "border-border/60 text-muted-foreground"
                            }`}
                          >
                            <input
                              type="checkbox"
                              className="accent-[color:var(--gold)]"
                              checked={Boolean(selected[k])}
                              onChange={(e) => setSelected((s) => ({ ...s, [k]: e.target.checked }))}
                            />
                            {a.account_label ?? a.platform}
                            <span className="text-[10px] uppercase tracking-[0.14em]">{a.status === "connected" ? "" : "setup required"}</span>
                            <button
                              type="button"
                              className="underline"
                              onClick={async (e) => {
                                e.preventDefault();
                                const r = await gateCheck({ data: { packageId: p.id, connectionId: a.id, mode } });
                                setGate({ key: k, checks: r.checks });
                              }}
                            >
                              check
                            </button>
                          </label>
                        );
                      })}
                    </div>
                  )}
                  {gate && gate.key.startsWith(p.id) ? (
                    <ul className="mt-3 space-y-1 text-xs">
                      {gate.checks.map((c) => (
                        <li key={c.id} className={c.passed ? "text-emerald-400" : c.critical ? "text-red-400" : "text-amber-400"}>
                          {c.passed ? "✓" : "✗"} {c.label} — {c.detail}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </StudioCard>
              );
            })}
          </div>
        )}
      </StudioSection>

      <StudioSection title="Publish now or schedule">
        <div className="grid gap-3 sm:grid-cols-3 sm:items-end">
          <Field label="How">
            <select className={inputClass} value={mode} onChange={(e) => setMode(e.target.value)}>
              {PUBLISH_MODES.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="When" hint={`Your timezone: ${timezone}`}>
            <input type="datetime-local" className={inputClass} value={when} disabled={mode !== "schedule"} onChange={(e) => setWhen(e.target.value)} />
          </Field>
          <GoldButton disabled={busy || chosen.length === 0} onClick={send}>
            Queue {chosen.length || ""} destination{chosen.length === 1 ? "" : "s"}
          </GoldButton>
        </div>
        <label className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <input type="checkbox" className="accent-[color:var(--gold)]" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
          I have reviewed the publishing options for these platforms and I authorise this posting.
        </label>
        <p className="mt-2 text-[11px] text-muted-foreground">
          Some platforms only allow sending for final review inside their own app. Where that is the case the network uses
          that route instead of pretending it published.
        </p>
      </StudioSection>
    </>
  );
}
