// F1 — FV Studios → Fashion Studio. Private (parent /studios gate: Founder/admin
// server-verified). Shows a verified product handoff read-only; no writes,
// generation, charges, provider orders or publishing.
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getProductHandoff } from "@/lib/vendors/product-handoff.functions";
import { FASHION_SECTIONS, parseFashionSearch } from "@/lib/studios/fashion-studio";
import { FrassyChat } from "@/components/frassy-chat";

export const Route = createFileRoute("/_authenticated/studios/fashion")({
  validateSearch: parseFashionSearch,
  head: () => ({
    meta: [
      { title: "Fashion Studio | FV Studios" },
      { name: "description", content: "Private fashion workspace: product context, designs, specs, samples and approvals." },
      { property: "og:title", content: "Fashion Studio | FV Studios" },
      { property: "og:description", content: "Fashionista Frassy's private fashion workspace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: FashionStudio,
});

function FashionStudio() {
  const { productId, variantId } = Route.useSearch();
  const fetchHandoff = useServerFn(getProductHandoff);
  const handoff = useQuery({
    queryKey: ["fashion-handoff", productId, variantId],
    queryFn: () => fetchHandoff({ data: { productId: productId!, variantId: variantId! } }),
    enabled: Boolean(productId && variantId),
    retry: false,
  });
  const [frassySees, setFrassySees] = useState<{ verified: boolean; reason: string } | null>(null);

  return (
    <div className="fashion-studio-light space-y-8 rounded-sm p-4 sm:p-6">
      <nav aria-label="Fashion Studio location" className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">FV Studios → <span className="text-[color:var(--gold)]">Fashion Studio</span></nav>

      <section className="fashion-studio-welcome" aria-label="Fashionista Frassy greeting">
        <div className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--gold)]">Fashionista Frassy · creative director</div>
        <h1 className="mt-1 font-display text-2xl uppercase tracking-tight">Welcome to the Fashion Studio</h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">Same Frassy, wearing her creative director hat. Nothing gets made, ordered, charged or published from here without your word.</p>
      </section>

      <section aria-label="Product in this project" className="rounded-lg border border-border/70 p-5">
        <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Product in this project · read-only</div>
        {!productId || !variantId ? (
          <p className="mt-2 text-sm text-muted-foreground">No product brought in. On <Link to="/workspace/vendors" className="underline">Vendor Brands</Link>, pick a colour and size, press "Prepare verified handoff", then "Open in Fashion Studio".</p>
        ) : handoff.isLoading ? (
          <p className="mt-2 text-sm">Checking the saved product…</p>
        ) : handoff.error ? (
          <p className="mt-2 text-sm text-destructive" role="alert">{handoff.error instanceof Error ? handoff.error.message : "This product could not be verified."} Nothing is shown.</p>
        ) : handoff.data ? (
          <div className="mt-3 flex flex-col gap-4 sm:flex-row">
            {handoff.data.photo.url ? (
              <img src={handoff.data.photo.url} alt={`${handoff.data.name} · supplier variant photo`} className="h-48 w-40 object-contain" />
            ) : <div className="flex h-48 w-40 items-center justify-center border border-dashed border-border p-2 text-center text-xs text-muted-foreground">{"reason" in handoff.data.photo ? handoff.data.photo.reason : ""}</div>}
            <dl className="space-y-1 text-sm" role="status">
              <div className="font-display text-xl">{handoff.data.name}</div>
              <div className="text-muted-foreground">{handoff.data.categoryPath}</div>
              <div>{handoff.data.variant.colour}{handoff.data.variant.size ? ` / ${handoff.data.variant.size}` : ""} · SKU {handoff.data.variant.sku ?? "not supplied"}</div>
              <div className="break-all text-xs text-muted-foreground">Variant {handoff.data.variant.sourceVariantRef} · {handoff.data.status.draft} · {handoff.data.status.publication}</div>
              <div className="text-xs text-muted-foreground">Verified from saved records on the server.</div>
            </dl>
          </div>
        ) : null}
      </section>

      <section aria-label="Fashionista Frassy assistant">
        <FrassyChat
          embedded
          tone="light"
          presentation="studio"
          presentationRoom="fashion"
          workspaceContext={FASHION_ROOM_CONTEXT}
          verifiedFashionHandoff={productId && variantId ? { productId, variantId } : undefined}
          onFashionHandoffStatus={setFrassySees}
        />
        <p className="mt-2 text-xs text-muted-foreground" role="status" aria-label="What Frassy can see">
          {!productId || !variantId
            ? "Frassy sees no product: none was brought in."
            : !frassySees
              ? "Frassy checks the product on the server when you send your first message."
              : frassySees.verified
                ? `Verified on the server. ${frassySees.reason}`
                : `Frassy cannot see this product. ${frassySees.reason}`}
        </p>
      </section>

      <section aria-label="Fashion project sections" className="grid gap-3 sm:grid-cols-2">
        {FASHION_SECTIONS.map((s) => (
          <div key={s.id} className="rounded-lg border border-border/70 p-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-display text-base uppercase tracking-tight">{s.title}</h2>
              <span className="rounded-full border border-border px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{s.status === "connected" ? "Opens existing tool" : "Not connected yet"}</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{s.plain}</p>
            {s.blocker ? <p className="mt-2 text-xs">{s.blocker}</p> : null}
            {s.link ? <Link to={s.link.to} className="mt-2 inline-block text-xs underline">{s.link.label} (product not carried over)</Link> : null}
          </div>
        ))}
      </section>
    </div>
  );
}

// Neutral room text only. Product facts reach Frassy solely through the
// server-reverified handoff block in /api/chat, never from this browser.
const FASHION_ROOM_CONTEXT =
  "Fashion Studio. Product facts, if any, are supplied only by the server-verified handoff block. No image/video, capsule, try-on, order, charge, save, or publication tool is connected here.";
