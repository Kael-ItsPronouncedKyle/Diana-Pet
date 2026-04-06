import { useState } from 'react'
import { CREATURES } from '../../constants/creatures.js'

const STEPS = ['creature', 'name', 'schizo']

export default function OnboardingFlow({ onComplete }) {
  const [step, setStep] = useState(0)
  const [creature, setCreature] = useState(null)
  const [name, setName] = useState('')
  const [schizoModule, setSchizoModule] = useState(null)

  const next = () => setStep(s => s + 1)

  const finish = (schizo) => {
    onComplete({
      creature: creature.id,
      creatureName: name.trim() || creature.name,
      schizoModule: schizo,
      streak: 0,
      lastCheckIn: null,
      crisisContacts: { kael: '', luis: '' },
      puppyPhase: 1,
      puppyPhaseStartDate: new Date().toISOString().slice(0, 10),
    })
  }

  const wrap = (children, title, subtitle) => (
    <div style={{ minHeight: '100dvh', background: '#FFF8F3', display: 'flex', flexDirection: 'column', padding: 24, fontFamily: "'Nunito', sans-serif" }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: 390, margin: '0 auto', width: '100%' }}>
        {title && <h1 style={{ fontSize: 26, fontWeight: 900, color: '#3D3535', marginBottom: 8, lineHeight: 1.2 }}>{title}</h1>}
        {subtitle && <p style={{ fontSize: 15, color: '#8A7F7F', marginBottom: 28, lineHeight: 1.5, fontWeight: 600 }}>{subtitle}</p>}
        {children}
      </div>
    </div>
  )

  // Step 0: Pick a creature
  if (step === 0) return wrap(
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 28 }}>
        {CREATURES.map(c => (
          <button
            key={c.id}
            onClick={() => setCreature(c)}
            style={{
              background: creature?.id === c.id ? '#E8F4F1' : 'white',
              border: `3px solid ${creature?.id === c.id ? '#6BA89E' : '#F0E8E0'}`,
              borderRadius: 20,
              padding: '20px 8px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 6,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            <span style={{ fontSize: 44 }}>{c.emoji}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#3D3535' }}>{c.name}</span>
          </button>
        ))}
      </div>
      <button
        onClick={next}
        disabled={!creature}
        style={{
          width: '100%', padding: '16px', borderRadius: 16, border: 'none',
          background: creature ? '#6BA89E' : '#E0E0E0',
          color: 'white', fontSize: 16, fontWeight: 800, cursor: creature ? 'pointer' : 'not-allowed',
          transition: 'background 0.2s',
        }}
      >
        That's my pet! →
      </button>
    </>,
    'Pick your creature 🐾',
    'This little one is here for you every day.'
  )

  // Step 1: Name it
  if (step === 1) {
    const displayEmoji = creature?.emoji || '🐾'
    return wrap(
      <>
        <div style={{ fontSize: 72, textAlign: 'center', marginBottom: 20, animation: 'bounce 1.2s ease-in-out infinite' }}>
          {displayEmoji}
        </div>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder={`${creature?.name || 'Pet'}'s name...`}
          maxLength={20}
          style={{
            width: '100%', padding: '16px 18px', borderRadius: 16,
            border: '2px solid #E8F4F1', fontSize: 18, fontWeight: 700,
            background: 'white', color: '#3D3535', outline: 'none',
            marginBottom: 16, boxSizing: 'border-box',
          }}
        />
        <p style={{ fontSize: 13, color: '#8A7F7F', marginBottom: 20, fontWeight: 600, textAlign: 'center' }}>
          (You can skip this — we'll use {creature?.name || 'Pet'})
        </p>
        <button
          onClick={next}
          style={{
            width: '100%', padding: '16px', borderRadius: 16, border: 'none',
            background: '#6BA89E', color: 'white', fontSize: 16, fontWeight: 800, cursor: 'pointer',
          }}
        >
          {name.trim() ? `Hello, ${name.trim()}! →` : 'Skip →'}
        </button>
      </>,
      'Give your pet a name 💕',
      "What do you want to call them?"
    )
  }

  // Step 2: Schizoaffective module opt-in
  if (step === 2) return wrap(
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
        <button
          onClick={() => finish(true)}
          style={{
            padding: '20px 18px', borderRadius: 16, border: '2px solid #6BA89E',
            background: '#E8F4F1', color: '#3D3535', fontSize: 15, fontWeight: 700,
            cursor: 'pointer', textAlign: 'left', lineHeight: 1.4,
          }}
        >
          <div style={{ fontSize: 22, marginBottom: 4 }}>✅ Yes, check on my thoughts too</div>
          <div style={{ fontSize: 13, color: '#8A7F7F', fontWeight: 600 }}>Adds a weekly brain check-in. You can turn this off any time.</div>
        </button>
        <button
          onClick={() => finish(false)}
          style={{
            padding: '20px 18px', borderRadius: 16, border: '2px solid #F0E8E0',
            background: 'white', color: '#3D3535', fontSize: 15, fontWeight: 700,
            cursor: 'pointer', textAlign: 'left', lineHeight: 1.4,
          }}
        >
          <div style={{ fontSize: 22, marginBottom: 4 }}>Not right now</div>
          <div style={{ fontSize: 13, color: '#8A7F7F', fontWeight: 600 }}>You can add this later in settings.</div>
        </button>
      </div>
    </>,
    'One more thing 💛',
    'Would you like your app to check on how your thoughts are doing too? This is private — just for you.'
  )

  return null
}
