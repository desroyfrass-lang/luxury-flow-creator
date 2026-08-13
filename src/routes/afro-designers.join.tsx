import { createFileRoute, Link } from "@tanstack/react-router";
import heroImg from "@/assets/afro-hero-caribbean.jpg.asset.json";
import { FrassyGold } from "@/components/afro/FrassyGold";
import { PageFeedback } from "@/components/page-feedback";

export const Route = createFileRoute("/afro-designers/join")({
  head: () => ({
    meta: [
      { title: "Become a Designer — Afro Designers | Frass Kicks" },
      {
        name: "description",
        content:
          "Register your label and receive a full designer house on Frass Kicks: your own page, your story, your collection, and direct checkout. Coming soon.",
      },
      { property: "og:title", content: "Become a Designer — Afro Designers" },
      {
        property: "og:description",
        content:
          "Your own designer house on Frass Kicks — story, collection, and direct purchase. Registration opening soon.",
      },
      { property: "og:image", content: heroImg.url },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: heroImg.url },
    ],
  }),
  component: JoinPage,
});

const STEPS = [
  {
    n: "01",
    title: "Register your house",
    body: "Label name, homeland, and the story behind the work. This becomes the header of your own page.",
  },
  {
    n: "02",
    title: "Build your exposé",
    body: "Atelier photography, your founder note, your craft, your regions served — a full editorial landing, not a listing.",
  },
  {
    n: "03",
    title: "Upload the collection",
    body: "Every piece gets its own story, description, fabric notes, sizing, and imagery. Nothing is a bare thumbnail.",
  },
  {
    n: "04",
    title: "Sell directly",
    body: "Customers purchase from your page. Payment, fraud protection, and fulfilment stay a Frass Kicks transaction.",
  },
];

const INCLUDED = [
  ["Your own designer page", "frasskicks.com/afro-designers/designers/your-label"],
  ["Story-first product pages", "Each item carries its narrative, materials, and maker credit"],
  ["Collection & lookbook slots", "Group pieces into seasons, capsules, and island collections"],
  ["Direct checkout", "Cart, currency, and secure payment handled by Frass Kicks"],
  ["Frassy concierge", "She hosts your visitors and answers questions about your work"],
  ["Diaspora placement", "Featured across regions, spotlights, and the Frass District"],
];

function JoinPage() {
  return (
    <div>
      <section className="relative min-h-[70vh] w-full overflow-hidden">
        <img
          src={heroImg.url}
          alt="Caribbean coastline at golden hour"
          width={1920}
          height={1080}
          className="hero-drift absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-white/25 to-white/90" />
        <div className="relative mx-auto flex min-h-[70vh] max-w-[1200px] flex-col items-center justify-center px-6 py-24 text-center">
          <FrassyGold className="h-24 w-24 md:h-32 md:w-32" float />
          <p className="mt-6 text-[11px] uppercase tracking-[0.5em] text-[color:var(--afro-ocean-deep)]">
            Designer Registration
          </p>
          <h1 className="afro-serif mt-4 text-5xl leading-[0.95] text-[color:var(--afro-ink)] md:text-7xl">
            Your house, <span className="afro-gold-text">coming soon</span>
          </h1>
          <p className="mt-6 max-w-2xl text-sm leading-relaxed text-[color:var(--afro-ink)]/75 md:text-base">
            Afro Designers is being opened to the diaspora. Every registered designer receives a
            complete house on Frass Kicks — a landing page of their own, every garment told as a
            story, and direct purchase from their page.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <span className="rounded-full border border-[color:var(--afro-gold)] bg-white/70 px-6 py-3 text-[10px] font-bold uppercase tracking-[0.3em] text-[color:var(--afro-ocean-deep)]">
              Registration opens soon
            </span>
            <Link
              to="/afro-designers/designers"
              className="rounded-full bg-[color:var(--afro-ink)] px-6 py-3 text-[10px] font-bold uppercase tracking-[0.3em] text-white transition hover:opacity-90"
            >
              See the houses already here
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-6 py-20 lg:px-12">
        <p className="text-[11px] uppercase tracking-[0.4em] afro-gold-text">How it will work</p>
        <h2 className="afro-serif mt-3 text-4xl text-[color:var(--afro-ink)] md:text-5xl">
          Four steps to your own page
        </h2>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {STEPS.map((s) => (
            <div
              key={s.n}
              className="rounded-3xl border border-[color:var(--afro-gold)]/30 bg-white/70 p-7 backdrop-blur"
            >
              <span className="afro-serif text-3xl afro-gold-text">{s.n}</span>
              <h3 className="mt-3 text-lg font-semibold text-[color:var(--afro-ink)]">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[color:var(--afro-ink)]/70">
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-6 pb-24 lg:px-12">
        <div className="rounded-3xl border border-[color:var(--afro-gold)]/30 bg-white/60 p-8 backdrop-blur md:p-12">
          <p className="text-[11px] uppercase tracking-[0.4em] afro-gold-text">
            What every designer receives
          </p>
          <div className="mt-8 grid gap-x-10 gap-y-6 md:grid-cols-2">
            {INCLUDED.map(([title, note]) => (
              <div key={title} className="border-t border-[color:var(--afro-gold)]/25 pt-4">
                <div className="text-[11px] uppercase tracking-[0.24em] text-[color:var(--afro-ink)]">
                  {title}
                </div>
                <div className="mt-1 text-sm text-[color:var(--afro-ink)]/65">{note}</div>
              </div>
            ))}
          </div>
          <p className="mt-10 text-xs uppercase tracking-[0.24em] text-[color:var(--afro-ocean-deep)]">
            Purchases from a designer page remain a Frass Kicks transaction — protected, tracked,
            and fulfilled by the house.
          </p>
        </div>
      </section>

      {/* FRASS-0510 — Afro Designers is the showcase; the Seamstress Vault is the engine. */}
      <section className="mx-auto max-w-[1200px] px-6 pb-24 lg:px-12">
        <div className="rounded-3xl border border-[color:var(--afro-gold)]/40 bg-white/70 p-8 backdrop-blur md:p-12">
          <p className="text-[11px] uppercase tracking-[0.4em] afro-gold-text">
            Don't have a collection yet?
          </p>
          <h2 className="afro-serif mt-3 text-4xl text-[color:var(--afro-ink)] md:text-5xl">
            The Seamstress Vault builds it with you
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[color:var(--afro-ink)]/70">
            Afro Designers is where the work is shown. The Seamstress Vault is where the business is
            built — imagine, design, blueprint, create, brand, monetize, grow. Whatever you finish
            there publishes straight to your designer house here. One catalog, one inventory, one
            fashion business — never two.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/business-vaults"
              className="rounded-full bg-[color:var(--afro-ink)] px-6 py-3 text-[10px] font-bold uppercase tracking-[0.3em] text-white transition hover:opacity-90"
            >
              Open the Seamstress Vault
            </Link>
            <Link
              to="/manufacturing"
              className="rounded-full border border-[color:var(--afro-gold)] px-6 py-3 text-[10px] font-bold uppercase tracking-[0.3em] text-[color:var(--afro-ocean-deep)] transition hover:bg-white"
            >
              Have your designs manufactured
            </Link>
          </div>
          <p className="mt-6 text-xs leading-relaxed text-[color:var(--afro-ink)]/60">
            Never sewn before? That's fine — the Vault asks where you're starting from and teaches
            from there. You own your designs; Frass only helps you organise and sell them.
          </p>
        </div>
      </section>

      <PageFeedback pageTitle="Afro Designers — Become a Designer" />
    </div>
  );
}
