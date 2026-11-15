/*
 * BrandMark: the logo in the top-left corner. The same drawing (with a dark background tile)
 * is the browser-tab icon in web/public/favicon.svg.
 *
 * It combines space and health: a glowing planet with an orbit ring and sparkle stars (space),
 * crossed by a heartbeat line like an EKG trace, with a medical cross (health).
 * It's drawn as SVG (vector graphics), so it stays sharp at any size.
 * The <filter> makes the soft glow: it blurs a copy of the shape and lays the sharp shape on top.
 * PROPS: size in pixels (default 32).
 */
export default function BrandMark({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" role="img" aria-label="Crew Health logo">
      <defs>
        <radialGradient id="brand-planet" cx="36%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#7cc4ff" />
          <stop offset="45%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#0a1440" />
        </radialGradient>
        <filter id="brand-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* small stars */}
      <circle cx="9" cy="44" r="0.8" fill="#bfdbfe" />
      <circle cx="51" cy="9" r="0.7" fill="#bfdbfe" />
      <circle cx="27" cy="7" r="0.6" fill="#93c5fd" />
      <path
        d="M12 8.5 Q12 12 15.5 12 Q12 12 12 15.5 Q12 12 8.5 12 Q12 12 12 8.5 Z"
        fill="#e0f2fe"
        filter="url(#brand-glow)"
      />
      <path d="M50 49.5 Q50 52 52.5 52 Q50 52 50 54.5 Q50 52 47.5 52 Q50 52 50 49.5 Z" fill="#e0f2fe" />
      {/* orbit ring: back half (behind the planet) */}
      <path
        d="M3 34 A29 10.5 0 0 1 61 34"
        transform="rotate(-20 32 34)"
        fill="none"
        stroke="#38bdf8"
        strokeWidth="1.8"
        opacity="0.45"
      />
      {/* planet */}
      <circle cx="32" cy="33" r="17" fill="url(#brand-planet)" />
      <circle cx="32" cy="33" r="17" fill="none" stroke="#93c5fd" strokeWidth="0.8" opacity="0.5" />
      {/* orbit ring: front half (in front of the planet) */}
      <path
        d="M3 34 A29 10.5 0 0 0 61 34"
        transform="rotate(-20 32 34)"
        fill="none"
        stroke="#38bdf8"
        strokeWidth="2.8"
        strokeLinecap="round"
        filter="url(#brand-glow)"
      />
      {/* heartbeat (EKG) line: a cyan glow under a bright core */}
      <polyline
        points="7,34 20,34 23,28 26.5,41 30.5,19 34.5,38 37.5,34 56,34"
        fill="none"
        stroke="#22d3ee"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.45"
        filter="url(#brand-glow)"
      />
      <polyline
        points="7,34 20,34 23,28 26.5,41 30.5,19 34.5,38 37.5,34 56,34"
        fill="none"
        stroke="#e0f2fe"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* medical cross */}
      <path
        d="M44 15.5 V25.5 M39 20.5 H49"
        stroke="#bfdbfe"
        strokeWidth="3.2"
        strokeLinecap="round"
        filter="url(#brand-glow)"
      />
      {/* bright sparkle where the ring meets the right edge */}
      <path
        d="M58 19 Q58 24 63 24 Q58 24 58 29 Q58 24 53 24 Q58 24 58 19 Z"
        fill="#ffffff"
        filter="url(#brand-glow)"
      />
    </svg>
  )
}
