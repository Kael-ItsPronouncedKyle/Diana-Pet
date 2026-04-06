import { useState, useEffect, useCallback } from 'react'
import storage from './utils/storage.js'
import { today, getDailyKey } from './utils/dates.js'
import { countCheckIns } from './utils/checkIns.js'

import Pet from './components/Pet/Pet.jsx'
import BottomNav from './components/shared/BottomNav.jsx'
import OnboardingFlow from './components/modals/OnboardingFlow.jsx'
import CrisisToolkit, { CrisisButton } from './components/modals/CrisisToolkit.jsx'
import SettingsModal from './components/modals/SettingsModal.jsx'
import HomeTab from './components/tabs/HomeTab.jsx'
import RecoveryTab from './components/tabs/RecoveryTab.jsx'
import BodyTab from './components/tabs/BodyTab.jsx'
import PuppiesTab from './components/tabs/PuppiesTab.jsx'
import WeekTab from './components/tabs/WeekTab.jsx'

// Event messages keyed to triggers
const EVENT_MESSAGES = {
  circles_outer: "GREEN CIRCLE DAY!! You're healing. 💚",
  circles_inner: "You're still here. That matters. ❤️",
  circles_middle: "You noticed it. That's wisdom. 💛",
  meds_morning: "Morning meds done! That's a big one. 💊",
  meds_evening: "Evening meds done! You're taking care of yourself. 💊",
  water_goal: "You hit your water goal! 🎉 Your body thanks you.",
  dbt_practiced: "Nice work. That's a real skill you just used. 💪",
  urge_logged: "You noticed it and came here. That takes courage. 🫶",
  energy_crashed: "Rest is not giving up — it's taking care of yourself. 💙",
  sleep_bad: "Rough night. Be extra gentle with yourself today. 💙",
  energy_great: "Great energy day! You're doing amazing. 🌟",
}

export default function App() {
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)
  const [daily, setDaily] = useState({})
  const [tab, setTab] = useState('home')
  const [subView, setSubView] = useState(null)
  const [showCrisis, setShowCrisis] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  // Persistent message queue — stores up to 5 recent event messages
  const [msgQueue, setMsgQueue] = useState([])

  // Load on mount
  useEffect(() => {
    ;(async () => {
      const p = await storage.get('diana-profile')
      const d = await storage.get(getDailyKey())
      setProfile(p)
      setDaily(d || {})
      setLoading(false)
    })()
  }, [])

  const saveProfile = useCallback(async (p) => {
    setProfile(p)
    await storage.set('diana-profile', p)
  }, [])

  const updateProfile = useCallback(async (patch) => {
    setProfile(prev => {
      const next = { ...prev, ...patch }
      storage.set('diana-profile', next)
      return next
    })
  }, [])

  // Add message to queue (deduplicate consecutive identical messages)
  const addMsg = useCallback((msg) => {
    if (!msg) return
    setMsgQueue(prev => {
      if (prev[prev.length - 1] === msg) return prev
      return [...prev, msg].slice(-5)
    })
  }, [])

  // Dismiss the current (first) message
  const handleMsgRead = useCallback(() => {
    setMsgQueue(prev => prev.slice(1))
  }, [])

  // Streak with grace day: one missed day per 7 days doesn't break streak
  const updateStreak = useCallback(async (p) => {
    const t = today()
    if (p.lastCheckIn === t) return p

    const yest = new Date()
    yest.setDate(yest.getDate() - 1)
    const yStr = yest.toISOString().slice(0, 10)

    const twoDaysAgo = new Date()
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)
    const twoDaysAgoStr = twoDaysAgo.toISOString().slice(0, 10)

    // Grace day available if not used in the past 7 days
    const graceAvailable = !p.graceUsedDate || (() => {
      const diff = Math.floor((Date.now() - new Date(p.graceUsedDate).getTime()) / 86400000)
      return diff >= 7
    })()

    let streak, graceUsed = false
    if (p.lastCheckIn === yStr) {
      streak = (p.streak || 0) + 1
    } else if (p.lastCheckIn === twoDaysAgoStr && graceAvailable) {
      // Grace day: treat the missed day as covered
      streak = (p.streak || 0) + 1
      graceUsed = true
    } else {
      streak = 1
    }

    const next = {
      ...p,
      streak,
      lastCheckIn: t,
      ...(graceUsed ? { graceUsedDate: t } : {}),
    }
    await saveProfile(next)
    return next
  }, [saveProfile])

  const updateDaily = useCallback((patch) => {
    setDaily(prev => {
      const next = { ...prev, ...patch }
      storage.set(getDailyKey(), next)

      // Fire event messages for key milestones
      if (patch.circles?.choice && !prev.circles?.choice) {
        const msg = EVENT_MESSAGES[`circles_${patch.circles.choice}`]
        if (msg) addMsg(msg)
      }
      if (patch.meds?.morning === true && !prev.meds?.morning) addMsg(EVENT_MESSAGES.meds_morning)
      if (patch.meds?.evening === true && !prev.meds?.evening) addMsg(EVENT_MESSAGES.meds_evening)
      if (patch.water?.count >= 8 && (prev.water?.count || 0) < 8) addMsg(EVENT_MESSAGES.water_goal)
      if (patch.dbt?.practiced && !prev.dbt?.practiced) addMsg(EVENT_MESSAGES.dbt_practiced)
      if (patch.urges && patch.urges.length > (prev.urges?.length || 0)) addMsg(EVENT_MESSAGES.urge_logged)
      if (patch.energy !== undefined && patch.energy <= 2 && prev.energy === undefined) addMsg(EVENT_MESSAGES.energy_crashed)
      if (patch.energy !== undefined && patch.energy === 5 && !prev.energy) addMsg(EVENT_MESSAGES.energy_great)
      if (patch.sleep?.quality !== undefined && patch.sleep.quality <= 2) addMsg(EVENT_MESSAGES.sleep_bad)

      // Update streak if first check-in today
      const hadAny = countCheckIns(prev) > 0
      const hasNow = countCheckIns(next) > 0
      if (!hadAny && hasNow && profile) {
        updateStreak(profile)
      }

      return next
    })
  }, [profile, updateStreak, addMsg])

  // Navigation handler used by HomeTab and other tabs
  const handleNavigate = useCallback((targetTab, targetSub) => {
    if (targetTab === '__updateDaily') {
      updateDaily(targetSub)
      return
    }
    setTab(targetTab)
    setSubView(targetSub || null)
  }, [updateDaily])

  // Onboarding complete
  const handleOnboardingComplete = async (profileData) => {
    await saveProfile(profileData)
    setTab('home')
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100dvh', background: '#FFF8F3', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <div style={{ fontSize: 64, animation: 'pulse 1.5s ease-in-out infinite' }}>🐾</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#8A7F7F' }}>Loading...</div>
      </div>
    )
  }

  if (!profile) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />
  }

  const checkInCount = countCheckIns(daily)
  // Total trackable check-in sections (used for progress ring)
  const TOTAL_CHECKINS = 8

  const renderTab = () => {
    switch (tab) {
      case 'home':
        return (
          <HomeTab
            profile={profile}
            daily={daily}
            onNavigate={handleNavigate}
            onEventMessage={addMsg}
          />
        )
      case 'recovery':
        return (
          <RecoveryTab
            daily={daily}
            onUpdate={updateDaily}
            onOpenCrisis={() => setShowCrisis(true)}
            initialSub={subView}
          />
        )
      case 'body':
        return (
          <BodyTab
            daily={daily}
            onUpdate={updateDaily}
            profile={profile}
            initialSub={subView}
          />
        )
      case 'puppies':
        return (
          <PuppiesTab
            daily={daily}
            onUpdate={updateDaily}
            profile={profile}
            onProfileUpdate={updateProfile}
          />
        )
      case 'week':
        return <WeekTab />
      default:
        return null
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh', background: '#FFF8F3', position: 'relative' }}>
      {/* Crisis button — always visible */}
      <CrisisButton onClick={() => setShowCrisis(true)} />

      {/* Settings button */}
      <button
        onClick={() => setShowSettings(true)}
        style={{
          position: 'fixed', top: 16, left: 16, zIndex: 900,
          width: 44, height: 44, borderRadius: '50%',
          background: 'white', border: '2px solid #F0E8E0',
          fontSize: 20, cursor: 'pointer',
          boxShadow: '0 2px 12px rgba(61,53,53,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'transform 0.1s',
        }}
        onTouchStart={e => e.currentTarget.style.transform = 'scale(0.92)'}
        onTouchEnd={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        ⚙️
      </button>

      {/* Pet header — only on home tab */}
      {tab === 'home' && (
        <Pet
          checkInCount={checkInCount}
          totalCheckIns={TOTAL_CHECKINS}
          creatureId={profile.creature}
          creatureName={profile.creatureName}
          streak={profile.streak || 0}
          msgQueue={msgQueue}
          onMsgRead={handleMsgRead}
        />
      )}

      {/* Tab content — key on tab so it re-mounts and triggers fade-up animation */}
      <div
        key={tab}
        style={{
          flex: 1,
          overflowY: tab === 'home' ? 'auto' : 'hidden',
          display: 'flex',
          flexDirection: 'column',
          animation: 'fade-up 0.2s ease-out',
        }}
      >
        {renderTab()}
      </div>

      {/* Bottom navigation */}
      <BottomNav activeTab={tab} onTabChange={(t) => { setTab(t); setSubView(null) }} />

      {/* Modals */}
      <CrisisToolkit
        isOpen={showCrisis}
        onClose={() => setShowCrisis(false)}
        crisisContacts={profile.crisisContacts || {}}
      />
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        profile={profile}
        onProfileUpdate={updateProfile}
      />
    </div>
  )
}
