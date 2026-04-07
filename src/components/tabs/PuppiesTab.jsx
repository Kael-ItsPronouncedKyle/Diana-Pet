import { useState, useMemo } from 'react'
import { PUPPY_DATA } from '../../constants/puppyData.js'
import { today } from '../../utils/dates.js'
import BackToHomeBanner from '../shared/BackToHomeBanner.jsx'

const C = {
  primary: '#6BA89E', primaryLight: '#E8F4F1', accent: '#E8907E',
  text: '#3D3535', textLight: '#8A7F7F', green: '#6BBF8A', greenBg: '#E6F7EC',
  yellow: '#F0C050', yellowBg: '#FFF8E1', card: '#FFFFFF',
}
const card = { background: C.card, borderRadius: 20, padding: '18px', boxShadow: '0 2px 12px rgba(61,53,53,0.08)', marginBottom: 14 }

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

function DogSection({ dog, dogKey, daily, onUpdate, phase }) {
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
  const saveNotes = () => save({ notes })
  const addTrigger = () => {
    if (!newTrigger.what) return
    const next = [...triggers, { ...newTrigger, date: today() }]
    setTriggers(next)
    save({ triggers: next })
    setNewTrigger({ what: '', distance: '', reaction: 3 })
  }

  const save = (patch) => {
    const puppies = { ...(daily?.puppies || {}), [dogKey]: { ...(daily?.puppies?.[dogKey] || {}), ...patch } }
    onUpdate({ puppies })
  }

  const doneCount = skills.filter(s => practised[s.id]).length

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <span style={{ fontSize: 36 }}>{dog.emoji}</span>
        <div>
          <div style={{ fontSize: 20, fontWeight: 900, color: C.text }}>{dog.name}</div>
          <div style={{ fontSize: 12, fontWeight: 600, color: C.textLight, lineHeight: 1.4, maxWidth: 260 }}>{dog.personality}</div>
        </div>
      </div>

      {/* Rotating tip */}
      <div style={{ ...card, background: C.primaryLight, border: `2px solid ${C.primary}` }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: C.primary, marginBottom: 4, letterSpacing: 0.5 }}>TIP</div>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{getTip()}</div>
      </div>

      {/* Skills */}
      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ fontSize: 15, fontWeight: 900, color: C.text }}>Today's skills</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.textLight }}>{doneCount}/{skills.length} done</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {skills.map(skill => (
            <button key={skill.id} onClick={() => toggleSkill(skill.id)} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 14px', borderRadius: 14, border: `2px solid ${practised[skill.id] ? C.green : '#F0E8E0'}`, background: practised[skill.id] ? C.greenBg : 'white', cursor: 'pointer', textAlign: 'left' }}>
              <span style={{ fontSize: 20, marginTop: 2 }}>{practised[skill.id] ? '✅' : '⬜'}</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: C.text }}>{skill.name}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.textLight, marginTop: 2 }}>{skill.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Trainer */}
      <div style={card}>
        <div style={{ fontSize: 14, fontWeight: 800, color: C.text, marginBottom: 10 }}>Who trained today?</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {PUPPY_DATA.trainers.map(t => (
            <button key={t} onClick={() => setTrainer(t)} style={{ flex: 1, padding: '12px 4px', borderRadius: 14, border: `2px solid ${trainer === t ? C.primary : '#F0E8E0'}`, background: trainer === t ? C.primaryLight : 'white', color: trainer === t ? C.primary : C.text, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>{t}</button>
          ))}
        </div>
      </div>

      {/* Trigger log for Apollo */}
      {dogKey === 'apollo' && (
        <div style={card}>
          <div style={{ fontSize: 14, fontWeight: 800, color: C.text, marginBottom: 6 }}>Trigger log (optional)</div>
          <p style={{ fontSize: 12, color: C.textLight, fontWeight: 600, marginBottom: 12 }}>Apollo is scared, not bad. Track what she reacted to.</p>
          <input value={newTrigger.what} onChange={e => setNewTrigger(p => ({ ...p, what: e.target.value }))} placeholder="What was the trigger?" style={{ width: '100%', padding: '10px 12px', borderRadius: 12, border: '2px solid #F0E8E0', fontSize: 14, fontWeight: 600, background: 'white', color: C.text, outline: 'none', boxSizing: 'border-box', marginBottom: 8 }} />
          <input value={newTrigger.distance} onChange={e => setNewTrigger(p => ({ ...p, distance: e.target.value }))} placeholder="How close? (e.g. 10 feet)" style={{ width: '100%', padding: '10px 12px', borderRadius: 12, border: '2px solid #F0E8E0', fontSize: 14, fontWeight: 600, background: 'white', color: C.text, outline: 'none', boxSizing: 'border-box', marginBottom: 8 }} />
          <div style={{ fontSize: 13, fontWeight: 700, color: C.textLight, marginBottom: 6 }}>Reaction level (1=mild, 5=intense)</div>
          <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
            {[1,2,3,4,5].map(n => (
              <button key={n} onClick={() => setNewTrigger(p => ({ ...p, reaction: n }))} style={{ flex: 1, padding: '10px 0', borderRadius: 12, border: 'none', background: newTrigger.reaction === n ? C.accent : '#F0E8E0', color: newTrigger.reaction === n ? 'white' : C.text, fontSize: 16, fontWeight: 800, cursor: 'pointer' }}>{n}</button>
            ))}
          </div>
          <button onClick={addTrigger} style={{ width: '100%', padding: '12px', borderRadius: 14, border: 'none', background: C.accent, color: 'white', fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>Log trigger</button>
          {triggers.slice(-2).map((t, i) => (
            <div key={i} style={{ marginTop: 8, padding: '8px 12px', background: '#FDE8E4', borderRadius: 12, fontSize: 13, fontWeight: 600, color: C.text }}>
              {t.what} · {t.distance} · Reaction: {t.reaction}/5
            </div>
          ))}
        </div>
      )}

      {/* Notes */}
      <div style={card}>
        <div style={{ fontSize: 14, fontWeight: 800, color: C.text, marginBottom: 10 }}>Notes (optional)</div>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="How did it go? Voice-to-text works great here." rows={3} style={{ width: '100%', padding: '12px 14px', borderRadius: 14, border: '2px solid #F0E8E0', fontSize: 14, fontWeight: 600, background: 'white', color: C.text, resize: 'none', outline: 'none', boxSizing: 'border-box', marginBottom: 10 }} />
        <button onClick={saveNotes} style={{ width: '100%', padding: '12px', borderRadius: 14, border: 'none', background: C.primary, color: 'white', fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>Save notes</button>
      </div>
    </div>
  )
}

export default function PuppiesTab({ daily, onUpdate, profile, onProfileUpdate, fromHome, onGoHome }) {
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
      {/* Phase banner */}
      <div style={{ background: C.primaryLight, borderBottom: '1px solid #E8F4F1', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 800, color: C.primary, letterSpacing: 0.5 }}>PHASE {phase}</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{phaseData?.title} · Weeks {phaseData?.weeks}</div>
        </div>
        {canAdvance && (
          <button onClick={advancePhase} style={{ padding: '8px 14px', borderRadius: 14, border: 'none', background: C.primary, color: 'white', fontSize: 13, fontWeight: 800, cursor: 'pointer' }}>
            Move to Phase {phase + 1} →
          </button>
        )}
      </div>

      {/* Dog selector */}
      <div style={{ display: 'flex', gap: 0, background: '#FFF8F3', borderBottom: '1px solid #F0E8E0' }}>
        {['apollo', 'artemis'].map(dk => {
          const dog = PUPPY_DATA.dogs[dk]
          return (
            <button key={dk} onClick={() => setActiveDog(dk)} style={{ flex: 1, padding: '12px 8px', border: 'none', background: activeDog === dk ? 'white' : '#FFF8F3', borderBottom: activeDog === dk ? '3px solid #6BA89E' : '3px solid transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <span style={{ fontSize: 20 }}>{dog.emoji}</span>
              <span style={{ fontSize: 15, fontWeight: 800, color: activeDog === dk ? C.primary : C.textLight }}>{dog.name}</span>
            </button>
          )
        })}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 100px', animation: 'fade-up 0.25s ease-out' }}>
        <BackToHomeBanner show={fromHome && !!(daily?.puppies?.apollo?.skills && Object.keys(daily.puppies.apollo.skills).length > 0)} onGoHome={onGoHome} />
        <DogSection
          dog={PUPPY_DATA.dogs[activeDog]}
          dogKey={activeDog}
          daily={daily}
          onUpdate={onUpdate}
          phase={phase}
        />
      </div>
    </div>
  )
}
