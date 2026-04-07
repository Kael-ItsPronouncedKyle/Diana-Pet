import { useMemo, useState, useEffect, useCallback } from 'react'
import CreatureScene from '../Pet/CreatureScene.jsx'
import { getTimeOfDay, today } from '../../utils/dates.js'
import { countCheckIns, TOTAL_CHECKINS, checkMilestone, CREATURE_REACTIONS, getMoodState } from '../../utils/checkIns.js'
import { tapFeedback, saveFeedback, milestoneFeedback } from '../../utils/haptics.js'
import storage from '../../utils/storage.js'
import { getFeedbackMessage } from '../../utils/feedbackEngine.js'
import { WORDS } from '../../constants/words.js'
import { runClinicalPatterns } from '../../constants/clinicalPatterns.js'
import ValuesAnchor from '../shared/ValuesAnchor.jsx'
import DailySchedule from '../checkins/DailySchedule.jsx'

// Warm, inviting card data per time of day
const TIME_FLOWS = {
  morning: {
    subtext: "When you're ready:",
    items: [
      { key: 'sleep', label: 'How did you sleep?', emoji: '😴', tab: 'checkins', sub: 'sleep', color: '#6BA8D6' },
      { key: 'meds', label: 'Morning meds?', emoji: '💊', tab: 'checkins', sub: 'meds', color: '#6BA89E', quickAction: 'meds' },
      { key: 'energy', label: "How's your energy?", emoji: '⚡', tab: 'checkins', sub: 'energy', color: '#E8907E' },
      { key: 'window', label: 'Where is your body at?', emoji: '🧠', tab: 'checkins', sub: 'window', color: '#6BA89E' },
      { key: 'feelings', label: 'What are you feeling?', emoji: '🎭', tab: 'checkins', sub: 'feelings', color: '#E8907E' },
      { key: 'word', label: "Today's word", emoji: '📖', tab: null, sub: 'word', color: '#F0C050' },
    ],
  },
  midday: {
    subtext: "How's the day going?",
    items: [
      { key: 'water', label: 'Had some water?', emoji: '💧', tab: 'checkins', sub: 'water', color: '#6BA8D6', quickAction: 'water' },
      { key: 'puppies', label: 'Puppy time!', emoji: '🐾', tab: 'puppies', sub: null, color: '#6BBF8A' },
      { key: 'dbt', label: 'Try a skill', emoji: '💚', tab: 'checkins', sub: 'dbt', color: '#6BA89E' },
      { key: 'energy', label: 'Energy check', emoji: '⚡', tab: 'checkins', sub: 'energy', color: '#E8907E' },
    ],
  },
  evening: {
    subtext: 'Time to wind down.',
    items: [
      { key: 'circles', label: 'How was today?', emoji: '⭕', tab: 'checkins', sub: 'circles', color: '#6BBF8A' },
      { key: 'feelings', label: 'What are you feeling?', emoji: '🎭', tab: 'checkins', sub: 'feelings', color: '#E8907E' },
      { key: 'meds', label: 'Evening meds?', emoji: '💊', tab: 'checkins', sub: 'meds', color: '#6BA89E', quickAction: 'meds' },
      { key: 'sensory', label: 'Sensory check', emoji: '🧠', tab: 'checkins', sub: 'sensory', color: '#E8907E' },
      { key: 'dissociation', label: 'Feel present?', emoji: '🌫', tab: 'checkins', sub: 'dissociation', color: '#6BA8D6' },
      { key: 'bodySelf', label: 'Body-self check', emoji: '💜', tab: 'checkins', sub: 'bodySelf', color: '#E8907E' },
      { key: 'puppies', label: 'Puppy training', emoji: '🐾', tab: 'puppies', sub: null, color: '#6BBF8A' },
      { key: 'water', label: 'Water count', emoji: '💧', tab: 'checkins', sub: 'water', color: '#6BA8D6', quickAction: 'water' },
    ],
  },
}

const ALL_SECTIONS = ['circles', 'feelings', 'sleep', 'meds', 'energy', 'water', 'dbt', 'sensory', 'puppies', 'word', 'window', 'dissociation', 'bodySelf']

function isDone(key, daily) {
  if (!daily) return false
  if (key === 'circles') return !!daily.circles
  if (key === 'sleep') return !!daily.sleep?.quality
  if (key === 'meds') return daily.meds?.morning !== undefined || daily.meds?.evening !== undefined
  if (key === 'energy') return daily.energy !== undefined
  if (key === 'water') return (daily.water?.count || 0) > 0
  if (key === 'dbt') return !!daily.dbt?.practiced
  if (key === 'sensory') return daily.sensory?.level !== undefined
  if (key === 'puppies') return !!(daily.puppies?.apollo?.skills && Object.keys(daily.puppies.apollo.skills).length > 0)
  if (key === 'word') return !!daily.wordOfDay?.learned
  if (key === 'feelings') return daily.emotions && daily.emotions.length > 0
  if (key === 'window') return daily.window !== undefined
  if (key === 'dissociation') return daily.dissociation !== undefined
  if (key === 'bodySelf') return !!daily.bodySelf
  return false
}

// ─── Check-in Grid Row ───────────────────────────────────────────────────
function CheckInRow({ label, emoji, done, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 14px',
        borderRadius: 12,
        background: done ? 'var(--green-bg, #E6F7EC)' : 'var(--card, white)',
        border: `1.5px solid ${done ? '#6BBF8A' : '#F0E8E0'}`,
        cursor: 'pointer',
        textAlign: 'left',
        width: '100%',
      }}
    >
      <div style={{ fontSize: 16 }}>{emoji}</div>
      <div style={{
        flex: 1,
        fontSize: 13,
        fontWeight: 600,
        color: done ? '#4A9A6A' : 'var(--text, #3D3535)',
      }}>
        {label}
      </div>
      <div style={{ fontSize: 14, color: done ? '#6BBF8A' : '#E0D5CC' }}>
        {done ? '✅' : '⬜'}
      </div>
    </button>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────
export default function HomeTab({ profile, daily, onNavigate, onEventMessage, onUpdate, onToast, creatureReaction, onCreatureReaction, onMilestone, onOpenCrisis }) {
  const timeOfDay = getTimeOfDay()
  const flow = TIME_FLOWS[timeOfDay]
  const checkInCount = countCheckIns(daily)
  const moodState = getMoodState(checkInCount)
  const creatureName = profile?.creatureName || 'Friend'
  const creatureId = profile?.creature || 'puppy'

  const [weekData, setWeekData] = useState({})
  const [feedbackMessage, setFeedbackMessage] = useState('')
  const [showAllCheckIns, setShowAllCheckIns] = useState(false)

  // Load week data on mount and when daily changes
  useEffect(() => {
    (async () => {
      const data = {}
      for (let i = 0; i < 7; i++) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        const dateStr = d.toISOString().slice(0, 10)
        const key = `diana-daily:${dateStr}`
        try {
          const val = await storage.get(key)
          if (val) data[dateStr] = val
        } catch (e) {
          // Silently skip if not found
        }
      }
      setWeekData(data)
    })()
  }, [daily])

  // Load feedback message on mount and when daily/week changes
  useEffect(() => {
    (async () => {
      try {
        const result = await getFeedbackMessage(daily, weekData, profile || {}, timeOfDay)
        const msg = (typeof result === 'string') ? result : (result?.message || '💬 Keep going. You matter.')
        setFeedbackMessage(typeof msg === 'string' ? msg : '💬 Keep going. You matter.')
      } catch (e) {
        setFeedbackMessage('💬 Keep going. You matter.')
      }
    })()
  }, [daily, weekData, profile, timeOfDay])

  // ─── Safety Plan Banner (clinical pattern detection) ─────────────────
  const [showSafetyBanner, setShowSafetyBanner] = useState(false)
  const [safetyBannerDismissed, setSafetyBannerDismissed] = useState(!!daily?.safetyBannerDismissed)

  useEffect(() => {
    if (safetyBannerDismissed) return
    try {
      const patterns = runClinicalPatterns(weekData, profile || {})
      const hasCritical = patterns.some(p => p.tier === 1 && p.autoSurfaceSafetyPlan)
      setShowSafetyBanner(hasCritical)
    } catch (e) {
      // Never crash the UI
    }
  }, [weekData, profile, safetyBannerDismissed])

  const handleDismissSafetyBanner = () => {
    setSafetyBannerDismissed(true)
    setShowSafetyBanner(false)
    onNavigate('__updateDaily', { safetyBannerDismissed: true })
  }

  // ─── Engagement Dropout Banner ──────────────────────────────────────
  const [showDropoutBanner, setShowDropoutBanner] = useState(false)

  useEffect(() => {
    if (daily?.dropoutBannerSeen) return
    try {
      // Check last 4 days (not including today)
      const zeroDays = []
      for (let i = 1; i <= 4; i++) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        const dateStr = d.toISOString().slice(0, 10)
        const dayData = weekData[dateStr]
        if (!dayData || Object.keys(dayData).length === 0) {
          zeroDays.push(dateStr)
        }
      }
      setShowDropoutBanner(zeroDays.length >= 2)
    } catch (e) {
      // Never crash the UI
    }
  }, [weekData, daily?.dropoutBannerSeen])

  const handleDismissDropoutBanner = () => {
    setShowDropoutBanner(false)
    onNavigate('__updateDaily', { dropoutBannerSeen: true })
  }

  // Determine next action
  const nextAction = useMemo(() => {
    return flow.items.find(item => !isDone(item.key, daily))
  }, [daily, timeOfDay, flow])

  const checkInCount_actual = countCheckIns(daily)
  const allDone = checkInCount_actual === TOTAL_CHECKINS

  // Check if current hour is 21-4 (night)
  const hour = new Date().getHours()
  const isNight = hour >= 21 || hour < 4

  const handleNextActionTap = () => {
    if (nextAction) {
      tapFeedback()
      onNavigate(nextAction.tab, nextAction.sub)
    }
  }

  const handleCheckInItemTap = (item) => {
    tapFeedback()
    if (item.tab) {
      onNavigate(item.tab, item.sub)
    }
  }

  const [undoAction, setUndoAction] = useState(null)

  const handleQuickAction = (item) => {
    if (item.quickAction === 'water') {
      const prevCount = daily?.water?.count || 0
      const count = prevCount + 1
      onNavigate('__updateDaily', { water: { count: Math.min(8, count) } })
      onToast?.(`💧 ${Math.min(8, count)}/8 glasses`)
      setUndoAction({ type: 'water', prev: prevCount })
      setTimeout(() => setUndoAction(null), 5000)
    } else if (item.quickAction === 'meds') {
      const hour = new Date().getHours()
      const field = hour < 17 ? 'morning' : 'evening'
      const prevMeds = { ...(daily?.meds || {}) }
      onNavigate('__updateDaily', { meds: { ...prevMeds, [field]: true } })
      onToast?.('💊 Meds logged!')
      setUndoAction({ type: 'meds', field, prev: prevMeds })
      setTimeout(() => setUndoAction(null), 5000)
    }
  }

  const handleUndo = () => {
    if (!undoAction) return
    if (undoAction.type === 'water') {
      onNavigate('__updateDaily', { water: { count: undoAction.prev } })
      onToast?.('💧 Undone')
    } else if (undoAction.type === 'meds') {
      onNavigate('__updateDaily', { meds: undoAction.prev })
      onToast?.('💊 Undone')
    }
    setUndoAction(null)
  }

  // ─── Yesterday's urge reflection check ──────────────────────────────
  const [yesterdayHadUrge, setYesterdayHadUrge] = useState(false)
  const [yesterdayReflected, setYesterdayReflected] = useState(false)

  useEffect(() => {
    (async () => {
      if (timeOfDay !== 'morning') return
      try {
        const yest = new Date()
        yest.setDate(yest.getDate() - 1)
        const yKey = `diana-daily:${yest.toISOString().slice(0, 10)}`
        const yData = await storage.get(yKey)
        if (yData?.urges?.length > 0) {
          setYesterdayHadUrge(true)
          setYesterdayReflected(!!yData.urgeReflection)
        }
      } catch (e) {
        // silently skip
      }
    })()
  }, [timeOfDay])

  // ─── Word of Day State and Logic ─────────────────────────────────────
  const [todayWord, setTodayWord] = useState(null)
  const [wordProgress, setWordProgress] = useState({})
  const [practiceInput, setPracticeInput] = useState('')
  const [showPracticeInput, setShowPracticeInput] = useState(false)

  // Load Word of Day and progress on mount and when daily changes
  useEffect(() => {
    (async () => {
      try {
        // Load word progress from storage
        let progress = (await storage.get('diana-words-progress')) || {}

        // Pick today's word based on spaced repetition
        const picked = pickWordOfDay(progress)

        // Mark as seen if not already seen
        if (picked && !progress[picked.id]?.seen) {
          progress[picked.id] = {
            seen: true,
            learned: false,
            seenCount: 1,
            lastSeen: today(),
          }
          await storage.set('diana-words-progress', progress)
        }

        setWordProgress(progress)
        setTodayWord(picked)

        // Load practice sentence if already saved
        if (daily?.wordOfDay?.sentence) {
          setPracticeInput(daily.wordOfDay.sentence)
        }
      } catch (e) {
        console.error('Failed to load word of day:', e)
      }
    })()
  }, [daily])

  // Pick word: prefer unseen, then not-learned (least recent), then all learned
  const pickWordOfDay = (progress) => {
    const now = new Date().toISOString().slice(0, 10)

    // Avoid repeating today's word
    const lastWordKey = `diana-word-of-day:${now}`

    // Split words into categories
    const unseen = []
    const seenNotLearned = []
    const learned = []

    WORDS.forEach(w => {
      const p = progress[w.id] || { seen: false, learned: false }
      if (!p.seen) {
        unseen.push(w)
      } else if (!p.learned) {
        seenNotLearned.push(w)
      } else {
        learned.push(w)
      }
    })

    // Sort "not learned" by least recently seen
    seenNotLearned.sort((a, b) => {
      const aDate = (progress[a.id]?.lastSeen || '1970-01-01')
      const bDate = (progress[b.id]?.lastSeen || '1970-01-01')
      return aDate.localeCompare(bDate)
    })

    // Pick: unseen first, then not-learned, then learned
    let word = unseen[0] || seenNotLearned[0] || learned[Math.floor(Math.random() * learned.length)]

    if (!word) word = WORDS[0]
    return word
  }

  const handleWordLearned = async () => {
    try {
      if (!todayWord) return

      // Update progress
      const progress = { ...wordProgress }
      const p = progress[todayWord.id] || { seen: true, learned: false, seenCount: 0, lastSeen: '' }
      progress[todayWord.id] = {
        seen: true,
        learned: true,
        seenCount: (p.seenCount || 1),
        lastSeen: today(),
      }
      await storage.set('diana-words-progress', progress)
      setWordProgress(progress)

      // Mark daily task as complete
      onNavigate('__updateDaily', { wordOfDay: { learned: true, sentence: practiceInput } })

      onToast?.('📖 Great word! Keep using it!')
    } catch (e) {
      console.error('Failed to mark word learned:', e)
    }
  }

  const handleSavePractice = () => {
    try {
      onNavigate('__updateDaily', { wordOfDay: { sentence: practiceInput } })
      onToast?.('💭 Practice saved!')
    } catch (e) {
      console.error('Failed to save practice:', e)
    }
  }

  // Count learned words
  const learnedCount = useMemo(() => {
    return Object.values(wordProgress).filter(p => p.learned).length
  }, [wordProgress])

  return (
    <div style={{ padding: '0 20px 100px', animation: 'fade-up 0.25s ease-out' }}>

      {/* 1. CreatureScene */}
      <div style={{ marginBottom: 12 }}>
        <CreatureScene
          creatureId={creatureId}
          moodState={moodState}
          streak={profile.streak || 0}
          reaction={creatureReaction}
          timeOfDay={timeOfDay}
          isNightRisk={isNight}
          size={160}
        />
      </div>

      {/* 1b. Safety Plan Banner — pinned when critical pattern detected */}
      {showSafetyBanner && !safetyBannerDismissed && (
        <div style={{
          marginBottom: 12,
          padding: '14px 16px',
          borderRadius: 16,
          background: 'var(--accent-light, #FDE8E4)',
          borderLeft: '4px solid var(--accent, #E8907E)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text, #3D3535)', lineHeight: 1.4 }}>
              Your safety plan is here if you need it. 💙
            </div>
            <button
              onClick={() => onOpenCrisis?.()}
              style={{
                marginTop: 8,
                padding: '8px 16px',
                borderRadius: 12,
                background: 'var(--accent, #E8907E)',
                color: 'white',
                border: 'none',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Open safety plan
            </button>
          </div>
          <button
            onClick={handleDismissSafetyBanner}
            aria-label="Dismiss"
            style={{
              background: 'none',
              border: 'none',
              fontSize: 18,
              color: 'var(--text-light, #8A7F7F)',
              cursor: 'pointer',
              padding: 4,
              alignSelf: 'flex-start',
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* 1c. Engagement Dropout Banner */}
      {showDropoutBanner && !daily?.dropoutBannerSeen && (
        <div style={{
          marginBottom: 12,
          padding: '14px 16px',
          borderRadius: 16,
          background: 'var(--blue-bg, #E8F1FA)',
          border: '1.5px solid var(--blue, #6BA8D6)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}>
          <div style={{ flex: 1, fontSize: 14, fontWeight: 600, color: 'var(--text, #3D3535)', lineHeight: 1.5 }}>
            You went quiet for a couple days. The days you don't check in are usually the days it helps the most. 💚
          </div>
          <button
            onClick={handleDismissDropoutBanner}
            aria-label="Dismiss"
            style={{
              background: 'none',
              border: 'none',
              fontSize: 18,
              color: 'var(--text-light, #8A7F7F)',
              cursor: 'pointer',
              padding: 4,
              alignSelf: 'flex-start',
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* 1d. Luis Context Banner (T2-07) */}
      {profile?.luisShift && (
        <div style={{ marginBottom: 12 }}>
          {(() => {
            const dayOfWeek = new Date().getDay()
            const isLuisWorkDay = profile.luisShift?.workDays?.includes(dayOfWeek)
            return (
              <div style={{
                padding: '12px 16px',
                borderRadius: 20,
                background: isLuisWorkDay ? 'var(--blue-bg, #E8F1FA)' : 'var(--green-bg, #E6F7EC)',
                border: `1.5px solid ${isLuisWorkDay ? 'var(--blue, #6BA8D6)' : 'var(--green, #6BBF8A)'}`,
                textAlign: 'center',
                fontSize: 13,
                fontWeight: 600,
                color: isLuisWorkDay ? 'var(--blue, #6BA8D6)' : 'var(--green, #6BBF8A)',
              }}>
                {isLuisWorkDay ? '🏢 Luis is at work today' : '🏡 Luis is home today'}
              </div>
            )
          })()}
        </div>
      )}

      {/* 2. Speech Bubble (feedback card) */}
      <div style={{
        background: 'var(--card, white)',
        borderRadius: 20,
        padding: '14px 18px',
        margin: '0 0 12px 0',
        boxShadow: '0 2px 8px rgba(61,53,53,0.06)',
        fontSize: 15,
        fontWeight: 700,
        color: 'var(--text, #3D3535)',
        lineHeight: 1.5,
        textAlign: 'center',
        minHeight: 48,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {feedbackMessage}
      </div>

      {/* 3. One Next Action */}
      {nextAction ? (
        <button
          onClick={handleNextActionTap}
          style={{
            width: '100%',
            padding: '18px 20px',
            borderRadius: 20,
            border: '2px solid #E8F4F1',
            background: 'var(--card, white)',
            boxShadow: '0 2px 8px rgba(61,53,53,0.06)',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            cursor: 'pointer',
            textAlign: 'left',
            marginBottom: 16,
          }}
        >
          <div style={{
            width: 48, height: 48, borderRadius: 16,
            background: '#E8F4F1',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24,
          }}>
            {nextAction.emoji}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text, #3D3535)' }}>
              {nextAction.label}
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-light, #8A7F7F)', marginTop: 2 }}>
              Tap to check in
            </div>
          </div>
          <div style={{ fontSize: 20, color: 'var(--text-light, #8A7F7F)' }}>→</div>
        </button>
      ) : (
        <div style={{
          margin: '0 0 16px 0',
          padding: '20px',
          borderRadius: 20,
          background: '#E6F7EC',
          border: '2px solid #6BBF8A',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>✨</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#3D3535' }}>
            You showed up completely today.
          </div>
        </div>
      )}

      {/* 4. Dot Progress or Bar Progress */}
      {TOTAL_CHECKINS > 10 ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
          margin: '0 0 16px 0',
          padding: '12px 16px',
          borderRadius: 16,
          background: 'var(--card, white)',
          boxShadow: '0 2px 8px rgba(61,53,53,0.06)',
        }}>
          <div style={{
            width: '100%',
            height: 6,
            borderRadius: 3,
            background: '#E8E0D8',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: `${(checkInCount_actual / TOTAL_CHECKINS) * 100}%`,
              background: '#6BA89E',
              borderRadius: 3,
              transition: 'width 0.5s ease',
            }} />
          </div>
          <span style={{
            fontSize: 13,
            fontWeight: 700,
            color: 'var(--text-light, #8A7F7F)',
          }}>
            {checkInCount_actual} of {TOTAL_CHECKINS} check-ins
          </span>
        </div>
      ) : (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          margin: '0 0 16px 0',
          padding: '12px 16px',
          borderRadius: 16,
          background: 'var(--card, white)',
          boxShadow: '0 2px 8px rgba(61,53,53,0.06)',
        }}>
          {Array.from({ length: TOTAL_CHECKINS }).map((_, i) => (
            <div key={i} style={{
              width: i < checkInCount_actual ? 10 : 8,
              height: i < checkInCount_actual ? 10 : 8,
              borderRadius: '50%',
              background: i < checkInCount_actual ? '#6BA89E' : '#E8E0D8',
              transition: 'all 0.3s ease',
            }} />
          ))}
          <span style={{
            marginLeft: 8,
            fontSize: 13,
            fontWeight: 700,
            color: 'var(--text-light, #8A7F7F)',
          }}>
            {checkInCount_actual} of {TOTAL_CHECKINS}
          </span>
        </div>
      )}

      {/* Undo quick-action banner */}
      {undoAction && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 16px', borderRadius: 14,
          background: 'var(--yellow-bg, #FFF8E1)', border: '1.5px solid var(--yellow, #F0C050)',
          marginBottom: 12, animation: 'fade-up 0.2s ease-out',
        }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text, #3D3535)' }}>
            {undoAction.type === 'water' ? '💧 Water logged' : '💊 Meds logged'}
          </span>
          <button onClick={handleUndo} style={{
            padding: '6px 14px', borderRadius: 10, border: 'none',
            background: 'var(--yellow, #F0C050)', color: 'white',
            fontSize: 13, fontWeight: 800, cursor: 'pointer',
          }}>
            Undo
          </button>
        </div>
      )}

      {/* Morning urge reflection prompt */}
      {timeOfDay === 'morning' && yesterdayHadUrge && !yesterdayReflected && (
        <button
          onClick={() => onNavigate('checkins', 'urges')}
          style={{
            width: '100%', padding: '14px 18px', borderRadius: 16,
            background: 'var(--accent-light, #FDE8E4)', border: '2px solid var(--accent, #E8907E)',
            cursor: 'pointer', textAlign: 'left', marginBottom: 12,
            display: 'flex', alignItems: 'center', gap: 12,
            animation: 'fade-up 0.2s ease-out',
          }}
        >
          <span style={{ fontSize: 20 }}>🔴</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text, #3D3535)' }}>
              Yesterday had some urges.
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-light, #8A7F7F)' }}>
              Want to reflect on how you handled it?
            </div>
          </div>
          <div style={{ fontSize: 16, color: 'var(--text-light, #8A7F7F)', marginLeft: 'auto' }}>→</div>
        </button>
      )}

      {/* 5. Values Anchor Display (T1-12) */}
      {profile?.valuesAnchor?.goals?.length > 0 && (
        <div style={{
          background: 'var(--card, white)',
          borderRadius: 16,
          padding: '14px 16px',
          marginBottom: 12,
          borderLeft: '4px solid var(--primary, #6BA89E)',
          boxShadow: '0 2px 8px rgba(61,53,53,0.06)',
        }}>
          <div style={{
            fontSize: 12,
            fontWeight: 700,
            color: 'var(--text-light, #8A7F7F)',
            letterSpacing: 0.5,
            marginBottom: 8,
            textTransform: 'uppercase',
          }}>
            Working toward:
          </div>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}>
            {profile.valuesAnchor.goals.map((goal, idx) => (
              goal && (
                <div
                  key={idx}
                  style={{
                    fontSize: 12,
                    color: 'var(--text, #3D3535)',
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 8,
                  }}
                >
                  <span style={{ color: 'var(--primary, #6BA89E)', fontWeight: 700 }}>✓</span>
                  <span>{goal}</span>
                </div>
              )
            ))}
          </div>
        </div>
      )}

      {/* 6. Schedule Preview (T2-06) */}
      {profile?.schedule && (() => {
        const dayOfWeek = new Date().getDay()
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
        const currentSchedule = profile?.schedule || { weekday: [], weekend: [] }
        const todaySchedule = isWeekend ? (currentSchedule.weekend || []) : (currentSchedule.weekday || [])

        const parseTime = (timeStr) => {
          const [time, period] = timeStr.split(' ')
          let [hours, minutes] = time.split(':').map(Number)
          if (period === 'PM' && hours !== 12) hours += 12
          if (period === 'AM' && hours === 12) hours = 0
          return hours * 60 + minutes
        }

        const now = new Date()
        const currentMinutes = now.getHours() * 60 + now.getMinutes()
        let nextBlock = null

        for (let i = 0; i < todaySchedule.length; i++) {
          const block = todaySchedule[i]
          const blockTime = parseTime(block.time)
          if (currentMinutes < blockTime) {
            nextBlock = block
            break
          }
        }

        if (nextBlock) {
          return (
            <div style={{
              background: 'var(--card, white)',
              borderRadius: 16,
              padding: '12px 14px',
              marginBottom: 12,
              boxShadow: '0 2px 8px rgba(61,53,53,0.06)',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}>
              <span style={{ fontSize: 14, color: 'var(--primary, #6BA89E)', fontWeight: 700 }}>
                {nextBlock.time}
              </span>
              <span style={{ fontSize: 13, color: 'var(--text, #3D3535)', fontWeight: 600, flex: 1 }}>
                {nextBlock.label}
              </span>
              <span style={{ fontSize: 12, color: 'var(--text-light, #8A7F7F)' }}>Next up</span>
            </div>
          )
        }
        return null
      })()}

      {/* 7. See all check-ins expandable */}
      <div style={{
        background: 'var(--card, white)',
        borderRadius: 20,
        padding: '16px 18px',
        boxShadow: '0 2px 8px rgba(61,53,53,0.06)',
      }}>
        <button
          onClick={() => { setShowAllCheckIns(!showAllCheckIns); tapFeedback() }}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            marginBottom: showAllCheckIns ? 12 : 0,
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-light, #8A7F7F)', letterSpacing: 0.5 }}>
            ALL CHECK-INS
          </div>
          <span style={{
            fontSize: 12,
            color: 'var(--text-light, #8A7F7F)',
            transition: 'transform 0.2s',
            transform: showAllCheckIns ? 'rotate(180deg)' : 'rotate(0)',
          }}>
            ▼
          </span>
        </button>

        {showAllCheckIns && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            animation: 'fade-up 0.2s ease-out',
          }}>
            {[
              { key: 'sleep', label: 'How did you sleep?', emoji: '😴', tab: 'checkins', sub: 'sleep' },
              { key: 'meds', label: 'Morning meds?', emoji: '💊', tab: 'checkins', sub: 'meds', quickAction: 'meds' },
              { key: 'energy', label: "How's your energy?", emoji: '⚡', tab: 'checkins', sub: 'energy' },
              { key: 'water', label: 'Had some water?', emoji: '💧', tab: 'checkins', sub: 'water', quickAction: 'water' },
              { key: 'window', label: 'Where is your body at?', emoji: '🧠', tab: 'checkins', sub: 'window' },
              { key: 'feelings', label: 'What are you feeling?', emoji: '🎭', tab: 'checkins', sub: 'feelings' },
              { key: 'circles', label: 'How was today?', emoji: '⭕', tab: 'checkins', sub: 'circles' },
              { key: 'dbt', label: 'Try a skill', emoji: '💚', tab: 'checkins', sub: 'dbt' },
              { key: 'sensory', label: 'Sensory check', emoji: '🧠', tab: 'checkins', sub: 'sensory' },
              { key: 'dissociation', label: 'Feel present?', emoji: '🌫', tab: 'checkins', sub: 'dissociation' },
              { key: 'bodySelf', label: 'Body-self check', emoji: '💜', tab: 'checkins', sub: 'bodySelf' },
              { key: 'puppies', label: 'Puppy training', emoji: '🐾', tab: 'puppies', sub: null },
              { key: 'word', label: "Today's word", emoji: '📖', tab: 'checkins', sub: 'word' },
            ].map(item => (
              <CheckInRow
                key={item.key}
                label={item.label}
                emoji={item.emoji}
                done={isDone(item.key, daily)}
                onClick={() => {
                  if (item.quickAction && !isDone(item.key, daily)) {
                    handleQuickAction(item)
                  } else {
                    handleCheckInItemTap(item)
                  }
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* 6. Word of the Day Section */}
      {todayWord && (
        <div style={{
          background: 'var(--card, white)',
          borderRadius: 20,
          padding: '18px',
          boxShadow: '0 2px 8px rgba(61,53,53,0.06)',
          marginTop: 16,
          animation: 'fade-up 0.25s ease-out',
        }}>
          {/* Progress bar: Words learned */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 14,
            paddingBottom: 12,
            borderBottom: '1px solid #F0E8E0',
          }}>
            <div style={{
              fontSize: 12,
              fontWeight: 700,
              color: 'var(--text-light, #8A7F7F)',
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}>
              Words I learned
            </div>
            <div style={{
              fontSize: 13,
              fontWeight: 700,
              color: 'var(--primary, #6BA89E)',
            }}>
              {learnedCount} / 35
            </div>
          </div>

          {/* Word card */}
          <div style={{
            marginBottom: 16,
          }}>
            {/* Word and definition */}
            <div style={{
              marginBottom: 12,
            }}>
              <div style={{
                fontSize: 20,
                fontWeight: 800,
                color: 'var(--text, #3D3535)',
                marginBottom: 4,
              }}>
                {todayWord.word}
              </div>
              <div style={{
                fontSize: 13,
                color: 'var(--text, #3D3535)',
                fontWeight: 500,
                lineHeight: 1.5,
              }}>
                {todayWord.definition}
              </div>
            </div>

            {/* Example sentence */}
            <div style={{
              background: '#FFF8F3',
              borderRadius: 12,
              padding: '10px 12px',
              marginBottom: 12,
              fontSize: 12,
              color: 'var(--text, #3D3535)',
              fontStyle: 'italic',
              lineHeight: 1.4,
              borderLeft: '3px solid var(--primary, #6BA89E)',
            }}>
              {todayWord.sentence}
            </div>

            {/* Practice sentence input (shown if not learned or user taps practice) */}
            {!daily?.wordOfDay?.learned && (
              <div style={{
                marginBottom: 12,
              }}>
                <label style={{
                  display: 'block',
                  fontSize: 12,
                  fontWeight: 700,
                  color: 'var(--text-light, #8A7F7F)',
                  marginBottom: 6,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                }}>
                  Your sentence
                </label>
                <textarea
                  value={practiceInput}
                  onChange={(e) => setPracticeInput(e.target.value)}
                  placeholder="Can you use this word in your own sentence?"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 12,
                    border: '1.5px solid #F0E8E0',
                    fontFamily: 'Nunito, sans-serif',
                    fontSize: 13,
                    color: 'var(--text, #3D3535)',
                    resize: 'none',
                    minHeight: 60,
                    boxSizing: 'border-box',
                    fontWeight: 500,
                  }}
                />
                {practiceInput && (
                  <button
                    onClick={handleSavePractice}
                    style={{
                      marginTop: 8,
                      fontSize: 12,
                      fontWeight: 700,
                      padding: '8px 12px',
                      borderRadius: 8,
                      border: 'none',
                      background: '#E8F4F1',
                      color: 'var(--primary, #6BA89E)',
                      cursor: 'pointer',
                      width: '100%',
                    }}
                  >
                    Save
                  </button>
                )}
              </div>
            )}

            {/* I learned this button OR already learned badge */}
            {!daily?.wordOfDay?.learned ? (
              <button
                onClick={handleWordLearned}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: 12,
                  border: 'none',
                  background: 'var(--primary, #6BA89E)',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: 'pointer',
                  transition: 'transform 0.1s ease',
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.transform = 'scale(0.98)'
                  tapFeedback()
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.transform = 'scale(1)'
                }}
              >
                I learned this word
              </button>
            ) : (
              <div style={{
                background: '#E6F7EC',
                borderRadius: 12,
                padding: '12px 16px',
                textAlign: 'center',
                color: '#4A9A6A',
                fontWeight: 700,
                fontSize: 13,
              }}>
                ✅ You learned this word today!
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
