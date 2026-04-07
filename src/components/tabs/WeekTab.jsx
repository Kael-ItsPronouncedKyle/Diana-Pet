import { useState, useEffect } from 'react'
import { lastNDays, dayLabel } from '../../utils/dates.js'
import storage from '../../utils/storage.js'
import TopNav from '../shared/TopNav.jsx'
import { runClinicalPatterns } from '../../constants/clinicalPatterns.js'

const card = { background: 'var(--card)', borderRadius: 20, padding: '20px', boxShadow: '0 2px 8px rgba(61,53,53,0.06)', marginBottom: 16 }

const CIRCLE_COLORS = { outer: 'var(--green)', middle: 'var(--yellow)', inner: 'var(--red)' }

const CIRCLE_LABELS = { outer: 'green circle', middle: 'yellow circle', inner: 'red circle' }
const CIRCLE_SYMBOLS = { outer: '✓', middle: '~', inner: '!' }

function DayCell({ dateStr, data }) {
  const circle = data?.circles?.choice
  const circleColor = circle ? CIRCLE_COLORS[circle] : '#E0D8D0'
  const circleSymbol = circle ? CIRCLE_SYMBOLS[circle] : ''
  const meds = data?.meds?.morning === true || data?.meds?.evening === true
  const water = data?.water?.count || 0
  const urges = (data?.urges || []).length
  const dbt = !!data?.dbt?.practiced

  // Build indicator list for everything that happened
  const indicators = []
  if (urges > 0) indicators.push('🔴')
  if (meds) indicators.push('💊')
  if (dbt) indicators.push('💚')
  if (water > 0) indicators.push('💧')

  const dayName = dayLabel(dateStr)
  const circleDesc = circle ? CIRCLE_LABELS[circle] : 'no entry'

  return (
    <button
      aria-label={`${dayName}: ${circleDesc}${urges > 0 ? `, ${urges} urge${urges > 1 ? 's' : ''}` : ''}${meds ? ', meds taken' : ''}${dbt ? ', DBT practiced' : ''}${water > 0 ? ', water tracked' : ''}`}
      style={{
        background: 'white',
        borderRadius: 14,
        padding: '8px 4px',
        border: '1px solid #F0E8E0',
        boxShadow: '0 1px 4px rgba(61,53,53,0.04)',
        cursor: 'pointer',
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        minHeight: 60
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-light)' }}>{dayLabel(dateStr)}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <div style={{
          width: 12,
          height: 12,
          borderRadius: '50%',
          background: circleColor,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 8,
          fontWeight: 900,
          color: circle === 'middle' ? '#7A6A00' : 'white',
          lineHeight: 1
        }} title={circle || 'no entry'}>
          {circleSymbol}
        </div>
      </div>
      {indicators.length > 0 && (
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: 1,
          maxWidth: '100%',
          lineHeight: 1
        }}>
          {indicators.map((ind, i) => (
            <span key={i} style={{ fontSize: 10 }}>{ind}</span>
          ))}
        </div>
      )}
    </button>
  )
}

// Pattern card styles — speech-bubble-like with left border color
const TIER_STYLES = {
  '1-safety': { borderLeftColor: 'var(--red)', accentColor: 'var(--red)' },
  '1-flag': { borderLeftColor: 'var(--accent)', accentColor: 'var(--accent)' },
  2: { borderLeftColor: 'var(--yellow)', accentColor: 'var(--yellow)' },
  3: { borderLeftColor: 'var(--green)', accentColor: 'var(--green)' },
  4: { borderLeftColor: 'var(--blue)', accentColor: 'var(--blue)' },
}

function getTierStyle(pattern) {
  if (pattern.tier === 1) return TIER_STYLES[pattern.autoSurfaceSafetyPlan ? '1-safety' : '1-flag']
  return TIER_STYLES[pattern.tier] || TIER_STYLES[4]
}

export default function WeekTab({ profile, onGoHome, onOpenCrisis }) {
  const [weekData, setWeekData] = useState({})
  const [loading, setLoading] = useState(true)
  const days = lastNDays(7)

  useEffect(() => {
    Promise.all(days.map(async d => [d, await storage.get(`diana-daily:${d}`)])).then(results => {
      const data = {}
      results.forEach(([d, val]) => { data[d] = val })
      setWeekData(data)
      setLoading(false)
    }).catch(() => {
      setLoading(false)
    })
  }, [])

  const patterns = runClinicalPatterns(weekData, profile)
  const criticalPatterns = patterns.filter(p => p.tier === 1)
  const hasCritical = criticalPatterns.length > 0
  const anySafetySurfaced = criticalPatterns.some(p => p.autoSurfaceSafetyPlan)

  if (loading) return <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-light)', fontWeight: 700 }}>Loading...</div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '12px 16px' }}>
        <TopNav onGoHome={onGoHome} />
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px 100px', animation: 'fade-up 0.25s ease-out' }}>

        {/* Critical alert banner — softer style with left border */}
        {hasCritical && (
          <div style={{
            background: 'white',
            borderLeft: `4px solid var(--red)`,
            borderRadius: 16,
            padding: '16px 20px',
            marginBottom: 16,
            boxShadow: '0 2px 8px rgba(61,53,53,0.06)'
          }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>
              Your creature noticed something important this week. 💚
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-light)', marginBottom: 12 }}>
              Check the patterns below — they might help.
            </div>
            {anySafetySurfaced && onOpenCrisis && (
              <button
                onClick={onOpenCrisis}
                style={{
                  padding: '12px 16px',
                  borderRadius: 14,
                  border: 'none',
                  background: 'var(--red)',
                  color: 'white',
                  fontSize: 14,
                  fontWeight: 800,
                  cursor: 'pointer',
                  minHeight: 48
                }}
              >
                Open my safety plan
              </button>
            )}
          </div>
        )}

        {/* 7-day grid */}
        <div style={card}>
          <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', marginBottom: 16 }}>Last 7 Days</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
            {days.map(d => <DayCell key={d} dateStr={d} data={weekData[d]} />)}
          </div>
          {/* Legend */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 16, paddingTop: 12, borderTop: '1px solid #F0E8E0' }}>
            {[
              ['●', 'Circle (✓ outer, ~ middle, ! inner)'],
              ['🔴', 'Urges'],
              ['💊', 'Meds'],
              ['💚', 'DBT'],
              ['💧', 'Water']
            ].map(([e, l]) => (
              <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ fontSize: 14 }}>{e}</span>
                <span style={{ fontSize: 11, color: 'var(--text-light)', fontWeight: 600 }}>{l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Patterns — speech bubble style with left border */}
        {patterns.length > 0 && (
          <div style={card}>
            <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>Things I noticed 🔍</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-light)', marginBottom: 16 }}>Your creature's observations this week:</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {patterns.map((p) => {
                const style = getTierStyle(p)
                return (
                  <div
                    key={p.id}
                    style={{
                      background: 'white',
                      borderLeft: `4px solid ${style.borderLeftColor}`,
                      borderRadius: 14,
                      padding: '14px 16px',
                      fontSize: 14,
                      fontWeight: 600,
                      color: 'var(--text)',
                      lineHeight: 1.6,
                      boxShadow: '0 1px 4px rgba(61,53,53,0.04)'
                    }}
                  >
                    {p.message}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Wins Recap */}
        <div style={card}>
          <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', marginBottom: 16 }}>Good things this week 🌟</div>
          {days.some(d => weekData[d]?.win) ? (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {days.map(d => {
                const dayWin = weekData[d]?.win
                if (!dayWin) return null
                const dayName = dayLabel(d).charAt(0).toUpperCase() + dayLabel(d).slice(1)
                return (
                  <li key={d} style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.6 }}>
                    <strong>{dayName}:</strong> {dayWin}
                  </li>
                )
              })}
            </ul>
          ) : (
            <div style={{ fontSize: 14, color: 'var(--text-light)', fontWeight: 600 }}>
              No wins logged yet. Try the Wins check-in! 💛
            </div>
          )}
        </div>

        {/* Reading Recap */}
        <div style={card}>
          <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', marginBottom: 12 }}>Reading this week 📚</div>
          {(() => {
            const totalMinutes = days.reduce((sum, d) => sum + (weekData[d]?.reading?.minutes || 0), 0)
            return (
              <div style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.6 }}>
                {totalMinutes > 0 ? (
                  <>You read {totalMinutes} minutes this week.</>
                ) : (
                  <>Haven't tracked reading yet? It all counts — audiobooks too!</>
                )}
              </div>
            )
          })()}
        </div>

        {/* Connection Patterns */}
        <div style={card}>
          <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', marginBottom: 16 }}>Connection this week 💚</div>
          {(() => {
            const connectionDays = days.filter(d => weekData[d]?.connection)
            const closeDays = days.filter(d => weekData[d]?.connection?.closeness === true)
            const laughDays = days.filter(d => weekData[d]?.connection?.laughed === true)

            // Check if there's a pattern: closeness correlates with outer circle days
            const outerCircleDays = days.filter(d => weekData[d]?.circles?.choice === 'outer')
            const closeOnOuterDays = closeDays.filter(d => outerCircleDays.includes(d))
            const patternExists = closeDays.length > 0 && outerCircleDays.length > 0 &&
                                 closeOnOuterDays.length === closeDays.length

            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.6 }}>
                  {connectionDays.length > 0 ? (
                    <>You felt close to someone {closeDays.length} out of {connectionDays.length} days.</>
                  ) : (
                    <>No connection logged yet.</>
                  )}
                </div>
                {laughDays.length > 0 && (
                  <div style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.6 }}>
                    You laughed {laughDays.length} days.
                  </div>
                )}
                {patternExists && (
                  <div style={{
                    background: 'var(--green-bg)',
                    borderLeft: '4px solid var(--green)',
                    borderRadius: 8,
                    padding: '12px 14px',
                    fontSize: 13,
                    color: 'var(--text)',
                    lineHeight: 1.6,
                    fontWeight: 600
                  }}>
                    Your green circle days almost always have connection. Reaching out isn't just nice — it's recovery.
                  </div>
                )}
              </div>
            )
          })()}
        </div>

        {/* Meal Tracking Summary */}
        <div style={card}>
          <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', marginBottom: 12 }}>Meals this week 🍽️</div>
          {(() => {
            const mealCounts = days.map(d => {
              const meals = (weekData[d]?.meals || {})
              return (meals.breakfast ? 1 : 0) + (meals.lunch ? 1 : 0) + (meals.dinner ? 1 : 0)
            })
            const totalMeals = mealCounts.reduce((a, b) => a + b, 0)
            const daysWithMeals = days.filter((_, i) => mealCounts[i] > 0).length
            const avgMeals = daysWithMeals > 0 ? (totalMeals / 7).toFixed(1) : 0

            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.6 }}>
                  You averaged {avgMeals} meals a day this week.
                </div>
                {avgMeals < 2 && avgMeals > 0 && (
                  <div style={{
                    background: 'var(--yellow-bg)',
                    borderLeft: '4px solid var(--yellow)',
                    borderRadius: 8,
                    padding: '12px 14px',
                    fontSize: 13,
                    color: 'var(--text)',
                    lineHeight: 1.6,
                    fontWeight: 600
                  }}>
                    Eating is part of self-care. Try to get at least 2 meals in.
                  </div>
                )}
              </div>
            )
          })()}
        </div>

        {/* Empty state */}
        {patterns.length === 0 && (
          <div style={{
            ...card,
            textAlign: 'center',
            color: 'var(--text-light)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12
          }}>
            <div style={{ fontSize: 32 }}>💚</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>Keep checking in — I'm watching for patterns.</div>
          </div>
        )}
      </div>
    </div>
  )
}
