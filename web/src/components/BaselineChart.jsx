import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts'

// Draws a red dot only on flagged days; nothing on normal days
function FlagDot({ cx, cy, payload }) {
  if (!payload?.flagged || cy == null) return null
  return <circle cx={cx} cy={cy} r={5} fill="#ef4444" stroke="#ffffff" strokeWidth={1} />
}

// Tooltip text: the band shows as "6.3 to 7.9", a missing reading as "no reading"
function formatValue(value) {
  if (Array.isArray(value)) return `${value[0]} to ${value[1]}`
  return value ?? 'no reading'
}

export default function BaselineChart({ name, unit, points, day }) {
  const visible = points.filter((p) => p.day <= day) // only show up to the selected day

  return (
    <div className="chart-card">
      <h3>
        {name} <span className="unit">({unit})</span>
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <ComposedChart data={visible} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
          <XAxis dataKey="day" stroke="#6b7280" />
          <YAxis domain={['auto', 'auto']} stroke="#6b7280" width={48} />
          <Tooltip
            formatter={formatValue}
            labelFormatter={(d) => `Day ${d}`}
            contentStyle={{ background: '#0b1020', border: '1px solid #263049' }}
          />
          {/* The shaded band: this astronaut's normal range */}
          <Area
            dataKey={(p) => [p.baseline_low, p.baseline_high]}
            name="Your normal range"
            fill="#22c55e"
            fillOpacity={0.12}
            stroke="none"
            isAnimationActive={false}
          />
          {/* The actual readings; a missing reading leaves a gap */}
          <Line
            dataKey="value"
            name={name}
            stroke="#7dd3fc"
            strokeWidth={2}
            connectNulls={false}
            dot={<FlagDot />}
            isAnimationActive={false}
          />
          <ReferenceLine x={day} stroke="#9ca3af" strokeDasharray="4 4" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}