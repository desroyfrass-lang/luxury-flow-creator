// FRASS-0450 — Financial Audit Center reads. Founder/admin only.
//
// The caller is verified through their own RLS-scoped client first; only then
// does the handler load the privileged read helper. Nothing here writes — the
// audit view can only look, and the AI assistant can only explain.

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const Input = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  limit: z.number().int().min(10).max(1000).optional(),
});

const AskInput = z.object({
  question: z.string().min(2).max(600),
  from: z.string().optional(),
  to: z.string().optional(),
});

export const searchFinancialAudit = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => Input.parse(input ?? {}))
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Forbidden");

    const { collectAudit } = await import("@/lib/finance/audit.server");
    return collectAudit(data);
  });

/** Amendment 3 — the AI Audit Assistant. It answers questions; it never acts. */
export const askFinancialAudit = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => AskInput.parse(input))
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Forbidden");

    const key = process.env["LOVABLE_API_KEY"];
    if (!key) throw new Error("The audit assistant is not connected yet.");

    const { collectAudit, ledgerBriefing } = await import("@/lib/finance/audit.server");
    const { summarise } = await import("@/lib/finance/audit");
    const ledger = await collectAudit({ from: data.from, to: data.to, limit: 600 });
    const totals = summarise(ledger.rows);

    const { createLovableAiGatewayProvider } = await import("@/lib/ai-gateway.server");
    const { streamText } = await import("ai");

    const result = streamText({
      model: createLovableAiGatewayProvider(key)("google/gemini-3.6-flash"),
      system: [
        "You are Frassy, the Frass financial audit assistant.",
        "You are inside a READ-ONLY observation room. You never approve, edit, refund, settle or change anything, and you never offer to.",
        "If asked to act, explain plainly that the Audit Center can only observe, and name the place where that action legitimately happens.",
        "Frass's constitutional split is 90% to the member, 10% to the platform (the founder's 1% and co-founder's 1% live inside that 10%).",
        "Answer only from the ledger given to you. If the answer is not in it, say so.",
        "Answer twice: first the precise financial answer, then a short paragraph beginning 'Here's what this means:' with an everyday analogy.",
        "Caribbean warmth, no stereotypes, no jargon left unexplained.",
      ].join(" "),
      prompt: [
        `Window: ${ledger.window.from} → ${ledger.window.to}`,
        `Totals: ${totals.count} records · gross ${totals.gross} · platform ${totals.platform} · processing ${totals.processing} · net ${totals.net} · founder ${totals.founder} · co-founder ${totals.coFounder}`,
        `Reconciliation: ${totals.reconciled} reconciled, ${totals.pending} pending, ${totals.attention} need attention.`,
        `Queue: ${ledger.queue.processing} payments in flight, ${ledger.queue.openFraud} open fraud reports, ${ledger.queue.adjustments} adjustments.`,
        "",
        "LEDGER (one record per line):",
        ledgerBriefing(ledger.rows),
        "",
        `FOUNDER QUESTION: ${data.question}`,
      ].join("\n"),
    });

    return { answer: await result.text };
  });
