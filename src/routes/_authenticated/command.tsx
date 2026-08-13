// FRASS-0525 — Founder Command Center.
// One operational headquarters. Every Founder instrument, grouped by what the
// Founder is actually trying to do, with nothing duplicated: the panels here
// are the same ones that already power the platform.
import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { IdentityGate } from "@/components/security/identity-gate";
import { COMMAND_SECTIONS, type CommandSectionId } from "@/lib/founder/command-center";
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
import { AiOperationsPanel } from "@/components/founder/ai-operations-panel";
import { FounderSuccessPanel } from "@/components/founder/success-dashboard-panel";
import { ExperienceSimulator } from "@/components/founder/experience-simulator";
import { SeedVaultsPanel } from "@/components/founder/seed-vaults-panel";
import { PlatformHealthPanel } from "@/components/finance/platform-health-panel";
import { ObservationWindowPanel } from "@/components/finance/observation-window-panel";
import { SecurityAlertsPanel } from "@/components/finance/security-alerts-panel";

export const Route = createFileRoute("/_authenticated/command")({
  head: () => ({
    meta: [
      { title: "Founder Command Center | Frass" },
      {
        name: "description",
        content:
          "The Founder's operational headquarters: platform audit, design authority, Frassy's voice, operations and constitutional health in one place.",
      },
      { property: "og:title", content: "Founder Command Center | Frass" },
      {
        property: "og:description",
        content: "Every Founder instrument for Frass, in one operational headquarters.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <IdentityGate action="founder_command_center">
      <CommandCenter />
    </IdentityGate>
  ),
});

function CommandCenter() {
  const [active, setActive] = useState<CommandSectionId>("home");
  const section = COMMAND_SECTIONS.find((s) => s.id === active)!;

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10">
      <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--gold)]">FRASS-0525</p>
      <h1 className="mt-2 text-3xl font-black uppercase tracking-tight">Command Center</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Your headquarters. Everything you use to run, govern and improve Frass — in one place, so
        you never have to remember where a tool lives.
      </p>

      <nav className="mt-6 flex flex-wrap gap-2">
        {COMMAND_SECTIONS.map((s) => (
          <button
            key={s.id}
            onClick={() => setActive(s.id)}
            className={`rounded-full border px-4 py-1.5 text-xs uppercase tracking-wide transition ${
              active === s.id
                ? "border-[color:var(--gold)] text-[color:var(--gold)]"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            <span aria-hidden className="mr-1">
              {s.icon}
            </span>
            {s.label}
          </button>
        ))}
      </nav>

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
      </div>
    </main>
  );
}
