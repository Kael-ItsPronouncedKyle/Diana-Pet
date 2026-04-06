import { useState, useCallback } from 'react'
import PetCreature from './PetCreature.jsx'
import SpeechBubble, { useIdleBubble } from './SpeechBubble.jsx'
import { getMoodState, MOOD_MESSAGES } from '../../utils/checkIns.js'
import { CREATURES } from '../../constants/creatures.js'

export default function Pet({ checkInCount, creatureId, creatureName, streak, eventMessage, onEventMessageShown }) {
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
      />

      {/* Creature name + mood label */}
      <div style={{ textAlign: 'center', marginTop: 4 }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: '#3D3535' }}>{name}</div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#8A7F7F', marginTop: 2 }}>
          {MOOD_MESSAGES[moodState]}
        </div>
      </div>
    </div>
  )
}
