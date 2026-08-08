// FRASS-0910 — Frass Hill District Functional Architecture
// Volume X — Experience & Design System Bible
//
// Every district has two identities: how it feels (emotional) and what people
// accomplish there (functional). This registry is the functional layer.
//
// Constitutional terminology (FRASS-0910):
//  · "Frass Builders"  — anyone building a business, project or opportunity ON the platform.
//  · "Skilled Builders" — tradespeople who physically build homes, roads, schools, communities.
// The bare word "Builder" is no longer used alone anywhere in Frass Hill.

export type HillDistrictStatus = "open" | "building" | "planned";

export type HillDistrict = {
  id: string;
  name: string;
  /** What happens here — answered in one sentence. If unclear, the district is incomplete. */
  purpose: string;
  /** Emotional identity: how should people feel? */
  feeling: string;
  /** Who uses this district. */
  audience: string;
  /** Frassy's professional expertise inside this district. Personality stays Frassy. */
  steward: string;
  /** Why would someone return tomorrow? */
  daily: string;
  /** How the district changes through the year. */
  seasonal: string;
  /** How it strengthens Frass. */
  contribution: string;
  /** The lasting value it creates. */
  legacy: string;
  functions: string[];
  connected: string[];
  /** Success measure. */
  success: string;
  /** Economic engines drive real commerce for the town. */
  engine?: boolean;
  status: HillDistrictStatus;
  to?: string;
};

export const HILL_DISTRICTS: HillDistrict[] = [
  {
    id: "childrens_village",
    name: "Children's Village",
    purpose:
      "Where children learn, explore, create, and gradually grow into confident young builders.",
    feeling: "Safe, bright, playful — a place a parent trusts and a child never wants to leave.",
    audience: "Children 0–12, teens 12+, and the parents who hold the passport.",
    steward: "Educator and child-safety guide.",
    daily: "A new activity, story, challenge or badge waiting on the passport.",
    seasonal: "Summer camps, back-to-school, harvest crafts, Christmas village.",
    contribution: "Raises the next generation of Frass builders inside the family.",
    legacy: "Family Vision Maps and childhood work kept in the Promise Vault for life.",
    functions: [
      "Educational activities",
      "Creative play",
      "Reading",
      "STEM",
      "Art",
      "Music",
      "Nature",
      "Family Vision Maps",
      "Parent Dashboard",
      "Child-safe creator tools",
      "Community challenges",
      "Mentorship",
      "Foundation educational support",
    ],
    connected: [
      "Kids Shop",
      "Family Vision Maps",
      "Foundation District",
      "Builder Academy",
      "Promise Vault",
      "Community Square",
    ],
    success: "Children leave more curious, more confident, and better prepared for the future.",
    status: "open",
    to: "/kids-world",
  },
  {
    id: "community_square",
    name: "Community Square",
    purpose: "The social heart of Frass Hill.",
    feeling: "Warm, alive, unmistakably Caribbean — music somewhere, people always around.",
    audience: "Every member of Frass Hill.",
    steward: "Host and community organiser.",
    daily: "Something is always happening — an announcement, a showcase, a tournament.",
    seasonal: "Festivals, carnival, independence, Christmas lights, New Year address.",
    contribution: "Turns members into neighbours.",
    legacy: "A recorded history of every celebration the town has held.",
    functions: [
      "Community announcements",
      "Public events",
      "Live music",
      "Domino tournaments",
      "Local showcases",
      "Festivals",
      "Founder broadcasts",
      "Community celebrations",
      "Seasonal decorations",
      "Local discussions",
      "Volunteer opportunities",
    ],
    connected: ["Foundation District", "Marketplace Pavilion", "Music Quarter", "DJ District", "Founder Hall"],
    success: "Members return because they feel connected.",
    status: "planned",
  },
  {
    id: "builder_academy",
    name: "Builder Academy",
    purpose: "Teach practical skills that create opportunity — free, for everyone.",
    feeling: "Encouraging campus, never a school you can fail out of.",
    audience: "Frass Builders and Skilled Builders alike.",
    steward: "Teacher and coach.",
    daily: "The next lesson on your Builder Path, and a streak worth keeping.",
    seasonal: "Term intakes, certification drives, apprenticeship season.",
    contribution: "Raises the standard of every trade and business in the town.",
    legacy: "A Skills Passport that follows a member for life.",
    functions: [
      "Free learning",
      "Courses",
      "Workshops",
      "Certifications",
      "AI coaching",
      "Builder Paths",
      "Skills Passport",
      "Portfolio building",
      "Practice projects",
      "Business education",
    ],
    connected: ["Skills Passport", "Opportunity Centre", "Marketplace Pavilion", "Builders Village", "Vision Maps"],
    success: "Learning becomes income, confidence, and opportunity.",
    status: "open",
    to: "/academy",
  },
  {
    id: "opportunity_centre",
    name: "Opportunity Centre",
    purpose: "Connect learning with real opportunities.",
    feeling: "Modern, confident, optimistic — opportunity, never pressure.",
    audience: "Anyone ready for their next piece of work.",
    steward: "Career advisor and business strategist.",
    daily: "New matches drawn from what you actually did yesterday.",
    seasonal: "Hiring seasons, grant windows, festival and contract cycles.",
    contribution: "Keeps money and work circulating inside the community.",
    legacy: "A documented record of every opportunity a member has earned.",
    functions: [
      "Jobs",
      "Gigs",
      "Internships",
      "Marketplace opportunities",
      "Builder matching",
      "Team formation",
      "Business partnerships",
      "Community projects",
      "Volunteer work",
      "Foundation initiatives",
    ],
    connected: ["Builder Academy", "Marketplace Pavilion", "Builders Village", "Skills Passport", "Community Square"],
    success: "Skills become real-world opportunities.",
    status: "open",
    to: "/opportunity",
  },
  {
    id: "music_quarter",
    name: "Music Quarter",
    purpose: "A home for creators — where music is made, produced, taught and published.",
    feeling: "Studio warmth, late-night creative focus.",
    audience: "Artists, producers, songwriters, engineers.",
    steward: "Producer and creative mentor.",
    daily: "A session to finish, a collaborator to answer, a release to plan.",
    seasonal: "Festival submissions, release windows, awards season.",
    contribution: "Gives Frass its sound.",
    legacy: "Catalogues, publishing splits and rights that outlive the artist.",
    functions: [
      "Recording",
      "Publishing",
      "Audio editing",
      "Copyright education",
      "Collaboration",
      "Performance spaces",
      "Artist profiles",
      "Music marketplace",
      "Community showcases",
      "Creator mentoring",
    ],
    connected: ["DJ District", "Marketplace Pavilion", "Community Square", "Foundation District", "Builder Academy"],
    success: "Creators build sustainable creative careers.",
    engine: true,
    status: "planned",
  },
  {
    id: "dj_district",
    name: "DJ District",
    purpose:
      "The professional home for DJs, selectors, sound system operators, MCs and promoters — performance, events and live entertainment.",
    feeling: "Sound system culture — bass, lights, crowd, respect for the selector.",
    audience: "DJs, selectors, hosts, promoters, venues, event planners.",
    steward: "Performance coach and booking agent.",
    daily: "A new mix to post, a booking to confirm, a remix challenge running.",
    seasonal: "Carnival, summer fete season, festival circuit, New Year's sets.",
    contribution: "Drives the live entertainment economy of Frass Hill.",
    legacy: "Preserved sets, sound system history and the culture of live performance.",
    functions: [
      "DJ profiles",
      "Mix showcase",
      "Live stream events",
      "Event bookings",
      "Equipment marketplace",
      "Music libraries",
      "Set management",
      "Playlist curation",
      "Remix challenges",
      "DJ Academy",
      "Performance coaching",
      "Event calendar",
      "Promoter network",
      "Festival opportunities",
      "Collaboration hub",
      "Licensing education",
      "Brand partnerships",
    ],
    connected: ["Music Quarter", "Marketplace Pavilion", "Opportunity Centre", "Community Square", "Foundation District"],
    success:
      "DJs build sustainable careers, expand audiences, secure bookings, and preserve the culture of live music.",
    engine: true,
    status: "planned",
  },
  {
    id: "builders_village",
    name: "Frass Builders Village",
    purpose:
      "The professional home of the skilled trades — carpenters, masons, electricians, plumbers, roofers, engineers and contractors who physically build our communities.",
    feeling: "Job-site respect: sawdust, blueprints, craftsmanship, pride in the work.",
    audience: "Skilled Builders, crews, apprentices, and the clients who hire them.",
    steward: "Master tradesperson and construction business consultant.",
    daily: "A quote to send, a crew to schedule, a project photo to post, an apprentice to answer.",
    seasonal: "Dry-season builds, hurricane repair, winter interior work, apprenticeship intakes.",
    contribution: "Drives the construction and skilled-trades economy of Frass Hill.",
    legacy:
      "The Builder Legacy Library — a master mason's forty-five years of method, story and safety kept teaching after he retires.",
    functions: [
      "Contractor Marketplace",
      "Builder Directory",
      "Project Showcase — before & after galleries",
      "Quote requests & project matching",
      "Crew and team building",
      "Construction Marketplace — tools, equipment, materials, rentals",
      "Apprenticeship Hub",
      "Construction Academy — safety, estimating, blueprint reading, codes, trades",
      "Certifications",
      "Builder Business Suite — CRM, estimates, invoicing, scheduling, expenses, contracts",
      "Client reviews & verification",
      "Mentorship",
      "Community build projects with the Foundation",
      "Builder Legacy Library",
    ],
    connected: [
      "Marketplace Pavilion",
      "Opportunity Centre",
      "Builder Academy",
      "Foundation District",
      "Skills Passport",
      "Legacy Registry",
    ],
    success:
      "Skilled Builders don't just find work — they build businesses, document expertise, train apprentices, and leave a professional legacy.",
    engine: true,
    status: "planned",
  },
  {
    id: "farm_hub",
    name: "Farm Hub",
    purpose: "Support farmers while preserving agricultural knowledge.",
    feeling: "Early morning, open land, generational knowledge.",
    audience: "Farmers, growers, fishers, food producers and their buyers.",
    steward: "Agricultural consultant.",
    daily: "Weather, crop stage, market prices, the farm journal entry.",
    seasonal: "Planting, rainy season, harvest, market weeks.",
    contribution: "Feeds the town and keeps food money local.",
    legacy: "Farm journals and methods passed to the next generation.",
    functions: [
      "Farm marketplace",
      "Crop planning",
      "Educational content",
      "Equipment sharing",
      "Seasonal planning",
      "Farm journals",
      "Agricultural mentoring",
      "Community food initiatives",
    ],
    connected: ["Marketplace Pavilion", "Foundation District", "Builder Academy", "Legacy Registry"],
    success: "Agricultural knowledge continues across generations.",
    engine: true,
    status: "planned",
  },
  {
    id: "foundation_district",
    name: "Foundation District",
    purpose: "Coordinate community impact.",
    feeling: "Purposeful and dignified — service, never charity theatre.",
    audience: "Volunteers, donors, families receiving support, community leaders.",
    steward: "Programme director and community advocate.",
    daily: "A campaign to move forward, a volunteer shift, a family to check on.",
    seasonal: "Back-to-school drives, hurricane response, Christmas giving.",
    contribution: "Turns the town's success into someone's stability.",
    legacy: "Documented impact — homes repaired, students supported, communities restored.",
    functions: [
      "Family support",
      "Educational initiatives",
      "Community grants",
      "Volunteer matching",
      "Donation management",
      "Mentorship",
      "Emergency assistance",
      "Community campaigns",
      "Progress reporting",
    ],
    connected: ["Children's Village", "Community Square", "Vision Maps", "Marketplace Pavilion", "Founder Hall"],
    success: "Communities become stronger over time.",
    status: "planned",
  },
  {
    id: "marketplace_pavilion",
    name: "Marketplace Pavilion",
    purpose: "Support entrepreneurs and community commerce.",
    feeling: "Market-day energy under a covered pavilion — stalls, colour, trade.",
    audience: "Frass Builders selling, and everyone buying.",
    steward: "Merchandising officer and trade advisor.",
    daily: "Orders, new listings, a pop-up opening today.",
    seasonal: "Seasonal markets, holiday trading, drop calendars.",
    contribution: "Keeps commerce inside the community.",
    legacy: "Businesses that outlive their first season.",
    functions: [
      "Vendor marketplace",
      "Business directory",
      "Pop-up events",
      "Seasonal markets",
      "Marketplace education",
      "Vendor verification",
      "Local promotions",
      "Product discovery",
    ],
    connected: ["Frass Kicks", "Frass Luxury House", "Frass Bridal", "Farm Hub", "Builders Village"],
    success: "Businesses grow through community.",
    engine: true,
    status: "planned",
  },
  {
    id: "reflection_gardens",
    name: "Reflection Gardens",
    purpose: "A quiet place for reflection, gratitude and personal growth.",
    feeling: "Still, green, unhurried — the one district that asks nothing of you.",
    audience: "Every member, especially between seasons of hard work.",
    steward: "Quiet counsel and reflection guide.",
    daily: "One question worth sitting with.",
    seasonal: "Year-in-review, remembrance days, new-year intentions.",
    contribution: "Protects the people behind the work.",
    legacy: "A member's own written record of who they were becoming.",
    functions: [
      "Personal journals",
      "Promise Vault reflections",
      "Goal reviews",
      "Milestone celebrations",
      "Guided reflection",
      "Gratitude exercises",
      "Founder messages",
      "Community remembrance",
    ],
    connected: ["Promise Vault", "Vision Maps", "Foundation District"],
    success: "Members remain emotionally connected to their journey.",
    status: "planned",
  },
  {
    id: "founder_hall",
    name: "Founder Hall",
    purpose: "The executive centre of Frass Hill.",
    feeling: "Civic and steady — the town knows where it is going.",
    audience: "Every member; governed by the Founder.",
    steward: "Chief of staff and institutional memory.",
    daily: "The direction of the platform, stated plainly.",
    seasonal: "Annual report, roadmap addresses, constitutional updates.",
    contribution: "Keeps the whole town aligned to one vision.",
    legacy: "The Constitution and the permanent record of every decision.",
    functions: [
      "Founder communications",
      "Major announcements",
      "Constitutional updates",
      "Platform roadmap",
      "Community addresses",
      "Annual reports",
      "Governance",
      "Public platform vision",
    ],
    connected: ["Founder Dashboard", "Platform Memory", "Registry", "Community Square"],
    success: "Members understand the direction of Frass.",
    status: "open",
    to: "/founder",
  },
];

/** The eight questions every district must answer before it is considered complete. */
export const UNIVERSAL_DISTRICT_RULES = [
  { key: "feeling", label: "Emotional Identity", question: "How should people feel?" },
  { key: "purpose", label: "Functional Purpose", question: "What should people accomplish?" },
  { key: "audience", label: "Primary Audience", question: "Who uses this district?" },
  { key: "connected", label: "Connected Systems", question: "What other districts does it support?" },
  { key: "daily", label: "Daily Activity", question: "Why would someone return tomorrow?" },
  { key: "seasonal", label: "Seasonal Evolution", question: "How does it change through the year?" },
  { key: "contribution", label: "Community Contribution", question: "How does it strengthen Frass?" },
  { key: "legacy", label: "Legacy", question: "What lasting value does it create?" },
] as const;

/** Districts should never feel isolated — these are the natural walks through town. */
export const CROSS_DISTRICT_JOURNEYS: { label: string; path: string[] }[] = [
  {
    label: "The growing-up walk",
    path: ["Children's Village", "Builder Academy", "Opportunity Centre", "Marketplace Pavilion", "Founder Hall"],
  },
  {
    label: "The land-to-table walk",
    path: ["Farm Hub", "Marketplace Pavilion", "Community Square", "Foundation District"],
  },
  {
    label: "The trades walk",
    path: ["Builder Academy", "Frass Builders Village", "Opportunity Centre", "Foundation District"],
  },
  {
    label: "The sound walk",
    path: ["Music Quarter", "DJ District", "Community Square", "Marketplace Pavilion"],
  },
];

/** FRASS-0910 terminology standard. */
export const BUILDER_TERMINOLOGY = [
  {
    term: "Frass Builders",
    meaning:
      "Anyone building a business, project or opportunity on the Frass platform — entrepreneurs, sellers, creators, course builders, affiliates, community leaders.",
  },
  {
    term: "Skilled Builders",
    meaning:
      "The tradespeople who physically build our communities — carpenters, masons, electricians, plumbers, roofers, welders, engineers, contractors.",
  },
];

export function hillDistrict(id: string) {
  return HILL_DISTRICTS.find((d) => d.id === id);
}
