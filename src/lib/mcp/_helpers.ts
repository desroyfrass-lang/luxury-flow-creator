import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { ToolContext } from "@lovable.dev/mcp-js";

export function supabaseForUser(ctx: ToolContext): SupabaseClient {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function unauth() {
  return { content: [{ type: "text" as const, text: "Not authenticated" }], isError: true };
}

export async function requireAdmin(ctx: ToolContext, sb: SupabaseClient) {
  const { data, error } = await sb.rpc("has_role", { _user_id: ctx.getUserId(), _role: "admin" });
  if (error) return { ok: false, err: error.message };
  if (!data) return { ok: false, err: "Admin role required" };
  return { ok: true as const };
}
