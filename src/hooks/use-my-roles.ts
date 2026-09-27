import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useAuthUserId } from "@/lib/auth/identity-watch";
import { listMyRoles } from "@/lib/roles.functions";
import type { AppRole } from "@/lib/roles";

/** Roles held by the signed-in user (empty when signed out). */
export function useMyRoles() {
  const { userId, ready } = useAuthUserId();
  const hasSession = Boolean(userId);
  const rolesFn = useServerFn(listMyRoles);

  const query = useQuery({
    queryKey: ["my-roles", userId],
    queryFn: () => rolesFn(),
    enabled: ready && hasSession,
    staleTime: 60_000,
  });

  return {
    roles: (query.data ?? []) as AppRole[],
    signedIn: hasSession,
    loading: !ready || (hasSession && query.isLoading),
  };
}

export type AccountSection = {
  label: string;
  to: string;
  items: { label: string; to: string; note?: string }[];
};

/** Resolves the single account section shown at the end of the nav bar. */
export function useAccountSection(): AccountSection | null {
  const { roles, signedIn } = useMyRoles();
  if (!signedIn) return null;

  const has = (r: AppRole) => roles.includes(r);

  if (has("super_admin") || has("admin")) {
    return {
      label: "Owner · Operator",
      to: "/frassy",
      items: [
        { label: "Frassy OS", to: "/frassy", note: "Command center" },
        { label: "Founder Control Room", to: "/control-room" },
        { label: "Admin Console", to: "/control-room" },
        { label: "Roles & Access", to: "/admin/roles" },
        { label: "My Archive", to: "/try-on", note: "Try-on hauls" },
      ],
    };
  }

  if (has("staff") || has("moderator")) {
    return {
      label: "Operator",
      to: "/control-room",
      items: [
        { label: "Admin Console", to: "/control-room" },
        { label: "Approvals", to: "/admin/approvals" },
        { label: "My Archive", to: "/try-on" },
      ],
    };
  }

  if (has("partner") || has("ambassador") || has("affiliate") || has("designer")) {
    return {
      label: "Frass Hill",
      to: "/workspace",
      items: [
        { label: "Your Dashboard", to: "/workspace" },
        { label: "Insights", to: "/workspace/insights" },
        { label: "Profile", to: "/workspace/profile" },
        { label: "Builder Vault", to: "/vault" },
        { label: "My Archive", to: "/try-on" },
      ],
    };
  }

  return {
    label: "My Archive",
    to: "/try-on",
    items: [
      { label: "Try-On Hauls", to: "/try-on", note: "Your looks & photos" },
      { label: "Builder Vault", to: "/vault" },
      { label: "Rewards", to: "/rewards" },
      { label: "Profile", to: "/workspace/profile" },
    ],
  };
}
