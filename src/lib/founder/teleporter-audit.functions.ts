// FRASS-0570A — Founder-only server functions for World Teleporter audit progress.
// Every handler re-verifies the Founder role server-side (Zero Trust, FRASS-0530).
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type TeleporterAuditRow = {
  card_key: string;
  card_number: number;
  status: string;
  note: string;
  updated_at: string;
};

const statusSchema = z.enum([
  "not_reviewed",
  "in_progress",
  "reviewed",
  "consolidated",
  "retired",
]);

export const listTeleporterAudit = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<TeleporterAuditRow[]> => {
    const role = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (role.data !== true) throw new Error("Founder access only.");
    const { data, error } = await context.supabase
      .from("teleporter_audit")
      .select("card_key, card_number, status, note, updated_at")
      .eq("user_id", context.userId)
      .order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as TeleporterAuditRow[];
  });

export const saveTeleporterAudit = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z
      .object({
        cardKey: z.string().min(1).max(300),
        cardNumber: z.number().int().min(0).max(100000),
        status: statusSchema,
        note: z.string().max(500).default(""),
      })
      .parse(i),
  )
  .handler(async ({ data, context }): Promise<TeleporterAuditRow> => {
    const role = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (role.data !== true) throw new Error("Founder access only.");
    const { data: row, error } = await context.supabase
      .from("teleporter_audit")
      .upsert(
        {
          user_id: context.userId,
          card_key: data.cardKey,
          card_number: data.cardNumber,
          status: data.status,
          note: data.note,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,card_key" },
      )
      .select("card_key, card_number, status, note, updated_at")
      .single();
    if (error) throw new Error(error.message);
    return row as TeleporterAuditRow;
  });
