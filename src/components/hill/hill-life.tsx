// Ambient life layers for the Frass Hill Walk — drifting cloud, birds, jerk smoke,
// water shimmer, moving leaves, warm lights and evening haze. Pure CSS, no sprites.
type Layer = "clouds" | "birds" | "smoke" | "water" | "leaves" | "lights" | "haze";

export function HillLife({ layers }: { layers: Layer[] }) {
  return (
    <div className="hill-life" aria-hidden="true">
      {layers.includes("clouds") && <span className="hill-life-clouds" />}
      {layers.includes("haze") && <span className="hill-life-haze" />}
      {layers.includes("water") && <span className="hill-life-water" />}
      {layers.includes("smoke") && (
        <>
          <span className="hill-life-smoke" style={{ left: "28%", animationDelay: "0s" }} />
          <span className="hill-life-smoke" style={{ left: "63%", animationDelay: "3.4s" }} />
        </>
      )}
      {layers.includes("leaves") && <span className="hill-life-leaves" />}
      {layers.includes("lights") && <span className="hill-life-lights" />}
      {layers.includes("birds") && (
        <svg className="hill-life-birds" viewBox="0 0 120 40" fill="none">
          <path d="M4 20c4-5 8-5 12 0 4-5 8-5 12 0" stroke="currentColor" strokeWidth="1.2" />
          <path d="M44 12c3-4 6-4 9 0 3-4 6-4 9 0" stroke="currentColor" strokeWidth="1" opacity=".7" />
          <path d="M82 26c2.5-3.5 5-3.5 7.5 0 2.5-3.5 5-3.5 7.5 0" stroke="currentColor" strokeWidth=".9" opacity=".55" />
        </svg>
      )}
    </div>
  );
}
