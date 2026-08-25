// FRASS-0601 — the Generation Services board.
// Frassy Studios is never tied to one company. Each capability is a slot, and a
// slot can be filled, swapped or emptied without touching a single production.
import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useProviders } from "@/lib/studios/use-engine";
import { logStudioActivity } from "@/lib/studios/use-studios";
import { EmptyState, QuietButton, StudioSection } from "@/components/studios/studio-ui";
import { GENERATION_CAPABILITIES, capabilityLabel } from "@/lib/studios/generation-layer";

export const Route = createFileRoute("/_authenticated/studios/providers")({
  head: () => ({
    meta: [
      { title: "Generation Services | Frassy Studios" },
      { name: "description", content: "The provider-agnostic slots Frassy Studios uses for writing, images, video, animation, voice, music and sound." },
      { property: "og:title", content: "Generation Services | Frassy Studios" },
      { property: "og:description", content: "Swap any service without touching a single production." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: ProvidersPage,
});

function ProvidersPage() {
  const qc = useQueryClient();
  const { data: providers = [], isLoading } = useProviders();

  const setPriority = async (p: any, priority: number) => {
    await supabase.from("studio_providers").update({ priority }).eq("id", p.id);
    qc.invalidateQueries({ queryKey: ["studio", "providers"] });
  };

  const toggle = async (p: any) => {
    if (!p.is_configured && !p.is_active) {
      return toast.error("This service isn't connected yet. Connection happens in a later build, with keys kept on the server.");
    }
    await supabase.from("studio_providers").update({ is_active: !p.is_active }).eq("id", p.id);
    await logStudioActivity("provider_toggled", "provider", p.id, { active: !p.is_active });
    qc.invalidateQueries({ queryKey: ["studio", "providers"] });
  };

  return (
    <StudioSection
      eyebrow="FRASS-0601 · Engine"
      title="Generation Services"
      hint="Every kind of work is a slot. Fill it, swap it, or leave it empty — the productions never change."
    >
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading services…</p>
      ) : providers.length === 0 ? (
        <EmptyState title="No service slots yet" body="The studio has not been given any slots to fill." />
      ) : (
        <div className="space-y-6">
          {GENERATION_CAPABILITIES.map((cap: any) => {
            const rows = providers.filter((p: any) => p.capability === cap.id);
            if (!rows.length) return null;
            const live = rows.some((r: any) => r.is_active && r.is_configured);
            return (
              <div key={cap.id} className="rounded-lg border border-border/70 bg-card/60 p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.24em] text-[color:var(--gold)]">{capabilityLabel(cap.id)}</div>
                    <p className="text-sm text-muted-foreground">{cap.plain ?? ""}</p>
                  </div>
                  <span
                    className={`rounded-sm border px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] ${
                      live ? "border-emerald-500/60 text-emerald-400" : "border-border/70 text-muted-foreground"
                    }`}
                  >
                    {live ? "Working" : "Not connected"}
                  </span>
                </div>

                <ul className="mt-4 space-y-2">
                  {[...rows]
                    .sort((a: any, b: any) => (a.priority ?? 99) - (b.priority ?? 99))
                    .map((p: any) => (
                      <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 rounded-sm border border-border/60 bg-background/40 p-3">
                        <div className="min-w-0">
                          <div className="text-sm">{p.label}</div>
                          <p className="text-xs text-muted-foreground">
                            {p.is_configured ? "Connected" : "Awaiting connection"} · choice #{p.priority ?? "—"}
                            {p.notes ? ` · ${p.notes}` : ""}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setPriority(p, Math.max(1, (p.priority ?? 2) - 1))}
                            className="rounded-sm border border-border/70 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground"
                          >
                            Prefer more
                          </button>
                          <QuietButton onClick={() => toggle(p)}>{p.is_active ? "Turn off" : "Turn on"}</QuietButton>
                        </div>
                      </li>
                    ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}

      <p className="mt-6 rounded-sm border border-border/60 bg-background/40 p-3 text-xs text-muted-foreground">
        Nothing here holds a password or a key. Any service keys live on the server, never in the browser and never in a
        production record. Only the writing slot is live today; picture, video, animation, voice, music and sound stay
        queued until you connect a service.
      </p>
    </StudioSection>
  );
}
