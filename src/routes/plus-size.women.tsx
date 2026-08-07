import { createFileRoute } from "@tanstack/react-router";
import { StoreLanding } from "@/components/store-landing";
import hero from "@/assets/card-women.jpg";

export const Route = createFileRoute("/plus-size/women")({
  head: () => ({
    meta: [
      { title: "Plus Size for Women — Frass District" },
      {
        name: "description",
        content: "Extended-size fashion for women — street, classic and elevated casual.",
      },
      { property: "og:title", content: "Plus Size for Women — Frass District" },
      {
        property: "og:description",
        content: "Extended-size fashion for women — street, classic and elevated casual.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <StoreLanding
      eyebrow="Frass District · Women"
      title="Plus Size for Women"
      description="Curves first. Extended sizing across street, classic and elevated casual collections."
      image={hero}
      query='tag:"plus-size" tag:"women"'
    />
  ),
});
