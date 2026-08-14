// FRASS-0559 — Founder Experience Simulator.
// FRASS-0560 — every simulation begins at the front door.
// FRASS-0561 — nothing created here is practice; Founder Vaults are Seed Vaults.
//
// Reuses the FRASS-0519 session engine. A simulation IS a walkthrough with a
// persona attached — no second engine, no separate table, no mock account.
import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  activeFounderSession,
  completeFounderSession,
  listFounderSessions,
  recordFounderObservation,
  setFounderChecklist,
  startFounderSession,
} from "@/lib/founder/founder.functions";
import {
  JOURNEY_STAGES,
  PERSONAS,
  SCORE_LABELS,
  SEED_VAULT_PRINCIPLE,
  SIM_LENSES,
  SUCCESS_QUESTIONS,
  TESTING_SEQUENCE,
  buildExperienceScore,
  loadSimulation,
  personaById,
  previewResetEnabled,
  resetSimulationState,
  saveSimulation,
  setPreviewResetEnabled,
  type ExperienceScore,
  type PersonaId,
  type ScoreKey,
} from "@/lib/founder/simulator";

const SIM_PREFIX = "Simulation — ";

function open(path: string) {
  if (typeof window !== "undefined") window.open(path, "_blank", "noopener");
}

export function ExperienceSimulator() {
  const start = useServerFn(startFounderSession);
  const loadActive = useServerFn(activeFounderSession);
  const loadPast = useServerFn(listFounderSessions);
  const record = useServerFn(recordFounderObservation);
  const saveChecklist = useServerFn(setFounderChecklist);
  const complete = useServerFn(completeFounderSession);
  const qc = useQueryClient();

  const [persona, setPersona] = useState<PersonaId>("first-time-visitor");
  const [lens, setLens] = useState(SIM_LENSES[0].id);
  const [note, setNote] = useState("");
  const [score, setScore] = useState<ExperienceScore | null>(null);
  const [resetOn, setResetOn] = useState<boolean>(() => previewResetEnabled());
  // FRASS-0562 — simulate the STATE of a member, not just the interface.
  const [fresh, setFresh] = useState(true);

  const { data } = useQuery({ queryKey: ["founder", "session"], queryFn: () => loadActive() });
  const { data: past } = useQuery({ queryKey: ["founder", "sessions"], queryFn: () => loadPast() });

  const session = data?.session ?? null;
  const observations = data?.observations ?? [];
  const answers = (session?.checklist ?? {}) as Record<string, boolean>;
  const running = Boolean(session && session.label.startsWith(SIM_PREFIX));
  const runningPersona = running
    ? (personaById(loadSimulation()?.personaId ?? "") ??
      PERSONAS.find((p) => session!.label === SIM_PREFIX + p.label))
    : undefined;

  const refresh = () => {
    void qc.invalidateQueries({ queryKey: ["founder", "session"] });
    void qc.invalidateQueries({ queryKey: ["founder", "sessions"] });
  };

  const begin = useMutation({
    mutationFn: async () => {
      const p = personaById(persona)!;
      resetSimulationState();
      const s = await start({ data: { label: SIM_PREFIX + p.label, releaseRef: null } });
      saveSimulation({
        personaId: p.id,
        sessionId: s.id,
        startedAt: s.started_at,
        stage: "landing",
        freshMember: fresh && p.id !== "founder",
      });
      return s;
    },
    onSuccess: () => {
      setScore(null);
      refresh();
      open("/");
      toast.success("Simulation started at the front door. Walk it as they would.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const addNote = useMutation({
    mutationFn: () => {
      const l = SIM_LENSES.find((x) => x.id === lens)!;
      return record({
        data: {
          sessionId: session!.id,
          stepId: null,
          stepLabel: runningPersona ? `${runningPersona.emoji} ${runningPersona.label}` : null,
          kind: l.kind,
          signal: l.signal,
          note: `${l.emoji} ${note.trim()}`,
          area: "simulator",
        },
      });
    },
    onSuccess: () => {
      setNote("");
      refresh();
      toast.success("Recorded as a Founder Review item.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const answer = useMutation({
    mutationFn: (id: string) =>
      saveChecklist({ data: { sessionId: session!.id, checklist: { ...answers, [id]: !answers[id] } } }),
    onSuccess: refresh,
    onError: (e: Error) => toast.error(e.message),
  });

  const finish = useMutation({
    mutationFn: async () => {
      await complete({ data: { sessionId: session!.id } });
      return buildExperienceScore(answers, observations);
    },
    onSuccess: (s) => {
      setScore(s);
      saveSimulation(null);
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const requiredStatus = useMemo(() => {
    const done = new Set(
      (past ?? [])
        .filter((s) => s.status === "complete" && s.label.startsWith(SIM_PREFIX))
        .map((s) => s.label.slice(SIM_PREFIX.length)),
    );
    return PERSONAS.filter((p) => p.required).map((p) => ({ p, done: done.has(p.label) }));
  }, [past]);

  const selected = personaById(persona)!;

  return (
    <section className="space-y-6">
      <header className="rounded-2xl border border-[color:var(--gold)]/40 bg-[color:var(--gold)]/5 p-5">
        <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--gold)]">FRASS-0559</p>
        <h2 className="mt-2 text-2xl font-black uppercase tracking-tight">🧪 Experience Simulator</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Your private testing laboratory. Step into the shoes of any member and experience Frass
          exactly as they would — from the very first visit. No second email, no second account, no
          fake data: one button in, one button out. The Founder is never unintentionally gated, but
          may voluntarily enter the complete onboarding journey from here. Never approve an
          experience you have not personally walked through.
        </p>
      </header>

      {/* Persona picker */}
      <div className="rounded-2xl border border-border/70 p-5">
        <h3 className="text-sm font-bold uppercase tracking-wide">Who are you today?</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Each persona loads the platform as though they are using it for the very first time.
        </p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {PERSONAS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPersona(p.id)}
              className={`rounded-xl border p-3 text-left transition ${
                persona === p.id
                  ? "border-[color:var(--gold)] bg-[color:var(--gold)]/5"
                  : "border-border/70 hover:border-[color:var(--gold)]/60"
              }`}
            >
              <span className="text-sm font-semibold">
                {p.emoji} {p.label}
                {p.required ? (
                  <span className="ml-2 text-[10px] uppercase text-[color:var(--gold)]">required</span>
                ) : null}
              </span>
              <span className="mt-1 block text-xs text-muted-foreground">{p.plain}</span>
            </button>
          ))}
        </div>

        <div className="mt-4 rounded-xl border border-border/70 p-3">
          <p className="text-xs font-bold uppercase tracking-wide">
            How {selected.label} behaves
          </p>
          <ul className="mt-1 space-y-1 text-xs text-muted-foreground">
            {selected.behaviour.map((b) => (
              <li key={b}>• {b}</li>
            ))}
          </ul>
        </div>

        <label className="mt-4 flex items-start gap-2 text-xs">
          <input
            type="checkbox"
            checked={fresh}
            onChange={(e) => setFresh(e.target.checked)}
            className="mt-0.5"
          />
          <span>
            <span className="font-semibold">Pretend I have never been here before</span>
            <span className="block text-muted-foreground">
              Frass treats you as a brand-new member for the whole simulation — every gate they meet,
              you meet. Untick this to walk the same pages with your Founder access intact.
            </span>
          </span>
        </label>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={begin.isPending || running}
            onClick={() => begin.mutate()}
            className="rounded-full bg-primary px-5 py-2 text-xs font-bold uppercase tracking-wide text-primary-foreground disabled:opacity-50"
          >
            {running ? "Simulation running" : begin.isPending ? "Starting…" : "Start experience test"}
          </button>
          <button
            type="button"
            onClick={() => {
              resetSimulationState();
              saveSimulation(null);
              toast.success("Simulation reset. Your Seed Vaults and notes are untouched.");
              open("/");
            }}
            className="rounded-full border border-border px-5 py-2 text-xs font-bold uppercase tracking-wide"
          >
            🔄 Reset simulation
          </button>
        </div>
      </div>

      {/* FRASS-0560 — the official sequence */}
      <div className="rounded-2xl border border-border/70 p-5">
        <h3 className="text-sm font-bold uppercase tracking-wide">
          Official testing sequence <span className="text-[color:var(--gold)]">FRASS-0560</span>
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Every simulation starts at the front door — never in the middle of the platform.
        </p>
        <ol className="mt-3 space-y-2">
          {TESTING_SEQUENCE.map((s, i) => (
            <li key={s.id} className="flex items-start gap-3">
              <span className="mt-0.5 text-xs font-black text-[color:var(--gold)]">{i + 1}</span>
              <button
                type="button"
                onClick={() => open(s.path)}
                className="text-left"
              >
                <span className="text-sm font-semibold underline-offset-4 hover:underline">{s.label}</span>
                <span className="block text-xs text-muted-foreground">{s.plain}</span>
              </button>
            </li>
          ))}
        </ol>

        <label className="mt-4 flex items-start gap-2 text-xs">
          <input
            type="checkbox"
            checked={resetOn}
            onChange={(e) => {
              setResetOn(e.target.checked);
              setPreviewResetEnabled(e.target.checked);
            }}
            className="mt-0.5"
          />
          <span>
            <span className="font-semibold">Return me to the front door after every build</span>
            <span className="block text-muted-foreground">
              When a new preview build finishes, Frass rewinds the movie and drops you on
              frasskicks.com instead of wherever you happened to be.
            </span>
          </span>
        </label>

        <div className="mt-4">
          <p className="text-xs font-bold uppercase tracking-wide">Jump to a later stage (on purpose)</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {JOURNEY_STAGES.map((s) => (
              <button
                key={s.id}
                type="button"
                title={s.plain}
                onClick={() => open(s.path)}
                className="rounded-full border border-border px-3 py-1 text-[11px] hover:border-[color:var(--gold)]"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Observations + closing questions */}
      {running ? (
        <div className="rounded-2xl border border-border/70 p-5">
          <h3 className="text-sm font-bold uppercase tracking-wide">
            Recording as {runningPersona ? `${runningPersona.emoji} ${runningPersona.label}` : "a member"}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Every observation becomes a Founder Review item — nothing you notice gets lost.
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            {SIM_LENSES.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => setLens(l.id)}
                className={`rounded-full px-3 py-1 text-xs ${
                  lens === l.id ? "bg-primary font-bold text-primary-foreground" : "border border-border"
                }`}
              >
                {l.emoji} {l.label}
              </button>
            ))}
          </div>

          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="What did you notice? Say it plainly."
            className="mt-3 w-full rounded-lg border border-border bg-background p-2 text-sm"
          />
          <button
            type="button"
            disabled={addNote.isPending || note.trim().length < 2}
            onClick={() => addNote.mutate()}
            className="mt-2 rounded-full bg-primary px-4 py-2 text-xs font-bold uppercase text-primary-foreground disabled:opacity-50"
          >
            Record observation
          </button>
          {observations.length ? (
            <p className="mt-2 text-xs text-muted-foreground">
              {observations.length} observation{observations.length === 1 ? "" : "s"} this simulation.
            </p>
          ) : null}

          <div className="mt-5 rounded-xl border border-border/70 p-3">
            <p className="text-xs font-bold uppercase tracking-wide">Before you finish, Frassy asks</p>
            <div className="mt-2 space-y-1">
              {SUCCESS_QUESTIONS.map((q) => (
                <label key={q.id} className="flex items-start gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={Boolean(answers[q.id])}
                    onChange={() => answer.mutate(q.id)}
                    className="mt-0.5"
                  />
                  <span>{q.question}</span>
                </label>
              ))}
            </div>
            <button
              type="button"
              disabled={finish.isPending}
              onClick={() => finish.mutate()}
              className="mt-3 rounded-full border border-border px-4 py-2 text-xs font-bold uppercase"
            >
              Finish and score this experience
            </button>
          </div>
        </div>
      ) : null}

      {score ? (
        <div className="rounded-2xl border border-[color:var(--gold)]/40 p-5">
          <h3 className="text-sm font-bold uppercase tracking-wide">
            Founder Experience Score — {score.overall}/10
          </h3>
          <div className="mt-3 space-y-2">
            {(Object.keys(score.scores) as ScoreKey[]).map((k) => (
              <div key={k}>
                <div className="flex items-baseline justify-between text-xs">
                  <span className="text-muted-foreground">{SCORE_LABELS[k]}</span>
                  <span className="font-bold">{score.scores[k]}/10</span>
                </div>
                <div className="mt-1 h-1.5 w-full rounded-full bg-muted">
                  <div
                    className="h-1.5 rounded-full bg-[color:var(--gold)]"
                    style={{ width: `${score.scores[k] * 10}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm">{score.summary}</p>
        </div>
      ) : null}

      {/* Release checklist */}
      <div className="rounded-2xl border border-border/70 p-5">
        <h3 className="text-sm font-bold uppercase tracking-wide">Release checklist</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          No production release is complete until these simulations pass.
        </p>
        <ul className="mt-3 space-y-1 text-sm">
          {requiredStatus.map(({ p, done }) => (
            <li key={p.id}>
              {done ? "✅" : "⬜"} {p.emoji} {p.label}
            </li>
          ))}
        </ul>
      </div>

      {/* FRASS-0561 */}
      <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/5 p-5">
        <p className="text-xs uppercase tracking-[0.3em] text-emerald-500">FRASS-0561</p>
        <h3 className="mt-2 text-sm font-bold uppercase tracking-wide">🌱 Founder Seed Vaults</h3>
        <p className="mt-2 text-sm text-muted-foreground">{SEED_VAULT_PRINCIPLE}</p>
        <p className="mt-2 text-xs text-muted-foreground">
          Resetting a simulation clears the visitor-shaped state only. Vaults, notes and past
          sessions are never deleted — a seed doesn't look like much at first.
        </p>
      </div>
    </section>
  );
}
