/**
 * FRASS-0492 — Digital Rights & Content Protection.
 *
 * Platform-wide. This is not a Gallery feature: it governs every original work
 * a member creates or sells anywhere in Frass — Gallery, FOR ME, Marketplace,
 * FV Studios, Collections, the Media Library and the Frass Card.
 *
 * It extends the existing content architecture. There is no second media
 * pipeline, no second permissions model and no second rights service.
 *
 * The honesty rule of this amendment: no website can prevent screenshots.
 * Browsers and operating systems own that decision. So Frass never promises
 * the impossible — it makes casual copying hard, watermarks what is shown,
 * delivers display-quality rather than archival files, and gives members a
 * better way to share than a screenshot ever was.
 */

export const RIGHTS_PRINCIPLE =
  "Every creation deserves respect. Frass exists to help creators share, sell and protect their work while preserving their ownership and creative rights.";

export const RIGHTS_PLAIN_ENGLISH =
  "Think of it like a gallery wall. Anyone can walk in and look at the paintings, and nobody can stop a visitor photographing one from across the room. What the gallery does control is the frame, the glass, the lighting and who walks out with the canvas. Frass does the same thing: your work is shown beautifully, casual copying is made awkward, what people see carries your name, and the full-quality original only ever leaves with someone who bought it.";

export const RIGHTS_HONESTY =
  "Screenshots cannot be universally prevented. Frass will never claim otherwise. Protection here is layered — secure viewing, watermarking, display-resolution delivery and clear rights — not a promise no browser can keep.";

export const RIGHTS_NO_DUPLICATE_RULE =
  "Protection extends the existing media, storage and permission systems. Never build a parallel rights service, a second image pipeline or a separate licensing database.";

/* ── What is protected ───────────────────────────────────────────────────── */

export const PROTECTED_CONTENT = [
  "Original paintings",
  "Drawings and sketches",
  "Digital artwork",
  "Photography",
  "NFTs",
  "Premium collections",
  "Premium educational content",
  "Member portfolios, where the member has chosen protection",
  "Licensed media",
] as const;

/* ── Protection levels ───────────────────────────────────────────────────── */

export type ProtectionLevel = "open" | "standard" | "protected";

export type ProtectionRule = {
  id: ProtectionLevel;
  label: string;
  plain: string;
  /** Block the browser's own save/drag affordances. */
  blockContextMenu: boolean;
  blockDrag: boolean;
  /** Overlay the work with the creator's name while it is being viewed. */
  watermark: boolean;
  /** Serve a display-sized render rather than the archival original. */
  displayResolutionOnly: boolean;
};

export const PROTECTION_LEVELS: Record<ProtectionLevel, ProtectionRule> = {
  open: {
    id: "open",
    label: "Open",
    plain:
      "Shown normally. Anyone can save it. Choose this for promotional work you actively want spread around.",
    blockContextMenu: false,
    blockDrag: false,
    watermark: false,
    displayResolutionOnly: false,
  },
  standard: {
    id: "standard",
    label: "Standard protection",
    plain:
      "The default. Right-click saving and dragging are switched off and the full-quality file is never sent to a browser — only a display-sized version.",
    blockContextMenu: true,
    blockDrag: true,
    watermark: false,
    displayResolutionOnly: true,
  },
  protected: {
    id: "protected",
    label: "Fully protected",
    plain:
      "Everything in standard protection, plus your name watermarked across the work while it is being viewed. Best for originals and unsold pieces.",
    blockContextMenu: true,
    blockDrag: true,
    watermark: true,
    displayResolutionOnly: true,
  },
};

export const DEFAULT_PROTECTION: ProtectionLevel = "standard";

export function protectionRule(level?: string | null): ProtectionRule {
  return PROTECTION_LEVELS[(level as ProtectionLevel) ?? DEFAULT_PROTECTION] ?? PROTECTION_LEVELS.standard;
}

/* ── Licences: what a buyer actually receives ────────────────────────────── */

export type LicenseGrant =
  | "display_only"
  | "personal_download"
  | "commercial_license"
  | "nft_ownership"
  | "original_physical";

export type License = {
  id: LicenseGrant;
  label: string;
  buyerGets: string;
  creatorKeeps: string;
  /** Whether purchase releases a downloadable file at full quality. */
  releasesFile: boolean;
};

export const LICENSES: Record<LicenseGrant, License> = {
  display_only: {
    id: "display_only",
    label: "Display only",
    buyerGets: "The right to view the work here on Frass. No file, no download.",
    creatorKeeps: "Everything. Copyright, reproduction rights and the original file.",
    releasesFile: false,
  },
  personal_download: {
    id: "personal_download",
    label: "Personal download",
    buyerGets:
      "A full-quality file for personal use — printing it for their own wall, a phone background, a private gift.",
    creatorKeeps: "Copyright and all commercial rights. The buyer cannot resell it or use it in a business.",
    releasesFile: true,
  },
  commercial_license: {
    id: "commercial_license",
    label: "Commercial licence",
    buyerGets:
      "A full-quality file plus written permission to use the work in their own business, within the terms you write.",
    creatorKeeps: "Copyright. You still own the work; you have licensed its use.",
    releasesFile: true,
  },
  nft_ownership: {
    id: "nft_ownership",
    label: "NFT ownership",
    buyerGets: "Verifiable ownership of the tokenised edition on-chain.",
    creatorKeeps: "Copyright, unless you explicitly transfer it in your terms.",
    releasesFile: false,
  },
  original_physical: {
    id: "original_physical",
    label: "Original physical artwork",
    buyerGets: "The physical piece itself, shipped to them.",
    creatorKeeps: "Copyright and reproduction rights — owning a painting is not owning its copyright.",
    releasesFile: false,
  },
};

export const LICENSE_ORDER: LicenseGrant[] = [
  "display_only",
  "personal_download",
  "commercial_license",
  "nft_ownership",
  "original_physical",
];

export function licenseOf(grant?: string | null): License {
  return LICENSES[(grant as LicenseGrant) ?? "display_only"] ?? LICENSES.display_only;
}

/**
 * The single question every listing must answer for a buyer, in plain words.
 * Marketplace, Gallery and Card listings all use this same sentence.
 */
export function whatYouReceive(grant?: string | null): string {
  return licenseOf(grant).buyerGets;
}

/* ── Frassy's rights teaching ────────────────────────────────────────────── */

export const RIGHTS_QUESTIONS = [
  {
    q: "Do I still own my work after someone buys it?",
    a: "Yes, unless you sold the copyright itself — and Frass never does that automatically. Selling a painting sells the object. Selling a download sells a use. Copyright stays with you until you personally, explicitly hand it over in writing.",
  },
  {
    q: "What is a licence?",
    a: "Permission with edges. You keep the work; you let someone use it in a specific way. 'Personal' means for themselves. 'Commercial' means inside their business. You choose which one is on sale.",
  },
  {
    q: "Can Frass stop people screenshotting my art?",
    a: "No, and neither can anyone else — that switch belongs to the phone and the browser, not the website. What Frass does instead: your name sits across protected work, only a screen-sized version is ever sent out, saving and dragging are switched off, and buyers get the real file. A screenshot of a watermarked, screen-sized image is not a substitute for the original.",
  },
  {
    q: "Should I tokenise it as an NFT?",
    a: "Only if you want to. It is one route among several, never a requirement and never the default. A painting that sells beautifully as prints does not need a blockchain.",
  },
] as const;

export const FRASSY_RIGHTS_BOUNDARY =
  "Frassy explains copyright, licensing, pricing, NFT ownership and usage permissions. She never changes a creator's rights, licence terms or price without that creator asking her to.";

/* ── The screenshot answer: Frassy makes the share, not the member ───────── */

export const SHARE_RULE =
  "Members should not need to screenshot Frass to share it. When someone wants to share something they own or are authorised to share, Frassy generates an approved, branded, rights-aware share card instead.";

export type ShareKind =
  | "card_preview"
  | "milestone"
  | "product_preview"
  | "artwork_preview"
  | "certificate"
  | "qr"
  | "promo";

export const SHARE_KINDS: Record<ShareKind, { label: string; plain: string }> = {
  card_preview: { label: "Frass Card preview", plain: "Your card as a clean, shareable image." },
  milestone: { label: "Business milestone", plain: "A moment worth marking — first sale, first month, first launch." },
  product_preview: { label: "Product preview", plain: "One product, priced and branded, ready to post." },
  artwork_preview: {
    label: "Artwork preview",
    plain: "A watermarked preview of a piece — only if the creator allows sharing.",
  },
  certificate: { label: "Achievement certificate", plain: "A verified achievement, presented properly." },
  qr: { label: "QR code", plain: "Your Frass Link as a scannable code." },
  promo: { label: "Promotional image", plain: "A branded image built for social posting." },
};

/** Whether a piece may be shared outward at all, given its owner's choices. */
export function mayShareOutward(opts: {
  isPublished: boolean;
  galleryIsPublic: boolean;
  protection: ProtectionLevel;
}): boolean {
  if (!opts.isPublished || !opts.galleryIsPublic) return false;
  return opts.protection !== "protected" ? true : true; // protected works share watermarked, never raw
}
