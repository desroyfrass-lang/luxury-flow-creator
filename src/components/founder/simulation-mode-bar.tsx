// FRASS-0562 — Simulation Mode.
//
// One controlled environment. No second email, no second account, no fake data.
// While a persona simulation is running, this bar sits at the top of every page
// so the Founder always knows who Frass currently thinks they are — and can
// leave with one tap, instantly back to full Founder privileges.

import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  SIMULATION_EVENT,
  exitSimulation,
  loadSimulation,
  personaById,
  type SimulationState,
} from "@/lib/founder/simulator";

export function SimulationModeBar() {
  const navigate = useNavigate();
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

  return (
    <div className="fixed inset-x-0 top-0 z-[70] flex flex-wrap items-center justify-center gap-3 bg-[color:var(--gold)]/95 px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-black">
      <span>
        🧪 Simulation — {persona ? `${persona.emoji} ${persona.label}` : "Member"}
        {fresh ? " · seeing Frass for the very first time" : ""}
      </span>
      <button
        type="button"
        onClick={() => {
          exitSimulation();
          void navigate({ to: "/command" });
        }}
        className="rounded-full bg-black px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white"
      >
        Exit simulation
      </button>
    </div>
  );
}
