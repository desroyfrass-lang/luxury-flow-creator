import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { GatewayNav } from "@/components/gateway-nav";
import {
  HILL_DISTRICTS,
  UNIVERSAL_DISTRICT_RULES,
  CROSS_DISTRICT_JOURNEYS,
  BUILDER_TERMINOLOGY,
  type HillDistrict,
} from "@/lib/frass-hill";

export const Route = createFileRoute("/frass-hill")({
  head: () => ({
    meta: [
      { title: "Frass Hill — District Functional Architecture" },
      {
        name: "description",
        content:
          "What actually happens in every district of Frass Hill: purpose, functions, stewards and connected systems — from Children's Village to the Builders Village and DJ District.",
      },
      { property: "og:title", content: "Frass Hill — District Functional Architecture" },
      {
        property: "og:description",
        content:
          "Twelve districts, each with an emotional identity and a functional purpose. Every district answers one question: what happens here?",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FrassHillPage,
});

function FrassHillPage() {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <GatewayNav mode="world" />

      <section className="mx-auto max-w-[1400px] px-6 pt-12 lg:px-10">
        <span className="text-[10px] uppercase tracking-[0.35em] text-[color:var(--hill-gold)]">
          FRASS-0910 · District Functional Architecture
        </span>
        <h1 className="mt-3 font-display text-4xl uppercase leading-[0.95] md:text-6xl">
          What happens here.
        </h1>
        <p className="mt-4 max-w-2xl text-sm text-muted-foreground">
          Districts are not decorative. Every one of them is a living environment where members
          accomplish real work. Every district has a purpose. Every purpose creates opportunity.
          Every opportunity strengthens the community.
        </p>
      </section>

      <section className="mx-auto max-w-[1400px] px-6 py-10 lg:px-10">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {HILL_DISTRICTS.map((d) => (
            <DistrictCard
              key={d.id}
              district={d}
              open={openId === d.id}
              onToggle={() => setOpenId(openId === d.id ? null : d.id)}
            />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-6 pb-10 lg:px-10">
        <h2 className="font-display text-2xl uppercase">Universal district rules</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          A district is incomplete until it answers all eight.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {UNIVERSAL_DISTRICT_RULES.map((r, i) => (
            <div key={r.key} className="rounded-xl border border-border/60 bg-card/40 p-4">
              <div className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--hill-gold)]">
                {String(i + 1).padStart(2, "0")}
              </div>
              <div className="mt-2 text-sm font-semibold">{r.label}</div>
              <p className="mt-1 text-xs text-muted-foreground">{r.question}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-6 pb-10 lg:px-10">
        <h2 className="font-display text-2xl uppercase">Cross-district journeys</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Districts should never feel isolated. Every journey should feel intentional.
        </p>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {CROSS_DISTRICT_JOURNEYS.map((j) => (
            <div key={j.label} className="rounded-xl border border-border/60 bg-card/40 p-5">
              <div className="text-sm font-semibold">{j.label}</div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {j.path.map((step, i) => (
                  <span key={step} className="flex items-center gap-2">
                    <span className="rounded-full border border-[color:var(--hill-gold)]/30 px-3 py-1 text-xs">
                      {step}
                    </span>
                    {i < j.path.length - 1 && (
                      <span className="text-[color:var(--hill-gold)]">→</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-6 pb-20 lg:px-10">
        <h2 className="font-display text-2xl uppercase">One word, two meanings</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          From FRASS-0910 forward, the word "Builder" is never used alone.
        </p>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {BUILDER_TERMINOLOGY.map((t) => (
            <div key={t.term} className="rounded-xl border border-[color:var(--hill-gold)]/25 bg-card/40 p-5">
              <div className="font-display text-lg uppercase">{t.term}</div>
              <p className="mt-2 text-xs text-muted-foreground">{t.meaning}</p>
            </div>
          ))}
        </div>
        <p className="mt-8 max-w-3xl border-l-2 border-[color:var(--hill-gold)] pl-4 text-sm italic text-muted-foreground">
          Frass Hill is not a collection of features. It is a living community where every district
          exists to help people learn, create, connect, contribute, and build a lasting legacy.
        </p>
      </section>
    </div>
  );
}

function DistrictCard({
  district: d,
  open,
  onToggle,
}: {
  district: HillDistrict;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <article className="flex flex-col rounded-2xl border border-border/60 bg-card/40 p-5 transition-colors hover:border-[color:var(--hill-gold)]/40">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-xl uppercase leading-tight">{d.name}</h3>
        <span
          className={`shrink-0 rounded-full px-2 py-1 text-[10px] uppercase tracking-[0.2em] ${
            d.status === "open"
              ? "bg-[color:var(--hill-gold)]/15 text-[color:var(--hill-gold)]"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {d.status === "open" ? "Open" : d.status === "building" ? "Building" : "Planned"}
        </span>
      </div>

      {d.engine && (
        <span className="mt-2 w-fit rounded-full border border-[color:var(--hill-gold)]/40 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-[color:var(--hill-gold)]">
          Economic engine
        </span>
      )}

      <p className="mt-3 text-sm text-muted-foreground">{d.purpose}</p>

      <dl className="mt-4 space-y-2 text-xs">
        <Row label="Feels like" value={d.feeling} />
        <Row label="Steward" value={`Frassy as ${d.steward}`} />
      </dl>

      {open && (
        <div className="mt-4 space-y-4 border-t border-border/60 pt-4 text-xs">
          <div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-[color:var(--hill-gold)]">
              What people do here
            </div>
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {d.functions.map((f) => (
                <li key={f} className="rounded-md bg-muted/60 px-2 py-1 text-muted-foreground">
                  {f}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-[color:var(--hill-gold)]">
              Connected systems
            </div>
            <p className="mt-1 text-muted-foreground">{d.connected.join(" · ")}</p>
          </div>
          <dl className="space-y-2">
            <Row label="Audience" value={d.audience} />
            <Row label="Daily reason to return" value={d.daily} />
            <Row label="Seasonal evolution" value={d.seasonal} />
            <Row label="Community contribution" value={d.contribution} />
            <Row label="Legacy" value={d.legacy} />
            <Row label="Success measure" value={d.success} />
          </dl>
        </div>
      )}

      <div className="mt-5 flex items-center gap-3 pt-1">
        <button
          type="button"
          onClick={onToggle}
          className="rounded-full border border-border px-3 py-1.5 text-xs uppercase tracking-[0.2em] hover:border-[color:var(--hill-gold)]/50"
        >
          {open ? "Less" : "Full brief"}
        </button>
        {d.to && (
          <Link
            to={d.to}
            className="text-xs uppercase tracking-[0.2em] text-[color:var(--hill-gold)] hover:underline"
          >
            Enter →
          </Link>
        )}
      </div>
    </article>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground/70">{label}</dt>
      <dd className="text-muted-foreground">{value}</dd>
    </div>
  );
}
