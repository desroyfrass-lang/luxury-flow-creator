import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type PathProgress = {
  id: string;
  path_id: string;
  completed_lessons: string[];
  reflection: string | null;
  started_at: string;
  completed_at: string | null;
};

export const listPathProgress = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<PathProgress[]> => {
    const sb = context.supabase as unknown as { from: (t: string) => any };
    const { data, error } = await sb
      .from("builder_path_progress")
      .select("*")
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return (data ?? []) as PathProgress[];
  });

export const startPath = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { path_id: string }) => {
    const id = (input.path_id ?? "").trim();
    if (!id) throw new Error("Pick a path to start.");
    return { path_id: id };
  })
  .handler(async ({ data, context }): Promise<PathProgress> => {
    const sb = context.supabase as unknown as { from: (t: string) => any };
    const { data: row, error } = await sb
      .from("builder_path_progress")
      .upsert(
        { user_id: context.userId, path_id: data.path_id },
        { onConflict: "user_id,path_id", ignoreDuplicates: false },
      )
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row as PathProgress;
  });

export const toggleLesson = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { path_id: string; lesson_id: string; total_lessons: number }) => input)
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
    const next = current.includes(data.lesson_id)
      ? current.filter((l: string) => l !== data.lesson_id)
      : [...current, data.lesson_id];
    const completedAt = next.length >= data.total_lessons ? new Date().toISOString() : null;

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
    return { completed_lessons: next, completed_at: completedAt };
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
