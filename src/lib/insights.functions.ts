// Builder Insights — server reads (A-05 Part 3).
// Thin wrapper: only imports, types and server-function declarations.
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { deriveInsights, type Artifact } from "@/lib/insights-engine";

/** Every insight in the feed, derived from the caller's own artifacts. */
export const getBuilderInsights = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const [slogans, logos, proposals, looks, notes, links] = await Promise.all([
      supabase
        .from("slogans")
        .select("id, text, tags, status, created_at")
        .eq("submitted_by", userId)
        .order("created_at", { ascending: false })
        .limit(200),
      supabase
        .from("logo_treatments")
        .select("id, name, placement, print_method, status, created_at")
        .eq("submitted_by", userId)
        .order("created_at", { ascending: false })
        .limit(200),
      supabase
        .from("merch_proposals")
        .select(
          "id, title, status, quality_tier, target_collection, season, slogan_id, logo_treatment_id, created_at",
        )
        .eq("proposed_by", userId)
        .order("created_at", { ascending: false })
        .limit(200),
      supabase
        .from("tryon_looks")
        .select("id, prompt, status, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(100),
      supabase
        .from("frassy_notes")
        .select("id, body, pinned, created_at")
        .eq("user_id", userId)
        .is("archived_at", null)
        .order("created_at", { ascending: false })
        .limit(100),
      supabase
        .from("affiliate_links")
        .select("id, label, destination_handle, clicks, status, created_at")
        .eq("user_id", userId)
        .order("clicks", { ascending: false })
        .limit(100),
    ]);

    const artifacts: Artifact[] = [];

    for (const s of slogans.data ?? []) {
      artifacts.push({
        id: s.id,
        type: "slogan",
        label: s.text,
        sublabel: (s.tags ?? []).join(" · ") || undefined,
        createdAt: s.created_at,
        meta: { status: s.status, theme: (s.tags ?? [])[0] ?? null },
      });
    }
    for (const l of logos.data ?? []) {
      artifacts.push({
        id: l.id,
        type: "logo",
        label: l.name,
        sublabel: l.print_method ?? undefined,
        createdAt: l.created_at,
        meta: { status: l.status, placement: l.placement },
      });
    }
    for (const p of proposals.data ?? []) {
      artifacts.push({
        id: p.id,
        type: "proposal",
        label: p.title,
        sublabel: [p.target_collection, p.season].filter(Boolean).join(" · ") || undefined,
        createdAt: p.created_at,
        meta: {
          status: p.status,
          tier: p.quality_tier,
          collection: p.target_collection,
          theme: p.season,
          sloganId: p.slogan_id,
          logoId: p.logo_treatment_id,
        },
      });
    }
    for (const t of looks.data ?? []) {
      artifacts.push({
        id: t.id,
        type: "look",
        label: t.prompt?.slice(0, 80) || "Styled look",
        sublabel: t.status,
        createdAt: t.created_at,
        meta: { status: t.status },
      });
    }
    for (const n of notes.data ?? []) {
      artifacts.push({
        id: n.id,
        type: "note",
        label: n.body.slice(0, 90),
        sublabel: n.pinned ? "Pinned" : undefined,
        createdAt: n.created_at,
      });
    }
    for (const a of links.data ?? []) {
      artifacts.push({
        id: a.id,
        type: "link",
        label: a.label || a.destination_handle,
        sublabel: `${a.clicks ?? 0} clicks`,
        createdAt: a.created_at,
        meta: { clicks: a.clicks ?? 0, status: a.status },
      });
    }

    return {
      totalArtifacts: artifacts.length,
      insights: deriveInsights(artifacts),
    };
  });
