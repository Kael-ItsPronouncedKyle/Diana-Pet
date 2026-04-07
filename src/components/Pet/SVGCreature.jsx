import { useMemo } from 'react'

const CREATURE_COLORS = {
  puppy: {
    body: '#C69A6B',
    accent: '#8B6B3D',
    cheeks: '#E8907E',
  },
  kitty: {
    body: '#B8B0C8',
    accent: '#8A7F9F',
    cheeks: '#E8907E',
  },
  angel: {
    body: '#F5E6D3',
    accent: '#E8D4BC',
    cheeks: '#F5C5B8',
    wings: '#F0E8E0',
  },
  dragon: {
    body: '#7EC8B8',
    accent: '#5BA89E',
    cheeks: '#E8907E',
    horns: '#6BA89E',
  },
  bunny: {
    body: '#F0E0E8',
    accent: '#D4C0CC',
    cheeks: '#E8907E',
    inner_ear: '#F5C5B8',
  },
  fox: {
    body: '#E8A55F',
    accent: '#C68A3F',
    cheeks: '#FFFFFF',
    tail_tip: '#F5F0EB',
  },
}

function Puppy({ colors }) {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      {/* Body */}
      <circle cx="50" cy="55" r="28" fill={colors.body} />

      {/* Left ear */}
      <ellipse cx="32" cy="25" rx="8" ry="15" fill={colors.body} />
      {/* Right ear */}
      <ellipse cx="68" cy="25" rx="8" ry="15" fill={colors.body} />

      {/* Tail */}
      <path d="M 70 65 Q 85 50 80 35" stroke={colors.body} strokeWidth="7" fill="none" strokeLinecap="round" />

      {/* Cheeks */}
      <circle cx="28" cy="55" r="5" fill={colors.cheeks} opacity="0.6" />
      <circle cx="72" cy="55" r="5" fill={colors.cheeks} opacity="0.6" />

      {/* Eyes */}
      <circle cx="42" cy="48" r="3" fill="#3D3535" />
      <circle cx="58" cy="48" r="3" fill="#3D3535" />
      <circle cx="43.5" cy="46.5" r="1" fill="white" />
      <circle cx="59.5" cy="46.5" r="1" fill="white" />

      {/* Nose */}
      <circle cx="50" cy="56" r="2.5" fill="#3D3535" />

      {/* Mouth — happy curve */}
      <path d="M 50 56 Q 45 62 40 60" stroke="#3D3535" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M 50 56 Q 55 62 60 60" stroke="#3D3535" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </svg>
  )
}

function Kitty({ colors }) {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      {/* Body */}
      <circle cx="50" cy="55" r="28" fill={colors.body} />

      {/* Left ear — pointed */}
      <path d="M 32 20 L 26 8 L 36 22" fill={colors.body} />
      {/* Right ear — pointed */}
      <path d="M 68 20 L 74 8 L 64 22" fill={colors.body} />

      {/* Tail — curled */}
      <path d="M 72 70 Q 85 65 82 45 Q 80 35 75 40" stroke={colors.body} strokeWidth="6" fill="none" strokeLinecap="round" />

      {/* Cheeks */}
      <circle cx="27" cy="55" r="5" fill={colors.cheeks} opacity="0.5" />
      <circle cx="73" cy="55" r="5" fill={colors.cheeks} opacity="0.5" />

      {/* Eyes — almond shaped */}
      <ellipse cx="42" cy="48" rx="3.5" ry="4" fill="#3D3535" />
      <ellipse cx="58" cy="48" rx="3.5" ry="4" fill="#3D3535" />
      <circle cx="43" cy="46" r="1" fill="white" />
      <circle cx="59" cy="46" r="1" fill="white" />

      {/* Nose */}
      <path d="M 50 56 L 48 59 L 52 59" fill="#3D3535" />

      {/* Mouth — cat smirk */}
      <path d="M 50 56 Q 45 63 40 61" stroke="#3D3535" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M 50 56 Q 55 63 60 61" stroke="#3D3535" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </svg>
  )
}

function Angel({ colors }) {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      {/* Halo */}
      <circle cx="50" cy="20" r="18" stroke={colors.accent} strokeWidth="2.5" fill="none" opacity="0.7" />

      {/* Body */}
      <circle cx="50" cy="55" r="28" fill={colors.body} />

      {/* Left wing */}
      <ellipse cx="28" cy="50" rx="8" ry="18" fill={colors.wings} opacity="0.8" />
      {/* Right wing */}
      <ellipse cx="72" cy="50" rx="8" ry="18" fill={colors.wings} opacity="0.8" />

      {/* Wing details — feather lines */}
      <line x1="24" y1="40" x2="22" y2="35" stroke={colors.accent} strokeWidth="1" opacity="0.4" />
      <line x1="28" y1="35" x2="26" y2="28" stroke={colors.accent} strokeWidth="1" opacity="0.4" />
      <line x1="76" y1="40" x2="78" y2="35" stroke={colors.accent} strokeWidth="1" opacity="0.4" />
      <line x1="72" y1="35" x2="74" y2="28" stroke={colors.accent} strokeWidth="1" opacity="0.4" />

      {/* Cheeks */}
      <circle cx="28" cy="55" r="5" fill={colors.cheeks} opacity="0.5" />
      <circle cx="72" cy="55" r="5" fill={colors.cheeks} opacity="0.5" />

      {/* Eyes — bright and kind */}
      <circle cx="42" cy="48" r="3.5" fill="#3D3535" />
      <circle cx="58" cy="48" r="3.5" fill="#3D3535" />
      <circle cx="43.5" cy="46" r="1.5" fill="white" />
      <circle cx="59.5" cy="46" r="1.5" fill="white" />

      {/* Nose */}
      <circle cx="50" cy="56" r="2" fill="#3D3535" />

      {/* Mouth — gentle smile */}
      <path d="M 45 61 Q 50 64 55 61" stroke="#3D3535" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </svg>
  )
}

function Dragon({ colors }) {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      {/* Body */}
      <circle cx="50" cy="55" r="28" fill={colors.body} />

      {/* Horns — left */}
      <path d="M 35 28 Q 30 15 32 5" stroke={colors.horns} strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* Horns — right */}
      <path d="M 65 28 Q 70 15 68 5" stroke={colors.horns} strokeWidth="3" fill="none" strokeLinecap="round" />

      {/* Wings — small side wings */}
      <ellipse cx="25" cy="50" rx="6" ry="14" fill={colors.accent} opacity="0.6" />
      <ellipse cx="75" cy="50" rx="6" ry="14" fill={colors.accent} opacity="0.6" />

      {/* Tail */}
      <path d="M 72 68 Q 88 70 85 50" stroke={colors.body} strokeWidth="7" fill="none" strokeLinecap="round" />

      {/* Cheeks */}
      <circle cx="28" cy="55" r="5" fill={colors.cheeks} opacity="0.5" />
      <circle cx="72" cy="55" r="5" fill={colors.cheeks} opacity="0.5" />

      {/* Eyes — fierce but gentle */}
      <circle cx="42" cy="48" r="3" fill="#3D3535" />
      <circle cx="58" cy="48" r="3" fill="#3D3535" />
      <circle cx="42.5" cy="46.5" r="1" fill="white" />
      <circle cx="58.5" cy="46.5" r="1" fill="white" />

      {/* Nose — dragon nostrils */}
      <circle cx="48" cy="57" r="1.5" fill="#3D3535" />
      <circle cx="52" cy="57" r="1.5" fill="#3D3535" />

      {/* Mouth — brave smile */}
      <path d="M 50 57 Q 45 63 40 61" stroke="#3D3535" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M 50 57 Q 55 63 60 61" stroke="#3D3535" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </svg>
  )
}

function Bunny({ colors }) {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      {/* Body */}
      <circle cx="50" cy="55" r="28" fill={colors.body} />

      {/* Left ear — long */}
      <ellipse cx="38" cy="12" rx="7" ry="20" fill={colors.body} />
      <ellipse cx="38" cy="16" rx="4" ry="14" fill={colors.inner_ear} />
      {/* Right ear — long */}
      <ellipse cx="62" cy="12" rx="7" ry="20" fill={colors.body} />
      <ellipse cx="62" cy="16" rx="4" ry="14" fill={colors.inner_ear} />

      {/* Tail — fluffy pom */}
      <circle cx="50" cy="82" r="8" fill={colors.body} />

      {/* Cheeks */}
      <circle cx="27" cy="55" r="5" fill={colors.cheeks} opacity="0.6" />
      <circle cx="73" cy="55" r="5" fill={colors.cheeks} opacity="0.6" />

      {/* Eyes — round and bright */}
      <circle cx="42" cy="48" r="3.5" fill="#3D3535" />
      <circle cx="58" cy="48" r="3.5" fill="#3D3535" />
      <circle cx="43.5" cy="46.5" r="1.5" fill="white" />
      <circle cx="59.5" cy="46.5" r="1.5" fill="white" />

      {/* Nose */}
      <circle cx="50" cy="57" r="2" fill="#3D3535" />

      {/* Mouth — happy bunny */}
      <path d="M 50 57 Q 46 63 42 61" stroke="#3D3535" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M 50 57 Q 54 63 58 61" stroke="#3D3535" strokeWidth="1.5" fill="none" strokeLinecap="round" />

      {/* Whiskers */}
      <line x1="25" y1="52" x2="15" y2="50" stroke={colors.accent} strokeWidth="1" opacity="0.4" />
      <line x1="75" y1="52" x2="85" y2="50" stroke={colors.accent} strokeWidth="1" opacity="0.4" />
    </svg>
  )
}

function Fox({ colors }) {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      {/* Body */}
      <circle cx="50" cy="55" r="28" fill={colors.body} />

      {/* Left ear — pointed */}
      <path d="M 32 22 L 26 8 L 37 28" fill={colors.body} />
      <path d="M 32 22 L 29 15 L 35 25" fill={colors.accent} />
      {/* Right ear — pointed */}
      <path d="M 68 22 L 74 8 L 63 28" fill={colors.body} />
      <path d="M 68 22 L 71 15 L 65 25" fill={colors.accent} />

      {/* Tail — bushy */}
      <path d="M 72 68 Q 88 75 82 45" stroke={colors.body} strokeWidth="8" fill="none" strokeLinecap="round" />
      <path d="M 72 68 Q 88 75 82 45" stroke={colors.tail_tip} strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.6" />

      {/* Cheeks — white patch */}
      <circle cx="25" cy="58" r="6" fill={colors.cheeks} opacity="0.7" />
      <circle cx="75" cy="58" r="6" fill={colors.cheeks} opacity="0.7" />

      {/* Eyes — clever and alert */}
      <circle cx="42" cy="48" r="3.5" fill="#3D3535" />
      <circle cx="58" cy="48" r="3.5" fill="#3D3535" />
      <circle cx="43" cy="46.5" r="1.2" fill="white" />
      <circle cx="59" cy="46.5" r="1.2" fill="white" />

      {/* Nose */}
      <circle cx="50" cy="57" r="2.5" fill="#3D3535" />

      {/* Mouth — clever smile */}
      <path d="M 50 57 Q 45 63 40 60" stroke="#3D3535" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M 50 57 Q 55 63 60 60" stroke="#3D3535" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </svg>
  )
}

// Mapping creatureId to SVG component
const CREATURE_COMPONENTS = {
  puppy: Puppy,
  kitty: Kitty,
  angel: Angel,
  dragon: Dragon,
  bunny: Bunny,
  fox: Fox,
}

export default function SVGCreature({ creatureId = 'puppy', moodState = 'idle', size = 160, reaction = null }) {
  const colors = useMemo(() => CREATURE_COLORS[creatureId] || CREATURE_COLORS.puppy, [creatureId])
  const CreatureComponent = useMemo(() => CREATURE_COMPONENTS[creatureId] || Puppy, [creatureId])

  // Determine animation style based on mood and reaction
  const animStyle = useMemo(() => {
    if (reaction) {
      return { animation: `svg-creature-${reaction} 0.8s ease-in-out` }
    }
    switch (moodState) {
      case 'sleeping':
        return { animation: 'svg-creature-sleeping 3s ease-in-out infinite', opacity: 0.55 }
      case 'bounce':
        return { animation: 'svg-creature-bounce 1.2s ease-in-out infinite' }
      case 'wiggle':
        return { animation: 'svg-creature-wiggle 1.4s ease-in-out infinite' }
      case 'glow':
        return {
          animation: 'svg-creature-glow 2s ease-in-out infinite, svg-creature-wiggle 1.8s ease-in-out infinite',
          filter: 'drop-shadow(0 0 8px #F0C050) drop-shadow(0 0 16px #E8907E)',
        }
      default:
        return { animation: 'svg-creature-idle 2s ease-in-out infinite' }
    }
  }, [moodState, reaction])

  return (
    <div
      style={{
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...animStyle,
        transformOrigin: 'center',
      }}
    >
      <CreatureComponent colors={colors} />
    </div>
  )
}
