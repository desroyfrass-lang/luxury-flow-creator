import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type MediaKind = "track" | "video";

export interface MediaItem {
  id: string;
  kind: MediaKind;
  title: string;
  subtitle: string | null;
  tag: string | null;
  length: string | null;
  source_url: string | null;
  poster_url: string | null;
  position: number;
}

export function useMediaItems(kind?: MediaKind) {
  return useQuery({
    queryKey: ["media_items", kind ?? "all"],
    queryFn: async () => {
      let q = supabase
        .from("media_items")
        .select("id,kind,title,subtitle,tag,length,source_url,poster_url,position")
        .order("position", { ascending: true })
        .order("created_at", { ascending: true });
      if (kind) q = q.eq("kind", kind);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as MediaItem[];
    },
  });
}
