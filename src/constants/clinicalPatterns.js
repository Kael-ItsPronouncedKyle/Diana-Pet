/**
 * clinicalPatterns.js
 *
 * Pattern detection rules for WeekTab.jsx.
 * Each pattern has a detect() function, a message() function, and a tier.
 *
 * Tiers:
 *   1 = CRITICAL — red styling, surface immediately, may auto-surface safety plan
 *   2 = CONCERNING — yellow styling, warm flag
 *   3 = AFFIRMING — green styling, celebrate and reinforce
 *   4 = INSIGHT — blue styling, pattern data
 *
 * All user-facing message text is at 3rd grade reading level.
 * All messages read warmly when spoken aloud.
 * Hard days are NEVER punished.
 */

import { detectSubstitution, detectTripleRisk, computeManiaScore } from './clinicalConfig.js'

// ─── Tier 1 — Critical Patterns ───────────────────────────────────────────────

export const PATTERN_TRIPLE_RISK = {
  id: 'triple-risk',
  tier: 1,
  action: 'crisis',
  autoSurfaceSafetyPlan: true,
  detect: (weekData) => detectTripleRisk(weekData),
  message: () =>
    "Something important: your meds were missed, and there were some hard nights this week. " +
    "When those things happen together, your brain needs extra support. " +
    "Please reach out to someone on your safety plan today. 💙",
}

export const PATTERN_TRAUMA_REENACTMENT = {
  id: 'trauma-reenactment',
  tier: 1,
  action: 'crisis',
  autoSurfaceSafetyPlan: true,
  detect: (weekData) => {
    const days = Object.values(weekData).filter(Boolean)
    return days.some(d =>
      d.circles?.choice === 'inner' &&
      d.selfHarm?.occurred &&
      (d.dissociation || 0) >= 3
    )
  },
  message: () =>
    "There was a really hard day in your week — inner circle, self-harm, and feeling disconnected all at once. " +
    "That pattern matters. Your safety plan is right here. " +
    "You don't have to be alone with this. 💙",
}

export const PATTERN_SECRECY_HIGH = {
  id: 'secrecy-high',
  tier: 1,
  action: 'flag',
  autoSurfaceSafetyPlan: true,
  detect: (weekData) => {
    const days = Object.values(weekData).filter(Boolean)
    return days.filter(d => d.secrecyTest === false).length >= 3
  },
  message: (weekData) => {
    const days = Object.values(weekData).filter(Boolean)
    const count = days.filter(d => d.secrecyTest === false).length
    return `${count} secret days this week. Secrets are where addiction lives. ` +
      "Your safety plan has people who can help. " +
      "You don't have to do this alone."
  },
}

export const PATTERN_MANIA_URGENT = {
  id: 'mania-urgent',
  tier: 1,
  action: 'flag',
  autoSurfaceSafetyPlan: false,
  detect: (weekData) => {
    const days = Object.values(weekData).filter(Boolean)
    // Need 2+ days with mania score 8+ to flag as critical
    const highManiaDays = days.filter(d => computeManiaScore(d) >= 8)
    return highManiaDays.length >= 2
  },
  message: () =>
    "Your sleep has been short but your energy has been high — for a few days in a row now. " +
    "That pattern is worth paying attention to. " +
    "It might mean your mood is shifting. Please check in with your doctor this week. 💛",
}

export const PATTERN_ENGAGEMENT_DROPOUT = {
  id: 'engagement-dropout',
  tier: 1,
  action: 'flag',
  autoSurfaceSafetyPlan: false,
  detect: (weekData) => {
    const entries = Object.entries(weekData).sort(([a], [b]) => a.localeCompare(b))
    // Look for 2+ consecutive days with zero check-ins (null or empty object)
    let consecutive = 0
    let maxConsecutive = 0
    for (const [, v] of entries) {
      if (!v || Object.keys(v).length === 0) {
        consecutive++
        maxConsecutive = Math.max(maxConsecutive, consecutive)
      } else {
        consecutive = 0
      }
    }
    return maxConsecutive >= 2
  },
  message: () =>
    "You went a couple days without checking in. " +
    "That happens. But when it happens, I want to notice it. " +
    "Even one tap — just to say you're here — helps. 💚",
}

export const PATTERN_POST_DISCHARGE_CRITICAL = {
  id: 'post-discharge-critical',
  tier: 1,
  action: 'flag',
  autoSurfaceSafetyPlan: false,
  // This pattern is only active if profile has lastDischargeDate within 30 days
  // AND another tier 1 pattern also fired
  // Logic in WeekTab handles the combined check
  detect: (weekData, profile) => {
    if (!profile?.lastDischargeDate) return false
    const discharge = new Date(profile.lastDischargeDate)
    const now = new Date()
    const days = Math.floor((now - discharge) / (1000 * 60 * 60 * 24))
    if (days < 0 || days > 30) return false

    // Check if any other critical indicator present
    const daysArr = Object.values(weekData).filter(Boolean)
    const anyHighMania = daysArr.some(d => computeManiaScore(d) >= 6)
    const anyMissedMeds = daysArr.some(d => d.meds?.morning === false || d.meds?.evening === false)
    const anySubstance = daysArr.some(d =>
      d.substanceUse?.alcohol || d.substanceUse?.weed || d.substanceUse?.smoking
    )
    return anyHighMania || (anyMissedMeds && anySubstance)
  },
  message: (weekData, profile) => {
    const discharge = new Date(profile.lastDischargeDate)
    const now = new Date()
    const daysOut = Math.floor((now - discharge) / (1000 * 60 * 60 * 24))
    return `You're ${daysOut} days out of the hospital. Your brain is still adjusting — ` +
      "that takes real time. Some patterns this week are worth extra attention. " +
      "Please be gentle with yourself and stay close to your team. 💙"
  },
}

// ─── Tier 2 — Concerning Patterns ────────────────────────────────────────────

export const PATTERN_SUBSTITUTION = {
  id: 'substitution',
  tier: 2,
  action: 'flag',
  autoSurfaceSafetyPlan: false,
  detect: (weekData) => {
    const subs = detectSubstitution(weekData)
    return subs !== null && subs.length > 0
  },
  message: (weekData) => {
    const subs = detectSubstitution(weekData)
    if (!subs || subs.length === 0) return ''

    const CHANNEL_LABELS = {
      sexual: 'urges',
      selfHarm: 'self-harm',
      spending: 'spending',
      substances: 'substance use',
    }

    const { dropping, rising } = subs[0]
    const droppingLabel = CHANNEL_LABELS[dropping] || dropping
    const risingLabel = CHANNEL_LABELS[rising] || rising

    return `${droppingLabel.charAt(0).toUpperCase() + droppingLabel.slice(1)} went down this week ` +
      `but ${risingLabel} came up. Those things can be connected. ` +
      "Not saying anything is wrong — just worth knowing. The channels are related."
  },
}

export const PATTERN_NIGHTTIME_URGES = {
  id: 'nighttime-urges',
  tier: 2,
  action: 'flag',
  autoSurfaceSafetyPlan: false,
  detect: (weekData) => {
    const days = Object.values(weekData).filter(Boolean)
    const nightUrgesDays = days.filter(d =>
      (d.urges || []).some(u => {
        if (!u?.timestamp) return false
        const hour = new Date(u.timestamp).getHours()
        return hour >= 21 || hour < 4
      })
    )
    return nightUrgesDays.length >= 3
  },
  message: (weekData) => {
    const days = Object.values(weekData).filter(Boolean)
    const count = days.filter(d =>
      (d.urges || []).some(u => {
        if (!u?.timestamp) return false
        const hour = new Date(u.timestamp).getHours()
        return hour >= 21 || hour < 4
      })
    ).length
    return `Most of your urges happened late at night — ${count} nights this week. ` +
      "Late nights are harder. You can plan ahead for them. " +
      "Having your coping plan ready before bed helps."
  },
}

export const PATTERN_MEDS_MISSED_CONCERNING = {
  id: 'meds-missed-concerning',
  tier: 2,
  action: 'flag',
  autoSurfaceSafetyPlan: false,
  detect: (weekData) => {
    const days = Object.values(weekData).filter(Boolean)
    const missedDays = days.filter(d =>
      d.meds?.morning === false || d.meds?.evening === false
    ).length
    return missedDays >= 3 && missedDays < 5
  },
  message: (weekData) => {
    const days = Object.values(weekData).filter(Boolean)
    const count = days.filter(d =>
      d.meds?.morning === false || d.meds?.evening === false
    ).length
    return `You missed meds ${count} days this week. ` +
      "Your meds help your brain stay steady. Missing them makes everything harder. " +
      "Can you take them today? 💊"
  },
}

export const PATTERN_MANIA_MODERATE = {
  id: 'mania-moderate',
  tier: 2,
  action: 'flag',
  autoSurfaceSafetyPlan: false,
  detect: (weekData) => {
    const days = Object.values(weekData).filter(Boolean)
    const moderateManiaDays = days.filter(d => {
      const score = computeManiaScore(d)
      return score >= 6 && score < 8
    })
    return moderateManiaDays.length >= 2
  },
  message: () =>
    "Your sleep has been short but your energy has been high. " +
    "That pattern sometimes means your mood is shifting a little. " +
    "Worth checking in with your team this week. 💛",
}

export const PATTERN_DYSPHORIA_SPIKE = {
  id: 'dysphoria-spike',
  tier: 2,
  action: 'flag',
  autoSurfaceSafetyPlan: false,
  detect: (weekData) => {
    const days = Object.values(weekData).filter(Boolean)
    // bodySelf === 'dysphoric' or 'disconnected' = hard body day
    const dysphoricDays = days.filter(d => d.bodySelf === 'dysphoric' || d.bodySelf === 'disconnected').length
    return dysphoricDays >= 3
  },
  message: (weekData) => {
    const days = Object.values(weekData).filter(Boolean)
    const count = days.filter(d => d.bodySelf === 'dysphoric' || d.bodySelf === 'disconnected').length
    return `${count} hard days with your body this week. ` +
      "Body disconnection is real and exhausting. " +
      "You showed up anyway. That matters. 💜"
  },
}

export const PATTERN_HIGH_DISSOCIATION = {
  id: 'high-dissociation',
  tier: 2,
  action: 'flag',
  autoSurfaceSafetyPlan: false,
  detect: (weekData) => {
    const days = Object.values(weekData).filter(Boolean)
    return days.filter(d => (d.dissociation || 0) >= 3).length > 2
  },
  message: (weekData) => {
    const days = Object.values(weekData).filter(Boolean)
    const count = days.filter(d => (d.dissociation || 0) >= 3).length
    return `You felt disconnected ${count} days this week. ` +
      "That's a lot to carry. Grounding skills can help — the 5-4-3-2-1 is in your crisis toolkit. 💙"
  },
}

export const PATTERN_SECRECY_MODERATE = {
  id: 'secrecy-moderate',
  tier: 2,
  action: 'flag',
  autoSurfaceSafetyPlan: false,
  detect: (weekData) => {
    const days = Object.values(weekData).filter(Boolean)
    return days.filter(d => d.secrecyTest === false).length === 2
  },
  message: () =>
    "You had 2 secret days this week. That pattern matters. " +
    "Reaching out to someone — even just to say you're struggling — can help.",
}

// ─── Tier 3 — Affirming Patterns ─────────────────────────────────────────────

export const PATTERN_GREEN_STREAK = {
  id: 'green-streak',
  tier: 3,
  action: 'affirm',
  autoSurfaceSafetyPlan: false,
  detect: (weekData) => {
    const days = Object.values(weekData).filter(Boolean)
    return days.filter(d => d.circles?.choice === 'outer').length >= 5
  },
  message: (weekData) => {
    const days = Object.values(weekData).filter(Boolean)
    const count = days.filter(d => d.circles?.choice === 'outer').length
    return `${count} green circle days this week. You are healing. 💚`
  },
}

export const PATTERN_DBT_STREAK = {
  id: 'dbt-streak',
  tier: 3,
  action: 'affirm',
  autoSurfaceSafetyPlan: false,
  detect: (weekData) => {
    const days = Object.values(weekData).filter(Boolean)
    return days.filter(d => d.dbt?.practiced).length >= 5
  },
  message: (weekData) => {
    const days = Object.values(weekData).filter(Boolean)
    const count = days.filter(d => d.dbt?.practiced).length
    return `You practiced DBT skills ${count} out of 7 days. That's a real habit forming. 💪`
  },
}

export const PATTERN_MEDS_CONSISTENT = {
  id: 'meds-consistent',
  tier: 3,
  action: 'affirm',
  autoSurfaceSafetyPlan: false,
  detect: (weekData) => {
    const days = Object.values(weekData).filter(Boolean)
    // Count days where ALL available meds were taken (morning AND evening if both logged)
    const consistentDays = days.filter(d => {
      if (!d.meds) return false
      const morning = d.meds.morning
      const evening = d.meds.evening
      // If both are tracked, both must be true
      if (morning !== undefined && evening !== undefined) return morning === true && evening === true
      // If only one is tracked, it must be true
      if (morning !== undefined) return morning === true
      if (evening !== undefined) return evening === true
      return false
    }).length
    return consistentDays >= 6
  },
  message: () =>
    "You've been taking your meds consistently this week. " +
    "That matters more than you know. Your brain gets to stay steady. 💊",
}

export const PATTERN_SECRECY_CLEAN = {
  id: 'secrecy-clean',
  tier: 3,
  action: 'affirm',
  autoSurfaceSafetyPlan: false,
  detect: (weekData) => {
    const days = Object.values(weekData).filter(Boolean)
    const secrecyDays = days.filter(d => d.secrecyTest !== undefined && d.secrecyTest !== null)
    return secrecyDays.length >= 4 && secrecyDays.every(d => d.secrecyTest === true)
  },
  message: () =>
    "All open days this week — no secrets. " +
    "Openness is one of the most powerful things you can do. 💚",
}

export const PATTERN_SLEEP_IMPROVING = {
  id: 'sleep-improving',
  tier: 3,
  action: 'affirm',
  autoSurfaceSafetyPlan: false,
  detect: (weekData) => {
    const entries = Object.entries(weekData).sort(([a], [b]) => a.localeCompare(b))
    const daysWithSleep = entries.filter(([, d]) => d?.sleep?.hours)
    if (daysWithSleep.length < 4) return false
    const firstHalf = daysWithSleep.slice(0, Math.floor(daysWithSleep.length / 2))
    const secondHalf = daysWithSleep.slice(Math.floor(daysWithSleep.length / 2))
    const avgFirst = firstHalf.reduce((s, [, d]) => s + d.sleep.hours, 0) / firstHalf.length
    const avgSecond = secondHalf.reduce((s, [, d]) => s + d.sleep.hours, 0) / secondHalf.length
    return avgSecond > avgFirst + 0.5
  },
  message: () =>
    "Your sleep got better as the week went on. " +
    "Rest is medicine. You're giving your brain what it needs. 😴",
}

export const PATTERN_URGES_TRENDING_DOWN = {
  id: 'urges-trending-down',
  tier: 3,
  action: 'affirm',
  autoSurfaceSafetyPlan: false,
  detect: (weekData) => {
    const entries = Object.entries(weekData).sort(([a], [b]) => a.localeCompare(b))
    const daysWithUrges = entries.filter(([, d]) => d?.urges !== undefined)
    if (daysWithUrges.length < 4) return false
    const firstHalf = daysWithUrges.slice(0, Math.floor(daysWithUrges.length / 2))
    const secondHalf = daysWithUrges.slice(Math.floor(daysWithUrges.length / 2))
    const avgFirst = firstHalf.reduce((s, [, d]) => s + (d.urges || []).length, 0) / firstHalf.length
    const avgSecond = secondHalf.reduce((s, [, d]) => s + (d.urges || []).length, 0) / secondHalf.length
    return avgSecond < avgFirst - 0.5 && avgFirst > 0
  },
  message: () =>
    "Fewer urges this week than last. " +
    "The skills are working, even when it doesn't feel like it. 💚",
}

export const PATTERN_CHAIN_ANALYSIS_DONE = {
  id: 'chain-analysis-done',
  tier: 3,
  action: 'affirm',
  autoSurfaceSafetyPlan: false,
  detect: (weekData) => {
    const days = Object.values(weekData).filter(Boolean)
    return days.some(d => d.chains && d.chains.length > 0)
  },
  message: (weekData) => {
    const days = Object.values(weekData).filter(Boolean)
    const total = days.reduce((s, d) => s + (d.chains?.length || 0), 0)
    return `You did ${total} chain ${total === 1 ? 'analysis' : 'analyses'} this week. ` +
      "Looking at what happened — honestly — is one of the hardest and most useful things you can do. 💚"
  },
}

export const PATTERN_SKILLS_EFFECTIVE = {
  id: 'skills-effective',
  tier: 3,
  action: 'affirm',
  autoSurfaceSafetyPlan: false,
  detect: (weekData) => {
    const days = Object.values(weekData).filter(Boolean)
    // dbt practiced + urge context shows skill was used
    return days.filter(d => d.dbt?.practiced && (d.urges || []).some(u => u.skillUsed)).length >= 2
  },
  message: () =>
    "You used DBT skills when you felt urges this week. " +
    "That's the whole point of the skills — and you did it. 💚",
}

// ─── Tier 4 — Clinical Insight Patterns ──────────────────────────────────────

export const PATTERN_SLEEP_MOOD_CORRELATION = {
  id: 'sleep-mood-correlation',
  tier: 4,
  action: 'insight',
  autoSurfaceSafetyPlan: false,
  detect: (weekData) => {
    const entries = Object.entries(weekData).sort(([a], [b]) => a.localeCompare(b))
    let count = 0
    for (let i = 0; i < entries.length - 1; i++) {
      const prev = entries[i][1]
      const next = entries[i + 1][1]
      if (!prev || !next) continue
      if ((prev.sleep?.hours || 8) < 6 &&
          (next.circles?.choice === 'middle' || next.circles?.choice === 'inner')) {
        count++
      }
    }
    return count >= 2
  },
  message: () =>
    "When you sleep less than 6 hours, your next day tends to be harder. " +
    "Sleep really does affect how everything else feels.",
}

export const PATTERN_SENSORY_CRASH = {
  id: 'sensory-crash',
  tier: 4,
  action: 'insight',
  autoSurfaceSafetyPlan: false,
  detect: (weekData) => {
    const days = Object.values(weekData).filter(Boolean)
    return days.filter(d => (d.sensory?.level || 0) >= 4).length >= 2
  },
  message: () =>
    "High sensory days connect to harder days after. " +
    "Protecting your sensory load is protecting your energy and your mood.",
}

export const PATTERN_ACTIVITY_CRASH = {
  id: 'activity-crash',
  tier: 4,
  action: 'insight',
  autoSurfaceSafetyPlan: false,
  detect: (weekData) => {
    const entries = Object.entries(weekData).sort(([a], [b]) => a.localeCompare(b))
    let count = 0
    for (let i = 1; i < entries.length; i++) {
      const prev = entries[i - 1][1]
      const curr = entries[i][1]
      if (prev?.activity?.attempted && prev?.activity?.tolerance !== 'Fine' && curr?.energy <= 2) {
        count++
      }
    }
    return count >= 2
  },
  message: () =>
    "A few times this week, you pushed hard and crashed the next day. " +
    "Your body is telling you something. Pacing helps — even when you feel good in the moment.",
}

export const PATTERN_EVENING_URGES = {
  id: 'evening-urges',
  tier: 4,
  action: 'insight',
  autoSurfaceSafetyPlan: false,
  detect: (weekData) => {
    const days = Object.values(weekData).filter(Boolean)
    return days.filter(d =>
      (d.urges || []).some(u => u?.timestamp && new Date(u.timestamp).getHours() >= 17)
    ).length >= 3
  },
  message: () =>
    "Most of your urges happened in the evening. " +
    "That's useful to know — you can plan ahead for those hours.",
}

export const PATTERN_PAIN_SLEEP = {
  id: 'pain-sleep',
  tier: 4,
  action: 'insight',
  autoSurfaceSafetyPlan: false,
  detect: (weekData) => {
    const days = Object.values(weekData).filter(Boolean)
    return days.filter(d => (d.pain || 0) >= 3 && (d.sleep?.hours || 8) < 6).length >= 2
  },
  message: () =>
    "Your pain was higher on days you slept less. " +
    "Rest helps your body hurt less. They're connected.",
}

export const PATTERN_PUPPIES_CONSISTENT = {
  id: 'puppies-consistent',
  tier: 4,
  action: 'insight',
  autoSurfaceSafetyPlan: false,
  detect: (weekData) => {
    const days = Object.values(weekData).filter(Boolean)
    return days.filter(d =>
      d.puppies?.apollo?.skills && Object.keys(d.puppies.apollo.skills).length > 0
    ).length >= 5
  },
  message: () =>
    "You worked with Apollo and Artemis most days this week. " +
    "Structure and routine — for them and for you. 🐾",
}

export const PATTERN_DYSPHORIA_URGE_CORRELATION = {
  id: 'dysphoria-urge-correlation',
  tier: 4,
  action: 'insight',
  autoSurfaceSafetyPlan: false,
  detect: (weekData) => {
    const days = Object.values(weekData).filter(Boolean)
    // Count days where both dysphoria AND (urge or inner circle) occurred
    const bothDays = days.filter(d =>
      d.bodySelf === 'dysphoric' &&
      ((d.urges && d.urges.length > 0) || d.circles?.choice === 'inner')
    ).length
    return bothDays >= 2
  },
  message: () =>
    "Dysphoria days and acting-out days are lining up. " +
    "When your body feels wrong, the urge to escape gets louder. " +
    "That's not weakness — it's a pattern you can plan for. " +
    "Check your coping plan for 'when I feel disconnected from my body.'",
}

// ─── All Patterns (ordered by tier — critical first) ─────────────────────────

export const CLINICAL_PATTERNS = [
  // Tier 1 — Critical
  PATTERN_TRIPLE_RISK,
  PATTERN_TRAUMA_REENACTMENT,
  PATTERN_SECRECY_HIGH,
  PATTERN_MANIA_URGENT,
  PATTERN_ENGAGEMENT_DROPOUT,
  PATTERN_POST_DISCHARGE_CRITICAL,
  // Tier 2 — Concerning
  PATTERN_SUBSTITUTION,
  PATTERN_NIGHTTIME_URGES,
  PATTERN_MEDS_MISSED_CONCERNING,
  PATTERN_MANIA_MODERATE,
  PATTERN_DYSPHORIA_SPIKE,
  PATTERN_HIGH_DISSOCIATION,
  PATTERN_SECRECY_MODERATE,
  // Tier 3 — Affirming
  PATTERN_GREEN_STREAK,
  PATTERN_DBT_STREAK,
  PATTERN_MEDS_CONSISTENT,
  PATTERN_SECRECY_CLEAN,
  PATTERN_SLEEP_IMPROVING,
  PATTERN_URGES_TRENDING_DOWN,
  PATTERN_CHAIN_ANALYSIS_DONE,
  PATTERN_SKILLS_EFFECTIVE,
  // Tier 4 — Insights
  PATTERN_SLEEP_MOOD_CORRELATION,
  PATTERN_SENSORY_CRASH,
  PATTERN_ACTIVITY_CRASH,
  PATTERN_EVENING_URGES,
  PATTERN_PAIN_SLEEP,
  PATTERN_PUPPIES_CONSISTENT,
  PATTERN_DYSPHORIA_URGE_CORRELATION,
]

// Run all clinical pattern detectors against the week's data.
// Returns an array of { pattern, message } objects sorted by tier (critical first).
export function runClinicalPatterns(weekData, profile) {
  const days = Object.values(weekData).filter(Boolean)
  if (days.length < 3) return []

  const results = []
  for (const pattern of CLINICAL_PATTERNS) {
    try {
      if (pattern.detect(weekData, profile)) {
        results.push({
          id: pattern.id,
          tier: pattern.tier,
          action: pattern.action,
          autoSurfaceSafetyPlan: pattern.autoSurfaceSafetyPlan,
          message: pattern.message(weekData, profile),
        })
      }
    } catch {
      // Never crash the UI due to a pattern detection error
    }
  }

  // Sort: tier 1 first, then 2, 3, 4
  results.sort((a, b) => a.tier - b.tier)
  return results
}
