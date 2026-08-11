// FRASS-0463 — Partner Journal persistence. Private by default; the Founder only
// ever sees entries the Partner explicitly chose to share.
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { JournalEntry } from "@/lib/partner-journal";

type Sb = { from: (t: string) => any; rpc: (n: string, a?: unknown) => any };

const COLS = "id, entry_date, prompt, body, mood, shared, created_at";

export const listMyJournal = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<JournalEntry[]> => {
    const sb = context.supabase as unknown as Sb;
    const { data, error } = await sb
      .from("partner_journal_entries")
      .select(COLS)
      .eq("user_id", context.userId)
      .order("entry_date", { ascending: false })
      .limit(60);
    if (error) throw new Error(error.message);
    return (data ?? []) as JournalEntry[];
  });

export const saveJournalEntry = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { entryDate: string; prompt: string; body: string; mood?: string | null; shared?: boolean }) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(input.entryDate)) throw new Error("Invalid date");
    if (!input.body.trim()) throw new Error("Write something first");
    return input;
  })
  .handler(async ({ data, context }): Promise<JournalEntry> => {
    const sb = context.supabase as unknown as Sb;
    const { data: row, error } = await sb
      .from("partner_journal_entries")
      .upsert(
        {
          user_id: context.userId,
          entry_date: data.entryDate,
          prompt: data.prompt.slice(0, 300),
          body: data.body.trim().slice(0, 5000),
          mood: data.mood ? data.mood.slice(0, 40) : null,
          shared: Boolean(data.shared),
        },
        { onConflict: "user_id,entry_date" },
      )
      .select(COLS)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row as JournalEntry;
  });

export type SharedJournalRow = JournalEntry & { user_id: string; display_name: string | null };

/** Founder oversight — shared entries only, read-only, never edited. */
export const listSharedJournal = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<SharedJournalRow[]> => {
    const sb = context.supabase as unknown as Sb;
    const [{ data: isAdmin }, { data: isSuper }] = await Promise.all([
      sb.rpc("has_role", { _user_id: context.userId, _role: "admin" }),
      sb.rpc("has_role", { _user_id: context.userId, _role: "super_admin" }),
    ]);
    if (!isAdmin && !isSuper) throw new Error("Forbidden");

    const { data, error } = await sb
      .from("partner_journal_entries")
      .select(`${COLS}, user_id`)
      .eq("shared", true)
      .order("entry_date", { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);

    const rows = (data ?? []) as (JournalEntry & { user_id: string })[];
    if (!rows.length) return [];
    const { data: profiles } = await sb
      .from("profiles")
      .select("id, display_name")
      .in("id", rows.map((r) => r.user_id));
    const names = new Map<string, string | null>(((profiles ?? []) as any[]).map((p) => [p.id, p.display_name ?? null]));
    return rows.map((r) => ({ ...r, display_name: names.get(r.user_id) ?? null }));
  });
