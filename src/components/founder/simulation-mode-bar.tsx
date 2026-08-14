// FRASS-0562 — Simulation Mode.
//
// One controlled environment. No second email, no second account, no fake data.
// While a persona simulation is running, this bar sits at the top of every page
// so the Founder always knows who Frass currently thinks they are, where they
// are in the walkthrough, and can restart or leave with one tap.

import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "@tanstack/react-router";
import {
  SIMULATION_EVENT,
  TESTING_SEQUENCE,
  exitSimulation,
  loadSimulation,
  personaById,
  restartSimulation,
  simulationProgress,
  type SimulationState,
} from "@/lib/founder/simulator";

export function SimulationModeBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sim, setSim] = useState<SimulationState | null>(null);

  useEffect(() => {
    const sync = () => setSim(loadSimulation());
    sync();
    window.addEventListener(SIMULATION_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(SIMULATION_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  if (!sim) return null;
  const persona = personaById(sim.personaId);
  const fresh = sim.freshMember !== false && sim.personaId !== "founder";
  const { index, total, current, next } = simulationProgress(location.pathname);

  return (
    <div className="fixed inset-x-0 top-0 z-[70] flex flex-wrap items-center justify-center gap-x-4 gap-y-1 bg-[color:var(--gold)]/95 px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-black">
      <span>
        🧪 Simulation — {persona ? `${persona.emoji} ${persona.label}` : "Member"}
        {fresh ? " · seeing Frass for the very first time" : ""}
      </span>

      <span className="rounded-full bg-black/10 px-2 py-0.5 text-[10px]">
        {index >= 0 ? `Step ${index + 1} of ${total}` : `Off the path · ${total} steps`}
      </span>

      <span className="normal-case tracking-normal">
        {current ? (
          <>✅ Currently testing: <strong>{current.label}</strong></>
        ) : (
          <>You&apos;re outside the testing path.</>
        )}
        {next ? (
          <>
            {" · "}➡️ Next: <strong>{next.label}</strong>
          </>
        ) : (
          " · 🏁 Last step"
        )}
      </span>

      {next && (
        <button
          type="button"
          onClick={() => void navigate({ to: next.path })}
          className="rounded-full border border-black/40 px-3 py-1 text-[10px] font-bold uppercase tracking-wide"
        >
          Go to next step
        </button>
      )}

      <button
        type="button"
        onClick={() => {
          restartSimulation();
          setSim(loadSimulation());
          void navigate({ to: TESTING_SEQUENCE[0].path });
        }}
        className="rounded-full border border-black/40 px-3 py-1 text-[10px] font-bold uppercase tracking-wide"
      >
        🔄 Restart simulation
      </button>

      <button
        type="button"
        onClick={() => {
          exitSimulation();
          void navigate({ to: "/control-room" });
        }}
        className="rounded-full bg-black px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white"
      >
        Exit simulation
      </button>
    </div>
  );
}
