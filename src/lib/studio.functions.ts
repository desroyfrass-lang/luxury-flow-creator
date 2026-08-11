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
  created_at: string;
  updated_at: string;
};

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
      .select("id, title, destination, status, brief, created_at, updated_at")
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
      .select("id, title, destination, status, brief, created_at, updated_at")
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
    if (wallet.balance < total) {
      throw new Error(
        `This needs ${total.toLocaleString()} AI Credits and your balance is ${wallet.balance.toLocaleString()}. Top up, or ask me for a lighter version.`,
      );
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const admin = supabaseAdmin as unknown as Db;

    const receipts: Array<{ label: string; credits: number }> = [];
    for (const line of lines) {
      const { error } = await admin.from("ai_credit_ledger").insert({
        user_id: context.userId,
        direction: "debit",
        amount: line.credits,
        operation_key: line.key,
        label: line.label,
        project_id: data.projectId ?? null,
        description: data.request.slice(0, 400),
        processing_ms: Math.round((seconds * 1000 * line.credits) / Math.max(1, total)),
      });
      if (error) throw new Error(error.message);
      receipts.push({ label: line.label, credits: line.credits });
    }

    const { error: opErr } = await admin.from("studio_operations").insert({
      user_id: context.userId,
      project_id: data.projectId ?? null,
      operation_key: lines[0]?.key ?? "composite",
      label: data.label,
      request: data.request.slice(0, 1000),
      estimated_credits: total,
      actual_credits: total,
      status: "complete",
      processing_ms: Math.round(seconds * 1000),
      output: { lines },
    });
    if (opErr) throw new Error(opErr.message);

    const { data: updated, error: wErr } = await admin
      .from("ai_credit_wallets")
      .update({
        balance: wallet.balance - total,
        lifetime_used: wallet.lifetime_used + total,
      })
      .eq("user_id", context.userId)
      .select("balance")
      .single();
    if (wErr) throw new Error(wErr.message);

    return { charged: total, balance: updated.balance as number, receipts };
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
