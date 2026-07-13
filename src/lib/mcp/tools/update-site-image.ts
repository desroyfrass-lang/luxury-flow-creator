import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser, unauth, requireAdmin } from "../_helpers";

export default defineTool({
  name: "update_site_image",
  title: "Update site image",
  description:
    "Point a site image slot at a new URL (and optional alt text). The image must already be hosted at an accessible URL.",
  inputSchema: {
    slot_key: z.string().min(1).describe("Image slot key, e.g. 'home.hero.background'."),
    url: z.string().url().describe("Publicly accessible image URL."),
    alt: z.string().optional().describe("Alt text for accessibility."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true },
  handler: async ({ slot_key, url, alt }, ctx) => {
    if (!ctx.isAuthenticated()) return unauth();
    const sb = supabaseForUser(ctx);
    const admin = await requireAdmin(ctx, sb);
    if (!admin.ok) return { content: [{ type: "text", text: admin.err }], isError: true };
    const { data, error } = await sb
      .from("site_images")
      .upsert(
        { slot_key, url, alt: alt ?? null, updated_at: new Date().toISOString() },
        { onConflict: "slot_key" },
      )
      .select()
      .single();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: `Updated image "${slot_key}".` }],
      structuredContent: { row: data },
    };
  },
});
