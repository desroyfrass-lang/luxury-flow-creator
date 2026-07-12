import cardDrip from "@/assets/card-drip.jpg";
import cardMen from "@/assets/card-men.jpg";
import cardWomen from "@/assets/card-women.jpg";
import cardKicks from "@/assets/card-kicks.jpg";
import cardBare from "@/assets/card-bare.jpg";
import hero from "@/assets/hero-frass.jpg";

export type ShopLink = {
  title: string;
  to: "/collection/$handle";
  handle: string;
};

export type LookbookStory = {
  slug: string;
  kicker: string;
  title: string;
  tagline: string;
  intro: string;
  cover: string;
  images: string[];
  shop: ShopLink[];
};

const IMG_POOL = [hero, cardDrip, cardMen, cardWomen, cardKicks, cardBare];

function shop(handle: string, title: string): ShopLink {
  return { title, to: "/collection/$handle", handle };
}

export const LOOKBOOK_STORIES: LookbookStory[] = [
  {
    slug: "work-drip",
    kicker: "Volume 01 · Work Drip",
    title: "Boardroom Cinema",
    tagline: "Tailored armor for the long week.",
    intro:
      "Cut clean, worn quiet. Suiting that lets the room hear you first.",
    cover: cardMen,
    images: [cardMen, cardDrip, cardWomen, hero, cardKicks],
    shop: [
      shop("mens-work-drip-blazers-suit-jackets", "Men · Blazers"),
      shop("womens-work-drip-blazers", "Women · Blazers"),
      shop("mens-work-drip-dress-shirts", "Dress Shirts"),
      shop("womens-work-drip-pencil-skirts", "Pencil Skirts"),
    ],
  },
  {
    slug: "party-drip",
    kicker: "Volume 02 · Party Drip",
    title: "After Midnight",
    tagline: "Sequin, satin, and the long way home.",
    intro:
      "Lit by the bottle. Pieces that move when the bassline does.",
    cover: cardWomen,
    images: [cardWomen, cardDrip, cardBare, hero, cardMen],
    shop: [
      shop("womens-party-drip-party-dresses", "Party Dresses"),
      shop("womens-party-drip-sequin-looks", "Sequin Looks"),
      shop("mens-party-drip-party-blazers", "Party Blazers"),
      shop("mens-party-drip-nightlife-fits", "Nightlife Fits"),
    ],
  },
  {
    slug: "street-drip",
    kicker: "Volume 03 · Street Drip",
    title: "Concrete Hymns",
    tagline: "Built for the block. Worn for the walk.",
    intro:
      "Heavy cotton, hard angles, gold at the seams.",
    cover: cardDrip,
    images: [cardDrip, cardKicks, cardMen, cardWomen, hero],
    shop: [
      shop("mens-street-drip-cargo", "Men · Cargo"),
      shop("womens-street-drip-jackets", "Women · Jackets"),
      shop("mens-street-drip-statement-pieces", "Statement Pieces"),
      shop("frass-kicks-men", "Street Kicks"),
    ],
  },
  {
    slug: "casual-drip",
    kicker: "Volume 04 · Casual Drip",
    title: "Off-Duty Gold",
    tagline: "Sunday clothes for the rest of the week.",
    intro:
      "Soft cotton, easy denim, nothing to prove.",
    cover: cardKicks,
    images: [cardKicks, cardMen, cardWomen, cardDrip, hero],
    shop: [
      shop("mens-casual-drip-hoodies", "Hoodies"),
      shop("womens-casual-drip-crop-tops", "Crop Tops"),
      shop("mens-casual-drip-denim", "Men · Denim"),
      shop("womens-casual-drip-denim", "Women · Denim"),
    ],
  },
  {
    slug: "vacay-drip",
    kicker: "Volume 05 · Vacay Drip",
    title: "Salt & Linen",
    tagline: "Coordinates somewhere warm.",
    intro:
      "Tropical prints, resort cuts, the air at five p.m.",
    cover: cardBare,
    images: [cardBare, hero, cardWomen, cardMen, cardDrip],
    shop: [
      shop("mens-vacay-drip-tropical-shirts", "Tropical Shirts"),
      shop("womens-vacay-drip-resort-dresses", "Resort Dresses"),
      shop("mens-bare-drip-swimwear-swim-shorts", "Swim Shorts"),
      shop("womens-bare-drip-swimwear-bikini-sets", "Bikini Sets"),
    ],
  },
  {
    slug: "sports-drip",
    kicker: "Volume 06 · Sports Drip",
    title: "Court & Cardio",
    tagline: "Engineered for the work, finished for the walk-up.",
    intro:
      "Performance fabrics that don't quit when the session does.",
    cover: cardKicks,
    images: [cardKicks, cardMen, cardWomen, hero, cardDrip],
    shop: [
      shop("mens-sport-drip-training-gear", "Training Gear"),
      shop("womens-sport-drip-studio-yoga", "Studio & Yoga"),
      shop("mens-sport-drip-basketball-court", "Court Style"),
      shop("womens-sport-drip-activewear-sets", "Activewear Sets"),
    ],
  },
  {
    slug: "bare-drip",
    kicker: "Volume 07 · Bare Drip",
    title: "Skin Deep",
    tagline: "The layer under everything.",
    intro:
      "Lace, mesh, and a quiet kind of confidence.",
    cover: cardBare,
    images: [cardBare, cardWomen, cardMen, hero, cardDrip],
    shop: [
      shop("womens-bare-drip-lingerie-bras-panty-sets", "Bra & Panty Sets"),
      shop("womens-bare-drip-lingerie-bodysuits", "Bodysuits"),
      shop("mens-bare-drip-underwear-boxer-briefs", "Boxer Briefs"),
      shop("mens-bare-drip-swimwear-performance-swimwear", "Performance Swim"),
    ],
  },
];

export const LOOKBOOK_BY_SLUG: Record<string, LookbookStory> = Object.fromEntries(
  LOOKBOOK_STORIES.map((s) => [s.slug, s]),
);

export { IMG_POOL };
