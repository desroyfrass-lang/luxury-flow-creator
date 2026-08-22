// ─────────────────────────────────────────────────────────────────────────────
// Frassy's wardrobe — FRASS-0581.
//
// Frassy is never a stock icon. She is an illustrated Caribbean woman, and
// everything she wears is a real Frass item: her clothes come from the Frost
// District collection, her hair comes from the Hair Collection.
//
// Two things decide her look:
//   1. The ROOM she is standing in (Builders Hall, The Daily, Workshop,
//      Financial Freedom, Celebration).
//   2. The DAY — inside each room her pieces rotate on a daily cycle, so she is
//      never wearing the same thing two days running.
//
// Plain English: this file is Frassy's closet. Each outfit and hairstyle points
// at something a Partner can actually buy. Nothing here invents a product page
// that does not exist — where a collection is not stocked yet, the piece says so.
// ─────────────────────────────────────────────────────────────────────────────

import lookHall from "@/assets/frassy-look-hall.jpg.asset.json";
import lookDaily from "@/assets/frassy-look-daily.jpg.asset.json";
import lookWorkshop from "@/assets/frassy-look-workshop.jpg.asset.json";
import lookBoss from "@/assets/frassy-look-boss.jpg.asset.json";
import lookGlam from "@/assets/frassy-look-glam.jpg.asset.json";

export type FrassyRoom = "hall" | "daily" | "workshop" | "freedom" | "celebration";

/** A shoppable piece Frassy is wearing. */
export type WardrobePiece = {
  name: string;
  detail: string;
  /** Collection handle inside the store, when the piece is stocked. */
  handle?: string;
  /** Set when the piece is designed but the drop has not landed yet. */
  comingSoon?: boolean;
};

export type FrassyLook = {
  room: FrassyRoom;
  /** Short name of the look, shown under her. */
  title: string;
  /** Why she is dressed this way, in plain English. */
  mood: string;
  image: string;
  alt: string;
  /** Frost District pieces — tap her outfit to see these. */
  outfit: WardrobePiece[];
  /** Hair Collection unit — tap her hair to see this. */
  hair: WardrobePiece;
};

/** Where her wardrobe lives in the store. */
export const FROST_DISTRICT_HANDLE = "frost-district";
export const HAIR_COLLECTION_HANDLE = "hair-collection";
/** What is stocked today, so nothing links into an empty room. */
export const LIVE_COLLECTION_HANDLE = "frass-kicks-women";

const HAIR: Record<string, WardrobePiece[]> = {
  hall: [
    { name: "Sunday Best Curl Updo", detail: "Kinky curly · 18\" · natural 1B", handle: HAIR_COLLECTION_HANDLE, comingSoon: true },
    { name: "Hill Curl Pineapple", detail: "Kinky curly · 20\" · natural 1B", handle: HAIR_COLLECTION_HANDLE, comingSoon: true },
  ],
  daily: [
    { name: "Clean Slate Low Bun", detail: "Straight silk · 16\" · natural 1B", handle: HAIR_COLLECTION_HANDLE, comingSoon: true },
    { name: "Morning Sleek Ponytail", detail: "Straight silk · 22\" · natural 1B", handle: HAIR_COLLECTION_HANDLE, comingSoon: true },
  ],
  workshop: [
    { name: "Builder Braids", detail: "Knotless box braids · 28\" · 1B/gold cuffs", handle: HAIR_COLLECTION_HANDLE, comingSoon: true },
    { name: "Workshop Twist Out", detail: "Loose wave · 20\" · natural 1B", handle: HAIR_COLLECTION_HANDLE, comingSoon: true },
  ],
  freedom: [
    { name: "Freedom Silk Bob", detail: "Bone straight · 12\" · jet 1", handle: HAIR_COLLECTION_HANDLE, comingSoon: true },
    { name: "Boss Blunt Cut", detail: "Bone straight · 14\" · jet 1", handle: HAIR_COLLECTION_HANDLE, comingSoon: true },
  ],
  celebration: [
    { name: "Celebration Blowout", detail: "Body wave · 24\" · natural 1B", handle: HAIR_COLLECTION_HANDLE, comingSoon: true },
    { name: "Gold Night Curls", detail: "Deep wave · 26\" · natural 1B", handle: HAIR_COLLECTION_HANDLE, comingSoon: true },
  ],
};

const BASE: Record<FrassyRoom, Omit<FrassyLook, "hair"> & { hairKey: string }> = {
  hall: {
    room: "hall",
    title: "Her Builders Hall look",
    mood: "Cosy but elevated — the way you dress to welcome somebody home.",
    image: lookHall.url,
    alt: "Frassy in a black and gold Frass Kicks tracksuit, welcoming you into the Builders Hall",
    hairKey: "hall",
    outfit: [
      { name: "Frost District Track Jacket", detail: "Black · gold piping · unisex", handle: FROST_DISTRICT_HANDLE, comingSoon: true },
      { name: "Frass Kicks Signature Tank", detail: "Black · gold wordmark", handle: FROST_DISTRICT_HANDLE, comingSoon: true },
      { name: "Frost Gold Hoops", detail: "18k plated · 50mm", handle: FROST_DISTRICT_HANDLE, comingSoon: true },
    ],
  },
  daily: {
    room: "daily",
    title: "Her Daily look",
    mood: "Organised and ready to work — nothing in the way of the first move.",
    image: lookDaily.url,
    alt: "Frassy in a black ribbed zip knit holding a tablet, ready for the Daily",
    hairKey: "daily",
    outfit: [
      { name: "Frost Ribbed Zip Knit", detail: "Black · gold zip pull", handle: FROST_DISTRICT_HANDLE, comingSoon: true },
      { name: "Frass Medallion Chain", detail: "Gold plated · 18\"", handle: FROST_DISTRICT_HANDLE, comingSoon: true },
    ],
  },
  workshop: {
    room: "workshop",
    title: "Her Builders look",
    mood: "Sleeves up. This is the room where things actually get made.",
    image: lookWorkshop.url,
    alt: "Frassy in an oversized black Frost District hoodie with long braids, in the Workshop",
    hairKey: "workshop",
    outfit: [
      { name: "Frost District Heavy Hoodie", detail: "Black · gold crown emblem · oversized", handle: FROST_DISTRICT_HANDLE, comingSoon: true },
      { name: "Builder Gold Cuff", detail: "Engraved brass · gold finish", handle: FROST_DISTRICT_HANDLE, comingSoon: true },
    ],
  },
  freedom: {
    room: "freedom",
    title: "Her Boss look",
    mood: "Sleek and prosperous — the look of money that has somewhere to go.",
    image: lookBoss.url,
    alt: "Frassy in a black tailored blazer with gold lapel trim at the Financial Freedom tracker",
    hairKey: "freedom",
    outfit: [
      { name: "Frost Gold-Trim Blazer", detail: "Black · gold lapel · tailored", handle: FROST_DISTRICT_HANDLE, comingSoon: true },
      { name: "Frost Silk Shell", detail: "Black · cowl neck", handle: FROST_DISTRICT_HANDLE, comingSoon: true },
      { name: "Frost Gold Bar Earrings", detail: "18k plated · drop", handle: FROST_DISTRICT_HANDLE, comingSoon: true },
    ],
  },
  celebration: {
    room: "celebration",
    title: "Her glam look",
    mood: "Somebody won today. She dressed for it.",
    image: lookGlam.url,
    alt: "Frassy in a black satin slip gown with gold chain straps, celebrating",
    hairKey: "celebration",
    outfit: [
      { name: "Frost Satin Slip Gown", detail: "Black · gold chain straps", handle: FROST_DISTRICT_HANDLE, comingSoon: true },
      { name: "Frost Chandelier Earrings", detail: "Gold plated · statement", handle: FROST_DISTRICT_HANDLE, comingSoon: true },
    ],
  },
};

/** Same day, same look for everybody — it turns over at midnight, local time. */
export function dayIndex(date = new Date()): number {
  const start = Date.UTC(date.getFullYear(), 0, 0);
  const now = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.floor((now - start) / 86_400_000);
}

export function frassyLook(room: FrassyRoom, date = new Date()): FrassyLook {
  const base = BASE[room];
  const options = HAIR[base.hairKey] ?? HAIR.hall;
  const hair = options[dayIndex(date) % options.length];
  const { hairKey: _hairKey, ...rest } = base;
  return { ...rest, hair };
}

/** Where a piece sends the Partner when they tap it. */
export function pieceHandle(piece: WardrobePiece): string {
  if (!piece.handle || piece.comingSoon) return LIVE_COLLECTION_HANDLE;
  return piece.handle;
}
