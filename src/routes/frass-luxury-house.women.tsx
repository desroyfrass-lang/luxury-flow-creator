import { createFileRoute } from "@tanstack/react-router";
import { StoreLanding } from "@/components/store-landing";
import hero from "@/assets/district-luxury.jpg";

export const Route = createFileRoute("/frass-luxury-house/women")({
  head: () => ({
    meta: [
      { title: "Frass Luxury House for Women — Frass District" },
      {
        name: "description",
        content: "The high house — couture-leaning luxury and limited women's editions.",
      },
      { property: "og:title", content: "Frass Luxury House for Women — Frass District" },
      {
        property: "og:description",
        content: "The high house — couture-leaning luxury and limited women's editions.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <StoreLanding
      eyebrow="Frass District · Women"
      title="Frass Luxury House"
      description="Couture-leaning silhouettes, evening pieces and limited editions for women."
      image={hero}
      query='tag:"luxury" tag:"women"'
    />
  ),
});
