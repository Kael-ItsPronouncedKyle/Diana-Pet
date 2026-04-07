import { useState, useEffect } from 'react'
import { CREATURES } from '../../constants/creatures.js'

const INTRO_LINES_COUNT = 4

export default function OnboardingFlow({ onComplete }) {
  const [step, setStep] = useState(0)
  const [creature, setCreature] = useState(null)
  const [name, setName] = useState('')
  const [lineIndex, setLineIndex] = useState(0)

  // Auto-advance intro lines on step 3 — must be at top level (Rules of Hooks)
  useEffect(() => {
    if (step !== 3) return
    if (lineIndex >= INTRO_LINES_COUNT) return
    const timer = setTimeout(() => {
      setLineIndex(i => i + 1)
    }, 1200)
    return () => clearTimeout(timer)
  }, [step, lineIndex])

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

  const wrap = (children) => (
    <div style={{
      minHeight: '100dvh',
      background: '#FFF8F3',
      display: 'flex',
      flexDirection: 'column',
      padding: 24,
      fontFamily: "'Nunito', sans-serif",
    }}>
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        maxWidth: 390,
        margin: '0 auto',
        width: '100%',
      }}>
        {children}
      </div>
    </div>
  )

  const buttonStyle = (disabled = false) => ({
    width: '100%',
    padding: '16px',
    borderRadius: 16,
    border: 'none',
    background: disabled ? '#E0E0E0' : '#6BA89E',
    color: 'white',
    fontSize: 16,
    fontWeight: 800,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'background 0.2s',
    minHeight: 48,
  })

  // Step 0: Welcome
  if (step === 0) {
    return wrap(
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            fontSize: 48,
            marginBottom: 24,
            animation: 'fadeInUp 0.5s ease-out',
          }}
        >
          💚
        </div>
        <h1
          style={{
            fontSize: 24,
            fontWeight: 900,
            color: '#3D3535',
            marginBottom: 8,
            lineHeight: 1.2,
            animation: 'fadeInUp 0.5s ease-out 0.2s both',
          }}
        >
          Hey.
        </h1>
        <p
          style={{
            fontSize: 18,
            color: '#8A7F7F',
            marginBottom: 32,
            lineHeight: 1.5,
            fontWeight: 600,
            animation: 'fadeInUp 0.5s ease-out 0.4s both',
          }}
        >
          I'm glad you're here.
        </p>
        <button
          onClick={next}
          style={{
            ...buttonStyle(),
            animation: 'fadeInUp 0.5s ease-out 0.6s both',
          }}
        >
          Let's get started →
        </button>
      </div>
    )
  }

  // Step 1: Pick Your Creature
  if (step === 1) {
    return wrap(
      <>
        <h1 style={{
          fontSize: 22,
          fontWeight: 900,
          color: '#3D3535',
          marginBottom: 8,
          lineHeight: 1.2,
          animation: 'fadeInUp 0.5s ease-out',
        }}>
          First things first.
        </h1>
        <p style={{
          fontSize: 16,
          color: '#8A7F7F',
          marginBottom: 28,
          lineHeight: 1.5,
          fontWeight: 600,
          animation: 'fadeInUp 0.5s ease-out 0.1s both',
        }}>
          Pick someone to walk with you.
        </p>
        <p style={{
          fontSize: 14,
          color: '#8A7F7F',
          marginBottom: 24,
          lineHeight: 1.4,
          fontWeight: 500,
          animation: 'fadeInUp 0.5s ease-out 0.2s both',
        }}>
          They'll be here every day, no matter what.
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: 12,
          marginBottom: 28,
          animation: 'fadeInUp 0.5s ease-out 0.3s both',
        }}>
          {CREATURES.map(c => (
            <button
              key={c.id}
              onClick={() => setCreature(c)}
              style={{
                background: creature?.id === c.id ? '#E8F4F1' : 'white',
                border: `3px solid ${creature?.id === c.id ? '#6BA89E' : '#F0E8E0'}`,
                borderRadius: 16,
                padding: '24px 12px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
                cursor: 'pointer',
                transition: 'all 0.2s',
                minHeight: 140,
                transform: creature?.id === c.id ? 'scale(1.05)' : 'scale(1)',
              }}
            >
              <span style={{ fontSize: 56 }}>{c.emoji}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#3D3535' }}>{c.name}</span>
            </button>
          ))}
        </div>
        <button
          onClick={next}
          disabled={!creature}
          style={{
            ...buttonStyle(!creature),
            animation: 'fadeInUp 0.5s ease-out 0.4s both',
          }}
        >
          That's the one →
        </button>
      </>
    )
  }

  // Step 2: Name Your Creature
  if (step === 2) {
    const displayEmoji = creature?.emoji || '🐾'
    return wrap(
      <>
        <div style={{
          fontSize: 100,
          textAlign: 'center',
          marginBottom: 28,
          animation: 'fadeInUp 0.5s ease-out, bounce 1.2s ease-in-out 0.5s infinite',
          lineHeight: 1,
        }}>
          {displayEmoji}
        </div>
        <h1 style={{
          fontSize: 18,
          fontWeight: 900,
          color: '#3D3535',
          marginBottom: 4,
          textAlign: 'center',
          animation: 'fadeInUp 0.5s ease-out 0.1s both',
        }}>
          What do you want to call them?
        </h1>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder={`${creature?.name || 'Pet'}'s name...`}
          maxLength={20}
          style={{
            width: '100%',
            padding: '16px 18px',
            borderRadius: 16,
            border: '2px solid #E8F4F1',
            fontSize: 16,
            fontWeight: 700,
            background: 'white',
            color: '#3D3535',
            outline: 'none',
            marginBottom: 12,
            marginTop: 20,
            boxSizing: 'border-box',
            animation: 'fadeInUp 0.5s ease-out 0.2s both',
          }}
        />
        <p style={{
          fontSize: 13,
          color: '#8A7F7F',
          marginBottom: 28,
          fontWeight: 600,
          textAlign: 'center',
          animation: 'fadeInUp 0.5s ease-out 0.3s both',
        }}>
          (You can skip — we'll call them {creature?.name || 'Pet'})
        </p>
        <button
          onClick={next}
          style={{
            ...buttonStyle(),
            animation: 'fadeInUp 0.5s ease-out 0.4s both',
          }}
        >
          {name.trim() ? `Hello, ${name.trim()}! →` : 'Skip →'}
        </button>
      </>
    )
  }

  // Step 3: First Meeting - Creature speaks
  if (step === 3) {
    const displayEmoji = creature?.emoji || '🐾'
    const creatureName = name.trim() || creature?.name || 'friend'

    const lines = [
      `I'm ${creatureName}. I'm yours.`,
      `I'll be here when it's good. And when it's not.`,
      `I won't judge you. I won't lie to you.`,
      `Ready?`,
    ]

    return wrap(
      <>
        <div style={{
          fontSize: 100,
          textAlign: 'center',
          marginBottom: 28,
          animation: 'fadeInUp 0.5s ease-out, gentle-bounce 1.5s ease-in-out infinite',
          lineHeight: 1,
        }}>
          {displayEmoji}
        </div>

        <div style={{
          background: 'white',
          borderRadius: 16,
          padding: '20px',
          marginBottom: 28,
          minHeight: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px solid #E8F4F1',
        }}>
          <div style={{ minHeight: 60, display: 'flex', alignItems: 'center' }}>
            {lines.map((line, i) => (
              <div
                key={i}
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: '#3D3535',
                  lineHeight: 1.4,
                  animation: i < lineIndex ? 'fadeInUp 0.5s ease-out' : 'none',
                  opacity: i < lineIndex ? 1 : 0,
                  display: i < lineIndex ? 'block' : 'none',
                  textAlign: 'center',
                }}
              >
                {line}
              </div>
            ))}
          </div>
        </div>

        {lineIndex >= lines.length && (
          <button
            onClick={next}
            style={{
              ...buttonStyle(),
              animation: 'fadeInUp 0.5s ease-out',
            }}
          >
            Let's go 💚
          </button>
        )}

        {lineIndex < lines.length && (
          <button
            onClick={() => setLineIndex(lines.length)}
            style={{
              ...buttonStyle(),
              background: '#E8F4F1',
              color: '#6BA89E',
              fontSize: 14,
              animation: 'fadeInUp 0.5s ease-out',
            }}
          >
            Skip ahead →
          </button>
        )}
      </>
    )
  }

  // Step 4: Schizoaffective module opt-in
  if (step === 4) {
    return wrap(
      <>
        <h1 style={{
          fontSize: 22,
          fontWeight: 900,
          color: '#3D3535',
          marginBottom: 8,
          textAlign: 'center',
          animation: 'fadeInUp 0.5s ease-out',
        }}>
          One more thing 💛
        </h1>
        <p style={{
          fontSize: 15,
          color: '#8A7F7F',
          marginBottom: 28,
          lineHeight: 1.5,
          fontWeight: 600,
          textAlign: 'center',
          animation: 'fadeInUp 0.5s ease-out 0.1s both',
        }}>
          Would you like me to check on how your thoughts are doing too? This is private — just for you.
        </p>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          animation: 'fadeInUp 0.5s ease-out 0.2s both',
        }}>
          <button
            onClick={() => finish(true)}
            style={{
              padding: '20px 18px',
              borderRadius: 16,
              border: '2px solid #6BA89E',
              background: '#E8F4F1',
              color: '#3D3535',
              fontSize: 15,
              fontWeight: 700,
              cursor: 'pointer',
              textAlign: 'left',
              lineHeight: 1.4,
              transition: 'all 0.2s',
            }}
          >
            <div style={{ fontSize: 18, marginBottom: 4 }}>✅ Yes, check on my thoughts too</div>
            <div style={{ fontSize: 13, color: '#8A7F7F', fontWeight: 600 }}>Adds a weekly brain check-in. You can turn this off any time.</div>
          </button>
          <button
            onClick={() => finish(false)}
            style={{
              padding: '20px 18px',
              borderRadius: 16,
              border: '2px solid #F0E8E0',
              background: 'white',
              color: '#3D3535',
              fontSize: 15,
              fontWeight: 700,
              cursor: 'pointer',
              textAlign: 'left',
              lineHeight: 1.4,
              transition: 'all 0.2s',
            }}
          >
            <div style={{ fontSize: 18, marginBottom: 4 }}>Not right now</div>
            <div style={{ fontSize: 13, color: '#8A7F7F', fontWeight: 600 }}>You can add this later in settings.</div>
          </button>
        </div>
      </>
    )
  }

  return null
}
