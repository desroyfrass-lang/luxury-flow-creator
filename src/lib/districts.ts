// The districts of Frass Operating System.
// Client-safe definitions shared by the Welcome Hall and future district routes.

export type DistrictStatus = "open" | "building" | "planned";

export type District = {
  id: string;
  name: string;
  /** One plain-English line about what a Builder does here. */
  purpose: string;
  chapter: string;
  status: DistrictStatus;
  /** Route to enter, when the district is open. */
  to?: string;
};

export const DISTRICTS: District[] = [
  {
    id: "welcome_hall",
    name: "Welcome Hall",
    purpose: "Where every Builder arrives, sees their mission, and finds their next step.",
    chapter: "Arrival",
    status: "open",
    to: "/welcome-hall",
  },
  {
    id: "vault",
    name: "Builder Vault",
    purpose: "Your living archive — work, knowledge, and everything worth keeping.",
    chapter: "Continuity",
    status: "open",
    to: "/vault",
  },
  {
    id: "creation",
    name: "Creation District",
    purpose: "Where you make things — products, drops, designs, and content.",
    chapter: "Craft",
    status: "building",
  },
  {
    id: "opportunity",
    name: "Opportunity Center",
    purpose: "Financial intelligence, guided opportunity building, and scaling your business.",
    chapter: "Growth",
    status: "planned",
  },
  {
    id: "academy",
    name: "Academy District",
    purpose: "Builder Paths and project-based learning that teaches you as you build.",
    chapter: "Growth",
    status: "planned",
  },
  {
    id: "marketplace",
    name: "Marketplace District",
    purpose: "A trusted Builder Economy — sell, earn, and build real reputation.",
    chapter: "Growth",
    status: "planned",
  },
  {
    id: "community",
    name: "Community Square",
    purpose: "Builder Circles, collaboration, and the social heart of Frass.",
    chapter: "Society",
    status: "planned",
  },
  {
    id: "foundation",
    name: "Foundation District",
    purpose: "Service through building — the Impact Engine and giving back.",
    chapter: "Society",
    status: "planned",
  },
  {
    id: "executive",
    name: "Executive Tower",
    purpose: "Leadership, governance, and the institutional memory of your work.",
    chapter: "Society",
    status: "planned",
  },
];

/** Memory categories surfaced in the Welcome Hall, in the order they're shown. */
export const HALL_SECTIONS: { category: string; label: string; blurb: string }[] = [
  { category: "mission", label: "Your Mission", blurb: "The work you're here to do." },
  { category: "goals", label: "Your Goals", blurb: "The horizons you're building toward." },
  { category: "identity", label: "Your Identity", blurb: "Who Frass OS knows you as." },
  { category: "passport", label: "Your Passport", blurb: "Skills, proof, and what you're trusted with." },
  { category: "vault", label: "Your Vault", blurb: "How your work is organized." },
  { category: "workflows", label: "Your Workflows", blurb: "The work already in motion." },
  { category: "organizations", label: "Your Organizations", blurb: "Teams, brands, and collaborators." },
  { category: "marketplace", label: "Your Marketplace", blurb: "What you offer and to whom." },
  { category: "foundation", label: "Your Service", blurb: "How you give back." },
];
