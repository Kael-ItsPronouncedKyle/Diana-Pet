import { useState } from 'react'
import BackToHomeBanner from '../shared/BackToHomeBanner.jsx'

const C = {
  primary: '#6BA89E', primaryLight: '#E8F4F1', accent: '#E8907E',
  text: '#3D3535', textLight: '#8A7F7F', green: '#6BBF8A', greenBg: '#E6F7EC',
  yellow: '#F0C050', yellowBg: '#FFF8E1', red: '#E87B7B', redBg: '#FDECEC',
  blue: '#6BA8D6', blueBg: '#E8F1FA', card: '#FFFFFF', bg: '#FFF8F3',
}

const card = { background: C.card, borderRadius: 20, padding: '18px', boxShadow: '0 2px 12px rgba(61,53,53,0.08)', marginBottom: 14 }
const btn = (active, color = C.blue) => ({
  padding: '12px 14px', borderRadius: 14, border: `2px solid ${active ? color : '#F0E8E0'}`,
  background: active ? color + '22' : 'white', color: active ? color : C.text,
  fontSize: 14, fontWeight: 700, cursor: 'pointer', minHeight: 44,
})

const DURATIONS = [5, 10, 15, 30, 60]

function ReadingSection({ daily, onUpdate, fromHome, onGoHome }) {
  const r = daily?.reading || {}
  const [what, setWhat] = useState(r.what || '')
  const [minutes, setMinutes] = useState(r.minutes || null)
  const [saved, setSaved] = useState(!!r.minutes)

  const getMessage = () => {
    if (!minutes) return null
    if (minutes >= 60) return "A whole hour! That's amazing. 📚✨"
    if (minutes >= 15) return "Nice reading time! Your brain is growing. 📚"
    return "Every page counts. 📖"
  }

  const save = () => {
    onUpdate({ reading: { minutes, what } })
    setSaved(true)
  }

  return (
    <div style={{ animation: 'fade-up 0.25s ease-out' }}>
      <BackToHomeBanner show={saved && fromHome} onGoHome={onGoHome} />

      {saved && (
        <div style={{ ...card, background: C.blueBg, border: `2px solid ${C.blue}` }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: C.text, margin: 0, lineHeight: 1.5 }}>
            {getMessage()}
          </p>
          <p style={{ fontSize: 13, color: C.textLight, marginTop: 10, marginBottom: 0 }}>Keep reading to build a streak! 📖</p>
        </div>
      )}

      <div style={card}>
        <div style={{ fontSize: 14, fontWeight: 800, color: C.text, marginBottom: 10 }}>What did you read or listen to?</div>
        <textarea
          value={what}
          onChange={e => setWhat(e.target.value)}
          placeholder="A book, article, podcast, audiobook... (skip if you want)"
          style={{
            width: '100%', padding: '12px 14px', borderRadius: 14, border: '2px solid #F0E8E0',
            fontSize: 14, color: C.text, background: 'white', outline: 'none',
            fontFamily: 'inherit', marginBottom: 16, resize: 'vertical', minHeight: 60,
          }}
        />

        <div style={{ fontSize: 14, fontWeight: 800, color: C.text, marginBottom: 14 }}>How long?</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
          {DURATIONS.map(d => (
            <button
              key={d}
              onClick={() => setMinutes(d)}
              style={{ ...btn(minutes === d, C.blue), flex: 1, minWidth: 'calc(50% - 4px)' }}
            >
              {d} min
            </button>
          ))}
        </div>

        <button onClick={save} style={{ width: '100%', padding: '14px', borderRadius: 14, border: 'none', background: C.blue, color: 'white', fontSize: 15, fontWeight: 800, cursor: 'pointer', minHeight: 44 }}>
          Save reading ✓
        </button>
      </div>
    </div>
  )
}

export default ReadingSection
