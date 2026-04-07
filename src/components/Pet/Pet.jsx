import { useState, useCallback } from 'react'
import PetCreature from './PetCreature.jsx'
import SpeechBubble, { useIdleBubble } from './SpeechBubble.jsx'
import { getMoodState, MOOD_MESSAGES } from '../../utils/checkIns.js'
import { CREATURES } from '../../constants/creatures.js'

export default function Pet({ checkInCount, creatureId, creatureName, streak, eventMessage, onEventMessageShown, reaction }) {
  const moodState = getMoodState(checkInCount)
  const { idleMsg, handleDismiss } = useIdleBubble()

  // Event messages take priority over idle
  const activeBubbleMsg = eventMessage || idleMsg
  const handleBubbleDismiss = useCallback(() => {
    if (eventMessage) {
      onEventMessageShown?.()
    } else {
      handleDismiss()
    }
  }, [eventMessage, onEventMessageShown, handleDismiss])

  const creature = CREATURES.find(c => c.id === creatureId) || CREATURES[0]
  const name = creatureName || creature.name

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 24, paddingBottom: 8, gap: 4 }}>
      {/* Speech bubble area — fixed height so layout doesn't jump */}
      <div style={{ position: 'relative', height: 60, width: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
        <SpeechBubble
          message={activeBubbleMsg}
          onDismiss={handleBubbleDismiss}
        />
      </div>

      {/* The creature */}
      <PetCreature
        creatureId={creatureId}
        moodState={moodState}
        size={90}
        streak={streak}
        reaction={reaction}
      />

      {/* Creature name + mood label */}
      <div style={{ textAlign: 'center', marginTop: 4 }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text, #3D3535)' }}>{name}</div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-light, #8A7F7F)', marginTop: 2 }}>
          {MOOD_MESSAGES[moodState]}
        </div>
      </div>
    </div>
  )
}

// Compact mini-pet for non-home tabs
export function MiniPet({ creatureId, moodState, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        position: 'fixed',
        top: 16,
        left: 68,
        zIndex: 899,
        width: 40,
        height: 40,
        borderRadius: '50%',
        background: 'white',
        border: '2px solid #E8F4F1',
        boxShadow: '0 2px 12px rgba(61,53,53,0.1)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 0,
        transition: 'transform 0.15s',
      }}
      onTouchStart={e => e.currentTarget.style.transform = 'scale(0.9)'}
      onTouchEnd={e => e.currentTarget.style.transform = 'scale(1)'}
    >
      <PetCreature
        creatureId={creatureId}
        moodState={moodState}
        size={28}
        compact
      />
    </button>
  )
}
