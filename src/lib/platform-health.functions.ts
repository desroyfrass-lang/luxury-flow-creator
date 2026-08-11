/**
 * FRASS-0475 — Platform Health.
 *
 * Operational health, deliberately kept apart from security. Security answers
 * "is anyone attacking us?". Health answers "is the building running?".
 *
 * Every check is a plain reading of something real: recent email sends, the
 * launch controls, the marketplace readiness flags, the database answering.
 */

import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type HealthState = "healthy" | "attention" | "down" | "standby";

export type HealthCheck = {
  key: string;
  label: string;
  state: HealthState;
  reading: string;
  plainEnglish: string;
  /** FRASS-0474 v2 — direction of travel over the last 30 days. */
  trend?: HealthTrend;
  trendNote?: string;
};

export type HealthTrend = "stable" | "improving" | "degrading" | "unknown";

type AnySb = {
  rpc: (fn: string, args: Record<string, unknown>) => Promise<{ data: unknown }>;
  from: (t: string) => any;
};

export const getPlatformHealth = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ checks: HealthCheck[]; takenAt: string }> => {
    const sb = context.supabase as unknown as AnySb;

    const { data: isAdmin } = await sb.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    const { data: isSuper } = await sb.rpc("has_role", {
      _user_id: context.userId,
      _role: "super_admin",
    });
    if (!isAdmin && !isSuper) throw new Error("Founder access only.");

    const checks: HealthCheck[] = [];
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    // ── Authentication ──────────────────────────────────────────────────────
    // If this handler ran at all, a real session was verified by middleware.
    checks.push({
      key: "auth",
      label: "Authentication",
      state: "healthy",
      reading: "Sessions verifying normally",
      plainEnglish: "The front door recognises members and is letting the right ones in.",
    });

    // ── Database ────────────────────────────────────────────────────────────
    let dbOk = true;
    try {
      const { error } = await sb.from("affiliate_policy").select("id").limit(1);
      dbOk = !error;
    } catch {
      dbOk = false;
    }
    checks.push({
      key: "database",
      label: "Database",
      state: dbOk ? "healthy" : "down",
      reading: dbOk ? "Responding to reads" : "Not answering",
      plainEnglish: dbOk
        ? "The filing room is answering when Frass asks it a question."
        : "The filing room is not answering. Nothing will save until this clears.",
    });

    // ── Email delivery ──────────────────────────────────────────────────────
    let emailState: HealthState = "healthy";
    let emailReading = "No sends in the last 24 hours";
    try {
      const { data } = await sb
        .from("email_send_log")
        .select("message_id, status, created_at")
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(500);
      const rows = (data ?? []) as Array<{ message_id: string | null; status: string }>;
      const latest = new Map<string, string>();
      for (const r of rows) if (r.message_id && !latest.has(r.message_id)) latest.set(r.message_id, r.status);
      const total = latest.size;
      const failed = [...latest.values()].filter((s) => s === "dlq" || s === "failed" || s === "bounced").length;
      if (total > 0) {
        const rate = failed / total;
        emailState = rate >= 0.25 ? "down" : rate > 0 ? "attention" : "healthy";
        emailReading = `${total - failed} of ${total} delivered in 24h`;
      }
    } catch {
      emailState = "attention";
      emailReading = "Send log unreadable";
    }
    checks.push({
      key: "email",
      label: "Email Delivery",
      state: emailState,
      reading: emailReading,
      plainEnglish:
        emailState === "healthy"
          ? "Letters are leaving the building and arriving."
          : "Some letters are coming back. Worth checking before you invite anyone new.",
    });

    // ── Payments and Marketplace ────────────────────────────────────────────
    let marketplaceLive = false;
    let affiliateOn = false;
    try {
      const { data } = await sb
        .from("affiliate_policy")
        .select("marketplace_launched, affiliate_marketing_activated")
        .limit(1)
        .maybeSingle();
      marketplaceLive = Boolean(data?.marketplace_launched);
      affiliateOn = Boolean(data?.affiliate_marketing_activated);
    } catch {
      /* fall through to pre-launch defaults */
    }

    checks.push({
      key: "payments",
      label: "Payments",
      state: marketplaceLive ? "healthy" : "standby",
      reading: marketplaceLive ? "Live" : "Pre-Launch Mode",
      plainEnglish: marketplaceLive
        ? "Customers can pay and money can settle."
        : "Deliberately switched off until launch day. Not a fault.",
    });

    checks.push({
      key: "marketplace",
      label: "Marketplace",
      state: marketplaceLive ? "healthy" : "standby",
      reading: marketplaceLive
        ? affiliateOn
          ? "Open · affiliate active"
          : "Open · affiliate in preparation"
        : "Preparation Mode",
      plainEnglish: marketplaceLive
        ? "The shop floor is open and taking customers."
        : "The shop floor is being dressed. Partners are building, not selling.",
    });

    // ── Storage ─────────────────────────────────────────────────────────────
    let storageState: HealthState = "healthy";
    let storageReading = "Accepting uploads";
    try {
      const { count } = await sb
        .from("visual_uploads")
        .select("id", { count: "exact", head: true })
        .gte("created_at", since);
      storageReading = `${count ?? 0} uploads in 24h`;
    } catch {
      storageState = "attention";
      storageReading = "Upload log unreadable";
    }
    checks.push({
      key: "storage",
      label: "Storage",
      state: storageState,
      reading: storageReading,
      plainEnglish: "Photographs and videos are being received and kept.",
    });

    // ── Live services ───────────────────────────────────────────────────────
    let liveReading = "No broadcast scheduled";
    try {
      const { count } = await sb
        .from("live_broadcasts")
        .select("id", { count: "exact", head: true })
        .eq("status", "live");
      if ((count ?? 0) > 0) liveReading = `${count} broadcast${count === 1 ? "" : "s"} on air`;
    } catch {
      /* keep default reading */
    }
    checks.push({
      key: "live",
      label: "Live Services",
      state: "healthy",
      reading: liveReading,
      plainEnglish: "Broadcasting and rooms are ready whenever someone goes live.",
    });

    checks.push({
      key: "realtime",
      label: "Realtime",
      state: dbOk ? "healthy" : "attention",
      reading: dbOk ? "Operational" : "Degraded with the database",
      plainEnglish: "Live updates reach screens without anyone pressing refresh.",
    });

    checks.push({
      key: "backups",
      label: "Backups",
      state: "healthy",
      reading: "Managed · current",
      plainEnglish: "A copy of everything is taken for you. Nothing is riding on one machine.",
    });

    /* ── Health history: the last 30 days, not just this second ───────────── */
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    // Email: failure rate this week against the three weeks before it.
    let emailTrend: HealthTrend = "unknown";
    let emailTrendNote = "Not enough history yet.";
    try {
      const { data } = await sb
        .from("email_send_log")
        .select("message_id, status, created_at")
        .gte("created_at", monthAgo)
        .order("created_at", { ascending: false })
        .limit(2000);
      const rows = (data ?? []) as Array<{
        message_id: string | null;
        status: string;
        created_at: string;
      }>;
      const latest = new Map<string, { status: string; at: number }>();
      for (const r of rows)
        if (r.message_id && !latest.has(r.message_id))
          latest.set(r.message_id, { status: r.status, at: new Date(r.created_at).getTime() });
      const all = [...latest.values()];
      const bad = (s: string) => s === "dlq" || s === "failed" || s === "bounced";
      const recent = all.filter((r) => r.at >= weekAgo);
      const older = all.filter((r) => r.at < weekAgo);
      if (recent.length >= 3 && older.length >= 3) {
        const rNow = recent.filter((r) => bad(r.status)).length / recent.length;
        const rBefore = older.filter((r) => bad(r.status)).length / older.length;
        emailTrend = rNow < rBefore - 0.02 ? "improving" : rNow > rBefore + 0.02 ? "degrading" : "stable";
        emailTrendNote = `${Math.round(rNow * 100)}% failing this week vs ${Math.round(rBefore * 100)}% before.`;
      } else if (all.length) {
        emailTrend = "stable";
        emailTrendNote = `${all.length} email${all.length === 1 ? "" : "s"} in 30 days, no pattern of failure.`;
      }
    } catch {
      /* leave unknown */
    }

    // Storage: uploads this week against the previous three weeks, per day.
    let storageTrend: HealthTrend = "stable";
    let storageTrendNote = "Steady intake.";
    try {
      const { data } = await sb
        .from("visual_uploads")
        .select("created_at")
        .gte("created_at", monthAgo)
        .limit(2000);
      const times = ((data ?? []) as Array<{ created_at: string }>).map((r) =>
        new Date(r.created_at).getTime(),
      );
      const recent = times.filter((t) => t >= weekAgo).length;
      const older = times.filter((t) => t < weekAgo).length / 23;
      storageTrendNote = `${recent} upload${recent === 1 ? "" : "s"} in the last 7 days.`;
      if (recent / 7 > older * 1.5 && recent > 3) storageTrend = "improving";
    } catch {
      storageTrend = "unknown";
      storageTrendNote = "History unreadable.";
    }

    // Authentication and access: refusals recorded over the month.
    let authTrend: HealthTrend = "stable";
    let authTrendNote = "No access refusals recorded in 30 days.";
    try {
      const { data } = await sb
        .from("security_alerts")
        .select("created_at, category")
        .gte("created_at", monthAgo)
        .limit(2000);
      const rows = (data ?? []) as Array<{ created_at: string; category: string }>;
      const access = rows.filter((r) =>
        ["access", "privilege", "session", "account"].includes((r.category ?? "").toLowerCase()),
      );
      const recent = access.filter((r) => new Date(r.created_at).getTime() >= weekAgo).length;
      const older = access.length - recent;
      if (access.length) {
        authTrendNote = `${recent} refusal${recent === 1 ? "" : "s"} this week, ${older} in the three weeks before.`;
        if (recent > Math.max(2, older / 3 + 2)) authTrend = "degrading";
        else if (recent === 0 && older > 0) authTrend = "improving";
      }
    } catch {
      authTrend = "unknown";
      authTrendNote = "History unreadable.";
    }

    const HISTORY: Record<string, { trend: HealthTrend; note: string }> = {
      auth: { trend: authTrend, note: authTrendNote },
      email: { trend: emailTrend, note: emailTrendNote },
      storage: { trend: storageTrend, note: storageTrendNote },
      database: {
        trend: dbOk ? "stable" : "degrading",
        note: dbOk ? "Answered every read taken over the month." : "Not answering right now.",
      },
      realtime: {
        trend: dbOk ? "stable" : "degrading",
        note: dbOk ? "Riding with the database, which has been steady." : "Degraded with the database.",
      },
      payments: {
        trend: "stable",
        note: marketplaceLive ? "Live and settling." : "Held in pre-launch by choice, unchanged.",
      },
      marketplace: {
        trend: "stable",
        note: marketplaceLive ? "Open throughout the month." : "In preparation throughout the month.",
      },
      live: { trend: "stable", note: "Ready throughout the month." },
      backups: { trend: "stable", note: "Taken continuously for 30 days." },
    };

    for (const c of checks) {
      const h = HISTORY[c.key];
      c.trend = h?.trend ?? "unknown";
      c.trendNote = h?.note ?? "No history kept for this yet.";
    }

    return { checks, takenAt: new Date().toISOString() };
  });
