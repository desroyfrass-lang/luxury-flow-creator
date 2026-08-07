import { createFileRoute } from "@tanstack/react-router";
import { StoreLanding } from "@/components/store-landing";
import hero from "@/assets/district-kids.jpg";

export const Route = createFileRoute("/frass-kids/boys")({
  head: () => ({
    meta: [
      { title: "Frass Kids for Boys — Frass District" },
      {
        name: "description",
        content: "Kicks, drip and everyday essentials for boys, built for play and personality.",
      },
      { property: "og:title", content: "Frass Kids for Boys — Frass District" },
      {
        property: "og:description",
        content: "Kicks, drip and everyday essentials for boys, built for play and personality.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <StoreLanding
      eyebrow="Frass District · Boys"
      title="Frass Kids for Boys"
      description="Little legends. Kicks, drip and essentials made to run, climb and stand out."
      image={hero}
      query='tag:"kids" tag:"boys"'
    />
  ),
});
