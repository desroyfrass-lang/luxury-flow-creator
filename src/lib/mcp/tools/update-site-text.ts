import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser, unauth, requireAdmin } from "../_helpers";

export default defineTool({
  name: "update_site_text",
  title: "Update site text",
  description: "Update (or insert) a text slot on the Frass site by slot_key.",
  inputSchema: {
    slot_key: z.string().min(1).describe("The slot key to update, e.g. 'home.hero.title'."),
    value: z.string().describe("New text value for the slot."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true },
  handler: async ({ slot_key, value }, ctx) => {
    if (!ctx.isAuthenticated()) return unauth();
    const sb = supabaseForUser(ctx);
    const admin = await requireAdmin(ctx, sb);
    if (!admin.ok) return { content: [{ type: "text", text: admin.err }], isError: true };
    const { data, error } = await sb
      .from("site_text")
      .upsert({ slot_key, value, updated_at: new Date().toISOString() }, { onConflict: "slot_key" })
      .select()
      .single();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: `Updated "${slot_key}".` }],
      structuredContent: { row: data },
    };
  },
});
