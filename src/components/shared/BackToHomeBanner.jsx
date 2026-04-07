export default function BackToHomeBanner({ show }) {
  if (!show) return null

  return (
    <div style={{
      background: '#E8F4F1', borderRadius: 16, padding: '14px 16px',
      border: '2px solid #6BA89E', marginBottom: 14,
      display: 'flex', alignItems: 'center', gap: 10,
      animation: 'fade-up 0.2s ease-out',
    }}>
      <span style={{ fontSize: 18 }}>✅</span>
      <span style={{ fontSize: 14, fontWeight: 700, color: '#3D3535' }}>
        Saved!
      </span>
    </div>
  )
}
