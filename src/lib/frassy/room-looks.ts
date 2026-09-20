// One canonical Frassy, presented appropriately for each room.
// A room look is locked and explicit: it never rotates automatically and never
// changes Frassy's identity. FV Studios currently uses the approved Workshop
// portrait only as a temporary visual until the Founder supplies the approved
// transparent Studio derivative.
import temporaryStudioPortrait from "@/assets/frassy-look-workshop.jpg.asset.json";

export type FrassyRoomLook = {
  id: string;
  room: "studio";
  image: string;
  alt: string;
  status: "temporary" | "approved";
  position: "portrait" | "standing" | "seated";
};

export const FV_STUDIOS_FRASSY_LOOK: FrassyRoomLook = {
  id: "fv-studios-temporary-workshop-portrait",
  room: "studio",
  image: temporaryStudioPortrait.url,
  alt: "Frassy beside the FV Studios console",
  status: "temporary",
  position: "portrait",
};