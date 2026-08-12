import { createFileRoute } from "@tanstack/react-router";
import { FinancialAuditDashboard } from "@/components/finance/audit-dashboard";
import { IdentityGate } from "@/components/security/identity-gate";

export const Route = createFileRoute("/_authenticated/admin/financial-audit")({
  component: () => (
    // FRASS-0488 — money and platform authority sit behind the one identity gate.
    <IdentityGate action="financial_audit_center">
      <FinancialAuditPage />
    </IdentityGate>
  ),
});

function FinancialAuditPage() {
  return <FinancialAuditDashboard />;
}
