// FRASS-0532-B — Member Success Blueprints, read and written through the
// member's own authenticated session. RLS decides who may see what; the server
// never trusts a client-supplied identity (FRASS-0530).
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { MemberBlueprint } from "./member-blueprint";

const upsertSchema = z.object({
  id: z.string().uuid().nullable().default(null),
  member_name: z.string().min(1).max(120),
  relationship: z.string().max(120).nullable().default(null),
  blueprint_kind: z.enum(["entrepreneurial", "knowledge-economy", "tradesperson"]),
  financial_urgency: z.string().max(600).nullable().default(null),
  long_term_vision: z.string().max(600).nullable().default(null),
  strengths: z.array(z.string().max(120)).max(20).default([]),
  technology_comfort: z.enum(["low", "moderate", "high"]).default("moderate"),
  communication_style: z.string().max(400).nullable().default(null),
  daily_priorities: z.array(z.string().max(160)).max(20).default([]),
  money_moves_philosophy: z.string().max(600).nullable().default(null),
  business_vaults: z.array(z.string().max(80)).max(20).default([]),
  learning_style: z.string().max(400).nullable().default(null),
  motivation_style: z.string().max(400).nullable().default(null),
  simplified_view: z.boolean().default(false),
  accessibility_notes: z.string().max(600).nullable().default(null),
  online_first: z.boolean().default(true),
  avoid: z.array(z.string().max(120)).max(20).default([]),
  hours_per_day: z.number().min(0).max(24).nullable().default(null),
  status: z.enum(["draft", "active", "archived"]).default("draft"),
  notes: z.string().max(2000).nullable().default(null),
  /** Founder only: attach the Blueprint to another member's account. */
  user_id: z.string().uuid().nullable().default(null),
});

export type BlueprintInput = z.infer<typeof upsertSchema>;

export const listMemberBlueprints = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<MemberBlueprint[]> => {
    const { data, error } = await context.supabase
      .from("member_success_blueprints")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    return (data ?? []) as MemberBlueprint[];
  });

export const saveMemberBlueprint = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => upsertSchema.parse(data))
  .handler(async ({ data, context }): Promise<MemberBlueprint> => {
    const { id, user_id, ...fields } = data;
    const sb = context.supabase;

    if (id) {
      const { data: row, error } = await sb
        .from("member_success_blueprints")
        .update(fields)
        .eq("id", id)
        .select("*")
        .single();
      if (error) throw new Error(error.message);
      return row as MemberBlueprint;
    }

    // A member always owns the Blueprint they create for themselves. Attaching
    // one to somebody else is a Founder action, and RLS enforces that.
    const { data: row, error } = await sb
      .from("member_success_blueprints")
      .insert({
        ...fields,
        created_by: context.userId,
        user_id: user_id ?? context.userId,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row as MemberBlueprint;
  });

export const deleteMemberBlueprint = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("member_success_blueprints")
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
