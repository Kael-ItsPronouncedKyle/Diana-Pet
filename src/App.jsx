import { useState, useEffect, useCallback } from 'react'
import storage from './utils/storage.js'
import { today, getDailyKey } from './utils/dates.js'
import { countCheckIns, computeMedStreak } from './utils/checkIns.js'
import { supabase, supabaseEnabled } from './lib/supabase.js'

import Pet from './components/Pet/Pet.jsx'
import BottomNav from './components/shared/BottomNav.jsx'
import OnboardingFlow from './components/modals/OnboardingFlow.jsx'
import AuthModal from './components/modals/AuthModal.jsx'
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
  const [authReady, setAuthReady] = useState(!supabaseEnabled) // skip auth if no Supabase
  const [authed, setAuthed] = useState(!supabaseEnabled)
  const [profile, setProfile] = useState(null)
  const [daily, setDaily] = useState({})
  const [tab, setTab] = useState('home')
  const [subView, setSubView] = useState(null)
  const [fromHome, setFromHome] = useState(false)
  const [showCrisis, setShowCrisis] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [eventMessage, setEventMessage] = useState(null)

  // Auth state listener — onAuthStateChange is set up FIRST because in
  // Supabase v2 it fires INITIAL_SESSION which processes the OAuth hash
  // fragment (#access_token=...). getSession() does NOT process the hash,
  // so calling it first caused a race condition where authed stayed false.
  useEffect(() => {
    if (!supabaseEnabled || !supabase) {
      setAuthReady(true)
      setAuthed(true)
      return
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          storage.setUserId(session.user.id)
          if (event === 'SIGNED_IN') {
            await storage.sync()
          }
          setAuthed(true)
        } else {
          storage.setUserId(null)
          setAuthed(false)
        }
        setAuthReady(true)
      }
    )

    // Safety fallback: unblock UI if onAuthStateChange never fires
    const timeout = setTimeout(() => {
      setAuthReady(true)
    }, 5000)

    return () => {
      subscription?.unsubscribe()
      clearTimeout(timeout)
    }
  }, [])

  // Load data on mount (after auth is ready)
  useEffect(() => {
    if (!authReady || !authed) return
    ;(async () => {
      const p = await storage.get('diana-profile')
      const d = await storage.get(getDailyKey())
      setProfile(p)
      setDaily(d || {})
      setLoading(false)
    })()
  }, [authReady, authed])

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

  const updateStreak = useCallback(async (p) => {
    const t = today()
    if (p.lastCheckIn === t) return p
    const yest = new Date()
    yest.setDate(yest.getDate() - 1)
    const yStr = yest.toISOString().slice(0, 10)
    const streak = p.lastCheckIn === yStr ? (p.streak || 0) + 1 : 1
    const next = { ...p, streak, lastCheckIn: t }
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
        if (msg) setEventMessage(msg)
      }
      if (patch.meds?.morning === true && !prev.meds?.morning) setEventMessage(EVENT_MESSAGES.meds_morning)
      if (patch.meds?.evening === true && !prev.meds?.evening) setEventMessage(EVENT_MESSAGES.meds_evening)
      if (patch.water?.count >= 8 && (prev.water?.count || 0) < 8) setEventMessage(EVENT_MESSAGES.water_goal)
      if (patch.dbt?.practiced && !prev.dbt?.practiced) setEventMessage(EVENT_MESSAGES.dbt_practiced)
      if (patch.urges && patch.urges.length > (prev.urges?.length || 0)) setEventMessage(EVENT_MESSAGES.urge_logged)
      if (patch.energy !== undefined && patch.energy <= 2 && prev.energy === undefined) setEventMessage(EVENT_MESSAGES.energy_crashed)
      if (patch.energy !== undefined && patch.energy === 5 && !prev.energy) setEventMessage(EVENT_MESSAGES.energy_great)
      if (patch.sleep?.quality !== undefined && patch.sleep.quality <= 2) setEventMessage(EVENT_MESSAGES.sleep_bad)

      // Compute meds streak when meds are updated
      if (patch.meds && (patch.meds.morning === true || patch.meds.evening === true)) {
        computeMedStreak(next).then(streak => {
          if (streak !== undefined) updateProfile({ medStreak: streak })
        })
      }

      // Update streak if first check-in today
      const hadAny = countCheckIns(prev) > 0
      const hasNow = countCheckIns(next) > 0
      if (!hadAny && hasNow && profile) {
        updateStreak(profile)
      }

      return next
    })
  }, [profile, updateStreak])

  const goHome = useCallback(() => {
    setTab('home')
    setSubView(null)
    setFromHome(false)
  }, [])

  // Navigation handler used by HomeTab and other tabs
  const handleNavigate = useCallback((targetTab, targetSub) => {
    if (targetTab === '__updateDaily') {
      // Special: HomeTab passes word-of-day updates this way
      updateDaily(targetSub)
      return
    }
    if (tab === 'home' && targetTab !== 'home') {
      setFromHome(true)
    }
    setTab(targetTab)
    setSubView(targetSub || null)
  }, [updateDaily, tab])

  // Onboarding complete
  const handleOnboardingComplete = async (profileData) => {
    await saveProfile(profileData)
    setTab('home')
  }

  // Show loading while auth initializes
  if (!authReady || (authed && loading)) {
    return (
      <div style={{ minHeight: '100dvh', background: '#FFF8F3', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <div style={{ fontSize: 64, animation: 'pulse 1.5s ease-in-out infinite' }}>🐾</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#8A7F7F' }}>Loading...</div>
      </div>
    )
  }

  // Show Google auth if Supabase is configured but user not signed in
  if (supabaseEnabled && !authed) {
    return <AuthModal />
  }

  if (!profile) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />
  }

  const checkInCount = countCheckIns(daily)

  const renderTab = () => {
    switch (tab) {
      case 'home':
        return (
          <HomeTab
            profile={profile}
            daily={daily}
            onNavigate={handleNavigate}
            onEventMessage={setEventMessage}
          />
        )
      case 'recovery':
        return (
          <RecoveryTab
            daily={daily}
            onUpdate={updateDaily}
            onOpenCrisis={() => setShowCrisis(true)}
            initialSub={subView}
            fromHome={fromHome}
            onGoHome={goHome}
          />
        )
      case 'body':
        return (
          <BodyTab
            daily={daily}
            onUpdate={updateDaily}
            profile={profile}
            initialSub={subView}
            fromHome={fromHome}
            onGoHome={goHome}
          />
        )
      case 'puppies':
        return (
          <PuppiesTab
            daily={daily}
            onUpdate={updateDaily}
            profile={profile}
            onProfileUpdate={updateProfile}
            fromHome={fromHome}
            onGoHome={goHome}
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
        }}
      >
        ⚙️
      </button>

      {/* Pet header — only on home tab */}
      {tab === 'home' && (
        <Pet
          checkInCount={checkInCount}
          creatureId={profile.creature}
          creatureName={profile.creatureName}
          streak={profile.streak || 0}
          eventMessage={eventMessage}
          onEventMessageShown={() => setEventMessage(null)}
        />
      )}

      {/* Tab content */}
      <div style={{ flex: 1, overflowY: tab === 'home' ? 'auto' : 'hidden', display: 'flex', flexDirection: 'column' }}>
        {renderTab()}
      </div>

      {/* Bottom navigation */}
      <BottomNav activeTab={tab} onTabChange={(t) => { setTab(t); setSubView(null); setFromHome(false) }} />

      {/* Modals */}
      <CrisisToolkit
        isOpen={showCrisis}
        onClose={() => setShowCrisis(false)}
        crisisContacts={profile.crisisContacts || {}}
        safetyPlan={profile.safetyPlan || null}
        copingPlan={profile.copingPlan || null}
        onSaveCopingPlan={(plan) => updateProfile({ copingPlan: plan })}
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
