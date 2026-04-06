import { useState, useEffect } from 'react'
import { lastNDays, dayLabel } from '../../utils/dates.js'
import { countCheckIns } from '../../utils/checkIns.js'
import storage from '../../utils/storage.js'

const C = {
  primary: '#6BA89E', text: '#3D3535', textLight: '#8A7F7F',
  green: '#6BBF8A', greenBg: '#E6F7EC', yellow: '#F0C050', yellowBg: '#FFF8E1',
  red: '#E87B7B', redBg: '#FDECEC', card: '#FFFFFF',
}
const card = { background: C.card, borderRadius: 20, padding: '16px 18px', boxShadow: '0 2px 12px rgba(61,53,53,0.08)', marginBottom: 14 }

const CIRCLE_COLORS = { outer: C.green, middle: C.yellow, inner: C.red }
const ENERGY_EMOJIS = { 1: '😴', 2: '🥱', 3: '😐', 4: '😊', 5: '🌟' }

function detectPatterns(weekData, prevWeekData) {
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

  // Apollo trigger trend
  const thisWeekTriggers = days.reduce((sum, d) => sum + ((d.puppies?.apollo?.triggers || []).length), 0)
  if (thisWeekTriggers > 0) {
    const prevWeekTriggers = prevWeekData
      ? Object.values(prevWeekData).filter(Boolean).reduce((sum, d) => sum + ((d.puppies?.apollo?.triggers || []).length), 0)
      : null

    if (prevWeekTriggers !== null && prevWeekTriggers > 0) {
      if (thisWeekTriggers < prevWeekTriggers) {
        patterns.push(`Apollo had ${thisWeekTriggers} trigger moment${thisWeekTriggers > 1 ? 's' : ''} this week — fewer than last week (${prevWeekTriggers}). Progress! 🐾`)
      } else if (thisWeekTriggers > prevWeekTriggers) {
        patterns.push(`Apollo had ${thisWeekTriggers} trigger moments this week. Every logged trigger is useful data for her training. 🐾`)
      } else {
        patterns.push(`Apollo had ${thisWeekTriggers} trigger moment${thisWeekTriggers > 1 ? 's' : ''} this week — same as last week. Keep logging! 🐾`)
      }
    } else {
      patterns.push(`Apollo had ${thisWeekTriggers} trigger moment${thisWeekTriggers > 1 ? 's' : ''} this week. Every logged trigger is useful training data. 🐾`)
    }
  }

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
  const hasData = countCheckIns(data) > 0

  return (
    <div style={{ background: hasData ? 'white' : '#FAFAF8', borderRadius: 16, padding: '10px 8px', boxShadow: hasData ? '0 1px 6px rgba(61,53,53,0.06)' : 'none', minWidth: 0, border: hasData ? 'none' : '1px dashed #E8E0D8' }}>
      <div style={{ fontSize: 11, fontWeight: 800, color: C.textLight, marginBottom: 6, textAlign: 'center' }}>{dayLabel(dateStr)}</div>
      {hasData ? (
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
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center', opacity: 0.4 }}>
          <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#D0C8C0' }} />
          <div style={{ fontSize: 14 }}>○</div>
          <div style={{ fontSize: 11, color: C.textLight }}>—</div>
          <div style={{ fontSize: 11, color: C.textLight }}>—</div>
          <div style={{ fontSize: 13 }}>—</div>
          <div style={{ fontSize: 13 }}>—</div>
          <div style={{ fontSize: 13 }}>—</div>
        </div>
      )}
    </div>
  )
}

// Skeleton placeholder while data loads
function SkeletonCard() {
  return (
    <div style={{ ...card, overflow: 'hidden' }}>
      <div className="skeleton" style={{ height: 20, borderRadius: 10, marginBottom: 14, width: '40%' }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
        {Array.from({ length: 7 }, (_, i) => (
          <div key={i} className="skeleton" style={{ borderRadius: 14, height: 120 }} />
        ))}
      </div>
    </div>
  )
}

export default function WeekTab() {
  const [weekData, setWeekData] = useState({})
  const [prevWeekData, setPrevWeekData] = useState(null)
  const [loading, setLoading] = useState(true)
  const days = lastNDays(7)
  const prevDays = lastNDays(14).slice(0, 7)

  useEffect(() => {
    Promise.all([
      ...days.map(async d => ['curr', d, await storage.get(`diana-daily:${d}`)]),
      ...prevDays.map(async d => ['prev', d, await storage.get(`diana-daily:${d}`)]),
    ]).then(results => {
      const curr = {}
      const prev = {}
      results.forEach(([type, d, val]) => {
        if (type === 'curr') curr[d] = val
        else prev[d] = val
      })
      setWeekData(curr)
      setPrevWeekData(prev)
      setLoading(false)
    })
  }, [])

  const patterns = detectPatterns(weekData, prevWeekData)
  const filledDays = days.filter(d => weekData[d] && countCheckIns(weekData[d]) > 0).length

  if (loading) return (
    <div style={{ padding: '16px 16px 100px' }}>
      <SkeletonCard />
      <div style={{ ...card, overflow: 'hidden' }}>
        <div className="skeleton" style={{ height: 18, borderRadius: 10, width: '50%', marginBottom: 12 }} />
        {[1, 2, 3].map(i => (
          <div key={i} className="skeleton" style={{ height: 48, borderRadius: 12, marginBottom: 8 }} />
        ))}
      </div>
    </div>
  )

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

      {/* Empty / new user state */}
      {patterns.length === 0 && (
        <div style={{ ...card, textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>🌱</div>
          {filledDays < 3 ? (
            <>
              <div style={{ fontSize: 15, fontWeight: 800, color: C.text, marginBottom: 8 }}>
                Check in each day and I'll start noticing patterns for you.
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.textLight, marginBottom: 14 }}>
                {filledDays} of 7 days filled in
              </div>
              {/* Progress toward 7 days */}
              <div style={{ background: '#F0E8E0', borderRadius: 8, height: 8, overflow: 'hidden', marginBottom: 8 }}>
                <div style={{
                  background: '#6BA89E', height: '100%', borderRadius: 8,
                  width: `${(filledDays / 7) * 100}%`,
                  transition: 'width 0.5s ease',
                }} />
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.textLight }}>
                {7 - filledDays} more day{7 - filledDays !== 1 ? 's' : ''} until patterns appear
              </div>
            </>
          ) : (
            <div style={{ fontSize: 14, fontWeight: 700, color: C.textLight }}>
              Keep checking in and patterns will show up here.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
