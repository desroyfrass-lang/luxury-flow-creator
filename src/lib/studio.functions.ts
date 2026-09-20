import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type Wallet = {
  user_id: string;
  balance: number;
  lifetime_purchased: number;
  lifetime_earned: number;
  lifetime_gifted: number;
  lifetime_used: number;
  monthly_allowance: number;
  today_used: number;
  month_used: number;
};

export type LedgerEntry = {
  id: string;
  direction: "debit" | "credit";
  amount: number;
  label: string;
  operation_key: string | null;
  description: string | null;
  processing_ms: number | null;
  created_at: string;
};

export type StudioProject = {
  id: string;
  title: string;
  destination: string;
  status: string;
  brief: string | null;
  /** FRASS-0407 / A1 — which control depth this production is shown at. */
  control_depth: string;
  /** Bridge to the canonical production identity (studio_productions). */
  production_id: string | null;
  created_at: string;
  updated_at: string;
};

/** One select list, so every path returns the same shape. */
const PROJECT_COLUMNS =
  "id, title, destination, status, brief, control_depth, production_id, created_at, updated_at";

type Db = { from: (t: string) => any; rpc: (n: string, a: unknown) => any };

async function ensureWallet(sb: Db, userId: string) {
  const { data } = await sb.from("ai_credit_wallets").select("*").eq("user_id", userId).maybeSingle();
  if (data) return data;
  const { data: created, error } = await sb
    .from("ai_credit_wallets")
    .insert({ user_id: userId })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return created;
}

export const getWallet = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Wallet> => {
    const sb = context.supabase as unknown as Db;
    const wallet = await ensureWallet(sb, context.userId);

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data: rows } = await sb
      .from("ai_credit_ledger")
      .select("amount, direction, created_at")
      .eq("user_id", context.userId)
      .eq("direction", "debit")
      .gte("created_at", startOfMonth.toISOString());

    const list = (rows ?? []) as Array<{ amount: number; created_at: string }>;
    const month_used = list.reduce((s, r) => s + r.amount, 0);
    const today_used = list
      .filter((r) => new Date(r.created_at) >= startOfDay)
      .reduce((s, r) => s + r.amount, 0);

    return { ...wallet, today_used, month_used } as Wallet;
  });

export const listLedger = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<LedgerEntry[]> => {
    const sb = context.supabase as unknown as Db;
    const { data, error } = await sb
      .from("ai_credit_ledger")
      .select("id, direction, amount, label, operation_key, description, processing_ms, created_at")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(60);
    if (error) throw new Error(error.message);
    return (data ?? []) as LedgerEntry[];
  });

export const listStudioProjects = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<StudioProject[]> => {
    const sb = context.supabase as unknown as Db;
    const { data, error } = await sb
      .from("studio_projects")
      .select(PROJECT_COLUMNS)
      .eq("user_id", context.userId)
      .order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as StudioProject[];
  });

export const createStudioProject = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { title: string; destination?: string; brief?: string }) => {
    const title = (input.title ?? "").trim();
    if (!title) throw new Error("Give the production a name.");
    return {
      title: title.slice(0, 160),
      destination: input.destination || "youtube",
      brief: (input.brief ?? "").trim() || null,
    };
  })
  .handler(async ({ data, context }): Promise<StudioProject> => {
    const sb = context.supabase as unknown as Db;
    const { data: row, error } = await sb
      .from("studio_projects")
      .insert({ ...data, user_id: context.userId })
      .select(PROJECT_COLUMNS)
      .single();
    if (error) throw new Error(error.message);
    return row as StudioProject;
  });

/**
 * Approve-and-run.
 *
 * FRASS-0474 — the browser may say *what* work to do, never *what it costs*.
 * The forecast is rebuilt here from the official rate card, and a client total
 * that disagrees halts the run and is recorded as a security alert.
 *
 * COMMISSIONING PASS 1 — credit truth. Approving a forecast no longer takes
 * credits. This creates a job and stops. Credits move only in
 * settleStudioJob(), and only against a verified output from a real engine.
 */
export const runStudioOperation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      projectId?: string;
      request: string;
      label: string;
      lines: Array<{ key: string; label: string; credits: number; qty: number }>;
      total: number;
      seconds: number;
      /** Outside engines are a fallback; they are never assumed. */
      allowExternalFallback?: boolean;
    }) => {
      if (!Array.isArray(input.lines) || input.lines.length === 0)
        throw new Error("Nothing to run.");
      if (!Number.isFinite(input.total) || input.total <= 0) throw new Error("Invalid forecast.");
      return input;
    },
  )
  .handler(async ({ data, context }) => {
    const sb = context.supabase as unknown as Db;

    const { buildForecast } = await import("@/lib/studio/credits");
    const { assertMatchesServerTotal, assertWithinRule } = await import(
      "@/lib/finance/guardrails.server"
    );
    const { capabilityForOperation, routeToEngine } = await import("@/lib/studios/native-engines");

    // Rebuild the bill from the server's own rate card.
    const forecast = buildForecast(
      data.request,
      data.lines.map((l) => ({ key: l.key, qty: l.qty })),
    );
    if (forecast.lines.length === 0) throw new Error("That production has no billable work.");

    await assertWithinRule("creditCharge", forecast.total, "studio.runStudioOperation", context.userId, {
      keys: forecast.lines.map((l) => l.key),
    });
    const total = await assertMatchesServerTotal(
      "creditCharge",
      data.total,
      forecast.total,
      "studio.runStudioOperation",
      context.userId,
      { keys: forecast.lines.map((l) => l.key) },
    );
    const lines = forecast.lines;
    const seconds = forecast.seconds;

    const wallet = await ensureWallet(sb, context.userId);

    // Which machine does this need, and is it installed?
    const { data: providerRows } = await sb
      .from("studio_providers")
      .select("id, slug, label, capabilities, status, enabled, engine_type, priority, founder_preferred");
    const engines = (providerRows ?? []) as any[];

    // Machines are independent. An uninstalled machine (mastering, for example)
    // must never stop an installed one (audio restoration) from doing its own
    // work. Uninstalled steps are dropped from the bill and reported plainly.
    const plan = planOperations(lines, engines, {
      allowExternalFallback: data.allowExternalFallback === true,
    });
    const decision = plan.decision;
    const runnableKeys = new Set(plan.runnable.map((r) => r.key));
    const billableLines = lines.filter((l) => runnableKeys.has(l.key));
    const billable = billableLines.reduce((sum, l) => sum + l.credits, 0);
    const capability = plan.runnable[0]
      ? plan.runnable[0].capability
      : capabilityForOperation(lines[0]?.key ?? "");
    const notInstalledNote =
      plan.blocked.length > 0
        ? ` Not included: ${plan.blocked.map((b) => b.key).join(", ")} — ${plan.blocked[0]!.reason}`
        : "";

    // Only installed work can ever be billed, so only installed work needs cover.
    if (decision.ok && wallet.balance < billable) {
      throw new Error(
        `This needs ${billable.toLocaleString()} AI Credits and your balance is ${wallet.balance.toLocaleString()}. Top up, or ask me for a lighter version.`,
      );
    }


    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const admin = supabaseAdmin as unknown as Db;

    const jobStatus = decision.ok ? "queued" : "awaiting_engine";
    let productionId: string | null = null;
    if (data.projectId) {
      const { data: project } = await sb
        .from("studio_projects")
        .select("production_id,title,destination")
        .eq("id", data.projectId)
        .eq("user_id", context.userId)
        .maybeSingle();
      if (!project) throw new Error("That production is not yours.");
      productionId = project.production_id;
      if (!productionId) {
        const { data: canonical, error: canonicalError } = await admin
          .from("studio_productions")
          .insert({ title: project.title, status: "development", destinations: [project.destination], created_by: context.userId })
          .select("id")
          .single();
        if (canonicalError) throw new Error(canonicalError.message);
        productionId = canonical.id as string;
        const { error: bridgeError } = await admin.from("studio_projects").update({ production_id: productionId }).eq("id", data.projectId).eq("user_id", context.userId);
        if (bridgeError) throw new Error(bridgeError.message);
      }
    }

    const { data: job, error: jobErr } = await admin
      .from("studio_generation_jobs")
      .insert({
        job_type: capability ?? "finishing",
        provider: decision.ok ? decision.engine.slug : null,
        engine_slug: decision.ok ? decision.engine.slug : null,
        engine_type: decision.ok ? decision.ownership : "external_fallback",
        status: jobStatus,
        prompt: data.request.slice(0, 1000),
        estimated_cost_credits: total,
        charge_state: "unbilled",
        created_by: context.userId,
        production_id: productionId,
        error: decision.ok ? null : decision.reason,
      })
      .select("id")
      .single();
    if (jobErr) throw new Error(jobErr.message);

    const { error: opErr } = await admin.from("studio_operations").insert({
      user_id: context.userId,
      project_id: data.projectId ?? null,
      job_id: job.id,
      operation_key: lines[0]?.key ?? "composite",
      label: data.label,
      request: data.request.slice(0, 1000),
      estimated_credits: total,
      actual_credits: 0,
      status: decision.ok ? "waiting" : "blocked",
      verified: false,
      blocked_reason: decision.ok ? null : decision.reason,
      processing_ms: Math.round(seconds * 1000),
      output: { lines },
    });
    if (opErr) throw new Error(opErr.message);

    return {
      jobId: job.id as string,
      status: decision.ok ? ("waiting" as const) : ("blocked" as const),
      engine: decision.ok ? decision.engine.label : null,
      ownership: decision.ok ? decision.ownership : null,
      charged: 0,
      quoted: total,
      balance: wallet.balance as number,
      message: decision.ok
        ? `Approved and queued with ${decision.engine.label}. No credits taken — you are charged only when a finished, verified result comes back.`
        : decision.reason,
      receipts: [] as Array<{ label: string; credits: number }>,
    };
  });

export const prepareA1CleanJob = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { jobId: string }) => {
    if (!input?.jobId) throw new Error("Which A1 Clean job?");
    return input;
  })
  .handler(async ({ data, context }) => {
    const sb = context.supabase as unknown as Db;
    const { A1_CLEAN_ENGINE, a1StoragePaths } = await import("@/lib/studio/a1-clean");
    const { data: job, error } = await sb.from("studio_generation_jobs")
      .select("id,production_id,created_by,engine_slug,engine_type,status,charge_state")
      .eq("id", data.jobId).maybeSingle();
    if (error) throw new Error(error.message);
    if (!job || job.created_by !== context.userId) throw new Error("That A1 Clean job is not yours.");
    if (!job.production_id) throw new Error("This job is not linked to a canonical production.");
    if (job.engine_type !== A1_CLEAN_ENGINE.type || job.engine_slug !== A1_CLEAN_ENGINE.slug) throw new Error("That job is not assigned to FRASS Native A1 Clean.");
    if (job.status !== "queued" || job.charge_state !== "unbilled") throw new Error("That job is not waiting for a new A1 Clean output.");
    return { ...a1StoragePaths(context.userId, job.id), engine: A1_CLEAN_ENGINE };
  });

export const finalizeA1CleanJob = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { jobId: string; sourcePath: string; outputPath: string; sourceMime: string; sourceBytes: number; outputBytes: number; processedAt: string }) => input)
  .handler(async ({ data, context }) => {
    const { A1_CLEAN_ENGINE, isAcceptedA1Audio } = await import("@/lib/studio/a1-clean");
    if (!isAcceptedA1Audio(data.sourceMime, data.sourceBytes) || data.outputBytes <= 44) throw new Error("The stored audio evidence is invalid.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: result, error } = await (supabaseAdmin as any).rpc("finalize_frass_native_a1_clean", {
      _job_id: data.jobId, _user_id: context.userId, _source_path: data.sourcePath, _output_path: data.outputPath,
      _source_mime: data.sourceMime, _output_mime: "audio/wav", _source_bytes: data.sourceBytes, _output_bytes: data.outputBytes,
      _engine_slug: A1_CLEAN_ENGINE.slug, _engine_version: A1_CLEAN_ENGINE.version, _processed_at: data.processedAt,
    });
    if (error) throw new Error(error.message);
    return result as { charged: number; replayed: boolean; assetId: string; balance: number; verifiedAt: string };
  });

export const getStudioA1Evidence = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { productionId?: string | null }) => input)
  .handler(async ({ data, context }) => {
    if (!data.productionId) return {};
    const sb = context.supabase as unknown as Db;
    const { data: rows, error } = await sb.from("studio_a1_evidence").select("check_id,state,note").eq("production_id", data.productionId).eq("created_by", context.userId);
    if (error) throw new Error(error.message);
    return Object.fromEntries((rows ?? []).map((r: any) => [r.check_id, { state: r.state, note: r.note ?? undefined }]));
  });

/**
 * Settle one job.
 *
 * This is the ONLY path that takes credits for studio work. It refuses unless
 * the job carries a verified output produced by a real engine, and the unique
 * idempotency key on the job means a replay can never bill twice.
 */
export const settleStudioJob = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { jobId: string }) => {
    if (!input?.jobId) throw new Error("Which job?");
    return { jobId: input.jobId };
  })
  .handler(async ({ data, context }) => {
    const sb = context.supabase as unknown as Db;
    const { decideCharge, chargeIdempotencyKey } = await import("@/lib/studio/job-truth");

    const { data: job, error } = await sb
      .from("studio_generation_jobs")
      .select(
        "id, job_type, status, estimated_cost_credits, verified_output_url, verified_at, engine_slug, engine_type, charge_state, created_by",
      )
      .eq("id", data.jobId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!job || job.created_by !== context.userId) throw new Error("That job is not yours.");

    const lifecycle =
      job.status === "awaiting_engine"
        ? "awaiting_engine"
        : job.status === "failed"
          ? "failed"
          : job.verified_output_url && job.verified_at
            ? "verified"
            : "running";

    const decision = decideCharge({
      forecastCredits: Number(job.estimated_cost_credits ?? 0),
      lifecycle,
      output: job.verified_output_url
        ? {
            fileUrl: job.verified_output_url,
            engineSlug: job.engine_slug ?? "unknown",
            ownership: job.engine_type ?? "external_fallback",
            verifiedAt: job.verified_at,
          }
        : null,
      alreadyCharged: job.charge_state === "charged",
    });

    if (decision.charge <= 0) {
      return { charged: 0, status: decision.status, reason: decision.reason };
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const admin = supabaseAdmin as unknown as Db;

    // The unique index on idempotency_key is the real guard: a second attempt
    // to mark this job charged simply fails, so no double billing is possible.
    const { data: claimed, error: claimErr } = await admin
      .from("studio_generation_jobs")
      .update({
        charge_state: "charged",
        idempotency_key: chargeIdempotencyKey(job.id),
        actual_cost_credits: decision.charge,
        status: "complete",
        completed_at: new Date().toISOString(),
      })
      .eq("id", job.id)
      .eq("charge_state", "unbilled")
      .select("id")
      .maybeSingle();
    if (claimErr || !claimed) {
      return {
        charged: 0,
        status: "complete" as const,
        reason: "Already charged once for this job. A repeat cannot bill twice.",
      };
    }

    const wallet = await ensureWallet(sb, context.userId);
    await admin.from("ai_credit_ledger").insert({
      user_id: context.userId,
      direction: "debit",
      amount: decision.charge,
      operation_key: job.job_type,
      label: `Studio job ${job.job_type}`,
      description: `Verified result from ${job.engine_slug ?? "engine"}`,
    });
    const { data: updated } = await admin
      .from("ai_credit_wallets")
      .update({
        balance: wallet.balance - decision.charge,
        lifetime_used: wallet.lifetime_used + decision.charge,
      })
      .eq("user_id", context.userId)
      .select("balance")
      .single();

    await admin
      .from("studio_operations")
      .update({ status: "complete", verified: true, actual_credits: decision.charge })
      .eq("job_id", job.id);

    return {
      charged: decision.charge,
      status: "complete" as const,
      reason: decision.reason,
      balance: updated?.balance as number,
    };
  });

/** Founder AI Credit Center — platform-wide usage. */
export const creditOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const sb = context.supabase as unknown as Db;
    const { data: isAdmin } = await sb.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Founder access only.");

    const { data: wallets } = await sb
      .from("ai_credit_wallets")
      .select("user_id, balance, lifetime_used, lifetime_purchased");
    const { data: ledger } = await sb
      .from("ai_credit_ledger")
      .select("amount, direction, operation_key, label, created_at")
      .order("created_at", { ascending: false })
      .limit(400);

    const rows = (ledger ?? []) as Array<{
      amount: number;
      direction: string;
      operation_key: string | null;
      label: string;
    }>;
    const byOperation = new Map<string, number>();
    let spent = 0;
    for (const r of rows) {
      if (r.direction !== "debit") continue;
      spent += r.amount;
      byOperation.set(r.label, (byOperation.get(r.label) ?? 0) + r.amount);
    }

    return {
      members: (wallets ?? []).length,
      outstanding: (wallets ?? []).reduce((s: number, w: any) => s + w.balance, 0),
      lifetimeUsed: (wallets ?? []).reduce((s: number, w: any) => s + w.lifetime_used, 0),
      lifetimePurchased: (wallets ?? []).reduce((s: number, w: any) => s + w.lifetime_purchased, 0),
      recentSpend: spent,
      topOperations: [...byOperation.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([label, credits]) => ({ label, credits })),
    };
  });

/** Founder grants promotional or gifted credits. */
export const grantCredits = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { email: string; amount: number; reason: string }) => {
    const amount = Math.round(input.amount);
    if (!input.email?.trim()) throw new Error("Who is this for?");
    if (!Number.isFinite(amount) || amount <= 0) throw new Error("Enter a credit amount.");
    return { email: input.email.trim().toLowerCase(), amount, reason: input.reason?.trim() || "Founder grant" };
  })
  .handler(async ({ data, context }) => {
    const sb = context.supabase as unknown as Db;
    const { data: isAdmin } = await sb.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Founder access only.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const admin = supabaseAdmin as unknown as Db & { auth: any };

    const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const target = list?.users?.find(
      (u: { email?: string }) => (u.email ?? "").toLowerCase() === data.email,
    );
    if (!target) throw new Error("No member with that email.");

    const existing = await admin
      .from("ai_credit_wallets")
      .select("*")
      .eq("user_id", target.id)
      .maybeSingle();
    const wallet =
      existing.data ??
      (await admin.from("ai_credit_wallets").insert({ user_id: target.id }).select("*").single())
        .data;

    await admin
      .from("ai_credit_wallets")
      .update({
        balance: wallet.balance + data.amount,
        lifetime_gifted: wallet.lifetime_gifted + data.amount,
      })
      .eq("user_id", target.id);

    await admin.from("ai_credit_ledger").insert({
      user_id: target.id,
      direction: "credit",
      amount: data.amount,
      label: "Founder grant",
      description: data.reason,
    });

    return { granted: data.amount, email: data.email };
  });

/**
 * FRASS-0407 / A1 — change the control depth of one production.
 *
 * A depth change is a change of view only. Nothing is restarted, converted or
 * flattened: only this one column moves, and only for the owner's own project.
 */
export const setStudioControlDepth = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { projectId: string; depth: string }) => {
    const allowed = ["directed", "creator", "producer", "pro"];
    if (!input?.projectId) throw new Error("Which production?");
    if (!allowed.includes(input.depth)) throw new Error("Unknown control depth.");
    return { projectId: input.projectId, depth: input.depth };
  })
  .handler(async ({ data, context }): Promise<StudioProject> => {
    const sb = context.supabase as unknown as Db;
    const { data: row, error } = await sb
      .from("studio_projects")
      .update({ control_depth: data.depth })
      .eq("id", data.projectId)
      .eq("user_id", context.userId)
      .select(PROJECT_COLUMNS)
      .single();
    if (error) throw new Error(error.message);
    return row as StudioProject;
  });

/**
 * Bridge a studio project to the canonical production identity.
 *
 * studio_productions is the canonical record — briefs, scripts, scenes,
 * characters, masters and distribution already hang off it. A project that was
 * created before this bridge keeps working untouched; calling this once links
 * it. Nothing is copied, converted or destroyed.
 */
export const ensureCanonicalProduction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { projectId: string }) => {
    if (!input?.projectId) throw new Error("Which production?");
    return { projectId: input.projectId };
  })
  .handler(async ({ data, context }) => {
    const sb = context.supabase as unknown as Db;
    const { bridgePayload, productionRef } = await import("@/lib/studios/production-identity");

    const { data: project, error } = await sb
      .from("studio_projects")
      .select(PROJECT_COLUMNS)
      .eq("id", data.projectId)
      .eq("user_id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!project) throw new Error("That production is not yours.");

    const ref = productionRef(project as StudioProject);
    if (ref.kind === "canonical") return { productionId: ref.productionId, created: false };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const admin = supabaseAdmin as unknown as Db;

    const { data: production, error: insErr } = await admin
      .from("studio_productions")
      .insert(bridgePayload(project as StudioProject, context.userId))
      .select("id")
      .single();
    if (insErr) throw new Error(insErr.message);

    const { error: linkErr } = await admin
      .from("studio_projects")
      .update({ production_id: production.id })
      .eq("id", data.projectId)
      .eq("user_id", context.userId);
    if (linkErr) throw new Error(linkErr.message);

    return { productionId: production.id as string, created: true };
  });
