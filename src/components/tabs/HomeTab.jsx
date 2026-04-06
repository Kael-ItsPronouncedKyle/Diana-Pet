import { useMemo, useState, useRef, useEffect } from 'react'
import { getTimeOfDay } from '../../utils/dates.js'
import { countCheckIns } from '../../utils/checkIns.js'
import { WORDS } from '../../constants/words.js'
import storage from '../../utils/storage.js'
import { today } from '../../utils/dates.js'

const TIME_FLOWS = {
  morning: {
    greeting: '☀️ Good morning!',
    subtext: "Here's what's next:",
    items: [
      { key: 'sleep', label: '😴 Sleep check-in', tab: 'body', sub: 'sleep' },
      { key: 'meds', label: '💊 Morning meds', tab: 'body', sub: 'meds' },
      { key: 'energy', label: '⚡ Energy level', tab: 'body', sub: 'energy' },
      { key: 'word', label: '📖 Word of the Day', tab: null, sub: 'word' },
    ],
  },
  midday: {
    greeting: '🌤 Afternoon check-in:',
    subtext: "How's the day going?",
    items: [
      { key: 'water', label: '💧 Water check', tab: 'body', sub: 'water' },
      { key: 'puppies', label: '🐾 Puppy training', tab: 'puppies', sub: null },
      { key: 'dbt', label: '💚 DBT skill of the day', tab: 'recovery', sub: 'dbt' },
      { key: 'energy', label: '⚡ Energy/pain update', tab: 'body', sub: 'energy' },
    ],
  },
  evening: {
    greeting: '🌙 Evening wind-down:',
    subtext: 'How did today go?',
    items: [
      { key: 'circles', label: '⭕ Three Circles check-in', tab: 'recovery', sub: 'circles' },
      { key: 'meds', label: '💊 Evening meds', tab: 'body', sub: 'meds' },
      { key: 'sensory', label: '🧠 Sensory load check', tab: 'body', sub: 'sensory' },
      { key: 'puppies', label: '🐾 Puppy training', tab: 'puppies', sub: null },
      { key: 'water', label: '💧 Water count', tab: 'body', sub: 'water' },
    ],
  },
}

const CELEBRATION_MSGS = [
  name => `You showed up for yourself today. That's everything. 💚`,
  name => `${name} is so proud of you. ✨`,
  name => `Every check-in is practice. You're getting stronger.`,
  name => `Full day! You are doing so well. 🌟`,
  name => `Look at you. Showing up completely. 🎉`,
]

// Affirmations shown on the idle home screen (no check-ins yet)
const IDLE_AFFIRMATIONS = [
  "Recovery isn't a straight line. Showing up is enough. 💚",
  "You don't have to feel better to start. Just open the app. ✨",
  "A hard day with full check-ins counts the same. Always.",
  "Your brain works differently. That's not a flaw. 🌟",
  "Rest is part of healing — not the absence of it. 💙",
  "You've gotten through 100% of your hard days so far.",
  "Small steps still move you forward. Every single one.",
  "Being here matters. Even for five minutes. 🫶",
  "You're allowed to need things. That's not weakness.",
  "Every check-in is an act of self-care. It counts.",
  "Kael and Luis are proud of you. Even on hard days. 💕",
  "The puppies need you. And you show up for them. 🐾",
]

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
  return false
}

function WordOfDay({ daily, onUpdate, wordRef }) {
  const [showDetail, setShowDetail] = useState(false)

  const word = useMemo(() => {
    if (daily?.wordOfDay?.word) {
      const found = WORDS.find(w => w.id === daily.wordOfDay.word)
      if (found) return found
    }
    // Pick today's word based on date index — use storage-aware fallback
    const idx = new Date().toISOString().slice(0, 10).split('-').reduce((a, b) => a + parseInt(b), 0) % WORDS.length
    return WORDS[idx]
  }, [daily?.wordOfDay?.word])

  const learned = daily?.wordOfDay?.learned

  const markLearned = async () => {
    // Track seen words via window.storage instead of localStorage
    let seen = []
    try {
      seen = (await storage.get('diana-words-seen')) || []
    } catch { seen = [] }
    if (!seen.includes(word.id)) {
      await storage.set('diana-words-seen', [...seen, word.id])
    }
    onUpdate({ wordOfDay: { word: word.id, learned: true } })
  }

  if (!showDetail) return (
    <div
      ref={wordRef}
      onClick={() => setShowDetail(true)}
      style={{
        background: 'white', borderRadius: 20, padding: '16px 18px',
        boxShadow: '0 2px 12px rgba(61,53,53,0.08)', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        border: learned ? '2px solid #6BBF8A' : '2px solid transparent',
        transition: 'transform 0.12s',
      }}
      onTouchStart={e => e.currentTarget.style.transform = 'scale(0.97)'}
      onTouchEnd={e => e.currentTarget.style.transform = 'scale(1)'}
    >
      <div>
        <div style={{ fontSize: 11, fontWeight: 800, color: '#8A7F7F', letterSpacing: 0.5, marginBottom: 4 }}>WORD OF THE DAY</div>
        <div style={{ fontSize: 20, fontWeight: 900, color: '#3D3535' }}>{word.word}</div>
        <div style={{ fontSize: 13, color: '#8A7F7F', marginTop: 2, fontWeight: 600 }}>{word.definition.slice(0, 50)}{word.definition.length > 50 ? '...' : ''}</div>
      </div>
      <div style={{ fontSize: learned ? 20 : 16 }}>{learned ? '✅' : '📖'}</div>
    </div>
  )

  return (
    <div ref={wordRef} style={{ background: '#FFF8E1', borderRadius: 20, padding: '18px', border: '2px solid #F0C050', boxShadow: '0 2px 12px rgba(61,53,53,0.08)' }}>
      <div style={{ fontSize: 11, fontWeight: 800, color: '#8A7F7F', letterSpacing: 0.5, marginBottom: 8 }}>WORD OF THE DAY</div>
      <div style={{ fontSize: 26, fontWeight: 900, color: '#3D3535', marginBottom: 8 }}>{word.word}</div>
      <div style={{ fontSize: 15, color: '#3D3535', fontWeight: 600, marginBottom: 10, lineHeight: 1.5 }}>{word.definition}</div>
      <div style={{ fontSize: 14, color: '#8A7F7F', fontStyle: 'italic', marginBottom: 14, lineHeight: 1.5 }}>"{word.sentence}"</div>
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
      <button onClick={() => setShowDetail(false)} style={{ width: '100%', marginTop: 8, padding: '10px', borderRadius: 14, border: 'none', background: 'transparent', color: '#8A7F7F', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
        Close
      </button>
    </div>
  )
}

// ─── Today at a Glance bar ────────────────────────────────────────────────────
function GlanceBar({ daily, onNavigate }) {
  const sleepH = daily?.sleep?.hours
  const medsOk = daily?.meds?.morning === true || daily?.meds?.evening === true
  const waterCount = daily?.water?.count || 0
  const puppySkills = daily?.puppies?.apollo?.skills ? Object.values(daily.puppies.apollo.skills).filter(Boolean).length : 0
  const circleChoice = daily?.circles?.choice

  const circleColors = { outer: '#6BBF8A', middle: '#F0C050', inner: '#E87B7B' }
  const circleColor = circleChoice ? circleColors[circleChoice] : '#D0C8C0'

  const items = [
    { emoji: '💤', value: sleepH ? `${sleepH}h` : '—', done: !!sleepH, tab: 'body', sub: 'sleep', tip: 'Sleep' },
    { emoji: '💊', value: medsOk ? '✅' : '—', done: medsOk, tab: 'body', sub: 'meds', tip: 'Meds' },
    { emoji: '💧', value: waterCount > 0 ? `${waterCount}/8` : '—', done: waterCount >= 8, tab: 'body', sub: 'water', tip: 'Water' },
    { emoji: '🐾', value: puppySkills > 0 ? `${puppySkills}✓` : '—', done: puppySkills > 0, tab: 'puppies', sub: null, tip: 'Puppies' },
  ]
  if (circleChoice) {
    items.unshift({ emoji: '⭕', value: circleChoice === 'outer' ? '💚' : circleChoice === 'middle' ? '💛' : '❤️', done: true, tab: 'recovery', sub: 'circles', tip: 'Circles', dotColor: circleColor })
  }

  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 14, padding: '0 2px' }}>
      {items.map((item, i) => (
        <button
          key={i}
          onClick={() => item.tab && onNavigate(item.tab, item.sub)}
          style={{
            flex: 1, background: item.done ? 'white' : '#F8F4F0',
            borderRadius: 14, padding: '8px 4px', border: `1.5px solid ${item.done ? '#E8F4F1' : '#F0E8E0'}`,
            cursor: item.tab ? 'pointer' : 'default', textAlign: 'center',
            boxShadow: item.done ? '0 1px 6px rgba(61,53,53,0.06)' : 'none',
            transition: 'transform 0.1s',
          }}
          onTouchStart={e => item.tab && (e.currentTarget.style.transform = 'scale(0.94)')}
          onTouchEnd={e => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <div style={{ fontSize: 16 }}>{item.emoji}</div>
          <div style={{ fontSize: 11, fontWeight: 800, color: item.done ? '#3D3535' : '#8A7F7F', marginTop: 2 }}>{item.value}</div>
        </button>
      ))}
    </div>
  )
}

export default function HomeTab({ profile, daily, onNavigate, onEventMessage }) {
  const timeOfDay = getTimeOfDay()
  const flow = TIME_FLOWS[timeOfDay]
  const checkInCount = countCheckIns(daily)
  const creatureName = profile?.creatureName || 'Friend'
  const wordRef = useRef(null)
  const scrollRef = useRef(null)

  const allSections = ['circles', 'sleep', 'meds', 'energy', 'water', 'dbt', 'sensory', 'puppies', 'word']
  const doneCount = allSections.filter(k => isDone(k, daily)).length
  const allDone = doneCount === allSections.length

  // Rotating idle affirmation — cycles every 10 minutes
  const idleAffirmation = useMemo(() => {
    const idx = Math.floor(Date.now() / 600000) % IDLE_AFFIRMATIONS.length
    return IDLE_AFFIRMATIONS[idx]
  }, [])

  const celebMsg = useMemo(() => {
    const fn = CELEBRATION_MSGS[Math.floor(Date.now() / 60000) % CELEBRATION_MSGS.length]
    return fn(creatureName)
  }, [creatureName])

  const handleFlowTap = (item) => {
    if (item.tab) {
      onNavigate(item.tab, item.sub)
    } else if (item.sub === 'word') {
      // Scroll to word card and expand it
      if (wordRef.current) {
        wordRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
        // Trigger a click to expand after scroll
        setTimeout(() => wordRef.current?.click(), 300)
      }
    }
  }

  return (
    <div ref={scrollRef} style={{ padding: '0 16px 100px', animation: 'fade-up 0.25s ease-out' }}>

      {/* Today at a Glance — only show once at least one check-in is done */}
      {checkInCount > 0 && (
        <GlanceBar daily={daily} onNavigate={onNavigate} />
      )}

      {/* Time-of-day flow prompt */}
      <div style={{ background: 'white', borderRadius: 20, padding: '16px 18px', marginBottom: 16, boxShadow: '0 2px 12px rgba(61,53,53,0.08)' }}>
        <div style={{ fontSize: 18, fontWeight: 900, color: '#3D3535', marginBottom: 2 }}>{flow.greeting}</div>
        <div style={{ fontSize: 14, color: '#8A7F7F', fontWeight: 600, marginBottom: 14 }}>{flow.subtext}</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {flow.items.map(item => {
            const done = isDone(item.key, daily)
            return (
              <button
                key={item.key}
                onClick={() => handleFlowTap(item)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '12px 14px', borderRadius: 14,
                  background: done ? '#E6F7EC' : '#F8F4F0',
                  border: `2px solid ${done ? '#6BBF8A' : 'transparent'}`,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'transform 0.1s',
                }}
                onTouchStart={e => e.currentTarget.style.transform = 'scale(0.97)'}
                onTouchEnd={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                <span style={{ fontSize: 18 }}>{done ? '✅' : '⬜'}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: done ? '#4A9A6A' : '#3D3535' }}>
                  {item.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Idle affirmation — show when no check-ins yet */}
      {doneCount === 0 && (
        <div style={{
          background: 'white', borderRadius: 20, padding: '16px 18px', marginBottom: 16,
          boxShadow: '0 2px 12px rgba(61,53,53,0.08)',
          border: '2px solid #E8F4F1',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>🌱</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#3D3535', lineHeight: 1.5 }}>
            {idleAffirmation}
          </div>
        </div>
      )}

      {/* All done celebration */}
      {allDone && (
        <div style={{ background: '#E6F7EC', borderRadius: 20, padding: '16px 18px', marginBottom: 16, border: '2px solid #6BBF8A', textAlign: 'center' }}>
          <div style={{ fontSize: 28, marginBottom: 6 }}>🌟</div>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#3D3535', lineHeight: 1.4 }}>{celebMsg}</div>
        </div>
      )}

      {/* Word of the Day */}
      <div style={{ marginBottom: 16 }}>
        <WordOfDay
          daily={daily}
          onUpdate={(patch) => onNavigate('__updateDaily', patch)}
          wordRef={wordRef}
        />
      </div>

      {/* Today's full status */}
      <div style={{ background: 'white', borderRadius: 20, padding: '16px 18px', boxShadow: '0 2px 12px rgba(61,53,53,0.08)', marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: '#8A7F7F', marginBottom: 12, letterSpacing: 0.5 }}>TODAY'S CHECK-INS</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          {[
            { key: 'sleep', label: 'Sleep', emoji: '😴' },
            { key: 'meds', label: 'Meds', emoji: '💊' },
            { key: 'energy', label: 'Energy', emoji: '⚡' },
            { key: 'water', label: 'Water', emoji: '💧' },
            { key: 'circles', label: 'Circles', emoji: '⭕' },
            { key: 'dbt', label: 'DBT', emoji: '💚' },
            { key: 'sensory', label: 'Sensory', emoji: '🧠' },
            { key: 'puppies', label: 'Puppies', emoji: '🐾' },
            { key: 'word', label: 'Word', emoji: '📖' },
          ].map(s => {
            const done = isDone(s.key, daily)
            return (
              <button
                key={s.key}
                onClick={() => {
                  const flowItem = Object.values(TIME_FLOWS).flatMap(f => f.items).find(i => i.key === s.key)
                  if (flowItem?.tab) onNavigate(flowItem.tab, flowItem.sub)
                  else if (s.key === 'word') wordRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                }}
                style={{
                  background: done ? '#E6F7EC' : '#F8F4F0',
                  borderRadius: 12, padding: '10px 8px', textAlign: 'center',
                  border: `1.5px solid ${done ? '#6BBF8A' : '#F0E8E0'}`,
                  cursor: 'pointer',
                  transition: 'transform 0.1s',
                }}
                onTouchStart={e => e.currentTarget.style.transform = 'scale(0.94)'}
                onTouchEnd={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                <div style={{ fontSize: 18 }}>{s.emoji}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: done ? '#4A9A6A' : '#8A7F7F', marginTop: 2 }}>{s.label}</div>
                <div style={{ fontSize: 14, marginTop: 2 }}>{done ? '✅' : '⬜'}</div>
              </button>
            )
          })}
        </div>
        <div style={{ marginTop: 10, textAlign: 'center', fontSize: 13, fontWeight: 700, color: '#8A7F7F' }}>
          {doneCount} of {allSections.length} done
        </div>
      </div>
    </div>
  )
}
