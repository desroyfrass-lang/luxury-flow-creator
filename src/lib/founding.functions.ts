import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * FRASS-0490 — First Partner Program (server authority).
 *
 * Constitutional rule: recognition is granted by the Founder alone. The client
 * may never request, imply or self-assign it. Members own exactly two things
 * here — who can see the designation, and the story they tell about it.
 */

export type FoundingRecord = {
  id: string;
  sequence: number;
  invitedAt: string;
  acceptedAt: string | null;
  invitedBy: string | null;
  visibility: "public" | "partners" | "private";
  showOnCard: boolean;
  story: {
    story_why: string | null;
    story_hoped: string | null;
    story_journey: string | null;
    story_lessons: string | null;
    isPublic: boolean;
  };
};

const SELECT =
  "id, user_id, sequence, invited_at, accepted_at, invited_by, visibility, show_on_card, story_why, story_hoped, story_journey, story_lessons, story_public";

type Row = {
  id: string;
  sequence: number;
  invited_at: string;
  accepted_at: string | null;
  invited_by: string | null;
  visibility: string;
  show_on_card: boolean;
  story_why: string | null;
  story_hoped: string | null;
  story_journey: string | null;
  story_lessons: string | null;
  story_public: boolean;
};

function shape(row: Row): FoundingRecord {
  return {
    id: row.id,
    sequence: row.sequence,
    invitedAt: row.invited_at,
    acceptedAt: row.accepted_at,
    invitedBy: row.invited_by,
    visibility: (row.visibility as FoundingRecord["visibility"]) ?? "partners",
    showOnCard: row.show_on_card,
    story: {
      story_why: row.story_why,
      story_hoped: row.story_hoped,
      story_journey: row.story_journey,
      story_lessons: row.story_lessons,
      isPublic: row.story_public,
    },
  };
}

/** The caller's own recognition, if the Founder ever granted it. */
export const getMyFoundingStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<FoundingRecord | null> => {
    const { data, error } = await context.supabase
      .from("founding_partners")
      .select(SELECT)
      .eq("user_id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ? shape(data as Row) : null;
  });

/** Accepting is the member's one-way act. It records history, nothing more. */
export const acceptFoundingRecognition = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<FoundingRecord | null> => {
    const { data, error } = await context.supabase
      .from("founding_partners")
      .update({ accepted_at: new Date().toISOString() })
      .eq("user_id", context.userId)
      .is("accepted_at", null)
      .select(SELECT)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (data) return shape(data as Row);
    const { data: existing } = await context.supabase
      .from("founding_partners")
      .select(SELECT)
      .eq("user_id", context.userId)
      .maybeSingle();
    return existing ? shape(existing as Row) : null;
  });

/** Visibility and the Founding Story — the only fields a member may change. */
export const updateMyFoundingRecord = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        visibility: z.enum(["public", "partners", "private"]).optional(),
        showOnCard: z.boolean().optional(),
        storyPublic: z.boolean().optional(),
        story_why: z.string().max(4000).nullable().optional(),
        story_hoped: z.string().max(4000).nullable().optional(),
        story_journey: z.string().max(4000).nullable().optional(),
        story_lessons: z.string().max(4000).nullable().optional(),
      })
      .parse(d ?? {}),
  )
  .handler(async ({ context, data }): Promise<FoundingRecord> => {
    const patch: {
      visibility?: string;
      show_on_card?: boolean;
      story_public?: boolean;
      story_why?: string | null;
      story_hoped?: string | null;
      story_journey?: string | null;
      story_lessons?: string | null;
    } = {};
    if (data.visibility !== undefined) patch.visibility = data.visibility;
    if (data.showOnCard !== undefined) patch.show_on_card = data.showOnCard;
    if (data.storyPublic !== undefined) patch.story_public = data.storyPublic;
    for (const key of ["story_why", "story_hoped", "story_journey", "story_lessons"] as const) {
      if (data[key] !== undefined) patch[key] = data[key] ?? null;
    }
    const { data: row, error } = await context.supabase
      .from("founding_partners")
      .update(patch)
      .eq("user_id", context.userId)
      .select(SELECT)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("No founding record belongs to you.");
    return shape(row as Row);
  });

/* --------------------------- Public recognition --------------------------- */

export type PublicFounding = {
  sequence: number;
  title: string;
  acceptedAt: string | null;
  story: {
    story_why: string | null;
    story_hoped: string | null;
    story_journey: string | null;
    story_lessons: string | null;
  } | null;
};

/**
 * Read-only recognition for a public Frass Card. Only ever returns a partner
 * who chose "public"; partners-only and private members are invisible here.
 */
export const getPublicFounding = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ handle: z.string().max(40) }).parse(d))
  .handler(async ({ data }): Promise<PublicFounding | null> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("handle", data.handle.replace(/^@/, "").toLowerCase())
      .eq("is_public", true)
      .maybeSingle();
    if (!profile) return null;

    const { data: row } = await supabaseAdmin
      .from("founding_partners")
      .select(SELECT)
      .eq("user_id", profile.id)
      .eq("visibility", "public")
      .eq("show_on_card", true)
      .maybeSingle();
    if (!row) return null;

    const r = row as Row;
    return {
      sequence: r.sequence,
      title: r.sequence === 1 ? "The First Partner" : `First Partner No. ${r.sequence}`,
      acceptedAt: r.accepted_at,
      story: r.story_public
        ? {
            story_why: r.story_why,
            story_hoped: r.story_hoped,
            story_journey: r.story_journey,
            story_lessons: r.story_lessons,
          }
        : null,
    };
  });

/* ------------------------------ Founder tools ----------------------------- */

async function assertFounder(context: { supabase: any; userId: string }) {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error) throw new Error(error.message);
  if (!data) {
    const { data: sa } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "super_admin",
    });
    if (!sa) throw new Error("Founder access required.");
  }
}

export type FoundingRoster = {
  periodOpen: boolean;
  partners: {
    id: string;
    userId: string;
    sequence: number;
    name: string | null;
    email: string | null;
    handle: string | null;
    invitedAt: string;
    acceptedAt: string | null;
    visibility: string;
    note: string | null;
  }[];
};

export const getFoundingRoster = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<FoundingRoster> => {
    await assertFounder(context as never);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: setting } = await supabaseAdmin
      .from("launch_program_settings")
      .select("enabled")
      .eq("id", "founding_program")
      .maybeSingle();

    const { data: rows, error } = await supabaseAdmin
      .from("founding_partners")
      .select("id, user_id, sequence, invited_at, accepted_at, visibility")
      .order("sequence", { ascending: true });
    if (error) throw new Error(error.message);

    const ids = (rows ?? []).map((r) => r.user_id);
    const { data: profiles } = ids.length
      ? await supabaseAdmin
          .from("profiles")
          .select("id, display_name, full_name, email, handle")
          .in("id", ids)
      : { data: [] as any[] };
    const byId = new Map((profiles ?? []).map((p: any) => [p.id, p]));

    // Private Founder notes live in their own Founder-only table.
    const { data: notes } = (rows ?? []).length
      ? await supabaseAdmin
          .from("founder_notes")
          .select("partner_id, founder_note, created_at")
          .in(
            "partner_id",
            (rows ?? []).map((r) => r.id),
          )
          .order("created_at", { ascending: false })
      : { data: [] as any[] };
    const noteByPartner = new Map<string, string>();
    for (const n of (notes ?? []) as any[]) {
      if (!noteByPartner.has(n.partner_id)) noteByPartner.set(n.partner_id, n.founder_note);
    }

    return {
      periodOpen: Boolean(setting?.enabled),
      partners: (rows ?? []).map((r) => {
        const p = byId.get(r.user_id);
        return {
          id: r.id,
          userId: r.user_id,
          sequence: r.sequence,
          name: p?.display_name ?? p?.full_name ?? null,
          email: p?.email ?? null,
          handle: p?.handle ?? null,
          invitedAt: r.invited_at,
          acceptedAt: r.accepted_at,
          visibility: r.visibility,
          note: noteByPartner.get(r.id) ?? null,
        };
      }),
    };

  });

/** The Founder's personal invitation. The only way recognition ever begins. */
export const grantFoundingPartner = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ email: z.string().email().max(200), note: z.string().max(500).optional() }).parse(d),
  )
  .handler(async ({ context, data }) => {
    await assertFounder(context as never);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const email = data.email.toLowerCase();
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .ilike("email", email)
      .maybeSingle();
    if (!profile) {
      throw new Error(
        "No member on Frass uses that email yet. Invite them as a partner first — recognition is granted to a person, not an address.",
      );
    }

    // sequence is assigned by the database trigger; invited_by is the Founder.
    const { error } = await supabaseAdmin.from("founding_partners").insert({
      user_id: profile.id,
      sequence: 0,
      invited_by: context.userId,
      note: data.note || null,
    });
    if (error) {
      if (error.code === "23505") throw new Error("They are already a First Partner.");
      throw new Error(error.message);
    }
    return { ok: true };
  });

export const revokeFoundingPartner = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    await assertFounder(context as never);
    const { error } = await context.supabase.from("founding_partners").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Opening or closing the founding period. Closed by default once the Founder says so. */
export const setFoundingPeriod = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ open: z.boolean() }).parse(d))
  .handler(async ({ context, data }) => {
    await assertFounder(context as never);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("launch_program_settings")
      .upsert(
        {
          id: "founding_program",
          enabled: data.open,
          notice: data.open
            ? "The founding period is open. Only the Founder may invite First Partners."
            : "The founding period is closed. No further First Partners can be recognised until the Founder reopens it.",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" },
      );
    if (error) throw new Error(error.message);
    return { open: data.open };
  });
