import { useQuery, queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SLOT_BY_KEY } from "@/lib/image-slots";

export type SiteImageRow = { slot_key: string; url: string; alt: string | null };

export const siteImagesQuery = queryOptions({
  queryKey: ["site-images"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("site_images")
      .select("slot_key,url,alt");
    if (error) throw error;
    const map = new Map<string, SiteImageRow>();
    (data ?? []).forEach((r) => map.set(r.slot_key, r as SiteImageRow));
    return map;
  },
  staleTime: 60_000,
});

export function useSiteImages() {
  return useQuery(siteImagesQuery);
}

/** Returns the URL for a slot, falling back to the bundled default. */
export function useSiteImageUrl(slotKey: string, fallback?: string): string {
  const { data } = useSiteImages();
  const override = data?.get(slotKey);
  if (override) return override.url;
  if (fallback) return fallback;
  return SLOT_BY_KEY[slotKey]?.fallback ?? "";
}

export const lookbookStoryImagesQuery = (slug: string) =>
  queryOptions({
    queryKey: ["lookbook-story-images", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lookbook_story_images")
        .select("id,url,alt,position")
        .eq("story_slug", slug)
        .order("position", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 60_000,
  });

export function useLookbookStoryImages(slug: string) {
  return useQuery(lookbookStoryImagesQuery(slug));
}

export const productOverridesQuery = (productId: string) =>
  queryOptions({
    queryKey: ["product-image-overrides", productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_image_overrides")
        .select("id,url,alt,position")
        .eq("product_id", productId)
        .order("position", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 60_000,
  });

export function useProductOverrides(productId: string | null | undefined) {
  return useQuery({
    ...productOverridesQuery(productId ?? ""),
    enabled: Boolean(productId),
  });
}
