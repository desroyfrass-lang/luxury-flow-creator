import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser, unauth, requireAdmin } from "../_helpers";

export default defineTool({
  name: "get_capsule",
  title: "Get capsule",
  description: "Get one capsule with its items (products and slots).",
  inputSchema: {
    handle: z.string().min(1).describe("Capsule handle (URL slug)."),
  },
  annotations: { readOnlyHint: true, openWorldHint: false },
  handler: async ({ handle }, ctx) => {
    if (!ctx.isAuthenticated()) return unauth();
    const sb = supabaseForUser(ctx);
    const admin = await requireAdmin(ctx, sb);
    if (!admin.ok) return { content: [{ type: "text", text: admin.err }], isError: true };
    const { data: capsule, error } = await sb
      .from("capsules")
      .select("*, capsule_items(id, product_id, variant_id, slot, position, required)")
      .eq("handle", handle)
      .maybeSingle();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    if (!capsule) return { content: [{ type: "text", text: `No capsule "${handle}".` }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(capsule, null, 2) }],
      structuredContent: { capsule },
    };
  },
});
