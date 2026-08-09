import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { SiteShell } from "@/components/site-shell";
import { PageFeedback } from "@/components/page-feedback";
import { PRODUCT_STATUSES, DROP_STATUSES, statusLabel } from "@/lib/creation";
import {
  listCreationWorkspace,
  createBuilderProduct,
  updateBuilderProduct,
  deleteBuilderProduct,
  createBuilderCollection,
  deleteBuilderCollection,
  createBuilderDrop,
  updateBuilderDrop,
  deleteBuilderDrop,
  type BuilderProduct,
  type BuilderCollection,
  type BuilderDrop,
} from "@/lib/creation.functions";

export const Route = createFileRoute("/_authenticated/creation")({
  head: () => ({
    meta: [
      { title: "Creation District — Frass Operating System" },
      {
        name: "description",
        content:
          "Make things inside Frass OS — build products, group them into collections, and plan your drops.",
      },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: CreationPage,
});

const inputClass =
  "w-full rounded-sm border border-border bg-background/60 px-4 py-3 text-sm outline-none focus:border-[color:var(--gold)]";
const goldButton =
  "lux-press rounded-sm border border-[color:var(--gold)] bg-[color:var(--gold)] px-6 py-3 text-[11px] font-bold uppercase tracking-[0.3em] text-[color:var(--ink)] disabled:opacity-60";

type Tab = "products" | "collections" | "drops";

function CreationPage() {
  const load = useServerFn(listCreationWorkspace);
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["creation"], queryFn: () => load() });
  const [tab, setTab] = useState<Tab>("products");

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ["creation"] });
  };

  const products = data?.products ?? [];
  const collections = data?.collections ?? [];
  const drops = data?.drops ?? [];

  return (
    <SiteShell>
      <div className="mx-auto max-w-5xl px-6 py-16">
        <header className="text-center">
          <div className="text-[11px] uppercase tracking-[0.4em] text-[color:var(--gold)]">
            Creation District
          </div>
          <h1 className="mt-4 font-display text-4xl leading-tight md:text-5xl">
            Where you make things.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground">
            Build a product, group your work into collections, and plan the drop that puts it in
            front of people. Everything here is yours and private until you publish it.
          </p>
        </header>

        <div className="mt-10 flex justify-center gap-3">
          {(["products", "collections", "drops"] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`rounded-sm border px-5 py-2 text-[10px] uppercase tracking-[0.25em] transition ${
                tab === t
                  ? "border-[color:var(--gold)] text-[color:var(--gold)]"
                  : "border-border text-muted-foreground hover:border-[color:var(--gold)]"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {isLoading && (
          <p className="mt-10 text-center text-sm text-muted-foreground">
            Opening your workshop…
          </p>
        )}

        {!isLoading && tab === "products" && (
          <ProductsTab
            products={products}
            collections={collections}
            drops={drops}
            onChange={invalidate}
          />
        )}
        {!isLoading && tab === "collections" && (
          <CollectionsTab collections={collections} products={products} onChange={invalidate} />
        )}
        {!isLoading && tab === "drops" && (
          <DropsTab drops={drops} products={products} onChange={invalidate} />
        )}

        <div className="mt-16 text-center">
          <Link
            to="/builder-hall"
            className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground transition hover:text-[color:var(--gold)]"
          >
            ← Back to Builder Hall
          </Link>
        </div>

        <PageFeedback pageTitle="Creation District" />
      </div>
    </SiteShell>
  );
}

function ProductsTab({
  products,
  collections,
  drops,
  onChange,
}: {
  products: BuilderProduct[];
  collections: BuilderCollection[];
  drops: BuilderDrop[];
  onChange: () => void;
}) {
  const create = useServerFn(createBuilderProduct);
  const update = useServerFn(updateBuilderProduct);
  const remove = useServerFn(deleteBuilderProduct);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [tags, setTags] = useState("");
  const [collectionId, setCollectionId] = useState("");
  const [dropId, setDropId] = useState("");

  const add = useMutation({
    mutationFn: () =>
      create({
        data: {
          title,
          description,
          price,
          image_url: imageUrl,
          tags: tags.split(","),
          collection_id: collectionId || null,
          drop_id: dropId || null,
        },
      }),
    onSuccess: () => {
      setTitle("");
      setDescription("");
      setPrice("");
      setImageUrl("");
      setTags("");
      toast.success("Product created.");
      onChange();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const patch = useMutation({
    mutationFn: (vars: { id: string; status?: string; collection_id?: string | null; drop_id?: string | null }) =>
      update({ data: vars }),
    onSuccess: onChange,
    onError: (e: Error) => toast.error(e.message),
  });

  const drop = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => {
      toast.success("Product deleted.");
      onChange();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <>
      <section className="mt-10 rounded-2xl border border-[color:var(--gold)]/40 bg-background/70 p-8 backdrop-blur">
        <div className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--gold)]">
          Make a product
        </div>
        <form
          className="mt-5 grid gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            add.mutate();
          }}
        >
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Product name"
            className={inputClass}
          />
          <div className="grid gap-4 sm:grid-cols-3">
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Price (e.g. 89.99)"
              className={inputClass}
            />
            <select
              value={collectionId}
              onChange={(e) => setCollectionId(e.target.value)}
              className={inputClass}
            >
              <option value="">No collection</option>
              {collections.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <select
              value={dropId}
              onChange={(e) => setDropId(e.target.value)}
              className={inputClass}
            >
              <option value="">No drop</option>
              {drops.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
          <input
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="Image link (optional)"
            className={inputClass}
          />
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Tags, comma separated"
            className={inputClass}
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="What is it, who is it for, and why does it matter?"
            className={inputClass}
          />
          <div>
            <button type="submit" disabled={add.isPending} className={goldButton}>
              {add.isPending ? "Creating…" : "Create product"}
            </button>
          </div>
        </form>
      </section>

      <section className="mt-8 grid gap-4">
        {products.length === 0 && (
          <p className="rounded-2xl border border-border/60 bg-background/40 p-8 text-center text-sm text-muted-foreground">
            Nothing made yet. Your first product starts above.
          </p>
        )}
        {products.map((p) => (
          <article
            key={p.id}
            className="rounded-2xl border border-border/70 bg-background/60 p-6 backdrop-blur"
          >
            <div className="flex flex-wrap items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-[color:var(--gold)]">
              <span>{statusLabel(PRODUCT_STATUSES, p.status)}</span>
              {p.collection_id && (
                <span className="text-muted-foreground">
                  {collections.find((c) => c.id === p.collection_id)?.name ?? "Collection"}
                </span>
              )}
              {p.drop_id && (
                <span className="text-muted-foreground">
                  {drops.find((d) => d.id === p.drop_id)?.name ?? "Drop"}
                </span>
              )}
            </div>
            <div className="mt-2 flex flex-wrap items-baseline justify-between gap-3">
              <h3 className="font-display text-xl">{p.title}</h3>
              {p.price !== null && (
                <span className="text-sm text-muted-foreground">
                  {p.currency} {Number(p.price).toFixed(2)}
                </span>
              )}
            </div>
            {p.image_url && (
              <img
                src={p.image_url}
                alt={p.title}
                loading="lazy"
                className="mt-4 h-40 w-full rounded-sm object-cover"
              />
            )}
            {p.description && (
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                {p.description}
              </p>
            )}
            {p.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {p.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-border px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
            <div className="mt-5 flex flex-wrap items-center gap-4 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
              <select
                value={p.status}
                onChange={(e) => patch.mutate({ id: p.id, status: e.target.value })}
                className="rounded-sm border border-border bg-background/60 px-3 py-2 text-[10px] uppercase tracking-[0.2em]"
              >
                {PRODUCT_STATUSES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
              <select
                value={p.collection_id ?? ""}
                onChange={(e) => patch.mutate({ id: p.id, collection_id: e.target.value || null })}
                className="rounded-sm border border-border bg-background/60 px-3 py-2 text-[10px] uppercase tracking-[0.2em]"
              >
                <option value="">No collection</option>
                {collections.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <select
                value={p.drop_id ?? ""}
                onChange={(e) => patch.mutate({ id: p.id, drop_id: e.target.value || null })}
                className="rounded-sm border border-border bg-background/60 px-3 py-2 text-[10px] uppercase tracking-[0.2em]"
              >
                <option value="">No drop</option>
                {drops.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => drop.mutate(p.id)}
                className="transition hover:text-destructive"
              >
                Delete
              </button>
            </div>
          </article>
        ))}
      </section>
    </>
  );
}

function CollectionsTab({
  collections,
  products,
  onChange,
}: {
  collections: BuilderCollection[];
  products: BuilderProduct[];
  onChange: () => void;
}) {
  const create = useServerFn(createBuilderCollection);
  const remove = useServerFn(deleteBuilderCollection);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const add = useMutation({
    mutationFn: () => create({ data: { name, description } }),
    onSuccess: () => {
      setName("");
      setDescription("");
      toast.success("Collection created.");
      onChange();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const drop = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => {
      toast.success("Collection removed.");
      onChange();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <>
      <section className="mt-10 rounded-2xl border border-[color:var(--gold)]/40 bg-background/70 p-8 backdrop-blur">
        <div className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--gold)]">
          Start a collection
        </div>
        <form
          className="mt-5 grid gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            add.mutate();
          }}
        >
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Collection name"
            className={inputClass}
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="The story that holds these pieces together."
            className={inputClass}
          />
          <div>
            <button type="submit" disabled={add.isPending} className={goldButton}>
              {add.isPending ? "Creating…" : "Create collection"}
            </button>
          </div>
        </form>
      </section>

      <section className="mt-8 grid gap-4">
        {collections.length === 0 && (
          <p className="rounded-2xl border border-border/60 bg-background/40 p-8 text-center text-sm text-muted-foreground">
            No collections yet. Group your work when it starts to have a shape.
          </p>
        )}
        {collections.map((c) => {
          const count = products.filter((p) => p.collection_id === c.id).length;
          return (
            <article
              key={c.id}
              className="rounded-2xl border border-border/70 bg-background/60 p-6 backdrop-blur"
            >
              <div className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--gold)]">
                {count} {count === 1 ? "product" : "products"}
              </div>
              <h3 className="mt-2 font-display text-xl">{c.name}</h3>
              {c.description && (
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {c.description}
                </p>
              )}
              <button
                type="button"
                onClick={() => drop.mutate(c.id)}
                className="mt-5 text-[10px] uppercase tracking-[0.25em] text-muted-foreground transition hover:text-destructive"
              >
                Delete
              </button>
            </article>
          );
        })}
      </section>
    </>
  );
}

function DropsTab({
  drops,
  products,
  onChange,
}: {
  drops: BuilderDrop[];
  products: BuilderProduct[];
  onChange: () => void;
}) {
  const create = useServerFn(createBuilderDrop);
  const update = useServerFn(updateBuilderDrop);
  const remove = useServerFn(deleteBuilderDrop);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [dropDate, setDropDate] = useState("");

  const add = useMutation({
    mutationFn: () => create({ data: { name, description, drop_date: dropDate } }),
    onSuccess: () => {
      setName("");
      setDescription("");
      setDropDate("");
      toast.success("Drop planned.");
      onChange();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const patch = useMutation({
    mutationFn: (vars: { id: string; status: string }) => update({ data: vars }),
    onSuccess: onChange,
    onError: (e: Error) => toast.error(e.message),
  });

  const dropIt = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => {
      toast.success("Drop removed.");
      onChange();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <>
      <section className="mt-10 rounded-2xl border border-[color:var(--gold)]/40 bg-background/70 p-8 backdrop-blur">
        <div className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--gold)]">
          Plan a drop
        </div>
        <form
          className="mt-5 grid gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            add.mutate();
          }}
        >
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Drop name"
            className={inputClass}
          />
          <input
            type="date"
            value={dropDate}
            onChange={(e) => setDropDate(e.target.value)}
            className={inputClass}
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="What makes this drop worth showing up for?"
            className={inputClass}
          />
          <div>
            <button type="submit" disabled={add.isPending} className={goldButton}>
              {add.isPending ? "Planning…" : "Plan drop"}
            </button>
          </div>
        </form>
      </section>

      <section className="mt-8 grid gap-4">
        {drops.length === 0 && (
          <p className="rounded-2xl border border-border/60 bg-background/40 p-8 text-center text-sm text-muted-foreground">
            No drops planned yet. A drop is how your work meets the world.
          </p>
        )}
        {drops.map((d) => {
          const count = products.filter((p) => p.drop_id === d.id).length;
          return (
            <article
              key={d.id}
              className="rounded-2xl border border-border/70 bg-background/60 p-6 backdrop-blur"
            >
              <div className="flex flex-wrap items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-[color:var(--gold)]">
                <span>{statusLabel(DROP_STATUSES, d.status)}</span>
                {d.drop_date && (
                  <span className="text-muted-foreground">
                    {new Date(`${d.drop_date}T00:00:00`).toLocaleDateString()}
                  </span>
                )}
                <span className="text-muted-foreground">
                  {count} {count === 1 ? "product" : "products"}
                </span>
              </div>
              <h3 className="mt-2 font-display text-xl">{d.name}</h3>
              {d.description && (
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {d.description}
                </p>
              )}
              <div className="mt-5 flex flex-wrap items-center gap-4 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                <select
                  value={d.status}
                  onChange={(e) => patch.mutate({ id: d.id, status: e.target.value })}
                  className="rounded-sm border border-border bg-background/60 px-3 py-2 text-[10px] uppercase tracking-[0.2em]"
                >
                  {DROP_STATUSES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => dropIt.mutate(d.id)}
                  className="transition hover:text-destructive"
                >
                  Delete
                </button>
              </div>
            </article>
          );
        })}
      </section>
    </>
  );
}
