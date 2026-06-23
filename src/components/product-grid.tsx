import { useEffect, useState } from "react";
import { fetchProducts, type ShopifyProduct } from "@/lib/shopify";
import { ProductCard } from "./product-card";
import { Loader2 } from "lucide-react";

export function ProductGrid({
  query,
  first = 24,
  emptyTitle = "No products found",
  emptyHint,
}: {
  query?: string;
  first?: number;
  emptyTitle?: string;
  emptyHint?: string;
}) {
  const [products, setProducts] = useState<ShopifyProduct[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    setProducts(null);
    fetchProducts({ first, query })
      .then((p) => !cancelled && setProducts(p))
      .catch(() => !cancelled && setProducts([]));
    return () => {
      cancelled = true;
    };
  }, [query, first]);

  if (products === null) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-border bg-white/60 backdrop-blur p-16 text-center">
        <h3 className="font-display text-3xl">{emptyTitle}</h3>
        {emptyHint && <p className="mt-3 text-sm text-muted-foreground max-w-md mx-auto">{emptyHint}</p>}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-10">
      {products.map((p) => (
        <ProductCard key={p.node.id} product={p} />
      ))}
    </div>
  );
}
