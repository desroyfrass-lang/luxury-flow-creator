import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toActivity, type LearningActivity } from "@/lib/content-engine";

const SELECT = "*";

export interface ActivityFilter {
  district?: string;
  ageGroup?: string;
  placeSlug?: string;
  category?: string;
  featured?: boolean;
}

/** Published activities only — this is what children and parents see. */
export function usePublishedActivities(filter: ActivityFilter = {}) {
  return useQuery({
    queryKey: ["activities", "published", filter],
    staleTime: 60_000,
    queryFn: async (): Promise<LearningActivity[]> => {
      let q = supabase
        .from("learning_activities")
        .select(SELECT)
        .eq("status", "published")
        .order("featured", { ascending: false })
        .order("position", { ascending: true })
        .order("created_at", { ascending: false });

      if (filter.district) q = q.eq("district", filter.district);
      if (filter.ageGroup) q = q.eq("age_group", filter.ageGroup);
      if (filter.placeSlug) q = q.eq("place_slug", filter.placeSlug);
      if (filter.category) q = q.eq("category", filter.category);
      if (filter.featured) q = q.eq("featured", true);

      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []).map((row) => toActivity(row as Record<string, unknown>));
    },
  });
}

export function usePublishedActivity(slug: string) {
  return useQuery({
    queryKey: ["activity", slug],
    staleTime: 60_000,
    queryFn: async (): Promise<LearningActivity | null> => {
      const { data, error } = await supabase
        .from("learning_activities")
        .select(SELECT)
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();
      if (error) throw error;
      return data ? toActivity(data as Record<string, unknown>) : null;
    },
  });
}

/** Every activity, any status — staff and Founder only (enforced by RLS). */
export function useAllActivities() {
  return useQuery({
    queryKey: ["activities", "all"],
    queryFn: async (): Promise<LearningActivity[]> => {
      const { data, error } = await supabase
        .from("learning_activities")
        .select(SELECT)
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((row) => toActivity(row as Record<string, unknown>));
    },
  });
}

export function useActivityVersions(activityId: string | null) {
  return useQuery({
    queryKey: ["activity-versions", activityId],
    enabled: Boolean(activityId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("learning_activity_versions")
        .select("id, version, note, created_at")
        .eq("activity_id", activityId!)
        .order("version", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}
