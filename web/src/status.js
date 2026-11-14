import { CircleCheck, TriangleAlert, OctagonAlert, CircleDashed } from 'lucide-react'

// One place that decides how each status looks: word, icon and colour.
// Status colours (green, amber, red) are used ONLY for status, never for signal groups.
export const STATUS = {
  green: { word: 'Nominal', icon: CircleCheck, color: '#22c55e' },
  amber: { word: 'Watch', icon: TriangleAlert, color: '#f59e0b' },
  red: { word: 'Act', icon: OctagonAlert, color: '#ef4444' },
  none: { word: 'No data', icon: CircleDashed, color: '#4b5563' },
}

export function statusOf(status) {
  return STATUS[status] ?? STATUS.none
}
