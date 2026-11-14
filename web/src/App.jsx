import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { getMission } from './api'
import { delayFor } from './destinations'
import CrewOverview from './pages/CrewOverview'
import AstronautDetail from './pages/AstronautDetail'
import MissionBar from './components/MissionBar'
import Footer from './components/Footer'
import './App.css'

export default function App() {
  const [mission, setMission] = useState(null)
  const [day, setDay] = useState(null)
  const [live, setLive] = useState(true)
  const [destination, setDestination] = useState('mars')

  // Load the mission once when the app starts, and start on its latest day
  useEffect(() => {
    getMission().then(({ data, live }) => {
      setMission(data)
      setDay(data.day)
      setLive(live)
      setDestination(data.mission)
    })
  }, [])

  if (!mission) return <p className="loading">Loading mission…</p>

  const delay = delayFor(destination, mission)

  return (
    <div className="app">
      <header className="app-header">
        <h1>Crew Health Monitor</h1>
        <MissionBar
          mission={mission}
          day={day}
          setDay={setDay}
          destination={destination}
          setDestination={setDestination}
        />
      </header>
      <main>
        <Routes>
          <Route path="/" element={<CrewOverview day={day} />} />
          <Route path="/astronaut/:id" element={<AstronautDetail day={day} delay={delay} />} />
        </Routes>
      </main>
      <Footer live={live} />
    </div>
  )
}