import { useMemo } from "react";
import { protectionRule, type ProtectionLevel } from "@/lib/rights/protection";

/**
 * FRASS-0492 — the one protected viewer for member-created work.
 *
 * Every surface that displays original member content uses this: Gallery,
 * FOR ME, Marketplace, Collections, FV Studios, Media Library. There is no
 * second protected image component anywhere in Frass.
 *
 * What it honestly does: switches off right-click saving and dragging, keeps
 * the browser's own "save image" affordances out of reach, requests a
 * display-sized render instead of the archival original, and lays the
 * creator's name over the work when they asked for that.
 *
 * What it does not do: stop screenshots. Nothing in a browser can.
 */

/** Ask the storage layer for a screen-sized render rather than the original. */
function displaySrc(url: string, width: number): string {
  if (!url) return url;
  // Supabase storage renders on request; anything else is returned untouched.
  if (!url.includes("/storage/v1/object/")) return url;
  const rendered = url.replace("/storage/v1/object/", "/storage/v1/render/image/");
  const join = rendered.includes("?") ? "&" : "?";
  return `${rendered}${join}width=${width}&quality=72&resize=contain`;
}

export function ProtectedImage({
  src,
  alt,
  protection = "standard",
  creator,
  width = 1200,
  className = "",
  frameClassName = "",
}: {
  src: string;
  alt: string;
  protection?: ProtectionLevel;
  /** Whose name appears in the watermark. */
  creator?: string | null;
  width?: number;
  className?: string;
  frameClassName?: string;
}) {
  const rule = protectionRule(protection);
  const resolved = useMemo(
    () => (rule.displayResolutionOnly ? displaySrc(src, width) : src),
    [src, width, rule.displayResolutionOnly],
  );

  return (
    <div
      className={`relative overflow-hidden ${frameClassName}`}
      onContextMenu={rule.blockContextMenu ? (e) => e.preventDefault() : undefined}
    >
      <img
        src={resolved}
        alt={alt}
        loading="lazy"
        draggable={!rule.blockDrag}
        onDragStart={rule.blockDrag ? (e) => e.preventDefault() : undefined}
        className={`${className} ${rule.blockDrag ? "select-none" : ""}`}
        style={rule.blockDrag ? { WebkitUserSelect: "none", WebkitTouchCallout: "none" } : undefined}
      />

      {/* A transparent pane so long-press and drag land on nothing savable. */}
      {rule.blockDrag && (
        <span
          aria-hidden
          className="absolute inset-0 block"
          style={{ WebkitTouchCallout: "none", WebkitUserSelect: "none" }}
        />
      )}

      {rule.watermark && creator && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
        >
          <span className="rotate-[-24deg] whitespace-nowrap text-[clamp(1rem,4vw,2.5rem)] font-black uppercase tracking-[0.3em] text-white/15 mix-blend-overlay">
            {creator} · Frass
          </span>
        </span>
      )}
    </div>
  );
}

/**
 * The honest line shown beneath protected work. Frass never claims screenshots
 * are impossible — it says exactly what is true.
 */
export function ProtectionNote({
  protection = "standard",
  creator,
}: {
  protection?: ProtectionLevel;
  creator?: string | null;
}) {
  const rule = protectionRule(protection);
  if (rule.id === "open") return null;
  return (
    <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
      🛡 Protected work{creator ? ` by ${creator}` : ""}. Downloading and saving are switched off and you
      are seeing a screen-sized version, not the original file. Screenshots can never be fully prevented by
      any website — please respect the maker and share it with the share button instead.
    </p>
  );
}
