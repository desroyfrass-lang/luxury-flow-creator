// FRASS-0911 — Discovery Before Destination
//
// Frass Hill is not navigated. It is walked.
//
// This module holds the movement layer of the town: the life you pass on the way,
// the way one district blends into the next, the hour and the weather, and the
// town's memory of you. None of it is a destination. All of it is why the place
// is worth remembering.

export const DISCOVERY_PRINCIPLE =
  "Every destination should first be experienced from a distance, inviting curiosity before interaction.";

export const MOVEMENT_PRINCIPLE =
  "Every journey through Frass Hill should reward curiosity. People shouldn't always take the shortest path — sometimes the longer walk is the better experience.";

export const TRANSITION_PRINCIPLE =
  "Districts have no hard borders. They blend. The district changes before the sign tells you it changed.";

/** Placemaking questions — the standard a district is measured against. */
export const PLACEMAKING_QUESTIONS = [
  "How fast do people walk?",
  "Can they stop anywhere?",
  "What happens if they don't click anything?",
  "Are there benches?",
  "Can someone sit in the café and simply watch Frass Hill?",
  "Do birds fly overhead?",
  "Does the music change as you approach Studio District?",
  "Can you hear dominoes before you see the players?",
  "Do lights slowly come on at sunset?",
] as const;

/* ------------------------------------------------------------------ *
 * Street life — things you pass. Never destinations. Never clickable. *
 * ------------------------------------------------------------------ */

export type StreetMoment = {
  /** What you notice. Written as a sight, a sound or a smell — never a label. */
  moment: string;
  /** sight · sound · scent · people */
  sense: "sight" | "sound" | "scent" | "people";
};

export const STREET_LIFE: Record<string, StreetMoment[]> = {
  town_square: [
    { moment: "Dominoes slapping a wooden table two corners before you see the players", sense: "sound" },
    { moment: "Coffee steam off a small stand, cardamom and burnt sugar", sense: "scent" },
    { moment: "An old man reading the noticeboard out loud to whoever will listen", sense: "people" },
    { moment: "Bunting still up from last month's festival, faded gold", sense: "sight" },
    { moment: "Children counting change for a Foundation lemonade table", sense: "people" },
    { moment: "A dog asleep under the almond tree, entirely unbothered", sense: "sight" },
  ],
  kids: [
    { moment: "A kite snagged high in a poinciana, still trying", sense: "sight" },
    { moment: "Skipping rhymes drifting over the wall before the gate appears", sense: "sound" },
    { moment: "Chalk hopscotch half washed away by yesterday's rain", sense: "sight" },
    { moment: "Someone's mother calling a name across the yard, twice", sense: "people" },
  ],
  kicks: [
    { moment: "Shopfront lights coming on one by one along the promenade", sense: "sight" },
    { moment: "A shoebox lid being lifted — that particular paper sound", sense: "sound" },
    { moment: "Two friends arguing colourways outside the window", sense: "people" },
    { moment: "Fresh leather and new cardboard from a propped-open door", sense: "scent" },
  ],
  luxury: [
    { moment: "Gravel underfoot changing to stone at the estate gate", sense: "sound" },
    { moment: "Jasmine and cut grass off the botanical garden wall", sense: "scent" },
    { moment: "A tailor's chalk line visible through a lit atelier window", sense: "sight" },
    { moment: "Someone being greeted by name, quietly", sense: "people" },
  ],
  studio: [
    { moment: "Bass through a wall you can feel in your chest before you hear it", sense: "sound" },
    { moment: "A mural half-finished, ladder still against it", sense: "sight" },
    { moment: "Two players carrying a guitar and a pan case up the hill", sense: "people" },
    { moment: "A steel pan being tuned — the same note, forty times", sense: "sound" },
  ],
  builders: [
    { moment: "Someone carving wood on a stool outside their shop", sense: "people" },
    { moment: "Sawdust and cut cedar hanging in the warm air", sense: "scent" },
    { moment: "Two builders arguing over a blueprint spread on a tailgate", sense: "people" },
    { moment: "A crane catching the last of the light above the roofline", sense: "sight" },
    { moment: "Hammering, then a pause, then laughing", sense: "sound" },
  ],
  farm: [
    { moment: "Fields going green all the way to the horizon", sense: "sight" },
    { moment: "Wet soil and cut cane after morning rain", sense: "scent" },
    { moment: "A truck of crates rattling down toward the market", sense: "sound" },
    { moment: "Someone handing you something to taste without asking", sense: "people" },
  ],
  founder: [
    { moment: "The hall standing above everything, visible from most of the town", sense: "sight" },
    { moment: "Wind through the ironwork on the long approach", sense: "sound" },
    { moment: "Names cut into stone, still being added to", sense: "sight" },
    { moment: "Birds circling the roof, unhurried", sense: "sight" },
  ],
};

export function streetLifeIn(districtId: string): StreetMoment[] {
  return STREET_LIFE[districtId] ?? [];
}

/* ---------------------------------------------------------- *
 * District blends — how one place becomes the next, in order *
 * ---------------------------------------------------------- */

export type DistrictBlend = {
  from: string;
  to: string;
  /** Ordered — the walk from one district into the next. */
  stages: string[];
};

export const DISTRICT_BLENDS: DistrictBlend[] = [
  {
    from: "town_square",
    to: "studio",
    stages: [
      "You begin hearing music",
      "Then you see murals",
      "Then people carrying guitars and pan cases",
      "Then rehearsal rooms with their doors open",
      "You're in the Studio District",
    ],
  },
  {
    from: "town_square",
    to: "builders",
    stages: [
      "The pavement gives way to gravel",
      "Someone is carving wood outside a shop",
      "Two builders are arguing over a blueprint",
      "Sawdust, cut cedar, a crane above the roofline",
      "You're in Builders Village",
    ],
  },
  {
    from: "town_square",
    to: "kicks",
    stages: [
      "Shopfront lights start showing through the trees",
      "Window displays, then more windows",
      "Music from a doorway, bags in hands",
      "The promenade opens in front of you",
      "You're in the Frass District",
    ],
  },
  {
    from: "town_square",
    to: "kids",
    stages: [
      "You start hearing children before you see any",
      "A kite over the trees",
      "Chalk on the path, a lost sandal",
      "The gate, painted by someone small",
      "You're in Children's Village",
    ],
  },
  {
    from: "kicks",
    to: "luxury",
    stages: [
      "The street quiets",
      "Hedges instead of shopfronts",
      "Gravel underfoot, then stone",
      "Jasmine over a wall, a gate standing open",
      "You're at the Frass Luxury House",
    ],
  },
  {
    from: "town_square",
    to: "farm",
    stages: [
      "The buildings thin out",
      "Fences, then fields",
      "A truck of crates coming the other way",
      "Green to the horizon",
      "You're in the Farm District",
    ],
  },
  {
    from: "town_square",
    to: "founder",
    stages: [
      "The road starts climbing",
      "The town gets smaller behind you",
      "Ironwork, wind, cut stone",
      "The hall above everything",
      "You're at Founder Hall",
    ],
  },
];

export function blendBetween(from: string, to: string) {
  return (
    DISTRICT_BLENDS.find((b) => b.from === from && b.to === to) ??
    DISTRICT_BLENDS.find((b) => b.from === to && b.to === from)
  );
}

export function blendsFrom(from: string) {
  return DISTRICT_BLENDS.filter((b) => b.from === from);
}

/* ------------------------------------- *
 * Living time — the hour and the season *
 * ------------------------------------- */

export type HillHour = "dawn" | "morning" | "afternoon" | "evening" | "night";

export type HillAtmosphere = {
  id: HillHour;
  label: string;
  /** What the town feels like at this hour. */
  mood: string;
  /** What you notice at this hour specifically. */
  detail: string;
  /** CSS gradient overlay for the town plan hero. */
  wash: string;
};

export const HILL_HOURS: HillAtmosphere[] = [
  {
    id: "dawn",
    label: "Dawn",
    mood: "The town is still deciding whether it's awake.",
    detail: "Bread somewhere. Shutters going up. The hill still blue.",
    wash: "linear-gradient(to top, rgba(20,26,44,0.75), rgba(120,110,150,0.18) 55%, transparent)",
  },
  {
    id: "morning",
    label: "Morning",
    mood: "Everything opens at once.",
    detail: "Deliveries, school shoes, coffee, the market filling up.",
    wash: "linear-gradient(to top, rgba(18,22,28,0.65), rgba(255,214,150,0.14) 55%, transparent)",
  },
  {
    id: "afternoon",
    label: "Afternoon",
    mood: "Heat, shade, and the slow part of the day.",
    detail: "Dominoes under the almond tree. Nobody in a hurry.",
    wash: "linear-gradient(to top, rgba(16,18,22,0.6), rgba(255,180,90,0.12) 55%, transparent)",
  },
  {
    id: "evening",
    label: "Evening",
    mood: "The lights come on one at a time, not all at once.",
    detail: "Shopfronts glowing gold. Music finding its volume.",
    wash: "linear-gradient(to top, rgba(12,12,18,0.8), rgba(212,175,55,0.16) 50%, transparent)",
  },
  {
    id: "night",
    label: "Night",
    mood: "Quieter, but never empty.",
    detail: "A studio still running. Someone walking home singing.",
    wash: "linear-gradient(to top, rgba(6,8,14,0.9), rgba(90,120,180,0.14) 55%, transparent)",
  },
];

export function hourOf(date = new Date()): HillHour {
  const h = date.getHours();
  if (h < 6) return "night";
  if (h < 9) return "dawn";
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  if (h < 21) return "evening";
  return "night";
}

export function atmosphereAt(date = new Date()): HillAtmosphere {
  const id = hourOf(date);
  return HILL_HOURS.find((a) => a.id === id) ?? HILL_HOURS[2]!;
}

/** Days the whole town feels different. */
export type HillOccasion = { name: string; feels: string; month: number; day?: number };

export const HILL_OCCASIONS: HillOccasion[] = [
  { name: "Emancipation Day", feels: "Drums from early. The whole hill walking together.", month: 8, day: 1 },
  { name: "Harvest Festival", feels: "Crates in the square. The Farm District comes to town.", month: 10 },
  { name: "Founder's Day", feels: "The hall is open to everybody. Names read out loud.", month: 11 },
  { name: "Christmas", feels: "Lights strung across the square. Sorrel, ham, and too much music.", month: 12 },
];

export function occasionOn(date = new Date()): HillOccasion | undefined {
  const m = date.getMonth() + 1;
  const d = date.getDate();
  return HILL_OCCASIONS.find((o) => o.month === m && (o.day === undefined || o.day === d));
}

/* ----------------------------- *
 * Memory — the town remembers you
 * ----------------------------- */

const VISIT_KEY = "frass-hill:visits";

type VisitLog = Record<string, { at: number; note?: string }>;

function readVisits(): VisitLog {
  if (typeof localStorage === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(VISIT_KEY) ?? "{}") as VisitLog;
  } catch {
    return {};
  }
}

export function rememberVisit(districtId: string, note?: string) {
  if (typeof localStorage === "undefined") return;
  const log = readVisits();
  log[districtId] = { at: Date.now(), note };
  try {
    localStorage.setItem(VISIT_KEY, JSON.stringify(log));
  } catch {
    /* storage full or blocked — the town simply forgets */
  }
}

function ago(ms: number) {
  const days = Math.floor((Date.now() - ms) / 86_400_000);
  if (days <= 0) return "earlier today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return "a while back";
}

/** Frassy's quiet line when you come back to a place you've been. */
export function memoryOf(districtId: string): string | null {
  const v = readVisits()[districtId];
  if (!v) return null;
  if (v.note) return `Last time you were here ${ago(v.at)}, you were working on ${v.note}.`;
  return `You were last here ${ago(v.at)}.`;
}
