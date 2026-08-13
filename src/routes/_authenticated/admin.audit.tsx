// FRASS-0523 / FRASS-0524 — The Founder's audit desk.
// One place to walk the platform with Frassy and to see what running Frass
// actually costs. Founder only, behind the identity gate.
import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { IdentityGate } from "@/components/security/identity-gate";
import { GuidedAuditPanel } from "@/components/founder/guided-audit-panel";
import { FinancialSustainabilityPanel } from "@/components/founder/financial-sustainability-panel";

export const Route = createFileRoute("/_authenticated/admin/audit")({
  head: () => ({
    meta: [
      { title: "Founder Platform Audit | Frass" },
      {
        name: "description",
        content:
          "Walk every page of Frass with Frassy, score its Trust, and see exactly what the platform costs to operate.",
      },
      { property: "og:title", content: "Founder Platform Audit | Frass" },
      {
        property: "og:description",
        content:
          "Every page. Every feature. Every promise. The Founder's guided platform audit and financial sustainability desk.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <IdentityGate action="platform_audit_center">
      <AuditPage />
    </IdentityGate>
  ),
});

function AuditPage() {
  const [tab, setTab] = useState<"walk" | "money">("walk");

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-black uppercase tracking-tight">Founder Audit</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Frass grew fast. This is where you slow down and look at all of it — what each page does,
        what it promises, and what it costs to keep the promise.
      </p>

      <div className="mt-6 flex gap-2">
        {(
          [
            ["walk", "Walk the platform"],
            ["money", "What it costs"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`rounded-full border px-4 py-1.5 text-xs uppercase tracking-wide transition ${
              tab === id
                ? "border-[color:var(--gold)] text-[color:var(--gold)]"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {tab === "walk" ? <GuidedAuditPanel /> : <FinancialSustainabilityPanel />}
      </div>
    </main>
  );
}
