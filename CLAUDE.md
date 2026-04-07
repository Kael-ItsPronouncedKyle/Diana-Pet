# Diana's Companion App — Project Instructions

## FIRST: Read the Roadmap

**Read `ROADMAP.md` before making any changes.** It is the prioritized improvement plan with 75 items across 5 sprints. Build in sprint order. Each item has a spec, clinical rationale, and placement in the codebase.

The roadmap is organized by priority:

* **Tier 1 (Sprint 1-2):** Therapeutic foundation — emotion wheel, safety plan, chain analysis, secrecy test, window of tolerance, dissociation tracking, urge-to-skill engine, coping plan
* **Tier 2 (Sprint 3-4):** Life building — reading tracker, custom trackers, meals, schedule, relationship tracking, wins journal, goals
* **Tier 3 (Sprint 5):** AI insights via Netlify Function, provider export
* **Tier 4 (ongoing):** Bug fixes and polish

When Kael says "Start Sprint N," read the corresponding section in ROADMAP.md and implement those items.

* * *

## What This Is

A Tamagotchi-style mobile-first React webapp for Diana — a recovery tool, not just a tracker. The app helps her identify emotions, use skills in the moment, understand behavioral patterns, and build the life she wants. Her pet creature glows brighter every time she checks in, regardless of what she reports.

## Who Diana Is

Read `reference/diana-profile.md` for the full clinical picture. The short version:

* 20 years old, transgender, polyamorous, married to Luis (25)
* Autistic + ADHD + bipolar 1 + ME/CFS + compulsive sexual behavior in treatment
* Possibly schizoaffective (screening module hidden by default)
* Reads at ~3rd grade level — but is intellectually capable and curious
* Two pit bull × border collie puppies: Apollo (reactive/fearful) and Artemis (PSD candidate)
* Located in College Station/Bryan TX. Kael (her mentor/chosen father) is near Dallas — all contact by phone/video

## The Codebase

This is a **multi-file Vite + React 18 project**, NOT a single JSX artifact.

    src/
    ├── App.jsx                          # Root — routing, state, event messages
    ├── main.jsx                         # Entry point
    ├── index.css                        # Global styles + animations
    ├── components/
    │   ├── Pet/
    │   │   ├── Pet.jsx                  # Creature header with speech bubble
    │   │   ├── PetCreature.jsx          # Animated creature display
    │   │   └── SpeechBubble.jsx         # Event/idle message bubbles
    │   ├── modals/
    │   │   ├── CrisisToolkit.jsx        # Crisis toolkit overlay + floating button
    │   │   ├── OnboardingFlow.jsx       # First-launch creature selection
    │   │   └── SettingsModal.jsx        # Settings overlay
    │   └── tabs/
    │       ├── HomeTab.jsx              # Time-of-day flow, status grid, Word of Day
    │       ├── RecoveryTab.jsx          # Three Circles, DBT skill, urge logger
    │       ├── BodyTab.jsx              # Sleep, meds, energy, pain, water, sensory, weekly screening
    │       ├── PuppiesTab.jsx           # Apollo + Artemis training tracker
    │       └── WeekTab.jsx              # 7-day grid + pattern detection
    ├── constants/
    │   ├── creatures.js                 # Creature definitions
    │   ├── dbt.js                       # 22 DBT skills library
    │   ├── puppyData.js                 # Training phases from real guide
    │   └── words.js                     # 35 vocabulary words
    ├── hooks/
    │   ├── useDaily.js                  # Daily data hook
    │   └── useProfile.js               # Profile data hook
    └── utils/
        ├── checkIns.js                  # Count check-ins, mood state
        ├── dates.js                     # Date helpers
        └── storage.js                   # localStorage wrapper (async interface)

**When adding new features:**

* New check-in types → add sub-sections to existing tabs (RecoveryTab, BodyTab) or create new components
* New data fields → extend the daily object in `updateDaily()` in App.jsx
* New profile fields → extend `updateProfile()` in App.jsx
* New crisis toolkit sections → add to SECTIONS array in CrisisToolkit.jsx
* New constants/data → add to `src/constants/`
* New settings → add to SettingsModal.jsx

## Critical Rules

**Language:**

* ALL UI text at 3rd grade reading level. Simple words. Short sentences. Warm tone.
* Never condescending. Diana is an intelligent adult who processes written language differently.
* Define harder words naturally inline when they must appear.
* Avoid clinical jargon unless immediately defined in simple terms.

**Design philosophy:**

* **Engagement, not performance.** Creature mood = number of check-ins completed, NOT the values reported. A crashed-energy inner-circle day with full check-ins = glowing creature.
* **No punishment for hard days.** Every difficult input (inner circle, crashed energy, high pain, dissociation, dysphoria) gets warm affirming language.
* **Skills before contacts.** The app teaches self-sufficiency. Crisis toolkit leads with skills, safety plan, and coping plan. Contacts are last resort, not first.
* **Tap-based everything.** Minimal typing. Voice-to-text compatible. All text input is optional and skippable.
* **Structure IS the accommodation.** Time-of-day flows, predictable layouts, consistent formats. Her AuDHD brain needs to know what comes next.

**Technical:**

* The storage utility (`src/utils/storage.js`) wraps localStorage with an async interface. ALL storage access goes through this utility — never call `localStorage` directly.
* Wrap all storage operations in try/catch.
* Mobile-first: max-width 430px, safe area padding, 44px minimum touch targets.
* Crisis toolkit floating button visible on every screen. Never buried.
* PWA enabled via vite-plugin-pwa.
* Color palette in CSS variables (see index.css).
* Font: Nunito (Google Fonts).

## Color Palette

    --bg: #FFF8F3          (warm cream)
    --card: #FFFFFF
    --primary: #6BA89E     (sage green)
    --primary-light: #E8F4F1
    --accent: #E8907E      (warm coral)
    --accent-light: #FDE8E4
    --text: #3D3535        (warm dark)
    --text-light: #8A7F7F
    --green: #6BBF8A       --green-bg: #E6F7EC
    --yellow: #F0C050      --yellow-bg: #FFF8E1
    --red: #E87B7B         --red-bg: #FDECEC
    --blue: #6BA8D6        --blue-bg: #E8F1FA

## Data Reference

**Daily data** stored at key `diana-daily:YYYY-MM-DD`. See ROADMAP.md "Data Structure Additions" section for the complete field list including all new Tier 1 and Tier 2 fields.

**Profile data** stored at key `diana-profile`. See ROADMAP.md for new fields including safetyPlan, copingPlan, valuesAnchor, customTrackers, schedule, skillEffectiveness.

**Other keys:**

* `diana-weekly:YYYY-WW` — weekly screening responses
* `diana-dbt-history` — array of {date, skillId, effective} entries
* `diana-words-seen` — word IDs already shown (use storage utility, NOT localStorage directly)
* `diana-insight-history` — saved AI insights (Sprint 5)

## Reference Files

* `reference/diana-profile.md` — full clinical picture, design implications, non-negotiables
* `reference/training-guide-notes.md` — key details from the dogs' real training plan
* `reference/v1-code.jsx` — original v1 single-file app (design reference only)
* `data/dbt-skills.json` — 22 DBT skills, pre-written at Diana's reading level
* `data/word-of-the-day.json` — 35 vocabulary words with definitions and sentences
* `data/puppy-phases.json` — all 3 training phases, both dogs

## Sprint Guide

When starting a sprint, read the corresponding section in ROADMAP.md. Each item specifies:

* What to build (feature spec)
* Why it matters (clinical rationale)
* Where in codebase (which files to modify or create)
* Data structure changes needed

**Sprint 1:** T1-01 (emotion wheel), T1-03 (safety plan), T1-06 (secrecy test), T1-07 (urge→skill engine), T1-09 (reorder crisis toolkit), T4-01 (fix meds streak), T4-02 (fix localStorage bypass)

**Sprint 2:** T1-02 (chain analysis), T1-04 (window of tolerance), T1-05 (dissociation tracking), T1-08 (coping plan), T1-10 (body-self connection), T1-13 (24-hour urge reflection)

**Sprint 3:** T1-11 (connection tracking), T1-12 (values anchor), T1-14 (skill effectiveness), T2-02 (reading tracker), T2-04 (custom trackers), T2-05 (meal tracking), T2-08 (wins journal)

**Sprint 4:** T2-01 (emotion vocabulary), T2-03 (word of day fixes), T2-06 (daily schedule), T2-07 (Luis context), T2-09 (goal tracker), T2-10 (Kael's voice library), T2-11 (sleep hygiene)

**Sprint 5:** T3-01 (AI insights — Netlify Function), T3-02 (provider export), remaining T4 fixes

## Non-Negotiables

1. Diana is an intelligent adult. The app never talks down to her.
2. Bad days get warmth, not punishment. Always.
3. The crisis toolkit is always one tap away.
4. Recovery centers on HER growth — not the relationship, not Luis's experience.
5. Skills before contacts. Self-sufficiency is the goal.
6. Apollo is scared, not bad.
7. Every interaction is a reading opportunity.
8. This app is built with love. Build it like you care.
