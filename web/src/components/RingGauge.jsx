// A circular gauge like the CPU/Memory rings in the inspiration. value is 0 to 1.
export default function RingGauge({ value, color, label, size = 76 }) {
  const stroke = 7
  const r = (size - stroke) / 2
  const circumference = 2 * Math.PI * r
  const pct = Math.max(0, Math.min(1, value ?? 0))
  const centre = size / 2

  return (
    <svg width={size} height={size} className="ring" role="img" aria-label={`${label}: ${Math.round(pct * 100)}%`}>
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
        {Math.round(pct * 100)}%
      </text>
    </svg>
  )
}
