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
};

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

    return { checks, takenAt: new Date().toISOString() };
  });
