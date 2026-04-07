export default function BackToHomeBanner({ show, onGoHome }) {
  if (!show) return null

  return (
    <button
      onClick={onGoHome}
      style={{
        width: '100%',
        background: '#E8F4F1', borderRadius: 16, padding: '14px 16px',
        border: '2px solid #6BA89E', marginBottom: 14,
        display: 'flex', alignItems: 'center', gap: 10,
        animation: 'fade-up 0.2s ease-out',
        cursor: onGoHome ? 'pointer' : 'default',
        textAlign: 'left',
      }}
    >
      <span style={{ fontSize: 18 }}>✅</span>
      <span style={{ flex: 1, fontSize: 14, fontWeight: 700, color: '#3D3535' }}>
        Saved!
      </span>
      {onGoHome && (
        <span style={{ fontSize: 13, fontWeight: 700, color: '#6BA89E' }}>
          ← Home
        </span>
      )}
    </button>
  )
}
