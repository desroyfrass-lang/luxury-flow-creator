// Step 7 — Tester feedback rides on the existing page_feedback table and the
// existing Founder feedback review. Identity is taken from the verified token,
// and the experience must be live-commissioned, or the report is refused.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { TESTER_EXPERIENCES } from "@/lib/roles";

const schema = z.object({
  experience: z.enum(TESTER_EXPERIENCES),
  status: z.enum(["works", "problem", "confused"]),
  pagePath: z.string().max(500),
  note: z.string().max(2000).optional(),
});

export const submitTesterFeedback = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => schema.parse(d))
  .handler(async ({ context, data }) => {
    const { data: ok, error: checkErr } = await context.supabase.rpc("has_tester_commission", {
      _user_id: context.userId,
      _experience: data.experience,
    });
    if (checkErr || ok !== true) throw new Error("This experience is not commissioned for you.");
    const { error } = await context.supabase.from("page_feedback").insert({
      user_id: context.userId,
      page_path: data.pagePath,
      page_title: `Tester · ${data.experience}`,
      helpful: data.status === "works" ? true : data.status === "problem" ? false : null,
      issue_text: data.note?.trim() || null,
      tester_status: data.status,
      tester_experience: data.experience,
    });
    if (error) throw new Error("Could not save your report. Please try again.");
    return { ok: true };
  });
