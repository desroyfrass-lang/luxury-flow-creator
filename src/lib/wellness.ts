// FRASS-0413 — Frass Health & Wellness Centre
//
// One umbrella, two very different things underneath it:
//
//   · Frass Wellness      — free. Everyday care: herbs, movement, rest, food,
//                           mental steadiness. Community knowledge, not medicine.
//   · Frass Care Network  — a directory of real, verified professionals you can
//                           book. Doctors, therapists, nutritionists, coaches.
//
// Aesthetic: the mountain herbalist in the greenery. Not a clinic. Not a spa.
// A place up the hill where the air is cooler and someone knows what the leaves
// are for.
//
// Plain English: the free side is "what grandma and good habits give you".
// The paid side is "when you need someone qualified, here's how to find them".

export type WellnessArmId = "wellness" | "care_network";

export type WellnessArm = {
  id: WellnessArmId;
  name: string;
  tagline: string;
  /** Expert framing. */
  what: string;
  /** The plain-English translation. Never leave the expert line alone. */
  plain: string;
  access: "Free for everyone" | "Book & pay the professional";
  glyph: string;
};

export const WELLNESS_ARMS: WellnessArm[] = [
  {
    id: "wellness",
    name: "Frass Wellness",
    tagline: "Everyday care, freely given.",
    what:
      "Preventative, non-clinical wellbeing: herbal knowledge, movement, sleep, nutrition, breathing and mental steadiness — held as community knowledge and kept open to every member.",
    plain:
      "This is the free side. Tea, rest, food, walking, breathing, talking it out. The things that keep you well before anything goes wrong.",
    access: "Free for everyone",
    glyph: "🌿",
  },
  {
    id: "care_network",
    name: "Frass Care Network",
    tagline: "Verified professionals, when you need one.",
    what:
      "A vetted directory of licensed and credentialed practitioners — physicians, therapists, nutritionists, physiotherapists, midwives and wellness coaches — with credentials on file and transparent pricing.",
    plain:
      "This is the paid side. Real qualified people you can book. Frass checks they are who they say they are; you pay them, not us.",
    access: "Book & pay the professional",
    glyph: "🩺",
  },
];

export type WellnessRoom = {
  id: string;
  arm: WellnessArmId;
  glyph: string;
  name: string;
  does: string;
  plain: string;
};

/** The buildings inside the Centre. You walk into rooms, not categories. */
export const WELLNESS_ROOMS: WellnessRoom[] = [
  {
    id: "herb_house",
    arm: "wellness",
    glyph: "🍃",
    name: "The Herb House",
    does: "Caribbean bush medicine documented properly — plant, use, preparation, cautions and who should avoid it.",
    plain: "What the leaves are for, written down so it doesn't get lost.",
  },
  {
    id: "movement_yard",
    arm: "wellness",
    glyph: "🧘🏾",
    name: "Movement Yard",
    does: "Guided movement, stretching, breathwork and low-impact routines you can do without equipment.",
    plain: "Free workouts and stretches that need nothing but floor space.",
  },
  {
    id: "kitchen_table",
    arm: "wellness",
    glyph: "🍲",
    name: "The Kitchen Table",
    does: "Nutrition built around food that's actually grown and sold in the Farm District.",
    plain: "Eating well using what's in season here — not an imported diet plan.",
  },
  {
    id: "quiet_room",
    arm: "wellness",
    glyph: "🕯",
    name: "The Quiet Room",
    does: "Mental steadiness: journalling prompts, grounding exercises, sleep routines and a check-in with Frassy.",
    plain: "A place to slow your head down. No diagnosis, no judgement.",
  },
  {
    id: "artist_hub",
    arm: "wellness",
    glyph: "🎧",
    name: "Artist Wellness Hub",
    does: "Built for creators: vocal and hearing care, tour recovery, performance nerves, burnout and the pressure of publishing your work.",
    plain: "Looking after the people making the music, the videos and the drops — the work eats you if nobody watches.",
  },
  {
    id: "growers_desk",
    arm: "wellness",
    glyph: "🌱",
    name: "Growers' Desk",
    does: "Farm District integration: what's being harvested this week, its wellness use, and the grower who produced it.",
    plain: "Straight line from the field to your cup, and the farmer gets named.",
  },
  {
    id: "practitioner_directory",
    arm: "care_network",
    glyph: "📖",
    name: "Practitioner Directory",
    does: "Search verified professionals by discipline, language, market and price band. Credentials shown, never implied.",
    plain: "The list of qualified people, with proof they're qualified.",
  },
  {
    id: "consultation_rooms",
    arm: "care_network",
    glyph: "🚪",
    name: "Consultation Rooms",
    does: "Book in person or remotely. Notes and appointments stay in your Vault, visible only to you.",
    plain: "Make the appointment here; your records stay yours.",
  },
  {
    id: "practitioner_intake",
    arm: "care_network",
    glyph: "🪪",
    name: "Practitioner Intake",
    does: "Apply to join the network. Licence verification, references and a standards agreement before any listing goes live.",
    plain: "How a professional joins — and the checks they pass first.",
  },
];

/** The line the Centre must never cross. Shown on the page, not buried. */
export const CARE_BOUNDARY =
  "Frass Wellness is community knowledge, not medical advice. Nothing here diagnoses, treats or replaces a professional. For anything clinical, urgent or ongoing, use the Care Network — or your emergency service.";

export const WELLNESS_PRINCIPLE =
  "Wellness is not a product line. It is the condition every other district depends on — a Builder who is unwell builds nothing.";

export const WELLNESS_FEELING = [
  "Cool mountain air",
  "Green, quiet, unhurried",
  "Someone who knows the plants",
  "Nothing rushed, nothing sold to you",
];

export function roomsForArm(arm: WellnessArmId) {
  return WELLNESS_ROOMS.filter((r) => r.arm === arm);
}
