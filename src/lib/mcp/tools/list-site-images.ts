import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser, unauth, requireAdmin } from "../_helpers";

export default defineTool({
  name: "list_site_images",
  title: "List site images",
  description: "List image slots on the Frass site (slot key, URL, alt text).",
  inputSchema: {
    search: z.string().optional().describe("Optional substring to filter slot keys."),
  },
  annotations: { readOnlyHint: true, openWorldHint: false },
  handler: async ({ search }, ctx) => {
    if (!ctx.isAuthenticated()) return unauth();
    const sb = supabaseForUser(ctx);
    const admin = await requireAdmin(ctx, sb);
    if (!admin.ok) return { content: [{ type: "text", text: admin.err }], isError: true };
    let q = sb.from("site_images").select("slot_key, url, alt, updated_at").order("slot_key");
    if (search) q = q.ilike("slot_key", `%${search}%`);
    const { data, error } = await q;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: { items: data },
    };
  },
});
