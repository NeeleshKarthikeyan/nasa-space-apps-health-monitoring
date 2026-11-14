/*
 * SignalWidget: one small tile per health signal on the astronaut page: icon, today's value,
 * change from normal, and a mini chart of the last 3 weeks.
 * It is a <button>: clicking it shows that signal in the big chart above.
 * PROPS: signalKey (e.g. "sleep_h"), unit, points (the signal's data), day, color,
 *        selected (is it in the big chart?), onSelect (what to do when clicked).
 *
 * The mini chart uses the Recharts library: <ResponsiveContainer> makes the chart fill its
 * box, <AreaChart> draws the filled line, and <linearGradient> creates the fade to transparent.
 */
import { AreaChart, Area, YAxis, ResponsiveContainer } from 'recharts'
import { ArrowDown, ArrowUp } from 'lucide-react'
import { signalInfo, todayStats, fixedRange } from '../signals'

// A small widget per signal: icon, today's value, change from normal, and a mini gradient chart.
// It's a button: clicking it shows this signal in the big chart.
export default function SignalWidget({ signalKey, unit, points, day, color, selected, onSelect }) {
  const { label, icon: Icon, digits, unitLabel } = signalInfo(signalKey)
  const { today, diff, outside } = todayStats(points, day)
  const recent = points.filter((p) => p.day <= day).slice(-21) // last 3 weeks
  const gradientId = `mini-${signalKey}`

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`widget ${outside ? 'is-outside' : ''} ${selected ? 'is-selected' : ''}`}
      style={{ '--accent': color }}
    >
      <div className="widget-head">
        <span className="icon-tile" style={{ color, background: `${color}1f` }}>
          <Icon size={15} />
        </span>
        <span className="widget-name">{label}</span>
      </div>

      <p className="widget-value">
        {today?.value == null ? '--' : today.value.toFixed(digits)}
        <span className="unit">{unitLabel ?? unit}</span>
      </p>
      <p className={`delta ${outside ? 'warn' : ''}`}>
        {diff == null ? (
          'No reading today'
        ) : (
          <>
            {diff >= 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
            {Math.abs(diff).toFixed(digits)} vs your normal
          </>
        )}
      </p>

      <div className="mini-chart">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={recent} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.4} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <YAxis hide domain={fixedRange(points, signalKey)} />
            <Area
              dataKey="value"
              stroke={color}
              strokeWidth={1.5}
              fill={`url(#${gradientId})`}
              connectNulls={false}
              dot={false}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </button>
  )
}
