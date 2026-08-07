import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { PageHeader } from "@/components/page-header";
import { PageFeedback } from "@/components/page-feedback";
import { ProductGrid } from "@/components/product-grid";

export const Route = createFileRoute("/sales-clearance")({
  head: () => ({
    meta: [
      { title: "Sales & Clearance — Frass District" },
      {
        name: "description",
        content:
          "Shop Frass sales and clearance: discounted kicks, drip, bare essentials and luxury pieces while stock lasts.",
      },
      { property: "og:title", content: "Sales & Clearance — Frass District" },
      {
        property: "og:description",
        content: "Discounted Frass products across every store. Limited stock, no code needed.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SalesClearancePage,
});

function SalesClearancePage() {
  return (
    <SiteShell>
      <PageHeader
        eyebrow="Frass District"
        title="Sales & Clearance"
        description="Last pairs, end-of-season drops and limited clearance pieces across every Frass store. No discount code needed — prices are already cut."
        crumbs={[
          { label: "Home", to: "/" },
          { label: "Frass District", to: "/shop-frass" },
          { label: "Sales & Clearance" },
        ]}
      />

      <section className="mx-auto max-w-[1600px] px-6 pb-24 lg:px-12">
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4 border-y border-border py-4">
          <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
            Filter by tag
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-[color:var(--gold)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[color:var(--gold-foreground)]">
              All Sale
            </span>
            <span className="rounded-full border border-border px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Sale
            </span>
            <span className="rounded-full border border-border px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Clearance
            </span>
          </div>
        </div>

        <ProductGrid
          query='tag:"sale" OR tag:"clearance"'
          first={48}
          emptyTitle="No sale items right now"
          emptyHint="Check back soon — new clearance drops land every Sunday and Monday."
        />
      </section>

      <PageFeedback pageTitle="Sales & Clearance" />
    </SiteShell>
  );
}
