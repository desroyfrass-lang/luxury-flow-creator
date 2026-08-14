// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0531 — Security Regression Protection
//
// Constitutional rule: a security issue that has already been solved must never
// quietly return in a future release. Every fixed vulnerability becomes a
// permanent regression test with a recorded root cause, resolution, test case,
// affected systems and classification. Before every deployment the Security
// Center walks this registry and confirms nothing has come back.
//
// Here's the takeaway: once we lock a door, Frass checks that same door before every
// release — forever. Locks don't get forgotten just because the break-in was
// last year.
// ─────────────────────────────────────────────────────────────────────────────

export type SecurityClass =
  | "privilege-escalation"
  | "authorization"
  | "data-exposure"
  | "financial-integrity"
  | "input-validation"
  | "ssrf";

export type RegressionTest = {
  /** Stable id — never renamed, never removed. */
  id: string;
  title: string;
  classification: SecurityClass;
  /** Why it happened, in simple terms. */
  rootCause: string;
  /** What we changed so it can't happen again. */
  resolution: string;
  /** The exact check to run before a release. One sentence, testable. */
  testCase: string;
  /** Expected result of that check. */
  expected: string;
  /** Which parts of Frass this protects. */
  affects: string[];
  /** Where the protection lives in code today. */
  enforcedIn: string[];
  fixedOn: string;
};

export const SECURITY_CLASS_LABEL: Record<SecurityClass, string> = {
  "privilege-escalation": "Privilege escalation",
  authorization: "Authorization",
  "data-exposure": "Data exposure",
  "financial-integrity": "Financial integrity",
  "input-validation": "Input validation",
  ssrf: "Server-side request forgery",
};

/**
 * The permanent registry. Append only — a fixed issue is never deleted from
 * here, because deleting it would delete the memory of how it was solved.
 */
export const SECURITY_REGRESSIONS: RegressionTest[] = [
  {
    id: "founder-authorization",
    title: "Founder Mode must be server-authorized",
    classification: "privilege-escalation",
    rootCause:
      "Founder Mode could be requested by the browser with a client-side flag, so the client was trusted to say who it was.",
    resolution:
      "FRASS-0530 Zero Trust: the chat endpoint verifies the signed-in session and confirms the admin role in the database before unlocking Founder personality or Founder tools.",
    testCase:
      "Send a chat request with a Founder flag and no verified admin session.",
    expected: "Treated as an ordinary visitor. No Founder tools, no Founder personality.",
    affects: ["Frassy chat", "Founder Command Center", "Construction Mode", "Blueprint Mode"],
    enforcedIn: ["src/routes/api/chat.ts", "src/lib/frassy-tools.server.ts"],
    fixedOn: "2026-08-12",
  },
  {
    id: "frassy-tool-access",
    title: "Frassy tools stay behind the caller's real permissions",
    classification: "authorization",
    rootCause:
      "Tool availability was assembled from context supplied by the browser rather than from the verified session.",
    resolution:
      "Tools are built server-side from the verified role; client-supplied experience context is ignored and the relationship level is clamped.",
    testCase: "Ask Frassy, as a signed-out visitor, to run a Founder-only tool.",
    expected: "The tool is not offered and not callable.",
    affects: ["Frassy chat", "Founder tools", "Platform Protection"],
    enforcedIn: ["src/lib/frassy-tools.server.ts", "src/routes/api/chat.ts"],
    fixedOn: "2026-08-12",
  },
  {
    id: "commission-rate-bounds",
    title: "Commission rates cannot be set outside their allowed range",
    classification: "financial-integrity",
    rootCause:
      "Affiliate commission rates were writable without an upper bound, so a bad value could drain margin.",
    resolution: "Database constraints and triggers bound every commission rate on write.",
    testCase: "Try to write an affiliate commission rate above the allowed maximum.",
    expected: "The write is rejected by the database.",
    affects: ["Affiliate campaigns", "Affiliate profiles", "Affiliate links"],
    enforcedIn: ["Database constraints on affiliate tables"],
    fixedOn: "2026-07-01",
  },
  {
    id: "financial-receipt-immutability",
    title: "Financial receipts are append-only and bounded",
    classification: "financial-integrity",
    rootCause: "Receipt amounts were unconstrained and records were editable after the fact.",
    resolution:
      "FRASS-0433: immutability triggers plus amount constraints. Records are written once and never edited — not even by the Founder.",
    testCase: "Attempt to update or delete an existing financial receipt.",
    expected: "The database refuses the change.",
    affects: ["Financial Center", "Wallet", "Payouts", "Audit trail"],
    enforcedIn: ["financial_receipts triggers"],
    fixedOn: "2026-07-04",
  },
  {
    id: "payment-authorization",
    title: "Payment always completes on the customer's own device",
    classification: "authorization",
    rootCause: "A seller-driven flow could otherwise collect payment details directly.",
    resolution:
      "FRASS-0435/0436: payment requests are tokenised links; the customer completes checkout themselves and Frassy never handles card details.",
    testCase: "Try to complete a payment from the seller's session on behalf of a customer.",
    expected: "Not possible. Only the tokenised customer checkout can complete payment.",
    affects: ["Checkout", "Payment requests", "Frass Card point of sale"],
    enforcedIn: ["src/routes/pay.$token.tsx", "payment_requests policies"],
    fixedOn: "2026-07-10",
  },
  {
    id: "upload-fetch-ssrf",
    title: "Server-side image fetches cannot reach internal addresses",
    classification: "ssrf",
    rootCause:
      "A try-on feature fetched a user-supplied URL server-side, which could be pointed at internal services.",
    resolution: "URLs are validated against an allow-list scheme/host policy before any fetch.",
    testCase: "Submit a try-on image URL pointing at a private or loopback address.",
    expected: "Rejected before any network request is made.",
    affects: ["Try-on", "File uploads", "Any server-side fetch of member input"],
    enforcedIn: ["src/lib/tryon.functions.ts"],
    fixedOn: "2026-08-02",
  },
  {
    id: "pii-column-exposure",
    title: "Contact details and private notes are not publicly readable",
    classification: "data-exposure",
    rootCause:
      "Public read policies exposed columns containing contact emails and private Founder notes.",
    resolution: "Column-level access was restricted and public reads narrowed to safe fields.",
    testCase: "Read artist galleries and first partners as an anonymous visitor.",
    expected: "No contact email and no private note is returned.",
    affects: ["Artist galleries", "First Partners", "Public profiles"],
    enforcedIn: ["RLS policies and restricted views"],
    fixedOn: "2026-08-02",
  },
  {
    id: "role-permission-source",
    title: "Roles are read from the roles table, never from the client",
    classification: "privilege-escalation",
    rootCause: "Roles stored or trusted anywhere other than the dedicated table invite spoofing.",
    resolution:
      "Roles live only in public.user_roles and are checked through the security-definer has_role function.",
    testCase: "Set an admin flag in browser storage and reload a Founder route.",
    expected: "Access denied. The server does not read that flag.",
    affects: ["Admin routes", "Founder Command Center", "Role management"],
    enforcedIn: ["public.has_role", "src/hooks/use-is-admin.ts (display only)"],
    fixedOn: "2026-08-12",
  },
  {
    id: "hidden-admin-routes",
    title: "Hidden administrative routes are protected by more than obscurity",
    classification: "authorization",
    rootCause: "An unlinked route is not a protected route.",
    resolution:
      "Every admin route sits under the authenticated gate and re-verifies the admin role server-side.",
    testCase: "Open an admin URL directly while signed out or signed in without the admin role.",
    expected: "Redirected away; no admin data is returned.",
    affects: ["/admin/*", "/command", "/founder"],
    enforcedIn: ["src/routes/_authenticated/*", "server function middleware"],
    fixedOn: "2026-08-12",
  },
  {
    id: "vault-privacy",
    title: "A member's Knowledge Vault is readable only by that member",
    classification: "data-exposure",
    rootCause: "Shared knowledge storage is easy to widen by accident.",
    resolution: "Vault rows are scoped to auth.uid() with no anonymous grant.",
    testCase: "Read another member's vault entries with a valid but different session.",
    expected: "Zero rows returned.",
    affects: ["Builder Vault", "Knowledge preservation", "Business Vaults"],
    enforcedIn: ["Vault RLS policies"],
    fixedOn: "2026-07-20",
  },
  {
    id: "withdrawal-authorization",
    title: "Financial withdrawals require a verified owner",
    classification: "financial-integrity",
    rootCause: "Payout requests must never be initiated on someone else's behalf.",
    resolution:
      "Withdrawal paths run through authenticated server functions scoped to the caller, with receipts written for every movement.",
    testCase: "Request a withdrawal against an account you do not own.",
    expected: "Rejected before any balance is touched.",
    affects: ["Wallet", "Payouts", "Financial Center"],
    enforcedIn: ["Authenticated server functions", "financial_receipts"],
    fixedOn: "2026-07-10",
  },
  {
    id: "public-internal-identifiers",
    title: "Public surfaces never carry internal identifiers",
    classification: "data-exposure",
    rootCause:
      "Public feeds read raw tables, so account identifiers (host_id, author_id, sender_id, owner_id) travelled with the display data.",
    resolution:
      "FRASS-0565 Public Data Boundary: anonymous access is granted column-by-column on display fields only, and public reads project through an allow-list.",
    testCase:
      "As a signed-out visitor, read every public feed (broadcasts, comments, gifts, layouts, marketplace) and inspect the returned fields.",
    expected: "Display name, title, timestamp and imagery only. No account identifier of any kind.",
    affects: ["Live broadcasts", "Live comments", "Gift Wall", "Daily layout presets", "Marketplace", "Community"],
    enforcedIn: ["src/lib/security/public-data-boundary.ts", "database column grants"],
    fixedOn: "2026-08-14",
  },
  {
    id: "public-financial-values",
    title: "Money is never visible to the public",
    classification: "data-exposure",
    rootCause:
      "Gift and commission rows exposed credits, amounts and currencies to anyone reading the public feed.",
    resolution:
      "Financial columns are revoked from the anonymous role and blocked by the Public Data Boundary allow-list; amounts render only for authorized viewers.",
    testCase:
      "As a signed-out visitor, read the Gift Wall and any public commission or marketplace surface.",
    expected: "Gift type, icon and sender display name only. No credits, amounts, currencies or rates.",
    affects: ["Gift Wall", "Live gifts", "Commissions", "Marketplace pricing", "Affiliate surfaces"],
    enforcedIn: ["src/lib/security/public-data-boundary.ts", "database column grants"],
    fixedOn: "2026-08-14",
  },
  {
    id: "public-raw-tables",
    title: "The public reads dedicated public views, never raw tables",
    classification: "data-exposure",
    rootCause:
      "Public features were built on raw tables, then hardened field-by-field — so every new column started life exposed.",
    resolution:
      "New public surfaces must expose a purpose-built public view or safe API response containing only display fields.",
    testCase:
      "Review every public-facing read added since the last release and confirm each one names an intentional public projection.",
    expected: "No public surface selects * from a raw table; every field is deliberately listed.",
    affects: ["All public feeds, reports, leaderboards and community surfaces"],
    enforcedIn: ["src/lib/security/public-data-boundary.ts"],
    fixedOn: "2026-08-14",
  },
  {
    id: "public-internal-metadata",
    title: "Internal notes, moderation flags and audit fields stay internal",
    classification: "data-exposure",
    rootCause:
      "Notes and moderation metadata lived on the same rows as public display data and inherited the same access.",
    resolution:
      "Founder and moderation metadata is separated or blocked by the boundary allow-list; anonymous grants exclude it entirely.",
    testCase:
      "As a signed-out visitor, read any moderated public surface and look for notes, flags, scores or audit fields.",
    expected: "None returned.",
    affects: ["Community stories", "Gift Wall", "Broadcasts", "Founder notes", "Verified feedback"],
    enforcedIn: ["src/lib/security/public-data-boundary.ts", "database column grants"],
    fixedOn: "2026-08-14",
  },
  {
    id: "protected-contact-email",
    title: "Personal contact details never appear on a public profile",
    classification: "data-exposure",
    rootCause:
      "Published artist galleries were readable in full by signed-out visitors, so contact_email could be harvested straight from the data API.",
    resolution:
      "Anonymous access to artist_galleries is column-scoped and excludes contact_email; the Protected Contact Boundary rejects any public projection carrying an email, phone or address field.",
    testCase:
      "As a signed-out visitor, read a published gallery or public profile and look for an email address, phone number or postal address.",
    expected: "None returned — only identity, story, work and public links.",
    affects: ["Artist Galleries", "Public profiles", "Frass Cards", "Marketplace storefronts"],
    enforcedIn: [
      "src/lib/security/protected-contact-boundary.ts",
      "artist_galleries column grants (anon)",
    ],
    fixedOn: "2026-08-14",
  },
  {
    id: "contact-through-frass",
    title: "Contacting a Builder goes through Frass, never a published address",
    classification: "data-exposure",
    rootCause:
      "Public features reached for a published email as the simplest way to let someone make contact.",
    resolution:
      "Every public surface offers 📨 Contact Builder; the message passes through Frass and the Builder decides whether to reply.",
    testCase:
      "Open any public profile and attempt to contact the Builder; inspect the page source and network responses for a personal address.",
    expected: "Contact Builder is the only route; no personal address is present in the payload.",
    affects: ["Artist Galleries", "Commission Requests", "Public profiles", "Services Marketplace"],
    enforcedIn: ["src/lib/security/protected-contact-boundary.ts"],
    fixedOn: "2026-08-14",
  },
  {
    id: "commission-request-identity",
    title: "A commission request can never be filed in someone else's name",
    classification: "authorization",
    rootCause:
      "The insert rule allowed a null requester or the caller's own id, which needed confirming for signed-out submissions.",
    resolution:
      "The insert policy requires either a signed-out visitor with no account attached, or a signed-in member attaching exactly their own account; validation of name, email and brief runs in a database trigger.",
    testCase:
      "Attempt to submit a commission request carrying another member's account id, signed in and signed out.",
    expected: "Rejected in both cases.",
    affects: ["Artist Galleries", "Commission Requests"],
    enforcedIn: ["commission_requests insert policy", "validate_commission_request trigger"],
    fixedOn: "2026-08-14",
  },
  {
    id: "link-checker-private-network",
    title: "Admin tools never reach private or cloud-metadata addresses",
    classification: "ssrf",
    rootCause:
      "The link checker followed any http/https link discovered on a crawled page, so a planted link could aim the server at an internal address.",
    resolution:
      "Every URL is screened against a loopback, link-local, private, carrier-grade-NAT, multicast and cloud-metadata denylist before any request is made; blocked links are reported, never fetched.",
    testCase:
      "Add a link to http://169.254.169.254/ or http://127.0.0.1/ on a crawled page and run the link checker.",
    expected: "Reported as blocked; no outbound request is made.",
    affects: ["Admin link checker", "Any server-side fetch of a user-supplied URL"],
    enforcedIn: ["src/lib/link-check.functions.ts (isBlockedHost)"],
    fixedOn: "2026-08-14",
  },
];



export function regressionsByClass(): { classification: SecurityClass; tests: RegressionTest[] }[] {
  const order = Object.keys(SECURITY_CLASS_LABEL) as SecurityClass[];
  return order
    .map((classification) => ({
      classification,
      tests: SECURITY_REGRESSIONS.filter((t) => t.classification === classification),
    }))
    .filter((g) => g.tests.length > 0);
}

export function regressionById(id: string): RegressionTest | undefined {
  return SECURITY_REGRESSIONS.find((t) => t.id === id);
}

/** Local record of the last pre-deployment regression sweep. */
const KEY = "frass.security.regressions.verified";

export type RegressionSweep = { at: string; verified: string[]; total: number };

export function loadSweep(): RegressionSweep | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as RegressionSweep) : null;
  } catch {
    return null;
  }
}

export function saveSweep(verified: string[]): RegressionSweep {
  const sweep: RegressionSweep = {
    at: new Date().toISOString(),
    verified,
    total: SECURITY_REGRESSIONS.length,
  };
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(sweep));
    } catch {
      /* storage unavailable — the checklist still works for this session */
    }
  }
  return sweep;
}

/** A release should not be approved while known regression tests are unchecked. */
export function sweepComplete(sweep: RegressionSweep | null): boolean {
  if (!sweep) return false;
  return SECURITY_REGRESSIONS.every((t) => sweep.verified.includes(t.id));
}

export const REGRESSION_PRINCIPLE =
  "Every security issue should strengthen Frass permanently. Once a vulnerability has been " +
  "eliminated, future releases automatically verify that it has not returned.";
