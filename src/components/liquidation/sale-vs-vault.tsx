import { Check } from "lucide-react";

const SALE = [
  "Current collections",
  "Temporary discounts",
  "Seasonal promotions",
  "May return to regular pricing",
];

const VAULT = [
  "Final markdowns",
  "Lowest available prices",
  "Extremely limited inventory",
  "No restocks",
  "Once sold, they're gone forever",
];

function Panel({
  label,
  items,
  tone,
}: {
  label: string;
  items: string[];
  tone: "gold" | "vault";
}) {
  return (
    <div
      className={`rounded-2xl border p-6 md:p-8 backdrop-blur-sm ${
        tone === "gold"
          ? "border-[color:var(--gold)]/30 bg-[color-mix(in_oklab,var(--foreground)_5%,transparent)]"
          : "border-[color:var(--gold)]/15 bg-[color-mix(in_oklab,var(--foreground)_12%,transparent)]"
      }`}
    >
      <h3 className="font-display text-xl uppercase tracking-[0.24em] text-[color:var(--gold)] md:text-2xl">
        {label}
      </h3>
      <ul className="mt-5 space-y-3">
        {items.map((i) => (
          <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--gold)]" />
            <span>{i}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SaleVsVault() {
  return (
    <section className="mx-auto max-w-[1200px] px-4 py-14 md:px-12 md:py-20">
      <p className="text-center text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
        Know the difference
      </p>
      <h2 className="mt-3 text-center font-display text-2xl uppercase tracking-[0.16em] md:text-4xl">
        Sale &amp; Clearance
      </h2>
      <div className="mt-10 grid gap-5 md:grid-cols-2 md:gap-8">
        <Panel label="Sale" items={SALE} tone="gold" />
        <Panel label="Clearance" items={VAULT} tone="vault" />
      </div>
    </section>
  );
}
