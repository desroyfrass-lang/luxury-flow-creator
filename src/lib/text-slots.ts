// Registry of every editable text slot on the site.
// Keys are stable strings stored in `site_text.slot_key`.
// `defaultValue` is the copy shown when no override exists in the database.
// Grouped by section so the admin page can render an editor that makes sense.

export type TextSlot = {
  key: string;
  label: string;
  hint?: string;
  defaultValue: string;
  multiline?: boolean;
};

export type TextSection = {
  title: string;
  description?: string;
  slots: TextSlot[];
};

export const TEXT_SECTIONS: TextSection[] = [
  {
    title: "Homepage — title card (above the nav)",
    description: "The cinematic 'Frass Hill presents' card that sits above the navigation menu.",
    slots: [
      { key: "home-title-presents", label: "Presenter line", defaultValue: "Frass Hill Presents" },
      { key: "home-title-tagline", label: "Tagline under the logo", defaultValue: "A Luxury cinematic Caribbean Experience." },
    ],
  },
  {
    title: "Homepage — hero",
    description: "The big block-letter hero panel.",
    slots: [
      { key: "home-hero-eyebrow", label: "Hero eyebrow", defaultValue: "FRASS HILL presents" },
      { key: "home-hero-headline", label: "Hero headline", defaultValue: "Original street luxury.", multiline: true },
      {
        key: "home-hero-paragraph",
        label: "Hero paragraph",
        defaultValue:
          "Block-letter attitude, chrome identity, and a darker cinematic showroom that stays closer to your original Frass Kicks site.",
        multiline: true,
      },
      { key: "home-hero-cta-kicks", label: "CTA — Frass Kicks button", defaultValue: "Shop Frass Kicks" },
      { key: "home-hero-cta-drip", label: "CTA — Frass Drip button", defaultValue: "Shop Frass Drip" },
      { key: "home-hero-cta-bare", label: "CTA — Bare Drip button", defaultValue: "Shop Bare Drip" },
      { key: "home-hero-discount", label: "Discount bar", defaultValue: "Use code 15FRASS at checkout for your discount" },
    ],
  },
  {
    title: "Homepage — three worlds",
    description: "The 'Choose your lane' division block.",
    slots: [
      { key: "home-worlds-eyebrow", label: "Eyebrow", defaultValue: "Three Worlds" },
      { key: "home-worlds-title", label: "Section title", defaultValue: "Choose your lane." },
      {
        key: "home-worlds-paragraph",
        label: "Paragraph",
        defaultValue: "Each division stays visual, bold, and closer to the editorial streetwear feeling of the original store.",
        multiline: true,
      },
      { key: "home-card-kicks-title", label: "Kicks card title", defaultValue: "Frass Kicks" },
      { key: "home-card-kicks-desc", label: "Kicks card description", defaultValue: "Premium footwear — casual, street, classic.", multiline: true },
      { key: "home-card-drip-title", label: "Drip card title", defaultValue: "Frass Drip" },
      { key: "home-card-drip-desc", label: "Drip card description", defaultValue: "Fashion-forward apparel for the everyday icon. Sports Drip lives inside Men's & Women's.", multiline: true },
      { key: "home-card-bare-title", label: "Bare card title", defaultValue: "Bare Drip" },
      { key: "home-card-bare-desc", label: "Bare card description", defaultValue: "Swim, intimates & lifestyle essentials.", multiline: true },
    ],
  },
  {
    title: "Homepage — lookbook block",
    slots: [
      { key: "home-lookbook-eyebrow", label: "Eyebrow", defaultValue: "The Lookbook" },
      { key: "home-lookbook-title", label: "Section title", defaultValue: "Stories, not catalogs." },
      { key: "home-lookbook-cta", label: "View all link label", defaultValue: "View all volumes" },
    ],
  },
  {
    title: "Homepage — best sellers",
    slots: [
      { key: "home-best-eyebrow", label: "Eyebrow", defaultValue: "Best Sellers" },
      { key: "home-best-title", label: "Section title", defaultValue: "Must-have pieces." },
      { key: "home-best-empty", label: "Empty-state hint", defaultValue: "Add products in Admin and they'll appear here automatically.", multiline: true },
    ],
  },
  {
    title: "Homepage — music & journal",
    slots: [
      { key: "home-music-eyebrow", label: "Music eyebrow", defaultValue: "Frass Hill Sound" },
      { key: "home-music-title", label: "Music title", defaultValue: "The music behind the brand." },
      { key: "home-music-paragraph", label: "Music paragraph", defaultValue: "Frass Hill isn't just a wardrobe — it's a sound. Original tracks, mixes and films from the camp soundtrack every drop.", multiline: true },
      { key: "home-music-cta", label: "Music CTA", defaultValue: "Enter Music & Media" },
      { key: "home-journal-eyebrow", label: "Journal eyebrow", defaultValue: "Journal" },
      { key: "home-journal-title", label: "Journal title", defaultValue: "From the blog." },
    ],
  },
  {
    title: "Homepage — service banner",
    slots: [
      { key: "home-service-eyebrow", label: "Eyebrow", defaultValue: "Signature Service" },
      { key: "home-service-title", label: "Title", defaultValue: "Complimentary shipping. Effortless returns." },
      { key: "home-service-paragraph", label: "Paragraph", defaultValue: "Every order is treated like a private client appointment.", multiline: true },
    ],
  },
  {
    title: "Navigation & footer",
    slots: [
      { key: "nav-frass-kicks", label: "Nav — Frass Kicks", defaultValue: "Frass Kicks" },
      { key: "nav-frass-drip", label: "Nav — Frass Drip", defaultValue: "Frass Drip" },
      { key: "nav-bare-drip", label: "Nav — Bare Drip", defaultValue: "Bare Drip" },
      { key: "nav-lookbook", label: "Nav — Lookbook", defaultValue: "Lookbook" },
      { key: "nav-music-media", label: "Nav — Music & Media", defaultValue: "Music & Media" },
      { key: "nav-blog", label: "Nav — Journal", defaultValue: "Journal" },
      { key: "footer-blurb", label: "Footer blurb", defaultValue: "A luxury fashion destination — footwear, apparel, swim & intimates. Made for movement. Built for confidence.", multiline: true },
      { key: "footer-newsletter-cta", label: "Footer subscribe button", defaultValue: "Subscribe" },
      { key: "footer-tagline", label: "Footer bottom tagline", defaultValue: "Luxury · Confidence · Style" },
    ],
  },
];

export const ALL_TEXT_SLOTS: TextSlot[] = TEXT_SECTIONS.flatMap((s) => s.slots);

export const TEXT_SLOT_BY_KEY: Record<string, TextSlot> = Object.fromEntries(
  ALL_TEXT_SLOTS.map((s) => [s.key, s]),
);
