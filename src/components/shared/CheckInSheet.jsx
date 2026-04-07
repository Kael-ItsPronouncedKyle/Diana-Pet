import { useState, useEffect, useRef } from 'react'

export default function CheckInSheet({ isOpen, onClose, title, children }) {
  const [closing, setClosing] = useState(false)
  const backdropRef = useRef(null)

  const close = () => {
    setClosing(true)
    setTimeout(() => { setClosing(false); onClose() }, 250)
  }

  // Prevent body scroll when sheet is open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen && !closing) return null

  return (
    <div
      ref={backdropRef}
      onClick={e => e.target === backdropRef.current && close()}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(61,53,53,0.5)',
        display: 'flex', alignItems: 'flex-end',
        animation: closing ? 'sheet-backdrop-out 0.25s ease-in forwards' : 'sheet-backdrop-in 0.25s ease-out forwards',
      }}
    >
      <div style={{
        background: '#FFF8F3',
        width: '100%',
        maxWidth: 430,
        margin: '0 auto',
        borderRadius: '24px 24px 0 0',
        maxHeight: '88dvh',
        display: 'flex',
        flexDirection: 'column',
        animation: closing ? 'sheet-slide-down 0.25s ease-in forwards' : 'sheet-slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      }}>
        {/* Handle + header */}
        <div style={{ padding: '12px 20px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: '#E0D8D0', marginBottom: 10 }} />
          <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 17, fontWeight: 900, color: '#3D3535' }}>{title}</div>
            <button
              onClick={close}
              style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#8A7F7F', padding: '4px 8px', borderRadius: 8 }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{
          flex: 1, overflowY: 'auto', padding: '8px 16px 24px',
          paddingBottom: 'max(24px, env(safe-area-inset-bottom))',
          WebkitOverflowScrolling: 'touch',
        }}>
          {children}
        </div>
      </div>
    </div>
  )
}
