const TABS = [
  { id: 'home', emoji: '🏠', label: 'Home' },
  { id: 'recovery', emoji: '💚', label: 'Recovery' },
  { id: 'body', emoji: '💧', label: 'Body' },
  { id: 'puppies', emoji: '🐾', label: 'Puppies' },
  { id: 'week', emoji: '📊', label: 'Week' },
]

export default function BottomNav({ activeTab, onTabChange }) {
  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '100%',
      maxWidth: 430,
      background: 'var(--card, white)',
      borderTop: '1px solid #F0E8E0',
      display: 'flex',
      paddingBottom: 'env(safe-area-inset-bottom)',
      zIndex: 500,
      boxShadow: '0 -4px 20px rgba(61,53,53,0.08)',
    }}>
      {TABS.map(tab => {
        const active = activeTab === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            style={{
              flex: 1,
              padding: '10px 4px 8px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
              transition: 'transform 0.1s',
            }}
            onMouseDown={e => e.currentTarget.style.transform = 'scale(0.9)'}
            onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
            onTouchStart={e => e.currentTarget.style.transform = 'scale(0.9)'}
            onTouchEnd={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <span style={{
              fontSize: 22,
              transition: 'transform 0.2s',
              transform: active ? 'scale(1.15)' : 'scale(1)',
            }}>{tab.emoji}</span>
            <span style={{
              fontSize: 10,
              fontWeight: active ? 900 : 600,
              color: active ? 'var(--primary, #6BA89E)' : 'var(--text-light, #8A7F7F)',
              letterSpacing: 0.2,
            }}>
              {tab.label}
            </span>
            <div style={{
              width: active ? 20 : 0,
              height: 3,
              borderRadius: 2,
              background: 'var(--primary, #6BA89E)',
              transition: 'width 0.2s ease',
            }} />
          </button>
        )
      })}
    </nav>
  )
}
