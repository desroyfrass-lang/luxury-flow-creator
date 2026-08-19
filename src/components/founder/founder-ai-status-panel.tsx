// FRASS-0571 — Founder AI Status.
//
// One small board that answers the only question that matters when Frassy
// misbehaves: is it memory, routing, or the response filter? Read-only.
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { founderAiStatus } from "@/lib/journey.functions";

function ago(iso: string | null): string {
  if (!iso) return "never";
  const seconds = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  if (seconds < 60) return `${seconds} second${seconds === 1 ? "" : "s"} ago`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 48) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  return `${Math.round(hours / 24)} days ago`;
}

function Row({
  label,
  value,
  good,
  hint,
}: {
  label: string;
  value: string;
  good?: boolean;
  hint?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border/50 py-3 last:border-0">
      <div>
        <p className="text-sm font-semibold">{label}</p>
        {hint ? <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p> : null}
      </div>
      <p
        className={`shrink-0 text-sm font-semibold ${
          good === undefined
            ? "text-foreground"
            : good
              ? "text-[color:var(--gold)]"
              : "text-destructive"
        }`}
      >
        {good === undefined ? "" : good ? "✓ " : "⚠ "}
        {value}
      </p>
    </div>
  );
}

export function FounderAiStatusPanel() {
  const check = useServerFn(founderAiStatus);
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["founder-ai-status"],
    queryFn: () => check(),
    refetchInterval: 30_000,
  });

  return (
    <section className="rounded-2xl border border-border/70 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--gold)]">FRASS-0571</p>
          <h2 className="mt-1 font-display text-2xl">🟢 Founder AI Status</h2>
        </div>
        <button
          onClick={() => void refetch()}
          className="rounded-full border border-border px-4 py-1.5 text-xs uppercase tracking-wide transition hover:border-[color:var(--gold)]"
        >
          {isFetching ? "Checking…" : "Re-check"}
        </button>
      </div>

      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        In plain English: if Frassy ever starts repeating herself or forgetting things again, this
        board tells you within seconds whether the problem is her memory, the route she's on, or
        something rewriting her words.
      </p>

      {isLoading ? (
        <p className="mt-6 text-sm text-muted-foreground">Reading the instruments…</p>
      ) : error ? (
        <p className="mt-6 text-sm text-destructive">
          Could not read status: {(error as Error).message}
        </p>
      ) : data ? (
        <>
          <div className="mt-5">
            <Row
              label="Memory Recording"
              value={data.memoryRecording === "active" ? "Active" : "Off"}
              good={data.memoryRecording === "active"}
              hint="Everything she learns is written down on every turn."
            />
            <Row
              label="Response Filter"
              value="Advisory Only"
              good={data.responseFilter === "advisory_only"}
              hint="Nothing rewrites or replaces what Frassy actually said."
            />
            <Row
              label="Safety Override"
              value="Inactive"
              good={data.safetyOverride === "inactive"}
              hint="The canned stand-in reply is not being used."
            />
            <Row
              label="Conversation Mode"
              value={data.conversationMode}
              hint="Which track the server routed you onto."
            />
            <Row
              label="Journey Stage"
              value={`Step ${data.stepNumber} of ${data.stepTotal}`}
              hint={data.stageTitle}
            />
            <Row
              label="Memory Namespace"
              value={`${data.memoryNamespace} · ${data.memoryEntries} kept`}
              hint="Where her notes about this session are stored."
            />
            <Row
              label="Last Memory Saved"
              value={ago(data.lastMemoryAt)}
              good={Boolean(data.lastMemoryAt)}
            />
            <Row
              label="Last Reply Recorded"
              value={ago(data.lastReplyAt)}
              good={Boolean(data.lastReplyAt)}
              hint={data.lastReplyPreview ? `"${data.lastReplyPreview}…"` : undefined}
            />
            <Row
              label="Transcript Length"
              value={`${data.transcriptMessages} messages`}
              hint="What she can see when she answers you."
            />
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Checked {ago(data.checkedAt)} · refreshes on its own every 30 seconds.
          </p>
        </>
      ) : null}
    </section>
  );
}
