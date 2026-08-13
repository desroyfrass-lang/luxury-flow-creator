// FRASS-0518-A — Founder-only Constitution Health.
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { IntelligenceIncident } from "@/lib/repair/intelligence";
import type { ConstitutionHealth } from "./effectiveness";

export const constitutionHealth = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ConstitutionHealth> => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Forbidden");

    const { data, error } = await context.supabase
      .from("repair_incidents")
      .select(
        "id, category, severity, status, context_path, reported_text, root_cause, created_at, pattern_signature, resolution_mode, amendment_ref, evidence",
      )
      .order("created_at", { ascending: false })
      .limit(1000);
    if (error) throw error;

    const { reviewConstitution } = await import("./effectiveness");
    return reviewConstitution((data ?? []) as unknown as IntelligenceIncident[]);
  });
