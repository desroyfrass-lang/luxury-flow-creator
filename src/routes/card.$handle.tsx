import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect } from "react";
import {
  Award,
  Building2,
  CalendarClock,
  Globe,
  Languages,
  MapPin,
  Radio,
  Store,
} from "lucide-react";
import { getPublicCard, recordCardEvent } from "@/lib/card.functions";
import { accentValue, themeValue } from "@/lib/card";
import { ShareCardButton } from "@/components/card/card-share";

export const Route = createFileRoute("/card/$handle")({
  loader: async ({ params }) => {
    const data = await getPublicCard({ data: { handle: params.handle.replace(/^@/, "").toLowerCase() } });
    if (!data) throw notFound();
    return data;
  },
  head: ({ loaderData }) => {
    const name = loaderData?.profile.display_name ?? "A Frass Builder";
    const title = `${name} — Frass Living Business Card`;
    const description =
      loaderData?.card?.headline ??
      loaderData?.profile.bio ??
      `${name}'s living business card on Frass: story, business, work and every way to connect.`;
    const image = loaderData?.card?.hero_media_url ?? loaderData?.profile.avatar_url ?? null;
    return {
      meta: [
        { title },
        { name: "description", content: description.slice(0, 158) },
        { property: "og:title", content: title },
        { property: "og:description", content: description.slice(0, 158) },
        { property: "og:type", content: "profile" },
        { name: "twitter:card", content: "summary_large_image" },
        ...(image && image.startsWith("https://")
          ? [
              { property: "og:image", content: image },
              { name: "twitter:image", content: image },
            ]
          : []),
      ],
    };
  },
  errorComponent: () => <Fallback title="This card could not be opened" />,
  notFoundComponent: () => <Fallback title="No card lives at this address" />,
  component: PublicCard,
});

function Fallback({ title }: { title: string }) {
  return (
    <main className="mx-auto max-w-lg px-6 py-24 text-center">
      <h1 className="text-2xl font-black uppercase tracking-tight">{title}</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        The link may have changed, or the member has taken their card offline.
      </p>
      <Link to="/" className="daily-enter mt-6 inline-flex">
        Return to Frass
      </Link>
    </main>
  );
}

function PublicCard() {
  const { profile, card, live, affiliate, products } = Route.useLoaderData();
  const handle = profile.handle ?? "";
  const name = profile.display_name ?? "Frass Builder";
  const theme = themeValue(card?.theme ?? "midnight");
  const accent = accentValue(card?.accent ?? "gold");
  const about = (profile.about ?? {}) as Record<string, unknown>;
  const legacy = (about["legacy"] ?? null) as { title?: string; body?: string } | null;

  useEffect(() => {
    const scanned = typeof window !== "undefined" && window.location.search.includes("qr");
    void recordCardEvent({ data: { handle, kind: scanned ? "qr_scan" : "view" } }).catch(() => {});
  }, [handle]);

  const track = (kind: "website_click" | "affiliate_click" | "marketplace_click" | "booking") =>
    void recordCardEvent({ data: { handle, kind } }).catch(() => {});

  return (
    <main
      className="living-card-page"
      style={{
        ["--card-wash" as string]: theme.wash,
        ["--card-ink" as string]: theme.ink,
        ["--card-accent" as string]: accent,
        ...(card?.background_url ? { ["--card-bg" as string]: `url(${card.background_url})` } : {}),
      }}
    >
      {/* Opening a card should feel like opening a miniature version of a Frass world. */}
      <header className="living-card-hero">
        {card?.hero_media_url ? (
          /\.(mp4|webm|mov)$/i.test(card.hero_media_url) ? (
            <video className="living-card-hero-media" src={card.hero_media_url} autoPlay muted loop playsInline />
          ) : (
            <img className="living-card-hero-media" src={card.hero_media_url} alt="" />
          )
        ) : null}
        <div className="living-card-hero-scrim" />

        {live && (
          <a className="living-card-live" href={`/live/${live.id}`}>
            <Radio className="h-3.5 w-3.5" /> LIVE — {live.title}
          </a>
        )}

        <div className="living-card-hero-body">
          <div className="living-card-avatar living-card-avatar-lg">
            {profile.avatar_url ? <img src={profile.avatar_url} alt="" /> : <span>{name.charAt(0)}</span>}
          </div>
          <h1 className="living-card-title">{name}</h1>
          {card?.job_title || card?.company ? (
            <p className="living-card-sub">
              {[card?.job_title, card?.company].filter(Boolean).join(" · ")}
            </p>
          ) : null}
          {card?.headline && <p className="living-card-headline">{card.headline}</p>}

          <div className="living-card-cta-row">
            {card?.cta_url && (
              <a className="daily-enter" href={card.cta_url} target="_blank" rel="noreferrer" onClick={() => track("website_click")}>
                {card.cta_label || "Work with me"}
              </a>
            )}
            <ShareCardButton handle={handle} name={name} />
          </div>
        </div>
      </header>

      <div className="living-card-body">
        {(profile.bio || legacy) && (
          <section className="living-card-block">
            <h2 className="living-card-block-title">Story</h2>
            {profile.bio && <p className="living-card-prose">{profile.bio}</p>}
            {legacy?.body && (
              <div className="living-card-legacy">
                <span className="ws-meta">{legacy.title || "Legacy"}</span>
                <p className="living-card-prose">{legacy.body}</p>
              </div>
            )}
            <Link to="/builder/$handle" params={{ handle }} className="ws-chip mt-3 inline-flex">
              Read the full Living Bio
            </Link>
          </section>
        )}

        {products.length > 0 && (
          <section className="living-card-block">
            <h2 className="living-card-block-title">
              <Store className="mr-2 inline h-4 w-4" /> Business
            </h2>
            <div className="living-card-products">
              {products.map((p) => (
                <a
                  key={p.id}
                  className="living-card-product"
                  href={`/builder/${handle}`}
                  onClick={() => track("marketplace_click")}
                >
                  {p.image_url && <img src={p.image_url} alt="" />}
                  <span>{p.title}</span>
                  {p.price != null && <em>${Number(p.price).toFixed(2)}</em>}
                </a>
              ))}
            </div>
          </section>
        )}

        {affiliate.length > 0 && (
          <section className="living-card-block">
            <h2 className="living-card-block-title">Shop with me</h2>
            <p className="living-card-prose">
              Every share can become a business opportunity — these links credit {name} when you buy.
            </p>
            <div className="living-card-links">
              {affiliate.map((a) => (
                <a key={a.token} href={`/r/${a.token}`} className="ws-chip" onClick={() => track("affiliate_click")}>
                  {a.destination_handle || a.destination_type || "Frass"}
                </a>
              ))}
            </div>
          </section>
        )}

        <section className="living-card-block">
          <h2 className="living-card-block-title">Connect</h2>
          <div className="living-card-links">
            {card?.website && (
              <a className="ws-chip" href={card.website} target="_blank" rel="noreferrer" onClick={() => track("website_click")}>
                <Globe className="h-3.5 w-3.5" /> Website
              </a>
            )}
            {card?.booking_url && (
              <a className="ws-chip" href={card.booking_url} target="_blank" rel="noreferrer" onClick={() => track("booking")}>
                <CalendarClock className="h-3.5 w-3.5" /> Book a time
              </a>
            )}
            <Link className="ws-chip" to="/for-me">
              FOR ME page
            </Link>
          </div>

          <dl className="living-card-facts">
            {card?.location && (
              <div>
                <dt><MapPin className="h-3.5 w-3.5" /> Location</dt>
                <dd>{card.location}</dd>
              </div>
            )}
            {card?.business_hours && (
              <div>
                <dt><Building2 className="h-3.5 w-3.5" /> Hours</dt>
                <dd>{card.business_hours}</dd>
              </div>
            )}
            {card?.languages?.length ? (
              <div>
                <dt><Languages className="h-3.5 w-3.5" /> Languages</dt>
                <dd>{card.languages.join(", ")}</dd>
              </div>
            ) : null}
            {card?.certifications?.length ? (
              <div>
                <dt><Award className="h-3.5 w-3.5" /> Certifications</dt>
                <dd>{card.certifications.join(", ")}</dd>
              </div>
            ) : null}
          </dl>
        </section>

        <footer className="living-card-foot">
          <span>Frass Living Business Card</span>
          <Link to="/">frasskicks.com</Link>
        </footer>
      </div>
    </main>
  );
}
