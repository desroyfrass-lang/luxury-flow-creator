// FRASS-0576 §2a-iii — Audit Diagnostics log.
//
// Blocked audits stay out of the Founder Audit Ledger (which only ever holds
// successful audits) but are recorded here so any recurrence is diagnosable in
// seconds. This is a server-side in-memory ring buffer; it survives for the
// life of the worker and is distinct from the permanent ledger.

export type AuditBlockRecord = {
  requestId: string;
  timestamp: string;
  currentUrl: string;
  resolvedRoute: string | null;
  reason: string;
  registryVersion: string;
  registryHash: string;
  aiCalled: false;
  ledgerWritten: false;
};

const MAX_DIAGNOSTICS = 100;
const buffer: AuditBlockRecord[] = [];

export function logAuditBlock(record: Omit<AuditBlockRecord, "timestamp" | "aiCalled" | "ledgerWritten">): AuditBlockRecord {
  const full: AuditBlockRecord = {
    ...record,
    timestamp: new Date().toISOString(),
    aiCalled: false,
    ledgerWritten: false,
  };
  buffer.push(full);
  if (buffer.length > MAX_DIAGNOSTICS) buffer.shift();
  // Surface in server logs for immediate visibility.
  console.error("[audit-blocked]", full);
  return full;
}

export function readAuditDiagnostics(): AuditBlockRecord[] {
  return [...buffer];
}

export function clearAuditDiagnostics(): void {
  buffer.length = 0;
}

// ── P0 §6 — Violation guard ──────────────────────────────────────────────────
// Repeated AuditContextViolations mean the runtime itself is unhealthy. After
// three, Teleporter audits pause until a Founder manually resumes them.
const VIOLATION_LIMIT = 3;
let violations = 0;
let paused = false;

export function recordAuditViolation(): { violations: number; paused: boolean } {
  violations += 1;
  if (violations >= VIOLATION_LIMIT) paused = true;
  return { violations, paused };
}

export function isAuditPaused(): boolean {
  return paused;
}

export function resumeAudits(): void {
  violations = 0;
  paused = false;
}
