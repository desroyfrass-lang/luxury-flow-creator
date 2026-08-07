import { createFileRoute } from "@tanstack/react-router";
import { StoreLanding } from "@/components/store-landing";
import hero from "@/assets/district-kids.jpg";

export const Route = createFileRoute("/frass-kids/girls")({
  head: () => ({
    meta: [
      { title: "Frass Kids for Girls — Frass District" },
      {
        name: "description",
        content: "Kicks, drip and everyday essentials for girls, built for play and personality.",
      },
      { property: "og:title", content: "Frass Kids for Girls — Frass District" },
      {
        property: "og:description",
        content: "Kicks, drip and everyday essentials for girls, built for play and personality.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <StoreLanding
      eyebrow="Frass District · Girls"
      title="Frass Kids for Girls"
      description="Bright, bold and built to last — footwear and fits for girls with their own style."
      image={hero}
      query='tag:"kids" tag:"girls"'
    />
  ),
});
