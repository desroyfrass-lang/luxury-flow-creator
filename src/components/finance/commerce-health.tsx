import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Activity, AlertTriangle, HeartPulse, ShieldCheck } from "lucide-react";
import { money } from "@/lib/card-commerce";
import { DUPLICATE_PROTECTION_PROMISE, RECOVERY_PROMISE, REQUEST_STATUS } from "@/lib/payment-request";
import { getCommerceHealth } from "@/lib/payment-request.functions";

const panel = "rounded-2xl border border-border/60 bg-background/60 p-6 backdrop-blur";
const heading = "text-xs uppercase tracking-[0.25em] text-muted-foreground";

const RANGES = [
  { days: 1, label: "Today" },
  { days: 7, label: "7 days" },
  { days: 30, label: "30 days" },
];

/**
 * FRASS-0439 — Founder Commerce Health.
 * One screen that answers a single question: is the payment system serving
 * Builders well right now?
 */
export function CommerceHealth() {
  const [days, setDays] = useState(7);
  const healthFn = useServerFn(getCommerceHealth);
  const { data, isLoading } = useQuery({
    queryKey: ["commerce-health", days],
    queryFn: () => healthFn({ data: { days } }),
  });

  const rate = data?.successRate;
  const tone = rate == null ? "quiet" : rate >= 90 ? "good" : rate >= 70 ? "watch" : "poor";

  return (
    <div className="space-y-6">
      <section className={panel}>
        <h2 className={heading}>
          <HeartPulse className="mr-2 inline h-3.5 w-3.5" /> Commerce health
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Every payment in Frass has one — and only one — final outcome. This is the record of those
          outcomes.
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          <strong>What this means in plain English:</strong> think of it as the pulse of the shop
          till. A healthy pulse means money is landing cleanly. A weak one means Builders are being
          let down somewhere, and it tells you exactly where.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {RANGES.map((r) => (
            <button
              key={r.days}
              type="button"
              className={`ws-chip${days === r.days ? " is-on" : ""}`}
              onClick={() => setDays(r.days)}
            >
              {r.label}
            </button>
          ))}
        </div>

        {isLoading || !data ? (
          <p className="mt-5 text-sm text-muted-foreground">Reading the pulse…</p>
        ) : (
          <>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <Metric
                label="Success rate"
                value={rate == null ? "—" : `${rate}%`}
                note={
                  rate == null
                    ? "No payments have settled in this window yet."
                    : tone === "good"
                      ? "Healthy. Payments are landing."
                      : tone === "watch"
                        ? "Worth watching — some Builders are not getting paid."
                        : "Attention needed. Too many payments are failing."
                }
              />
              <Metric label="Paid" value={money(data.paidValue, data.currency)} note={`${data.successful} completed`} />
              <Metric label="Still open" value={String(data.open)} note="Sent, not yet settled." />
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <Outcome label="Declined" n={data.declined} />
              <Outcome label="Expired" n={data.expired} />
              <Outcome label="Cancelled" n={data.cancelled} />
              <Outcome label="Refunded" n={data.refunded} />
            </div>

            {(data.declined > 0 || data.expired > 0) && (
              <p className="mt-4 flex items-start gap-2 rounded-xl border border-amber-500/40 bg-amber-500/5 p-3 text-sm">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                <span>
                  {data.declined} declined and {data.expired} expired. Nothing was charged in either
                  case — but each one is a Builder who did not get paid, so it is worth a look.
                </span>
              </p>
            )}

            <p className="mt-4 flex items-start gap-2 rounded-xl border border-border/60 p-3 text-sm text-muted-foreground">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              <span>
                {data.retried} request{data.retried === 1 ? "" : "s"} were approved more than once and
                stopped by duplicate protection. No customer was charged twice.
              </span>
            </p>
          </>
        )}
      </section>

      <section className={panel}>
        <h2 className={heading}>
          <Activity className="mr-2 inline h-3.5 w-3.5" /> The eight outcomes
        </h2>
        <ul className="mt-3 space-y-2 text-sm">
          {Object.entries(REQUEST_STATUS).map(([id, s]) => (
            <li key={id}>
              <strong>{s.label}</strong>{" "}
              <span className="text-muted-foreground">— {s.plain}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-muted-foreground">{DUPLICATE_PROTECTION_PROMISE}</p>
        <p className="mt-1 text-xs text-muted-foreground">{RECOVERY_PROMISE}</p>
      </section>
    </div>
  );
}

function Metric({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-xl border border-border/60 p-4">
      <p className={heading}>{label}</p>
      <p className="mt-1 text-3xl font-black">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{note}</p>
    </div>
  );
}

function Outcome({ label, n }: { label: string; n: number }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border/60 px-4 py-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <strong>{n}</strong>
    </div>
  );
}
