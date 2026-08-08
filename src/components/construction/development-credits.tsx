// FRASS-0200 (Amendment) — Development Credits panel.
// Frassy never lets the Founder spend blindly: balance, monthly budget,
// spend this month, and an honest low-credit warning.

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  budgetWarning,
  loadBudget,
  loadSpend,
  saveBudget,
  spentThisMonth,
  type CreditBudget,
  type CreditSpend,
} from "@/lib/construction/credit-intelligence";

export function DevelopmentCredits({ compact = false }: { compact?: boolean }) {
  const [budget, setBudget] = useState<CreditBudget>({ balance: null, monthlyBudget: null, updatedAt: null });
  const [spend, setSpend] = useState<CreditSpend[]>([]);
  const [balanceInput, setBalanceInput] = useState("");
  const [budgetInput, setBudgetInput] = useState("");

  useEffect(() => {
    const b = loadBudget();
    setBudget(b);
    setSpend(loadSpend());
    setBalanceInput(b.balance === null ? "" : String(b.balance));
    setBudgetInput(b.monthlyBudget === null ? "" : String(b.monthlyBudget));
  }, []);

  const spent = spentThisMonth(spend);
  const warning = budgetWarning(budget);

  const save = () => {
    const next = saveBudget({
      balance: balanceInput.trim() === "" ? null : Math.max(0, Number(balanceInput) || 0),
      monthlyBudget: budgetInput.trim() === "" ? null : Math.max(0, Number(budgetInput) || 0),
    });
    setBudget(next);
    toast("Development budget recorded", {
      description: "Every architectural change will now be forecast against this before you approve it.",
    });
  };

  return (
    <div className={`dev-credits dev-credits-${warning.level}${compact ? " dev-credits-compact" : ""}`}>
      <div className="flex items-baseline justify-between gap-3">
        <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-[color:var(--gold)]">
          Development Credits
        </div>
        <div className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
          {warning.level === "none" ? "Healthy" : warning.level}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-3 text-center">
        <Stat label="Balance" value={budget.balance === null ? "—" : String(budget.balance)} />
        <Stat label="Spent (month)" value={String(spent)} />
        <Stat label="Budget" value={budget.monthlyBudget === null ? "None" : String(budget.monthlyBudget)} />
      </div>

      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{warning.message}</p>

      {!compact && (
        <>
          <div className="mt-4 flex flex-wrap items-end gap-2">
            <Field label="Credits available" value={balanceInput} onChange={setBalanceInput} />
            <Field label="Monthly budget" value={budgetInput} onChange={setBudgetInput} />
            <button type="button" className="bp-approve !flex-none" onClick={save}>
              Record
            </button>
          </div>

          <div className="mt-4 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            Recent development spend
          </div>
          {spend.length === 0 ? (
            <p className="mt-2 text-xs text-muted-foreground">
              Nothing recorded yet. Approved architectural changes are logged here with their forecast cost.
            </p>
          ) : (
            <ul className="mt-2 space-y-1.5">
              {spend.slice(0, 6).map((s) => (
                <li key={s.id} className="flex items-baseline justify-between gap-3 text-xs">
                  <span className="truncate text-muted-foreground">{s.label}</span>
                  <span className="whitespace-nowrap text-[color:var(--gold)]">{s.credits} cr</span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-sm border border-border/70 bg-background/50 px-2 py-2">
      <div className="font-display text-xl leading-none">{value}</div>
      <div className="mt-1 text-[9px] uppercase tracking-[0.2em] text-muted-foreground">{label}</div>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex-1 min-w-[8rem] text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
      {label}
      <input
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/[^0-9]/g, ""))}
        placeholder="—"
        className="mt-1 w-full rounded-sm border border-border bg-background/70 px-2 py-2 text-sm tracking-normal text-foreground"
      />
    </label>
  );
}
