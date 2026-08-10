// FRASS-0450 — the Founder Daily OS tab rail and its panels.
//
// One tab at a time. Nothing here duplicates a place that already exists — the
// lighter tabs launch you into it, the heavier tabs do the work in place.

import { useMemo, useState } from "react";
import { STATUS_DOT, loadOps, platformStatus, statusHeadline } from "@/lib/platform-status";
import { BLUEPRINT_COMPONENTS, loadDecisions } from "@/lib/construction/blueprint-registry";
import {
  FOUNDER_LAUNCHERS,
  FOUNDER_TABS,
  loadFounderNotes,
  saveFounderNotes,
  type FounderNote,
  type FounderTabId,
} from "@/lib/workspace/founder-os";
import { FinancialAuditDashboard } from "@/components/finance/audit-dashboard";

export function FounderTabRail({
  tab,
  onSelect,
  showAudit,
}: {
  tab: FounderTabId;
  onSelect: (t: FounderTabId) => void;
  showAudit: boolean;
}) {
  return (
    <nav className="founder-os-rail" aria-label="Founder Daily OS">
      {FOUNDER_TABS.filter((t) => showAudit || !t.founderOnly).map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => onSelect(t.id)}
          className={`founder-os-tab ${tab === t.id ? "is-active" : ""}`}
          aria-current={tab === t.id ? "page" : undefined}
        >
          <span aria-hidden="true">{t.icon}</span>
          <span>{t.label}</span>
        </button>
      ))}
    </nav>
  );
}

export function FounderOsPanel({
  tab,
  onNavigate,
}: {
  tab: FounderTabId;
  onNavigate?: (href: string) => void;
}) {
  const meta = FOUNDER_TABS.find((t) => t.id === tab);

  return (
    <section className="founder-os-panel">
      <header className="founder-os-head">
        <span className="ws-meta">{meta?.blurb}</span>
        <h2 className="daily-title">{meta?.label}</h2>
      </header>

      {tab === "audit" ? (
        <FinancialAuditDashboard />
      ) : tab === "platform" ? (
        <PlatformAuditTab onNavigate={onNavigate} />
      ) : tab === "decisions" ? (
        <DecisionsTab />
      ) : tab === "notes" ? (
        <NotesTab />
      ) : tab === "registry" ? (
        <RegistryTab />
      ) : (
        <Launchers tab={tab} onNavigate={onNavigate} />
      )}
    </section>
  );
}

function Launchers({ tab, onNavigate }: { tab: FounderTabId; onNavigate?: (href: string) => void }) {
  const items = FOUNDER_LAUNCHERS[tab] ?? [];
  return (
    <div className="founder-os-grid">
      {items.map((i) => (
        <button
          key={i.href}
          type="button"
          className="founder-os-card"
          onClick={() => onNavigate?.(i.href)}
        >
          <span className="founder-os-card-title">{i.label}</span>
          <span className="ws-meta">{i.plain}</span>
        </button>
      ))}
      {!items.length && <p className="ws-meta">Nothing wired to this tab yet.</p>}
    </div>
  );
}

function DecisionsTab() {
  const [q, setQ] = useState("");
  const all = useMemo(() => loadDecisions(), []);
  const term = q.trim().toLowerCase();
  const rows = all.filter((d) =>
    !term
      ? true
      : [d.componentLabel, d.action, d.note, d.founderIntent, d.simulation, ...(d.registry ?? [])]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(term)),
  );

  return (
    <div className="founder-os-stack">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search every decision ever approved…"
        className="founder-os-input"
      />
      {rows.map((d) => (
        <article key={d.id} className="founder-os-row">
          <div className="founder-os-row-head">
            <strong>{d.componentLabel}</strong>
            <span className="ws-meta">{new Date(d.approvedAt).toLocaleString()}</span>
          </div>
          <p className="founder-os-row-body">{d.action}</p>
          {d.founderIntent && <p className="ws-meta">Intent — {d.founderIntent}</p>}
          {d.verification && <span className="ws-meta">Verification: {d.verification}</span>}
        </article>
      ))}
      {!rows.length && (
        <p className="ws-meta">
          {all.length
            ? "No decision matches that search."
            : "No decisions recorded yet. Approve one in the Control Room and it lands here permanently."}
        </p>
      )}
    </div>
  );
}

function PlatformAuditTab({ onNavigate }: { onNavigate?: (href: string) => void }) {
  const [scan, setScan] = useState<{
    broken: number;
    dead: number;
    pages: number;
    at: string;
  } | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const runScan = useServerFn(runLinkCheck);

  const health = useMemo(
    () => platformStatus({ online: true, aiOk: null, paymentsConnected: null, ops: loadOps() }),
    [],
  );

  const rows = useMemo(
    () =>
      platformAudit({
        online: true,
        brokenLinks: scan?.broken ?? null,
        deadRoutes: scan?.dead ?? null,
        scannedPages: scan?.pages ?? null,
        linkCheckedAt: scan?.at ?? null,
        securityFindings: null,
        creditBalance: loadBudget().balance,
      }),
    [scan],
  );

  const crawl = async () => {
    setScanning(true);
    setScanError(null);
    try {
      const report = await runScan({
        data: { baseUrl: window.location.origin, maxPages: 30 },
      });
      setScan({
        broken: report.brokenCount,
        dead: report.results.filter((r) => !r.external && !r.ok).length,
        pages: report.scannedPages.length,
        at: report.ranAt,
      });
    } catch (e) {
      setScanError(e instanceof Error ? e.message : "Could not run the crawl from here.");
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="founder-os-stack">
      <p className="ws-meta">{platformAuditHeadline(rows)}</p>
      <p className="ws-meta">
        What this means in plain English: the Financial Audit checks the money. This checks the
        building the money moves through — the doors, the lights and the wiring.
      </p>

      <div>
        <button type="button" className="daily-enter" onClick={crawl} disabled={scanning}>
          {scanning ? "Walking every page…" : "Run a live link & route crawl"}
        </button>
        {scanError && <p className="ws-meta">{scanError}</p>}
      </div>

      {rows.map((r) => (
        <button
          key={r.id}
          type="button"
          className="founder-os-row is-clickable"
          onClick={() => r.to && onNavigate?.(r.to)}
        >
          <div className="founder-os-row-head">
            <strong>
              {STATUS_DOT[r.level]} {r.label}
            </strong>
            <span className="ws-meta">{r.source}</span>
          </div>
          <p className="founder-os-row-body">{r.detail}</p>
          <span className="ws-meta">{r.plain}</span>
        </button>
      ))}

      <h3 className="founder-os-card-title">Operating signals</h3>
      {health.map((r) => (
        <button
          key={r.id}
          type="button"
          className="founder-os-row is-clickable"
          onClick={() => r.to && onNavigate?.(r.to)}
        >
          <div className="founder-os-row-head">
            <strong>
              {STATUS_DOT[r.level]} {r.label}
            </strong>
            <span className="ws-meta">{r.source}</span>
          </div>
          <p className="founder-os-row-body">{r.detail}</p>
        </button>
      ))}
    </div>
  );
}

function NotesTab() {
  const [notes, setNotes] = useState<FounderNote[]>(() => loadFounderNotes());
  const [draft, setDraft] = useState("");

  const add = () => {
    const text = draft.trim();
    if (!text) return;
    const next = [{ id: crypto.randomUUID(), text, at: new Date().toISOString() }, ...notes];
    setNotes(saveFounderNotes(next));
    setDraft("");
  };

  return (
    <div className="founder-os-stack">
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="A thought, a direction, something to remember tomorrow…"
        rows={3}
        className="founder-os-input"
      />
      <button type="button" className="daily-enter" onClick={add}>
        Keep this note
      </button>
      {notes.map((n) => (
        <article key={n.id} className="founder-os-row">
          <div className="founder-os-row-head">
            <span className="ws-meta">{new Date(n.at).toLocaleString()}</span>
            <button
              type="button"
              className="ws-meta"
              onClick={() => setNotes(saveFounderNotes(notes.filter((x) => x.id !== n.id)))}
            >
              Remove
            </button>
          </div>
          <p className="founder-os-row-body">{n.text}</p>
        </article>
      ))}
      {!notes.length && <p className="ws-meta">Notes stay private to this device.</p>}
    </div>
  );
}

function RegistryTab() {
  const [q, setQ] = useState("");
  const term = q.trim().toLowerCase();
  const rows = BLUEPRINT_COMPONENTS.filter((c) =>
    !term
      ? true
      : [c.label, c.purpose, c.specification, ...c.registry]
          .join(" ")
          .toLowerCase()
          .includes(term),
  );
  return (
    <div className="founder-os-stack">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search the registry — specifications, districts, systems…"
        className="founder-os-input"
      />
      {rows.map((c) => (
        <article key={c.id} className="founder-os-row">
          <div className="founder-os-row-head">
            <strong>{c.label}</strong>
            <span className="ws-meta">
              {c.specification} · {c.status}
            </span>
          </div>
          <p className="founder-os-row-body">{c.purpose}</p>
        </article>
      ))}
      {!rows.length && <p className="ws-meta">Nothing in the registry matches that.</p>}
    </div>
  );
}
