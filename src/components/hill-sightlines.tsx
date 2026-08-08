import { Link } from "@tanstack/react-router";
import { sightlinesFrom } from "@/lib/frass-hill";

/**
 * The sightline rule: every building should be visible before it is visited.
 * From wherever you are standing in Frass Hill, you can see the rest of the town.
 */
export function HillSightlines({
  districtId,
  onLook,
  className = "",
}: {
  districtId: string;
  /** Town-plan mode: jump to the district card instead of navigating away. */
  onLook?: (id: string) => void;
  className?: string;
}) {
  const views = sightlinesFrom(districtId);
  if (views.length === 0) return null;

  return (
    <div className={className}>
      <div className="text-[10px] uppercase tracking-[0.28em] text-[color:var(--hill-gold)]">
        From here you can see
      </div>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
        {views.map((v) => {
          const body = (
            <>
              <span className="flex items-baseline gap-2">
                <span className="text-base leading-none">{v.district.glyph}</span>
                <span className="text-sm font-semibold">{v.district.name}</span>
              </span>
              <span className="mt-1 block text-[10px] uppercase tracking-[0.2em] text-[color:var(--hill-gold)]/80">
                {v.direction}
              </span>
              <span className="mt-1 block text-xs italic text-muted-foreground">{v.sight}</span>
            </>
          );
          const cls =
            "block h-full w-full rounded-xl border border-border/50 bg-background/30 p-3 text-left transition hover:border-[color:var(--hill-gold)]/50 hover:bg-background/60";

          return (
            <li key={v.to}>
              {onLook ? (
                <button type="button" onClick={() => onLook(v.to)} className={cls}>
                  {body}
                </button>
              ) : v.district.to ? (
                <Link to={v.district.to} className={cls}>
                  {body}
                </Link>
              ) : (
                <div className={cls}>{body}</div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
