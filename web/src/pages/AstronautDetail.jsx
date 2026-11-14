import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getTimeseries } from '../api'
import BaselineChart from '../components/BaselineChart'
import AlertPanel from '../components/AlertPanel'   

// Friendly chart titles for each signal name in the data
const LABELS = {
  sleep_h: 'Sleep',
  resting_hr_bpm: 'Resting heart rate',
  hrv_ms: 'Heart rate variability',
  spo2_pct: 'Blood oxygen',
  systolic_bp_mmhg: 'Blood pressure (systolic)',
  body_mass_kg: 'Body mass',
  exercise_min: 'Exercise',
  reaction_time_ms: 'Reaction time',
  mood_1to5: 'Mood',
  radiation_mgy: 'Radiation dose',
}

export default function AstronautDetail({ day, delay }) {
  const { id } = useParams() // "B" when the address is #/astronaut/B
  const [ts, setTs] = useState(null)

  useEffect(() => {
    getTimeseries(id).then(({ data }) => setTs(data))
  }, [id])

  if (!ts) return <p className="loading">Loading…</p>

  return (
    <section>
      <Link to="/">← Back to crew</Link>
      <h2 className="section-title">Astronaut {id}</h2>

      <AlertPanel id={id} day={day} delay={delay} />

      <div className="chart-grid">
        {Object.entries(ts.signals).map(([key, signal]) => (
          <BaselineChart
            key={key}
            name={LABELS[key] ?? key}
            unit={signal.unit}
            points={signal.points}
            day={day}
          />
        ))}
      </div>
    </section>
  )
}