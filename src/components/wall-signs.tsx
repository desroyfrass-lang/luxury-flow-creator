/** Prominent overhead signs rendered above a showroom hero image.
 *  Equal columns that line up with the scrolling columns below. */
export type WallSign = { label: string; caption?: string; accent?: boolean };

export function WallSigns({ labels, signs }: { labels?: string[]; signs?: WallSign[] }) {
  const items: WallSign[] = signs ?? (labels ?? []).map((label) => ({ label }));

  return (
    <div className="relative mx-auto max-w-[1600px] px-2 pb-3 pt-2 md:px-12 md:pb-5">
      <div
        className="grid gap-2 md:gap-6"
        style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
      >
        {items.map((sign) => (
          <div key={sign.label} className="min-w-0 text-center">
            <h2
              className={`font-display text-base uppercase leading-none tracking-[0.16em] md:text-4xl md:tracking-[0.24em] ${
                sign.accent ? "text-foreground" : "text-[color:var(--gold)]"
              }`}
            >
              {sign.label}
            </h2>
            {sign.caption ? (
              <p className="mx-auto mt-2 max-w-[22ch] text-[9px] uppercase tracking-[0.14em] text-muted-foreground md:mt-3 md:max-w-[34ch] md:text-[11px]">
                {sign.caption}
              </p>
            ) : null}
            <div
              className={`mx-auto mt-2 h-px w-10 md:mt-3 md:w-24 ${
                sign.accent ? "bg-foreground/50" : "bg-[color:var(--gold)]/60"
              }`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
