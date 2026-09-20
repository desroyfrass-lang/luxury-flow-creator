// One canonical Frassy, presented appropriately for each room.
// A room look is locked and explicit: it never rotates automatically and never
// changes Frassy's identity. FV Studios now uses the Founder-approved seated
// transparent derivative of the locked character board.
import seatedStudioLook from "@/assets/frassy-fv-studios-seated.png.asset.json";

export type FrassyRoomLook = {
  id: string;
  room: "studio";
  image: string;
  alt: string;
  status: "temporary" | "approved";
  position: "portrait" | "standing" | "seated";
};

export type FrassyStudioPresenceState =
  | "idle"
  | "listening"
  | "thinking"
  | "speaking"
  | "gesturing"
  | "working";

export type FrassyStudioPresenceAsset = FrassyRoomLook & {
  kind: "image" | "video";
  states: readonly FrassyStudioPresenceState[];
};

export const FV_STUDIOS_FRASSY_LOOK: FrassyRoomLook = {
  id: "fv-studios-approved-seated",
  room: "studio",
  image: seatedStudioLook.url,
  alt: "Frassy seated in her FV Studios chair",
  status: "approved",
  position: "seated",
};

// One stable room contract for future Founder-approved poses or motion clips.
// The current seated derivative is the truthful fallback for every state; no
// automatic rotation or invented animation is implied by this registry.
export const FV_STUDIOS_FRASSY_PRESENCE: readonly FrassyStudioPresenceAsset[] = [
  {
    ...FV_STUDIOS_FRASSY_LOOK,
    kind: "image",
    states: ["idle", "listening", "thinking", "speaking", "gesturing", "working"],
  },
];

export function studioPresenceFor(state: FrassyStudioPresenceState): FrassyStudioPresenceAsset {
  return (
    FV_STUDIOS_FRASSY_PRESENCE.find((asset) => asset.states.includes(state)) ??
    {
      ...FV_STUDIOS_FRASSY_LOOK,
      kind: "image",
      states: ["idle"],
    }
  );
}
