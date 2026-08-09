// ─────────────────────────────────────────────────────────────────────────────
// FRASS MASTER REGISTRY — Workspace Experience System v1.0
// Unified Workspace Architecture for Founder, Builder, Partner & Member Rooms.
//
// The room is the workspace. Frassy is the operating partner, not a chat widget.
// This module is the single source of truth for projects, context panels,
// profession toolsets and the Workspace Timeline.
// ─────────────────────────────────────────────────────────────────────────────

export type RoomKind = "founder" | "builder" | "partner" | "member";

export type WorkspaceProject = {
  id: string;
  name: string;
  emoji: string;
  /** Which context-panel preset this project loads. */
  panel: PanelPreset;
  /** What Frassy becomes while this project is open. */
  frassyRole: string;
  opener: string;
};

export type PanelPreset =
  | "merchandising"
  | "design"
  | "music"
  | "fashion"
  | "photography"
  | "build"
  | "finance"
  | "farm"
  | "governance";


export type PanelSection = { title: string; items: string[] };

export const PANEL_PRESETS: Record<PanelPreset, PanelSection[]> = {
  merchandising: [
    { title: "Current vendor", items: ["No vendor in review", "Open vendor scorecard"] },
    { title: "Products reviewed", items: ["Reviewed 0", "Approved 0", "Held 0"] },
    { title: "Margins", items: ["Platform allocation 10%", "Protected floor active"] },
    { title: "Affiliate recommendation", items: ["Run Commission Simulator"] },
  ],
  design: [
    { title: "Districts", items: ["Frass District", "Luxury House", "Kids World"] },
    { title: "Assets", items: ["Images", "Videos", "Brand notes"] },
    { title: "Brand", items: ["Block letters", "Chrome + gold", "Caribbean warmth"] },
  ],
  music: [
    { title: "Session", items: ["Recording", "Stems", "Takes"] },
    { title: "Audio", items: ["Waveform", "Equalizer", "Mastering"] },
    { title: "Release", items: ["Lyrics", "Publishing", "Royalty tracking"] },
  ],
  fashion: [
    { title: "Collections", items: ["Collection manager", "Product boards"] },
    { title: "References", items: ["Fabrics", "Colour libraries", "Lookbooks"] },
    { title: "Supply", items: ["Supplier links", "Sampling status"] },
  ],
  photography: [
    { title: "Gallery", items: ["RAW intake", "Editing queue", "Albums"] },
    { title: "Delivery", items: ["Client proofs", "Portfolio", "Publishing"] },
  ],
  build: [
    { title: "Projects", items: ["Blueprints", "Materials", "Site photos"] },
    { title: "Progress", items: ["Milestones", "Documentation"] },
  ],
  finance: [
    { title: "Money", items: ["Revenue", "Costs", "Protected margin 10%"] },
    { title: "Planning", items: ["Cash runway", "Payouts", "Pricing decisions"] },
  ],
  farm: [
    { title: "Season", items: ["Planting calendar", "Harvest window", "Weather notes"] },
    { title: "Yield", items: ["Plots", "Inputs", "Market prices"] },
  ],
  governance: [
    { title: "Pending decisions", items: ["Needs Founder approval", "Waiting on Builder"] },
    { title: "Policy", items: ["Affiliate policy", "Roles & access", "Registry entries"] },
  ],
};


export const FOUNDER_PROJECTS: WorkspaceProject[] = [
  {
    id: "homepage",
    name: "Homepage & Districts",
    emoji: "🏗",
    panel: "design",
    frassyRole: "Creative director",
    opener: "Where should we take the homepage today?",
  },
  {
    id: "product-population",
    name: "Product Population",
    emoji: "📦",
    panel: "merchandising",
    frassyRole: "Chief merchandising officer",
    opener: "Resuming Product Population. Want the progress summary first?",
  },
  {
    id: "luxury-house",
    name: "Frass Luxury House",
    emoji: "👗",
    panel: "fashion",
    frassyRole: "Fashion director",
    opener: "Luxury House is open. Collections, lookbooks or suppliers?",
  },
  {
    id: "kids-world",
    name: "Kids World",
    emoji: "👶",
    panel: "design",
    frassyRole: "Experience architect",
    opener: "Kids World — safety, play or shopping architecture?",
  },
  {
    id: "affiliate",
    name: "Affiliate Engine",
    emoji: "🤝",
    panel: "merchandising",
    frassyRole: "Profit protection analyst",
    opener: "Affiliate Engine. Shall I run a margin check?",
  },
  {
    id: "foundation",
    name: "Foundation",
    emoji: "💛",
    panel: "governance",
    frassyRole: "Impact steward",
    opener: "Foundation work. Which pillar are we serving?",
  },
  {
    id: "marketplace",
    name: "Marketplace",
    emoji: "🏬",
    panel: "merchandising",
    frassyRole: "Marketplace operator",
    opener: "Marketplace. Vendors, reputation or listings?",
  },
  {
    id: "academy",
    name: "Builder Academy",
    emoji: "🎓",
    panel: "build",
    frassyRole: "Mentor",
    opener: "Academy. Which Builder Path are we shaping?",
  },
  {
    id: "architecture",
    name: "Architecture & Registry",
    emoji: "📐",
    panel: "governance",
    frassyRole: "Executive advisor",
    opener: "Architecture. Which blueprint are we amending?",
  },
  {
    id: "music-studio",
    name: "Music Studio",
    emoji: "🎵",
    panel: "music",
    frassyRole: "Studio producer",
    opener: "Studio's open. Writing, recording or releasing?",
  },
  {
    id: "farm-hub",
    name: "Farm Hub",
    emoji: "🌾",
    panel: "farm",
    frassyRole: "Seasonal planner",
    opener: "Farm Hub. Season planning or market pricing?",
  },
  {
    id: "finance",
    name: "Finance",
    emoji: "💰",
    panel: "finance",
    frassyRole: "Financial advisor",
    opener: "Finance. Revenue, costs, or a pricing decision?",
  },
  {
    id: "bridal",
    name: "Bridal",
    emoji: "👰",
    panel: "fashion",
    frassyRole: "Bridal director",
    opener: "Bridal. Which part of the flagship are we shaping?",
  },
];

// ── Workspace Modes ──────────────────────────────────────────────────────────
// One workspace. Modes change the tools, never the place. A Builder can be a
// Partner, Artist, Farmer and Seller at once — no second workspace anywhere.

export type WorkspaceMode = {
  id: string;
  name: string;
  emoji: string;
  /** Projects surfaced while this mode is active. */
  projectIds: string[];
};

export const WORKSPACE_MODES: WorkspaceMode[] = [
  {
    id: "projects",
    name: "Projects",
    emoji: "🗂",
    projectIds: [
      "homepage",
      "product-population",
      "luxury-house",
      "kids-world",
      "bridal",
      "affiliate",
      "foundation",
      "marketplace",
      "academy",
      "architecture",
      "music-studio",
      "farm-hub",
      "finance",
    ],
  },
  { id: "fashion", name: "Fashion Studio", emoji: "👗", projectIds: ["luxury-house", "bridal", "kids-world", "homepage"] },
  { id: "music", name: "Music Studio", emoji: "🎵", projectIds: ["music-studio"] },
  { id: "marketplace", name: "Marketplace", emoji: "🏬", projectIds: ["marketplace", "product-population", "affiliate"] },
  { id: "farm", name: "Farm Hub", emoji: "🌾", projectIds: ["farm-hub"] },
  { id: "foundation", name: "Foundation", emoji: "❤️", projectIds: ["foundation"] },
  { id: "finance", name: "Finance", emoji: "💰", projectIds: ["finance", "affiliate"] },
  { id: "academy", name: "Academy", emoji: "🎓", projectIds: ["academy", "architecture"] },
];

export const MODE_BY_ID = (id: string) =>
  WORKSPACE_MODES.find((m) => m.id === id) ?? WORKSPACE_MODES[0];

export const PROJECTS_FOR_MODE = (id: string): WorkspaceProject[] => {
  const ids = MODE_BY_ID(id).projectIds;
  return ids
    .map((pid) => FOUNDER_PROJECTS.find((p) => p.id === pid))
    .filter((p): p is WorkspaceProject => Boolean(p));
};


export type Milestone = {
  id: string;
  icon: string;
  label: string;
  when: string;
  projectId: string;
};

/** Workspace Timeline — the history of the company, not a scroll of messages. */
export const FOUNDER_MILESTONES: Milestone[] = [
  { id: "m1", icon: "🏗", label: "Homepage approved", when: "Phase 1", projectId: "homepage" },
  { id: "m2", icon: "👟", label: "Frass Kicks District completed", when: "Phase 1", projectId: "homepage" },
  { id: "m3", icon: "👗", label: "Luxury House designed", when: "Phase 2", projectId: "luxury-house" },
  { id: "m4", icon: "👶", label: "Kids World architecture approved", when: "Phase 2", projectId: "kids-world" },
  { id: "m5", icon: "📦", label: "Product population opened", when: "Phase 3", projectId: "product-population" },
  { id: "m6", icon: "🤝", label: "Vendor scorecard adopted", when: "Phase 3", projectId: "product-population" },
  { id: "m7", icon: "💰", label: "Affiliate engine configured", when: "Phase 4", projectId: "affiliate" },
];

export type TaskState =
  | "current"
  | "pending-decision"
  | "needs-approval"
  | "waiting-builder"
  | "completed"
  | "next";

export type WorkspaceTask = {
  id: string;
  label: string;
  state: TaskState;
  projectId: string;
};

export const TASK_LABELS: Record<TaskState, string> = {
  current: "Current project",
  "pending-decision": "Pending decisions",
  "needs-approval": "Needs Founder approval",
  "waiting-builder": "Waiting on Builder",
  completed: "Completed",
  next: "Next recommendation",
};

export const FOUNDER_TASKS: WorkspaceTask[] = [
  { id: "t1", label: "Product Population — CJ Dropshipping intake", state: "current", projectId: "product-population" },
  { id: "t2", label: "Approve commission band for footwear", state: "needs-approval", projectId: "affiliate" },
  { id: "t3", label: "Choose Luxury House autumn palette", state: "pending-decision", projectId: "luxury-house" },
  { id: "t4", label: "Upload Kids World illustration set", state: "waiting-builder", projectId: "kids-world" },
  { id: "t5", label: "Frass District hero locked", state: "completed", projectId: "homepage" },
  { id: "t6", label: "Review first five vendors, one at a time", state: "next", projectId: "product-population" },
];

export const PROJECT_BY_ID = (id: string) =>
  FOUNDER_PROJECTS.find((p) => p.id === id) ?? FOUNDER_PROJECTS[0];
