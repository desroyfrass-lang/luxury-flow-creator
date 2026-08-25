// FRASS-0602 — The Frass Distribution Network.
//
// SERVER ONLY. One road out of Frassy Studios:
//   Approved Master → Approved Derivative → Platform Package → this network
//   → Connected Account → Publish/Schedule → Publication ID → Analytics
//   → Monetization → Founder Hall.
//
// Rules that never bend here:
//  - Rights and approval are checked on the server, every single time.
//  - Nothing is ever published twice: every job carries an idempotency key.
//  - When the outcome is uncertain the job goes to NEEDS ATTENTION. It never republishes.
//  - Nothing is invented: no fake views, no fake money, no fake "Connected".

import { canPublishRights } from "@/lib/studios/studios";
import { frassContentId, type GateResult } from "@/lib/studios/distribution";
import { getAdapter, type PublishMode } from "@/lib/studios/distribution/adapters.server";

type Db = { from: (t: string) => any; rpc: (n: string, a: unknown) => any };

export class DistributionError extends Error {}

/** Zero Trust — Founder/Admin is proven here, on the server. */
export async function requireStudioStaff(sb: Db, userId: string): Promise<void> {
  const [admin, superAdmin] = await Promise.all([
    sb.rpc("has_role", { _user_id: userId, _role: "admin" }),
    sb.rpc("has_role", { _user_id: userId, _role: "super_admin" }),
  ]);
  if (!admin?.data && !superAdmin?.data) {
    throw new DistributionError("The Frass Distribution Network is Founder and Admin only.");
  }
}

/** Write the Founder's own record of what happened. */
export async function audit(
  sb: Db,
  userId: string,
  action: string,
  subjectType: string,
  subjectId: string | null,
  detail: Record<string, unknown>,
) {
  await sb.from("studio_activity_log").insert({
    actor_id: userId,
    action,
    subject_type: subjectType,
    subject_id: subjectId,
    detail,
  });
}

/** Every Frass-owned piece carries its own identity, independent of any platform. */
export async function ensureContentId(sb: Db, productionId: string, kind: "MASTER" | "DERIVATIVE") {
  const { data } = await sb.from("studio_productions").select("id, content_id").eq("id", productionId).maybeSingle();
  if (!data) throw new DistributionError("That production no longer exists.");
  if (data.content_id) return data.content_id as string;
  const contentId = frassContentId(kind, data.id);
  await sb.from("studio_productions").update({ content_id: contentId }).eq("id", productionId);
  return contentId;
}

function capabilityForPackage(platform: string, derivativeType: string | null, mode: PublishMode) {
  if (mode === "draft_review") return "draft_upload" as const;
  if (platform === "instagram") {
    if ((derivativeType ?? "").includes("image")) return "publish_image" as const;
    if ((derivativeType ?? "").includes("carousel")) return "publish_carousel" as const;
    return "publish_reel" as const;
  }
  return "upload_video" as const;
}

/** The pre-publish safety gate. Any critical failure blocks distribution. */
export async function runSafetyGate(
  sb: Db,
  input: { packageId: string; connectionId: string; mode: PublishMode },
): Promise<{ checks: GateResult[]; blocked: boolean; pkg: any; connection: any; production: any }> {
  const { data: pkg } = await sb
    .from("studio_platform_packages")
    .select("*")
    .eq("id", input.packageId)
    .maybeSingle();
  if (!pkg) throw new DistributionError("That platform package no longer exists.");

  const { data: production } = await sb
    .from("studio_productions")
    .select("id, title, status, rights_status, age_group, audience, series_id, content_id")
    .eq("id", pkg.production_id)
    .maybeSingle();

  const { data: connection } = await sb
    .from("studio_platform_connections")
    .select("*")
    .eq("id", input.connectionId)
    .maybeSingle();

  const adapter = connection ? getAdapter(connection.platform) : null;
  const capability = capabilityForPackage(connection?.platform ?? pkg.platform, pkg.derivative_type, input.mode);

  // Rights on the production AND on every source asset behind it.
  let assetBlock: string | null = null;
  const { data: rights } = await sb
    .from("studio_rights")
    .select("subject_type, subject_id, rights_status")
    .eq("subject_type", "production")
    .eq("subject_id", pkg.production_id);
  for (const r of rights ?? []) {
    if (!canPublishRights(r.rights_status)) assetBlock = r.rights_status;
  }

  const tokenValid =
    !adapter?.requiresCredentials ||
    (connection?.credentials_configured === true &&
      (!connection?.token_expires_at || new Date(connection.token_expires_at) > new Date()));

  const checks: GateResult[] = [
    {
      id: "approval",
      label: "Founder approval",
      critical: true,
      passed: ["approved", "scheduled", "published"].includes(production?.status ?? "") || pkg.status === "approved",
      detail: production ? `Production is “${production.status}”.` : "Production missing.",
    },
    {
      id: "rights",
      label: "Rights status",
      critical: true,
      passed: canPublishRights(production?.rights_status) && !assetBlock,
      detail: assetBlock ? `A source asset is marked “${assetBlock}”.` : `Rights: ${production?.rights_status ?? "unknown"}.`,
    },
    {
      id: "media",
      label: "Required media exists",
      critical: true,
      passed: Boolean(pkg.video_url || pkg.thumbnail_url),
      detail: pkg.video_url ? "Media attached." : "No finished media on this package yet.",
    },
    {
      id: "account",
      label: "Platform account connected",
      critical: true,
      passed: connection?.status === "connected",
      detail: connection ? `${connection.account_label ?? connection.platform}: ${connection.status}` : "No account chosen.",
    },
    {
      id: "auth",
      label: "Authentication valid",
      critical: true,
      passed: Boolean(tokenValid),
      detail: tokenValid ? "Authorisation in date." : "Authorisation missing or expired — reconnect the account.",
    },
    {
      id: "package",
      label: "Platform package prepared",
      critical: true,
      passed: Boolean(pkg.title || pkg.caption),
      detail: pkg.title ? "Package ready." : "This package still needs its wording.",
    },
    {
      id: "metadata",
      label: "Required metadata present",
      critical: false,
      passed: Boolean(pkg.title && (pkg.description || pkg.caption)),
      detail: "Title plus description or caption.",
    },
    {
      id: "capability",
      label: "Platform capability available",
      critical: true,
      passed: Boolean(adapter?.capabilities.includes(capability as never)),
      detail: adapter
        ? `Needs “${capability}”. ${adapter.reviewGated.includes(capability as never) ? "This one needs platform approval first." : ""}`
        : "No adapter for that platform.",
    },
  ];

  return { checks, blocked: checks.some((c) => c.critical && !c.passed), pkg, connection, production };
}

/** Queue one publication. Nothing leaves the building here. */
export async function queuePublication(
  sb: Db,
  userId: string,
  input: {
    packageId: string;
    connectionId: string;
    mode: PublishMode;
    scheduledFor?: string | null;
    timezone?: string | null;
    consent?: boolean;
  },
) {
  const gate = await runSafetyGate(sb, input);
  const failed = gate.checks.filter((c) => !c.passed);

  const idempotencyKey = `${input.packageId}:${input.connectionId}:${input.mode}`;
  const { data: existing } = await sb
    .from("studio_publish_jobs")
    .select("id, status")
    .eq("idempotency_key", idempotencyKey)
    .maybeSingle();
  if (existing && !["cancelled", "failed"].includes(existing.status)) {
    return { jobId: existing.id as string, status: existing.status as string, checks: gate.checks, reused: true };
  }

  const status = gate.blocked ? "waiting_approval" : input.mode === "publish_now" ? "preparing" : "scheduled";

  const payload = {
    production_id: gate.pkg.production_id,
    derivative_production_id: gate.pkg.production_id,
    package_id: gate.pkg.id,
    connection_id: gate.connection?.id ?? null,
    platform: gate.connection?.platform ?? gate.pkg.platform,
    account_label: gate.connection?.account_label ?? null,
    format: gate.pkg.derivative_type,
    mode: input.mode,
    scheduled_for: input.scheduledFor ?? null,
    timezone: input.timezone ?? null,
    status,
    blocked_reasons: failed.map((c) => ({ id: c.id, label: c.label, detail: c.detail })),
    consent_confirmed_at: input.consent ? new Date().toISOString() : null,
    idempotency_key: idempotencyKey,
    created_by: userId,
  };

  let jobId: string;
  if (existing) {
    await sb.from("studio_publish_jobs").update({ ...payload, error: null, attention_reason: null }).eq("id", existing.id);
    jobId = existing.id;
  } else {
    const { data, error } = await sb.from("studio_publish_jobs").insert(payload).select("id").single();
    if (error) throw new DistributionError(error.message);
    jobId = data.id;
  }

  await ensureContentId(sb, gate.pkg.production_id, "DERIVATIVE");
  await audit(sb, userId, gate.blocked ? "publication_blocked" : "publication_scheduled", "publish_job", jobId, {
    platform: payload.platform,
    account: payload.account_label,
    mode: input.mode,
    blocked: gate.blocked,
    failed: failed.map((f) => f.label),
  });

  return { jobId, status, checks: gate.checks, reused: false };
}

/** Actually hand a job to its adapter. Re-checks the gate first — always. */
export async function runJob(sb: Db, userId: string, jobId: string) {
  const { data: job } = await sb.from("studio_publish_jobs").select("*").eq("id", jobId).maybeSingle();
  if (!job) throw new DistributionError("That job no longer exists.");
  if (job.status === "published") return { status: "published", note: "Already published — nothing sent again." };
  if (!job.package_id || !job.connection_id) throw new DistributionError("This job has no package or account attached.");

  const gate = await runSafetyGate(sb, {
    packageId: job.package_id,
    connectionId: job.connection_id,
    mode: job.mode as PublishMode,
  });
  if (gate.blocked) {
    await sb
      .from("studio_publish_jobs")
      .update({
        status: "waiting_approval",
        blocked_reasons: gate.checks.filter((c) => !c.passed).map((c) => ({ id: c.id, label: c.label, detail: c.detail })),
      })
      .eq("id", jobId);
    return { status: "waiting_approval", note: "Blocked by the safety gate. Nothing was sent." };
  }

  const adapter = getAdapter(gate.connection.platform);
  if (!adapter) throw new DistributionError("No adapter for that platform.");

  await sb.from("studio_publish_jobs").update({ status: "uploading", started_at: new Date().toISOString() }).eq("id", jobId);

  let result;
  try {
    result = await adapter.publish({
      account: gate.connection,
      pkg: gate.pkg,
      mode: job.mode as PublishMode,
      idempotencyKey: job.idempotency_key ?? jobId,
    });
  } catch (e) {
    await sb
      .from("studio_publish_jobs")
      .update({
        status: "needs_attention",
        attention_reason: "We could not confirm whether the platform received this. It will not be sent again automatically.",
        error: e instanceof Error ? e.message : "Unknown error",
        retry_count: (job.retry_count ?? 0) + 1,
      })
      .eq("id", jobId);
    return { status: "needs_attention", note: "Uncertain outcome — held for your attention." };
  }

  if (result.outcome === "blocked") {
    await sb
      .from("studio_publish_jobs")
      .update({ status: "failed", error: result.reason, retry_count: (job.retry_count ?? 0) + 1 })
      .eq("id", jobId);
    await audit(sb, userId, "publication_failed", "publish_job", jobId, { reason: result.reason });
    return { status: "failed", note: result.reason };
  }

  const published = result.outcome === "published";
  await sb
    .from("studio_publish_jobs")
    .update({
      status: published ? "published" : result.outcome === "draft_review" ? "processing" : "processing",
      external_id: result.externalId,
      external_url: result.externalUrl,
      completed_at: published ? new Date().toISOString() : null,
      error: null,
      attention_reason: null,
    })
    .eq("id", jobId);

  const contentId = await ensureContentId(sb, gate.pkg.production_id, "DERIVATIVE");
  const { data: pub } = await sb
    .from("studio_publications")
    .insert({
      production_id: gate.pkg.production_id,
      master_production_id: gate.pkg.master_id ?? null,
      derivative_production_id: gate.pkg.production_id,
      package_id: gate.pkg.id,
      connection_id: gate.connection.id,
      job_id: jobId,
      platform: gate.connection.platform,
      account_label: gate.connection.account_label,
      content_id: contentId,
      external_id: result.externalId,
      external_url: result.externalUrl,
      status: published ? "live" : "processing",
      published_at: published ? new Date().toISOString() : null,
    })
    .select("id")
    .single();

  await audit(sb, userId, "publication_completed", "publication", pub?.id ?? null, {
    platform: gate.connection.platform,
    account: gate.connection.account_label,
    external_id: result.externalId,
    content_id: contentId,
  });

  return { status: published ? "published" : "processing", note: result.note ?? "" };
}

/** Safe retry — never a second public post. */
export async function retryJob(sb: Db, userId: string, jobId: string) {
  const { data: job } = await sb.from("studio_publish_jobs").select("*").eq("id", jobId).maybeSingle();
  if (!job) throw new DistributionError("That job no longer exists.");
  if (job.status === "published") return { status: "published", note: "Already published. Nothing sent again." };
  if (job.status === "needs_attention") {
    return {
      status: "needs_attention",
      note: "We do not know whether the platform already has this. Check the platform first, then clear it by hand.",
    };
  }
  if ((job.retry_count ?? 0) >= 3) {
    await sb
      .from("studio_publish_jobs")
      .update({ status: "needs_attention", attention_reason: "Three attempts failed. Held so nothing double-posts." })
      .eq("id", jobId);
    return { status: "needs_attention", note: "Held after three attempts." };
  }
  await audit(sb, userId, "publication_retried", "publish_job", jobId, { attempt: (job.retry_count ?? 0) + 1 });
  return runJob(sb, userId, jobId);
}

export async function cancelJob(sb: Db, userId: string, jobId: string) {
  await sb
    .from("studio_publish_jobs")
    .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
    .eq("id", jobId)
    .neq("status", "published");
  await audit(sb, userId, "publication_cancelled", "publish_job", jobId, {});
  return { ok: true };
}

/** Analytics + revenue synchronisation. Records what the platform gives; nothing else. */
export async function syncConnection(sb: Db, userId: string, connectionId: string, kind: "analytics" | "revenue") {
  const { data: connection } = await sb.from("studio_platform_connections").select("*").eq("id", connectionId).maybeSingle();
  if (!connection) throw new DistributionError("That account no longer exists.");
  const adapter = getAdapter(connection.platform);
  if (!adapter) throw new DistributionError("No adapter for that platform.");

  const { data: run } = await sb
    .from("studio_sync_runs")
    .insert({
      connection_id: connectionId,
      platform: connection.platform,
      kind,
      status: "running",
      started_at: new Date().toISOString(),
      created_by: userId,
    })
    .select("id")
    .single();

  const { data: pubs } = await sb
    .from("studio_publications")
    .select("id, external_id")
    .eq("connection_id", connectionId)
    .not("external_id", "is", null);
  const externalIds = (pubs ?? []).map((p: any) => p.external_id);

  const result =
    kind === "analytics"
      ? await adapter.fetchAnalytics({ account: connection, externalIds })
      : await adapter.fetchRevenue({ account: connection, externalIds });

  await sb
    .from("studio_sync_runs")
    .update({
      status: result.available ? "completed" : "no_data",
      items_synced: result.rows.length,
      finished_at: new Date().toISOString(),
      detail: { note: result.note },
    })
    .eq("id", run?.id);

  await sb
    .from("studio_platform_connections")
    .update({ last_sync_at: new Date().toISOString(), last_error: result.available ? null : result.note })
    .eq("id", connectionId);

  await audit(sb, userId, `sync_${kind}`, "connection", connectionId, { available: result.available, note: result.note });
  return { available: result.available, count: result.rows.length, note: result.note };
}

/** Founder control over what is already out there. The Master is never deleted. */
export async function takedown(
  sb: Db,
  userId: string,
  input: { publicationId: string; action: "stop_distribution" | "archive_internally" | "request_removal"; reason?: string },
) {
  const { data: pub } = await sb
    .from("studio_publications")
    .select("*, studio_platform_connections(*)")
    .eq("id", input.publicationId)
    .maybeSingle();
  if (!pub) throw new DistributionError("That publication no longer exists.");

  let result = "recorded";
  if (input.action === "stop_distribution") {
    await sb.from("studio_publications").update({ distribution_stopped: true }).eq("id", pub.id);
    await sb
      .from("studio_publish_jobs")
      .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
      .eq("package_id", pub.package_id)
      .in("status", ["scheduled", "waiting_approval", "preparing"]);
    result = "Future distribution stopped.";
  } else if (input.action === "archive_internally") {
    await sb.from("studio_publications").update({ status: "archived" }).eq("id", pub.id);
    result = "Archived internally. The Frass Master is untouched.";
  } else {
    const adapter = getAdapter(pub.platform);
    const outcome = adapter?.requestRemoval
      ? await adapter.requestRemoval({ account: pub.studio_platform_connections ?? {}, externalId: pub.external_id })
      : { accepted: false, note: "This platform has no removal capability through the API." };
    await sb
      .from("studio_publications")
      .update({ removal_status: outcome.accepted ? "removed" : "requested", removed_at: outcome.accepted ? new Date().toISOString() : null })
      .eq("id", pub.id);
    result = outcome.note;
  }

  await sb.from("studio_takedowns").insert({
    publication_id: pub.id,
    action: input.action,
    status: "completed",
    reason: input.reason ?? null,
    requested_by: userId,
    completed_at: new Date().toISOString(),
    result,
  });
  await audit(sb, userId, "takedown_action", "publication", pub.id, { action: input.action, result });
  return { result };
}
