// ─────────────────────────────────────────────────────────────────────────────
// FRASSY — Step 2. The consent moment, shared by everything that can speak.
//
// The visitor chooses first. Frassy never starts talking and then asks whether
// talking was welcome. Until a choice exists she stays in text, and she stays
// completely usable in text: chat, guidance and navigation all work.
//
// The choice is stored in the preference storage that already exists
// (frassy:prefs:v2) — no new database, no new key, no new system.
// ─────────────────────────────────────────────────────────────────────────────

import type { FrassyCommunicationMode } from "@/hooks/use-frassy-prefs";

const KEY = "frassy:prefs:v2";

type StoredPrefs = {
  communicationMode?: FrassyCommunicationMode;
  consentedAt?: string | null;
  consentDismissCount?: number;
  muted?: boolean;
};

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function read(): StoredPrefs {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as StoredPrefs) : {};
  } catch {
    return {};
  }
}

function write(patch: StoredPrefs) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify({ ...read(), ...patch }));
  } catch {
    /* private mode — the session still works, the choice just isn't remembered */
  }
  emit();
}

/** Has the visitor made a voice choice at all yet? */
export function hasVoiceDecision(): boolean {
  const p = read();
  return Boolean(p.consentedAt) && Boolean(p.communicationMode);
}

/** May Frassy speak out loud right now? */
export function voiceAllowed(): boolean {
  const p = read();
  if (!p.consentedAt) return false;
  if (p.muted) return false;
  return p.communicationMode === "voice_text" || p.communicationMode === "voice_only";
}

export function currentMode(): FrassyCommunicationMode {
  return read().communicationMode ?? "silent";
}

/** Record the visitor's answer. Changeable later — never a permanent lock. */
export function setVoiceChoice(mode: FrassyCommunicationMode) {
  write({ communicationMode: mode, consentedAt: new Date().toISOString(), muted: false });
}

/** "Continue for now" — she stays quiet and asks again another session. */
export function deferVoiceChoice() {
  const p = read();
  write({ consentDismissCount: (p.consentDismissCount ?? 0) + 1 });
  emit();
}

/** The existing mute control, kept in step with the stored preference. */
export function setMuted(muted: boolean) {
  write({ muted });
}

export function isMuted(): boolean {
  return Boolean(read().muted);
}

export function subscribeVoiceConsent(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Full snapshot for the consent modal, which expects the prefs shape. */
export function readConsentSnapshot() {
  const p = read();
  return {
    communicationMode: p.communicationMode ?? ("silent" as FrassyCommunicationMode),
    consentedAt: p.consentedAt ?? null,
    consentDismissCount: p.consentDismissCount ?? 0,
    muted: Boolean(p.muted),
  };
}
