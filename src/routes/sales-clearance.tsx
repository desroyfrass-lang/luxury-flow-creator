import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { PageHeader } from "@/components/page-header";
import { PageFeedback } from "@/components/page-feedback";
import { SaleWall, type SaleColumn } from "@/components/sale-wall";
import { WallSigns } from "@/components/wall-signs";
import heroImage from "@/assets/sale-clearance-hero.jpg";

export const Route = createFileRoute("/sales-clearance")({
  head: () => ({
    meta: [
      { title: "Sales & Clearance — Frass District" },
      {
        name: "description",
        content:
          "Shop the Frass unisex clearance floor: men's, women's and mixed clearance racks with discounted kicks, drip and luxury pieces while stock lasts.",
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

const COLUMNS: SaleColumn[] = [
  {
    id: "men",
    label: "Men",
    caption: "Marked down",
    query: '(tag:"sale" OR tag:"clearance") AND (tag:"men" OR product_type:Men)',
  },
  {
    id: "women",
    label: "Women",
    caption: "Marked down",
    query: '(tag:"sale" OR tag:"clearance") AND (tag:"women" OR product_type:Women)',
  },
  {
    id: "clearance",
    label: "Clearance",
    caption: "Men & women — final",
    query: 'tag:"clearance"',
  },
];

const SIGNS = ["Men", "Women", "Clearance"];

function SalesClearancePage() {
  return (
    <SiteShell>
      <PageHeader
        eyebrow="Frass District"
        title="Sales & Clearance"
        description="One unisex clearance floor. Men's rack, women's rack and the mixed circle rack — last pairs and end-of-season pieces at cut prices. No code needed."
        crumbs={[
          { label: "Home", to: "/" },
          { label: "Frass District", to: "/shop-frass" },
          { label: "Sales & Clearance" },
        ]}
      />

      <WallSigns labels={SIGNS} />

      <section className="relative mx-auto max-w-[1600px] px-2 md:px-12">
        <div className="relative overflow-hidden rounded-2xl border border-[color:var(--gold)]/25 md:rounded-[2rem]">
          <img
            src={heroImage}
            alt="Frass clearance floor: men's rack, women's rack and a circular mixed clearance rack with shoes and hats"
            width={1920}
            height={768}
            className="h-[34vw] min-h-[180px] w-full object-cover md:h-auto"
          />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.55),transparent_35%,rgba(0,0,0,0.5))]" />
        </div>
      </section>

      {/* Three scrolling product columns aligned to the racks above */}
      <SaleWall columns={COLUMNS} />

      <PageFeedback pageTitle="Sales & Clearance" />
    </SiteShell>
  );
}
