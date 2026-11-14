import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { getMission } from './api'
import CrewOverview from './pages/CrewOverview'
import AstronautDetail from './pages/AstronautDetail'
import './App.css'

export default function App() {
  const [mission, setMission] = useState(null)
  const [day, setDay] = useState(null)

  // Load the mission once when the app starts, and start on its latest day
  useEffect(() => {
    getMission().then(({ data }) => {
      setMission(data)
      setDay(data.day)
    })
  }, [])

  if (!mission) return <p className="loading">Loading mission…</p>

  return (
    <div className="app">
      <header className="app-header">
        <h1>Crew Health Monitor</h1>
        <p>
          {mission.mission.toUpperCase()} mission · Day {day}
        </p>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<CrewOverview day={day} />} />
          <Route path="/astronaut/:id" element={<AstronautDetail day={day} mission={mission} />} />
        </Routes>
      </main>
    </div>
  )
}