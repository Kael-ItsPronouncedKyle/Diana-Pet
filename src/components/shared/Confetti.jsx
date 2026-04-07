import { useState, useEffect } from 'react'

const PARTICLES = 12
const COLORS = ['#6BBF8A', '#F0C050', '#6BA8D6', '#E8907E', '#FFD700', '#6BA89E']

export default function Confetti({ trigger }) {
  const [show, setShow] = useState(false)
  const [key, setKey] = useState(0)

  useEffect(() => {
    if (!trigger) return
    setKey(k => k + 1)
    setShow(true)
    const t = setTimeout(() => setShow(false), 700)
    return () => clearTimeout(t)
  }, [trigger])

  if (!show) return null

  return (
    <div key={key} style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      pointerEvents: 'none', zIndex: 1200,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {Array.from({ length: PARTICLES }, (_, i) => {
        const angle = (i / PARTICLES) * 360
        const distance = 60 + Math.random() * 80
        const size = 6 + Math.random() * 6
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: size,
              height: size,
              borderRadius: Math.random() > 0.5 ? '50%' : '2px',
              background: COLORS[i % COLORS.length],
              animation: `confetti-burst 0.6s ease-out forwards`,
              '--angle': `${angle}deg`,
              '--distance': `${distance}px`,
              opacity: 0,
            }}
          />
        )
      })}
    </div>
  )
}
