import { useEffect, useState } from "react";
import { X } from "lucide-react";
import symbolAsset from "@/assets/frass-logo-symbol.asset.json";
import type { FrassyCommunicationMode, FrassyPrefs } from "@/hooks/use-frassy-prefs";

type Props = {
  open: boolean;
  onChoose: (mode: FrassyCommunicationMode) => void;
  onDefer: () => void;
  prefs: FrassyPrefs;
};

const OPTIONS: {
  id: FrassyCommunicationMode;
  title: string;
  desc: string;
  badge?: string;
}[] = [
  {
    id: "silent",
    title: "Silent Concierge",
    desc: "Beautifully written messages only. No audio. Animations stay elegant.",
    badge: "Default",
  },
  {
    id: "voice_text",
    title: "Voice & Text",
    desc: "Natural speech paired with written responses. The full concierge experience.",
    badge: "Recommended",
  },
  {
    id: "voice_only",
    title: "Voice Only",
    desc: "Coming soon — a voice-first Frassy for hands-free moments.",
  },
];

export function FrassyConsentModal({ open, onChoose, onDefer, prefs }: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    if (open) setMounted(true);
  }, [open]);

  if (!open || !mounted) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="frassy-consent-title"
      className="fixed inset-0 z-[70] flex items-end justify-center bg-black/40 px-4 py-6 backdrop-blur-sm animate-fade-in md:items-center"
    >
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-[color:var(--gold)]/40 bg-background shadow-2xl">
        <button
          type="button"
          onClick={onDefer}
          aria-label="Continue for now"
          className="absolute right-3 top-3 rounded-full p-1.5 text-muted-foreground hover:bg-secondary/60"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-3 border-b border-border bg-foreground px-5 py-4 text-background">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-background/10">
            <img src={symbolAsset.url} alt="" className="h-8 w-8 object-contain" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.28em] opacity-70">
              Frass Hill Concierge
            </div>
            <div id="frassy-consent-title" className="font-display text-lg leading-none">
              Welcome to Frass Hill
            </div>
          </div>
        </div>

        <div className="space-y-4 px-5 py-5">
          <p className="text-sm leading-relaxed text-foreground">
            Before we begin, how would you like me to communicate with you?
          </p>

          <div className="space-y-2">
            {OPTIONS.map((opt) => {
              const disabled = opt.id === "voice_only";
              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => onChoose(opt.id)}
                  className={`group flex w-full items-start gap-3 rounded-xl border p-3 text-left transition ${
                    disabled
                      ? "cursor-not-allowed border-border/60 bg-secondary/20 opacity-60"
                      : "border-border bg-background hover:border-[color:var(--gold)]/60 hover:bg-secondary/40"
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{opt.title}</span>
                      {opt.badge && (
                        <span className="rounded-full border border-[color:var(--gold)]/50 px-2 py-0.5 text-[9px] uppercase tracking-[0.18em] text-[color:var(--gold)]">
                          {opt.badge}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {opt.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={onDefer}
            className="w-full rounded-full border border-border bg-background px-4 py-2 text-xs uppercase tracking-[0.22em] text-muted-foreground hover:bg-secondary/50"
          >
            Continue for now
          </button>

          <p className="text-[10px] leading-relaxed text-muted-foreground">
            You can change how Frassy communicates at any time from Frassy Settings. Audio is
            always optional — every message is available in text.
            {prefs.consentDismissCount > 0 ? " We'll stay quiet unless you decide otherwise." : ""}
          </p>
        </div>
      </div>
    </div>
  );
}
