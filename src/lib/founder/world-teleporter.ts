// FRASS-0570 — World Teleporter registry (read-only architectural survey).
//
// Generated from the real route tree and a source-wide link scan. Inspection
// only: nothing here changes the application. Regenerate when routes change.

export type WorldStatus = "live" | "built" | "legacy" | "unknown";

export type WorldRoute = {
  path: string;
  title: string;
  component: string;
  file: string;
  district: string;
  status: WorldStatus;
  /** How many other source files link to this route. -1 = dynamic route. */
  refs: number;
  redirect: boolean;
};

export const WORLD_ROUTES: WorldRoute[] = [
  {
    "path": "/",
    "title": "",
    "component": "",
    "file": "_authenticated/route.tsx",
    "district": "Arrival & Welcome",
    "status": "legacy",
    "refs": 62,
    "redirect": true
  },
  {
    "path": "/",
    "title": "Welcome to Frass — Shop Frass or Enter Frass Hill",
    "component": "EntrancePage",
    "file": "index.tsx",
    "district": "Arrival & Welcome",
    "status": "live",
    "refs": 61,
    "redirect": false
  },
  {
    "path": "/.well-known/oauth-protected-resource",
    "title": "",
    "component": "",
    "file": "[.well-known]/oauth-protected-resource.ts",
    "district": "Frass District",
    "status": "live",
    "refs": 3,
    "redirect": false
  },
  {
    "path": "/academy",
    "title": "Academy District — Frass Operating System",
    "component": "AcademyPage",
    "file": "_authenticated/academy.tsx",
    "district": "Frass Hill",
    "status": "live",
    "refs": 16,
    "redirect": false
  },
  {
    "path": "/admin",
    "title": "",
    "component": "",
    "file": "_authenticated/admin.index.tsx",
    "district": "Founder Hall",
    "status": "legacy",
    "refs": 11,
    "redirect": true
  },
  {
    "path": "/admin",
    "title": "",
    "component": "AdminLayout",
    "file": "_authenticated/admin.tsx",
    "district": "Founder Hall",
    "status": "live",
    "refs": 11,
    "redirect": false
  },
  {
    "path": "/admin/activities",
    "title": "",
    "component": "AdminActivities",
    "file": "_authenticated/admin.activities.tsx",
    "district": "Founder Hall",
    "status": "live",
    "refs": 1,
    "redirect": false
  },
  {
    "path": "/admin/affiliate-policy",
    "title": "Affiliate Governance — Frass Founder Controls",
    "component": "AffiliatePolicyPage",
    "file": "_authenticated/admin.affiliate-policy.tsx",
    "district": "Founder Hall",
    "status": "live",
    "refs": 3,
    "redirect": false
  },
  {
    "path": "/admin/ai-credits",
    "title": "AI Credit Center — Frass Founder Controls",
    "component": "CreditCenter",
    "file": "_authenticated/admin.ai-credits.tsx",
    "district": "Founder Hall",
    "status": "live",
    "refs": 4,
    "redirect": false
  },
  {
    "path": "/admin/approvals",
    "title": "Approval Queue — Frass Hill Admin",
    "component": "ApprovalsPage",
    "file": "_authenticated/admin.approvals.tsx",
    "district": "Founder Hall",
    "status": "live",
    "refs": 6,
    "redirect": false
  },
  {
    "path": "/admin/audit",
    "title": "Founder Platform Audit | Frass",
    "component": "AuditPage",
    "file": "_authenticated/admin.audit.tsx",
    "district": "Founder Hall",
    "status": "live",
    "refs": 2,
    "redirect": false
  },
  {
    "path": "/admin/blog",
    "title": "New post",
    "component": "AdminBlogPage",
    "file": "_authenticated/admin.blog.tsx",
    "district": "Founder Hall",
    "status": "live",
    "refs": 3,
    "redirect": false
  },
  {
    "path": "/admin/capsules",
    "title": "",
    "component": "AdminCapsulesPage",
    "file": "_authenticated/admin.capsules.tsx",
    "district": "Founder Hall",
    "status": "live",
    "refs": 3,
    "redirect": false
  },
  {
    "path": "/admin/cj-import",
    "title": "",
    "component": "CjImportPage",
    "file": "_authenticated/admin.cj-import.tsx",
    "district": "Founder Hall",
    "status": "live",
    "refs": 3,
    "redirect": false
  },
  {
    "path": "/admin/feedback",
    "title": "",
    "component": "FeedbackAdminPage",
    "file": "_authenticated/admin.feedback.tsx",
    "district": "Founder Hall",
    "status": "live",
    "refs": 4,
    "redirect": false
  },
  {
    "path": "/admin/financial-audit",
    "title": "",
    "component": "FinancialAuditPage",
    "file": "_authenticated/admin.financial-audit.tsx",
    "district": "Founder Hall",
    "status": "live",
    "refs": 3,
    "redirect": false
  },
  {
    "path": "/admin/images",
    "title": "",
    "component": "AdminImagesPage",
    "file": "_authenticated/admin.images.tsx",
    "district": "Founder Hall",
    "status": "live",
    "refs": 6,
    "redirect": false
  },
  {
    "path": "/admin/launch-feedback",
    "title": "",
    "component": "LaunchFeedbackCenter",
    "file": "_authenticated/admin.launch-feedback.tsx",
    "district": "Founder Hall",
    "status": "live",
    "refs": 5,
    "redirect": false
  },
  {
    "path": "/admin/launch-partners",
    "title": "Partner Launch Progress — Frass Founder Desk",
    "component": "PartnerOversightPage",
    "file": "_authenticated/admin.launch-partners.tsx",
    "district": "Founder Hall",
    "status": "built",
    "refs": 0,
    "redirect": false
  },
  {
    "path": "/admin/link-check",
    "title": "",
    "component": "LinkCheckPage",
    "file": "_authenticated/admin.link-check.tsx",
    "district": "Founder Hall",
    "status": "live",
    "refs": 3,
    "redirect": false
  },
  {
    "path": "/admin/media",
    "title": "",
    "component": "AdminMediaPage",
    "file": "_authenticated/admin.media.tsx",
    "district": "Founder Hall",
    "status": "live",
    "refs": 1,
    "redirect": false
  },
  {
    "path": "/admin/newsroom",
    "title": "",
    "component": "NewsroomPage",
    "file": "_authenticated/admin.newsroom.tsx",
    "district": "Founder Hall",
    "status": "live",
    "refs": 1,
    "redirect": false
  },
  {
    "path": "/admin/partner-vendors",
    "title": "",
    "component": "PartnerVendorsAdmin",
    "file": "_authenticated/admin.partner-vendors.tsx",
    "district": "Founder Hall",
    "status": "live",
    "refs": 6,
    "redirect": false
  },
  {
    "path": "/admin/partners",
    "title": "Partner Invitations | Frass OS",
    "component": "AdminPartners",
    "file": "_authenticated/admin.partners.tsx",
    "district": "Founder Hall",
    "status": "live",
    "refs": 1,
    "redirect": false
  },
  {
    "path": "/admin/roles",
    "title": "",
    "component": "RolesPage",
    "file": "_authenticated/admin.roles.tsx",
    "district": "Founder Hall",
    "status": "live",
    "refs": 5,
    "redirect": false
  },
  {
    "path": "/admin/text",
    "title": "",
    "component": "AdminTextPage",
    "file": "_authenticated/admin.text.tsx",
    "district": "Founder Hall",
    "status": "live",
    "refs": 4,
    "redirect": false
  },
  {
    "path": "/admin/virals",
    "title": "",
    "component": "AdminViralsPage",
    "file": "_authenticated/admin.virals.tsx",
    "district": "Founder Hall",
    "status": "live",
    "refs": 3,
    "redirect": false
  },
  {
    "path": "/admin/visual-index",
    "title": "",
    "component": "VisualIndexPage",
    "file": "_authenticated/admin.visual-index.tsx",
    "district": "Founder Hall",
    "status": "live",
    "refs": 1,
    "redirect": false
  },
  {
    "path": "/admin/voice",
    "title": "Frassy Voice Studio — Frass Founder Controls",
    "component": "VoiceStudioPage",
    "file": "_authenticated/admin.voice.tsx",
    "district": "Founder Hall",
    "status": "live",
    "refs": 2,
    "redirect": false
  },
  {
    "path": "/afro-designers",
    "title": "Afro Designers — Where Culture Meets Luxury | Frass Kicks",
    "component": "AfroLanding",
    "file": "afro-designers.index.tsx",
    "district": "Frass District",
    "status": "live",
    "refs": 13,
    "redirect": false
  },
  {
    "path": "/afro-designers",
    "title": "",
    "component": "AfroLayout",
    "file": "afro-designers.tsx",
    "district": "Frass District",
    "status": "live",
    "refs": 12,
    "redirect": false
  },
  {
    "path": "/afro-designers/collections/$slug",
    "title": "Collection not found — Afro Designers",
    "component": "RegionPage",
    "file": "afro-designers.collections.$slug.tsx",
    "district": "Frass District",
    "status": "live",
    "refs": -1,
    "redirect": false
  },
  {
    "path": "/afro-designers/designers",
    "title": "All Designers — Afro Designers | Frass Kicks",
    "component": "DesignersIndex",
    "file": "afro-designers.designers.tsx",
    "district": "Frass District",
    "status": "live",
    "refs": 4,
    "redirect": false
  },
  {
    "path": "/afro-designers/designers/$slug",
    "title": "Designer not found — Afro Designers",
    "component": "DesignerProfile",
    "file": "afro-designers.designers.$slug.tsx",
    "district": "Frass District",
    "status": "live",
    "refs": -1,
    "redirect": false
  },
  {
    "path": "/afro-designers/join",
    "title": "Become a Designer — Afro Designers | Frass Kicks",
    "component": "JoinPage",
    "file": "afro-designers.join.tsx",
    "district": "Frass District",
    "status": "live",
    "refs": 1,
    "redirect": false
  },
  {
    "path": "/arrival",
    "title": "The Arrival — Journey Into Frass Hill",
    "component": "ArrivalPage",
    "file": "arrival.tsx",
    "district": "Arrival & Welcome",
    "status": "live",
    "refs": 3,
    "redirect": false
  },
  {
    "path": "/auth",
    "title": "Sign in — Frass",
    "component": "AuthPage",
    "file": "auth.tsx",
    "district": "Arrival & Welcome",
    "status": "live",
    "refs": 19,
    "redirect": false
  },
  {
    "path": "/bare-drip",
    "title": "",
    "component": "",
    "file": "bare-drip.index.tsx",
    "district": "Frass District",
    "status": "legacy",
    "refs": 10,
    "redirect": true
  },
  {
    "path": "/bare-drip",
    "title": "",
    "component": "",
    "file": "bare-drip.tsx",
    "district": "Frass District",
    "status": "live",
    "refs": 9,
    "redirect": false
  },
  {
    "path": "/bare-drip/men",
    "title": "The Underwear Room",
    "component": "",
    "file": "bare-drip.men.index.tsx",
    "district": "Frass District",
    "status": "live",
    "refs": 4,
    "redirect": false
  },
  {
    "path": "/bare-drip/men",
    "title": "",
    "component": "",
    "file": "bare-drip.men.tsx",
    "district": "Frass District",
    "status": "live",
    "refs": 3,
    "redirect": false
  },
  {
    "path": "/bare-drip/men/$category",
    "title": "${cat?.title ?? ",
    "component": "CategoryPage",
    "file": "bare-drip.men.$category.tsx",
    "district": "Frass District",
    "status": "live",
    "refs": -1,
    "redirect": false
  },
  {
    "path": "/bare-drip/women",
    "title": "The Lingerie Room",
    "component": "",
    "file": "bare-drip.women.index.tsx",
    "district": "Frass District",
    "status": "live",
    "refs": 4,
    "redirect": false
  },
  {
    "path": "/bare-drip/women",
    "title": "",
    "component": "",
    "file": "bare-drip.women.tsx",
    "district": "Frass District",
    "status": "live",
    "refs": 3,
    "redirect": false
  },
  {
    "path": "/bare-drip/women/$category",
    "title": "${cat?.title ?? ",
    "component": "CategoryPage",
    "file": "bare-drip.women.$category.tsx",
    "district": "Frass District",
    "status": "live",
    "refs": -1,
    "redirect": false
  },
  {
    "path": "/blog",
    "title": "Journal — Frass",
    "component": "BlogIndex",
    "file": "blog.index.tsx",
    "district": "Town Square",
    "status": "live",
    "refs": 6,
    "redirect": false
  },
  {
    "path": "/blog",
    "title": "",
    "component": "",
    "file": "blog.tsx",
    "district": "Town Square",
    "status": "live",
    "refs": 5,
    "redirect": false
  },
  {
    "path": "/blog/$slug",
    "title": "",
    "component": "BlogPostPage",
    "file": "blog.$slug.tsx",
    "district": "Town Square",
    "status": "live",
    "refs": -1,
    "redirect": false
  },
  {
    "path": "/blueprints",
    "title": "Member Success Blueprints — Frass",
    "component": "BlueprintsPage",
    "file": "_authenticated/blueprints.tsx",
    "district": "Frass District",
    "status": "live",
    "refs": 2,
    "redirect": false
  },
  {
    "path": "/brand-partnerships",
    "title": "Frass Brand Partnerships Network — Paid Creator Campaigns",
    "component": "BrandPartnershipsPage",
    "file": "brand-partnerships.index.tsx",
    "district": "Frass District",
    "status": "live",
    "refs": 13,
    "redirect": false
  },
  {
    "path": "/brand-partnerships",
    "title": "",
    "component": "",
    "file": "brand-partnerships.tsx",
    "district": "Frass District",
    "status": "live",
    "refs": 12,
    "redirect": false
  },
  {
    "path": "/brand-partnerships/brands/$brand",
    "title": "Brand unavailable — Frass",
    "component": "BrandPage",
    "file": "brand-partnerships.brands.$brand.tsx",
    "district": "Frass District",
    "status": "live",
    "refs": -1,
    "redirect": false
  },
  {
    "path": "/brand-partnerships/campaigns/$campaign",
    "title": "Campaign unavailable — Frass",
    "component": "CampaignPage",
    "file": "brand-partnerships.campaigns.$campaign.tsx",
    "district": "Frass District",
    "status": "live",
    "refs": -1,
    "redirect": false
  },
  {
    "path": "/brand-partnerships/creators/$creator",
    "title": "Creator unavailable — Frass",
    "component": "CreatorPage",
    "file": "brand-partnerships.creators.$creator.tsx",
    "district": "Frass District",
    "status": "live",
    "refs": -1,
    "redirect": false
  },
  {
    "path": "/bridal",
    "title": "Frass Bridal — The Wedding District of Frass Hill",
    "component": "BridalDistrict",
    "file": "bridal.index.tsx",
    "district": "Bridal",
    "status": "live",
    "refs": 12,
    "redirect": false
  },
  {
    "path": "/bridal",
    "title": "",
    "component": "",
    "file": "bridal.tsx",
    "district": "Bridal",
    "status": "live",
    "refs": 11,
    "redirect": false
  },
  {
    "path": "/bridal-boutique",
    "title": "Frass Bridal Boutique — Frass District",
    "component": "BridalBoutique",
    "file": "bridal-boutique.tsx",
    "district": "Bridal",
    "status": "live",
    "refs": 2,
    "redirect": false
  },
  {
    "path": "/bridal/collections",
    "title": "Dress Collaboration — Frass Bridal",
    "component": "CollectionsPage",
    "file": "bridal.collections.tsx",
    "district": "Bridal",
    "status": "live",
    "refs": 4,
    "redirect": false
  },
  {
    "path": "/bridal/journey",
    "title": "The Wedding Journey — Frass Bridal",
    "component": "JourneyPage",
    "file": "bridal.journey.tsx",
    "district": "Bridal",
    "status": "live",
    "refs": 5,
    "redirect": false
  },
  {
    "path": "/bridal/marketplace",
    "title": "Wedding Marketplace — Frass Bridal",
    "component": "MarketplacePage",
    "file": "bridal.marketplace.tsx",
    "district": "Bridal",
    "status": "live",
    "refs": 4,
    "redirect": false
  },
  {
    "path": "/bridal/sourcing",
    "title": "The Sourcing Desk — Frass Bridal",
    "component": "SourcingPage",
    "file": "bridal.sourcing.tsx",
    "district": "Bridal",
    "status": "live",
    "refs": 6,
    "redirect": false
  },
  {
    "path": "/bridal/vault",
    "title": "The Wedding Vault — Frass Bridal",
    "component": "VaultPage",
    "file": "bridal.vault.tsx",
    "district": "Bridal",
    "status": "live",
    "refs": 5,
    "redirect": false
  },
  {
    "path": "/bridal/walk",
    "title": "The Garden Walk & The Promise Arch — Frass Bridal",
    "component": "GardenWalk",
    "file": "bridal.walk.tsx",
    "district": "Bridal",
    "status": "live",
    "refs": 2,
    "redirect": false
  },
  {
    "path": "/builder-hall",
    "title": "Welcome Hall — Frass Operating System",
    "component": "WelcomeHallPage",
    "file": "_authenticated/builder-hall.tsx",
    "district": "Frass District",
    "status": "legacy",
    "refs": 11,
    "redirect": false
  },
  {
    "path": "/builder/$handle",
    "title": "",
    "component": "",
    "file": "builder.$handle.tsx",
    "district": "Frass District",
    "status": "legacy",
    "refs": -1,
    "redirect": true
  },
  {
    "path": "/business-builder",
    "title": "Frass Business Builder — Build a business, not just a website",
    "component": "BusinessBuilderPage",
    "file": "_authenticated/business-builder.tsx",
    "district": "Frass Hill",
    "status": "live",
    "refs": 15,
    "redirect": false
  },
  {
    "path": "/business-vaults",
    "title": "Future Business Vaults — Frass Business Builder",
    "component": "FutureVaultsPage",
    "file": "_authenticated/business-vaults.tsx",
    "district": "Frass Hill",
    "status": "live",
    "refs": 12,
    "redirect": false
  },
  {
    "path": "/capsules",
    "title": "Lookbooks & Capsules — Frass",
    "component": "CapsulesLanding",
    "file": "capsules.index.tsx",
    "district": "Frass District",
    "status": "live",
    "refs": 12,
    "redirect": false
  },
  {
    "path": "/capsules",
    "title": "",
    "component": "",
    "file": "capsules.tsx",
    "district": "Frass District",
    "status": "live",
    "refs": 11,
    "redirect": false
  },
  {
    "path": "/capsules/$handle",
    "title": "${params.handle.replace(/-/g, ",
    "component": "CapsuleDetailPage",
    "file": "capsules.$handle.tsx",
    "district": "Frass District",
    "status": "live",
    "refs": -1,
    "redirect": false
  },
  {
    "path": "/card/$handle",
    "title": "",
    "component": "PublicCard",
    "file": "card.$handle.tsx",
    "district": "Frass District",
    "status": "live",
    "refs": -1,
    "redirect": false
  },
  {
    "path": "/checkout",
    "title": "Checkout — Frass Kicks",
    "component": "CheckoutPage",
    "file": "checkout.tsx",
    "district": "Frass District",
    "status": "live",
    "refs": 6,
    "redirect": false
  },
  {
    "path": "/collection",
    "title": "Coco Vintage Collection Builder — One Piece at a Time",
    "component": "CollectionBuilderPage",
    "file": "_authenticated/collection.tsx",
    "district": "Frass District",
    "status": "live",
    "refs": 5,
    "redirect": false
  },
  {
    "path": "/collection/$handle",
    "title": "${title} — Frass Kicks",
    "component": "CollectionPage",
    "file": "collection.$handle.tsx",
    "district": "Frass District",
    "status": "live",
    "refs": -1,
    "redirect": false
  },
  {
    "path": "/command",
    "title": "",
    "component": "",
    "file": "_authenticated/command.tsx",
    "district": "Founder Hall",
    "status": "legacy",
    "refs": 2,
    "redirect": true
  },
  {
    "path": "/commerce-simulation",
    "title": "Zero-Friction Commerce Simulation — Frass",
    "component": "CommerceSimulationPage",
    "file": "_authenticated/commerce-simulation.tsx",
    "district": "Frass District",
    "status": "live",
    "refs": 1,
    "redirect": false
  },
  {
    "path": "/control-room",
    "title": "Founder Control Room | Frass",
    "component": "ControlRoom",
    "file": "_authenticated/control-room.tsx",
    "district": "Founder Hall",
    "status": "live",
    "refs": 26,
    "redirect": false
  },
  {
    "path": "/creation",
    "title": "Creation District — Frass Operating System",
    "component": "CreationPage",
    "file": "_authenticated/creation.tsx",
    "district": "Frass Hill",
    "status": "live",
    "refs": 11,
    "redirect": false
  },
  {
    "path": "/daily",
    "title": "",
    "component": "",
    "file": "daily.tsx",
    "district": "Frass District",
    "status": "legacy",
    "refs": 3,
    "redirect": true
  },
  {
    "path": "/financial-center",
    "title": "Frass Financial Center — Wallet, Gifts, Credits & Earnings",
    "component": "FinancialCenter",
    "file": "_authenticated/financial-center.tsx",
    "district": "Frass District",
    "status": "live",
    "refs": 23,
    "redirect": false
  },
  {
    "path": "/first-30-days",
    "title": "First 30 Days — Frass Partner Launch Program",
    "component": "First30DaysPage",
    "file": "_authenticated/first-30-days.tsx",
    "district": "Frass Hill",
    "status": "live",
    "refs": 7,
    "redirect": false
  },
  {
    "path": "/for-me",
    "title": "For Me — Your Corner of Frass Hill",
    "component": "ForMePage",
    "file": "for-me.tsx",
    "district": "Town Square",
    "status": "live",
    "refs": 12,
    "redirect": false
  },
  {
    "path": "/for-us",
    "title": "For Us — A Living Caribbean Destination",
    "component": "ForUsPage",
    "file": "for-us.tsx",
    "district": "Town Square",
    "status": "live",
    "refs": 17,
    "redirect": false
  },
  {
    "path": "/founder",
    "title": "",
    "component": "",
    "file": "_authenticated/founder.tsx",
    "district": "Founder Hall",
    "status": "legacy",
    "refs": 4,
    "redirect": true
  },
  {
    "path": "/frass-district",
    "title": "Frass District — Shop Every Frass Store",
    "component": "FrassDistrictHome",
    "file": "frass-district.tsx",
    "district": "Frass District",
    "status": "live",
    "refs": 17,
    "redirect": false
  },
  {
    "path": "/frass-drip",
    "title": "",
    "component": "",
    "file": "frass-drip.index.tsx",
    "district": "Frass District",
    "status": "legacy",
    "refs": 12,
    "redirect": true
  },
  {
    "path": "/frass-drip",
    "title": "",
    "component": "",
    "file": "frass-drip.tsx",
    "district": "Frass District",
    "status": "live",
    "refs": 11,
    "redirect": false
  },
  {
    "path": "/frass-drip/men",
    "title": "Men",
    "component": "",
    "file": "frass-drip.men.index.tsx",
    "district": "Frass District",
    "status": "live",
    "refs": 4,
    "redirect": false
  },
  {
    "path": "/frass-drip/men",
    "title": "",
    "component": "",
    "file": "frass-drip.men.tsx",
    "district": "Frass District",
    "status": "live",
    "refs": 3,
    "redirect": false
  },
  {
    "path": "/frass-drip/men/$category",
    "title": "${cat?.title ?? ",
    "component": "CategoryPage",
    "file": "frass-drip.men.$category.tsx",
    "district": "Frass District",
    "status": "live",
    "refs": -1,
    "redirect": false
  },
  {
    "path": "/frass-drip/women",
    "title": "Women",
    "component": "",
    "file": "frass-drip.women.index.tsx",
    "district": "Frass District",
    "status": "live",
    "refs": 4,
    "redirect": false
  },
  {
    "path": "/frass-drip/women",
    "title": "",
    "component": "",
    "file": "frass-drip.women.tsx",
    "district": "Frass District",
    "status": "live",
    "refs": 3,
    "redirect": false
  },
  {
    "path": "/frass-drip/women/$category",
    "title": "${cat?.title ?? ",
    "component": "CategoryPage",
    "file": "frass-drip.women.$category.tsx",
    "district": "Frass District",
    "status": "live",
    "refs": -1,
    "redirect": false
  },
  {
    "path": "/frass-hill",
    "title": "Frass Hill — The Town Plan",
    "component": "FrassHillPage",
    "file": "frass-hill.tsx",
    "district": "Frass Hill",
    "status": "live",
    "refs": 19,
    "redirect": false
  },
  {
    "path": "/frass-hill-journey",
    "title": "The Frass Hill Walk — Enter Frass Hill",
    "component": "HillWalkPage",
    "file": "frass-hill-journey.tsx",
    "district": "Frass Hill",
    "status": "live",
    "refs": 4,
    "redirect": false
  },
  {
    "path": "/frass-hosting",
    "title": "Frass Hosting — Your whole business, live in one click",
    "component": "FrassHostingPage",
    "file": "frass-hosting.tsx",
    "district": "Frass District",
    "status": "live",
    "refs": 3,
    "redirect": false
  },
  {
    "path": "/frass-kicks",
    "title": "",
    "component": "",
    "file": "frass-kicks.index.tsx",
    "district": "Frass District",
    "status": "legacy",
    "refs": 13,
    "redirect": true
  },
  {
    "path": "/frass-kicks",
    "title": "",
    "component": "",
    "file": "frass-kicks.tsx",
    "district": "Frass District",
    "status": "live",
    "refs": 12,
    "redirect": false
  },
  {
    "path": "/frass-kicks/men",
    "title": "Frass Kicks Showroom for Men",
    "component": "MensKicksRoom",
    "file": "frass-kicks.men.tsx",
    "district": "Frass District",
    "status": "live",
    "refs": 2,
    "redirect": false
  },
  {
    "path": "/frass-kicks/women",
    "title": "Frass Kicks Show Room for Women",
    "component": "WomensKicksRoom",
    "file": "frass-kicks.women.tsx",
    "district": "Frass District",
    "status": "live",
    "refs": 2,
    "redirect": false
  },
  {
    "path": "/frass-kids",
    "title": "",
    "component": "KidsHome",
    "file": "frass-kids.index.tsx",
    "district": "Kids Valley",
    "status": "live",
    "refs": 18,
    "redirect": false
  },
  {
    "path": "/frass-kids",
    "title": "",
    "component": "KidsLayout",
    "file": "frass-kids.tsx",
    "district": "Kids Valley",
    "status": "live",
    "refs": 17,
    "redirect": false
  },
  {
    "path": "/frass-kids/$segment",
    "title": "",
    "component": "SegmentFloor",
    "file": "frass-kids.$segment.index.tsx",
    "district": "Kids Valley",
    "status": "live",
    "refs": -1,
    "redirect": false
  },
  {
    "path": "/frass-kids/$segment/$collection",
    "title": "",
    "component": "KidsShowroom",
    "file": "frass-kids.$segment.$collection.tsx",
    "district": "Kids Valley",
    "status": "live",
    "refs": -1,
    "redirect": false
  },
  {
    "path": "/frass-kids/$segment/kicks",
    "title": "",
    "component": "KidsKicksRoom",
    "file": "frass-kids.$segment.kicks.tsx",
    "district": "Kids Valley",
    "status": "live",
    "refs": -1,
    "redirect": false
  },
  {
    "path": "/frass-kids/boys",
    "title": "",
    "component": "",
    "file": "frass-kids.boys.tsx",
    "district": "Kids Valley",
    "status": "legacy",
    "refs": 0,
    "redirect": true
  },
  {
    "path": "/frass-kids/girls",
    "title": "",
    "component": "",
    "file": "frass-kids.girls.tsx",
    "district": "Kids Valley",
    "status": "legacy",
    "refs": 0,
    "redirect": true
  },
  {
    "path": "/frass-luxury-house",
    "title": "Frass Luxury House — Timeless Elegance, Exceptional Craft",
    "component": "LuxuryHouse",
    "file": "frass-luxury-house.index.tsx",
    "district": "Luxury House",
    "status": "live",
    "refs": 14,
    "redirect": false
  },
  {
    "path": "/frass-luxury-house",
    "title": "",
    "component": "",
    "file": "frass-luxury-house.tsx",
    "district": "Luxury House",
    "status": "live",
    "refs": 13,
    "redirect": false
  },
  {
    "path": "/frass-luxury-house/men",
    "title": "The East Wing — Gentlemen",
    "component": "EastWing",
    "file": "frass-luxury-house.men.tsx",
    "district": "Luxury House",
    "status": "live",
    "refs": 3,
    "redirect": false
  },
  {
    "path": "/frass-luxury-house/women",
    "title": "The West Wing — Ladies",
    "component": "WestWing",
    "file": "frass-luxury-house.women.tsx",
    "district": "Luxury House",
    "status": "live",
    "refs": 3,
    "redirect": false
  },
  {
    "path": "/frass-plus",
    "title": "",
    "component": "PlusHome",
    "file": "frass-plus.index.tsx",
    "district": "Frass District",
    "status": "live",
    "refs": 11,
    "redirect": false
  },
  {
    "path": "/frass-plus",
    "title": "",
    "component": "",
    "file": "frass-plus.tsx",
    "district": "Frass District",
    "status": "live",
    "refs": 10,
    "redirect": false
  },
  {
    "path": "/frass-plus/$gender",
    "title": "",
    "component": "WingPage",
    "file": "frass-plus.$gender.index.tsx",
    "district": "Frass District",
    "status": "live",
    "refs": -1,
    "redirect": false
  },
  {
    "path": "/frass-plus/$gender/$category",
    "title": "Frass Plus",
    "component": "DepartmentPage",
    "file": "frass-plus.$gender.$category.tsx",
    "district": "Frass District",
    "status": "live",
    "refs": -1,
    "redirect": false
  },
  {
    "path": "/frass-plus/$gender/bare",
    "title": "The Underwear Room",
    "component": "BarePlusFloor",
    "file": "frass-plus.$gender.bare.tsx",
    "district": "Frass District",
    "status": "live",
    "refs": -1,
    "redirect": false
  },
  {
    "path": "/frass-plus/$gender/kicks",
    "title": "",
    "component": "PlusKicksRoom",
    "file": "frass-plus.$gender.kicks.tsx",
    "district": "Frass District",
    "status": "live",
    "refs": -1,
    "redirect": false
  },
  {
    "path": "/frass-plus/sales",
    "title": "",
    "component": "PlusLiquidationRoom",
    "file": "frass-plus.sales.tsx",
    "district": "Frass District",
    "status": "live",
    "refs": 1,
    "redirect": false
  },
  {
    "path": "/frass-radio",
    "title": "Frass Radio — The Audio Home of Frass",
    "component": "FrassRadioPage",
    "file": "frass-radio.tsx",
    "district": "Frass District",
    "status": "live",
    "refs": 12,
    "redirect": false
  },
  {
    "path": "/frass-shape",
    "title": "Frass Shape — Women",
    "component": "ShapeStorefront",
    "file": "frass-shape.index.tsx",
    "district": "Frass District",
    "status": "live",
    "refs": 7,
    "redirect": false
  },
  {
    "path": "/frass-shape",
    "title": "",
    "component": "",
    "file": "frass-shape.tsx",
    "district": "Frass District",
    "status": "live",
    "refs": 6,
    "redirect": false
  },
  {
    "path": "/frass-shape/$gender",
    "title": "Frass Shape for ${label} — Shape, Compression & Support",
    "component": "ShapeWing",
    "file": "frass-shape.$gender.index.tsx",
    "district": "Frass District",
    "status": "live",
    "refs": -1,
    "redirect": false
  },
  {
    "path": "/frass-shape/$gender",
    "title": "",
    "component": "",
    "file": "frass-shape.$gender.tsx",
    "district": "Frass District",
    "status": "live",
    "refs": -1,
    "redirect": false
  },
  {
    "path": "/frass-shape/$gender/$category",
    "title": "${cat?.title ?? ",
    "component": "ShapeShowroom",
    "file": "frass-shape.$gender.$category.tsx",
    "district": "Frass District",
    "status": "live",
    "refs": -1,
    "redirect": false
  },
  {
    "path": "/frass-shape/$gender/goals/$goal",
    "title": "${goal?.title ?? ",
    "component": "GoalPage",
    "file": "frass-shape.$gender.goals.$goal.tsx",
    "district": "Frass District",
    "status": "live",
    "refs": -1,
    "redirect": false
  },
  {
    "path": "/frass-world",
    "title": "",
    "component": "",
    "file": "frass-world.tsx",
    "district": "Frass District",
    "status": "legacy",
    "refs": 2,
    "redirect": true
  },
  {
    "path": "/frassy",
    "title": "",
    "component": "FrassyOS",
    "file": "_authenticated/frassy.tsx",
    "district": "Frass Hill",
    "status": "live",
    "refs": 13,
    "redirect": false
  },
  {
    "path": "/fresh-start",
    "title": "Fresh start — arrive at Frass as a stranger",
    "component": "FreshStart",
    "file": "fresh-start.tsx",
    "district": "Frass District",
    "status": "built",
    "refs": 0,
    "redirect": false
  },
  {
    "path": "/fv-studios",
    "title": "Frass Vision Studios — The Creator Company",
    "component": "FvStudiosPage",
    "file": "fv-studios.tsx",
    "district": "Frass District",
    "status": "live",
    "refs": 10,
    "redirect": false
  },
  {
    "path": "/gallery/studio",
    "title": "Gallery Studio — Frass Gallery",
    "component": "StudioPage",
    "file": "gallery.studio.tsx",
    "district": "Frass District",
    "status": "live",
    "refs": 3,
    "redirect": false
  },
  {
    "path": "/gateway",
    "title": "",
    "component": "",
    "file": "gateway.tsx",
    "district": "Frass District",
    "status": "legacy",
    "refs": 4,
    "redirect": true
  },
  {
    "path": "/global-operations",
    "title": "Global Operations — Frass Regional Commerce",
    "component": "GlobalOperations",
    "file": "_authenticated/global-operations.tsx",
    "district": "Frass District",
    "status": "live",
    "refs": 3,
    "redirect": false
  },
  {
    "path": "/health-wellness",
    "title": "Frass Health & Wellness Centre — The Mountain Sanctuary",
    "component": "WellnessCentre",
    "file": "health-wellness.tsx",
    "district": "Frass District",
    "status": "live",
    "refs": 6,
    "redirect": false
  },
  {
    "path": "/join",
    "title": "Choose your entrance — Frass",
    "component": "JoinChooser",
    "file": "join.index.tsx",
    "district": "Frass District",
    "status": "live",
    "refs": 2,
    "redirect": false
  },
  {
    "path": "/join/frass-hill",
    "title": "Arrive at Frass Hill — register and meet Frassy",
    "component": "JoinHill",
    "file": "join.frass-hill.tsx",
    "district": "Frass District",
    "status": "live",
    "refs": 3,
    "redirect": false
  },
  {
    "path": "/join/frasskicks",
    "title": "Join Frass Kicks — shop with your fits saved",
    "component": "JoinKicks",
    "file": "join.frasskicks.tsx",
    "district": "Frass District",
    "status": "live",
    "refs": 3,
    "redirect": false
  },
  {
    "path": "/journal",
    "title": "Partner Journal — Frass",
    "component": "JournalPage",
    "file": "_authenticated/journal.tsx",
    "district": "Frass District",
    "status": "live",
    "refs": 6,
    "redirect": false
  },
  {
    "path": "/kicks-district",
    "title": "",
    "component": "",
    "file": "kicks-district.tsx",
    "district": "Frass District",
    "status": "legacy",
    "refs": 2,
    "redirect": true
  },
  {
    "path": "/kids-valley",
    "title": "Kids Valley — The Children",
    "component": "KidsValleyPage",
    "file": "kids-valley.tsx",
    "district": "Kids Valley",
    "status": "live",
    "refs": 7,
    "redirect": false
  },
  {
    "path": "/kids-world",
    "title": "",
    "component": "KidsWorldHome",
    "file": "kids-world.index.tsx",
    "district": "Kids Valley",
    "status": "live",
    "refs": 17,
    "redirect": false
  },
  {
    "path": "/kids-world",
    "title": "",
    "component": "KidsWorldLayout",
    "file": "kids-world.tsx",
    "district": "Kids Valley",
    "status": "live",
    "refs": 16,
    "redirect": false
  },
  {
    "path": "/kids-world/$age",
    "title": "",
    "component": "AgeWorld",
    "file": "kids-world.$age.index.tsx",
    "district": "Kids Valley",
    "status": "live",
    "refs": -1,
    "redirect": false
  },
  {
    "path": "/kids-world/$age/$place",
    "title": "",
    "component": "PlacePage",
    "file": "kids-world.$age.$place.tsx",
    "district": "Kids Valley",
    "status": "live",
    "refs": -1,
    "redirect": false
  },
  {
    "path": "/kids-world/activity/$slug",
    "title": "",
    "component": "ActivityPage",
    "file": "kids-world.activity.$slug.tsx",
    "district": "Kids Valley",
    "status": "live",
    "refs": -1,
    "redirect": false
  },
  {
    "path": "/kids-world/discover",
    "title": "",
    "component": "DiscoverPage",
    "file": "kids-world.discover.tsx",
    "district": "Kids Valley",
    "status": "live",
    "refs": 3,
    "redirect": false
  },
  {
    "path": "/kids-world/parents",
    "title": "",
    "component": "ParentDashboard",
    "file": "kids-world.parents.tsx",
    "district": "Kids Valley",
    "status": "live",
    "refs": 9,
    "redirect": false
  },
  {
    "path": "/kids-world/street",
    "title": "",
    "component": "FrassStreet",
    "file": "kids-world.street.tsx",
    "district": "Kids Valley",
    "status": "live",
    "refs": 2,
    "redirect": false
  },
  {
    "path": "/launch-accelerator",
    "title": "Launch Accelerator — Frass Business Builder",
    "component": "LaunchAcceleratorPage",
    "file": "_authenticated/launch-accelerator.tsx",
    "district": "Frass Hill",
    "status": "live",
    "refs": 9,
    "redirect": false
  },
  {
    "path": "/legal",
    "title": "Agreements, Privacy & Security — Frass",
    "component": "LegalIndex",
    "file": "legal.index.tsx",
    "district": "Frass District",
    "status": "live",
    "refs": 1,
    "redirect": false
  },
  {
    "path": "/legal/$level",
    "title": "Agreement not found — Frass",
    "component": "AgreementPage",
    "file": "legal.$level.tsx",
    "district": "Frass District",
    "status": "live",
    "refs": -1,
    "redirect": false
  },
  {
    "path": "/link/$handle",
    "title": "",
    "component": "FrassLinkArrival",
    "file": "link.$handle.tsx",
    "district": "Frass District",
    "status": "live",
    "refs": -1,
    "redirect": false
  },
  {
    "path": "/live",
    "title": "Live in Frass — For Us Live & Frass Radio Live",
    "component": "LiveDirectory",
    "file": "live.index.tsx",
    "district": "Town Square",
    "status": "live",
    "refs": 12,
    "redirect": false
  },
  {
    "path": "/live",
    "title": "",
    "component": "",
    "file": "live.tsx",
    "district": "Town Square",
    "status": "live",
    "refs": 11,
    "redirect": false
  },
  {
    "path": "/live/$broadcastId",
    "title": "Live Broadcast — Frass",
    "component": "BroadcastRoom",
    "file": "live.$broadcastId.tsx",
    "district": "Town Square",
    "status": "live",
    "refs": -1,
    "redirect": false
  },
  {
    "path": "/live/go",
    "title": "Go Live — Share Your Story With Frass",
    "component": "GoLivePage",
    "file": "live.go.tsx",
    "district": "Town Square",
    "status": "live",
    "refs": 5,
    "redirect": false
  },
  {
    "path": "/lookbook",
    "title": "Lookbook — Frass",
    "component": "LookbookIndex",
    "file": "lookbook.index.tsx",
    "district": "Frass District",
    "status": "live",
    "refs": 8,
    "redirect": false
  },
  {
    "path": "/lookbook",
    "title": "",
    "component": "",
    "file": "lookbook.tsx",
    "district": "Frass District",
    "status": "live",
    "refs": 7,
    "redirect": false
  },
  {
    "path": "/lookbook/$story",
    "title": "Lookbook — Frass",
    "component": "StoryPage",
    "file": "lookbook.$story.tsx",
    "district": "Frass District",
    "status": "live",
    "refs": -1,
    "redirect": false
  },
  {
    "path": "/manufacturing",
    "title": "Creator Manufacturing Network — Frass",
    "component": "ManufacturingPage",
    "file": "_authenticated/manufacturing.tsx",
    "district": "Frass District",
    "status": "live",
    "refs": 7,
    "redirect": false
  },
  {
    "path": "/mcp",
    "title": "",
    "component": "",
    "file": "mcp.ts",
    "district": "Frass District",
    "status": "live",
    "refs": 4,
    "redirect": false
  },
  {
    "path": "/money-moves",
    "title": "Money Moves — Your Personal Income Operating System",
    "component": "MoneyMovesPage",
    "file": "_authenticated/money-moves.tsx",
    "district": "Frass Hill",
    "status": "live",
    "refs": 20,
    "redirect": false
  },
  {
    "path": "/music-media",
    "title": "Music & Media — Frass Hill",
    "component": "MusicMedia",
    "file": "music-media.tsx",
    "district": "Frass District",
    "status": "live",
    "refs": 12,
    "redirect": false
  },
  {
    "path": "/notifications",
    "title": "Notifications — Frass Hill",
    "component": "NotificationsPage",
    "file": "_authenticated/notifications.tsx",
    "district": "Frass District",
    "status": "live",
    "refs": 3,
    "redirect": false
  },
  {
    "path": "/onboarding",
    "title": "Founder Commissioning | Frass OS",
    "component": "OnboardingPage",
    "file": "_authenticated/onboarding.tsx",
    "district": "Arrival & Welcome",
    "status": "live",
    "refs": 14,
    "redirect": false
  },
  {
    "path": "/opportunity",
    "title": "Opportunity Center — Frass Operating System",
    "component": "OpportunityPage",
    "file": "_authenticated/opportunity.tsx",
    "district": "Frass Hill",
    "status": "live",
    "refs": 11,
    "redirect": false
  },
  {
    "path": "/pay/$token",
    "title": "Secure Frass Checkout — Approve your payment request",
    "component": "PaymentRequestScreen",
    "file": "pay.$token.tsx",
    "district": "Frass District",
    "status": "live",
    "refs": -1,
    "redirect": false
  },
  {
    "path": "/payment-providers",
    "title": "Payment Provider Center — Frass Commerce Pipeline",
    "component": "PaymentProviderCenter",
    "file": "_authenticated/payment-providers.tsx",
    "district": "Frass District",
    "status": "live",
    "refs": 3,
    "redirect": false
  },
  {
    "path": "/plus-size/men",
    "title": "",
    "component": "",
    "file": "plus-size.men.tsx",
    "district": "Frass District",
    "status": "legacy",
    "refs": 0,
    "redirect": true
  },
  {
    "path": "/plus-size/women",
    "title": "",
    "component": "",
    "file": "plus-size.women.tsx",
    "district": "Frass District",
    "status": "legacy",
    "refs": 0,
    "redirect": true
  },
  {
    "path": "/product/$handle",
    "title": "${product?.title ?? ",
    "component": "ProductPage",
    "file": "product.$handle.tsx",
    "district": "Frass District",
    "status": "live",
    "refs": -1,
    "redirect": false
  },
  {
    "path": "/reset-password",
    "title": "Reset your password — Frass",
    "component": "ResetPasswordPage",
    "file": "reset-password.tsx",
    "district": "Frass District",
    "status": "live",
    "refs": 3,
    "redirect": false
  },
  {
    "path": "/rewards",
    "title": "Unlock 40% OFF — Frass Kicks Rewards",
    "component": "RewardsPage",
    "file": "rewards.tsx",
    "district": "Frass District",
    "status": "live",
    "refs": 6,
    "redirect": false
  },
  {
    "path": "/room",
    "title": "My Workspace — Frass Operating System",
    "component": "RoomScreen",
    "file": "_authenticated/room.tsx",
    "district": "Frass Hill",
    "status": "live",
    "refs": 31,
    "redirect": false
  },
  {
    "path": "/sales-clearance",
    "title": "The Liquidation Room — Luxury Finds, Extraordinary Prices",
    "component": "LiquidationRoomPage",
    "file": "sales-clearance.tsx",
    "district": "Frass District",
    "status": "live",
    "refs": 9,
    "redirect": false
  },
  {
    "path": "/services",
    "title": "Frass Services Marketplace — One Platform. Every Service.",
    "component": "ServicesMarketplace",
    "file": "services.tsx",
    "district": "Frass District",
    "status": "live",
    "refs": 5,
    "redirect": false
  },
  {
    "path": "/shop-frass",
    "title": "",
    "component": "",
    "file": "shop-frass.tsx",
    "district": "Frass District",
    "status": "legacy",
    "refs": 18,
    "redirect": true
  },
  {
    "path": "/signed-out",
    "title": "Signed out securely — Frass",
    "component": "SignedOutPage",
    "file": "signed-out.tsx",
    "district": "Frass District",
    "status": "live",
    "refs": 2,
    "redirect": false
  },
  {
    "path": "/social-media-virals",
    "title": "Social Media Virals — TikTok Shop | Frass",
    "component": "SocialViralsIndex",
    "file": "social-media-virals.index.tsx",
    "district": "Frass District",
    "status": "live",
    "refs": 12,
    "redirect": false
  },
  {
    "path": "/social-media-virals",
    "title": "",
    "component": "",
    "file": "social-media-virals.tsx",
    "district": "Frass District",
    "status": "live",
    "refs": 11,
    "redirect": false
  },
  {
    "path": "/social-media-virals/$category",
    "title": "${cat?.title ?? ",
    "component": "CategoryPage",
    "file": "social-media-virals.$category.tsx",
    "district": "Frass District",
    "status": "live",
    "refs": -1,
    "redirect": false
  },
  {
    "path": "/social-media-virals/$category/$sub",
    "title": "${sub?.title ?? ",
    "component": "SubPage",
    "file": "social-media-virals.$category.$sub.tsx",
    "district": "Frass District",
    "status": "live",
    "refs": -1,
    "redirect": false
  },
  {
    "path": "/social-media-virals/$category/$sub/$product",
    "title": "${product?.title ?? ",
    "component": "ProductPage",
    "file": "social-media-virals.$category.$sub.$product.tsx",
    "district": "Frass District",
    "status": "live",
    "refs": -1,
    "redirect": false
  },
  {
    "path": "/studio",
    "title": "Frass Vision Studios (FV Studios) — Frass Hill",
    "component": "StudioPage",
    "file": "_authenticated/studio.tsx",
    "district": "Frass District",
    "status": "live",
    "refs": 27,
    "redirect": false
  },
  {
    "path": "/town-square",
    "title": "Town Square — The Heart of Frass Hill",
    "component": "TownSquarePage",
    "file": "town-square.tsx",
    "district": "Town Square",
    "status": "live",
    "refs": 8,
    "redirect": false
  },
  {
    "path": "/try-on",
    "title": "Fitting Room — Frass",
    "component": "TryOnPage",
    "file": "_authenticated/try-on.tsx",
    "district": "Frass District",
    "status": "live",
    "refs": 6,
    "redirect": false
  },
  {
    "path": "/vault",
    "title": "Builder Vault — Frass Operating System",
    "component": "VaultPage",
    "file": "_authenticated/vault.tsx",
    "district": "Frass District",
    "status": "live",
    "refs": 25,
    "redirect": false
  },
  {
    "path": "/visual-review",
    "title": "Visual Excellence Review — Founder Daily",
    "component": "VisualReviewPage",
    "file": "_authenticated/visual-review.tsx",
    "district": "Frass District",
    "status": "live",
    "refs": 2,
    "redirect": false
  },
  {
    "path": "/visual-search",
    "title": "Visual Discovery · Frass Hill",
    "component": "VisualSearchPage",
    "file": "visual-search.tsx",
    "district": "Frass District",
    "status": "live",
    "refs": 1,
    "redirect": false
  },
  {
    "path": "/welcome",
    "title": "Welcome to Frass — your first arrival",
    "component": "WelcomePage",
    "file": "welcome.tsx",
    "district": "Arrival & Welcome",
    "status": "legacy",
    "refs": 6,
    "redirect": false
  },
  {
    "path": "/welcome-hall",
    "title": "Welcome Hall — Arrive at Frass Hill",
    "component": "WelcomeHallPage",
    "file": "welcome-hall.tsx",
    "district": "Arrival & Welcome",
    "status": "legacy",
    "refs": 19,
    "redirect": false
  },
  {
    "path": "/workspace",
    "title": "",
    "component": "WorkspaceRoute",
    "file": "_authenticated/workspace.tsx",
    "district": "Frass Hill",
    "status": "live",
    "refs": 14,
    "redirect": false
  },
  {
    "path": "/workspace/affiliate",
    "title": "Affiliate Intelligence — Frass Workspace",
    "component": "AffiliateIntelligencePage",
    "file": "_authenticated/workspace.affiliate.tsx",
    "district": "Frass Hill",
    "status": "live",
    "refs": 10,
    "redirect": false
  },
  {
    "path": "/workspace/card",
    "title": "Frass Card — Identity & Point of Sale",
    "component": "CardStudio",
    "file": "_authenticated/workspace.card.tsx",
    "district": "Frass Hill",
    "status": "live",
    "refs": 17,
    "redirect": false
  },
  {
    "path": "/workspace/daily-design",
    "title": "Daily Design Library — Choose how your Daily is organised",
    "component": "DesignLibrary",
    "file": "_authenticated/workspace.daily-design.tsx",
    "district": "Frass Hill",
    "status": "live",
    "refs": 1,
    "redirect": false
  },
  {
    "path": "/workspace/first-venture",
    "title": "First Business Venture — Turn What You Own Into Income",
    "component": "FirstVenturePage",
    "file": "_authenticated/workspace.first-venture.tsx",
    "district": "Frass Hill",
    "status": "live",
    "refs": 3,
    "redirect": false
  },
  {
    "path": "/workspace/insights",
    "title": "Builder Insights — Frass Hill",
    "component": "InsightsPage",
    "file": "_authenticated/workspace.insights.tsx",
    "district": "Frass Hill",
    "status": "live",
    "refs": 5,
    "redirect": false
  },
  {
    "path": "/workspace/journal",
    "title": "",
    "component": "",
    "file": "_authenticated/workspace.journal.tsx",
    "district": "Frass Hill",
    "status": "legacy",
    "refs": 0,
    "redirect": true
  },
  {
    "path": "/workspace/link",
    "title": "My Frass Link — Identity, Recruitment & Rewards",
    "component": "LinkDashboard",
    "file": "_authenticated/workspace.link.tsx",
    "district": "Frass Hill",
    "status": "live",
    "refs": 6,
    "redirect": false
  },
  {
    "path": "/workspace/merch",
    "title": "Untitled concept",
    "component": "MerchWorkspace",
    "file": "_authenticated/workspace.merch.tsx",
    "district": "Frass Hill",
    "status": "live",
    "refs": 5,
    "redirect": false
  },
  {
    "path": "/workspace/profile",
    "title": "Builder Profile — Frass OS",
    "component": "ProfilePage",
    "file": "_authenticated/workspace.profile.tsx",
    "district": "Frass Hill",
    "status": "live",
    "refs": 7,
    "redirect": false
  },
  {
    "path": "/workspace/wallet",
    "title": "Frass Wallet — Balance, Quick Sell, Invoices, Statements",
    "component": "WalletHub",
    "file": "_authenticated/workspace.wallet.tsx",
    "district": "Frass Hill",
    "status": "live",
    "refs": 12,
    "redirect": false
  }
];

export const STATUS_META: Record<WorldStatus, { icon: string; label: string; plain: string }> = {
  live: { icon: "✅", label: "Live & Linked", plain: "Reachable through normal navigation today." },
  built: { icon: "🟡", label: "Built but Unlinked", plain: "The page exists and works, but nothing links to it yet." },
  legacy: { icon: "🔴", label: "Legacy / Duplicate Candidate", plain: "Older or redirecting door onto something that already exists. Nothing is changed here." },
  unknown: { icon: "⚪", label: "Unknown", plain: "Not yet classified." },
};

export const WORLD_DISTRICTS: string[] = ["Arrival & Welcome","Frass District","Frass Hill","Founder Hall","Town Square","Bridal","Kids Valley","Luxury House"];
