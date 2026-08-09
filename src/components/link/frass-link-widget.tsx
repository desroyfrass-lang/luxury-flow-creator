import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { BarChart3, Copy, IdCard, QrCode, Share2, Users } from "lucide-react";
import { getMyProfile } from "@/lib/profiles.functions";
import { getMyLinkDashboard } from "@/lib/link.functions";
import { LINK_PRINCIPLE, linkLabel, linkUrl } from "@/lib/frass-link";

/**
 * FRASS-0428 — the permanent Frass Link widget.
 * Lives in The Daily, My Workspace, FOR ME and the Financial Center: copy,
 * share, QR, card, and today's recruitment summary — always one tap away.
 */
export function FrassLinkWidget({ context }: { context?: string }) {
  const profileFn = useServerFn(getMyProfile);
  const dashFn = useServerFn(getMyLinkDashboard);
  const { data: profile } = useQuery({ queryKey: ["my-profile"], queryFn: () => profileFn() });
  const { data: dash } = useQuery({ queryKey: ["my-link-dashboard"], queryFn: () => dashFn() });

  const handle = profile?.handle ?? null;
  const [qr, setQr] = useState<string | null>(null);
  const [showQr, setShowQr] = useState(false);

  useEffect(() => {
    if (!handle || !showQr) return;
    let alive = true;
    void (async () => {
      const QRCode = (await import("qrcode")).default;
      const src = await QRCode.toDataURL(`${linkUrl(handle)}?s=qr`, {
        width: 640,
        margin: 1,
        color: { dark: "#0b0b0c", light: "#ffffff" },
      });
      if (alive) setQr(src);
    })();
    return () => {
      alive = false;
    };
  }, [handle, showQr]);

  const copy = async () => {
    if (!handle) return;
    await navigator.clipboard.writeText(linkUrl(handle));
    toast.success("Your Frass Link is copied. It never changes — use it everywhere.");
  };

  const share = async () => {
    if (!handle) return;
    const url = linkUrl(handle);
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "My Frass Link", url });
        return;
      } catch {
        /* dismissed */
      }
    }
    await copy();
  };

  const t = dash?.totals;

  return (
    <section className="frass-link-widget" data-blueprint="frass-link" aria-label="My Frass Link">
      <header className="frass-link-head">
        <span className="ws-meta">
          <IdCard className="mr-1.5 inline h-3.5 w-3.5" /> My Frass Link{context ? ` · ${context}` : ""}
        </span>
        {handle ? (
          <code className="frass-link-url">{linkLabel(handle)}</code>
        ) : (
          <span className="ws-meta">
            Choose a handle in Builder Identity to claim your permanent link for life.
          </span>
        )}
      </header>

      <p className="frass-link-principle">{LINK_PRINCIPLE}</p>

      {handle && (
        <div className="frass-link-actions">
          <button type="button" className="ws-chip" onClick={copy}>
            <Copy className="h-3.5 w-3.5" /> Copy link
          </button>
          <button type="button" className="ws-chip" onClick={share}>
            <Share2 className="h-3.5 w-3.5" /> Share
          </button>
          <button type="button" className="ws-chip" onClick={() => setShowQr((v) => !v)}>
            <QrCode className="h-3.5 w-3.5" /> QR code
          </button>
          <Link className="ws-chip" to="/card/$handle" params={{ handle }}>
            Frass Card
          </Link>
          <Link className="ws-chip" to="/workspace/link">
            <BarChart3 className="h-3.5 w-3.5" /> Link analytics
          </Link>
        </div>
      )}

      {showQr && qr && (
        <img className="frass-link-qr" src={qr} alt="QR code for my Frass Link" width={180} height={180} />
      )}

      <dl className="frass-link-stats">
        <Stat label="Link opens" value={t?.opens ?? 0} />
        <Stat label="QR scans" value={t?.qrScans ?? 0} />
        <Stat label="Introduced" value={t?.introduced ?? 0} icon />
        <Stat label="Bonuses earned" value={t ? `$${t.bonusesEarned.toFixed(2)}` : "$0.00"} />
      </dl>
    </section>
  );
}

function Stat({ label, value, icon }: { label: string; value: number | string; icon?: boolean }) {
  return (
    <div>
      <dt>
        {icon && <Users className="mr-1 inline h-3 w-3" />}
        {label}
      </dt>
      <dd>{value}</dd>
    </div>
  );
}
