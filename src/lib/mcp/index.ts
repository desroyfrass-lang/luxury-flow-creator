import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listSiteText from "./tools/list-site-text";
import updateSiteText from "./tools/update-site-text";
import listSiteImages from "./tools/list-site-images";
import updateSiteImage from "./tools/update-site-image";
import listCapsules from "./tools/list-capsules";
import getCapsule from "./tools/get-capsule";
import updateCapsule from "./tools/update-capsule";

// The OAuth issuer MUST be the direct Supabase host (not the .lovable.cloud proxy).
// VITE_SUPABASE_PROJECT_ID is inlined by Vite at build time.
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "frass-mcp",
  title: "Frass",
  version: "0.1.0",
  instructions:
    "Tools for managing the Frass storefront — site text, site images, and capsule collections. Admin role required.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    listSiteText,
    updateSiteText,
    listSiteImages,
    updateSiteImage,
    listCapsules,
    getCapsule,
    updateCapsule,
  ],
});
