// Registry of every swappable image slot on the site.
// Keys are stable strings stored in `site_images.slot_key`.
// `fallback` is the default static asset bundled with the app — used when no override exists.

import heroFrass from "@/assets/hero-frass.jpg";
import cardKicks from "@/assets/card-kicks.jpg";
import cardDrip from "@/assets/card-drip.jpg";
import cardBare from "@/assets/card-bare.jpg";
import cardMen from "@/assets/card-men.jpg";
import cardWomen from "@/assets/card-women.jpg";
import fullLogo from "@/assets/frass-logo-full.asset.json";
import symbolLogo from "@/assets/frass-logo-symbol.asset.json";

export type SlotDef = {
  key: string;
  label: string;
  hint?: string;
  fallback: string;
};

export type SlotSection = {
  title: string;
  description?: string;
  slots: SlotDef[];
};

export const SLOT_SECTIONS: SlotSection[] = [
  {
    title: "Brand",
    description: "Logos and the homepage hero.",
    slots: [
      { key: "hero-home", label: "Homepage hero", hint: "Large 16:9 cinematic image. Min 1920×1080.", fallback: heroFrass },
      { key: "logo-full", label: "Full logo (header / footer)", hint: "Transparent PNG preferred.", fallback: fullLogo.url },
      { key: "logo-symbol", label: "Logo mark (mobile header)", hint: "Square or near-square mark.", fallback: symbolLogo.url },
    ],
  },
  {
    title: "Division cards",
    description: "Homepage 'Three Worlds' tiles and the men/women cards reused across sub-pages.",
    slots: [
      { key: "card-frass-kicks", label: "Frass Kicks card", fallback: cardKicks },
      { key: "card-frass-drip", label: "Frass Drip card", fallback: cardDrip },
      { key: "card-bare-drip", label: "Bare Drip card", fallback: cardBare },
      { key: "card-men", label: "Men card", fallback: cardMen },
      { key: "card-women", label: "Women card", fallback: cardWomen },
    ],
  },
  {
    title: "Frass Kicks — Men categories",
    description: "Tiles on /frass-kicks/men.",
    slots: [
      { key: "kicks-men-street", label: "Street Kicks (men)", fallback: cardDrip },
      { key: "kicks-men-classic", label: "Classic Kicks (men)", fallback: cardMen },
      { key: "kicks-men-casual", label: "Casual Kicks (men)", fallback: cardKicks },
    ],
  },
  {
    title: "Frass Kicks — Women categories",
    description: "Tiles on /frass-kicks/women.",
    slots: [
      { key: "kicks-women-street", label: "Street Kicks (women)", fallback: cardKicks },
      { key: "kicks-women-classic", label: "Classic Kicks (women)", fallback: cardBare },
      { key: "kicks-women-casual", label: "Casual Kicks (women)", fallback: cardWomen },
    ],
  },
  {
    title: "Frass Drip — Men categories",
    description: "Tiles on /frass-drip/men.",
    slots: [
      { key: "drip-men-work", label: "Work Drip (men)", fallback: cardDrip },
      { key: "drip-men-party", label: "Party Drip (men)", fallback: cardMen },
      { key: "drip-men-casual", label: "Casual Drip (men)", fallback: cardKicks },
      { key: "drip-men-street", label: "Street Drip (men)", fallback: cardDrip },
      { key: "drip-men-vacay", label: "Vacay Drip (men)", fallback: cardMen },
      { key: "drip-men-sport", label: "Sport Drip (men)", fallback: cardKicks },
      { key: "drip-men-main-event", label: "Main Event Drip (men)", fallback: cardDrip },
      { key: "drip-men-photoshoot", label: "Photoshoot Drip (men)", fallback: cardMen },
      { key: "drip-men-crown", label: "Crown Drip (men)", fallback: cardDrip },
      { key: "drip-men-extra", label: "Extra Drip (men)", fallback: cardMen },
    ],
  },
  {
    title: "Frass Drip — Women categories",
    description: "Tiles on /frass-drip/women.",
    slots: [
      { key: "drip-women-work", label: "Work Drip (women)", fallback: cardWomen },
      { key: "drip-women-party", label: "Party Drip (women)", fallback: cardBare },
      { key: "drip-women-casual", label: "Casual Drip (women)", fallback: cardDrip },
      { key: "drip-women-street", label: "Street Drip (women)", fallback: cardWomen },
      { key: "drip-women-vacay", label: "Vacay Drip (women)", fallback: cardBare },
      { key: "drip-women-sport", label: "Sport Drip (women)", fallback: cardDrip },
      { key: "drip-women-main-event", label: "Main Event Drip (women)", fallback: cardWomen },
      { key: "drip-women-photoshoot", label: "Photoshoot Drip (women)", fallback: cardBare },
      { key: "drip-women-crown", label: "Crown Drip (women)", fallback: cardWomen },
      { key: "drip-women-extra", label: "Extra Drip (women)", fallback: cardBare },
    ],
  },
  {
    title: "Bare Drip — Men categories",
    description: "Tiles on /bare-drip/men.",
    slots: [
      { key: "bare-men-swimwear", label: "Bare Drip Swimwear (men)", fallback: cardMen },
      { key: "bare-men-underwear", label: "Bare Drip Underwear (men)", fallback: cardKicks },
    ],
  },
  {
    title: "Bare Drip — Women categories",
    description: "Tiles on /bare-drip/women.",
    slots: [
      { key: "bare-women-swimwear", label: "Bare Drip Swimwear (women)", fallback: cardWomen },
      { key: "bare-women-lingerie", label: "Bare Drip Lingerie (women)", fallback: cardBare },
    ],
  },
  {
    title: "Lookbook covers",
    description: "Cover image for each editorial volume.",
    slots: [
      { key: "lookbook-cover-work-drip", label: "Volume 01 — Work Drip", fallback: cardMen },
      { key: "lookbook-cover-party-drip", label: "Volume 02 — Party Drip", fallback: cardWomen },
      { key: "lookbook-cover-street-drip", label: "Volume 03 — Street Drip", fallback: cardDrip },
      { key: "lookbook-cover-casual-drip", label: "Volume 04 — Casual Drip", fallback: cardKicks },
      { key: "lookbook-cover-vacay-drip", label: "Volume 05 — Vacay Drip", fallback: cardBare },
      { key: "lookbook-cover-sports-drip", label: "Volume 06 — Sports Drip", fallback: cardKicks },
      { key: "lookbook-cover-bare-drip", label: "Volume 07 — Bare Drip", fallback: cardBare },
    ],
  },

];

export const ALL_SLOTS: SlotDef[] = SLOT_SECTIONS.flatMap((s) => s.slots);

export const SLOT_BY_KEY: Record<string, SlotDef> = Object.fromEntries(
  ALL_SLOTS.map((s) => [s.key, s]),
);

export const LOOKBOOK_STORY_SLUGS = [
  "work-drip",
  "party-drip",
  "street-drip",
  "casual-drip",
  "vacay-drip",
  "sports-drip",
  "bare-drip",
] as const;
