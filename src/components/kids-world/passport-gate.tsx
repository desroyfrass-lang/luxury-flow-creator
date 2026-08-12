import { useState } from "react";
import { KIDS_WORLDS } from "@/lib/kids-world";
import { obscurePin, useKidsPassport } from "@/lib/kids-passport";

/**
 * The Kids World Passport gate. A parent prepares a passport before the child
 * enters. It is a family setting — warm, never a security checkpoint.
 */
export function PassportGate({ onIssued }: { onIssued?: (age: string) => void }) {
  const { passport, issue } = useKidsPassport();
  const [age, setAge] = useState(passport?.age ?? "6-12");
  const [locked, setLocked] = useState(passport?.locked ?? true);
  const [childName, setChildName] = useState(passport?.childName ?? "");
  const [pin, setPin] = useState("");
  const [usePin, setUsePin] = useState(Boolean(passport?.pin));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    issue({
      age,
      locked,
      childName: childName.trim() || undefined,
      pin: usePin && pin.trim().length >= 4 ? obscurePin(pin.trim()) : undefined,
    });
    onIssued?.(age);
  }

  const world = KIDS_WORLDS.find((w) => w.slug === age);

  return (
    <form
      onSubmit={submit}
      className="rounded-[2rem] border border-[color:var(--gold)]/30 bg-card/80 p-6 backdrop-blur-xl md:p-9"
    >
      <p className="text-[10px] uppercase tracking-[0.38em] text-[color:var(--gold)]">
        For the grown-up
      </p>
      <h2 className="mt-3 font-display text-3xl uppercase md:text-4xl">
        Prepare a Kids World Passport
      </h2>
      <p className="mt-3 max-w-xl text-sm text-muted-foreground">
        Choose the age group and we&rsquo;ll keep the world to places designed for it.
        This applies to Kids World only — shopping is never restricted. You can
        change it any time from the Parent Dashboard.
      </p>

      <fieldset className="mt-7">
        <legend className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          Age group
        </legend>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {KIDS_WORLDS.map((w) => {
            const active = w.slug === age;
            return (
              <button
                key={w.slug}
                type="button"
                onClick={() => setAge(w.slug)}
                aria-pressed={active}
                className="rounded-2xl border p-4 text-left transition"
                style={{
                  borderColor: active ? w.accent : "color-mix(in oklab, currentColor 18%, transparent)",
                  boxShadow: active ? `0 18px 50px -32px ${w.accent}` : undefined,
                }}
              >
                <span className="text-2xl" aria-hidden>
                  {w.emoji}
                </span>
                <span className="mt-1 block font-display text-xl uppercase leading-none">
                  {w.ageLabel}
                </span>
                <span className="mt-2 block text-xs text-muted-foreground">{w.title}</span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-7 grid gap-5 md:grid-cols-2">
        <label className="block">
          <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            Child&rsquo;s name (optional)
          </span>
          <input
            value={childName}
            onChange={(e) => setChildName(e.target.value)}
            placeholder="So we can welcome them properly"
            className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm"
          />
        </label>

        <div className="space-y-3">
          <label className="flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              checked={locked}
              onChange={(e) => setLocked(e.target.checked)}
              className="mt-1 h-4 w-4"
            />
            <span>
              <span className="font-semibold">Safe Exploration Mode</span>
              <span className="block text-xs text-muted-foreground">
                Keep the world to {world?.ageLabel} places only.
              </span>
            </span>
          </label>
          <label className="flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              checked={usePin}
              onChange={(e) => setUsePin(e.target.checked)}
              className="mt-1 h-4 w-4"
            />
            <span>
              <span className="font-semibold">Require a PIN to change settings</span>
              <span className="block text-xs text-muted-foreground">
                Four digits or more, kept on this device.
              </span>
            </span>
          </label>
          {usePin && (
            <input
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              inputMode="numeric"
              autoComplete="off"
              placeholder="Parent PIN"
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm tracking-[0.4em]"
            />
          )}
        </div>
      </div>

      <button
        type="submit"
        className="mt-8 rounded-full bg-[color:var(--gold)] px-8 py-3 text-[11px] font-bold uppercase tracking-[0.26em] text-[color:var(--ink)] transition hover:opacity-90"
      >
        Issue the passport
      </button>
      <p className="mt-4 max-w-xl font-script text-base italic text-[color:var(--gold)]">
        &ldquo;Your child&rsquo;s Kids World Passport will be ready. They&rsquo;ll only explore
        places made for their age — and you can update it any time.&rdquo; — Frassy
      </p>
    </form>
  );
}
