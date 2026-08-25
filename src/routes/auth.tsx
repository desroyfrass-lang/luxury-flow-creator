import { PlatformProtectionBanner } from "@/components/founder/platform-protection-banner";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteShell } from "@/components/site-shell";
import { toast } from "sonner";
import { PasswordField, passwordIsValid } from "@/components/password-field";

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>) => ({
    next: typeof s.next === "string" && s.next.startsWith("/") && !s.next.startsWith("//") ? s.next : "",
  }),
  head: () => ({
    meta: [
      { title: "Sign in — Frass" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  // Every authenticated entrance passes through the single arrival authority.
  // It decides whether this is a first arrival or a returning member; a `next`
  // parameter must never bypass the Welcome Hall ceremony.
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) return;
      const next = search.next ? `&next=${encodeURIComponent(search.next)}` : "";
      window.location.assign(`/welcome-hall?arrival=first${next}`);
    });
  }, [search.next]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Signed in");
      } else {
        if (!passwordIsValid(password)) {
          setBusy(false);
          toast.error("Please meet every password requirement listed below the field.");
          return;
        }
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + `/welcome-hall?arrival=first${search.next ? `&next=${encodeURIComponent(search.next)}` : ""}` },
        });
        if (error) throw error;
        toast.success("Welcome — Frassy is waiting at the gate");
        const next = search.next ? `&next=${encodeURIComponent(search.next)}` : "";
        window.location.assign(`/welcome-hall?arrival=first${next}`);
        return;
      }
    } catch (err) {
      setBusy(false);
      toast.error(err instanceof Error ? err.message : "Could not sign in");
      return;
    }

    // Signed in. Routing must never be able to strand the Builder on this page.
    const next = search.next ? `&next=${encodeURIComponent(search.next)}` : "";
    window.location.assign(`/welcome-hall?arrival=first${next}`);
  };



  return (
    <SiteShell>
      <div className="mx-auto max-w-md px-6 py-24">
        <div className="mb-10 text-center">
          <div className="text-[11px] uppercase tracking-[0.3em] text-[color:var(--gold)]">
            Owner access
          </div>
          <h1 className="mt-3 font-display text-5xl">
            {mode === "signin" ? "Sign in" : "Create owner account"}
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {mode === "signin"
              ? "Enter the Founder Control Room."
              : "First sign-up becomes the site owner."}
          </p>
        </div>

        {mode === "signup" && (
          <PlatformProtectionBanner domain="registrations" className="mb-4" />
        )}



        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-sm border border-border bg-background/60 px-4 py-3 text-sm outline-none focus:border-[color:var(--gold)]"
              placeholder="you@frass.com"
            />
          </div>
          <div>
            <label className="mb-2 block text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
              Password
            </label>
            <PasswordField
              value={password}
              onChange={setPassword}
              placeholder={mode === "signup" ? "Choose a password" : "Your password"}
              showRules={mode === "signup"}
            />
          </div>
          <button
            type="submit"
            disabled={busy}
            className="lux-press w-full rounded-sm border border-[color:var(--gold)] bg-[color:var(--gold)] px-6 py-3.5 text-xs font-bold uppercase tracking-[0.32em] text-[color:var(--ink)] transition hover:bg-[color:var(--gold-soft)] disabled:opacity-50"
          >
            {busy ? "Working…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        <div className="mt-6 space-y-3 text-center text-xs text-muted-foreground">
          {mode === "signin" ? (
            <button onClick={() => setMode("signup")} className="hover:text-[color:var(--gold)] underline">
              First time? Create the owner account
            </button>
          ) : (
            <button onClick={() => setMode("signin")} className="hover:text-[color:var(--gold)] underline">
              Have an account? Sign in
            </button>
          )}
          <div>
            <button
              type="button"
              onClick={async () => {
                if (!email) {
                  toast.error("Enter your email above first.");
                  return;
                }
                const { error } = await supabase.auth.resetPasswordForEmail(email, {
                  redirectTo: window.location.origin + "/reset-password",
                });
                toast[error ? "error" : "success"](
                  error ? error.message : `Recovery link sent to ${email}.`,
                );
              }}
              className="underline hover:text-[color:var(--gold)]"
            >
              Forgot your password?
            </button>
          </div>
        </div>

        <div className="mt-4 text-center text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
          <Link to="/" className="hover:text-foreground">← Back to site</Link>
        </div>
      </div>
    </SiteShell>
  );
}
