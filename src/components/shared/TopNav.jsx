export default function TopNav({ onGoHome }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', marginBottom: 16,
      paddingBottom: 12, borderBottom: '1px solid #E8F4F1',
    }}>
      <button
        onClick={onGoHome}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 14, fontWeight: 700, color: '#6BA89E',
          padding: '8px 12px', borderRadius: 12,
          transition: 'all 0.15s ease-out',
          WebkitTapHighlightColor: 'transparent',
          ':hover': { background: '#E8F4F1' },
        }}
        onMouseEnter={(e) => e.target.style.background = '#E8F4F1'}
        onMouseLeave={(e) => e.target.style.background = 'none'}
      >
        <span>←</span>
        <span>Home</span>
      </button>
    </div>
  )
}
