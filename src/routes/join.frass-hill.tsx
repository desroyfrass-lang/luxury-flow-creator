import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { Check, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SiteShell } from "@/components/site-shell";
import { provisionFrassHill, type ProvisionResult } from "@/lib/partners.functions";
import { arrivalScript, designationMeta } from "@/lib/partners";

/**
 * FRASS-0456 — The Frass Hill Welcome Hall (builder door).
 *
 * One onboarding engine. The invitation is a personalization layer on top of
 * it: if the backend recognises the arriving email, Frassy greets them by
 * designation instead of as a stranger. Nobody gets a private onboarding.
 */
export const Route = createFileRoute("/join/frass-hill")({
  head: () => ({
    meta: [
      { title: "Arrive at Frass Hill — register and meet Frassy" },
      {
        name: "description",
        content:
          "Register at the gates of Frass Hill. You receive a Frass Card, a Builder Vault and a Daily, and Frassy walks beside you from the first minute.",
      },
      { property: "og:title", content: "Arrive at Frass Hill" },
      {
        property: "og:description",
        content: "Register once. Frass Card, Builder Vault, and a Daily that fits real life.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: JoinHill,
});

function JoinHill() {
  const provision = useServerFn(provisionFrassHill);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);
  const [result, setResult] = useState<ProvisionResult | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin + "/join/frass-hill",
          data: { display_name: name },
        },
      });
      if (error) throw error;
      if (!data.session) {
        setCheckEmail(true);
        return;
      }
      const provisioned = await provision({ data: { displayName: name } });
      setResult(provisioned);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not open the gate.");
    } finally {
      setBusy(false);
    }
  };

  // Someone who confirmed by email and came back signed in.
  const continueExisting = async () => {
    setBusy(true);
    try {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        toast.error("Sign in first, then walk back up.");
        return;
      }
      setResult(await provision({ data: { displayName: name } }));
    } finally {
      setBusy(false);
    }
  };

  if (result) return <Arrival result={result} fallbackName={name} />;

  return (
    <SiteShell>
      <div className="mx-auto max-w-xl px-6 py-20">
        <div className="text-center">
          <div className="text-[11px] uppercase tracking-[0.32em] text-[color:var(--gold)]">
            Frass Hill · Welcome Hall
          </div>
          <h1 className="mt-3 font-display text-5xl">Come up the hill</h1>
          <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
            Register once and the town knows you. You'll get a Frass Card, a Builder Vault, and a
            Daily — and Frassy walks beside you the whole way, explaining everything twice if that's
            what it takes.
          </p>
        </div>

        {checkEmail ? (
          <div className="mt-12 rounded-sm border border-[color:var(--gold)]/40 bg-background/50 p-8 text-center">
            <p className="font-display text-3xl">Check your email</p>
            <p className="mt-4 text-sm text-muted-foreground">
              We sent a confirmation link to {email}. Click it, then come back here and I'll finish
              setting your place up.
            </p>
            <button
              onClick={continueExisting}
              disabled={busy}
              className="lux-press mt-6 rounded-sm border border-[color:var(--gold)] px-6 py-3 text-[11px] font-bold uppercase tracking-[0.3em] text-[color:var(--gold)] disabled:opacity-50"
            >
              I've confirmed — let me in
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-12 space-y-4">
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="What should Frassy call you?"
              className="w-full rounded-sm border border-border bg-background/60 px-4 py-3 text-sm outline-none focus:border-[color:var(--gold)]"
            />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full rounded-sm border border-border bg-background/60 px-4 py-3 text-sm outline-none focus:border-[color:var(--gold)]"
            />
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password (8+ characters)"
              className="w-full rounded-sm border border-border bg-background/60 px-4 py-3 text-sm outline-none focus:border-[color:var(--gold)]"
            />
            <button
              type="submit"
              disabled={busy}
              className="lux-press w-full rounded-sm border border-[color:var(--gold)] bg-[color:var(--gold)] px-6 py-3.5 text-xs font-bold uppercase tracking-[0.32em] text-[color:var(--ink)] disabled:opacity-50"
            >
              {busy ? "Opening the gates…" : "Register and walk in"}
            </button>
            <p className="pt-2 text-center text-[11px] leading-relaxed text-muted-foreground">
              If you were personally invited, use the email the invitation was sent to — Frassy will
              recognise you at the gate.
            </p>
          </form>
        )}

        <p className="mt-10 text-center text-xs text-muted-foreground">
          Only here to shop?{" "}
          <Link to="/join/frasskicks" className="underline hover:text-[color:var(--gold)]">
            The Frass Kicks door is shorter
          </Link>
          .
        </p>
      </div>
    </SiteShell>
  );
}

function Arrival({ result, fallbackName }: { result: ProvisionResult; fallbackName: string }) {
  const meta = designationMeta(result.designation);
  const name = result.displayName || fallbackName || "friend";
  const script = arrivalScript({ name, designation: meta });

  return (
    <SiteShell>
      <div className="mx-auto max-w-2xl px-6 py-20">
        {meta && (
          <div className="mb-8 inline-flex items-center gap-3 rounded-sm border border-[color:var(--gold)] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.3em] text-[color:var(--gold)]">
            <span className="text-base">{meta.badge}</span> {meta.label}
          </div>
        )}
        <h1 className="font-display text-5xl">You're on the Hill.</h1>

        <div className="mt-8 space-y-4">
          {script.map((line, i) => (
            <p key={i} className="text-sm leading-relaxed text-foreground/90">
              {line}
            </p>
          ))}
        </div>

        <div className="mt-12">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-[color:var(--gold)]" /> Set up while you walked in
          </div>
          <ul className="mt-5 space-y-4">
            {result.provisioned.map((item) => (
              <li key={item.key} className="flex gap-3 rounded-sm border border-border bg-background/40 p-5">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--gold)]" />
                <div>
                  <div className="text-sm font-semibold">{item.label}</div>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{item.detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-12 flex flex-wrap gap-3">
          <Link
            to="/onboarding"
            className="lux-press rounded-sm border border-[color:var(--gold)] bg-[color:var(--gold)] px-7 py-3.5 text-[11px] font-bold uppercase tracking-[0.3em] text-[color:var(--ink)]"
          >
            Sit down with Frassy
          </Link>
          <Link
            to="/room"
            className="lux-press rounded-sm border border-border px-7 py-3.5 text-[11px] font-bold uppercase tracking-[0.3em] hover:border-[color:var(--gold)]"
          >
            See my workspace
          </Link>
        </div>
        <p className="mt-6 text-xs text-muted-foreground">
          Nothing here expires and nothing here is urgent. Come back tomorrow and your Daily will be
          waiting with a short, honest list.
        </p>
      </div>
    </SiteShell>
  );
}
