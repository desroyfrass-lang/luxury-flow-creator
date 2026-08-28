// ─────────────────────────────────────────────────────────────────────────────
// FRASS DAILY — the real priority engine.
//
// Daily answers ONE question: "what do I need to do today?"
// It never invents activity: every card is derived from a record that already
// exists for this member. Sources are independent — if one system is empty or
// unavailable, the rest of the Daily still loads.
// ─────────────────────────────────────────────────────────────────────────────

import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { WorkItem } from "@/lib/daily/work.functions";
import {
  DAY,
  safe,
  scoreFor,
  startOfToday,
  type DailyBoard,
  type DailyCard,
  type Sb,
  type DailySource,
} from "@/lib/daily/board-model";

export type { DailyBoard, DailyCard, DailySource } from "@/lib/daily/board-model";

export const getDailyBoard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<DailyBoard> => {
    const sb = context.supabase as unknown as Sb;
    const userId = context.userId;
    const today0 = startOfToday();
    const nowIso = new Date().toISOString();

    // ── Vaults (context only — the Vault Engine remains the source of truth) ──
    const vaults = await safe(async () => {
      const { data } = await sb.from("vaults").select("id,name").eq("owner_id", userId);
      return (data ?? []) as { id: string; name: string }[];
    }, [] as { id: string; name: string }[]);
    const vaultName = new Map(vaults.map((v) => [v.id, v.name]));

    // ── Workshop work items (the shared work record) ───────────────────────────
    const items = await safe(async () => {
      const { data } = await sb
        .from("member_actions")
        .select("*")
        .eq("owner_id", userId)
        .in("status", ["active", "done"])
        .eq("is_sample", false)
        .order("updated_at", { ascending: false })
        .limit(300);
      return (data ?? []) as WorkItem[];
    }, [] as WorkItem[]);

    const workCards: DailyCard[] = [];
    const doneToday: DailyCard[] = [];
    let overdue = 0;
    let dueToday = 0;

    for (const it of items) {
      const card: DailyCard = {
        id: `work:${it.id}`,
        workItemId: it.id,
        title: it.title,
        source: (it.source_system as DailySource) ?? "workshop",
        sourceLabel: it.vault_id ? (vaultName.get(it.vault_id) ?? "Vault work") : (it.context || "Workshop"),
        priority: it.priority,
        score: scoreFor({
          priority: it.priority,
          dueAt: it.due_at,
          scheduledFor: it.scheduled_for,
          updatedAt: it.updated_at,
        }),
        ...(it.detail ? { detail: it.detail } : {}),
        ...(it.href ? { href: it.href } : {}),
        ...(it.vault_id && vaultName.get(it.vault_id) ? { vaultName: vaultName.get(it.vault_id)! } : {}),
        ...(it.due_at ? { dueAt: it.due_at } : {}),
        ...(it.scheduled_for ? { scheduledFor: it.scheduled_for } : {}),
      };

      if (it.status === "done") {
        if (it.completed_at && new Date(it.completed_at) >= today0) {
          doneToday.push({ ...card, completedAt: it.completed_at! });
        }
        continue;
      }
      // Snoozed work is genuinely out of today.
      if (it.snoozed_until && new Date(it.snoozed_until) > new Date()) continue;

      if (it.due_at) {
        if (new Date(it.due_at) < new Date()) overdue += 1;
        else if (new Date(it.due_at).getTime() - Date.now() < DAY) dueToday += 1;
      }
      workCards.push(card);
    }

    // ── Vault records that are genuinely open and dated ───────────────────────
    const vaultCards = await safe(async () => {
      if (vaults.length === 0) return [] as DailyCard[];
      const { data } = await sb
        .from("vault_records")
        .select("id,vault_id,title,status,due_at,module_id,updated_at")
        .in(
          "vault_id",
          vaults.map((v) => v.id),
        )
        .is("archived_at", null)
        .not("due_at", "is", null)
        .lte("due_at", new Date(Date.now() + 7 * DAY).toISOString())
        .order("due_at", { ascending: true })
        .limit(20);
      const rows: DailyCard[] = ((data ?? []) as any[])
        .filter((r) => r.status !== "done" && r.status !== "complete" && r.status !== "completed")
        .map((r) => ({
          id: `vault:${r.id}`,
          title: r.title as string,
          source: "vault" as const,
          sourceLabel: vaultName.get(r.vault_id) ?? "Vault",
          href: `/vaults/${r.vault_id}`,
          vaultName: vaultName.get(r.vault_id) ?? "Vault",
          dueAt: r.due_at as string,
          priority: 2,
          score: scoreFor({ priority: 2, dueAt: r.due_at, updatedAt: r.updated_at }),
        }));
      return rows;
    }, [] as DailyCard[]);

    // ── Opportunities (Opportunity Center stays authoritative) ────────────────
    const opportunities = await safe(async () => {
      const { data } = await sb
        .from("builder_opportunities")
        .select("id,title,next_step,stage,target_date,updated_at")
        .eq("user_id", userId)
        .neq("stage", "closed")
        .order("updated_at", { ascending: false })
        .limit(6);
      const rows: DailyCard[] = ((data ?? []) as any[]).map((o) => ({
        id: `opp:${o.id}`,
        title: o.title as string,
        ...(o.next_step ? { detail: `Next step: ${o.next_step}` } : {}),
        source: "opportunity" as const,
        sourceLabel: "Opportunity Center",
        href: "/opportunity",
        ...(o.target_date ? { dueAt: new Date(o.target_date).toISOString() } : {}),
        priority: 2,
        score: scoreFor({ priority: 2, dueAt: o.target_date, updatedAt: o.updated_at }),
      }));
      return rows;
    }, [] as DailyCard[]);

    // ── Learning in progress (Academy stays authoritative) ────────────────────
    const learn = await safe(async () => {
      const { data } = await sb
        .from("builder_path_progress")
        .select("id,path_id,completed_lessons,completed_at,updated_at,is_primary")
        .eq("user_id", userId)
        .is("completed_at", null)
        .order("updated_at", { ascending: false })
        .limit(4);
      const rows: DailyCard[] = ((data ?? []) as any[]).map((p) => ({
        id: `path:${p.id}`,
        title: `Continue your Builder Path`,
        detail: `${(p.completed_lessons ?? []).length} lesson(s) finished so far`,
        source: "academy" as const,
        sourceLabel: "Academy",
        href: "/academy",
        priority: p.is_primary ? 2 : 3,
        score: scoreFor({ priority: p.is_primary ? 2 : 3, updatedAt: p.updated_at }),
      }));
      return rows;
    }, [] as DailyCard[]);

    // ── Money: only real recorded entries produce a Money Move ────────────────
    const moneyMoves = await safe(async () => {
      const workMoney = workCards.filter((c) => c.source === "money");
      const { data } = await sb
        .from("builder_finance_entries")
        .select("id,label,entry_type,occurred_on")
        .eq("user_id", userId)
        .order("occurred_on", { ascending: false })
        .limit(1);
      const hasFinance = (data ?? []).length > 0;
      if (!hasFinance) return workMoney;
      return [
        ...workMoney,
        {
          id: "money:review",
          title: "Review this week's money in the Financial Center",
          detail: "Based on the entries you have actually recorded.",
          source: "money" as const,
          sourceLabel: "Financial Center",
          href: "/financial-center",
          priority: 2,
          score: 30,
        },
      ];
    }, [] as DailyCard[]);

    // ── Frass Hill: real unread notifications only ────────────────────────────
    const frassHill = await safe(async () => {
      const { data } = await sb
        .from("notifications")
        .select("id,title,body,url,created_at")
        .eq("user_id", userId)
        .is("read_at", null)
        .order("created_at", { ascending: false })
        .limit(5);
      const rows: DailyCard[] = ((data ?? []) as any[]).map((n) => ({
        id: `note:${n.id}`,
        title: n.title as string,
        ...(n.body ? { detail: n.body as string } : {}),
        source: "frass-hill" as const,
        sourceLabel: "Frass Hill",
        ...(n.url ? { href: n.url as string } : { href: "/notifications" }),
        priority: 3,
        score: 5,
      }));
      return rows;
    }, [] as DailyCard[]);

    // ── Compose. TODAY is deliberately small. ─────────────────────────────────
    const candidates: DailyCard[] = [...workCards, ...vaultCards].sort((a, b) => b.score - a.score);
    const today = candidates.slice(0, 3);
    const todayIds = new Set(today.map((c) => c.id));
    const continueWork = candidates.filter((c) => !todayIds.has(c.id)).slice(0, 8);
    const schedule: DailyCard[] = [...workCards, ...vaultCards]
      .filter((c) => c.dueAt || c.scheduledFor)
      .sort((a, b) => (a.dueAt ?? a.scheduledFor ?? "").localeCompare(b.dueAt ?? b.scheduledFor ?? ""))
      .slice(0, 8);

    void nowIso;

    return {
      today,
      continueWork,
      schedule,
      moneyMoves,
      opportunities,
      learn,
      frassHill,
      doneToday,
      summary: {
        activeWork: workCards.length,
        overdue,
        dueToday,
        completedToday: doneToday.length,
        vaults: vaults.length,
        hasAnything:
          today.length + continueWork.length + schedule.length + moneyMoves.length +
            opportunities.length + learn.length + frassHill.length + doneToday.length >
          0,
      },
    };
  });
