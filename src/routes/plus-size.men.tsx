import { createFileRoute } from "@tanstack/react-router";
import { StoreLanding } from "@/components/store-landing";
import hero from "@/assets/card-men.jpg";

export const Route = createFileRoute("/plus-size/men")({
  head: () => ({
    meta: [
      { title: "Plus Size for Men — Frass District" },
      {
        name: "description",
        content: "Extended-size streetwear, classic and casual fits for men, cut to move.",
      },
      { property: "og:title", content: "Plus Size for Men — Frass District" },
      {
        property: "og:description",
        content: "Extended-size streetwear, classic and casual fits for men, cut to move.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <StoreLanding
      eyebrow="Frass District · Men"
      title="Plus Size for Men"
      description="Extended sizing done properly — street, classic and casual fits tailored for real bodies."
      image={hero}
      query='tag:"plus-size" tag:"men"'
    />
  ),
});
