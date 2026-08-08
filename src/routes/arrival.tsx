import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import archHero from "@/assets/frass-gateway-arch.jpg.asset.json";
import squareImg from "@/assets/hill-town-square.jpg";
import kidsImg from "@/assets/district-kids.jpg";
import kicksImg from "@/assets/district-kicks.jpg";
import luxuryImg from "@/assets/district-luxury.jpg";
import studioImg from "@/assets/hill-studio-district.jpg";
import buildersImg from "@/assets/hill-builders-village.jpg";
import farmImg from "@/assets/hill-farm-district.jpg";
import founderImg from "@/assets/hill-founder-hall.jpg";

/**
 * FRASS-0924 — The Arrival Experience (Act II).
 *
 * People do not click into Frass Hill; they journey into it. The camera moves
 * beneath the arch, Frassy narrates, the town's sounds are named as they grow,
 * and the visitor stops at the overlook where the whole town opens before
 * them — pannable, unhurried — before arriving at the Town Plan.
 */

export const Route = createFileRoute("/arrival")({
  head: () => ({
    meta: [
      { title: "The Arrival — Journey Into Frass Hill" },
      {
        name: "description",
        content:
          "Pass beneath the Frass Arch and climb the hill. Hear the dominoes, the music and the children before you see them, then stop at the overlook where the whole town opens before you.",
      },
      { property: "og:title", content: "The Arrival — Journey Into Frass Hill" },
      {
        property: "og:description",
        content: "Every first arrival at Frass Hill is a journey, not a page.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ArrivalPage,
});

const NARRATION: { at: number; line: string; sound?: string }[] = [
  { at: 600, line: "Welcome to Frass Hill.", sound: "A warm breeze through the palms" },
  { at: 4200, line: "This isn't simply a marketplace.", sound: "Dominoes, somewhere ahead" },
  { at: 8000, line: "It's a community built by people.", sound: "Children laughing below the road" },
  { at: 12000, line: "Everything you see has a purpose.", sound: "Music drifting from the studios" },
];

const OVERLOOK = [
  { id: "kicks", glyph: "👟", name: "Frass District", note: "The glowing promenade downhill — storefronts, arch, movement.", img: kicksImg, to: "/frass-district" },
  { id: "luxury", glyph: "✨", name: "Luxury House", note: "Far above everything. Quiet, elegant, almost earned.", img: luxuryImg, to: "/frass-luxury-house" },
  { id: "kids", glyph: "👶", name: "Children's Village", note: "Kites, running, learning. Parents watching. Safe.", img: kidsImg, to: "/kids-world" },
  { id: "studio", glyph: "🎵", name: "Studio District", note: "You hear it before you see it — bass, vocals, rehearsal.", img: studioImg, to: "/frass-hill" },
  { id: "square", glyph: "🏛", name: "Town Square", note: "The civic heart. Kiosk, hall, café, domino yard.", img: squareImg, to: "/for-us" },
  { id: "builders", glyph: "🏗", name: "Builders Village", note: "Wood, steel, blueprints. Craftsmanship, not noise.", img: buildersImg, to: "/frass-hill" },
  { id: "farm", glyph: "🌿", name: "Farm District", note: "Terraces, mist, wind. A completely different rhythm.", img: farmImg, to: "/frass-hill" },
  { id: "founder", glyph: "🏛", name: "Founder Hall", note: "Above everything. Steady. Watching over the town.", img: founderImg, to: "/frass-hill" },
];

type Act = "passing" | "climbing" | "overlook";

function useArrivalTimeline(skip: boolean) {
  const [act, setAct] = useState<Act>(skip ? "overlook" : "passing");
  const [spoken, setSpoken] = useState(0);

  useEffect(() => {
    if (skip) return;
    const timers = [
      ...NARRATION.map((n, i) => setTimeout(() => setSpoken(i + 1), n.at)),
      setTimeout(() => setAct("climbing"), 3000),
      setTimeout(() => setAct("overlook"), 15000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [skip]);

  return { act, spoken, setAct };
}

function ArrivalPage() {
  const navigate = useNavigate();
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    setReduced(!!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
  }, []);
  const { act, spoken, setAct } = useArrivalTimeline(reduced);

  useEffect(() => {
    try {
      sessionStorage.setItem("frass-arrival-seen", "1");
    } catch {
      /* ignore */
    }
  }, []);

  const current = NARRATION[Math.max(0, spoken - 1)];

  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      {/* The camera: the arch pushes past the viewer as the hill opens up. */}
      <div className="fixed inset-0">
        <img
          src={archHero.url}
          alt="Passing beneath the Frass Arch onto the road up the hill"
          className="absolute inset-0 h-full w-full object-cover transition-all duration-[9000ms] ease-[cubic-bezier(0.33,0.6,0.2,1)]"
          style={{
            transform: act === "passing" ? "scale(1.05)" : act === "climbing" ? "scale(1.9)" : "scale(2.6)",
            opacity: act === "overlook" ? 0 : 1,
            filter: act === "climbing" ? "brightness(0.85)" : undefined,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/85" />
      </div>

      {act !== "overlook" && (
        <section className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center">
          <p key={spoken} className="animate-fade-in font-display text-3xl leading-tight sm:text-5xl">
            {current?.line}
          </p>
          {current?.sound && (
            <p className="mt-6 text-[10px] uppercase tracking-[0.35em] text-white/60">{current.sound}</p>
          )}
          <button
            type="button"
            onClick={() => setAct("overlook")}
            className="absolute bottom-10 rounded-full border border-[color:var(--hill-gold)]/60 px-5 py-2 text-[10px] font-bold uppercase tracking-[0.3em] text-[color:var(--hill-gold)] transition hover:bg-[color:var(--hill-gold)]/10"
          >
            Skip to the overlook
          </button>
        </section>
      )}

      {act === "overlook" && <Overlook onArrive={() => navigate({ to: "/frass-hill" })} />}
    </main>
  );
}

function Overlook({ onArrive }: { onArrive: () => void }) {
  const rail = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; left: number } | null>(null);

  const onDown = (e: React.PointerEvent) => {
    if (!rail.current) return;
    drag.current = { x: e.clientX, left: rail.current.scrollLeft };
    rail.current.setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!drag.current || !rail.current) return;
    rail.current.scrollLeft = drag.current.left - (e.clientX - drag.current.x);
  };
  const onUp = () => {
    drag.current = null;
  };

  return (
    <section className="relative min-h-screen animate-fade-in px-0 pb-16 pt-[14vh]">
      <div className="mx-auto max-w-[1400px] px-6 text-center lg:px-12">
        <span className="text-[10px] uppercase tracking-[0.4em] text-[color:var(--hill-gold)]">The first overlook</span>
        <h1 className="mt-4 font-display text-4xl leading-none sm:text-6xl">The whole town, all at once.</h1>
        <p className="mx-auto mt-5 max-w-2xl text-sm text-white/70">
          Take your time. Move your view along the ridge — the district you're drawn to is the one you should walk into first.
        </p>
      </div>

      {/* Pannable panorama */}
      <div
        ref={rail}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        className="mt-10 flex cursor-grab gap-4 overflow-x-auto px-6 pb-6 active:cursor-grabbing lg:px-12 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        aria-label="Panorama of Frass Hill — drag to look along the ridge"
      >
        {OVERLOOK.map((d) => (
          <Link
            key={d.id}
            to={d.to}
            className="group relative h-[46vh] w-[78vw] shrink-0 overflow-hidden rounded-2xl border border-white/15 sm:w-[46vw] lg:w-[32vw]"
          >
            <img
              src={d.img}
              alt={d.name}
              className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.06]"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5 text-left">
              <span className="text-xl">{d.glyph}</span>
              <h2 className="mt-1 font-display text-2xl uppercase leading-none">{d.name}</h2>
              <p className="mt-2 text-xs text-white/70">{d.note}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="mx-auto mt-8 max-w-[1400px] px-6 text-center lg:px-12">
        <p className="text-sm text-white/75">
          Every road leads somewhere. Every place helps someone build something meaningful.
        </p>
        <button
          type="button"
          onClick={onArrive}
          className="mt-6 rounded-full bg-[color:var(--hill-gold)] px-8 py-3 text-[11px] font-bold uppercase tracking-[0.3em] text-black transition hover:opacity-90"
        >
          Arrive at the Town Plan
        </button>
      </div>
    </section>
  );
}
