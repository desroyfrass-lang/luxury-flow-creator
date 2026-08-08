import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { GatewayNav } from "@/components/gateway-nav";
import { HillSightlines } from "@/components/hill-sightlines";
import {
  HillHourBand,
  HillHourWash,
  StreetLife,
  DistrictBlends,
  TownMemory,
} from "@/components/hill-movement";
import {
  DISCOVERY_PRINCIPLE,
  MOVEMENT_PRINCIPLE,
  TRANSITION_PRINCIPLE,
  PLACEMAKING_QUESTIONS,
} from "@/lib/frass-hill-movement";
import {
  HILL_DISTRICTS,
  TOWN_PLAN_RULE,
  SIGHTLINE_PRINCIPLE,
  UNIVERSAL_DISTRICT_RULES,
  CROSS_DISTRICT_JOURNEYS,
  BUILDER_TERMINOLOGY,
  sightlinesFrom,
  type HillDistrict,
} from "@/lib/frass-hill";


import squareImg from "@/assets/hill-town-square.jpg";
import kidsImg from "@/assets/district-kids.jpg";
import kicksImg from "@/assets/district-kicks.jpg";
import luxuryImg from "@/assets/district-luxury.jpg";
import studioImg from "@/assets/hill-studio-district.jpg";
import buildersImg from "@/assets/hill-builders-village.jpg";
import farmImg from "@/assets/hill-farm-district.jpg";
import founderImg from "@/assets/hill-founder-hall.jpg";

const IMAGES: Record<string, string> = {
  square: squareImg,
  kids: kidsImg,
  kicks: kicksImg,
  luxury: luxuryImg,
  studio: studioImg,
  builders: buildersImg,
  farm: farmImg,
  founder: founderImg,
};

export const Route = createFileRoute("/frass-hill")({
  head: () => ({
    meta: [
      { title: "Frass Hill — The Town Plan" },
      {
        name: "description",
        content:
          "Frass Hill is a living town of eight places: Town Square, Children's Village, Frass District, Luxury House, Studio District, Builders Village, Farm District and Founder Hall.",
      },
      { property: "og:title", content: "Frass Hill — The Town Plan" },
      {
        property: "og:description",
        content:
          "Eight districts. Every service, academy and office has an address inside one of them.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FrassHillPage,
});

function FrassHillPage() {
  const [openId, setOpenId] = useState<string | null>(null);

  const lookAt = (id: string) => {
    setOpenId(id);
    if (typeof document !== "undefined") {
      document
        .getElementById(`district-${id}`)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };


  return (
    <div className="min-h-screen bg-background">
      <GatewayNav mode="world" />

      <section className="relative overflow-hidden">
        <img
          src={squareImg}
          alt="Frass Hill at dusk — the town square lit by lanterns, café tables, a domino game and a live band"
          width={1280}
          height={960}
          className="h-[52vh] w-full object-cover"
        />
        <HillHourWash />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-[1400px] px-6 pb-8 lg:px-10">
          <span className="text-[10px] uppercase tracking-[0.35em] text-[color:var(--hill-gold)]">
            The town plan
          </span>
          <h1 className="mt-3 font-display text-4xl uppercase leading-[0.95] md:text-7xl">
            Frass Hill
          </h1>
          <p className="mt-4 max-w-2xl text-sm text-muted-foreground">
            Frass Hill is not a menu of features. It is a town. Eight places you can walk between —
            and inside each one, the offices, academies, studios and venues that do the work.
          </p>
          <TownMemory districtId="town_square" className="mt-4" />
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] space-y-4 px-6 pt-8 lg:px-10">
        <p className="border-l-2 border-[color:var(--hill-gold)] pl-4 text-sm italic text-muted-foreground">
          {TOWN_PLAN_RULE}
        </p>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-[color:var(--hill-gold)]/25 bg-card/40 p-5">
            <div className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--hill-gold)]">
              The sightline rule
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{SIGHTLINE_PRINCIPLE}</p>
            <p className="mt-2 text-sm">{DISCOVERY_PRINCIPLE}</p>
            <p className="mt-3 text-xs text-muted-foreground">
              Stand in the square and the whole town is in view. Look around from anywhere:
            </p>
            <HillSightlines districtId="town_square" onLook={lookAt} className="mt-4" />
          </div>

          <div className="space-y-4">
            <HillHourBand />
            <div className="rounded-2xl border border-border/60 bg-card/40 p-5">
              <div className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--hill-gold)]">
                Discovery before destination · FRASS-0911
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{MOVEMENT_PRINCIPLE}</p>
              <p className="mt-2 text-xs italic text-muted-foreground">{TRANSITION_PRINCIPLE}</p>
              <StreetLife districtId="town_square" className="mt-4" />
            </div>
          </div>
        </div>
      </section>


      <section className="mx-auto max-w-[1400px] px-6 py-10 lg:px-10">
        <div className="grid gap-6 lg:grid-cols-2">
          {HILL_DISTRICTS.map((d) => (
            <DistrictCard
              key={d.id}
              district={d}
              open={openId === d.id}
              onToggle={() => setOpenId(openId === d.id ? null : d.id)}
              onLook={lookAt}
            />
          ))}
        </div>
      </section>


      <section className="mx-auto max-w-[1400px] px-6 pb-10 lg:px-10">
        <h2 className="font-display text-2xl uppercase">Walks through town</h2>
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

      <section className="mx-auto max-w-[1400px] px-6 pb-20 lg:px-10">
        <h2 className="font-display text-2xl uppercase">One word, two meanings</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {BUILDER_TERMINOLOGY.map((t) => (
            <div
              key={t.term}
              className="rounded-xl border border-[color:var(--hill-gold)]/25 bg-card/40 p-5"
            >
              <div className="font-display text-lg uppercase">{t.term}</div>
              <p className="mt-2 text-xs text-muted-foreground">{t.meaning}</p>
            </div>
          ))}
        </div>
        <p className="mt-8 max-w-3xl border-l-2 border-[color:var(--hill-gold)] pl-4 text-sm italic text-muted-foreground">
          Frass Hill is a living community where every place exists to help people learn, create,
          connect, contribute, and build a lasting legacy.
        </p>
      </section>
    </div>
  );
}

function DistrictCard({
  district: d,
  open,
  onToggle,
  onLook,
}: {
  district: HillDistrict;
  open: boolean;
  onToggle: () => void;
  onLook: (id: string) => void;
}) {
  return (
    <article
      id={`district-${d.id}`}
      className="group scroll-mt-24 overflow-hidden rounded-[1.75rem] border border-border/60 bg-card/40 transition-colors hover:border-[color:var(--hill-gold)]/40"
    >

      <div className="relative h-56 overflow-hidden md:h-64">
        <img
          src={IMAGES[d.image] ?? squareImg}
          alt={`${d.name} — ${d.feeling}`}
          loading="lazy"
          width={1280}
          height={960}
          className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5">
          <div className="flex items-center gap-2">
            <span className="text-xl">{d.glyph}</span>
            {d.engine && (
              <span className="rounded-full border border-[color:var(--hill-gold)]/50 px-2 py-0.5 text-[9px] uppercase tracking-[0.2em] text-[color:var(--hill-gold)]">
                Economic engine
              </span>
            )}
            <span
              className={`rounded-full px-2 py-0.5 text-[9px] uppercase tracking-[0.2em] ${
                d.status === "open"
                  ? "bg-[color:var(--hill-gold)] text-black"
                  : "bg-white/15 text-white/80"
              }`}
            >
              {d.status === "open" ? "Open" : d.status === "building" ? "Building" : "Planned"}
            </span>
          </div>
          <h2 className="mt-2 font-display text-2xl uppercase leading-none text-white md:text-3xl">
            {d.name}
          </h2>
          <p className="mt-2 max-w-lg text-sm text-white/75">{d.purpose}</p>
        </div>
      </div>

      <div className="p-5">
        <p className="text-xs text-muted-foreground">{d.feeling}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          {d.to && (
            <Link
              to={d.to}
              className="rounded-full bg-[color:var(--hill-gold)] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.22em] text-black transition hover:scale-[1.03]"
            >
              Walk in
            </Link>
          )}
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={open}
            className="rounded-full border border-border px-4 py-2 text-[10px] font-bold uppercase tracking-[0.22em] transition hover:bg-foreground/5"
          >
            {open ? "Close" : `Inside this district · ${d.venues.length}`}
          </button>
        </div>

        {!open && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-[9px] uppercase tracking-[0.24em] text-muted-foreground">
              In view
            </span>
            {sightlinesFrom(d.id).map((v) => (
              <button
                key={v.to}
                type="button"
                onClick={() => onLook(v.to)}
                title={`${v.direction} — ${v.sight}`}
                className="rounded-full border border-border/50 px-2.5 py-1 text-[11px] text-muted-foreground transition hover:border-[color:var(--hill-gold)]/50 hover:text-foreground"
              >
                {v.district.glyph} {v.district.name}
              </button>
            ))}
          </div>
        )}

        <StreetLife districtId={d.id} className="mt-4" />




        {open && (
          <div className="mt-5 space-y-4">
            <div>
              <div className="text-[10px] uppercase tracking-[0.28em] text-[color:var(--hill-gold)]">
                What's inside
              </div>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {d.venues.map((v) => {
                  const body = (
                    <>
                      <span className="block text-sm font-semibold">{v.name}</span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">{v.does}</span>
                    </>
                  );
                  return (
                    <li key={v.name}>
                      {v.to ? (
                        <Link
                          to={v.to}
                          className="block h-full rounded-xl border border-border/60 bg-background/40 p-3 transition hover:border-[color:var(--hill-gold)]/50"
                        >
                          {body}
                        </Link>
                      ) : (
                        <div className="h-full rounded-xl border border-border/40 bg-background/20 p-3">
                          {body}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>

            <dl className="grid gap-3 sm:grid-cols-2">
              <Fact label="Steward" value={d.steward} />
              <Fact label="Who it's for" value={d.audience} />
              <Fact label="Why you return tomorrow" value={d.daily} />
              <Fact label="Through the year" value={d.seasonal} />
              <Fact label="What it gives the town" value={d.contribution} />
              <Fact label="Legacy" value={d.legacy} />
            </dl>

            <div>
              <div className="text-[10px] uppercase tracking-[0.28em] text-[color:var(--hill-gold)]">
                You can walk to
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {d.connected.map((c) => (
                  <span
                    key={c}
                    className="rounded-full border border-border/60 px-3 py-1 text-xs text-muted-foreground"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>

            <HillSightlines districtId={d.id} onLook={onLook} />

            <DistrictBlends districtId={d.id} />




            <p className="border-l-2 border-[color:var(--hill-gold)] pl-3 text-xs italic text-muted-foreground">
              {d.success}
            </p>
          </div>
        )}
      </div>
    </article>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/40 bg-background/20 p-3">
      <dt className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-xs">{value}</dd>
    </div>
  );
}
