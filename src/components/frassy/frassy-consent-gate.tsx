// ─────────────────────────────────────────────────────────────────────────────
// FRASSY — Step 2. The consent moment, mounted once.
//
// The existing consent modal is unchanged; this is only the gate that decides
// when it appears. It appears before Frassy's first unsolicited spoken words,
// on surfaces where she is allowed to be at all, and never while the cinematic
// entrance holds the stage.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState, useSyncExternalStore } from "react";
import { useRouterState } from "@tanstack/react-router";
import { FrassyConsentModal } from "@/components/frassy-consent";
import { frassySurface } from "@/lib/frassy/surfaces";
import {
  isEntranceActive,
  isEntranceActiveServer,
  subscribeEntrance,
} from "@/lib/frassy/host-presence";
import {
  deferVoiceChoice,
  hasVoiceDecision,
  readConsentSnapshot,
  setVoiceChoice,
  subscribeVoiceConsent,
} from "@/lib/frassy/voice-consent";
import type { FrassyCommunicationMode, FrassyPrefs } from "@/hooks/use-frassy-prefs";

const SESSION_DEFERRED = "frassy:consent-deferred";

export function FrassyConsentGate() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const entrance = useSyncExternalStore(
    subscribeEntrance,
    isEntranceActive,
    isEntranceActiveServer,
  );
  const [ready, setReady] = useState(false);
  const [decided, setDecided] = useState(true);
  const [deferred, setDeferred] = useState(true);

  useEffect(() => {
    const sync = () => setDecided(hasVoiceDecision());
    sync();
    try {
      setDeferred(sessionStorage.getItem(SESSION_DEFERRED) === "1");
    } catch {
      setDeferred(false);
    }
    setReady(true);
    return subscribeVoiceConsent(sync);
  }, []);

  if (!ready || decided || deferred || entrance) return null;
  if (frassySurface(pathname) === "none") return null;

  const snapshot = readConsentSnapshot();

  const choose = (mode: FrassyCommunicationMode) => {
    setVoiceChoice(mode);
    setDecided(true);
  };

  const defer = () => {
    deferVoiceChoice();
    try {
      sessionStorage.setItem(SESSION_DEFERRED, "1");
    } catch {
      /* private mode — she simply stays quiet this session */
    }
    setDeferred(true);
  };

  return (
    <FrassyConsentModal
      open
      onChoose={choose}
      onDefer={defer}
      prefs={snapshot as unknown as FrassyPrefs}
    />
  );
}
