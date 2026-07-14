import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { ViralProduct } from "@/lib/social-virals";

export type ViralProductRow = {
  id: string;
  category_slug: string;
  sub_slug: string;
  slug: string;
  title: string;
  blurb: string;
  price: number;
  compare_at: number | null;
  rating: number;
  reviews: number;
  sold: string;
  badge: string | null;
  image: string;
  sort_order: number;
};

export function rowToProduct(r: ViralProductRow): ViralProduct {
  return {
    slug: r.slug,
    title: r.title,
    blurb: r.blurb,
    price: Number(r.price),
    compareAt: r.compare_at ? Number(r.compare_at) : undefined,
    rating: Number(r.rating),
    reviews: r.reviews,
    sold: r.sold,
    badge: (r.badge as ViralProduct["badge"]) ?? undefined,
    image: r.image,
  };
}

export function useViralProducts(category?: string, sub?: string) {
  return useQuery({
    queryKey: ["viral-products", category ?? "all", sub ?? "all"],
    queryFn: async () => {
      let q = supabase.from("viral_products").select("*").order("sort_order", { ascending: true });
      if (category) q = q.eq("category_slug", category);
      if (sub) q = q.eq("sub_slug", sub);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as ViralProductRow[];
    },
  });
}
