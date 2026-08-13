// FRASS-0546 — the member's earned momentum level and achievement style.

import { useCallback, useEffect, useState } from "react";
import { readBalanceSignals } from "@/lib/frassy/balance-signals";
import { NO_SIGNALS } from "@/lib/frassy/human-balance";
import {
  EMPTY_MOMENTUM,
  loadMomentum,
  offerChallenge,
  readMomentum,
  saveMomentum,
  type AchievementStyle,
  type MomentumRecord,
} from "@/lib/frassy/momentum";

export function useMomentum() {
  const [record, setRecord] = useState<MomentumRecord>(EMPTY_MOMENTUM);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setRecord(loadMomentum());
    setHydrated(true);
    const onChange = (e: Event) => {
      const next = (e as CustomEvent<MomentumRecord>).detail;
      if (next) setRecord(next);
    };
    window.addEventListener("frassy:momentum", onChange);
    return () => window.removeEventListener("frassy:momentum", onChange);
  }, []);

  const update = useCallback((patch: Partial<MomentumRecord>) => {
    setRecord((prev) => {
      const next = { ...prev, ...patch };
      saveMomentum(next);
      return next;
    });
  }, []);

  const momentum = readMomentum(
    hydrated ? (readBalanceSignals() ?? NO_SIGNALS) : NO_SIGNALS,
    record,
  );

  return {
    hydrated,
    record,
    momentum,
    challenge: hydrated ? offerChallenge(momentum, record) : null,
    setStyle: (style: AchievementStyle) => update({ style }),
    setChallengesOptOut: (challengesOptOut: boolean) => update({ challengesOptOut }),
    acceptChallenge: () => update({ completed: record.completed }),
    declineChallenge: () => update({ declined: record.declined + 1 }),
    completeChallenge: () => update({ completed: record.completed + 1 }),
  };
}
