// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0566 — Protected Contact Boundary
//
// "Members should be discoverable. Their private contact information should not be."
//
// A public profile exists so a collector, customer or collaborator can find a
// Builder and trust them. It does not exist to hand out their inbox and phone
// number. Anyone who wants to reach a Builder goes through 📨 Contact Builder —
// the message passes through Frass, and the Builder decides whether to reply.
// ─────────────────────────────────────────────────────────────────────────────

import { publicUnsafeFields } from "./public-data-boundary";

/** What a public profile is allowed to show. An allow-list, never a hide-list. */
export const PUBLIC_PROFILE_FIELDS = [
  "display_name",
  "handle",
  "business_name",
  "biography",
  "artist_statement",
  "location",
  "disciplines",
  "portfolio",
  "products",
  "avatar_url",
  "hero_url",
  "social_links",
  "website_url",
] as const;

/** Personal contact details. Never public — a secure contact flow replaces them. */
export const PROTECTED_CONTACT_FIELDS = [
  "email",
  "contact_email",
  "email_address",
  "backup_email",
  "phone",
  "phone_number",
  "mobile",
  "whatsapp",
  "telegram",
  "address",
  "street_address",
  "postal_code",
  "contact_details",
  "private_contact",
] as const;

const normalize = (field: string) => field.trim().toLowerCase();

/** Which requested columns are personal contact details that must stay private. */
export function protectedContactFields(fields: readonly string[]): string[] {
  const banned = new Set<string>(PROTECTED_CONTACT_FIELDS);
  return fields.filter((f) => banned.has(normalize(f)));
}

/**
 * Guard for any public profile read path. Throws before a personal address or
 * number can leave the building — including the internal IDs and money values
 * already blocked by FRASS-0565.
 */
export function assertContactSafe(source: string, fields: readonly string[]): void {
  const contact = protectedContactFields(fields);
  const other = publicUnsafeFields(fields);
  const unsafe = [...new Set([...contact, ...other])];
  if (unsafe.length === 0) return;
  throw new Error(
    `FRASS-0566 Protected Contact Boundary: "${source}" tried to publish ${unsafe.join(", ")}. ` +
      "Public profiles show identity and work only — route contact through 📨 Contact Builder.",
  );
}

/** Keep only the display fields a public profile may carry. */
export function publicProfileProjection<T extends Record<string, unknown>>(
  row: T,
  extra: readonly (keyof T & string)[] = [],
): Partial<T> {
  const allowed = [...PUBLIC_PROFILE_FIELDS, ...extra].filter(
    (f) => protectedContactFields([f]).length === 0 && publicUnsafeFields([f]).length === 0,
  );
  const out: Partial<T> = {};
  for (const f of allowed) {
    if (f in row) out[f as keyof T] = row[f as keyof T];
  }
  return out;
}

export const CONTACT_BUILDER_LABEL = "📨 Contact Builder";

export const CONTACT_BUILDER_EXPLAINER =
  "Your message goes to this Builder through Frass. Your details stay with Frass, theirs stay with them, and they choose whether to reply.";

export const PROTECTED_CONTACT_PRINCIPLE =
  "Frass helps Builders connect without requiring them to expose their personal contact information.";
