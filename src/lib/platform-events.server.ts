// Server-only helper for emitting append-only platform events (audit log / event bus sink).
// Import inside server handlers only: `const { emitPlatformEvent } = await import("@/lib/platform-events.server");`
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type PlatformEventInput = {
  eventType: string;
  actorId?: string | null;
  entityType?: string | null;
  entityId?: string | null;
  payload?: Record<string, unknown>;
};

export async function emitPlatformEvent(input: PlatformEventInput): Promise<void> {
  const { error } = await supabaseAdmin.from("platform_events").insert({
    event_type: input.eventType,
    actor_id: input.actorId ?? null,
    entity_type: input.entityType ?? null,
    entity_id: input.entityId ?? null,
    payload: input.payload ?? {},
  });
  if (error) console.error("[platform_events] emit failed", error);
}
