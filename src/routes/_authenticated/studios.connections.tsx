// FRASS-0602 — Platform Connection Center.
// Many accounts per platform. Secrets never touch the browser, and a channel
// is never shown as "Connected" unless it truly is.
import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { useConnectionAccounts, useCapabilityRegistry, useSyncRuns } from "@/lib/studios/use-distribution";
import { manageConnection, syncPlatformData } from "@/lib/studios/distribution.functions";
import { EmptyState, Field, GoldButton, QuietButton, StatusPill, StudioCard, StudioSection, inputClass } from "@/components/studios/studio-ui";
import { CONNECTION_STATUSES, DISTRIBUTION_PLATFORMS, labelOf, platformMeta, CAPABILITIES } from "@/lib/studios/distribution";

export const Route = createFileRoute("/_authenticated/studios/connections")({
  head: () => ({
    meta: [
      { title: "Platform Connections | Frassy Studios" },
      { name: "description", content: "Every Frass channel, its permissions, its health and what it can actually do." },
      { property: "og:title", content: "Platform Connections | Frassy Studios" },
      { property: "og:description", content: "Authorisation happens server-side; no keys are ever held in the browser." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: Connections,
});

function Connections() {
  const qc = useQueryClient();
  const { data: accounts = [] } = useConnectionAccounts();
  const { data: registry = [] } = useCapabilityRegistry();
  const { data: runs = [] } = useSyncRuns();
  const manage = useServerFn(manageConnection);
  const sync = useServerFn(syncPlatformData);
  const [platform, setPlatform] = useState("youtube");
  const [label, setLabel] = useState("");
  const [busy, setBusy] = useState(false);

  const refresh = () => qc.invalidateQueries({ queryKey: ["studio"] });

  const act = async (fn: () => Promise<{ note?: string }>) => {
    setBusy(true);
    try {
      const r = await fn();
      toast.success(r?.note ?? "Done.");
      refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "That did not go through.");
    } finally {
      setBusy(false);
    }
  };

  const capsFor = (p: string) => registry.filter((r) => r.platform === p);

  return (
    <>
      <h1 className="font-display text-3xl uppercase tracking-tight">Platform Connections</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Every channel Frass can publish to lives here — and you can hold more than one per platform. Sign-in happens on
        the server. No token, key or password ever reaches this page.
      </p>

      <StudioSection title="Add a channel" hint="Naming it is not connecting it. It stays SETUP REQUIRED until real credentials exist.">
        <div className="grid gap-3 sm:grid-cols-[1fr_2fr_auto] sm:items-end">
          <Field label="Platform">
            <select className={inputClass} value={platform} onChange={(e) => setPlatform(e.target.value)}>
              {DISTRIBUTION_PLATFORMS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Channel or account name" hint="For example: Frass Chronicles Channel">
            <input className={inputClass} value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Frass Chronicles Channel" />
          </Field>
          <GoldButton
            disabled={busy || !label.trim()}
            onClick={() =>
              act(async () => {
                const r = await manage({ data: { action: "create", platform, accountLabel: label.trim() } });
                setLabel("");
                return r;
              })
            }
          >
            Add channel
          </GoldButton>
        </div>
      </StudioSection>

      {DISTRIBUTION_PLATFORMS.map((p) => {
        const rows = accounts.filter((a) => a.platform === p.value);
        const caps = capsFor(p.value);
        return (
          <StudioSection key={p.value} title={`${p.icon} ${p.label}`} hint={p.plain}>
            {caps.length ? (
              <div className="mb-3 flex flex-wrap gap-1.5">
                {caps.map((c) => (
                  <span
                    key={c.id}
                    title={c.note ?? ""}
                    className={`rounded-sm border px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] ${
                      c.supported
                        ? "border-[color:var(--gold)]/40 text-[color:var(--gold)]"
                        : "border-border/60 text-muted-foreground line-through"
                    }`}
                  >
                    {labelOf(CAPABILITIES, c.capability)}
                    {c.requires_platform_review ? " • review" : ""}
                  </span>
                ))}
              </div>
            ) : null}

            {rows.length === 0 ? (
              <EmptyState title="No channel added yet" body={`Add the ${p.label} channel you want Frass to publish to.`} />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {rows.map((c) => (
                  <StudioCard key={c.id} eyebrow={labelOf(CONNECTION_STATUSES, c.status)} title={c.account_label ?? platformMeta(c.platform).label}>
                    <dl className="space-y-1 text-xs text-muted-foreground">
                      <div className="flex justify-between gap-3">
                        <dt>Status</dt>
                        <dd>
                          <StatusPill status={labelOf(CONNECTION_STATUSES, c.status)} tint={c.status === "connected" ? "good" : c.status === "connection_error" ? "bad" : "muted"} />
                        </dd>
                      </div>
                      <div className="flex justify-between gap-3">
                        <dt>Account ID</dt>
                        <dd className="truncate">{c.external_account_id ?? "—"}</dd>
                      </div>
                      <div className="flex justify-between gap-3">
                        <dt>Permissions</dt>
                        <dd className="truncate">{(c.scopes ?? []).length ? (c.scopes ?? []).join(", ") : "None granted"}</dd>
                      </div>
                      <div className="flex justify-between gap-3">
                        <dt>Can publish</dt>
                        <dd>{c.publishing_enabled ? "Yes" : "No"}</dd>
                      </div>
                      <div className="flex justify-between gap-3">
                        <dt>Can read analytics</dt>
                        <dd>{c.analytics_enabled ? "Yes" : "No"}</dd>
                      </div>
                      <div className="flex justify-between gap-3">
                        <dt>Can read revenue</dt>
                        <dd>{c.revenue_enabled ? "Yes" : "Not available"}</dd>
                      </div>
                      <div className="flex justify-between gap-3">
                        <dt>Health</dt>
                        <dd>{c.health ?? "—"}</dd>
                      </div>
                      <div className="flex justify-between gap-3">
                        <dt>Last sync</dt>
                        <dd>{c.last_sync_at ? new Date(c.last_sync_at).toLocaleString() : "Never"}</dd>
                      </div>
                    </dl>
                    {c.last_error ? <p className="mt-2 text-[11px] text-amber-400">{c.last_error}</p> : null}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {c.status === "connected" ? (
                        <>
                          <QuietButton disabled={busy} onClick={() => act(() => sync({ data: { connectionId: c.id, kind: "analytics" } }).then((r) => ({ note: r.note })))}>
                            Sync analytics
                          </QuietButton>
                          <QuietButton disabled={busy} onClick={() => act(() => sync({ data: { connectionId: c.id, kind: "revenue" } }).then((r) => ({ note: r.note })))}>
                            Sync revenue
                          </QuietButton>
                          <QuietButton disabled={busy} onClick={() => act(() => manage({ data: { action: "disconnect", connectionId: c.id } }))}>
                            Disconnect
                          </QuietButton>
                        </>
                      ) : (
                        <QuietButton disabled={busy} onClick={() => act(() => manage({ data: { action: "reconnect", connectionId: c.id } }))}>
                          {c.status === "needs_reauthorization" ? "Reauthorize" : "Connect"}
                        </QuietButton>
                      )}
                    </div>
                  </StudioCard>
                ))}
              </div>
            )}
          </StudioSection>
        );
      })}

      <StudioSection title="Synchronisation history" hint="What we asked each platform for, and what came back.">
        {runs.length === 0 ? (
          <EmptyState title="Nothing synced yet" body="Once a channel is truly connected, each sync is recorded here." />
        ) : (
          <div className="space-y-2">
            {runs.map((r) => (
              <StudioCard key={r.id} eyebrow={`${platformMeta(r.platform).label} • ${r.kind}`} title={r.status}>
                <p className="text-xs text-muted-foreground">
                  {new Date(r.created_at).toLocaleString()} — {(r.detail as { note?: string })?.note ?? "—"}
                </p>
              </StudioCard>
            ))}
          </div>
        )}
      </StudioSection>
    </>
  );
}
