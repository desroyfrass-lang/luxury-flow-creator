import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import {
  ROLE_OPTIONS,
  grantRole,
  listUsersWithRoles,
  revokeRole,
  type AppRole,
} from "@/lib/roles.functions";

export const Route = createFileRoute("/_authenticated/admin/roles")({
  component: RolesPage,
});

function RolesPage() {
  const listFn = useServerFn(listUsersWithRoles);
  const grantFn = useServerFn(grantRole);
  const revokeFn = useServerFn(revokeRole);
  const qc = useQueryClient();
  const [q, setQ] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "users-roles"],
    queryFn: () => listFn(),
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin", "users-roles"] });

  const users = (data ?? []).filter((u) =>
    q ? (u.email ?? "").toLowerCase().includes(q.toLowerCase()) : true,
  );

  return (
    <div>
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl">Roles & Access</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Grant platform roles to users. Roles unlock dashboards and permissions across the
            ecosystem.
          </p>
        </div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search email…"
          className="w-64 rounded-sm border border-border bg-background px-3 py-2 text-sm outline-none focus:border-[color:var(--gold)]"
        />
      </div>

      {isLoading ? (
        <div className="text-sm text-muted-foreground">Loading users…</div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border/60">
          <table className="w-full text-sm">
            <thead className="bg-foreground/5 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3">Email</th>
                <th className="text-left px-4 py-3">Roles</th>
                <th className="text-left px-4 py-3 w-64">Grant</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-border/50">
                  <td className="px-4 py-3">
                    <div className="font-medium">{u.email ?? "—"}</div>
                    <div className="text-[10px] text-muted-foreground font-mono">{u.id}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      {u.roles.length === 0 && (
                        <span className="text-xs text-muted-foreground">No roles</span>
                      )}
                      {u.roles.map((r) => (
                        <button
                          key={r}
                          onClick={async () => {
                            try {
                              await revokeFn({ data: { userId: u.id, role: r as AppRole } });
                              toast.success(`Revoked ${r}`);
                              invalidate();
                            } catch (e) {
                              toast.error(e instanceof Error ? e.message : "Failed");
                            }
                          }}
                          className="group inline-flex items-center gap-1 rounded-full border border-[color:var(--gold)]/40 bg-[color:var(--gold)]/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-[color:var(--gold)] hover:border-red-400/60 hover:bg-red-500/10 hover:text-red-300 transition"
                          title="Click to revoke"
                        >
                          {r}
                          <span className="opacity-40 group-hover:opacity-100">×</span>
                        </button>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      defaultValue=""
                      onChange={async (e) => {
                        const role = e.target.value as AppRole;
                        if (!role) return;
                        e.target.value = "";
                        try {
                          await grantFn({ data: { userId: u.id, role } });
                          toast.success(`Granted ${role}`);
                          invalidate();
                        } catch (err) {
                          toast.error(err instanceof Error ? err.message : "Failed");
                        }
                      }}
                      className="w-full rounded-sm border border-border bg-background px-2 py-1.5 text-xs outline-none focus:border-[color:var(--gold)]"
                    >
                      <option value="">+ Add role…</option>
                      {ROLE_OPTIONS.filter((r) => !u.roles.includes(r)).map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
