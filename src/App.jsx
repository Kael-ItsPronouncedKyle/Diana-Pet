import { useState, useEffect, useCallback, useRef } from 'react'
import storage from './utils/storage.js'
import { today, getDailyKey, getTimeOfDay } from './utils/dates.js'
import { countCheckIns, computeMedStreak, getMoodState, checkMilestone, CREATURE_REACTIONS } from './utils/checkIns.js'
import { supabase, supabaseEnabled } from './lib/supabase.js'
import { setHapticsEnabled, milestoneFeedback, celebrationFeedback } from './utils/haptics.js'

import Pet from './components/Pet/Pet.jsx'
import { MiniPet } from './components/Pet/Pet.jsx'
import BottomNav from './components/shared/BottomNav.jsx'
import Toast from './components/shared/Toast.jsx'
import Confetti from './components/shared/Confetti.jsx'
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

const TAB_ORDER = ['home', 'recovery', 'body', 'puppies', 'week']

export default function App() {
  const [loading, setLoading] = useState(true)
  const [authReady, setAuthReady] = useState(!supabaseEnabled)
  const [authed, setAuthed] = useState(!supabaseEnabled)
  const [profile, setProfile] = useState(null)
  const [daily, setDaily] = useState({})
  const [tab, setTab] = useState('home')
  const [subView, setSubView] = useState(null)
  const [fromHome, setFromHome] = useState(false)
  const [showCrisis, setShowCrisis] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [eventMessage, setEventMessage] = useState(null)
  const [toastMsg, setToastMsg] = useState(null)
  const [confettiTrigger, setConfettiTrigger] = useState(0)
  const [creatureReaction, setCreatureReaction] = useState(null)
  const [slideDir, setSlideDir] = useState(null) // 'left' | 'right' | null
  const [darkMode, setDarkMode] = useState(false)
  const [breathingDone, setBreathingDone] = useState(false)

  // Swipe state
  const touchStartRef = useRef(null)

  // Dark mode — auto-detect evening or use stored preference
  useEffect(() => {
    ;(async () => {
      const stored = await storage.get('diana-dark-mode')
      if (stored === 'on') setDarkMode(true)
      else if (stored === 'off') setDarkMode(false)
      else setDarkMode(getTimeOfDay() === 'evening')
    })()
  }, [])

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark-mode')
    else document.documentElement.classList.remove('dark-mode')
  }, [darkMode])

  // Haptics preference
  useEffect(() => {
    ;(async () => {
      const pref = await storage.get('diana-haptics')
      if (pref === false) setHapticsEnabled(false)
    })()
  }, [])

  // Auth state listener
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

    const timeout = setTimeout(() => {
      setAuthReady(true)
    }, 5000)

    return () => {
      subscription?.unsubscribe()
      clearTimeout(timeout)
    }
  }, [])

  // Load data on mount
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
      const prevCount = countCheckIns(prev)
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

      // Compute meds streak
      if (patch.meds && (patch.meds.morning === true || patch.meds.evening === true)) {
        computeMedStreak(next).then(streak => {
          if (streak !== undefined) updateProfile({ medStreak: streak })
        })
      }

      // Update streak if first check-in today
      const hadAny = prevCount > 0
      const hasNow = countCheckIns(next) > 0
      if (!hadAny && hasNow && profile) {
        updateStreak(profile)
      }

      // Check milestones
      const newCount = countCheckIns(next)
      const milestone = checkMilestone(prevCount, newCount)
      if (milestone) {
        setTimeout(() => {
          setEventMessage(milestone.message)
          if (milestone.reaction === 'celebrate') {
            setConfettiTrigger(t => t + 1)
            celebrationFeedback()
          } else {
            milestoneFeedback()
          }
        }, 300)
      }

      // Creature reaction — detect what changed
      const reactionKey = detectReactionKey(prev, patch)
      if (reactionKey && CREATURE_REACTIONS[reactionKey]) {
        setCreatureReaction(CREATURE_REACTIONS[reactionKey].animation)
        setTimeout(() => setCreatureReaction(null), CREATURE_REACTIONS[reactionKey].duration)
      }

      return next
    })
  }, [profile, updateStreak, updateProfile])

  // Detect which check-in was just completed
  function detectReactionKey(prev, patch) {
    if (patch.sleep?.quality && !prev.sleep?.quality) return 'sleep'
    if (patch.water && (patch.water.count > (prev.water?.count || 0))) return 'water'
    if (patch.dbt?.practiced && !prev.dbt?.practiced) return 'dbt'
    if (patch.meds) return 'meds'
    if (patch.energy !== undefined && prev.energy === undefined) return 'energy'
    if (patch.circles?.choice && !prev.circles?.choice) return 'circles'
    if (patch.emotions?.length > 0 && !(prev.emotions?.length > 0)) return 'feelings'
    if (patch.puppies) return 'puppies'
    return null
  }

  const goHome = useCallback(() => {
    handleTabChange('home')
  }, [])

  // Navigation handler with slide direction
  const handleNavigate = useCallback((targetTab, targetSub) => {
    if (targetTab === '__updateDaily') {
      updateDaily(targetSub)
      return
    }
    if (tab === 'home' && targetTab !== 'home') {
      setFromHome(true)
    }
    // Determine slide direction
    const fromIdx = TAB_ORDER.indexOf(tab)
    const toIdx = TAB_ORDER.indexOf(targetTab)
    if (fromIdx >= 0 && toIdx >= 0 && fromIdx !== toIdx) {
      setSlideDir(toIdx > fromIdx ? 'right' : 'left')
    }
    setTab(targetTab)
    setSubView(targetSub || null)
  }, [updateDaily, tab])

  const handleTabChange = useCallback((t) => {
    const fromIdx = TAB_ORDER.indexOf(tab)
    const toIdx = TAB_ORDER.indexOf(t)
    if (fromIdx >= 0 && toIdx >= 0 && fromIdx !== toIdx) {
      setSlideDir(toIdx > fromIdx ? 'right' : 'left')
    }
    setTab(t)
    setSubView(null)
    setFromHome(false)
  }, [tab])

  // Swipe gesture handling
  const handleTouchStart = useCallback((e) => {
    if (showCrisis || showSettings) return
    const touch = e.touches[0]
    touchStartRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() }
  }, [showCrisis, showSettings])

  const handleTouchEnd = useCallback((e) => {
    if (!touchStartRef.current || showCrisis || showSettings) return
    const touch = e.changedTouches[0]
    const dx = touch.clientX - touchStartRef.current.x
    const dy = touch.clientY - touchStartRef.current.y
    const dt = Date.now() - touchStartRef.current.time

    // Must be fast enough and horizontal enough
    if (Math.abs(dx) > 60 && Math.abs(dy) < 40 && dt < 400) {
      const idx = TAB_ORDER.indexOf(tab)
      if (dx < 0 && idx < TAB_ORDER.length - 1) {
        handleTabChange(TAB_ORDER[idx + 1])
      } else if (dx > 0 && idx > 0) {
        handleTabChange(TAB_ORDER[idx - 1])
      }
    }
    touchStartRef.current = null
  }, [tab, handleTabChange, showCrisis, showSettings])

  // Toast helper
  const showToast = useCallback((msg) => {
    setToastMsg(msg)
  }, [])

  // Milestone handler from HomeTab
  const handleMilestone = useCallback((milestone) => {
    if (milestone.reaction === 'celebrate') {
      setConfettiTrigger(t => t + 1)
    }
  }, [])

  // Creature reaction handler from HomeTab
  const handleCreatureReaction = useCallback((animation) => {
    setCreatureReaction(animation)
    setTimeout(() => setCreatureReaction(null), 800)
  }, [])

  // Onboarding complete
  const handleOnboardingComplete = async (profileData) => {
    await saveProfile(profileData)
    setTab('home')
  }

  // Dark mode toggle (for settings)
  const toggleDarkMode = useCallback(async (val) => {
    setDarkMode(val)
    await storage.set('diana-dark-mode', val ? 'on' : 'off')
  }, [])

  // Haptics toggle
  const toggleHaptics = useCallback(async (val) => {
    setHapticsEnabled(val)
    await storage.set('diana-haptics', val)
  }, [])

  // Loading + breathing entry
  if (!authReady || (authed && loading)) {
    return (
      <div style={{ minHeight: '100dvh', background: 'var(--bg, #FFF8F3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <div style={{ fontSize: 64, animation: 'breathing-entry 1.5s ease-in-out infinite' }}>🐾</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-light, #8A7F7F)' }}>Loading...</div>
      </div>
    )
  }

  if (supabaseEnabled && !authed) {
    return <AuthModal />
  }

  if (!profile) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />
  }

  const checkInCount = countCheckIns(daily)
  const moodState = getMoodState(checkInCount)

  // Slide animation class
  const slideClass = slideDir === 'right' ? 'slide-right' : slideDir === 'left' ? 'slide-left' : ''

  const renderTab = () => {
    switch (tab) {
      case 'home':
        return (
          <HomeTab
            profile={profile}
            daily={daily}
            onNavigate={handleNavigate}
            onEventMessage={setEventMessage}
            onUpdate={updateDaily}
            onToast={showToast}
            onCreatureReaction={handleCreatureReaction}
            onMilestone={handleMilestone}
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
        return <WeekTab onGoHome={goHome} />
      default:
        return null
    }
  }

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh', background: 'var(--bg, #FFF8F3)', position: 'relative' }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Crisis button — always visible */}
      <CrisisButton onClick={() => setShowCrisis(true)} />

      {/* Settings button */}
      <button
        onClick={() => setShowSettings(true)}
        style={{
          position: 'fixed', top: 16, left: 16, zIndex: 900,
          width: 44, height: 44, borderRadius: '50%',
          background: 'var(--card, white)', border: '2px solid #F0E8E0',
          fontSize: 20, cursor: 'pointer',
          boxShadow: 'var(--shadow, 0 2px 12px rgba(61,53,53,0.08))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        ⚙️
      </button>

      {/* Mini pet on non-home tabs */}
      {tab !== 'home' && (
        <MiniPet
          creatureId={profile.creature}
          moodState={moodState}
          onClick={goHome}
        />
      )}

      {/* Pet header — only on home tab */}
      {tab === 'home' && (
        <Pet
          checkInCount={checkInCount}
          creatureId={profile.creature}
          creatureName={profile.creatureName}
          streak={profile.streak || 0}
          eventMessage={eventMessage}
          onEventMessageShown={() => setEventMessage(null)}
          reaction={creatureReaction}
        />
      )}

      {/* Tab content with slide transitions */}
      <div
        key={tab}
        className={`tab-content ${slideClass}`}
        style={{ flex: 1, overflowY: tab === 'home' ? 'auto' : 'hidden', display: 'flex', flexDirection: 'column' }}
        onAnimationEnd={() => setSlideDir(null)}
      >
        {renderTab()}
      </div>

      {/* Bottom navigation */}
      <BottomNav activeTab={tab} onTabChange={handleTabChange} />

      {/* Toast notification */}
      <Toast message={toastMsg} onDone={() => setToastMsg(null)} />

      {/* Confetti celebration */}
      <Confetti trigger={confettiTrigger} />

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
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
        onToggleHaptics={toggleHaptics}
      />
    </div>
  )
}
