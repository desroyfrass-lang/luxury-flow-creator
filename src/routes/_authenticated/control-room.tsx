// FRASS-0568 — Founder Control Room.
// One headquarters. One name. One experience. The Command Center interface is
// now the permanent Founder experience, and everything the legacy Control Room
// held has been migrated into it. Founder-only, never indexed, never rendered
// for anyone else.
import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { IdentityGate } from "@/components/security/identity-gate";
import { requireFounderRoute } from "@/lib/founder/route-guard";
import { COMMAND_SECTIONS, FOUNDER_NAV_GROUPS, type CommandSectionId } from "@/lib/founder/command-center";
import { useIsAdminStatus } from "@/hooks/use-is-admin";
import { Button } from "@/components/ui/button";
import { FounderHome } from "@/components/founder/founder-home";
import { ReleaseApprovalPanel } from "@/components/founder/release-approval-panel";
import { FounderWorkflowPanel } from "@/components/founder/founder-workflow-panel";
import { BrandPersonalityPanel } from "@/components/founder/brand-personality-panel";
import { GuidedAuditPanel } from "@/components/founder/guided-audit-panel";
import { FinancialSustainabilityPanel } from "@/components/founder/financial-sustainability-panel";
import { ConstitutionHealthPanel } from "@/components/founder/constitution-health";
import { PlatformIntelligencePanel } from "@/components/founder/platform-intelligence";
import { RepairCenter } from "@/components/founder/repair-center";
import { DesignAuthorityPanel } from "@/components/founder/design-authority-panel";
import { ChangeAdvisorPanel } from "@/components/founder/change-advisor-panel";
import { CoreRouteAuditPanel } from "@/components/founder/core-route-audit";
import { PlatformProtectionSwitch } from "@/components/founder/platform-protection-switch";
import { PlatformProtectionHeaderToggle } from "@/components/founder/platform-protection-header-toggle";
import { AiOperationsPanel } from "@/components/founder/ai-operations-panel";
import { FounderSuccessPanel } from "@/components/founder/success-dashboard-panel";
import { ExperienceSimulator } from "@/components/founder/experience-simulator";
import { SeedVaultsPanel } from "@/components/founder/seed-vaults-panel";
import { CommissioningPanel } from "@/components/founder/commissioning-panel";
import { WorldTeleporterPanel } from "@/components/founder/world-teleporter-panel";
import { AuditLedgerPanel } from "@/components/founder/audit-ledger-panel";
import { FounderAiStatusPanel } from "@/components/founder/founder-ai-status-panel";
import { FounderAiTimelinePanel } from "@/components/founder/founder-ai-timeline-panel";
import { endTeleport } from "@/lib/founder/teleport-session";
import { FrassyChat } from "@/components/frassy-chat";
import { PlatformHealthPanel } from "@/components/finance/platform-health-panel";
import { ObservationWindowPanel } from "@/components/finance/observation-window-panel";
import { SecurityAlertsPanel } from "@/components/finance/security-alerts-panel";

export const Route = createFileRoute("/_authenticated/control-room")({
  // Atlas Recovery Phase 1 — server-verified Founder door before anything loads.
  beforeLoad: requireFounderRoute,
  head: () => ({
    meta: [
      { title: "Founder Control Room | Frass" },
      {
        name: "description",
        content:
          "The Founder's single headquarters: platform audit, design authority, Frassy's voice, commissioning, operations and constitutional health in one place.",
      },
      { property: "og:title", content: "Founder Control Room | Frass" },
      {
        property: "og:description",
        content: "One headquarters for governing Frass — every Founder instrument in one place.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: FounderControlRoomGate,
});

function FounderControlRoomGate() {
  const { isAdmin, loading } = useIsAdminStatus();
  if (loading) return <AccessState title="Checking Founder access…" />;
  if (!isAdmin) return <AccessState title="Founder access required" />;
  return <IdentityGate action="founder_command_center"><ControlRoom /></IdentityGate>;
}

function AccessState({ title }: { title: string }) {
  return (
    <main className="mx-auto grid min-h-[70vh] max-w-lg place-items-center px-6 text-center">
      <div>
        <h1 className="font-display text-3xl uppercase">{title}</h1>
        <p className="mt-3 text-sm text-muted-foreground">This Hall is protected. Your account permissions remain the final authority.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Button asChild variant="outline"><Link to="/welcome-hall">Welcome Hall</Link></Button>
          <Button asChild><Link to="/">Site Home</Link></Button>
        </div>
      </div>
    </main>
  );
}

function ControlRoom() {
  const [active, setActive] = useState<CommandSectionId>(() => {
    if (typeof window === "undefined") return "home";
    const tab = new URLSearchParams(window.location.search).get("tab");
    const known = COMMAND_SECTIONS.some((s) => s.id === tab);
    if (known) {
      // Coming back from an inspection trip — the chip has done its job.
      endTeleport();
      return tab as CommandSectionId;
    }
    return "home";
  });
  const section = COMMAND_SECTIONS.find((s) => s.id === active) ?? COMMAND_SECTIONS.find((s) => s.id === "home");
  if (!section) return null;
  const activeGroup = FOUNDER_NAV_GROUPS.find((group) => group.sections.includes(active)) ?? FOUNDER_NAV_GROUPS[0];
  if (!activeGroup) return null;

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10">
      <nav aria-label="Founder Hall location" className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
        <Link to="/welcome-hall" className="hover:text-foreground">Welcome Hall</Link><span>→</span>
        {/* Founder Architecture Amendment — headquarters is Founder Hall; this is one of its rooms. */}
        <Link to="/founder" className="hover:text-foreground">Founder Hall</Link><span>→</span>
        <Link to="/control-room" className="text-[color:var(--gold)]">Control Room</Link><span>→</span>
        <span aria-current="page">{activeGroup.label}</span>
      </nav>
      <p className="mt-5 text-xs uppercase tracking-[0.3em] text-[color:var(--gold)]">FRASS-0568</p>
      <h1 className="mt-2 text-3xl font-black uppercase tracking-tight">
        🎛️ Founder Control Room
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Your one headquarters. Everything you use to run, govern and improve Frass — in one place,
        so you never have to wonder where a tool lives.
      </p>

      {/* The emergency switch, always in reach at the top. */}
      <PlatformProtectionHeaderToggle />

      <nav aria-label="Founder Hall primary navigation" className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {FOUNDER_NAV_GROUPS.map((group) => (
          <Button
            key={group.id}
            type="button"
            variant="outline"
            onClick={() => setActive(group.sections[0])}
            className={`h-auto min-h-11 whitespace-normal px-3 py-2 text-[10px] uppercase tracking-wide ${
              activeGroup.id === group.id
                ? "border-[color:var(--gold)] text-[color:var(--gold)]"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            <span aria-hidden className="mr-1">
              {group.icon}
            </span>
            {group.label}
          </Button>
        ))}
      </nav>

      {activeGroup.sections.length > 1 && (
        <nav aria-label={`${activeGroup.label} sections`} className="mt-3 flex flex-wrap gap-2 border-l-2 border-[color:var(--gold)]/40 pl-3">
          {activeGroup.sections.map((id) => {
            const item = COMMAND_SECTIONS.find((candidate) => candidate.id === id);
            return item ? <Button key={id} type="button" variant="ghost" size="sm" onClick={() => setActive(id)} className={active === id ? "text-[color:var(--gold)]" : "text-muted-foreground"}>{item.label}</Button> : null;
          })}
        </nav>
      )}

      <p className="mt-4 text-sm text-muted-foreground">{section.purpose}</p>

      {/* Destinations that live elsewhere on the platform — named, never hidden. */}
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {section.tools
          .filter((t) => t.kind === "link" && t.path)
          .map((t) => (
            <Link
              key={t.id}
              to={t.path!}
              className="rounded-xl border border-border/70 p-3 transition hover:border-[color:var(--gold)]"
            >
              <span className="text-sm font-semibold">{t.label}</span>
              {t.amendment ? (
                <span className="ml-2 text-[10px] text-[color:var(--gold)]">{t.amendment}</span>
              ) : null}
              <span className="mt-1 block text-xs text-muted-foreground">{t.plain}</span>
            </Link>
          ))}
      </div>

      <div className="mt-10 space-y-12">
        {active === "home" && (
          <>
            <FounderHome onGo={setActive} />
            <ReleaseApprovalPanel />
          </>
        )}

        {active === "conversation" && (
          <section>
            <h2 className="font-display text-2xl">Talk to Frassy</h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              She knows the districts, the catalog and where commissioning stands. Type or press
              the mic — she speaks back unless you mute her.
            </p>
            <div className="mt-4">
              <FrassyChat embedded tone="dark" />
            </div>
          </section>
        )}

        {active === "platform" && (
          <>
            <FounderWorkflowPanel />
            <GuidedAuditPanel />
            <PlatformIntelligencePanel />
            <RepairCenter />
          </>
        )}

        {active === "design" && (
          <>
            <DesignAuthorityPanel />
            <CoreRouteAuditPanel />
          </>
        )}

        {active === "frassy" && (
          <>
            <FounderAiStatusPanel />
            <FounderAiTimelinePanel />
            <p className="text-sm text-muted-foreground">
              Frassy's voice is managed in the Voice Studio above. Her character is below — one
              voice, one personality, one Frassy, everywhere on the platform.
            </p>
            <BrandPersonalityPanel />
          </>
        )}

        {active === "ai" && <AiOperationsPanel />}

        {active === "operations" && (
          <>
            <FounderSuccessPanel />
            <PlatformHealthPanel />
            <ObservationWindowPanel />
            <SecurityAlertsPanel />
            <PlatformProtectionSwitch />
            <FinancialSustainabilityPanel />
          </>
        )}

        {active === "simulator" && (
          <>
            <ExperienceSimulator />
            <SeedVaultsPanel />
          </>
        )}

        {active === "innovation" && (
          <>
            <ConstitutionHealthPanel />
            <ChangeAdvisorPanel />
          </>
        )}

        {active === "commissioning" && <CommissioningPanel />}

        {active === "world-teleporter" && (
          <div className="space-y-10">
            <WorldTeleporterPanel />
            <AuditLedgerPanel />
          </div>
        )}
      </div>
    </main>
  );
}
