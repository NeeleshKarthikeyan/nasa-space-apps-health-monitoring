import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { getTimeseries } from '../api'

export default function AstronautDetail({ day }) {
  const { id } = useParams() // "B" when the address is #/astronaut/B
  const [ts, setTs] = useState(null)

  useEffect(() => {
    getTimeseries(id).then(({ data }) => setTs(data))
  }, [id])

  if (!ts) return <p className="loading">Loading…</p>

  const sleep = ts.signals.sleep_h.points.filter((p) => p.day <= day)

  return (
    <section>
      <Link to="/">← Back to crew</Link>
      <h2 className="section-title">Astronaut {id}</h2>
      <div className="chart-card">
        <h3>Sleep (hours)</h3>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={sleep}>
            <XAxis dataKey="day" />
            <YAxis domain={['auto', 'auto']} />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#7dd3fc" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}