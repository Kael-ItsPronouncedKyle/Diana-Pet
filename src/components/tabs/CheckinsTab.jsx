import { useState, useMemo } from 'react'
import RecoveryTab from './RecoveryTab.jsx'
import BodyTab from './BodyTab.jsx'
import TopNav from '../shared/TopNav.jsx'
import { tapFeedback } from '../../utils/haptics.js'
import ReadingSection from '../checkins/ReadingSection.jsx'
import WinsSection from '../checkins/WinsSection.jsx'
import CustomTrackersSection from '../checkins/CustomTrackersSection.jsx'

/**
 * CheckinsTab — Merged Recovery + Body tab
 *
 * Shows a tile grid of all check-in types. Tapping a tile
 * opens the relevant sub-section from RecoveryTab or BodyTab.
 * Back button returns to the tile grid.
 */

// All check-in tiles organized into two groups
const RECOVERY_TILES = [
  { key: 'circles', emoji: '⭕', label: 'Circles', color: '#6BBF8A', bg: '#E6F7EC', source: 'recovery' },
  { key: 'feelings', emoji: '🎭', label: 'Feelings', color: '#E8907E', bg: '#FDE8E4', source: 'recovery' },
  { key: 'dbt', emoji: '💚', label: 'DBT Skill', color: '#6BA89E', bg: '#E8F4F1', source: 'recovery' },
  { key: 'urges', emoji: '🔴', label: 'Urges', color: '#E87B7B', bg: '#FDECEC', source: 'recovery' },
  { key: 'chain', emoji: '🔗', label: 'Chain', color: '#6BA8D6', bg: '#E8F1FA', source: 'recovery' },
  { key: 'connection', emoji: '💜', label: 'Connect', color: '#6BA89E', bg: '#E8F4F1', source: 'recovery' },
]

const BODY_TILES = [
  { key: 'sleep', emoji: '😴', label: 'Sleep', color: '#6BA8D6', bg: '#E8F1FA', source: 'body' },
  { key: 'meds', emoji: '💊', label: 'Meds', color: '#6BA89E', bg: '#E8F4F1', source: 'body' },
  { key: 'meals', emoji: '🍽️', label: 'Meals', color: '#E8907E', bg: '#FDE8E4', source: 'body' },
  { key: 'energy', emoji: '⚡', label: 'Energy', color: '#E8907E', bg: '#FDE8E4', source: 'body' },
  { key: 'water', emoji: '💧', label: 'Water', color: '#6BA8D6', bg: '#E8F1FA', source: 'body' },
  { key: 'window', emoji: '🧠', label: 'Window', color: '#6BA89E', bg: '#E8F4F1', source: 'body' },
  { key: 'sensory', emoji: '🧠', label: 'Sensory', color: '#E8907E', bg: '#FDE8E4', source: 'body' },
  { key: 'dissociation', emoji: '🌫', label: 'Present?', color: '#6BA8D6', bg: '#E8F1FA', source: 'body' },
  { key: 'bodySelf', emoji: '💜', label: 'Body-Self', color: '#E8907E', bg: '#FDE8E4', source: 'body' },
  { key: 'weekly', emoji: '📋', label: 'Weekly', color: '#F0C050', bg: '#FFF8E1', source: 'body' },
]

const LIFE_TILES = [
  { key: 'wins', emoji: '🌟', label: 'Wins', color: '#F0C050', bg: '#FFF8E1', source: 'life' },
  { key: 'reading', emoji: '📚', label: 'Reading', color: '#6BA8D6', bg: '#E8F1FA', source: 'life' },
  { key: 'custom', emoji: '✨', label: 'My Trackers', color: '#6BA89E', bg: '#E8F4F1', source: 'life' },
]

const ALL_TILES = [...RECOVERY_TILES, ...BODY_TILES, ...LIFE_TILES]

// Check if a check-in is done
function isDone(key, daily) {
  if (!daily) return false
  if (key === 'circles') return !!daily.circles
  if (key === 'sleep') return !!daily.sleep?.quality
  if (key === 'meds') return daily.meds?.morning !== undefined || daily.meds?.evening !== undefined
  if (key === 'energy') return daily.energy !== undefined
  if (key === 'water') return (daily.water?.count || 0) > 0
  if (key === 'dbt') return !!daily.dbt?.practiced
  if (key === 'sensory') return daily.sensory?.level !== undefined
  if (key === 'window') return daily.window !== undefined
  if (key === 'dissociation') return daily.dissociation !== undefined
  if (key === 'bodySelf') return !!daily.bodySelf
  if (key === 'feelings') return daily.emotions && daily.emotions.length > 0
  if (key === 'urges') return daily.urges && daily.urges.length > 0
  if (key === 'chain') return !!daily.chainAnalysis
  if (key === 'connection') return !!daily.connection
  if (key === 'meals') return daily.meals?.breakfast || daily.meals?.lunch || daily.meals?.dinner
  if (key === 'wins') return !!daily.win
  if (key === 'reading') return !!daily.reading?.minutes
  if (key === 'custom') return daily.customTrackers && Object.values(daily.customTrackers).some(v => v)
  if (key === 'weekly') return false // Always available
  return false
}

export default function CheckinsTab({ daily, onUpdate, profile, onProfileUpdate, onOpenCrisis, initialSub, fromHome, onGoHome }) {
  // If we arrive with a specific sub (from HomeTab navigation), go directly there
  const [activeSub, setActiveSub] = useState(initialSub || null)

  // Figure out which source the active sub belongs to
  const activeSource = useMemo(() => {
    if (!activeSub) return null
    const tile = ALL_TILES.find(t => t.key === activeSub)
    return tile?.source || null
  }, [activeSub])

  // If a sub-section is active, render the appropriate tab component in focus mode
  if (activeSub && activeSource === 'recovery') {
    return (
      <RecoveryTab
        daily={daily}
        onUpdate={onUpdate}
        onOpenCrisis={onOpenCrisis}
        initialSub={activeSub}
        focusMode={true}
        fromHome={fromHome}
        onGoHome={() => {
          if (fromHome) {
            onGoHome()
          } else {
            setActiveSub(null)
          }
        }}
      />
    )
  }

  if (activeSub && activeSource === 'body') {
    return (
      <BodyTab
        daily={daily}
        onUpdate={onUpdate}
        profile={profile}
        initialSub={activeSub}
        focusMode={true}
        fromHome={fromHome}
        onGoHome={() => {
          if (fromHome) {
            onGoHome()
          } else {
            setActiveSub(null)
          }
        }}
      />
    )
  }

  // Life section tiles render standalone components
  if (activeSub && activeSource === 'life') {
    const goBack = () => {
      if (fromHome) { onGoHome() } else { setActiveSub(null) }
    }
    const wrap = (child) => (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ padding: '12px 16px' }}>
          <button onClick={goBack} style={{ background: 'none', border: 'none', fontSize: 14, fontWeight: 800, color: 'var(--primary, #6BA89E)', cursor: 'pointer', padding: '8px 0' }}>
            ← Back
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 16px 100px' }}>
          {child}
        </div>
      </div>
    )
    if (activeSub === 'wins') return wrap(<WinsSection daily={daily} onUpdate={onUpdate} fromHome={fromHome} onGoHome={goBack} />)
    if (activeSub === 'reading') return wrap(<ReadingSection daily={daily} onUpdate={onUpdate} fromHome={fromHome} onGoHome={goBack} />)
    if (activeSub === 'custom') return wrap(<CustomTrackersSection daily={daily} onUpdate={onUpdate} profile={profile} fromHome={fromHome} onGoHome={goBack} />)
  }

  // Default: tile grid view
  const doneCount = ALL_TILES.filter(t => isDone(t.key, daily)).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '12px 16px' }}>
        <TopNav onGoHome={onGoHome} />
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 16px 100px' }}>
        {/* Progress summary */}
        <div style={{
          textAlign: 'center',
          marginBottom: 16,
          padding: '12px 16px',
          borderRadius: 16,
          background: 'var(--card, white)',
          boxShadow: '0 2px 8px rgba(61,53,53,0.06)',
        }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text, #3D3535)' }}>
            {doneCount} check-ins done today
          </div>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-light, #8A7F7F)', marginTop: 4 }}>
            Tap any tile to check in
          </div>
        </div>

        {/* Heart & Recovery */}
        <div style={{ marginBottom: 20 }}>
          <div style={{
            fontSize: 11, fontWeight: 800, letterSpacing: 1,
            color: 'var(--text-light, #8A7F7F)', marginBottom: 10,
            textTransform: 'uppercase',
          }}>
            Heart & Recovery
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 10,
          }}>
            {RECOVERY_TILES.map(tile => {
              const done = isDone(tile.key, daily)
              return (
                <button
                  key={tile.key}
                  onClick={() => { tapFeedback(); setActiveSub(tile.key) }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 6,
                    padding: '16px 8px',
                    borderRadius: 16,
                    border: `2px solid ${done ? tile.color : '#F0E8E0'}`,
                    background: done ? tile.bg : 'var(--card, white)',
                    cursor: 'pointer',
                    minHeight: 80,
                    boxShadow: '0 2px 8px rgba(61,53,53,0.04)',
                    transition: 'transform 0.1s, border-color 0.2s',
                  }}
                >
                  <span style={{ fontSize: 24 }}>{tile.emoji}</span>
                  <span style={{
                    fontSize: 11, fontWeight: 700,
                    color: done ? tile.color : 'var(--text, #3D3535)',
                  }}>
                    {tile.label}
                  </span>
                  {done && <span style={{ fontSize: 10, color: tile.color }}>Done</span>}
                </button>
              )
            })}
          </div>
        </div>

        {/* Body & Brain */}
        <div style={{ marginBottom: 20 }}>
          <div style={{
            fontSize: 11, fontWeight: 800, letterSpacing: 1,
            color: 'var(--text-light, #8A7F7F)', marginBottom: 10,
            textTransform: 'uppercase',
          }}>
            Body & Brain
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 10,
          }}>
            {BODY_TILES.map(tile => {
              const done = isDone(tile.key, daily)
              return (
                <button
                  key={tile.key}
                  onClick={() => { tapFeedback(); setActiveSub(tile.key) }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 6,
                    padding: '16px 8px',
                    borderRadius: 16,
                    border: `2px solid ${done ? tile.color : '#F0E8E0'}`,
                    background: done ? tile.bg : 'var(--card, white)',
                    cursor: 'pointer',
                    minHeight: 80,
                    boxShadow: '0 2px 8px rgba(61,53,53,0.04)',
                    transition: 'transform 0.1s, border-color 0.2s',
                  }}
                >
                  <span style={{ fontSize: 24 }}>{tile.emoji}</span>
                  <span style={{
                    fontSize: 11, fontWeight: 700,
                    color: done ? tile.color : 'var(--text, #3D3535)',
                  }}>
                    {tile.label}
                  </span>
                  {done && <span style={{ fontSize: 10, color: tile.color }}>Done</span>}
                </button>
              )
            })}
          </div>
        </div>

        {/* Life Building */}
        <div>
          <div style={{
            fontSize: 11, fontWeight: 800, letterSpacing: 1,
            color: 'var(--text-light, #8A7F7F)', marginBottom: 10,
            textTransform: 'uppercase',
          }}>
            Life Building
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 10,
          }}>
            {LIFE_TILES.map(tile => {
              const done = isDone(tile.key, daily)
              return (
                <button
                  key={tile.key}
                  onClick={() => { tapFeedback(); setActiveSub(tile.key) }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 6,
                    padding: '16px 8px',
                    borderRadius: 16,
                    border: `2px solid ${done ? tile.color : '#F0E8E0'}`,
                    background: done ? tile.bg : 'var(--card, white)',
                    cursor: 'pointer',
                    minHeight: 80,
                    boxShadow: '0 2px 8px rgba(61,53,53,0.04)',
                    transition: 'transform 0.1s, border-color 0.2s',
                  }}
                >
                  <span style={{ fontSize: 24 }}>{tile.emoji}</span>
                  <span style={{
                    fontSize: 11, fontWeight: 700,
                    color: done ? tile.color : 'var(--text, #3D3535)',
                  }}>
                    {tile.label}
                  </span>
                  {done && <span style={{ fontSize: 10, color: tile.color }}>Done</span>}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
