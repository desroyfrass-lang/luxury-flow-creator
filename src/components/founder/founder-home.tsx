// FRASS-0528 — Founder Home.
// The Command Center now opens on one question: "How is Frass doing today?"
// Nothing here is a new capability — it is the honest state of the platform,
// with a door into the section that can act on it.
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { founderSnapshot, type FounderSnapshot } from "@/lib/founder/home.functions";
import { invitationLabel, type InvitationVerdict } from "@/lib/founder/platform-audit";
import type { CommandSectionId } from "@/lib/founder/command-center";

const STATUS_DOT: Record<FounderSnapshot["platform"]["status"], string> = {
  green: "🟢",
  amber: "🟡",
  red: "🔴",
};

function Card({
  title,
  plain,
  children,
  action,
}: {
  title: string;
  plain: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border/70 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wide">{title}</h3>
          <p className="mt-1 text-xs text-muted-foreground">{plain}</p>
        </div>
        {action}
      </div>
      <div className="mt-4 space-y-2 text-sm">{children}</div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-base font-bold">{value}</span>
    </div>
  );
}

export function FounderHome({ onGo }: { onGo: (section: CommandSectionId) => void }) {
  const load = useServerFn(founderSnapshot);
  const { data, isLoading, error } = useQuery({
    queryKey: ["founder-snapshot"],
    queryFn: () => load(),
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Reading today's numbers…</p>;
  if (error || !data)
    return <p className="text-sm text-muted-foreground">Today's snapshot is unavailable.</p>;

  const goBtn = (section: CommandSectionId, label: string) => (
    <button
      onClick={() => onGo(section)}
      className="shrink-0 rounded-full border border-border px-3 py-1 text-[11px] hover:border-[color:var(--gold)] hover:text-[color:var(--gold)]"
    >
      {label}
    </button>
  );

  const t = data.today;

  return (
    <div className="space-y-6">
      <header className="rounded-2xl border border-[color:var(--gold)]/40 bg-[color:var(--gold)]/5 p-5">
        <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--gold)]">FRASS-0528</p>
        <h2 className="mt-2 text-2xl font-black uppercase tracking-tight">
          {STATUS_DOT[data.platform.status]} How is Frass doing today?
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">{data.platform.statusPlain}</p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <Card
          title="Platform health"
          plain="What's broken, what's blocking, what got fixed."
          action={goBtn("platform", "Platform")}
        >
          <Stat label="Open incidents" value={data.platform.openIncidents} />
          <Stat label="Blocking a member right now" value={data.platform.blockingIncidents} />
          <Stat label="Fixed in the last 7 days" value={data.platform.resolvedLast7Days} />
        </Card>

        <Card
          title="Member health"
          plain="Who arrived, who got through the front door, who's still here."
          action={goBtn("operations", "Operations")}
        >
          <Stat label="New members (7 days)" value={data.members.newLast7Days} />
          <Stat label="Finished onboarding" value={data.members.onboardingCompleted} />
          <Stat label="Active Dailies (7 days)" value={data.members.activeDailies} />
          <Stat label="Members in total" value={data.members.totalMembers} />
        </Card>

        <Card
          title="Business health"
          plain="Money Moves in flight, and what the marketplace actually did."
          action={goBtn("operations", "Operations")}
        >
          <Stat label="Money Moves in progress" value={data.business.opportunitiesActive} />
          <Stat label="Money Moves completed" value={data.business.opportunitiesWon} />
          <Stat label="Orders (30 days)" value={data.business.ordersLast30Days} />
          <Stat
            label="Revenue (30 days)"
            value={`$${data.business.revenueLast30Days.toLocaleString()}`}
          />
          <Stat label="Frass Card sales (30 days)" value={data.business.cardOrdersLast30Days} />
        </Card>

        <Card
          title="Intelligence"
          plain="What keeps coming back, and what the Constitution says about it."
          action={goBtn("innovation", "Innovation")}
        >
          {data.intelligence.topPatterns.length ? (
            <ul className="space-y-1 text-xs text-muted-foreground">
              {data.intelligence.topPatterns.map((p) => (
                <li key={p.signature}>
                  • {p.signature} — seen {p.occurrences}×
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-muted-foreground">
              No recurring issue has been recorded yet. That's a good sign.
            </p>
          )}
        </Card>
      </div>

      <Card
        title="Today"
        plain="The short list. What is waiting on you, in order."
        action={goBtn("platform", "Audit desk")}
      >
        <ul className="space-y-2 text-sm">
          <li className="text-muted-foreground">
            {t.daysSinceAudit === null
              ? "• You haven't completed a platform audit yet. Start one in Platform."
              : t.daysSinceAudit >= 7
                ? `• Your last audit was ${t.daysSinceAudit} days ago — time to walk the platform again.`
                : `• Last audit was ${t.daysSinceAudit === 0 ? "today" : `${t.daysSinceAudit} day(s) ago`}.`}
          </li>
          <li className="text-muted-foreground">
            {t.invitationVerdict
              ? `• Invitation readiness: ${invitationLabel(t.invitationVerdict as InvitationVerdict)}`
              : "• Invitation readiness: not answered yet."}
          </li>
          <li className="text-muted-foreground">
            {t.lastReleaseDecision
              ? `• Last release decision: ${t.lastReleaseDecision.replace("_", " ")} on ${new Date(
                  t.lastReleaseAt!,
                ).toLocaleDateString()}.`
              : "• No release has been approved yet — use Release Approval before publishing."}
          </li>
        </ul>
        {t.unresolvedFindings.length ? (
          <div className="mt-3 rounded-xl border border-amber-500/50 bg-amber-500/5 p-3">
            <p className="text-xs font-bold text-amber-500">Still unresolved from the last audit</p>
            <ul className="mt-1 space-y-1 text-xs text-muted-foreground">
              {t.unresolvedFindings.map((f) => (
                <li key={f}>• {f}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </Card>
    </div>
  );
}
