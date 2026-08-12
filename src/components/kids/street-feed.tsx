// FRASS-0486A — the children's FOR ME, rendered.
//
// One continuous scroll through a child's own world. No counts of other
// children, no likes, no followers, no "trending". Every card ends in something
// the child makes, and finishing a card is a celebration, never a score.

import { Link } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  buildingBySlug,
  characterById,
  needsGrownUp,
  purposeLabel,
  TOPIC_LABEL,
  type AgeBand,
  type FeedCard,
} from "@/lib/kids/frass-street";
import { SafeVideo } from "@/components/kids/safe-video";
import { useKidsProgress } from "@/lib/kids-progress";
import { cn } from "@/lib/utils";

export function StreetFeed({ cards, band }: { cards: FeedCard[]; band: AgeBand }) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 pb-24">
      {cards.map((card) => (
        <StreetCard key={card.id} card={card} band={band} />
      ))}
      <p className="pt-4 text-center text-xs text-muted-foreground">
        That's the whole street for today. Frassy will lay out a new one tomorrow.
      </p>
    </div>
  );
}

function StreetCard({ card, band }: { card: FeedCard; band: AgeBand }) {
  const { complete, isComplete, toggleSaved, isSaved } = useKidsProgress();
  const character = characterById(card.character);
  const building = card.building ? buildingBySlug(card.building) : undefined;
  const done = isComplete(card.id);
  const big = needsGrownUp(band);
  const topic = TOPIC_LABEL[card.topic];

  const greeting = useMemo(() => character.greeting[band], [character, band]);

  if (card.kind === "welcome") {
    return (
      <section className="rounded-3xl bg-gradient-to-br from-primary/15 via-accent/10 to-transparent p-6 text-center ring-1 ring-border">
        <p className="text-4xl" aria-hidden>{card.emoji}</p>
        <h2 className={cn("mt-2 font-semibold", big ? "text-3xl" : "text-2xl")}>{card.title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{card.line}</p>
      </section>
    );
  }

  if (card.kind === "achievement") {
    return (
      <section className="rounded-3xl border border-border bg-card p-6 text-center">
        <p className="text-4xl" aria-hidden>{card.emoji}</p>
        <h2 className="mt-2 text-xl font-semibold">{card.title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{card.line}</p>
      </section>
    );
  }

  return (
    <article
      className={cn(
        "overflow-hidden rounded-3xl border bg-card transition",
        done ? "border-primary/40" : "border-border",
      )}
      style={building ? { boxShadow: `inset 0 3px 0 0 ${building.accent}` } : undefined}
    >
      <div className="flex items-start gap-3 p-5">
        <span className={cn("shrink-0", big ? "text-5xl" : "text-4xl")} aria-hidden>
          {card.emoji}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
            <span className="rounded-full bg-muted px-2 py-0.5">
              {topic.emoji} {topic.label}
            </span>
            {building ? <span>{building.emoji} {building.name}</span> : null}
            {card.minutes ? <span>· about {card.minutes} min</span> : null}
          </div>
          <h3 className={cn("mt-1 font-semibold leading-snug", big ? "text-2xl" : "text-lg")}>
            {card.title}
          </h3>
          <p className={cn("mt-1 text-muted-foreground", big ? "text-base" : "text-sm")}>{card.line}</p>

          {/* Frassy, wearing this character. Same assistant, different costume. */}
          <p className="mt-3 rounded-2xl bg-muted/60 px-3 py-2 text-xs italic text-foreground/80">
            <span aria-hidden>{character.emoji}</span> {character.name}: “{greeting}”
          </p>

          {card.video ? (
            <div className="mt-3">
              <SafeVideo video={card.video} />
            </div>
          ) : null}

          {card.makes ? (
            <p className="mt-3 text-xs font-medium text-primary">
              ✨ You'll finish with {card.makes}.
            </p>
          ) : null}

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {card.to ? (
              <Link
                to={card.to}
                className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
              >
                Let's go
              </Link>
            ) : null}
            <button
              type="button"
              onClick={() =>
                complete(card.id, {
                  badge: card.makes ? { name: card.title, emoji: card.emoji } : undefined,
                  skills: [card.topic],
                })
              }
              disabled={done}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-semibold transition",
                done ? "bg-primary/15 text-primary" : "bg-foreground/10 hover:bg-foreground/20",
              )}
            >
              {done ? "🎉 You made it!" : "I made it"}
            </button>
            <button
              type="button"
              onClick={() => toggleSaved(card.id)}
              className="rounded-full border border-border px-4 py-2 text-sm"
            >
              {isSaved(card.id) ? "🔖 Kept" : "Keep for later"}
            </button>
          </div>

          <p className="mt-3 text-[11px] text-muted-foreground/80">
            {card.purposes.map(purposeLabel).join(" · ")}
          </p>
        </div>
      </div>
    </article>
  );
}
