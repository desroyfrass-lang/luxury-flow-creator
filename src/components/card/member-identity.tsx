import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CreditCard, Heart, IdCard, MessageCircle } from "lucide-react";
import { getMemberStatus } from "@/lib/trust.functions";

/**
 * FRASS-0428A — Universal Frass Card.
 *
 * Constitutional amendment: the Frass Card replaces the traditional user
 * profile. Nobody on Frass says "go to my profile" — they say "go to my Frass
 * Card". Wherever a member's name, avatar or identity appears anywhere in the
 * ecosystem — For Us, Town Square, Marketplace, Brand Partnerships, FV Studios,
 * Radio, comments, followers, search, live — selecting it opens their Frass
 * Card, and hovering it shows a mini Frass Card preview.
 *
 * Use `MemberIdentity` for avatar + name, `MemberName` for inline text.
 * A member without a handle yet renders as plain text, never a dead link.
 */

export const UNIVERSAL_CARD_PRINCIPLE =
  "Every member automatically receives a Frass Card. It is the universal identity object of the Frass ecosystem — selecting anyone, anywhere, opens their Frass Card. There is no profile.";

export type MemberRef = {
  handle?: string | null;
  name: string;
  avatarUrl?: string | null;
  role?: string | null;
};

function normalise(handle?: string | null) {
  const h = (handle ?? "").replace(/^@/, "").trim().toLowerCase();
  return h.length > 0 ? h : null;
}

/**
 * The hover preview — a mini Frass Card, not a profile popup.
 * FRASS-0431: it also shows what the member is doing right now, when they have
 * chosen to make it public — live, on the radio, in the studio, or selling.
 */
function MiniCard({ handle, name, avatarUrl, role }: MemberRef & { handle: string }) {
  const statusFn = useServerFn(getMemberStatus);
  const { data: status } = useQuery({
    queryKey: ["member-status", handle],
    queryFn: () => statusFn({ data: { handle } }),
    staleTime: 30_000,
  });

  const signals: string[] = [];
  if (status?.live) signals.push(status.radio ? "🎵 On Frass Radio" : "🔴 Live now");
  if (status?.studio) signals.push("🎬 In FV Studios");
  if (status?.selling) signals.push("🛍 Selling now");

  return (
    <div className="mini-card" role="dialog" aria-label={`${name}'s Frass Card preview`}>
      <div className="mini-card-hero" aria-hidden="true">
        {avatarUrl ? <img src={avatarUrl} alt="" loading="lazy" /> : <span>{name.charAt(0)}</span>}
      </div>
      <div className="mini-card-body">
        <p className="mini-card-name">{name}</p>
        {role && <p className="mini-card-role">{role}</p>}
        {signals.length > 0 && (
          <div className="mini-card-signals">
            {signals.map((s) => (
              <span key={s} className="mini-card-signal">
                {s}
              </span>
            ))}
          </div>
        )}
        <code className="mini-card-handle">@{handle}</code>
        <div className="mini-card-actions">
          <Link className="ws-chip text-xs" to="/card/$handle" params={{ handle }} hash="message">
            <MessageCircle className="h-3 w-3" /> Message
          </Link>
          <Link className="ws-chip text-xs" to="/card/$handle" params={{ handle }}>
            <Heart className="h-3 w-3" /> Follow
          </Link>
          <Link className="ws-chip text-xs" to="/card/$handle" params={{ handle }} hash="pay">
            <CreditCard className="h-3 w-3" /> Pay
          </Link>
          <Link className="ws-chip text-xs" to="/card/$handle" params={{ handle }}>
            <IdCard className="h-3 w-3" /> Open Frass Card
          </Link>
        </div>
      </div>
    </div>
  );
}

/** Inline name that opens the member's Frass Card. */
export function MemberName({
  handle,
  name,
  className,
}: {
  handle?: string | null;
  name: string;
  className?: string;
}) {
  const h = normalise(handle);
  const [open, setOpen] = useState(false);
  if (!h) return <span className={className}>{name}</span>;
  return (
    <span
      className="member-hover"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <Link
        to="/card/$handle"
        params={{ handle: h }}
        className={className}
        title={`Open ${name}'s Frass Card`}
      >
        {name}
      </Link>
      {open && <MiniCard handle={h} name={name} />}
    </span>
  );
}

/** Avatar + name block that opens the member's Frass Card. */
export function MemberIdentity({
  handle,
  name,
  avatarUrl,
  role,
  size = "sm",
  trailing,
}: MemberRef & { size?: "sm" | "md"; trailing?: ReactNode }) {
  const h = normalise(handle);
  const dim = size === "md" ? "h-11 w-11" : "h-8 w-8";
  const [open, setOpen] = useState(false);

  const body = (
    <>
      <span className={`member-identity-avatar ${dim}`} aria-hidden="true">
        {avatarUrl ? <img src={avatarUrl} alt="" loading="lazy" /> : <span>{name.charAt(0)}</span>}
      </span>
      <span className="min-w-0">
        <span className="member-identity-name">{name}</span>
        {role && <span className="member-identity-role">{role}</span>}
      </span>
      {trailing}
    </>
  );

  if (!h) return <span className="member-identity">{body}</span>;

  return (
    <span
      className="member-hover"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <Link
        to="/card/$handle"
        params={{ handle: h }}
        className="member-identity member-identity-link"
        aria-label={`Open ${name}'s Frass Card`}
      >
        {body}
      </Link>
      {open && <MiniCard handle={h} name={name} avatarUrl={avatarUrl} role={role} />}
    </span>
  );
}
