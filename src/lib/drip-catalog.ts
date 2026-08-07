// Shared Frass Drip catalog — single source of truth for the standard store
// architecture. Frass Plus mirrors this exact structure (see frass-plus.ts).

export type Sub = readonly [slug: string, title: string, handleOverride?: string];
export interface DripCategory {
  title: string;
  tagline: string;
  subs: readonly Sub[];
}

export const MEN_CATEGORIES: Record<string, DripCategory> = {
  work: {
    title: "Men's Work Drip",
    tagline: "Dress shirts, blazers, suits & business casual.",
    subs: [
      ["dress-shirts", "Dress Shirts"],
      ["button-down-shirts", "Button Down Shirts"],
      ["polo-shirts", "Polo Shirts"],
      ["business-casual", "Business Casual"],
      ["dress-pants", "Dress Pants"],
      ["quarter-zips", "Quarter Zips"],
      ["blazers-suit-jackets", "Blazers & Suit Jackets"],
      ["full-suits", "Full Suits"],
      ["jackets", "Jackets"],
    ],
  },
  party: {
    title: "Men's Party Drip",
    tagline: "Nightlife fits & luxury streetwear.",
    subs: [
      ["night-out-shirts", "Night Out Shirts"],
      ["dress-shirts", "Dress Shirts"],
      ["matching-sets", "Matching Sets"],
      ["party-blazers", "Party Blazers"],
      ["luxury-streetwear", "Luxury Streetwear"],
      ["dress-pants", "Dress Pants"],
      ["nightlife-fits", "Nightlife Fits"],
      ["party-fits", "Party Fits"],
      ["jackets", "Jackets"],
    ],
  },
  casual: {
    title: "Men's Casual Drip",
    tagline: "Everyday staples, elevated.",
    subs: [
      ["casual-button-down", "Casual Button Down"],
      ["tank-tops", "Tank Tops"],
      ["shorts", "Shorts"],
      ["denim", "Denim"],
      ["casual-shirts", "Casual Shirts"],
      ["hoodies", "Hoodies"],
      ["sweaters", "Sweaters"],
      ["sweat-suits", "Sweat Suits"],
      ["matching-sets", "Matching Sets"],
      ["jackets", "Jackets"],
    ],
  },
  street: {
    title: "Men's Street Drip",
    tagline: "Cargo, denim & statement pieces.",
    subs: [
      ["oversized-tees", "Oversized Tees"],
      ["graphic-tees", "Graphic Tees"],
      ["cargo", "Cargo"],
      ["streetwear-sets", "Streetwear Sets"],
      ["tracksuits", "Tracksuits"],
      ["hoodies", "Hoodies"],
      ["sweaters", "Sweaters"],
      ["denim", "Denim"],
      ["statement-pieces", "Statement Pieces"],
      ["jackets", "Jackets"],
    ],
  },
  vacay: {
    title: "Men's Vacay Drip",
    tagline: "Tropical shirts & resort essentials.",
    subs: [
      ["vacation-cruise-sets", "Vacation & Cruise Sets"],
      ["tropical-shirts", "Tropical Shirts"],
      ["vacation-shorts", "Vacation Shorts"],
      ["resort-essentials", "Resort Essentials"],
      ["summer-styles", "Summer Styles"],
      ["jackets", "Jackets"],
    ],
  },
  sport: {
    title: "Men's Sport Drip",
    tagline: "Training, gym & court performance.",
    subs: [
      ["training-gear", "Training Gear"],
      ["activewear-sets", "Activewear Sets"],
      ["running-performance", "Running & Performance"],
      ["basketball-court", "Basketball & Court Style"],
      ["gym-fits", "Gym Fits"],
      ["jackets", "Jackets"],
    ],
  },
  crown: {
    title: "Men's Crown Drip",
    tagline: "Signature Crown drops.",
    subs: [
      ["street-crowns", "Street Crowns"],
      ["classic-crowns", "Classic Crowns"],
      ["casual-crowns", "Casual Crowns"],
      ["on-sale", "On Sale"],
    ],
  },
  extra: {
    title: "Men's Extra Drip",
    tagline: "Overflow drops & seasonal extras.",
    subs: [
      ["street", "Street"],
      ["classic", "Classic"],
      ["casual", "Casual"],
      ["on-sale", "On Sale"],
    ],
  },
  "90s": {
    title: "Men's 90's Drip",
    tagline: "Throwback fits — casual, classic and street.",
    subs: [
      ["casual", "90's Casual", "frass-drip-90s-casual"],
      ["classic", "90's Classic", "frass-drip-90s-classic"],
      ["street", "90's Street", "frass-drip-90s-street"],
    ],
  },
};

export const WOMEN_CATEGORIES: Record<string, DripCategory> = {
  work: {
    title: "Women's Work Drip",
    tagline: "Blazers, blouses, dresses & professional sets.",
    subs: [
      ["blazers", "Blazers"],
      ["work-dresses", "Work Dresses"],
      ["pencil-skirts", "Pencil Skirts"],
      ["dress-pants", "Dress Pants"],
      ["wide-leg-trousers", "Wide-Leg Trousers"],
      ["work-blouses", "Work Blouses"],
      ["professional-sets", "Professional Sets"],
      ["business-casual", "Business Casual"],
      ["jackets", "Jackets"],
    ],
  },
  party: {
    title: "Women's Party Drip",
    tagline: "Dresses, clubwear & sequin looks.",
    subs: [
      ["party-dresses", "Party Dresses"],
      ["birthday-dresses", "Birthday Dresses"],
      ["mini-dresses", "Mini Dresses"],
      ["maxi-dresses", "Maxi Dresses"],
      ["corset-tops", "Corset Tops"],
      ["two-piece-sets", "Two-Piece Sets"],
      ["clubwear", "Clubwear"],
      ["sequin-looks", "Sequin Looks"],
      ["nightlife-fits", "Nightlife Fits"],
      ["jackets", "Jackets"],
    ],
  },
  casual: {
    title: "Women's Casual Drip",
    tagline: "Sweats, denim, crop tops & basics.",
    subs: [
      ["casual-dresses", "Casual Dresses"],
      ["matching-sets", "Matching Sets"],
      ["basic-tops", "Basic Tops"],
      ["graphic-tees", "Graphic Tees"],
      ["crop-tops", "Crop Tops"],
      ["bodysuits", "Bodysuits"],
      ["leggings", "Leggings"],
      ["denim", "Denim"],
      ["shorts", "Shorts"],
      ["sweaters", "Sweaters"],
      ["sweats", "Sweats"],
      ["jackets", "Jackets"],
    ],
  },
  street: {
    title: "Women's Street Drip",
    tagline: "Jackets, cargo, tracksuits & statement pieces.",
    subs: [
      ["oversized-graphic-tees", "Oversized & Graphic Tees"],
      ["cargo", "Cargo"],
      ["streetwear-sets", "Streetwear Sets"],
      ["tracksuits", "Tracksuits"],
      ["hoodies", "Hoodies"],
      ["sweaters", "Sweaters"],
      ["denim", "Denim"],
      ["statement-pieces", "Statement Pieces"],
      ["jumpsuits-rompers", "Jumpsuits & Rompers"],
      ["sweats", "Sweats"],
      ["jackets", "Jackets"],
    ],
  },
  vacay: {
    title: "Women's Vacay Drip",
    tagline: "Beachwear, resort fits & cover-ups.",
    subs: [
      ["resort-dresses", "Resort Dresses"],
      ["maxi-dresses", "Maxi Dresses"],
      ["vacation-sets", "Vacation Sets"],
      ["vacation-fits", "Vacation Fits"],
      ["cover-ups", "Cover-Ups"],
      ["beachwear", "Beachwear"],
      ["resort-essentials", "Resort Essentials"],
      ["rompers-jumpsuits", "Rompers & Jumpsuits"],
      ["jackets", "Jackets"],
    ],
  },
  sport: {
    title: "Women's Sport Drip",
    tagline: "Training, studio, running & active shapewear.",
    subs: [
      ["training-essentials", "Training Essentials"],
      ["activewear-sets", "Activewear Sets"],
      ["running-performance", "Running & Performance"],
      ["studio-yoga", "Studio & Yoga"],
      ["active-shapewear", "Active Shapewear"],
      ["gym-fits", "Gym Fits"],
      ["jackets", "Jackets"],
    ],
  },
  crown: {
    title: "Women's Crown Drip",
    tagline: "Signature Crown drops.",
    subs: [
      ["street-crowns", "Street Crowns"],
      ["classic-crowns", "Classic Crowns"],
      ["casual-crowns", "Casual Crowns"],
      ["on-sale", "On Sale"],
    ],
  },
  extra: {
    title: "Women's Extra Drip",
    tagline: "Overflow drops & seasonal extras.",
    subs: [
      ["street", "Street"],
      ["classic", "Classic"],
      ["casual", "Casual"],
      ["on-sale", "On Sale"],
    ],
  },
  "90s": {
    title: "Women's 90's Drip",
    tagline: "Throwback fits — casual, classic and street.",
    subs: [
      ["casual", "90's Casual", "frass-drip-90s-casual"],
      ["classic", "90's Classic", "frass-drip-90s-classic"],
      ["street", "90's Street", "frass-drip-90s-street"],
    ],
  },
};

export const DRIP_PARENTS_MEN = [
  ["work", "Work Drip", "Tailored essentials for the boardroom."],
  ["party", "Party Drip", "Nightlife fits & luxury streetwear."],
  ["casual", "Casual Drip", "Everyday staples, elevated."],
  ["street", "Street Drip", "Cargo, denim & statement pieces."],
  ["vacay", "Vacay Drip", "Tropical shirts & resort essentials."],
  ["sport", "Sport Drip", "Training, gym & court performance."],
  ["main-event", "Main Event Drip", "Show-stopping fits for the big night."],
  ["photoshoot", "Photoshoot Drip", "Camera-ready looks built to pop on film."],
  ["crown", "Crown Drip", "Signature drops from the Crown line."],
  ["extra", "Extra Drip", "Overflow drops & seasonal extras."],
] as const;

export const DRIP_PARENTS_WOMEN = [
  ["work", "Work Drip", "Blouses, blazers & professional sets."],
  ["party", "Party Drip", "Dresses, clubwear & sequin looks."],
  ["casual", "Casual Drip", "Sweats, denim, crop tops & basics."],
  ["street", "Street Drip", "Jackets, cargo & tracksuits."],
  ["vacay", "Vacay Drip", "Beachwear, resort fits & cover-ups."],
  ["sport", "Sport Drip", "Training, studio & active shapewear."],
  ["main-event", "Main Event Drip", "Show-stopping fits for the big night."],
  ["photoshoot", "Photoshoot Drip", "Camera-ready looks built to pop on film."],
  ["crown", "Crown Drip", "Signature drops from the Crown line."],
  ["extra", "Extra Drip", "Overflow drops & seasonal extras."],
] as const;

/** Frass Kicks wall sections, mirrored by Frass Kicks Plus+. */
export const KICKS_SECTIONS = [
  ["casual", "Casual", "Everyday, elevated"],
  ["classic", "Classic", "Timeless icons"],
  ["street", "Street", "Bold silhouettes"],
] as const;

/** Bare Drip rooms, mirrored by Bare Drip Plus+. */
export const BARE_ROOMS = {
  men: [
    ["underwear", "Underwear", "Boxers, briefs, tanks and sleepwear."],
    ["swimwear", "Swimwear", "Swim shorts, trunks and beach shorts."],
  ],
  women: [
    ["lingerie", "Lingerie", "Bras, sets, sleepwear and everyday comfort."],
    ["swimwear", "Swimwear", "Swim, one-pieces and cover-ups."],
  ],
} as const;

export const BARE_MEN_CATEGORIES: Record<string, DripCategory> = {
  swimwear: {
    title: "Men's Bare Drip Swimwear",
    tagline: "Swim shorts, trunks, beach shorts and performance swimwear.",
    subs: [
      ["swim-shorts", "Swim Shorts"],
      ["swim-trunks", "Swim Trunks"],
      ["beach-shorts", "Beach Shorts"],
      ["performance-swimwear", "Performance Swimwear"],
    ],
  },
  underwear: {
    title: "Men's Bare Drip Underwear",
    tagline: "Boxers, briefs, tanks, undershirts and sleepwear.",
    subs: [
      ["boxers", "Boxers"],
      ["boxer-briefs", "Boxer Briefs"],
      ["briefs", "Briefs"],
      ["performance-underwear", "Performance Underwear"],
      ["undershirts", "Undershirts"],
      ["tank-tops", "Tank Tops"],
      ["sleepwear", "Sleepwear"],
    ],
  },
};
export const BARE_WOMEN_CATEGORIES: Record<string, DripCategory> = {
  swimwear: {
    title: "Women's Bare Drip Swimwear",
    tagline: "Bikinis, one-pieces, cover-ups and swim skirts.",
    subs: [
      ["bikini-sets", "Bikini Sets"],
      ["bikini-tops", "Bikini Tops"],
      ["bikini-bottoms", "Bikini Bottoms"],
      ["one-piece-monokinis", "One-Piece & Monokinis"],
      ["cover-ups", "Cover-Ups"],
      ["photo-shoot-worthy", "Photo Shoot Worthy"],
      ["swim-skirts", "Swim Skirts"],
    ],
  },
  lingerie: {
    title: "Women's Bare Drip Lingerie",
    tagline: "Bras, panties, sets, bodysuits, sleepwear & shapewear.",
    subs: [
      ["bras", "Bras"],
      ["panties", "Panties"],
      ["bras-panty-sets", "Bras & Panty Sets"],
      ["bodysuits", "Bodysuits"],
      ["lingerie-sets", "Lingerie Sets"],
      ["sleepwear", "Sleepwear"],
      ["babydolls", "Babydolls"],
      ["teddies", "Teddies"],
      ["shapewear", "Shapewear"],
    ],
  },
};
