import type { ShowroomTheme } from "@/lib/showroom-themes";

/**
 * The physical set behind a showroom rack: back wall with panelling,
 * ceiling light bar, spill pools of neon on the wall and a reflective
 * store floor. Purely decorative, sits behind the rack.
 */
export function ShowroomScene({
  theme,
  photo,
  bright = false,
}: {
  theme: ShowroomTheme;
  /** Optional photographic backdrop set into the back wall. */
  photo?: string;
  /** Bright daylight room: wash the set in light instead of shadow. */
  bright?: boolean;
}) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden">
      {/* back wall */}
      <div className="absolute inset-x-0 top-0 bottom-[22%]" style={{ background: theme.wall }} />

      {/* photographic set piece on the back wall */}
      {photo && (
        <>
          <img
            src={photo}
            alt=""
            className="absolute inset-x-0 top-0 bottom-[22%] h-full w-full object-cover"
            style={{ opacity: bright ? 0.55 : 0.4 }}
          />
          <div
            className="absolute inset-x-0 top-0 bottom-[22%]"
            style={{
              background: bright
                ? "linear-gradient(180deg, oklch(1 0 0 / 0.55) 0%, oklch(1 0 0 / 0.72) 100%)"
                : "linear-gradient(180deg, oklch(0.12 0.01 40 / 0.55) 0%, oklch(0.10 0.01 40 / 0.82) 100%)",
            }}
          />
        </>
      )}

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
            bright
              ? "radial-gradient(90% 70% at 50% 30%, oklch(1 0 0 / 0.25) 0%, oklch(0.80 0.02 200 / 0.30) 100%)"
              : "radial-gradient(90% 70% at 50% 40%, transparent 0%, oklch(0.10 0.01 80 / 0.55) 100%)",
        }}
      />
      </div>
    </div>

  );
}
