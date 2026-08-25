// FRASS-0920 — Frass Hill Town Plan (supersedes the FRASS-0910 district list)
//
// Architectural correction: functions are not districts. Frass Hill is a living
// town with a handful of real places, and every service, office, venue and
// academy lives INSIDE one of them — the way a real Caribbean town works.
//
// You don't walk to "Opportunity Centre". You walk into the Town Square, and
// there happens to be an Opportunity Centre.
//
// Constitutional terminology:
//  · "Frass Builders"   — anyone building a business, project or opportunity ON the platform.
//  · "Skilled Builders" — tradespeople who physically build homes, roads, schools, communities.

export type HillDistrictStatus = "open" | "building" | "planned";

/** A place inside a district: an office, venue, academy, shop or service. */
export type HillVenue = {
  name: string;
  /** One line: what you do in this building. */
  does: string;
  to?: string;
};

export type HillDistrict = {
  id: string;
  /** Marker used on the town plan. */
  glyph: string;
  name: string;
  /** What happens here — answered in one sentence. */
  purpose: string;
  /** Emotional identity: how should people feel walking in? */
  feeling: string;
  audience: string;
  /** Frassy's professional expertise inside this district. Personality stays Frassy. */
  steward: string;
  daily: string;
  seasonal: string;
  contribution: string;
  legacy: string;
  /** The buildings, venues and services that live inside this district. */
  venues: HillVenue[];
  /** Neighbouring districts you can walk to. */
  connected: string[];
  success: string;
  /** Economic engines drive real commerce for the town. */
  engine?: boolean;
  status: HillDistrictStatus;
  to?: string;
  /** Hero image key resolved by the town plan route. */
  image: string;
};

export const HILL_DISTRICTS: HillDistrict[] = [
  {
    id: "town_square",
    glyph: "🏛",
    name: "Frass Town Square",
    purpose:
      "The civic and social heart of Frass Hill — where the town gathers, and where every service has a desk.",
    feeling: "Warm, alive, unmistakably Caribbean — music somewhere, dominoes slapping, people always around.",
    audience: "Every member of Frass Hill, from first visit onward.",
    steward: "Host, community organiser and information officer.",
    daily: "Something is always happening — an announcement, a showcase, a new notice on the opportunity board.",
    seasonal: "Festivals, carnival, independence, Christmas lights, the New Year address.",
    contribution: "Turns members into neighbours.",
    legacy: "A recorded history of every celebration and every notice the town has posted.",
    venues: [
      { name: "Information Centre", does: "First stop. Directions, orientation, how the town works." },
      { name: "Frassy Kiosk", does: "Ask Frassy anything, right in the middle of the square.", to: "/frassy" },
      { name: "Opportunity Centre", does: "Jobs, gigs, contracts, team formation, partnerships.", to: "/opportunity" },
      { name: "Community Hall", does: "For Us — today's community stories, good news and celebrations.", to: "/for-us" },
      { name: "Marketplace Stalls", does: "Day traders and pop-up vendors under the pavilion roof." },
      { name: "Foundation Office", does: "Family support, grants, emergency assistance." },
      { name: "Volunteer Centre", does: "Sign up for a shift, a drive or a community build." },
      { name: "The Café", does: "Where conversations start. Slow down for a minute." },
      { name: "Domino Yard", does: "The table under the tree. Bragging rights only." },
      { name: "Music Stage", does: "Live sets, open mic, community showcases." },
      { name: "Reflection Corner", does: "A quiet bench, a journal, one question worth sitting with." },
    ],
    connected: ["Children's Village", "Studio District", "Builders Village", "Farm District", "Founder Hall"],
    success: "Members return because they feel connected — and because everything they need has an address here.",
    status: "open",
    to: "/town-square",
    image: "square",
  },
  {
    id: "childrens_village",
    glyph: "👶",
    name: "Children's Village",
    purpose:
      "Where children learn, explore, create, and gradually grow into confident young builders.",
    feeling: "Safe, bright, playful — a place a parent trusts and a child never wants to leave.",
    audience: "Children 0–12, teens 12+, and the parents who hold the passport.",
    steward: "Educator and child-safety guide.",
    daily: "A new activity, story, challenge or badge waiting on the passport.",
    seasonal: "Summer camps, back-to-school, harvest crafts, the Christmas village.",
    contribution: "Raises the next generation of Frass Builders inside the family.",
    legacy: "Family Vision Maps and childhood work kept in the Promise Vault for life.",
    venues: [
      { name: "The Gentle Garden", does: "Ages 0–3. Sound, colour, calm.", to: "/kids-world/0-3" },
      { name: "Story Courtyard", does: "Ages 3–6. Reading, imagination, first making.", to: "/kids-world/3-6" },
      { name: "Discovery Village", does: "Ages 6–12. STEM, art, music, nature.", to: "/kids-world/6-12" },
      { name: "Young Builders Quarter", does: "Ages 12+. Real projects, real skills.", to: "/kids-world/12-plus" },
      { name: "Parent Dashboard", does: "PIN-protected oversight, time and safety controls.", to: "/kids-world/parents" },
      { name: "Family Vision Maps", does: "What this family is building together." },
      { name: "Kids Shop", does: "School Drip, kicks and everyday wear for the village.", to: "/frass-kids" },
      { name: "Youth Foundation Desk", does: "Educational support and sponsorship for families." },
    ],
    connected: ["Town Square", "Frass District", "Builders Village", "Founder Hall"],
    success: "Children leave more curious, more confident, and better prepared for the future.",
    status: "open",
    to: "/kids-world",
    image: "kids",
  },
  {
    id: "frass_district",
    glyph: "👟",
    name: "Frass District",
    purpose:
      "The commercial fashion promenade — the lit street of storefronts you can see glowing from the hill.",
    feeling: "Department-store energy at night: gold trim, glass doors, a street you walk rather than scroll.",
    audience: "Everyone who shops, and every Frass Builder who sells.",
    steward: "Merchandising officer and trade advisor.",
    daily: "New drops, restocks, a pop-up opening today, a flash drop on the clock.",
    seasonal: "Drop calendars, holiday trading, seasonal markets, clearance season.",
    contribution: "Keeps commerce — and the money it makes — inside the community.",
    legacy: "Businesses that outlive their first season.",
    venues: [
      { name: "Frass Kicks", does: "Casual, Classic and Street on one wall, men's and women's.", to: "/frass-district" },
      { name: "Frass Drip", does: "Floor by floor: the Boardroom, the Night Floor, the Lounge.", to: "/frass-district" },
      { name: "Bare Drip", does: "Swim on one side, intimates on the other.", to: "/frass-district" },
      { name: "Frass Plus+", does: "The full district architecture, mirrored for Plus sizing.", to: "/frass-plus" },
      { name: "Afro Designers", does: "Independent houses from the continent and the diaspora.", to: "/afro-designers" },
      { name: "Social Media Virals", does: "Everything trending, in one store.", to: "/social-media-virals" },
      { name: "The Liquidation Room", does: "Real markdowns, hidden gem, lucky spin.", to: "/sales-clearance" },
      { name: "Capsules & Lookbooks", does: "Limited stories, styled end to end.", to: "/capsules" },
      { name: "Vendor Office", does: "Verification, listings, promotions for sellers." },
    ],
    connected: ["Town Square", "Frass Luxury House", "Studio District", "Children's Village"],
    success: "People come to browse the street, not just to buy a product.",
    engine: true,
    status: "open",
    to: "/frass-district",
    image: "kicks",
  },
  {
    id: "luxury_house",
    glyph: "✨",
    name: "Frass Luxury House",
    purpose:
      "The private estate — bespoke, elevated, and deliberately set apart from the district below.",
    feeling: "Arrival, not shopping. Gardens, then the drive, then the doors.",
    audience: "Members seeking bespoke, high-end and made-to-order work.",
    steward: "Estate host and bespoke advisor.",
    daily: "A private appointment, a fitting, a new atelier release.",
    seasonal: "Bridal season, gala season, holiday commissions.",
    contribution: "Sets the standard the whole town measures itself against.",
    legacy: "Pieces that get kept, not replaced.",
    venues: [
      { name: "Botanical Gardens", does: "The approach. Flowers, sculpture, quiet." },
      { name: "The Wine Room", does: "Tasting and hosting before the house." },
      { name: "East Wing — Women", does: "Bespoke apparel, footwear, leather.", to: "/frass-luxury-house/women" },
      { name: "West Wing — Men", does: "Tailoring, footwear, leather goods.", to: "/frass-luxury-house/men" },
      { name: "Gate to Frass Bridal", does: "The wedding district next door — its own destination.", to: "/bridal" },
      { name: "Atelier", does: "Made-to-order and commissioned work." },
    ],
    connected: ["Frass District", "Studio District", "Founder Hall"],
    success: "The journey to the doors is remembered as clearly as the purchase.",
    engine: true,
    status: "open",
    to: "/frass-luxury-house",
    image: "luxury",
  },
  {
    id: "bridal_district",
    glyph: "💍",
    name: "Frass Bridal",
    purpose:
      "The wedding village — a whole district for the journey from engagement to the first anniversary.",
    feeling:
      "Stone pathways, glass conservatories, blooming gardens and pavilions in golden-hour light. Unhurried, ceremonial, warm.",
    steward: "Frassy, as Wedding Concierge",
    audience: "Couples, families and the whole wedding party — plus the vendors who serve them.",
    daily: "The Wedding Vault: one more task done, one more decision saved, one more quote in.",
    seasonal: "Engagement season, dress rounds, the wedding itself, then anniversaries.",
    contribution:
      "Every sourcing request brings a new boutique or vendor into the Frass Marketplace.",
    legacy: "Marriages that start with a shared plan, not just a shared party.",
    venues: [
      { name: "The Bridal Village", does: "Arrival, pavilions and the concierge.", to: "/bridal" },
      { name: "The Wedding Journey", does: "The garden walk from engaged to first anniversary.", to: "/bridal/journey" },
      { name: "The Wedding Vault", does: "Budget, timeline, checklist and family vision.", to: "/bridal/vault" },
      { name: "The Fitting Rooms", does: "Save, share, try on virtually and vote as a party.", to: "/bridal/collections" },
      { name: "The Sourcing Desk", does: "Find the dress Frass doesn't carry yet.", to: "/bridal/sourcing" },
      { name: "Wedding Marketplace", does: "Flowers, photography, cake, music, venues, travel.", to: "/bridal/marketplace" },
    ],
    connected: ["Frass Luxury House", "Frass District", "Studio District", "Town Square"],
    success: "A couple says the planning felt like a walk, not a spreadsheet.",
    engine: true,
    status: "open",
    to: "/bridal",
    image: "bridal",
  },
  {
    id: "studio_district",
    glyph: "🎵",
    name: "Studio District",
    purpose:
      "Home of Frass Vision Studios (FV Studios) — the creative production quarter where music, DJs, podcasts, photography and video all share one street.",
    feeling: "Late-night studio warmth: monitors glowing, bass through the wall, someone tracking a vocal.",
    audience: "Artists, producers, DJs, selectors, hosts, photographers, filmmakers, promoters.",
    steward: "Producer, performance coach and booking agent.",
    daily: "A session to finish, a mix to post, a booking to confirm, an episode to cut.",
    seasonal: "Carnival, fete season, festival circuit, release windows, awards season.",
    contribution: "Gives Frass its sound and its picture.",
    legacy: "Catalogues, publishing splits, preserved sets and the culture of live performance.",
    venues: [
      { name: "Frass Vision Studios", does: "The flagship production house — FV Studios. Film, documentary, commercials, music video, podcast and campaign production.", to: "/studio" },
      { name: "Recording Studios", does: "Tracking, mixing, mastering." },
      { name: "DJ Studios & Academy", does: "Decks, sets, mix showcase, performance coaching." },
      { name: "Podcast Studios", does: "Record, edit and publish the show." },
      { name: "Photography Studio", does: "Lookbooks, campaigns, artist portraits." },
      { name: "Video Production", does: "Visuals, live capture, short-form." },
      { name: "Editing Suites", does: "Post-production for every medium." },
      { name: "Performance Hall", does: "Live sessions, showcases, ticketed nights." },
      { name: "Publishing House", does: "Rights, splits, licensing education." },
      { name: "Music Library", does: "The catalogue, searchable and licensed." },
      { name: "Artist Development", does: "Career planning, releases, the business of music." },
      { name: "Music & Media Room", does: "What the town is listening to right now.", to: "/music-media" },
    ],
    connected: ["Town Square", "Frass District", "Builders Village", "Founder Hall"],
    success: "Creators build sustainable careers instead of one-off moments.",
    engine: true,
    status: "planned",
    image: "studio",
  },
  {
    id: "builders_village",
    glyph: "🏗",
    name: "Builders Village",
    purpose:
      "The professional home of the skilled trades — the people who physically build our communities.",
    feeling: "Job-site respect: sawdust, blueprints, craftsmanship, pride in the work.",
    audience: "Skilled Builders, crews, apprentices, engineers and the clients who hire them.",
    steward: "Master tradesperson and construction business consultant.",
    daily: "A quote to send, a crew to schedule, a project photo to post, an apprentice to answer.",
    seasonal: "Dry-season builds, hurricane repair, interior work, apprenticeship intakes.",
    contribution: "Drives the construction and skilled-trades economy of Frass Hill.",
    legacy: "The Legacy Library — forty-five years of method and safety still teaching after the master retires.",
    venues: [
      { name: "Builder Academy", does: "Safety, estimating, blueprint reading, codes, trades, business.", to: "/academy" },
      { name: "Project Showcase", does: "Before-and-after galleries from real jobs." },
      { name: "Contractor Directory", does: "Verified crews, reviews, quote requests." },
      { name: "Equipment Centre", does: "Tools, materials, rentals and equipment sharing." },
      { name: "Construction Marketplace", does: "Buy and sell what the site actually needs." },
      { name: "Estimator", does: "Price the job properly, before you bid it." },
      { name: "Builder CRM & Invoicing", does: "Clients, scheduling, contracts, expenses, getting paid." },
      { name: "Apprenticeship Hall", does: "Placements, mentorship, the next generation of trades." },
      { name: "Architecture & Engineering", does: "Drawings, specification, structural review." },
      { name: "Legacy Library", does: "Method, story and safety, preserved by the masters." },
    ],
    connected: ["Town Square", "Farm District", "Children's Village", "Studio District"],
    success:
      "Skilled Builders don't just find work — they build businesses, train apprentices and leave a professional legacy.",
    engine: true,
    status: "planned",
    image: "builders",
  },
  {
    id: "farm_district",
    glyph: "🌿",
    name: "Farm District",
    purpose: "The land — growing, selling, teaching and preserving agricultural knowledge.",
    feeling: "Early morning, open ground, generational knowledge, mist on the hills.",
    audience: "Farmers, growers, fishers, food producers and the buyers who feed the town.",
    steward: "Agricultural consultant.",
    daily: "Weather, crop stage, market prices, the farm journal entry.",
    seasonal: "Planting, rainy season, harvest, market weeks.",
    contribution: "Feeds the town and keeps food money local.",
    legacy: "Farm journals and methods passed to the next generation.",
    venues: [
      { name: "The Fields", does: "Plots, terraces, crop planning by season." },
      { name: "Greenhouses", does: "Propagation, protected growing, trials." },
      { name: "Farm Market", does: "Produce sold direct, crate by crate." },
      { name: "Equipment Yard", does: "Machinery, tools, shared and rented." },
      { name: "Agricultural Training", does: "Soil, pests, water, yield, farm business." },
      { name: "Farm Journals", does: "What was planted, what worked, and why." },
      { name: "Food Programme Office", does: "Community food initiatives with the Foundation." },
    ],
    connected: ["Town Square", "Builders Village", "Children's Village"],
    success: "Agricultural knowledge continues across generations — and farmers earn properly for it.",
    engine: true,
    status: "planned",
    image: "farm",
  },
  {
    id: "wellness_centre",
    glyph: "🌿",
    name: "Frass Health & Wellness Centre",
    purpose:
      "The mountain sanctuary above the town — everyday wellbeing kept free, and verified professionals when you need one.",
    feeling: "Cool air, deep greenery, drying herbs and lantern light. Nothing rushed, nothing sold to you.",
    audience: "Every member of Frass Hill, and the artists and farmers who carry the town on their backs.",
    steward: "Wellness guide and care navigator — never a clinician.",
    daily: "One small thing worth doing today: a tea, a stretch, a walk, an early night.",
    seasonal: "Harvest tonics, rainy-season immunity, festival recovery, the January reset.",
    contribution: "Keeps Builders well enough to build at all.",
    legacy: "Caribbean bush medicine and family wellness knowledge, written down before it's lost.",
    venues: [
      { name: "The Herb House", does: "Bush medicine documented properly — plant, use, preparation, cautions.", to: "/health-wellness" },
      { name: "Movement Yard", does: "Guided movement, stretching and breathwork. No equipment needed.", to: "/health-wellness" },
      { name: "The Kitchen Table", does: "Nutrition built around what the Farm District actually grows.", to: "/health-wellness" },
      { name: "The Quiet Room", does: "Mental steadiness — grounding, journalling, sleep, a check-in with Frassy.", to: "/health-wellness" },
      { name: "Artist Wellness Hub", does: "Vocal care, tour recovery, performance nerves and creative burnout.", to: "/health-wellness" },
      { name: "Care Network Directory", does: "Verified doctors, therapists, nutritionists and coaches you can book.", to: "/health-wellness" },
    ],
    connected: ["Town Square", "Farm District", "Studio District", "Builders Village"],
    success: "Members stay well — and know exactly where to turn when they aren't.",
    status: "open",
    to: "/health-wellness",
    image: "wellness",
  },
  {
    id: "founder_hall",
    glyph: "🏛",
    name: "Founder Hall",
    purpose: "The constitutional home of Frass — quiet, separate, and where the town's direction is set.",
    feeling: "Civic and steady. Marble, palms, low light. The town knows where it is going.",
    audience: "Every member; governed by the Founder.",
    steward: "Chief of staff and institutional memory.",
    daily: "The direction of the platform, stated plainly.",
    seasonal: "Annual report, roadmap addresses, constitutional updates.",
    contribution: "Keeps the whole town aligned to one vision.",
    legacy: "The Constitution and the permanent record of every decision.",
    venues: [
      { name: "The Chamber", does: "Founder communications and major announcements.", to: "/control-room" },
      { name: "The Constitution", does: "Five volumes. The rules the town is built on." },
      { name: "Platform History", does: "Every decision, dated, with the reason it was made." },
      { name: "Roadmap Room", does: "What is being built next, and in what order." },
      { name: "Hall of Legacy", does: "The members and works the town chooses to remember." },
      { name: "Blueprint Studio", does: "Founder Construction Mode. The Founder edits the blueprint, never production." },
    ],
    connected: ["Town Square", "Frass Luxury House", "Studio District"],
    success: "Members understand the direction of Frass without having to ask.",
    status: "open",
    to: "/control-room",
    image: "founder",
  },
];

/** The town plan rule: if it isn't one of these, it's a building inside one of these. */
export const TOWN_PLAN_RULE =
  "Frass Hill has ten places. Everything else — Opportunity Centre, Community Hall, Marketplace Pavilion, Reflection Gardens, Builder Academy, DJ Academy — is a building, venue or service with an address inside one of them.";

/**
 * Constitutional principle — the sightline rule.
 * A town is not a menu. It is a place with views.
 */
export const SIGHTLINE_PRINCIPLE =
  "Every building should be visible before it is visited. People see a destination from afar, wonder what's over there, and walk to it. Curiosity, not navigation.";

/** Something you can see, hear or notice from one district, pointing at another. */
export type HillSightline = {
  /** District id you are looking at. */
  to: string;
  /** Where it sits relative to you: below, up the hill, across the square, on the horizon. */
  direction: string;
  /** What you actually notice from here. Sensory, never a menu label. */
  sight: string;
};

/**
 * What you can see from each district. Every district must remind you the rest of
 * Frass Hill exists — you are never standing in an isolated screen.
 */
export const HILL_SIGHTLINES: Record<string, HillSightline[]> = {
  town_square: [
    { to: "frass_district", direction: "down the road", sight: "Shopfront lights glowing gold, and shoppers moving along the promenade." },
    { to: "luxury_house", direction: "up the hillside", sight: "The estate rising above the gardens, windows lit, quiet from here." },
    { to: "studio_district", direction: "two streets over", sight: "Bass drifting across the square before you ever get there." },
    { to: "childrens_village", direction: "in the valley below", sight: "Children playing, and a kite somewhere over the trees." },
    { to: "builders_village", direction: "past the ridge", sight: "Cranes, timber frames and scaffolding catching the afternoon light." },
    { to: "farm_district", direction: "toward the horizon", sight: "Green fields and terraces stretching out beyond the rooftops." },
    { to: "founder_hall", direction: "above everything", sight: "The Hall standing quietly over the whole community." },
  ],
  childrens_village: [
    { to: "town_square", direction: "up the path", sight: "Lanterns and the sound of dominoes from the square above." },
    { to: "frass_district", direction: "across the valley", sight: "The lit promenade where the school shoes come from." },
    { to: "builders_village", direction: "on the far slope", sight: "Real crews working — the thing the older kids keep pointing at." },
    { to: "farm_district", direction: "beyond the fields", sight: "Rows of greens and someone walking a crate up the track." },
  ],
  frass_district: [
    { to: "town_square", direction: "at the top of the road", sight: "The square's lanterns where the promenade begins." },
    { to: "luxury_house", direction: "up the drive", sight: "Gates, gardens and the estate above the street." },
    { to: "studio_district", direction: "behind the shopfronts", sight: "A photo shoot loading out, music through a side door." },
    { to: "childrens_village", direction: "down in the valley", sight: "The village where the small sizes are headed." },
  ],
  luxury_house: [
    { to: "frass_district", direction: "below the gardens", sight: "The whole promenade laid out in light, from up here." },
    { to: "studio_district", direction: "across the ridge", sight: "Studio roofs where the campaigns get shot." },
    { to: "town_square", direction: "further down", sight: "The square, small and warm, at the centre of it all." },
    { to: "founder_hall", direction: "on the summit", sight: "The Hall, higher still, marble against the sky." },
    { to: "bridal_district", direction: "just beyond the east gardens", sight: "White pavilions and a conservatory catching the last of the light." },
  ],
  bridal_district: [
    { to: "luxury_house", direction: "next door", sight: "The estate through the hedge — where the gowns are tailored." },
    { to: "frass_district", direction: "down the stone path", sight: "The promenade, for everyone the wedding still needs to dress." },
    { to: "studio_district", direction: "across the ridge", sight: "Where the wedding films get cut." },
    { to: "town_square", direction: "far below", sight: "The square, and the party that spills into it after." },
  ],
  studio_district: [
    { to: "town_square", direction: "back down the street", sight: "The event stage being set for tonight." },
    { to: "frass_district", direction: "one block over", sight: "Window displays that started as a shoot in here." },
    { to: "builders_village", direction: "up the hill", sight: "Sparks off a welder after dark." },
    { to: "founder_hall", direction: "above the roofline", sight: "Lit columns overlooking the quarter." },
  ],
  builders_village: [
    { to: "town_square", direction: "down the hill", sight: "The square where the quotes and contracts get signed." },
    { to: "farm_district", direction: "past the yard", sight: "Fields, fences and a barn someone here framed." },
    { to: "childrens_village", direction: "across the valley", sight: "The village — half the reason the crews build." },
    { to: "studio_district", direction: "downslope", sight: "Studio lights coming on as the site shuts down." },
  ],
  farm_district: [
    { to: "town_square", direction: "along the market road", sight: "The pavilion where the morning crates end up." },
    { to: "builders_village", direction: "on the near ridge", sight: "Scaffolding and a roof going on before the rains." },
    { to: "childrens_village", direction: "down the track", sight: "School groups coming up for the harvest walk." },
    { to: "founder_hall", direction: "far above", sight: "The Hall on the summit, first thing lit at dusk." },
  ],
  founder_hall: [
    { to: "town_square", direction: "directly below", sight: "The whole square, and every road that leaves it." },
    { to: "frass_district", direction: "to the south", sight: "The promenade burning gold after sunset." },
    { to: "builders_village", direction: "to the east", sight: "Cranes turning slowly against the hillside." },
    { to: "farm_district", direction: "to the horizon", sight: "Fields going green all the way out." },
    { to: "studio_district", direction: "mid-slope", sight: "Studio roofs, and sound you can almost hear from here." },
  ],
};

/** The views out of a given district, resolved to their district records. */
export function sightlinesFrom(id: string) {
  return (HILL_SIGHTLINES[id] ?? [])
    .map((s) => ({ ...s, district: hillDistrict(s.to) }))
    .filter((s): s is HillSightline & { district: HillDistrict } => Boolean(s.district));
}


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
    path: ["Children's Village", "Town Square", "Builders Village", "Frass District"],
  },
  {
    label: "The land-to-table walk",
    path: ["Farm District", "Town Square", "Frass District"],
  },
  {
    label: "The trades walk",
    path: ["Town Square", "Builders Village", "Farm District"],
  },
  {
    label: "The sound walk",
    path: ["Studio District", "Town Square", "Frass District"],
  },
  {
    label: "The dressed-up walk",
    path: ["Frass District", "Frass Luxury House", "Studio District"],
  },
];

/** Terminology standard. */
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
