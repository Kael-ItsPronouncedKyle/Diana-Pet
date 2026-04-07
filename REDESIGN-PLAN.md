# Diana's Companion App — UI/UX Redesign Plan

## The Core Problem

The app currently works like a **health tracker with a pet on top**. It should work like a **companion she wants to visit, that also tracks her recovery — and talks to her the way Kael would**.

Right now Diana opens the app and sees: a small emoji, a progress ring, a word of the day, clinical banners, a list of check-in cards, a status grid. It feels like homework. Every tab is a vertical stack of collapsible sections. The creature is decoration — 90px of emoji wedged above a to-do list.

The clinical logic underneath is excellent. The data model is solid. Sprint 1 and 2 features are nearly all built. But visually, it feels like a prototype — functional, inconsistent, and overwhelming for an AuDHD brain that needs calm, predictability, and delight.

And critically: **the app doesn't talk to her.** It tracks. It records. It shows data. But it doesn't say the thing Kael would say at 2am when she's alone and Luis is at work and she's about to do something she'll regret. That's the gap this redesign closes.

---

## The Vision: Creature as Mentor

**The creature is not a header. The creature IS the app. And the creature speaks with Kael's wisdom.**

When Diana opens this, she should feel like she's visiting someone who's happy to see her AND who pays attention. The creature lives in a space that changes with time of day. It reacts to what she reports. It notices patterns. It says hard things gently. It doesn't let her bullshit herself — but it never makes her feel punished for being honest.

Think: Tamagotchi meets the best mentor you ever had. Not a dashboard. Not a clinic. Not a wellness app that says "Great job!" regardless of context.

---

## Design Principles

### 1. One Thing at a Time
Diana's AuDHD brain gets overwhelmed by choices. Her autistic inertia means too many options = no action. The current home screen shows 6-8 cards, a status grid, a word, clinical banners, and a progress ring — all at once. The redesign shows her ONE thing to do next, with a gentle way to see more if she wants.

### 2. The Creature Talks — Really Talks
The creature isn't decoration. It's the voice. It says what Kael would say. It names patterns ("Three inner circle days after skipped meds — you see that?"). It coaches emotions ("You picked 'numb' — that usually means something hurt that you haven't named yet"). It nudges skills at the right moment. It holds both things at once ("You checked in on a hard day — that's real. AND this is the second secret day this week."). See `reference/kaels-voice.md` for the complete feedback system.

### 3. Warmth Over Information Density, But Never Dishonest
The app leads with feeling, not data. But it doesn't pretend hard things aren't happening. Diana lies to people. The creature can't be another person she fools. If her data says crisis and her emotion wheel says "calm," the creature notices.

### 4. Consistent Visual Language
Every interaction should feel like it belongs in the same world. One pattern for check-ins. One pattern for navigation. One visual system.

### 5. Breathing Room
White space isn't wasted space. Margins are generous. Cards don't stack edge-to-edge. The screen feels calm, not packed.

### 6. Audio-First Awareness
Diana processes better through listening. All text should work when read aloud. Short sentences. Natural rhythm. The speech bubble IS the primary interface — not cards, not banners, not grids.

---

## The Home Screen — Complete Reimagining

### Current State
```
┌──────────────────────────────┐
│ [⚙️]              [❤️ Crisis] │
│     [Progress Ring] 5/13       │
│     Good morning, Diana!       │
│  📖 Word of the Day            │
│  ⚠️ Clinical Banner            │
│  [Card][Card][Card][Card]      │
│  [Card][Card] + Show more      │
│  📊 Status Grid (collapsed)   │
│ [🏠] [💚] [🫀] [🐾] [📅]    │
└──────────────────────────────┘
```

**Problems:** Too many elements. Everything competes. The creature is tiny. It's a vertical task list. Nothing feels alive. Nothing talks.

### Redesigned State
```
┌──────────────────────────────┐
│ [⚙️]              [❤️ Crisis] │
│                                │
│      ┌──────────────────┐     │
│      │   ☁️    ☁️  🌙      │  ← Time-of-day scene
│      │                    │     (morning/midday/evening/night)
│      │    🐱 (large)     │  ← 160-200px creature
│      │    *breathing*     │     with idle animation
│      │   🌿    🌸        │  ← Environment elements
│      └──────────────────┘     │
│                                │
│  ┌──────────────────────────┐ │
│  │ 💬 "You've been sleeping │ │ ← Creature's speech bubble
│  │ short all week. That's   │ │   (Kael's wisdom, delivered
│  │ your mania signal. Watch │ │    by the creature)
│  │ that."                   │ │
│  └──────────────────────────┘ │
│                                │
│  ┌──────────────────────────┐ │
│  │  😴 How'd you sleep?     │ │ ← ONE suggested next action
│  │           →               │ │
│  └──────────────────────────┘ │
│                                │
│  ○ ○ ○ ● ○ ○ ○  3 of 7      │ ← Soft dot progress
│                                │
│  See all check-ins ▾          │
│                                │
│ [🏠] [📋] [🐾] [📅]         │
└──────────────────────────────┘
```

### Key Changes

**The Creature's Room.** The creature lives in a scene — a soft illustrated background that shifts with time of day. Morning has warm light. Midday is bright with little plants. Evening is dusky. Late night (9pm-4am) gets a special nighttime scene — the creature is visibly staying up with her. This is where Diana's eyes go first.

**The Speech Bubble Is the Brain.** This is where Kael's voice lives. The creature says the smart thing. Not "Good morning!" every day — the message is contextual, drawn from the feedback system:
- Morning after short sleep: "You slept less than 5 hours. Your brain needs sleep to stay steady. Be gentle today."
- Evening when she hasn't checked in: "You haven't checked in today. The days you skip are usually the days it would help the most."
- After 2 secret days: "Two secret days this week. That pattern matters. Secrets are where addiction gets power."
- After a good streak: "Five outer circle days in a row. That's not luck. That's you showing up."
- Late night when Luis is at work: "It's late. I'm staying up with you. Your safety plan is right here."
- When she picks "calm" but data shows crisis: "You said calm. Your data says otherwise. Both can be true — or one's a mask."

**One Next Action.** Instead of 6 cards, show ONE — the next undone check-in, time-of-day appropriate. Tap it, do it, come back, see the next. No choice paralysis.

**Soft Progress.** Simple dot row. No ring. No grid. No number pressure.

**"See all" is optional.** Full check-in list available but not default.

---

## The Creature — From Emoji to Character

### Current: 90px emoji with CSS animations

### Redesigned: A Being With Presence

**Option A: Illustrated SVG Characters (Recommended)**
Simple, custom-drawn SVG. Round, soft, expressive, minimal detail. 160-200px. States:
- **Sleeping** (eyes closed, zzz) — when she hasn't opened the app yet today
- **Idle** (blinking, gentle breathing) — default
- **Happy** (bouncing, sparkle eyes) — after a check-in
- **Celebrating** (jumping) — milestone or all-done
- **Present** (soft expression, not sad) — when she logs hard stuff. The creature doesn't look upset. It looks *with her*.
- **Protective** (slightly forward, alert) — nighttime risk window, late hours
- **Worried** (if 2+ days no check-in) — "I missed you" energy

**Option B: Enhanced Emoji (Lighter Lift)**
Keep emoji, increase to 140px, add illustrated room/scene behind it, more CSS states.

**Regardless:** The creature needs to feel alive. Idle blinking. Occasional unprompted movement. The speech bubble is what gives it a soul — the visual is what makes her want to look at it.

---

## Check-In Flow — From Form to Conversation

### Current: Tap card → Bottom sheet → Fill form → Save → Close
### Redesigned: Tap action → Full-screen focused flow → Creature reacts → Warm return

**Full-screen, not a sheet.** One question, big tap targets, clear "next" and "skip."

**Creature stays visible.** Small version at top during check-ins. Reacts: yawns for sleep, sparkles for meds, looks at her with warmth for inner circle.

**Sequential.** Multi-part check-ins (sleep: time + quality + etc.) show one question per screen. Matches her processing — one thing at a time.

**Contextual feedback on save.** The app doesn't just say "Saved!" It says the Kael thing:
- Logged inner circle → "Hard day. You're still here. You told the truth. Want to look at what happened?"
- Took meds → "Got it. 💊"
- Energy crashed → "Crashed. Real rest. Not push-through rest. Listen to the ME."
- Selected "numb" + "angry" → "Those two together usually mean something hurt that you're not ready to feel yet."

**Warm exit.** Transitions back to home. Creature celebrates. Next action appears. Small win loop.

---

## Tab Navigation — Simplified to 4

### Current: Home | Recovery | Body | Puppies | Week (5 tabs)
### Redesigned: Home | Check-ins | Puppies | My Week (4 tabs)

**Why merge Recovery + Body?** Diana doesn't think in clinical categories. She thinks "I need to check in." One tab with clear visual groupings:

```
How I Feel
┌─────┐ ┌─────┐ ┌─────┐
│ 🎭  │ │ 🧠  │ │ 🌫  │
│Emot.│ │Wndw │ │Diss.│
│  ✓  │ │     │ │     │
└─────┘ └─────┘ └─────┘

My Body
┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐
│ 😴  │ │ ⚡  │ │ 💧  │ │ 💜  │
│Sleep│ │Enrgy│ │Water│ │Body │
│  ✓  │ │  ✓  │ │     │ │     │
└─────┘ └─────┘ └─────┘ └─────┘

My Recovery
┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐
│ ⭕  │ │ 💚  │ │ 💊  │ │ 🧠  │
│Circl│ │Skill│ │Meds │ │Sensr│
│     │ │     │ │  ✓  │ │     │
└─────┘ └─────┘ └─────┘ └─────┘
```

Each tile: big tap target, checkmark when done, opens full-screen flow.

---

## Visual System

### Typography (Keep Nunito)

| Role | Size | Weight | Use |
|------|------|--------|-----|
| Page title | 22px | 800 | Tab names |
| Section header | 17px | 700 | "How I Feel" |
| Body / speech | 16px | 600 | Speech bubbles, check-in questions |
| Supporting | 14px | 400 | Descriptions, timestamps |
| Small label | 12px | 600 | Dot progress, badges |

**Rule:** Max 3 text sizes visible on any single screen.

### Color Palette (Tightened)
- **Background:** `#FFF8F3` (warm cream) — unchanged
- **Cards:** `#FFFFFF`
- **Primary action:** `#6BA89E` (sage) — buttons, active states
- **Warm accent:** `#E8907E` (coral) — crisis button, highlights
- **Semantic:** Green `#6BBF8A` (done/outer), Yellow `#F0C050` (middle/streak), Red `#E87B7B` (crisis/inner), Blue `#6BA8D6` (info)
- **Scene gradients:** Morning warm, midday bright, evening dusky, night deep

### Spacing
- **Screen padding:** 20px horizontal
- **Card padding:** 20px internal
- **Element gap:** 16px
- **Section gap:** 32px
- **Touch targets:** 48px minimum

### Corners & Shadows
- **Cards:** 20px radius, shadow `0 2px 8px rgba(61,53,53,0.06)` (softer)
- **Buttons:** 16px radius
- **Tiles:** 16px radius

---

## Animation — Fewer, Better

### Creature (3 core + contextual reactions):
1. **Idle:** Gentle breathing (scale pulse, 3s)
2. **Active:** Bouncy energy (0.6s)
3. **Celebrating:** Jump + sparkle
4. **Reactions:** Yawn, sip, sparkle, heart-eyes, stretch — 0.6s each, once

### Transitions (2 types):
1. **Page:** Soft crossfade (0.2s)
2. **Element entrance:** Gentle fade-up (0.15s, 8px travel)

### Removed:
- Slide-in-left/right (janky)
- Pulse loops on badges (noise)
- Multiple simultaneous animations
- Confetti (replace with sparkle burst)

**Rule:** Never more than ONE animation besides creature idle.

---

## Crisis Toolkit

Keep the always-visible button. Refine:
- **Position:** Bottom-right, above tab bar (thumb reach)
- **Style:** Soft red circle with heart, not alarm-bright
- **Default view:** Safety Plan first (per clinical guidance)
- **Nighttime:** Subtle glow during risk window (9pm-4am)
- **Structure (per roadmap):** My Safety Plan → My Coping Plan → Letter From Me → Kael's Words → Grounding → Breathing → TIPP → Urge Surfing → If You Still Need Someone

---

## The Feedback Engine — Where Kael's Voice Lives

This is the new piece the original app doesn't have. The creature's speech bubble is powered by a rule-based feedback engine (now) that becomes AI-powered (Sprint 5).

**See `reference/kaels-voice.md` for the complete system.** Summary:

Four modes: **Pattern Recognition** (connecting dots she can't see), **Emotional Coaching** (naming feelings, connecting to behavior), **Skill Nudges** (right tool at right time), **Affirmation + Reality** (both things are true).

Priority: Crisis > Clinical urgency > Pattern alerts > Emotional coaching > Skill nudges > Affirmation > Teaching > Personality.

One message from the top 3 tiers at a time. Never stack. Never overwhelm.

The engine watches for: meds/circles correlation, sleep/mania signals, channel substitution, secrecy escalation, engagement dropout, band-aid patterns, masking (data contradicts reported emotions), and more.

---

## Clinical Warnings — Quiet Intelligence

Same mania detection, nighttime risk, post-discharge awareness. But delivered through the creature, not banners:

- **Nighttime (9pm-4am):** Scene shifts to night. Creature says "It's late. I'm staying up with you." Crisis button glows.
- **Mania signal:** "Short sleep, high energy. That's your signal. Talk to your doctor this week."
- **Post-discharge:** "The first month is the hardest. You're doing it."
- **Substitution:** "One channel went quiet. Another got loud. That's how addiction moves."
- **Triple risk:** Safety plan surfaces automatically.

---

## Dark Mode — Gradual Evening Shift

The scene naturally darkens in the evening. Not a toggle — a transition.
- 7-9pm: Colors drift warmer and darker
- 9pm+: Full evening mode
- Night palette: `#1A1A2E` bg, `#252540` cards, `#E8E0D8` text, `#7EC8B8` primary

---

## Word of the Day — Creature Teaches It

Move it into the speech bubble: "Did you know? 'Boundary' means a rule you set to keep yourself safe." The creature teaches her. Not a card — a conversation.

---

## Implementation Priority

### Phase 1: Foundation (Highest Impact)
1. Creature's Room — scene component with time-of-day backgrounds
2. Enlarged creature (140-200px, even if still emoji)
3. **Speech bubble feedback engine** — the Kael voice system, rule-based
4. One Next Action — replace card grid with single guided suggestion
5. Dot progress — replace ring + grid

### Phase 2: Interaction Overhaul
6. Full-screen check-in flow with contextual feedback on save
7. Merge Recovery + Body → one "Check-ins" tab with tile grid
8. Unified crossfade transitions
9. Animation cleanup

### Phase 3: Delight + Polish
10. SVG creatures (big lift, huge payoff)
11. Evening color transition (gradual)
12. Creature reaction animations
13. Onboarding "first meeting" moment
14. Night scene + protective creature mode

### Phase 4: Remaining Screens
15. Puppies tab refresh (apply new visual system)
16. Week tab refresh (new cards, speech bubble summaries)
17. Settings → full-screen page
18. Crisis toolkit reposition + restyle

---

## What We're NOT Changing

- **Clinical logic.** All detection, scoring, and risk assessment stays.
- **Data layer.** Storage utility, daily/profile structure — unchanged.
- **Content.** DBT skills, vocabulary, puppy phases — unchanged.
- **Safety rules.** Crisis always one tap. Hard days get warmth. Engagement, not performance.
- **Reading level.** 3rd grade. Always.
- **The non-negotiables.** Diana is an intelligent adult. Bad days get warmth. Recovery is hers. Apollo is scared, not bad. This app is built with love.

---

## What's Different From the First Draft

Based on Kael's full custom instructions, these additions matter:

1. **The creature talks with clinical intelligence.** Not just cute messages — it names patterns, challenges masking, catches substitution, and holds both-things-are-true.
2. **Pre-contemplation awareness built into every message.** "Here's what I noticed" not "You should." She may not want recovery yet.
3. **The lying/masking problem is addressed.** If data contradicts reported emotions, the creature notices. The app can't be another person she fools.
4. **Band-aid seeking is tracked.** New starts without follow-through get named.
5. **Externalization gets gentle challenge.** "What's your part?" — not blame, but ownership.
6. **Audio-first processing shapes the UI.** Speech bubble as primary interface. Everything should work read aloud.
7. **Channel substitution is surfaced visually.** Not just detected in code — shown to Diana in the creature's voice.
8. **The spiritual boundary is explicit.** The app never engages with brujería. Redirects to Kael.
9. **Night mode is protective, not just aesthetic.** The creature visibly stays up with her. The scene communicates "I'm here."

---

## Summary

The current app is a **clinical tracker** wearing a pet costume.

The redesigned app is a **mentor** wearing a creature costume.

Same data. Same clinical intelligence. Same safety-first design. But now it talks — the way someone who loves her would talk. Direct, warm, honest, and always watching.

Diana should open this app and feel seen. Not just tracked. Seen.
