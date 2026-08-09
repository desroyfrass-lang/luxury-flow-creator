import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  BadgeCheck,
  CalendarClock,
  Gift,
  Globe,
  Headphones,
  Heart,
  MessageCircle,
  Send,
  ShoppingBag,
  Sparkles,
  UserPlus,
} from "lucide-react";
import { money } from "@/lib/card-commerce";
import { startCardPayment } from "@/lib/card-commerce.functions";
import {
  DIRECT_PAYMENT_KINDS,
  SUGGESTED_AMOUNTS,
  contactChannels,
  mediaChannels,
  readFollowing,
  toggleFollowing,
  vCard,
  type DirectPaymentKind,
} from "@/lib/card-wallet";
import { cardUrl } from "@/lib/card";

type ActionCard = {
  website?: string | null;
  booking_url?: string | null;
  calendar_url?: string | null;
  social_links?: unknown;
  job_title?: string | null;
  company?: string | null;
};

/**
 * FRASS-0429 — the Frass Card action bar.
 * Every door a member has actually opened, one tap away. Doors they have not
 * opened never appear, so the card never promises something it cannot do.
 */
export function CardActionBar({
  handle,
  name,
  card,
  commerceEnabled,
  hasListings,
  onTrack,
}: {
  handle: string;
  name: string;
  card: ActionCard | null;
  commerceEnabled: boolean;
  hasListings: boolean;
  onTrack: (kind: "website_click" | "booking" | "message" | "marketplace_click") => void;
}) {
  const [following, setFollowing] = useState<boolean>(() => readFollowing().includes(handle));
  const [pay, setPay] = useState<DirectPaymentKind | null>(null);
  const [contactOpen, setContactOpen] = useState(false);

  const contacts = contactChannels(card?.social_links);
  const media = mediaChannels(card?.social_links);
  const booking = card?.booking_url || card?.calendar_url || null;

  const saveContact = () => {
    const blob = new Blob(
      [
        vCard({
          name,
          title: card?.job_title ?? null,
          company: card?.company ?? null,
          website: card?.website ?? null,
          cardUrl: cardUrl(handle),
        }),
      ],
      { type: "text/vcard" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${handle || "frass-card"}.vcf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="card-action-wrap">
      <div className="card-action-bar" role="group" aria-label={`Ways to reach ${name}`}>
        <button
          type="button"
          className={`card-action${following ? " is-on" : ""}`}
          onClick={() => setFollowing(toggleFollowing(handle))}
        >
          {following ? <BadgeCheck className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
          <span>{following ? "Following" : "Follow"}</span>
        </button>

        {contacts.length > 0 && (
          <button
            type="button"
            className="card-action"
            onClick={() => {
              setContactOpen((v) => !v);
              onTrack("message");
            }}
          >
            <MessageCircle className="h-4 w-4" />
            <span>Message</span>
          </button>
        )}

        {commerceEnabled && hasListings && (
          <a className="card-action" href="#card-shop" onClick={() => onTrack("marketplace_click")}>
            <ShoppingBag className="h-4 w-4" />
            <span>Buy</span>
          </a>
        )}

        {booking && (
          <a
            className="card-action"
            href={booking}
            target="_blank"
            rel="noreferrer"
            onClick={() => onTrack("booking")}
          >
            <CalendarClock className="h-4 w-4" />
            <span>Book</span>
          </a>
        )}

        {commerceEnabled && (
          <>
            <button type="button" className="card-action" onClick={() => setPay("money")}>
              <Send className="h-4 w-4" />
              <span>Send money</span>
            </button>
            <button type="button" className="card-action" onClick={() => setPay("gift")}>
              <Gift className="h-4 w-4" />
              <span>Send gift</span>
            </button>
            <button type="button" className="card-action" onClick={() => setPay("tip")}>
              <Heart className="h-4 w-4" />
              <span>Tip</span>
            </button>
          </>
        )}

        {media.length > 0 && (
          <a className="card-action" href={media[0].href} target="_blank" rel="noreferrer">
            <Headphones className="h-4 w-4" />
            <span>Listen</span>
          </a>
        )}

        {card?.website && (
          <a
            className="card-action"
            href={card.website}
            target="_blank"
            rel="noreferrer"
            onClick={() => onTrack("website_click")}
          >
            <Globe className="h-4 w-4" />
            <span>Website</span>
          </a>
        )}

        <button type="button" className="card-action" onClick={saveContact}>
          <Sparkles className="h-4 w-4" />
          <span>Save contact</span>
        </button>
      </div>

      {contactOpen && contacts.length > 0 && (
        <div className="card-action-panel">
          <p className="card-action-panel-title">Message {name}</p>
          <div className="card-action-channels">
            {contacts.map((c) => (
              <a key={c.id} className="ws-chip" href={c.href} target="_blank" rel="noreferrer">
                {c.label}
              </a>
            ))}
          </div>
        </div>
      )}

      {pay && (
        <SendMoneyPanel
          handle={handle}
          name={name}
          kind={pay}
          onClose={() => setPay(null)}
        />
      )}
    </div>
  );
}

function SendMoneyPanel({
  handle,
  name,
  kind,
  onClose,
}: {
  handle: string;
  name: string;
  kind: DirectPaymentKind;
  onClose: () => void;
}) {
  const payFn = useServerFn(startCardPayment);
  const [amount, setAmount] = useState<string>("10");
  const [note, setNote] = useState("");
  const [from, setFrom] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const label = DIRECT_PAYMENT_KINDS.find((k) => k.id === kind);
  const value = Math.max(0, Number(amount) || 0);

  const send = useMutation({
    mutationFn: () =>
      payFn({
        data: {
          handle,
          kind,
          amount: value,
          ...(note.trim() ? { note: note.trim() } : {}),
          ...(from.trim() ? { buyer_name: from.trim() } : {}),
        },
      }),
    onSuccess: (res) => {
      if (!res.ok) {
        setMessage(res.reason);
        return;
      }
      setMessage("Opening secure payment…");
      window.open(res.pay_url, "_blank", "noopener,noreferrer");
    },
    onError: () => setMessage("That could not be started. Try again in a moment."),
  });

  return (
    <div className="card-action-panel">
      <p className="card-action-panel-title">
        {label?.label} — {name}
      </p>
      <p className="card-action-panel-note">
        Payment goes straight into {name}'s own payment account. Frass records the movement in their
        wallet; it never holds the money.
      </p>

      <div className="card-action-amounts">
        {SUGGESTED_AMOUNTS.map((a) => (
          <button
            key={a}
            type="button"
            className={`ws-chip${value === a ? " is-on" : ""}`}
            onClick={() => setAmount(String(a))}
          >
            {money(a)}
          </button>
        ))}
      </div>

      <div className="card-shop-checkout">
        <label>
          Amount (USD)
          <input inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </label>
        <input placeholder="Your name (optional)" maxLength={120} value={from} onChange={(e) => setFrom(e.target.value)} />
        <input
          placeholder={kind === "gift" ? "Add a note to your gift" : "Note (optional)"}
          maxLength={240}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <button
          type="button"
          className="daily-enter w-full"
          disabled={send.isPending || value < 1}
          onClick={() => send.mutate()}
        >
          {send.isPending ? "Preparing…" : `${label?.label} ${money(value)}`}
        </button>
        {message && <p className="card-shop-note">{message}</p>}
        <button type="button" className="ws-chip" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
