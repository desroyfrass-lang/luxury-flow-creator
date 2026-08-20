// FRASS-0574/0575/0576 — Canonical Audit Registry service.
//
// One registry (WORLD_ROUTES in world-teleporter.ts) is the single source of
// truth for every card lookup. This module layers on:
//   • a stable version + hash so a stale production registry is visible instantly
//   • a pure pathname → canonical-card resolver (no session, no cache)
//   • an immutable Audit Identity Lock created the moment a card resolves
//   • a uniqueness invariant: one route → one card, one card → one route
//
// Plain English: the server is the only one allowed to say "this page is
// Card #025." The browser sends only the URL; everything else is decided here.
// Nothing the AI emits can override it — identity is a server guarantee.

import { WORLD_ROUTES, type WorldRoute } from "./world-teleporter";
import { cardKey, cardNumber } from "./teleporter-audit";

// Bumped when the registry shape changes. Both this and the hash appear on
// every audit receipt, so a stale registry in production is visible instantly.
export const REGISTRY_VERSION = "2026.08.20.01";

// ── Registry fingerprint ───────────────────────────────────────────────────

/** A route is audit-eligible when it is a real page (not a redirect, not a
 *  legacy duplicate). Redirects and legacy entries are doors onto something
 *  else, never the thing being reviewed. */
function auditEligibleRoutes(): WorldRoute[] {
  return WORLD_ROUTES.filter((r) => !r.redirect && r.status !== "legacy");
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function computeRegistryHash(): string {
  const eligible = auditEligibleRoutes();
  const keys = eligible.map((r) => cardKey(r)).sort((a, b) => a.localeCompare(b));
  const joined = keys.join("|");
  // FNV-1a 32-bit — deterministic across runtimes, no native deps.
  let h = 0x811c9dc5;
  for (let i = 0; i < joined.length; i++) {
    h ^= joined.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).toUpperCase().padStart(8, "0");
}

export const REGISTRY_HASH = computeRegistryHash();

// ── Path normalization ─────────────────────────────────────────────────────

export function normalizePath(p: string | null | undefined): string {
  if (!p) return "";
  const clean = p.split("?")[0].split("#")[0];
  const trimmed = clean.length > 1 ? clean.replace(/\/+$/, "") : clean;
  return trimmed.toLowerCase();
}

// ── Canonical card resolution (pure) ───────────────────────────────────────

// Deduplicate by path: if two eligible routes share a path, keep the first
// (stable registry order). This is the set the resolver consults.
const CANONICAL_BY_PATH: Map<string, WorldRoute> = (() => {
  const map = new Map<string, WorldRoute>();
  for (const r of auditEligibleRoutes()) {
    const key = normalizePath(r.path);
    if (!map.has(key)) map.set(key, r);
  }
  return map;
})();

export type CanonicalCard = {
  key: string;
  number: number;
  title: string;
  path: string;
  component: string;
  file: string;
  district: string;
};

/** Pure pathname → canonical card. No session, no cache, no side effects.
 *  Returns null when the route is not an audit-eligible page. */
export function resolveCanonicalCard(pathname: string | null | undefined): CanonicalCard | null {
  const here = normalizePath(pathname);
  if (!here) return null;
  const route = CANONICAL_BY_PATH.get(here);
  if (!route) return null;
  return {
    key: cardKey(route),
    number: cardNumber(route),
    title: route.title,
    path: route.path,
    component: route.component,
    file: route.file,
    district: route.district,
  };
}

// ── Registry uniqueness invariant (FRASS-0576 §2a-ii) ─────────────────────

export type RegistryViolation = { kind: "duplicate_path" | "duplicate_number"; detail: string };

/** All eligible routes grouped by normalized path. Used by both validateRegistry
 *  and isPathAmbiguous so the two never disagree about what "duplicate" means. */
function routesByPath(): Map<string, WorldRoute[]> {
  const byPath = new Map<string, WorldRoute[]>();
  for (const r of auditEligibleRoutes()) {
    const p = normalizePath(r.path);
    let arr = byPath.get(p);
    if (!arr) { arr = []; byPath.set(p, arr); }
    arr.push(r);
  }
  return byPath;
}

/** One route maps to exactly one card and vice versa. Returns violations;
 *  an empty array means the registry is sound. Violations are reported for
 *  diagnosis — a duplicate on /blog does not block the audit of /admin/visual-index. */
export function validateRegistry(): RegistryViolation[] {
  const violations: RegistryViolation[] = [];
  const byPath = routesByPath();
  const byNumber = new Map<number, WorldRoute[]>();
  for (const r of auditEligibleRoutes()) {
    const n = cardNumber(r);
    let arr = byNumber.get(n);
    if (!arr) { arr = []; byNumber.set(n, arr); }
    arr.push(r);
  }
  for (const [, rs] of byPath) {
    if (rs.length > 1)
      violations.push({ kind: "duplicate_path", detail: `${rs.length} eligible routes on ${normalizePath(rs[0].path)}` });
  }
  for (const [n, rs] of byNumber) {
    if (rs.length > 1 && n !== 0)
      violations.push({ kind: "duplicate_number", detail: `${rs.length} eligible routes are Card #${n}` });
  }
  return violations;
}

/** True when two or more eligible routes share this pathname — the identity
 *  is ambiguous and the audit must be blocked for THIS path only. */
export function isPathAmbiguous(pathname: string | null | undefined): boolean {
  const here = normalizePath(pathname);
  if (!here) return false;
  const byPath = routesByPath();
  const rs = byPath.get(here);
  return Boolean(rs && rs.length > 1);
}

// ── FRASS-0575 — Audit Identity Lock ──────────────────────────────────────

export type AuditIdentity = {
  readonly id: number;
  readonly route: string;
  readonly title: string;
  readonly component: string;
  readonly file: string;
  readonly district: string;
  readonly key: string;
  readonly registryVersion: string;
  readonly registryHash: string;
  readonly frozen: true;
};

/** Resolve the canonical card from the pathname and seal it into an immutable
 *  Audit Identity Lock. Returns null when the route is not an audit page OR
 *  when the path is ambiguous (two eligible routes share it). The server
 *  distinguishes the two cases with isPathAmbiguous to produce the right
 *  blocked response. The returned object is frozen — nothing downstream
 *  may mutate it. */
export function resolveAuditIdentity(pathname: string | null | undefined): AuditIdentity | null {
  if (isPathAmbiguous(pathname)) return null;
  const card = resolveCanonicalCard(pathname);
  if (!card) return null;
  return Object.freeze({
    id: card.number,
    route: card.path,
    title: card.title,
    component: card.component,
    file: card.file,
    district: card.district,
    key: card.key,
    registryVersion: REGISTRY_VERSION,
    registryHash: REGISTRY_HASH,
    frozen: true as const,
  });
}

export function formatCardNumber(n: number): string {
  return `#${String(n).padStart(3, "0")}`;
}

// ── AI identity stripping (FRASS-0576 §2b) ─────────────────────────────────

/** The AI is not allowed to emit identity. Any line it produces that looks like
 *  a card heading, a "Visual Verification" banner, or a standalone route line
 *  is discarded before the analysis is shown. The server's locked header is
 *  the only identity the Founder ever sees. Never regenerate by calling the
 *  AI again — a second call can re-hallucinate. */
export function stripAuditIdentity(text: string, identity: AuditIdentity): string {
  if (!text) return "";
  const routeRegex = new RegExp(`^\\s*${escapeRegex(identity.route)}\\s*$`, "i");
  const headerRegex = /^#{0,6}\s*(card\s*#?\s*\d{1,3}|visual\s+verification)/i;
  // FRASS-0577 — the Teleporter is an inventory, never a wizard. Any sentence
  // that asks for, counts toward, or hands off to a "next card" is removed
  // server-side, whatever the model was told.
  const sequenceRegex =
    /(ready\s+for\s+(the\s+)?(next\s+)?card|next\s+card|paste\s+the\s+(next\s+)?card|on\s+to\s+card\s*#?\s*\d|move\s+on\s+to\s+card|card\s*#?\s*\d{1,3}\s+(is\s+)?(next|up next)|send\s+(me\s+)?(the\s+)?next\s+card|teleporter\s+queue)/i;
  const lines = text.split("\n");
  const kept = lines
    .map((line) =>
      sequenceRegex.test(line)
        ? line
            .split(/(?<=[.!?])\s+/)
            .filter((s) => !sequenceRegex.test(s))
            .join(" ")
            .trim()
        : line,
    )
    .filter((line, i) => {
      if (headerRegex.test(line) || routeRegex.test(line)) return false;
      // Drop lines that became empty only because we removed sequence talk.
      if (line.trim() === "" && lines[i].trim() !== "") return false;
      return true;
    });
  const result = kept.join("\n").replace(/\n{3,}/g, "\n\n").trim();
  return result || text.trim();
}

