/*
 * CrewTimeline: the grid on the overview page. One row per astronaut, one cell per day,
 * coloured by that day's status. Clicking a cell jumps the whole dashboard to that day.
 * PROPS: history (every day's crew list), lastDay, day (selected), setDay (to change it).
 *
 * REACT IDEAS USED HERE:
 *   - list.map(item => <Something key={...} />) draws one element per item in a list.
 *     React needs a unique `key` on each one, so it can tell them apart when things change.
 *   - <Fragment> groups elements without adding an extra box to the page.
 *   - onClick={() => setDay(d)} runs when the cell is clicked; calling setDay (from App)
 *     changes the shared day, and every part of the dashboard redraws for that day.
 */
import { Fragment } from 'react'
import { crewInfo } from '../crew'
import { statusOf } from '../status'

// 4 rows (crew) x N columns (days), each cell coloured by that day's status. Click a cell to jump there.
export default function CrewTimeline({ history, lastDay, day, setDay }) {
  const days = Array.from({ length: lastDay }, (_, i) => i + 1)
  // Every astronaut that appears on any day, in order
  const ids = [...new Set(days.flatMap((d) => (history[d] ?? []).map((a) => a.astronaut_id)))].sort()

  return (
    <section className="panel">
      <div className="panel-head">
        <p className="eyebrow">Mission timeline</p>
        <p className="muted small">Click any day to jump to it</p>
      </div>
      <div className="timeline" style={{ gridTemplateColumns: `72px repeat(${lastDay}, minmax(0, 1fr))` }}>
        {ids.map((id) => (
          <Fragment key={id}>
            <span className="timeline-name">{crewInfo(id).callsign}</span>
            {days.map((d) => {
              const record = (history[d] ?? []).find((a) => a.astronaut_id === id)
              const s = statusOf(record?.status)
              return (
                <button
                  key={d}
                  type="button"
                  className={`cell ${d === day ? 'is-today' : ''}`}
                  style={{ background: s.color, opacity: record?.status === 'green' ? 0.35 : 1 }}
                  title={`${crewInfo(id).callsign}, day ${d}: ${s.word}`}
                  aria-label={`${crewInfo(id).callsign}, day ${d}: ${s.word}`}
                  onClick={() => setDay(d)}
                />
              )
            })}
          </Fragment>
        ))}
        <span />
        {days.map((d) => (
          <span key={d} className="tick">
            {d === 1 || d % 10 === 0 ? d : ''}
          </span>
        ))}
      </div>
    </section>
  )
}
