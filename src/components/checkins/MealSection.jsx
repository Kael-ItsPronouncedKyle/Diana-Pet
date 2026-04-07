import { useState, useEffect } from 'react'
import BackToHomeBanner from '../shared/BackToHomeBanner.jsx'

const C = {
  primary: '#6BA89E', primaryLight: '#E8F4F1', accent: '#E8907E',
  text: '#3D3535', textLight: '#8A7F7F', green: '#6BBF8A', greenBg: '#E6F7EC',
  yellow: '#F0C050', yellowBg: '#FFF8E1', red: '#E87B7B', redBg: '#FDECEC',
  blue: '#6BA8D6', blueBg: '#E8F1FA', card: '#FFFFFF', bg: '#FFF8F3',
}

const card = { background: C.card, borderRadius: 20, padding: '18px', boxShadow: '0 2px 12px rgba(61,53,53,0.08)', marginBottom: 14 }
const btn = (active, color = C.accent) => ({
  padding: '12px 14px', borderRadius: 14, border: `2px solid ${active ? color : '#F0E8E0'}`,
  background: active ? color + '22' : 'white', color: active ? color : C.text,
  fontSize: 14, fontWeight: 700, cursor: 'pointer', minHeight: 44, flex: 1,
})

function MealSection({ daily, onUpdate, fromHome, onGoHome }) {
  const m = daily?.meals || {}
  const [breakfast, setBreakfast] = useState(m.breakfast || false)
  const [lunch, setLunch] = useState(m.lunch || false)
  const [dinner, setDinner] = useState(m.dinner || false)
  const [saved, setSaved] = useState(false)

  const count = [breakfast, lunch, dinner].filter(v => v).length

  const toggleMeal = (meal, value) => {
    if (meal === 'breakfast') setBreakfast(value)
    if (meal === 'lunch') setLunch(value)
    if (meal === 'dinner') setDinner(value)
    onUpdate({ meals: { breakfast: meal === 'breakfast' ? value : breakfast, lunch: meal === 'lunch' ? value : lunch, dinner: meal === 'dinner' ? value : dinner } })
    setSaved(true)
  }

  return (
    <div style={{ animation: 'fade-up 0.25s ease-out' }}>
      <BackToHomeBanner show={saved && fromHome} onGoHome={onGoHome} />

      {saved && (
        <div style={{ ...card, background: count === 3 ? C.greenBg : C.blueBg, border: `2px solid ${count === 3 ? C.green : C.blue}` }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: C.text, margin: 0, lineHeight: 1.5 }}>
            {count === 0 && "Have you eaten today? Your body needs fuel. 🍽️"}
            {count === 1 && `${count} of 3 meals. Keep going. 💚`}
            {count === 2 && `${count} of 3 meals. You're taking care of yourself. 💚`}
            {count === 3 && "You fed yourself today. That matters. 💚"}
          </p>
        </div>
      )}

      <div style={card}>
        <div style={{ fontSize: 14, fontWeight: 800, color: C.text, marginBottom: 16 }}>
          Which meals did you eat today?
        </div>

        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          <button
            onClick={() => toggleMeal('breakfast', !breakfast)}
            style={{ ...btn(breakfast, C.accent) }}
          >
            Breakfast {breakfast && '✓'}
          </button>
          <button
            onClick={() => toggleMeal('lunch', !lunch)}
            style={{ ...btn(lunch, C.accent) }}
          >
            Lunch {lunch && '✓'}
          </button>
          <button
            onClick={() => toggleMeal('dinner', !dinner)}
            style={{ ...btn(dinner, C.accent) }}
          >
            Dinner {dinner && '✓'}
          </button>
        </div>

        <div style={{ textAlign: 'center', fontSize: 18, fontWeight: 900, color: C.accent, marginBottom: 0 }}>
          {count} of 3 meals
        </div>
      </div>
    </div>
  )
}

export default MealSection
