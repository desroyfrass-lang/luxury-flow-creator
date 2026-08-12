import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import {
  getFeedbackInvitations,
  getMyTrustProfile,
  leaveVerifiedFeedback,
} from "@/lib/trust.functions";
import { FEEDBACK_EXPERIENCE, REPUTATION_PLAIN_ENGLISH, REPUTATION_RECOVERY } from "@/lib/trust";

/**
 * FRASS-0493 — a member's own view of their reputation.
 *
 * Nothing is hidden: they see their stage, exactly what would move it, what is
 * helping and what needs work. And they leave feedback for others from the
 * same place — only for transactions they genuinely completed.
 */
export function MyTrustSummary() {
  const mineFn = useServerFn(getMyTrustProfile);
  const invitesFn = useServerFn(getFeedbackInvitations);
  const leaveFn = useServerFn(leaveVerifiedFeedback);
  const qc = useQueryClient();

  const mine = useQuery({ queryKey: ["my-trust-profile"], queryFn: () => mineFn(), retry: false });
  const invites = useQuery({
    queryKey: ["feedback-invitations"],
    queryFn: () => invitesFn(),
    retry: false,
  });

  const [openFor, setOpenFor] = useState<string | null>(null);
  const [body, setBody] = useState("");

  const leave = useMutation({
    mutationFn: (v: { orderId: string; experience: "positive" | "mixed" | "negative" }) =>
      leaveFn({ data: { orderId: v.orderId, experience: v.experience, body: body || undefined } }),
    onSuccess: () => {
      toast.success("Thank you — verified feedback recorded.");
      setOpenFor(null);
      setBody("");
      qc.invalidateQueries({ queryKey: ["feedback-invitations"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const d = mine.data;

  return (
    <div className="space-y-8">
      {d && (
        <div className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
          <div className="text-3xl">
            <span aria-hidden className="mr-2">
              {d.stageIcon}
            </span>
            <span className="font-black">{d.stageLabel}</span>
          </div>
          <p className="mt-2 text-sm text-white/70">{d.stagePlain}</p>
          <p className="mt-4 text-sm leading-relaxed text-white/60">{REPUTATION_PLAIN_ENGLISH}</p>

          <dl className="mt-6 grid gap-4 sm:grid-cols-3">
            <div>
              <dt className="text-[10px] uppercase tracking-[0.28em] text-white/50">Completed</dt>
              <dd className="text-2xl font-black">{d.completed}</dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-[0.28em] text-white/50">Still open</dt>
              <dd className="text-2xl font-black">{d.open}</dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-[0.28em] text-white/50">Months active</dt>
              <dd className="text-2xl font-black">{d.monthsActive}</dd>
            </div>
          </dl>

          {d.guidance && <p className="mt-6 text-sm text-white/80">{d.guidance}</p>}

          {d.improvements.length > 0 && (
            <ul className="mt-4 space-y-2 text-sm text-white/70">
              {d.improvements.map((i) => (
                <li key={i}>• {i}</li>
              ))}
            </ul>
          )}

          <p className="mt-6 text-xs leading-relaxed text-white/50">{REPUTATION_RECOVERY}</p>
        </div>
      )}

      {(invites.data?.length ?? 0) > 0 && (
        <div className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
          <h3 className="text-sm font-bold uppercase tracking-[0.24em]">People you bought from</h3>
          <p className="mt-2 text-sm text-white/60">
            You can leave feedback for these because you genuinely completed the transaction. Once left, it
            can't be rewritten — by you or by them.
          </p>
          <div className="mt-5 space-y-3">
            {invites.data?.map((inv) => (
              <div key={inv.orderId} className="rounded-sm bg-black/40 px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="text-sm">
                    <strong>{inv.sellerName}</strong>
                    <span className="ml-2 text-white/50">#{inv.reference}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpenFor(openFor === inv.orderId ? null : inv.orderId)}
                    className="rounded-full border border-white/25 px-4 py-1.5 text-[10px] uppercase tracking-[0.24em] hover:border-white"
                  >
                    {openFor === inv.orderId ? "Close" : "Leave feedback"}
                  </button>
                </div>

                {openFor === inv.orderId && (
                  <div className="mt-4 space-y-3">
                    <textarea
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      maxLength={1200}
                      rows={3}
                      placeholder="What actually happened? Plain words help the next person decide."
                      className="w-full rounded-sm bg-black/60 px-3 py-2 text-sm ring-1 ring-white/15"
                    />
                    <div className="flex flex-wrap gap-2">
                      {(["positive", "mixed", "negative"] as const).map((exp) => (
                        <button
                          key={exp}
                          type="button"
                          disabled={leave.isPending}
                          onClick={() => leave.mutate({ orderId: inv.orderId, experience: exp })}
                          className="rounded-full border border-white/25 px-4 py-1.5 text-[11px] hover:border-white disabled:opacity-50"
                        >
                          <span aria-hidden className="mr-1.5">
                            {FEEDBACK_EXPERIENCE[exp].icon}
                          </span>
                          {FEEDBACK_EXPERIENCE[exp].label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
