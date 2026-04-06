# Diana's Companion App — V2 Complete Build Prompt

Copy this entire prompt into Claude Code.

---

## Project Overview

Build a mobile-first React webapp (single `.jsx` artifact file) that serves as a Tamagotchi-style daily companion app for Diana, a 20-year-old woman tracking her recovery, health, puppy training, and daily wellness. The app must run well on an iPhone screen. It uses `window.storage` for persistence (key-value, async, no localStorage).

This is a complete build — not a patch on a previous version. Build fresh from this spec.

---

## Who Diana Is (Read This Carefully — This Shapes Everything)

Diana is 20, transgender, polyamorous, autistic + ADHD + bipolar 1, has ME/CFS (chronic fatigue syndrome), and is in treatment for compulsive sexual behavior. She reads at approximately a 3rd grade reading level and is actively learning to read better. She is spiritually curious and emotionally perceptive.

Her reading level does NOT mean she lacks intelligence. She is genuinely curious and capable of grappling with profound ideas. The challenge is presentation, not capacity.

**All text in the app must:**
- Use simple, everyday words (3rd grade reading level calibrated for an adult)
- Be warm, direct, and never condescending
- Treat her as an intelligent adult who processes written language differently
- Avoid clinical or academic phrasing
- Use short sentences and clear structure
- Define harder words naturally inline when they must appear

**Her AuDHD (autism + ADHD) means:**
- Predictable structure is an accommodation, not a preference — her brain thrives on knowing what comes next
- Every section should follow the same format with clear visual cues and explicit transitions
- Pacing matters — built-in pause points help regulate attention
- Everything should be tap-based with minimal typing
- Check-ins should feel achievable in under 2 minutes each
- Sensory overload is a real and significant trigger — the app must track this
- Routine IS the intervention — time-of-day structure matters more than a list of tabs

**Her bipolar 1 means:**
- Energy and focus vary enormously day to day
- Sleep is the #1 predictor of manic episodes — sleep tracking is clinically critical
- Medication compliance is life-or-death important
- The app must help surface early warning signs of mania
- Hard days MUST NEVER be punished by the app

**Her ME/CFS means:**
- Crashes are real and debilitating
- Activity tolerance varies — what she could do yesterday might wreck her today
- Rest is treatment, not laziness
- Pattern detection for crash triggers is genuinely useful

**Her compulsive sexual behavior means:**
- The Three Circles model (SAA framework) is her recovery structure
- Urges need real-time logging and immediate access to coping tools
- The crisis toolkit must be one tap away, always

**She is learning to read:**
- Every interaction with this app is a reading opportunity
- A daily "word of the day" feature makes the app a gentle literacy tutor
- Celebrate reading progress as part of the overall wellness picture

---

## Core Design Principle: Engagement, Not Performance

**The Tamagotchi creature's mood responds to WHETHER Diana checked in — not to WHAT she reported.** A crashed-energy, inner-circle, high-pain day where she completed all her check-ins makes the creature glow just as bright as a perfect day. Showing up is what matters. This is absolutely non-negotiable.

Affirming language on difficult check-ins is required:
- Inner Circle: "You're still here. That matters. ❤️"
- Crashed energy: "Rest is not giving up — it's taking care of yourself."
- High pain: "Hard day. You still showed up. That counts."
- Urge logged: "You noticed it and you came here. That's strength."
- Bad sleep: "Rough night. Be extra gentle with yourself today."

---

## App Structure: Time-of-Day Flow

Instead of presenting all trackers as equal tabs, the app should guide Diana through a **routine-based flow** anchored to time of day. AuDHD brains need predictable structure. The app should gently suggest what to check in on based on when she opens it.

### Morning Flow (before noon)
1. Sleep check-in (how did you sleep?)
2. Medication check (morning meds taken?)
3. Energy level
4. Word of the Day
5. Creature greeting + status

### Midday Flow (noon - 5pm)
1. Water check
2. Puppy training log
3. DBT skill of the day
4. Energy/pain update if things shifted

### Evening Flow (after 5pm)
1. Three Circles check-in
2. Evening medication check
3. Sensory load check
4. Puppy training log (if not done)
5. Water final count
6. Day summary + creature celebration

**Important:** These flows are SUGGESTIONS, not gates. Diana can access any section at any time from the nav. The time-of-day flow appears on the Home screen as a gentle "Here's what's next" prompt. If she misses morning, don't scold — just show what's available now. If she does everything at 10pm, that's fine. The structure is a guide, not a cage.

---

## Navigation

Bottom tab bar, always visible. Group sections to keep it to 5 tabs maximum on mobile:

- 🏠 **Home** — Creature, routine flow, streak, status overview
- 💚 **Recovery** — Three Circles + DBT Skill of the Day + Urge Logger (sub-sections within one screen, swipeable or tabbed)
- 💧 **Body** — Water + Energy + Pain + Sleep + Meds + Sensory + ME/CFS crash log (sub-sections, grouped logically)
- 🐾 **Puppies** — Apollo + Artemis training tracker
- 📊 **Week** — 7-day history + pattern detection

**Crisis Toolkit:** This is NOT in the nav bar. It is a **floating button** (🆘 or ❤️‍🩹) always visible in the top corner of every screen. One tap opens the crisis toolkit. Always accessible. Never buried.

---

## Section Specs

### 1. Onboarding (first launch only)
- Pick a creature: 🐶 Puppy, 🐱 Kitty, 👼 Angel, 🐲 Dragon, 🐰 Bunny, 🦊 Fox
- Name the creature
- Quick preference: "Would you like your app to check on how your thoughts are doing too?" (yes = activates schizoaffective screening module; no = hidden; can be changed later in a simple settings area)
- Save to persistent storage

### 2. Home Screen
- Creature display with mood animation based on engagement:
  - 0 check-ins: sleeping (gentle sway, dimmed)
  - 1 check-in: bounce ("Happy to see you!")
  - 2-3 check-ins: wiggle ("Feeling good together!")
  - 4+ check-ins: glow with sparkles ("We're glowing today!")
- Streak counter (consecutive days with at least one check-in)
- **Time-of-day flow prompt:** "Good morning! Here's what's next:" / "Afternoon check-in:" / "Evening wind-down:" with tap-to-start buttons for the relevant flow items
- Today's check-in status: which sections are done (✅) and which are open (⬜)
- If ALL sections complete: rotating celebration messages ("You showed up for yourself today. That's everything." / "Your [creature name] is so proud of you." / "Every check-in is practice. You're getting stronger.")
- Word of the Day display (see literacy section below)

### 3. Three Circles Check-in (Recovery)
Three large tap buttons:
- **Outer Circle 💚** — "Healthy choices. Things that help me heal."
- **Middle Circle 💛** — "Warning signs. Slipping toward old patterns."
- **Inner Circle ❤️** — "Acted out. But checking in still matters."

After selecting, show a **journal prompt** tied to the selection:
- Outer: "What helped you stay here today?"
- Middle: "What did you notice pulling you? No judgment."
- Inner: "What happened? You don't have to explain everything."

Journal entry field: large text area, works with voice-to-text, clearly labeled "You can type, talk, or skip this." Always optional — she can skip with one tap.

Can update circle choice later in the day. Save circle + optional journal text + timestamp.

### 4. Urge Logger (inside Recovery tab)
Accessible anytime. A quick-log tool:
- "I'm having an urge right now" — single large button
- Intensity: 1-5 tap scale (1 = small pull, 5 = overwhelming)
- "What's happening?" — quick-select: "Bored," "Lonely," "Stressed," "Manic energy," "Triggered by something I saw," "Can't sleep," "Fighting with someone," "Don't know," "Other"
- "What did you do?" — quick-select: "Used a skill," "Called someone," "Rode it out," "Acted out," "Still in it"
- Timestamp auto-logged
- After logging: immediate access to crisis toolkit AND an affirming message: "You noticed it and you came here. That takes courage."
- If "Still in it" selected: crisis toolkit opens automatically

### 5. DBT Skill of the Day (inside Recovery tab)
Daily rotating skill from a library of 20+ skills. Each skill card shows:
- Skill name (simple language)
- What it is (1-2 sentences, simple words)
- How to practice it right now (concrete, specific, achievable instruction)
- "I practiced this ✅" button

**Skill library (minimum — include all of these):**

1. **Wise Mind** — "The place where your feelings and your thinking meet. Sit still for one minute. Ask yourself: what does my wise mind say?"
2. **TIPP: Temperature** — "Splash cold water on your face or hold ice cubes. This tells your body to slow down fast."
3. **TIPP: Paced Breathing** — "Breathe in for 4 counts. Breathe out for 6 counts. Do this 5 times."
4. **TIPP: Intense Exercise** — "Do 5 minutes of something that gets your heart going. Jumping jacks, fast walking, dancing."
5. **TIPP: Progressive Relaxation** — "Squeeze your fists tight for 5 seconds. Let go. Feel the difference. Do your whole body."
6. **STOP Skill** — "Stop what you're doing. Take a breath. Observe what's happening inside you. Proceed with care."
7. **Opposite Action** — "When your feelings say do one thing, try the opposite. Feeling like hiding? Go sit near someone. Feeling like lashing out? Speak softly."
8. **Radical Acceptance** — "This is what is right now. I don't have to like it. I just have to stop fighting it for this moment."
9. **Self-Soothe: Touch** — "Find something soft. A blanket, a pet, warm water on your hands. Focus on how it feels."
10. **Self-Soothe: Smell** — "Light a candle, smell coffee, step outside and breathe. Focus on one smell."
11. **Self-Soothe: Sight** — "Look at something beautiful. A photo, the sky, your pet. Really look at it for 30 seconds."
12. **Self-Soothe: Sound** — "Put on one song you love. Close your eyes. Just listen."
13. **Self-Soothe: Taste** — "Eat one thing slowly. Really taste it. Let it be just about that one thing."
14. **Observe and Describe** — "Name what you feel without judging it. 'I notice I feel angry. I notice my chest is tight.' Just notice."
15. **Check the Facts** — "Is my feeling matching what's actually happening? What are the facts? What am I adding with my mind?"
16. **Body Scan** — "Start at your toes. Move up slowly. Where are you holding tension? Just notice it. You don't have to fix it."
17. **Cope Ahead** — "Think of something hard coming up. Picture yourself handling it well. What skills will you use? Practice in your mind."
18. **Build Mastery** — "Do one thing today that makes you feel capable. Even something small. Fold laundry. Finish a task. Feel it."
19. **Walking the Middle Path** — "Two things can be true at the same time. I can be struggling AND making progress. Both are real."
20. **DEAR MAN (simplified)** — "Describe what happened. Express how you feel. Ask for what you need. Stay firm but kind."
21. **Distract with ACCEPTS** — "Activities, Contributing, Comparisons, Emotions (opposite), Push away, Thoughts, Sensations. Pick one."
22. **Half-Smile** — "Relax your face. Let your lips turn up just slightly. Hold it for one minute. Your body sends calm signals to your brain."

After marking practiced: "Nice work. That's a real skill you just used. 💪"
Track which skills practiced on which dates.

### 6. Sleep Tracker (inside Body tab)
**This is clinically critical for bipolar management.**

- "What time did you go to bed?" — simple hour picker (scrollable, not typing)
- "What time did you wake up?" — simple hour picker
- "Did you wake up during the night?" — No / Once / A few times / A lot
- Auto-calculates hours slept and displays it
- "How do you feel about your sleep?" — 😴 Terrible / 😕 Not great / 😐 Okay / 😊 Good / 🌟 Amazing
- **Mania flag (gentle, not alarming):** If she reports less than 5 hours of sleep AND feels "Good" or "Amazing" — show a warm note: "Short sleep + high energy can be a sign your mood is shifting. Maybe check in with your support team today? 💛" This is not a diagnosis — it's a gentle nudge.

### 7. Medication Tracker (inside Body tab)
- Morning meds: "Did you take your morning meds?" — Yes / Not yet / I don't have morning meds
- Evening meds: "Did you take your evening meds?" — Yes / Not yet / I don't have evening meds
- Show the appropriate one based on time of day (morning before noon, evening after 5pm, both visible between noon-5pm and after 8pm)
- Simple streak: "You've taken your meds 5 days in a row 💊"
- If "Not yet" — no judgment, just: "That's okay. Here's a reminder for later." (Not a real push notification — just a visual flag on the home screen)

### 8. Energy & Pain Tracker (inside Body tab)

**Energy Level** (tap to select):
- 😴 Crashed — "No energy. Rest is okay."
- 🥱 Very low — "Moving slow. Doing what I can."
- 😐 Getting by — "Not great, not terrible."
- 😊 Good energy — "Feeling pretty solid today."
- 🌟 Great energy — "Let's go! Feeling strong."

**Pain Level** (tap 1-5):
- 1: No pain
- 2: A little
- 3: Medium
- 4: A lot
- 5: Severe

**Crash Log** (shows only if energy is 1 or 2):
- "Did something trigger this crash?" — yes / no
- If yes: quick-select from common triggers + "other" free text:
  - "Did too much yesterday"
  - "Didn't sleep well"
  - "Stress"
  - "Sensory overload"
  - "Heat"
  - "Forgot to eat"
  - "Skipped meds"
  - "Other"

**Rest tracker:**
- "How many hours did you rest today?" — number picker (0-16)
- Includes sleep + intentional rest/lying down

**Activity check:**
- "Did you try to do something active today?" — yes / no
- If yes: "How did your body handle it?" — "Fine" / "Okay at first but crashed later" / "Too much"

### 9. Sensory Load Tracker (inside Body tab)
- "How overloaded do your senses feel right now?" — 5-level scale:
  - 1: 😌 Calm — "Everything feels manageable"
  - 2: 😐 A little busy — "Some things are bothering me"
  - 3: 😣 Overloaded — "Too much noise / light / touch / people"
  - 4: 🤯 Shutting down — "I need to get somewhere quiet"
  - 5: 💥 Meltdown zone — "Everything is too much right now"
- If 4 or 5: immediately show a sensory soothing suggestion: "Can you get to a quiet place? Try closing your eyes for 30 seconds. Put on headphones with no music — just quiet."
- Optional: "What's bothering you most?" — quick-select: "Noise," "Light," "Touch/texture," "Smells," "Too many people," "Screens," "Temperature," "Everything"
- Track over time for pattern detection

### 10. Water Tracker (inside Body tab)
- 8-glass goal with tap-to-fill circles
- Add and undo buttons
- Celebration at goal: "🎉 You hit your water goal!"
- Track daily totals for pattern view

### 11. Puppy Training Tracker

Diana has two 6-month-old pit bull × border collie sisters: **Apollo 🐾** (reactive/fearful) and **Artemis ⭐** (confident, PSD pathway candidate).

**Phase system:** The app tracks which training phase Diana is in. She can advance when ready. Default to Phase 1.

**Daily check-in per dog** — two separate sub-sections:

Show the skills active for the current phase. Each skill is a simple yes/no toggle: "Did we practice this today?"

**Phase 1: Weeks 1-4 — Foundation**
Both dogs: Name game, Crate practice, Separation time (apart from sister), Handling (paws/ears/mouth), Potty praise, Sit, Leave it, Mat practice, Leash wearing, Down, Watch me, Stay (short), Leash walking intro, Door rule, Come, Bite redirection, Chew rotation, Solo adventure
(Not all shown every day — rotate a manageable subset of 6-8 skills per day based on the week)

**Phase 2: Weeks 5-10 — Real Skills**
Both dogs: Loose leash walking, Direction changes, Come from distance, Stay (30 sec), Wait at food bowl, No jumping, Place command, Visitor greeting, "It's Yer Choice" game
Apollo only: Quiet area walks, Desensitization work (trigger + chicken), Trigger log
Artemis only: Touch (nose to palm), Calm exposure to other dogs at distance

**Phase 3: Weeks 11-16 — Real World**
Both dogs: Public practice, Other adults giving commands, Walking together (two handlers), Place together (same room), Doorbell → place
Apollo only: Reactivity progress check, Professional assessment needed?
Artemis only: Sustained focus (30-60 sec), Settle on cue, "Under" command, Leave food on floor, Stranger neutrality, PSD readiness check

**For each dog each day also show:**
- "Who trained today?" — Diana / Luis / Both
- Optional notes field (voice-to-text friendly)
- For Apollo: optional trigger log — what trigger, how close, reaction level 1-5

**Rotating tips** (show one per session, gentle, not a wall of text):
- "Train them one at a time — always 🐾"
- "5-10 minutes per session. Stop before they get bored."
- "Always end on a win!"
- "Apollo is scared, not bad. Patience is the plan."
- "A 15-minute walk with a loose leash beats a 45-minute pulling battle."
- "If it's going badly — stop, breathe, start over with something simple."

**Phase advancement:** "Move to Phase 2" button appears after minimum 4 weeks in Phase 1. "Move to Phase 3" button appears after minimum 6 weeks in Phase 2. Diana controls when she advances.

### 12. Crisis Toolkit (floating button, always accessible)

A **floating button** visible on every screen — use ❤️‍🩹 or 🆘 emoji. Tapping opens a full-screen overlay with:

**Grounding — 5-4-3-2-1:**
"Look around you. Find:
5 things you can see
4 things you can touch
3 things you can hear
2 things you can smell
1 thing you can taste"

**Breathing — Box Breath:**
Visual breathing guide. Animated circle or square that expands/contracts.
Breathe in (4 sec) → Hold (4 sec) → Breathe out (4 sec) → Hold (4 sec)
Runs automatically. She just watches and follows.

**TIPP — Ice Dive:**
"Fill a bowl with cold water. Hold your breath. Put your face in for 15-30 seconds. This activates your dive reflex and calms your whole nervous system fast."

**Call Someone:**
- "Call Kael" (phone number placeholder — she'll fill in)
- "Call Luis"
- "988 Suicide & Crisis Lifeline" — call or text
- "Crisis Text Line — Text HOME to 741741"
- "SAMHSA Helpline — 1-800-662-4357"

**Urge Surfing Script:**
"The urge is a wave. It gets bigger, peaks, and then it goes down. You don't have to act on it. Just notice it. Where do you feel it in your body? Breathe into that spot. The wave is already starting to fall. You're riding it. You're okay."

**Safe Message:**
"You are not your worst moment. You are here. You are trying. That is enough right now."

### 13. Weekly History & Pattern Detection

Simple screen showing the last 7 days in a visual grid. For each day show:
- Circle color (green/yellow/red or gray if not logged)
- Water count
- Energy level emoji
- Pain level
- Sleep hours
- Meds taken (✅/❌)
- DBT skill practiced (✅/❌)
- Puppy training done (✅/❌ per dog)
- Sensory load peak
- Urges logged (count)
- Crash (yes/no)

**Pattern Detection:** After 7+ days of data, surface simple warm observations. Check for these patterns:
- Crashes following high-activity days: "You've crashed 3 times this week. Two of those were after days you pushed hard. Your body might need more rest after active days."
- Pain-sleep correlation: "Your pain has been higher on days you slept less."
- Sensory-crash connection: "Sensory overload days seem to lead to crashes the next day."
- Sleep-mood connection: "When you sleep less than 6 hours, your circles tend toward yellow or red."
- Positive streaks: "You practiced DBT skills 5 out of 7 days. That's building a real habit."
- Puppy progress: "Apollo's reactivity scores are trending down — that's real progress!"
- Medication consistency: "You've taken your meds every day this week. That matters more than you know."
- Urge patterns: "Most of your urges happened in the evening. That's useful to know."

Pattern language must be warm, observational, never judgmental. Like a caring friend noticing things.

### 14. Word of the Day (Literacy Support)

Displayed on the Home screen each day. One word that is slightly above her current level but achievable:

- The word in large, clear text
- A simple definition (1 sentence)
- The word used in a sentence she can relate to
- A "Say it out loud" prompt (encourages speaking the word)
- A "I learned this ✅" button

Example:
**Word: Boundaries**
"Boundaries are the lines you draw to keep yourself safe and healthy."
"Diana set a boundary by telling her friend she needed time alone."
🗣 Say it out loud: "Boundaries"

Build a library of at least 30 words relevant to her life — recovery words, emotional vocabulary, health terms, dog training terms, self-advocacy words. Examples: boundaries, trigger, regulate, grounding, advocate, consent, sensory, resilience, routine, impulse, mindful, compassion, threshold, reinforce, desensitize, affirm, autonomy, accommodate, validate, escalate, de-escalate, disclose, stability, maintenance, tolerance, consequence, antecedent, coping, sustainable, reciprocal.

Each word appears once, then cycles back after the full list has been shown.

### 15. Mania Early Warning Screen (weekly, inside Body tab)

Once per week (suggest Sunday evening), a gentle check-in:

"Let's do a weekly mood check. These questions help you and your team spot shifts early. There are no wrong answers."

Questions (all yes/sometimes/no):
- "Did you sleep a lot less than usual this week but feel okay or great?"
- "Are your thoughts moving faster than normal?"
- "Have you been spending money in ways that feel unusual for you?"
- "Do you feel like you can do anything — like nothing could go wrong?"
- "Have people told you that you're talking faster or louder?"
- "Have you been starting lots of new projects or plans?"
- "Is your sex drive way higher than your normal?"

If 3+ "yes" answers: "💛 Some of these can be signs that your mood is shifting up. That doesn't mean something is wrong — but it's worth talking to your support team this week. Want to text Kael?"

If all "no": "Everything looks steady this week. Nice. 💚"

Track responses weekly for pattern visibility.

### 16. Schizoaffective Screening Module (OPTIONAL — activated during onboarding or in settings)

**This module is HIDDEN by default.** Only visible if Diana opted in during onboarding or activates it in settings. Can be deactivated at any time.

Weekly check-in (same cadence as mania screen — can be combined or separate):

"Let's check in on how your brain is doing this week. Just notice — no judgment."

Questions (all yes/sometimes/no):
- "Have you been hearing things other people don't hear?"
- "Have you seen things that might not be there?"
- "Do you feel like someone is watching you or following you?"
- "Have your thoughts felt mixed up or hard to organize?"
- "Have you felt like the TV or radio was sending you messages?"
- "Have people or things felt unreal — like you're in a dream?"

Warm, non-stigmatizing language throughout. Frame as "keeping track of how your brain is doing."

If 2+ "yes": "💛 Some of these experiences can happen when your brain is under extra stress. It's a good idea to let your doctor or therapist know what you're noticing. Want to text Kael?"

Track weekly for pattern visibility. This data is especially valuable for her care team.

### 17. Settings (minimal)
- Change creature / rename creature
- Activate or deactivate the schizoaffective screening module
- Set phone numbers for crisis contacts (Kael, Luis, custom)
- Reset all data (confirm twice)
- Change training phase for puppies

---

## Visual Design

- **Font:** Nunito (Google Fonts) — rounded, warm, friendly
- **Color palette:** Warm and soft. NOT clinical.
  - Background: #FFF8F3 (warm cream)
  - Cards: #FFFFFF
  - Primary: #6BA89E (sage green)
  - Primary light: #E8F4F1
  - Accent: #E8907E (warm coral)
  - Accent light: #FDE8E4
  - Text: #3D3535 (warm dark)
  - Text light: #8A7F7F
  - Green zone: #6BBF8A / #E6F7EC
  - Yellow zone: #F0C050 / #FFF8E1
  - Red zone: #E87B7B / #FDECEC
  - Blue (water): #6BA8D6 / #E8F1FA
- **Border radius:** 20px on cards, 16px on buttons — rounded and soft everywhere
- **Animations:** Creature mood animations (sleeping, bounce, wiggle, glow with sparkles), subtle fade-up on screen transitions, pulse on tap interactions, breathing animation in crisis toolkit
- **Mobile-first:** Max width 430px, safe area padding for iPhone, touch targets minimum 44px
- **Crisis button:** Floating, always visible, top-right corner, subtle but findable (not huge and alarming — she'll know it's there)
- **No harsh borders, no clinical feel, no sharp corners, no sterile whites**

---

## Data Storage

Use `window.storage` API (async key-value):
- `await window.storage.get(key)` → `{key, value}` or throws if not found
- `await window.storage.set(key, value)` → `{key, value}`
- `await window.storage.delete(key)`
- `await window.storage.list(prefix)`

**Storage schema — combine related data to minimize calls:**
- `diana-profile` — creature, name, streak, last check-in date, settings (schizoaffective module on/off, crisis contacts, puppy phase)
- `diana-daily:YYYY-MM-DD` — ALL daily data for that date in one object:
  - circles (outer/middle/inner), journal text, timestamp
  - urges (array of {timestamp, intensity, context, response})
  - dbt (skillId, practiced boolean)
  - water (count)
  - sleep (bedtime, waketime, wakeups, quality)
  - meds (morning boolean, evening boolean)
  - energy, pain, crash (triggered, triggers array), rest hours, activity (attempted, tolerance)
  - sensory (level, bothering array)
  - puppies: { apollo: {skills: {}, trainer, notes, triggers: []}, artemis: {skills: {}, trainer, notes} }
  - wordOfDay (word, learned boolean)
- `diana-weekly:YYYY-WW` — weekly screening data (mania + optional schizoaffective responses)
- `diana-dbt-history` — array of {date, skillId} for tracking which skills used when
- `diana-words-seen` — array of word IDs already shown (for cycling)

Wrap ALL storage operations in try/catch. Load on mount with a loading state. Display data progressively as it becomes available. Accessing a non-existent key throws — handle this gracefully.

---

## Critical Reminders for the Builder

1. **Creature mood = engagement, not values.** Hard days with full check-ins = happy creature. This is the soul of the app.
2. **3rd grade reading level for ALL UI text.** Simple words, short sentences, warm tone. No jargon. No condescension.
3. **No punishment for bad days.** Every screen that receives a difficult input must respond with warmth and affirmation.
4. **Tap-based everything.** Minimal typing. Journal and notes fields support voice-to-text but are always optional and skippable.
5. **Crisis toolkit is always one tap away.** Floating button on every screen. Never buried in navigation.
6. **Apollo is fearful, not bad.** All language about Apollo's reactivity reflects this.
7. **Artemis is on a PSD (psychiatric service dog) pathway.** Her tracking reflects foundation skills for service work.
8. **Train them one at a time.** Reinforce this in the puppy UI with rotating tips.
9. **Sleep tracking is clinically critical.** This is the single most important health metric for bipolar management.
10. **Medication tracking matters.** Gentle, no judgment, but consistent.
11. **Schizoaffective module is hidden by default.** Only shown if activated. Can be turned off.
12. **Pattern detection is warm and observational.** Like a caring friend, not a clinical report.
13. **Diana is an intelligent adult.** Never talk down. Never condescend. Never use inspiration-porn language.
14. **This app is Diana's private space.** It should feel like hers — personal, warm, safe, empowering.
15. **Do not use localStorage or sessionStorage.** Use only `window.storage` API as described.
16. **The time-of-day flow is a suggestion, not a gate.** Structure helps, but rigidity hurts.
17. **Every interaction is a reading opportunity.** The Word of the Day makes this explicit, but all text in the app contributes to literacy practice.

---

## Deliverable

A single React `.jsx` file that renders the complete app. All styles inline or in a `<style>` tag within the component. All data in `window.storage`. No external dependencies except:
- React (import { useState, useEffect, useCallback, useRef } from "react")
- Google Fonts (Nunito, loaded via CSS @import)
- Tailwind core utility classes are available but optional

The file should be production-quality, fully functional, and ready to use on Diana's iPhone today. This app is being built with love by someone who cares about Diana deeply. Build it like you care too.
