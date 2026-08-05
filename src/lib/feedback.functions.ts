import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

const feedbackSchema = z.object({
  pagePath: z.string().max(500),
  pageTitle: z.string().max(300).optional(),
  helpful: z.boolean().nullable(),
  issueText: z.string().max(2000).optional(),
});

export const submitPageFeedback = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => feedbackSchema.parse(data))
  .handler(async ({ data }) => {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user?.id ?? null;

    const { error } = await supabase.from("page_feedback").insert({
      page_path: data.pagePath,
      page_title: data.pageTitle || null,
      helpful: data.helpful ?? null,
      issue_text: data.issueText?.trim() || null,
      user_id: userId,
    });

    if (error) {
      throw new Error(error.message);
    }

    return { ok: true };
  });
