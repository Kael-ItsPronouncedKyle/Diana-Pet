import { useState, useEffect, useCallback } from 'react'

const C = {
  primary: '#6BA89E', primaryLight: '#E8F4F1',
  text: '#3D3535', textLight: '#8A7F7F', card: '#FFFFFF',
  accent: '#E8907E',
}
const card = { background: C.card, borderRadius: 20, padding: '18px', boxShadow: '0 2px 12px rgba(61,53,53,0.08)', marginBottom: 14 }

const STEPS = [
  {
    key: 'warningSigns',
    title: 'Warning signs I notice in myself',
    description: 'What do you notice when things start getting hard? These are your early signals.',
    placeholder: 'Like: I stop sleeping, I hide my phone, I get really quiet...',
    type: 'list',
  },
  {
    key: 'selfCoping',
    title: 'Things I can do on my own to feel better',
    description: 'What helps you feel better that you can do by yourself?',
    placeholder: 'Like: Walk the dogs, take a shower, use the ice dive, put on music...',
    type: 'list',
  },
  {
    key: 'distractionPeople',
    title: 'People and places that help me feel better',
    description: 'Where can you go or who can you be around to feel safe?',
    placeholder: 'Like: Go to the pet store, go to the park with Artemis...',
    type: 'list',
  },
  {
    key: 'helpContacts',
    title: 'People I can reach out to for help',
    description: 'Who can you call or text when you need someone? Try to add 3-4 people.',
    type: 'contacts',
  },
  {
    key: 'professionals',
    title: 'Professionals I can contact',
    description: 'Your therapist, doctor, or crisis line. People trained to help.',
    type: 'contacts',
  },
  {
    key: 'environmentSafe',
    title: 'Making my space safe',
    description: 'What can you do to make your space safer when things get hard?',
    placeholder: 'Like: Put my phone in the other room, ask Luis to hold my devices, go somewhere public...',
    type: 'list',
  },
]

function ListBuilder({ items, onAdd, onRemove, placeholder }) {
  const [text, setText] = useState('')

  const add = () => {
    const trimmed = text.trim()
    if (trimmed && !items.includes(trimmed)) {
      onAdd(trimmed)
      setText('')
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); add() }
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || 'Type something and tap Add'}
          style={{
            flex: 1, padding: '12px 14px', borderRadius: 14, border: '2px solid #F0E8E0',
            fontSize: 14, fontWeight: 600, background: 'white', color: C.text,
            outline: 'none', boxSizing: 'border-box', minHeight: 44,
          }}
        />
        <button
          onClick={add}
          style={{
            padding: '12px 20px', borderRadius: 14, border: 'none',
            background: text.trim() ? C.primary : '#E0E0E0',
            color: 'white', fontSize: 14, fontWeight: 800,
            cursor: text.trim() ? 'pointer' : 'default', minHeight: 44,
          }}
        >
          Add
        </button>
      </div>
      {items.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {items.map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: '#F8F4F0', borderRadius: 12 }}>
              <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: C.text }}>{item}</span>
              <button
                onClick={() => onRemove(i)}
                style={{ width: 30, height: 30, borderRadius: '50%', border: 'none', background: '#F0E8E0', color: C.textLight, fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ContactBuilder({ contacts, onAdd, onRemove }) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')

  const add = () => {
    if (name.trim()) {
      onAdd({ name: name.trim(), phone: phone.trim() })
      setName('')
      setPhone('')
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Name"
          style={{
            padding: '12px 14px', borderRadius: 14, border: '2px solid #F0E8E0',
            fontSize: 14, fontWeight: 600, background: 'white', color: C.text,
            outline: 'none', boxSizing: 'border-box', minHeight: 44,
          }}
        />
        <input
          value={phone}
          onChange={e => setPhone(e.target.value)}
          placeholder="Phone number (optional)"
          type="tel"
          style={{
            padding: '12px 14px', borderRadius: 14, border: '2px solid #F0E8E0',
            fontSize: 14, fontWeight: 600, background: 'white', color: C.text,
            outline: 'none', boxSizing: 'border-box', minHeight: 44,
          }}
        />
        <button
          onClick={add}
          style={{
            padding: '12px 20px', borderRadius: 14, border: 'none',
            background: name.trim() ? C.primary : '#E0E0E0',
            color: 'white', fontSize: 14, fontWeight: 800,
            cursor: name.trim() ? 'pointer' : 'default', minHeight: 44,
          }}
        >
          Add person
        </button>
      </div>
      {contacts.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {contacts.map((c, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: '#F8F4F0', borderRadius: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{c.name}</div>
                {c.phone && <div style={{ fontSize: 12, fontWeight: 600, color: C.textLight }}>{c.phone}</div>}
              </div>
              <button
                onClick={() => onRemove(i)}
                style={{ width: 30, height: 30, borderRadius: '50%', border: 'none', background: '#F0E8E0', color: C.textLight, fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const DRAFT_KEY = 'diana-safety-plan-draft'

function loadDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return null
}

function saveDraft(plan, step) {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ plan, step }))
  } catch { /* ignore */ }
}

function clearDraft() {
  try {
    localStorage.removeItem(DRAFT_KEY)
  } catch { /* ignore */ }
}

export default function SafetyPlanWizard({ profile, onProfileUpdate, onClose }) {
  const existingPlan = profile?.safetyPlan || {}
  const draft = loadDraft()
  const hasDraft = draft && draft.plan && Object.values(draft.plan).some(v => Array.isArray(v) && v.length > 0)
  const [showDraftPrompt, setShowDraftPrompt] = useState(hasDraft)
  const [step, setStep] = useState(0)
  const [plan, setPlan] = useState({
    warningSigns: existingPlan.warningSigns || [],
    selfCoping: existingPlan.selfCoping || [],
    distractionPeople: existingPlan.distractionPeople || [],
    helpContacts: existingPlan.helpContacts || [],
    professionals: existingPlan.professionals || [],
    environmentSafe: existingPlan.environmentSafe || [],
  })

  const restoreDraft = useCallback(() => {
    if (draft) {
      setPlan(draft.plan)
      setStep(draft.step || 0)
    }
    setShowDraftPrompt(false)
  }, []) // draft is read once at mount via loadDraft()

  const dismissDraft = useCallback(() => {
    clearDraft()
    setShowDraftPrompt(false)
  }, [])

  const currentStep = STEPS[step]

  const updateField = (key, value) => {
    setPlan(prev => {
      const next = { ...prev, [key]: value }
      saveDraft(next, step)
      return next
    })
  }

  const addToList = (key, item) => {
    updateField(key, [...plan[key], item])
  }

  const removeFromList = (key, index) => {
    updateField(key, plan[key].filter((_, i) => i !== index))
  }

  const saveAndNext = () => {
    // Save progress after each step
    onProfileUpdate({ safetyPlan: { ...plan } })
    if (step < STEPS.length - 1) {
      const nextStep = step + 1
      setStep(nextStep)
      saveDraft(plan, nextStep)
    } else {
      // Final step — save completed plan and clear draft
      onProfileUpdate({ safetyPlan: { ...plan, completedAt: new Date().toISOString() } })
      clearDraft()
      onClose()
    }
  }

  const isLastStep = step === STEPS.length - 1

  return (
    <div style={{ animation: 'fade-up 0.25s ease-out' }}>
      {/* Draft restore prompt */}
      {showDraftPrompt && (
        <div style={{ ...card, background: '#FFF8E1', border: '2px solid #F0C050', marginBottom: 16 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 12, lineHeight: 1.5 }}>
            Looks like you started this before. Want to pick up where you left off?
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={restoreDraft}
              style={{
                flex: 1, padding: '12px', borderRadius: 14, border: 'none',
                background: C.primary, color: 'white', fontSize: 14, fontWeight: 800,
                cursor: 'pointer', minHeight: 44,
              }}
            >
              Yes, continue
            </button>
            <button
              onClick={dismissDraft}
              style={{
                flex: 1, padding: '12px', borderRadius: 14, border: '2px solid #F0E8E0',
                background: 'white', color: C.textLight, fontSize: 14, fontWeight: 700,
                cursor: 'pointer', minHeight: 44,
              }}
            >
              Start fresh
            </button>
          </div>
        </div>
      )}

      {/* Progress */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <button
          onClick={step > 0 ? () => setStep(step - 1) : onClose}
          style={{ padding: '8px 16px', borderRadius: 12, border: 'none', background: '#F0E8E0', color: C.text, fontSize: 14, fontWeight: 700, cursor: 'pointer', minHeight: 40 }}
        >
          {step > 0 ? '← Back' : '← Close'}
        </button>
        <span style={{ fontSize: 13, fontWeight: 700, color: C.textLight }}>Step {step + 1} of {STEPS.length}</span>
      </div>

      {/* Progress dots */}
      <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 20 }}>
        {STEPS.map((_, i) => (
          <div
            key={i}
            style={{
              width: i <= step ? 24 : 10, height: 10, borderRadius: 5,
              background: i <= step ? C.primary : '#F0E8E0',
              transition: 'all 0.2s',
            }}
          />
        ))}
      </div>

      {/* Step content */}
      <div style={card}>
        <h3 style={{ fontSize: 18, fontWeight: 900, color: C.text, marginBottom: 6 }}>
          {currentStep.title}
        </h3>
        <p style={{ fontSize: 14, fontWeight: 600, color: C.textLight, lineHeight: 1.5, marginBottom: 16 }}>
          {currentStep.description}
        </p>

        {currentStep.type === 'list' ? (
          <ListBuilder
            items={plan[currentStep.key]}
            onAdd={(item) => addToList(currentStep.key, item)}
            onRemove={(i) => removeFromList(currentStep.key, i)}
            placeholder={currentStep.placeholder}
          />
        ) : (
          <ContactBuilder
            contacts={plan[currentStep.key]}
            onAdd={(contact) => addToList(currentStep.key, contact)}
            onRemove={(i) => removeFromList(currentStep.key, i)}
          />
        )}
      </div>

      {/* Next / Finish */}
      <button
        onClick={saveAndNext}
        style={{
          width: '100%', padding: '16px', borderRadius: 16, border: 'none',
          background: C.primary, color: 'white',
          fontSize: 16, fontWeight: 800, cursor: 'pointer', marginBottom: 8,
        }}
      >
        {isLastStep ? 'Finish my safety plan ✓' : 'Next →'}
      </button>

      {!isLastStep && (
        <button
          onClick={() => { onProfileUpdate({ safetyPlan: { ...plan } }); saveDraft(plan, step); onClose() }}
          style={{
            width: '100%', padding: '12px', borderRadius: 14, border: 'none',
            background: 'transparent', color: C.textLight,
            fontSize: 14, fontWeight: 700, cursor: 'pointer',
          }}
        >
          Save and finish later
        </button>
      )}
    </div>
  )
}
