// FRASS-0610 — Frassy's Vault setup conversation.
// Choose a kind, talk to Frassy, see a recommended workspace, change it, approve it.
// Nothing is created behind the person's back and nothing is fake.

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { SiteShell } from "@/components/site-shell";
import { VAULT_CATEGORIES, moduleById, modulesFor } from "@/lib/vault-engine/registry";
import {
  nextQuestion,
  recommendModules,
  interviewProgress,
  VAULT_ENGINE_PROMISE,
  type Answers,
} from "@/lib/vault-engine/interview";
import {
  createVault,
  saveSetupAnswers,
  activateVault,
  getVault,
  type VaultRow,
} from "@/lib/vault-engine/vaults.functions";
import { setActiveVaultId } from "@/lib/vault-engine/active-vault";

export const Route = createFileRoute("/_authenticated/vaults/new")({
  validateSearch: (s: Record<string, unknown>): { vault?: string } =>
    typeof s["vault"] === "string" ? { vault: s["vault"] } : {},
  head: () => ({
    meta: [
      { title: "Create a Vault — Frass Hill" },
      {
        name: "description",
        content:
          "Tell Frassy what you do and she builds the workspace around it — yours to change, entirely inside Frass Hill.",
      },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: NewVaultPage,
});

function NewVaultPage() {
  const { vault: resumeId } = Route.useSearch();
  const navigate = useNavigate();
  const make = useServerFn(createVault);
  const save = useServerFn(saveSetupAnswers);
  const activate = useServerFn(activateVault);
  const fetchVault = useServerFn(getVault);

  const [vaultId, setVaultId] = useState<string | null>(resumeId ?? null);
  const [category, setCategory] = useState<string>("");
  const [subtype, setSubtype] = useState<string>("");
  const [answers, setAnswers] = useState<Answers>({});
  const [draft, setDraft] = useState("");
  const [phase, setPhase] = useState<"kind" | "interview" | "review">("kind");
  const [chosen, setChosen] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  const resumed = useQuery({
    queryKey: ["vault-setup", resumeId],
    queryFn: () => fetchVault({ data: { vaultId: resumeId as string } }),
    enabled: Boolean(resumeId),
  });

  useEffect(() => {
    const v = (resumed.data as { vault: VaultRow } | null | undefined)?.vault;
    if (!v) return;
    setVaultId(v.id);
    setCategory(v.category);
    setSubtype(v.subtype ?? "");
    setAnswers({ ...(v.setup_answers as Answers), category: v.category, name: v.name });
    setPhase("interview");
  }, [resumed.data]);

  const question = useMemo(
    () => (phase === "interview" ? nextQuestion({ ...answers, category }) : null),
    [answers, category, phase],
  );
  const progress = interviewProgress({ ...answers, category });
  const recommendation = useMemo(
    () => recommendModules(category || "business", { ...answers, category }),
    [answers, category],
  );

  useEffect(() => {
    if (phase === "interview" && !question) {
      setChosen(recommendation.modules);
      setPhase("review");
    }
  }, [phase, question, recommendation.modules]);

  async function beginWith(cat: string, sub: string) {
    setCategory(cat);
    setSubtype(sub);
    setAnswers({ category: cat });
    setPhase("interview");
  }

  async function answerCurrent(value: string | boolean) {
    if (!question) return;
    const next: Answers = { ...answers, [question.id]: value };
    setAnswers(next);
    setDraft("");

    // The Vault row is created the moment we know its name — so nothing is lost.
    if (question.id === "name" && !vaultId) {
      try {
        setBusy(true);
        const row = (await make({
          data: { name: String(value), category, subtype: subtype || undefined },
        })) as VaultRow;
        setVaultId(row.id);
        setActiveVaultId(row.id);
      } catch (e) {
        toast.error((e as Error).message);
      } finally {
        setBusy(false);
      }
      return;
    }
    if (vaultId) void save({ data: { vaultId, answers: next as Record<string, unknown> } });
  }

  async function approve() {
    if (!vaultId) return;
    setBusy(true);
    try {
      await save({
        data: {
          vaultId,
          answers: answers as Record<string, unknown>,
          step: "review",
          name: typeof answers["name"] === "string" ? (answers["name"] as string) : undefined,
        },
      });
      await activate({ data: { vaultId, modules: chosen } });
      setActiveVaultId(vaultId);
      toast.success("Your Vault is open.");
      void navigate({ to: "/vaults/$vaultId", params: { vaultId } });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <SiteShell>
      <div className="mx-auto max-w-3xl px-6 py-16">
        <header>
          <div className="text-[11px] uppercase tracking-[0.4em] text-[color:var(--gold)]">
            Frassy · Vault setup
          </div>
          <h1 className="mt-4 font-display text-4xl leading-tight md:text-5xl">
            Tell me what you do. I'll build around it.
          </h1>
          <ul className="mt-5 space-y-1 text-sm text-muted-foreground">
            {VAULT_ENGINE_PROMISE.map((line) => (
              <li key={line}>· {line}</li>
            ))}
          </ul>
        </header>

        {phase === "kind" && (
          <section className="mt-12 grid gap-4">
            <p className="text-sm text-muted-foreground">
              Start me off — which of these is closest? Closest is good enough; I adjust as we talk.
            </p>
            {VAULT_CATEGORIES.map((c) => (
              <div
                key={c.id}
                className="rounded-2xl border border-border/70 bg-background/60 p-6 backdrop-blur"
              >
                <div className="font-display text-2xl">
                  {c.glyph} {c.name}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{c.blurb}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {c.subtypes.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => void beginWith(c.id, s.id)}
                      className="rounded-full border border-border px-4 py-2 text-xs transition hover:border-[color:var(--gold)] hover:text-[color:var(--gold)]"
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </section>
        )}

        {phase === "interview" && question && (
          <section className="mt-12 rounded-2xl border border-[color:var(--gold)]/40 bg-background/70 p-8 backdrop-blur">
            <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              Question {progress.done + 1} of about {progress.total}
            </div>
            <h2 className="mt-3 font-display text-2xl">{question.ask}</h2>
            {question.help && (
              <p className="mt-2 text-sm text-muted-foreground">{question.help}</p>
            )}

            <div className="mt-6">
              {question.kind === "yesno" && (
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => void answerCurrent(true)}
                    className="rounded-sm border border-[color:var(--gold)] px-6 py-3 text-[11px] uppercase tracking-[0.3em] text-[color:var(--gold)]"
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => void answerCurrent(false)}
                    className="rounded-sm border border-border px-6 py-3 text-[11px] uppercase tracking-[0.3em] text-muted-foreground"
                  >
                    No
                  </button>
                </div>
              )}
              {question.kind === "choice" && (
                <div className="flex flex-wrap gap-3">
                  {(question.choices ?? []).map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => void answerCurrent(c.id)}
                      className="rounded-sm border border-border px-5 py-3 text-sm transition hover:border-[color:var(--gold)]"
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              )}
              {(question.kind === "text" || question.kind === "long") && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!draft.trim()) return;
                    void answerCurrent(draft.trim());
                  }}
                  className="grid gap-3"
                >
                  {question.kind === "long" ? (
                    <textarea
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      rows={4}
                      placeholder={question.placeholder ?? "In your own words…"}
                      className="w-full rounded-sm border border-border bg-background/60 px-4 py-3 text-sm outline-none focus:border-[color:var(--gold)]"
                    />
                  ) : (
                    <input
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      placeholder={question.placeholder ?? ""}
                      className="w-full rounded-sm border border-border bg-background/60 px-4 py-3 text-sm outline-none focus:border-[color:var(--gold)]"
                    />
                  )}
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={busy}
                      className="lux-press rounded-sm border border-[color:var(--gold)] bg-[color:var(--gold)] px-6 py-3 text-[11px] font-bold uppercase tracking-[0.3em] text-[color:var(--ink)] disabled:opacity-60"
                    >
                      {busy ? "One second…" : "Next"}
                    </button>
                    {question.optional && (
                      <button
                        type="button"
                        onClick={() => setAnswers({ ...answers, [`${question.id}:skipped`]: true })}
                        className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground"
                      >
                        Skip
                      </button>
                    )}
                  </div>
                </form>
              )}
            </div>
          </section>
        )}

        {phase === "review" && (
          <section className="mt-12">
            <div className="rounded-2xl border border-[color:var(--gold)]/40 bg-background/70 p-8 backdrop-blur">
              <div className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--gold)]">
                Frassy's recommendation
              </div>
              <p className="mt-3 text-sm leading-relaxed">{recommendation.headline}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Nothing here is locked. Untick anything you don't want, tick anything you do — and
                you can change it again tomorrow.
              </p>
            </div>

            <div className="mt-6 grid gap-3">
              {modulesFor(category || "business").map((m) => {
                const on = chosen.includes(m.id);
                const why = recommendation.reasons[m.id];
                return (
                  <label
                    key={m.id}
                    className={`flex cursor-pointer items-start gap-4 rounded-2xl border p-5 transition ${
                      on ? "border-[color:var(--gold)]/60 bg-background/60" : "border-border/60"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={on}
                      disabled={m.id === "home"}
                      onChange={() =>
                        setChosen((c) => (on ? c.filter((x) => x !== m.id) : [...c, m.id]))
                      }
                      className="mt-1"
                    />
                    <span>
                      <span className="font-display text-lg">
                        {m.glyph} {m.name}
                        {m.status === "planned" && (
                          <span className="ml-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                            Being fitted
                          </span>
                        )}
                      </span>
                      <span className="mt-1 block text-sm text-muted-foreground">
                        {m.description}
                      </span>
                      {why && (
                        <span className="mt-2 block text-xs text-[color:var(--gold)]">
                          Why: {why}
                        </span>
                      )}
                    </span>
                  </label>
                );
              })}
            </div>

            <div className="mt-8 flex flex-wrap gap-4">
              <button
                type="button"
                onClick={() => void approve()}
                disabled={busy || !vaultId}
                className="lux-press rounded-sm border border-[color:var(--gold)] bg-[color:var(--gold)] px-8 py-4 text-[11px] font-bold uppercase tracking-[0.3em] text-[color:var(--ink)] disabled:opacity-60"
              >
                {busy ? "Opening…" : "Approve and open my Vault"}
              </button>
              <button
                type="button"
                onClick={() => setPhase("interview")}
                className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground"
              >
                Go back to the questions
              </button>
            </div>
            {!vaultId && (
              <p className="mt-4 text-xs text-muted-foreground">
                Answer the name question first and I'll have somewhere to save this.
              </p>
            )}
            <p className="mt-6 text-xs text-muted-foreground">
              You picked{" "}
              {chosen
                .map((id) => moduleById(id)?.name)
                .filter(Boolean)
                .join(", ")}
              .
            </p>
          </section>
        )}
      </div>
    </SiteShell>
  );
}
