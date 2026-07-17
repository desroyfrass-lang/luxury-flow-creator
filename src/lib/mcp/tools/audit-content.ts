import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser, unauth, requireAdmin } from "../_helpers";

export default defineTool({
  name: "audit_content",
  title: "Audit site content",
  description:
    "Read-only review of site text slots, site images, capsules, and blog posts. Flags empty slots, missing images, unpublished capsules, and stale content.",
  inputSchema: {
    staleDays: z
      .number()
      .int()
      .min(1)
      .max(730)
      .optional()
      .describe("Content not updated in this many days is flagged as stale. Default 90."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ staleDays }, ctx) => {
    if (!ctx.isAuthenticated()) return unauth();
    const sb = supabaseForUser(ctx);
    const admin = await requireAdmin(ctx, sb);
    if (!admin.ok) return { content: [{ type: "text", text: admin.err }], isError: true };

    const stale = staleDays ?? 90;
    const staleCutoff = new Date(Date.now() - stale * 86400_000).toISOString();

    const [text, images, capsules, blog] = await Promise.all([
      sb.from("site_text").select("slot_key, value, updated_at"),
      sb.from("site_images").select("slot_key, url, updated_at"),
      sb.from("capsules").select("id, handle, title, status, updated_at"),
      sb.from("blog_posts").select("id, slug, title, status, updated_at"),
    ]);

    const err = [text, images, capsules, blog].find((r) => r.error)?.error;
    if (err) return { content: [{ type: "text", text: err.message }], isError: true };

    const textRows = text.data ?? [];
    const imageRows = images.data ?? [];
    const capsuleRows = capsules.data ?? [];
    const blogRows = blog.data ?? [];

    const emptyText = textRows.filter((t) => !t.value || t.value.trim() === "");
    const missingImages = imageRows.filter((i) => !i.url);
    const staleText = textRows.filter((t) => t.updated_at && t.updated_at < staleCutoff);
    const draftCapsules = capsuleRows.filter((c) => c.status !== "published" && c.status !== "active");
    const draftBlog = blogRows.filter((b) => b.status !== "published");

    const report = {
      counts: {
        siteText: textRows.length,
        siteImages: imageRows.length,
        capsules: capsuleRows.length,
        blogPosts: blogRows.length,
      },
      issues: {
        emptyTextSlots: { count: emptyText.length, items: emptyText },
        missingImages: { count: missingImages.length, items: missingImages },
        staleText: { count: staleText.length, sample: staleText.slice(0, 20) },
        unpublishedCapsules: { count: draftCapsules.length, items: draftCapsules },
        unpublishedBlogPosts: { count: draftBlog.length, items: draftBlog },
      },
    };

    return {
      content: [{ type: "text", text: JSON.stringify(report, null, 2) }],
      structuredContent: report,
    };
  },
});
