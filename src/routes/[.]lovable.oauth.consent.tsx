import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type OAuthNs = {
  getAuthorizationDetails: (id: string) => Promise<{ data: any; error: any }>;
  approveAuthorization: (id: string) => Promise<{ data: any; error: any }>;
  denyAuthorization: (id: string) => Promise<{ data: any; error: any }>;
};
const oauth = (supabase.auth as unknown as { oauth: OAuthNs }).oauth;

export const Route = createFileRoute("/.lovable/oauth/consent")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({
    authorization_id: typeof s.authorization_id === "string" ? s.authorization_id : "",
  }),
  beforeLoad: async ({ search, location }) => {
    if (!search.authorization_id) throw new Error("Missing authorization_id");
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      const next = location.pathname + location.searchStr;
      throw redirect({ to: "/auth", search: { next } });
    }
  },
  loader: async ({ location }) => {
    const authorizationId = new URLSearchParams(location.search).get("authorization_id")!;
    const { data, error } = await oauth.getAuthorizationDetails(authorizationId);
    if (error) throw error;
    const immediate = data?.redirect_url ?? data?.redirect_to;
    if (immediate && !data?.client) throw redirect({ href: immediate });
    return data;
  },
  component: Consent,
  errorComponent: ({ error }) => (
    <main className="mx-auto max-w-lg px-6 py-24 text-center">
      <h1 className="font-display text-3xl">Authorization error</h1>
      <p className="mt-4 text-sm text-muted-foreground">
        {String((error as Error)?.message ?? error)}
      </p>
    </main>
  ),
});

function Consent() {
  const details = Route.useLoaderData() as any;
  const { authorization_id } = Route.useSearch();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function decide(approve: boolean) {
    setBusy(true);
    setError(null);
    const { data, error } = approve
      ? await oauth.approveAuthorization(authorization_id)
      : await oauth.denyAuthorization(authorization_id);
    if (error) { setBusy(false); setError(error.message); return; }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) { setBusy(false); setError("No redirect returned by the authorization server."); return; }
    window.location.href = target;
  }

  const clientName = details?.client?.name ?? "This app";

  return (
    <main className="mx-auto max-w-lg px-6 py-20">
      <div className="text-[11px] uppercase tracking-[0.3em] text-[color:var(--gold)] text-center">
        Connection request
      </div>
      <h1 className="mt-3 text-center font-display text-4xl">
        Connect {clientName} to Frass
      </h1>
      <p className="mt-4 text-center text-sm text-muted-foreground">
        This lets {clientName} use Frass as you. It does not bypass Frass's
        permissions — admin tools still require an admin account.
      </p>

      {error && (
        <p role="alert" className="mt-6 rounded-sm border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}

      <div className="mt-10 flex gap-3">
        <button
          disabled={busy}
          onClick={() => decide(false)}
          className="lux-press flex-1 rounded-sm border border-border px-6 py-3.5 text-xs font-bold uppercase tracking-[0.32em] text-foreground transition hover:bg-muted/40 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          disabled={busy}
          onClick={() => decide(true)}
          className="lux-press flex-1 rounded-sm border border-[color:var(--gold)] bg-[color:var(--gold)] px-6 py-3.5 text-xs font-bold uppercase tracking-[0.32em] text-[color:var(--ink)] transition hover:bg-[color:var(--gold-soft)] disabled:opacity-50"
        >
          {busy ? "Working…" : "Approve"}
        </button>
      </div>
    </main>
  );
}
