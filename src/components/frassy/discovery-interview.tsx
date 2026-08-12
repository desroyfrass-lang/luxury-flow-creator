// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0482 — Frassy Discovery Interview
//
// A conversation, not a questionnaire. One question at a time, in Frassy's
// voice, always skippable. It never creates another onboarding — it feeds the
// Daily and Money Moves that already exist.
// ─────────────────────────────────────────────────────────────────────────────

import { useMemo, useState } from "react";
import { ArrowRight, Check, RotateCcw, Sparkles } from "lucide-react";
import {
  HIDDEN_ASSETS,
  INTERVIEW,
  GOAL_QUESTION,
  HOURS_QUESTION,
  COMFORT_QUESTION,
  EMPTY_PROFILE,
  assetById,
  businessFits,
  detectFromAnswers,
  forgetProfile,
  saveProfile,
  starterMoves,
  type PartnerAnswers,
  type PartnerProfile,
} from "@/lib/business/partner-profile";

const BUSINESS_LABEL: Record<string, string> = {
  wellness: "🌿 Wellness Brand",
  "coco-vintage": "👗 Coco Vintage",
  faceless: "📸 Faceless Content",
  affiliate: "🤝 Affiliate Marketing",
  podcast: "🎙 Podcast",
};

export function DiscoveryInterview({
  profile,
  firstName,
  onSaved,
}: {
  profile: PartnerProfile;
  firstName: string;
  onSaved: (p: PartnerProfile) => void;
}) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<PartnerAnswers>>(profile.answers ?? {});
  const [draft, setDraft] = useState("");
  const [assets, setAssets] = useState<string[]>(profile.assets ?? []);
  const [hours, setHours] = useState(profile.hoursPerDay || 1);
  const [goal, setGoal] = useState(profile.monthlyGoal ? String(profile.monthlyGoal) : "");
  const [comfort, setComfort] = useState(profile.comfort);

  const total = INTERVIEW.length + 3; // + hours, goal, comfort
  const heard = useMemo(() => detectFromAnswers(answers), [answers]);

  function advance(value?: string) {
    const q = INTERVIEW[step];
    if (q && value !== undefined) {
      setAnswers((a) => ({ ...a, [q.id]: value.trim().slice(0, 400) }));
      const detected = detectFromAnswers({ ...answers, [q.id]: value });
      setAssets((prev) => [...new Set([...prev, ...detected])]);
    }
    setDraft("");
    setStep((s) => s + 1);
  }

  function finish() {
    const saved = saveProfile({
      ...EMPTY_PROFILE,
      assets,
      answers,
      hoursPerDay: hours,
      monthlyGoal: Math.max(0, Number(goal) || 0),
      comfort,
      circumstance: (answers.limitations ?? "").trim() || null,
      completedAt: new Date().toISOString(),
    });
    onSaved(saved);
  }

  const q = INTERVIEW[step];
  const stage = step < INTERVIEW.length ? "question" : step === INTERVIEW.length ? "assets" : step === INTERVIEW.length + 1 ? "practical" : "confirm";

  return (
    <section className="rounded-3xl border border-[color:var(--gold,#d4af37)]/35 bg-[color:var(--gold,#d4af37)]/[0.05] p-6">
      <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--gold,#d4af37)]">
        <Sparkles className="mr-1 inline h-3.5 w-3.5" /> Frassy is getting to know you
      </p>

      {stage === "question" && q && (
        <>
          <h2 className="mt-3 font-display text-xl leading-snug">{q.ask}</h2>
          {q.helper && <p className="mt-2 text-sm text-muted-foreground">{q.helper}</p>}
          {q.chips && (
            <ul className="mt-4 flex flex-wrap gap-2">
              {q.chips.map((c) => (
                <li key={c}>
                  <button
                    onClick={() => setDraft((d) => (d ? `${d}, ${c}` : c))}
                    className="rounded-full border border-white/20 px-3 py-1 text-xs hover:bg-white/5"
                  >
                    {c}
                  </button>
                </li>
              ))}
            </ul>
          )}
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={2}
            placeholder="Say it however it comes out…"
            className="mt-4 w-full rounded-2xl border border-white/15 bg-black/25 px-4 py-3 text-sm outline-none focus:border-[color:var(--gold,#d4af37)]/60"
          />
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              onClick={() => advance(draft)}
              disabled={!draft.trim()}
              className="rounded-full bg-[color:var(--gold,#d4af37)] px-5 py-2 text-sm font-semibold text-black disabled:opacity-40"
            >
              Next <ArrowRight className="ml-1 inline h-4 w-4" />
            </button>
            <button onClick={() => advance()} className="rounded-full border border-white/20 px-4 py-2 text-sm">
              Skip this one
            </button>
            <span className="text-xs text-muted-foreground">
              {step + 1} of {total}
            </span>
          </div>
        </>
      )}

      {stage === "assets" && (
        <>
          <h2 className="mt-3 font-display text-xl leading-snug">
            {heard.length > 0
              ? `Here's what I heard, ${firstName}. Tick anything I got right, and add what I missed.`
              : `Tell me plainly, ${firstName} — which of these are already true about you?`}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Most people think they have no business ideas. You usually have several — you just don't call them that.
          </p>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {HIDDEN_ASSETS.map((a) => {
              const on = assets.includes(a.id);
              return (
                <li key={a.id}>
                  <button
                    onClick={() =>
                      setAssets((prev) => (on ? prev.filter((x) => x !== a.id) : [...prev, a.id]))
                    }
                    className={`w-full rounded-2xl border px-4 py-3 text-left text-sm transition ${
                      on
                        ? "border-[color:var(--gold,#d4af37)]/60 bg-[color:var(--gold,#d4af37)]/10"
                        : "border-white/12 bg-white/[0.03] hover:bg-white/[0.06]"
                    }`}
                  >
                    <span className="font-medium">
                      {a.emoji} {a.label}
                    </span>
                    <span className="mt-1 block text-xs text-muted-foreground">{a.worth}</span>
                  </button>
                </li>
              );
            })}
          </ul>
          <button
            onClick={() => setStep((s) => s + 1)}
            disabled={assets.length === 0}
            className="mt-4 rounded-full bg-[color:var(--gold,#d4af37)] px-5 py-2 text-sm font-semibold text-black disabled:opacity-40"
          >
            That's me <ArrowRight className="ml-1 inline h-4 w-4" />
          </button>
        </>
      )}

      {stage === "practical" && (
        <>
          <h2 className="mt-3 font-display text-xl leading-snug">{HOURS_QUESTION}</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {[0.5, 1, 2, 3, 4].map((h) => (
              <button
                key={h}
                onClick={() => setHours(h)}
                className={`rounded-full border px-4 py-2 text-sm ${
                  hours === h ? "border-[color:var(--gold,#d4af37)] bg-[color:var(--gold,#d4af37)]/10" : "border-white/20"
                }`}
              >
                {h < 1 ? "30 min" : `${h} hour${h > 1 ? "s" : ""}`}
              </button>
            ))}
          </div>
          <h3 className="mt-5 font-display text-lg">{GOAL_QUESTION}</h3>
          <input
            inputMode="numeric"
            value={goal}
            onChange={(e) => setGoal(e.target.value.replace(/[^\d]/g, ""))}
            placeholder="e.g. 500"
            className="mt-2 w-40 rounded-2xl border border-white/15 bg-black/25 px-4 py-2 text-sm outline-none"
          />
          <h3 className="mt-5 font-display text-lg">{COMFORT_QUESTION}</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              onClick={() => setComfort("plain")}
              className={`rounded-full border px-4 py-2 text-sm ${
                comfort === "plain" ? "border-[color:var(--gold,#d4af37)] bg-[color:var(--gold,#d4af37)]/10" : "border-white/20"
              }`}
            >
              Plain English, one step at a time
            </button>
            <button
              onClick={() => setComfort("standard")}
              className={`rounded-full border px-4 py-2 text-sm ${
                comfort === "standard" ? "border-[color:var(--gold,#d4af37)] bg-[color:var(--gold,#d4af37)]/10" : "border-white/20"
              }`}
            >
              I'm comfortable with detail
            </button>
          </div>
          <button
            onClick={() => setStep((s) => s + 1)}
            className="mt-5 rounded-full bg-[color:var(--gold,#d4af37)] px-5 py-2 text-sm font-semibold text-black"
          >
            Show me what you found <ArrowRight className="ml-1 inline h-4 w-4" />
          </button>
        </>
      )}

      {stage === "confirm" && (
        <>
          <h2 className="mt-3 font-display text-xl leading-snug">
            {firstName}, you already have a business inside you. Several, actually.
          </h2>
          <ul className="mt-4 space-y-2">
            {businessFits({ ...EMPTY_PROFILE, assets, answers, comfort, hoursPerDay: hours })
              .slice(0, 3)
              .map((fit) => (
                <li key={fit.businessId} className="rounded-2xl border border-white/12 bg-white/[0.04] px-4 py-3">
                  <p className="text-sm font-medium">{BUSINESS_LABEL[fit.businessId] ?? fit.businessId}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{fit.why}</p>
                  <p className="mt-1 text-xs">{fit.opportunities.slice(0, 4).join(" · ")}</p>
                </li>
              ))}
          </ul>
          <p className="mt-4 text-sm text-muted-foreground">
            We'll start small — first tasks take a couple of minutes each. I'll handle the technical side.
          </p>
          <ul className="mt-2 space-y-1 text-sm">
            {starterMoves({ ...EMPTY_PROFILE, assets, answers, comfort, hoursPerDay: hours }).map((m) => (
              <li key={m.id}>
                {m.emoji} {m.label}
              </li>
            ))}
          </ul>
          <button
            onClick={finish}
            className="mt-5 rounded-full bg-[color:var(--gold,#d4af37)] px-5 py-2 text-sm font-semibold text-black"
          >
            <Check className="mr-1 inline h-4 w-4" /> Build my Daily around this
          </button>
        </>
      )}
    </section>
  );
}

/** What Frassy discovered, shown back plainly, with a way to start over. */
export function PartnerStrengthsCard({
  profile,
  onForget,
}: {
  profile: PartnerProfile;
  onForget: () => void;
}) {
  const fits = businessFits(profile).slice(0, 3);
  return (
    <section className="rounded-3xl border border-white/12 bg-white/[0.04] p-6">
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Built around you</p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {profile.assets.map((id) => {
          const a = assetById(id);
          return a ? (
            <li key={id} className="rounded-full bg-black/25 px-3 py-1 text-xs">
              {a.emoji} {a.label}
            </li>
          ) : null;
        })}
      </ul>
      <ul className="mt-4 space-y-2">
        {fits.map((f) => (
          <li key={f.businessId} className="rounded-2xl border border-white/10 px-4 py-3">
            <p className="text-sm font-medium">{BUSINESS_LABEL[f.businessId] ?? f.businessId}</p>
            <p className="mt-1 text-xs text-muted-foreground">{f.why}</p>
            <p className="mt-1 text-xs">{f.opportunities.slice(0, 4).join(" · ")}</p>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs text-muted-foreground">
        Time you gave me: {profile.hoursPerDay} hour(s) a day
        {profile.monthlyGoal > 0 ? ` · Goal: $${profile.monthlyGoal.toLocaleString()} a month` : ""} ·{" "}
        {profile.comfort === "plain" ? "Plain English explanations" : "Detailed explanations"}
      </p>
      <button
        onClick={() => {
          forgetProfile();
          onForget();
        }}
        className="mt-3 rounded-full border border-white/20 px-4 py-2 text-xs hover:bg-white/5"
      >
        <RotateCcw className="mr-1 inline h-3.5 w-3.5" /> Let's talk again
      </button>
    </section>
  );
}
