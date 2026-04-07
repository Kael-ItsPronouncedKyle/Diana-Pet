import { useState, useEffect, useRef } from 'react'

export default function BackToHomeBanner({ show, onGoHome }) {
  const [cancelled, setCancelled] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    if (!show || cancelled) return
    timerRef.current = setTimeout(() => {
      onGoHome()
    }, 2000)
    return () => clearTimeout(timerRef.current)
  }, [show, cancelled, onGoHome])

  // Reset cancelled state when show changes
  useEffect(() => {
    if (!show) setCancelled(false)
  }, [show])

  if (!show || cancelled) return null

  return (
    <div style={{
      background: '#E8F4F1', borderRadius: 16, padding: '14px 16px',
      border: '2px solid #6BA89E', marginBottom: 14,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      animation: 'fade-up 0.2s ease-out',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 18 }}>✅</span>
        <span style={{ fontSize: 14, fontWeight: 700, color: '#3D3535' }}>
          Saved! Going back home...
        </span>
      </div>
      <button
        onClick={() => {
          clearTimeout(timerRef.current)
          setCancelled(true)
        }}
        style={{
          padding: '8px 14px', borderRadius: 12, border: 'none',
          background: 'white', color: '#6BA89E', fontSize: 13,
          fontWeight: 800, cursor: 'pointer', whiteSpace: 'nowrap',
        }}
      >
        Stay here
      </button>
    </div>
  )
}
