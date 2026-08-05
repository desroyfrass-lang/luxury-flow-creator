import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type HallMemory = { category: string; key: string; value: string };

export type WelcomeHallState = {
  displayName: string | null;
  handle: string | null;
  /** "not_started" | "in_progress" | "complete" */
  journeyStatus: string;
  currentStage: string;
  completedStages: number;
  totalRemembered: number;
  lastActiveAt: string | null;
  memory: HallMemory[];
};

/** Everything the Welcome Hall reflects back to a Builder on arrival. */
export const getWelcomeHall = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<WelcomeHallState> => {
    const sb = context.supabase as unknown as { from: (t: string) => any };
    const userId = context.userId;

    const [journeyRes, profileRes, memoryRes] = await Promise.all([
      sb
        .from("builder_journeys")
        .select("status, current_stage, stage_progress, last_active_at")
        .eq("user_id", userId)
        .maybeSingle(),
      sb
        .from("profiles")
        .select("display_name, full_name, handle")
        .eq("id", userId)
        .maybeSingle(),
      sb
        .from("builder_memory")
        .select("category, key, value")
        .eq("user_id", userId)
        .order("created_at", { ascending: true }),
    ]);

    const journey = journeyRes.data as
      | {
          status?: string;
          current_stage?: string;
          stage_progress?: Record<string, unknown> | null;
          last_active_at?: string | null;
        }
      | null;
    const profile = profileRes.data as
      | { display_name?: string | null; full_name?: string | null; handle?: string | null }
      | null;
    const memory = (memoryRes.data ?? []) as HallMemory[];

    return {
      displayName: profile?.display_name ?? profile?.full_name ?? null,
      handle: profile?.handle ?? null,
      journeyStatus: journey?.status ?? "not_started",
      currentStage: journey?.current_stage ?? "mission",
      completedStages: Object.keys(journey?.stage_progress ?? {}).length,
      totalRemembered: memory.length,
      lastActiveAt: journey?.last_active_at ?? null,
      memory,
    };
  });
