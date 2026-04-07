import { useState, useCallback } from 'react'
import { KAEL_MESSAGES, selectMessage, getContextTags } from '../../constants/kaelMessages.js'

export default function KaelVoiceLibrary({ profile, daily, compact = false }) {
  const [seenIds, setSeenIds] = useState(() => new Set())
  const [current, setCurrent] = useState(() => {
    const tags = getContextTags(daily)
    const result = selectMessage(KAEL_MESSAGES, tags, new Set())
    return result // { msg, idx, matchCount, hasGeneral }
  })

  const handleNext = useCallback(() => {
    const tags = getContextTags(daily)
    const nextSeen = new Set(seenIds)
    if (current) nextSeen.add(current.idx)

    // Reset if we've seen everything
    const effective = nextSeen.size >= KAEL_MESSAGES.length ? new Set() : nextSeen

    const result = selectMessage(KAEL_MESSAGES, tags, effective)
    setCurrent(result)
    if (effective.size === 0) {
      setSeenIds(new Set(result ? [result.idx] : []))
    } else {
      if (result) effective.add(result.idx)
      setSeenIds(effective)
    }
  }, [daily, seenIds, current])

  const messageText = current?.msg?.text || "I'm here whenever you need me."

  if (compact) {
    return (
      <div
        style={{
          background: 'var(--primary-light)',
          borderLeft: '4px solid var(--primary)',
          borderRadius: 12,
          padding: '12px 14px',
          marginBottom: 12,
        }}
      >
        <p
          style={{
            fontSize: '12px',
            color: 'var(--text)',
            fontStyle: 'italic',
            margin: 0,
            lineHeight: 1.4,
          }}
        >
          "{messageText}"
        </p>
        <button
          onClick={handleNext}
          style={{
            marginTop: '8px',
            padding: '6px 12px',
            background: 'var(--primary)',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            fontSize: '11px',
            fontWeight: 600,
            cursor: 'pointer',
            minHeight: '32px',
          }}
        >
          Another
        </button>
      </div>
    )
  }

  return (
    <div style={{ padding: '18px', maxWidth: '430px', margin: '0 auto' }}>
      <h3 style={{ color: 'var(--text)', fontSize: '16px', fontWeight: 600, margin: '0 0 14px 0' }}>
        Words from Kael 💚
      </h3>

      <div
        style={{
          background: 'var(--primary-light)',
          borderLeft: '5px solid var(--primary)',
          borderRadius: 14,
          padding: '18px',
          marginBottom: '16px',
          minHeight: '120px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <p
          style={{
            fontSize: '14px',
            color: 'var(--text)',
            fontStyle: 'italic',
            margin: 0,
            lineHeight: 1.6,
          }}
        >
          "{messageText}"
        </p>
      </div>

      <button
        onClick={handleNext}
        style={{
          width: '100%',
          padding: '13px',
          background: 'var(--primary)',
          color: 'white',
          border: 'none',
          borderRadius: 12,
          fontSize: '13px',
          fontWeight: 600,
          cursor: 'pointer',
          minHeight: '44px',
        }}
      >
        Another
      </button>

      {seenIds.size < KAEL_MESSAGES.length && (
        <p
          style={{
            marginTop: '10px',
            textAlign: 'center',
            fontSize: '12px',
            color: 'var(--text-light)',
          }}
        >
          {KAEL_MESSAGES.length - seenIds.size} more to discover
        </p>
      )}
    </div>
  )
}
