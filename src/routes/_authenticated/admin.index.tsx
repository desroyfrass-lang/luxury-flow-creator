import { createFileRoute, redirect } from "@tanstack/react-router";

/** One Founder door: /admin lands in the Founder Control Room. The individual
 *  /admin/* tools are untouched and keep their own server-side authorisation. */
export const Route = createFileRoute("/_authenticated/admin/")({
  beforeLoad: () => {
    throw redirect({ to: "/control-room", replace: true });
  },
});
