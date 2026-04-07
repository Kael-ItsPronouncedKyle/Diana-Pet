// Haptic feedback utility — uses Vibration API where available
// Respects user settings via the enabled flag

let enabled = true

export function setHapticsEnabled(val) {
  enabled = val
}

function vibrate(pattern) {
  if (!enabled || !navigator.vibrate) return
  try { navigator.vibrate(pattern) } catch {}
}

export function tapFeedback() { vibrate(10) }
export function saveFeedback() { vibrate([10, 50, 10]) }
export function milestoneFeedback() { vibrate([20, 60, 20, 60, 30]) }
export function celebrationFeedback() { vibrate([30, 80, 30, 80, 30, 80, 50]) }
