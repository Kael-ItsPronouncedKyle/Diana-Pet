/**
 * clinicalConfig.js
 *
 * Clinical logic layer for Diana's Companion App.
 * This file encodes her full clinical picture as constants and utility functions.
 * It is READ BY the app — never shown directly to Diana.
 *
 * Clinical basis: Addiction Interaction Disorder (Patrick Carnes), DBT, harm reduction,
 * bipolar 1 with psychotic features, AuDHD, trauma-informed care.
 */

// ─── Risk Tiers ──────────────────────────────────────────────────────────────

export const RISK_TIERS = {
  CRITICAL: 1,   // Needs immediate surfacing — red styling, auto-surface safety plan
  CONCERNING: 2, // Needs warm flag — yellow styling
  AFFIRMING: 3,  // Celebrate and reinforce — green styling
  INSIGHT: 4,    // Pattern data — blue styling
}

// ─── Addiction Channels ───────────────────────────────────────────────────────
// Diana does not have one addiction — she has an interconnected system.
// Blocking one channel causes energy to move to another (substitution effect).
// NEVER interpret one channel going quiet as progress without checking the others.

export const ADDICTION_CHANNELS = {
  sexual: {
    id: 'sexual',
    label: 'Sexual acting out',
    dailyKeys: ['circles.choice === inner', 'urges'],
    // inner circle + urges with sexual context
  },
  selfHarm: {
    id: 'selfHarm',
    label: 'Self-harm',
    dailyKeys: ['selfHarm.occurred'],
  },
  spending: {
    id: 'spending',
    label: 'Compulsive spending',
    dailyKeys: ['spending.unusual'],
    // Also: spending mentioned in chain analysis vulnerability factors
  },
  substances: {
    id: 'substances',
    label: 'Substance use',
    dailyKeys: ['substanceUse.alcohol', 'substanceUse.weed', 'substanceUse.smoking'],
    // CRITICAL: weed specifically worsens psychotic symptoms
  },
  digital: {
    id: 'digital',
    label: 'Digital acting out',
    // Late-night urges + phone = high-risk digital acting out
    dailyKeys: ['urges — nighttime context'],
  },
  chaos: {
    id: 'chaos',
    label: 'Chaos-seeking',
    // Multiple crises in a week, new intense relationships, multiple new projects started
    weeklyKeys: ['multipleNewRelationships', 'multipleNewProjects', 'repeatedCrises'],
  },
}

// ─── Nighttime Risk Window ────────────────────────────────────────────────────
// Nighttime + alone + phone + elevated mood/urge = highest-risk configuration
// Luis works Thu–Sun rotating shifts; when he's not home, risk is elevated.

export const RISK_WINDOWS = {
  nighttime: {
    startHour: 21,  // 9 PM
    endHour: 4,     // 4 AM (crosses midnight)
    label: 'Late night',
  },
}

// Returns true if the current hour is inside the nighttime risk window
export function isNighttimeRiskWindow() {
  const hour = new Date().getHours()
  return hour >= RISK_WINDOWS.nighttime.startHour || hour < RISK_WINDOWS.nighttime.endHour
}

// ─── Triple Risk ──────────────────────────────────────────────────────────────
// THE highest-severity safety concern.
// Missed meds + substance use + active psychotic symptoms = CRITICAL.

export const TRIPLE_RISK = {
  id: 'triple-risk',
  description: 'Missed meds + substance use + elevated psychotic indicators',
  // Each component:
  components: {
    missedMeds: 'meds.morning === false for 2+ days OR meds.evening === false for 2+ days',
    substanceUse: 'substanceUse.alcohol OR substanceUse.weed OR substanceUse.smoking',
    psychoticIndicators: 'weekly screening psychosis flags OR schizoaffective module elevated',
  },
}

// ─── Secrecy Escalation ────────────────────────────────────────────────────────

export const SECRECY_ESCALATION = {
  tier1: {
    count: 1,
    message: "One secret day this week. Secrets tend to grow. You don't have to tell everything — but telling something helps.",
    action: 'gentle-reminder',
  },
  tier2: {
    count: 2,
    message: "You've had 2 secret days this week. That pattern matters. Reaching out to someone — even just to say you're struggling — can make a big difference.",
    action: 'suggest-contact',
  },
  tier3: {
    count: 3,
    message: "Secrets are where addiction lives. Your safety plan has people who can help. You don't have to do this alone.",
    action: 'surface-safety-plan',
    autoSurfaceSafetyPlan: true,
  },
}

// ─── Core Schema Markers ──────────────────────────────────────────────────────
// Phrases that indicate the "I am evil" core belief is active.
// When these appear in chain analysis or journal entries, respond with
// SHAME RESILIENCE — not accountability.

export const CORE_SCHEMA_MARKERS = [
  "i'm evil",
  "i am evil",
  "i'm bad",
  "i am bad",
  "i'm a bad person",
  "i am a bad person",
  "something is wrong with me",
  "i deserve this",
  "i deserved it",
  "love should hurt",
  "i'm a burden",
  "i am a burden",
  "i'm worthless",
  "i am worthless",
  "i ruin everything",
  "i always mess up",
  "i'm broken",
  "i am broken",
  "i'm disgusting",
  "i am disgusting",
  "i hate myself",
  "everyone would be better without me",
]

// Check if a text string contains core schema markers
export function detectsCoreSchema(text) {
  if (!text) return false
  const lower = text.toLowerCase()
  return CORE_SCHEMA_MARKERS.some(marker => lower.includes(marker))
}

// The response when core schema is detected — shame resilience, not accountability
export const CORE_SCHEMA_RESPONSE = "That voice is lying to you. You are not evil. You are a person who is hurting. Those are not the same thing."

// ─── Mania Indicators ────────────────────────────────────────────────────────
// Computed from daily data. Short sleep + high quality is the #1 early warning.

export const MANIA_INDICATORS = {
  shortSleepHighQuality: { sleepHours: 5, sleepQuality: 4 }, // hours < 5 AND quality >= 4
  highEnergy: { energyLevel: 4 }, // energy >= 4
  increasedUrgeFrequency: { urgesPerDay: 3 }, // 3+ urges in one day
  spendingFlag: 'spending.unusual === true',
  racingThoughts: 'weekly screening — racing thoughts item',
}

// Compute a mania probability score (0–10) from daily data
// Score 6+ = gentle flag, 8+ = urgent flag
export function computeManiaScore(dailyData) {
  if (!dailyData) return 0
  let score = 0

  const sleep = dailyData.sleep
  if (sleep?.hours !== undefined && sleep?.quality !== undefined) {
    // Short sleep + rated good or amazing = strong mania signal
    if (sleep.hours < 5 && sleep.quality >= 4) score += 4
    else if (sleep.hours < 5 && sleep.quality >= 3) score += 2
    else if (sleep.hours < 6 && sleep.quality >= 4) score += 2
  }

  // High energy without long sleep
  const energy = dailyData.energy || 0
  if (energy >= 4 && (sleep?.hours || 8) < 6) score += 2
  if (energy >= 5 && (sleep?.hours || 8) < 7) score += 1

  // Elevated urge frequency
  const urgeCount = (dailyData.urges || []).length
  if (urgeCount >= 4) score += 2
  else if (urgeCount >= 2) score += 1

  // Spending flag
  if (dailyData.spending?.unusual) score += 2

  // Substance use (can mask mania OR be driven by it)
  if (dailyData.substanceUse?.alcohol || dailyData.substanceUse?.weed) score += 1

  return Math.min(score, 10)
}

// ─── Post-Discharge Risk Window ───────────────────────────────────────────────
// First 30 days after hospital discharge = highest-risk period.
// Diana has demonstrated this pattern. All thresholds lower during this window.

export const POST_DISCHARGE_RISK = {
  windowDays: 30,
  // During this window: all alert thresholds lower (more sensitive)
  // Show a subtle daily note
  getDailyNote: (daysOut) => {
    if (daysOut <= 0) return null
    if (daysOut === 1) return "You just got out of the hospital. Your brain needs time to settle. Be extra gentle with yourself today."
    if (daysOut <= 7) return `${daysOut} days since the hospital. Your brain is still adjusting. That takes time. 💙`
    if (daysOut <= 14) return `2 weeks since the hospital. You're doing the hard work. 💙`
    if (daysOut <= 30) return `${daysOut} days out of the hospital. Your brain is still adjusting. Be extra gentle with yourself. 💙`
    return null
  },
}

// Returns days since discharge, or null if no discharge date in profile
export function getDaysSinceDischarge(profile) {
  if (!profile?.lastDischargeDate) return null
  const discharge = new Date(profile.lastDischargeDate)
  const now = new Date()
  const diff = Math.floor((now - discharge) / (1000 * 60 * 60 * 24))
  return diff >= 0 ? diff : null
}

// Returns true if we are in the post-discharge risk window
export function isPostDischargeWindow(profile) {
  const days = getDaysSinceDischarge(profile)
  return days !== null && days <= POST_DISCHARGE_RISK.windowDays
}

// ─── Spiritual Risk Flags ─────────────────────────────────────────────────────
// Brujería + psychotic features + "I am evil" core belief = closed loop.
// This is the highest-priority spiritual risk in the app.
// Cannot be shown to Diana directly — used for alert sensitivity only.

export const SPIRITUAL_RISK_FLAGS = {
  description: 'Convergence of brujería practice, psychotic symptoms, and "I am evil" belief',
  // When all three are active simultaneously, decompensation risk is elevated.
  // Signals: dissociation 3-4, schizoaffective module elevated, engagement dropping
  decompensationSignals: {
    dissociationThreshold: 3,
    engagementDropDays: 2, // 2+ days with 0 check-ins
    psychoticIndicatorsElevated: true,
  },
  // User-facing message when decompensation is suspected:
  userMessage: "Your brain has been under a lot of stress this week. It might be time to check in with your doctor. 💙",
}

// ─── Stage Messaging ──────────────────────────────────────────────────────────
// Diana may be in pre-contemplation — she may not want recovery yet.
// Meet her where she is. Success = harm reduction + keeping the door open.

export const STAGE_MESSAGING = {
  preContemplation: {
    // Never: "You should get better." Always: "Here's what I noticed."
    frame: 'observation',
    language: [
      "Here's what I noticed this week.",
      "Something worth knowing.",
      "You don't have to do anything with this — but here it is.",
      "Just something I saw in your week.",
    ],
  },
  contemplation: {
    frame: 'ambivalence',
    language: [
      "Part of you wants to change. That part matters.",
      "You're thinking about it. That counts.",
    ],
  },
  action: {
    frame: 'reinforcement',
    language: [
      "You're doing the work. It's working.",
      "Look at this pattern. You made that happen.",
    ],
  },
}

// ─── Harm Reduction Messages ──────────────────────────────────────────────────
// For when abstinence framing would confirm "I am evil."
// Lead with these BEFORE the Three Circles reset language on inner circle + secrecy no days.

export const HARM_REDUCTION_MESSAGES = [
  "You're still here. You told the truth to this app. That matters. What happens next is up to you.",
  "Showing up on a hard day is brave. You did that.",
  "This is one day. It doesn't erase what came before it.",
  "You checked in. That took courage. The door is still open.",
  "Hard day. You're still here. That's what matters right now.",
]

// ─── Crisis Presentation Warning ─────────────────────────────────────────────
// FOR PROVIDER EXPORT ONLY. Never shown to Diana.

export const CRISIS_PRESENTATION_WARNING =
  "CLINICAL NOTE: Diana may appear calm, articulate, and fully functional during crisis. " +
  "Her autistic affect can look like stability to untrained observers. " +
  "Do not assess based on presentation alone. " +
  "She is intelligent and highly motivated to appear okay when cornered. " +
  "Please assess beyond presentation. Ask specific behavioral questions. " +
  "Current risk factors: medication adherence, substance use, nighttime alone, psychotic symptom frequency."

// ─── Channel Substitution Detector ───────────────────────────────────────────
// MOST IMPORTANT CLINICAL CONCEPT IN THIS APP.
// One channel going quiet while another spikes = NOT progress.

export function detectSubstitution(weekData) {
  const days = Object.values(weekData).filter(Boolean)
  if (days.length < 4) return null

  // Build per-channel activity over the week
  const firstHalf = days.slice(0, Math.floor(days.length / 2))
  const secondHalf = days.slice(Math.floor(days.length / 2))

  const channelActivity = (daysList) => ({
    sexual: daysList.filter(d => d.circles?.choice === 'inner' || (d.urges || []).length > 0).length,
    selfHarm: daysList.filter(d => d.selfHarm?.occurred).length,
    spending: daysList.filter(d => d.spending?.unusual).length,
    substances: daysList.filter(d =>
      d.substanceUse?.alcohol || d.substanceUse?.weed || d.substanceUse?.smoking
    ).length,
    dbtSkills: daysList.filter(d => d.dbt?.practiced).length,
    checkIns: daysList.filter(d => d.checkIns?.count > 0 || d.circles?.choice).length,
  })

  const early = channelActivity(firstHalf)
  const late = channelActivity(secondHalf)

  // Look for: one channel dropping while another rises
  const substitutions = []
  const channels = Object.keys(early)

  for (const dropping of channels) {
    for (const rising of channels) {
      if (dropping === rising) continue
      // Channel dropped by at least 1 AND another rose by at least 1
      if (late[dropping] < early[dropping] && late[rising] > early[rising]) {
        substitutions.push({ dropping, rising })
      }
    }
  }

  return substitutions.length > 0 ? substitutions : null
}

// ─── Triple Risk Detector ─────────────────────────────────────────────────────

export function detectTripleRisk(weekData) {
  const days = Object.entries(weekData).sort(([a], [b]) => a.localeCompare(b)).map(([, v]) => v).filter(Boolean)
  if (days.length < 2) return false

  // Check last 3 days for missed meds
  const recentDays = days.slice(-3)
  const missedMedsDays = recentDays.filter(d =>
    d.meds?.morning === false || d.meds?.evening === false
  ).length

  const substanceUse = recentDays.some(d =>
    d.substanceUse?.alcohol || d.substanceUse?.weed || d.substanceUse?.smoking
  )

  // Psychotic indicators: dissociation 3-4 as proxy, or explicit flag
  const psychoticIndicators = recentDays.some(d =>
    (d.dissociation >= 3) || d.psychoticFlag === true
  )

  return missedMedsDays >= 2 && substanceUse && psychoticIndicators
}

// ─── Nighttime Risk Assessment ─────────────────────────────────────────────────

export function assessNighttimeRisk(dailyData, profile) {
  if (!isNighttimeRiskWindow()) return null

  const luisWorking = isLuisWorking(profile)
  const elevatedMood = (dailyData?.energy || 0) >= 4
  const hasUrges = (dailyData?.urges || []).length > 0
  const highDissociation = (dailyData?.dissociation || 0) >= 3

  if (luisWorking && (elevatedMood || hasUrges || highDissociation)) {
    return {
      level: 'high',
      message: "It's late and you're alone. How are you doing right now? 💚",
      showSafetyPlan: true,
      showCopingPlan: true,
    }
  }

  if (luisWorking) {
    return {
      level: 'moderate',
      message: "It's late. You're here. That's good. 💚",
      showSafetyPlan: false,
      showCopingPlan: false,
    }
  }

  return null
}

// Determine if Luis is currently working (Thu–Sun rotating shifts)
// Profile may have luisSchedule: { worksThurSun: true } or similar
function isLuisWorking(profile) {
  if (!profile) return false
  const day = new Date().getDay() // 0=Sun, 1=Mon, ..., 4=Thu, 5=Fri, 6=Sat

  // Default: Thu(4), Fri(5), Sat(6), Sun(0) — rotating shifts
  if (profile.luisSchedule?.customDays) {
    return profile.luisSchedule.customDays.includes(day)
  }
  // Default Thu–Sun
  return [0, 4, 5, 6].includes(day)
}

// ─── Overall Risk Level ────────────────────────────────────────────────────────

export function computeRiskLevel(dailyData, weekData, profile) {
  const tripleRisk = detectTripleRisk(weekData || {})
  if (tripleRisk) return RISK_TIERS.CRITICAL

  const maniaScore = computeManiaScore(dailyData)
  if (maniaScore >= 8) return RISK_TIERS.CRITICAL

  if (maniaScore >= 6) return RISK_TIERS.CONCERNING

  const nighttime = assessNighttimeRisk(dailyData, profile)
  if (nighttime?.level === 'high') return RISK_TIERS.CONCERNING

  if (isPostDischargeWindow(profile)) return RISK_TIERS.CONCERNING

  return RISK_TIERS.AFFIRMING
}
