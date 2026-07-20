import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

async function assertAdmin(supabase: any, userId: string) {
  const { data, error } = await supabase.rpc("has_role", {
    _user_id: userId,
    _role: "admin",
  });
  if (error) throw error;
  if (!data) throw new Error("Admin role required");
}

export type BriefingTask = {
  key: string;
  title: string;
  count: number;
  minutes: number;
  href: string;
};

export type DailyBriefing = {
  now: string;
  status: {
    ordersToday: number;
    ordersOvernight: number;
    revenueToday: number;
    revenue7d: number;
    pendingOrders: number;
    newCustomers24h: number;
    rewardsClaimedToday: number;
  };
  tasks: BriefingTask[];
  totalMinutes: number;
};

export const getDailyBriefing = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<DailyBriefing> => {
    const sb = context.supabase;
    await assertAdmin(sb, context.userId);

    const now = new Date();
    const startOfDay = new Date(now); startOfDay.setHours(0, 0, 0, 0);
    const overnight = new Date(now.getTime() - 12 * 3600_000).toISOString();
    const dayAgo = new Date(now.getTime() - 24 * 3600_000).toISOString();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 86400_000).toISOString();
    const startISO = startOfDay.toISOString();

    const [
      ordersToday,
      ordersOvernight,
      orders7d,
      pendingOrders,
      cjPending,
      capsulesAll,
      blogDrafts,
      viralsUncat,
      textEmpty,
      imagesEmpty,
      newProfiles,
      rewardsToday,
    ] = await Promise.all([
      sb.from("orders").select("total, status, created_at").gte("created_at", startISO),
      sb.from("orders").select("id", { count: "exact", head: true }).gte("created_at", overnight),
      sb.from("orders").select("total").gte("created_at", sevenDaysAgo),
      sb.from("orders").select("id", { count: "exact", head: true }).in("status", ["pending", "processing"]),
      sb.from("cj_import_queue").select("id", { count: "exact", head: true }).eq("status", "pending"),
      sb.from("capsules").select("id, description"),
      sb.from("blog_posts").select("id", { count: "exact", head: true }).or("published.is.false,published.is.null"),
      sb.from("viral_products").select("id", { count: "exact", head: true }).or("category.is.null,subcategory.is.null"),
      sb.from("site_text").select("id", { count: "exact", head: true }).or("value.is.null,value.eq."),
      sb.from("site_images").select("id", { count: "exact", head: true }).or("url.is.null,url.eq."),
      sb.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", dayAgo),
      sb.from("reward_coupons").select("id", { count: "exact", head: true }).gte("created_at", startISO),
    ]);

    const revenueToday = (ordersToday.data ?? []).reduce((s, o: any) => s + (Number(o.total) || 0), 0);
    const revenue7d = (orders7d.data ?? []).reduce((s, o: any) => s + (Number(o.total) || 0), 0);
    const capsulesMissing = (capsulesAll.data ?? []).filter((c: any) => !c.description || String(c.description).trim() === "").length;

    const mk = (key: string, title: string, count: number, secondsEach: number, href: string): BriefingTask => ({
      key, title, count, minutes: Math.max(count > 0 ? 1 : 0, Math.round((count * secondsEach) / 60)), href,
    });

    const tasks: BriefingTask[] = [
      mk("cj", "CJ products awaiting approval", cjPending.count ?? 0, 45, "/admin/cj-import"),
      mk("capsules", "Capsules missing description", capsulesMissing, 90, "/admin/capsules"),
      mk("blog", "Blog drafts unpublished", blogDrafts.count ?? 0, 120, "/admin/blog"),
      mk("virals", "Viral products uncategorized", viralsUncat.count ?? 0, 30, "/admin/virals"),
      mk("text", "Empty site text slots", textEmpty.count ?? 0, 30, "/admin/text"),
      mk("images", "Empty site image slots", imagesEmpty.count ?? 0, 45, "/admin/images"),
    ].filter((t) => t.count > 0);

    const totalMinutes = tasks.reduce((s, t) => s + t.minutes, 0);

    return {
      now: now.toISOString(),
      status: {
        ordersToday: ordersToday.data?.length ?? 0,
        ordersOvernight: ordersOvernight.count ?? 0,
        revenueToday: Number(revenueToday.toFixed(2)),
        revenue7d: Number(revenue7d.toFixed(2)),
        pendingOrders: pendingOrders.count ?? 0,
        newCustomers24h: newProfiles.count ?? 0,
        rewardsClaimedToday: rewardsToday.count ?? 0,
      },
      tasks,
      totalMinutes,
    };
  });

// ---------- Notes ----------

export type FrassyNote = {
  id: string;
  body: string;
  pinned: boolean;
  created_at: string;
};

export const listNotes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<FrassyNote[]> => {
    await assertAdmin(context.supabase, context.userId);
    const { data, error } = await context.supabase
      .from("frassy_notes")
      .select("id, body, pinned, created_at")
      .is("archived_at", null)
      .order("pinned", { ascending: false })
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as FrassyNote[];
  });

export const createNote = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { body: string; pinned?: boolean }) =>
    z.object({ body: z.string().trim().min(1).max(4000), pinned: z.boolean().optional() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { data: row, error } = await context.supabase
      .from("frassy_notes")
      .insert({ user_id: context.userId, body: data.body, pinned: data.pinned ?? false })
      .select("id, body, pinned, created_at")
      .single();
    if (error) throw error;
    return row as FrassyNote;
  });

export const toggleNotePin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; pinned: boolean }) =>
    z.object({ id: z.string().uuid(), pinned: z.boolean() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error } = await context.supabase
      .from("frassy_notes")
      .update({ pinned: data.pinned })
      .eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

export const archiveNote = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error } = await context.supabase
      .from("frassy_notes")
      .update({ archived_at: new Date().toISOString() })
      .eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });
