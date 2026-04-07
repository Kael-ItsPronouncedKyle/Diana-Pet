import { useState } from 'react'
import { CREATURES } from '../../constants/creatures.js'
import storage from '../../utils/storage.js'
import { supabase, supabaseEnabled } from '../../lib/supabase.js'
import SafetyPlanWizard from '../SafetyPlanWizard.jsx'
import ValuesAnchor from '../shared/ValuesAnchor.jsx'
import ProviderExport from './ProviderExport.jsx'

const card = {
  background: 'var(--card)',
  borderRadius: 20,
  padding: '20px',
  boxShadow: '0 2px 8px rgba(61,53,53,0.06)',
  marginBottom: 16,
}

export default function SettingsModal({ isOpen, onClose, profile, onProfileUpdate, darkMode, onToggleDarkMode, onToggleHaptics }) {
  const [confirmReset, setConfirmReset] = useState(false)
  const [confirmReset2, setConfirmReset2] = useState(false)
  const [crisisKael, setCrisisKael] = useState(profile?.crisisContacts?.kael || '')
  const [crisisLuis, setCrisisLuis] = useState(profile?.crisisContacts?.luis || '')
  const [creatureName, setCreatureName] = useState(profile?.creatureName || '')
  const [saved, setSaved] = useState(false)
  const [showSafetyPlan, setShowSafetyPlan] = useState(false)
  const [showExport, setShowExport] = useState(false)

  // Custom Trackers
  const [newTrackerName, setNewTrackerName] = useState('')
  const [newTrackerEmoji, setNewTrackerEmoji] = useState('✅')

  // Luis Shift
  const [selectedDays, setSelectedDays] = useState(profile?.luisShift?.workDays || [4, 5, 6, 0])

  const EMOJI_OPTIONS = ['✅', '🚿', '🦷', '👕', '🏠', '📱', '🧹', '🍳', '💪', '🎨', '📖', '🧘']
  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  if (!isOpen) return null

  const saveSettings = () => {
    onProfileUpdate({
      creatureName: creatureName.trim() || profile?.creatureName,
      crisisContacts: { kael: crisisKael, luis: crisisLuis },
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const pickCreature = (id) => {
    const c = CREATURES.find(cr => cr.id === id)
    onProfileUpdate({ creature: id, creatureName: c?.name || creatureName })
    setCreatureName(c?.name || creatureName)
  }

  const toggleSchizo = () => {
    onProfileUpdate({ schizoModule: !profile?.schizoModule })
  }

  const advancePhase = (phase) => {
    if (phase < 1 || phase > 3) return
    onProfileUpdate({ puppyPhase: phase, puppyPhaseStartDate: new Date().toISOString().slice(0, 10) })
  }

  const addCustomTracker = () => {
    if (!newTrackerName.trim()) return
    const newTracker = {
      id: Date.now().toString(),
      name: newTrackerName.trim(),
      emoji: newTrackerEmoji,
    }
    const updated = [...(profile?.customTrackers || []), newTracker]
    onProfileUpdate({ customTrackers: updated })
    setNewTrackerName('')
    setNewTrackerEmoji('✅')
  }

  const removeCustomTracker = (id) => {
    const updated = (profile?.customTrackers || []).filter(t => t.id !== id)
    onProfileUpdate({ customTrackers: updated })
  }

  const toggleDay = (dayIndex) => {
    const updated = selectedDays.includes(dayIndex)
      ? selectedDays.filter(d => d !== dayIndex)
      : [...selectedDays, dayIndex].sort((a, b) => a - b)
    setSelectedDays(updated)
    onProfileUpdate({ luisShift: { workDays: updated } })
  }

  const resetAll = async () => {
    const keys = await storage.list('diana-')
    await Promise.all(keys.map(k => storage.delete(k)))
    if (supabase) await supabase.auth.signOut()
    window.location.reload()
  }

  const signOut = async () => {
    if (!supabase) return
    onClose()
    await supabase.auth.signOut()
  }

  const hasSafetyPlan = profile?.safetyPlan?.completedAt

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'var(--bg)', display: 'flex', flexDirection: 'column', animation: 'fade-up 0.25s ease-out' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', height: 48, borderBottom: '1px solid rgba(61,53,53,0.08)' }}>
        <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: 'var(--text)', padding: '8px', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>←</button>
        <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--text)', flex: 1, textAlign: 'center' }}>Settings</div>
        <div style={{ width: 44 }} />
      </div>
      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px 100px 20px' }}>

          {/* Safety Plan Wizard */}
          {showSafetyPlan ? (
            <SafetyPlanWizard
              profile={profile}
              onProfileUpdate={onProfileUpdate}
              onClose={() => setShowSafetyPlan(false)}
            />
          ) : (
            <>
              {/* Safety Plan Section */}
              <div style={{ ...card, border: `2px solid ${hasSafetyPlan ? 'var(--green)' : 'var(--primary)'}`, background: hasSafetyPlan ? 'var(--green-bg)' : 'var(--primary-light)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: 24 }}>🛡️</span>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 900, color: 'var(--text)' }}>My Safety Plan</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-light)' }}>
                      {hasSafetyPlan ? 'Set up ✓' : 'Not set up yet'}
                    </div>
                  </div>
                </div>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-light)', lineHeight: 1.5, marginBottom: 12 }}>
                  Your safety plan is yours. It holds the things that help when things get hard.
                </p>
                <button
                  onClick={() => setShowSafetyPlan(true)}
                  style={{
                    width: '100%', padding: '14px', borderRadius: 14, border: 'none',
                    background: 'var(--primary)', color: 'white', fontSize: 15, fontWeight: 800, cursor: 'pointer',
                  }}
                >
                  {hasSafetyPlan ? 'Edit my safety plan' : 'Set up my safety plan'}
                </button>
              </div>

              {/* Provider Export */}
              <div style={card}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: 24 }}>📋</span>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 900, color: 'var(--text)' }}>For my therapist</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-light)' }}>Share your week with your care team</div>
                  </div>
                </div>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-light)', lineHeight: 1.5, marginBottom: 12 }}>
                  Makes a summary of your last 7 days that you can copy and show your therapist or doctor.
                </p>
                <button
                  onClick={() => setShowExport(true)}
                  style={{
                    width: '100%', padding: '14px', borderRadius: 14, border: 'none',
                    background: 'var(--primary)', color: 'white', fontSize: 15, fontWeight: 800, cursor: 'pointer',
                  }}
                >
                  See my summary
                </button>
              </div>

              {/* Creature */}
              <div style={card}>
                <div style={{ fontSize: 15, fontWeight: 900, color: 'var(--text)', marginBottom: 12 }}>Your creature</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 14 }}>
                  {CREATURES.map(c => (
                    <button key={c.id} onClick={() => pickCreature(c.id)} style={{ padding: '14px 8px', borderRadius: 16, border: `3px solid ${profile?.creature === c.id ? 'var(--primary)' : 'rgba(61,53,53,0.1)'}`, background: profile?.creature === c.id ? 'var(--primary-light)' : 'var(--card)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                      <span style={{ fontSize: 32 }}>{c.emoji}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>{c.name}</span>
                    </button>
                  ))}
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-light)', marginBottom: 6 }}>Creature's name</div>
                <input value={creatureName} onChange={e => setCreatureName(e.target.value)} style={{ width: '100%', padding: '12px 14px', borderRadius: 14, border: '2px solid rgba(61,53,53,0.1)', fontSize: 15, fontWeight: 700, background: 'var(--card)', color: 'var(--text)', outline: 'none', boxSizing: 'border-box' }} />
              </div>

              {/* Crisis contacts */}
              <div style={card}>
                <div style={{ fontSize: 15, fontWeight: 900, color: 'var(--text)', marginBottom: 12 }}>Crisis contacts</div>
                {[['Kael', crisisKael, setCrisisKael], ['Luis', crisisLuis, setCrisisLuis]].map(([name, val, setter]) => (
                  <div key={name} style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-light)', marginBottom: 6 }}>{name}'s phone number</div>
                    <input type="tel" value={val} onChange={e => setter(e.target.value)} placeholder="+1 555 000 0000" style={{ width: '100%', padding: '12px 14px', borderRadius: 14, border: '2px solid rgba(61,53,53,0.1)', fontSize: 15, fontWeight: 700, background: 'var(--card)', color: 'var(--text)', outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                ))}
              </div>

              {/* Dark Mode + Haptics */}
              <div style={card}>
                <div style={{ fontSize: 15, fontWeight: 900, color: 'var(--text)', marginBottom: 14 }}>Display & Feel</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text)' }}>🌙 Dark mode</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-light)' }}>Easier on eyes at night</div>
                  </div>
                  <button onClick={() => onToggleDarkMode?.(!darkMode)} style={{ width: 56, height: 30, borderRadius: 15, border: 'none', background: darkMode ? 'var(--primary)' : 'rgba(61,53,53,0.2)', cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}>
                    <div style={{ position: 'absolute', top: 3, left: darkMode ? 27 : 3, width: 24, height: 24, borderRadius: '50%', background: 'white', transition: 'left 0.2s' }} />
                  </button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text)' }}>📳 Haptic feedback</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-light)' }}>Vibrate on taps and saves</div>
                  </div>
                  <button onClick={() => onToggleHaptics?.(!(profile?.haptics ?? true))} style={{ width: 56, height: 30, borderRadius: 15, border: 'none', background: (profile?.haptics ?? true) ? 'var(--primary)' : 'rgba(61,53,53,0.2)', cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}>
                    <div style={{ position: 'absolute', top: 3, left: (profile?.haptics ?? true) ? 27 : 3, width: 24, height: 24, borderRadius: '50%', background: 'white', transition: 'left 0.2s' }} />
                  </button>
                </div>
              </div>

              {/* Schizoaffective module */}
              <div style={card}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 900, color: 'var(--text)' }}>Brain check-in</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-light)', marginTop: 2 }}>Weekly thought check-in (optional)</div>
                  </div>
                  <button onClick={toggleSchizo} style={{ width: 56, height: 30, borderRadius: 15, border: 'none', background: profile?.schizoModule ? 'var(--primary)' : 'rgba(61,53,53,0.2)', cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}>
                    <div style={{ position: 'absolute', top: 3, left: profile?.schizoModule ? 27 : 3, width: 24, height: 24, borderRadius: '50%', background: 'white', transition: 'left 0.2s' }} />
                  </button>
                </div>
              </div>

              {/* Puppy phase */}
              <div style={card}>
                <div style={{ fontSize: 15, fontWeight: 900, color: 'var(--text)', marginBottom: 10 }}>Training phase</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[1, 2, 3].map(p => (
                    <button key={p} onClick={() => advancePhase(p)} style={{ flex: 1, padding: '12px 4px', borderRadius: 14, border: `2px solid ${profile?.puppyPhase === p ? 'var(--primary)' : 'rgba(61,53,53,0.1)'}`, background: profile?.puppyPhase === p ? 'var(--primary-light)' : 'var(--card)', color: profile?.puppyPhase === p ? 'var(--primary)' : 'var(--text)', fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>
                      Phase {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Values Anchor / Letter to Myself */}
              <div style={card}>
                <div style={{ fontSize: 15, fontWeight: 900, color: 'var(--text)', marginBottom: 12 }}>My letter to myself</div>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-light)', lineHeight: 1.5, marginBottom: 12 }}>
                  Write something to yourself for hard days. Why are you doing this?
                </p>
                <ValuesAnchor profile={profile} onProfileUpdate={onProfileUpdate} mode="setup" />
              </div>

              {/* Custom Trackers */}
              <div style={card}>
                <div style={{ fontSize: 15, fontWeight: 900, color: 'var(--text)', marginBottom: 12 }}>My trackers</div>

                {/* Existing trackers */}
                {(profile?.customTrackers || []).length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    {profile.customTrackers.map(tracker => (
                      <div key={tracker.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'var(--bg)', borderRadius: 12, marginBottom: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontSize: 20 }}>{tracker.emoji}</span>
                          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{tracker.name}</span>
                        </div>
                        <button
                          onClick={() => removeCustomTracker(tracker.id)}
                          style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: 'var(--red)', padding: '8px', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add new tracker */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <input
                    type="text"
                    placeholder="What do you want to track?"
                    value={newTrackerName}
                    onChange={e => setNewTrackerName(e.target.value)}
                    style={{ width: '100%', padding: '12px 14px', borderRadius: 14, border: '2px solid rgba(61,53,53,0.1)', fontSize: 15, fontWeight: 700, background: 'var(--bg)', color: 'var(--text)', outline: 'none', boxSizing: 'border-box' }}
                  />

                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-light)', marginBottom: 8 }}>Pick an emoji</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 6 }}>
                      {EMOJI_OPTIONS.map(emoji => (
                        <button
                          key={emoji}
                          onClick={() => setNewTrackerEmoji(emoji)}
                          style={{
                            fontSize: 24,
                            padding: '10px',
                            borderRadius: 12,
                            border: `3px solid ${newTrackerEmoji === emoji ? 'var(--primary)' : 'rgba(61,53,53,0.1)'}`,
                            background: newTrackerEmoji === emoji ? 'var(--primary-light)' : 'var(--bg)',
                            cursor: 'pointer',
                            minHeight: 44,
                          }}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={addCustomTracker}
                    disabled={!newTrackerName.trim()}
                    style={{
                      width: '100%',
                      padding: '14px',
                      borderRadius: 14,
                      border: 'none',
                      background: newTrackerName.trim() ? 'var(--primary)' : 'rgba(61,53,53,0.1)',
                      color: newTrackerName.trim() ? 'white' : 'var(--text-light)',
                      fontSize: 15,
                      fontWeight: 800,
                      cursor: newTrackerName.trim() ? 'pointer' : 'not-allowed',
                    }}
                  >
                    Add tracker
                  </button>
                </div>
              </div>

              {/* Luis's Work Days */}
              <div style={card}>
                <div style={{ fontSize: 15, fontWeight: 900, color: 'var(--text)', marginBottom: 6 }}>Luis's work days</div>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-light)', lineHeight: 1.5, marginBottom: 12 }}>
                  Which days does Luis work? The app will know when you're home alone.
                </p>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {DAYS.map((day, idx) => (
                    <button
                      key={idx}
                      onClick={() => toggleDay(idx)}
                      style={{
                        flex: '1 0 calc(50% - 3px)',
                        minHeight: 44,
                        padding: '12px 8px',
                        borderRadius: 12,
                        border: `2px solid ${selectedDays.includes(idx) ? 'var(--primary)' : 'rgba(61,53,53,0.1)'}`,
                        background: selectedDays.includes(idx) ? 'var(--primary-light)' : 'var(--bg)',
                        color: selectedDays.includes(idx) ? 'var(--primary)' : 'var(--text)',
                        fontSize: 14,
                        fontWeight: 800,
                        cursor: 'pointer',
                      }}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              {/* Save */}
              <button onClick={saveSettings} style={{ width: '100%', padding: '16px', borderRadius: 16, border: 'none', background: saved ? 'var(--green)' : 'var(--primary)', color: 'white', fontSize: 16, fontWeight: 800, cursor: 'pointer', marginBottom: 14, transition: 'background 0.3s' }}>
                {saved ? 'Saved! ✓' : 'Save settings'}
              </button>

              {/* Sign out */}
              {supabaseEnabled && (
                <button onClick={signOut} style={{ width: '100%', padding: '16px', borderRadius: 16, border: '2px solid rgba(61,53,53,0.1)', background: 'var(--card)', color: 'var(--text)', fontSize: 16, fontWeight: 800, cursor: 'pointer', marginBottom: 14 }}>
                  Sign out
                </button>
              )}

              {/* Reset */}
              <div style={{ ...card, border: `2px solid var(--red)`, background: 'var(--red-bg)' }}>
                <div style={{ fontSize: 15, fontWeight: 900, color: 'var(--text)', marginBottom: 6 }}>Reset all data</div>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-light)', marginBottom: 12, lineHeight: 1.5 }}>This deletes everything — your creature, check-ins, streaks. It can't be undone.</p>
                {!confirmReset && <button onClick={() => setConfirmReset(true)} style={{ width: '100%', padding: '12px', borderRadius: 14, border: 'none', background: 'var(--red)', color: 'white', fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>Reset everything</button>}
                {confirmReset && !confirmReset2 && (
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 800, color: 'var(--red)', marginBottom: 10 }}>Are you sure? This can't be undone.</p>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => setConfirmReset(false)} style={{ flex: 1, padding: '12px', borderRadius: 14, border: 'none', background: 'rgba(61,53,53,0.1)', color: 'var(--text)', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
                      <button onClick={() => setConfirmReset2(true)} style={{ flex: 1, padding: '12px', borderRadius: 14, border: 'none', background: 'var(--red)', color: 'white', fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>Yes, reset</button>
                    </div>
                  </div>
                )}
                {confirmReset2 && (
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 800, color: 'var(--red)', marginBottom: 10 }}>Last chance. Really delete everything?</p>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => { setConfirmReset(false); setConfirmReset2(false) }} style={{ flex: 1, padding: '12px', borderRadius: 14, border: 'none', background: 'rgba(61,53,53,0.1)', color: 'var(--text)', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
                      <button onClick={resetAll} style={{ flex: 1, padding: '12px', borderRadius: 14, border: 'none', background: 'var(--red)', color: 'white', fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>Delete all</button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
      </div>
      {/* Sticky bottom save button */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, maxWidth: 430, margin: '0 auto', padding: '16px 20px', paddingBottom: 'max(16px, env(safe-area-inset-bottom))', background: 'var(--bg)', borderTop: '1px solid rgba(61,53,53,0.08)', display: 'flex', gap: 8 }}>
        <button onClick={onClose} style={{ flex: 1, padding: '14px', borderRadius: 14, border: 'none', background: 'rgba(61,53,53,0.1)', color: 'var(--text)', fontSize: 15, fontWeight: 800, cursor: 'pointer' }}>Close</button>
        <button onClick={saveSettings} style={{ flex: 1, padding: '14px', borderRadius: 14, border: 'none', background: saved ? 'var(--green)' : 'var(--primary)', color: 'white', fontSize: 15, fontWeight: 800, cursor: 'pointer', transition: 'background 0.3s' }}>
          {saved ? '✓ Saved' : 'Save'}
        </button>
      </div>
      {/* Provider Export Modal */}
      <ProviderExport isOpen={showExport} onClose={() => setShowExport(false)} />
    </div>
  )
}
