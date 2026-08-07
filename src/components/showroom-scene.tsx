import type { ShowroomTheme } from "@/lib/showroom-themes";

/**
 * The physical set behind a showroom rack: back wall with panelling,
 * ceiling light bar, spill pools of neon on the wall and a reflective
 * store floor. Purely decorative, sits behind the rack.
 */
export function ShowroomScene({ theme }: { theme: ShowroomTheme }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden">
      {/* back wall */}
      <div className="absolute inset-x-0 top-0 bottom-[22%]" style={{ background: theme.wall }} />

      {/* panelling / texture */}
      <div
        className="absolute inset-x-0 top-0 bottom-[22%] opacity-70"
        style={{ background: theme.panel }}
      />
      {/* ceiling light bar */}
      <div
        className="absolute inset-x-[6%] top-0 h-[6px] rounded-b-full"
        style={{ background: theme.accentSoft, boxShadow: `0 0 60px 10px ${theme.accent}` }}
      />
      {/* ceiling wash onto the wall */}
      <div className="absolute inset-x-0 top-0 h-1/2" style={{ background: theme.ambient }} />

      {/* floor plane */}
      <div className="absolute inset-x-0 bottom-0 h-[22%]" style={{ background: theme.floor }} />
      {/* floor joint line */}
      <div
        className="absolute inset-x-0 bottom-[22%] h-px opacity-70"
        style={{ background: `linear-gradient(90deg, transparent, ${theme.accentSoft}, transparent)` }}
      />
      {/* neon spill on the floor */}
      <div
        className="absolute inset-x-0 bottom-0 h-[22%] opacity-60"
        style={{
          background: `radial-gradient(80% 120% at 50% 0%, ${theme.accent}, transparent 70%)`,
          filter: "blur(24px)",
        }}
      />
      {/* keep text legible */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(90% 70% at 50% 40%, transparent 0%, oklch(0.10 0.01 80 / 0.55) 100%)",
        }}
      />
      </div>
    </div>

  );
}
