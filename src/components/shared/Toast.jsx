import { useState, useEffect } from 'react'

export default function Toast({ message, onDone }) {
  const [visible, setVisible] = useState(false)
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    if (!message) return
    setExiting(false)
    setVisible(true)
    const t = setTimeout(() => {
      setExiting(true)
      setTimeout(() => { setVisible(false); onDone?.() }, 300)
    }, 2200)
    return () => clearTimeout(t)
  }, [message])

  if (!visible || !message) return null

  return (
    <div style={{
      position: 'fixed',
      top: 68,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 1100,
      animation: exiting ? 'toast-out 0.3s ease-in forwards' : 'toast-in 0.3s ease-out forwards',
    }}>
      <div style={{
        background: '#3D3535',
        color: 'white',
        padding: '10px 20px',
        borderRadius: 20,
        fontSize: 14,
        fontWeight: 700,
        boxShadow: '0 4px 20px rgba(61,53,53,0.25)',
        whiteSpace: 'nowrap',
        maxWidth: 340,
        textAlign: 'center',
      }}>
        {message}
      </div>
    </div>
  )
}
