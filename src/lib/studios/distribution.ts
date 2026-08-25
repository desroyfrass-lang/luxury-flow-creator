// FRASS-0602 — Frass Distribution Network: the shared vocabulary.
//
// Build 3 adds distribution to Frassy Studios. This file is browser-safe: it
// holds only words, labels and pure helpers. Every platform-specific decision
// is expressed as a *capability*, never as `if (platform === "tiktok")`
// scattered through the interface.

export const DISTRIBUTION_PLATFORMS = [
  { value: "youtube", label: "YouTube", icon: "▶️", external: true, plain: "Long-form home for full episodes." },
  { value: "tiktok", label: "TikTok", icon: "🎵", external: true, plain: "Short vertical clips." },
  { value: "instagram", label: "Instagram", icon: "📸", external: true, plain: "Reels, images and carousels." },
  { value: "facebook", label: "Facebook", icon: "📘", external: true, plain: "Page video and Reels." },
  { value: "frass_hill", label: "Frass Hill / Frassy Street", icon: "🏔️", external: false, plain: "Our own feeds. No outside permission needed." },
] as const;

export type DistributionPlatform = (typeof DISTRIBUTION_PLATFORMS)[number]["value"];

export function platformMeta(platform: string) {
  return (
    DISTRIBUTION_PLATFORMS.find((p) => p.value === platform) ?? {
      value: platform,
      label: platform,
      icon: "🛰️",
      external: true,
      plain: "A future Frass destination.",
    }
  );
}

/** Everything an adapter may declare. UI reacts to these, never to platform names. */
export const CAPABILITIES = [
  { value: "upload_video", label: "Upload video" },
  { value: "direct_publish", label: "Publish directly" },
  { value: "draft_upload", label: "Send for final review" },
  { value: "publish_reel", label: "Publish Reel" },
  { value: "publish_image", label: "Publish image" },
  { value: "publish_carousel", label: "Publish carousel" },
  { value: "schedule", label: "Schedule" },
  { value: "thumbnail", label: "Custom thumbnail" },
  { value: "captions", label: "Captions" },
  { value: "analytics", label: "Analytics" },
  { value: "revenue_data", label: "Revenue data" },
] as const;

export type Capability = (typeof CAPABILITIES)[number]["value"];

export const CONNECTION_STATUSES = [
  { value: "setup_required", label: "Setup Required", tint: "muted" },
  { value: "connected", label: "Connected", tint: "good" },
  { value: "needs_reauthorization", label: "Needs Reauthorization", tint: "warn" },
  { value: "connection_error", label: "Connection Error", tint: "bad" },
  { value: "disconnected", label: "Not Connected", tint: "muted" },
] as const;

/** A job's whole life, in order. */
export const JOB_STATUSES = [
  { value: "waiting_approval", label: "Waiting Approval", tint: "muted" },
  { value: "scheduled", label: "Scheduled", tint: "info" },
  { value: "preparing", label: "Preparing", tint: "info" },
  { value: "uploading", label: "Uploading", tint: "warn" },
  { value: "processing", label: "Processing", tint: "warn" },
  { value: "published", label: "Published", tint: "good" },
  { value: "failed", label: "Failed", tint: "bad" },
  { value: "cancelled", label: "Cancelled", tint: "muted" },
  { value: "needs_attention", label: "Needs Attention", tint: "bad" },
] as const;

/** What the platform says about money — never what we wish it said. */
export const PLATFORM_MONETIZATION_STATUSES = [
  { value: "unknown", label: "Unknown" },
  { value: "not_eligible", label: "Channel Not Eligible" },
  { value: "eligible", label: "Eligible" },
  { value: "monetization_enabled", label: "Enabled" },
  { value: "limited", label: "Limited" },
  { value: "under_review", label: "Under Review" },
  { value: "monetization_disabled", label: "Disabled" },
  { value: "data_unavailable", label: "Data Unavailable" },
] as const;

/** Honesty rule: nothing unavailable is ever shown as $0. */
export const REVENUE_AVAILABILITY = [
  { value: "reported", label: "Actual / Reported" },
  { value: "estimated", label: "Estimated" },
  { value: "unavailable", label: "Data Unavailable" },
] as const;

export const PUBLISH_MODES = [
  { value: "publish_now", label: "Publish Now" },
  { value: "schedule", label: "Schedule" },
  { value: "draft_review", label: "Send for final review" },
] as const;

/** The pre-publish safety gate, in the order the Founder reads it. */
export const GATE_CHECKS = [
  { id: "approval", label: "Founder approval" },
  { id: "rights", label: "Rights status" },
  { id: "media", label: "Required media exists" },
  { id: "account", label: "Platform account connected" },
  { id: "auth", label: "Authentication valid" },
  { id: "package", label: "Platform package prepared" },
  { id: "metadata", label: "Required metadata present" },
  { id: "capability", label: "Platform capability available" },
] as const;

export type GateResult = { id: string; label: string; passed: boolean; detail?: string; critical: boolean };

export function labelOf(list: ReadonlyArray<{ value: string; label: string }>, value: string | null | undefined) {
  if (!value) return "—";
  return list.find((l) => l.value === value)?.label ?? value;
}

/** Frass content identity — platform IDs are only distribution references. */
export function frassContentId(kind: "MASTER" | "DERIVATIVE", id: string) {
  return `FRASS-${kind}-${id.replace(/-/g, "").slice(0, 8).toUpperCase()}`;
}

/** Money, honestly. Unavailable never becomes zero. */
export function moneyOrUnavailable(amount: number | null | undefined, availability: string, currency = "USD") {
  if (availability === "unavailable" || amount === null || amount === undefined) return "Data Unavailable";
  const formatted = `$${Number(amount).toLocaleString(undefined, { maximumFractionDigits: 2 })} ${currency}`;
  return availability === "estimated" ? `${formatted} (estimated)` : formatted;
}
