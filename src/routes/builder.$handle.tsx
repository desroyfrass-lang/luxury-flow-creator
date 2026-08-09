import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * FRASS-0428A — Universal Frass Card.
 *
 * The Frass Card replaces the traditional user profile, so the old builder
 * profile address permanently forwards to the member's Frass Card. Links
 * shared before the amendment keep working forever.
 */
export const Route = createFileRoute("/builder/$handle")({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/card/$handle",
      params: { handle: params.handle.replace(/^@/, "").toLowerCase() },
      replace: true,
    });
  },
  component: () => null,
});
