import { useMemo } from 'react'
import PetCreature from './PetCreature.jsx'

/**
 * CreatureScene.jsx — The creature's visual "room"
 *
 * This component creates a living space that changes with time of day.
 * The scene provides visual context and continuity — Diana's creature
 * lives in a space that reflects the time she interacts with it.
 *
 * Props:
 *   - creatureId: which creature to render
 *   - moodState: mood brightness (0-100)
 *   - streak: consecutive check-in days
 *   - reaction: current animation reaction
 *   - timeOfDay: 'morning', 'midday', 'evening', 'night'
 *   - isNightRisk: boolean flag for nighttime risk window (special protective scene)
 *   - size: creature size (default 160px)
 */

// Scene configurations: gradient, floating elements, ground styling
const SCENES = {
  morning: {
    gradient: 'linear-gradient(180deg, #FFF5EB 0%, #FFF8F3 100%)',
    elements: ['☁️', '🌤️'],
    ground: '#E8F4F1',
    groundElements: ['🌿', '🌸'],
    description: 'Soft morning light with white clouds',
  },
  midday: {
    gradient: 'linear-gradient(180deg, #F0FFF4 0%, #FFF8F3 100%)',
    elements: ['☁️', '☁️', '✨'],
    ground: '#E6F7EC',
    groundElements: ['🌿', '🌻', '🌿'],
    description: 'Bright daylight with sunny energy',
  },
  evening: {
    gradient: 'linear-gradient(180deg, #F0F0FF 0%, #FFF8F3 100%)',
    elements: ['🌙', '⭐'],
    ground: '#EDE8F4',
    groundElements: ['🌿', '💜'],
    description: 'Soft evening twilight with gentle stars',
  },
  night: {
    // Late-but-not-risk: warmer / moonlit so a ME/CFS wakeup at 2am doesn't
    // land in a jet-black room. The fully dark "protective" palette moved
    // to `nightRisk` below and is only shown when isNightRisk is set.
    gradient: 'linear-gradient(180deg, #E4DCEF 0%, #FFF8F3 100%)',
    elements: ['🌙', '⭐'],
    ground: '#E2D9EC',
    groundElements: ['🌿', '💜'],
    description: 'Moonlit room, warm and quiet',
  },
  nightRisk: {
    // Protective late-night palette (9pm-4am). Softened from the original
    // #1A1A2E slab so a ME/CFS wakeup doesn't open into a near-black
    // room — still dimmer than evening, but warm and holding, not ominous.
    gradient: 'linear-gradient(180deg, #3A3250 0%, #4A4268 100%)',
    elements: ['🌙', '⭐', '✨', '⭐'],
    ground: '#453D60',
    groundElements: ['🌿', '💙'],
    description: 'Quiet late-night space — warm and held',
  },
}

export default function CreatureScene({ creatureId, moodState, streak, reaction, timeOfDay, isNightRisk, size = 160 }) {
  // Determine which scene to use
  // isNightRisk takes priority (protective dark scene)
  // Otherwise use provided timeOfDay or default to 'morning'
  const sceneKey = useMemo(() => {
    // nightRisk is the clinical-risk window (9pm-4am + flagged). Plain
    // `night` is for the gentler moonlit variant used at evening time.
    if (isNightRisk) return 'nightRisk'
    return timeOfDay && SCENES[timeOfDay] ? timeOfDay : 'morning'
  }, [isNightRisk, timeOfDay])

  const scene = SCENES[sceneKey] || SCENES.morning

  return (
    <div
      style={{
        width: '100%',
        maxWidth: 320,
        height: 240,
        borderRadius: 28,
        background: scene.gradient,
        position: 'relative',
        overflow: 'hidden',
        boxShadow: isNightRisk
          ? '0 4px 24px rgba(26,26,46,0.3)'
          : '0 4px 24px rgba(61,53,53,0.1)',
        margin: '0 auto',
        transition: 'background 2s ease, box-shadow 1s ease',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
      aria-label={`Creature scene: ${scene.description}`}
      role="presentation"
    >
      {/* Sky elements — scattered across top with gentle float animation */}
      <div
        style={{
          position: 'absolute',
          top: 12,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'space-around',
          padding: '0 24px',
          opacity: 0.7,
          pointerEvents: 'none',
        }}
      >
        {scene.elements.map((el, i) => (
          <span
            key={i}
            style={{
              fontSize: i === 0 ? 20 : 16,
              animation: `float-gentle ${3 + i * 0.5}s ease-in-out infinite`,
              animationDelay: `${i * 0.8}s`,
              display: 'inline-block',
            }}
          >
            {el}
          </span>
        ))}
      </div>

      {/* Creature — centered in the scene */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -55%)',
          zIndex: 2,
          pointerEvents: 'auto',
        }}
      >
        <PetCreature
          creatureId={creatureId}
          moodState={moodState}
          size={size}
          streak={streak}
          reaction={reaction}
        />
      </div>

      {/* Ground — curved base with subtle ground elements */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 50,
          background: scene.ground,
          borderRadius: '50% 50% 0 0 / 100% 100% 0 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          padding: '8px 32px 0',
          opacity: 0.8,
          transition: 'background 2s ease',
          pointerEvents: 'none',
        }}
      >
        {scene.groundElements.map((el, i) => (
          <span key={i} style={{ fontSize: 18, display: 'inline-block' }}>
            {el}
          </span>
        ))}
      </div>
    </div>
  )
}
