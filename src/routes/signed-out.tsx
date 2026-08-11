import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";

/**
 * FRASS-0467 — the confirmation every member sees after signing out.
 * Public by design: it must render with no session at all.
 */
export const Route = createFileRoute("/signed-out")({
  head: () => ({
    meta: [
      { title: "Signed out securely — Frass" },
      {
        name: "description",
        content:
          "Your Frass account has been safely closed on this device. Sign back in whenever you're ready.",
      },
      { property: "og:title", content: "Signed out securely — Frass" },
      {
        property: "og:description",
        content: "Your Frass account has been safely closed on this device.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: SignedOutPage,
});

function SignedOutPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-md text-center">
        <ShieldCheck className="mx-auto h-10 w-10 text-[color:var(--gold)]" aria-hidden />
        <h1 className="mt-6 font-display text-4xl">You've been securely signed out.</h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          Your Frass account has been safely closed on this device. Your Daily, Workspace, Wallet
          and any Partner or Founder tools are locked until you sign in again.
        </p>
        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
          If you're using a shared computer, closing this tab finishes the job — nothing of yours is
          left behind here.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link
            to="/"
            className="lux-press rounded-sm border border-[color:var(--gold)] bg-[color:var(--gold)] px-6 py-3 text-[11px] font-bold uppercase tracking-[0.3em] text-[color:var(--ink)]"
          >
            Back to FrassKicks
          </Link>
          <Link
            to="/auth"
            search={{ next: "" }}
            className="lux-press rounded-sm border border-border px-6 py-3 text-[11px] font-bold uppercase tracking-[0.3em] hover:border-[color:var(--gold)]"
          >
            Sign back in
          </Link>
        </div>

        <p className="mt-8 text-xs text-muted-foreground">
          Thank you for visiting Frass. We look forward to seeing you again.
        </p>
      </div>
    </main>
  );
}
