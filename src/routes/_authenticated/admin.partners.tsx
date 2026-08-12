import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { SiteShell } from "@/components/site-shell";
import { DESIGNATION_OPTIONS, designationMeta } from "@/lib/partners";
import {
  invitePartner,
  listPartnerInvitations,
  revokePartnerInvitation,
} from "@/lib/partners.functions";

/**
 * FRASS-0456 — Founder's invitation desk.
 * Personal invitations are data, not code. The Founder adds the email; the
 * Welcome Hall recognises the person the moment they register.
 */
export const Route = createFileRoute("/_authenticated/admin/partners")({
  head: () => ({
    meta: [
      { title: "Partner Invitations | Frass OS" },
      { name: "description", content: "Invite partners onto Frass Hill by email." },
      { property: "og:title", content: "Partner Invitations | Frass OS" },
      { property: "og:description", content: "Invite partners onto Frass Hill by email." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminPartners,
});

function AdminPartners() {
  const list = useServerFn(listPartnerInvitations);
  const invite = useServerFn(invitePartner);
  const revoke = useServerFn(revokePartnerInvitation);
  const qc = useQueryClient();

  const invitations = useQuery({ queryKey: ["partner-invitations"], queryFn: () => list() });

  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [designation, setDesignation] = useState("first_partner");
  const [note, setNote] = useState("");

  const send = useMutation({
    mutationFn: () =>
      invite({
        data: {
          email,
          designation: designation as "first_partner",
          displayName: displayName || undefined,
          note: note || undefined,
        },
      }),
    onSuccess: () => {
      toast.success("Invitation registered.");
      setEmail("");
      setDisplayName("");
      setNote("");
      qc.invalidateQueries({ queryKey: ["partner-invitations"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => revoke({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["partner-invitations"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <SiteShell>
      <div className="mx-auto max-w-4xl px-6 py-16">
        <div className="text-[11px] uppercase tracking-[0.32em] text-[color:var(--gold)]">
          FRASS-0456
        </div>
        <h1 className="mt-3 font-display text-5xl">Partner invitations</h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Add the email a partner will register with. When they walk through the Frass Hill door,
          Frassy greets them by their designation and their Partner standing is granted by the
          backend — never by anything typed in a browser.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send.mutate();
          }}
          className="mt-10 grid gap-4 rounded-sm border border-border bg-background/40 p-6 sm:grid-cols-2"
        >
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Their email"
            className="rounded-sm border border-border bg-background/60 px-4 py-3 text-sm outline-none focus:border-[color:var(--gold)]"
          />
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="What Frassy should call them"
            className="rounded-sm border border-border bg-background/60 px-4 py-3 text-sm outline-none focus:border-[color:var(--gold)]"
          />
          <select
            value={designation}
            onChange={(e) => setDesignation(e.target.value)}
            className="rounded-sm border border-border bg-background/60 px-4 py-3 text-sm outline-none focus:border-[color:var(--gold)]"
          >
            {DESIGNATION_OPTIONS.map((d) => (
              <option key={d.id} value={d.id}>
                {d.badge} {d.label}
              </option>
            ))}
          </select>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Private note (optional)"
            className="rounded-sm border border-border bg-background/60 px-4 py-3 text-sm outline-none focus:border-[color:var(--gold)]"
          />
          <div className="sm:col-span-2">
            <p className="mb-4 text-xs leading-relaxed text-muted-foreground">
              <span className="text-[color:var(--gold)]">In plain English: </span>
              {designationMeta(designation)?.plainEnglish}
            </p>
            <button
              type="submit"
              disabled={send.isPending}
              className="lux-press rounded-sm border border-[color:var(--gold)] bg-[color:var(--gold)] px-7 py-3 text-[11px] font-bold uppercase tracking-[0.3em] text-[color:var(--ink)] disabled:opacity-50"
            >
              {send.isPending ? "Saving…" : "Register invitation"}
            </button>
          </div>
        </form>

        <div className="mt-12 space-y-3">
          {invitations.isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
          {invitations.data?.length === 0 && (
            <p className="text-sm text-muted-foreground">No invitations yet.</p>
          )}
          {invitations.data?.map((row) => {
            const meta = designationMeta(row.designation);
            return (
              <div
                key={row.id}
                className="flex items-center justify-between gap-4 rounded-sm border border-border bg-background/40 px-5 py-4"
              >
                <div>
                  <div className="text-sm font-semibold">
                    {meta?.badge} {row.display_name || row.email}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {row.email} · {meta?.label ?? row.designation} ·{" "}
                    {row.claimed_at ? "Arrived" : "Waiting at the gate"}
                  </div>
                </div>
                <button
                  onClick={() => remove.mutate(row.id)}
                  className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground hover:text-destructive"
                >
                  Revoke
                </button>
              </div>
            );
          })}
        </div>

        {/* FRASS-0490 — the founding record. Same desk, no second partner system. */}
        <FoundingDesk />
      </div>
    </SiteShell>
  );
}

