import { createFileRoute } from "@tanstack/react-router";
import { FinancialAuditDashboard } from "@/components/finance/audit-dashboard";

export const Route = createFileRoute("/_authenticated/admin/financial-audit")({
  component: FinancialAuditPage,
});

function FinancialAuditPage() {
  return <FinancialAuditDashboard />;
}
