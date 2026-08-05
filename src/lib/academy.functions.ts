import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type PathProgress = {
  id: string;
  path_id: string;
  completed_lessons: string[];
  reflection: string | null;
  is_primary: boolean;
  lesson_notes: Record<string, string>;
  started_at: string;
  completed_at: string | null;
};

export type LearningEvent = {
  id: string;
  kind: string;
  path_id: string | null;
  lesson_id: string | null;
  title: string;
  detail: string | null;
  skills: string[];
  artifact_url: string | null;
  created_at: string;
};

export type AcademyDashboard = {
  progress: PathProgress[];
  timeline: LearningEvent[];
  /** Everything Frassy knows about this Builder, flattened for path matching. */
  signalText: string;
  streakDays: number;
  activeProjects: { id: string; title: string; status: string }[];
};

function dayKey(iso: string) {
  return new Date(iso).toISOString().slice(0, 10);
}

function computeStreak(events: { created_at: string }[]) {
  const days = new Set(events.map((e) => dayKey(e.created_at)));
  if (days.size === 0) return 0;
  const today = new Date();
  const todayKey = today.toISOString().slice(0, 10);
  const cursor = new Date(today);
  if (!days.has(todayKey)) {
    cursor.setUTCDate(cursor.getUTCDate() - 1);
    if (!days.has(cursor.toISOString().slice(0, 10))) return 0;
  }
  let streak = 0;
  for (;;) {
    if (!days.has(cursor.toISOString().slice(0, 10))) break;
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return streak;
}

export const getAcademyDashboard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AcademyDashboard> => {
    const sb = context.supabase as unknown as { from: (t: string) => any };
    const uid = context.userId;

    const [progressRes, timelineRes, memoryRes, profileRes, productsRes] = await Promise.all([
      sb.from("builder_path_progress").select("*").eq("user_id", uid),
      sb
        .from("builder_learning_events")
        .select("*")
        .eq("user_id", uid)
        .order("created_at", { ascending: false })
        .limit(60),
      sb.from("builder_memory").select("category,key,value").eq("user_id", uid).limit(80),
      sb
        .from("profiles")
        .select("bio,builder_stage,style_preferences,favorite_categories,preferences")
        .eq("id", uid)
        .maybeSingle(),
      sb
        .from("builder_products")
        .select("id,title,status")
        .eq("user_id", uid)
        .order("updated_at", { ascending: false })
        .limit(5),
    ]);

    if (progressRes.error) throw new Error(progressRes.error.message);

    const memory = (memoryRes.data ?? []) as { key: string; value: string }[];
    const profile = profileRes.data ?? {};
    const signalText = [
      ...memory.map((m) => `${m.key} ${m.value}`),
      profile.bio ?? "",
      profile.builder_stage ?? "",
      (profile.style_preferences ?? []).join(" "),
      (profile.favorite_categories ?? []).join(" "),
      JSON.stringify(profile.preferences ?? {}),
    ].join(" ");

    const timeline = ((timelineRes.data ?? []) as LearningEvent[]) ?? [];

    return {
      progress: ((progressRes.data ?? []) as PathProgress[]).map((p) => ({
        ...p,
        completed_lessons: p.completed_lessons ?? [],
        lesson_notes: (p.lesson_notes ?? {}) as Record<string, string>,
      })),
      timeline,
      signalText,
      streakDays: computeStreak(timeline),
      activeProjects: (productsRes.data ?? []) as { id: string; title: string; status: string }[],
    };
  });

export const startPath = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { path_id: string; path_name: string; makePrimary?: boolean }) => {
    const id = (input.path_id ?? "").trim();
    if (!id) throw new Error("Pick a path to start.");
    return {
      path_id: id,
      path_name: (input.path_name ?? id).slice(0, 120),
      makePrimary: input.makePrimary !== false,
    };
  })
  .handler(async ({ data, context }) => {
    const sb = context.supabase as unknown as { from: (t: string) => any };
    if (data.makePrimary) {
      await sb.from("builder_path_progress").update({ is_primary: false }).eq("user_id", context.userId);
    }
    const { error } = await sb.from("builder_path_progress").upsert(
      { user_id: context.userId, path_id: data.path_id, is_primary: data.makePrimary },
      { onConflict: "user_id,path_id" },
    );
    if (error) throw new Error(error.message);

    await sb.from("builder_learning_events").insert({
      user_id: context.userId,
      kind: "path_started",
      path_id: data.path_id,
      title: `Started the ${data.path_name}`,
    });
    return { ok: true };
  });

export const setPrimaryPath = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { path_id: string }) => ({ path_id: input.path_id }))
  .handler(async ({ data, context }) => {
    const sb = context.supabase as unknown as { from: (t: string) => any };
    await sb.from("builder_path_progress").update({ is_primary: false }).eq("user_id", context.userId);
    const { error } = await sb
      .from("builder_path_progress")
      .update({ is_primary: true })
      .eq("user_id", context.userId)
      .eq("path_id", data.path_id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const toggleLesson = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      path_id: string;
      path_name: string;
      lesson_id: string;
      lesson_title: string;
      skill: string;
      produces: string;
      total_lessons: number;
    }) => input,
  )
  .handler(async ({ data, context }) => {
    const sb = context.supabase as unknown as { from: (t: string) => any };
    const { data: existing, error: readError } = await sb
      .from("builder_path_progress")
      .select("*")
      .eq("user_id", context.userId)
      .eq("path_id", data.path_id)
      .maybeSingle();
    if (readError) throw new Error(readError.message);

    const current: string[] = existing?.completed_lessons ?? [];
    const adding = !current.includes(data.lesson_id);
    const next = adding
      ? [...current, data.lesson_id]
      : current.filter((l: string) => l !== data.lesson_id);
    const wasComplete = Boolean(existing?.completed_at);
    const nowComplete = next.length >= data.total_lessons;
    const completedAt = nowComplete ? existing?.completed_at ?? new Date().toISOString() : null;

    const { error } = await sb.from("builder_path_progress").upsert(
      {
        user_id: context.userId,
        path_id: data.path_id,
        completed_lessons: next,
        completed_at: completedAt,
      },
      { onConflict: "user_id,path_id" },
    );
    if (error) throw new Error(error.message);

    const events: Record<string, unknown>[] = [];
    if (adding) {
      events.push({
        user_id: context.userId,
        kind: "lesson",
        path_id: data.path_id,
        lesson_id: data.lesson_id,
        title: data.lesson_title,
        detail: data.produces,
        skills: data.skill ? [data.skill] : [],
      });
    }
    if (nowComplete && !wasComplete) {
      events.push({
        user_id: context.userId,
        kind: "certificate",
        path_id: data.path_id,
        title: `Completed the ${data.path_name}`,
        detail: "Builder Path certificate earned.",
      });
    }
    if (events.length) await sb.from("builder_learning_events").insert(events);

    return {
      completed_lessons: next,
      completed_at: completedAt,
      justCompleted: nowComplete && !wasComplete,
    };
  });

export const saveReflection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { path_id: string; reflection: string }) => ({
    path_id: input.path_id,
    reflection: (input.reflection ?? "").trim().slice(0, 4000) || null,
  }))
  .handler(async ({ data, context }) => {
    const sb = context.supabase as unknown as { from: (t: string) => any };
    const { error } = await sb.from("builder_path_progress").upsert(
      { user_id: context.userId, path_id: data.path_id, reflection: data.reflection },
      { onConflict: "user_id,path_id" },
    );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Saves the thing a lesson produced into the Builder Vault and the timeline. */
export const recordArtifact = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      path_id: string;
      lesson_id: string;
      title: string;
      body: string;
      skill: string;
      collection: string;
    }) => {
      const body = (input.body ?? "").trim();
      if (!body) throw new Error("Write what you made before you file it.");
      return {
        path_id: input.path_id,
        lesson_id: input.lesson_id,
        title: (input.title ?? "Academy work").slice(0, 200),
        body: body.slice(0, 8000),
        skill: input.skill ?? "",
        collection: (input.collection ?? "Academy").slice(0, 120),
      };
    },
  )
  .handler(async ({ data, context }) => {
    const sb = context.supabase as unknown as { from: (t: string) => any };
    const { error: vaultError } = await sb.from("vault_items").insert({
      user_id: context.userId,
      title: data.title,
      kind: "lesson",
      body: data.body,
      collection: data.collection,
      tags: ["academy", data.path_id].filter(Boolean),
    });
    if (vaultError) throw new Error(vaultError.message);

    await sb.from("builder_learning_events").insert({
      user_id: context.userId,
      kind: "project",
      path_id: data.path_id,
      lesson_id: data.lesson_id,
      title: data.title,
      detail: "Filed in the Builder Vault.",
      skills: data.skill ? [data.skill] : [],
    });
    return { ok: true };
  });
