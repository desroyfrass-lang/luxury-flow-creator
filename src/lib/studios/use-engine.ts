// FRASS-0601 — data access for the Production Engine.
// Row Level Security keeps every one of these tables Founder/Admin only.
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useBrief(productionId: string) {
  return useQuery({
    queryKey: ["studio", "brief", productionId],
    queryFn: async () => {
      const { data, error } = await supabase.from("studio_briefs").select("*").eq("production_id", productionId).maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: Boolean(productionId),
  });
}

export function useDevelopment(productionId: string) {
  return useQuery({
    queryKey: ["studio", "development", productionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("studio_episode_development")
        .select("*")
        .eq("production_id", productionId)
        .order("version", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: Boolean(productionId),
  });
}

export function useScript(productionId: string) {
  return useQuery({
    queryKey: ["studio", "script", productionId],
    queryFn: async () => {
      const { data, error } = await supabase.from("studio_scripts").select("*").eq("production_id", productionId).maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: Boolean(productionId),
  });
}

export function useScriptVersions(scriptId: string | null | undefined) {
  return useQuery({
    queryKey: ["studio", "script-versions", scriptId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("studio_script_versions")
        .select("*")
        .eq("script_id", scriptId!)
        .order("version", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: Boolean(scriptId),
  });
}

export function useContinuityFindings(productionId: string) {
  return useQuery({
    queryKey: ["studio", "continuity", productionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("studio_continuity_findings")
        .select("*")
        .eq("production_id", productionId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: Boolean(productionId),
  });
}

export function useMaster(productionId: string) {
  return useQuery({
    queryKey: ["studio", "master", productionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("studio_masters")
        .select("*")
        .eq("production_id", productionId)
        .order("version", { ascending: false })
        .limit(1);
      if (error) throw error;
      return data?.[0] ?? null;
    },
    enabled: Boolean(productionId),
  });
}

export function usePackages(productionId: string) {
  return useQuery({
    queryKey: ["studio", "packages", productionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("studio_platform_packages")
        .select("*")
        .eq("production_id", productionId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: Boolean(productionId),
  });
}

export function useVoices() {
  return useQuery({
    queryKey: ["studio", "voices"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("studio_voices")
        .select("*, studio_characters(name), studio_series(name)")
        .order("name");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useAnimations(category?: string) {
  return useQuery({
    queryKey: ["studio", "animations", category ?? "all"],
    queryFn: async () => {
      let q = supabase.from("studio_animations").select("*, studio_characters(name)").order("name");
      if (category) q = q.eq("category", category);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useProviders() {
  return useQuery({
    queryKey: ["studio", "providers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("studio_providers").select("*").order("priority");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useSceneVersions(sceneId: string | null) {
  return useQuery({
    queryKey: ["studio", "scene-versions", sceneId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("studio_scene_versions")
        .select("*")
        .eq("scene_id", sceneId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: Boolean(sceneId),
  });
}

export function useProductionMemory(productionId: string, seriesId?: string | null) {
  return useQuery({
    queryKey: ["studio", "memory", productionId, seriesId ?? ""],
    queryFn: async () => {
      const filters = [`production_id.eq.${productionId}`];
      if (seriesId) filters.push(`series_id.eq.${seriesId}`);
      const { data, error } = await supabase
        .from("studio_production_memory")
        .select("*")
        .or(filters.join(","))
        .order("importance", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: Boolean(productionId),
  });
}
