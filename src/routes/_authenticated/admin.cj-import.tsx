import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import {
  nextPendingCj,
  queueStats,
  importCjPage,
  categorizeCj,
  skipCj,
} from "@/lib/cj.functions";

export const Route = createFileRoute("/_authenticated/admin/cj-import")({
  component: CjImportPage,
});

const BRANDS = [
  { value: "frass-kicks", label: "Frass Kicks (footwear)" },
  { value: "frass-drip", label: "Frass Drip (apparel)" },
  { value: "bare-drip", label: "Bare Drip (swim/underwear)" },
];

const GENDERS = [
  { value: "men", label: "Men" },
  { value: "women", label: "Women" },
  { value: "unisex", label: "Unisex" },
];

const CATEGORIES_BY_BRAND: Record<string, string[]> = {
  "frass-kicks": ["street", "classic", "casual"],
  "frass-drip": ["work", "party", "casual", "street", "vacay", "sport", "crown", "extra", "90s-casual", "90s-classic", "90s-street"],
  "bare-drip": ["swimwear", "underwear", "lingerie", "shapewear", "panties", "bras"],
};

function CjImportPage() {
  const qc = useQueryClient();
  const nextFn = useServerFn(nextPendingCj);
  const statsFn = useServerFn(queueStats);
  const importPageFn = useServerFn(importCjPage);
  const categorizeFn = useServerFn(categorizeCj);
  const skipFn = useServerFn(skipCj);

  const [pageNum, setPageNum] = useState(1);
  const [keyword, setKeyword] = useState("");

  const { data: stats } = useQuery({ queryKey: ["cj-stats"], queryFn: () => statsFn() });
  const { data: current, isLoading } = useQuery({
    queryKey: ["cj-next"],
    queryFn: () => nextFn(),
  });

  const [brand, setBrand] = useState("frass-drip");
  const [gender, setGender] = useState("women");
  const [category, setCategory] = useState("casual");
  const [subcategory, setSubcategory] = useState("");
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [extraTags, setExtraTags] = useState("");

  // Reset form when a new product loads
  const productKey = current?.id ?? null;
  useMemo(() => {
    if (current) {
      setTitle(current.title ?? "");
      setPrice(current.suggested_price?.toString() ?? "");
      setSubcategory("");
      setExtraTags("");
    }
  }, [productKey]);

  const importMut = useMutation({
    mutationFn: (kw: string) => importPageFn({ data: { pageNum, pageSize: 20, keyword: kw || undefined } }),
    onSuccess: (r) => {
      toast.success(`Pulled ${r.inserted} products from CJ (page ${pageNum})`);
      qc.invalidateQueries({ queryKey: ["cj-next"] });
      qc.invalidateQueries({ queryKey: ["cj-stats"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const saveMut = useMutation({
    mutationFn: async () => {
      if (!current) return;
      const tags = [
        brand,
        gender,
        `${category}-drip`.replace("-drip-drip", "-drip"),
        subcategory,
        ...extraTags.split(",").map((t) => t.trim()).filter(Boolean),
      ].filter(Boolean);
      await categorizeFn({
        data: {
          id: current.id,
          title,
          suggested_price: price ? Number(price) : undefined,
          brand,
          gender,
          category,
          subcategory: subcategory || undefined,
          tags,
        },
      });
    },
    onSuccess: () => {
      toast.success("Categorized — queued for Shopify import");
      qc.invalidateQueries({ queryKey: ["cj-next"] });
      qc.invalidateQueries({ queryKey: ["cj-stats"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const skipMut = useMutation({
    mutationFn: async () => {
      if (!current) return;
      await skipFn({ data: { id: current.id } });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cj-next"] });
      qc.invalidateQueries({ queryKey: ["cj-stats"] });
    },
  });

  const cats = CATEGORIES_BY_BRAND[brand] ?? [];

  return (
    <div className="grid gap-8 lg:grid-cols-[420px_1fr]">
      {/* Left rail */}
      <aside className="space-y-6">
        <div className="rounded-sm border border-border/50 p-5">
          <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Queue</div>
          <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
            <Stat label="Pending" value={stats?.pending ?? 0} />
            <Stat label="Categorized" value={stats?.categorized ?? 0} />
            <Stat label="Imported" value={stats?.imported ?? 0} />
            <Stat label="Skipped" value={stats?.skipped ?? 0} />
          </div>
        </div>

        <div className="rounded-sm border border-border/50 p-5">
          <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Pull from CJ</div>
          <div className="mt-3 space-y-3">
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Keyword (optional)"
              className="w-full rounded-sm border border-border/50 bg-transparent px-3 py-2 text-sm"
            />
            <div className="flex items-center gap-2">
              <label className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Page</label>
              <input
                type="number"
                min={1}
                value={pageNum}
                onChange={(e) => setPageNum(Math.max(1, Number(e.target.value)))}
                className="w-24 rounded-sm border border-border/50 bg-transparent px-3 py-2 text-sm"
              />
            </div>
            <button
              onClick={() => importMut.mutate(keyword)}
              disabled={importMut.isPending}
              className="w-full rounded-sm border border-[color:var(--gold)] bg-[color:var(--gold)] px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.28em] text-[color:var(--ink)] disabled:opacity-50"
            >
              {importMut.isPending ? "Pulling…" : "Pull page into queue"}
            </button>
            <p className="text-[11px] text-muted-foreground">
              Pulls up to 20 products from CJ and adds new ones to the review queue. Safe to run repeatedly — duplicates are ignored.
            </p>
          </div>
        </div>
      </aside>

      {/* Product card */}
      <section className="rounded-sm border border-border/50 p-6">
        {isLoading ? (
          <div className="text-sm text-muted-foreground">Loading…</div>
        ) : !current ? (
          <div className="text-center py-16">
            <div className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">All caught up</div>
            <h2 className="mt-3 font-display text-3xl">No products waiting</h2>
            <p className="mt-2 text-sm text-muted-foreground">Pull a CJ page from the left to add more.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              {current.image_url && (
                <img
                  src={current.image_url}
                  alt={current.title}
                  className="w-full aspect-square object-cover rounded-sm border border-border/40"
                />
              )}
              <div className="text-[11px] text-muted-foreground">
                CJ PID: <span className="font-mono">{current.cj_pid}</span>
              </div>
              <div className="text-[11px] text-muted-foreground">
                Source cost: <span className="text-foreground">${Number(current.source_price ?? 0).toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-4">
              <Field label="Title">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-sm border border-border/50 bg-transparent px-3 py-2 text-sm"
                />
              </Field>

              <Field label="Retail price (USD)">
                <input
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full rounded-sm border border-border/50 bg-transparent px-3 py-2 text-sm"
                />
              </Field>

              <Field label="Brand">
                <select
                  value={brand}
                  onChange={(e) => {
                    setBrand(e.target.value);
                    setCategory(CATEGORIES_BY_BRAND[e.target.value]?.[0] ?? "");
                  }}
                  className="w-full rounded-sm border border-border/50 bg-background px-3 py-2 text-sm"
                >
                  {BRANDS.map((b) => (
                    <option key={b.value} value={b.value}>{b.label}</option>
                  ))}
                </select>
              </Field>

              <Field label="Gender">
                <div className="flex gap-2">
                  {GENDERS.map((g) => (
                    <button
                      key={g.value}
                      onClick={() => setGender(g.value)}
                      className={`flex-1 rounded-sm border px-3 py-2 text-[11px] uppercase tracking-[0.2em] ${
                        gender === g.value
                          ? "border-[color:var(--gold)] text-[color:var(--gold)]"
                          : "border-border/50 text-muted-foreground"
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="Category">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-sm border border-border/50 bg-background px-3 py-2 text-sm"
                >
                  {cats.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </Field>

              <Field label="Subcategory tag (e.g. jackets, sweaters, corset-tops)">
                <input
                  value={subcategory}
                  onChange={(e) => setSubcategory(e.target.value)}
                  placeholder="optional"
                  className="w-full rounded-sm border border-border/50 bg-transparent px-3 py-2 text-sm"
                />
              </Field>

              <Field label="Extra tags (comma separated)">
                <input
                  value={extraTags}
                  onChange={(e) => setExtraTags(e.target.value)}
                  placeholder="new-arrivals, best-sellers"
                  className="w-full rounded-sm border border-border/50 bg-transparent px-3 py-2 text-sm"
                />
              </Field>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => saveMut.mutate()}
                  disabled={saveMut.isPending}
                  className="flex-1 rounded-sm border border-[color:var(--gold)] bg-[color:var(--gold)] px-4 py-3 text-[11px] font-bold uppercase tracking-[0.28em] text-[color:var(--ink)] disabled:opacity-50"
                >
                  {saveMut.isPending ? "Saving…" : "Queue for Shopify"}
                </button>
                <button
                  onClick={() => skipMut.mutate()}
                  disabled={skipMut.isPending}
                  className="rounded-sm border border-border/60 px-4 py-3 text-[11px] uppercase tracking-[0.28em] text-muted-foreground hover:text-foreground"
                >
                  Skip
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-sm border border-border/40 px-3 py-2">
      <div className="text-[9px] uppercase tracking-[0.28em] text-muted-foreground">{label}</div>
      <div className="mt-1 font-display text-xl">{value}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1.5 text-[10px] uppercase tracking-[0.28em] text-muted-foreground">{label}</div>
      {children}
    </label>
  );
}
