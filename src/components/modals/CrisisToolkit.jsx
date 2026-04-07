import { useState, useEffect, useRef } from 'react'

// Simplified: 4 categories instead of 8
const SECTIONS = ['quick-calm', 'safety-plan', 'coping-skills', 'contacts']
const SECTION_LABELS = {
  'quick-calm': '🌱 Quick Calm',
  'safety-plan': '🛡️ My Safety Plan',
  'coping-skills': '💪 Coping Skills',
  contacts: '📞 Call Someone',
}

function BoxBreathing() {
  const [phase, setPhase] = useState(0)
  const [count, setCount] = useState(4)
  const PHASES = ['Breathe in', 'Hold', 'Breathe out', 'Hold']
  const COLORS = ['#6BA89E', '#6BA8D6', '#E8907E', '#6BA8D6']
  const timerRef = useRef(null)

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCount(c => {
        if (c <= 1) {
          setPhase(p => (p + 1) % 4)
          return 4
        }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [])

  const isHolding = phase === 1 || phase === 3

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 0' }}>
      <div style={{
        width: 120, height: 120, borderRadius: '50%',
        background: COLORS[phase],
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: isHolding ? 'none' : 'breathe 4s ease-in-out infinite',
        transition: 'background 0.5s',
        boxShadow: `0 0 30px ${COLORS[phase]}60`,
      }}>
        <span style={{ fontSize: 32, color: 'white', fontWeight: 900 }}>{count}</span>
      </div>
      <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text, #3D3535)', marginTop: 16 }}>{PHASES[phase]}</div>
      <div style={{ fontSize: 13, color: 'var(--text-light, #8A7F7F)', marginTop: 4, fontWeight: 600 }}>
        Just watch and follow along. You've got this.
      </div>
    </div>
  )
}

function SafetyPlanDisplay({ safetyPlan }) {
  if (!safetyPlan || (!safetyPlan.completedAt && !safetyPlan.warningSigns?.length)) {
    return (
      <div style={{ textAlign: 'center', padding: '30px 20px' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🛡️</div>
        <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text, #3D3535)', marginBottom: 8 }}>
          You haven't set up your safety plan yet.
        </p>
        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-light, #8A7F7F)', lineHeight: 1.5 }}>
          Go to Settings to create one. It takes a few minutes and it's worth it.
        </p>
      </div>
    )
  }

  const sections = [
    { key: 'warningSigns', title: '⚠️ Warning signs I notice', items: safetyPlan.warningSigns },
    { key: 'selfCoping', title: '💪 Things I can do on my own', items: safetyPlan.selfCoping },
    { key: 'distractionPeople', title: '🌎 People and places that help', items: safetyPlan.distractionPeople },
    { key: 'helpContacts', title: '📱 People I can reach out to', items: safetyPlan.helpContacts, isContacts: true },
    { key: 'professionals', title: '🏥 Professionals I can contact', items: safetyPlan.professionals, isContacts: true },
    { key: 'environmentSafe', title: '🏠 Making my space safe', items: safetyPlan.environmentSafe },
  ]

  return (
    <div>
      {sections.map(section => {
        if (!section.items || section.items.length === 0) return null
        return (
          <div key={section.key} style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#6BA89E', marginBottom: 8 }}>{section.title}</div>
            {section.isContacts ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {section.items.map((c, i) => (
                  <a key={i} href={c.phone ? `tel:${c.phone}` : undefined} style={{ textDecoration: 'none' }}>
                    <div style={{ background: 'var(--primary-light, #E8F4F1)', borderRadius: 12, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10, border: '2px solid #6BA89E' }}>
                      <span style={{ fontSize: 20 }}>📞</span>
                      <div>
                        <div style={{ fontWeight: 800, color: 'var(--text, #3D3535)', fontSize: 15 }}>{c.name}</div>
                        {c.phone && <div style={{ fontSize: 13, color: '#6BA89E', fontWeight: 600 }}>{c.phone}</div>}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {section.items.map((item, i) => (
                  <div key={i} style={{ padding: '10px 14px', background: '#F8F4F0', borderRadius: 10, fontSize: 14, fontWeight: 600, color: 'var(--text, #3D3535)' }}>
                    {item}
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Coping Plan (T1-08) ────────────────────────────────────────────────────
const COPING_FIELDS = [
  { key: 'urge', label: 'When I feel an urge, I will:', placeholder: 'e.g. call Kael, do ice dive, go for a walk...' },
  { key: 'cantSleep', label: "When I can't sleep, I will:", placeholder: 'e.g. paced breathing, progressive relaxation...' },
  { key: 'sensoryOverload', label: "When I'm in sensory overload, I will:", placeholder: 'e.g. go to a quiet room, put on headphones...' },
  { key: 'disconnected', label: 'When I feel disconnected from my body, I will:', placeholder: 'e.g. hold ice, warm water on hands, 5-4-3-2-1...' },
  { key: 'hiding', label: 'When I want to hide something from Luis, I will:', placeholder: 'e.g. tell Kael first, write it down, open this app...' },
  { key: 'reason', label: "The reason I'm doing this work is:", placeholder: 'e.g. because I want to be free, because I deserve better...' },
]

function CopingPlanSection({ copingPlan, onSave }) {
  const hasPlan = copingPlan && Object.values(copingPlan).some(v => v && v.trim())
  const [editing, setEditing] = useState(!hasPlan)
  const [values, setValues] = useState(copingPlan || {})

  const set = (key, val) => setValues(prev => ({ ...prev, [key]: val }))

  const save = () => {
    onSave(values)
    setEditing(false)
  }

  if (!editing && hasPlan) {
    return (
      <div>
        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-light, #8A7F7F)', marginBottom: 16, lineHeight: 1.5 }}>
          You wrote this plan for yourself. Read it when you need it most.
        </p>
        {COPING_FIELDS.map(f => {
          const val = copingPlan[f.key]
          if (!val || !val.trim()) return null
          return (
            <div key={f.key} style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#6BA89E', marginBottom: 4 }}>{f.label}</div>
              <div style={{ background: '#F8F4F0', borderRadius: 14, padding: '12px 16px', fontSize: 15, fontWeight: 700, color: 'var(--text, #3D3535)', lineHeight: 1.5 }}>
                {val}
              </div>
            </div>
          )
        })}
        <button
          onClick={() => setEditing(true)}
          style={{ width: '100%', padding: '12px', borderRadius: 14, border: '2px solid #F0E8E0', background: 'var(--card, white)', color: 'var(--text-light, #8A7F7F)', fontSize: 14, fontWeight: 700, cursor: 'pointer', marginTop: 8 }}
        >
          Edit my plan
        </button>
      </div>
    )
  }

  return (
    <div>
      <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-light, #8A7F7F)', marginBottom: 16, lineHeight: 1.5 }}>
        {hasPlan ? 'Update your coping plan.' : "Let's build your coping plan. Fill in what works for YOU. You can use voice-to-text."}
      </p>
      {COPING_FIELDS.map(f => (
        <div key={f.key} style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text, #3D3535)', marginBottom: 6 }}>{f.label}</div>
          <textarea
            value={values[f.key] || ''}
            onChange={e => set(f.key, e.target.value)}
            placeholder={f.placeholder}
            rows={2}
            style={{
              width: '100%', padding: '12px 14px', borderRadius: 14, border: '2px solid #F0E8E0',
              fontSize: 14, fontWeight: 600, background: 'var(--card, white)', color: 'var(--text, #3D3535)',
              resize: 'none', outline: 'none', boxSizing: 'border-box',
            }}
          />
        </div>
      ))}
      <button
        onClick={save}
        style={{ width: '100%', padding: '14px', borderRadius: 14, border: 'none', background: '#6BA89E', color: 'white', fontSize: 15, fontWeight: 800, cursor: 'pointer' }}
      >
        Save my plan ✓
      </button>
    </div>
  )
}

export default function CrisisToolkit({ isOpen, onClose, crisisContacts = {}, safetyPlan = null, copingPlan = null, onSaveCopingPlan }) {
  const [activeSection, setActiveSection] = useState('quick-calm')

  if (!isOpen) return null

  // Gather all contacts
  const allContacts = []
  if (safetyPlan?.helpContacts) safetyPlan.helpContacts.forEach(c => allContacts.push(c))
  if (safetyPlan?.professionals) safetyPlan.professionals.forEach(c => allContacts.push(c))

  const renderSection = () => {
    switch (activeSection) {
      case 'quick-calm':
        return (
          <div>
            {/* Grounding 5-4-3-2-1 */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text, #3D3535)', marginBottom: 12 }}>🌱 Ground yourself</div>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-light, #8A7F7F)', marginBottom: 14, lineHeight: 1.5 }}>
                Look around you. Find:
              </p>
              {[
                { n: 5, thing: 'things you can see', emoji: '👀' },
                { n: 4, thing: 'things you can touch', emoji: '✋' },
                { n: 3, thing: 'things you can hear', emoji: '👂' },
                { n: 2, thing: 'things you can smell', emoji: '👃' },
                { n: 1, thing: 'thing you can taste', emoji: '👅' },
              ].map(({ n, thing, emoji }) => (
                <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: '#F8F4F0', borderRadius: 14, marginBottom: 8 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#6BA89E', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: 16, flexShrink: 0 }}>{n}</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text, #3D3535)' }}>{emoji} {thing}</div>
                </div>
              ))}
            </div>

            {/* Box Breathing */}
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text, #3D3535)', marginBottom: 12 }}>🫁 Box Breathing</div>
              <BoxBreathing />
            </div>
          </div>
        )
      case 'safety-plan':
        return <SafetyPlanDisplay safetyPlan={safetyPlan} />
      case 'coping-skills':
        return (
          <div>
            {/* Coping Plan */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text, #3D3535)', marginBottom: 12 }}>📋 My Coping Plan</div>
              <CopingPlanSection copingPlan={copingPlan} onSave={onSaveCopingPlan} />
            </div>

            {/* TIPP */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text, #3D3535)', marginBottom: 12 }}>🧊 TIPP: Ice Dive</div>
              <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text, #3D3535)', lineHeight: 1.6, marginBottom: 12 }}>
                Fill a bowl with cold water. Hold your breath. Put your face in for 15-30 seconds.
              </p>
              <div style={{ background: 'var(--blue-bg, #E8F1FA)', borderRadius: 16, padding: '14px 16px', border: '2px solid #6BA8D6' }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text, #3D3535)', lineHeight: 1.6, margin: 0 }}>
                  This turns on your dive reflex. It calms your whole nervous system fast.
                </p>
              </div>
            </div>

            {/* Urge Surfing */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text, #3D3535)', marginBottom: 12 }}>🌊 Urge Surfing</div>
              {[
                'The urge is a wave.',
                'It gets bigger, peaks, and then it goes down.',
                "You don't have to act on it.",
                'Just notice it.',
                'Where do you feel it in your body?',
                'Breathe into that spot.',
                "The wave is already starting to fall.",
                "You're riding it.",
                "You're okay.",
              ].map((line, i) => (
                <p key={i} style={{ fontSize: 15, fontWeight: i === 8 ? 900 : 600, color: i === 8 ? '#6BA89E' : 'var(--text, #3D3535)', lineHeight: 1.5, marginBottom: 8, textAlign: 'center' }}>
                  {line}
                </p>
              ))}
            </div>

            {/* Safe Message */}
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>💙</div>
              {[
                'You are not your worst moment.',
                'You are here.',
                'You are trying.',
                'That is enough right now.',
              ].map((line, i) => (
                <p key={i} style={{ fontSize: 18, fontWeight: 800, color: i === 3 ? '#6BA89E' : 'var(--text, #3D3535)', lineHeight: 1.4, marginBottom: 10 }}>
                  {line}
                </p>
              ))}
            </div>
          </div>
        )
      case 'contacts':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {allContacts.length > 0 && (
              <>
                <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-light, #8A7F7F)', marginBottom: 2 }}>FROM YOUR SAFETY PLAN</div>
                {allContacts.map((c, i) => (
                  <a key={`sp-${i}`} href={c.phone ? `tel:${c.phone}` : undefined} style={{ textDecoration: 'none' }}>
                    <div style={{ background: 'var(--primary-light, #E8F4F1)', borderRadius: 16, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, border: '2px solid #6BA89E' }}>
                      <span style={{ fontSize: 28 }}>📞</span>
                      <div>
                        <div style={{ fontWeight: 800, color: 'var(--text, #3D3535)', fontSize: 16 }}>{c.name}</div>
                        {c.phone && <div style={{ fontSize: 13, color: '#6BA89E', fontWeight: 600 }}>{c.phone}</div>}
                      </div>
                    </div>
                  </a>
                ))}
                <div style={{ height: 8 }} />
              </>
            )}

            {crisisContacts.kael && (
              <a href={`tel:${crisisContacts.kael}`} style={{ textDecoration: 'none' }}>
                <div style={{ background: 'var(--primary-light, #E8F4F1)', borderRadius: 16, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, border: '2px solid #6BA89E' }}>
                  <span style={{ fontSize: 28 }}>📞</span>
                  <div><div style={{ fontWeight: 800, color: 'var(--text, #3D3535)', fontSize: 16 }}>Call Kael</div><div style={{ fontSize: 13, color: '#6BA89E', fontWeight: 600 }}>{crisisContacts.kael}</div></div>
                </div>
              </a>
            )}
            {crisisContacts.luis && (
              <a href={`tel:${crisisContacts.luis}`} style={{ textDecoration: 'none' }}>
                <div style={{ background: 'var(--primary-light, #E8F4F1)', borderRadius: 16, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, border: '2px solid #6BA89E' }}>
                  <span style={{ fontSize: 28 }}>📞</span>
                  <div><div style={{ fontWeight: 800, color: 'var(--text, #3D3535)', fontSize: 16 }}>Call Luis</div><div style={{ fontSize: 13, color: '#6BA89E', fontWeight: 600 }}>{crisisContacts.luis}</div></div>
                </div>
              </a>
            )}

            {[
              { label: '988 Crisis Lifeline', sub: 'Call or text 988', tel: '988', emoji: '💚' },
              { label: 'Crisis Text Line', sub: 'Text HOME to 741741', tel: '741741', emoji: '💬' },
              { label: 'SAMHSA Helpline', sub: '1-800-662-4357', tel: '18006624357', emoji: '🏥' },
            ].map(({ label, sub, tel, emoji }) => (
              <a key={label} href={`tel:${tel}`} style={{ textDecoration: 'none' }}>
                <div style={{ background: '#F8F4F0', borderRadius: 16, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, border: '2px solid #F0E8E0' }}>
                  <span style={{ fontSize: 28 }}>{emoji}</span>
                  <div><div style={{ fontWeight: 800, color: 'var(--text, #3D3535)', fontSize: 15 }}>{label}</div><div style={{ fontSize: 13, color: 'var(--text-light, #8A7F7F)', fontWeight: 600 }}>{sub}</div></div>
                </div>
              </a>
            ))}
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(61,53,53,0.7)',
      display: 'flex', alignItems: 'flex-end',
    }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: 'var(--bg, #FFF8F3)', width: '100%', maxWidth: 430, margin: '0 auto',
        borderRadius: '24px 24px 0 0', maxHeight: '92dvh',
        display: 'flex', flexDirection: 'column',
        animation: 'fade-up 0.25s ease-out',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px 12px', borderBottom: '1px solid #F0E8E0' }}>
          <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--text, #3D3535)' }}>❤️‍🩹 Crisis Toolkit</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: 'var(--text-light, #8A7F7F)', padding: '4px 8px' }}>✕</button>
        </div>

        {/* Simplified 4-tab bar */}
        <div style={{ display: 'flex', gap: 6, padding: '10px 12px', borderBottom: '1px solid #F0E8E0' }}>
          {SECTIONS.map(s => (
            <button
              key={s}
              onClick={() => setActiveSection(s)}
              style={{
                flex: 1, padding: '10px 6px', borderRadius: 14, border: 'none', whiteSpace: 'nowrap',
                background: activeSection === s ? '#6BA89E' : '#F0E8E0',
                color: activeSection === s ? 'white' : 'var(--text, #3D3535)',
                fontSize: 11, fontWeight: 800, cursor: 'pointer',
                textAlign: 'center', lineHeight: 1.3,
              }}
            >
              {SECTION_LABELS[s]}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', paddingBottom: 'max(20px, env(safe-area-inset-bottom))' }}>
          {renderSection()}
        </div>
      </div>
    </div>
  )
}

// Floating button that lives outside the sheet
export function CrisisButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      aria-label="Open crisis toolkit"
      style={{
        position: 'fixed', top: 16, right: 16, zIndex: 900,
        width: 44, height: 44, borderRadius: '50%',
        background: 'var(--card, white)', border: '2px solid #FDECEC',
        fontSize: 22, cursor: 'pointer',
        boxShadow: '0 2px 12px rgba(232,123,123,0.25)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'transform 0.15s',
      }}
      onMouseDown={e => e.currentTarget.style.transform = 'scale(0.92)'}
      onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
      onTouchStart={e => e.currentTarget.style.transform = 'scale(0.92)'}
      onTouchEnd={e => e.currentTarget.style.transform = 'scale(1)'}
    >
      ❤️‍🩹
    </button>
  )
}
