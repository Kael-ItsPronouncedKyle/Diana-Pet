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

// SVG progress ring showing today's check-in progress
function ProgressRing({ done, total, size }) {
  const ringSize = size + 48 // outer container size
  const center = ringSize / 2
  const radius = (ringSize - 14) / 2
  const circumference = 2 * Math.PI * radius
  const progress = total > 0 ? Math.min(done / total, 1) : 0
  const offset = circumference - progress * circumference
  const isComplete = done >= total

  return (
    <svg
      width={ringSize}
      height={ringSize}
      style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)', pointerEvents: 'none' }}
    >
      {/* Background track */}
      <circle
        cx={center} cy={center} r={radius}
        fill="none"
        stroke="#F0E8E0"
        strokeWidth={6}
      />
      {/* Progress arc */}
      <circle
        cx={center} cy={center} r={radius}
        fill="none"
        stroke={isComplete ? '#F0C050' : '#6BA89E'}
        strokeWidth={6}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 0.6s ease, stroke 0.4s ease' }}
      />
    </svg>
  )
}

export default function PetCreature({ creatureId, moodState, size = 90, streak = 0, checkInCount = 0, totalCheckIns = 8, pendingMsgs = 0 }) {
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
  const containerSize = size + 48

  return (
    <div style={{ position: 'relative', width: containerSize, height: containerSize, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* Progress ring */}
      <ProgressRing done={checkInCount} total={totalCheckIns} size={size} />

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

      {/* Pending messages dot */}
      {pendingMsgs > 0 && (
        <div style={{
          position: 'absolute',
          top: 6,
          left: 6,
          width: 18,
          height: 18,
          borderRadius: '50%',
          background: '#E8907E',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 10,
          fontWeight: 900,
          color: 'white',
          border: '2px solid white',
        }}>
          {pendingMsgs}
        </div>
      )}

      {/* Check-in count label (bottom of ring) */}
      {checkInCount > 0 && (
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          background: checkInCount >= totalCheckIns ? '#FFF8E1' : 'white',
          border: `1.5px solid ${checkInCount >= totalCheckIns ? '#F0C050' : '#E8F4F1'}`,
          borderRadius: 10,
          padding: '1px 7px',
          fontSize: 10,
          fontWeight: 800,
          color: checkInCount >= totalCheckIns ? '#C09020' : '#6BA89E',
          whiteSpace: 'nowrap',
        }}>
          {checkInCount}/{totalCheckIns}
        </div>
      )}
    </div>
  )
}
