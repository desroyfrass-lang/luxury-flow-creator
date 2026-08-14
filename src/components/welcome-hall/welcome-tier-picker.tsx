// FRASS-0569 — the member chooses how Frassy greets them each morning.
// This preference lives in Daily settings; the Welcome Hall obeys it.

import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  WELCOME_TIERS,
  getWelcomeTier,
  resetDailyWelcome,
  setWelcomeTier,
  type WelcomeTier,
} from "@/lib/welcome-hall/daily-welcome";

export function WelcomeTierPicker() {
  const [tier, setTier] = useState<WelcomeTier>("motivational");

  useEffect(() => {
    setTier(getWelcomeTier());
  }, []);

  return (
    <section className="rounded-2xl border border-[color:var(--hill-gold)]/40 bg-card/60 p-6">
      <p className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
        🌅 Welcome Hall · Daily Welcome
      </p>
      <h2 className="mt-3 text-xl font-black uppercase tracking-tight">
        How Frassy greets you each morning
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        Every day begins in the Welcome Hall, then your Daily follows. Choose the welcome that suits
        you — you can always skip it once you're there.
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {WELCOME_TIERS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => {
              setWelcomeTier(t.id);
              setTier(t.id);
            }}
            className={`rounded-xl border p-4 text-left transition ${
              t.id === tier
                ? "border-[color:var(--hill-gold)] bg-[color:var(--hill-gold)]/10"
                : "border-border/70 hover:border-foreground/40"
            }`}
          >
            <span aria-hidden className="text-xl">
              {t.glyph}
            </span>
            <h3 className="mt-2 text-sm font-bold">{t.name}</h3>
            <p className="mt-0.5 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
              {t.length}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{t.summary}</p>
          </button>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <Link
          to="/welcome-hall"
          search={{ welcome: "daily" as const, next: "/room" }}
          className="rounded-full border border-border px-5 py-2 text-[10px] font-bold uppercase tracking-[0.25em] hover:border-[color:var(--hill-gold)]"
        >
          Preview my welcome
        </Link>
        <button
          type="button"
          onClick={() => resetDailyWelcome()}
          className="rounded-full border border-border px-5 py-2 text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground hover:text-foreground"
        >
          Play it again tomorrow morning
        </button>
      </div>
    </section>
  );
}
