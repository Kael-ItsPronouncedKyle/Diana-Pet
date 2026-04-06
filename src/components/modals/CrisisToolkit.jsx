import { useState, useEffect, useRef } from 'react'

const SECTIONS = ['grounding', 'breathe', 'tipp', 'contacts', 'urge-surfing', 'safe-message']
const SECTION_LABELS = {
  grounding: '🌱 Grounding',
  breathe: '🫁 Box Breathing',
  tipp: '🧊 TIPP: Ice Dive',
  contacts: '📞 Call Someone',
  'urge-surfing': '🌊 Urge Surfing',
  'safe-message': '💙 Safe Message',
}

function BoxBreathing() {
  const [phase, setPhase] = useState(0) // 0=in 1=hold-in 2=out 3=hold-out
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

  const isExpanding = phase === 0
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
      <div style={{ fontSize: 20, fontWeight: 800, color: '#3D3535', marginTop: 16 }}>{PHASES[phase]}</div>
      <div style={{ fontSize: 13, color: '#8A7F7F', marginTop: 4, fontWeight: 600 }}>
        Just watch and follow along. You've got this.
      </div>
    </div>
  )
}

export default function CrisisToolkit({ isOpen, onClose, crisisContacts = {} }) {
  const [activeSection, setActiveSection] = useState('grounding')

  if (!isOpen) return null

  const renderSection = () => {
    switch (activeSection) {
      case 'grounding':
        return (
          <div style={{ lineHeight: 1.6 }}>
            <p style={{ fontSize: 16, fontWeight: 700, color: '#3D3535', marginBottom: 16 }}>
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
                <div style={{ fontSize: 15, fontWeight: 700, color: '#3D3535' }}>{emoji} {thing}</div>
              </div>
            ))}
          </div>
        )
      case 'breathe':
        return <BoxBreathing />
      case 'tipp':
        return (
          <div>
            <div style={{ fontSize: 48, textAlign: 'center', marginBottom: 16 }}>🧊</div>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#3D3535', lineHeight: 1.6, marginBottom: 12 }}>
              Fill a bowl with cold water. Hold your breath. Put your face in for 15-30 seconds.
            </p>
            <div style={{ background: '#E8F1FA', borderRadius: 16, padding: '14px 16px', border: '2px solid #6BA8D6' }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#3D3535', lineHeight: 1.6, margin: 0 }}>
                This turns on your dive reflex. It calms your whole nervous system fast — faster than almost anything else.
              </p>
            </div>
          </div>
        )
      case 'contacts':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {crisisContacts.kael && (
              <a href={`tel:${crisisContacts.kael}`} style={{ textDecoration: 'none' }}>
                <div style={{ background: '#E8F4F1', borderRadius: 16, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, border: '2px solid #6BA89E' }}>
                  <span style={{ fontSize: 28 }}>📞</span>
                  <div><div style={{ fontWeight: 800, color: '#3D3535', fontSize: 16 }}>Call Kael</div><div style={{ fontSize: 13, color: '#6BA89E', fontWeight: 600 }}>{crisisContacts.kael}</div></div>
                </div>
              </a>
            )}
            {crisisContacts.luis && (
              <a href={`tel:${crisisContacts.luis}`} style={{ textDecoration: 'none' }}>
                <div style={{ background: '#E8F4F1', borderRadius: 16, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, border: '2px solid #6BA89E' }}>
                  <span style={{ fontSize: 28 }}>📞</span>
                  <div><div style={{ fontWeight: 800, color: '#3D3535', fontSize: 16 }}>Call Luis</div><div style={{ fontSize: 13, color: '#6BA89E', fontWeight: 600 }}>{crisisContacts.luis}</div></div>
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
                  <div><div style={{ fontWeight: 800, color: '#3D3535', fontSize: 15 }}>{label}</div><div style={{ fontSize: 13, color: '#8A7F7F', fontWeight: 600 }}>{sub}</div></div>
                </div>
              </a>
            ))}
          </div>
        )
      case 'urge-surfing':
        return (
          <div>
            <div style={{ fontSize: 48, textAlign: 'center', marginBottom: 16 }}>🌊</div>
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
              <p key={i} style={{ fontSize: 16, fontWeight: i === 8 ? 900 : 600, color: i === 8 ? '#6BA89E' : '#3D3535', lineHeight: 1.5, marginBottom: 10, textAlign: 'center' }}>
                {line}
              </p>
            ))}
          </div>
        )
      case 'safe-message':
        return (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 56, marginBottom: 20 }}>💙</div>
            {[
              'You are not your worst moment.',
              'You are here.',
              'You are trying.',
              'That is enough right now.',
            ].map((line, i) => (
              <p key={i} style={{ fontSize: 20, fontWeight: 800, color: i === 3 ? '#6BA89E' : '#3D3535', lineHeight: 1.4, marginBottom: 12 }}>
                {line}
              </p>
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
        background: '#FFF8F3', width: '100%', maxWidth: 430, margin: '0 auto',
        borderRadius: '24px 24px 0 0', maxHeight: '92dvh',
        display: 'flex', flexDirection: 'column',
        animation: 'fade-up 0.25s ease-out',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px 12px', borderBottom: '1px solid #F0E8E0' }}>
          <div style={{ fontSize: 20, fontWeight: 900, color: '#3D3535' }}>❤️‍🩹 Crisis Toolkit</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: '#8A7F7F', padding: '4px 8px' }}>✕</button>
        </div>

        {/* Tab bar */}
        <div style={{ overflowX: 'auto', padding: '10px 16px', display: 'flex', gap: 8, borderBottom: '1px solid #F0E8E0', scrollbarWidth: 'none' }}>
          {SECTIONS.map(s => (
            <button
              key={s}
              onClick={() => setActiveSection(s)}
              style={{
                padding: '8px 14px', borderRadius: 20, border: 'none', whiteSpace: 'nowrap',
                background: activeSection === s ? '#6BA89E' : '#F0E8E0',
                color: activeSection === s ? 'white' : '#3D3535',
                fontSize: 13, fontWeight: 700, cursor: 'pointer',
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
        background: 'white', border: '2px solid #FDECEC',
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
