import { useMemo } from 'react'

const TOTAL = 13
const RADIUS = 52
const STROKE = 6
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
const SIZE = (RADIUS + STROKE) * 2

export default function ProgressRing({ count, size = SIZE }) {
  const progress = Math.min(count / TOTAL, 1)
  const offset = CIRCUMFERENCE * (1 - progress)
  const scale = size / SIZE

  const color = useMemo(() => {
    if (count === 0) return '#E0D8D0'
    if (count < 4) return '#6BA8D6'
    if (count < 7) return '#6BA89E'
    if (count < 10) return '#6BBF8A'
    if (count < TOTAL) return '#F0C050'
    return '#FFD700'
  }, [count])

  const glowing = count >= TOTAL

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      style={{
        transform: 'rotate(-90deg)',
        filter: glowing ? `drop-shadow(0 0 8px ${color}80)` : 'none',
        transition: 'filter 0.5s ease',
      }}
    >
      {/* Background track */}
      <circle
        cx={SIZE / 2}
        cy={SIZE / 2}
        r={RADIUS}
        fill="none"
        stroke="#F0E8E0"
        strokeWidth={STROKE}
      />
      {/* Progress arc */}
      <circle
        cx={SIZE / 2}
        cy={SIZE / 2}
        r={RADIUS}
        fill="none"
        stroke={color}
        strokeWidth={STROKE}
        strokeLinecap="round"
        strokeDasharray={CIRCUMFERENCE}
        strokeDashoffset={offset}
        style={{
          transition: 'stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.4s ease',
        }}
      />
    </svg>
  )
}
