/*
 * crew.js: names for the crew (plain JavaScript, no React).
 * The data only says A, B, C, D. This file turns those into the call signs and roles
 * shown on screen. Change a name here and it changes everywhere.
 */
// Invented call signs and roles for the simulated crew. These are NOT real astronauts.
export const CREW = {
  A: { callsign: 'Vega', role: 'Commander', initials: 'VG' },
  B: { callsign: 'Lyra', role: 'Flight Engineer', initials: 'LY' },
  C: { callsign: 'Altair', role: 'Medical Officer', initials: 'AL' },
  D: { callsign: 'Rigel', role: 'Mission Specialist', initials: 'RG' },
}

// Safe lookup: an unknown id still gets a sensible label
export function crewInfo(id) {
  return CREW[id] ?? { callsign: `Astronaut ${id}`, role: 'Crew member', initials: id }
}
