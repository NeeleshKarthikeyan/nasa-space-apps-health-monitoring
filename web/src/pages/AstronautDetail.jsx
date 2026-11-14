import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { getTimeseries } from '../api'
import { crewInfo } from '../crew'
import { statusOf } from '../status'
import { GROUPS, groupOf, signatureSignal } from '../signals'
import StatusPill from '../components/StatusPill'
import RingGauge from '../components/RingGauge'
import AlertPanel from '../components/AlertPanel'
import BaselineChart from '../components/BaselineChart'
import SignalWidget from '../components/SignalWidget'

export default function AstronautDetail({ day, delay, crew }) {
  const { id } = useParams() // "B" when the address is #/astronaut/B
  const [ts, setTs] = useState(null)
  const [picked, setPicked] = useState(null) // the widget someone clicked: { id, key }

  useEffect(() => {
    getTimeseries(id).then(({ data }) => setTs(data))
  }, [id])

  if (!ts || ts.astronaut_id !== id) return <p className="loading">Loading…</p>

  const info = crewInfo(id)
  const today = crew.find((a) => a.astronaut_id === id)
  const s = statusOf(today?.status)
  const keys = GROUPS.flatMap((g) => g.signals).filter((key) => ts.signals[key])

  // The big chart: whatever was clicked, otherwise this astronaut's "signature" signal.
  // It does NOT depend on the day, so it stays still while the mission replays.
  const focusKey = picked?.id === id ? picked.key : signatureSignal(ts.signals)

  return (
    <div className="page">
      <Link to="/" className="back-link">
        <ChevronLeft size={16} /> Crew overview
      </Link>

      <div className="profile">
        <div className="profile-name">
          <p className="eyebrow">Astronaut {id}</p>
          <h2>
            {info.callsign} <em>{info.role}</em>
          </h2>
        </div>
        {today && <StatusPill status={today.status} />}
        {today && <RingGauge value={today.anomaly_score} color={s.color} label="Anomaly score" size={64} />}
      </div>

      {/* Two columns: charts on the left, the alert on the right.
          The alert can grow or shrink without moving the charts. */}
      <div className="detail-grid">
        <div className="detail-main">
          <BaselineChart
            signalKey={focusKey}
            unit={ts.signals[focusKey].unit}
            points={ts.signals[focusKey].points}
            day={day}
            color={groupOf(focusKey).color}
            big
          />
          <p className="eyebrow widgets-label">All vital signs · click one to show it above</p>
          <div className="widget-grid">
            {keys.map((key) => (
              <SignalWidget
                key={key}
                signalKey={key}
                unit={ts.signals[key].unit}
                points={ts.signals[key].points}
                day={day}
                color={groupOf(key).color}
                selected={key === focusKey}
                onSelect={() => setPicked({ id, key })}
              />
            ))}
          </div>
        </div>
        <aside className="detail-side">
          <AlertPanel id={id} day={day} delay={delay} />
        </aside>
      </div>
    </div>
  )
}
