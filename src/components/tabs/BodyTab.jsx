import { useState, useEffect } from 'react'
import { getHour, weekKey, today } from '../../utils/dates.js'
import storage from '../../utils/storage.js'
import BackToHomeBanner from '../shared/BackToHomeBanner.jsx'
import TopNav from '../shared/TopNav.jsx'
import { detectTripleRisk } from '../../constants/clinicalConfig.js'

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

// ─── Sleep ──────────────────────────────────────────────────────────────────
const BEDTIMES = ['6 PM','7 PM','8 PM','9 PM','10 PM','11 PM','12 AM','1 AM','2 AM','3 AM','4 AM']
const WAKETIMES = ['4 AM','5 AM','6 AM','7 AM','8 AM','9 AM','10 AM','11 AM','12 PM','1 PM','2 PM']
const SLEEP_QUALITY = [
  { v: 1, emoji: '😴', label: 'Terrible' }, { v: 2, emoji: '😕', label: 'Not great' },
  { v: 3, emoji: '😐', label: 'Okay' }, { v: 4, emoji: '😊', label: 'Good' }, { v: 5, emoji: '🌟', label: 'Amazing' },
]
const WAKEUPS = ['No', 'Once', 'A few times', 'A lot']

function calcHours(bedStr, wakeStr) {
  const bedH = parseInt(bedStr) || 22
  const wakeH = parseInt(wakeStr) || 7
  const bed = bedH >= 18 ? bedH - 24 : bedH
  let h = wakeH - bed
  if (h < 0) h += 24
  return Math.round(h * 10) / 10
}

function SleepSection({ daily, onUpdate, fromHome, onGoHome }) {
  const s = daily?.sleep || {}
  const [bedtime, setBedtime] = useState(s.bedtime || '10 PM')
  const [waketime, setWaketime] = useState(s.waketime || '7 AM')
  const [wakeups, setWakeups] = useState(s.wakeups || null)
  const [quality, setQuality] = useState(s.quality || null)
  const [saved, setSaved] = useState(!!s.quality)

  const hours = calcHours(bedtime, waketime)
  const manicFlag = hours < 5 && quality >= 4

  const save = () => {
    onUpdate({ sleep: { bedtime, waketime, wakeups, quality, hours } })
    setSaved(true)
  }

  return (
    <div style={{ animation: 'fade-up 0.25s ease-out' }}>
      <BackToHomeBanner show={saved && fromHome} onGoHome={onGoHome} />
      {saved && quality <= 2 && (
        <div style={{ ...card, background: C.blueBg, border: `2px solid ${C.blue}` }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: C.text }}>Rough night. Be extra gentle with yourself today. 💙</p>
        </div>
      )}
      <div style={card}>
        <div style={{ fontSize: 14, fontWeight: 800, color: C.text, marginBottom: 12 }}>What time did you go to bed?</div>
        <select value={bedtime} onChange={e => setBedtime(e.target.value)} style={{ width: '100%', padding: '12px 14px', borderRadius: 14, border: '2px solid #F0E8E0', fontSize: 15, fontWeight: 700, background: 'white', color: C.text, outline: 'none', marginBottom: 16 }}>
          {BEDTIMES.map(t => <option key={t}>{t}</option>)}
        </select>
        <div style={{ fontSize: 14, fontWeight: 800, color: C.text, marginBottom: 12 }}>What time did you wake up?</div>
        <select value={waketime} onChange={e => setWaketime(e.target.value)} style={{ width: '100%', padding: '12px 14px', borderRadius: 14, border: '2px solid #F0E8E0', fontSize: 15, fontWeight: 700, background: 'white', color: C.text, outline: 'none', marginBottom: 12 }}>
          {WAKETIMES.map(t => <option key={t}>{t}</option>)}
        </select>
        <div style={{ textAlign: 'center', fontSize: 18, fontWeight: 900, color: C.primary, marginBottom: 16 }}>
          {hours} hours slept
        </div>
        <div style={{ fontSize: 14, fontWeight: 800, color: C.text, marginBottom: 10 }}>Did you wake up during the night?</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
          {WAKEUPS.map(w => (
            <button key={w} onClick={() => setWakeups(w)} style={{ ...btn(wakeups === w, C.blue), flex: 1, minWidth: 70 }}>{w}</button>
          ))}
        </div>
        <div style={{ fontSize: 14, fontWeight: 800, color: C.text, marginBottom: 10 }}>How was your sleep?</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {SLEEP_QUALITY.map(q => (
            <button key={q.v} onClick={() => setQuality(q.v)} style={{ flex: 1, padding: '10px 4px', borderRadius: 14, border: `2px solid ${quality === q.v ? C.primary : '#F0E8E0'}`, background: quality === q.v ? C.primaryLight : 'white', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: 22 }}>{q.emoji}</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: C.textLight }}>{q.label}</span>
            </button>
          ))}
        </div>
        {manicFlag && (
          <div style={{ background: C.yellowBg, border: `2px solid ${C.yellow}`, borderRadius: 14, padding: '12px 14px', marginBottom: 14 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: C.text, margin: 0, lineHeight: 1.5 }}>Short sleep + high energy can be a sign your mood is shifting. Maybe check in with your support team today? 💛</p>
          </div>
        )}
        <button onClick={save} style={{ width: '100%', padding: '14px', borderRadius: 14, border: 'none', background: C.primary, color: 'white', fontSize: 15, fontWeight: 800, cursor: 'pointer' }}>
          Save sleep ✓
        </button>
      </div>
    </div>
  )
}

// ─── Meds ───────────────────────────────────────────────────────────────────
const MED_OPTS = [{ v: true, label: 'Yes ✅' }, { v: false, label: 'Not yet' }, { v: null, label: "Don't have" }]

function MedsSection({ daily, onUpdate, profile, fromHome, onGoHome }) {
  const hour = getHour()
  const showMorning = hour < 17
  const showEvening = hour >= 12
  const m = daily?.meds || {}
  const [recentMissedDays, setRecentMissedDays] = useState(0)

  // Check how many of the past 3 days had missed meds
  useEffect(() => {
    async function checkRecentMeds() {
      try {
        let missed = 0
        const now = new Date()
        for (let i = 1; i <= 3; i++) {
          const d = new Date(now)
          d.setDate(d.getDate() - i)
          const dateStr = d.toISOString().slice(0, 10)
          const data = await storage.get(`diana-daily:${dateStr}`)
          if (data?.meds?.morning === false || data?.meds?.evening === false) missed++
        }
        setRecentMissedDays(missed)
      } catch {
        // Storage error — don't show warning
      }
    }
    checkRecentMeds()
  }, [])

  const set = (field, val) => {
    const next = { ...m, [field]: val }
    onUpdate({ meds: next })
  }

  const renderMed = (label, field) => (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 14, fontWeight: 800, color: C.text, marginBottom: 10 }}>{label}</div>
      <div style={{ display: 'flex', gap: 8 }}>
        {MED_OPTS.map(o => (
          <button key={String(o.v)} onClick={() => set(field, o.v)} style={{ ...btn(m[field] === o.v, C.primary), flex: 1 }}>
            {o.label}
          </button>
        ))}
      </div>
      {m[field] === false && <p style={{ fontSize: 13, color: C.textLight, marginTop: 8, fontWeight: 600 }}>That's okay. We'll check in later 💊</p>}
    </div>
  )

  const medsDone = (m.morning !== undefined || !showMorning) && (m.evening !== undefined || !showEvening) && (m.morning !== undefined || m.evening !== undefined)
  const showMissedWarning = recentMissedDays >= 2

  return (
    <div style={{ animation: 'fade-up 0.25s ease-out' }}>
      <BackToHomeBanner show={medsDone && fromHome} onGoHome={onGoHome} />
      {/* Warm missed-meds note — shown when 2+ recent days were missed */}
      {showMissedWarning && (
        <div style={{ ...card, background: C.yellowBg, border: `2px solid ${C.yellow}` }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: C.text, margin: 0, lineHeight: 1.5 }}>
            Your meds help your brain stay steady. Missing them makes everything harder. Can you take them today? 💊
          </p>
        </div>
      )}
      <div style={card}>
        {showMorning && renderMed('Did you take your morning meds? ☀️', 'morning')}
        {showEvening && renderMed('Did you take your evening meds? 🌙', 'evening')}
        {profile?.medStreak > 1 && (
          <div style={{ textAlign: 'center', padding: '10px', background: C.greenBg, borderRadius: 14, fontSize: 14, fontWeight: 800, color: C.green }}>
            💊 {profile.medStreak} days in a row!
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Energy & Pain ──────────────────────────────────────────────────────────
const ENERGY = [
  { v: 1, emoji: '😴', label: 'Crashed', sub: 'Rest is okay.' },
  { v: 2, emoji: '🥱', label: 'Very low', sub: 'Moving slow.' },
  { v: 3, emoji: '😐', label: 'Getting by', sub: 'Not great, not terrible.' },
  { v: 4, emoji: '😊', label: 'Good energy', sub: 'Feeling pretty solid.' },
  { v: 5, emoji: '🌟', label: 'Great energy', sub: "Let's go!" },
]
const PAIN = [
  { v: 1, label: '1\nNo pain' }, { v: 2, label: '2\nA little' },
  { v: 3, label: '3\nMedium' }, { v: 4, label: '4\nA lot' }, { v: 5, label: '5\nSevere' },
]
const CRASH_TRIGGERS = ['Did too much yesterday', "Didn't sleep well", 'Stress', 'Sensory overload', 'Heat', 'Forgot to eat', 'Skipped meds', 'Other']

function EnergySection({ daily, onUpdate, fromHome, onGoHome }) {
  const d = daily || {}
  const [energy, setEnergy] = useState(d.energy || null)
  const [pain, setPain] = useState(d.pain || null)
  const [crashTriggered, setCrashTriggered] = useState(d.crash?.triggered || null)
  const [triggers, setTriggers] = useState(d.crash?.triggers || [])
  const [restHours, setRestHours] = useState(d.restHours || 0)
  const [actActive, setActActive] = useState(d.activity?.attempted || null)
  const [actTolerance, setActTolerance] = useState(d.activity?.tolerance || null)
  const [saved, setSaved] = useState(d.energy !== undefined)

  const toggleTrigger = (t) => setTriggers(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])

  const save = () => {
    onUpdate({ energy, pain, crash: { triggered: crashTriggered, triggers }, restHours, activity: { attempted: actActive, tolerance: actTolerance } })
    setSaved(true)
  }

  return (
    <div style={{ animation: 'fade-up 0.25s ease-out' }}>
      <BackToHomeBanner show={saved && fromHome} onGoHome={onGoHome} />
      {energy <= 2 && energy !== null && (
        <div style={{ ...card, background: C.blueBg, border: `2px solid ${C.blue}` }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: C.text, margin: 0 }}>Rest is not giving up — it's taking care of yourself. 💙</p>
        </div>
      )}
      <div style={card}>
        <div style={{ fontSize: 14, fontWeight: 800, color: C.text, marginBottom: 12 }}>Energy level</div>
        <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
          {ENERGY.map(e => (
            <button key={e.v} onClick={() => setEnergy(e.v)} style={{ flex: 1, padding: '10px 2px', borderRadius: 14, border: `2px solid ${energy === e.v ? C.accent : '#F0E8E0'}`, background: energy === e.v ? '#FDE8E4' : 'white', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: 24 }}>{e.emoji}</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: C.textLight, textAlign: 'center' }}>{e.label}</span>
            </button>
          ))}
        </div>
        <div style={{ fontSize: 14, fontWeight: 800, color: C.text, marginBottom: 10 }}>Pain level</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {PAIN.map(p => (
            <button key={p.v} onClick={() => setPain(p.v)} style={{ flex: 1, padding: '12px 2px', borderRadius: 14, border: `2px solid ${pain === p.v ? C.red : '#F0E8E0'}`, background: pain === p.v ? C.redBg : 'white', cursor: 'pointer', textAlign: 'center' }}>
              <span style={{ fontSize: 16, fontWeight: 800, color: C.text, whiteSpace: 'pre-line' }}>{p.label}</span>
            </button>
          ))}
        </div>

        {energy !== null && energy <= 2 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: C.text, marginBottom: 10 }}>Did something trigger this crash?</div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              {[{ v: true, l: 'Yes' }, { v: false, l: 'No' }].map(o => (
                <button key={String(o.v)} onClick={() => setCrashTriggered(o.v)} style={{ ...btn(crashTriggered === o.v), flex: 1 }}>{o.l}</button>
              ))}
            </div>
            {crashTriggered && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {CRASH_TRIGGERS.map(t => (
                  <button key={t} onClick={() => toggleTrigger(t)} style={{ padding: '8px 12px', borderRadius: 20, border: 'none', background: triggers.includes(t) ? C.primary : '#F0E8E0', color: triggers.includes(t) ? 'white' : C.text, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>{t}</button>
                ))}
              </div>
            )}
          </div>
        )}

        <div style={{ fontSize: 14, fontWeight: 800, color: C.text, marginBottom: 10 }}>Hours rested today (including sleep)</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <button onClick={() => setRestHours(h => Math.max(0, h - 1))} style={{ width: 44, height: 44, borderRadius: 14, border: '2px solid #F0E8E0', background: 'white', fontSize: 20, fontWeight: 900, cursor: 'pointer', color: C.text }}>−</button>
          <span style={{ flex: 1, textAlign: 'center', fontSize: 24, fontWeight: 900, color: C.text }}>{restHours}h</span>
          <button onClick={() => setRestHours(h => Math.min(24, h + 1))} style={{ width: 44, height: 44, borderRadius: 14, border: '2px solid #F0E8E0', background: 'white', fontSize: 20, fontWeight: 900, cursor: 'pointer', color: C.text }}>+</button>
        </div>

        <div style={{ fontSize: 14, fontWeight: 800, color: C.text, marginBottom: 10 }}>Did you try something active today?</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: actActive ? 10 : 16 }}>
          {[{ v: true, l: 'Yes' }, { v: false, l: 'No' }].map(o => (
            <button key={String(o.v)} onClick={() => setActActive(o.v)} style={{ ...btn(actActive === o.v), flex: 1 }}>{o.l}</button>
          ))}
        </div>
        {actActive && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.textLight }}>How did your body handle it?</div>
            {['Fine', 'Okay at first but crashed later', 'Too much'].map(t => (
              <button key={t} onClick={() => setActTolerance(t)} style={{ ...btn(actTolerance === t), textAlign: 'left' }}>{t}</button>
            ))}
          </div>
        )}

        <button onClick={save} style={{ width: '100%', padding: '14px', borderRadius: 14, border: 'none', background: C.primary, color: 'white', fontSize: 15, fontWeight: 800, cursor: 'pointer' }}>
          Save ✓
        </button>
      </div>
    </div>
  )
}

// ─── Water ──────────────────────────────────────────────────────────────────
function WaterSection({ daily, onUpdate, fromHome, onGoHome }) {
  const count = daily?.water?.count || 0
  const set = (n) => onUpdate({ water: { count: Math.max(0, Math.min(8, n)) } })
  return (
    <div style={{ animation: 'fade-up 0.25s ease-out' }}>
      <BackToHomeBanner show={count > 0 && fromHome} onGoHome={onGoHome} />
      <div style={card}>
        <div style={{ fontSize: 14, fontWeight: 800, color: C.text, marginBottom: 6 }}>Water today</div>
        <div style={{ textAlign: 'center', fontSize: 18, fontWeight: 900, color: C.blue, marginBottom: 16 }}>{count}/8 glasses</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
          {Array.from({ length: 8 }, (_, i) => (
            <button key={i} onClick={() => set(i < count ? i : i + 1)} style={{ aspectRatio: '1', borderRadius: 16, border: `2px solid ${i < count ? C.blue : '#F0E8E0'}`, background: i < count ? C.blueBg : 'white', fontSize: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {i < count ? '💧' : '○'}
            </button>
          ))}
        </div>
        {count >= 8 && <div style={{ textAlign: 'center', fontSize: 18, fontWeight: 900, color: C.blue, marginBottom: 12 }}>🎉 You hit your water goal!</div>}
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => set(count - 1)} style={{ flex: 1, padding: '14px', borderRadius: 14, border: 'none', background: '#F0E8E0', color: C.text, fontSize: 18, fontWeight: 900, cursor: 'pointer' }}>−</button>
          <button onClick={() => set(count + 1)} style={{ flex: 1, padding: '14px', borderRadius: 14, border: 'none', background: C.blue, color: 'white', fontSize: 18, fontWeight: 900, cursor: 'pointer' }}>+</button>
        </div>
      </div>
    </div>
  )
}

// ─── Sensory ────────────────────────────────────────────────────────────────
const SENSORY_LEVELS = [
  { v: 1, emoji: '😌', label: 'Calm', sub: 'Everything feels manageable' },
  { v: 2, emoji: '😐', label: 'A little busy', sub: 'Some things are bothering me' },
  { v: 3, emoji: '😣', label: 'Overloaded', sub: 'Too much noise / light / touch / people' },
  { v: 4, emoji: '🤯', label: 'Shutting down', sub: 'I need to get somewhere quiet' },
  { v: 5, emoji: '💥', label: 'Meltdown zone', sub: 'Everything is too much right now' },
]
const SENSORY_BOTHERS = ['Noise', 'Light', 'Touch/texture', 'Smells', 'Too many people', 'Screens', 'Temperature', 'Everything']

function SensorySection({ daily, onUpdate, fromHome, onGoHome }) {
  const s = daily?.sensory || {}
  const [level, setLevel] = useState(s.level || null)
  const [bothering, setBothering] = useState(s.bothering || [])
  const [saved, setSaved] = useState(s.level !== undefined)

  const toggle = (b) => setBothering(prev => prev.includes(b) ? prev.filter(x => x !== b) : [...prev, b])
  const save = () => { onUpdate({ sensory: { level, bothering } }); setSaved(true) }

  return (
    <div style={{ animation: 'fade-up 0.25s ease-out' }}>
      <BackToHomeBanner show={saved && fromHome} onGoHome={onGoHome} />
      {level >= 4 && (
        <div style={{ ...card, background: '#FDE8E4', border: `2px solid ${C.accent}` }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: C.text, margin: 0, lineHeight: 1.6 }}>Can you get somewhere quiet? Try closing your eyes for 30 seconds. Put on headphones with no music — just quiet. 🫶</p>
        </div>
      )}
      <div style={card}>
        <div style={{ fontSize: 14, fontWeight: 800, color: C.text, marginBottom: 14 }}>How overloaded do your senses feel right now?</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          {SENSORY_LEVELS.map(sl => (
            <button key={sl.v} onClick={() => setLevel(sl.v)} style={{ padding: '14px 16px', borderRadius: 16, border: `2px solid ${level === sl.v ? C.accent : '#F0E8E0'}`, background: level === sl.v ? '#FDE8E4' : 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left' }}>
              <span style={{ fontSize: 28 }}>{sl.emoji}</span>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: C.text }}>{sl.v} — {sl.label}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.textLight }}>{sl.sub}</div>
              </div>
            </button>
          ))}
        </div>
        <div style={{ fontSize: 13, fontWeight: 800, color: C.textLight, marginBottom: 10 }}>What's bothering you most? (optional)</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          {SENSORY_BOTHERS.map(b => (
            <button key={b} onClick={() => toggle(b)} style={{ padding: '8px 14px', borderRadius: 20, border: 'none', background: bothering.includes(b) ? C.accent : '#F0E8E0', color: bothering.includes(b) ? 'white' : C.text, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>{b}</button>
          ))}
        </div>
        <button onClick={save} style={{ width: '100%', padding: '14px', borderRadius: 14, border: 'none', background: C.primary, color: 'white', fontSize: 15, fontWeight: 800, cursor: 'pointer' }}>Save ✓</button>
      </div>
    </div>
  )
}

// ─── Weekly Screening ───────────────────────────────────────────────────────
const MANIA_Q = [
  'Did you sleep a lot less than usual this week but feel okay or great?',
  'Are your thoughts moving faster than normal?',
  'Have you been spending money in ways that feel unusual for you?',
  'Do you feel like you can do anything — like nothing could go wrong?',
  'Have people told you that you\'re talking faster or louder?',
  'Have you been starting lots of new projects or plans?',
  'Is your sex drive way higher than your normal?',
]
const SCHIZO_Q = [
  'Have you been hearing things other people don\'t hear?',
  'Have you seen things that might not be there?',
  'Do you feel like someone is watching you or following you?',
  'Have your thoughts felt mixed up or hard to organize?',
  'Have you felt like the TV or radio was sending you messages?',
  'Have people or things felt unreal — like you\'re in a dream?',
]

function WeeklySection({ profile }) {
  const wk = weekKey()
  const key = `diana-weekly:${wk}`
  const [existing, setExisting] = useState(null)
  const [mAnswers, setMAnswers] = useState({})
  const [sAnswers, setSAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState(null)

  useEffect(() => {
    storage.get(key).then(d => { if (d) { setExisting(d); setResult(d) } })
  }, [key])

  const setM = (i, v) => setMAnswers(prev => ({ ...prev, [i]: v }))
  const setS = (i, v) => setSAnswers(prev => ({ ...prev, [i]: v }))

  const submit = async () => {
    const yesCount = Object.values(mAnswers).filter(v => v === 'yes').length
    const sYesCount = Object.values(sAnswers).filter(v => v === 'yes').length
    const r = { mania: mAnswers, schizo: sAnswers, yesCount, sYesCount, date: today() }
    await storage.set(key, r)
    setResult(r)
    setSubmitted(true)
  }

  const renderQ = (questions, answers, setter, color) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {questions.map((q, i) => (
        <div key={i} style={{ background: 'white', borderRadius: 16, padding: '14px' }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 10, lineHeight: 1.5 }}>{q}</p>
          <div style={{ display: 'flex', gap: 8 }}>
            {['yes', 'sometimes', 'no'].map(v => (
              <button key={v} onClick={() => setter(i, v)} style={{ flex: 1, padding: '10px 4px', borderRadius: 12, border: `2px solid ${answers[i] === v ? color : '#F0E8E0'}`, background: answers[i] === v ? color + '22' : 'white', color: answers[i] === v ? color : C.text, fontSize: 13, fontWeight: 700, cursor: 'pointer', textTransform: 'capitalize' }}>{v}</button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )

  if (result) return (
    <div style={{ animation: 'fade-up 0.25s ease-out' }}>
      <div style={{ ...card, background: result.yesCount >= 3 ? C.yellowBg : C.greenBg, border: `2px solid ${result.yesCount >= 3 ? C.yellow : C.green}` }}>
        <div style={{ fontSize: 24, marginBottom: 8 }}>{result.yesCount >= 3 ? '💛' : '💚'}</div>
        <p style={{ fontSize: 15, fontWeight: 700, color: C.text, lineHeight: 1.5, margin: 0 }}>
          {result.yesCount >= 3
            ? "Some of these can be signs your mood is shifting up. It's worth talking to your support team this week."
            : 'Everything looks steady this week. Nice. 💚'}
        </p>
      </div>
      {profile?.schizoModule && result.sYesCount >= 2 && (
        <div style={{ ...card, background: C.yellowBg, border: `2px solid ${C.yellow}` }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: C.text, lineHeight: 1.5, margin: 0 }}>💛 Some of these experiences can happen when your brain is under extra stress. Let your doctor or therapist know what you're noticing.</p>
        </div>
      )}
      <p style={{ textAlign: 'center', color: C.textLight, fontSize: 13, fontWeight: 600 }}>Completed this week ✅</p>
    </div>
  )

  return (
    <div style={{ animation: 'fade-up 0.25s ease-out' }}>
      <div style={{ ...card, background: C.primaryLight, border: `2px solid ${C.primary}` }}>
        <p style={{ fontSize: 15, fontWeight: 700, color: C.text, lineHeight: 1.5, margin: 0 }}>Let's do a weekly mood check. These questions help you and your team spot shifts early. There are no wrong answers.</p>
      </div>
      <div style={card}>
        <div style={{ fontSize: 15, fontWeight: 900, color: C.text, marginBottom: 14 }}>Mood Check</div>
        {renderQ(MANIA_Q, mAnswers, setM, C.yellow)}
      </div>
      {profile?.schizoModule && (
        <div style={card}>
          <div style={{ fontSize: 15, fontWeight: 900, color: C.text, marginBottom: 14 }}>Brain Check-in</div>
          <p style={{ fontSize: 13, color: C.textLight, fontWeight: 600, marginBottom: 12 }}>Let's check in on how your brain is doing this week. Just notice — no judgment.</p>
          {renderQ(SCHIZO_Q, sAnswers, setS, C.blue)}
        </div>
      )}
      <button
        onClick={submit}
        disabled={Object.keys(mAnswers).length < MANIA_Q.length}
        style={{ width: '100%', padding: '16px', borderRadius: 16, border: 'none', background: Object.keys(mAnswers).length >= MANIA_Q.length ? C.primary : '#E0E0E0', color: 'white', fontSize: 16, fontWeight: 800, cursor: 'pointer', marginBottom: 20 }}
      >
        Submit weekly check-in →
      </button>
    </div>
  )
}

// ─── Window of Tolerance (T1-04) ────────────────────────────────────────────
const WINDOW_LEVELS = [
  { v: 7, emoji: '🔴', label: 'Manic / out of control', zone: 'hyper', color: C.red, bg: C.redBg },
  { v: 6, emoji: '🟠', label: 'Racing thoughts, panicky, impulsive', zone: 'hyper', color: C.red, bg: C.redBg },
  { v: 5, emoji: '🟡', label: 'Tense but managing', zone: 'window', color: C.green, bg: C.greenBg },
  { v: 4, emoji: '🟢', label: 'Present and thinking clearly', zone: 'window', color: C.green, bg: C.greenBg },
  { v: 3, emoji: '🟡', label: 'A little foggy but okay', zone: 'window', color: C.green, bg: C.greenBg },
  { v: 2, emoji: '🔵', label: 'Numb, shut down, frozen', zone: 'hypo', color: C.blue, bg: C.blueBg },
  { v: 1, emoji: '🟣', label: 'Completely disconnected', zone: 'hypo', color: C.blue, bg: C.blueBg },
]

const WINDOW_SKILLS = {
  hyper: [
    { emoji: '🧊', label: 'Cold water on face or hold ice', skill: 'TIPP: Temperature' },
    { emoji: '🫁', label: 'Breathe in 4, out 6 — five times', skill: 'TIPP: Paced Breathing' },
    { emoji: '🛑', label: 'STOP: Stop, Take a step back, Observe, Proceed', skill: 'STOP Skill' },
  ],
  hypo: [
    { emoji: '👀', label: '5 things you see, 4 you hear, 3 you touch, 2 you smell, 1 you taste', skill: '5-4-3-2-1 Grounding' },
    { emoji: '🧘', label: 'Scan your body from toes to head — just notice', skill: 'Body Scan' },
    { emoji: '🚶', label: 'Stand up and stretch, or walk to another room', skill: 'Gentle Movement' },
  ],
}

function WindowSection({ daily, onUpdate, fromHome, onGoHome }) {
  const [selected, setSelected] = useState(daily?.window || null)
  const [saved, setSaved] = useState(daily?.window !== undefined)

  const level = WINDOW_LEVELS.find(l => l.v === selected)
  const skills = level ? WINDOW_SKILLS[level.zone] : null

  const save = () => {
    onUpdate({ window: selected })
    setSaved(true)
  }

  return (
    <div style={{ animation: 'fade-up 0.25s ease-out' }}>
      <BackToHomeBanner show={saved && fromHome} onGoHome={onGoHome} />
      <div style={card}>
        <div style={{ fontSize: 15, fontWeight: 800, color: C.text, marginBottom: 6 }}>Where is your nervous system right now?</div>
        <p style={{ fontSize: 13, fontWeight: 600, color: C.textLight, marginBottom: 14, lineHeight: 1.4 }}>
          This is your "window of tolerance" — the zone where you can think clearly. Above it = too revved up. Below it = too shut down.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          {WINDOW_LEVELS.map(l => (
            <button key={l.v} onClick={() => setSelected(l.v)} style={{
              padding: '14px 16px', borderRadius: 16,
              border: `2px solid ${selected === l.v ? l.color : '#F0E8E0'}`,
              background: selected === l.v ? l.bg : 'white',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left',
            }}>
              <span style={{ fontSize: 22 }}>{l.emoji}</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: C.text }}>{l.v}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.textLight }}>{l.label}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Zone label */}
        {level && (
          <div style={{ background: level.bg, borderRadius: 14, padding: '12px 16px', border: `2px solid ${level.color}`, marginBottom: 14, textAlign: 'center' }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: level.color }}>
              {level.zone === 'hyper' ? '⬆️ Above your window — too revved up' :
               level.zone === 'hypo' ? '⬇️ Below your window — too shut down' :
               '✅ Inside your window — you can think clearly'}
            </div>
          </div>
        )}

        {/* Skill suggestions for outside-window states */}
        {skills && level.zone !== 'window' && (
          <div style={{ background: '#F8F4F0', borderRadius: 16, padding: '14px 16px', marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: C.textLight, marginBottom: 10 }}>SKILLS THAT CAN HELP:</div>
            {skills.map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 0', borderBottom: i < skills.length - 1 ? '1px solid #F0E8E0' : 'none' }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>{s.emoji}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: C.text }}>{s.skill}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.textLight, lineHeight: 1.4 }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        <button onClick={save} disabled={!selected} style={{
          width: '100%', padding: '14px', borderRadius: 14, border: 'none',
          background: selected ? C.primary : '#E0E0E0', color: 'white',
          fontSize: 15, fontWeight: 800, cursor: selected ? 'pointer' : 'not-allowed',
        }}>
          Save ✓
        </button>
      </div>
    </div>
  )
}

// ─── Dissociation Tracking (T1-05) ──────────────────────────────────────────
const DISSOCIATION_LEVELS = [
  { v: 1, emoji: '💚', label: 'No', sub: 'I felt present today.' },
  { v: 2, emoji: '💛', label: 'A little', sub: 'Some moments felt hazy or far away.' },
  { v: 3, emoji: '🟠', label: 'Some', sub: 'I lost chunks of time or felt unreal.' },
  { v: 4, emoji: '❤️', label: 'A lot', sub: 'I was really disconnected from myself or the world.' },
]

function DissociationSection({ daily, onUpdate, fromHome, onGoHome }) {
  const [level, setLevel] = useState(daily?.dissociation || null)
  const [context, setContext] = useState(daily?.dissociationContext || '')
  const [saved, setSaved] = useState(daily?.dissociation !== undefined)

  const save = () => {
    onUpdate({ dissociation: level, dissociationContext: context.trim() })
    setSaved(true)
  }

  return (
    <div style={{ animation: 'fade-up 0.25s ease-out' }}>
      <BackToHomeBanner show={saved && fromHome} onGoHome={onGoHome} />

      {/* Grounding prompt if "A lot" */}
      {level === 4 && (
        <div style={{ ...card, background: C.blueBg, border: `2px solid ${C.blue}` }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: C.text, marginBottom: 8 }}>Let's ground you right now. 💙</div>
          <p style={{ fontSize: 14, fontWeight: 600, color: C.text, lineHeight: 1.6, margin: 0 }}>
            Look around and find:<br/>
            <strong>5</strong> things you can see<br/>
            <strong>4</strong> things you can touch<br/>
            <strong>3</strong> things you can hear<br/>
            <strong>2</strong> things you can smell<br/>
            <strong>1</strong> thing you can taste<br/>
            <br/>Take your time. There's no rush.
          </p>
        </div>
      )}

      <div style={card}>
        <div style={{ fontSize: 15, fontWeight: 800, color: C.text, marginBottom: 6 }}>Did you feel disconnected today?</div>
        <p style={{ fontSize: 13, fontWeight: 600, color: C.textLight, marginBottom: 14, lineHeight: 1.4 }}>
          Dissociation means feeling "not here" — like you're watching from outside yourself, or time goes missing.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          {DISSOCIATION_LEVELS.map(l => (
            <button key={l.v} onClick={() => setLevel(l.v)} style={{
              padding: '14px 16px', borderRadius: 16,
              border: `2px solid ${level === l.v ? C.accent : '#F0E8E0'}`,
              background: level === l.v ? '#FDE8E4' : 'white',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left',
            }}>
              <span style={{ fontSize: 24 }}>{l.emoji}</span>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: C.text }}>{l.label}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.textLight }}>{l.sub}</div>
              </div>
            </button>
          ))}
        </div>

        {level && level >= 2 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: C.textLight, marginBottom: 8 }}>What was happening when it started? (optional)</div>
            <textarea
              value={context}
              onChange={e => setContext(e.target.value)}
              placeholder="You can type, talk, or skip this."
              rows={3}
              style={{
                width: '100%', padding: '12px 14px', borderRadius: 14, border: '2px solid #F0E8E0',
                fontSize: 14, fontWeight: 600, background: 'white', color: C.text,
                resize: 'none', outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>
        )}

        <button onClick={save} disabled={!level} style={{
          width: '100%', padding: '14px', borderRadius: 14, border: 'none',
          background: level ? C.primary : '#E0E0E0', color: 'white',
          fontSize: 15, fontWeight: 800, cursor: level ? 'pointer' : 'not-allowed',
        }}>
          Save ✓
        </button>
      </div>
    </div>
  )
}

// ─── Body-Self Connection (T1-10) ───────────────────────────────────────────
const BODY_SELF_OPTIONS = [
  { v: 'at_home', emoji: '💜', label: 'At home', sub: 'My body feels like mine today.' },
  { v: 'okay', emoji: '💙', label: 'Okay', sub: "Not thinking about it much." },
  { v: 'disconnected', emoji: '😐', label: 'Disconnected', sub: "My body doesn't feel like me." },
  { v: 'dysphoric', emoji: '💔', label: 'Dysphoric', sub: 'Really struggling with my body today.' },
]

function BodySelfSection({ daily, onUpdate, fromHome, onGoHome }) {
  const [selected, setSelected] = useState(daily?.bodySelf || null)
  const [saved, setSaved] = useState(!!daily?.bodySelf)

  const save = () => {
    onUpdate({ bodySelf: selected })
    setSaved(true)
  }

  return (
    <div style={{ animation: 'fade-up 0.25s ease-out' }}>
      <BackToHomeBanner show={saved && fromHome} onGoHome={onGoHome} />

      {saved && selected === 'dysphoric' && (
        <div style={{ ...card, background: '#FDE8E4', border: `2px solid ${C.accent}` }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.text, lineHeight: 1.5, margin: 0 }}>
            Your body is yours. Even on the hardest days, you are allowed to take up space exactly as you are. 💜
          </div>
          <p style={{ fontSize: 13, fontWeight: 600, color: C.textLight, marginTop: 8, marginBottom: 0 }}>
            If you have a coping plan, check it now. You wrote it for moments like this.
          </p>
        </div>
      )}

      {saved && selected === 'disconnected' && (
        <div style={{ ...card, background: C.blueBg, border: `2px solid ${C.blue}` }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.text, lineHeight: 1.5, margin: 0 }}>
            Disconnected days happen. Try putting your hands under warm water or holding something cold — it can help you feel your body again. 💙
          </div>
        </div>
      )}

      <div style={card}>
        <div style={{ fontSize: 15, fontWeight: 800, color: C.text, marginBottom: 6 }}>How does your body feel today?</div>
        <p style={{ fontSize: 13, fontWeight: 600, color: C.textLight, marginBottom: 14, lineHeight: 1.4 }}>
          This is about your relationship with your body — not pain or energy, but how "at home" you feel in it.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
          {BODY_SELF_OPTIONS.map(o => (
            <button key={o.v} onClick={() => setSelected(o.v)} style={{
              padding: '16px 18px', borderRadius: 16,
              border: `2px solid ${selected === o.v ? C.accent : '#F0E8E0'}`,
              background: selected === o.v ? '#FDE8E4' : 'white',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left',
            }}>
              <span style={{ fontSize: 28 }}>{o.emoji}</span>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: C.text }}>{o.label}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.textLight }}>{o.sub}</div>
              </div>
            </button>
          ))}
        </div>

        <button onClick={save} disabled={!selected} style={{
          width: '100%', padding: '14px', borderRadius: 14, border: 'none',
          background: selected ? C.primary : '#E0E0E0', color: 'white',
          fontSize: 15, fontWeight: 800, cursor: selected ? 'pointer' : 'not-allowed',
        }}>
          Save ✓
        </button>
      </div>
    </div>
  )
}

// ─── Optional Clinical Check-ins ─────────────────────────────────────────────
// These track substance use, spending, and self-harm.
// They are OPTIONAL and do NOT count toward creature mood.
// Reporting hard truths here should never make the creature sadder.
// They appear only in this collapsible section — not in the main daily flow.

function ClinicalCheckIns({ daily, onUpdate }) {
  const d = daily || {}
  const sub = d.substanceUse || {}
  const spend = d.spending || {}
  const sh = d.selfHarm || {}

  const setSubstance = (key, val) => {
    onUpdate({ substanceUse: { ...sub, [key]: val } })
  }
  const setSpending = (key, val) => {
    onUpdate({ spending: { ...spend, [key]: val } })
  }
  const setSelfHarm = (key, val) => {
    onUpdate({ selfHarm: { ...sh, [key]: val } })
  }

  return (
    <div style={{ animation: 'fade-up 0.25s ease-out' }}>
      <div style={{ ...card, background: '#F8F4F0', border: '2px solid #F0E8E0' }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: C.textLight, marginBottom: 4, letterSpacing: 0.5 }}>OPTIONAL CHECK-INS</div>
        <p style={{ fontSize: 13, fontWeight: 600, color: C.textLight, marginBottom: 16, lineHeight: 1.5 }}>
          These don't change your creature. They just help track your full picture. You can skip any or all of these.
        </p>

        {/* Substance use */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: C.text, marginBottom: 10 }}>Did you use anything today?</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {[
              { key: 'alcohol', label: '🍺 Alcohol' },
              { key: 'weed', label: '🌿 Weed' },
              { key: 'smoking', label: '🚬 Smoking' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setSubstance(key, !sub[key])}
                style={{
                  padding: '10px 16px', borderRadius: 20,
                  border: sub[key] ? `2px solid ${C.yellow}` : '2px solid transparent',
                  background: sub[key] ? C.yellow + '44' : '#F0E8E0',
                  color: sub[key] ? C.text : C.textLight,
                  fontSize: 13, fontWeight: 700, cursor: 'pointer',
                }}
              >
                {label}
              </button>
            ))}
          </div>
          {(sub.alcohol || sub.weed || sub.smoking) && (
            <p style={{ fontSize: 13, fontWeight: 700, color: C.textLight, marginTop: 8 }}>
              You told the truth. That matters. 💚
            </p>
          )}
        </div>

        {/* Spending */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: C.text, marginBottom: 10 }}>Did you spend money in an unusual way today?</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setSpending('unusual', true)}
              style={{ ...btn(spend.unusual === true, C.yellow), flex: 1 }}
            >
              Yes
            </button>
            <button
              onClick={() => setSpending('unusual', false)}
              style={{ ...btn(spend.unusual === false, C.primary), flex: 1 }}
            >
              No
            </button>
          </div>
          {spend.unusual === true && (
            <p style={{ fontSize: 13, fontWeight: 700, color: C.textLight, marginTop: 8 }}>
              Good to know. Spending patterns are worth tracking. 💙
            </p>
          )}
        </div>

        {/* Self-harm */}
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: C.text, marginBottom: 10 }}>Did you hurt yourself today?</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setSelfHarm('occurred', true)}
              style={{ ...btn(sh.occurred === true, C.red), flex: 1 }}
            >
              Yes
            </button>
            <button
              onClick={() => setSelfHarm('occurred', false)}
              style={{ ...btn(sh.occurred === false, C.primary), flex: 1 }}
            >
              No
            </button>
          </div>
          {sh.occurred === true && (
            <div style={{ marginTop: 10, background: C.blueBg, borderRadius: 14, padding: '12px 14px', border: `2px solid ${C.blue}` }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: C.text, margin: 0, lineHeight: 1.5 }}>
                You told the truth. That took courage. Your safety plan has people who can be with you right now. 💙
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main ────────────────────────────────────────────────────────────────────
const SUBS = [
  { key: 'sleep', label: '💤 Sleep' },
  { key: 'meds', label: '💊 Meds' },
  { key: 'energy', label: '⚡ Energy' },
  { key: 'water', label: '💧 Water' },
  { key: 'window', label: '🧠 Window' },
  { key: 'sensory', label: '🧠 Sensory' },
  { key: 'dissociation', label: '🌫 Dissociation' },
  { key: 'bodySelf', label: '💜 Body-Self' },
  { key: 'weekly', label: '📋 Weekly' },
  { key: 'more', label: '+ More' },
]

export default function BodyTab({ daily, onUpdate, profile, initialSub, fromHome, onGoHome }) {
  const [sub, setSub] = useState(initialSub || 'sleep')
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '12px 16px' }}>
        <TopNav onGoHome={onGoHome} />
      </div>
      <div style={{ overflowX: 'auto', padding: '10px 16px', background: '#FFF8F3', borderBottom: '1px solid #F0E8E0', display: 'flex', gap: 8, scrollbarWidth: 'none' }}>
        {SUBS.map(s => (
          <button key={s.key} onClick={() => setSub(s.key)} style={{ padding: '8px 14px', borderRadius: 20, border: 'none', whiteSpace: 'nowrap', background: sub === s.key ? C.primary : '#F0E8E0', color: sub === s.key ? 'white' : C.text, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            {s.label}
          </button>
        ))}
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 100px' }}>
        {sub === 'sleep' && <SleepSection daily={daily} onUpdate={onUpdate} fromHome={fromHome} onGoHome={onGoHome} />}
        {sub === 'meds' && <MedsSection daily={daily} onUpdate={onUpdate} profile={profile} fromHome={fromHome} onGoHome={onGoHome} />}
        {sub === 'energy' && <EnergySection daily={daily} onUpdate={onUpdate} fromHome={fromHome} onGoHome={onGoHome} />}
        {sub === 'water' && <WaterSection daily={daily} onUpdate={onUpdate} fromHome={fromHome} onGoHome={onGoHome} />}
        {sub === 'window' && <WindowSection daily={daily} onUpdate={onUpdate} fromHome={fromHome} onGoHome={onGoHome} />}
        {sub === 'sensory' && <SensorySection daily={daily} onUpdate={onUpdate} fromHome={fromHome} onGoHome={onGoHome} />}
        {sub === 'dissociation' && <DissociationSection daily={daily} onUpdate={onUpdate} fromHome={fromHome} onGoHome={onGoHome} />}
        {sub === 'bodySelf' && <BodySelfSection daily={daily} onUpdate={onUpdate} fromHome={fromHome} onGoHome={onGoHome} />}
        {sub === 'weekly' && <WeeklySection profile={profile} />}
        {sub === 'more' && <ClinicalCheckIns daily={daily} onUpdate={onUpdate} />}
      </div>
    </div>
  )
}
