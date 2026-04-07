import { useState } from 'react'
import BackToHomeBanner from '../shared/BackToHomeBanner.jsx'

const C = {
  primary: '#6BA89E',
  accent: '#E8907E',
  text: '#3D3535',
  textLight: '#8A7F7F',
  green: '#6BBF8A',
  greenBg: '#E6F7EC',
  card: '#FFFFFF',
  bg: '#FFF8F3',
}

const card = {
  background: C.card,
  borderRadius: 20,
  padding: '18px',
  boxShadow: '0 2px 12px rgba(61,53,53,0.08)',
  marginBottom: 14,
}

function WinsSection({ daily, onUpdate, fromHome, onGoHome }) {
  const [winText, setWinText] = useState(daily?.win || '')
  const [saved, setSaved] = useState(!!daily?.win)
  const [isEditing, setIsEditing] = useState(false)

  const save = () => {
    const trimmedWin = winText.trim()
    onUpdate({ win: trimmedWin })
    setSaved(true)
    setIsEditing(false)
  }

  if (saved && winText && !isEditing) {
    return (
      <div style={{ animation: 'fade-up 0.25s ease-out' }}>
        <BackToHomeBanner show={fromHome} onGoHome={onGoHome} />

        <div
          style={{
            ...card,
            background: C.greenBg,
            border: `2px solid ${C.green}`,
            marginBottom: 16,
          }}
        >
          <div style={{ fontSize: 18, marginBottom: 12, color: C.text }}>
            {winText}
          </div>
          <div
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: C.green,
              marginBottom: 8,
            }}
          >
            You noticed something good. That's a skill. 💛
          </div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: C.textLight,
              lineHeight: 1.4,
            }}
          >
            Noticing good things helps your brain find more of them.
          </div>
        </div>

        <button
          onClick={() => setIsEditing(true)}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: 14,
            border: 'none',
            background: '#F0E8E0',
            color: C.textLight,
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
            minHeight: 44,
          }}
        >
          Change my answer
        </button>
      </div>
    )
  }

  return (
    <div style={{ animation: 'fade-up 0.25s ease-out' }}>
      <BackToHomeBanner show={fromHome} onGoHome={onGoHome} />

      <div style={card}>
        <div
          style={{
            fontSize: 15,
            fontWeight: 800,
            color: C.text,
            marginBottom: 8,
          }}
        >
          What's one good thing from today?
        </div>
        <p
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: C.textLight,
            marginBottom: 12,
            lineHeight: 1.4,
          }}
        >
          Something that made you smile, something you did well, or just a moment that was okay...
        </p>

        <textarea
          value={winText}
          onChange={(e) => setWinText(e.target.value)}
          placeholder="Type here or use voice-to-text..."
          rows={4}
          style={{
            width: '100%',
            padding: '12px 14px',
            borderRadius: 14,
            border: '2px solid #F0E8E0',
            fontSize: 14,
            fontWeight: 600,
            background: 'white',
            color: C.text,
            resize: 'none',
            outline: 'none',
            boxSizing: 'border-box',
            marginBottom: 12,
          }}
        />

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={save}
            disabled={!winText.trim()}
            style={{
              flex: 2,
              padding: '14px',
              borderRadius: 14,
              border: 'none',
              background: winText.trim() ? C.primary : '#E0E0E0',
              color: 'white',
              fontSize: 15,
              fontWeight: 800,
              cursor: winText.trim() ? 'pointer' : 'not-allowed',
              minHeight: 44,
              opacity: winText.trim() ? 1 : 0.6,
            }}
          >
            Save
          </button>
          <button
            onClick={() => {
              setWinText('')
              setSaved(false)
            }}
            style={{
              flex: 1,
              padding: '14px',
              borderRadius: 14,
              border: 'none',
              background: '#F0E8E0',
              color: C.textLight,
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              minHeight: 44,
            }}
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  )
}

export default WinsSection
