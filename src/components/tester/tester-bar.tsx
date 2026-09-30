// Step 7 — the Tester overlay. Visible only when the server confirms the
// signed-in person holds commissioned experiences. It links ONLY to those
// experiences and never to Founder/internal rooms. It adds nothing to — and
// takes nothing away from — ordinary Member access.
import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { useAuthUserId } from "@/lib/auth/identity-watch";
import { listMyTesterCommissions } from "@/lib/tester.functions";
import { submitTesterFeedback } from "@/lib/tester-feedback.functions";
import type { TesterExperience } from "@/lib/roles";

/** Journey order and the existing Member pages each experience lives on. */
const JOURNEY: { exp: TesterExperience; label: string; to: string }[] = [
  { exp: "welcome_hall", label: "Welcome Hall", to: "/welcome-hall" },
  { exp: "onboarding", label: "Frassy interview", to: "/onboarding" },
  { exp: "daily", label: "Start My Day", to: "/daily" },
  { exp: "workshop", label: "Workshop", to: "/workshop" },
];

export function TesterBar() {
  const { userId, ready } = useAuthUserId();
  const listFn = useServerFn(listMyTesterCommissions);
  const sendFn = useServerFn(submitTesterFeedback);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<"works" | "problem" | "confused" | null>(null);
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);

  const { data } = useQuery({
    queryKey: ["tester-commissions", userId],
    queryFn: () => listFn(),
    enabled: ready && Boolean(userId),
    staleTime: 60_000,
  });

  const commissioned = data ?? [];
  // Fail closed: no confirmed commissions → no overlay at all.
  if (!userId || commissioned.length === 0) return null;

  const steps = JOURNEY.filter((j) => commissioned.includes(j.exp));
  const here = steps.find((s) => pathname === s.to || pathname.startsWith(s.to + "/"));

  const send = async () => {
    if (!here || !status || sending) return;
    setSending(true);
    try {
      await sendFn({ data: { experience: here.exp, status, pagePath: pathname, note } });
      toast.success("Thank you — your report reached the Founder.");
      setStatus(null);
      setNote("");
      setOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not send your report.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div data-tester-bar="" aria-label="Tester journey" className="fixed bottom-4 left-4 z-[80] max-w-xs rounded-xl border border-border bg-background/95 p-3 text-xs shadow-lg backdrop-blur">
      <div className="flex items-center justify-between gap-2">
        <span className="rounded-full border border-[color:var(--gold)]/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.25em] text-[color:var(--gold)]">
          Tester
        </span>
        <span className="text-muted-foreground">Your test journey</span>
      </div>
      <ol className="mt-2 space-y-1">
        {steps.map((s, i) => (
          <li key={s.exp}>
            <Link
              to={s.to}
              {...(s.exp === "welcome_hall" ? { search: { welcome: "daily" as const } } : {})}
              className={`block rounded px-2 py-1 hover:bg-foreground/5 ${here?.exp === s.exp ? "text-[color:var(--gold)]" : "text-foreground/80"}`}
            >
              {i + 1}. {s.label}
            </Link>
          </li>
        ))}
      </ol>
      {here && !open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-2 w-full rounded border border-border px-2 py-1.5 hover:border-[color:var(--gold)]"
        >
          Report on {here.label}
        </button>
      )}
      {here && open && (
        <div className="mt-2 space-y-2">
          <div className="flex gap-1">
            {(
              [
                ["works", "Works"],
                ["problem", "Problem"],
                ["confused", "I'm confused"],
              ] as const
            ).map(([v, l]) => (
              <button
                key={v}
                type="button"
                onClick={() => setStatus(v)}
                className={`flex-1 rounded border px-1 py-1 ${status === v ? "border-[color:var(--gold)] text-[color:var(--gold)]" : "border-border"}`}
              >
                {l}
              </button>
            ))}
          </div>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={2000}
            rows={3}
            placeholder="What did you see? (optional)"
            className="w-full resize-none rounded border border-border bg-background p-2"
          />
          <div className="flex gap-2">
            <button type="button" onClick={() => setOpen(false)} className="flex-1 rounded border border-border py-1">
              Cancel
            </button>
            <button
              type="button"
              disabled={!status || sending}
              onClick={send}
              className="flex-1 rounded bg-foreground py-1 text-background disabled:opacity-50"
            >
              {sending ? "Sending…" : "Send"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
