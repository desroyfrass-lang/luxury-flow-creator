import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  listPartnerVendors,
  grantPartnerVendor,
  revokePartnerVendor,
} from "@/lib/partner-vendors.functions";

export const Route = createFileRoute("/_authenticated/admin/partner-vendors")({
  component: PartnerVendorsAdmin,
});

function PartnerVendorsAdmin() {
  const listFn = useServerFn(listPartnerVendors);
  const grantFn = useServerFn(grantPartnerVendor);
  const revokeFn = useServerFn(revokePartnerVendor);
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin", "partner-vendors"],
    queryFn: () => listFn(),
  });

  const [email, setEmail] = useState("");
  const [vendorId, setVendorId] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  const onGrant = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await grantFn({
        data: { userEmail: email.trim(), vendorId: vendorId.trim(), notes: notes.trim() || undefined },
      });
      if (res.alreadyActive) toast.info("Mapping already active.");
      else if (res.reactivated) toast.success("Mapping reactivated.");
      else toast.success("Mapping granted.");
      setEmail("");
      setVendorId("");
      setNotes("");
      await refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Grant failed");
    } finally {
      setBusy(false);
    }
  };

  const onRevoke = async (mappingId: string) => {
    if (!confirm("Revoke this mapping? The partner will immediately lose access.")) return;
    try {
      await revokeFn({ data: { mappingId } });
      toast.success("Mapping revoked.");
      await refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Revoke failed");
    }
  };

  return (
    <div className="space-y-10">
      <header>
        <h2 className="font-display text-3xl">Partner ↔ vendor mappings</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Explicitly scope each partner user to one or more stable vendor IDs. Every partner-facing
          server tool derives access from this table — vendor IDs are never trusted from the client.
          Deny-by-default: a partner with no active mapping sees nothing.
        </p>
      </header>

      <form
        onSubmit={onGrant}
        className="rounded border border-white/10 bg-black/30 p-6 space-y-4"
      >
        <div className="text-[11px] uppercase tracking-[0.3em] text-[color:var(--gold)]">
          Grant access
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <label className="block text-xs">
            <span className="mb-1 block uppercase tracking-[0.2em] text-muted-foreground">
              Partner email
            </span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded border border-white/15 bg-black px-3 py-2 text-sm"
              placeholder="partner@example.com"
            />
          </label>
          <label className="block text-xs">
            <span className="mb-1 block uppercase tracking-[0.2em] text-muted-foreground">
              Vendor ID (stable)
            </span>
            <input
              required
              value={vendorId}
              onChange={(e) => setVendorId(e.target.value)}
              className="w-full rounded border border-white/15 bg-black px-3 py-2 text-sm font-mono"
              placeholder="vendor_abc123"
            />
          </label>
          <label className="block text-xs">
            <span className="mb-1 block uppercase tracking-[0.2em] text-muted-foreground">
              Notes (optional)
            </span>
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded border border-white/15 bg-black px-3 py-2 text-sm"
              placeholder="Contract #, contact, etc."
            />
          </label>
        </div>
        <div className="text-[11px] text-muted-foreground">
          Use stable internal vendor IDs — never Shopify vendor display names.
        </div>
        <button
          disabled={busy}
          className="lux-press rounded-sm border border-[color:var(--gold)] bg-[color:var(--gold)] px-6 py-3 text-xs font-bold uppercase tracking-[0.32em] text-[color:var(--ink)] disabled:opacity-50"
        >
          {busy ? "Granting…" : "Grant access"}
        </button>
      </form>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm uppercase tracking-[0.25em] text-muted-foreground">
            All mappings ({data?.length ?? 0})
          </h3>
          <button
            onClick={() => refetch()}
            className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground hover:text-foreground"
          >
            Refresh
          </button>
        </div>
        {isLoading ? (
          <div className="py-16 text-center text-sm text-muted-foreground">Loading…</div>
        ) : !data?.length ? (
          <div className="rounded border border-white/10 py-16 text-center text-sm text-muted-foreground">
            No mappings yet.
          </div>
        ) : (
          <div className="overflow-x-auto rounded border border-white/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/[0.03] text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Partner</th>
                  <th className="px-4 py-3">Vendor ID</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Granted</th>
                  <th className="px-4 py-3">By</th>
                  <th className="px-4 py-3">Revoked</th>
                  <th className="px-4 py-3">Notes</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {data.map((row) => (
                  <tr key={row.id} className="border-t border-white/5">
                    <td className="px-4 py-3">
                      <div>{row.user_email ?? row.user_id}</div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{row.vendor_id}</td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          row.status === "active"
                            ? "text-[color:var(--gold)]"
                            : "text-muted-foreground line-through"
                        }
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {new Date(row.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {row.created_by_email ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {row.revoked_at ? (
                        <div>
                          <div>{new Date(row.revoked_at).toLocaleString()}</div>
                          <div>{row.revoked_by_email ?? ""}</div>
                        </div>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{row.notes ?? ""}</td>
                    <td className="px-4 py-3 text-right">
                      {row.status === "active" && (
                        <button
                          onClick={() => onRevoke(row.id)}
                          className="text-[11px] uppercase tracking-[0.25em] text-red-400 hover:text-red-300"
                        >
                          Revoke
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
