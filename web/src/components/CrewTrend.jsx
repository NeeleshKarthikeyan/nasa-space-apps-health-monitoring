/*
 * CrewTrend: one chart on the overview page with a line per crew member, showing their
 * anomaly score (0 to 100%) on every day of the mission so far.
 * It shows HOW each person got to today's status: slow drifts and sudden spikes both stand out.
 * PROPS: history (every day's crew list), lastDay, day (selected day).
 *
 * Like the other charts, the axes are fixed and lines only run up to the selected day,
 * so pressing play "draws" the mission from left to right without anything jumping.
 * If the API can't give scores for earlier days, it shows a short note instead of an empty chart.
 */
import { LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine, CartesianGrid, ResponsiveContainer } from 'recharts'
import { crewInfo } from '../crew'

// One colour per crew member. Deliberately NOT green, amber or red, which mean status.
const LINE_COLORS = ['#60a5fa', '#c084fc', '#22d3ee', '#f472b6']

export default function CrewTrend({ history, lastDay, day }) {
  const days = Array.from({ length: lastDay }, (_, i) => i + 1)
  // Every astronaut that appears on any day, in order (A, B, C, D)
  const ids = [...new Set(days.flatMap((d) => (history[d] ?? []).map((a) => a.astronaut_id)))].sort()

  // Recharts wants one object per day: { day: 12, A: 0.18, B: 0.22, ... }
  const data = days.map((d) => {
    const row = { day: d }
    for (const a of history[d] ?? []) {
      row[a.astronaut_id] = d <= day && a.anomaly_score != null ? Math.round(a.anomaly_score * 100) : null
    }
    return row
  })
  // Do we have scores for more than one day? (Without the API's ?day= support we only have today's.)
  const daysWithScores = days.filter((d) => (history[d] ?? []).some((a) => a.anomaly_score != null)).length

  return (
    <section className="panel">
      <div className="panel-head">
        <p className="eyebrow">Anomaly score over the mission</p>
        <div className="legend">
          {ids.map((id, i) => (
            <span key={id}>
              <span className="dot" style={{ background: LINE_COLORS[i % LINE_COLORS.length] }} />
              {crewInfo(id).callsign}
            </span>
          ))}
        </div>
      </div>

      {daysWithScores < 2 ? (
        <p className="muted small">
          Daily scores will appear here once the API provides a score for every day (its ?day= update).
          Today's scores are on the crew cards above.
        </p>
      ) : (
        <div className="trend-area">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -8 }}>
              <CartesianGrid vertical={false} stroke="#181c24" />
              <XAxis
                dataKey="day"
                type="number"
                domain={[1, lastDay]}
                stroke="#4b5563"
                tickLine={false}
                axisLine={false}
                fontSize={11}
              />
              <YAxis
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
                tickFormatter={(v) => `${v}%`}
                stroke="#4b5563"
                tickLine={false}
                axisLine={false}
                fontSize={11}
                width={44}
              />
              <Tooltip
                formatter={(value, name) => [`${value}%`, name]}
                labelFormatter={(d) => `Day ${d}`}
                contentStyle={{ background: '#0b0d12', border: '1px solid #262b36', borderRadius: 8 }}
              />
              {ids.map((id, i) => (
                <Line
                  key={id}
                  dataKey={id}
                  name={crewInfo(id).callsign}
                  stroke={LINE_COLORS[i % LINE_COLORS.length]}
                  strokeWidth={2}
                  dot={false}
                  connectNulls={false}
                  isAnimationActive={false}
                />
              ))}
              <ReferenceLine x={day} stroke="#6b7280" strokeDasharray="4 4" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  )
}
