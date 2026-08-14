// FRASS-0444 — The Frass Hill Walk.
// The optional, scroll-driven journey through Frass Hill: an arrival arch, a valley,
// a town square, the studio street, the overlook, the Luxury House and the bridal gardens.
// Every stop is a real place with real doors into the platform.

import archImg from "@/assets/hill-journey-01-arch.jpg";
import valleyImg from "@/assets/hill-journey-02-valley.jpg";
import squareImg from "@/assets/hill-journey-03-square.jpg";
import studiosImg from "@/assets/hill-journey-04-studios.jpg";
import overlookImg from "@/assets/hill-journey-05-overlook.jpg";
import luxuryImg from "@/assets/hill-journey-06-luxury.jpg";
import bridalImg from "@/assets/hill-journey-07-bridal.jpg";

export type HillDoor = {
  label: string;
  to: string;
  note: string;
};

export type HillStop = {
  id: string;
  /** Altitude label — the walk runs low (valley) to high (gardens). */
  altitude: string;
  name: string;
  eyebrow: string;
  line: string;
  plain: string;
  image: string;
  /** Which ambient life layers play over this scene. */
  life: Array<"clouds" | "birds" | "smoke" | "water" | "leaves" | "lights" | "haze">;
  /** Focal point for the slow camera push. */
  origin: string;
  doors: HillDoor[];
};

export const HILL_STOPS: HillStop[] = [
  {
    id: "arch",
    altitude: "The Gate",
    name: "Welcome Hall",
    eyebrow: "You have arrived",
    line: "The arch, the fountain, the first view of everything waiting past it.",
    plain:
      "Here's what this means: this is the front door. You stop here once, you're welcomed, and then the whole town is open to you.",
    image: archImg,
    life: ["clouds", "birds", "leaves", "water"],
    origin: "50% 55%",
    doors: [
      { label: "Register at the Welcome Hall", to: "/welcome-hall", note: "Your card, your workspace, your Daily" },
      { label: "Frass Hill town plan", to: "/frass-hill", note: "The plain interface, any time" },
    ],
  },
  {
    id: "valley",
    altitude: "The Valley",
    name: "Children's Village",
    eyebrow: "Down in the valley",
    line: "The waterfall, the learning gardens, the pavilions where the children are.",
    plain:
      "Here's the idea: everything made for kids lives down here — things to do, and things to buy.",
    image: valleyImg,
    life: ["water", "leaves", "birds", "haze"],
    origin: "45% 60%",
    doors: [
      { label: "Kids World", to: "/kids-world", note: "Activities, stories and learning" },
      { label: "Frass Kids shop", to: "/frass-kids", note: "The children's department" },
      { label: "Kids Valley", to: "/kids-valley", note: "The district itself" },
    ],
  },
  {
    id: "square",
    altitude: "The Square",
    name: "Town Square",
    eyebrow: "Where the town meets",
    line: "Market awnings, jerk smoke drifting, the fountain, somebody always talking.",
    plain:
      "Here's how it works: this is the community centre — people, stories, and what's happening today.",
    image: squareImg,
    life: ["smoke", "clouds", "leaves"],
    origin: "50% 62%",
    doors: [
      { label: "Town Square", to: "/town-square", note: "Notices, gatherings, neighbours" },
      { label: "For Us", to: "/for-us", note: "Community stories and broadcasts" },
      { label: "Frass District", to: "/frass-district", note: "The shopping district, straight ahead" },
    ],
  },
  {
    id: "studios",
    altitude: "Studio Street",
    name: "FV Studios & Frass Radio",
    eyebrow: "Walking past the studio",
    line: "Records on the wall, the red light on, somebody carrying a guitar case in.",
    plain:
      "Let's break it down: this is where music, video and radio get made and played.",
    image: studiosImg,
    life: ["lights", "haze"],
    origin: "58% 55%",
    doors: [
      { label: "FV Studios", to: "/fv-studios", note: "Video production suite" },
      { label: "Frass Radio", to: "/frass-radio", note: "Stations, shows and Originals" },
      { label: "Music & Media", to: "/music-media", note: "The whole media house" },
    ],
  },
  {
    id: "overlook",
    altitude: "The Ridge",
    name: "The Overlook",
    eyebrow: "Standing on the hill",
    line: "From up here you can see the square, the valley, the district and the sea.",
    plain:
      "Here's the practical version: the map view. Everywhere you've been and everywhere left to go.",
    image: overlookImg,
    life: ["clouds", "birds", "leaves"],
    origin: "50% 50%",
    doors: [
      { label: "Frass Hill", to: "/frass-hill", note: "The full town plan" },
      { label: "Health & Wellness", to: "/health-wellness", note: "The gardens on the far ridge" },
      { label: "The Liquidation Room", to: "/sales-clearance", note: "Down the back road" },
    ],
  },
  {
    id: "luxury",
    altitude: "The Summit",
    name: "Frass Luxury House",
    eyebrow: "Through the garden, to the doors",
    line: "The reflecting channel, the orchids, the tall glass doors held open for you.",
    plain:
      "Here's the takeaway: the flagship house — the most considered pieces in the whole town.",
    image: luxuryImg,
    life: ["leaves", "clouds", "lights"],
    origin: "50% 58%",
    doors: [
      { label: "Frass Luxury House", to: "/frass-luxury-house", note: "East and West wings" },
      { label: "Frass Drip", to: "/frass-drip", note: "Men's and women's drip" },
      { label: "Bare Drip", to: "/bare-drip", note: "Swim and intimates" },
    ],
  },
  {
    id: "bridal",
    altitude: "The Gardens",
    name: "Bridal Gardens",
    eyebrow: "Round the back, quietly",
    line: "The flower arbour, the candles, the conservatory set for a wedding.",
    plain:
      "Here's what this means: the bridal world — the whole wedding, not just the dress.",
    image: bridalImg,
    life: ["lights", "haze", "leaves"],
    origin: "42% 55%",
    doors: [
      { label: "Frass Bridal", to: "/bridal", note: "The Wedding Village" },
      { label: "Bridal Boutique", to: "/bridal-boutique", note: "The gowns themselves" },
      { label: "The Walk", to: "/bridal/walk", note: "Your aisle, rehearsed" },
    ],
  },
];

export const WALK_PRINCIPLE =
  "The walk is an invitation, never a toll gate. Frass Hill's plain interface is always one tap away.";
