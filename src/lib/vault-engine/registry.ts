// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0610 — The Frass Vault Engine: Module Registry.
//
// One engine, many Vaults. Nothing here is written for a specific person or a
// specific business. A Vault is assembled from reusable modules; new modules
// can be added to this registry later without rebuilding a single Vault.
//
// Plain English: this is the catalogue of rooms a workspace can have. Frassy
// reads the catalogue when she sets somebody up.
// ─────────────────────────────────────────────────────────────────────────────

export type VaultCategory = "business" | "creator" | "personal";

export type VaultCategoryMeta = {
  id: VaultCategory;
  glyph: string;
  name: string;
  blurb: string;
  subtypes: { id: string; name: string }[];
};

export const VAULT_CATEGORIES: VaultCategoryMeta[] = [
  {
    id: "business",
    glyph: "🏪",
    name: "Business",
    blurb: "Something you run — clients, customers, jobs, orders, money.",
    subtypes: [
      { id: "marketing", name: "Marketing" },
      { id: "beauty", name: "Beauty" },
      { id: "retail", name: "Retail" },
      { id: "consulting", name: "Consulting" },
      { id: "creative_agency", name: "Creative Agency" },
      { id: "food", name: "Restaurant / Food" },
      { id: "professional_services", name: "Professional Services" },
      { id: "other", name: "Other" },
    ],
  },
  {
    id: "creator",
    glyph: "🎨",
    name: "Creator",
    blurb: "Something you make — music, images, film, words, design.",
    subtypes: [
      { id: "music_artist", name: "Music Artist" },
      { id: "producer", name: "Producer" },
      { id: "photographer", name: "Photographer" },
      { id: "videographer", name: "Videographer" },
      { id: "content_creator", name: "Content Creator" },
      { id: "writer", name: "Writer" },
      { id: "designer", name: "Designer" },
      { id: "other", name: "Other" },
    ],
  },
  {
    id: "personal",
    glyph: "🌱",
    name: "Personal / Project",
    blurb: "Something you're building for yourself — a plan, a project, a goal.",
    subtypes: [
      { id: "project", name: "A Project" },
      { id: "learning", name: "Learning" },
      { id: "household", name: "Household / Family" },
      { id: "other", name: "Other" },
    ],
  },
];

export function categoryMeta(id: string): VaultCategoryMeta | undefined {
  return VAULT_CATEGORIES.find((c) => c.id === id);
}

export function subtypeName(category: string, subtype: string | null | undefined): string {
  if (!subtype) return "";
  return categoryMeta(category)?.subtypes.find((s) => s.id === subtype)?.name ?? subtype;
}

// ── Modules ──────────────────────────────────────────────────────────────────

/** How a module's records behave. One reusable shape, many rooms. */
export type ModuleShape = "list" | "people" | "tasks" | "dated" | "money" | "notes" | "dashboard";

export type VaultModule = {
  id: string;
  name: string;
  glyph: string;
  description: string;
  shape: ModuleShape;
  /** Which Vault categories this module makes sense for. */
  categories: VaultCategory[];
  /** Module ids that should be enabled alongside this one. */
  dependsOn?: string[];
  /** Minimum role allowed to create records here. */
  writeRole: "collaborator" | "member" | "admin";
  /** Always present in every Vault. */
  core?: boolean;
  /** Registered, but the room isn't furnished yet. */
  status: "active" | "planned";
  /** Wording for the "add the first one" button. */
  createLabel: string;
  /** Honest empty state — never fake data. */
  emptyState: string;
};

const ALL: VaultCategory[] = ["business", "creator", "personal"];

export const VAULT_MODULES: VaultModule[] = [
  {
    id: "home",
    name: "Home",
    glyph: "🏠",
    description: "What needs your attention today.",
    shape: "dashboard",
    categories: ALL,
    writeRole: "member",
    core: true,
    status: "active",
    createLabel: "Open Home",
    emptyState: "Nothing yet — add something and it shows up here.",
  },
  {
    id: "clients",
    name: "Clients",
    glyph: "🤝",
    description: "The people who pay you.",
    shape: "people",
    categories: ["business", "creator"],
    writeRole: "collaborator",
    status: "active",
    createLabel: "Add a client",
    emptyState: "No clients yet. Add the first one when you're ready.",
  },
  {
    id: "customers",
    name: "Customers",
    glyph: "🧾",
    description: "The people who buy from you.",
    shape: "people",
    categories: ["business"],
    writeRole: "collaborator",
    status: "active",
    createLabel: "Add a customer",
    emptyState: "No customers recorded yet.",
  },
  {
    id: "contacts",
    name: "Contacts",
    glyph: "📇",
    description: "Everybody else worth keeping close.",
    shape: "people",
    categories: ALL,
    writeRole: "collaborator",
    status: "active",
    createLabel: "Add a contact",
    emptyState: "No contacts saved yet.",
  },
  {
    id: "leads",
    name: "Leads",
    glyph: "🎯",
    description: "People who might become clients.",
    shape: "people",
    categories: ["business", "creator"],
    writeRole: "collaborator",
    status: "active",
    createLabel: "Add a lead",
    emptyState: "No leads yet.",
  },
  {
    id: "projects",
    name: "Projects",
    glyph: "🧱",
    description: "Bodies of work with a start and a finish.",
    shape: "list",
    categories: ALL,
    writeRole: "collaborator",
    status: "active",
    createLabel: "Start a project",
    emptyState: "No projects yet.",
  },
  {
    id: "campaigns",
    name: "Campaigns",
    glyph: "📣",
    description: "Pushes you run for yourself or a client.",
    shape: "list",
    categories: ["business", "creator"],
    writeRole: "collaborator",
    status: "active",
    createLabel: "Add a campaign",
    emptyState: "No campaigns yet.",
  },
  {
    id: "tasks",
    name: "Tasks",
    glyph: "✅",
    description: "The next things to do.",
    shape: "tasks",
    categories: ALL,
    writeRole: "collaborator",
    status: "active",
    createLabel: "Add a task",
    emptyState: "Nothing on the list. That's allowed.",
  },
  {
    id: "calendar",
    name: "Calendar",
    glyph: "📅",
    description: "Dates that matter.",
    shape: "dated",
    categories: ALL,
    writeRole: "collaborator",
    status: "active",
    createLabel: "Add a date",
    emptyState: "No dates in the diary yet.",
  },
  {
    id: "notes",
    name: "Notes",
    glyph: "📝",
    description: "Thinking, kept where the work is.",
    shape: "notes",
    categories: ALL,
    writeRole: "collaborator",
    status: "active",
    createLabel: "Write a note",
    emptyState: "No notes yet.",
  },
  {
    id: "products",
    name: "Products",
    glyph: "📦",
    description: "Things you sell.",
    shape: "list",
    categories: ["business", "creator"],
    writeRole: "member",
    status: "active",
    createLabel: "Add a product",
    emptyState: "No products listed yet.",
  },
  {
    id: "services",
    name: "Services",
    glyph: "🛠️",
    description: "Work you sell by the job or the hour.",
    shape: "list",
    categories: ["business", "creator"],
    writeRole: "member",
    status: "active",
    createLabel: "Add a service",
    emptyState: "No services listed yet.",
  },
  {
    id: "orders",
    name: "Orders",
    glyph: "🧺",
    description: "What's been bought and where it stands.",
    shape: "list",
    categories: ["business"],
    dependsOn: ["products"],
    writeRole: "member",
    status: "active",
    createLabel: "Record an order",
    emptyState: "No orders recorded yet.",
  },
  {
    id: "money",
    name: "Money",
    glyph: "💷",
    description: "Money in, money out, in your own words.",
    shape: "money",
    categories: ALL,
    writeRole: "member",
    status: "active",
    createLabel: "Record money",
    emptyState: "No money recorded yet. Nothing is assumed on your behalf.",
  },
  {
    id: "expenses",
    name: "Expenses",
    glyph: "🧮",
    description: "What the work costs you.",
    shape: "money",
    categories: ALL,
    writeRole: "member",
    status: "active",
    createLabel: "Add an expense",
    emptyState: "No expenses recorded yet.",
  },
  {
    id: "invoices",
    name: "Invoices",
    glyph: "📄",
    description: "What you've billed and what's still owed.",
    shape: "money",
    categories: ["business", "creator"],
    writeRole: "member",
    status: "active",
    createLabel: "Add an invoice",
    emptyState: "No invoices yet.",
  },
  {
    id: "content",
    name: "Content",
    glyph: "🎬",
    description: "Posts, videos, episodes — planned and published.",
    shape: "list",
    categories: ["business", "creator"],
    writeRole: "collaborator",
    status: "active",
    createLabel: "Add a piece of content",
    emptyState: "No content planned yet.",
  },
  {
    id: "music",
    name: "Music",
    glyph: "🎵",
    description: "Songs, demos, beats, sessions.",
    shape: "list",
    categories: ["creator"],
    writeRole: "collaborator",
    status: "active",
    createLabel: "Add a song",
    emptyState: "No songs added yet. Nothing is invented for you.",
  },
  {
    id: "releases",
    name: "Releases",
    glyph: "💿",
    description: "Singles, EPs, albums and their dates.",
    shape: "dated",
    categories: ["creator"],
    dependsOn: ["music"],
    writeRole: "member",
    status: "active",
    createLabel: "Plan a release",
    emptyState: "No releases planned yet.",
  },
  {
    id: "rights",
    name: "Rights",
    glyph: "⚖️",
    description: "Who owns what, and on what terms.",
    shape: "list",
    categories: ["creator", "business"],
    writeRole: "admin",
    status: "active",
    createLabel: "Record a right",
    emptyState: "No rights recorded yet.",
  },
  {
    id: "goals",
    name: "Goals",
    glyph: "🏁",
    description: "What this Vault is actually for.",
    shape: "list",
    categories: ALL,
    writeRole: "member",
    status: "active",
    createLabel: "Set a goal",
    emptyState: "No goals set yet.",
  },
  {
    id: "assets",
    name: "Assets",
    glyph: "🗂️",
    description: "Logos, artwork, masters — the things you reuse.",
    shape: "list",
    categories: ALL,
    writeRole: "collaborator",
    status: "active",
    createLabel: "Add an asset",
    emptyState: "No assets recorded yet.",
  },
  {
    id: "files",
    name: "Files",
    glyph: "📁",
    description: "Secure storage scoped to this Vault.",
    shape: "list",
    categories: ALL,
    writeRole: "collaborator",
    status: "planned",
    createLabel: "Upload a file",
    emptyState: "File storage for Vaults is being fitted. Nothing is lost — it isn't open yet.",
  },
  {
    id: "team",
    name: "Team",
    glyph: "👥",
    description: "Who else works in this Vault.",
    shape: "people",
    categories: ALL,
    writeRole: "admin",
    status: "planned",
    createLabel: "Invite someone",
    emptyState: "Invitations open once team membership is switched on.",
  },
  {
    id: "analytics",
    name: "Analytics",
    glyph: "📈",
    description: "What your own records add up to.",
    shape: "dashboard",
    categories: ALL,
    writeRole: "member",
    status: "planned",
    createLabel: "See the numbers",
    emptyState: "Analytics arrive once there is real work here to measure.",
  },
];

export function moduleById(id: string): VaultModule | undefined {
  return VAULT_MODULES.find((m) => m.id === id);
}

export function modulesFor(category: string): VaultModule[] {
  return VAULT_MODULES.filter((m) => m.categories.includes(category as VaultCategory));
}

/** Add any modules a chosen module leans on, and always keep Home first. */
export function resolveDependencies(ids: string[]): string[] {
  const out = new Set<string>(["home"]);
  for (const id of ids) {
    const mod = moduleById(id);
    if (!mod) continue;
    for (const dep of mod.dependsOn ?? []) out.add(dep);
    out.add(id);
  }
  return VAULT_MODULES.filter((m) => out.has(m.id)).map((m) => m.id);
}
