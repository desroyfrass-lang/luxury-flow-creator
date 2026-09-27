import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { checkIsAdmin } from "@/lib/admin.functions";
import { useAuthUserId } from "@/lib/auth/identity-watch";

// Step 3 — every cached answer is keyed to the signed-in person, so one
// account's Founder result can never be reused for another.
export function useIsAdmin() {
  const { userId } = useAuthUserId();
  const isAdminFn = useServerFn(checkIsAdmin);
  const { data } = useQuery({
    queryKey: ["is-admin", userId],
    queryFn: () => isAdminFn(),
    enabled: Boolean(userId),
    staleTime: 60_000,
  });
  return Boolean(userId && data);
}

/** Tri-state role check for flows that must not act before Founder identity resolves. */
export function useIsAdminStatus() {
  const { userId, ready } = useAuthUserId();
  const isAdminFn = useServerFn(checkIsAdmin);
  const query = useQuery({
    queryKey: ["is-admin-status", userId],
    queryFn: () => isAdminFn(),
    enabled: ready && Boolean(userId),
    staleTime: 60_000,
  });
  return {
    isAdmin: userId ? query.data : undefined,
    loading: !ready || (Boolean(userId) && query.isLoading),
  };
}
