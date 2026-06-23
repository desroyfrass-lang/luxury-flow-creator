import { useMemo } from "react";

/**
 * Frass Kicks signature cinematic background:
 * - chrome gradient base
 * - drifting smoke clouds
 * - gold light streaks sweeping across
 * - floating gold particles
 * Pure CSS, GPU-accelerated. Lives behind every major page.
 */
export function LuxuryBackground({ intensity = 1 }: { intensity?: number }) {
  const particles = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        left: `${(i * 53) % 100}%`,
        delay: `${(i * 1.3) % 14}s`,
        duration: `${14 + ((i * 2.1) % 10)}s`,
        size: 2 + ((i * 3) % 4),
      })),
    [],
  );

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      style={{ opacity: intensity }}
    >
      {/* Deep ink base */}
      <div className="absolute inset-0" style={{ background: "radial-gradient(120% 80% at 50% 0%, oklch(0.18 0.01 80), oklch(0.10 0.005 80) 60%, oklch(0.07 0.005 80))" }} />

      {/* Warm gold glow top */}
      <div
        className="absolute -top-1/3 left-1/2 -translate-x-1/2 h-[80vh] w-[120vh] rounded-full blur-3xl"
        style={{ background: "radial-gradient(closest-side, oklch(0.78 0.14 78 / 0.22), transparent 70%)" }}
      />
      {/* Cool shadow bottom */}
      <div
        className="absolute -bottom-1/4 -right-1/4 h-[70vh] w-[70vh] rounded-full blur-3xl"
        style={{ background: "radial-gradient(closest-side, oklch(0.30 0.02 250 / 0.35), transparent 70%)" }}
      />

      {/* Smoke layer */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(60% 40% at 30% 70%, oklch(0.25 0.01 80 / 0.6), transparent 60%), radial-gradient(50% 35% at 75% 30%, oklch(0.22 0.01 250 / 0.55), transparent 60%)",
          animation: "smoke-drift 18s ease-in-out infinite",
        }}
      />


      {/* Gold streaks */}
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="absolute h-px w-1/2"
          style={{
            top: `${20 + i * 28}%`,
            left: 0,
            background:
              "linear-gradient(90deg, transparent, oklch(0.85 0.16 80 / 0.75), oklch(0.95 0.10 85 / 0.95), oklch(0.85 0.16 80 / 0.75), transparent)",
            filter: "blur(0.5px)",
            animation: `gold-streak ${9 + i * 3}s linear ${i * 2.5}s infinite`,
          }}
        />
      ))}

      {/* Floating particles */}
      {particles.map((p, i) => (
        <span
          key={i}
          className="absolute rounded-full"
          style={{
            left: p.left,
            bottom: "-2vh",
            width: p.size,
            height: p.size,
            background: "oklch(0.92 0.12 85 / 0.85)",
            boxShadow: "0 0 12px oklch(0.85 0.16 80 / 0.6)",
            animation: `drift-up ${p.duration} linear ${p.delay} infinite`,
          }}
        />
      ))}

      {/* Subtle vignette to keep content readable */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(80% 60% at 50% 40%, transparent, oklch(0.99 0.002 90 / 0.55) 100%)",
        }}
      />
    </div>
  );
}
