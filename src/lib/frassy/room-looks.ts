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

export const FV_STUDIOS_FRASSY_LOOK: FrassyRoomLook = {
  id: "fv-studios-approved-seated",
  room: "studio",
  image: seatedStudioLook.url,
  alt: "Frassy seated in her FV Studios chair",
  status: "approved",
  position: "seated",
};
