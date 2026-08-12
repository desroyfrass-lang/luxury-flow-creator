// FRASS-0499 — one agreement engine. Acceptance is recorded server-side only.
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { AGREEMENTS, type AgreementLevel } from "./agreements";

export type AcceptanceRow = {
  level: AgreementLevel;
  version: string;
  accepted_at: string;
};

type Sb = { from: (t: string) => any };

export const listMyAgreements = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AcceptanceRow[]> => {
    const sb = context.supabase as unknown as Sb;
    const { data, error } = await sb
      .from("agreement_acceptances")
      .select("level, version, accepted_at")
      .eq("user_id", context.userId)
      .order("accepted_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as AcceptanceRow[];
  });

export const acceptAgreement = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { level: AgreementLevel }) => {
    if (input?.level !== "visitor" && input?.level !== "builder") {
      throw new Error("Unknown agreement.");
    }
    return { level: input.level };
  })
  .handler(async ({ data, context }): Promise<AcceptanceRow> => {
    const sb = context.supabase as unknown as Sb;
    // The version is decided by the server, never by the browser.
    const version = AGREEMENTS[data.level].version;
    const { error } = await sb
      .from("agreement_acceptances")
      .upsert(
        { user_id: context.userId, level: data.level, version },
        { onConflict: "user_id,level,version", ignoreDuplicates: true },
      );
    if (error) throw new Error(error.message);
    return { level: data.level, version, accepted_at: new Date().toISOString() };
  });
