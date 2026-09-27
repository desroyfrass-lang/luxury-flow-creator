import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useAuthUserId } from "@/lib/auth/identity-watch";
import { getMyBusinessRoles, type BusinessRole } from "@/lib/workspace.functions";

export function useWorkspaceRoles(): BusinessRole[] {
  const { userId } = useAuthUserId();
  const fn = useServerFn(getMyBusinessRoles);

  const { data } = useQuery({
    queryKey: ["workspace-roles", userId],
    queryFn: () => fn(),
    enabled: Boolean(userId),
    staleTime: 60_000,
  });

  return (data ?? []) as BusinessRole[];
}
