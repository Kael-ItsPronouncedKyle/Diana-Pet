import { useState, useMemo } from 'react'
import { DBT_SKILLS } from '../../constants/dbt.js'
import { today } from '../../utils/dates.js'
import storage from '../../utils/storage.js'

// ─── Three Circles ─────────────────────────────────────────────────────────

const CIRCLES = [
  { id: 'outer', emoji: '💚', color: '#6BBF8A', bg: '#E6F7EC', border: '#6BBF8A', label: 'Outer Circle', sub: 'Healthy choices. Things that help me heal.', journal: 'What helped you stay here today?' },
  { id: 'middle', emoji: '💛', color: '#F0C050', bg: '#FFF8E1', border: '#F0C050', label: 'Middle Circle', sub: 'Warning signs. Slipping toward old patterns.', journal: 'What did you notice pulling you? No judgment.' },
  { id: 'inner', emoji: '❤️', color: '#E87B7B', bg: '#FDECEC', border: '#E87B7B', label: 'Inner Circle', sub: 'Acted out. But checking in still matters.', journal: "What happened? You don't have to explain everything." },
]

const AFFIRM = {
  inner: "You're still here. That matters. ❤️",
  middle: "You noticed it. That's wisdom.",
  outer: "Green circle day! You're healing. 💚",
}

function ThreeCircles({ daily, onUpdate }) {
  const [journalText, setJournalText] = useState(daily?.circles?.journal || '')
  const [showJournal, setShowJournal] = useState(!!daily?.circles?.choice)
  const selected = daily?.circles?.choice

  const pick = (id) => {
    onUpdate({ circles: { choice: id, journal: journalText, timestamp: Date.now() } })
    setShowJournal(true)
  }

  const saveJournal = () => {
    onUpdate({ circles: { choice: selected, journal: journalText, timestamp: Date.now() } })
  }

  const circle = CIRCLES.find(c => c.id === selected)

  return (
    <div style={{ animation: 'fade-up 0.25s ease-out' }}>
      <p style={{ fontSize: 15, fontWeight: 600, color: '#8A7F7F', marginBottom: 16, lineHeight: 1.5 }}>
        Where are you at today? No wrong answers.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
        {CIRCLES.map(c => (
          <button
            key={c.id}
            onClick={() => pick(c.id)}
            style={{
              padding: '18px 18px', borderRadius: 20,
              background: selected === c.id ? c.bg : 'white',
              border: `3px solid ${selected === c.id ? c.border : '#F0E8E0'}`,
              textAlign: 'left', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 14,
              transition: 'all 0.15s',
            }}
          >
            <span style={{ fontSize: 36 }}>{c.emoji}</span>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#3D3535', marginBottom: 2 }}>{c.label}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#8A7F7F' }}>{c.sub}</div>
            </div>
          </button>
        ))}
      </div>

      {selected && (
        <div style={{ background: circle?.bg, borderRadius: 20, padding: '16px', border: `2px solid ${circle?.border}`, animation: 'fade-up 0.2s ease-out' }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#3D3535', marginBottom: 8 }}>{AFFIRM[selected]}</div>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#8A7F7F', marginBottom: 10 }}>{circle?.journal}</p>
          <textarea
            value={journalText}
            onChange={e => setJournalText(e.target.value)}
            placeholder="You can type, talk, or skip this."
            rows={3}
            style={{
              width: '100%', padding: '12px 14px', borderRadius: 14, border: '2px solid #F0E8E0',
              fontSize: 14, fontWeight: 600, background: 'white', color: '#3D3535',
              resize: 'none', outline: 'none', boxSizing: 'border-box',
            }}
          />
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <button
              onClick={saveJournal}
              style={{ flex: 1, padding: '12px', borderRadius: 14, border: 'none', background: circle?.color, color: 'white', fontSize: 14, fontWeight: 800, cursor: 'pointer' }}
            >
              Save ✓
            </button>
            <button
              onClick={() => onUpdate({ circles: { choice: selected, journal: '', timestamp: Date.now() } })}
              style={{ padding: '12px 16px', borderRadius: 14, border: 'none', background: '#F0E8E0', color: '#8A7F7F', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
            >
              Skip
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── DBT Skill ─────────────────────────────────────────────────────────────

function DbtSkill({ daily, onUpdate }) {
  const skill = useMemo(() => {
    if (daily?.dbt?.skillId) {
      return DBT_SKILLS.find(s => s.id === daily.dbt.skillId) || DBT_SKILLS[0]
    }
    const dayIdx = new Date().toISOString().slice(0, 10).split('-').reduce((a, b) => a + parseInt(b), 0)
    return DBT_SKILLS[dayIdx % DBT_SKILLS.length]
  }, [daily?.dbt?.skillId])

  const practiced = daily?.dbt?.practiced

  const markPracticed = async () => {
    const patch = { dbt: { skillId: skill.id, practiced: true } }
    onUpdate(patch)
    const history = (await storage.get('diana-dbt-history')) || []
    history.push({ date: today(), skillId: skill.id })
    await storage.set('diana-dbt-history', history)
  }

  const CAT_COLORS = {
    'mindfulness': '#6BA89E',
    'distress-tolerance': '#6BA8D6',
    'emotion-regulation': '#E8907E',
    'interpersonal': '#6BBF8A',
  }
  const catColor = CAT_COLORS[skill.category] || '#6BA89E'

  return (
    <div style={{ animation: 'fade-up 0.25s ease-out' }}>
      <div style={{ background: 'white', borderRadius: 20, padding: '20px', boxShadow: '0 2px 12px rgba(61,53,53,0.08)', marginBottom: 12 }}>
        <div style={{ display: 'inline-block', background: catColor + '22', borderRadius: 8, padding: '3px 10px', fontSize: 12, fontWeight: 800, color: catColor, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          {skill.category.replace('-', ' ')}
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 900, color: '#3D3535', marginBottom: 10 }}>{skill.name}</h2>
        <p style={{ fontSize: 15, fontWeight: 600, color: '#8A7F7F', lineHeight: 1.6, marginBottom: 14 }}>{skill.what}</p>
        <div style={{ background: '#F8F4F0', borderRadius: 16, padding: '14px 16px', marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#8A7F7F', marginBottom: 6, letterSpacing: 0.5 }}>TRY IT NOW</div>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#3D3535', lineHeight: 1.6, margin: 0 }}>{skill.practice}</p>
        </div>

        {!practiced ? (
          <button
            onClick={markPracticed}
            style={{ width: '100%', padding: '14px', borderRadius: 14, border: 'none', background: '#6BA89E', color: 'white', fontSize: 15, fontWeight: 800, cursor: 'pointer' }}
          >
            I practiced this ✅
          </button>
        ) : (
          <div style={{ textAlign: 'center', padding: '14px', background: '#E6F7EC', borderRadius: 14, color: '#4A9A6A', fontSize: 15, fontWeight: 800 }}>
            Nice work. That's a real skill you just used. 💪
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Urge Logger ───────────────────────────────────────────────────────────

const CONTEXTS = ['Bored', 'Lonely', 'Stressed', 'Manic energy', 'Triggered by something I saw', "Can't sleep", 'Fighting with someone', "Don't know", 'Other']
const RESPONSES = ['Used a skill', 'Called someone', 'Rode it out', 'Acted out', 'Still in it']

function UrgeLogger({ daily, onUpdate, onOpenCrisis }) {
  const [logging, setLogging] = useState(false)
  const [intensity, setIntensity] = useState(null)
  const [context, setContext] = useState(null)
  const [response, setResponse] = useState(null)
  const [saved, setSaved] = useState(false)

  const urges = daily?.urges || []

  const save = () => {
    const entry = { timestamp: Date.now(), intensity, context, response }
    const next = [...urges, entry]
    onUpdate({ urges: next })
    setSaved(true)
    if (response === 'Still in it') {
      onOpenCrisis()
    }
    setTimeout(() => {
      setLogging(false)
      setSaved(false)
      setIntensity(null)
      setContext(null)
      setResponse(null)
    }, 2000)
  }

  if (!logging) return (
    <div style={{ animation: 'fade-up 0.25s ease-out' }}>
      <button
        onClick={() => setLogging(true)}
        style={{
          width: '100%', padding: '20px', borderRadius: 20,
          background: '#FDECEC', border: '2px solid #E87B7B',
          fontSize: 18, fontWeight: 800, color: '#E87B7B', cursor: 'pointer', marginBottom: 16,
        }}
      >
        I'm having an urge right now
      </button>

      {urges.length > 0 && (
        <div style={{ background: 'white', borderRadius: 20, padding: '16px', boxShadow: '0 2px 12px rgba(61,53,53,0.08)' }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#8A7F7F', marginBottom: 10 }}>TODAY ({urges.length} logged)</div>
          {urges.slice(-3).map((u, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < urges.slice(-3).length - 1 ? '1px solid #F0E8E0' : 'none' }}>
              <div style={{ background: '#FDECEC', borderRadius: 8, padding: '4px 10px', fontSize: 13, fontWeight: 800, color: '#E87B7B' }}>
                {u.intensity}/5
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#8A7F7F' }}>
                {u.context} · {u.response}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  if (saved) return (
    <div style={{ textAlign: 'center', padding: '40px 20px', animation: 'fade-up 0.25s ease-out' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🫶</div>
      <div style={{ fontSize: 18, fontWeight: 800, color: '#3D3535', lineHeight: 1.4 }}>
        You noticed it and came here. That takes courage.
      </div>
    </div>
  )

  return (
    <div style={{ animation: 'fade-up 0.25s ease-out' }}>
      {/* Intensity */}
      <div style={{ background: 'white', borderRadius: 20, padding: '16px', boxShadow: '0 2px 12px rgba(61,53,53,0.08)', marginBottom: 12 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: '#3D3535', marginBottom: 12 }}>How strong is the urge?</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[1, 2, 3, 4, 5].map(n => (
            <button
              key={n}
              onClick={() => setIntensity(n)}
              style={{
                flex: 1, padding: '14px 0', borderRadius: 12, border: 'none',
                background: intensity === n ? '#E87B7B' : '#F8F4F0',
                color: intensity === n ? 'white' : '#3D3535',
                fontSize: 18, fontWeight: 800, cursor: 'pointer',
              }}
            >
              {n}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
          <span style={{ fontSize: 11, color: '#8A7F7F', fontWeight: 600 }}>small pull</span>
          <span style={{ fontSize: 11, color: '#8A7F7F', fontWeight: 600 }}>overwhelming</span>
        </div>
      </div>

      {/* Context */}
      <div style={{ background: 'white', borderRadius: 20, padding: '16px', boxShadow: '0 2px 12px rgba(61,53,53,0.08)', marginBottom: 12 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: '#3D3535', marginBottom: 12 }}>What's happening?</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {CONTEXTS.map(c => (
            <button key={c} onClick={() => setContext(c)} style={{ padding: '8px 14px', borderRadius: 20, border: 'none', background: context === c ? '#6BA89E' : '#F0E8E0', color: context === c ? 'white' : '#3D3535', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Response */}
      <div style={{ background: 'white', borderRadius: 20, padding: '16px', boxShadow: '0 2px 12px rgba(61,53,53,0.08)', marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: '#3D3535', marginBottom: 12 }}>What did you do?</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {RESPONSES.map(r => (
            <button key={r} onClick={() => setResponse(r)} style={{ padding: '12px 14px', borderRadius: 14, border: `2px solid ${response === r ? '#6BA89E' : '#F0E8E0'}`, background: response === r ? '#E8F4F1' : 'white', color: '#3D3535', fontSize: 14, fontWeight: 700, cursor: 'pointer', textAlign: 'left' }}>
              {r}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={() => setLogging(false)} style={{ flex: 1, padding: '14px', borderRadius: 14, border: 'none', background: '#F0E8E0', color: '#8A7F7F', fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>
          Cancel
        </button>
        <button
          onClick={save}
          disabled={!intensity}
          style={{ flex: 2, padding: '14px', borderRadius: 14, border: 'none', background: intensity ? '#6BA89E' : '#E0E0E0', color: 'white', fontSize: 14, fontWeight: 800, cursor: intensity ? 'pointer' : 'not-allowed' }}
        >
          Log it →
        </button>
      </div>
    </div>
  )
}

// ─── Main Tab ──────────────────────────────────────────────────────────────

const SUBS = ['circles', 'dbt', 'urges']
const SUB_LABELS = { circles: '⭕ Circles', dbt: '💚 DBT Skill', urges: '🔴 Urges' }

export default function RecoveryTab({ daily, onUpdate, onOpenCrisis, initialSub }) {
  const [sub, setSub] = useState(initialSub || 'circles')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Sub-tab bar */}
      <div style={{ display: 'flex', gap: 8, padding: '12px 16px', background: '#FFF8F3', borderBottom: '1px solid #F0E8E0' }}>
        {SUBS.map(s => (
          <button key={s} onClick={() => setSub(s)} style={{
            flex: 1, padding: '10px 4px', borderRadius: 14, border: 'none',
            background: sub === s ? '#6BA89E' : '#F0E8E0',
            color: sub === s ? 'white' : '#3D3535',
            fontSize: 13, fontWeight: 800, cursor: 'pointer',
          }}>
            {SUB_LABELS[s]}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 100px' }}>
        {sub === 'circles' && <ThreeCircles daily={daily} onUpdate={onUpdate} />}
        {sub === 'dbt' && <DbtSkill daily={daily} onUpdate={onUpdate} />}
        {sub === 'urges' && <UrgeLogger daily={daily} onUpdate={onUpdate} onOpenCrisis={onOpenCrisis} />}
      </div>
    </div>
  )
}
