import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ShieldCheck } from "lucide-react";
import { getCardTrust } from "@/lib/trust.functions";
import { TRUST_BADGES, memberSinceLabel, ratingLabel, type TrustBadgeId } from "@/lib/trust";

/**
 * FRASS-0431 — the Trust section of a Frass Card.
 *
 * Everything here is verified fact or an honest blank. Nothing is implied,
 * nothing is inflated, and no payment information ever appears — the card is a
 * payment destination, not a window into anyone's financial accounts.
 */
export function CardTrustSection({ handle, name }: { handle: string; name: string }) {
  const fn = useServerFn(getCardTrust);
  const { data } = useQuery({
    queryKey: ["card-trust", handle],
    queryFn: () => fn({ data: { handle } }),
    enabled: handle.length > 0,
    staleTime: 60_000,
  });

  if (!data) return null;

  const badges = data.badges as TrustBadgeId[];
  const since = memberSinceLabel(data.memberSince);

  return (
    <section className="living-card-block" id="trust">
      <h2 className="living-card-block-title">
        <ShieldCheck className="mr-2 inline h-4 w-4" /> Trust
      </h2>
      <p className="living-card-prose">
        Verified information about {name}, so you can decide before you buy, book or pay.
      </p>

      <ul className="card-trust-list">
        {badges.map((b) => (
          <li key={b} className="card-trust-item card-trust-yes">
            <span aria-hidden>{TRUST_BADGES[b].icon}</span>
            <div>
              <strong>{TRUST_BADGES[b].label}</strong>
              <span>{TRUST_BADGES[b].plain}</span>
            </div>
          </li>
        ))}

        <li className={`card-trust-item ${data.paymentConnected ? "card-trust-yes" : ""}`}>
          <span aria-hidden>{data.paymentConnected ? "✅" : "•"}</span>
          <div>
            <strong>
              {data.paymentConnected ? "Payment account connected" : "No payment account connected yet"}
            </strong>
            <span>
              {data.paymentConnected
                ? "Payments run through a secure processor. Nobody on Frass ever sees your card or bank details."
                : "This member cannot take payments through their card yet."}
            </span>
          </div>
        </li>

        <li className="card-trust-item">
          <span aria-hidden>⭐</span>
          <div>
            <strong>Community rating</strong>
            <span>{ratingLabel(data.rating.average, data.rating.count)}</span>
          </div>
        </li>

        <li className="card-trust-item">
          <span aria-hidden>🧾</span>
          <div>
            <strong>Orders completed</strong>
            <span>
              {data.ordersCompleted === 0
                ? "No completed orders recorded yet."
                : `${data.ordersCompleted} recorded on Frass.`}
            </span>
          </div>
        </li>

        {since && (
          <li className="card-trust-item">
            <span aria-hidden>📅</span>
            <div>
              <strong>Member since</strong>
              <span>{since}</span>
            </div>
          </li>
        )}
      </ul>

      <p className="living-card-fine">
        Frass never shows one member another member's card, bank or wallet details — not even the last
        four digits. Fraud can be reported from the Trust Center in your Financial Center.
      </p>
    </section>
  );
}
