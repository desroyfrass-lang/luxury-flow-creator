// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0499 — Privacy, Security & Community Agreements
// "Trust begins before the first step."
//
// ONE agreement engine. Two relationships:
//   Level 1 · FrassKicks Visitor Agreement  — visitors, shoppers, customers.
//   Level 2 · Frass Hill Builder Agreement  — Builders, Partners, creators.
//
// everyday language first, full legal text always available underneath. Versioned,
// so a material change can be re-presented for acceptance.
// ─────────────────────────────────────────────────────────────────────────────

export type AgreementLevel = "visitor" | "builder";

export type AgreementSection = {
  heading: string;
  /** The everyday-language promise, read first. */
  plain: string;
  /** The formal terms, always available underneath. */
  legal: string[];
};

export type Agreement = {
  level: AgreementLevel;
  version: string;
  title: string;
  who: string;
  /** Frassy's spoken introduction in the Welcome Hall. */
  spoken: string;
  covers: string[];
  sections: AgreementSection[];
  href: string;
};

export const FRASS_PROMISE =
  "We built Frass to help people create opportunities, build businesses, and improve their lives. We will work to protect your privacy, respect your creations, secure your account, and explain our technology in plain language. In return, we ask that you treat others with honesty, integrity, and respect. Together, we build a community where people can safely learn, create, and prosper.";

export const AGREEMENT_RULE =
  "Every account must accept the agreements that match how they use Frass. Shoppers accept the Visitor Agreement. Anyone entering Frass Hill to build accepts the Builder Agreement as well.";

const PRIVACY: AgreementSection = {
  heading: "Privacy",
  plain:
    "We collect only what we need to run the service, we never sell your personal information, and we tell you plainly what is public and what is private.",
  legal: [
    "Frass collects account information, order information, and usage information necessary to provide and secure the service.",
    "Frass does not sell personal information to third parties.",
    "Personal information is shared with processors (payments, delivery, communications, hosting) only to the extent required to deliver a service you requested.",
    "Members may request access to, correction of, or deletion of their personal information, subject to records Frass must retain by law (for example financial records).",
    "Public information (display name, storefront, published work) is clearly distinguished in the product from private information (contact details, financial records, private notes).",
  ],
};

const COOKIES: AgreementSection = {
  heading: "Cookies & local storage",
  plain:
    "We store small amounts of data on your device to keep you signed in, keep your cart, and remember your preferences.",
  legal: [
    "Essential storage is used for authentication, session integrity, cart state, fraud prevention, and accessibility preferences.",
    "Non-essential analytics storage, where used, is limited to aggregate product measurement and may be declined without losing access to the service.",
  ],
};

const SECURITY: AgreementSection = {
  heading: "Security",
  plain:
    "We protect your account with secure sign-in, optional biometrics on your own device, session protection, fraud monitoring, and account recovery.",
  legal: [
    "Authentication is provided over encrypted transport with server-side session validation.",
    "Biometric authentication is optional and performed on the member's own device; Frass never receives or stores biometric data.",
    "Frass operates fraud prevention and financial verification controls, and may pause an action that appears fraudulent pending verification.",
    "Members are responsible for keeping their credentials and devices secure and for reporting suspected compromise promptly.",
  ],
};

const AI: AgreementSection = {
  heading: "AI transparency",
  plain:
    "Frassy will always tell you when she is assisting, recommending, organising, or automating. She never makes binding legal, financial, or medical decisions for you — final decisions are always yours.",
  legal: [
    "Frassy is an assistive system. Outputs may be incomplete or incorrect and must be reviewed by the member before being relied upon.",
    "Frassy does not provide legal, tax, accounting, medical, or investment advice, and does not replace a licensed professional.",
    "Automated actions taken on a member's behalf are recorded and reviewable by that member.",
  ],
};

const COMMUNITY: AgreementSection = {
  heading: "Community standards",
  plain:
    "Frass runs on respect, integrity, collaboration, honesty, inclusion, and professionalism. Harassment, fraud, impersonation, hate speech, scams, and illegal activity are not permitted.",
  legal: [
    "Prohibited conduct includes harassment, threats, hate speech, impersonation, fraud, deceptive selling, spam, scraping, circumventing security controls, and any unlawful activity.",
    "Frass may remove content, restrict features, or terminate accounts that breach these standards.",
  ],
};

const ACCEPTABLE_USE: AgreementSection = {
  heading: "Acceptable use",
  plain: "Use Frass for what it's for. Don't attack it, abuse it, or use it to harm anyone.",
  legal: [
    "Members must not interfere with the operation, integrity, or security of the platform, or access data they are not authorised to access.",
    "Automated access is permitted only through interfaces Frass publishes for that purpose.",
  ],
};

const PAYMENTS: AgreementSection = {
  heading: "Payments, returns & refunds",
  plain:
    "You always pay on your own trusted device. Sellers never see your card or banking details. Returns and refunds follow the terms shown at checkout.",
  legal: [
    "Payments are processed by regulated payment providers. Frass does not store full payment card numbers.",
    "Prices, taxes, duties, and delivery terms are shown before purchase and are calculated server-side.",
    "Returns, exchanges, and refunds follow the policy presented at the point of sale and any non-waivable consumer rights in the buyer's jurisdiction.",
  ],
};

const MARKETPLACE: AgreementSection = {
  heading: "Marketplace terms",
  plain:
    "Some items are sold by Frass and some by independent sellers on Frass. The seller is always identified before you buy.",
  legal: [
    "Where an order is fulfilled by an independent seller, that seller is the merchant of record for the item and is responsible for description accuracy, fulfilment, and applicable warranties.",
    "Frass provides the marketplace, payment routing, and dispute support, and may intervene to protect buyers or sellers from fraud.",
  ],
};

const CREATOR_RIGHTS: AgreementSection = {
  heading: "Creator rights & intellectual property",
  plain:
    "You keep ownership of the original work you create — artwork, music, video, stories, business content, teaching material — unless you explicitly choose otherwise.",
  legal: [
    "Members retain all ownership rights in original content they upload or create using Frass tools.",
    "Members grant Frass a limited, revocable licence to host, display, transmit, and back up that content solely to operate the features the member has enabled (for example publishing a storefront or gallery).",
    "Frass claims no ownership of member businesses, brands, customer relationships, or revenue.",
    "Members must hold the rights to everything they upload and must not infringe the rights of others.",
  ],
};

const FINANCIAL: AgreementSection = {
  heading: "Financial responsibility",
  plain:
    "Your business is yours. That means your pricing, your taxes, your compliance, and the accuracy of what you publish are yours too. Frassy assists — she does not replace a professional.",
  legal: [
    "Members are solely responsible for their business operations, pricing, product claims, licensing, tax registration, tax filing, and regulatory compliance in every jurisdiction where they operate.",
    "Estimates produced by Frass (including tax, tariff, and revenue estimates) are informational only and are not professional advice.",
    "Members are responsible for the accuracy of information they provide to Frass, to customers, and to authorities.",
  ],
};

const BUILDER_CONDUCT: AgreementSection = {
  heading: "Builder code of conduct",
  plain:
    "Builders represent Frass Hill. Be honest about what you sell, deliver what you promise, treat other Builders as neighbours, and never use the community to extract from people.",
  legal: [
    "Builders must describe products and services accurately, honour commitments made to customers and collaborators, and resolve disputes in good faith.",
    "Recruitment, referral, and affiliate activity must be truthful and must never promise guaranteed earnings.",
    "Builders must not use community access, member data, or collaboration tools for unsolicited marketing or extraction.",
  ],
};

const MONEY_MOVES: AgreementSection = {
  heading: "Money Moves, Business Builder & earnings",
  plain:
    "Frass helps you build income. It does not promise income. What you earn depends on your work, your market, and your decisions.",
  legal: [
    "Frass makes no representation, warranty, or guarantee of earnings, business success, or income replacement.",
    "Money Moves, Business Builder, Business Vaults, and Opportunity Sequencing are planning tools and are advisory only.",
    "Affiliate and commission participation is governed by the published affiliate policy in force at the time of the transaction.",
  ],
};

const DATA_USAGE: AgreementSection = {
  heading: "Data usage",
  plain:
    "Your discovery answers and working notes are used to personalise your own experience. They are not used to rank you, score you, or sell to you.",
  legal: [
    "Personalisation data is used to tailor the member's own experience and is not sold, licensed, or used for third-party advertising.",
    "Aggregate, de-identified statistics may be used to improve the platform.",
    "Members may erase their personalisation profile at any time from within the product.",
  ],
};

const CHANGES: AgreementSection = {
  heading: "Changes & consent",
  plain:
    "You can review what you accepted at any time. If we make a significant change, we'll tell you and ask you to accept the updated terms before continuing.",
  legal: [
    "Each accepted agreement is recorded with its version and the date of acceptance and is available to the member.",
    "Material changes are notified in-product and require renewed acceptance before continued use of the affected services.",
  ],
};

export const AGREEMENTS: Record<AgreementLevel, Agreement> = {
  visitor: {
    level: "visitor",
    version: "2026.1",
    title: "FrassKicks Visitor Agreement",
    who: "Visitors, guests, shoppers and marketplace customers.",
    spoken:
      "Before you shop, here's the short version: we collect only what we need, we never sell your information, you pay on your own device, and you'll always know who you're buying from.",
    covers: [
      "Privacy Policy",
      "Cookie Policy",
      "Marketplace Terms",
      "Payment Terms",
      "Returns and Refunds",
      "Community Standards",
      "Acceptable Use",
    ],
    sections: [PRIVACY, COOKIES, SECURITY, PAYMENTS, MARKETPLACE, COMMUNITY, ACCEPTABLE_USE, AI, CHANGES],
    href: "/legal/visitor",
  },
  builder: {
    level: "builder",
    version: "2026.1",
    title: "Frass Hill Builder Agreement",
    who: "Builders, Partners, entrepreneurs and creators entering Frass Hill.",
    spoken:
      "Welcome to Frass Hill. Before we begin building together, I'd like to explain how we protect your privacy, your work, and our community. You'll always know what information we collect, why we collect it, and how you remain in control.",
    covers: [
      "Everything in the Visitor Agreement",
      "Builder Code of Conduct",
      "Money Moves Participation",
      "Business Builder Terms",
      "Creator Rights",
      "Intellectual Property",
      "Financial Responsibilities",
      "Partner Expectations",
      "Community Collaboration Standards",
      "AI Transparency",
      "Data Usage",
      "Business Ethics",
    ],
    sections: [
      PRIVACY,
      SECURITY,
      CREATOR_RIGHTS,
      BUILDER_CONDUCT,
      MONEY_MOVES,
      FINANCIAL,
      AI,
      DATA_USAGE,
      COMMUNITY,
      ACCEPTABLE_USE,
      PAYMENTS,
      MARKETPLACE,
      COOKIES,
      CHANGES,
    ],
    href: "/legal/builder",
  },
};

export const PRIVACY_PRINCIPLES = [
  "Collect only the information needed to provide the service.",
  "Never sell personal information.",
  "Give members control over their data where practical.",
  "Explain AI usage transparently.",
  "Clearly distinguish public information from private information.",
];

export const SECURITY_PRINCIPLES = [
  "Secure authentication.",
  "Strong encryption where appropriate.",
  "Optional biometric authentication.",
  "Fraud prevention.",
  "Financial verification.",
  "Session protection.",
  "Account recovery.",
  "Continuous security improvements.",
];

export function agreementFor(level: AgreementLevel): Agreement {
  return AGREEMENTS[level];
}

/** True when the member has accepted the current version of this agreement. */
export function isCurrent(
  level: AgreementLevel,
  accepted: { level: string; version: string }[],
): boolean {
  const current = AGREEMENTS[level].version;
  return accepted.some((a) => a.level === level && a.version === current);
}
