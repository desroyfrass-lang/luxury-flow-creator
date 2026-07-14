import { Link } from "@tanstack/react-router";
import { Plus, Star, Flame } from "lucide-react";
import { toast } from "sonner";
import type { ViralProduct } from "@/lib/social-virals";

const badgeStyles: Record<NonNullable<ViralProduct["badge"]>, string> = {
  Viral: "bg-[color:var(--gold)] text-[color:var(--ink)]",
  Hot: "bg-red-500/90 text-white",
  New: "bg-emerald-500/90 text-white",
  Deal: "bg-blue-500/90 text-white",
  "Creator Pick": "bg-purple-500/90 text-white",
};

export function ViralProductCard({
  product,
  category,
  sub,
}: {
  product: ViralProduct;
  category: string;
  sub: string;
}) {
  const discount = product.compareAt
    ? Math.round(((product.compareAt - product.price) / product.compareAt) * 100)
    : 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    toast.success(`${product.title} added to cart`);
  };

  return (
    <Link
      to="/social-media-virals/$category/$sub/$product"
      params={{ category, sub, product: product.slug }}
      className="lux-card group relative block overflow-hidden rounded-2xl bg-card"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
        <img
          src={product.image}
          alt={product.title}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
        />
        <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-2xl pointer-events-none" />

        {product.badge && (
          <span
            className={`absolute top-3 left-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${badgeStyles[product.badge]}`}
          >
            {product.badge === "Viral" && <Flame className="h-3 w-3" />}
            {product.badge}
          </span>
        )}

        {discount > 0 && (
          <span className="absolute top-3 right-3 rounded-full bg-background/90 backdrop-blur px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-red-600">
            -{discount}%
          </span>
        )}

        <button
          onClick={handleAdd}
          className="absolute bottom-4 right-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-background/90 text-foreground shadow-[var(--shadow-luxury)] backdrop-blur transition-all duration-300 hover:bg-[color:var(--gold)] hover:scale-110"
          aria-label="Quick add"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      <div className="px-1 pt-4 pb-2">
        <h3 className="font-display text-lg leading-tight line-clamp-1">{product.title}</h3>
        <p className="mt-1 text-xs text-muted-foreground line-clamp-1">{product.blurb}</p>
        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-0.5 text-[color:var(--gold)]">
            <Star className="h-3 w-3 fill-current" />
            <span className="font-medium tabular-nums text-foreground">{product.rating.toFixed(1)}</span>
          </span>
          <span>·</span>
          <span>{product.sold}</span>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="font-display text-xl tabular-nums">${product.price.toFixed(2)}</span>
          {product.compareAt && (
            <span className="text-sm tabular-nums text-muted-foreground line-through">
              ${product.compareAt.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
