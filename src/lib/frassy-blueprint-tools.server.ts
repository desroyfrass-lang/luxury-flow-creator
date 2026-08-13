// FRASS-0532-B — Frassy writes and reads Member Success Blueprints.
//
// This is the tool that ends "spec → engineering" for personalization. When the
// Founder says "create a Daily for my father" or "Kanko has more time this
// week", Frassy updates the Blueprint — configuration, not code.
//
// Zero Trust (FRASS-0530): every call runs through the caller's own Supabase
// session, so row-level security decides what may be read or written. No token,
// no tools.
import { tool } from "ai";
import { z } from "zod";

export type BlueprintToolContext = { accessToken?: string | null };

async function clientFor(token: string) {
  const { createClient } = await import("@supabase/supabase-js");
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

const fields = {
  member_name: z.string().describe("Who this Blueprint is for."),
  relationship: z.string().nullable().default(null).describe("e.g. 'my father', 'partner'."),
  blueprint_kind: z
    .enum(["entrepreneurial", "knowledge-economy", "tradesperson"])
    .default("entrepreneurial")
    .describe("Which founding blueprint this person inherits. Never invent a new one."),
  financial_urgency: z.string().nullable().default(null),
  long_term_vision: z.string().nullable().default(null),
  strengths: z.array(z.string()).default([]),
  technology_comfort: z.enum(["low", "moderate", "high"]).default("moderate"),
  communication_style: z.string().nullable().default(null),
  daily_priorities: z.array(z.string()).default([]),
  money_moves_philosophy: z.string().nullable().default(null),
  business_vaults: z.array(z.string()).default([]),
  learning_style: z.string().nullable().default(null),
  motivation_style: z.string().nullable().default(null),
  simplified_view: z.boolean().default(false),
  accessibility_notes: z.string().nullable().default(null),
  online_first: z
    .boolean()
    .default(true)
    .describe("FRASS-0532-A. Only false when the member has asked for hands-on or local work."),
  avoid: z.array(z.string()).default([]),
  hours_per_day: z.number().nullable().default(null),
  status: z.enum(["draft", "active", "archived"]).default("draft"),
  notes: z.string().nullable().default(null),
};

export function buildBlueprintTools(ctx: BlueprintToolContext = {}) {
  const token = ctx.accessToken ?? "";
  const NO_SESSION = {
    error:
      "Blueprints need a signed-in member. Ask them to sign in, then try again.",
  } as const;

  const listBlueprints = tool({
    description:
      "MEMBER SUCCESS BLUEPRINTS (FRASS-0532-B). List the Blueprints you are allowed to see, with what is still missing from each. Use before answering any question about how a member's Daily, Money Moves or pace is set up.",
    inputSchema: z.object({
      name: z.string().nullable().default(null).describe("Filter by member name. Null for all."),
    }),
    execute: async ({ name }) => {
      if (!token) return NO_SESSION;
      const sb = await clientFor(token);
      let q = sb.from("member_success_blueprints").select("*").order("updated_at", { ascending: false });
      if (name) q = q.ilike("member_name", `%${name}%`);
      const { data, error } = await q.limit(50);
      if (error) return { error: error.message };
      const { blueprintGaps, blueprintCompleteness } = await import(
        "@/lib/blueprints/member-blueprint"
      );
      return {
        blueprints: (data ?? []).map((b: any) => ({
          ...b,
          still_missing: blueprintGaps(b),
          completeness: blueprintCompleteness(b),
        })),
      };
    },
  });

  const saveBlueprint = tool({
    description:
      "CREATE OR UPDATE a Member Success Blueprint (FRASS-0532-B). This is how a member's whole experience is personalized — Daily sections, Money Moves order, pace, tone, view mode — WITHOUT engineering. Use it when asked to create a Daily for someone, change their priorities, adjust their available hours, or record who they are. Pass an id to update; omit it to create. Always confirm the change back in plain English.",
    inputSchema: z.object({
      id: z.string().nullable().default(null).describe("Existing Blueprint id, or null to create."),
      ...fields,
    }),
    execute: async ({ id, ...body }) => {
      if (!token) return NO_SESSION;
      const sb = await clientFor(token);
      if (id) {
        const { data, error } = await sb
          .from("member_success_blueprints")
          .update(body)
          .eq("id", id)
          .select("*")
          .single();
        if (error) return { error: error.message };
        return { saved: data, action: "updated" };
      }
      const { data: claims } = await sb.auth.getClaims(token);
      const uid = claims?.claims?.sub;
      if (!uid) return { error: "No verified session." };
      const { data, error } = await sb
        .from("member_success_blueprints")
        .insert({ ...body, created_by: uid, user_id: uid })
        .select("*")
        .single();
      if (error) return { error: error.message };
      return { saved: data, action: "created" };
    },
  });

  const blueprintGuide = tool({
    description:
      "What a Member Success Blueprint contains and the rules it can never break. Use when someone asks how personalization works in Frass, or before writing a Blueprint for a new partner.",
    inputSchema: z.object({}),
    execute: async () => {
      const { BLUEPRINT_FIELDS, BLUEPRINT_KINDS, BLUEPRINT_INVARIANTS } = await import(
        "@/lib/blueprints/member-blueprint"
      );
      return { fields: BLUEPRINT_FIELDS, foundations: BLUEPRINT_KINDS, rules: BLUEPRINT_INVARIANTS };
    },
  });

  return {
    list_member_blueprints: listBlueprints,
    save_member_blueprint: saveBlueprint,
    member_blueprint_guide: blueprintGuide,
  };
}
