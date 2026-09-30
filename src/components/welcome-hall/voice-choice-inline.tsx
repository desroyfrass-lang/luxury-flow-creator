// FRASS Welcome Hall consolidation — Frassy asks how she should talk to you
// as part of her own welcome, never as a separate pop-up covering other pages.
// Uses the existing stored choice (voice-consent), no new system.

import { useEffect, useState } from "react";
import type { FrassyCommunicationMode } from "@/hooks/use-frassy-prefs";
import {
  hasVoiceDecision,
  setVoiceChoice,
  subscribeVoiceConsent,
} from "@/lib/frassy/voice-consent";

const OPTIONS: { id: FrassyCommunicationMode; title: string; desc: string }[] = [
  { id: "voice_text", title: "Talk to me and write it down", desc: "My voice, with every word in text too." },
  { id: "silent", title: "Just write to me", desc: "Text only. No sound." },
  { id: "voice_only", title: "Just talk to me", desc: "Hands-free — I speak and listen." },
];

export function VoiceChoiceInline({ onChosen }: { onChosen?: (mode: FrassyCommunicationMode) => void }) {
  const [decided, setDecided] = useState(true);
  useEffect(() => {
    const sync = () => setDecided(hasVoiceDecision());
    sync();
    return subscribeVoiceConsent(sync);
  }, []);
  if (decided) return null;

  return (
    <div
      role="group"
      aria-label="How Frassy should talk to you"
      className="mt-6 rounded-xl border border-[color:var(--gold)]/40 bg-secondary/30 p-4"
    >
      <p className="text-sm text-foreground">Before we go on — how would you like me to talk with you?</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        {OPTIONS.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => {
              setVoiceChoice(o.id);
              onChosen?.(o.id);
            }}
            className="rounded-lg border border-border bg-background p-3 text-left transition hover:border-[color:var(--gold)]"
          >
            <span className="block text-sm font-medium">{o.title}</span>
            <span className="mt-1 block text-xs text-muted-foreground">{o.desc}</span>
          </button>
        ))}
      </div>
      <p className="mt-2 text-[10px] text-muted-foreground">
        You can change this any time in Frassy Settings. Until you choose, I'll stay in text.
      </p>
    </div>
  );
}
