import { createFileRoute } from "@tanstack/react-router";
import { StoreLanding } from "@/components/store-landing";
import hero from "@/assets/district-luxury.jpg";

export const Route = createFileRoute("/frass-luxury-house/men")({
  head: () => ({
    meta: [
      { title: "Frass Luxury House for Men — Frass District" },
      {
        name: "description",
        content: "The high house — tailored luxury, statement pieces and limited men's editions.",
      },
      { property: "og:title", content: "Frass Luxury House for Men — Frass District" },
      {
        property: "og:description",
        content: "The high house — tailored luxury, statement pieces and limited men's editions.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <StoreLanding
      eyebrow="Frass District · Men"
      title="Frass Luxury House"
      description="Tailored luxury, statement outerwear and limited editions for men who dress with intent."
      image={hero}
      query='tag:"luxury" tag:"men"'
    />
  ),
});
