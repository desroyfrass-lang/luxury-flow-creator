import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CustomerPhoto {
  id: string;
  user_id: string;
  image_url: string;
  label: string | null;
  is_primary: boolean;
  created_at: string;
}

export interface TryOnLook {
  id: string;
  user_id: string;
  source_photo_url: string;
  result_url: string | null;
  cart_items: Array<{ title: string; imageUrl: string; variantTitle?: string }>;
  status: "pending" | "ready" | "failed";
  error: string | null;
  created_at: string;
}

export function useCustomerPhotos() {
  return useQuery({
    queryKey: ["customer_photos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customer_photos")
        .select("*")
        .order("is_primary", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as CustomerPhoto[];
    },
  });
}

export function useTryOnLooks() {
  return useQuery({
    queryKey: ["tryon_looks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tryon_looks")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(24);
      if (error) throw error;
      return (data ?? []) as unknown as TryOnLook[];
    },
  });
}
