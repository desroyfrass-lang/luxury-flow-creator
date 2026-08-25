/**
 * FRASS root arrival — destination markers.
 *
 * Three hand-crafted symbols that belong to one family: same 64-unit canvas,
 * same dimensional depth, same soft shadow, same edge polish. They are markers,
 * never buttons — the entrance buttons stay the single visible set.
 */

const SHARED =
  "h-10 w-10 shrink-0 drop-shadow-[0_4px_10px_rgba(0,0,0,0.45)] transition-transform duration-500 ease-out group-hover:-translate-y-0.5 group-focus-visible:-translate-y-0.5 motion-reduce:transition-none sm:h-12 sm:w-12";

/** Frass District — a sculptural hanger with a garment draped over it. */
export function DistrictSymbol() {
  return (
    <svg viewBox="0 0 64 64" className={SHARED} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="frass-metal" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fff4c9" />
          <stop offset="45%" stopColor="#e6c463" />
          <stop offset="100%" stopColor="#9c7a22" />
        </linearGradient>
        <linearGradient id="frass-cloth" x1="0.2" y1="0" x2="0.9" y2="1">
          <stop offset="0%" stopColor="#7fe3f0" />
          <stop offset="55%" stopColor="#2aa3bd" />
          <stop offset="100%" stopColor="#0b5c74" />
        </linearGradient>
      </defs>
      {/* hook + bar */}
      <path
        d="M32 12c3.6 0 6 2.2 6 5.2 0 2.6-2 4-4 4.8v2.4"
        fill="none"
        stroke="url(#frass-metal)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M32 25 12 38.5c-1.6 1.1-.9 3.5 1.1 3.5h37.8c2 0 2.7-2.4 1.1-3.5L32 25Z"
        fill="none"
        stroke="url(#frass-metal)"
        strokeWidth="3.2"
        strokeLinejoin="round"
      />
      {/* draped garment */}
      <path
        d="M18 42h28l-2.6 12.6c-.3 1.4-1.5 2.4-2.9 2.4h-17c-1.4 0-2.6-1-2.9-2.4L18 42Z"
        fill="url(#frass-cloth)"
        stroke="#04333f"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path d="M32 42v15" stroke="#04333f" strokeWidth="1.2" opacity="0.55" />
      <path d="M22 44.5c3 1.4 6.4 2 10 2s7-.6 10-2" fill="none" stroke="#eafbff" strokeWidth="1.2" opacity="0.5" />
    </svg>
  );
}

/** Frass Hill — a jewel-cut dollar sign: money, opportunity, building. */
export function HillSymbol() {
  return (
    <svg viewBox="0 0 64 64" className={SHARED} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="frass-jewel" x1="0.1" y1="0" x2="0.9" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="30%" stopColor="#ffe89a" />
          <stop offset="65%" stopColor="#d9af3d" />
          <stop offset="100%" stopColor="#8a6510" />
        </linearGradient>
        <radialGradient id="frass-jewel-glow" cx="0.5" cy="0.45" r="0.55">
          <stop offset="0%" stopColor="#fff6d0" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#fff6d0" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="32" cy="32" r="24" fill="url(#frass-jewel-glow)" />
      <text
        x="32"
        y="45"
        textAnchor="middle"
        fontSize="42"
        fontWeight="700"
        fontFamily="Georgia, 'Times New Roman', serif"
        fill="url(#frass-jewel)"
        stroke="#5c4308"
        strokeWidth="1.1"
      >
        $
      </text>
      {/* restrained sparkle */}
      <g className="marker-sparkle" fill="#fffbe8">
        <path d="M48 18l1.4 3.6L53 23l-3.6 1.4L48 28l-1.4-3.6L43 23l3.6-1.4L48 18Z" />
        <path d="M17 40l.9 2.3 2.3.9-2.3.9-.9 2.3-.9-2.3-2.3-.9 2.3-.9.9-2.3Z" opacity="0.8" />
      </g>
    </svg>
  );
}

/** Frass Kids — a generic interlocking toy building brick. */
export function KidsSymbol() {
  return (
    <svg viewBox="0 0 64 64" className={SHARED} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="frass-brick-top" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ff9d6c" />
          <stop offset="100%" stopColor="#f4552f" />
        </linearGradient>
        <linearGradient id="frass-brick-face" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffd34d" />
          <stop offset="100%" stopColor="#e08a12" />
        </linearGradient>
        <linearGradient id="frass-brick-side" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4fd0e6" />
          <stop offset="100%" stopColor="#1e7fa8" />
        </linearGradient>
      </defs>
      {/* studs */}
      <ellipse cx="24" cy="19" rx="6.5" ry="3.6" fill="url(#frass-brick-top)" stroke="#7a2a12" strokeWidth="1.1" />
      <ellipse cx="41" cy="19" rx="6.5" ry="3.6" fill="url(#frass-brick-top)" stroke="#7a2a12" strokeWidth="1.1" />
      <path d="M17.5 19v4M30.5 19v4M34.5 19v4M47.5 19v4" stroke="#7a2a12" strokeWidth="1.1" />
      {/* body */}
      <path
        d="M11 26.5 32 20l21 6.5-21 7.5-21-7.5Z"
        fill="url(#frass-brick-top)"
        stroke="#7a2a12"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path d="M11 26.5v14L32 48V34l-21-7.5Z" fill="url(#frass-brick-face)" stroke="#7a2a12" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M53 26.5v14L32 48V34l21-7.5Z" fill="url(#frass-brick-side)" stroke="#0f4f68" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M14 29.5v10" stroke="#fff0c2" strokeWidth="1.2" opacity="0.55" />
    </svg>
  );
}
