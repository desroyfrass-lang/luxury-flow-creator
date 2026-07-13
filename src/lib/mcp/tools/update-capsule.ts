import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser, unauth, requireAdmin } from "../_helpers";

export default defineTool({
  name: "update_capsule",
  title: "Update capsule",
  description: "Update editable fields on a Frass capsule (name, description, style, gender, occasion, season).",
  inputSchema: {
    handle: z.string().min(1).describe("Capsule handle (URL slug)."),
    name: z.string().optional(),
    description: z.string().optional(),
    style: z.string().optional(),
    gender: z.string().optional(),
    occasion: z.string().optional(),
    season: z.string().optional(),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true },
  handler: async ({ handle, ...rest }, ctx) => {
    if (!ctx.isAuthenticated()) return unauth();
    const sb = supabaseForUser(ctx);
    const admin = await requireAdmin(ctx, sb);
    if (!admin.ok) return { content: [{ type: "text", text: admin.err }], isError: true };
    const patch: Record<string, string> = {};
    for (const [k, v] of Object.entries(rest)) if (typeof v === "string") patch[k] = v;
    if (Object.keys(patch).length === 0) {
      return { content: [{ type: "text", text: "No fields to update." }], isError: true };
    }
    const { data, error } = await sb
      .from("capsules")
      .update(patch)
      .eq("handle", handle)
      .select()
      .single();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: `Updated capsule "${handle}".` }],
      structuredContent: { row: data },
    };
  },
});
