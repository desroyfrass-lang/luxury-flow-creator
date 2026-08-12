// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0488 — Biometric Authentication & Identity.
//
// ONE constitutional security rule, not a growing list of exceptions:
//
//   "Any action that could expose, transfer, delete or permanently change
//    sensitive information or assets requires identity verification."
//
// Plain English: walking around the house needs no key. Opening the safe,
// changing the locks, or moving the deeds does. Frass asks who you are at the
// safe door — never in the hallway.
//
// This file is the single registry of those doors, plus the rules for how long
// a verification stays good. It holds no UI and no crypto: the shared gate is
// `src/components/security/identity-gate.tsx`, the device work is
// `src/lib/security/identity.functions.ts`.
// ─────────────────────────────────────────────────────────────────────────────

export const SENSITIVE_ACTION_RULE =
  "Any action that could expose, transfer, delete or permanently change sensitive information or assets requires identity verification.";

export const SECURITY_PRINCIPLE =
  "Security should increase confidence, not create friction. The safest experience should also be the simplest.";

/** Verification methods, strongest first. The strongest available is offered first. */
export const VERIFICATION_METHODS = [
  {
    id: "biometric",
    label: "Face ID · Touch ID · Fingerprint · Windows Hello",
    plain:
      "Your device checks it's you and only tells Frass yes or no. Your face and fingerprint never leave the device.",
  },
  { id: "passkey", label: "Passkey", plain: "A key stored on your device instead of a password." },
  { id: "password", label: "Password", plain: "Always available, on every device, as the fallback." },
] as const;
export type VerificationMethod = (typeof VERIFICATION_METHODS)[number]["id"];

export function methodLabel(id: string): string {
  return VERIFICATION_METHODS.find((m) => m.id === id)?.label ?? "Verified";
}

/* ── The doors ────────────────────────────────────────────────────────────── */

export type SensitiveArea = "money" | "account" | "founder" | "ownership";

export type SensitiveAction = {
  id: string;
  area: SensitiveArea;
  label: string;
  /** What Frassy says when she asks. She explains, she never decides. */
  reason: string;
  /** Minutes a successful verification covers this action for. */
  ttlMinutes: number;
  /** Founder / platform-wide actions always ask for the strongest method. */
  strongestOnly?: boolean;
};

export const SENSITIVE_ACTIONS: SensitiveAction[] = [
  // Money — Financial Authentication
  { id: "wallet", area: "money", label: "Wallet", reason: "For your security, I need to verify it's really you before we open your Wallet.", ttlMinutes: 15 },
  { id: "financial_center", area: "money", label: "Financial Center", reason: "For your security, I need to verify it's really you before we open your Financial Center.", ttlMinutes: 15 },
  { id: "withdrawal", area: "money", label: "Withdrawal", reason: "Money is about to leave your account. Let me confirm it's you first.", ttlMinutes: 5 },
  { id: "transfer", area: "money", label: "Wallet transfer", reason: "This moves funds. One quick check that it's you.", ttlMinutes: 5 },
  { id: "payment_approval", area: "money", label: "Payment approval", reason: "Approving a payment moves real money — let's confirm it's you.", ttlMinutes: 5 },
  { id: "bank_details", area: "money", label: "Linked bank accounts & payout settings", reason: "Changing where your money lands is the most valuable thing anyone could take. Verify first.", ttlMinutes: 5 },
  { id: "payment_methods", area: "money", label: "Payment methods", reason: "Payment methods are sensitive — a quick identity check protects them.", ttlMinutes: 10 },
  { id: "earnings", area: "money", label: "Earnings", reason: "Your earnings are private financial records.", ttlMinutes: 15 },
  { id: "tax_documents", area: "money", label: "Tax documents", reason: "Tax documents carry personal financial detail.", ttlMinutes: 15 },
  { id: "financial_export", area: "money", label: "Financial export", reason: "Exporting takes financial records off the platform. Verify first.", ttlMinutes: 5 },

  // Account — the Sensitive Action Rule beyond money
  { id: "change_email", area: "account", label: "Change email address", reason: "Your email is how you get back in. Let's confirm it's you.", ttlMinutes: 5 },
  { id: "change_password", area: "account", label: "Change password", reason: "Changing your password changes how you sign in everywhere.", ttlMinutes: 5 },
  { id: "change_phone", area: "account", label: "Change phone number", reason: "Your phone number is a recovery path.", ttlMinutes: 5 },
  { id: "security_settings", area: "account", label: "Security settings", reason: "You're about to change how your account is protected.", ttlMinutes: 10 },
  { id: "disable_2fa", area: "account", label: "Remove a passkey or second factor", reason: "Removing a protection is exactly the action an intruder would take.", ttlMinutes: 5 },
  { id: "identity_verification", area: "account", label: "Identity verification", reason: "Identity records are personal.", ttlMinutes: 10 },
  { id: "personal_export", area: "account", label: "Export personal data", reason: "Exporting takes personal data off the platform.", ttlMinutes: 5 },
  { id: "delete_account", area: "account", label: "Delete account", reason: "This is permanent. I need to be certain it's you.", ttlMinutes: 5, strongestOnly: true },

  // Ownership
  { id: "transfer_business", area: "ownership", label: "Transfer business ownership", reason: "Ownership transfer cannot be undone by you alone.", ttlMinutes: 5, strongestOnly: true },

  // Founder — platform-wide
  { id: "founder_mode", area: "founder", label: "Founder Mode", reason: "Founder Mode carries platform-wide authority.", ttlMinutes: 15, strongestOnly: true },
  { id: "financial_audit_center", area: "founder", label: "Financial Audit Center", reason: "The audit book shows every member's money movement.", ttlMinutes: 10, strongestOnly: true },
  { id: "payout_rules", area: "founder", label: "Change payout rules", reason: "Payout rules decide how everyone gets paid.", ttlMinutes: 5, strongestOnly: true },
  { id: "platform_settings", area: "founder", label: "Platform-wide settings", reason: "This changes Frass for every member.", ttlMinutes: 5, strongestOnly: true },
  { id: "settlement_approval", area: "founder", label: "Approve settlement or refund", reason: "Settlements and refunds move platform money.", ttlMinutes: 5, strongestOnly: true },
  { id: "workspace", area: "founder", label: "Business Workspace", reason: "Business systems sit behind this door.", ttlMinutes: 15 },
];

export function sensitiveAction(id: string): SensitiveAction | undefined {
  return SENSITIVE_ACTIONS.find((a) => a.id === id);
}

export function actionsByArea(area: SensitiveArea): SensitiveAction[] {
  return SENSITIVE_ACTIONS.filter((a) => a.area === area);
}

/* ── Secure session ───────────────────────────────────────────────────────── */
// A verification covers its action for a short window, per browser session.
// Leaving the app, locking the device or switching accounts ends it, because
// sessionStorage dies with the tab and the timestamps are absolute.

const KEY = "frass.identity.verified.v1";
const TIMEOUT_KEY = "frass.identity.timeout.v1";

type Ledger = Record<string, { at: number; method: VerificationMethod }>;

function read(): Ledger {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.sessionStorage.getItem(KEY) ?? "{}") as Ledger;
  } catch {
    return {};
  }
}

function write(ledger: Ledger) {
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(ledger));
  } catch {
    /* private browsing — every sensitive action simply asks again */
  }
}

/** Members may choose a shorter timeout than the action's default. Never longer. */
export function preferredTimeoutMinutes(): number | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(TIMEOUT_KEY);
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function setPreferredTimeoutMinutes(minutes: number | null) {
  if (typeof window === "undefined") return;
  if (minutes == null) window.localStorage.removeItem(TIMEOUT_KEY);
  else window.localStorage.setItem(TIMEOUT_KEY, String(minutes));
}

export function ttlFor(action: SensitiveAction): number {
  const pref = preferredTimeoutMinutes();
  return pref == null ? action.ttlMinutes : Math.min(pref, action.ttlMinutes);
}

export function isVerified(actionId: string): boolean {
  const action = sensitiveAction(actionId);
  if (!action) return false;
  const entry = read()[actionId];
  if (!entry) return false;
  return Date.now() - entry.at < ttlFor(action) * 60_000;
}

export function recordVerification(actionId: string, method: VerificationMethod) {
  const ledger = read();
  ledger[actionId] = { at: Date.now(), method };
  write(ledger);
}

/** Sign-out, account switch, or "lock Frass now". */
export function clearVerifications() {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(KEY);
  } catch {
    /* nothing to clear */
  }
}

/* ── Device fingerprint (a label, never an identity) ──────────────────────── */

export function deviceKey(): string {
  if (typeof window === "undefined") return "server";
  const existing = window.localStorage.getItem("frass.device.key");
  if (existing) return existing;
  const key = crypto.randomUUID();
  try {
    window.localStorage.setItem("frass.device.key", key);
  } catch {
    /* ephemeral device */
  }
  return key;
}

export function deviceLabelGuess(): string {
  if (typeof navigator === "undefined") return "Unknown device";
  const ua = navigator.userAgent;
  const platform =
    /iPhone/.test(ua) ? "iPhone"
    : /iPad/.test(ua) ? "iPad"
    : /Android/.test(ua) ? "Android phone"
    : /Macintosh/.test(ua) ? "Mac"
    : /Windows/.test(ua) ? "Windows PC"
    : /Linux/.test(ua) ? "Linux computer"
    : "Device";
  const browser =
    /Edg\//.test(ua) ? "Edge"
    : /Chrome\//.test(ua) ? "Chrome"
    : /Safari\//.test(ua) ? "Safari"
    : /Firefox\//.test(ua) ? "Firefox"
    : "browser";
  return `${platform} · ${browser}`;
}

/** What the operating system calls its own biometric check, so the prompt matches reality. */
export function biometricName(): string {
  if (typeof navigator === "undefined") return "device biometrics";
  const ua = navigator.userAgent;
  if (/iPhone|iPad|Macintosh/.test(ua)) return "Face ID or Touch ID";
  if (/Android/.test(ua)) return "your fingerprint or face";
  if (/Windows/.test(ua)) return "Windows Hello";
  return "your device biometrics";
}

export const PRIVACY_PROMISE = [
  "Frass never stores biometric data.",
  "Your face and fingerprint stay in your device's secure hardware.",
  "Frass only ever receives a yes or no.",
  "Biometrics are optional and never the only way back into your account.",
];

export const ACCESSIBILITY_PROMISE =
  "Every biometric option has an accessible alternative. Password sign-in is always available on every device.";
