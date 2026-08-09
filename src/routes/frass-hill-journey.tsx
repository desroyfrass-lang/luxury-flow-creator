// FRASS-0444 — The Frass Hill Walk (optional immersive journey).
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ChevronDown, ChevronUp, DoorOpen, MapPin, X } from "lucide-react";
import { HILL_STOPS, WALK_PRINCIPLE } from "@/lib/hill-journey";
import { HillLife } from "@/components/hill/hill-life";

export const Route = createFileRoute("/frass-hill-journey")({
  head: () => ({
    meta: [
      { title: "The Frass Hill Walk — Enter Frass Hill" },
      {
        name: "description",
        content:
          "Walk through Frass Hill: the Welcome Hall arch, the Children's Village in the valley, Town Square, Studio Street, the overlook, Frass Luxury House and the bridal gardens.",
      },
      { property: "og:title", content: "The Frass Hill Walk" },
      {
        property: "og:description",
        content: "Scroll up the hill and back down again. Every stop opens a real door.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HillWalkPage,
});

function HillWalkPage() {
  const navigate = useNavigate();
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(0);
  const [entered, setEntered] = useState(false);
  const [panelOpen, setPanelOpen] = useState(true);
  const stops = HILL_STOPS;

  // Scroll drives the camera. CSS variables carry the per-frame values so React
  // never re-renders on scroll — only when the visitor reaches a new stop.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    let frame = 0;

    const apply = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      const pos = p * (stops.length - 1);
      stage.style.setProperty("--walk", String(pos));
      const nodes = stage.querySelectorAll<HTMLElement>("[data-scene]");
      nodes.forEach((node, i) => {
        const d = pos - i;
        const near = Math.max(0, 1 - Math.abs(d) * 1.25);
        node.style.opacity = String(near);
        node.style.transform = `scale(${1.06 + d * 0.05}) translate3d(0, ${d * -3}%, 0)`;
        node.style.visibility = near <= 0.001 ? "hidden" : "visible";
      });
      const next = Math.round(pos);
      setActive((prev) => (prev === next ? prev : next));
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(apply);
    };
    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [stops.length]);

  const goToStop = (i: number) => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo({ top: (i / (stops.length - 1)) * max, behavior: "smooth" });
  };

  const stop = stops[active]!;

  return (
    <div className="hill-walk relative bg-black text-white">
      {/* The world itself — fixed behind everything, moved only by scroll. */}
      <div ref={stageRef} className="hill-walk-stage" aria-hidden="true">
        {stops.map((s, i) => (
          <div key={s.id} data-scene className="hill-walk-scene">
            <img
              src={s.image}
              alt=""
              width={1920}
              height={1080}
              loading={i === 0 ? "eager" : "lazy"}
              fetchPriority={i === 0 ? "high" : "low"}
              style={{ objectPosition: s.origin }}
              className="hill-walk-photo"
            />
            <HillLife layers={s.life} />
          </div>
        ))}
        <div className="hill-walk-grade" />
      </div>

      {/* Scroll runway. Each stop gets its own screen of travel. */}
      <div style={{ height: `${stops.length * 120}vh` }} aria-hidden="true" />

      {/* Exits — always available, always visible. */}
      <div className="fixed left-3 top-3 z-50 flex items-center gap-2 sm:left-6 sm:top-6">
        <button
          type="button"
          onClick={() => navigate({ to: "/frass-hill" })}
          className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/55 px-3 py-2 text-[10px] uppercase tracking-[0.22em] text-white backdrop-blur-md transition hover:border-[color:var(--gold)] hover:text-[color:var(--gold)]"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </button>
        <Link
          to="/frass-hill"
          className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/55 px-3 py-2 text-[10px] uppercase tracking-[0.22em] text-white/80 backdrop-blur-md transition hover:text-white"
        >
          <X className="h-3.5 w-3.5" /> Skip the walk
        </Link>
      </div>

      {/* Snakes-and-ladders rail: altitude, top of the hill down to the valley. */}
      <nav
        aria-label="Places on the hill"
        className="fixed right-2 top-1/2 z-40 -translate-y-1/2 sm:right-5"
      >
        <ul className="flex flex-col-reverse gap-2">
          {stops.map((s, i) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => goToStop(i)}
                aria-current={i === active ? "true" : undefined}
                className={`group flex items-center justify-end gap-2 rounded-full py-1 pl-2 pr-1 text-[9px] uppercase tracking-[0.2em] transition ${
                  i === active ? "text-[color:var(--gold)]" : "text-white/45 hover:text-white"
                }`}
              >
                <span className="hidden max-w-[9rem] truncate sm:inline">{s.altitude}</span>
                <span
                  className={`h-2.5 w-2.5 rounded-full border transition ${
                    i === active
                      ? "scale-125 border-[color:var(--gold)] bg-[color:var(--gold)]"
                      : "border-white/40 bg-white/10 group-hover:bg-white/40"
                  }`}
                />
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* The stop you're standing in. */}
      <section className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-3 pb-4 sm:px-6 sm:pb-8">
        <div className="pointer-events-auto mx-auto w-full max-w-3xl rounded-3xl border border-white/12 bg-black/60 p-5 backdrop-blur-xl sm:p-7">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-[color:var(--gold)]">
                <MapPin className="h-3 w-3" /> {stop.eyebrow}
              </p>
              <h1 className="mt-2 font-display text-3xl uppercase leading-none sm:text-5xl">{stop.name}</h1>
            </div>
            <button
              type="button"
              onClick={() => setPanelOpen((v) => !v)}
              aria-expanded={panelOpen}
              className="shrink-0 rounded-full border border-white/20 p-2 text-white/70 transition hover:text-white"
              aria-label={panelOpen ? "Collapse details" : "Expand details"}
            >
              {panelOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </button>
          </div>

          {panelOpen && (
            <>
              <p className="mt-3 text-sm leading-relaxed text-white/75">{stop.line}</p>
              <p className="mt-2 text-xs leading-relaxed text-white/45">{stop.plain}</p>

              <div className="mt-5 grid gap-2 sm:grid-cols-3">
                {stop.doors.map((door) => (
                  <Link
                    key={door.to + door.label}
                    to={door.to as never}
                    className="group rounded-2xl border border-white/12 bg-white/[0.04] p-3 transition hover:border-[color:var(--gold)] hover:bg-white/[0.08]"
                  >
                    <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white">
                      <DoorOpen className="h-3.5 w-3.5 text-[color:var(--gold)]" />
                      {door.label}
                    </span>
                    <span className="mt-1 block text-[11px] leading-snug text-white/50">{door.note}</span>
                  </Link>
                ))}
              </div>
            </>
          )}

          <p className="mt-4 text-[10px] uppercase tracking-[0.22em] text-white/30">
            Scroll up the hill · scroll back down · {WALK_PRINCIPLE}
          </p>
        </div>
      </section>

      {/* The arrival. A few steps forward before the town is revealed. */}
      {!entered && (
        <div className="hill-walk-arrival fixed inset-0 z-[60] flex items-center justify-center bg-black px-6 text-center">
          <div className="hill-walk-arrival-inner max-w-lg">
            <p className="text-[10px] uppercase tracking-[0.4em] text-[color:var(--gold)]">Frass Hill</p>
            <h2 className="mt-4 font-display text-4xl uppercase leading-none sm:text-6xl">
              Take a few steps in
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-white/60">
              This is the walk — the arch, the valley, the square, the hill and the house. It moves when
              you move. You can leave it at any moment and Frass Hill will still be there in plain view.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => setEntered(true)}
                className="rounded-full bg-[color:var(--gold)] px-7 py-3 text-[11px] font-bold uppercase tracking-[0.28em] text-black transition hover:scale-[1.02]"
              >
                Walk in
              </button>
              <Link
                to="/frass-hill"
                className="rounded-full border border-white/25 px-7 py-3 text-[11px] uppercase tracking-[0.28em] text-white/80 transition hover:text-white"
              >
                Use the plain interface
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
