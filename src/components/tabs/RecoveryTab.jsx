import { useState, useMemo } from 'react'
import { DBT_SKILLS } from '../../constants/dbt.js'
import { EMOTION_QUADRANTS } from '../../constants/emotions.js'
import { CONTEXT_SKILL_MAP } from '../../constants/skillMap.js'
import { today } from '../../utils/dates.js'
import storage from '../../utils/storage.js'
import BackToHomeBanner from '../shared/BackToHomeBanner.jsx'
import TopNav from '../shared/TopNav.jsx'
import { HARM_REDUCTION_MESSAGES, detectsCoreSchema, CORE_SCHEMA_RESPONSE } from '../../constants/clinicalConfig.js'
import ConnectionSection from '../checkins/ConnectionSection.jsx'

// ─── Emotion Wheel (T1-01) ───────────────────────────────────────────────────

function EmotionWheel({ daily, onUpdate, fromHome, onGoHome }) {
  const [expandedQuadrant, setExpandedQuadrant] = useState(null)
  const [selected, setSelected] = useState(daily?.emotions || [])
  const [emotionContext, setEmotionContext] = useState(daily?.emotionContext || '')
  const [saved, setSaved] = useState(!!(daily?.emotions?.length))
  const [showContext, setShowContext] = useState(false)

  const toggleEmotion = (id) => {
    setSelected(prev => {
      if (prev.includes(id)) return prev.filter(e => e !== id)
      if (prev.length >= 3) return prev // max 3
      return [...prev, id]
    })
  }

  const allEmotions = EMOTION_QUADRANTS.flatMap(q => q.emotions)

  const save = () => {
    onUpdate({ emotions: selected, emotionContext: emotionContext.trim() })
    setSaved(true)
  }

  if (saved && selected.length > 0) {
    return (
      <div style={{ animation: 'fade-up 0.25s ease-out' }}>
        <BackToHomeBanner show={fromHome} onGoHome={onGoHome} />
        <div style={{ background: '#E8F4F1', borderRadius: 20, padding: '20px', border: '2px solid #6BA89E', textAlign: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>💚</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#3D3535', marginBottom: 12 }}>
            You named what you feel. That takes real strength.
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 8 }}>
            {selected.map(id => {
              const em = allEmotions.find(e => e.id === id)
              if (!em) return null
              const q = EMOTION_QUADRANTS.find(qu => qu.emotions.some(e => e.id === id))
              return (
                <span key={id} style={{ padding: '6px 14px', borderRadius: 20, background: q?.bg || '#F0E8E0', color: q?.color || '#3D3535', fontSize: 14, fontWeight: 700 }}>
                  {em.label}
                </span>
              )
            })}
          </div>
          {/* T2-01: Emotion Vocabulary Builder */}
          {selected.map(id => {
            const em = allEmotions.find(e => e.id === id)
            if (!em) return null
            return (
              <div key={`vocab-${id}`} style={{ textAlign: 'left', background: 'white', borderRadius: 14, padding: '12px 14px', marginTop: 8 }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#3D3535', marginBottom: 4 }}>{em.label}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#8A7F7F', lineHeight: 1.4, marginBottom: 6 }}>{em.def}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#6BA89E', fontStyle: 'italic' }}>
                  Say it: "I feel {em.label.toLowerCase()}."
                </div>
              </div>
            )
          })}
          {/* Emotion count tracker */}
          <div style={{ marginTop: 12, fontSize: 12, fontWeight: 700, color: '#6BA89E' }}>
            You've named {selected.length} feeling{selected.length !== 1 ? 's' : ''} today. Your emotional vocabulary is growing.
          </div>
        </div>
        <button
          onClick={() => setSaved(false)}
          style={{ width: '100%', padding: '14px', borderRadius: 14, border: 'none', background: '#F0E8E0', color: '#8A7F7F', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
        >
          Change my answer
        </button>
      </div>
    )
  }

  if (showContext) {
    return (
      <div style={{ animation: 'fade-up 0.25s ease-out' }}>
        <div style={{ background: 'white', borderRadius: 20, padding: '18px', boxShadow: '0 2px 12px rgba(61,53,53,0.08)', marginBottom: 12 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#3D3535', marginBottom: 6 }}>What started this feeling?</div>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#8A7F7F', marginBottom: 12 }}>You can type, talk, or skip this.</p>
          <textarea
            value={emotionContext}
            onChange={e => setEmotionContext(e.target.value)}
            placeholder="Something happened, or maybe nothing specific..."
            rows={3}
            style={{
              width: '100%', padding: '12px 14px', borderRadius: 14, border: '2px solid #F0E8E0',
              fontSize: 14, fontWeight: 600, background: 'white', color: '#3D3535',
              resize: 'none', outline: 'none', boxSizing: 'border-box',
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={save} style={{ flex: 2, padding: '14px', borderRadius: 14, border: 'none', background: '#6BA89E', color: 'white', fontSize: 15, fontWeight: 800, cursor: 'pointer' }}>
            Save
          </button>
          <button onClick={() => { setEmotionContext(''); save() }} style={{ flex: 1, padding: '14px', borderRadius: 14, border: 'none', background: '#F0E8E0', color: '#8A7F7F', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
            Skip
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ animation: 'fade-up 0.25s ease-out' }}>
      <p style={{ fontSize: 15, fontWeight: 600, color: '#8A7F7F', marginBottom: 16, lineHeight: 1.5 }}>
        What are you feeling right now? Pick up to 3.
      </p>

      {/* Quadrant grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
        {EMOTION_QUADRANTS.map(q => (
          <button
            key={q.id}
            onClick={() => setExpandedQuadrant(expandedQuadrant === q.id ? null : q.id)}
            style={{
              padding: '16px 12px', borderRadius: 16,
              background: expandedQuadrant === q.id ? q.bg : 'white',
              border: `3px solid ${expandedQuadrant === q.id ? q.color : '#F0E8E0'}`,
              cursor: 'pointer', textAlign: 'center',
              boxShadow: '0 2px 12px rgba(61,53,53,0.06)',
              transition: 'all 0.15s',
            }}
          >
            <div style={{ fontSize: 24, marginBottom: 4 }}>{q.emoji}</div>
            <div style={{ fontSize: 12, fontWeight: 800, color: q.color, lineHeight: 1.3 }}>{q.label}</div>
          </button>
        ))}
      </div>

      {/* Expanded quadrant emotions */}
      {expandedQuadrant && (() => {
        const q = EMOTION_QUADRANTS.find(qu => qu.id === expandedQuadrant)
        if (!q) return null
        return (
          <div style={{ background: q.bg, borderRadius: 20, padding: '16px', border: `2px solid ${q.color}`, marginBottom: 16, animation: 'fade-up 0.2s ease-out' }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: q.color, marginBottom: 10 }}>{q.emoji} {q.label}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {q.emotions.map(em => {
                const isSelected = selected.includes(em.id)
                const canSelect = isSelected || selected.length < 3
                return (
                  <button
                    key={em.id}
                    onClick={() => canSelect && toggleEmotion(em.id)}
                    style={{
                      padding: '10px 16px', borderRadius: 20,
                      background: isSelected ? q.color : 'white',
                      color: isSelected ? 'white' : '#3D3535',
                      border: `2px solid ${isSelected ? q.color : '#F0E8E0'}`,
                      fontSize: 14, fontWeight: 700, cursor: canSelect ? 'pointer' : 'default',
                      opacity: canSelect ? 1 : 0.5,
                      minHeight: 44,
                    }}
                  >
                    {em.label}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })()}

      {/* Selected emotions + definitions */}
      {selected.length > 0 && (
        <div style={{ background: 'white', borderRadius: 20, padding: '16px', boxShadow: '0 2px 12px rgba(61,53,53,0.08)', marginBottom: 16, animation: 'fade-up 0.2s ease-out' }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#8A7F7F', marginBottom: 10 }}>YOU PICKED:</div>
          {selected.map(id => {
            const em = allEmotions.find(e => e.id === id)
            if (!em) return null
            const q = EMOTION_QUADRANTS.find(qu => qu.emotions.some(e => e.id === id))
            return (
              <div key={id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 0', borderBottom: '1px solid #F0E8E0' }}>
                <span style={{ fontSize: 16, fontWeight: 800, color: q?.color || '#3D3535', minWidth: 90 }}>{em.label}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#8A7F7F', lineHeight: 1.4 }}>{em.def}</span>
              </div>
            )
          })}
        </div>
      )}

      {/* Next button */}
      {selected.length > 0 && (
        <button
          onClick={() => setShowContext(true)}
          style={{ width: '100%', padding: '14px', borderRadius: 14, border: 'none', background: '#6BA89E', color: 'white', fontSize: 15, fontWeight: 800, cursor: 'pointer' }}
        >
          Next
        </button>
      )}
    </div>
  )
}

// ─── Three Circles + Secrecy Test (T1-06) ─────────────────────────────────────

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

function ThreeCircles({ daily, onUpdate, onOpenCrisis, fromHome, onGoHome }) {
  const [journalText, setJournalText] = useState(daily?.circles?.journal || '')
  const [showJournal, setShowJournal] = useState(!!daily?.circles?.choice)
  const [secrecyAnswer, setSecrecyAnswer] = useState(daily?.secrecyTest ?? null)
  const [showSecrecyTest, setShowSecrecyTest] = useState(false)
  const selected = daily?.circles?.choice

  const needsSecrecyTest = selected === 'middle' || selected === 'inner'

  const pick = (id) => {
    onUpdate({ circles: { choice: id, journal: journalText, timestamp: Date.now() } })
    setShowJournal(true)
  }

  const saveJournal = () => {
    onUpdate({ circles: { choice: selected, journal: journalText, timestamp: Date.now() } })
    if (needsSecrecyTest && secrecyAnswer === null) {
      setShowSecrecyTest(true)
    }
  }

  const skipJournal = () => {
    onUpdate({ circles: { choice: selected, journal: '', timestamp: Date.now() } })
    if (needsSecrecyTest && secrecyAnswer === null) {
      setShowSecrecyTest(true)
    }
  }

  const answerSecrecy = (answer) => {
    setSecrecyAnswer(answer)
    onUpdate({ secrecyTest: answer })
  }

  const circle = CIRCLES.find(c => c.id === selected)

  const circlesDone = selected && (!needsSecrecyTest || secrecyAnswer !== null)

  return (
    <div style={{ animation: 'fade-up 0.25s ease-out' }}>
      <BackToHomeBanner show={circlesDone && fromHome} onGoHome={onGoHome} />
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
        <div style={{ background: circle?.bg, borderRadius: 20, padding: '16px', border: `2px solid ${circle?.border}`, animation: 'fade-up 0.2s ease-out', marginBottom: 16 }}>
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
              onClick={skipJournal}
              style={{ padding: '12px 16px', borderRadius: 14, border: 'none', background: '#F0E8E0', color: '#8A7F7F', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
            >
              Skip
            </button>
          </div>
        </div>
      )}

      {/* Secrecy Test — T1-06 */}
      {needsSecrecyTest && showSecrecyTest && secrecyAnswer === null && (
        <div style={{ background: '#FFF8E1', borderRadius: 20, padding: '18px', border: '2px solid #F0C050', animation: 'fade-up 0.2s ease-out', marginBottom: 16 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#3D3535', marginBottom: 12, lineHeight: 1.4 }}>
            Would you be okay showing today's check-in to Luis?
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => answerSecrecy(true)}
              style={{ flex: 1, padding: '14px', borderRadius: 14, border: 'none', background: '#6BBF8A', color: 'white', fontSize: 15, fontWeight: 800, cursor: 'pointer', minHeight: 48 }}
            >
              Yes
            </button>
            <button
              onClick={() => answerSecrecy(false)}
              style={{ flex: 1, padding: '14px', borderRadius: 14, border: 'none', background: '#E87B7B', color: 'white', fontSize: 15, fontWeight: 800, cursor: 'pointer', minHeight: 48 }}
            >
              No
            </button>
          </div>
        </div>
      )}

      {secrecyAnswer === true && (
        <div style={{ background: '#E6F7EC', borderRadius: 20, padding: '16px', border: '2px solid #6BBF8A', animation: 'fade-up 0.2s ease-out', marginBottom: 16 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#3D3535' }}>
            Good. Openness is part of healing. 💚
          </div>
        </div>
      )}

      {secrecyAnswer === false && (
        <div style={{ background: '#FDE8E4', borderRadius: 20, padding: '18px', border: '2px solid #E8907E', animation: 'fade-up 0.2s ease-out', marginBottom: 16 }}>
          {/* Harm reduction message comes FIRST — before abstinence framing */}
          {selected === 'inner' && (
            <div style={{ fontSize: 15, fontWeight: 700, color: '#3D3535', lineHeight: 1.5, marginBottom: 12 }}>
              {HARM_REDUCTION_MESSAGES[Math.floor(Date.now() / 60000) % HARM_REDUCTION_MESSAGES.length]}
            </div>
          )}
          <div style={{ fontSize: 15, fontWeight: 700, color: '#3D3535', lineHeight: 1.5, marginBottom: 12 }}>
            Secrets are where addiction lives. You don't have to tell Luis right now — but tell someone. Your safety plan has people who can help.
          </div>
          <button
            onClick={onOpenCrisis}
            style={{ width: '100%', padding: '14px', borderRadius: 14, border: 'none', background: '#E8907E', color: 'white', fontSize: 15, fontWeight: 800, cursor: 'pointer' }}
          >
            Open my safety plan
          </button>
        </div>
      )}
    </div>
  )
}

// ─── DBT Skill ─────────────────────────────────────────────────────────────

function DbtSkill({ daily, onUpdate, fromHome, onGoHome }) {
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

  // T1-14: Skill effectiveness tracking
  const rateSkill = async (effective) => {
    onUpdate({ dbt: { ...daily?.dbt, effective } })
    // Update profile skill effectiveness stats
    const history = (await storage.get('diana-dbt-history')) || []
    const last = history[history.length - 1]
    if (last) last.effective = effective
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
      <BackToHomeBanner show={practiced && fromHome} onGoHome={onGoHome} />
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
          <div>
            <div style={{ textAlign: 'center', padding: '14px', background: '#E6F7EC', borderRadius: 14, color: '#4A9A6A', fontSize: 15, fontWeight: 800, marginBottom: 12 }}>
              Nice work. That's a real skill you just used. 💪
            </div>
            {/* T1-14: Skill Effectiveness */}
            {daily?.dbt?.effective === undefined && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#8A7F7F', marginBottom: 8 }}>Did it help?</div>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                  <button onClick={() => rateSkill(true)} style={{ padding: '12px 24px', borderRadius: 14, border: '2px solid #6BBF8A', background: '#E6F7EC', color: '#4A9A6A', fontSize: 18, fontWeight: 800, cursor: 'pointer', minHeight: 44 }}>👍 Yes</button>
                  <button onClick={() => rateSkill(false)} style={{ padding: '12px 24px', borderRadius: 14, border: '2px solid #E87B7B', background: '#FDECEC', color: '#E87B7B', fontSize: 18, fontWeight: 800, cursor: 'pointer', minHeight: 44 }}>👎 Not really</button>
                </div>
              </div>
            )}
            {daily?.dbt?.effective !== undefined && (
              <div style={{ textAlign: 'center', fontSize: 13, fontWeight: 700, color: '#8A7F7F' }}>
                {daily.dbt.effective ? 'Glad it helped! We\'ll remember that. 💚' : 'That\'s okay. Not every skill fits every day. 💙'}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Skill Recommendation Card ────────────────────────────────────────────

function SkillCard({ skill, isExpanded, onToggle, onUse }) {
  const CAT_COLORS = {
    'mindfulness': '#6BA89E',
    'distress-tolerance': '#6BA8D6',
    'emotion-regulation': '#E8907E',
    'interpersonal': '#6BBF8A',
  }
  const catColor = CAT_COLORS[skill.category] || '#6BA89E'

  return (
    <div
      style={{
        background: 'white', borderRadius: 16, padding: isExpanded ? '16px' : '12px 16px',
        border: `2px solid ${isExpanded ? catColor : '#F0E8E0'}`,
        cursor: 'pointer', transition: 'all 0.15s',
      }}
    >
      <div onClick={onToggle} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ display: 'inline-block', background: catColor + '22', borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 800, color: catColor, textTransform: 'uppercase', letterSpacing: 0.3, flexShrink: 0 }}>
          {skill.category.replace('-', ' ')}
        </div>
        <div style={{ fontSize: 14, fontWeight: 800, color: '#3D3535', flex: 1 }}>{skill.name}</div>
        <span style={{ fontSize: 14, color: '#8A7F7F' }}>{isExpanded ? '▲' : '▼'}</span>
      </div>
      {isExpanded && (
        <div style={{ marginTop: 12, animation: 'fade-up 0.15s ease-out' }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: '#8A7F7F', lineHeight: 1.5, marginBottom: 10 }}>{skill.what}</p>
          <div style={{ background: '#F8F4F0', borderRadius: 12, padding: '12px 14px', marginBottom: 12 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#3D3535', lineHeight: 1.5, margin: 0 }}>{skill.practice}</p>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onUse(skill.id) }}
            style={{ width: '100%', padding: '12px', borderRadius: 12, border: 'none', background: catColor, color: 'white', fontSize: 14, fontWeight: 800, cursor: 'pointer' }}
          >
            I'll try this ✅
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Urge Logger + Skill Recommendations (T1-07) ─────────────────────────

const CONTEXTS = ['Bored', 'Lonely', 'Stressed', 'Manic energy', 'Triggered by something I saw', "Can't sleep", 'Fighting with someone', "Don't know", 'Other']
const RESPONSES = ['Used a skill', 'Called someone', 'Rode it out', 'Acted out', 'Still in it']

function UrgeLogger({ daily, onUpdate, onOpenCrisis, fromHome, onGoHome }) {
  const [logging, setLogging] = useState(false)
  const [intensity, setIntensity] = useState(null)
  const [context, setContext] = useState(null)
  const [response, setResponse] = useState(null)
  const [skillUsed, setSkillUsed] = useState(null)
  const [expandedSkill, setExpandedSkill] = useState(null)
  const [saved, setSaved] = useState(false)

  const urges = daily?.urges || []

  // Get recommended skills for current context
  const recommendedSkills = useMemo(() => {
    if (!context) return []
    const skillIds = CONTEXT_SKILL_MAP[context] || []
    return skillIds.map(id => DBT_SKILLS.find(s => s.id === id)).filter(Boolean)
  }, [context])

  const handleUseSkill = (skillId) => {
    setSkillUsed(skillId)
    if (!response) setResponse('Used a skill')
  }

  const save = () => {
    const entry = { timestamp: Date.now(), intensity, context, response, skillUsed }
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
      setSkillUsed(null)
      setExpandedSkill(null)
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
              <div style={{ fontSize: 13, fontWeight: 600, color: '#8A7F7F', flex: 1 }}>
                {u.context} · {u.response}
              </div>
              {u.skillUsed && (
                <div style={{ background: '#E8F4F1', borderRadius: 8, padding: '4px 8px', fontSize: 11, fontWeight: 700, color: '#6BA89E' }}>
                  skill used
                </div>
              )}
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

      {/* Skill Recommendations — T1-07 */}
      {context && recommendedSkills.length > 0 && (
        <div style={{ background: '#E8F4F1', borderRadius: 20, padding: '16px', border: '2px solid #6BA89E', marginBottom: 12, animation: 'fade-up 0.2s ease-out' }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#6BA89E', marginBottom: 12 }}>
            Skills that can help right now:
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
            {recommendedSkills.map(skill => (
              <SkillCard
                key={skill.id}
                skill={skill}
                isExpanded={expandedSkill === skill.id}
                onToggle={() => setExpandedSkill(expandedSkill === skill.id ? null : skill.id)}
                onUse={handleUseSkill}
              />
            ))}
          </div>
          {skillUsed && (
            <div style={{ textAlign: 'center', fontSize: 14, fontWeight: 800, color: '#6BA89E', padding: '8px 0' }}>
              Great choice. You've got this. 💚
            </div>
          )}
          <button
            onClick={onOpenCrisis}
            style={{ width: '100%', padding: '12px', borderRadius: 14, border: '2px solid #6BA89E', background: 'white', color: '#6BA89E', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
          >
            Open my safety plan
          </button>
        </div>
      )}

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
          Log it
        </button>
      </div>
    </div>
  )
}

// ─── Chain Analysis (T1-02) ─────────────────────────────────────────────────

const VULNERABILITY_FACTORS = [
  "Didn't sleep well", 'Skipped meds', 'Fight with Luis', 'Lonely', 'Bored',
  'Pain', 'Sensory overload', 'Felt disconnected', 'Hormonal', 'Skipped meals', 'Other',
]
const CONSEQUENCES = [
  'Felt worse', 'Felt numb', 'Felt relieved then guilty', 'Hid it',
  'Told someone', 'Used a skill', 'Went to sleep', 'Other',
]

function ChainAnalysis({ daily, onUpdate, fromHome, onGoHome }) {
  const [step, setStep] = useState(0)
  const [vulnerability, setVulnerability] = useState([])
  const [promptingEvent, setPromptingEvent] = useState('')
  const [emotions, setEmotions] = useState([])
  const [thoughts, setThoughts] = useState('')
  const [consequences, setConsequences] = useState([])
  const [secrecy, setSecrecy] = useState(null)
  const [saved, setSaved] = useState(false)

  const toggleItem = (list, setList, item) => {
    setList(prev => prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item])
  }

  const toggleEmotion = (id) => {
    setEmotions(prev => {
      if (prev.includes(id)) return prev.filter(e => e !== id)
      if (prev.length >= 3) return prev
      return [...prev, id]
    })
  }

  const allEmotions = EMOTION_QUADRANTS.flatMap(q => q.emotions)

  const save = () => {
    const entry = {
      timestamp: Date.now(),
      vulnerability,
      promptingEvent: promptingEvent.trim(),
      emotions,
      thoughts: thoughts.trim(),
      consequences,
      secrecy,
    }
    const chains = [...(daily?.chains || []), entry]
    onUpdate({ chains })
    setSaved(true)
  }

  const existingChains = daily?.chains || []

  const schemaDetected = detectsCoreSchema(thoughts) || detectsCoreSchema(promptingEvent)

  if (saved) {
    return (
      <div style={{ animation: 'fade-up 0.25s ease-out' }}>
        <BackToHomeBanner show={fromHome} onGoHome={onGoHome} />
        {schemaDetected ? (
          <div style={{ background: '#E8F4F1', borderRadius: 20, padding: '24px 20px', border: '2px solid #6BA89E', textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>💙</div>
            <div style={{ fontSize: 17, fontWeight: 800, color: '#3D3535', lineHeight: 1.5, marginBottom: 12 }}>
              {CORE_SCHEMA_RESPONSE}
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#8A7F7F', lineHeight: 1.5 }}>
              You still did the hard work of looking at what happened. That took real courage.
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>💚</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#3D3535', lineHeight: 1.4 }}>
              You just looked at what happened — honestly. That takes real courage.
            </div>
          </div>
        )}
      </div>
    )
  }

  // Show start prompt if no chain in progress
  if (step === 0 && !saved) {
    return (
      <div style={{ animation: 'fade-up 0.25s ease-out' }}>
        <div style={{ background: 'white', borderRadius: 20, padding: '20px', boxShadow: '0 2px 12px rgba(61,53,53,0.08)', marginBottom: 16 }}>
          <div style={{ fontSize: 18, fontWeight: 900, color: '#3D3535', marginBottom: 8 }}>Chain Analysis</div>
          <p style={{ fontSize: 14, fontWeight: 600, color: '#8A7F7F', lineHeight: 1.5, marginBottom: 16 }}>
            This helps you understand what led up to a behavior — not to blame yourself, but to learn. We'll go step by step.
          </p>
          <button
            onClick={() => setStep(1)}
            style={{ width: '100%', padding: '16px', borderRadius: 14, border: 'none', background: '#6BA89E', color: 'white', fontSize: 16, fontWeight: 800, cursor: 'pointer' }}
          >
            Start a chain analysis
          </button>
        </div>

        {existingChains.length > 0 && (
          <div style={{ background: 'white', borderRadius: 20, padding: '16px', boxShadow: '0 2px 12px rgba(61,53,53,0.08)' }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#8A7F7F', marginBottom: 10 }}>PAST CHAINS ({existingChains.length})</div>
            {existingChains.slice(-3).map((c, i) => (
              <div key={i} style={{ padding: '10px 0', borderBottom: i < existingChains.slice(-3).length - 1 ? '1px solid #F0E8E0' : 'none' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#3D3535' }}>
                  {c.vulnerability?.slice(0, 2).join(', ')} {c.vulnerability?.length > 2 ? `+${c.vulnerability.length - 2} more` : ''}
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#8A7F7F', marginTop: 2 }}>
                  {c.consequences?.join(', ')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  const chipStyle = (active, color = '#6BA89E') => ({
    padding: '10px 16px', borderRadius: 20, border: 'none',
    background: active ? color : '#F0E8E0',
    color: active ? 'white' : '#3D3535',
    fontSize: 13, fontWeight: 700, cursor: 'pointer',
  })

  const nextBtn = (disabled = false) => (
    <button
      onClick={() => setStep(s => s + 1)}
      disabled={disabled}
      style={{
        width: '100%', padding: '14px', borderRadius: 14, border: 'none',
        background: disabled ? '#E0E0E0' : '#6BA89E', color: 'white',
        fontSize: 15, fontWeight: 800, cursor: disabled ? 'not-allowed' : 'pointer', marginTop: 16,
      }}
    >
      Next →
    </button>
  )

  const stepCard = (title, stepNum, totalSteps, content) => (
    <div style={{ animation: 'fade-up 0.25s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: '#8A7F7F' }}>STEP {stepNum} OF {totalSteps}</div>
        <button onClick={() => setStep(s => s - 1)} style={{ padding: '4px 10px', borderRadius: 8, border: 'none', background: '#F0E8E0', color: '#8A7F7F', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>← Back</button>
      </div>
      <div style={{ background: 'white', borderRadius: 20, padding: '18px', boxShadow: '0 2px 12px rgba(61,53,53,0.08)' }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: '#3D3535', marginBottom: 14 }}>{title}</div>
        {content}
      </div>
    </div>
  )

  const totalSteps = 6

  if (step === 1) return stepCard('What made you more vulnerable?', 1, totalSteps, (
    <>
      <p style={{ fontSize: 13, fontWeight: 600, color: '#8A7F7F', marginBottom: 12, lineHeight: 1.4 }}>
        Pick anything that was going on before it happened.
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {VULNERABILITY_FACTORS.map(v => (
          <button key={v} onClick={() => toggleItem(vulnerability, setVulnerability, v)} style={chipStyle(vulnerability.includes(v))}>
            {v}
          </button>
        ))}
      </div>
      {nextBtn(vulnerability.length === 0)}
    </>
  ))

  if (step === 2) return stepCard('What started it?', 2, totalSteps, (
    <>
      <p style={{ fontSize: 13, fontWeight: 600, color: '#8A7F7F', marginBottom: 12, lineHeight: 1.4 }}>
        What happened right before? You can type or use voice-to-text.
      </p>
      <textarea
        value={promptingEvent}
        onChange={e => setPromptingEvent(e.target.value)}
        placeholder="Something happened, or maybe nothing specific..."
        rows={3}
        style={{
          width: '100%', padding: '12px 14px', borderRadius: 14, border: '2px solid #F0E8E0',
          fontSize: 14, fontWeight: 600, background: 'white', color: '#3D3535',
          resize: 'none', outline: 'none', boxSizing: 'border-box',
        }}
      />
      <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
        <button onClick={() => setStep(s => s + 1)} style={{ flex: 2, padding: '14px', borderRadius: 14, border: 'none', background: '#6BA89E', color: 'white', fontSize: 15, fontWeight: 800, cursor: 'pointer' }}>
          Next →
        </button>
        <button onClick={() => { setPromptingEvent(''); setStep(s => s + 1) }} style={{ flex: 1, padding: '14px', borderRadius: 14, border: 'none', background: '#F0E8E0', color: '#8A7F7F', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
          Skip
        </button>
      </div>
    </>
  ))

  if (step === 3) return stepCard('What were you feeling?', 3, totalSteps, (
    <>
      <p style={{ fontSize: 13, fontWeight: 600, color: '#8A7F7F', marginBottom: 12, lineHeight: 1.4 }}>
        Pick up to 3 emotions.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 8 }}>
        {EMOTION_QUADRANTS.map(q => (
          <div key={q.id}>
            <div style={{ fontSize: 12, fontWeight: 800, color: q.color, marginBottom: 6 }}>{q.emoji} {q.label}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
              {q.emotions.map(em => {
                const isSelected = emotions.includes(em.id)
                const canSelect = isSelected || emotions.length < 3
                return (
                  <button key={em.id} onClick={() => canSelect && toggleEmotion(em.id)} style={{
                    padding: '8px 14px', borderRadius: 16,
                    background: isSelected ? q.color : '#F8F4F0',
                    color: isSelected ? 'white' : '#3D3535',
                    border: 'none', fontSize: 13, fontWeight: 700,
                    cursor: canSelect ? 'pointer' : 'default', opacity: canSelect ? 1 : 0.5,
                  }}>
                    {em.label}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
      {nextBtn(emotions.length === 0)}
    </>
  ))

  if (step === 4) return stepCard('What thoughts were going through your mind?', 4, totalSteps, (
    <>
      <p style={{ fontSize: 13, fontWeight: 600, color: '#8A7F7F', marginBottom: 12, lineHeight: 1.4 }}>
        What was your brain telling you? This is optional.
      </p>
      <textarea
        value={thoughts}
        onChange={e => setThoughts(e.target.value)}
        placeholder="I was thinking..."
        rows={3}
        style={{
          width: '100%', padding: '12px 14px', borderRadius: 14, border: '2px solid #F0E8E0',
          fontSize: 14, fontWeight: 600, background: 'white', color: '#3D3535',
          resize: 'none', outline: 'none', boxSizing: 'border-box',
        }}
      />
      <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
        <button onClick={() => setStep(s => s + 1)} style={{ flex: 2, padding: '14px', borderRadius: 14, border: 'none', background: '#6BA89E', color: 'white', fontSize: 15, fontWeight: 800, cursor: 'pointer' }}>
          Next →
        </button>
        <button onClick={() => { setThoughts(''); setStep(s => s + 1) }} style={{ flex: 1, padding: '14px', borderRadius: 14, border: 'none', background: '#F0E8E0', color: '#8A7F7F', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
          Skip
        </button>
      </div>
    </>
  ))

  if (step === 5) return stepCard('What happened after?', 5, totalSteps, (
    <>
      <p style={{ fontSize: 13, fontWeight: 600, color: '#8A7F7F', marginBottom: 12, lineHeight: 1.4 }}>
        Pick anything that describes what came next.
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {CONSEQUENCES.map(c => (
          <button key={c} onClick={() => toggleItem(consequences, setConsequences, c)} style={chipStyle(consequences.includes(c))}>
            {c}
          </button>
        ))}
      </div>
      {nextBtn(consequences.length === 0)}
    </>
  ))

  if (step === 6) return stepCard('Would you show this to Luis?', 6, totalSteps, (
    <>
      <p style={{ fontSize: 13, fontWeight: 600, color: '#8A7F7F', marginBottom: 16, lineHeight: 1.4 }}>
        This isn't about right or wrong. It's about noticing secrecy.
      </p>
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <button onClick={() => setSecrecy(true)} style={{
          flex: 1, padding: '16px', borderRadius: 14, border: `2px solid ${secrecy === true ? '#6BBF8A' : '#F0E8E0'}`,
          background: secrecy === true ? '#E6F7EC' : 'white', color: '#3D3535',
          fontSize: 16, fontWeight: 800, cursor: 'pointer',
        }}>
          Yes
        </button>
        <button onClick={() => setSecrecy(false)} style={{
          flex: 1, padding: '16px', borderRadius: 14, border: `2px solid ${secrecy === false ? '#E87B7B' : '#F0E8E0'}`,
          background: secrecy === false ? '#FDECEC' : 'white', color: '#3D3535',
          fontSize: 16, fontWeight: 800, cursor: 'pointer',
        }}>
          No
        </button>
      </div>
      {secrecy === false && (
        <div style={{ background: '#FDE8E4', borderRadius: 14, padding: '14px 16px', border: '2px solid #E8907E', marginBottom: 16 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#3D3535', lineHeight: 1.5, margin: 0 }}>
            Secrets are where addiction lives. You don't have to share right now — but noticing the urge to hide is important.
          </p>
        </div>
      )}
      {secrecy === true && (
        <div style={{ background: '#E6F7EC', borderRadius: 14, padding: '14px 16px', border: '2px solid #6BBF8A', marginBottom: 16 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#3D3535', lineHeight: 1.5, margin: 0 }}>
            Openness is part of healing. That's courage. 💚
          </p>
        </div>
      )}
      <button
        onClick={save}
        disabled={secrecy === null}
        style={{
          width: '100%', padding: '14px', borderRadius: 14, border: 'none',
          background: secrecy !== null ? '#6BA89E' : '#E0E0E0', color: 'white',
          fontSize: 15, fontWeight: 800, cursor: secrecy !== null ? 'pointer' : 'not-allowed',
        }}
      >
        Save chain analysis ✓
      </button>
    </>
  ))

  return null
}

// ─── 24-Hour Urge Reflection (T1-13) ────────────────────────────────────────

const REFLECTION_FEELINGS = [
  { v: 'proud', emoji: '💚', label: 'Proud of myself' },
  { v: 'mixed', emoji: '💛', label: 'Mixed feelings' },
  { v: 'wish_different', emoji: '🧡', label: "I wish I'd done something different" },
  { v: 'struggling', emoji: '❤️', label: 'Still struggling' },
]

function UrgeReflection({ daily, onUpdate, onOpenCrisis }) {
  const [feeling, setFeeling] = useState(daily?.urgeReflection?.feeling || null)
  const [whatDifferently, setWhatDifferently] = useState(daily?.urgeReflection?.whatDifferently || '')
  const [saved, setSaved] = useState(!!daily?.urgeReflection?.feeling)

  // Check if there's an urge from ~24h ago (20-28h window)
  const urgeToReflect = useMemo(() => {
    const urges = daily?.urges || []
    // Also check yesterday's data — but we only have today's daily
    // So check urges from earlier today that are old enough, or rely on timestamps
    const now = Date.now()
    return urges.find(u => {
      const age = now - u.timestamp
      const hours = age / (1000 * 60 * 60)
      return hours >= 20 && hours <= 28
    })
  }, [daily?.urges])

  if (!urgeToReflect || saved) return null

  const save = () => {
    onUpdate({ urgeReflection: { forUrgeTimestamp: urgeToReflect.timestamp, feeling, whatDifferently: whatDifferently.trim() } })
    setSaved(true)
    if (feeling === 'struggling') onOpenCrisis()
  }

  return (
    <div style={{ background: '#FFF8E1', borderRadius: 20, padding: '18px', border: '2px solid #F0C050', marginBottom: 16, animation: 'fade-up 0.2s ease-out' }}>
      <div style={{ fontSize: 15, fontWeight: 800, color: '#3D3535', marginBottom: 6 }}>Looking back on yesterday's urge...</div>
      <p style={{ fontSize: 13, fontWeight: 600, color: '#8A7F7F', marginBottom: 14, lineHeight: 1.4 }}>
        You logged an urge about 24 hours ago. How are you feeling about it now?
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
        {REFLECTION_FEELINGS.map(f => (
          <button key={f.v} onClick={() => setFeeling(f.v)} style={{
            padding: '12px 16px', borderRadius: 14,
            border: `2px solid ${feeling === f.v ? '#F0C050' : '#F0E8E0'}`,
            background: feeling === f.v ? '#FFF8E1' : 'white',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left',
          }}>
            <span style={{ fontSize: 20 }}>{f.emoji}</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#3D3535' }}>{f.label}</span>
          </button>
        ))}
      </div>

      {feeling === 'wish_different' && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#8A7F7F', marginBottom: 6 }}>What would you do differently? (optional)</div>
          <textarea
            value={whatDifferently}
            onChange={e => setWhatDifferently(e.target.value)}
            placeholder="Next time I could..."
            rows={2}
            style={{
              width: '100%', padding: '12px 14px', borderRadius: 14, border: '2px solid #F0E8E0',
              fontSize: 14, fontWeight: 600, background: 'white', color: '#3D3535',
              resize: 'none', outline: 'none', boxSizing: 'border-box',
            }}
          />
        </div>
      )}

      {feeling === 'struggling' && (
        <div style={{ background: '#FDE8E4', borderRadius: 14, padding: '12px 16px', border: '2px solid #E8907E', marginBottom: 14 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#3D3535', lineHeight: 1.5, margin: 0 }}>
            You're not alone in this. Your safety plan and coping plan are here for you. 💙
          </p>
        </div>
      )}

      <button
        onClick={save}
        disabled={!feeling}
        style={{
          width: '100%', padding: '12px', borderRadius: 14, border: 'none',
          background: feeling ? '#F0C050' : '#E0E0E0', color: feeling ? '#3D3535' : 'white',
          fontSize: 14, fontWeight: 800, cursor: feeling ? 'pointer' : 'not-allowed',
        }}
      >
        Save reflection ✓
      </button>
    </div>
  )
}

// ─── Main Tab ──────────────────────────────────────────────────────────────

const SUBS = ['circles', 'feelings', 'dbt', 'urges', 'chain', 'connection']
const SUB_LABELS = { circles: '⭕ Circles', feelings: '🎭 Feelings', dbt: '💚 DBT', urges: '🔴 Urges', chain: '🔗 Chain', connection: '💜 Connect' }

export default function RecoveryTab({ daily, onUpdate, onOpenCrisis, initialSub, fromHome, onGoHome, focusMode }) {
  const [sub, setSub] = useState(initialSub || 'circles')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '12px 16px' }}>
        <TopNav onGoHome={onGoHome} />
      </div>
      {/* Sub-tab bar — hidden in focus mode */}
      {!focusMode && (
        <div style={{ display: 'flex', gap: 6, padding: '12px 16px', background: '#FFF8F3', borderBottom: '1px solid #F0E8E0', overflowX: 'auto', scrollbarWidth: 'none' }}>
          {SUBS.map(s => (
            <button key={s} onClick={() => setSub(s)} style={{
              padding: '10px 10px', borderRadius: 14, border: 'none', whiteSpace: 'nowrap',
              background: sub === s ? '#6BA89E' : '#F0E8E0',
              color: sub === s ? 'white' : '#3D3535',
              fontSize: 12, fontWeight: 800, cursor: 'pointer',
            }}>
              {SUB_LABELS[s]}
            </button>
          ))}
        </div>
      )}

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 100px' }}>
        {/* 24-hour urge reflection — shows at top of urges tab */}
        {sub === 'urges' && <UrgeReflection daily={daily} onUpdate={onUpdate} onOpenCrisis={onOpenCrisis} />}
        {sub === 'circles' && <ThreeCircles daily={daily} onUpdate={onUpdate} onOpenCrisis={onOpenCrisis} fromHome={fromHome} onGoHome={onGoHome} />}
        {sub === 'feelings' && <EmotionWheel daily={daily} onUpdate={onUpdate} fromHome={fromHome} onGoHome={onGoHome} />}
        {sub === 'dbt' && <DbtSkill daily={daily} onUpdate={onUpdate} fromHome={fromHome} onGoHome={onGoHome} />}
        {sub === 'urges' && <UrgeLogger daily={daily} onUpdate={onUpdate} onOpenCrisis={onOpenCrisis} fromHome={fromHome} onGoHome={onGoHome} />}
        {sub === 'chain' && <ChainAnalysis daily={daily} onUpdate={onUpdate} fromHome={fromHome} onGoHome={onGoHome} />}
        {sub === 'connection' && <ConnectionSection daily={daily} onUpdate={onUpdate} fromHome={fromHome} onGoHome={onGoHome} />}
      </div>
    </div>
  )
}
