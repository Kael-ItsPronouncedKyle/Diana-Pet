import { useState, useCallback } from 'react'
import PetCreature from './PetCreature.jsx'
import SpeechBubble, { useIdleBubble } from './SpeechBubble.jsx'
import { getMoodState, MOOD_MESSAGES } from '../../utils/checkIns.js'
import { CREATURES } from '../../constants/creatures.js'

export default function Pet({ checkInCount, totalCheckIns = 8, creatureId, creatureName, streak, msgQueue = [], onMsgRead }) {
  const moodState = getMoodState(checkInCount)
  const { idleMsg, handleDismiss } = useIdleBubble()

  // Event messages take priority over idle
  const currentMsg = msgQueue[0] || null
  const activeBubbleMsg = currentMsg || idleMsg

  const handleBubbleDismiss = useCallback(() => {
    if (currentMsg) {
      onMsgRead?.()
    } else {
      handleDismiss()
    }
  }, [currentMsg, onMsgRead, handleDismiss])

  const creature = CREATURES.find(c => c.id === creatureId) || CREATURES[0]
  const name = creatureName || creature.name
  // Queued messages beyond the current one
  const pendingCount = Math.max(0, msgQueue.length - 1)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 24, paddingBottom: 8, gap: 4 }}>
      {/* Speech bubble area — fixed height so layout doesn't jump */}
      <div style={{ position: 'relative', height: 60, width: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
        <SpeechBubble
          message={activeBubbleMsg}
          onDismiss={handleBubbleDismiss}
        />
      </div>

      {/* The creature with progress ring */}
      <PetCreature
        creatureId={creatureId}
        moodState={moodState}
        size={90}
        streak={streak}
        checkInCount={checkInCount}
        totalCheckIns={totalCheckIns}
        pendingMsgs={pendingCount}
      />

      {/* Creature name + mood label */}
      <div style={{ textAlign: 'center', marginTop: 4 }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: '#3D3535' }}>{name}</div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#8A7F7F', marginTop: 2 }}>
          {MOOD_MESSAGES[moodState]}
        </div>
      </div>

      {/* Pending messages badge */}
      {pendingCount > 0 && (
        <div style={{
          background: '#E8F4F1', borderRadius: 12, padding: '4px 12px',
          fontSize: 12, fontWeight: 800, color: '#6BA89E',
          border: '1.5px solid #6BA89E',
        }}>
          +{pendingCount} more moment{pendingCount > 1 ? 's' : ''} — tap bubble to read
        </div>
      )}
    </div>
  )
}
