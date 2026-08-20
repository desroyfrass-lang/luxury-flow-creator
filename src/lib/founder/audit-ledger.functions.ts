// FRASS-0573 — Founder Audit Ledger server functions.
// Append-only by design; deletion is explicit and Founder-initiated.
// Every handler re-verifies the Founder role server-side (Zero Trust, FRASS-0530).
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type AuditLedgerRow = {
  id: string;
  card_key: string;
  card_number: number;
  card_title: string;
  card_path: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
};

export const listAuditLedger = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AuditLedgerRow[]> => {
    const role = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (role.data !== true) throw new Error("Founder access only.");
    const { data, error } = await context.supabase
      .from("founder_audit_ledger")
      .select("id, card_key, card_number, card_title, card_path, role, content, created_at")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: true })
      .limit(4000);
    if (error) throw new Error(error.message);
    return (data ?? []) as AuditLedgerRow[];
  });

export const appendAuditLedgerEntry = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z
      .object({
        cardKey: z.string().min(1).max(300),
        cardNumber: z.number().int().min(0).max(100000),
        cardTitle: z.string().max(300).default(""),
        cardPath: z.string().max(500).default(""),
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(20000),
        createdAt: z.string().max(60).optional(),
      })
      .parse(i),
  )
  .handler(async ({ data, context }): Promise<AuditLedgerRow> => {
    const role = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (role.data !== true) throw new Error("Founder access only.");
    const { data: row, error } = await context.supabase
      .from("founder_audit_ledger")
      .insert({
        user_id: context.userId,
        card_key: data.cardKey,
        card_number: data.cardNumber,
        card_title: data.cardTitle,
        card_path: data.cardPath,
        role: data.role,
        content: data.content,
        ...(data.createdAt ? { created_at: data.createdAt } : {}),
      })
      .select("id, card_key, card_number, card_title, card_path, role, content, created_at")
      .single();
    if (error) throw new Error(error.message);
    return row as AuditLedgerRow;
  });

export const deleteAuditLedgerEntry = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    const role = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (role.data !== true) throw new Error("Founder access only.");
    const { error } = await context.supabase
      .from("founder_audit_ledger")
      .delete()
      .eq("user_id", context.userId)
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
