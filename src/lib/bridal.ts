// FRASS-0930 — Frass Bridal District
//
// Bridal is no longer a wing of Frass Luxury House. It is its own district in
// Frass Hill, standing beside the estate: an elegant wedding village with its
// own architecture, navigation, marketplace, planning tools and journey.
//
// Constitutional principle:
//   Frass Bridal is not a bridal store. It is the complete wedding journey —
//   from the first dress saved to the first anniversary — connecting planning,
//   marketplace, family vision, community and legacy into one experience.

export const BRIDAL_PRINCIPLE =
  "Frass Bridal is not a bridal store. It is the complete wedding journey — from the first dress saved to the first anniversary — connecting planning, marketplace, family vision, community and legacy into one seamless experience.";

export const BRIDAL_FEELING = [
  "Hopeful",
  "Elegant",
  "Calm",
  "Exciting",
  "Organised",
  "Beautiful",
  "Personal",
] as const;

export type BridalPavilion = {
  id: string;
  name: string;
  /** One line: what happens in this building. */
  does: string;
  /** Where it sits in the village. */
  where: string;
  to?: string;
  status: "open" | "building" | "planned";
};

/** Entering Frass Bridal presents places, never products. */
export const BRIDAL_PAVILIONS: BridalPavilion[] = [
  { id: "bride", name: "The Bride's Boutique", does: "Gowns, reception dressing, shoes, veils, jewellery, beauty.", where: "First glass storefront off the courtyard", status: "building" },
  { id: "groom", name: "The Groom's House", does: "Tuxedos, suiting, footwear, accessories, styling.", where: "Across the stone walkway", status: "building" },
  { id: "bridesmaids", name: "Bridesmaids Pavilion", does: "Party dressing, colour stories and group fittings.", where: "Under the draped pavilion", status: "building" },
  { id: "groomsmen", name: "Groomsmen Pavilion", does: "Coordinated suiting, sizing and group orders.", where: "Beside the bridesmaids", status: "building" },
  { id: "plus", name: "Plus Size Bridal", does: "A fully curated bridal experience — never a filter.", where: "Its own salon, its own imagery", status: "building" },
  { id: "collections", name: "The Fitting Rooms", does: "Save dresses, invite the wedding party, try on virtually, vote it down to one.", where: "Behind the boutique", to: "/bridal/collections", status: "open" },
  { id: "sourcing", name: "The Sourcing Desk", does: "Found a dress we don't carry? We source it and the boutique joins the marketplace.", where: "The concierge desk at the gate", to: "/bridal/sourcing", status: "open" },
  { id: "marketplace", name: "Marketplace Pavilion", does: "Florists, photographers, cake artists, bands, transport, venues — everything searchable.", where: "The open-air pavilion", to: "/bridal/marketplace", status: "open" },
  { id: "vault", name: "The Wedding Vault", does: "Budget, timeline, guests, contracts, checklist — the couple's headquarters.", where: "The stone office by the fountain", to: "/bridal/vault", status: "open" },
  { id: "journey", name: "The Wedding Journey", does: "Walk the garden path from 'We got engaged' to your first anniversary.", where: "The path through the gardens", to: "/bridal/journey", status: "open" },
  { id: "registry", name: "The Registry House", does: "Gifts, cash funds, experiences, honeymoon fund, Foundation giving.", where: "The white house past the fountain", status: "planned" },
  { id: "honeymoon", name: "Honeymoon Gallery", does: "Travel planning, reservations, packing, destination inspiration.", where: "The terrace overlooking the sea", status: "planned" },
  { id: "vision", name: "Family Vision Pavilion", does: "The shared map that begins on the wedding day and never ends.", where: "The glass conservatory", status: "planned" },
  { id: "journal", name: "The Wedding Journal", does: "Every milestone, photo and decision, bound into a living storybook.", where: "The library above the courtyard", status: "planned" },
  { id: "inspiration", name: "Inspiration Gallery", does: "Real weddings, editorials, colour palettes, mood boards.", where: "The long gallery", status: "planned" },
  { id: "appointments", name: "Appointments Office", does: "Virtual fittings, in-person boutique visits, alterations.", where: "Beside the gate", status: "planned" },
];

/** The Wedding Journey — presented as a walk, powered by the checklist underneath. */
export type JourneyMilestone = {
  id: string;
  title: string;
  place: string;
  says: string;
  /** Checklist categories that unlock this stretch of the path. */
  categories: string[];
};

export const WEDDING_JOURNEY: JourneyMilestone[] = [
  { id: "engaged", title: "We Got Engaged", place: "The Gate", says: "Take a breath. Nothing is late yet.", categories: ["Foundations"] },
  { id: "vision", title: "Our Vision", place: "The Gardens", says: "Before the spending, the shape of the day.", categories: ["Foundations", "Vision"] },
  { id: "budget", title: "The Budget", place: "The Stone Office", says: "One honest number, then everything gets easier.", categories: ["Money"] },
  { id: "dress", title: "The Dress", place: "The Boutique", says: "Save forty. Narrow to one. Nothing is lost along the way.", categories: ["Attire"] },
  { id: "party", title: "The Wedding Party", place: "The Pavilions", says: "Everyone dressed, everyone consulted, no group chat chaos.", categories: ["Attire", "People"] },
  { id: "vendors", title: "The Vendors", place: "Marketplace Pavilion", says: "Flowers, photography, music, cake, transport.", categories: ["Vendors"] },
  { id: "registry", title: "The Registry", place: "The Registry House", says: "Gifts, funds, experiences and giving in one place.", categories: ["Registry"] },
  { id: "paperwork", title: "The Paperwork", place: "The Clerk's Room", says: "Licence, officiant, insurance. Quiet but essential.", categories: ["Legal"] },
  { id: "day", title: "Wedding Day", place: "The Courtyard", says: "Everything you built, standing up on its own.", categories: ["Day Of"] },
  { id: "honeymoon", title: "Honeymoon", place: "The Terrace", says: "Rest is part of the plan, not a reward for surviving it.", categories: ["Travel"] },
  { id: "family", title: "Our Family Vision", place: "The Conservatory", says: "The Wedding Vault becomes the Family Vault.", categories: ["Vision"] },
  { id: "anniversary", title: "First Anniversary", place: "Back at the Gate", says: "One year of building something together.", categories: ["Vision"] },
];

export type ChecklistSeed = { id: string; task: string; category: string };

/** The Vault generates this dynamically; every task tracks status, date, owner, budget, vendor. */
export const WEDDING_CHECKLIST: ChecklistSeed[] = [
  { id: "date", task: "Set the wedding date", category: "Foundations" },
  { id: "guests", task: "Draft the guest list", category: "People" },
  { id: "party", task: "Choose the wedding party", category: "People" },
  { id: "budget", task: "Set the total budget", category: "Money" },
  { id: "venue", task: "Book the venue", category: "Vendors" },
  { id: "officiant", task: "Book the officiant", category: "Legal" },
  { id: "licence", task: "Apply for the marriage licence", category: "Legal" },
  { id: "insurance", task: "Wedding insurance", category: "Legal" },
  { id: "dress", task: "Choose the wedding dress", category: "Attire" },
  { id: "veil", task: "Veil and jewellery", category: "Attire" },
  { id: "shoes", task: "Wedding shoes", category: "Attire" },
  { id: "suit", task: "Groom's tuxedo or suit", category: "Attire" },
  { id: "bridesmaids", task: "Bridesmaid dresses", category: "Attire" },
  { id: "groomsmen", task: "Groomsmen suiting", category: "Attire" },
  { id: "children", task: "Flower girl and page boy", category: "Attire" },
  { id: "alterations", task: "Book alterations", category: "Attire" },
  { id: "flowers", task: "Florist", category: "Vendors" },
  { id: "photo", task: "Photographer", category: "Vendors" },
  { id: "video", task: "Videographer", category: "Vendors" },
  { id: "cake", task: "Cake designer", category: "Vendors" },
  { id: "catering", task: "Catering", category: "Vendors" },
  { id: "music", task: "Band, DJ or musicians", category: "Vendors" },
  { id: "decor", task: "Decor and reception styling", category: "Vendors" },
  { id: "hair", task: "Hair", category: "Vendors" },
  { id: "makeup", task: "Makeup", category: "Vendors" },
  { id: "transport", task: "Transportation", category: "Vendors" },
  { id: "invites", task: "Invitations and stationery", category: "People" },
  { id: "favours", task: "Wedding favours", category: "Day Of" },
  { id: "rehearsal", task: "Rehearsal dinner", category: "Day Of" },
  { id: "timeline", task: "Wedding day timeline", category: "Day Of" },
  { id: "accommodation", task: "Guest accommodation", category: "Travel" },
  { id: "honeymoon", task: "Book the honeymoon", category: "Travel" },
  { id: "registry", task: "Open the registry", category: "Registry" },
  { id: "thanks", task: "Thank-you tracking", category: "Registry" },
  { id: "visionmap", task: "Start the Family Vision Map", category: "Vision" },
];

export const CHECKLIST_CATEGORIES = [
  "Foundations",
  "Money",
  "People",
  "Attire",
  "Vendors",
  "Legal",
  "Day Of",
  "Travel",
  "Registry",
  "Vision",
] as const;

/** Bridal Discovery Engine — a dress we don't carry becomes a vendor we do. */
export const SOURCING_STAGES = [
  { id: "requested", label: "Requested", says: "We have your reference. Nothing else for you to do." },
  { id: "vendor_contact", label: "Vendor Contact", says: "We're reaching out to the boutique or designer." },
  { id: "review", label: "Marketplace Review", says: "Quality, shipping, photography and returns are checked." },
  { id: "approved", label: "Supplier Approved", says: "Terms agreed. The boutique is joining Frass." },
  { id: "created", label: "Product Created", says: "Listing built, sizing and pricing confirmed." },
  { id: "available", label: "Available to Purchase", says: "Yours to buy — and now part of the marketplace." },
] as const;

/** The dress collaboration rounds. Every stage stays saved. */
export const COLLAB_ROUNDS = [40, 15, 8, 5, 3, 1] as const;

export const TRY_ON_WORKFLOW = [
  "Virtual Try-On",
  "Finalists",
  "Schedule In-Person Appointment",
  "Physical Try-On",
  "Final Decision",
  "Purchase",
  "Alterations",
  "Delivery",
  "Wedding Complete",
] as const;

export const MARKETPLACE_GROUPS: { group: string; items: string[] }[] = [
  { group: "Attire", items: ["Wedding Dresses", "Bridesmaid Dresses", "Mother of the Bride", "Mother of the Groom", "Flower Girl", "Page Boy", "Tuxedos", "Shoes", "Accessories", "Jewellery", "Veils"] },
  { group: "The Day", items: ["Decor", "Reception", "Tables", "Flowers", "Stationery", "Cake", "Catering", "Favours"] },
  { group: "Craft & Capture", items: ["Photography", "Videography", "Hair", "Makeup", "Wedding Planners", "Officiants"] },
  { group: "Sound & Movement", items: ["DJs", "Bands", "Musicians", "Entertainment", "Transportation"] },
  { group: "Travel", items: ["Honeymoon", "Hotels", "Destination Weddings", "Guest Accommodation", "Rentals"] },
];

/** Bridal vendors are appointment vendors, not dropshippers. */
export const VENDOR_CAPABILITIES = [
  "Portfolio & gallery",
  "Reviews",
  "Availability calendar",
  "Appointments",
  "Messaging",
  "Packages & pricing",
  "Quotes & invoices",
  "Contracts",
  "Travel radius",
  "Alterations & pickup",
  "Vendor scorecard",
] as const;

export const PRICING_LENSES = [
  "Individual price",
  "Wedding bundle",
  "Event quantity",
  "Bulk pricing",
  "Wholesale pricing",
  "Shipping",
  "Customisation",
  "Production time",
  "Delivery deadline",
  "Budget impact",
] as const;

export const FAMILY_VISION_AREAS = [
  "Dream home",
  "Children",
  "Education",
  "Finances",
  "Travel",
  "Business",
  "Faith & giving",
  "Foundation donations",
  "Retirement",
  "Legacy",
] as const;

/** FRASS-0931 — Frassy's role inside Bridal. */
export const CONCIERGE_ROLES = [
  { role: "Wedding Concierge", does: "Knows the whole plan and never makes you repeat yourself." },
  { role: "Budget Coach", does: "Tracks every number and finds savings without dropping quality." },
  { role: "Timeline Manager", does: "Tells you what matters this month, not all 35 tasks at once." },
  { role: "Marketplace Curator", does: "Opens a sourcing case the moment something isn't carried." },
  { role: "Vendor Coordinator", does: "Quotes, appointments, contracts and follow-ups in one thread." },
  { role: "Registry Assistant", does: "Gifts, funds and thank-yous, kept tidy." },
  { role: "Family Vision Coach", does: "Turns a wedding day into a shared plan for the years after." },
] as const;

/** Proactive observations Frassy makes — she notices, she never nags. */
export const CONCIERGE_NOTICES = [
  "You've chosen outdoor flowers and your date falls in hurricane season. Want two indoor alternatives held in reserve?",
  "Your bridesmaids are in four countries. Shall I organise virtual fittings instead of one weekend everyone has to fly for?",
  "Alterations usually need six weeks. Your dress decision date is tight — want me to move it forward two weeks?",
  "Three of your quotes came in under budget. That's room for the photographer you liked but skipped.",
] as const;

export const SIZING_EQUITY_RULE =
  "Every bridal collection passes a sizing-equity review before publication. Frassy helps with garment fit only — she never estimates body size and never comments on appearance.";
