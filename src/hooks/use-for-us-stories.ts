import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { ForUsStoryRow } from "@/lib/for-us";

const COLUMNS =
  "id, section_id, series, source_label, title, summary, body, categories, tags, media_url, media_kind, cta_label, cta_to, impact_note, revenue_note, audience, status, origin, occurred_at, published_at, created_at";

/** Published community stories — the part of the feed Frassy and the Founder grew. */
export function usePublishedStories() {
  return useQuery({
    queryKey: ["for-us-stories", "published"],
    queryFn: async (): Promise<ForUsStoryRow[]> => {
      const { data, error } = await supabase
        .from("for_us_stories")
        .select(COLUMNS)
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(120);
      if (error) throw error;
      return (data ?? []) as unknown as ForUsStoryRow[];
    },
    staleTime: 60_000,
  });
}

/** Everything, including Frassy's unapproved proposals. Admin/Founder only (RLS enforced). */
export function useAllStories(enabled = true) {
  return useQuery({
    queryKey: ["for-us-stories", "all"],
    enabled,
    queryFn: async (): Promise<ForUsStoryRow[]> => {
      const { data, error } = await supabase
        .from("for_us_stories")
        .select(COLUMNS)
        .order("created_at", { ascending: false })
        .limit(300);
      if (error) throw error;
      return (data ?? []) as unknown as ForUsStoryRow[];
    },
    staleTime: 15_000,
  });
}
