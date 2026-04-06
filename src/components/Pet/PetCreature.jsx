import { useMemo } from 'react'
import { CREATURES } from '../../constants/creatures.js'

const SPARKLE_COLORS = ['#F0C050', '#E8907E', '#FFD700', '#6BBF8A', '#6BA8D6', '#E87B7B']

function SparkleParticles() {
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {SPARKLE_COLORS.map((color, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: color,
            marginTop: -4,
            marginLeft: -4,
            '--start-angle': `${i * 60}deg`,
            animation: `sparkle-orbit ${2.5 + i * 0.3}s linear infinite`,
            animationDelay: `${i * 0.15}s`,
          }}
        />
      ))}
    </div>
  )
}

export default function PetCreature({ creatureId, moodState, size = 90, streak = 0 }) {
  const creature = useMemo(
    () => CREATURES.find(c => c.id === creatureId) || CREATURES[0],
    [creatureId]
  )

  const animStyle = useMemo(() => {
    switch (moodState) {
      case 'sleeping':
        return { animation: 'sleepy 3s ease-in-out infinite', opacity: 0.55 }
      case 'bounce':
        return { animation: 'bounce 1.2s ease-in-out infinite' }
      case 'wiggle':
        return { animation: 'wiggle 1.4s ease-in-out infinite' }
      case 'glow':
        return { animation: 'glow 2s ease-in-out infinite, wiggle 1.8s ease-in-out infinite' }
      default:
        return {}
    }
  }, [moodState])

  const showSparkles = moodState === 'glow'

  return (
    <div style={{ position: 'relative', width: size + 40, height: size + 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* Sparkle particles orbit */}
      {showSparkles && <SparkleParticles />}

      {/* The creature itself */}
      <div
        style={{
          fontSize: size,
          lineHeight: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          userSelect: 'none',
          ...animStyle,
        }}
      >
        {creature.emoji}
      </div>

      {/* Sleeping ZZZ indicator */}
      {moodState === 'sleeping' && (
        <div style={{
          position: 'absolute',
          top: 4,
          right: 0,
          fontSize: 16,
          animation: 'pulse 2s ease-in-out infinite',
          lineHeight: 1,
        }}>
          💤
        </div>
      )}

      {/* Streak badge at 2+ days */}
      {streak >= 2 && moodState !== 'sleeping' && (
        <div style={{
          position: 'absolute',
          top: 4,
          right: -2,
          background: '#FFF8E1',
          border: '2px solid #F0C050',
          borderRadius: 10,
          padding: '2px 6px',
          fontSize: 11,
          fontWeight: 800,
          color: '#3D3535',
          whiteSpace: 'nowrap',
        }}>
          🔥{streak}
        </div>
      )}
    </div>
  )
}
