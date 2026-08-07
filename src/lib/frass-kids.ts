// FRASS Kids — the children's flagship department store of the Frass District.
//
// Architectural rule: Kids mirrors the same collection architecture as the
// adult stores. Only Work Drip changes — it becomes School Drip. Children
// grow into the adult collections naturally.

import kids03b from "@/assets/kids-0-3-boys.jpg";
import kids03g from "@/assets/kids-0-3-girls.jpg";
import kids36b from "@/assets/kids-3-6-boys.jpg";
import kids36g from "@/assets/kids-3-6-girls.jpg";
import kids612b from "@/assets/kids-6-12-boys.jpg";
import kids612g from "@/assets/kids-6-12-girls.jpg";
import kids12b from "@/assets/kids-12-boys.jpg";
import kids12g from "@/assets/kids-12-girls.jpg";
import ban03b from "@/assets/kids-banner-0-3-boys.jpg";
import ban03g from "@/assets/kids-banner-0-3-girls.jpg";
import ban36b from "@/assets/kids-banner-3-6-boys.jpg";
import ban36g from "@/assets/kids-banner-3-6-girls.jpg";
import ban612b from "@/assets/kids-banner-6-12-boys.jpg";
import ban612g from "@/assets/kids-banner-6-12-girls.jpg";
import ban12b from "@/assets/kids-banner-12-plus-boys.jpg";
import ban12g from "@/assets/kids-banner-12-plus-girls.jpg";

export interface KidsSegment {
  /** Route slug, e.g. "0-3-boys" */
  slug: string;
  age: string;
  ageTag: string;
  gender: "boys" | "girls";
  emoji: string;
  title: string;
  blurb: string;
  image: string;
  /** Wide age-true Caribbean hero banner for the segment floor. */
  banner: string;
  /** One-line caption printed over the hero banner. */
  bannerCaption: string;
}

export const KIDS_SEGMENTS: KidsSegment[] = [
  {
    slug: "0-3-boys",
    age: "0–3",
    ageTag: "0-3",
    gender: "boys",
    emoji: "👶",
    title: "0–3 Boys",
    blurb: "First steps, first sneakers. Soft cottons and easy island layers.",
    image: kids03b,
    banner: ban03b,
    bannerCaption: "Barefoot mornings on the grass — first steps in island linen.",
  },
  {
    slug: "0-3-girls",
    age: "0–3",
    ageTag: "0-3",
    gender: "girls",
    emoji: "👧",
    title: "0–3 Girls",
    blurb: "Little bloom. Breezy prints, gentle fabrics, tiny sandals.",
    image: kids03g,
    banner: ban03g,
    bannerCaption: "Garden days and tiny sandals — bloom season in the Caribbean.",
  },
  {
    slug: "3-6-boys",
    age: "3–6",
    ageTag: "3-6",
    gender: "boys",
    emoji: "🧒",
    title: "3–6 Boys",
    blurb: "Built to run, climb and get gloriously messy.",
    image: kids36b,
    banner: ban36b,
    bannerCaption: "Courtyard sprints and climbing frames — built for full speed.",
  },
  {
    slug: "3-6-girls",
    age: "3–6",
    ageTag: "3-6",
    gender: "girls",
    emoji: "👧",
    title: "3–6 Girls",
    blurb: "Twirl-tested. Colour, comfort and courtyard energy.",
    image: kids36g,
    banner: ban36g,
    bannerCaption: "Twirls in the courtyard — colour, comfort and island light.",
  },
  {
    slug: "6-12-boys",
    age: "6–12",
    ageTag: "6-12",
    gender: "boys",
    emoji: "🧑",
    title: "6–12 Boys",
    blurb: "School mornings, street afternoons, sport all weekend.",
    image: kids612b,
    banner: ban612b,
    bannerCaption: "School mornings under the palms — uniform sharp, sneakers clean.",
  },
  {
    slug: "6-12-girls",
    age: "6–12",
    ageTag: "6-12",
    gender: "girls",
    emoji: "👧",
    title: "6–12 Girls",
    blurb: "Confidence in every fit — classroom to courtyard.",
    image: kids612g,
    banner: ban612g,
    bannerCaption: "Classroom to courtyard — confidence in every fit.",
  },
  {
    slug: "12-plus-boys",
    age: "12+",
    ageTag: "12-plus",
    gender: "boys",
    emoji: "🌟",
    title: "12+ Boys",
    blurb: "Their own taste, their own drip. Junior sizing, full Frass.",
    image: kids12b,
    banner: ban12b,
    bannerCaption: "High-school afternoons — their own taste, full Frass.",
  },
  {
    slug: "12-plus-girls",
    age: "12+",
    ageTag: "12-plus",
    gender: "girls",
    emoji: "🌸",
    title: "12+ Girls",
    blurb: "Grown-up styling, teen fit. The district in junior sizing.",
    image: kids12g,
    banner: ban12g,
    bannerCaption: "High-school afternoons — grown-up styling, junior fit.",
  },
];

export function getKidsSegment(slug: string) {
  return KIDS_SEGMENTS.find((s) => s.slug === slug);
}

export interface KidsCollection {
  slug: string;
  title: string;
  tagline: string;
  /** Showroom theme key reused from the adult stores. */
  theme: string;
  /** Bright daylight room? */
  bright?: boolean;
  subs: readonly (readonly [slug: string, title: string])[];
}

/**
 * Every age group follows the same collection architecture.
 * Work Drip becomes School Drip; everything else mirrors the adult ecosystem.
 */
export const KIDS_COLLECTIONS: KidsCollection[] = [
  {
    slug: "kicks",
    title: "Frass Kicks",
    tagline: "Casual, Classic and Street — sized for growing feet.",
    theme: "casual",
    subs: [
      ["casual", "Casual"],
      ["classic", "Classic"],
      ["street", "Street"],
    ],
  },
  {
    slug: "school",
    title: "School Drip",
    tagline: "Uniform-ready shirts, bottoms and everyday school shoes.",
    theme: "work",
    bright: true,
    subs: [
      ["uniform-shirts", "Uniform Shirts"],
      ["polos", "Polos"],
      ["school-bottoms", "School Bottoms"],
      ["pinafores-skirts", "Pinafores & Skirts"],
      ["sweaters-cardigans", "Sweaters & Cardigans"],
      ["school-shoes", "School Shoes"],
      ["backpacks", "Backpacks"],
    ],
  },
  {
    slug: "casual",
    title: "Casual Drip",
    tagline: "Everyday play clothes, elevated.",
    theme: "casual",
    subs: [
      ["tees", "Tees"],
      ["shorts", "Shorts"],
      ["casual-sets", "Casual Sets"],
      ["dresses", "Dresses"],
      ["hoodies", "Hoodies"],
      ["joggers", "Joggers"],
    ],
  },
  {
    slug: "street",
    title: "Street Drip",
    tagline: "Graphic tees, cargo and mini streetwear sets.",
    theme: "street",
    subs: [
      ["graphic-tees", "Graphic Tees"],
      ["cargo", "Cargo"],
      ["streetwear-sets", "Streetwear Sets"],
      ["tracksuits", "Tracksuits"],
      ["hoodies", "Hoodies"],
      ["jackets", "Jackets"],
    ],
  },
  {
    slug: "party",
    title: "Party Drip",
    tagline: "Birthdays, weddings and every reason to celebrate.",
    theme: "party",
    subs: [
      ["party-dresses", "Party Dresses"],
      ["dress-shirts", "Dress Shirts"],
      ["suit-sets", "Suit Sets"],
      ["celebration-fits", "Celebration Fits"],
      ["dress-shoes", "Dress Shoes"],
    ],
  },
  {
    slug: "vacay",
    title: "Vacay Drip",
    tagline: "Island holidays, cruises and long sunny weekends.",
    theme: "vacay",
    bright: true,
    subs: [
      ["tropical-sets", "Tropical Sets"],
      ["swim", "Swim"],
      ["cover-ups", "Cover-Ups"],
      ["sandals", "Sandals"],
      ["sun-hats", "Sun Hats"],
    ],
  },
  {
    slug: "sports",
    title: "Sports Drip",
    tagline: "Training, track and every field they run onto.",
    theme: "sport",
    subs: [
      ["training-sets", "Training Sets"],
      ["team-kits", "Team Kits"],
      ["shorts-tees", "Shorts & Tees"],
      ["trainers", "Trainers"],
      ["swim-team", "Swim Team"],
    ],
  },
  {
    slug: "denim",
    title: "Denim Drip",
    tagline: "Jeans, jackets and denim sets built for real play.",
    theme: "extra",
    subs: [
      ["jeans", "Jeans"],
      ["denim-jackets", "Denim Jackets"],
      ["denim-shorts", "Denim Shorts"],
      ["denim-sets", "Denim Sets"],
      ["overalls", "Overalls"],
    ],
  },
  {
    slug: "seasonal",
    title: "Seasonal Drip",
    tagline: "Rainy days, cool evenings and holiday drops.",
    theme: "crown",
    subs: [
      ["rain-jackets", "Rain Jackets"],
      ["light-outerwear", "Light Outerwear"],
      ["holiday-fits", "Holiday Fits"],
      ["back-to-school", "Back to School"],
      ["gift-sets", "Gift Sets"],
    ],
  },
];

export function getKidsCollection(slug: string) {
  return KIDS_COLLECTIONS.find((c) => c.slug === slug);
}

/** kids-6-12-boys-street  /  kids-6-12-boys-street-cargo */
export function kidsHandle(segment: KidsSegment, collection: string, sub?: string) {
  const base = `kids-${segment.ageTag}-${segment.gender}-${collection}`;
  return sub ? `${base}-${sub}` : base;
}
