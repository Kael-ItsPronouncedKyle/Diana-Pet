import { countCheckIns } from './checkIns.js'
import { getTimeOfDay } from './dates.js'

/**
 * feedbackEngine.js — Rule-based feedback generation for creature speech bubble
 *
 * This is "Kael's voice" — warm, clinical when needed, affirming always.
 * The creature speaks based on Diana's data, prioritized by clinical urgency.
 *
 * Returns: { message: string, priority: number, type: string }
 * Priority 1-9: CRISIS > CLINICAL > PATTERN > COACHING > SKILL_NUDGE > AFFIRMATION > DAILY > TEACHING > PERSONALITY
 */

// Helper: Check if current hour is in nighttime window (9pm-4am)
function isNighttime(hour = new Date().getHours()) {
  return hour >= 21 || hour < 4
}

// Helper: Check if Luis is working (Thu-Sun, or custom from profile)
function isLuisWorking(profile) {
  if (!profile?.luisShift) return false // Default: not working

  const today = new Date()
  const dayOfWeek = today.getDay() // 0=Sun, 1=Mon, ..., 6=Sat

  // Use profile's custom work days, or default: Thu(4), Fri(5), Sat(6), Sun(0)
  const workDays = profile.luisShift?.workDays || [0, 4, 5, 6]
  return workDays.includes(dayOfWeek)
}

/**
 * Main feedback engine function
 * @param {Object} daily - Today's check-in data
 * @param {Object} weekData - Week summary (check-in counts, patterns, etc.)
 * @param {Object} profile - Profile data (safety plan, coping plan, etc.)
 * @param {string} timeOfDay - 'morning', 'midday', 'evening', 'night' (optional, derived if not provided)
 * @returns {Object} { message: string, priority: number, type: string }
 */
export function getFeedbackMessage(daily = {}, weekData = {}, profile = {}, timeOfDay = null) {
  const currentHour = new Date().getHours()
  const time = timeOfDay || getTimeOfDay(currentHour)
  const isNight = isNighttime(currentHour)
  const luisWorking = isLuisWorking(profile)

  // --- PRIORITY 2: CLINICAL ---

  // Nighttime risk: high energy + alone + no Luis
  if (isNight && luisWorking && (daily.energy >= 4 || (daily.urges && daily.urges.length > 0) || daily.dissociation >= 3)) {
    return {
      message: "It's late. You're alone. Your energy is high. This is the setup where things tend to happen. Your safety plan is one tap away.",
      priority: 2,
      type: 'clinical',
    }
  }

  // Nighttime companion (non-clinical — Luis is home, lower priority so earned
  // affirmations and coaching still show through)
  if (isNight && !luisWorking && countCheckIns(daily) === 0) {
    return {
      message: "It's late. I'm staying up with you. 💚",
      priority: 6,
      type: 'companion',
    }
  }

  // Meds skipped 2+ consecutive days
  if (weekData.medsSkippedConsecutive && weekData.medsSkippedConsecutive >= 2) {
    const count = weekData.medsSkippedConsecutive
    return {
      message: `That's ${count} days without meds. Your brain chemistry is shifting. Please take them tonight. 💊`,
      priority: 2,
      type: 'clinical',
    }
  }

  // Short sleep but high energy (mania flag)
  if (daily.sleep?.hours && daily.sleep.hours < 5 && daily.sleep?.quality && daily.sleep.quality >= 4) {
    return {
      message: "Short sleep but you feel great? Watch that. Sometimes that's mania knocking.",
      priority: 2,
      type: 'clinical',
    }
  }

  // Short sleep (general)
  if (daily.sleep?.hours && daily.sleep.hours < 5) {
    return {
      message: "Short night. Your brain needs sleep to stay steady. Be gentle today.",
      priority: 2,
      type: 'clinical',
    }
  }

  // --- PRIORITY 3: PATTERN ---

  // Secrecy escalation (3+ days)
  if (weekData.secrecyNo && weekData.secrecyNo >= 3) {
    return {
      message: "Secrets are where addiction lives. Your safety plan has people who can help. You don't have to do this alone.",
      priority: 3,
      type: 'pattern',
    }
  }

  // Secrecy escalation (2+ days)
  if (weekData.secrecyNo && weekData.secrecyNo >= 2) {
    return {
      message: "Two secret days this week. That pattern matters.",
      priority: 3,
      type: 'pattern',
    }
  }

  // Engagement drop (2+ days with 0 check-ins in last 4 days)
  if (weekData.engagementDrop && weekData.engagementDrop >= 2) {
    return {
      message: "You went quiet for a couple days. The days you don't check in are usually the days it would help the most.",
      priority: 3,
      type: 'pattern',
    }
  }

  // --- PRIORITY 4: COACHING ---

  // Shame + emotional safety
  if (daily.emotions && Array.isArray(daily.emotions)) {
    const shameWords = ['shame', 'worthless', 'disgusting', 'evil', 'broken', 'ruined']
    const hasShame = daily.emotions.some(em => shameWords.some(sw => em.toLowerCase().includes(sw)))

    if (hasShame) {
      return {
        message: "You named shame. That takes guts. Shame says 'I am bad.' Guilt says 'I did something bad.' Which one is true right now?",
        priority: 4,
        type: 'coaching',
      }
    }
  }

  // Numb + angry (dissociation + anger combo)
  if (daily.emotions && Array.isArray(daily.emotions)) {
    const hasNumb = daily.emotions.some(em => em.toLowerCase().includes('numb'))
    const hasAngry = daily.emotions.some(em => em.toLowerCase().includes('angry'))

    if (hasNumb && hasAngry) {
      return {
        message: "Those two together usually mean something hurt that you're not ready to feel yet.",
        priority: 4,
        type: 'coaching',
      }
    }
  }

  // Inner circle day (hard day, true report)
  if (daily.circles?.choice === 'inner') {
    return {
      message: "Hard day. You're still here. You told the truth. That's not nothing.",
      priority: 4,
      type: 'coaching',
    }
  }

  // Middle circle day (caught warning sign)
  if (daily.circles?.choice === 'middle') {
    return {
      message: "You caught the warning sign. That IS the skill.",
      priority: 4,
      type: 'coaching',
    }
  }

  // --- PRIORITY 5: SKILL NUDGE ---

  // Window of tolerance: hyperaroused
  if (daily.window !== undefined && daily.window !== null && daily.window >= 6) {
    return {
      message: "Your body is revved up. Ice dive, cold water, or paced breathing. Pick one.",
      priority: 5,
      type: 'skill_nudge',
    }
  }

  // Window of tolerance: hypoaroused
  if (daily.window !== undefined && daily.window !== null && daily.window <= 2) {
    return {
      message: "You're shut down. Try moving — even just standing up. Wake your senses up.",
      priority: 5,
      type: 'skill_nudge',
    }
  }

  // Dissociation: 5-4-3-2-1 grounding
  if (daily.dissociation && daily.dissociation >= 3) {
    return {
      message: "You're disconnected. Try 5-4-3-2-1: 5 things you see, 4 you hear, 3 you touch, 2 you smell, 1 you taste.",
      priority: 5,
      type: 'skill_nudge',
    }
  }

  // --- PRIORITY 7: DAILY AFFIRMATION (based on check-in completion) ---

  const checkInCount = countCheckIns(daily)

  if (checkInCount >= 13) {
    return {
      message: "You did every single check-in. That's not luck — that's you showing up.",
      priority: 7,
      type: 'daily',
    }
  }

  if (checkInCount >= 5) {
    return {
      message: "Look at you. Showing up completely. ✨",
      priority: 7,
      type: 'daily',
    }
  }

  if (checkInCount >= 3) {
    return {
      message: "You're really checking in today. 💚",
      priority: 7,
      type: 'daily',
    }
  }

  if (checkInCount >= 1) {
    return {
      message: "You showed up. That's what matters.",
      priority: 7,
      type: 'daily',
    }
  }

  // 0 check-ins: time-of-day greeting
  if (checkInCount === 0) {
    const greetings = {
      morning: "Good morning. I'm here when you're ready. ☀️",
      midday: "Afternoon check-in time. How's it going? 💚",
      evening: "Winding down. Let's see how today went. 🌙",
    }
    return {
      message: greetings[time] || "I'm here. 💚",
      priority: 7,
      type: 'daily',
    }
  }

  // --- PRIORITY 8: TEACHING (word of day flag) ---
  // We don't have word data here, so return a flag for the component to handle
  if (Math.random() < 0.3) {
    return {
      priority: 8,
      type: 'teaching',
      showWordOfDay: true,
    }
  }

  // --- PRIORITY 9: PERSONALITY (fallback) ---

  const idleMessages = [
    "I missed you!",
    "I'm glad you're here. 💚",
    "You're doing better than you think.",
    "Every check-in counts.",
    "Hard days count too.",
    "I see you.",
  ]

  const randomMessage = idleMessages[Math.floor(Math.random() * idleMessages.length)]

  return {
    message: randomMessage,
    priority: 9,
    type: 'personality',
  }
}

// Export helpers for testing/reuse
export { isNighttime, isLuisWorking }
