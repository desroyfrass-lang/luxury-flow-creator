// Platform Status Center — the executive heartbeat of Frass OS.
// One glance tells the Founder the health of the whole platform.

import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  EMPTY_OPS,
  loadOps,
  platformStatus,
  saveOps,
  statusHeadline,
  STATUS_DOT,
  type OpsCounters,
  type StatusRow,
} from "@/lib/platform-status";

export function PlatformStatusCenter() {
  const [rows, setRows] = useState<StatusRow[]>([]);
  const [aiOk, setAiOk] = useState<boolean | null>(null);
  const [ops, setOps] = useState<OpsCounters>(EMPTY_OPS);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    setOps(loadOps());
    // Reachability only — no model call is made, so this costs nothing.
    let alive = true;
    fetch("/api/chat", { method: "GET" })
      .then((r) => alive && setAiOk(r.status < 500))
      .catch(() => alive && setAiOk(false));
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    setRows(
      platformStatus({
        online: true,
        aiOk,
        // Shopify Storefront checkout is configured in the storefront client.
        paymentsConnected: true,
        ops,
      }),
    );
  }, [aiOk, ops]);

  const headline = statusHeadline(rows);

  return (
    <section className="mt-12" data-blueprint="platform-status">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl">Platform Status</h2>
          <p className="mt-1 text-xs text-muted-foreground">{headline}</p>
        </div>
        <button
          type="button"
          className="rounded-sm border border-border px-4 py-2 text-[10px] font-bold uppercase tracking-[0.28em] text-muted-foreground transition hover:border-[color:var(--gold)]"
          onClick={() => setEditing((v) => !v)}
        >
          {editing ? "Done" : "Update counters"}
        </button>
      </div>

      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        {rows.map((r) => {
          const body = (
            <>
              <span className="ps-dot" aria-hidden>
                {STATUS_DOT[r.level]}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold">{r.label}</span>
                <span className="block truncate text-xs text-muted-foreground">{r.detail}</span>
                <span className="mt-0.5 block text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">
                  {r.source}
                </span>
              </span>
            </>
          );
          return r.to ? (
            <Link key={r.id} to={r.to} className="ps-row">
              {body}
            </Link>
          ) : (
            <div key={r.id} className="ps-row">
              {body}
            </div>
          );
        })}
      </div>

      {editing && (
        <div className="mt-4 grid gap-3 rounded-sm border border-border bg-background/40 p-4 sm:grid-cols-2">
          <Num
            label="Products placed"
            value={ops.populationDone}
            onChange={(v) => setOps((o) => ({ ...o, populationDone: v }))}
          />
          <Num
            label="Product target"
            value={ops.populationTotal}
            onChange={(v) => setOps((o) => ({ ...o, populationTotal: v }))}
          />
          <Num
            label="Vendors reviewed"
            value={ops.vendorsReviewed}
            onChange={(v) => setOps((o) => ({ ...o, vendorsReviewed: v }))}
          />
          <Num
            label="Vendors in review"
            value={ops.vendorsTotal}
            onChange={(v) => setOps((o) => ({ ...o, vendorsTotal: v }))}
          />
          <div className="sm:col-span-2 flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-sm bg-[color:var(--gold)] px-5 py-2 text-[10px] font-bold uppercase tracking-[0.28em] text-black"
              onClick={() => {
                setOps(saveOps(ops));
                setEditing(false);
                toast("Platform status updated", { description: "Every light now reflects your recorded numbers." });
              }}
            >
              Save
            </button>
            <button
              type="button"
              className="rounded-sm border border-border px-5 py-2 text-[10px] font-bold uppercase tracking-[0.28em] text-muted-foreground"
              onClick={() => setOps(saveOps({ lastBackupAt: new Date().toISOString() }))}
            >
              Record backup today
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function Num({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number | null;
  onChange: (v: number | null) => void;
}) {
  return (
    <label className="text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
      {label}
      <input
        inputMode="numeric"
        value={value === null ? "" : String(value)}
        onChange={(e) => {
          const raw = e.target.value.replace(/[^0-9]/g, "");
          onChange(raw === "" ? null : Number(raw));
        }}
        placeholder="—"
        className="mt-1 w-full rounded-sm border border-border bg-background/70 px-2 py-2 text-sm tracking-normal text-foreground"
      />
    </label>
  );
}
