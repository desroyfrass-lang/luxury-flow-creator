import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { PageHeader } from "@/components/page-header";
import { Flame, Smartphone, Home, Sparkles, HeartPulse, PawPrint } from "lucide-react";

export const Route = createFileRoute("/social-media-virals")({
  head: () => ({
    meta: [
      { title: "Social Media Virals — Frass Kicks" },
      { name: "description", content: "TikTok Shop viral finds — trending products, tech, home, beauty, wellness, and pets curated by Frass." },
      { property: "og:title", content: "Social Media Virals — Frass Kicks" },
      { property: "og:description", content: "TikTok Shop viral finds curated by Frass." },
    ],
  }),
  component: SocialMediaViralsPage,
});

const SECTIONS: { icon: typeof Flame; title: string; items: string[] }[] = [
  {
    icon: Flame,
    title: "Trending & Viral",
    items: [
      "TikTok Made Me Buy It",
      "Best Sellers",
      "New Arrivals",
      "Flash Deals",
      "Creator Picks",
      "Viral Beauty Finds",
      "Viral Tech Finds",
      "Viral Problem Solvers",
      "Limited-Time Offers",
    ],
  },
  {
    icon: Smartphone,
    title: "Tech & Phone Accessories",
    items: [
      "Phone Cases",
      "Chargers & Power Banks",
      "Wireless Accessories",
      "Phone Mounts & Holders",
      "Selfie & Camera Accessories",
      "Audio & Bluetooth",
      "Smart Gadgets",
    ],
  },
  {
    icon: Home,
    title: "Home & Kitchen",
    items: [
      "Home Essentials",
      "Kitchen Essentials",
      "Cookware & Dining",
      "Home Décor",
      "Home Organization",
      "Cleaning Essentials",
      "Smart Home",
      "Seasonal Home",
    ],
  },
  {
    icon: Sparkles,
    title: "Beauty & Personal Care",
    items: [
      "Skincare",
      "Makeup",
      "Hair Tools",
      "Fragrances",
      "Bath & Body",
      "Beauty Devices",
    ],
  },
  {
    icon: HeartPulse,
    title: "Health & Wellness",
    items: [
      "Fitness Equipment",
      "Wellness Devices",
      "Recovery & Massage",
      "Sleep & Relaxation",
      "Vitamins & Supplements",
      "Personal Care",
    ],
  },
  {
    icon: PawPrint,
    title: "Pets",
    items: ["Dog Supplies", "Cat Supplies", "Pet Health", "Cat Accessories"],
  },
];

function SocialMediaViralsPage() {
  return (
    <SiteShell>
      <PageHeader
        eyebrow="TikTok Shop"
        title="Social Media Virals"
        description="The internet's most-wanted — curated drops from TikTok Shop and beyond."
        crumbs={[{ label: "Home", to: "/" }, { label: "Social Media Virals" }]}
      />
      <section className="mx-auto max-w-[1600px] px-6 lg:px-12 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SECTIONS.map(({ icon: Icon, title, items }) => (
            <div
              key={title}
              className="group rounded-2xl border border-border/70 bg-background/60 backdrop-blur p-6 hover:border-[color:var(--gold)] transition"
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/70 text-[color:var(--gold)]">
                  <Icon className="h-5 w-5" />
                </span>
                <h2 className="font-display text-2xl">{title}</h2>
              </div>
              <ul className="mt-5 space-y-2">
                {items.map((item) => (
                  <li key={item}>
                    <Link
                      to="/social-media-virals"
                      className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition"
                    >
                      <span>{item}</span>
                      <span className="opacity-40 group-hover:opacity-100">→</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
