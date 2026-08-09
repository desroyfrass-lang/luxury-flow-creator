// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0410 — Frass Vision Studios / FV Studios: the Creator Company.
//
// ONE company, two ways of saying it:
//   • Frass Vision Studios — the official, public-facing name. Used on credits,
//     contracts, releases, marketing. "A Frass Vision Studios Original."
//   • FV Studios — the everyday shorthand used inside the ecosystem.
//     "I cut it in FV Studios."
//
// Revenue participation is tied to PUBLISHING through the Frass Vision Network,
// never to merely using the editor. A private birthday video costs nothing
// beyond AI Credits. A commercially published work joins the Network.
// ─────────────────────────────────────────────────────────────────────────────

export type Division = {
  key: string;
  name: string;
  label: string; // public sub-label, e.g. "FV Records"
  line: string;
  services: string[];
};

export const DIVISIONS: Division[] = [
  {
    key: "music",
    name: "Music Division",
    label: "FV Records",
    line: "A modern creator label. No advances, no debt, no ownership of people.",
    services: [
      "Recording, mixing and mastering",
      "Artwork and visual identity",
      "Music videos",
      "Release strategy and playlist pitching",
      "Distribution to streaming services",
      "Royalty collection and reporting",
    ],
  },
  {
    key: "film",
    name: "Film Division",
    label: "FV Films",
    line: "Features, documentaries, brand films, shorts and commercials.",
    services: [
      "Development and treatment",
      "Production and post",
      "Festival and streaming submissions",
      "Educational and corporate licensing",
      "Trailer and campaign packages",
    ],
  },
  {
    key: "podcast",
    name: "Podcast Division",
    label: "FV Podcasts",
    line: "Audio and video podcasts, from first episode to sponsorship.",
    services: [
      "Recording and editing",
      "Show branding and artwork",
      "Publishing to podcast platforms",
      "Sponsorship administration",
    ],
  },
  {
    key: "television",
    name: "Television Division",
    label: "FV Originals",
    line: "Series, reality, interviews and educational television.",
    services: ["Series development", "Episodic production", "Streaming delivery", "Rights management"],
  },
  {
    key: "publishing",
    name: "Publishing Division",
    label: "FV Publishing",
    line: "Protects the writing behind the work — compositions, lyrics, scripts.",
    services: [
      "Publishing administration",
      "Mechanical and performance royalties",
      "Sync licensing",
      "Copyright registration support",
    ],
  },
  {
    key: "creative",
    name: "Creative Division",
    label: "FV Creative",
    line: "Design, motion, animation and campaign work.",
    services: ["Brand identity", "Motion graphics", "Animation", "Marketing campaigns"],
  },
  {
    key: "photography",
    name: "Photography Division",
    label: "FV Photo",
    line: "Portrait, fashion, product, commercial and event photography.",
    services: ["Editorial shoots", "Product and lookbook", "Events", "Commercial licensing"],
  },
  {
    key: "weddings",
    name: "Weddings Division",
    label: "FV Weddings",
    line: "Wedding films and albums, tied into the Frass Bridal District.",
    services: ["Wedding films", "Documentary coverage", "Albums and stills", "Highlight edits"],
  },
  {
    key: "foundation",
    name: "Foundation Stories",
    label: "FV Documentaries",
    line: "Every community project professionally documented. Never published without Founder approval.",
    services: ["Community documentaries", "Walk With Power films", "Impact reporting", "Archive stewardship"],
  },
];

// ── The two doors, one house ────────────────────────────────────────────────
export const TWO_EXPRESSIONS = [
  {
    key: "fv-studio",
    heading: "FV Studios — everyday",
    plain:
      "This is the room you work in. Editing, cutting, mastering, exporting. You pay AI Credits when Frassy does AI work, and manual editing stays free. Nothing here creates royalties.",
    examples: ["Created in FV Studios", "Social edits", "Private and family work", "Client drafts and demos"],
  },
  {
    key: "frass-vision-studios",
    heading: "Frass Vision Studios — the big work",
    plain:
      "This is the company name on the poster. Songs, albums, films, documentaries, series — work that gets published, licensed and monetised through the Network.",
    examples: ["A Frass Vision Studios Original", "Produced by Frass Vision Studios", "Released through FV Records"],
  },
];

// ── Revenue participation ───────────────────────────────────────────────────
// Percentages are the platform's participation in revenue the Network helps
// generate. They are applied AFTER processing fees, taxes and collaborator
// splits — the creator sees every line.
export type ParticipationTier = {
  key: string;
  stream: string;
  platform: number; // %
  creator: number; // %
  note: string;
};

export const PARTICIPATION: ParticipationTier[] = [
  {
    key: "music-recording",
    stream: "Music — recordings distributed by the Network",
    platform: 15,
    creator: 85,
    note: "Streaming, downloads and store revenue collected through Frass distribution.",
  },
  {
    key: "music-publishing",
    stream: "Music — publishing administration",
    platform: 10,
    creator: 90,
    note: "Mechanical, performance and sync royalties administered on the writer's behalf.",
  },
  {
    key: "film",
    stream: "Film & documentary licensing",
    platform: 20,
    creator: 80,
    note: "Streaming, festival, broadcast, airline, hotel and educational licences.",
  },
  {
    key: "podcast",
    stream: "Podcast sponsorship & distribution",
    platform: 15,
    creator: 85,
    note: "Sponsorships and ad revenue administered by the Network.",
  },
  {
    key: "course",
    stream: "Courses & educational licensing",
    platform: 20,
    creator: 80,
    note: "Sold through the Frass Marketplace and Academy.",
  },
  {
    key: "sync",
    stream: "Sync & commercial licensing",
    platform: 25,
    creator: 75,
    note: "Placement in adverts, film, games and brand campaigns sourced by Frass.",
  },
  {
    key: "self-released",
    stream: "Work published outside the Network",
    platform: 0,
    creator: 100,
    note: "Made in FV Studios but released elsewhere. Frass takes nothing.",
  },
];

// What is NEVER charged royalties.
export const NO_ROYALTY_WORK = [
  "Private, family and personal videos",
  "Demos and unreleased drafts",
  "Social posts you publish yourself to your own accounts",
  "Client work delivered directly to a client",
  "Anything you never publish through Frass Vision Studios",
];

// ── Where the money physically flows ────────────────────────────────────────
export const MONEY_FLOW = [
  {
    step: 1,
    title: "Revenue arrives",
    plain: "Spotify, Apple, YouTube, a streamer, a broadcaster or a brand pays Frass Vision Studios for the work.",
  },
  {
    step: 2,
    title: "Hard costs come off first",
    plain: "Payment processing, distribution fees and any taxes that must legally be withheld.",
  },
  {
    step: 3,
    title: "Collaborators are paid",
    plain: "Featured artists, producers, writers, crew — exactly as the creator set the splits.",
  },
  {
    step: 4,
    title: "Network participation",
    plain: "Frass takes its published percentage for the stream. One number, visible before you release anything.",
  },
  {
    step: 5,
    title: "Constitutional split",
    plain: "Inside the Frass share, the Foundation allocation and Owner Compensation run as they do everywhere else in Frass.",
  },
  {
    step: 6,
    title: "Creator is paid",
    plain: "The rest lands in the creator's Frass Wallet with a full receipt for every line.",
  },
];

// ── One agreement, modular ──────────────────────────────────────────────────
export type AgreementModule = {
  key: string;
  title: string;
  appliesTo: string;
  grants: string[];
  frassProvides: string[];
};

export const AGREEMENT_MODULES: AgreementModule[] = [
  {
    key: "recording",
    title: "Recording & Distribution",
    appliesTo: "Musicians releasing recordings",
    grants: [
      "Non-exclusive right to distribute the release to digital services",
      "Right to collect and account for revenue from those services",
      "Agreed participation percentage on Network-collected revenue",
    ],
    frassProvides: ["Distribution", "Mastering", "Artwork", "Release strategy", "Royalty reporting"],
  },
  {
    key: "publishing-admin",
    title: "Publishing Administration",
    appliesTo: "Songwriters and composers",
    grants: [
      "Administration of the composition for the term",
      "Collection of mechanical, performance and sync royalties",
      "Writer keeps ownership of the copyright",
    ],
    frassProvides: ["Registration", "Global collection", "Sync pitching", "Statements"],
  },
  {
    key: "film-distribution",
    title: "Film & Documentary Distribution",
    appliesTo: "Filmmakers publishing through FV Films",
    grants: [
      "Right to license the work to platforms and buyers",
      "Right to represent the work at festivals and markets",
      "Agreed participation on licence revenue",
    ],
    frassProvides: ["Delivery specs", "Festival submissions", "Licensing", "Marketing"],
  },
  {
    key: "podcast",
    title: "Podcast Distribution & Sponsorship",
    appliesTo: "Podcasters",
    grants: ["Right to distribute episodes", "Right to sell and administer sponsorship"],
    frassProvides: ["Hosting", "Editing", "Branding", "Sponsor sourcing"],
  },
  {
    key: "course",
    title: "Courses & Educational Licensing",
    appliesTo: "Educators and course creators",
    grants: ["Right to sell the course in Frass", "Right to licence to institutions"],
    frassProvides: ["Course platform", "Payments", "Marketing", "Student analytics"],
  },
  {
    key: "releases",
    title: "Talent, Model & Location Releases",
    appliesTo: "Every production with people or places on camera",
    grants: ["Signed permissions collected and stored with the project"],
    frassProvides: ["Release templates", "Digital signing", "Vault storage per project"],
  },
];

// ── What FVS must have to operate legitimately ──────────────────────────────
export type ReadinessItem = { key: string; title: string; plain: string; owner: string };

export const LEGAL_READINESS: { group: string; items: ReadinessItem[] }[] = [
  {
    group: "Company",
    items: [
      { key: "entity", title: "Register Frass Vision Studios as an entity", plain: "The company that signs agreements and receives revenue.", owner: "Founder + lawyer" },
      { key: "bank", title: "Business bank account & royalty float", plain: "Money in from platforms, money out to creators, kept separate.", owner: "Founder" },
      { key: "tm", title: "Trademark Frass Vision Studios and FV Studios", plain: "Protects the name in the markets you operate in.", owner: "IP lawyer" },
    ],
  },
  {
    group: "Music",
    items: [
      { key: "distributor", title: "Distribution partner agreement", plain: "A distributor delivers to Spotify, Apple and the rest while creators only ever see Frass.", owner: "Founder" },
      { key: "pro", title: "PRO and publishing registrations", plain: "So performance and mechanical royalties actually reach the writer.", owner: "Publishing admin" },
      { key: "isrc", title: "ISRC and UPC allocation", plain: "The barcodes of music — every recording and release needs one.", owner: "Operations" },
    ],
  },
  {
    group: "Film & media",
    items: [
      { key: "chain", title: "Chain of title process", plain: "Proof that the work is legally clear to licence. Buyers will not touch a film without it.", owner: "Production legal" },
      { key: "eo", title: "Errors & omissions insurance", plain: "Required by most streamers and broadcasters before they license anything.", owner: "Founder" },
      { key: "delivery", title: "Delivery and licensing templates", plain: "Standard paperwork so each deal does not need a new contract from scratch.", owner: "Production legal" },
    ],
  },
  {
    group: "Money",
    items: [
      { key: "royalty-acc", title: "Royalty accounting engine", plain: "Statements per creator, per work, per stream, per period.", owner: "Frass OS" },
      { key: "tax", title: "Tax forms and withholding", plain: "Creator tax details captured before the first payout.", owner: "Finance" },
      { key: "audit", title: "Audit right for creators", plain: "Creators can check our maths. Written into the agreement.", owner: "Founder" },
    ],
  },
];

// ── Constitutional principle ────────────────────────────────────────────────
export const FVS_PRINCIPLE =
  "Frass Vision Studios exists to build sustainable creative careers. We invest first in opportunity, technology, education and distribution rather than large signing advances. When creators succeed, Frass succeeds alongside them. Our business model is built on partnership, transparency and shared growth — not ownership of people.";

export const PARTNER_TERM = "Vision Partners";

export const WHAT_ARE_WE_CREATING = [
  "Music",
  "Documentary",
  "Podcast",
  "Movie",
  "Commercial",
  "Product campaign",
  "Wedding",
  "Foundation story",
  "Course",
  "Animation",
] as const;
