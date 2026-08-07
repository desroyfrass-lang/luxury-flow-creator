import { createFileRoute } from "@tanstack/react-router";
import archHero from "@/assets/frass-gateway-arch.jpg.asset.json";

export const Route = createFileRoute("/gateway")({
  head: () => ({
    meta: [
      { title: "Welcome to the World of Frass — Frass OS Gateway" },
      {
        name: "description",
        content:
          "Built by people. Powered by community. Driven by execution. Shop Frass or explore the living Frass World ecosystem.",
      },
      { property: "og:title", content: "Welcome to the World of Frass" },
      {
        property: "og:description",
        content: "Choose your way in: fast commercial shopping, or the immersive Frass World ecosystem.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: GatewayPage,
});

function GatewayPage() {
  return (
    <main className="relative h-screen w-screen overflow-hidden bg-black">
      <img
        src={archHero.url}
        alt="The carved JAMAICA Luxury Fashion District archway opening onto the palm-lined Frass Kicks promenade"
        width={1920}
        height={1080}
        className="gateway-drift absolute inset-0 h-full w-full object-cover object-center"
      />
    </main>
  );
}
