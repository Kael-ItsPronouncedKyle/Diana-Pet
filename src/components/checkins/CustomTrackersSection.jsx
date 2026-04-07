import { useState, useMemo } from 'react'
import BackToHomeBanner from '../shared/BackToHomeBanner.jsx'

const C = {
  primary: '#6BA89E',
  primaryLight: '#E8F4F1',
  accent: '#E8907E',
  text: '#3D3535',
  textLight: '#8A7F7F',
  green: '#6BBF8A',
  greenBg: '#E6F7EC',
  yellow: '#F0C050',
  yellowBg: '#FFF8E1',
  red: '#E87B7B',
  redBg: '#FDECEC',
  card: '#FFFFFF',
}

const card = {
  background: C.card,
  borderRadius: 20,
  padding: '18px',
  boxShadow: '0 2px 12px rgba(61,53,53,0.08)',
  marginBottom: 14,
}

const TEMPLATE_SUGGESTIONS = [
  { name: 'Did I shower?', emoji: '🚿' },
  { name: 'Did I brush my teeth?', emoji: '🪥' },
  { name: 'Did I get dressed?', emoji: '👕' },
  { name: 'Did I text someone?', emoji: '💬' },
  { name: 'Did I leave the house?', emoji: '🏠' },
  { name: 'Did I do dishes?', emoji: '🍽️' },
  { name: 'Did I do laundry?', emoji: '🧺' },
]

function CustomTrackersSection({ daily, onUpdate, profile, fromHome, onGoHome }) {
  const trackers = profile?.customTrackers || []
  const trackerStatus = daily?.customTrackers || {}

  const completed = useMemo(() => {
    return trackers.filter((t) => trackerStatus[t.id]).length
  }, [trackers, trackerStatus])

  const toggleTracker = (trackerId) => {
    const newStatus = {
      ...trackerStatus,
      [trackerId]: !trackerStatus[trackerId],
    }
    onUpdate({ customTrackers: newStatus })
  }

  if (!trackers || trackers.length === 0) {
    return (
      <div style={{ animation: 'fade-up 0.25s ease-out' }}>
        <BackToHomeBanner show={fromHome} onGoHome={onGoHome} />

        <div style={card}>
          <div
            style={{
              fontSize: 15,
              fontWeight: 800,
              color: C.text,
              marginBottom: 12,
              textAlign: 'center',
            }}
          >
            You haven't made any trackers yet.
          </div>
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: C.textLight,
              marginBottom: 16,
              textAlign: 'center',
              lineHeight: 1.4,
            }}
          >
            Go to Settings to add some! ⚙️
          </div>

          <div style={{ marginBottom: 12 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: C.text,
                marginBottom: 8,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}
            >
              Ideas to get started:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {TEMPLATE_SUGGESTIONS.slice(0, 4).map((template) => (
                <div
                  key={template.name}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 12,
                    background: '#F5F5F5',
                    fontSize: 13,
                    fontWeight: 600,
                    color: C.text,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <span style={{ fontSize: 16 }}>{template.emoji}</span>
                  {template.name}
                </div>
              ))}
            </div>
          </div>
        </div>
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
            marginBottom: 4,
          }}
        >
          My Trackers
        </div>
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: C.green,
            marginBottom: 14,
          }}
        >
          {completed} of {trackers.length} done today
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {trackers.map((tracker) => {
            const isChecked = trackerStatus[tracker.id] || false
            return (
              <button
                key={tracker.id}
                onClick={() => toggleTracker(tracker.id)}
                style={{
                  padding: '14px',
                  borderRadius: 14,
                  border: `2px solid ${isChecked ? C.green : '#F0E8E0'}`,
                  background: isChecked ? C.greenBg : 'white',
                  color: isChecked ? C.green : C.text,
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: 'pointer',
                  minHeight: 44,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  transition: 'all 0.15s ease',
                }}
              >
                <span style={{ fontSize: 18 }}>{tracker.emoji || '⭕'}</span>
                {tracker.name}
                {isChecked && <span style={{ marginLeft: 'auto' }}>✓</span>}
              </button>
            )
          })}
        </div>
      </div>

      {trackers.length < 3 && (
        <div style={{ ...card, background: C.primaryLight, border: `2px solid ${C.primary}` }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 10 }}>
            More tracker ideas:
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {TEMPLATE_SUGGESTIONS.slice(3).map((template) => (
              <div
                key={template.name}
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: C.text,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  opacity: 0.7,
                }}
              >
                <span>{template.emoji}</span>
                {template.name}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default CustomTrackersSection
