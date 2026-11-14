// One-way radio delay from the spacecraft to Earth, for each destination.
// Mars uses the API's value, because the real delay changes as the planets move.
export function delayFor(destination, mission) {
  if (destination === 'iss') return { text: 'near real-time', minutes: 0 }
  if (destination === 'moon') return { text: 'about 1.3 seconds', minutes: 0 }
  return {
    text: `about ${mission.one_way_delay_min} minutes`,
    minutes: mission.one_way_delay_min,
  }
}