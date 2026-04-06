import { useState } from 'react'
import { CREATURES } from '../../constants/creatures.js'
import storage from '../../utils/storage.js'

const C = {
  primary: '#6BA89E', primaryLight: '#E8F4F1', accent: '#E8907E',
  text: '#3D3535', textLight: '#8A7F7F', red: '#E87B7B', redBg: '#FDECEC', card: '#FFFFFF',
}
const card = { background: C.card, borderRadius: 20, padding: '18px', boxShadow: '0 2px 12px rgba(61,53,53,0.08)', marginBottom: 14 }

export default function SettingsModal({ isOpen, onClose, profile, onProfileUpdate }) {
  const [confirmReset, setConfirmReset] = useState(false)
  const [confirmReset2, setConfirmReset2] = useState(false)
  const [crisisKael, setCrisisKael] = useState(profile?.crisisContacts?.kael || '')
  const [crisisLuis, setCrisisLuis] = useState(profile?.crisisContacts?.luis || '')
  const [creatureName, setCreatureName] = useState(profile?.creatureName || '')
  const [saved, setSaved] = useState(false)

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

  // Phase advancement with minimum-week gate
  const getWeeksInPhase = () => {
    if (!profile?.puppyPhaseStartDate) return 0
    return Math.floor((Date.now() - new Date(profile.puppyPhaseStartDate).getTime()) / (7 * 86400000))
  }

  const getMinWeeksForPhase = (phase) => {
    const minimums = { 1: 4, 2: 6, 3: 6 }
    return minimums[phase] || 4
  }

  const setPhase = (phase) => {
    const currentPhase = profile?.puppyPhase || 1
    const weeksInPhase = getWeeksInPhase()
    const minWeeks = getMinWeeksForPhase(currentPhase)

    // Allow going back freely, but gate going forward
    if (phase > currentPhase && weeksInPhase < minWeeks) return
    onProfileUpdate({ puppyPhase: phase, puppyPhaseStartDate: new Date().toISOString().slice(0, 10) })
  }

  const resetAll = async () => {
    const keys = await storage.list('diana-')
    await Promise.all(keys.map(k => storage.delete(k)))
    window.location.reload()
  }

  const currentPhase = profile?.puppyPhase || 1
  const weeksInPhase = getWeeksInPhase()

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(61,53,53,0.7)', display: 'flex', alignItems: 'flex-end' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: '#FFF8F3', width: '100%', maxWidth: 430, margin: '0 auto', borderRadius: '24px 24px 0 0', maxHeight: '92dvh', display: 'flex', flexDirection: 'column', animation: 'fade-up 0.25s ease-out' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px 12px', borderBottom: '1px solid #F0E8E0' }}>
          <div style={{ fontSize: 20, fontWeight: 900, color: C.text }}>⚙️ Settings</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: C.textLight, padding: '4px 8px' }}>✕</button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px', paddingBottom: 'max(20px, env(safe-area-inset-bottom))' }}>

          {/* Creature */}
          <div style={card}>
            <div style={{ fontSize: 15, fontWeight: 900, color: C.text, marginBottom: 12 }}>Your creature</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 14 }}>
              {CREATURES.map(c => (
                <button key={c.id} onClick={() => pickCreature(c.id)} style={{ padding: '14px 8px', borderRadius: 16, border: `3px solid ${profile?.creature === c.id ? C.primary : '#F0E8E0'}`, background: profile?.creature === c.id ? C.primaryLight : 'white', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 32 }}>{c.emoji}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{c.name}</span>
                </button>
              ))}
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.textLight, marginBottom: 6 }}>Creature's name</div>
            <input value={creatureName} onChange={e => setCreatureName(e.target.value)} style={{ width: '100%', padding: '12px 14px', borderRadius: 14, border: '2px solid #F0E8E0', fontSize: 15, fontWeight: 700, background: 'white', color: C.text, outline: 'none', boxSizing: 'border-box' }} />
          </div>

          {/* Crisis contacts */}
          <div style={card}>
            <div style={{ fontSize: 15, fontWeight: 900, color: C.text, marginBottom: 12 }}>Crisis contacts</div>
            {[['Kael', crisisKael, setCrisisKael], ['Luis', crisisLuis, setCrisisLuis]].map(([name, val, setter]) => (
              <div key={name} style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.textLight, marginBottom: 6 }}>{name}'s phone number</div>
                <input type="tel" value={val} onChange={e => setter(e.target.value)} placeholder="+1 555 000 0000" style={{ width: '100%', padding: '12px 14px', borderRadius: 14, border: '2px solid #F0E8E0', fontSize: 15, fontWeight: 700, background: 'white', color: C.text, outline: 'none', boxSizing: 'border-box' }} />
              </div>
            ))}
          </div>

          {/* Schizoaffective module */}
          <div style={card}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 900, color: C.text }}>Brain check-in</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.textLight, marginTop: 2 }}>Weekly thought check-in (optional)</div>
              </div>
              <button onClick={toggleSchizo} style={{ width: 52, height: 28, borderRadius: 14, border: 'none', background: profile?.schizoModule ? C.primary : '#D0C8C0', cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}>
                <div style={{ position: 'absolute', top: 3, left: profile?.schizoModule ? 26 : 3, width: 22, height: 22, borderRadius: '50%', background: 'white', transition: 'left 0.2s' }} />
              </button>
            </div>
          </div>

          {/* Puppy phase — with minimum-week gating */}
          <div style={card}>
            <div style={{ fontSize: 15, fontWeight: 900, color: C.text, marginBottom: 4 }}>Training phase</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.textLight, marginBottom: 12 }}>
              {weeksInPhase > 0 ? `Week ${weeksInPhase} of Phase ${currentPhase}` : `Phase ${currentPhase} — just started`}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {[1, 2, 3].map(p => {
                const isActive = currentPhase === p
                const minWeeks = getMinWeeksForPhase(currentPhase)
                const canAdvance = p <= currentPhase || weeksInPhase >= minWeeks
                const weeksNeeded = !canAdvance ? minWeeks - weeksInPhase : 0

                return (
                  <div key={p} style={{ flex: 1 }}>
                    <button
                      onClick={() => setPhase(p)}
                      disabled={!canAdvance}
                      style={{
                        width: '100%', padding: '12px 4px', borderRadius: 14,
                        border: `2px solid ${isActive ? C.primary : canAdvance ? '#F0E8E0' : '#E8E0D8'}`,
                        background: isActive ? C.primaryLight : canAdvance ? 'white' : '#F8F6F4',
                        color: isActive ? C.primary : canAdvance ? C.text : C.textLight,
                        fontSize: 14, fontWeight: 800,
                        cursor: canAdvance ? 'pointer' : 'not-allowed',
                        opacity: canAdvance ? 1 : 0.6,
                      }}
                    >
                      Phase {p}
                    </button>
                    {weeksNeeded > 0 && (
                      <div style={{ fontSize: 10, fontWeight: 700, color: C.textLight, textAlign: 'center', marginTop: 4 }}>
                        {weeksNeeded}w more
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Save */}
          <button onClick={saveSettings} style={{ width: '100%', padding: '16px', borderRadius: 16, border: 'none', background: saved ? '#6BBF8A' : C.primary, color: 'white', fontSize: 16, fontWeight: 800, cursor: 'pointer', marginBottom: 14, transition: 'background 0.3s' }}>
            {saved ? 'Saved! ✓' : 'Save settings'}
          </button>

          {/* Reset — softened: no colored card, just a subtle section */}
          <div style={{ ...card, border: '1px solid #F0E8E0', background: 'white' }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: C.textLight, marginBottom: 4 }}>Danger zone</div>
            <p style={{ fontSize: 13, fontWeight: 600, color: C.textLight, marginBottom: 14, lineHeight: 1.5 }}>
              Reset all data — this deletes everything and cannot be undone.
            </p>
            {!confirmReset && (
              <button
                onClick={() => setConfirmReset(true)}
                style={{ background: 'none', border: 'none', color: C.red, fontSize: 13, fontWeight: 700, cursor: 'pointer', padding: '4px 0', textDecoration: 'underline' }}
              >
                Delete all my data
              </button>
            )}
            {confirmReset && !confirmReset2 && (
              <div>
                <p style={{ fontSize: 14, fontWeight: 800, color: C.red, marginBottom: 10 }}>Are you sure? This can't be undone.</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setConfirmReset(false)} style={{ flex: 1, padding: '12px', borderRadius: 14, border: 'none', background: '#F0E8E0', color: C.text, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
                  <button onClick={() => setConfirmReset2(true)} style={{ flex: 1, padding: '12px', borderRadius: 14, border: `2px solid ${C.red}`, background: 'white', color: C.red, fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>Yes, reset</button>
                </div>
              </div>
            )}
            {confirmReset2 && (
              <div>
                <p style={{ fontSize: 14, fontWeight: 800, color: C.red, marginBottom: 10 }}>Last chance. Really delete everything?</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => { setConfirmReset(false); setConfirmReset2(false) }} style={{ flex: 1, padding: '12px', borderRadius: 14, border: 'none', background: '#F0E8E0', color: C.text, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
                  <button onClick={resetAll} style={{ flex: 1, padding: '12px', borderRadius: 14, border: 'none', background: C.red, color: 'white', fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>Delete all</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
