import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";

import studioEntry from "@/assets/studio-entry.jpg";
import greenMural from "@/assets/frass-green-studio-mural.jpg.asset.json";

/**
 * Frass Vision Studios (FV Studios) portal card — same block-letter / chrome-gold
 * Frass Kicks language used across the district entries. Reused on the home page
 * and on Frass Hill.
 */
export function StudioEntryCard({ className = "" }: { className?: string }) {
  return (
    <Link
      to="/studio"
      className={`group relative block overflow-hidden rounded-[2rem] border border-[color:var(--gold)]/30 bg-background transition hover:border-[color:var(--gold)] ${className}`}
    >
      <div className="relative h-[520px] overflow-hidden md:h-[600px]">
        <img
          src={studioEntry}
          alt="Inside Frass Vision Studios with a wall of records and a green Jamaica mural"
          width={1600}
          height={1008}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]"
        />

        {/* Record wall — the first thing visible on the left side of the studio. */}
        <div className="absolute bottom-28 left-4 top-5 w-[32%] border border-gold/35 bg-background/65 p-3 shadow-2xl backdrop-blur-sm md:bottom-16 md:left-8 md:top-8 md:w-[28%] md:p-5">
          <div className="grid h-full grid-cols-2 content-center gap-3 md:grid-cols-3 md:gap-4" aria-label="Gold and black records on the studio wall">
            {Array.from({ length: 12 }).map((_, index) => (
              <span key={index} className="studio-record" aria-hidden="true" />
            ))}
          </div>
        </div>

        {/* Green Bob Marley/Jamaica artwork hangs as the framed studio mural. */}
        <div className="absolute right-4 top-5 w-[48%] border-[5px] border-chrome bg-card p-1 shadow-2xl md:right-8 md:top-8 md:w-[45%] md:border-[9px]">
          <img
            src={greenMural.url}
            alt="Green and gold Jamaica music mural displayed in Frass Vision Studios"
            width={1376}
            height={768}
            loading="lazy"
            className="aspect-video w-full object-cover"
          />
          <div className="h-1 bg-gold" aria-hidden="true" />
        </div>
      </div>

      {/* Doorway light + darkening for legibility */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-background/55 to-transparent" />
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100"
        style={{ background: "radial-gradient(60% 70% at 50% 60%, oklch(0.78 0.14 78 / 0.28), transparent 70%)" }}
      />

      <div className="absolute inset-x-0 bottom-0 p-8 md:p-12">
        <div className="text-[11px] uppercase tracking-[0.35em] text-[color:var(--gold)]">
          Now open · Studio District · Frass Hill
        </div>
        <h2 className="mt-3 font-display text-4xl uppercase leading-[0.9] md:text-6xl">
          Frass Vision Studios
        </h2>
        <p className="mt-2 text-[11px] uppercase tracking-[0.35em] text-muted-foreground">
          Known throughout Frass as FV Studios
        </p>
        <p className="mt-4 max-w-lg text-sm text-muted-foreground md:text-base">
          The flagship production house of Frass. Films, documentaries, commercials, music
          videos, podcasts and campaigns — shot on your phone, finished to broadcast standard,
          with credits forecast before anything runs.
        </p>
        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-[color:var(--gold)]/50 px-5 py-2 text-xs uppercase tracking-[0.3em] text-foreground transition group-hover:bg-[color:var(--gold)]/10 group-hover:text-[color:var(--gold)]">
          Enter FV Studios <ArrowUpRight className="h-4 w-4" />
        </div>

      </div>
    </Link>
  );
}
