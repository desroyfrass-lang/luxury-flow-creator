// FRASS-0600 — data access for Frassy Studios.
// Row Level Security keeps every one of these tables Founder/Admin only, so the
// browser client is safe here and the studio stays live and responsive.
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useSeries() {
  return useQuery({
    queryKey: ["studio", "series"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("studio_series")
        .select("*, studio_series_bibles(*)")
        .order("name");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useProductions(filters?: { status?: string; type?: string; seriesId?: string }) {
  return useQuery({
    queryKey: ["studio", "productions", filters ?? {}],
    queryFn: async () => {
      let q = supabase
        .from("studio_productions")
        .select("*, studio_series(name, slug)")
        .order("updated_at", { ascending: false });
      if (filters?.status) q = q.eq("status", filters.status);
      if (filters?.type) q = q.eq("production_type", filters.type);
      if (filters?.seriesId) q = q.eq("series_id", filters.seriesId);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useProduction(id: string) {
  return useQuery({
    queryKey: ["studio", "production", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("studio_productions")
        .select("*, studio_series(id, name, slug)")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: Boolean(id),
  });
}

export function useScenes(productionId: string) {
  return useQuery({
    queryKey: ["studio", "scenes", productionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("studio_scenes")
        .select("*")
        .eq("production_id", productionId)
        .order("scene_number");
      if (error) throw error;
      return data ?? [];
    },
    enabled: Boolean(productionId),
  });
}

export function useCharacters() {
  return useQuery({
    queryKey: ["studio", "characters"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("studio_characters")
        .select("*, studio_series(name)")
        .order("name");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useAssets(type?: string) {
  return useQuery({
    queryKey: ["studio", "assets", type ?? "all"],
    queryFn: async () => {
      let q = supabase.from("studio_assets").select("*").order("created_at", { ascending: false });
      if (type) q = q.eq("asset_type", type);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function usePlatformConnections() {
  return useQuery({
    queryKey: ["studio", "connections"],
    queryFn: async () => {
      const { data, error } = await supabase.from("studio_platform_connections").select("*").order("platform");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function usePublishJobs() {
  return useQuery({
    queryKey: ["studio", "publish-jobs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("studio_publish_jobs")
        .select("*, studio_productions(title, series_id, rights_status, status, studio_series(name))")
        .order("scheduled_for", { ascending: true, nullsFirst: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useMonetization() {
  return useQuery({
    queryKey: ["studio", "monetization"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("studio_monetization")
        .select("*, studio_productions(title)")
        .order("period_end", { ascending: false, nullsFirst: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function usePlatformAnalytics() {
  return useQuery({
    queryKey: ["studio", "analytics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("studio_platform_analytics")
        .select("*, studio_productions(title, production_type, series_id, studio_series(name))")
        .order("period_end", { ascending: false, nullsFirst: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useGenerationJobs() {
  return useQuery({
    queryKey: ["studio", "generation-jobs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("studio_generation_jobs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(400);
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useDerivatives(masterId: string) {
  return useQuery({
    queryKey: ["studio", "derivatives", masterId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("studio_production_derivatives")
        .select("*, derivative:studio_productions!studio_production_derivatives_derivative_production_id_fkey(id, title, production_type, status, aspect_ratio)")
        .eq("master_production_id", masterId);
      if (error) throw error;
      return data ?? [];
    },
    enabled: Boolean(masterId),
  });
}

/** Write the studio's own record of what happened. */
export async function logStudioActivity(action: string, subjectType: string, subjectId: string, detail: Record<string, unknown> = {}) {
  const { data } = await supabase.auth.getUser();
  await supabase.from("studio_activity_log").insert({
    actor_id: data.user?.id ?? null,
    action,
    subject_type: subjectType,
    subject_id: subjectId,
    detail: detail as never,
  });
}
