// ─────────────────────────────────────────────────────────────────────────────
// Frassy, visible — FRASS-0581.
//
// Her illustrated portrait, dressed for the room she is standing in. Tap her
// outfit and the Frost District pieces open. Tap her hair and the Hair
// Collection unit opens. This is the store living inside the conversation.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ShoppingBag, Scissors, X } from "lucide-react";
import {
  frassyLook,
  pieceHandle,
  type FrassyRoom,
  type WardrobePiece,
} from "@/lib/frassy/wardrobe";

function PieceRow({ piece }: { piece: WardrobePiece }) {
  return (
    <Link
      to="/collection/$handle"
      params={{ handle: pieceHandle(piece) }}
      className="flex items-start justify-between gap-4 rounded-sm border border-white/10 px-4 py-3 hover:border-[color:var(--gold)]/60"
    >
      <span>
        <span className="block text-sm text-white">{piece.name}</span>
        <span className="mt-1 block text-xs text-white/50">{piece.detail}</span>
      </span>
      <span className="shrink-0 text-[10px] uppercase tracking-[0.25em] text-[color:var(--gold)]">
        {piece.comingSoon ? "Next drop" : "Shop"}
      </span>
    </Link>
  );
}

function ShopSheet({
  title,
  note,
  pieces,
  onClose,
}: {
  title: string;
  note: string;
  pieces: WardrobePiece[];
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-sm border border-[color:var(--gold)]/40 bg-[#0b0c0f] p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-[10px] uppercase tracking-[0.35em] text-[color:var(--gold)]">
              {title}
            </div>
            <p className="mt-2 text-sm text-white/60">{note}</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="text-white/50 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-5 space-y-2">
          {pieces.map((p) => (
            <PieceRow key={p.name} piece={p} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function FrassyLook({
  room,
  size = 128,
  showCaption = true,
}: {
  room: FrassyRoom;
  size?: number;
  showCaption?: boolean;
}) {
  const look = frassyLook(room);
  const [sheet, setSheet] = useState<null | "outfit" | "hair">(null);

  return (
    <div className="flex items-center gap-4">
      <div
        className="relative shrink-0 overflow-hidden rounded-sm border border-[color:var(--gold)]/40"
        style={{ width: size, height: size }}
      >
        <img
          src={look.image}
          alt={look.alt}
          loading="lazy"
          width={768}
          height={1024}
          className="h-full w-full object-cover object-top"
        />
        {/* Top half of her portrait is hair, bottom half is the outfit. */}
        <button
          onClick={() => setSheet("hair")}
          aria-label={`Shop Frassy's hair — ${look.hair.name}`}
          className="absolute inset-x-0 top-0 h-1/2 hover:bg-[color:var(--gold)]/10"
        />
        <button
          onClick={() => setSheet("outfit")}
          aria-label="Shop Frassy's outfit from the Frost District"
          className="absolute inset-x-0 bottom-0 h-1/2 hover:bg-[color:var(--gold)]/10"
        />
      </div>

      {showCaption && (
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--gold)]">
            {look.title}
          </div>
          <p className="mt-1 text-sm text-white/60">{look.mood}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => setSheet("outfit")}
              className="inline-flex items-center gap-2 rounded-sm border border-white/15 px-3 py-2 text-[10px] uppercase tracking-[0.25em] text-white/70 hover:border-[color:var(--gold)] hover:text-white"
            >
              <ShoppingBag className="h-3.5 w-3.5" /> Shop her outfit
            </button>
            <button
              onClick={() => setSheet("hair")}
              className="inline-flex items-center gap-2 rounded-sm border border-white/15 px-3 py-2 text-[10px] uppercase tracking-[0.25em] text-white/70 hover:border-[color:var(--gold)] hover:text-white"
            >
              <Scissors className="h-3.5 w-3.5" /> Shop her hair
            </button>
          </div>
        </div>
      )}

      {sheet === "outfit" && (
        <ShopSheet
          title="Frost District — what she's wearing"
          note="Frassy only ever wears Frass. Every piece here is from the Frost District collection."
          pieces={look.outfit}
          onClose={() => setSheet(null)}
        />
      )}
      {sheet === "hair" && (
        <ShopSheet
          title="Hair Collection — today's style"
          note="Her style changes daily. This is the exact unit she's wearing today."
          pieces={[look.hair]}
          onClose={() => setSheet(null)}
        />
      )}
    </div>
  );
}
