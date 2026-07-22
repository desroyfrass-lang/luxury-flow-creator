// Spec 041 — Phase 1 server functions for the merchandise system.
// Review + approval infrastructure only. No product publishing yet.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// ---------- Types (mirrored from the SQL enums) ----------
export const SLOGAN_STATUSES = ["draft", "under_review", "approved", "rejected", "retired"] as const;
export type SloganStatus = (typeof SLOGAN_STATUSES)[number];

export const SLOGAN_SOURCES = ["ai_generated", "founder", "site_import", "partner_submitted"] as const;
export type SloganSource = (typeof SLOGAN_SOURCES)[number];

export const LOGO_PLACEMENTS = [
  "chest_left", "chest_center", "back_center", "sleeve", "hem", "pocket",
  "all_over", "embroidery_chest", "embroidery_sleeve", "other",
] as const;
export type LogoPlacement = (typeof LOGO_PLACEMENTS)[number];

export const PROPOSAL_STATUSES = [
  "proposed", "under_review", "approved", "adjusted", "skipped", "rejected", "published", "retired",
] as const;
export type ProposalStatus = (typeof PROPOSAL_STATUSES)[number];

export const QUALITY_TIERS = ["signature", "premium", "standard", "experimental"] as const;
export type QualityTier = (typeof QUALITY_TIERS)[number];

// ---------- Role helpers (server-side) ----------
type AppRole = "admin" | "staff" | "designer" | "moderator" | "partner" | "affiliate" | "ambassador" | "super_admin";
async function assertRole(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  userId: string,
  roles: AppRole[],
): Promise<void> {
  for (const role of roles) {
    const { data } = await supabase.rpc("has_role", { _user_id: userId, _role: role });
    if (data) return;
  }
  throw new Error("Forbidden — required role missing");
}

async function emitAudit(
  eventType: string,
  actorId: string,
  entityType: string,
  entityId: string,
  payload: Record<string, unknown>,
): Promise<void> {
  try {
    const { emitPlatformEvent } = await import("@/lib/platform-events.server");
    await emitPlatformEvent({ eventType, actorId, entityType, entityId, payload });
  } catch (err) {
    console.error("[merch] audit emit failed", err);
  }
}

// ============================================================
// SLOGANS
// ============================================================
export const listSlogans = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { status?: SloganStatus | "all"; source?: SloganSource | "all"; search?: string }) =>
    z.object({
      status: z.enum(["all", ...SLOGAN_STATUSES]).default("all"),
      source: z.enum(["all", ...SLOGAN_SOURCES]).default("all"),
      search: z.string().max(200).optional(),
    }).parse(d ?? {}),
  )
  .handler(async ({ context, data }) => {
    await assertRole(context.supabase, context.userId, ["admin", "staff", "designer"]);
    let q = context.supabase.from("slogans").select("*").order("created_at", { ascending: false }).limit(500);
    if (data.status !== "all") q = q.eq("status", data.status);
    if (data.source !== "all") q = q.eq("source", data.source);
    if (data.search && data.search.trim()) q = q.ilike("text", `%${data.search.trim()}%`);
    const { data: rows, error } = await q;
    if (error) throw error;
    return rows ?? [];
  });

export const createSlogan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { text: string; source?: SloganSource; tags?: string[]; notes?: string; originNote?: string }) =>
    z.object({
      text: z.string().min(1).max(240),
      source: z.enum(SLOGAN_SOURCES).default("founder"),
      tags: z.array(z.string().max(40)).max(10).default([]),
      notes: z.string().max(600).optional(),
      originNote: z.string().max(240).optional(),
    }).parse(d),
  )
  .handler(async ({ context, data }) => {
    await assertRole(context.supabase, context.userId, ["admin", "staff", "designer"]);
    // Spec: nothing auto-approves — everything lands in review.
    const { data: row, error } = await context.supabase
      .from("slogans")
      .insert({
        text: data.text.trim(),
        source: data.source,
        status: "under_review",
        tags: data.tags,
        brand_voice_notes: data.notes ?? null,
        origin_note: data.originNote ?? null,
        submitted_by: context.userId,
      })
      .select()
      .single();
    if (error) throw error;
    await emitAudit("merch.slogan.submitted", context.userId, "slogan", row.id, { source: data.source });
    return row;
  });

export const setSloganStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; status: SloganStatus; note?: string }) =>
    z.object({
      id: z.string().uuid(),
      status: z.enum(SLOGAN_STATUSES),
      note: z.string().max(600).optional(),
    }).parse(d),
  )
  .handler(async ({ context, data }) => {
    await assertRole(context.supabase, context.userId, ["admin", "staff"]);
    const { data: row, error } = await context.supabase
      .from("slogans")
      .update({
        status: data.status,
        reviewed_by: context.userId,
        reviewed_at: new Date().toISOString(),
        ...(data.note ? { brand_voice_notes: data.note } : {}),
      })
      .eq("id", data.id)
      .select()
      .single();
    if (error) throw error;
    await emitAudit("merch.slogan.status_changed", context.userId, "slogan", data.id, { status: data.status });
    return row;
  });

// ============================================================
// LOGO TREATMENTS
// ============================================================
export const listLogoTreatments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertRole(context.supabase, context.userId, ["admin", "staff", "designer"]);
    const { data, error } = await context.supabase
      .from("logo_treatments")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  });

export const createLogoTreatment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: {
    name: string; placement: LogoPlacement; assetUrl: string;
    assetVariant?: string; colorTreatment?: string; sizeMm?: number;
    printMethod?: string; notes?: string;
  }) =>
    z.object({
      name: z.string().min(1).max(120),
      placement: z.enum(LOGO_PLACEMENTS),
      assetUrl: z.string().url().max(600),
      assetVariant: z.string().max(80).optional(),
      colorTreatment: z.string().max(80).optional(),
      sizeMm: z.number().positive().optional(),
      printMethod: z.string().max(80).optional(),
      notes: z.string().max(600).optional(),
    }).parse(d),
  )
  .handler(async ({ context, data }) => {
    await assertRole(context.supabase, context.userId, ["admin", "staff", "designer"]);
    const { data: row, error } = await context.supabase
      .from("logo_treatments")
      .insert({
        name: data.name,
        placement: data.placement,
        asset_url: data.assetUrl,
        asset_variant: data.assetVariant ?? null,
        color_treatment: data.colorTreatment ?? null,
        size_mm: data.sizeMm ?? null,
        print_method: data.printMethod ?? null,
        notes: data.notes ?? null,
        status: "under_review",
        submitted_by: context.userId,
      })
      .select()
      .single();
    if (error) throw error;
    await emitAudit("merch.logo_treatment.submitted", context.userId, "logo_treatment", row.id, {
      placement: data.placement,
    });
    return row;
  });

export const setLogoTreatmentStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; status: SloganStatus; note?: string }) =>
    z.object({
      id: z.string().uuid(),
      status: z.enum(SLOGAN_STATUSES),
      note: z.string().max(600).optional(),
    }).parse(d),
  )
  .handler(async ({ context, data }) => {
    await assertRole(context.supabase, context.userId, ["admin", "staff"]);
    const { data: row, error } = await context.supabase
      .from("logo_treatments")
      .update({
        status: data.status,
        reviewed_by: context.userId,
        reviewed_at: new Date().toISOString(),
        ...(data.note ? { notes: data.note } : {}),
      })
      .eq("id", data.id)
      .select()
      .single();
    if (error) throw error;
    await emitAudit("merch.logo_treatment.status_changed", context.userId, "logo_treatment", data.id, {
      status: data.status,
    });
    return row;
  });

// ============================================================
// POD PROVIDERS (registry — provider agnostic)
// ============================================================
export const listProviders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertRole(context.supabase, context.userId, ["admin", "staff", "designer"]);
    const { data, error } = await context.supabase
      .from("pod_providers")
      .select("*")
      .order("is_default", { ascending: false })
      .order("name", { ascending: true });
    if (error) throw error;
    return data ?? [];
  });

// ============================================================
// MERCH PROPOSALS (daily queue)
// ============================================================
export const listProposals = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { status?: ProposalStatus | "queue" | "all" }) =>
    z.object({
      status: z.enum(["all", "queue", ...PROPOSAL_STATUSES]).default("queue"),
    }).parse(d ?? {}),
  )
  .handler(async ({ context, data }) => {
    await assertRole(context.supabase, context.userId, ["admin", "staff", "designer"]);
    let q = context.supabase
      .from("merch_proposals")
      .select("*, slogan:slogan_id(text, status), provider:provider_id(name, slug), logo_treatment:logo_treatment_id(name, placement)")
      .order("created_at", { ascending: false })
      .limit(200);
    if (data.status === "queue") q = q.in("status", ["proposed", "under_review", "adjusted"]);
    else if (data.status !== "all") q = q.eq("status", data.status);
    const { data: rows, error } = await q;
    if (error) throw error;
    return rows ?? [];
  });

export const createProposal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: {
    title: string; concept?: string; sloganId?: string; logoTreatmentId?: string;
    blankId?: string; providerId?: string; qualityTier?: QualityTier;
    targetCollection?: string; season?: string; artworkNotes?: string;
    proposedPrice?: number; mockupUrls?: string[];
  }) =>
    z.object({
      title: z.string().min(1).max(160),
      concept: z.string().max(2000).optional(),
      sloganId: z.string().uuid().optional(),
      logoTreatmentId: z.string().uuid().optional(),
      blankId: z.string().uuid().optional(),
      providerId: z.string().uuid().optional(),
      qualityTier: z.enum(QUALITY_TIERS).default("standard"),
      targetCollection: z.string().max(120).optional(),
      season: z.string().max(60).optional(),
      artworkNotes: z.string().max(1000).optional(),
      proposedPrice: z.number().nonnegative().optional(),
      mockupUrls: z.array(z.string().url()).max(8).default([]),
    }).parse(d),
  )
  .handler(async ({ context, data }) => {
    await assertRole(context.supabase, context.userId, ["admin", "staff", "designer"]);
    const { data: row, error } = await context.supabase
      .from("merch_proposals")
      .insert({
        title: data.title,
        concept: data.concept ?? null,
        slogan_id: data.sloganId ?? null,
        logo_treatment_id: data.logoTreatmentId ?? null,
        blank_id: data.blankId ?? null,
        provider_id: data.providerId ?? null,
        quality_tier: data.qualityTier,
        target_collection: data.targetCollection ?? null,
        season: data.season ?? null,
        artwork_notes: data.artworkNotes ?? null,
        proposed_price: data.proposedPrice ?? null,
        mockup_urls: data.mockupUrls,
        status: "proposed",
        proposed_by: context.userId,
      })
      .select()
      .single();
    if (error) throw error;
    await emitAudit("merch.proposal.created", context.userId, "merch_proposal", row.id, {
      quality_tier: data.qualityTier,
    });
    return row;
  });

// Decision: Approve / Adjust / Skip / Reject on a proposal.
export const reviewProposal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: {
    id: string;
    decision: "approve" | "adjust" | "skip" | "reject";
    reviewerNotes?: string;
    adjustments?: Record<string, unknown>;
  }) =>
    z.object({
      id: z.string().uuid(),
      decision: z.enum(["approve", "adjust", "skip", "reject"]),
      reviewerNotes: z.string().max(1000).optional(),
      adjustments: z.record(z.string(), z.unknown()).optional(),
    }).parse(d),
  )
  .handler(async ({ context, data }) => {
    await assertRole(context.supabase, context.userId, ["admin", "staff"]);
    const statusMap: Record<string, ProposalStatus> = {
      approve: "approved",
      adjust: "adjusted",
      skip: "skipped",
      reject: "rejected",
    };
    const patch: Record<string, unknown> = {
      status: statusMap[data.decision],
      reviewer_notes: data.reviewerNotes ?? null,
      reviewed_by: context.userId,
      reviewed_at: new Date().toISOString(),
    };
    if (data.adjustments) patch.adjustments = data.adjustments;
    const { data: row, error } = await context.supabase
      .from("merch_proposals")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .update(patch as any)
      .eq("id", data.id)
      .select()
      .single();
    if (error) throw error;
    await emitAudit(`merch.proposal.${data.decision}`, context.userId, "merch_proposal", data.id, {
      reviewer_notes: data.reviewerNotes ?? null,
    });
    return row;
  });

// ============================================================
// AUDIT TRAIL (read)
// ============================================================
export const listMerchAudit = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { limit?: number }) =>
    z.object({ limit: z.number().int().min(1).max(200).default(50) }).parse(d ?? {}),
  )
  .handler(async ({ context, data }) => {
    await assertRole(context.supabase, context.userId, ["admin", "staff"]);
    const { data: rows, error } = await context.supabase
      .from("platform_events")
      .select("id, event_type, actor_id, entity_type, entity_id, payload, created_at")
      .like("event_type", "merch.%")
      .order("created_at", { ascending: false })
      .limit(data.limit);
    if (error) throw error;
    return rows ?? [];
  });
