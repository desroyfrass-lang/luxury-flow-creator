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
              className={`font-display uppercase leading-[1.05] tracking-[0.12em] text-[clamp(1.15rem,4.6vw,1.6rem)] md:text-[clamp(2.4rem,3.4vw,3.75rem)] md:tracking-[0.2em] ${
                sign.accent ? "text-foreground" : "text-[color:var(--gold)]"
              }`}
            >
              {sign.label}
            </h2>
            {sign.caption ? (
              <p className="mx-auto mt-2 max-w-[22ch] text-[10px] uppercase tracking-[0.14em] text-muted-foreground md:mt-3 md:max-w-[34ch] md:text-[13px]">
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
