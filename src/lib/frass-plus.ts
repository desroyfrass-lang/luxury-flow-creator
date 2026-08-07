// Frass Plus — the extended-sizing flagship of the Frass District.
//
// Architectural rule: the Plus store has NO independent collection names.
// It mirrors the exact collection architecture of the standard Frass stores
// (Frass Kicks, Frass Drip, Bare Drip) and appends the permanent "Plus+"
// designation. Style never changes because of size — only the fit does.

import {
  BARE_MEN_CATEGORIES,
  BARE_WOMEN_CATEGORIES,
  DRIP_PARENTS_MEN,
  DRIP_PARENTS_WOMEN,
  KICKS_SECTIONS,
  MEN_CATEGORIES,
  WOMEN_CATEGORIES,
  type DripCategory,
} from "@/lib/drip-catalog";

import edM1 from "@/assets/plus-ed-m1.jpg";
import edM2 from "@/assets/plus-ed-m2.jpg";
import edM3 from "@/assets/plus-ed-m3.jpg";
import edM4 from "@/assets/plus-ed-m4.jpg";
import edW1 from "@/assets/plus-ed-w1.jpg";
import edW2 from "@/assets/plus-ed-w2.jpg";
import edW3 from "@/assets/plus-ed-w3.jpg";
import edW4 from "@/assets/plus-ed-w4.jpg";
import wingMen from "@/assets/store-drip-plus-men.jpg";
import wingWomen from "@/assets/store-drip-plus-women.jpg";

export type PlusGender = "men" | "women";

/** The permanent extended-size designation. Always written in full. */
export const PLUS_SUFFIX = "Plus+";

/** `Work Drip` → `Work Drip Plus+` */
export function plusName(name: string) {
  return `${name} ${PLUS_SUFFIX}`;
}

export interface PlusSub {
  slug: string;
  /** Standard collection name — stays dominant. */
  title: string;
  /** Mirrored standard handle with the `-plus` extension. */
  handle: string;
}

export interface PlusDepartment {
  /** Route slug under /frass-plus/$gender/ */
  slug: string;
  /** Standard collection name, e.g. "Work Drip". Plus+ is rendered as a badge. */
  title: string;
  tagline: string;
  /** Showroom theme key, mirrored from the standard store. */
  theme: string;
  /** Which standard store this department mirrors. */
  store: "kicks" | "drip" | "bare";
  image: string;
  subs: PlusSub[];
}

export const MEN_EDITORIAL = [edM2, edM1, edM3, edM4];
export const WOMEN_EDITORIAL = [edW2, edW1, edW3, edW4];

export const PLUS_WING_IMAGE: Record<PlusGender, string> = {
  men: wingMen,
  women: wingWomen,
};

const GENDER_PREFIX: Record<PlusGender, "mens" | "womens"> = {
  men: "mens",
  women: "womens",
};

/** Standard handle + the permanent `-plus` extension. */
export function toPlusHandle(standardHandle: string) {
  return `${standardHandle}-plus`;
}

function editorial(gender: PlusGender, i: number) {
  const pool = gender === "men" ? MEN_EDITORIAL : WOMEN_EDITORIAL;
  return pool[i % pool.length]!;
}

/** Frass Kicks Plus+ — mirrors the Casual / Classic / Street wall. */
function kicksDepartment(gender: PlusGender): PlusDepartment {
  return {
    slug: "kicks",
    title: "Frass Kicks",
    tagline: "Casual, Classic and Street — the same wall, cut with wider fits.",
    theme: "casual",
    store: "kicks",
    image: editorial(gender, 0),
    subs: KICKS_SECTIONS.map(([slug, title]) => ({
      slug,
      title,
      handle: toPlusHandle(`${slug}-kicks-${gender}`),
    })),
  };
}

/** Frass Drip Plus+ — mirrors every Drip department, department for department. */
function dripDepartments(gender: PlusGender): PlusDepartment[] {
  const parents = gender === "men" ? DRIP_PARENTS_MEN : DRIP_PARENTS_WOMEN;
  const cats: Record<string, DripCategory> =
    gender === "men" ? MEN_CATEGORIES : WOMEN_CATEGORIES;
  const prefix = GENDER_PREFIX[gender];

  return parents
    .filter(([slug]) => cats[slug])
    .map(([slug, title, tagline], i) => ({
      slug,
      title,
      tagline,
      theme: slug,
      store: "drip" as const,
      image: editorial(gender, i + 1),
      subs: cats[slug]!.subs.map(([subSlug, subTitle, override]) => ({
        slug: subSlug,
        title: subTitle,
        handle: toPlusHandle(override ?? `${prefix}-${slug}-drip-${subSlug}`),
      })),
    }));
}

/** Bare Drip Plus+ — mirrors the two rooms on the Bare floor. */
function bareDepartments(gender: PlusGender): PlusDepartment[] {
  const cats: Record<string, DripCategory> =
    gender === "men" ? BARE_MEN_CATEGORIES : BARE_WOMEN_CATEGORIES;
  const prefix = GENDER_PREFIX[gender];

  return Object.entries(cats).map(([slug, cat], i) => ({
    slug: `bare-${slug}`,
    title: `Bare Drip ${slug === "swimwear" ? "Swim" : slug === "lingerie" ? "Lingerie" : "Underwear"}`,
    tagline: cat.tagline,
    theme: slug === "swimwear" ? "vacay" : "crown",
    store: "bare" as const,
    image: editorial(gender, i + 2),
    subs: cat.subs.map(([subSlug, subTitle]) => ({
      slug: subSlug,
      title: subTitle,
      handle: toPlusHandle(`${prefix}-bare-drip-${slug}-${subSlug}`),
    })),
  }));
}

function buildFloor(gender: PlusGender): PlusDepartment[] {
  return [kicksDepartment(gender), ...dripDepartments(gender), ...bareDepartments(gender)];
}

export const PLUS_DEPARTMENTS: Record<PlusGender, PlusDepartment[]> = {
  men: buildFloor("men"),
  women: buildFloor("women"),
};

export function getPlusDepartment(gender: PlusGender, slug: string) {
  return PLUS_DEPARTMENTS[gender].find((d) => d.slug === slug);
}

export function isPlusGender(value: string): value is PlusGender {
  return value === "men" || value === "women";
}

/**
 * Signature Frass collections, mirrored in extended sizing. Names mirror the
 * standard store — never a separate fashion language.
 */
export const SIGNATURE_COLLECTIONS = [
  {
    slug: "new-looks",
    title: "New Looks",
    blurb: "The newest Frass releases, launched in extended sizing on the same day.",
    image: edW1,
  },
  {
    slug: "work-drip",
    title: "Work Drip",
    blurb: "Boardroom tailoring, dress shirts and professional sets.",
    image: edW2,
  },
  {
    slug: "party-drip",
    title: "Party Drip",
    blurb: "Nightlife fits, evening looks and luxury streetwear.",
    image: wingWomen,
  },
  {
    slug: "resort-drip",
    title: "Resort Drip",
    blurb: "Caribbean-inspired resort dressing and vacation essentials.",
    image: edM3,
  },
  {
    slug: "street-drip",
    title: "Street Drip",
    blurb: "Cargo, denim, tracksuits and statement pieces.",
    image: edM1,
  },
  {
    slug: "sport-drip",
    title: "Sport Drip",
    blurb: "Training, running and court performance built to move.",
    image: edW4,
  },
  {
    slug: "seasonal-drip",
    title: "Seasonal Drip",
    blurb: "Every seasonal release, synchronized with the main collection.",
    image: wingMen,
  },
] as const;

/** Signature collections resolve to the standard handle + `-plus`. */
export function signatureHandle(slug: string) {
  return toPlusHandle(`frass-${slug}`);
}

/** Browse-by rails — size is a product attribute, never the navigation. */
export const BROWSE_RAILS = [
  { label: "New Arrivals", handle: toPlusHandle("frass-new-arrivals") },
  { label: "Best Sellers", handle: toPlusHandle("frass-best-sellers") },
  { label: "By Occasion", handle: toPlusHandle("frass-occasion") },
  { label: "By Lifestyle", handle: toPlusHandle("frass-lifestyle") },
] as const;

/** The three mirrored stores presented on the Frass Plus landing page. */
export const MIRRORED_STORES = [
  {
    key: "kicks",
    title: "Frass Kicks",
    blurb: "Casual, Classic and Street — the same wall, in extended widths and fits.",
    image: wingMen,
  },
  {
    key: "drip",
    title: "Frass Drip",
    blurb: "Work, Party, Casual, Street, Vacay, Sport, Crown and Extra — department for department.",
    image: wingWomen,
  },
  {
    key: "bare",
    title: "Bare Drip",
    blurb: "Underwear, Lingerie and Swim — the same rooms, thoughtfully extended.",
    image: edW3,
  },
] as const;
