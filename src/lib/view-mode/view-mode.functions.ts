// FRASS-0517 — Simplified View Mode.
// The member's preferred way of seeing Frass, remembered across the platform.
// Presentation only: both views reach the same data, workflows and capability.

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type ViewMode = "standard" | "simplified";

export const getViewMode = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("profiles")
      .select("view_mode")
      .eq("id", context.userId)
      .maybeSingle();
    const mode = (data?.view_mode as ViewMode | undefined) ?? "standard";
    return { mode };
  });

export const setViewMode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ mode: z.enum(["standard", "simplified"]) }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("profiles")
      .update({ view_mode: data.mode })
      .eq("id", context.userId);
    if (error) throw error;
    return { mode: data.mode };
  });
