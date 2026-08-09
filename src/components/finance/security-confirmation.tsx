import { ShieldCheck } from "lucide-react";
import {
  SECURITY_CONFIRMATION_LINES,
  SECURITY_CONFIRMATION_PLAIN,
  SECURITY_CONFIRMATION_TITLE,
} from "@/lib/zero-friction";

/**
 * FRASS-0438 — Security Confirmation.
 * Displayed after every completed payment, on the customer's own screen.
 */
export function SecurityConfirmation({
  reference,
  plain = true,
  className = "",
}: {
  /** Order or receipt reference, when one exists. */
  reference?: string | null;
  plain?: boolean;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl border border-emerald-500/40 bg-emerald-500/5 p-4 ${className}`}
      aria-label={SECURITY_CONFIRMATION_TITLE}
    >
      <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em]">
        <ShieldCheck className="h-4 w-4 text-emerald-500" aria-hidden />
        {SECURITY_CONFIRMATION_TITLE}
      </p>
      <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
        {SECURITY_CONFIRMATION_LINES.map((line) => (
          <li key={line}>· {line}</li>
        ))}
      </ul>
      {plain && <p className="mt-3 text-xs text-muted-foreground">{SECURITY_CONFIRMATION_PLAIN}</p>}
      {reference && (
        <p className="mt-2 text-xs text-muted-foreground">Reference {reference.slice(0, 8).toUpperCase()}</p>
      )}
    </section>
  );
}
