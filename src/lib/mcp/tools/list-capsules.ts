import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser, unauth, requireAdmin } from "../_helpers";

export default defineTool({
  name: "list_capsules",
  title: "List capsules",
  description: "List Frass capsules with their handle, name, and metadata.",
  inputSchema: {
    search: z.string().optional().describe("Optional substring to filter by name or handle."),
  },
  annotations: { readOnlyHint: true, openWorldHint: false },
  handler: async ({ search }, ctx) => {
    if (!ctx.isAuthenticated()) return unauth();
    const sb = supabaseForUser(ctx);
    const admin = await requireAdmin(ctx, sb);
    if (!admin.ok) return { content: [{ type: "text", text: admin.err }], isError: true };
    let q = sb.from("capsules").select("id, handle, name, description, style, gender, occasion, season").order("name");
    if (search) q = q.or(`name.ilike.%${search}%,handle.ilike.%${search}%`);
    const { data, error } = await q;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: { capsules: data },
    };
  },
});
