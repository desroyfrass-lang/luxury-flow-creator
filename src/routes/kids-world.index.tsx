import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PageFeedback } from "@/components/page-feedback";
import { PassportGate } from "@/components/kids-world/passport-gate";
import { KIDS_WORLDS, KIDS_WORLD_HERO } from "@/lib/kids-world";
import { useKidsPassport } from "@/lib/kids-passport";

const TITLE = "FRASS Kids World — A Caribbean Village Built for Children";
const DESCRIPTION =
  "Kids World is a district of Frass Hill: learning villages, creative studios, music gardens and young-builder spaces for ages 0–3 through 12+, with a parent-issued passport.";

export const Route = createFileRoute("/kids-world/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: KidsWorldHome,
});

function KidsWorldHome() {
  const { passport, ready, canVisit } = useKidsPassport();
  const navigate = useNavigate();

  return (
    <>
      <section className="relative h-[62vh] min-h-[430px] w-full overflow-hidden">
        <img
          src={KIDS_WORLD_HERO}
          alt="A Caribbean children's valley with treehouses, bridges, a playground and a steel-pan music garden"
          width={1920}
          height={1088}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_top,oklch(0.98_0.02_95/0.95),oklch(0.98_0.02_95/0.05)_62%)]" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-[1600px] px-6 pb-12 lg:px-12">
          <span className="text-[10px] uppercase tracking-[0.42em] text-primary">
            A district of Frass Hill
          </span>
          <h1 className="mt-4 font-display text-5xl uppercase leading-[0.88] text-foreground md:text-8xl">
            Kids World
          </h1>
          <p className="mt-5 max-w-2xl text-sm text-foreground/75 md:text-lg">
            A valley of hills, streams and bridges where children learn, play, create
            and discover. Not a game. Not a classroom. A place.
          </p>
        </div>
      </section>

      {/* Passport */}
      <section className="mx-auto max-w-[1600px] px-6 py-14 lg:px-12">
        {ready && passport ? (
          <div className="flex flex-wrap items-center justify-between gap-6 rounded-[2rem] border border-primary/30 bg-card/70 p-7 backdrop-blur-xl">
            <div>
              <p className="text-[10px] uppercase tracking-[0.38em] text-primary">
                Passport ready
              </p>
              <h2 className="mt-2 font-display text-2xl uppercase md:text-3xl">
                {passport.childName ? `${passport.childName}'s passport` : "Kids World Passport"}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Ages {KIDS_WORLDS.find((w) => w.slug === passport.age)?.ageLabel} ·{" "}
                {passport.locked ? "Safe Exploration Mode on" : "Free exploration"}
                {passport.pin ? " · PIN protected" : ""}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/kids-world/$age"
                params={{ age: passport.age }}
                className="rounded-full bg-primary px-7 py-3 text-sm font-bold text-primary-foreground"
              >
                Enter the world
              </Link>
              <Link
                to="/kids-world/parents"
                className="rounded-full border border-border px-7 py-3 text-[11px] font-bold uppercase tracking-[0.26em]"
              >
                Parent Dashboard
              </Link>
            </div>
          </div>
        ) : (
          <PassportGate onIssued={(age) => navigate({ to: "/kids-world/$age", params: { age } })} />
        )}
      </section>

      {/* The worlds */}
      <section className="mx-auto max-w-[1600px] px-6 pb-20 lg:px-12">
        <header className="mb-8 max-w-2xl">
          <p className="text-[10px] uppercase tracking-[0.38em] text-primary">
            Four worlds, one valley
          </p>
          <h2 className="mt-3 font-display text-3xl uppercase md:text-5xl">
            Every age has its own place
          </h2>
        </header>
        <div className="grid gap-6 md:grid-cols-2">
          {KIDS_WORLDS.map((w) => {
            const allowed = canVisit(w.slug);
            const card = (
              <div className="relative overflow-hidden rounded-[2rem] border border-border bg-card">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img
                    src={w.image}
                    alt={`${w.title} — Kids World ages ${w.ageLabel}`}
                    loading="lazy"
                    width={1280}
                    height={960}
                    className={`h-full w-full object-cover transition-transform duration-[1400ms] ease-out ${
                      allowed ? "group-hover:scale-105" : "opacity-45 saturate-50"
                    }`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6">
                    <span className="text-2xl" aria-hidden>
                      {w.emoji}
                    </span>
                    <h3 className="mt-1 font-display text-2xl uppercase leading-none text-foreground md:text-3xl">
                      {w.title}
                    </h3>
                    <p className="mt-2 text-xs uppercase tracking-[0.22em]" style={{ color: w.accent }}>
                      Ages {w.ageLabel}
                    </p>
                    <p className="mt-2 max-w-md text-sm text-muted-foreground">{w.tagline}</p>
                  </div>
                </div>
                {!allowed && (
                  <p className="px-6 py-4 text-xs text-muted-foreground">
                    Outside this passport&rsquo;s age group. A grown-up can change it in the{" "}
                    <span className="text-foreground">Parent Dashboard</span>.
                  </p>
                )}
              </div>
            );
            return allowed ? (
              <Link key={w.slug} to="/kids-world/$age" params={{ age: w.slug }} className="group block">
                {card}
              </Link>
            ) : (
              <div key={w.slug} aria-disabled className="block cursor-not-allowed">
                {card}
              </div>
            );
          })}
        </div>
      </section>

      {/* Kindness, quietly */}
      <section className="border-t border-primary/20 bg-[color-mix(in_oklab,var(--foreground)_4%,transparent)]">
        <div className="mx-auto max-w-[1600px] px-6 py-14 lg:px-12">
          <p className="text-[10px] uppercase tracking-[0.38em] text-primary">
            The Frass Hill way
          </p>
          <h2 className="mt-3 max-w-3xl font-display text-3xl uppercase md:text-5xl">
            Curiosity, not competition
          </h2>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Nothing here is completed, scored or ranked. Children explore, make things and
            celebrate milestones at their own pace. Along the way they meet small ideas about
            helping others, protecting nature and working together — never a request, never guilt.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/frass-kids"
              className="rounded-full border border-primary/50 px-7 py-3 text-[11px] font-bold uppercase tracking-[0.26em] text-primary"
            >
              🛍 Shop Kids
            </Link>
            <Link
              to="/frass-hill"
              className="rounded-full border border-border px-7 py-3 text-[11px] font-bold uppercase tracking-[0.26em]"
            >
              🗺 Frass Hill map
            </Link>
          </div>
        </div>
      </section>

      <PageFeedback pageTitle="Kids World" />
    </>
  );
}
