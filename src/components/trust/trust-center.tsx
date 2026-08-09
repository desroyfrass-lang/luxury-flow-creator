import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getMyTrustCenter, reportFraud } from "@/lib/trust.functions";
import {
  ACCOUNT_PROTECTIONS,
  FRAUD_POSTURE,
  FRAUD_REPORT_KINDS,
  FRAUD_SIGNALS,
  FRAUD_STATUS_LABEL,
  NEVER_EXPOSED,
  NEVER_TRUST_BLINDLY,
  SELLER_SEES,
  TRANSACTION_RECORD,
  TRUST_BADGES,
  TRUST_PRINCIPLE,
  fraudKindLabel,
  type FraudReportKind,
  type TrustBadgeId,
} from "@/lib/trust";

/**
 * FRASS-0431 — the Trust Center, living inside the Financial Center.
 *
 * Security is shown, not hidden. A member can see their protection status,
 * where their money is paid, what has recently moved, and what they have
 * reported — without any of it exposing payment credentials.
 */

const box = "rounded-xl border border-white/12 bg-white/[0.02] p-4";
const dim = "text-xs text-[oklch(0.7_0.01_80)]";

export function TrustCenter() {
  const trustFn = useServerFn(getMyTrustCenter);
  const reportFn = useServerFn(reportFraud);
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["my-trust-center"], queryFn: () => trustFn() });

  const [kind, setKind] = useState<FraudReportKind>("fraud");
  const [details, setDetails] = useState("");
  const [subject, setSubject] = useState("");
  const [sent, setSent] = useState(false);

  const submit = useMutation({
    mutationFn: () =>
      reportFn({
        data: {
          kind,
          details: details.trim(),
          subjectHandle: subject.trim() || undefined,
        },
      }),
    onSuccess: () => {
      setDetails("");
      setSubject("");
      setSent(true);
      void qc.invalidateQueries({ queryKey: ["my-trust-center"] });
    },
  });

  const badges = (data?.badges ?? []) as Array<{ badge: TrustBadgeId; createdAt: string }>;

  return (
    <div className="space-y-6">
      <div className={box}>
        <div className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--hill-gold)]">
          FRASS-0431 · {TRUST_PRINCIPLE}
        </div>
        <p className="mt-2 text-sm">{FRAUD_POSTURE}</p>
        <p className={`mt-2 ${dim}`}>
          <strong>What this means in plain English:</strong> we don't promise a lock that can never be
          picked. We build the door so it's hard to force, wire an alarm to it, and keep a spare key
          with someone who answers the phone.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className={box}>
          <h3 className="text-sm font-semibold">Payment account</h3>
          {data?.payout.connected ? (
            <>
              <p className="mt-1 text-sm">
                Connected · {data.payout.provider ?? "payment provider"}
                {data.payout.displayName ? ` · ${data.payout.displayName}` : ""}
              </p>
              <p className={`mt-1 ${dim}`}>
                Money goes straight to your own processor. Frass never holds it, and no buyer or
                seller ever sees the account behind it.
              </p>
            </>
          ) : (
            <p className={`mt-1 ${dim}`}>
              No payment account connected yet. Connect one in your Wallet to take payments from your
              Frass Card.
            </p>
          )}
        </div>

        <div className={box}>
          <h3 className="text-sm font-semibold">Verification status</h3>
          {badges.length === 0 ? (
            <p className={`mt-1 ${dim}`}>No verifications yet. Verification is granted by Frass, never self-claimed.</p>
          ) : (
            <ul className="mt-2 space-y-1 text-sm">
              {badges.map((b) => (
                <li key={b.badge}>
                  <span aria-hidden className="mr-1.5">{TRUST_BADGES[b.badge].icon}</span>
                  {TRUST_BADGES[b.badge].label}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className={box}>
        <h3 className="text-sm font-semibold">Recent transactions</h3>
        {(data?.recentTransactions ?? []).length === 0 ? (
          <p className={`mt-1 ${dim}`}>No transactions recorded yet. Zeros stay honest here.</p>
        ) : (
          <ul className="mt-2 space-y-2 text-sm">
            {data!.recentTransactions.map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-3">
                <span className="truncate">
                  {t.reference ?? "Order"} · {t.buyer ?? "Customer"}
                </span>
                <span className="tabular-nums">
                  {t.currency} {t.amount.toFixed(2)} · {t.status}
                </span>
              </li>
            ))}
          </ul>
        )}
        <p className={`mt-2 ${dim}`}>
          Every transaction keeps: {TRANSACTION_RECORD.join(" · ")}.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className={box}>
          <h3 className="text-sm font-semibold">What another member never sees</h3>
          <ul className={`mt-2 space-y-1 ${dim}`}>
            {NEVER_EXPOSED.map((n) => (
              <li key={n}>🚫 {n}</li>
            ))}
          </ul>
          <p className={`mt-2 ${dim}`}>Not even the last four digits of a card.</p>
        </div>
        <div className={box}>
          <h3 className="text-sm font-semibold">What a seller does see</h3>
          <ul className={`mt-2 space-y-1 ${dim}`}>
            {SELLER_SEES.map((n) => (
              <li key={n}>• {n}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className={box}>
          <h3 className="text-sm font-semibold">Fraud detection signals</h3>
          <ul className={`mt-2 space-y-1 ${dim}`}>
            {FRAUD_SIGNALS.map((s) => (
              <li key={s}>• {s}</li>
            ))}
          </ul>
        </div>
        <div className={box}>
          <h3 className="text-sm font-semibold">Account protection</h3>
          <ul className={`mt-2 space-y-1 ${dim}`}>
            {ACCOUNT_PROTECTIONS.map((s) => (
              <li key={s}>• {s}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className={box}>
        <h3 className="text-sm font-semibold">Report fraud or suspicious activity</h3>
        <p className={`mt-1 ${dim}`}>
          Reports are logged, investigated and tracked. You can see the status of everything you send.
        </p>
        <form
          className="mt-3 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (details.trim().length < 10) return;
            submit.mutate();
          }}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-xs">
              <span className={dim}>What happened?</span>
              <select
                value={kind}
                onChange={(e) => setKind(e.target.value as FraudReportKind)}
                className="mt-1 w-full rounded-lg border border-white/15 bg-transparent px-3 py-2 text-sm"
              >
                {FRAUD_REPORT_KINDS.map((k) => (
                  <option key={k.id} value={k.id} className="text-black">
                    {k.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs">
              <span className={dim}>Who is it about? (optional handle)</span>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                maxLength={40}
                placeholder="@handle"
                className="mt-1 w-full rounded-lg border border-white/15 bg-transparent px-3 py-2 text-sm"
              />
            </label>
          </div>
          <label className="block text-xs">
            <span className={dim}>Details</span>
            <textarea
              value={details}
              onChange={(e) => {
                setDetails(e.target.value);
                setSent(false);
              }}
              maxLength={2000}
              rows={4}
              className="mt-1 w-full rounded-lg border border-white/15 bg-transparent px-3 py-2 text-sm"
              placeholder="Tell us exactly what happened, including dates and order numbers if you have them."
            />
          </label>
          <button
            type="submit"
            disabled={submit.isPending || details.trim().length < 10}
            className="rounded-full border border-[color:var(--hill-gold)] px-4 py-1.5 text-[11px] uppercase tracking-[0.2em] text-[color:var(--hill-gold)] disabled:opacity-40"
          >
            {submit.isPending ? "Sending…" : "Send report"}
          </button>
          {sent && <p className={dim}>Report received. You'll see it tracked below.</p>}
        </form>

        {(data?.reports ?? []).length > 0 && (
          <ul className="mt-4 space-y-2 text-sm">
            {data!.reports.map((r) => (
              <li key={r.id} className="rounded-lg border border-white/12 p-3">
                <div className="flex items-center justify-between gap-2">
                  <span>{fraudKindLabel(r.kind)}</span>
                  <span className={dim}>{FRAUD_STATUS_LABEL[r.status] ?? r.status}</span>
                </div>
                <p className={`mt-1 ${dim}`}>{r.details}</p>
                {r.resolution && <p className="mt-1 text-xs">Outcome: {r.resolution}</p>}
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className={dim}>{NEVER_TRUST_BLINDLY}</p>
    </div>
  );
}
