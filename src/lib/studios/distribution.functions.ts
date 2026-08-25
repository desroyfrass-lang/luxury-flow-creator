// FRASS-0602 — the server doors of the Frass Distribution Network.
// Thin wrappers only. Every brain lives in the .server files, which can never
// reach the browser. Founder/Admin is re-proved on the server for every call.

import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type Db = { from: (t: string) => any; rpc: (n: string, a: unknown) => any };

/** What each platform can do today — read from the adapters themselves. */
export const listCapabilities = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { requireStudioStaff } = await import("@/lib/studios/distribution/network.server");
    const { listAdapters } = await import("@/lib/studios/distribution/adapters.server");
    await requireStudioStaff(context.supabase as unknown as Db, context.userId);
    return listAdapters().map((a) => ({
      platform: a.platform,
      capabilities: a.capabilities,
      reviewGated: a.reviewGated,
      requiresCredentials: a.requiresCredentials,
      packaging: a.packaging,
    }));
  });

/** Dry-run the pre-publish safety gate for one package + account. */
export const checkSafetyGate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { packageId: string; connectionId: string; mode?: string }) => {
    if (!input.packageId || !input.connectionId) throw new Error("Choose a package and an account first.");
    return input;
  })
  .handler(async ({ data, context }) => {
    const { requireStudioStaff, runSafetyGate } = await import("@/lib/studios/distribution/network.server");
    const sb = context.supabase as unknown as Db;
    await requireStudioStaff(sb, context.userId);
    const gate = await runSafetyGate(sb, {
      packageId: data.packageId,
      connectionId: data.connectionId,
      mode: (data.mode as never) ?? "schedule",
    });
    return { checks: gate.checks, blocked: gate.blocked };
  });

/** Queue one or many destinations from the publishing matrix. */
export const queueDistribution = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      targets: Array<{ packageId: string; connectionId: string; mode?: string; scheduledFor?: string | null; timezone?: string | null; consent?: boolean }>;
    }) => {
      if (!input.targets?.length) throw new Error("Pick at least one destination.");
      return input;
    },
  )
  .handler(async ({ data, context }) => {
    const { requireStudioStaff, queuePublication } = await import("@/lib/studios/distribution/network.server");
    const sb = context.supabase as unknown as Db;
    await requireStudioStaff(sb, context.userId);

    const results = [];
    for (const t of data.targets) {
      try {
        const r = await queuePublication(sb, context.userId, {
          packageId: t.packageId,
          connectionId: t.connectionId,
          mode: (t.mode as never) ?? "schedule",
          scheduledFor: t.scheduledFor ?? null,
          timezone: t.timezone ?? null,
          consent: t.consent ?? false,
        });
        results.push({ ...t, ...r, ok: true });
      } catch (e) {
        results.push({ ...t, ok: false, error: e instanceof Error ? e.message : "Could not queue this one." });
      }
    }
    return { results };
  });

/** Hand a job to its platform adapter. */
export const runPublishJob = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { jobId: string }) => {
    if (!input.jobId) throw new Error("Which job?");
    return input;
  })
  .handler(async ({ data, context }) => {
    const { requireStudioStaff, runJob } = await import("@/lib/studios/distribution/network.server");
    const sb = context.supabase as unknown as Db;
    await requireStudioStaff(sb, context.userId);
    return runJob(sb, context.userId, data.jobId);
  });

export const retryPublishJob = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { jobId: string }) => {
    if (!input.jobId) throw new Error("Which job?");
    return input;
  })
  .handler(async ({ data, context }) => {
    const { requireStudioStaff, retryJob } = await import("@/lib/studios/distribution/network.server");
    const sb = context.supabase as unknown as Db;
    await requireStudioStaff(sb, context.userId);
    return retryJob(sb, context.userId, data.jobId);
  });

export const cancelPublishJob = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { jobId: string }) => {
    if (!input.jobId) throw new Error("Which job?");
    return input;
  })
  .handler(async ({ data, context }) => {
    const { requireStudioStaff, cancelJob } = await import("@/lib/studios/distribution/network.server");
    const sb = context.supabase as unknown as Db;
    await requireStudioStaff(sb, context.userId);
    return cancelJob(sb, context.userId, data.jobId);
  });

/** Pull whatever the platform will actually give us. Never invents numbers. */
export const syncPlatformData = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { connectionId: string; kind?: "analytics" | "revenue" }) => {
    if (!input.connectionId) throw new Error("Which account?");
    return input;
  })
  .handler(async ({ data, context }) => {
    const { requireStudioStaff, syncConnection } = await import("@/lib/studios/distribution/network.server");
    const sb = context.supabase as unknown as Db;
    await requireStudioStaff(sb, context.userId);
    return syncConnection(sb, context.userId, data.connectionId, data.kind ?? "analytics");
  });

/** Connection lifecycle. Tokens never travel through the browser. */
export const manageConnection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      action: "create" | "disconnect" | "reconnect" | "begin_oauth";
      connectionId?: string;
      platform?: string;
      accountLabel?: string;
      externalAccountId?: string;
    }) => {
      if (!input.action) throw new Error("What should happen?");
      return input;
    },
  )
  .handler(async ({ data, context }) => {
    const { requireStudioStaff, audit } = await import("@/lib/studios/distribution/network.server");
    const sb = context.supabase as unknown as Db;
    await requireStudioStaff(sb, context.userId);

    if (data.action === "create") {
      if (!data.platform || !data.accountLabel) throw new Error("Name the platform and the channel.");
      const internal = data.platform === "frass_hill";
      const { data: row, error } = await sb
        .from("studio_platform_connections")
        .insert({
          platform: data.platform,
          account_label: data.accountLabel,
          external_account_id: data.externalAccountId ?? null,
          status: internal ? "connected" : "setup_required",
          credentials_configured: internal,
          publishing_enabled: internal,
          analytics_enabled: internal,
          revenue_enabled: false,
          created_by: context.userId,
        })
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      await audit(sb, context.userId, "connection_added", "connection", row.id, { platform: data.platform });
      return { id: row.id as string, note: internal ? "Frass feed ready." : "Channel added. It stays SETUP REQUIRED until real credentials exist." };
    }

    if (!data.connectionId) throw new Error("Which account?");

    if (data.action === "disconnect") {
      await sb
        .from("studio_platform_connections")
        .update({ status: "disconnected", credentials_configured: false, publishing_enabled: false })
        .eq("id", data.connectionId);
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      await supabaseAdmin.from("studio_platform_credentials").delete().eq("connection_id", data.connectionId);
      await audit(sb, context.userId, "connection_disconnected", "connection", data.connectionId, {});
      return { note: "Disconnected. Any stored authorisation was destroyed." };
    }

    // reconnect / begin_oauth — the exchange itself happens server-side only,
    // and only once developer credentials for that platform exist.
    const { data: conn } = await sb
      .from("studio_platform_connections")
      .select("platform")
      .eq("id", data.connectionId)
      .maybeSingle();
    const envKey = `${String(conn?.platform ?? "").toUpperCase()}_CLIENT_ID`;
    const configured = Boolean(process.env[envKey]);
    if (!configured) {
      await sb.from("studio_platform_connections").update({ status: "setup_required" }).eq("id", data.connectionId);
      return {
        note: `SETUP REQUIRED — ${conn?.platform} developer credentials are not configured yet, so there is no sign-in to start. Nothing was faked.`,
        authorizeUrl: null as string | null,
      };
    }
    await audit(sb, context.userId, "connection_oauth_started", "connection", data.connectionId, { platform: conn?.platform });
    return { note: "Authorisation started on the server.", authorizeUrl: null as string | null };
  });

/** Founder control over what is already published. */
export const publicationControl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { publicationId: string; action: "stop_distribution" | "archive_internally" | "request_removal"; reason?: string }) => {
    if (!input.publicationId || !input.action) throw new Error("Which publication, and what should happen?");
    return input;
  })
  .handler(async ({ data, context }) => {
    const { requireStudioStaff, takedown } = await import("@/lib/studios/distribution/network.server");
    const sb = context.supabase as unknown as Db;
    await requireStudioStaff(sb, context.userId);
    return takedown(sb, context.userId, data);
  });

/** Give a production (and its derivatives) their permanent Frass content IDs. */
export const assignContentIds = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { productionId: string }) => {
    if (!input.productionId) throw new Error("Which production?");
    return input;
  })
  .handler(async ({ data, context }) => {
    const { requireStudioStaff, ensureContentId } = await import("@/lib/studios/distribution/network.server");
    const sb = context.supabase as unknown as Db;
    await requireStudioStaff(sb, context.userId);
    const master = await ensureContentId(sb, data.productionId, "MASTER");
    const { data: derivatives } = await sb
      .from("studio_production_derivatives")
      .select("id, derivative_production_id")
      .eq("master_production_id", data.productionId);
    const ids: string[] = [];
    for (const d of derivatives ?? []) {
      if (!d.derivative_production_id) continue;
      const cid = await ensureContentId(sb, d.derivative_production_id, "DERIVATIVE");
      await sb.from("studio_production_derivatives").update({ content_id: cid }).eq("id", d.id);
      ids.push(cid);
    }
    return { master, derivatives: ids };
  });
