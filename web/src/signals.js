import {
  Moon,
  Timer,
  Smile,
  HeartPulse,
  Activity,
  Gauge,
  Droplets,
  Scale,
  Dumbbell,
  Radiation,
} from 'lucide-react'

// Signals grouped by the NASA hazard they relate to (see explain/hazard_map.csv).
// Each group has its own colour, like the modules in the inspiration screenshots.
export const GROUPS = [
  {
    key: 'sleep',
    title: 'Sleep & behaviour',
    hazard: 'Isolation and confinement',
    color: '#a78bfa',
    signals: ['sleep_h', 'reaction_time_ms', 'mood_1to5'],
  },
  {
    key: 'heart',
    title: 'Heart & oxygen',
    hazard: 'Altered gravity · Closed environment',
    color: '#f472b6',
    signals: ['resting_hr_bpm', 'hrv_ms', 'systolic_bp_mmhg', 'spo2_pct'],
  },
  {
    key: 'body',
    title: 'Body & fitness',
    hazard: 'Altered gravity',
    color: '#38bdf8',
    signals: ['body_mass_kg', 'exercise_min'],
  },
  {
    key: 'radiation',
    title: 'Radiation',
    hazard: 'Space radiation',
    color: '#facc15',
    signals: ['radiation_mgy'],
  },
]

// Friendly name, icon, decimal places and unit for each signal in the data
export const SIGNALS = {
  sleep_h: { label: 'Sleep', icon: Moon, digits: 1, unit: 'hours' },
  reaction_time_ms: { label: 'Reaction time', icon: Timer, digits: 0, unit: 'ms' },
  // Mood is a whole number from 1 to 5 and is never missing: show it as "3 / 5" on a fixed 1-5 scale
  mood_1to5: { label: 'Mood', icon: Smile, digits: 0, unit: '1 to 5', unitLabel: '/ 5', range: [1, 5] },
  resting_hr_bpm: { label: 'Resting heart rate', icon: HeartPulse, digits: 0, unit: 'beats/min' },
  hrv_ms: { label: 'Heart rate variability', icon: Activity, digits: 0, unit: 'ms' },
  systolic_bp_mmhg: { label: 'Blood pressure', icon: Gauge, digits: 0, unit: 'mmHg' },
  spo2_pct: { label: 'Blood oxygen', icon: Droplets, digits: 1, unit: '%' },
  body_mass_kg: { label: 'Body mass', icon: Scale, digits: 1, unit: 'kg' },
  exercise_min: { label: 'Exercise', icon: Dumbbell, digits: 0, unit: 'min' },
  radiation_mgy: { label: 'Radiation dose', icon: Radiation, digits: 2, unit: 'mGy/day' },
}

export function signalInfo(key) {
  return SIGNALS[key] ?? { label: key, icon: Activity, digits: 1 }
}

export function groupOf(key) {
  return GROUPS.find((g) => g.signals.includes(key)) ?? GROUPS[0]
}

// Today's reading for one signal: the latest point up to the selected day,
// how far it is from the middle of the normal range, and whether it's outside the range.
export function todayStats(points, day) {
  const today = points.filter((p) => p.day <= day).at(-1)
  if (!today) return { today: null, diff: null, outside: false }
  const normal = (today.baseline_low + today.baseline_high) / 2
  const outside =
    today.value != null && (today.value < today.baseline_low || today.value > today.baseline_high)
  return { today, diff: today.value == null ? null : today.value - normal, outside }
}

// The signal that strays furthest outside this astronaut's normal range over the WHOLE mission.
// Used as the default big chart, so it stays the same while the mission replays.
// Radiation is skipped unless nothing else ever leaves the range, because a solar storm hits everyone.
export function signatureSignal(signals) {
  const excess = (key) =>
    Math.max(
      0,
      ...signals[key].points
        .filter((p) => p.value != null)
        .map((p) => {
          const width = p.baseline_high - p.baseline_low || 1
          return Math.max(p.value - p.baseline_high, p.baseline_low - p.value) / width
        }),
    )
  const keys = GROUPS.flatMap((g) => g.signals).filter((key) => signals[key])
  const body = keys.filter((key) => key !== 'radiation_mgy')
  const best = [...body].sort((a, b) => excess(b) - excess(a))[0]
  return best && excess(best) > 0 ? best : keys[0]
}

// A fixed y-axis range covering the whole mission (readings and normal range),
// so charts don't rescale every day while the mission replays.
export function fixedRange(points, signalKey) {
  const fixed = SIGNALS[signalKey]?.range
  if (fixed) return [fixed[0] - 0.25, fixed[1] + 0.25]
  const all = points.flatMap((p) => [p.value, p.baseline_low, p.baseline_high]).filter((v) => v != null)
  const lo = Math.min(...all)
  const hi = Math.max(...all)
  const pad = (hi - lo) * 0.08 || 1
  return [lo - pad, hi + pad]
}
