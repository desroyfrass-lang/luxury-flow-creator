import { useQuery, queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TEXT_SLOT_BY_KEY } from "@/lib/text-slots";

export type SiteTextRow = { slot_key: string; value: string };

export const siteTextQuery = queryOptions({
  queryKey: ["site-text"],
  queryFn: async () => {
    const { data, error } = await supabase.from("site_text").select("slot_key,value");
    if (error) throw error;
    const map = new Map<string, string>();
    (data ?? []).forEach((r) => map.set(r.slot_key, r.value));
    return map;
  },
  staleTime: 60_000,
});

export function useSiteTexts() {
  return useQuery(siteTextQuery);
}

/** Returns the text for a slot, falling back to the registered default. */
export function useSiteText(slotKey: string, fallback?: string): string {
  const { data } = useSiteTexts();
  const override = data?.get(slotKey);
  if (override !== undefined) return override;
  if (fallback !== undefined) return fallback;
  return TEXT_SLOT_BY_KEY[slotKey]?.defaultValue ?? "";
}
