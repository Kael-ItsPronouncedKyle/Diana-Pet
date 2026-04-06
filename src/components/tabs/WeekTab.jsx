import { useState, useEffect } from 'react'
import { lastNDays, dayLabel } from '../../utils/dates.js'
import storage from '../../utils/storage.js'

const C = {
  primary: '#6BA89E', text: '#3D3535', textLight: '#8A7F7F',
  green: '#6BBF8A', greenBg: '#E6F7EC', yellow: '#F0C050', yellowBg: '#FFF8E1',
  red: '#E87B7B', redBg: '#FDECEC', card: '#FFFFFF',
}
const card = { background: C.card, borderRadius: 20, padding: '16px 18px', boxShadow: '0 2px 12px rgba(61,53,53,0.08)', marginBottom: 14 }

const CIRCLE_COLORS = { outer: C.green, middle: C.yellow, inner: C.red }
const ENERGY_EMOJIS = { 1: '😴', 2: '🥱', 3: '😐', 4: '😊', 5: '🌟' }

function detectPatterns(weekData) {
  const days = Object.values(weekData).filter(Boolean)
  if (days.length < 3) return []
  const patterns = []

  // Crash after high activity
  const entries = Object.entries(weekData).sort(([a], [b]) => a.localeCompare(b))
  let crashAfterActivity = 0
  for (let i = 1; i < entries.length; i++) {
    const prev = entries[i-1][1]
    const curr = entries[i][1]
    if (prev?.activity?.attempted && prev?.activity?.tolerance !== 'Fine' && curr?.energy <= 2) {
      crashAfterActivity++
    }
  }
  if (crashAfterActivity >= 2) patterns.push("You've crashed a few times this week after active days. Your body might need more rest after you push hard.")

  // Sleep-mood
  const lowSleepHighCircle = days.filter(d => (d.sleep?.hours || 8) < 6 && (d.circles?.choice === 'middle' || d.circles?.choice === 'inner'))
  if (lowSleepHighCircle.length >= 2) patterns.push("When you sleep less than 6 hours, your circles tend toward yellow or red. Sleep really does affect mood.")

  // Pain-sleep
  const painHighLowSleep = days.filter(d => d.pain >= 3 && (d.sleep?.hours || 8) < 6)
  if (painHighLowSleep.length >= 2) patterns.push("Your pain has been higher on days you slept less. Rest helps your body hurt less.")

  // DBT streak
  const dbtDays = days.filter(d => d.dbt?.practiced).length
  if (dbtDays >= 5) patterns.push(`You practiced DBT skills ${dbtDays} out of 7 days. That's a real habit forming. 💪`)
  else if (dbtDays >= 3) patterns.push(`You practiced DBT skills ${dbtDays} days this week. Keep going — it adds up.`)

  // Meds
  const medsDays = days.filter(d => d.meds?.morning === true || d.meds?.evening === true).length
  if (medsDays >= 6) patterns.push("You've been taking your meds consistently this week. That matters more than you know. 💊")

  // Urge patterns
  const eveningUrges = days.filter(d => (d.urges || []).some(u => new Date(u.timestamp).getHours() >= 17))
  if (eveningUrges.length >= 3) patterns.push("Most of your urges happened in the evening. That's useful to know — you can plan ahead for those hours.")

  // Green circle streak
  const greenStreak = days.filter(d => d.circles?.choice === 'outer').length
  if (greenStreak >= 5) patterns.push(`${greenStreak} green circle days this week! You are healing. 💚`)

  // Sensory-crash
  const sensoryCrash = days.filter(d => (d.sensory?.level || 0) >= 4)
  if (sensoryCrash.length >= 2) patterns.push("Sensory overload days seem to connect to harder days after. Protecting your sensory load is protecting your energy.")

  return patterns
}

function DayCell({ dateStr, data }) {
  const circle = data?.circles?.choice
  const circleColor = circle ? CIRCLE_COLORS[circle] : '#E0D8D0'
  const energy = data?.energy
  const sleep = data?.sleep?.hours
  const meds = data?.meds?.morning === true || data?.meds?.evening === true
  const water = data?.water?.count || 0
  const urges = (data?.urges || []).length
  const dbt = !!data?.dbt?.practiced
  const puppies = !!(data?.puppies?.apollo?.skills && Object.keys(data.puppies.apollo.skills).length > 0)

  return (
    <div style={{ background: 'white', borderRadius: 16, padding: '10px 8px', boxShadow: '0 1px 6px rgba(61,53,53,0.06)', minWidth: 0 }}>
      <div style={{ fontSize: 11, fontWeight: 800, color: C.textLight, marginBottom: 6, textAlign: 'center' }}>{dayLabel(dateStr)}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
        <div style={{ width: 24, height: 24, borderRadius: '50%', background: circleColor, flexShrink: 0 }} title={circle || 'no entry'} />
        <div style={{ fontSize: 16 }}>{energy ? ENERGY_EMOJIS[energy] : '○'}</div>
        <div style={{ fontSize: 11, fontWeight: 700, color: sleep ? C.text : C.textLight }}>{sleep ? `${sleep}h` : '—'}</div>
        <div style={{ fontSize: 11, fontWeight: 700, color: water >= 6 ? C.primary : C.textLight }}>{water ? `${water}💧` : '—'}</div>
        <div style={{ fontSize: 13 }}>{meds ? '✅' : '—'}</div>
        <div style={{ fontSize: 13 }}>{dbt ? '💚' : '—'}</div>
        <div style={{ fontSize: 13 }}>{puppies ? '🐾' : '—'}</div>
        {urges > 0 && <div style={{ fontSize: 11, fontWeight: 700, color: C.red }}>{urges}🔴</div>}
      </div>
    </div>
  )
}

export default function WeekTab() {
  const [weekData, setWeekData] = useState({})
  const [loading, setLoading] = useState(true)
  const days = lastNDays(7)

  useEffect(() => {
    Promise.all(days.map(async d => [d, await storage.get(`diana-daily:${d}`)])).then(results => {
      const data = {}
      results.forEach(([d, val]) => { data[d] = val })
      setWeekData(data)
      setLoading(false)
    })
  }, [])

  const patterns = detectPatterns(weekData)

  if (loading) return <div style={{ padding: 32, textAlign: 'center', color: C.textLight, fontWeight: 700 }}>Loading...</div>

  return (
    <div style={{ padding: '16px 16px 100px', animation: 'fade-up 0.25s ease-out' }}>
      <div style={card}>
        <div style={{ fontSize: 16, fontWeight: 900, color: C.text, marginBottom: 14 }}>Last 7 Days</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
          {days.map(d => <DayCell key={d} dateStr={d} data={weekData[d]} />)}
        </div>
        {/* Legend */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 14, paddingTop: 12, borderTop: '1px solid #F0E8E0' }}>
          {[['⭕', 'Circle'], ['⚡', 'Energy'], ['🛏', 'Sleep'], ['💧', 'Water'], ['✅', 'Meds'], ['💚', 'DBT'], ['🐾', 'Dogs']].map(([e, l]) => (
            <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: 14 }}>{e}</span>
              <span style={{ fontSize: 11, color: C.textLight, fontWeight: 600 }}>{l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Patterns */}
      {patterns.length > 0 && (
        <div style={card}>
          <div style={{ fontSize: 16, fontWeight: 900, color: C.text, marginBottom: 14 }}>Things I noticed 🔍</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {patterns.map((p, i) => (
              <div key={i} style={{ background: '#F8F4F0', borderRadius: 14, padding: '12px 14px', fontSize: 14, fontWeight: 600, color: C.text, lineHeight: 1.5 }}>
                {p}
              </div>
            ))}
          </div>
        </div>
      )}

      {patterns.length === 0 && (
        <div style={{ ...card, textAlign: 'center', color: C.textLight }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>📊</div>
          <div style={{ fontSize: 14, fontWeight: 700 }}>Keep checking in and patterns will show up here.</div>
        </div>
      )}
    </div>
  )
}
