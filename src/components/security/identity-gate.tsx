// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0488 — the ONE identity gate.
//
// Every sensitive door in Frass uses this component. There is no second gate,
// no per-page password form, no bespoke Founder prompt. Strongest method first
// (device biometrics / passkey), password always available as the fallback.
//
// Plain English: one guard, one desk, one procedure — wherever the safe is.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { startAuthentication, browserSupportsWebAuthn } from "@simplewebauthn/browser";
import {
  ACCESSIBILITY_PROMISE,
  PRIVACY_PROMISE,
  biometricName,
  isVerified,
  recordVerification,
  sensitiveAction,
  ttlFor,
} from "@/lib/security/sensitive-actions";
import {
  finishPasskeyVerification,
  recordPasswordVerification,
  startPasskeyVerification,
} from "@/lib/security/identity.functions";
import { reauthenticateWithPassword } from "@/lib/workspace.functions";

type Props = {
  /** An id from SENSITIVE_ACTIONS. */
  action: string;
  children: React.ReactNode;
  /** Optional headline override for in-flow confirmations. */
  title?: string;
};

/** Wrap any sensitive surface. Renders children only after identity is verified. */
export function IdentityGate({ action, children, title }: Props) {
  const spec = sensitiveAction(action);
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setOpen(!isVerified(action));
    setReady(true);
  }, [action]);

  if (!spec) return <>{children}</>;
  if (!ready) return null;
  if (!open) return <>{children}</>;

  return (
    <IdentityPrompt
      action={action}
      title={title}
      onVerified={() => setOpen(false)}
    />
  );
}

/** Imperative version for a single action (a withdrawal button, an export). */
export function useIdentityCheck() {
  const [pending, setPending] = useState<{ action: string; resolve: (ok: boolean) => void } | null>(
    null,
  );

  const require = (action: string) =>
    new Promise<boolean>((resolve) => {
      if (isVerified(action)) return resolve(true);
      setPending({ action, resolve });
    });

  const element = pending ? (
    <div className="fixed inset-0 z-[120] grid place-items-center bg-background/85 p-4 backdrop-blur">
      <div className="w-full max-w-md">
        <IdentityPrompt
          action={pending.action}
          onVerified={() => {
            pending.resolve(true);
            setPending(null);
          }}
          onCancel={() => {
            pending.resolve(false);
            setPending(null);
          }}
        />
      </div>
    </div>
  ) : null;

  return { require, element };
}

function IdentityPrompt({
  action,
  title,
  onVerified,
  onCancel,
}: {
  action: string;
  title?: string;
  onVerified: () => void;
  onCancel?: () => void;
}) {
  const spec = sensitiveAction(action)!;
  const startFn = useServerFn(startPasskeyVerification);
  const finishFn = useServerFn(finishPasskeyVerification);
  const passwordFn = useServerFn(reauthenticateWithPassword);
  const logFn = useServerFn(recordPasswordVerification);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [biometricPossible, setBiometricPossible] = useState(false);

  useEffect(() => {
    setBiometricPossible(browserSupportsWebAuthn());
  }, []);

  const runBiometric = async () => {
    setBusy(true);
    setError(null);
    try {
      const start = await startFn();
      if (!start.available) {
        setError("No passkey is set up on this account yet. Use your password below.");
        setShowPassword(true);
        return;
      }
      const assertion = await startAuthentication({ optionsJSON: start.options });
      const res = await finishFn({ data: { response: assertion, action } });
      if (!res.ok) {
        setError("That didn't verify. You can try again or use your password.");
        setShowPassword(true);
        return;
      }
      recordVerification(action, "biometric");
      onVerified();
    } catch {
      setError("The device check was cancelled. Your password always works.");
      setShowPassword(true);
    } finally {
      setBusy(false);
    }
  };

  const runPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await passwordFn({ data: { password } });
      void logFn({ data: { action, succeeded: res.ok } });
      if (!res.ok) {
        setError("Identity not confirmed.");
        setPassword("");
        return;
      }
      recordVerification(action, "password");
      setPassword("");
      onVerified();
    } catch {
      setError("Identity not confirmed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-border bg-card/80 p-7 shadow-2xl backdrop-blur">
      <p className="text-[10px] uppercase tracking-[0.34em] text-primary">Identity check</p>
      <h2 className="mt-3 font-display text-2xl">{title ?? spec.label}</h2>
      <p className="mt-3 text-sm text-muted-foreground">{spec.reason}</p>

      {biometricPossible && (
        <button
          type="button"
          onClick={runBiometric}
          disabled={busy}
          className="lux-press mt-6 w-full rounded-full bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground disabled:opacity-50"
        >
          {busy ? "Waiting for your device…" : `Verify with ${biometricName()}`}
        </button>
      )}

      {!showPassword ? (
        <button
          type="button"
          onClick={() => setShowPassword(true)}
          className="mt-3 w-full rounded-full border border-border px-6 py-3 text-xs uppercase tracking-[0.22em] text-muted-foreground hover:text-foreground"
        >
          Use my password instead
        </button>
      ) : (
        <form onSubmit={runPassword} className="mt-5">
          <label className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
            Confirm password
          </label>
          <input
            type="password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
            placeholder="••••••••"
          />
          <button
            type="submit"
            disabled={busy || !password}
            className="lux-press mt-4 w-full rounded-full border border-primary px-6 py-3 text-xs font-bold uppercase tracking-[0.28em] text-primary disabled:opacity-50"
          >
            {busy ? "Verifying…" : "Confirm"}
          </button>
        </form>
      )}

      {error && <p className="mt-4 text-xs text-destructive">{error}</p>}

      <p className="mt-6 text-[11px] leading-relaxed text-muted-foreground">
        {PRIVACY_PROMISE[0]} {PRIVACY_PROMISE[1]} {PRIVACY_PROMISE[2]} This check covers{" "}
        {spec.label.toLowerCase()} for {ttlFor(spec)} minutes.
      </p>
      <p className="mt-2 text-[11px] text-muted-foreground">{ACCESSIBILITY_PROMISE}</p>

      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="mt-4 w-full text-[11px] uppercase tracking-[0.24em] text-muted-foreground hover:text-foreground"
        >
          Not now
        </button>
      )}
    </div>
  );
}
