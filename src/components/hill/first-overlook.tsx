import { Link } from "@tanstack/react-router";
import { useRef } from "react";
import squareImg from "@/assets/hill-town-square.jpg";
import kidsImg from "@/assets/district-kids.jpg";
import kicksImg from "@/assets/district-kicks.jpg";
import luxuryImg from "@/assets/district-luxury.jpg";
import studioImg from "@/assets/hill-studio-district.jpg";
import buildersImg from "@/assets/hill-builders-village.jpg";
import farmImg from "@/assets/hill-farm-district.jpg";
import founderImg from "@/assets/hill-founder-hall.jpg";

/**
 * FRASS-0924 (recovered from /arrival) — the first overlook: the whole town,
 * pannable by drag or touch. Districts without their own page open their
 * place on this town plan instead of an invented address.
 */
type Stop = { id: string; glyph: string; name: string; note: string; img: string } & (
  | { to: "/frass-district" | "/frass-luxury-house" | "/kids-world" | "/town-square" | "/control-room" }
  | { anchor: string }
);

const STOPS: Stop[] = [
  { id: "kicks", glyph: "👟", name: "Frass District", note: "The glowing promenade downhill — storefronts, arch, movement.", img: kicksImg, to: "/frass-district" },
  { id: "luxury", glyph: "✨", name: "Luxury House", note: "Far above everything. Quiet, elegant, almost earned.", img: luxuryImg, to: "/frass-luxury-house" },
  { id: "kids", glyph: "👶", name: "Children's Village", note: "Kites, running, learning. Parents watching. Safe.", img: kidsImg, to: "/kids-world" },
  { id: "studio", glyph: "🎵", name: "Studio District", note: "You hear it before you see it — bass, vocals, rehearsal.", img: studioImg, anchor: "studio_district" },
  { id: "square", glyph: "🏛", name: "Town Square", note: "The civic heart. Kiosk, hall, café, domino yard.", img: squareImg, to: "/town-square" },
  { id: "builders", glyph: "🏗", name: "Builders Village", note: "Wood, steel, blueprints. Craftsmanship, not noise.", img: buildersImg, anchor: "builders_village" },
  { id: "farm", glyph: "🌿", name: "Farm District", note: "Terraces, mist, wind. A completely different rhythm.", img: farmImg, anchor: "farm_district" },
  { id: "founder", glyph: "🏛", name: "Founder Hall", note: "Above everything. Steady. Watching over the town.", img: founderImg, to: "/control-room" },
];

export function FirstOverlook({ onLook }: { onLook: (districtId: string) => void }) {
  const rail = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null);

  const onDown = (e: React.PointerEvent) => {
    if (!rail.current || e.pointerType !== "mouse") return; // touch uses native scroll
    drag.current = { x: e.clientX, left: rail.current.scrollLeft, moved: false };
  };
  const onMove = (e: React.PointerEvent) => {
    if (!drag.current || !rail.current) return;
    const dx = e.clientX - drag.current.x;
    if (Math.abs(dx) > 4) drag.current.moved = true;
    rail.current.scrollLeft = drag.current.left - dx;
  };
  const onUp = () => {
    setTimeout(() => (drag.current = null), 0);
  };
  const blockClickAfterDrag = (e: React.MouseEvent) => {
    if (drag.current?.moved) e.preventDefault();
  };

  const cardClass =
    "group relative block h-[46vh] w-[78vw] shrink-0 snap-start overflow-hidden rounded-2xl border border-white/15 text-left text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[color:var(--hill-gold)] sm:w-[46vw] lg:w-[32vw]";

  const body = (s: Stop) => (
    <>
      <img src={s.img} alt={s.name} draggable={false} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.06]" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-5">
        <span className="text-xl" aria-hidden="true">{s.glyph}</span>
        <h3 className="mt-1 font-display text-2xl uppercase leading-none">{s.name}</h3>
        <p className="mt-2 text-xs text-white/75">{s.note}</p>
      </div>
    </>
  );

  return (
    <section className="bg-black py-12 text-white" aria-labelledby="first-overlook-title" data-testid="first-overlook">
      <div className="mx-auto max-w-[1400px] px-6 text-center lg:px-12">
        <span className="text-[10px] uppercase tracking-[0.4em] text-[color:var(--hill-gold)]">The first overlook</span>
        <h2 id="first-overlook-title" className="mt-4 font-display text-4xl leading-none sm:text-6xl">The whole town, all at once.</h2>
        <p className="mx-auto mt-5 max-w-2xl text-sm text-white/70">
          Take your time. Move your view along the ridge — the district you're drawn to is the one you should walk into first.
        </p>
      </div>
      <div
        ref={rail}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onPointerLeave={onUp}
        className="mt-10 flex cursor-grab snap-x gap-4 overflow-x-auto px-6 pb-6 active:cursor-grabbing lg:px-12 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        aria-label="Panorama of Frass Hill — drag or swipe to look along the ridge"
        data-testid="overlook-rail"
      >
        {STOPS.map((s) =>
          "to" in s ? (
            <Link key={s.id} to={s.to} onClick={blockClickAfterDrag} draggable={false} className={cardClass}>
              {body(s)}
            </Link>
          ) : (
            <button
              key={s.id}
              type="button"
              onClick={(e) => {
                blockClickAfterDrag(e);
                if (!e.defaultPrevented) onLook(s.anchor);
              }}
              className={cardClass}
            >
              {body(s)}
            </button>
          ),
        )}
      </div>
      <p className="mx-auto mt-4 max-w-[1400px] px-6 text-center text-sm text-white/75 lg:px-12">
        Every road leads somewhere. Every place helps someone build something meaningful.
      </p>
    </section>
  );
}
