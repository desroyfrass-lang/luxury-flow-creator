import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

/**
 * FRASS-0428A — Universal Frass Card.
 *
 * Constitutional amendment: the Frass Card replaces the traditional user
 * profile. Wherever a member's name, avatar or identity appears anywhere in
 * the ecosystem — For Us, Town Square, Marketplace, Brand Partnerships,
 * FV Studios, Radio, comments, followers, search, live — selecting it opens
 * their Frass Card. Never a tiny profile popup.
 *
 * Use `MemberIdentity` for avatar + name, `MemberName` for inline text.
 * A member without a handle yet renders as plain text, never a dead link.
 */

export const UNIVERSAL_CARD_PRINCIPLE =
  "Every member automatically receives a Frass Card. It is the universal identity object of the Frass ecosystem — selecting anyone, anywhere, opens their Frass Card.";

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
  if (!h) return <span className={className}>{name}</span>;
  return (
    <Link
      to="/card/$handle"
      params={{ handle: h }}
      className={className}
      title={`Open ${name}'s Frass Card`}
    >
      {name}
    </Link>
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
    <Link
      to="/card/$handle"
      params={{ handle: h }}
      className="member-identity member-identity-link"
      aria-label={`Open ${name}'s Frass Card`}
    >
      {body}
    </Link>
  );
}
