// Every request in the app goes through this file.
// While the API isn't ready, the imports below point at ./mock/.
// When Fahim's export exists, change './mock/' to './fallback/' in these 7 lines. Nothing else changes.
import mission from './mock/mission.json'
import crewByDay from './mock/crew_by_day.json'
import alerts from './mock/alerts.json'
import tsA from './mock/timeseries_A.json'
import tsB from './mock/timeseries_B.json'
import tsC from './mock/timeseries_C.json'
import tsD from './mock/timeseries_D.json'

const TIMESERIES = { A: tsA, B: tsB, C: tsC, D: tsD }
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

// Try the live API for 5 seconds; if it fails, use the saved copy.
// Returns { data, live } so the UI can show whether the data is live or saved.
async function fetchWithFallback(path, fallback) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 5000)
  try {
    const res = await fetch(API_URL + path, { signal: controller.signal })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return { data: await res.json(), live: true }
  } catch {
    return { data: fallback, live: false }
  } finally {
    clearTimeout(timer)
  }
}

export const getMission = () => fetchWithFallback('/api/mission', mission)

export const getCrew = (day) =>
  fetchWithFallback(`/api/crew?day=${day}`, crewByDay[String(day)] ?? [])

export const getTimeseries = (id) =>
  fetchWithFallback(`/api/crew/${id}/timeseries`, TIMESERIES[id])

export const getAlerts = (id, day) =>
  fetchWithFallback(
    `/api/alerts?astronaut_id=${id}&day=${day}`,
    alerts
      .filter((a) => a.astronaut_id === id && a.mission_day <= day)
      .sort((x, y) => y.mission_day - x.mission_day),
  )