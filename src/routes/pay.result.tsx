import { createFileRoute, Link } from "@tanstack/react-router";
import { Info, ShieldCheck } from "lucide-react";
import { z } from "zod";

/**
 * STEP 5 · SLICE 5 — where Stripe sends the customer back to.
 *
 * This page is INFORMATION ONLY. Landing here proves nothing about money.
 * A payment becomes "Payment verified" only when Stripe's own signed message
 * reaches the Frass verification door — never because a browser arrived here.
 */
const Search = z.object({
  outcome: z.enum(["returned", "cancelled"]).catch("returned"),
  order: z.string().optional(),
});

export const Route = createFileRoute("/pay/result")({
  validateSearch: Search,
  head: () => ({
    meta: [
      { title: "Payment update — Frass" },
      {
        name: "description",
        content:
          "What happens after you leave the secure Stripe payment page for a Frass Card order.",
      },
      { property: "og:title", content: "Payment update — Frass" },
      {
        property: "og:description",
        content: "Your payment is checked by the payment provider before Frass records anything.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PayResult,
});

function PayResult() {
  const { outcome, order } = Route.useSearch();
  const cancelled = outcome === "cancelled";

  return (
    <main className="mx-auto w-full max-w-md px-5 py-14">
      <div className="rounded-3xl border border-border/60 bg-background/70 p-6 backdrop-blur">
        <p className="mb-3 flex items-center gap-2 text-sm opacity-80">
          {cancelled ? <Info className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
          {cancelled ? "Payment not completed" : "Thanks — you're back from the payment page"}
        </p>
        <h1 className="text-xl font-semibold">
          {cancelled ? "Nothing was charged" : "Your payment is being checked"}
        </h1>
        <p className="mt-3 text-sm leading-relaxed opacity-80">
          {cancelled
            ? "You left the secure payment page before finishing, so no money moved. You can start again whenever you like."
            : "Returning to this page does not confirm a payment. Frass waits for the payment provider's own confirmation before anything is recorded as verified."}
        </p>
        {order && (
          <p className="mt-3 text-xs opacity-60">Order reference: {order}</p>
        )}
        <Link to="/" className="daily-enter mt-6 inline-block w-full text-center">
          Back to Frass
        </Link>
      </div>
    </main>
  );
}
