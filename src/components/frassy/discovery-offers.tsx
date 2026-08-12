// FRASS-0483 — Continuous Discovery surface.
// Shared card: shows the skills Frassy overheard and offers to turn each one
// into an existing Frass business. Mounted wherever the member works; never a
// separate onboarding flow.

import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Sparkles, Check, X } from "lucide-react";
import {
  confirmOffer,
  declineOffer,
  pendingOffers,
  type DiscoveryOffer,
} from "@/lib/business/discovery";
import type { PartnerProfile } from "@/lib/business/partner-profile";

export function DiscoveryOffers({
  className = "",
  onProfileChange,
}: {
  className?: string;
  onProfileChange?: (p: PartnerProfile) => void;
}) {
  const [offers, setOffers] = useState<DiscoveryOffer[]>([]);
  const [accepted, setAccepted] = useState<DiscoveryOffer | null>(null);

  useEffect(() => {
    setOffers(pendingOffers());
  }, []);

  function accept(offer: DiscoveryOffer) {
    const next = confirmOffer(offer.asset.id);
    onProfileChange?.(next);
    setAccepted(offer);
    setOffers(pendingOffers(next));
  }

  function decline(offer: DiscoveryOffer) {
    const next = declineOffer(offer.asset.id);
    onProfileChange?.(next);
    setOffers(pendingOffers(next));
  }

  if (offers.length === 0 && !accepted) return null;

  return (
    <section
      className={`rounded-3xl border border-[color:var(--gold,#d4af37)]/35 bg-[color:var(--gold,#d4af37)]/[0.05] p-5 ${className}`}
    >
      <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[color:var(--gold,#d4af37)]">
        <Sparkles className="h-3.5 w-3.5" /> Something you mentioned
      </p>

      {accepted && (
        <p className="mt-3 text-sm">
          Good. {accepted.asset.emoji} {accepted.asset.label} is part of your plan now —{" "}
          <Link to={accepted.destination.to} className="underline underline-offset-4">
            open {accepted.destination.label}
          </Link>{" "}
          when you're ready.
        </p>
      )}

      <ul className="mt-3 space-y-3">
        {offers.map((offer) => (
          <li key={offer.asset.id} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
            <p className="text-sm font-medium">
              {offer.asset.emoji} {offer.line}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{offer.worth}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={() => accept(offer)}
                className="rounded-full bg-[color:var(--gold,#d4af37)] px-4 py-1.5 text-xs font-semibold text-black"
              >
                <Check className="mr-1 inline h-3.5 w-3.5" /> Yes — build it into {offer.destination.label}
              </button>
              <button
                onClick={() => decline(offer)}
                className="rounded-full border border-white/20 px-4 py-1.5 text-xs hover:bg-white/5"
              >
                <X className="mr-1 inline h-3.5 w-3.5" /> Not now
              </button>
            </div>
          </li>
        ))}
      </ul>

      <p className="mt-3 text-xs text-muted-foreground">
        Nothing here is saved anywhere but this device, and I never start a business without you saying yes.
      </p>
    </section>
  );
}
