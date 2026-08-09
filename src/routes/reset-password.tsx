import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { SiteShell } from "@/components/site-shell";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Reset your password — Frass" },
      { name: "description", content: "Set a new password for your Frass account." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setReady(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setReady(!!s));
    return () => sub.subscription.unsubscribe();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Use at least 8 characters.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Password updated. You're signed in.");
    window.location.assign("/workspace/profile");
  };

  return (
    <SiteShell>
      <div className="mx-auto max-w-md px-6 py-24">
        <div className="mb-10 text-center">
          <div className="text-[11px] uppercase tracking-[0.3em] text-[color:var(--gold)]">
            Account recovery
          </div>
          <h1 className="mt-3 font-display text-4xl">Set a new password</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {ready
              ? "Choose a new password. Type it in the open to be sure it is what you expect."
              : "Open this page from the recovery link we emailed you."}
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
            New password
          </label>
          <div className="relative">
            <input
              type={show ? "text" : "password"}
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={!ready}
              className="w-full rounded-sm border border-border bg-background/60 px-4 py-3 pr-12 text-sm outline-none focus:border-[color:var(--gold)] disabled:opacity-50"
              placeholder="At least 8 characters"
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              aria-label={show ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <button
            type="submit"
            disabled={busy || !ready}
            className="lux-press w-full rounded-sm border border-[color:var(--gold)] bg-[color:var(--gold)] px-6 py-3.5 text-xs font-bold uppercase tracking-[0.32em] text-[color:var(--ink)] transition hover:bg-[color:var(--gold-soft)] disabled:opacity-50"
          >
            {busy ? "Saving…" : "Save new password"}
          </button>
        </form>

        <div className="mt-6 text-center text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
          <Link to="/auth" className="hover:text-foreground">
            ← Back to sign in
          </Link>
        </div>
      </div>
    </SiteShell>
  );
}
