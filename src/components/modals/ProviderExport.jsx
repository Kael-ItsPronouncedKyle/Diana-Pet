import { useState, useEffect } from 'react'
import storage from '../../utils/storage.js'
import { today, lastNDays, weekKey, formatDate } from '../../utils/dates.js'

const card = {
  background: 'var(--card)',
  borderRadius: 20,
  padding: '18px',
  boxShadow: '0 2px 8px rgba(61,53,53,0.06)',
  marginBottom: 14,
}

const CIRCLE_LABELS = { outer: 'Green (outer)', middle: 'Yellow (middle)', inner: 'Red (inner)' }

export default function ProviderExport({ isOpen, onClose }) {
  const [data, setData] = useState(null)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isOpen) return
    setLoading(true)
    setCopied(false)
    gatherData().then(d => { setData(d); setLoading(false) })
  }, [isOpen])

  if (!isOpen) return null

  async function gatherData() {
    const days = lastNDays(7)
    const dailyData = []
    for (const day of days) {
      try {
        const d = await storage.get(`diana-daily:${day}`)
        dailyData.push({ date: day, ...(d || {}) })
      } catch {
        dailyData.push({ date: day })
      }
    }

    // Weekly screening (current week)
    let weekly = null
    try {
      weekly = await storage.get(`diana-weekly:${weekKey()}`)
    } catch { /* no weekly data */ }

    // Circle counts
    const circles = { outer: 0, middle: 0, inner: 0, none: 0 }
    dailyData.forEach(d => {
      if (d.circles?.choice) circles[d.circles.choice]++
      else circles.none++
    })

    // Emotions
    const emotionCounts = {}
    dailyData.forEach(d => {
      if (d.emotions) {
        const emos = Array.isArray(d.emotions) ? d.emotions : []
        emos.forEach(e => {
          const name = typeof e === 'string' ? e : e?.name || e?.label || ''
          if (name) emotionCounts[name] = (emotionCounts[name] || 0) + 1
        })
      }
    })
    const topEmotions = Object.entries(emotionCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => `${name} (${count}x)`)

    // Sleep
    const sleepDays = dailyData.filter(d => d.sleep?.hours)
    const avgSleepHours = sleepDays.length > 0
      ? Math.round((sleepDays.reduce((sum, d) => sum + (d.sleep.hours || 0), 0) / sleepDays.length) * 10) / 10
      : null
    const avgSleepQuality = sleepDays.filter(d => d.sleep?.quality).length > 0
      ? Math.round(sleepDays.filter(d => d.sleep?.quality).reduce((sum, d) => sum + d.sleep.quality, 0) / sleepDays.filter(d => d.sleep?.quality).length * 10) / 10
      : null
    const QUALITY_LABELS = { 1: 'Terrible', 2: 'Not great', 3: 'Okay', 4: 'Good', 5: 'Amazing' }

    // Meds
    const medsDays = dailyData.filter(d => d.meds)
    const medsTotal = dailyData.length
    const medsTaken = dailyData.filter(d => d.meds?.morning || d.meds?.evening).length
    const medsPercent = medsTotal > 0 ? Math.round((medsTaken / medsTotal) * 100) : null

    // Urges
    const allUrges = []
    dailyData.forEach(d => {
      if (d.urges && Array.isArray(d.urges)) {
        d.urges.forEach(u => allUrges.push(u))
      }
    })
    const urgeCount = allUrges.length
    const avgUrgeIntensity = urgeCount > 0
      ? Math.round(allUrges.reduce((sum, u) => sum + (u.intensity || 0), 0) / urgeCount * 10) / 10
      : null

    // Energy
    const energyDays = dailyData.filter(d => d.energy !== undefined)
    const avgEnergy = energyDays.length > 0
      ? Math.round(energyDays.reduce((sum, d) => sum + d.energy, 0) / energyDays.length * 10) / 10
      : null

    // Window of tolerance
    const windowDays = dailyData.filter(d => d.window !== undefined)
    const avgWindow = windowDays.length > 0
      ? Math.round(windowDays.reduce((sum, d) => sum + d.window, 0) / windowDays.length * 10) / 10
      : null

    // PHQ-2
    const phq2 = weekly?.phq2 || null

    // Patterns
    const patterns = []
    if (circles.inner >= 3) patterns.push('3+ inner circle days this week')
    if (avgSleepHours !== null && avgSleepHours < 5) patterns.push('Low sleep average (under 5 hours)')
    if (avgSleepHours !== null && avgSleepHours > 10) patterns.push('High sleep average (over 10 hours)')
    if (medsPercent !== null && medsPercent < 50) patterns.push('Medication adherence below 50%')
    if (urgeCount >= 5) patterns.push(`${urgeCount} urges logged this week`)
    if (phq2 && phq2.total >= 3) patterns.push(`PHQ-2 score ${phq2.total}/6 (flagged)`)
    if (avgEnergy !== null && avgEnergy <= 2) patterns.push('Very low average energy')

    return {
      dateRange: `${formatDate(days[0])} - ${formatDate(days[days.length - 1])}`,
      circles,
      topEmotions,
      avgSleepHours,
      avgSleepQuality,
      qualityLabel: avgSleepQuality ? QUALITY_LABELS[Math.round(avgSleepQuality)] || '' : '',
      medsPercent,
      medsTaken,
      medsTotal,
      urgeCount,
      avgUrgeIntensity,
      avgEnergy,
      avgWindow,
      phq2,
      patterns,
    }
  }

  function buildText() {
    if (!data) return ''
    const lines = []
    lines.push('--- Diana\'s Weekly Summary ---')
    lines.push(`Date range: ${data.dateRange}`)
    lines.push('')

    lines.push('CIRCLES (Recovery)')
    lines.push(`  Green (outer): ${data.circles.outer} days`)
    lines.push(`  Yellow (middle): ${data.circles.middle} days`)
    lines.push(`  Red (inner): ${data.circles.inner} days`)
    if (data.circles.none > 0) lines.push(`  Not logged: ${data.circles.none} days`)
    lines.push('')

    if (data.topEmotions.length > 0) {
      lines.push('TOP EMOTIONS')
      data.topEmotions.forEach(e => lines.push(`  ${e}`))
      lines.push('')
    }

    if (data.avgSleepHours !== null) {
      lines.push('SLEEP')
      lines.push(`  Average: ${data.avgSleepHours} hours/night`)
      if (data.avgSleepQuality !== null) lines.push(`  Quality: ${data.avgSleepQuality}/5 (${data.qualityLabel})`)
      lines.push('')
    }

    if (data.medsPercent !== null) {
      lines.push('MEDICATION')
      lines.push(`  Taken ${data.medsTaken} of ${data.medsTotal} days (${data.medsPercent}%)`)
      lines.push('')
    }

    if (data.avgEnergy !== null) {
      lines.push('ENERGY')
      lines.push(`  Average: ${data.avgEnergy}/5`)
      lines.push('')
    }

    if (data.urgeCount > 0) {
      lines.push('URGES')
      lines.push(`  Total: ${data.urgeCount}`)
      if (data.avgUrgeIntensity !== null) lines.push(`  Average intensity: ${data.avgUrgeIntensity}/10`)
      lines.push('')
    }

    if (data.phq2) {
      lines.push('PHQ-2 (DEPRESSION SCREEN)')
      lines.push(`  Score: ${data.phq2.total}/6${data.phq2.total >= 3 ? ' (flagged for follow-up)' : ''}`)
      lines.push('')
    }

    if (data.avgWindow !== null) {
      lines.push('WINDOW OF TOLERANCE')
      lines.push(`  Average: ${data.avgWindow}/7`)
      lines.push('')
    }

    if (data.patterns.length > 0) {
      lines.push('PATTERNS TO NOTE')
      data.patterns.forEach(p => lines.push(`  - ${p}`))
      lines.push('')
    }

    lines.push('---')
    lines.push('Generated from Diana\'s Companion App')
    return lines.join('\n')
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(buildText())
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // Fallback
      const ta = document.createElement('textarea')
      ta.value = buildText()
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'var(--bg)', display: 'flex', flexDirection: 'column', animation: 'fade-up 0.25s ease-out' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', height: 48, borderBottom: '1px solid rgba(61,53,53,0.08)' }}>
        <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: 'var(--text)', padding: '8px', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>←</button>
        <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--text)', flex: 1, textAlign: 'center' }}>For My Therapist</div>
        <div style={{ width: 44 }} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px 100px 20px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>📊</div>
            <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-light)' }}>Getting your week ready...</p>
          </div>
        ) : data ? (
          <>
            <div style={{ ...card, background: 'var(--primary-light)', border: '2px solid var(--primary)' }}>
              <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', lineHeight: 1.5, margin: 0 }}>
                This is a summary of your last 7 days. You can copy it and show it to your therapist or doctor.
              </p>
            </div>

            {/* Date range */}
            <div style={card}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-light)', marginBottom: 4 }}>Date range</div>
              <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--text)' }}>{data.dateRange}</div>
            </div>

            {/* Circles */}
            <div style={card}>
              <div style={{ fontSize: 15, fontWeight: 900, color: 'var(--text)', marginBottom: 12 }}>Recovery Circles</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {[['outer', '#6BBF8A', '#E6F7EC'], ['middle', '#F0C050', '#FFF8E1'], ['inner', '#E87B7B', '#FDECEC']].map(([key, color, bg]) => (
                  <div key={key} style={{ flex: 1, textAlign: 'center', padding: '12px 8px', borderRadius: 14, background: bg, border: `2px solid ${color}` }}>
                    <div style={{ fontSize: 24, fontWeight: 900, color }}>{data.circles[key]}</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-light)', marginTop: 4 }}>{key === 'outer' ? 'Green' : key === 'middle' ? 'Yellow' : 'Red'}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Emotions */}
            {data.topEmotions.length > 0 && (
              <div style={card}>
                <div style={{ fontSize: 15, fontWeight: 900, color: 'var(--text)', marginBottom: 10 }}>Top Feelings</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {data.topEmotions.map((e, i) => (
                    <span key={i} style={{ padding: '6px 12px', borderRadius: 20, background: 'var(--primary-light)', color: 'var(--primary)', fontSize: 13, fontWeight: 700 }}>{e}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Sleep */}
            {data.avgSleepHours !== null && (
              <div style={card}>
                <div style={{ fontSize: 15, fontWeight: 900, color: 'var(--text)', marginBottom: 10 }}>Sleep</div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{ flex: 1, textAlign: 'center', padding: '10px', borderRadius: 14, background: '#E8F1FA' }}>
                    <div style={{ fontSize: 20, fontWeight: 900, color: '#6BA8D6' }}>{data.avgSleepHours}h</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-light)' }}>avg/night</div>
                  </div>
                  {data.avgSleepQuality !== null && (
                    <div style={{ flex: 1, textAlign: 'center', padding: '10px', borderRadius: 14, background: '#E8F1FA' }}>
                      <div style={{ fontSize: 20, fontWeight: 900, color: '#6BA8D6' }}>{data.avgSleepQuality}/5</div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-light)' }}>{data.qualityLabel}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Meds */}
            {data.medsPercent !== null && (
              <div style={card}>
                <div style={{ fontSize: 15, fontWeight: 900, color: 'var(--text)', marginBottom: 10 }}>Medication</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 56, height: 56, borderRadius: '50%', background: data.medsPercent >= 80 ? '#E6F7EC' : data.medsPercent >= 50 ? '#FFF8E1' : '#FDECEC', border: `3px solid ${data.medsPercent >= 80 ? '#6BBF8A' : data.medsPercent >= 50 ? '#F0C050' : '#E87B7B'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 18, fontWeight: 900, color: data.medsPercent >= 80 ? '#6BBF8A' : data.medsPercent >= 50 ? '#F0C050' : '#E87B7B' }}>{data.medsPercent}%</span>
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>Took meds {data.medsTaken} of {data.medsTotal} days</div>
                  </div>
                </div>
              </div>
            )}

            {/* Energy */}
            {data.avgEnergy !== null && (
              <div style={card}>
                <div style={{ fontSize: 15, fontWeight: 900, color: 'var(--text)', marginBottom: 6 }}>Energy</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-light)' }}>Average: {data.avgEnergy}/5</div>
              </div>
            )}

            {/* Urges */}
            {data.urgeCount > 0 && (
              <div style={card}>
                <div style={{ fontSize: 15, fontWeight: 900, color: 'var(--text)', marginBottom: 10 }}>Urges</div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{ flex: 1, textAlign: 'center', padding: '10px', borderRadius: 14, background: '#FDECEC' }}>
                    <div style={{ fontSize: 20, fontWeight: 900, color: '#E87B7B' }}>{data.urgeCount}</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-light)' }}>total</div>
                  </div>
                  {data.avgUrgeIntensity !== null && (
                    <div style={{ flex: 1, textAlign: 'center', padding: '10px', borderRadius: 14, background: '#FDECEC' }}>
                      <div style={{ fontSize: 20, fontWeight: 900, color: '#E87B7B' }}>{data.avgUrgeIntensity}/10</div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-light)' }}>avg strength</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* PHQ-2 */}
            {data.phq2 && (
              <div style={{ ...card, background: data.phq2.total >= 3 ? '#FFF8E1' : '#E6F7EC', border: `2px solid ${data.phq2.total >= 3 ? '#F0C050' : '#6BBF8A'}` }}>
                <div style={{ fontSize: 15, fontWeight: 900, color: 'var(--text)', marginBottom: 6 }}>Sadness Screen (PHQ-2)</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: data.phq2.total >= 3 ? '#F0C050' : '#6BBF8A' }}>{data.phq2.total}/6</div>
                {data.phq2.total >= 3 && (
                  <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-light)', marginTop: 6, marginBottom: 0 }}>Flagged for follow-up</p>
                )}
              </div>
            )}

            {/* Patterns */}
            {data.patterns.length > 0 && (
              <div style={{ ...card, background: '#FFF8E1', border: '2px solid #F0C050' }}>
                <div style={{ fontSize: 15, fontWeight: 900, color: 'var(--text)', marginBottom: 10 }}>Things to Talk About</div>
                {data.patterns.map((p, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 14 }}>-</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', lineHeight: 1.4 }}>{p}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : null}
      </div>

      {/* Bottom actions */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, maxWidth: 430, margin: '0 auto', padding: '16px 20px', paddingBottom: 'max(16px, env(safe-area-inset-bottom))', background: 'var(--bg)', borderTop: '1px solid rgba(61,53,53,0.08)', display: 'flex', gap: 8 }}>
        <button onClick={onClose} style={{ flex: 1, padding: '14px', borderRadius: 14, border: 'none', background: 'rgba(61,53,53,0.1)', color: 'var(--text)', fontSize: 15, fontWeight: 800, cursor: 'pointer' }}>Close</button>
        <button
          onClick={copyToClipboard}
          style={{ flex: 2, padding: '14px', borderRadius: 14, border: 'none', background: copied ? '#6BBF8A' : 'var(--primary)', color: 'white', fontSize: 15, fontWeight: 800, cursor: 'pointer', transition: 'background 0.3s' }}
        >
          {copied ? 'Copied!' : 'Copy to clipboard'}
        </button>
      </div>
    </div>
  )
}
