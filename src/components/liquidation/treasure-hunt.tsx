import { useEffect, useState } from "react";
import { ShoppingBag, X } from "lucide-react";

type Bag = { id: string; top: string; left: string; reward: string };

const BAGS: Bag[] = [
  { id: "a", top: "34%", left: "8%", reward: "5% off your next pair" },
  { id: "b", top: "62%", left: "88%", reward: "Free shipping on this order" },
  { id: "c", top: "84%", left: "22%", reward: "Early access to the next drop" },
];

const KEY = "frass-treasure-found";

/** Golden shopping bags hidden around the district. */
export function TreasureHunt() {
  const [found, setFound] = useState<string[]>([]);
  const [reveal, setReveal] = useState<Bag | null>(null);

  useEffect(() => {
    const raw = window.localStorage.getItem(KEY);
    if (raw) setFound(raw.split(","));
  }, []);

  const open = (bag: Bag) => {
    setReveal(bag);
    setFound((prev) => {
      if (prev.includes(bag.id)) return prev;
      const next = [...prev, bag.id];
      window.localStorage.setItem(KEY, next.join(","));
      return next;
    });
  };

  return (
    <>
      {BAGS.filter((b) => !found.includes(b.id)).map((bag) => (
        <button
          key={bag.id}
          type="button"
          aria-label="Hidden golden shopping bag"
          onClick={() => open(bag)}
          style={{ top: bag.top, left: bag.left }}
          className="absolute z-20 hidden h-9 w-9 -translate-x-1/2 items-center justify-center rounded-full border border-[color:var(--gold)]/40 bg-background/40 text-[color:var(--gold)] opacity-40 backdrop-blur-sm transition-all duration-500 hover:scale-110 hover:opacity-100 md:flex"
        >
          <ShoppingBag className="h-4 w-4" />
        </button>
      ))}

      {reveal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-6 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl border border-[color:var(--gold)]/40 bg-[color-mix(in_oklab,var(--foreground)_8%,transparent)] p-10 text-center">
            <button
              type="button"
              aria-label="Close"
              onClick={() => setReveal(null)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
            <ShoppingBag className="mx-auto h-8 w-8 text-[color:var(--gold)]" />
            <h3 className="mt-4 font-display text-2xl uppercase tracking-[0.14em] text-[color:var(--gold)]">
              Surprise unlocked
            </h3>
            <p className="mt-3 text-sm text-muted-foreground">{reveal.reward}</p>
            <p className="mt-4 text-xs italic text-muted-foreground">
              Mention it to Frassy at checkout — she keeps the ledger.
            </p>
          </div>
        </div>
      ) : null}
    </>
  );
}
