import storage from './storage.js'

// Counts how many distinct check-in sections have been completed today.
// Creature mood is based on THIS NUMBER — not reported health values.
// A bad day with full check-ins = happy creature. This is non-negotiable.
export function countCheckIns(daily) {
  if (!daily) return 0
  let n = 0
  if (daily.circles) n++
  if (daily.emotions && daily.emotions.length > 0) n++
  if (daily.sleep?.quality) n++
  if (daily.meds?.morning !== undefined && daily.meds?.morning !== null) n++
  if (daily.energy !== undefined && daily.energy !== null) n++
  if (daily.water?.count > 0) n++
  if (daily.dbt?.practiced) n++
  if (daily.sensory?.level !== undefined && daily.sensory?.level !== null) n++
  if (daily.puppies?.apollo?.skills && Object.keys(daily.puppies.apollo.skills).length > 0) n++
  if (daily.window !== undefined && daily.window !== null) n++
  if (daily.dissociation !== undefined && daily.dissociation !== null) n++
  if (daily.bodySelf) n++
  return n
}

export const TOTAL_CHECKINS = 13

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

// Milestone system — returns milestone info if count just crossed a threshold
export const MILESTONES = [
  { threshold: 3, message: "We're getting started! 🌱", reaction: 'bounce' },
  { threshold: 7, message: "More than halfway! 💪", reaction: 'wiggle' },
  { threshold: 10, message: "Almost there! ✨", reaction: 'celebrate' },
  { threshold: 13, message: "FULL DAY! You showed up completely! 🌟🎉", reaction: 'celebrate' },
]

export function checkMilestone(prevCount, newCount) {
  for (const m of MILESTONES) {
    if (prevCount < m.threshold && newCount >= m.threshold) return m
  }
  return null
}

// Creature reaction based on what was just checked in
export const CREATURE_REACTIONS = {
  sleep: { animation: 'creature-yawn', duration: 1000, emoji: '😴' },
  water: { animation: 'creature-drink', duration: 800, emoji: '💧' },
  dbt: { animation: 'creature-meditate', duration: 1200, emoji: '🧘' },
  puppies: { animation: 'creature-wag', duration: 1000, emoji: '🐾' },
  meds: { animation: 'creature-celebrate', duration: 800, emoji: '💊' },
  energy: { animation: 'creature-meditate', duration: 800, emoji: '⚡' },
  circles: { animation: 'creature-celebrate', duration: 1000, emoji: '⭕' },
  feelings: { animation: 'creature-meditate', duration: 800, emoji: '🎭' },
}

// Compute consecutive days of meds taken (streak)
// todayData is passed directly to avoid an extra storage read
export async function computeMedStreak(todayData) {
  let streak = 0

  // Check today first
  if (todayData?.meds?.morning === true || todayData?.meds?.evening === true) {
    streak = 1
  } else {
    return 0
  }

  // Walk backward from yesterday
  const now = new Date()
  for (let i = 1; i <= 365; i++) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().slice(0, 10)
    const key = `diana-daily:${dateStr}`
    try {
      const data = await storage.get(key)
      if (data?.meds?.morning === true || data?.meds?.evening === true) {
        streak++
      } else {
        break
      }
    } catch {
      break
    }
  }

  return streak
}
