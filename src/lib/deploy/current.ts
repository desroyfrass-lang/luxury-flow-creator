// FRASS-0506 — the deployment currently under observation.
//
// Updated as part of every production publish, alongside the Deployment Report
// in `deployments/` (FRASS-0503-D). One record, one source of truth: there is
// never a second place where "what is live right now" is written down.

import type { DeploymentRecord } from "./observation";

export const CURRENT_DEPLOYMENT: DeploymentRecord | null = {
  id: "FRASS-2026-08-12-A",
  deployedAt: "2026-08-12T00:00:00.000Z",
  releaseClass: "critical",
  note: "Worker ESM interop fix, /daily redirect, deployment constitution.",
};
