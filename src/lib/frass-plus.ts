// Frass Plus — the extended-sizing flagship boutique of the Frass District.
// Fashion first: departments read as collections, never as "sizes".

import edM1 from "@/assets/plus-ed-m1.jpg";
import edM2 from "@/assets/plus-ed-m2.jpg";
import edM3 from "@/assets/plus-ed-m3.jpg";
import edM4 from "@/assets/plus-ed-m4.jpg";
import edW1 from "@/assets/plus-ed-w1.jpg";
import edW2 from "@/assets/plus-ed-w2.jpg";
import edW3 from "@/assets/plus-ed-w3.jpg";
import edW4 from "@/assets/plus-ed-w4.jpg";
import wingMen from "@/assets/plus-wing-men.jpg";
import wingWomen from "@/assets/plus-wing-women.jpg";

export type PlusGender = "men" | "women";

export interface PlusDepartment {
  slug: string;
  title: string;
  tagline: string;
  /** Showroom theme key reused from the Drip department floors. */
  theme: string;
  image: string;
  subs: readonly (readonly [slug: string, title: string])[];
}

export const MEN_EDITORIAL = [edM2, edM1, edM3, edM4];
export const WOMEN_EDITORIAL = [edW2, edW1, edW3, edW4];

export const PLUS_WING_IMAGE: Record<PlusGender, string> = {
  men: wingMen,
  women: wingWomen,
};

const MEN: PlusDepartment[] = [
  {
    slug: "footwear",
    title: "Footwear",
    tagline: "Sneakers, classics and boots cut for comfort and presence.",
    theme: "casual",
    image: edM1,
    subs: [
      ["sneakers", "Sneakers"],
      ["casual-shoes", "Casual Shoes"],
      ["classic-shoes", "Classic Shoes"],
      ["street-collection", "Street Collection"],
      ["boots", "Boots"],
      ["sandals", "Sandals"],
    ],
  },
  {
    slug: "apparel",
    title: "Apparel",
    tagline: "Premium basics and elevated everyday layers.",
    theme: "casual",
    image: edM2,
    subs: [
      ["graphic-tees", "Graphic Tees"],
      ["premium-basics", "Premium Basics"],
      ["polo-shirts", "Polo Shirts"],
      ["dress-shirts", "Dress Shirts"],
      ["hoodies", "Hoodies"],
      ["sweatshirts", "Sweatshirts"],
      ["knitwear", "Knitwear"],
    ],
  },
  {
    slug: "bottoms",
    title: "Bottoms",
    tagline: "Denim, chinos and joggers with a fit that moves.",
    theme: "street",
    image: edM1,
    subs: [
      ["denim", "Denim"],
      ["casual-pants", "Casual Pants"],
      ["chinos", "Chinos"],
      ["joggers", "Joggers"],
      ["shorts", "Shorts"],
      ["cargo-pants", "Cargo Pants"],
    ],
  },
  {
    slug: "outerwear",
    title: "Outerwear",
    tagline: "Jackets, blazers and coats with clean shoulders.",
    theme: "work",
    image: edM2,
    subs: [
      ["jackets", "Jackets"],
      ["blazers", "Blazers"],
      ["coats", "Coats"],
      ["bombers", "Bombers"],
      ["windbreakers", "Windbreakers"],
    ],
  },
  {
    slug: "activewear",
    title: "Activewear",
    tagline: "Gym, running and lifestyle fits built for movement.",
    theme: "sport",
    image: edM4,
    subs: [
      ["gym-collection", "Gym Collection"],
      ["running", "Running"],
      ["lifestyle", "Lifestyle"],
      ["compression-fits", "Compression-Friendly Fits"],
    ],
  },
  {
    slug: "occasion",
    title: "Occasion Wear",
    tagline: "Weddings, business and evening — tailored properly.",
    theme: "party",
    image: edM2,
    subs: [
      ["weddings", "Weddings"],
      ["business", "Business"],
      ["formal-events", "Formal Events"],
      ["evening", "Evening"],
    ],
  },
  {
    slug: "resort",
    title: "Resort Collection",
    tagline: "Linen sets, swim and vacation essentials.",
    theme: "vacay",
    image: edM3,
    subs: [
      ["swimwear", "Swimwear"],
      ["vacation", "Vacation"],
      ["beachwear", "Beachwear"],
      ["linen-sets", "Linen Sets"],
    ],
  },
  {
    slug: "accessories",
    title: "Accessories",
    tagline: "Belts, hats, watches and finishing pieces.",
    theme: "crown",
    image: edM3,
    subs: [
      ["belts", "Belts"],
      ["hats", "Hats"],
      ["watches", "Watches"],
      ["sunglasses", "Sunglasses"],
      ["bags", "Bags"],
    ],
  },
];

const WOMEN: PlusDepartment[] = [
  {
    slug: "footwear",
    title: "Footwear",
    tagline: "Sneakers, heels, flats and boots that carry you all day.",
    theme: "casual",
    image: edW1,
    subs: [
      ["sneakers", "Sneakers"],
      ["heels", "Heels"],
      ["flats", "Flats"],
      ["boots", "Boots"],
      ["sandals", "Sandals"],
    ],
  },
  {
    slug: "dresses",
    title: "Dresses",
    tagline: "From easy daytime to full evening drama.",
    theme: "party",
    image: edW1,
    subs: [
      ["casual-dresses", "Casual Dresses"],
      ["evening-dresses", "Evening Dresses"],
      ["cocktail", "Cocktail"],
      ["maxi", "Maxi"],
      ["midi", "Midi"],
      ["occasion", "Occasion"],
    ],
  },
  {
    slug: "tops",
    title: "Tops",
    tagline: "Blouses, knitwear and bodysuits with beautiful drape.",
    theme: "casual",
    image: edW2,
    subs: [
      ["blouses", "Blouses"],
      ["tees", "Tees"],
      ["shirts", "Shirts"],
      ["knitwear", "Knitwear"],
      ["bodysuits", "Bodysuits"],
    ],
  },
  {
    slug: "bottoms",
    title: "Bottoms",
    tagline: "Jeans, trousers, skirts and leggings that fit right.",
    theme: "street",
    image: edW4,
    subs: [
      ["jeans", "Jeans"],
      ["trousers", "Trousers"],
      ["leggings", "Leggings"],
      ["skirts", "Skirts"],
      ["shorts", "Shorts"],
    ],
  },
  {
    slug: "matching-sets",
    title: "Matching Sets",
    tagline: "Co-ords, lounge and vacation sets — one decision, done.",
    theme: "vacay",
    image: edW3,
    subs: [
      ["lounge-sets", "Lounge Sets"],
      ["co-ords", "Co-ords"],
      ["vacation-sets", "Vacation Sets"],
    ],
  },
  {
    slug: "outerwear",
    title: "Outerwear",
    tagline: "Blazers, coats and cardigans with structure.",
    theme: "work",
    image: edW2,
    subs: [
      ["blazers", "Blazers"],
      ["jackets", "Jackets"],
      ["coats", "Coats"],
      ["cardigans", "Cardigans"],
    ],
  },
  {
    slug: "activewear",
    title: "Activewear",
    tagline: "Fitness, yoga, walking and lifestyle.",
    theme: "sport",
    image: edW4,
    subs: [
      ["fitness", "Fitness"],
      ["yoga", "Yoga"],
      ["walking", "Walking"],
      ["lifestyle", "Lifestyle"],
    ],
  },
  {
    slug: "swim-resort",
    title: "Swim & Resort",
    tagline: "Swim, cover-ups and resort dressing for island days.",
    theme: "vacay",
    image: edW3,
    subs: [
      ["swimwear", "Swimwear"],
      ["cover-ups", "Cover-Ups"],
      ["resort-dresses", "Resort Dresses"],
      ["vacation-essentials", "Vacation Essentials"],
    ],
  },
  {
    slug: "intimates",
    title: "Intimates",
    tagline: "Lingerie, sleepwear and everyday comfort.",
    theme: "crown",
    image: edW1,
    subs: [
      ["lingerie", "Lingerie"],
      ["sleepwear", "Sleepwear"],
      ["shapewear", "Shapewear"],
      ["everyday-comfort", "Everyday Comfort"],
    ],
  },
  {
    slug: "accessories",
    title: "Accessories",
    tagline: "Jewelry, bags, scarves and sunglasses.",
    theme: "crown",
    image: edW2,
    subs: [
      ["jewelry", "Jewelry"],
      ["bags", "Bags"],
      ["scarves", "Scarves"],
      ["hats", "Hats"],
      ["sunglasses", "Sunglasses"],
    ],
  },
];

export const PLUS_DEPARTMENTS: Record<PlusGender, PlusDepartment[]> = {
  men: MEN,
  women: WOMEN,
};

export function getPlusDepartment(gender: PlusGender, slug: string) {
  return PLUS_DEPARTMENTS[gender].find((d) => d.slug === slug);
}

export function isPlusGender(value: string): value is PlusGender {
  return value === "men" || value === "women";
}

/** Signature Frass Plus collections — browse by lifestyle, not by size. */
export const SIGNATURE_COLLECTIONS = [
  {
    slug: "everyday-confidence",
    title: "Everyday Confidence",
    blurb: "Elevated everyday essentials that never need an occasion.",
    image: edW1,
  },
  {
    slug: "executive-confidence",
    title: "Executive Confidence",
    blurb: "Power dressing, business tailoring and boardroom polish.",
    image: edW2,
  },
  {
    slug: "evening-confidence",
    title: "Evening Confidence",
    blurb: "Luxury evening looks for the nights that matter.",
    image: wingWomen,
  },
  {
    slug: "island-confidence",
    title: "Island Confidence",
    blurb: "Caribbean-inspired resort wear and relaxed luxury.",
    image: edM3,
  },
  {
    slug: "street-confidence",
    title: "Street Confidence",
    blurb: "Modern streetwear, urban styling, statement pieces.",
    image: edM1,
  },
  {
    slug: "active-confidence",
    title: "Active Confidence",
    blurb: "Movement, fitness and walking fits built to perform.",
    image: edW4,
  },
  {
    slug: "celebration-collection",
    title: "Celebration Collection",
    blurb: "Weddings, graduations, birthdays and family moments.",
    image: wingMen,
  },
] as const;

/** Browse-by rails — size is a product attribute, never the navigation. */
export const BROWSE_RAILS = [
  { label: "New Arrivals", handle: "frass-plus-new-arrivals" },
  { label: "Best Sellers", handle: "frass-plus-best-sellers" },
  { label: "By Occasion", handle: "frass-plus-occasion" },
  { label: "By Lifestyle", handle: "frass-plus-lifestyle" },
] as const;

/** Collection handle for a department sub-collection. */
export function plusHandle(gender: PlusGender, dept: string, sub: string) {
  return `${gender === "men" ? "mens" : "womens"}-plus-${dept}-${sub}`;
}
