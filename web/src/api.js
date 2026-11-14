// Every request in the app goes through this file.
//
// 1. It tries Fahim's live API for 5 seconds, and falls back to the saved copies in ./fallback/.
// 2. It TRANSLATES the API's answers into the shapes the dashboard uses ("normalise" functions).
//    It accepts both Fahim's current shapes and the shapes in docs/data-contract.md,
//    so the dashboard keeps working if the API changes to match the contract later.
//
// New to this? Some JavaScript you'll see below:
//   async / await   an `async` function can pause with `await` until something slow (the network) finishes
//   fetch(url)      asks a server for data; res.json() turns the reply into a JavaScript object
//   Promise.all     starts several requests at the same time and waits until all have finished
//   a ?? b          use a, but if a is null or undefined use b instead
//   a?.b            read b from a, but don't crash if a is missing (gives undefined)
//   { ...a, x }     a copy of object a with x added or replaced
// Nothing in this file draws anything: the pages call the get...() functions at the bottom.
import missionFile from './fallback/mission.json'
import crewFile from './fallback/crew.json'
import alertsFile from './fallback/alerts.json'
import tsA from './fallback/timeseries_A.json'
import tsB from './fallback/timeseries_B.json'
import tsC from './fallback/timeseries_C.json'
import tsD from './fallback/timeseries_D.json'
import { crewInfo } from './crew'
import { SIGNALS, signalInfo } from './signals'

const TIMESERIES_FILES = { A: tsA, B: tsB, C: tsC, D: tsD }
// The API address comes from web/.env.local (VITE_API_URL=...). Without it, it uses your own laptop.
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

// ---------- Translators ----------

// Mission: Fahim sends { mission: "Mars transit", current_day: 47, ... }
export function normaliseMission(m) {
  const label = String(m?.mission ?? 'Mars transit')
  const lower = label.toLowerCase()
  const destination = lower.includes('moon') ? 'moon' : lower.includes('iss') ? 'iss' : 'mars'
  return {
    mission: destination, // used by the destination selector
    label, // shown in the header, exactly as the API says it
    day: m?.day ?? m?.current_day,
    one_way_delay_min: m?.one_way_delay_min ?? 12,
  }
}

// Alerts: the contract's "earth_message" may be missing, so draft one if the alert escalates
export function normaliseAlert(a) {
  const earth_message =
    a.earth_message ??
    (a.escalate_to_earth
      ? `${crewInfo(a.astronaut_id).callsign}, day ${a.mission_day}: ${a.status} alert. ${a.explanation} Requesting flight surgeon review.`
      : undefined)
  return { ...a, earth_message }
}

// One line explaining a crew member's status on a day
function reasonFor(r, alerts) {
  if (r.top_reason) return r.top_reason
  if (r.status === 'green') return 'All signals within your normal range'
  if (!r.status || r.status === 'none') return 'No data for this day'
  const alert = alerts.find((a) => a.astronaut_id === r.astronaut_id && a.mission_day === r.mission_day)
  if (alert) return alert.title
  const top = (r.top_signals ?? []).find((s) => s.signal !== 'radiation_mgy') ?? r.top_signals?.[0]
  const word = r.status === 'red' ? 'Act' : 'Watch'
  return top ? `${word}: ${signalInfo(top.signal).label} outside your normal` : word
}

// Crew: Fahim sends Talal's model records (no name or top_reason), so fill those in
export function normaliseCrew(list, alerts = []) {
  return (list ?? []).map((r) => ({
    astronaut_id: r.astronaut_id,
    name: r.name ?? crewInfo(r.astronaut_id).callsign,
    status: r.status ?? 'none',
    anomaly_score: r.anomaly_score ?? null,
    top_reason: reasonFor(r, alerts),
    mission_day: r.mission_day,
  }))
}

// Timeseries: Fahim sends { days: [one row per day], baseline: { signal: {mean, low, high} } }.
// The dashboard wants { signals: { signal: { unit, points: [{ day, value, baseline_low, baseline_high, flagged }] } } }.
// Only the 10 known signals are kept, so extra columns (and the "scenario" answer key) are never shown.
export function normaliseTimeseries(t) {
  if (!t) return t
  if (t.signals) return t // already in the contract's shape
  const rows = t.days ?? []
  const signals = {}
  for (const key of Object.keys(SIGNALS)) {
    const band = t.baseline?.[key]
    if (!band) continue
    signals[key] = {
      unit: signalInfo(key).unit,
      points: rows.map((row) => {
        const value = row[key] ?? null // a missing reading stays null, never 0
        const outside = value != null && (value < band.low || value > band.high)
        return {
          day: row.mission_day,
          value,
          baseline_low: band.low,
          baseline_high: band.high,
          flagged: outside && row.status != null && row.status !== 'green',
        }
      }),
    }
  }
  const statusByDay = Object.fromEntries(rows.map((row) => [row.mission_day, row.status ?? null]))
  return { astronaut_id: t.astronaut_id, signals, statusByDay }
}

// ---------- What the pages call ----------

export async function getMission() {
  const r = await fetchWithFallback('/api/mission', missionFile)
  return { ...r, data: normaliseMission(r.data) }
}

export async function getTimeseries(id) {
  const r = await fetchWithFallback(`/api/crew/${id}/timeseries`, TIMESERIES_FILES[id])
  return { ...r, data: normaliseTimeseries(r.data) }
}

export async function getAlerts(id, day) {
  const r = await fetchWithFallback(`/api/alerts?astronaut_id=${id}`, alertsFile)
  const list = (r.data ?? [])
    .filter((a) => a.astronaut_id === id && a.mission_day <= day)
    .map(normaliseAlert)
    .sort((x, y) => y.mission_day - x.mission_day)
  return { ...r, data: list }
}

// Every day's crew status at once: { 1: [...], 2: [...], ... }.
// Used by the timeline and the sidebar.
export async function getCrewHistory(lastDay) {
  const [now, allAlerts] = await Promise.all([
    fetchWithFallback(`/api/crew?day=${lastDay}`, crewFile),
    fetchWithFallback('/api/alerts', alertsFile),
  ])
  const alerts = allAlerts.data ?? []
  const today = normaliseCrew(now.data, alerts)
  const days = Array.from({ length: lastDay }, (_, i) => i + 1)
  const history = {}

  // Does the API understand ?day= ? Ask for day 1 and check the answer really is day 1.
  const probe = await fetchWithFallback('/api/crew?day=1', null)
  const supportsDay =
    probe.live && Array.isArray(probe.data) && probe.data.length > 0 && probe.data.every((r) => r.mission_day === 1)

  if (supportsDay) {
    const results = await Promise.all(days.map((d) => fetchWithFallback(`/api/crew?day=${d}`, [])))
    days.forEach((d, i) => {
      history[d] = normaliseCrew(results[i].data, alerts)
    })
    return { data: history, live: results.every((r) => r.live) }
  }

  // Otherwise build each day from the timeseries, which has a status for every day.
  // Anomaly scores only exist for today, so earlier days show "--" in the ring.
  const ids = today.map((a) => a.astronaut_id)
  const series = await Promise.all(ids.map((id) => getTimeseries(id)))
  days.forEach((d) => {
    history[d] = ids.map((id, i) => {
      if (d === lastDay) return today[i]
      const status = series[i].data?.statusByDay?.[d] ?? 'none'
      return normaliseCrew([{ astronaut_id: id, mission_day: d, status }], alerts)[0]
    })
  })
  return { data: history, live: now.live && series.every((s) => s.live) }
}
