import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { SiteShell } from "@/components/site-shell";
import { PasswordField, passwordIsValid } from "@/components/password-field";

/**
 * FRASS-0456 — The Frass Kicks Welcome Hall (shopping door).
 *
 * Deliberately short. A shopper is never handed a business system.
 */
export const Route = createFileRoute("/join/frasskicks")({
  head: () => ({
    meta: [
      { title: "Join Frass Kicks — shop with your fits saved" },
      {
        name: "description",
        content:
          "Create a Frass Kicks account to save your sizes, keep your fits, and track your orders across every district of the store.",
      },
      { property: "og:title", content: "Join Frass Kicks" },
      {
        property: "og:description",
        content: "Save your sizes, keep your fits, track your orders.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: JoinKicks,
});

function JoinKicks() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordIsValid(password)) {
      toast.error("Please meet every password requirement listed under the field.");
      return;
    }
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin + "/frass-district",
        data: { frass_entry: "shop" },
      },
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (!data.session) {
      setCheckEmail(true);
      return;
    }
    toast.success("You're in. Happy shopping.");
    navigate({ to: "/frass-district" });
  };

  return (
    <SiteShell>
      <div className="mx-auto max-w-md px-6 py-24">
        <div className="text-center">
          <div className="text-[11px] uppercase tracking-[0.32em] text-[color:var(--gold)]">
            Frass Kicks
          </div>
          <h1 className="mt-3 font-display text-5xl">Shop with us</h1>
          <p className="mt-4 text-sm leading-relaxed text-foreground/90">
            "Welcome to FrassKicks. Before we begin shopping, let's create your FrassKicks
            profile." — Frassy
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            Your sizes, your saved fits and your orders in one place. That's all this account does —
            no homework attached.
          </p>
        </div>


        {checkEmail ? (
          <div className="mt-10 rounded-sm border border-[color:var(--gold)]/40 bg-background/50 p-6 text-center text-sm">
            <p className="font-display text-2xl">Check your email</p>
            <p className="mt-3 text-muted-foreground">
              We sent a confirmation link to {email}. Click it and you're shopping.
            </p>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-10 space-y-4">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full rounded-sm border border-border bg-background/60 px-4 py-3 text-sm outline-none focus:border-[color:var(--gold)]"
            />
            <PasswordField value={password} onChange={setPassword} placeholder="Choose a password" />
            <button
              type="submit"
              disabled={busy}
              className="lux-press w-full rounded-sm border border-[color:var(--gold)] bg-[color:var(--gold)] px-6 py-3.5 text-xs font-bold uppercase tracking-[0.32em] text-[color:var(--ink)] disabled:opacity-50"
            >
              {busy ? "Opening the door…" : "Create my account"}
            </button>
          </form>
        )}

        <p className="mt-8 text-center text-xs leading-relaxed text-muted-foreground">
          Came here to build something instead?{" "}
          <Link to="/join/frass-hill" className="underline hover:text-[color:var(--gold)]">
            Walk up to Frass Hill
          </Link>
          . Same account either way.
        </p>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          Already registered?{" "}
          <Link to="/auth" search={{ next: "" }} className="underline hover:text-[color:var(--gold)]">
            Sign in
          </Link>
        </p>
      </div>
    </SiteShell>
  );
}
