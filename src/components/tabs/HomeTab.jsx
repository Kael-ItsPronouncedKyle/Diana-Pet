import { useMemo, useState, useEffect } from 'react'
import Pet from '../Pet/Pet.jsx'
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
      { key: 'window', label: '🧠 Window of tolerance', tab: 'body', sub: 'window' },
      { key: 'feelings', label: '🎭 Feelings check-in', tab: 'recovery', sub: 'feelings' },
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
      { key: 'feelings', label: '🎭 Feelings check-in', tab: 'recovery', sub: 'feelings' },
      { key: 'meds', label: '💊 Evening meds', tab: 'body', sub: 'meds' },
      { key: 'sensory', label: '🧠 Sensory load check', tab: 'body', sub: 'sensory' },
      { key: 'dissociation', label: '🌫 Dissociation check', tab: 'body', sub: 'dissociation' },
      { key: 'bodySelf', label: '💜 Body-self check', tab: 'body', sub: 'bodySelf' },
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

function WordOfDay({ daily, onUpdate }) {
  const [showDetail, setShowDetail] = useState(false)
  const [word, setWord] = useState(null)

  // Load word using storage utility (not localStorage directly)
  useEffect(() => {
    if (daily?.wordOfDay?.word) {
      const found = WORDS.find(w => w.id === daily.wordOfDay.word)
      if (found) { setWord(found); return }
    }
    // Pick today's word based on date index, using storage utility
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
  }

  // Show nothing while word is loading
  if (!word) return null

  if (!showDetail) return (
    <div
      onClick={() => setShowDetail(true)}
      style={{
        background: 'white', borderRadius: 20, padding: '16px 18px',
        boxShadow: '0 2px 12px rgba(61,53,53,0.08)', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        border: learned ? '2px solid #6BBF8A' : '2px solid transparent',
      }}
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
    <div style={{ background: '#FFF8E1', borderRadius: 20, padding: '18px', border: '2px solid #F0C050', boxShadow: '0 2px 12px rgba(61,53,53,0.08)' }}>
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

export default function HomeTab({ profile, daily, onNavigate, onEventMessage }) {
  const timeOfDay = getTimeOfDay()
  const flow = TIME_FLOWS[timeOfDay]
  const checkInCount = countCheckIns(daily)
  const creatureName = profile?.creatureName || 'Friend'

  const allSections = ['circles', 'feelings', 'sleep', 'meds', 'energy', 'water', 'dbt', 'sensory', 'puppies', 'word', 'window', 'dissociation', 'bodySelf']
  const doneCount = allSections.filter(k => isDone(k, daily)).length
  const allDone = doneCount === allSections.length

  const celebMsg = useMemo(() => {
    const fn = CELEBRATION_MSGS[Math.floor(Date.now() / 60000) % CELEBRATION_MSGS.length]
    return fn(creatureName)
  }, [creatureName])

  const handleFlowTap = (item) => {
    if (item.tab) {
      onNavigate(item.tab, item.sub)
    } else if (item.sub === 'word') {
      // Word of day is shown inline — scroll to it
    }
  }

  const handleUpdate = (patch) => {
    onEventMessage && onEventMessage(null)
    // parent handles actual update
  }

  return (
    <div style={{ padding: '0 16px 100px', animation: 'fade-up 0.25s ease-out' }}>

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
                  cursor: item.tab ? 'pointer' : 'default',
                  textAlign: 'left',
                }}
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
                  background: done ? '#E6F7EC' : '#F8F4F0',
                  borderRadius: 12, padding: '10px 8px', textAlign: 'center',
                  border: `1.5px solid ${done ? '#6BBF8A' : '#F0E8E0'}`,
                }}
              >
                <div style={{ fontSize: 18 }}>{s.emoji}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: done ? '#4A9A6A' : '#8A7F7F', marginTop: 2 }}>{s.label}</div>
                <div style={{ fontSize: 14, marginTop: 2 }}>{done ? '✅' : '⬜'}</div>
              </div>
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
