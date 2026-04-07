import { useMemo, useState, useEffect, useCallback } from 'react'
import Pet from '../Pet/Pet.jsx'
import ProgressRing from '../shared/ProgressRing.jsx'
import CheckInSheet from '../shared/CheckInSheet.jsx'
import { getTimeOfDay } from '../../utils/dates.js'
import { countCheckIns, TOTAL_CHECKINS, checkMilestone, CREATURE_REACTIONS } from '../../utils/checkIns.js'
import { WORDS } from '../../constants/words.js'
import { CREATURES, CREATURE_GREETINGS } from '../../constants/creatures.js'
import { tapFeedback, saveFeedback, milestoneFeedback } from '../../utils/haptics.js'
import storage from '../../utils/storage.js'
import { assessNighttimeRisk, computeManiaScore, isNighttimeRiskWindow, getDaysSinceDischarge, POST_DISCHARGE_RISK } from '../../constants/clinicalConfig.js'

// Warm, inviting card data per time of day
const TIME_FLOWS = {
  morning: {
    subtext: "When you're ready:",
    items: [
      { key: 'sleep', label: 'How did you sleep?', emoji: '😴', tab: 'body', sub: 'sleep', color: '#6BA8D6' },
      { key: 'meds', label: 'Morning meds?', emoji: '💊', tab: 'body', sub: 'meds', color: '#6BA89E', quickAction: 'meds' },
      { key: 'energy', label: "How's your energy?", emoji: '⚡', tab: 'body', sub: 'energy', color: '#E8907E' },
      { key: 'window', label: 'Where is your body at?', emoji: '🧠', tab: 'body', sub: 'window', color: '#6BA89E' },
      { key: 'feelings', label: 'What are you feeling?', emoji: '🎭', tab: 'recovery', sub: 'feelings', color: '#E8907E' },
      { key: 'word', label: "Today's word", emoji: '📖', tab: null, sub: 'word', color: '#F0C050' },
    ],
  },
  midday: {
    subtext: "How's the day going?",
    items: [
      { key: 'water', label: 'Had some water?', emoji: '💧', tab: 'body', sub: 'water', color: '#6BA8D6', quickAction: 'water' },
      { key: 'puppies', label: 'Puppy time!', emoji: '🐾', tab: 'puppies', sub: null, color: '#6BBF8A' },
      { key: 'dbt', label: 'Try a skill', emoji: '💚', tab: 'recovery', sub: 'dbt', color: '#6BA89E' },
      { key: 'energy', label: 'Energy check', emoji: '⚡', tab: 'body', sub: 'energy', color: '#E8907E' },
    ],
  },
  evening: {
    subtext: 'Time to wind down.',
    items: [
      { key: 'circles', label: 'How was today?', emoji: '⭕', tab: 'recovery', sub: 'circles', color: '#6BBF8A' },
      { key: 'feelings', label: 'What are you feeling?', emoji: '🎭', tab: 'recovery', sub: 'feelings', color: '#E8907E' },
      { key: 'meds', label: 'Evening meds?', emoji: '💊', tab: 'body', sub: 'meds', color: '#6BA89E', quickAction: 'meds' },
      { key: 'sensory', label: 'Sensory check', emoji: '🧠', tab: 'body', sub: 'sensory', color: '#E8907E' },
      { key: 'dissociation', label: 'Feel present?', emoji: '🌫', tab: 'body', sub: 'dissociation', color: '#6BA8D6' },
      { key: 'bodySelf', label: 'Body-self check', emoji: '💜', tab: 'body', sub: 'bodySelf', color: '#E8907E' },
      { key: 'puppies', label: 'Puppy training', emoji: '🐾', tab: 'puppies', sub: null, color: '#6BBF8A' },
      { key: 'water', label: 'Water count', emoji: '💧', tab: 'body', sub: 'water', color: '#6BA8D6', quickAction: 'water' },
    ],
  },
}

const CELEBRATION_MSGS = [
  name => `You showed up for yourself today. 💚`,
  name => `${name} is so proud of you. ✨`,
  name => `Every check-in is practice. You're getting stronger.`,
  name => `Full day! You are doing so well. 🌟`,
  name => `Look at you. Showing up completely. 🎉`,
]

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

// Smart suggestion — what to do next
function getNextSuggestion(daily, timeOfDay) {
  const flow = TIME_FLOWS[timeOfDay]
  const undone = flow.items.filter(item => !isDone(item.key, daily) && item.tab)
  return undone[0] || null
}

// ─── Word of Day ──────────────────────────────────────────────────────────
function WordOfDay({ daily, onUpdate }) {
  const [showDetail, setShowDetail] = useState(false)
  const [word, setWord] = useState(null)

  useEffect(() => {
    if (daily?.wordOfDay?.word) {
      const found = WORDS.find(w => w.id === daily.wordOfDay.word)
      if (found) { setWord(found); return }
    }
    ;(async () => {
      const seen = (await storage.get('diana-words-seen')) || []
      const unseen = WORDS.filter(w => !seen.includes(w.id))
      const pool = unseen.length > 0 ? unseen : WORDS
      const idx = new Date().toISOString().slice(0, 10).split('-').reduce((a, b) => a + parseInt(b), 0) % pool.length
      setWord(pool[idx])
    })()
  }, [daily?.wordOfDay?.word])

  const learned = daily?.wordOfDay?.learned

  const markLearned = async () => {
    if (!word) return
    const seen = (await storage.get('diana-words-seen')) || []
    if (!seen.includes(word.id)) {
      await storage.set('diana-words-seen', [...seen, word.id])
    }
    onUpdate({ wordOfDay: { word: word.id, learned: true } })
    saveFeedback()
  }

  if (!word) return null

  if (!showDetail) return (
    <div
      onClick={() => { setShowDetail(true); tapFeedback() }}
      style={{
        background: 'var(--card, white)', borderRadius: 20, padding: '16px 18px',
        boxShadow: 'var(--shadow, 0 2px 12px rgba(61,53,53,0.08))', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        border: learned ? '2px solid #6BBF8A' : '2px solid transparent',
        transition: 'transform 0.1s',
      }}
    >
      <div>
        <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-light, #8A7F7F)', letterSpacing: 0.5, marginBottom: 4 }}>WORD OF THE DAY</div>
        <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--text, #3D3535)' }}>{word.word}</div>
        <div style={{ fontSize: 13, color: 'var(--text-light, #8A7F7F)', marginTop: 2, fontWeight: 600 }}>{word.definition.slice(0, 50)}{word.definition.length > 50 ? '...' : ''}</div>
      </div>
      <div style={{ fontSize: learned ? 20 : 16 }}>{learned ? '✅' : '📖'}</div>
    </div>
  )

  return (
    <div style={{ background: 'var(--yellow-bg, #FFF8E1)', borderRadius: 20, padding: '18px', border: '2px solid #F0C050', boxShadow: 'var(--shadow, 0 2px 12px rgba(61,53,53,0.08))' }}>
      <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-light, #8A7F7F)', letterSpacing: 0.5, marginBottom: 8 }}>WORD OF THE DAY</div>
      <div style={{ fontSize: 26, fontWeight: 900, color: 'var(--text, #3D3535)', marginBottom: 8 }}>{word.word}</div>
      <div style={{ fontSize: 15, color: 'var(--text, #3D3535)', fontWeight: 600, marginBottom: 10, lineHeight: 1.5 }}>{word.definition}</div>
      <div style={{ fontSize: 14, color: 'var(--text-light, #8A7F7F)', fontStyle: 'italic', marginBottom: 14, lineHeight: 1.5 }}>"{word.sentence}"</div>
      <div style={{ fontSize: 15, fontWeight: 700, color: '#6BA89E', marginBottom: 14 }}>
        🗣 Say it out loud: <strong>"{word.word}"</strong>
      </div>
      {!learned ? (
        <button
          onClick={markLearned}
          style={{ width: '100%', padding: '14px', borderRadius: 14, border: 'none', background: '#F0C050', color: '#3D3535', fontSize: 15, fontWeight: 800, cursor: 'pointer' }}
        >
          I learned this ✅
        </button>
      ) : (
        <div style={{ textAlign: 'center', fontSize: 15, fontWeight: 800, color: '#6BBF8A' }}>Great job learning this word! ✅</div>
      )}
      <button onClick={() => setShowDetail(false)} style={{ width: '100%', marginTop: 8, padding: '10px', borderRadius: 14, border: 'none', background: 'transparent', color: 'var(--text-light, #8A7F7F)', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
        Close
      </button>
    </div>
  )
}

// ─── Quick-Tap Flow Card ──────────────────────────────────────────────────
function FlowCard({ item, done, onTap, onQuickTap, justCompleted }) {
  const handleTap = () => {
    tapFeedback()
    if (item.quickAction && !done && onQuickTap) {
      onQuickTap(item)
    } else {
      onTap(item)
    }
  }

  return (
    <button
      onClick={handleTap}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '14px 16px', borderRadius: 16,
        background: done ? 'var(--green-bg, #E6F7EC)' : 'var(--card, white)',
        border: `2px solid ${done ? '#6BBF8A' : 'transparent'}`,
        cursor: 'pointer',
        textAlign: 'left',
        width: '100%',
        boxShadow: done ? 'none' : 'var(--shadow, 0 2px 12px rgba(61,53,53,0.08))',
        transition: 'all 0.2s ease',
        animation: justCompleted ? 'card-complete 0.3s ease-out' : 'none',
      }}
    >
      {/* Colored emoji circle */}
      <div style={{
        width: 40, height: 40, borderRadius: 12,
        background: done ? '#E6F7EC' : `${item.color}15`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 20, flexShrink: 0,
      }}>
        {done ? '✅' : item.emoji}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: done ? '#4A9A6A' : 'var(--text, #3D3535)' }}>
          {item.label}
        </div>
        {item.quickAction === 'water' && !done && (
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-light, #8A7F7F)', marginTop: 1 }}>Tap to add a glass</div>
        )}
        {item.quickAction === 'meds' && !done && (
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-light, #8A7F7F)', marginTop: 1 }}>Tap to mark done</div>
        )}
      </div>
      {!done && (
        <span style={{ fontSize: 14, color: 'var(--text-light, #8A7F7F)', fontWeight: 600 }}>›</span>
      )}
    </button>
  )
}

// ─── Main ──────────────────────────────────────────────────────────────────
export default function HomeTab({ profile, daily, onNavigate, onEventMessage, onUpdate, onToast, onCreatureReaction, onMilestone, onOpenCrisis }) {
  const timeOfDay = getTimeOfDay()
  const flow = TIME_FLOWS[timeOfDay]
  const checkInCount = countCheckIns(daily)
  const creatureName = profile?.creatureName || 'Friend'
  const creatureId = profile?.creature || 'puppy'

  const doneCount = ALL_SECTIONS.filter(k => isDone(k, daily)).length
  const allDone = doneCount === ALL_SECTIONS.length

  // Clinical awareness
  const maniaScore = computeManiaScore(daily)
  const nighttimeRisk = isNighttimeRiskWindow() ? assessNighttimeRisk(daily, profile) : null
  const daysOutOfHospital = getDaysSinceDischarge(profile)
  const postDischargeNote = daysOutOfHospital !== null && daysOutOfHospital <= 30
    ? POST_DISCHARGE_RISK.getDailyNote(daysOutOfHospital)
    : null

  const [showMore, setShowMore] = useState(false)
  const [gridExpanded, setGridExpanded] = useState(false)
  const [justCompleted, setJustCompleted] = useState(null)
  const [activeSheet, setActiveSheet] = useState(null)

  // Personality greeting
  const greeting = useMemo(() => {
    const creature = CREATURES.find(c => c.id === creatureId)
    const greetings = CREATURE_GREETINGS[creatureId]?.[timeOfDay]
    if (greetings && creature) {
      const idx = new Date().getDate() % greetings.length
      return greetings[idx](creatureName)
    }
    // Fallback
    const fallbacks = { morning: '☀️ Good morning!', midday: '🌤 Afternoon!', evening: '🌙 Evening time.' }
    return fallbacks[timeOfDay]
  }, [creatureId, creatureName, timeOfDay])

  const celebMsg = useMemo(() => {
    const fn = CELEBRATION_MSGS[Math.floor(Date.now() / 60000) % CELEBRATION_MSGS.length]
    return fn(creatureName)
  }, [creatureName])

  // Show first 4 items by default, rest behind "Show more"
  const visibleItems = showMore ? flow.items : flow.items.slice(0, 4)
  const hasMore = flow.items.length > 4

  // Smart suggestion
  const suggestion = useMemo(() => getNextSuggestion(daily, timeOfDay), [daily, timeOfDay])

  const handleFlowTap = (item) => {
    if (item.tab) {
      onNavigate(item.tab, item.sub)
    }
  }

  // Quick-tap handlers for water and meds
  const handleQuickTap = (item) => {
    if (item.quickAction === 'water') {
      const count = (daily?.water?.count || 0) + 1
      onNavigate('__updateDaily', { water: { count: Math.min(8, count) } })
      onToast?.(`💧 ${Math.min(8, count)}/8 glasses`)
      triggerCompletion(item.key)
    } else if (item.quickAction === 'meds') {
      const hour = new Date().getHours()
      const field = hour < 17 ? 'morning' : 'evening'
      onNavigate('__updateDaily', { meds: { ...(daily?.meds || {}), [field]: true } })
      onToast?.('💊 Meds logged!')
      triggerCompletion(item.key)
    }
  }

  const triggerCompletion = useCallback((key) => {
    setJustCompleted(key)
    saveFeedback()
    setTimeout(() => setJustCompleted(null), 400)

    // Check for milestone
    const prevCount = countCheckIns(daily)
    // We don't have newDaily yet, but we can approximate
    const approxNewCount = prevCount + (isDone(key, daily) ? 0 : 1)
    const milestone = checkMilestone(prevCount, approxNewCount)
    if (milestone) {
      milestoneFeedback()
      onMilestone?.(milestone)
    }

    // Creature reaction
    const reaction = CREATURE_REACTIONS[key]
    if (reaction) {
      onCreatureReaction?.(reaction.animation)
    }
  }, [daily, onMilestone, onCreatureReaction])

  return (
    <div style={{ padding: '0 16px 100px', animation: 'fade-up 0.25s ease-out' }}>

      {/* Progress ring + greeting */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 14,
        background: 'var(--card, white)', borderRadius: 20, padding: '16px 18px', marginBottom: 16,
        boxShadow: 'var(--shadow, 0 2px 12px rgba(61,53,53,0.08))',
      }}>
        <ProgressRing count={doneCount} size={64} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--text, #3D3535)', lineHeight: 1.3, marginBottom: 3 }}>
            {greeting}
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-light, #8A7F7F)' }}>
            {allDone ? 'All done for today! 🌟' : `${doneCount} of ${ALL_SECTIONS.length} done`}
          </div>
        </div>
      </div>

      {/* Post-discharge note — gentle daily reminder during first 30 days */}
      {postDischargeNote && (
        <div style={{
          background: '#E8F1FA', border: '2px solid #6BA8D6', borderRadius: 16,
          padding: '12px 16px', marginBottom: 16,
        }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#3D3535', lineHeight: 1.5 }}>
            {postDischargeNote}
          </div>
        </div>
      )}

      {/* Mania score banner — shown at 6+ */}
      {maniaScore >= 8 && (
        <div style={{
          background: '#FFF8E1', border: '2px solid #F0C050', borderRadius: 16,
          padding: '12px 16px', marginBottom: 16,
        }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#3D3535', lineHeight: 1.5 }}>
            Your sleep has been short but your energy has been high. That pattern sometimes means your mood is shifting. Worth checking in with your team this week. 💛
          </div>
        </div>
      )}
      {maniaScore >= 6 && maniaScore < 8 && (
        <div style={{
          background: '#FFF8E1', border: '2px solid #F0C050', borderRadius: 16,
          padding: '12px 16px', marginBottom: 16,
        }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#3D3535', lineHeight: 1.5 }}>
            Short sleep + good energy can be a sign your mood is shifting a little. Keep an eye on it. 💛
          </div>
        </div>
      )}

      {/* Nighttime check-in card — shown 9pm-4am when risk conditions are met */}
      {nighttimeRisk && (
        <div style={{
          background: '#E8F4F1', border: '2px solid #6BA89E', borderRadius: 16,
          padding: '14px 16px', marginBottom: 16,
        }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#3D3535', marginBottom: 8 }}>
            {nighttimeRisk.message}
          </div>
          {nighttimeRisk.showSafetyPlan && onOpenCrisis && (
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={onOpenCrisis}
                style={{ flex: 1, padding: '10px', borderRadius: 12, border: 'none', background: '#6BA89E', color: 'white', fontSize: 13, fontWeight: 800, cursor: 'pointer' }}
              >
                Safety plan
              </button>
              <button
                onClick={() => onOpenCrisis('coping-skills')}
                style={{ flex: 1, padding: '10px', borderRadius: 12, border: '2px solid #6BA89E', background: '#E8F4F1', color: '#6BA89E', fontSize: 13, fontWeight: 800, cursor: 'pointer' }}
              >
                Coping plan
              </button>
            </div>
          )}
        </div>
      )}

      {/* All done celebration */}
      {allDone && (
        <div style={{
          background: 'var(--green-bg, #E6F7EC)', borderRadius: 20, padding: '16px 18px', marginBottom: 16,
          border: '2px solid #6BBF8A', textAlign: 'center',
          animation: 'milestone-glow 2s ease-in-out 2',
        }}>
          <div style={{ fontSize: 28, marginBottom: 6 }}>🌟</div>
          <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text, #3D3535)', lineHeight: 1.4 }}>{celebMsg}</div>
        </div>
      )}

      {/* Time-of-day flow — warm cards */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-light, #8A7F7F)', marginBottom: 10, paddingLeft: 2 }}>
          {flow.subtext} <span style={{ fontWeight: 600, fontSize: 12 }}>Do what feels right.</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {visibleItems.map(item => (
            <FlowCard
              key={item.key}
              item={item}
              done={isDone(item.key, daily)}
              onTap={handleFlowTap}
              onQuickTap={handleQuickTap}
              justCompleted={justCompleted === item.key}
            />
          ))}
        </div>

        {/* Show more / less */}
        {hasMore && (
          <button
            onClick={() => { setShowMore(!showMore); tapFeedback() }}
            style={{
              width: '100%', padding: '10px', borderRadius: 12, border: 'none',
              background: 'transparent', color: 'var(--primary, #6BA89E)',
              fontSize: 13, fontWeight: 700, cursor: 'pointer', marginTop: 6,
            }}
          >
            {showMore ? 'Show less ↑' : `Show ${flow.items.length - 4} more ↓`}
          </button>
        )}
      </div>

      {/* Smart suggestion — after completing a check-in */}
      {suggestion && doneCount > 0 && !allDone && (
        <button
          onClick={() => { handleFlowTap(suggestion); tapFeedback() }}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 10,
            padding: '12px 16px', borderRadius: 16, marginBottom: 16,
            background: 'var(--primary-light, #E8F4F1)', border: '2px solid var(--primary, #6BA89E)',
            cursor: 'pointer', textAlign: 'left',
          }}
        >
          <span style={{ fontSize: 16 }}>{suggestion.emoji}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary, #6BA89E)' }}>Up next?</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text, #3D3535)' }}>{suggestion.label}</div>
          </div>
          <span style={{ fontSize: 14, color: 'var(--primary, #6BA89E)', fontWeight: 700 }}>→</span>
        </button>
      )}

      {/* Word of the Day */}
      <div style={{ marginBottom: 16 }}>
        <WordOfDay
          daily={daily}
          onUpdate={(patch) => onNavigate('__updateDaily', patch)}
        />
      </div>

      {/* Collapsible status grid */}
      <div style={{
        background: 'var(--card, white)', borderRadius: 20, padding: '14px 18px',
        boxShadow: 'var(--shadow, 0 2px 12px rgba(61,53,53,0.08))', marginBottom: 16,
      }}>
        <button
          onClick={() => { setGridExpanded(!gridExpanded); tapFeedback() }}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-light, #8A7F7F)', letterSpacing: 0.5 }}>ALL CHECK-INS</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-light, #8A7F7F)' }}>{doneCount}/{ALL_SECTIONS.length}</span>
            <span style={{ fontSize: 12, color: 'var(--text-light, #8A7F7F)', transition: 'transform 0.2s', transform: gridExpanded ? 'rotate(180deg)' : 'rotate(0)' }}>▼</span>
          </div>
        </button>

        {gridExpanded && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 12, animation: 'fade-up 0.2s ease-out' }}>
            {[
              { key: 'sleep', label: 'Sleep', emoji: '😴' },
              { key: 'meds', label: 'Meds', emoji: '💊' },
              { key: 'energy', label: 'Energy', emoji: '⚡' },
              { key: 'water', label: 'Water', emoji: '💧' },
              { key: 'circles', label: 'Circles', emoji: '⭕' },
              { key: 'feelings', label: 'Feelings', emoji: '🎭' },
              { key: 'dbt', label: 'DBT', emoji: '💚' },
              { key: 'sensory', label: 'Sensory', emoji: '🧠' },
              { key: 'window', label: 'Window', emoji: '🧠' },
              { key: 'dissociation', label: 'Dissoc.', emoji: '🌫' },
              { key: 'bodySelf', label: 'Body-Self', emoji: '💜' },
              { key: 'puppies', label: 'Puppies', emoji: '🐾' },
              { key: 'word', label: 'Word', emoji: '📖' },
            ].map(s => {
              const done = isDone(s.key, daily)
              return (
                <div
                  key={s.key}
                  style={{
                    background: done ? 'var(--green-bg, #E6F7EC)' : '#F8F4F0',
                    borderRadius: 12, padding: '10px 8px', textAlign: 'center',
                    border: `1.5px solid ${done ? '#6BBF8A' : '#F0E8E0'}`,
                  }}
                >
                  <div style={{ fontSize: 18 }}>{s.emoji}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: done ? '#4A9A6A' : 'var(--text-light, #8A7F7F)', marginTop: 2 }}>{s.label}</div>
                  <div style={{ fontSize: 14, marginTop: 2 }}>{done ? '✅' : '⬜'}</div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
