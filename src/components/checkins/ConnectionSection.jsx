import { useState } from 'react'
import BackToHomeBanner from '../shared/BackToHomeBanner.jsx'

const C = {
  primary: '#6BA89E', primaryLight: '#E8F4F1', accent: '#E8907E',
  text: '#3D3535', textLight: '#8A7F7F', green: '#6BBF8A', greenBg: '#E6F7EC',
  yellow: '#F0C050', yellowBg: '#FFF8E1', red: '#E87B7B', redBg: '#FDECEC',
  blue: '#6BA8D6', blueBg: '#E8F1FA', card: '#FFFFFF', bg: '#FFF8F3',
}

const card = { background: C.card, borderRadius: 20, padding: '18px', boxShadow: '0 2px 12px rgba(61,53,53,0.08)', marginBottom: 14 }
const btn = (active, color = C.primary) => ({
  padding: '12px 14px', borderRadius: 14, border: `2px solid ${active ? color : '#F0E8E0'}`,
  background: active ? color + '22' : 'white', color: active ? color : C.text,
  fontSize: 14, fontWeight: 700, cursor: 'pointer', minHeight: 44,
})

function ConnectionSection({ daily, onUpdate, fromHome, onGoHome }) {
  const c = daily?.connection || {}
  const [closeness, setCloseness] = useState(c.closeness !== undefined ? c.closeness : null)
  const [luis, setLuis] = useState(c.luis || null)
  const [laughed, setLaughed] = useState(c.laughed !== undefined ? c.laughed : null)
  const [seen, setSeen] = useState(c.seen !== undefined ? c.seen : null)
  const [note, setNote] = useState(c.note || '')
  const [saved, setSaved] = useState(!!c.closeness)

  const yesCount = [closeness, laughed, seen].filter(v => v === true).length

  const save = () => {
    onUpdate({ connection: { closeness, luis, laughed, seen, note } })
    setSaved(true)
  }

  return (
    <div style={{ animation: 'fade-up 0.25s ease-out' }}>
      <BackToHomeBanner show={saved && fromHome} onGoHome={onGoHome} />

      {saved && (
        <div style={{ ...card, background: C.greenBg, border: `2px solid ${C.green}` }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: C.text, margin: 0, lineHeight: 1.5 }}>
            {yesCount === 0 && "Hard days happen. You still showed up. 💙"}
            {yesCount === 1 && "One connection is a start. That matters. 💚"}
            {yesCount === 2 && "Two good connections today. You're doing it. 💚"}
            {yesCount >= 3 && "Three connections! You're building a life worth living. 💚"}
          </p>
          <p style={{ fontSize: 13, color: C.textLight, marginTop: 10, marginBottom: 0 }}>Connection is part of recovery. Reaching out isn't just nice — it's healing. 💚</p>
        </div>
      )}

      <div style={card}>
        <div style={{ fontSize: 14, fontWeight: 800, color: C.text, marginBottom: 14 }}>Did you feel close to someone?</div>
        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          <button onClick={() => setCloseness(true)} style={{ ...btn(closeness === true, C.green), flex: 1 }}>Yes</button>
          <button onClick={() => setCloseness(false)} style={{ ...btn(closeness === false, C.red), flex: 1 }}>No</button>
        </div>

        <div style={{ fontSize: 14, fontWeight: 800, color: C.text, marginBottom: 14 }}>Did you and Luis connect today?</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
          <button onClick={() => setLuis('Yes')} style={{ ...btn(luis === 'Yes', C.green), flex: 1, minWidth: 'calc(50% - 4px)' }}>Yes</button>
          <button onClick={() => setLuis('A little')} style={{ ...btn(luis === 'A little', C.blue), flex: 1, minWidth: 'calc(50% - 4px)' }}>A little</button>
          <button onClick={() => setLuis('Not really')} style={{ ...btn(luis === 'Not really', C.red), flex: 1, minWidth: 'calc(50% - 4px)' }}>Not really</button>
          <button onClick={() => setLuis("He's at work")} style={{ ...btn(luis === "He's at work", C.yellow), flex: 1, minWidth: 'calc(50% - 4px)' }}>He's at work</button>
        </div>

        <div style={{ fontSize: 14, fontWeight: 800, color: C.text, marginBottom: 14 }}>Did you laugh today?</div>
        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          <button onClick={() => setLaughed(true)} style={{ ...btn(laughed === true, C.green), flex: 1 }}>Yes</button>
          <button onClick={() => setLaughed(false)} style={{ ...btn(laughed === false, C.red), flex: 1 }}>No</button>
        </div>

        <div style={{ fontSize: 14, fontWeight: 800, color: C.text, marginBottom: 14 }}>Did you feel seen by someone?</div>
        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          <button onClick={() => setSeen(true)} style={{ ...btn(seen === true, C.green), flex: 1 }}>Yes</button>
          <button onClick={() => setSeen(false)} style={{ ...btn(seen === false, C.red), flex: 1 }}>No</button>
        </div>

        <div style={{ fontSize: 14, fontWeight: 800, color: C.text, marginBottom: 10 }}>Anything else? (skip if you want)</div>
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Share more if you want to..."
          style={{
            width: '100%', padding: '12px 14px', borderRadius: 14, border: '2px solid #F0E8E0',
            fontSize: 14, color: C.text, background: 'white', outline: 'none',
            fontFamily: 'inherit', marginBottom: 16, resize: 'vertical', minHeight: 80,
          }}
        />

        <button onClick={save} style={{ width: '100%', padding: '14px', borderRadius: 14, border: 'none', background: C.primary, color: 'white', fontSize: 15, fontWeight: 800, cursor: 'pointer', minHeight: 44 }}>
          Save connections ✓
        </button>
      </div>
    </div>
  )
}

export default ConnectionSection
