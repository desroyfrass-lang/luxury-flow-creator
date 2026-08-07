// FRASS Kids World — a permanent district of Frass Hill.
//
// Kids World is NOT part of the shopping experience. Frass Kicks is simply one
// of several entrances. There is only ever ONE Kids World; the doors differ.

import worldHero from "@/assets/kids-world-hero.jpg";
import w03 from "@/assets/kids-world-0-3.jpg";
import w36 from "@/assets/kids-world-3-6.jpg";
import w612 from "@/assets/kids-world-6-12.jpg";
import w12 from "@/assets/kids-world-12-plus.jpg";

export const KIDS_WORLD_HERO = worldHero;

export interface KidsPlace {
  slug: string;
  emoji: string;
  title: string;
  blurb: string;
  /** Invitations to explore — never tasks, never scores. */
  invites: string[];
  /** An age-appropriate moment of kindness. Never a donation ask. */
  kindness: string;
}

export interface KidsAgeWorld {
  slug: string;
  ageLabel: string;
  emoji: string;
  title: string;
  tagline: string;
  spirit: string;
  image: string;
  /** CSS colour token or literal used as the world's accent light. */
  accent: string;
  places: KidsPlace[];
}

export const KIDS_WORLDS: KidsAgeWorld[] = [
  {
    slug: "0-3",
    ageLabel: "0–3",
    emoji: "👶",
    title: "The Gentle Garden",
    tagline: "Shapes, colours, animals and music — with a grown-up close by.",
    spirit:
      "Soft, slow and quiet. Nothing here needs reading, nothing rushes, and every corner is made to be explored beside a parent.",
    image: w03,
    accent: "var(--kids-coral, #ff8f7a)",
    places: [
      {
        slug: "colour-pond",
        emoji: "🎨",
        title: "Colour Pond",
        blurb: "Big soft shapes and colours that answer back when you touch them.",
        invites: ["Find the round ones", "Follow the colour trail", "Name the shapes out loud together"],
        kindness: "We share the pond with the little fish who live here.",
      },
      {
        slug: "animal-path",
        emoji: "🐢",
        title: "Animal Path",
        blurb: "Island animals to meet, one gentle sound at a time.",
        invites: ["Meet the hummingbird", "Listen for the tree frog", "Copy the animal sounds"],
        kindness: "Animals like quiet visitors best.",
      },
      {
        slug: "music-cradle",
        emoji: "🎶",
        title: "Music Cradle",
        blurb: "Steel-pan lullabies and shakers made for the smallest hands.",
        invites: ["Tap the pan", "Shake along", "Rock to the rhythm"],
        kindness: "Music is nicer when we make it together.",
      },
      {
        slug: "grown-up-corner",
        emoji: "🤝",
        title: "Grown-Up Corner",
        blurb: "Short things to do together — five calm minutes at a time.",
        invites: ["A song for the morning", "A shape hunt around the room", "A goodnight sound"],
        kindness: "Time together is the gift.",
      },
    ],
  },
  {
    slug: "3-6",
    ageLabel: "3–6",
    emoji: "🧒",
    title: "The Story Courtyard",
    tagline: "Stories, drawing, drumming and small brave puzzles.",
    spirit:
      "Curiosity first. Everything can be tried, nothing can be failed, and every story ends somewhere kind.",
    image: w36,
    accent: "var(--kids-turquoise, #4ec9c1)",
    places: [
      {
        slug: "story-corner",
        emoji: "📖",
        title: "Story Corner",
        blurb: "Caribbean tales told under the flamboyant tree.",
        invites: ["Hear a story", "Pick what happens next", "Tell one back"],
        kindness: "Every story has someone who needed a friend.",
      },
      {
        slug: "creative-studio",
        emoji: "🖌️",
        title: "Creative Studio",
        blurb: "Easels, chalk paths and colours you can't use wrong.",
        invites: ["Draw your island", "Chalk the courtyard", "Make something for someone"],
        kindness: "Making something for another person feels good.",
      },
      {
        slug: "music-garden",
        emoji: "🥁",
        title: "Music Garden",
        blurb: "Drums, shakers and a whole garden that keeps time.",
        invites: ["Find the beat", "Start a rhythm", "Play with a friend"],
        kindness: "Good bands listen as much as they play.",
      },
      {
        slug: "puzzle-bridge",
        emoji: "🧩",
        title: "Puzzle Bridge",
        blurb: "Little problems worth solving, with no timer anywhere.",
        invites: ["Match the pairs", "Cross the bridge", "Try another way"],
        kindness: "It's alright to ask for help.",
      },
    ],
  },
  {
    slug: "6-12",
    ageLabel: "6–12",
    emoji: "🧑",
    title: "The Discovery Village",
    tagline: "Science, arts, building, reading, sport and team adventures.",
    spirit:
      "A village to roam. Big questions, real projects and trails that go somewhere — explored at your own pace.",
    image: w612,
    accent: "var(--kids-sun, #ffc94d)",
    places: [
      {
        slug: "discovery-lab",
        emoji: "🔬",
        title: "Discovery Lab",
        blurb: "Open-air science — reefs, weather, stars and how things work.",
        invites: ["Run an experiment", "Ask a big question", "Log what you noticed"],
        kindness: "Knowing how the reef works helps us protect it.",
      },
      {
        slug: "learning-village",
        emoji: "🏫",
        title: "Learning Village",
        blurb: "Reading veranda, maths yard and a library that stays open late.",
        invites: ["Read on the veranda", "Take on a challenge", "Teach someone what you learned"],
        kindness: "Teaching a friend is a kind of giving.",
      },
      {
        slug: "maker-workshop",
        emoji: "🛠️",
        title: "Maker Workshop",
        blurb: "Build it, break it, build it better.",
        invites: ["Start a build", "Fix something", "Show your work"],
        kindness: "Repairing is better than replacing.",
      },
      {
        slug: "adventure-trails",
        emoji: "🥾",
        title: "Adventure Trails",
        blurb: "Hill paths, river crossings and maps you draw yourself.",
        invites: ["Pick a trail", "Map what you find", "Bring a friend"],
        kindness: "Leave the trail better than you found it.",
      },
      {
        slug: "sports-field",
        emoji: "⚽",
        title: "Sports Field",
        blurb: "Cricket, football, athletics — and a lot of shouting.",
        invites: ["Join a team", "Train a skill", "Play a match"],
        kindness: "Good teams lift the person having a bad day.",
      },
      {
        slug: "community-park",
        emoji: "🌳",
        title: "Community Park",
        blurb: "Where the village meets — projects, clean-ups and celebrations.",
        invites: ["Join a park project", "Plant something", "Celebrate someone"],
        kindness: "A park belongs to everyone who cares for it.",
      },
    ],
  },
  {
    slug: "12-plus",
    ageLabel: "12+",
    emoji: "🌟",
    title: "The Young Builders Quarter",
    tagline: "Entrepreneurship, money sense, design, media and leadership.",
    spirit:
      "The bridge into the Builder Journey. Real skills, real ideas, and the beginning of the work you'll be known for.",
    image: w12,
    accent: "var(--hill-gold, #d4af37)",
    places: [
      {
        slug: "builder-corner",
        emoji: "🧠",
        title: "Builder Corner",
        blurb: "Turn an idea into a first plan — the way Builders do it upstairs in Frass Hill.",
        invites: ["Shape an idea", "Write a one-page plan", "Pitch it to someone you trust"],
        kindness: "The best ideas solve someone else's problem.",
      },
      {
        slug: "money-sense",
        emoji: "💡",
        title: "Money Sense",
        blurb: "Earning, saving, pricing and the honest maths behind a small business.",
        invites: ["Price something fairly", "Plan a savings goal", "Read a simple budget"],
        kindness: "Fair prices build long relationships.",
      },
      {
        slug: "design-studio",
        emoji: "🎧",
        title: "Design & Media Studio",
        blurb: "Design, photography, sound and story — the craft behind a brand.",
        invites: ["Design a mark", "Record something", "Tell your story in 60 seconds"],
        kindness: "Credit the people who helped you make it.",
      },
      {
        slug: "leadership-terrace",
        emoji: "🗣️",
        title: "Leadership Terrace",
        blurb: "Speaking, listening, running a team and handling a hard day.",
        invites: ["Practise a talk", "Run a small team", "Give useful feedback"],
        kindness: "Leadership is mostly listening.",
      },
      {
        slug: "service-project",
        emoji: "🤍",
        title: "Service Projects",
        blurb: "Skills pointed at the community — the Frass Hill way.",
        invites: ["Find a need", "Build something for it", "Bring others in"],
        kindness: "Service is building, aimed at other people.",
      },
    ],
  },
];

export function getKidsWorld(slug: string) {
  return KIDS_WORLDS.find((w) => w.slug === slug);
}

export function getKidsPlace(worldSlug: string, placeSlug: string) {
  const world = getKidsWorld(worldSlug);
  return world ? { world, place: world.places.find((p) => p.slug === placeSlug) } : null;
}

/** Shop segment slug (e.g. "6-12-girls") → Kids World age slug. */
export function ageSlugFromSegment(segment: string) {
  return segment.replace(/-(boys|girls)$/, "");
}
