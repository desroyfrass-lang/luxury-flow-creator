import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, ExternalLink, IdCard, Pencil, Wallet } from "lucide-react";
import { getMyProfile } from "@/lib/profiles.functions";
import { getMyCard } from "@/lib/card.functions";
import { accentValue, cardPath, themeValue } from "@/lib/card";
import { ShareCardButton } from "@/components/card/card-share";

/**
 * FRASS-0426 — the compact Frass Card widget.
 * Permanently available from The Daily, My Workspace, FOR ME and the Financial
 * Center. Always one click from view, copy, share, analytics and edit.
 */
export function FrassCardWidget({ context }: { context?: string }) {
  const profileFn = useServerFn(getMyProfile);
  const cardFn = useServerFn(getMyCard);

  const { data: profile } = useQuery({ queryKey: ["my-profile"], queryFn: () => profileFn() });
  const { data: card } = useQuery({ queryKey: ["my-business-card"], queryFn: () => cardFn() });

  const handle = profile?.handle ?? null;
  const name = profile?.display_name ?? profile?.full_name ?? "Your card";
  const theme = themeValue(card?.theme ?? "midnight");
  const accent = accentValue(card?.accent ?? "gold");

  return (
    <section
      className="frass-card-widget"
      data-blueprint="living-business-card"
      style={{ ["--card-wash" as string]: theme.wash, ["--card-accent" as string]: accent }}
      aria-label="My Frass Card"
    >
      <div className="living-card-strip">
        <div className="living-card-avatar">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="" />
          ) : (
            <span>{name.charAt(0).toUpperCase()}</span>
          )}
        </div>
        <div className="living-card-id">
          <span className="ws-meta">
            <IdCard className="mr-1.5 inline h-3.5 w-3.5" /> Frass Card
            {context ? ` · ${context}` : ""}
          </span>
          <h3 className="living-card-name">{name}</h3>
          <p className="living-card-role">
            {card?.job_title || card?.headline || "Your digital handshake — always current, always ready to share."}
          </p>
          {handle ? (
            <code className="living-card-url">frasskicks.com{cardPath(handle)}</code>
          ) : (
            <span className="ws-meta">Choose a handle in Builder Identity to activate your permanent link.</span>
          )}
        </div>
      </div>

      <div className="living-card-actions">
        {handle && <ShareCardButton handle={handle} name={name} />}
        {handle && (
          <a className="ws-chip" href={cardPath(handle)} target="_blank" rel="noreferrer">
            <ExternalLink className="h-3.5 w-3.5" /> View card
          </a>
        )}
        <Link className="ws-chip" to="/workspace/card">
          <Pencil className="h-3.5 w-3.5" /> Edit
        </Link>
        <Link className="ws-chip" to="/workspace/wallet">
          <Wallet className="h-3.5 w-3.5" /> Wallet
        </Link>
        <Link className="ws-chip" to="/workspace/card" hash="analytics">
          <BarChart3 className="h-3.5 w-3.5" /> Analytics
        </Link>
      </div>
    </section>
  );
}
