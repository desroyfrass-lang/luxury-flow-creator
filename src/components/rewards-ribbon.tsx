import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Sparkles, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const KEY = "frass-rewards-ribbon-dismissed";

export function RewardsRibbon() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let cancelled = false;

    const evaluate = async () => {
      if (localStorage.getItem(KEY) === "1") {
        if (!cancelled) setShow(false);
        return;
      }
      // Signed-in customers have already entered the Welcome Journey —
      // they see progress inside /rewards, not a permanent banner.
      const { data } = await supabase.auth.getSession();
      if (cancelled) return;
      setShow(!data.session);
    };

    evaluate();
    const { data: sub } = supabase.auth.onAuthStateChange(() => evaluate());
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  if (!show) return null;
  return (
    <div className="relative z-40 border-b border-[color:var(--gold,#c9a24a)]/30 bg-[color:var(--ink,#0a0a0a)] text-[color:var(--gold,#c9a24a)]">
      <div className="mx-auto flex max-w-[1600px] items-center gap-3 px-4 py-2 text-[11px] uppercase tracking-[0.28em] md:text-xs">
        <Sparkles className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate">
          Welcome to Frass Hill · Unlock up to <b>40% off</b> your first order
        </span>
        <Link
          to="/rewards"
          className="ml-auto shrink-0 rounded-full border border-[color:var(--gold,#c9a24a)]/60 px-3 py-1 text-[10px] tracking-[0.28em] text-[color:var(--gold,#c9a24a)] hover:bg-[color:var(--gold,#c9a24a)] hover:text-[color:var(--ink,#0a0a0a)]"
        >
          Begin journey
        </Link>
        <button
          type="button"
          aria-label="Dismiss"
          onClick={() => {
            localStorage.setItem(KEY, "1");
            setShow(false);
          }}
          className="rounded-full p-1 text-[color:var(--gold,#c9a24a)]/70 hover:bg-[color:var(--gold,#c9a24a)]/10"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
