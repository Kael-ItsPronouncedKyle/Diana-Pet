import { useMemo } from 'react'
import SVGCreature from './SVGCreature'

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

export default function PetCreature({ creatureId, moodState, size = 90, streak = 0, reaction = null, compact = false }) {
  const showSparkles = useMemo(() => moodState === 'glow' && !compact, [moodState, compact])

  // Compact mode for mini-pet on non-home tabs
  if (compact) {
    return (
      <div style={{
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <SVGCreature creatureId={creatureId} moodState={moodState} size={size * 0.7} reaction={reaction} />
      </div>
    )
  }

  return (
    <div style={{ position: 'relative', width: size + 40, height: size + 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* Sparkle particles orbit */}
      {showSparkles && <SparkleParticles />}

      {/* The creature itself */}
      <SVGCreature creatureId={creatureId} moodState={moodState} size={size} reaction={reaction} />

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

      {/* Streak badge — enhanced with flame animation at milestones */}
      {streak >= 2 && moodState !== 'sleeping' && (
        <div style={{
          position: 'absolute',
          top: 4,
          right: -2,
          background: streak >= 7 ? '#FFF0D0' : '#FFF8E1',
          border: `2px solid ${streak >= 14 ? '#FFD700' : '#F0C050'}`,
          borderRadius: 12,
          padding: '3px 8px',
          fontSize: 12,
          fontWeight: 900,
          color: '#3D3535',
          whiteSpace: 'nowrap',
          animation: streak >= 7 ? 'flame-pulse 2s ease-in-out infinite' : 'none',
          boxShadow: streak >= 14 ? '0 0 8px rgba(255,215,0,0.4)' : 'none',
        }}>
          🔥{streak}
        </div>
      )}
    </div>
  )
}
