// Counts how many distinct check-in sections have been completed today.
// Creature mood is based on THIS NUMBER — not reported health values.
// A bad day with full check-ins = happy creature. This is non-negotiable.
export function countCheckIns(daily) {
  if (!daily) return 0
  let n = 0
  if (daily.circles) n++
  if (daily.sleep?.quality) n++
  if (daily.meds?.morning !== undefined && daily.meds?.morning !== null) n++
  if (daily.energy !== undefined && daily.energy !== null) n++
  if (daily.water?.count > 0) n++
  if (daily.dbt?.practiced) n++
  if (daily.sensory?.level !== undefined && daily.sensory?.level !== null) n++
  if (daily.puppies?.apollo?.skills && Object.keys(daily.puppies.apollo.skills).length > 0) n++
  return n
}

// Returns 'sleeping' | 'bounce' | 'wiggle' | 'glow'
export function getMoodState(checkInCount) {
  if (checkInCount === 0) return 'sleeping'
  if (checkInCount === 1) return 'bounce'
  if (checkInCount <= 3) return 'wiggle'
  return 'glow'
}

export const MOOD_MESSAGES = {
  sleeping: "I'm waiting for you! ☁️",
  bounce: "You showed up! Happy to see you! 🌟",
  wiggle: "We're doing great together! 💚",
  glow: "We're GLOWING today!! ✨✨✨",
}
