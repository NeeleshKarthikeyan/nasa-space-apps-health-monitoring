/*
 * RingGauge: the circular "anomaly score" gauge on crew cards and the astronaut page.
 *
 * It's drawn with SVG (vector graphics) rather than a chart library:
 *   - one grey circle is the track,
 *   - a second circle on top is the coloured arc. The trick is strokeDasharray +
 *     strokeDashoffset: the circle's outline is one long dash, and the offset hides
 *     part of it, so only `pct` of the circle is drawn,
 *   - rotate(-90) makes the arc start at the top instead of the right.
 * PROPS: value (0 to 1, or null if unknown), color, label (for screen readers), size in pixels.
 */
// A circular gauge like the CPU/Memory rings in the inspiration. value is 0 to 1, or null if unknown.
export default function RingGauge({ value, color, label, size = 76 }) {
  const stroke = 7
  const r = (size - stroke) / 2
  const circumference = 2 * Math.PI * r
  const known = value != null
  const pct = known ? Math.max(0, Math.min(1, value)) : 0
  const centre = size / 2

  return (
    <svg
      width={size}
      height={size}
      className="ring"
      role="img"
      aria-label={known ? `${label}: ${Math.round(pct * 100)}%` : `${label}: not available`}
    >
      <circle cx={centre} cy={centre} r={r} stroke="#1f2430" strokeWidth={stroke} fill="none" />
      <circle
        cx={centre}
        cy={centre}
        r={r}
        stroke={color}
        strokeWidth={stroke}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={circumference * (1 - pct)}
        transform={`rotate(-90 ${centre} ${centre})`}
        style={{ transition: 'stroke-dashoffset 0.4s ease, stroke 0.4s ease', filter: `drop-shadow(0 0 4px ${color}66)` }}
      />
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" className="ring-value">
        {known ? `${Math.round(pct * 100)}%` : '--'}
      </text>
    </svg>
  )
}
