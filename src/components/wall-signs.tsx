/** Prominent overhead signs rendered above a showroom hero image.
 *  Three equal columns that line up with the scrolling columns below. */
export function WallSigns({ labels }: { labels: string[] }) {
  return (
    <div className="relative mx-auto max-w-[1600px] px-2 pb-3 pt-2 md:px-12 md:pb-5">
      <div
        className="grid gap-2 md:gap-6"
        style={{ gridTemplateColumns: `repeat(${labels.length}, minmax(0, 1fr))` }}
      >
        {labels.map((label) => (
          <div key={label} className="min-w-0 text-center">
            <h2 className="font-display text-base uppercase leading-none tracking-[0.16em] text-[color:var(--gold)] md:text-4xl md:tracking-[0.24em]">
              {label}
            </h2>
            <div className="mx-auto mt-2 h-px w-10 bg-[color:var(--gold)]/60 md:mt-3 md:w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}
