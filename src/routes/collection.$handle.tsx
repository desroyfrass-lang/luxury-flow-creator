import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SiteShell } from "@/components/site-shell";
import { PageHeader } from "@/components/page-header";
import { ProductGrid } from "@/components/product-grid";
import { COLLECTION_MAP } from "@/lib/shopify";

type Sort = "featured" | "newest" | "best" | "price-asc" | "price-desc";

export const Route = createFileRoute("/collection/$handle")({
  head: ({ params }) => {
    const meta = COLLECTION_MAP[params.handle];
    const title = meta?.title ?? "Collection";
    return {
      meta: [
        { title: `${title} — Frass Kicks` },
        { name: "description", content: meta?.description ?? `Shop ${title} at Frass Kicks.` },
        { property: "og:title", content: `${title} — Frass Kicks` },
      ],
    };
  },
  component: CollectionPage,
});

const SORTS: { id: Sort; label: string }[] = [
  { id: "featured", label: "Featured" },
  { id: "newest", label: "Newest" },
  { id: "best", label: "Best Selling" },
  { id: "price-asc", label: "Price ↑" },
  { id: "price-desc", label: "Price ↓" },
];

function CollectionPage() {
  const { handle } = Route.useParams();
  const meta = COLLECTION_MAP[handle];
  const [sort, setSort] = useState<Sort>("featured");

  const query = useMemo(() => {
    const base = meta?.query ?? `tag:"${handle}"`;
    // Storefront search syntax: append sort cues; product sort key is handled by API default — we pass base only.
    return base;
  }, [handle, meta]);

  const title = meta?.title ?? handle.replace(/-/g, " ");

  return (
    <SiteShell>
      <PageHeader
        eyebrow="Collection"
        title={title}
        description={meta?.description}
        crumbs={[{ label: "Home", to: "/" }, { label: title }]}
      />

      <div className="mx-auto max-w-[1600px] px-6 lg:px-12">
        <div className="flex flex-wrap items-center justify-between gap-4 border-y border-border py-4 mb-10">
          <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
            Sort by
          </div>
          <div className="flex flex-wrap gap-1">
            {SORTS.map((s) => (
              <button
                key={s.id}
                onClick={() => setSort(s.id)}
                className={`px-3 py-1.5 text-xs uppercase tracking-[0.2em] rounded-full transition ${
                  sort === s.id
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <ProductGrid
          query={query}
          first={24}
          emptyTitle="This collection is being curated"
          emptyHint="Tag products in Shopify with the corresponding tag and they'll appear here automatically."
        />
      </div>
    </SiteShell>
  );
}
