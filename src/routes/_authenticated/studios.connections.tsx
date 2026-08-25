// FRASS-0600 — platform connections. Secrets never touch the browser.
import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useConnections } from "@/lib/studios/use-studios";
import { QuietButton, StudioCard, StudioSection } from "@/components/studios/studio-ui";
import { prettify } from "@/lib/studios/studios";

export const Route = createFileRoute("/_authenticated/studios/connections")({
  head: () => ({
    meta: [
      { title: "Connections | Frassy Studios" },
      { name: "description", content: "Link Frass Hill channels for publishing and analytics." },
      { property: "og:title", content: "Connections | Frassy Studios" },
      { property: "og:description", content: "Channel authorisation happens server-side; no keys are stored in the browser." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: Connections,
});

function Connections() {
  const qc = useQueryClient();
  const { data: connections = [] } = useConnections();

  const disconnect = async (id: string) => {
    const { error } = await supabase
      .from("studio_platform_connections")
      .update({ status: "disconnected" })
      .eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Channel disconnected.");
    qc.invalidateQueries({ queryKey: ["studio"] });
  };

  return (
    <>
      <h1 className="font-display text-3xl uppercase tracking-tight">Connections</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        A channel must be authorised before the studio can schedule or publish to it. Authorisation runs on the server —
        no keys, tokens or passwords are ever held in this page.
      </p>

      <StudioSection title="Channels">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {connections.map((c) => (
            <StudioCard key={c.id} eyebrow={prettify(c.status)} title={prettify(c.platform)}>
              <dl className="space-y-1 text-xs text-muted-foreground">
                <div className="flex justify-between gap-3">
                  <dt>Account</dt>
                  <dd>{c.account_label ?? "Not linked"}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt>Last synced</dt>
                  <dd>{c.last_sync_at ? new Date(c.last_sync_at).toLocaleString() : "Never"}</dd>
                </div>
              </dl>
              <div className="mt-3 flex flex-wrap gap-2">
                {c.status === "connected" ? (
                  <QuietButton onClick={() => disconnect(c.id)}>Disconnect</QuietButton>
                ) : (
                  <QuietButton
                    onClick={() =>
                      toast.info(
                        "Connecting this channel needs its official authorisation set up on the server first. I'll walk you through it when you're ready.",
                      )
                    }
                  >
                    Connect channel
                  </QuietButton>
                )}
              </div>
            </StudioCard>
          ))}
        </div>
      </StudioSection>
    </>
  );
}
