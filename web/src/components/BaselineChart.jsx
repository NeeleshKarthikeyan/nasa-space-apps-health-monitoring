/*
 * BaselineChart: the big chart on the astronaut page.
 * PROPS: signalKey, unit, points, day, color, big.
 *
 * HOW THE CHART IS BUILT (Recharts: each part of the chart is its own component):
 *   <ResponsiveContainer>  fills the box it sits in (its height comes from App.css)
 *   <ComposedChart>        a chart that can mix several layers; `data` is the list of days
 *   <XAxis>/<YAxis>        both have a FIXED range, so the chart doesn't rescale during playback
 *   <Area> (first)         the faint band = this astronaut's normal range. When dataKey returns
 *                          a pair [low, high], Recharts shades BETWEEN them
 *   <Area> (second)        the readings, with a gradient fill. connectNulls={false} leaves a
 *                          gap where a reading is missing instead of drawing it as zero
 *   <ReferenceLine>        the dashed line marking the selected day
 *   FlagDot                draws a red dot only on days the model flagged
 */
import {
  ComposedChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts'
import { signalInfo, todayStats, fixedRange } from '../signals'

// Draws a red dot only on flagged days; nothing on normal days
function FlagDot({ cx, cy, payload }) {
  if (!payload?.flagged || cy == null) return null
  return <circle cx={cx} cy={cy} r={4.5} fill="#ef4444" stroke="#0b0d12" strokeWidth={2} />
}

// Tooltip text: the band shows as "6.3 to 7.9", a missing reading as "no reading"
function formatValue(value) {
  if (Array.isArray(value)) return `${value[0]} to ${value[1]}`
  return value ?? 'no reading'
}

// A full chart: gradient area in the signal's colour over a faint "your normal range" band
export default function BaselineChart({ signalKey, unit, points, day, color, big }) {
  const { label, icon: Icon, digits, unitLabel } = signalInfo(signalKey)
  const { today } = todayStats(points, day)
  const visible = points.filter((p) => p.day <= day) // only show up to the selected day
  const gradientId = `fill-${signalKey}` // must be unique on the page
  const lastDay = points.at(-1)?.day ?? day // the x-axis always spans the whole mission, so it doesn't jump

  return (
    <div className={`chart-card ${big ? 'is-big' : ''}`}>
      <div className="chart-head">
        <span className="icon-tile" style={{ color, background: `${color}1f` }}>
          {Icon && <Icon size={15} />}
        </span>
        <h3>{label}</h3>
        <p className="chart-now">
          {today?.value == null ? '--' : today.value.toFixed(digits)}
          <span className="unit">{unitLabel ?? unit}</span>
        </p>
      </div>
      <div className="chart-area">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={visible} margin={{ top: 8, right: 12, bottom: 0, left: -8 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.4} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="#181c24" />
            <XAxis
              dataKey="day"
              type="number"
              domain={[1, lastDay]}
              stroke="#4b5563"
              tickLine={false}
              axisLine={false}
              fontSize={11}
              minTickGap={24}
            />
            <YAxis
              domain={fixedRange(points, signalKey)}
              tickFormatter={(v) => v.toFixed(digits)}
              allowDecimals={digits > 0}
              stroke="#4b5563"
              tickLine={false}
              axisLine={false}
              fontSize={11}
              width={44}
            />
            <Tooltip
              formatter={formatValue}
              labelFormatter={(d) => `Day ${d}`}
              contentStyle={{
                background: '#0b0d12',
                border: '1px solid #262b36',
                borderRadius: 8,
              }}
            />
            {/* Your normal range: a faint band */}
            <Area
              dataKey={(p) => [p.baseline_low, p.baseline_high]}
              name="Your normal range"
              fill="#ffffff"
              fillOpacity={0.05}
              stroke="none"
              isAnimationActive={false}
            />
            {/* The readings: gradient fill; a missing reading leaves a gap */}
            <Area
              dataKey="value"
              name={label}
              stroke={color}
              strokeWidth={2}
              fill={`url(#${gradientId})`}
              connectNulls={false}
              dot={<FlagDot />}
              activeDot={{ r: 4, fill: color }}
              isAnimationActive={false}
            />
            <ReferenceLine x={day} stroke="#6b7280" strokeDasharray="4 4" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
