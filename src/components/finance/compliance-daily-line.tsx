// FRASS-0484 — The Daily's compliance line. Quiet by design: it renders only
// when something actually needs attention, and reads the Financial Center's
// existing receipts rather than any new source.

import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { listMyReceipts } from "@/lib/finance/receipts.functions";
import { complianceState } from "@/lib/compliance";

const tone: Record<string, string> = {
  green: "border-emerald-400/30 bg-emerald-400/[0.07] text-emerald-100",
  yellow: "border-amber-400/30 bg-amber-400/[0.07] text-amber-100",
  orange: "border-orange-400/35 bg-orange-400/[0.08] text-orange-100",
  red: "border-rose-400/40 bg-rose-400/[0.09] text-rose-100",
};

export function ComplianceDailyLine({ alwaysShow = false }: { alwaysShow?: boolean }) {
  const receiptsFn = useServerFn(listMyReceipts);
  const { data: receipts } = useQuery({
    queryKey: ["financial-receipts"],
    queryFn: () => receiptsFn(),
    staleTime: 5 * 60_000,
  });
  const { data: country } = useQuery({
    queryKey: ["my-country"],
    queryFn: async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return null;
      const { data } = await supabase.from("profiles").select("country").eq("id", auth.user.id).maybeSingle();
      return (data?.country as string | null) ?? null;
    },
    staleTime: 5 * 60_000,
  });

  if (!receipts) return null;
  const { signal } = complianceState(receipts, { country });
  if (signal.tone === "green" && !alwaysShow) return null;

  return (
    <Link
      to="/financial-center"
      className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm ${tone[signal.tone]}`}
    >
      <span>{signal.dot}</span>
      <span className="flex-1">{signal.message}</span>
      <span className="text-[10px] uppercase tracking-[0.16em] opacity-70">Taxes</span>
    </Link>
  );
}
