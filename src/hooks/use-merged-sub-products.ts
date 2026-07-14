import { useViralProducts, rowToProduct } from "@/hooks/use-viral-products";
import { getViralSub, type ViralProduct } from "@/lib/social-virals";

/** Merges mock defaults with DB products (DB wins by slug, extras appended). */
export function useMergedSubProducts(category: string, sub: string): {
  products: ViralProduct[];
  isLoading: boolean;
} {
  const { data: rows, isLoading } = useViralProducts(category, sub);
  const { sub: mockSub } = getViralSub(category, sub);
  const mock = mockSub?.products ?? [];
  const dbProducts = (rows ?? []).map(rowToProduct);
  const dbSlugs = new Set(dbProducts.map((p) => p.slug));
  const merged = [...dbProducts, ...mock.filter((p) => !dbSlugs.has(p.slug))];
  return { products: merged, isLoading };
}
