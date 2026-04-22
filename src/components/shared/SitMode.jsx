import { useEffect, useState } from 'react'
import PetCreature from '../Pet/PetCreature.jsx'
import { KAEL_MESSAGES, selectMessage, getContextTags } from '../../constants/kaelMessages.js'

/**
 * SitMode — the third state between "check in" and "crisis."
 *
 * Diana can tap her creature on Home to land here. The creature fills the
 * screen, one Kael line shows, the crisis button stays present (rendered
 * by App.jsx), and everything else dims. No check-ins pushed, no progress
 * tracked. This is a pause.
 *
 * Closes with a tap anywhere (outside the "another line" button) or the X.
 */
export default function SitMode({ creatureId, moodState, daily, onClose }) {
  const [message, setMessage] = useState(null)

  useEffect(() => {
    const tags = getContextTags(daily || {})
    const picked = selectMessage(KAEL_MESSAGES, tags, new Set())
    setMessage(picked?.msg?.text || "I'm here. Just sit with me.")
  }, [daily])

  const another = (e) => {
    e.stopPropagation()
    const tags = getContextTags(daily || {})
    const picked = selectMessage(KAEL_MESSAGES, tags, new Set())
    setMessage(picked?.msg?.text || "I'm here. Just sit with me.")
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 950,
        background: 'rgba(61,53,53,0.82)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: 24,
        animation: 'fade-up 0.3s ease-out',
        backdropFilter: 'blur(4px)',
      }}
      aria-label="Sit with your creature. Tap to close."
    >
      <button
        onClick={onClose}
        aria-label="Close"
        style={{
          position: 'absolute', top: 'max(16px, env(safe-area-inset-top))', right: 16,
          width: 44, height: 44, borderRadius: '50%',
          background: 'rgba(255,255,255,0.15)', color: 'white',
          border: 'none', fontSize: 22, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        ✕
      </button>

      {/* Creature — clicking it does nothing (swallow to prevent onClose) */}
      <div onClick={e => e.stopPropagation()} style={{ marginBottom: 32 }}>
        <PetCreature creatureId={creatureId} moodState={moodState || 'bounce'} size={180} />
      </div>

      {/* Speech bubble */}
      {message && (
        <div
          onClick={e => e.stopPropagation()}
          style={{
            background: 'white',
            borderRadius: 22,
            padding: '18px 22px',
            maxWidth: 320,
            textAlign: 'center',
            boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
            marginBottom: 20,
          }}
        >
          <div style={{
            fontSize: 16, fontWeight: 700,
            color: 'var(--text, #3D3535)',
            lineHeight: 1.5,
            fontStyle: 'italic',
          }}>
            "{message}"
          </div>
        </div>
      )}

      <button
        onClick={another}
        style={{
          padding: '12px 24px', borderRadius: 14,
          background: 'white', color: 'var(--text, #3D3535)',
          border: 'none',
          fontSize: 14, fontWeight: 800, cursor: 'pointer',
          minHeight: 44,
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        }}
      >
        Another line
      </button>

      <div
        style={{
          marginTop: 32, textAlign: 'center',
          color: 'rgba(255,255,255,0.7)',
          fontSize: 12, fontWeight: 600,
          maxWidth: 280, lineHeight: 1.5,
        }}
      >
        Tap anywhere to go back. The crisis button still works.
      </div>
    </div>
  )
}
