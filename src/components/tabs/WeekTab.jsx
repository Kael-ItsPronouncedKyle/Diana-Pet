import { useState, useEffect } from 'react'
import { lastNDays, dayLabel } from '../../utils/dates.js'
import storage from '../../utils/storage.js'
import TopNav from '../shared/TopNav.jsx'
import { runClinicalPatterns } from '../../constants/clinicalPatterns.js'

const C = {
  primary: '#6BA89E', text: '#3D3535', textLight: '#8A7F7F',
  green: '#6BBF8A', greenBg: '#E6F7EC', yellow: '#F0C050', yellowBg: '#FFF8E1',
  red: '#E87B7B', redBg: '#FDECEC', blue: '#6BA8D6', blueBg: '#E8F1FA',
  card: '#FFFFFF',
}
const card = { background: C.card, borderRadius: 20, padding: '16px 18px', boxShadow: '0 2px 12px rgba(61,53,53,0.08)', marginBottom: 14 }

const CIRCLE_COLORS = { outer: C.green, middle: C.yellow, inner: C.red }
const ENERGY_EMOJIS = { 1: '😴', 2: '🥱', 3: '😐', 4: '😊', 5: '🌟' }

// detectPatterns is now driven by clinicalPatterns.js
// Returns clinical pattern results for rendering

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

// Tier 1 with safety plan = warm coral. Tier 1 without = softer amber.
// We avoid stacking multiple alarm-red cards which can feel punishing.
const TIER_STYLES = {
  '1-safety': { background: C.redBg, border: `2px solid ${C.red}`, color: C.text },
  '1-flag': { background: '#FFF4E6', border: '2px solid #E8A55F', color: C.text },
  2: { background: C.yellowBg, border: `2px solid ${C.yellow}`, color: C.text },
  3: { background: C.greenBg, border: `2px solid ${C.green}`, color: C.text },
  4: { background: C.blueBg, border: `2px solid ${C.blue}`, color: C.text },
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
    })
  }, [])

  const patterns = runClinicalPatterns(weekData, profile)
  const criticalPatterns = patterns.filter(p => p.tier === 1)
  const hasCritical = criticalPatterns.length > 0
  const anySafetySurfaced = criticalPatterns.some(p => p.autoSurfaceSafetyPlan)

  if (loading) return <div style={{ padding: 32, textAlign: 'center', color: C.textLight, fontWeight: 700 }}>Loading...</div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '12px 16px' }}>
        <TopNav onGoHome={onGoHome} />
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 100px', animation: 'fade-up 0.25s ease-out' }}>

      {/* Critical alert banner — shown at top when tier 1 patterns fire */}
      {hasCritical && (
        <div style={{ background: C.redBg, border: `2px solid ${C.red}`, borderRadius: 20, padding: '16px 18px', marginBottom: 14 }}>
          <div style={{ fontSize: 15, fontWeight: 900, color: C.text, marginBottom: 6 }}>
            Something important showed up this week. Take a look. 💙
          </div>
          {anySafetySurfaced && onOpenCrisis && (
            <button
              onClick={onOpenCrisis}
              style={{ padding: '10px 18px', borderRadius: 12, border: 'none', background: C.red, color: 'white', fontSize: 14, fontWeight: 800, cursor: 'pointer' }}
            >
              Open my safety plan
            </button>
          )}
        </div>
      )}

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

      {/* Patterns — sorted by tier, color-coded */}
      {patterns.length > 0 && (
        <div style={card}>
          <div style={{ fontSize: 16, fontWeight: 900, color: C.text, marginBottom: 14 }}>Things I noticed 🔍</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {patterns.map((p) => {
              const style = getTierStyle(p)
              return (
                <div
                  key={p.id}
                  style={{
                    background: style.background,
                    border: style.border,
                    borderRadius: 14,
                    padding: '12px 14px',
                    fontSize: 14,
                    fontWeight: 600,
                    color: style.color,
                    lineHeight: 1.5,
                  }}
                >
                  {p.message}
                </div>
              )
            })}
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
    </div>
  )
}
