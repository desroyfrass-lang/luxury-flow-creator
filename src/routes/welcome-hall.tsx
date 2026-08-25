import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Volume2, VolumeX } from "lucide-react";
import gateway from "@/assets/welcome-hall-gateway.jpg";
import valley from "@/assets/kids-valley.jpg";
import { ambienceEnabled, setAmbienceEnabled, startAmbience, stopAmbience } from "@/lib/for-us-ambience";
import { unlockAudio } from "@/lib/audio-unlock";
import { AgreementGate } from "@/components/legal/agreement-gate";
import { supabase } from "@/integrations/supabase/client";
import { onboardingDestination } from "@/lib/navigation/core-routes";
import { ViewModeToggle } from "@/components/view-mode/view-mode-toggle";
import { DailyWelcomeCeremony } from "@/components/welcome-hall/daily-welcome-ceremony";
import { WELCOME_HALL_PURPOSES } from "@/lib/welcome-hall/daily-welcome";
import { FirstArrivalCeremony } from "@/components/welcome-hall/first-arrival-ceremony";


/**
 * FRASS-0423 — Welcome Hall.
 *
 * Welcome Hall is NOT Town Square. It is the registration and arrival gateway
 * into Frass Hill: where a visitor learns what this place is, meets Frassy,
 * registers, and chooses their entrance — Frass Hill or Kids Valley.
 */
export const Route = createFileRoute("/welcome-hall")({
  validateSearch: (
    search: Record<string, unknown>,
  ): { welcome?: "daily"; arrival?: "first"; next?: string } => ({
    ...(search["welcome"] === "daily" ? { welcome: "daily" as const } : {}),
    ...(search["arrival"] === "first" ? { arrival: "first" as const } : {}),
    ...(typeof search["next"] === "string" && search["next"].startsWith("/")
      ? { next: search["next"] }
      : {}),
  }),
  head: () => ({
    meta: [
      { title: "Welcome Hall — Arrive at Frass Hill" },
      {
        name: "description",
        content:
          "The arrival gateway to Frass Hill. Register, meet Frassy, and choose your entrance — the main community of Frass Hill, or the peaceful route through Kids Valley.",
      },
      { property: "og:title", content: "Welcome Hall — Arrive at Frass Hill" },
      {
        property: "og:description",
        content: "Register at the gates, meet Frassy, then walk into Frass Hill or Kids Valley.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://frasskicks.com/welcome-hall" }],
  }),
  component: WelcomeHallPage,
});

const WHAT_THIS_IS = [
  {
    glyph: "🏘",
    title: "Frass Hill is a town, not a menu",
    line: "Nine places sit on the Hill — a retail district, a luxury house, studios, a farm, a wellness centre, a builders village, Founder Hall, Town Square and the children's valley.",
  },
  {
    glyph: "🤝",
    title: "Frassy meets you at the gate",
    line: "She is the host of the Hill. She remembers what you're building, explains anything twice, and never lets a stranger talk you out of your own money.",
  },
  {
    glyph: "🗝",
    title: "You register once",
    line: "Registration gives you a For Me page, a Builder Vault, and a seat in the community. Nothing here is anonymous, and nothing here is sold about you.",
  },
];

const ARRIVAL_SIGHTLINES = [
  { name: "Frass District", line: "The retail heart, down below the gates.", to: "/frass-district" },
  { name: "Frass Luxury House", line: "The private estate up on the hill.", to: "/frass-luxury-house" },
  { name: "Studio District", line: "FV Studios, in the distance.", to: "/studio" },
  { name: "Builders Village", line: "Where the work gets made in public.", to: "/academy" },
  { name: "Health & Wellness Centre", line: "The mountain sanctuary.", to: "/health-wellness" },
  { name: "Farm District", line: "Fields and market days.", to: "/frass-hill" },
  { name: "Founder Hall", line: "Governance and the record of the Hill.", to: "/frass-hill" },
  { name: "Town Square", line: "The civic heart — everyone's experience.", to: "/town-square" },
];

/** What you glimpse down the hill as the gates part — FRASS-0423 Amendment 2. */
const GLIMPSES = [
  { glyph: "✨", name: "Luxury House" },
  { glyph: "🎬", name: "Studio District" },
  { glyph: "🏛", name: "Founder Hall" },
  { glyph: "🏗", name: "Builders Village" },
  { glyph: "🌿", name: "Farm District" },
  { glyph: "🎵", name: "Music from the Studio" },
  { glyph: "👟", name: "Frass District, glowing below" },
  { glyph: "🌈", name: "Children laughing in Kids Valley" },
];

/** The arrival unfolds: gates part → the hill appears → Frassy speaks → the roads open. */
function useArrivalStage() {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setStage(3);
      return;
    }
    const timers = [
      setTimeout(() => setStage(1), 900),
      setTimeout(() => setStage(2), 3400),
      setTimeout(() => setStage(3), 6200),
    ];
    const skip = () => {
      timers.forEach(clearTimeout);
      setStage(3);
    };
    window.addEventListener("frass-arrival-skip", skip);
    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener("frass-arrival-skip", skip);
    };
  }, []);

  return stage;
}

function WelcomeHallPage() {
  const stage = useArrivalStage();
  const search = Route.useSearch();
  const [sound, setSound] = useState(false);


  useEffect(() => {
    setSound(ambienceEnabled());
  }, []);

  const toggleSound = () => {
    const next = !sound;
    setSound(next);
    setAmbienceEnabled(next);
    if (next) {
      // This click is the browser-approved gesture for all Welcome Hall audio.
      // It starts the environment and asks the one shared Frassy surface to
      // deliver her greeting; no page-specific chat or speech player is made.
      unlockAudio();
      startAmbience();
      window.dispatchEvent(new Event("frassy-voice-enable"));
    }
    else stopAmbience();
  };

  useEffect(() => () => stopAmbience(), []);

  const open = stage >= 1;

  // Legacy Route Consolidation — the First Arrival ceremony (formerly /welcome)
  // is now an arrival state of the Hall. It plays once, on its own, and then
  // the Hall itself opens behind it.
  if (search.arrival === "first") {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <ViewModeToggle className="fixed right-4 top-4 z-40" />
        <FirstArrivalCeremony {...(search.next ? { next: search.next } : {})} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* FRASS-0517 — choose how Frass feels before you even begin. */}
      <ViewModeToggle className="fixed right-4 top-4 z-40" />


      {/* FRASS-0569 — 🌅 Welcome Hall One. Frassy greets first; the Daily follows. */}
      {search.welcome === "daily" && (
        <div className="mx-auto max-w-[1100px] px-6 pt-24 lg:px-10">
          <DailyWelcomeCeremony next={search.next ?? "/room"} />
        </div>
      )}
      {/* The gates */}
      <header
        className="relative min-h-[86vh] overflow-hidden"
        onClick={() => window.dispatchEvent(new Event("frass-arrival-skip"))}
      >
        <img
          src={gateway}
          alt="Visitors walking through the stone arrival gates of a Caribbean hill town at golden hour"
          width={1600}
          height={912}
          className={`hero-drift absolute inset-0 h-full w-full object-cover transition-all duration-[2600ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
            open ? "scale-100 blur-0 brightness-100" : "scale-110 blur-sm brightness-[0.55]"
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/30" />

        {/* Two gate panels, slowly parting */}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 w-1/2 border-r border-[color:var(--hill-gold)]/30 bg-[#07090a] transition-transform duration-[3200ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ transform: open ? "translateX(-101%)" : "translateX(0)" }}
          />
          <div
            className="absolute inset-y-0 right-0 w-1/2 border-l border-[color:var(--hill-gold)]/30 bg-[#07090a] transition-transform duration-[3200ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ transform: open ? "translateX(101%)" : "translateX(0)" }}
          />
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleSound();
          }}
          aria-label={sound ? "Turn off the sounds of Frass Hill" : "Hear the sounds of Frass Hill"}
          className="absolute right-5 top-5 z-10 inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/60 px-4 py-2 text-[10px] uppercase tracking-[0.25em] text-muted-foreground backdrop-blur transition hover:text-foreground"
        >
          {sound ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
          {sound ? "Sound on" : "Hear the Hill"}
        </button>

        <div className="relative mx-auto flex min-h-[86vh] max-w-[1200px] flex-col justify-end px-6 pb-16 pt-24 lg:px-10">
          <p
            className={`text-[10px] uppercase tracking-[0.4em] text-muted-foreground transition-opacity duration-1000 ${
              open ? "opacity-100" : "opacity-0"
            }`}
          >
            The gates of Frass Hill
          </p>
          <h1
            className={`mt-4 text-5xl font-black uppercase leading-[0.95] tracking-tight transition-all duration-1000 md:text-7xl ${
              open ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
          >
            Welcome Hall
          </h1>

          {/* What you see down the hill, arriving one by one */}
          <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
            {GLIMPSES.map((g, i) => (
              <li
                key={g.name}
                className={`text-xs text-muted-foreground transition-all duration-[1200ms] ${
                  open ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
                }`}
                style={{ transitionDelay: `${900 + i * 220}ms` }}
              >
                <span aria-hidden className="mr-1.5">
                  {g.glyph}
                </span>
                {g.name}
              </li>
            ))}
          </ul>

          {/* Frassy, once */}
          <p
            className={`mt-8 max-w-2xl text-base leading-relaxed text-foreground/90 transition-all duration-1000 md:text-lg ${
              stage >= 2 ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
            }`}
            aria-live="polite"
          >
            “Welcome to Frass Hill. This isn't just somewhere you visit. It's somewhere you belong.”
            <span className="mt-1 block text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              Frassy, host of the Hill
            </span>
          </p>

          {/* FRASS-0513 — The Welcome Hall owns onboarding. One prominent action,
              always visible, no URL knowledge required. */}
          <div
            className={`mt-9 transition-all duration-1000 ${
              stage >= 3 ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
            }`}
          >
            <StartMyJourney />
          </div>

          <div
            className={`mt-6 grid gap-4 transition-all duration-1000 sm:grid-cols-2 lg:max-w-3xl ${
              stage >= 3 ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
            }`}
          >
            <Link
              to="/auth"
              search={{ next: "/frass-hill" }}
              className="chrome-glow group rounded-2xl border border-border bg-card/70 p-6 transition hover:scale-[1.01]"
            >
              <span aria-hidden className="text-3xl">
                🌄
              </span>
              <h2 className="mt-4 text-xl font-black uppercase tracking-tight">Enter Frass Hill</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                The main community — Town Square, the districts, the shops, the studios and the
                people who live here.
              </p>
              <span className="mt-5 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-muted-foreground transition group-hover:text-foreground">
                Register and walk in <ArrowRight className="h-3 w-3" />
              </span>
            </Link>

            <Link
              to="/kids-valley"
              className="chrome-glow group rounded-2xl border border-border bg-card/70 p-6 transition hover:scale-[1.01]"
            >
              <span aria-hidden className="text-3xl">
                👶
              </span>
              <h2 className="mt-4 text-xl font-black uppercase tracking-tight">Enter Kids Valley</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                The children's entrance. Kids never come in through Town Square — they walk down the
                valley into Children's Village.
              </p>
              <span className="mt-5 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-muted-foreground transition group-hover:text-foreground">
                Take the valley road <ArrowRight className="h-3 w-3" />
              </span>
            </Link>
          </div>

          <p className="mt-6 text-xs text-muted-foreground">
            Already registered?{" "}
            <Link to="/builder-hall" className="underline">
              Go to your Builder Hall
            </Link>{" "}
            or{" "}
            <Link to="/town-square" className="underline">
              straight to Town Square
            </Link>
            .
          </p>
        </div>
      </header>


      <main className="mx-auto max-w-[1200px] px-6 pb-24 lg:px-10">
        {/* FRASS-0569 — the Welcome Hall serves three different people. */}
        <section className="mt-14">
          <h2 className="text-xl font-black uppercase tracking-tight md:text-2xl">
            Three ways through this Hall
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {WELCOME_HALL_PURPOSES.map((p) => (
              <article key={p.id} className="rounded-2xl border border-border/70 bg-card/50 p-6">
                <span aria-hidden className="text-2xl">{p.glyph}</span>
                <h3 className="mt-4 text-base font-bold">{p.title}</h3>
                <p className="mt-1 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{p.when}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.line}</p>
              </article>
            ))}
          </div>
          <p className="mt-4 max-w-2xl text-xs leading-relaxed text-muted-foreground">
            Here's what that means: the Daily is your desk. This Hall is the front door. You always
            come through the door first — you may walk straight past the welcome, but Frass will
            never skip it for you.
          </p>
        </section>

        <section className="mt-14">
          <h2 className="text-xl font-black uppercase tracking-tight md:text-2xl">
            What you're walking into
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {WHAT_THIS_IS.map((c) => (
              <article key={c.title} className="rounded-2xl border border-border/70 bg-card/50 p-6">
                <span aria-hidden className="text-2xl">
                  {c.glyph}
                </span>
                <h3 className="mt-4 text-base font-bold">{c.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.line}</p>
              </article>
            ))}
          </div>
        </section>

        {/* FRASS-0499 — trust begins before the first step */}
        <section className="mt-16">
          <h2 className="text-xl font-black uppercase tracking-tight md:text-2xl">
            Before you build with us
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Two agreements govern the whole of Frass. Shoppers accept the Visitor Agreement. Anyone entering
            Frass Hill to build accepts the Builder Agreement as well. Both are written in everyday language first.
          </p>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <AgreementGate level="visitor" />
            <AgreementGate level="builder" />
          </div>
        </section>



        {/* Sightlines — every building visible before it is visited */}
        <section className="mt-16">
          <h2 className="text-xl font-black uppercase tracking-tight md:text-2xl">
            From the gate, you can already see
          </h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {ARRIVAL_SIGHTLINES.map((s) => (
              <Link
                key={s.name}
                to={s.to}
                className="chrome-glow group rounded-xl border border-border/70 bg-card/40 p-4 transition hover:scale-[1.01]"
              >
                <h3 className="text-sm font-bold">{s.name}</h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{s.line}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* The children's road */}
        <section className="mt-16 overflow-hidden rounded-[2rem] border border-border/70">
          <div className="grid md:grid-cols-2">
            <img
              src={valley}
              alt="A green Jamaican valley path winding beside a river in morning light"
              width={1600}
              height={912}
              loading="lazy"
              className="h-full w-full object-cover"
            />
            <div className="bg-card/50 p-8 lg:p-12">
              <p className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
                The children's road
              </p>
              <h2 className="mt-3 text-2xl font-black uppercase tracking-tight md:text-3xl">
                Kids Valley
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                Children take a different road entirely: Welcome Hall → Kids Valley → Children's
                Village → Discovery Village → Young Builders Quarter, and one day, when they're
                ready, into Frass Hill itself. They grow into the community rather than starting in
                the middle of it.
              </p>
              <Link
                to="/kids-valley"
                className="chrome-glow mt-7 inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.25em] transition hover:scale-[1.02]"
              >
                Walk down the valley <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </section>

        <p className="mt-14 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          <strong className="text-foreground">Let's break it down:</strong> most sites
          drop you on a home page with a menu. Frass Hill has a front gate. You stand at it, look out
          over the town, decide which road you want, and then walk in — the same way you'd arrive
          somewhere real.
        </p>
      </main>
    </div>
  );
}

/**
 * FRASS-0513 — the single onboarding action of the Welcome Hall.
 * Signed in → straight into onboarding with Frassy. Signed out → sign in and
 * come right back to it. The member never sees or types a path either way.
 */
function StartMyJourney() {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  useEffect(() => {
    let alive = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (alive) setSignedIn(!!data.session);
    });
    return () => {
      alive = false;
    };
  }, []);

  const href = onboardingDestination(signedIn === true);

  return (
    <div className="rounded-2xl border border-[color:var(--hill-gold)]/50 bg-card/70 p-6 lg:max-w-3xl">
      <p className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
        New here? Start with Frassy
      </p>
      <h2 className="mt-3 text-2xl font-black uppercase tracking-tight md:text-3xl">
        Start my journey
      </h2>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
        Frassy sits down with you, learns what you're building, and sets up your first days on the
        Hill. It's a conversation, not a form.
      </p>
      <a
        href={href}
        data-frass-onboarding-cta
        className="lux-press mt-5 inline-flex items-center gap-2 rounded-sm border border-[color:var(--hill-gold)] bg-[color:var(--hill-gold)] px-7 py-3.5 text-[11px] font-bold uppercase tracking-[0.3em] text-[color:var(--ink)]"
      >
        🚀 Start my journey <ArrowRight className="h-3.5 w-3.5" />
      </a>
      <p className="mt-3 text-xs text-muted-foreground">
        {signedIn === false
          ? "You'll sign in first — then Frassy picks up exactly here."
          : "Here's the practical version: one button. Frassy takes you the rest of the way."}
      </p>
    </div>
  );
}
