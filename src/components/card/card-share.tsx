import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Copy, QrCode, Share2, X } from "lucide-react";
import { SHARE_TARGETS, cardUrl } from "@/lib/card";
import { recordCardEvent } from "@/lib/card.functions";

/**
 * FRASS-0426 — one card, ten doors.
 * Sharing is the whole point of a business card, so the sheet is deliberately
 * flat: every destination is one tap, and the QR code is always in the room.
 */
export function CardShareSheet({
  handle,
  name,
  onClose,
}: {
  handle: string;
  name: string;
  onClose: () => void;
}) {
  const url = cardUrl(handle);
  const text = `${name} on Frass — my Living Business Card.`;
  const [qr, setQr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    void (async () => {
      const QRCode = (await import("qrcode")).default;
      const src = await QRCode.toDataURL(url, {
        width: 640,
        margin: 1,
        color: { dark: "#0b0b0c", light: "#ffffff" },
      });
      if (alive) setQr(src);
    })();
    return () => {
      alive = false;
    };
  }, [url]);

  const track = (detail: string) => {
    void recordCardEvent({ data: { handle, kind: "share", detail } }).catch(() => {});
  };

  const onTarget = async (id: string) => {
    const target = SHARE_TARGETS.find((t) => t.id === id)!;
    track(id);
    if (target.href) {
      window.open(target.href(url, text), "_blank", "noopener,noreferrer");
      return;
    }
    if (id === "copy" || id === "instagram" || id === "frass") {
      await navigator.clipboard.writeText(url);
      toast.success(
        id === "instagram"
          ? "Link copied — paste it into your Instagram bio or story."
          : id === "frass"
            ? "Link copied — paste it into any Frass conversation."
            : "Card link copied.",
      );
    }
  };

  return (
    <div className="card-share-scrim" role="dialog" aria-label="Share my business card">
      <div className="card-share-sheet">
        <div className="card-share-head">
          <span className="ws-meta">Share my business card</span>
          <button type="button" className="ws-icon" onClick={onClose} aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="card-share-link">
          <code>{url}</code>
          <button
            type="button"
            className="ws-chip"
            onClick={async () => {
              await navigator.clipboard.writeText(url);
              track("copy");
              toast.success("Card link copied.");
            }}
          >
            <Copy className="h-3.5 w-3.5" /> Copy
          </button>
        </div>

        <div className="card-share-grid">
          {SHARE_TARGETS.filter((t) => t.id !== "qr").map((t) => (
            <button key={t.id} type="button" className="card-share-target" onClick={() => void onTarget(t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="card-share-qr">
          {qr ? <img src={qr} alt={`QR code linking to ${name}'s Frass business card`} /> : <div className="card-share-qr-wait" />}
          <div>
            <span className="ws-meta">
              <QrCode className="mr-1.5 inline h-3.5 w-3.5" /> Branded QR code
            </span>
            <p className="text-xs text-muted-foreground">
              It always points at your live card, so it never goes out of date — print it on packaging,
              storefronts, merchandise or conference badges.
            </p>
            {qr && (
              <a className="ws-chip mt-2 inline-flex" href={qr} download={`frass-card-${handle}.png`} onClick={() => track("qr")}>
                Download QR
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/** The prominent button the specification asks for, usable anywhere. */
export function ShareCardButton({ handle, name }: { handle: string; name: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" className="daily-enter" onClick={() => setOpen(true)}>
        <Share2 className="mr-1.5 inline h-4 w-4" /> Share My Business Card
      </button>
      {open && <CardShareSheet handle={handle} name={name} onClose={() => setOpen(false)} />}
    </>
  );
}
