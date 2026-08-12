import { useState } from "react";
import { Share2 } from "lucide-react";
import { toast } from "sonner";
import { shareCard, type ShareCardSpec } from "@/lib/rights/share-card";

/**
 * FRASS-0492 — the share button that replaces the screenshot.
 *
 * One button, one renderer, everywhere. Nothing here reads or exports content
 * the member is not entitled to share; the caller decides that, and protected
 * artwork always leaves watermarked.
 */
export function ShareButton({
  spec,
  filename,
  label = "Share",
  className = "",
}: {
  spec: ShareCardSpec;
  filename?: string;
  label?: string;
  className?: string;
}) {
  const [busy, setBusy] = useState(false);

  return (
    <button
      type="button"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        const result = await shareCard(spec, filename);
        setBusy(false);
        if (result === "saved") toast.success("Frassy made your share card and saved it to your device.");
        if (result === "failed") toast.error("Frassy couldn't build that share card. Try again in a moment.");
      }}
      className={`inline-flex items-center gap-2 rounded-sm border border-border px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.28em] transition hover:border-[color:var(--gold)] disabled:opacity-50 ${className}`}
    >
      <Share2 className="h-3.5 w-3.5" />
      {busy ? "Building…" : label}
    </button>
  );
}
