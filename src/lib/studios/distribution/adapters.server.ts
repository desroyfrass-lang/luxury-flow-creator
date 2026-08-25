// FRASS-0602 — Platform adapters for the Frass Distribution Network.
//
// SERVER ONLY. Nothing here may reach the browser: this is where platform
// credentials would live once they exist. Every platform is an adapter behind
// one interface, so Frassy Studios itself never learns platform-specific rules.
//
// Honesty law: an adapter with no configured credentials REFUSES. It never
// pretends a publication happened, and it never invents analytics or revenue.

import type { Capability } from "@/lib/studios/distribution";

export type AdapterAccount = {
  id: string;
  platform: string;
  account_label: string | null;
  external_account_id: string | null;
  status: string;
  credentials_configured: boolean;
  scopes: string[] | null;
};

export type AdapterPackage = {
  id: string;
  title: string | null;
  description: string | null;
  caption: string | null;
  hashtags: string[] | string | null;
  video_url: string | null;
  thumbnail_url: string | null;
  captions_url: string | null;
  content_classification: string | null;
};

export type PublishMode = "publish_now" | "schedule" | "draft_review";

export type PublishResult =
  | { outcome: "published"; externalId: string; externalUrl: string | null; note?: string }
  | { outcome: "processing"; externalId: string; externalUrl: string | null; note?: string }
  | { outcome: "draft_review"; externalId: string; externalUrl: string | null; note?: string }
  | { outcome: "blocked"; reason: string };

export type SyncResult<T> = { available: boolean; rows: T[]; note: string };

export type PackagingRules = {
  aspect: string[];
  maxSeconds: number | null;
  captionLimit: number | null;
  titleLimit: number | null;
  wantsThumbnail: boolean;
  wantsCaptions: boolean;
};

export interface PlatformAdapter {
  platform: string;
  /** What this adapter can technically do today. */
  capabilities: Capability[];
  /** Capabilities that additionally need platform review/approval of the app. */
  reviewGated: Capability[];
  requiresCredentials: boolean;
  packaging: PackagingRules;
  publish(input: {
    account: AdapterAccount;
    pkg: AdapterPackage;
    mode: PublishMode;
    idempotencyKey: string;
  }): Promise<PublishResult>;
  fetchAnalytics(input: { account: AdapterAccount; externalIds: string[] }): Promise<SyncResult<Record<string, unknown>>>;
  fetchRevenue(input: { account: AdapterAccount; externalIds: string[] }): Promise<SyncResult<Record<string, unknown>>>;
  requestRemoval?(input: { account: AdapterAccount; externalId: string }): Promise<{ accepted: boolean; note: string }>;
}

const SETUP_REQUIRED = (platform: string) =>
  `${platform} is not connected yet. The developer credentials and account authorisation have to exist before Frass can publish there. Nothing was sent.`;

function externalAdapter(
  platform: string,
  capabilities: Capability[],
  reviewGated: Capability[],
  packaging: PackagingRules,
  extra?: Partial<PlatformAdapter>,
): PlatformAdapter {
  return {
    platform,
    capabilities,
    reviewGated,
    requiresCredentials: true,
    packaging,
    async publish({ account, mode }) {
      if (!account.credentials_configured || account.status !== "connected") {
        return { outcome: "blocked", reason: SETUP_REQUIRED(platform) };
      }
      if (mode === "publish_now" && reviewGated.includes("direct_publish")) {
        return {
          outcome: "blocked",
          reason: `Direct posting to ${platform} needs platform approval of the Frass application and this account. Use "send for final review" instead.`,
        };
      }
      // Credentials exist but the live transport is not wired yet — say so plainly.
      return {
        outcome: "blocked",
        reason: `${platform} credentials are recorded, but the live upload transport has not been switched on yet. Nothing was published.`,
      };
    },
    async fetchAnalytics({ account }) {
      if (!account.credentials_configured) {
        return { available: false, rows: [], note: SETUP_REQUIRED(platform) };
      }
      return { available: false, rows: [], note: `${platform} analytics sync is ready to be switched on once the API credentials are live.` };
    },
    async fetchRevenue({ account }) {
      if (!account.credentials_configured) {
        return { available: false, rows: [], note: SETUP_REQUIRED(platform) };
      }
      return { available: false, rows: [], note: `${platform} has not reported revenue to this integration.` };
    },
    async requestRemoval() {
      return { accepted: false, note: `Removal has to be requested on ${platform} directly until the API credentials are live.` };
    },
    ...extra,
  };
}

/** YouTube — resumable upload, analytics and (partner-only) revenue. */
const youtube = externalAdapter(
  "youtube",
  ["upload_video", "direct_publish", "schedule", "thumbnail", "captions", "analytics", "revenue_data"],
  ["revenue_data"],
  { aspect: ["16:9", "9:16"], maxSeconds: null, captionLimit: 5000, titleLimit: 100, wantsThumbnail: true, wantsCaptions: true },
);

/** TikTok — Content Posting API. Direct posting stays review-gated. */
const tiktok = externalAdapter(
  "tiktok",
  ["upload_video", "draft_upload", "analytics"],
  ["direct_publish", "analytics", "revenue_data"],
  { aspect: ["9:16"], maxSeconds: 600, captionLimit: 2200, titleLimit: 150, wantsThumbnail: false, wantsCaptions: true },
);

/** Instagram — professional accounts only; capability-driven, not assumed. */
const instagram = externalAdapter(
  "instagram",
  ["publish_reel", "publish_image", "publish_carousel", "analytics"],
  ["revenue_data"],
  { aspect: ["9:16", "1:1", "4:5"], maxSeconds: 900, captionLimit: 2200, titleLimit: null, wantsThumbnail: true, wantsCaptions: true },
);

/** Facebook Pages — video and Reels. */
const facebook = externalAdapter(
  "facebook",
  ["upload_video", "publish_reel", "schedule", "analytics"],
  ["revenue_data"],
  { aspect: ["16:9", "9:16", "1:1"], maxSeconds: null, captionLimit: 5000, titleLimit: 255, wantsThumbnail: true, wantsCaptions: true },
);

/** Frass Hill / Frassy Street — our own house. No outside permission needed. */
const frassHill: PlatformAdapter = {
  platform: "frass_hill",
  capabilities: ["upload_video", "direct_publish", "publish_image", "schedule", "analytics"],
  reviewGated: [],
  requiresCredentials: false,
  packaging: { aspect: ["16:9", "9:16", "1:1"], maxSeconds: null, captionLimit: 4000, titleLimit: 140, wantsThumbnail: true, wantsCaptions: true },
  async publish({ account, pkg, idempotencyKey }) {
    if (!pkg.video_url && !pkg.thumbnail_url) {
      return { outcome: "blocked", reason: "This Frass feed package has no media attached yet." };
    }
    const feed = account.external_account_id ?? "frass:feed:frass-hill";
    return {
      outcome: "published",
      externalId: `${feed}:${idempotencyKey.slice(0, 12)}`,
      externalUrl: null,
      note: "Published to our own Frass feed. The Master stays the record of ownership.",
    };
  },
  async fetchAnalytics() {
    return { available: false, rows: [], note: "Frass feed view counts are recorded as the feed reports them." };
  },
  async fetchRevenue() {
    return { available: false, rows: [], note: "Frass Hill money lives in the Financial Center, not here." };
  },
  async requestRemoval() {
    return { accepted: true, note: "Removed from the Frass feed. The Master production is untouched." };
  },
};

const REGISTRY: Record<string, PlatformAdapter> = { youtube, tiktok, instagram, facebook, frass_hill: frassHill };

export function getAdapter(platform: string): PlatformAdapter | null {
  return REGISTRY[platform] ?? null;
}

export function listAdapters(): PlatformAdapter[] {
  return Object.values(REGISTRY);
}

/** Does this account actually support this capability right now? */
export function adapterSupports(platform: string, capability: Capability): boolean {
  return getAdapter(platform)?.capabilities.includes(capability) ?? false;
}
