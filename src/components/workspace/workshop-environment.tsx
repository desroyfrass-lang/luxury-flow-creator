// SPEC-BLUEPRINT-001-FINAL §3 — the Workshop tells you which room you're in.
// The room changes. The Universal OS underneath it never does.

import { WORKSHOP_ENVIRONMENTS, UNIVERSAL_GUARANTEE, type WorkshopEnvironment } from "@/lib/builder-os/workshop-environments";

export function WorkshopEnvironmentBanner({ env }: { env: WorkshopEnvironment }) {
  return (
    <div className={`workshop-env ${env.skin} rounded-xl border border-border/70 bg-background/60 p-3`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="font-display text-base">
            {env.emoji} {env.name}
          </div>
          <p className="ws-meta">{env.everyday}</p>
        </div>
        <div className="ws-meta">Workshop · same Frass underneath</div>
      </div>
      <div className="mt-2 flex flex-wrap gap-1">
        {env.tools.map((t) => (
          <span key={t} className="ws-chip">
            {t}
          </span>
        ))}
      </div>
      <p className="ws-meta mt-2">
        Unchanged in every environment: {UNIVERSAL_GUARANTEE.join(" · ")}.
      </p>
    </div>
  );
}

export const DEFAULT_ENVIRONMENT = WORKSHOP_ENVIRONMENTS.default;
