import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { PassportGate } from "@/components/kids-world/passport-gate";
import { KIDS_WORLDS } from "@/lib/kids-world";
import { useKidsPassport } from "@/lib/kids-passport";
import { StreetParentPanel } from "@/components/kids/street-parent-panel";

const TITLE = "Parent Dashboard — FRASS Kids World";
const DESCRIPTION =
  "Manage the Kids World Passport: Safe Exploration Mode, age group and an optional PIN. Kids World settings never affect shopping.";

export const Route = createFileRoute("/kids-world/parents")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ParentDashboard,
});

function ParentDashboard() {
  const { passport, ready, update, revoke, checkPin } = useKidsPassport();
  const [pin, setPin] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState(false);
  const needsPin = Boolean(passport?.pin) && !unlocked;

  return (
    <>
      <PageHeader
        eyebrow="Kids World"
        title="Parent Dashboard"
        description="Everything here applies to Kids World only. Shopping is never restricted."
        crumbs={[
          { label: "Kids World", to: "/kids-world" },
          { label: "Parent Dashboard" },
        ]}
      />

      <section className="mx-auto max-w-[1600px] px-6 pb-24 lg:px-12">
        {!ready ? null : !passport ? (
          <PassportGate />
        ) : needsPin ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (checkPin(pin)) {
                setUnlocked(true);
                setError(false);
              } else setError(true);
            }}
            className="max-w-md rounded-[2rem] border border-border bg-card p-8"
          >
            <h2 className="font-display text-2xl uppercase">Enter parent PIN</h2>
            <input
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              inputMode="numeric"
              autoComplete="off"
              className="mt-5 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm tracking-[0.4em]"
            />
            {error && <p className="mt-3 text-xs text-destructive">That PIN doesn&rsquo;t match.</p>}
            <button
              type="submit"
              className="mt-6 rounded-full bg-[color:var(--gold)] px-7 py-3 text-[11px] font-bold uppercase tracking-[0.26em] text-[color:var(--ink)]"
            >
              Unlock settings
            </button>
          </form>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[2rem] border border-[color:var(--gold)]/30 bg-card p-8">
              <p className="text-[10px] uppercase tracking-[0.38em] text-[color:var(--gold)]">
                The passport
              </p>
              <h2 className="mt-3 font-display text-3xl uppercase">
                {passport.childName || "Kids World Passport"}
              </h2>

              <label className="mt-7 flex items-start gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={passport.locked}
                  onChange={(e) => update({ locked: e.target.checked })}
                  className="mt-1 h-4 w-4"
                />
                <span>
                  <span className="font-semibold">Safe Exploration Mode</span>
                  <span className="block text-xs text-muted-foreground">
                    Keep Kids World to the selected age group only.
                  </span>
                </span>
              </label>

              <fieldset className="mt-7">
                <legend className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                  Age group
                </legend>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {KIDS_WORLDS.map((w) => {
                    const active = w.slug === passport.age;
                    return (
                      <button
                        key={w.slug}
                        type="button"
                        onClick={() => update({ age: w.slug })}
                        aria-pressed={active}
                        className="rounded-2xl border p-4 text-left transition"
                        style={{
                          borderColor: active
                            ? w.accent
                            : "color-mix(in oklab, currentColor 18%, transparent)",
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

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/kids-world/$age"
                  params={{ age: passport.age }}
                  className="rounded-full bg-[color:var(--gold)] px-7 py-3 text-[11px] font-bold uppercase tracking-[0.26em] text-[color:var(--ink)]"
                >
                  Open Kids World
                </Link>
                <button
                  type="button"
                  onClick={revoke}
                  className="rounded-full border border-border px-7 py-3 text-[11px] font-bold uppercase tracking-[0.26em]"
                >
                  Remove passport
                </button>
              </div>
            </div>

            <aside className="space-y-4">
              <div className="rounded-[2rem] border border-border bg-card p-7">
                <h3 className="font-display text-xl uppercase">What this controls</h3>
                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                  <li>· Activities and learning experiences</li>
                  <li>· Exploration and interactive content</li>
                  <li>· Youth spaces inside Kids World</li>
                </ul>
                <p className="mt-4 text-sm text-muted-foreground">
                  It does not affect retail browsing anywhere in Frass.
                </p>
              </div>
              <StreetParentPanel />
              <div className="rounded-[2rem] border border-border bg-card p-7">
                <h3 className="font-display text-xl uppercase">Coming next</h3>
                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                  <li>· Activity history</li>
                  <li>· Per-place permissions</li>
                  <li>· Passports that follow the family account</li>
                </ul>
              </div>
            </aside>
          </div>
        )}
      </section>
    </>
  );
}
