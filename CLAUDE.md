# Diana's Companion App — Project Instructions

## What This Is

A Tamagotchi-style mobile-first React webapp for Diana, a 20-year-old woman tracking recovery, health, puppy training, and daily wellness. Runs on her iPhone. Uses `window.storage` for persistence.

## Read Before Building

1. **Read `PROMPT.md` first** — it is the complete build spec with every section, every interaction, every piece of copy.
2. **Read `reference/diana-profile.md`** — it explains who Diana is and why every design choice matters.
3. **Use `data/dbt-skills.json`** — pre-built library of 22 DBT skills with plain-language descriptions. Do not rewrite these.
4. **Use `data/word-of-the-day.json`** — pre-built library of 35 vocabulary words with definitions and sentences. Do not rewrite these.
5. **Use `data/puppy-phases.json`** — structured training phases for Apollo and Artemis pulled directly from Diana's real training guide.
6. **Reference `reference/v1-code.jsx`** — the working v1 app. Carry forward the design language, color palette, animation approach, and storage patterns. Do not patch v1 — build fresh.
7. **Reference `reference/training-guide-notes.md`** — key details from the dogs' actual training plan.

## Critical Rules

- **All UI text must be 3rd grade reading level.** Simple words. Short sentences. Warm tone. Never condescending.
- **Creature mood = engagement, not values.** Check-in count drives mood. Bad days with full check-ins = happy creature.
- **No punishment for hard days.** Every difficult input gets affirming language.
- **Tap-based everything.** Minimal typing. Voice-to-text compatible. All journal/notes fields are optional.
- **Crisis toolkit is a floating button on every screen.** Never buried.
- **`window.storage` only.** No localStorage, no sessionStorage. Async key-value. Wrap in try/catch. Non-existent keys throw.
- **Single `.jsx` file output.** All styles in a `<style>` tag or inline. No separate CSS files.
- **Max width 430px.** iPhone-first. Safe area padding. 44px minimum touch targets.

## Build Strategy

This is a large app. If you hit context limits, build in this order of priority:

### Must-have (build first)
1. Onboarding + creature system
2. Home screen with time-of-day flow
3. Three Circles + journal prompts
4. Crisis toolkit (floating button)
5. Sleep tracker
6. Medication tracker
7. Energy + pain tracker
8. Water tracker

### High priority (build second)
9. DBT Skill of the Day
10. Urge logger
11. Sensory load tracker
12. ME/CFS crash log
13. Puppy training tracker (both dogs, phase system)

### Important (build third)
14. Weekly history + pattern detection
15. Word of the Day
16. Mania early warning (weekly)
17. Schizoaffective screening (hidden by default)
18. Settings

## Tech Stack

- React (hooks only — useState, useEffect, useCallback, useRef, useMemo)
- Google Fonts: Nunito via CSS @import
- No external component libraries
- No build tools needed — single JSX artifact file
- Tailwind core utility classes available but optional

## Color Palette

```
--bg: #FFF8F3
--card: #FFFFFF
--primary: #6BA89E
--primary-light: #E8F4F1
--accent: #E8907E
--accent-light: #FDE8E4
--text: #3D3535
--text-light: #8A7F7F
--green: #6BBF8A / #E6F7EC
--yellow: #F0C050 / #FFF8E1
--red: #E87B7B / #FDECEC
--blue: #6BA8D6 / #E8F1FA
```

## Storage API

```javascript
await window.storage.get(key)      // → {key, value} or THROWS if not found
await window.storage.set(key, val) // → {key, value}
await window.storage.delete(key)   // → {key, deleted}
await window.storage.list(prefix)  // → {keys, prefix}
```

Always wrap in try/catch. Always JSON.stringify/parse values. Combine related data into single keys.

## File Output

The final deliverable is a single file: `diana-companion-v2.jsx`
Place it in the project root when complete.
