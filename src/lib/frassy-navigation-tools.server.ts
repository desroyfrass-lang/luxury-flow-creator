// FRASS-0513 — Frassy Navigation.
//
// Constitutional rule: no member is ever told to type or edit a URL. When
// someone says where they want to go, Frassy takes them there. This tool is
// how she does it — the chat surface performs the navigation from its result.
import { tool } from "ai";
import { z } from "zod";
import { CORE_ROUTES, coreRouteByKey, matchSpokenDestination } from "@/lib/navigation/core-routes";

export const openPlace = tool({
  description:
    "FRASS-0513 NAVIGATION. Take the member to a core place in Frass (onboarding, workspace, the Daily, Money Moves, marketplace, Financial Center, Builder Vault, FOR ME, Frass Card, Welcome Hall, Founder Mode). Call this WHENEVER someone asks to go somewhere, start onboarding, or open a feature. NEVER answer with a URL or tell a member to navigate manually — call this instead and then say one short line like 'Opening it now.'",
  inputSchema: z.object({
    destination: z
      .string()
      .describe(
        `Either a destination key (${CORE_ROUTES.map((r) => r.key).join(", ")}) or the member's own words, e.g. "start onboarding".`,
      ),
  }),
  execute: async ({ destination }) => {
    const route = coreRouteByKey(destination.trim().toLowerCase()) ?? matchSpokenDestination(destination);
    if (!route) {
      return {
        opened: false,
        reason: "no_matching_place",
        places: CORE_ROUTES.map((r) => ({ key: r.key, label: r.label })),
      };
    }
    return {
      opened: true,
      navigate: {
        key: route.key,
        label: route.label,
        path: route.path,
        requiresAuth: route.requiresAuth,
        founderOnly: route.founderOnly ?? false,
      },
    };
  },
});

export function buildNavigationTools() {
  return { open_place: openPlace };
}
