import { useEffect, useState } from 'react'
import { getCrew } from '../api'
import StatusCard from '../components/StatusCard'

export default function CrewOverview({ day }) {
  const [crew, setCrew] = useState(null)

  // Re-load the crew whenever the selected day changes
  useEffect(() => {
    getCrew(day).then(({ data }) => setCrew(data))
  }, [day])

  if (!crew) return <p className="loading">Loading crew…</p>
  if (crew.length === 0) return <p className="loading">No crew data for day {day}.</p>

  return (
    <section>
      <h2 className="section-title">Crew status</h2>
      <div className="card-grid">
        {crew.map((a) => (
          <StatusCard key={a.astronaut_id} astronaut={a} />
        ))}
      </div>
    </section>
  )
}