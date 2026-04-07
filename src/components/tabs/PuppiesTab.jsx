import { useState, useMemo } from 'react'
import { PUPPY_DATA } from '../../constants/puppyData.js'
import { today } from '../../utils/dates.js'
import BackToHomeBanner from '../shared/BackToHomeBanner.jsx'
import TopNav from '../shared/TopNav.jsx'

const card = { background: 'var(--card)', borderRadius: 20, padding: '20px', boxShadow: '0 2px 8px rgba(61,53,53,0.06)', marginBottom: 16 }

function getDailySkills(phase, dog) {
  const phaseData = PUPPY_DATA.phases.find(p => p.phase === phase)
  if (!phaseData) return []
  const all = [...(phaseData.skills.both || []), ...(phaseData.skills[dog] || [])]
  const subset = phaseData.dailySubset || 8
  // Rotate subset by day of year
  const dayIdx = Math.floor(Date.now() / 86400000)
  const start = (dayIdx * 3) % Math.max(1, all.length - subset)
  return all.slice(start, start + subset)
}

function getTip() {
  const tips = PUPPY_DATA.rotatingTips
  const idx = Math.floor(Date.now() / 3600000) % tips.length
  return tips[idx]
}

function DogSection({ dog, dogKey, daily, onUpdate, onToast, phase }) {
  const skills = useMemo(() => getDailySkills(phase, dogKey), [phase, dogKey])
  const dogData = daily?.puppies?.[dogKey] || {}
  const practised = dogData.skills || {}
  const trainer = dogData.trainer || null
  const [notes, setNotes] = useState(dogData.notes || '')
  const [triggers, setTriggers] = useState(dogData.triggers || [])
  const [newTrigger, setNewTrigger] = useState({ what: '', distance: '', reaction: 3 })

  const toggleSkill = (id) => {
    const next = { ...practised, [id]: !practised[id] }
    save({ skills: next })
  }
  const setTrainer = (t) => save({ trainer: t })
  const saveNotes = async () => { await save({ notes }); onToast?.('🐾 Notes saved!') }
  const addTrigger = () => {
    if (!newTrigger.what) return
    const next = [...triggers, { ...newTrigger, date: today() }]
    setTriggers(next)
    save({ triggers: next })
    setNewTrigger({ what: '', distance: '', reaction: 3 })
  }

  const save = async (patch) => {
    const puppies = { ...(daily?.puppies || {}), [dogKey]: { ...(daily?.puppies?.[dogKey] || {}), ...patch } }
    return onUpdate({ puppies })
  }

  const doneCount = skills.filter(s => practised[s.id]).length

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <span style={{ fontSize: 36 }}>{dog.emoji}</span>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)' }}>{dog.name}</div>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-light)', lineHeight: 1.4, maxWidth: 260 }}>{dog.personality}</div>
        </div>
      </div>

      {/* Rotating tip */}
      <div style={{ ...card, background: 'var(--primary-light)', border: `2px solid var(--primary)` }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--primary)', marginBottom: 4, letterSpacing: 0.5 }}>TIP</div>
        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', lineHeight: 1.5 }}>{getTip()}</div>
      </div>

      {/* Skills summary */}
      <div style={{ ...card }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-light)', marginBottom: 12 }}>{doneCount} of {skills.length} skills practiced today 🐾</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {skills.map(skill => {
            const isDone = practised[skill.id]
            return (
              <button
                key={skill.id}
                onClick={() => toggleSkill(skill.id)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  padding: '12px 14px',
                  borderRadius: 16,
                  border: isDone ? `2px solid var(--green)` : '2px solid #F0E8E0',
                  background: isDone ? 'var(--green-bg)' : 'white',
                  cursor: 'pointer',
                  textAlign: 'left',
                  minHeight: 48
                }}
              >
                <span style={{ fontSize: 20, marginTop: 2, flexShrink: 0 }}>
                  {isDone ? '✅' : '⭕'}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text)' }}>{skill.name}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-light)', marginTop: 2 }}>{skill.desc}</div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Trainer */}
      <div style={card}>
        <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', marginBottom: 12 }}>Who trained today?</div>
        <div style={{ display: 'flex', gap: 10 }}>
          {PUPPY_DATA.trainers.map(t => (
            <button
              key={t}
              onClick={() => setTrainer(t)}
              style={{
                flex: 1,
                padding: '12px 0',
                borderRadius: 16,
                border: trainer === t ? `2px solid var(--primary)` : '2px solid #F0E8E0',
                background: trainer === t ? 'var(--primary-light)' : 'white',
                color: trainer === t ? 'var(--primary)' : 'var(--text)',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                minHeight: 48,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Trigger log for Apollo */}
      {dogKey === 'apollo' && (
        <div style={card}>
          <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>Trigger log (optional)</div>
          <p style={{ fontSize: 12, color: 'var(--text-light)', fontWeight: 600, marginBottom: 14, lineHeight: 1.5 }}>Apollo is scared, not bad. What did she react to?</p>
          <input
            value={newTrigger.what}
            onChange={e => setNewTrigger(p => ({ ...p, what: e.target.value }))}
            placeholder="What was the trigger?"
            style={{ width: '100%', padding: '12px 14px', borderRadius: 14, border: '2px solid #F0E8E0', fontSize: 14, fontWeight: 600, background: 'white', color: 'var(--text)', outline: 'none', boxSizing: 'border-box', marginBottom: 10 }}
          />
          <input
            value={newTrigger.distance}
            onChange={e => setNewTrigger(p => ({ ...p, distance: e.target.value }))}
            placeholder="How close? (e.g. 10 feet)"
            style={{ width: '100%', padding: '12px 14px', borderRadius: 14, border: '2px solid #F0E8E0', fontSize: 14, fontWeight: 600, background: 'white', color: 'var(--text)', outline: 'none', boxSizing: 'border-box', marginBottom: 10 }}
          />
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-light)', marginBottom: 8 }}>How intense? (1=mild, 5=intense)</div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            {[1,2,3,4,5].map(n => (
              <button
                key={n}
                onClick={() => setNewTrigger(p => ({ ...p, reaction: n }))}
                style={{
                  flex: 1,
                  padding: '12px 0',
                  borderRadius: 14,
                  border: 'none',
                  background: newTrigger.reaction === n ? 'var(--accent)' : '#F0E8E0',
                  color: newTrigger.reaction === n ? 'white' : 'var(--text)',
                  fontSize: 16,
                  fontWeight: 800,
                  cursor: 'pointer',
                  minHeight: 48
                }}
              >
                {n}
              </button>
            ))}
          </div>
          <button
            onClick={addTrigger}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: 16,
              border: 'none',
              background: 'var(--accent)',
              color: 'white',
              fontSize: 14,
              fontWeight: 800,
              cursor: 'pointer',
              minHeight: 48
            }}
          >
            Log trigger
          </button>
          {triggers.slice(-2).map((t, i) => (
            <div
              key={i}
              style={{
                marginTop: 10,
                padding: '12px 14px',
                background: 'var(--accent-light)',
                borderRadius: 12,
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--text)'
              }}
            >
              {t.what} · {t.distance} · Reaction: {t.reaction}/5
            </div>
          ))}
        </div>
      )}

      {/* Notes */}
      <div style={card}>
        <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', marginBottom: 12 }}>Notes (optional)</div>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="How did it go? Voice-to-text works great here."
          rows={3}
          style={{
            width: '100%',
            padding: '12px 14px',
            borderRadius: 14,
            border: '2px solid #F0E8E0',
            fontSize: 14,
            fontWeight: 600,
            background: 'white',
            color: 'var(--text)',
            resize: 'none',
            outline: 'none',
            boxSizing: 'border-box',
            marginBottom: 12,
            fontFamily: 'Nunito, sans-serif'
          }}
        />
        <button
          onClick={saveNotes}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: 16,
            border: 'none',
            background: 'var(--primary)',
            color: 'white',
            fontSize: 14,
            fontWeight: 800,
            cursor: 'pointer',
            minHeight: 48
          }}
        >
          Save notes
        </button>
      </div>
    </div>
  )
}

export default function PuppiesTab({ daily, onUpdate, profile, onProfileUpdate, onToast, fromHome, onGoHome }) {
  const [activeDog, setActiveDog] = useState('apollo')
  const phase = profile?.puppyPhase || 1
  const phaseData = PUPPY_DATA.phases.find(p => p.phase === phase)

  const phaseStartDate = profile?.puppyPhaseStartDate ? new Date(profile.puppyPhaseStartDate) : new Date()
  const weeksInPhase = Math.floor((Date.now() - phaseStartDate.getTime()) / (7 * 86400000))
  const canAdvance = phase < 3 && weeksInPhase >= (phaseData?.minimumWeeks || 4)

  const advancePhase = () => {
    if (canAdvance && onProfileUpdate) {
      onProfileUpdate({ puppyPhase: phase + 1, puppyPhaseStartDate: today() })
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '12px 16px' }}>
        <TopNav onGoHome={onGoHome} />
      </div>

      {/* Phase banner — softer card style */}
      <div style={{ padding: '16px 20px', margin: '0 16px 16px' }}>
        <div style={{
          background: 'var(--primary-light)',
          borderRadius: 16,
          padding: '16px',
          border: '1px solid #D6EEEB'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--primary)', letterSpacing: 0.5, marginBottom: 4 }}>PHASE {phase}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>{phaseData?.title}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-light)', marginTop: 4 }}>Weeks: {phaseData?.weeks}</div>
            </div>
            {canAdvance && (
              <button
                onClick={advancePhase}
                style={{
                  padding: '12px 16px',
                  borderRadius: 14,
                  border: 'none',
                  background: 'var(--primary)',
                  color: 'white',
                  fontSize: 13,
                  fontWeight: 800,
                  cursor: 'pointer',
                  minHeight: 48,
                  whiteSpace: 'nowrap'
                }}
              >
                Next phase
              </button>
            )}
          </div>
          {/* Phase progress dots */}
          <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
            {[1, 2, 3].map(p => (
              <div
                key={p}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: p <= phase ? 'var(--primary)' : '#D6EEEB'
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Dog selector — two large card buttons */}
      <div style={{ padding: '0 20px 16px', display: 'flex', gap: 12 }}>
        {['apollo', 'artemis'].map(dk => {
          const dog = PUPPY_DATA.dogs[dk]
          const dogData = daily?.puppies?.[dk] || {}
          const practised = dogData.skills || {}
          const doneCount = Object.values(practised).filter(Boolean).length
          return (
            <button
              key={dk}
              onClick={() => setActiveDog(dk)}
              style={{
                flex: 1,
                padding: '16px',
                borderRadius: 16,
                border: activeDog === dk ? `2px solid var(--primary)` : '2px solid #F0E8E0',
                background: activeDog === dk ? 'var(--primary-light)' : 'white',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
                minHeight: 80,
                justifyContent: 'center'
              }}
            >
              <span style={{ fontSize: 28 }}>{dog.emoji}</span>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)' }}>{dog.name}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-light)', marginTop: 2 }}>
                  {doneCount > 0 ? `${doneCount} today ✨` : 'Not started'}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 100px', animation: 'fade-up 0.25s ease-out' }}>
        <BackToHomeBanner show={fromHome && Object.keys(daily?.puppies?.[activeDog]?.skills || {}).length > 0} onGoHome={onGoHome} />
        <DogSection
          dog={PUPPY_DATA.dogs[activeDog]}
          dogKey={activeDog}
          daily={daily}
          onUpdate={onUpdate}
          onToast={onToast}
          phase={phase}
        />
      </div>
    </div>
  )
}
