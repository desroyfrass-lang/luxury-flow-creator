// FRASS-0602 — data access for the Frass Distribution Network.
// RLS keeps every one of these tables Founder/Admin only.
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useConnectionAccounts() {
  return useQuery({
    queryKey: ["studio", "connections", "accounts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("studio_platform_connections")
        .select("*")
        .order("platform")
        .order("account_label");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useCapabilityRegistry() {
  return useQuery({
    queryKey: ["studio", "capabilities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("studio_platform_capabilities")
        .select("*")
        .order("platform")
        .order("capability");
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function usePackages(productionId?: string) {
  return useQuery({
    queryKey: ["studio", "packages", productionId ?? "all"],
    queryFn: async () => {
      let q = supabase
        .from("studio_platform_packages")
        .select("*, studio_productions(title, status, rights_status, series_id)")
        .order("created_at", { ascending: false });
      if (productionId) q = q.eq("production_id", productionId);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useDistributionJobs() {
  return useQuery({
    queryKey: ["studio", "distribution-jobs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("studio_publish_jobs")
        .select("*, studio_productions(title, series_id, production_type, studio_series(name))")
        .order("scheduled_for", { ascending: true, nullsFirst: false })
        .limit(500);
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function usePublications() {
  return useQuery({
    queryKey: ["studio", "publications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("studio_publications")
        .select("*, studio_productions(title, series_id, production_type, studio_series(name))")
        .order("published_at", { ascending: false, nullsFirst: false })
        .limit(500);
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useSyncRuns() {
  return useQuery({
    queryKey: ["studio", "sync-runs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("studio_sync_runs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useStudioAuditLog() {
  return useQuery({
    queryKey: ["studio", "activity"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("studio_activity_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(120);
      if (error) throw error;
      return data ?? [];
    },
  });
}
