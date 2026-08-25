// FRASS-0513 / FRASS-0514 — Core Route Registry.
//
// Members never type URLs. Frassy, buttons and menus take them where they are
// going. This registry is the one list of core platform destinations: it feeds
// Frassy's navigation tool, the Welcome Hall's onboarding action, and the Core
// Route Audit that must pass before every production publish.

export type CoreRoute = {
  /** Stable key used by Frassy's navigation tool. */
  key: string;
  /** What a member calls it, in everyday language. */
  label: string;
  /** The internal path — an implementation detail members never see. */
  path: string;
  /** Requires a signed-in member; unauthenticated visitors go to sign-in first. */
  requiresAuth: boolean;
  /** Founder / owner only. */
  founderOnly?: boolean;
  /** This path intentionally redirects somewhere else. */
  redirectsTo?: string;
  /** Things a member might say that mean this place. */
  spoken: string[];
};

export const CORE_ROUTES: CoreRoute[] = [
  {
    key: "manufacturing",
    label: "Creator Manufacturing Network",
    path: "/manufacturing",
    requiresAuth: true,
    spoken: [
      "manufacturing",
      "manufacturing network",
      "get my product made",
      "find a manufacturer",
      "make my designs",
      "production partner",
    ],
  },
  {
    key: "welcome-hall",
    label: "Welcome Hall",
    path: "/welcome-hall",
    requiresAuth: false,
    spoken: ["welcome hall", "the front door", "arrival", "the gates"],
  },
  {
    key: "onboarding",
    label: "Onboarding with Frassy",
    path: "/onboarding",
    requiresAuth: true,
    spoken: [
      "start onboarding",
      "begin onboarding",
      "start my journey",
      "get started",
      "let's get started",
      "sit down with frassy",
      "builder journey",
    ],
  },
  {
    key: "room",
    label: "My Workspace",
    path: "/room",
    requiresAuth: true,
    spoken: ["my workspace", "workspace", "my room", "where i work"],
  },
  {
    key: "daily",
    label: "The Daily",
    path: "/daily",
    requiresAuth: true,
    redirectsTo: "/room?daily=true",
    spoken: ["the daily", "my day", "today", "daily briefing"],
  },
  {
    key: "money-moves",
    label: "Money Moves",
    path: "/money-moves",
    requiresAuth: true,
    spoken: ["money moves", "how do i make money today", "income"],
  },
  {
    key: "marketplace",
    label: "Frass Services Marketplace",
    path: "/frass-services",
    requiresAuth: false,
    spoken: ["marketplace", "frass services", "services"],
  },
  {
    key: "financial-center",
    label: "Financial Center",
    path: "/financial-center",
    requiresAuth: true,
    spoken: ["financial center", "my money", "earnings", "receipts"],
  },
  {
    key: "vault",
    label: "Builder Vault",
    path: "/vault",
    requiresAuth: true,
    spoken: ["vault", "builder vault", "my files", "my assets"],
  },
  {
    key: "for-me",
    label: "FOR ME",
    path: "/for-me",
    requiresAuth: false,
    spoken: ["for me", "my page", "my profile page"],
  },
  {
    key: "frass-card",
    label: "My Frass Card",
    path: "/workspace/card",
    requiresAuth: true,
    spoken: ["frass card", "my card", "my identity", "my storefront"],
  },
  {
    key: "founder",
    label: "Founder Control Room",
    path: "/control-room",
    requiresAuth: true,
    founderOnly: true,
    spoken: ["founder mode", "control room", "founder hall", "headquarters", "command center"],
  },
];

export function coreRouteByKey(key: string): CoreRoute | undefined {
  return CORE_ROUTES.find((r) => r.key === key);
}

/** Match what a member actually said to a destination. Never returns a URL to read aloud. */
export function matchSpokenDestination(text: string): CoreRoute | undefined {
  const t = text.toLowerCase();
  let best: { route: CoreRoute; len: number } | undefined;
  for (const route of CORE_ROUTES) {
    for (const phrase of [route.label.toLowerCase(), ...route.spoken]) {
      if (t.includes(phrase) && (!best || phrase.length > best.len)) {
        best = { route, len: phrase.length };
      }
    }
  }
  return best?.route;
}

/** Where an onboarding action should send someone, given whether they are signed in. */
export function onboardingDestination(signedIn: boolean): string {
  return signedIn ? "/onboarding" : "/auth?next=%2Fonboarding";
}
