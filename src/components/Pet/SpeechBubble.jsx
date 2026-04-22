import { useState, useEffect, useRef } from 'react'

const IDLE_MESSAGES = [
  "I'm so glad you're here. 💚",
  "You're doing better than you think. 🌟",
  "Every check-in counts. Every single one.",
  "I see you showing up. That's everything.",
  "You are not alone in this. 🫶",
  "One step at a time. You've got this.",
  "Your feelings make sense. All of them.",
  "Rest is not giving up. Rest is real care.",
  "You are loved, exactly as you are. 💕",
  "Being here is enough. You're enough. ✨",
  "Hard days count too. You're still here.",
  "I'm proud of you. Even today. Especially today.",
]

export default function SpeechBubble({ message, onDismiss }) {
  const [visible, setVisible] = useState(false)
  const [closing, setClosing] = useState(false)
  const timerRef = useRef(null)
  const closeTimerRef = useRef(null)

  useEffect(() => {
    if (!message) return
    setClosing(false)
    setVisible(true)

    // Auto-dismiss after 4.5s — track the inner fade-out timer too so it
    // can be cleared on unmount or when `message` changes.
    timerRef.current = setTimeout(() => {
      setClosing(true)
      closeTimerRef.current = setTimeout(() => {
        setVisible(false)
        onDismiss?.()
      }, 300)
    }, 4500)

    return () => {
      clearTimeout(timerRef.current)
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    }
  }, [message, onDismiss])

  const dismiss = () => {
    clearTimeout(timerRef.current)
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    setClosing(true)
    closeTimerRef.current = setTimeout(() => {
      setVisible(false)
      onDismiss?.()
    }, 200)
  }

  if (!visible || !message) return null

  return (
    <div
      onClick={dismiss}
      style={{
        position: 'absolute',
        top: -10,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 10,
        cursor: 'pointer',
        animation: closing
          ? 'bubble-out 0.3s ease-in forwards'
          : 'bubble-in 0.3s ease-out forwards',
      }}
    >
      <div style={{
        background: 'white',
        borderRadius: 18,
        padding: '10px 16px',
        boxShadow: '0 4px 20px rgba(61,53,53,0.15)',
        fontSize: 14,
        fontWeight: 700,
        color: '#3D3535',
        maxWidth: 260,
        whiteSpace: 'normal',
        textAlign: 'center',
        lineHeight: 1.35,
        border: '2px solid #E8F4F1',
      }}>
        {message}
      </div>
      {/* Arrow pointing down toward the creature */}
      <div style={{
        width: 0,
        height: 0,
        borderLeft: '8px solid transparent',
        borderRight: '8px solid transparent',
        borderTop: '10px solid white',
        margin: '-1px auto 0',
        filter: 'drop-shadow(0 2px 2px rgba(61,53,53,0.08))',
      }} />
    </div>
  )
}

export function useIdleBubble() {
  const [idleMsg, setIdleMsg] = useState(null)
  const idxRef = useRef(0)
  const nextRef = useRef(null)

  useEffect(() => {
    // Show first idle message after 5s
    const first = setTimeout(() => {
      setIdleMsg(IDLE_MESSAGES[idxRef.current % IDLE_MESSAGES.length])
    }, 5000)
    return () => {
      clearTimeout(first)
      if (nextRef.current) clearTimeout(nextRef.current)
    }
  }, [])

  const handleDismiss = () => {
    setIdleMsg(null)
    // Next idle message in 45s — track the timeout so unmount can cancel it.
    if (nextRef.current) clearTimeout(nextRef.current)
    nextRef.current = setTimeout(() => {
      idxRef.current++
      setIdleMsg(IDLE_MESSAGES[idxRef.current % IDLE_MESSAGES.length])
    }, 45000)
  }

  return { idleMsg, setIdleMsg, handleDismiss }
}
