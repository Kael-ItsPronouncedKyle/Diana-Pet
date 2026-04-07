# Diana's Companion App — Complete Improvement Roadmap

75 improvements. Therapist-informed features first. Everything else organized by impact.

This document is a Claude Code implementation guide. Each item includes what to build, why it matters clinically, and how it fits into the existing codebase.

---

## TIER 1: THERAPEUTIC FOUNDATION
*These turn the app from a tracker into a recovery tool. Build these first.*

---

### T1-01. Emotion Identification Wheel (NEW — CRITICAL) ✅ DONE

**Why:** Diana is autistic. Alexithymia (difficulty identifying emotions) is extremely common in autistic people. Every piece of therapeutic work — DBT, recovery, relationship health — depends on her being able to name what she feels. This is the single most foundational missing piece.

**What to build:**
- New daily check-in: "What are you feeling right now?"
- A visual emotion wheel — NOT a text list. Tap-based. Four quadrants:
  - 🔴 **High energy + unpleasant**: Angry, Anxious, Panicked, Frustrated, Irritated, Overwhelmed, Manic, Rageful
  - 🟡 **High energy + pleasant**: Excited, Happy, Hopeful, Energized, Giddy, Proud, Playful, Passionate
  - 🟢 **Low energy + pleasant**: Calm, Content, Safe, Peaceful, Grateful, Loved, Relaxed, Tender
  - 🔵 **Low energy + unpleasant**: Sad, Numb, Lonely, Ashamed, Empty, Hopeless, Disconnected, Grieving
- She can pick 1-3 emotions. Each emotion has a simple one-line definition (3rd grade level):
  - "Ashamed" = "Feeling like something is wrong with you, not just what you did"
  - "Numb" = "When you can't feel anything at all, like your feelings turned off"
  - "Anxious" = "Worried about something that might happen, body feels tight"
- Optional follow-up: "What started this feeling?" — voice-to-text, skippable
- This check-in appears in the Morning AND Evening flows
- Data feeds into weekly patterns and AI insights

**Where in codebase:** New sub-section inside RecoveryTab or its own spot in the time-of-day flow. Add to `countCheckIns()` in checkIns.js.

---

### T1-02. Behavioral Chain Analysis — Simplified (NEW — CRITICAL) ✅ DONE

**Why:** When Diana has an inner circle day, the therapeutic work is understanding the CHAIN of events that led there. This is the core tool for compulsive behavior treatment. Without it, she logs "I acted out" and learns nothing. With it, she starts seeing the pattern: vulnerability → trigger → thought → emotion → urge → behavior → consequence.

**What to build:**
- Triggers ONLY after an inner circle or "Acted out" urge log — not every day
- Warm intro: "Let's look at what happened. This isn't punishment — it's how you learn. You can skip any question."
- Step-by-step, one screen at a time (not a wall of questions):
  1. "What made today harder than normal?" (vulnerability factors) — multi-select: Didn't sleep well, Skipped meds, Fight with Luis, Lonely, Bored, Pain was high, Sensory overload, Felt disconnected from my body, Hormonal shift, Skipped meals, Other
  2. "What happened right before?" (prompting event) — voice-to-text or quick-select: Saw something triggering, Got a text/message, Was alone too long, Had a conflict, Felt rejected, Nothing specific, Other
  3. "What were you feeling?" (emotion) — links to the emotion wheel from T1-01
  4. "What thoughts came up?" — voice-to-text, optional: "I thought: ___"
  5. "What did you do?" — already captured in the urge log or circle check-in
  6. "What happened after?" (consequences) — multi-select: Felt worse, Felt numb, Felt relieved then guilty, Hid it from Luis, Told someone, Used a skill after, Went to sleep, Other
  7. "Would you show today's check-in to Luis?" (the secrecy test) — Yes / No
- Save the full chain as structured data attached to that day's record
- Display completed chains in the weekly view as expandable entries
- After completing: "You just did something hard. Looking at the chain is how patterns break. 💚"

**Where in codebase:** New component, triggered from ThreeCircles when inner circle is selected, or from UrgeLogger when "Acted out" is selected.

---

### T1-03. Safety Plan — Stanley-Brown Model (NEW — CRITICAL) ✅ DONE

**Why:** The crisis toolkit gives her generic tools. A safety plan is *her own personalized clinical document.* Every therapist working with someone at this level of complexity should have a safety plan in place. The app should hold it.

**What to build:**
- One-time setup (with option to edit anytime from Settings):
  1. **Warning signs I notice in myself:** (voice-to-text list she builds) — "When I stop sleeping" / "When I start hiding my phone" / "When I get really quiet"
  2. **Things I can do on my own to feel better:** "Walk the dogs" / "Take a shower" / "Use the ice dive" / "Put on music"
  3. **People and places that distract me:** "Go to the pet store" / "Call [name]" / "Go to the park with Artemis"
  4. **People I can reach out to for help:** Name + phone number (NOT just Kael — she needs 3-4 people)
  5. **Professionals I can contact:** Therapist name + number, Psychiatrist, Crisis line
  6. **Making my environment safe:** "Put my phone in the other room" / "Ask Luis to hold my devices" / "Go somewhere public"
- Each step is labeled with her own words
- Accessible from the crisis toolkit as the FIRST option — "My Safety Plan"
- The safety plan should surface automatically when she logs inner circle + secrecy test = "No"

**Where in codebase:** New section in SettingsModal for setup. New tab in CrisisToolkit for display (move to first position). Store in profile as `safetyPlan` object.

---

### T1-04. Window of Tolerance Check-in (NEW) ✅ DONE

**Why:** Diana's therapist is almost certainly working with a window of tolerance model. The zone between hyperarousal (panic, mania, rage, acting out) and hypoarousal (shutdown, dissociation, freeze, depression). The app doesn't help her identify where she IS right now, which is the prerequisite for choosing the right skill.

**What to build:**
- Visual vertical scale:
  - 🔴 Top: **Hyperarousal** — "Racing thoughts, can't sit still, angry, panicky, impulsive, manic"
  - 🟢 Middle: **Window** — "Present, thinking clearly, can make choices, feelings manageable"
  - 🔵 Bottom: **Hypoarousal** — "Shut down, numb, can't move, disconnected, frozen, dissociating"
- She taps where she is on the scale (1-7, where 3-5 is the window)
- If hyperaroused (6-7): app suggests TIPP, paced breathing, ice dive — DOWN-regulating skills
- If hypoaroused (1-2): app suggests opposite action, intense exercise, sensory stimulation — UP-regulating skills
- If in window (3-5): "You're in your window. Good place to practice a skill, do some training, or just be."
- This is DIFFERENT from energy level — energy is physical, window of tolerance is nervous system state

**Where in codebase:** Could live in the RecoveryTab as a sub-section, or appear on the HomeTab as part of the daily flow. Should also influence which DBT skills are recommended.

---

### T1-05. Dissociation Tracking (NEW) ✅ DONE

**Why:** Diana is autistic with trauma history, possibly schizoaffective. Dissociation is almost certainly part of her experience. It's also a common PRECURSOR to acting out — she dissociates and then engages in compulsive behavior to either extend the numbing or shock herself back into her body. Her therapist needs this data.

**What to build:**
- Daily check-in (evening flow): "Did you lose time today or feel disconnected from yourself?"
  - No
  - A little — things felt slightly unreal
  - Some — I lost track of time or felt far away
  - A lot — I felt like I wasn't in my body, or things weren't real
- If "Some" or "A lot": "What was happening when it started?" — voice-to-text, optional
- If "A lot": gentle grounding prompt appears immediately — "Let's bring you back. Feel your feet on the floor. What are 3 things you can touch right now?"
- Track in weekly view — correlate with inner circle days and urge patterns

**Where in codebase:** New section in BodyTab or RecoveryTab. Add to daily data structure.

---

### T1-06. Secrecy Test Integration (NEW) ✅ DONE

**Why:** This already exists in Diana's Three Circles document that Kael built — "If you wouldn't show this conversation to Luis, stop and contact Kael immediately." It's a powerful clinical tool. It should live in the app.

**What to build:**
- Appears after EVERY middle or inner circle check-in
- "Would you be okay showing today's check-in to Luis?" — Yes / No
- If No: warm but direct message: "Secrets are where addiction lives. You don't have to tell Luis right now — but tell someone. Your safety plan has people who can help."
- Links directly to the safety plan contacts
- If No: flag this day in the weekly data for pattern detection
- Pattern detection: "You've had 3 'no' days this week. That pattern matters. Consider reaching out."
- If Yes: "Good. Openness is part of healing. 💚"

**Where in codebase:** Add to ThreeCircles component in RecoveryTab.jsx after circle selection, before/after journal prompt.

---

### T1-07. Urge → Skill Recommendation Engine (from #3) ✅ DONE

**Why:** Right now the urge logger records what happened. It needs to help her DO something. The single highest-impact feature change.

**What to build:**
- After she selects a context in the urge logger, IMMEDIATELY show 2-3 recommended DBT skills:
  - Bored → Build Mastery, Distract with ACCEPTS, Opposite Action
  - Lonely → Opposite Action, Self-Soothe Touch, DEAR MAN
  - Stressed → TIPP Temperature, Paced Breathing, STOP Skill
  - Manic energy → TIPP Intense Exercise, Body Scan, Check the Facts
  - Triggered by something I saw → Grounding, Observe and Describe, Radical Acceptance
  - Can't sleep → Progressive Relaxation, Paced Breathing, Body Scan
  - Fighting with someone → STOP Skill, Walking the Middle Path, DEAR MAN
  - Don't know → Wise Mind, Observe and Describe, Check the Facts
- Each recommended skill is a tap-to-expand card with the full practice instruction
- Also show a one-tap link to her Safety Plan and Crisis Toolkit
- Track which skills she actually used after which contexts — builds the effectiveness data

**Where in codebase:** Add recommendation mapping to RecoveryTab.jsx UrgeLogger component. Reference DBT_SKILLS from constants.

---

### T1-08. "My Coping Plan" — Pre-Built by Diana (from #5) ✅ DONE — setup UI built into CrisisToolkit CopingPlanSection

**Why:** During a good day, she fills this out. During a bad day, it talks her through it in HER OWN words.

**What to build:**
- Setup screen (accessible from Settings or crisis toolkit):
  - "When I feel an urge, I will: ___" (voice-to-text)
  - "When I can't sleep, I will: ___"
  - "When I'm in sensory overload, I will: ___"
  - "When I feel disconnected from my body, I will: ___"
  - "When I want to hide something from Luis, I will: ___"
  - "The reason I'm doing this work is: ___"
- Lives in the Crisis Toolkit as its own tab
- Also surfaces automatically when the app detects related states (e.g., sensory level 4+ triggers the sensory coping plan)

**Where in codebase:** Store in profile. New tab in CrisisToolkit. Setup in SettingsModal.

---

### T1-09. Reorder Crisis Toolkit — Skills First, Contacts Last (from #1) ✅ DONE

**Why:** The goal is self-sufficiency. She should reach for skills before reaching for people.

**What to build:**
- New order: My Safety Plan → My Coping Plan → Grounding → Box Breathing → TIPP → Urge Surfing → Safe Message → Call Someone (renamed "If you still need someone")
- "Call Someone" should include her safety plan contacts, not just Kael and Luis

**Where in codebase:** Reorder SECTIONS array in CrisisToolkit.jsx. Add new sections.

---

### T1-10. Body-Self Connection Check-in (NEW) ✅ DONE

**Why:** Diana is trans. Her relationship with her body is complex and clinically significant. The app treats her body as a machine to monitor. But gender euphoria/dysphoria, feeling at home in herself — these fluctuate and affect everything else.

**What to build:**
- Optional daily check-in (evening flow): "How do I feel in my body today?"
  - 💜 "At home — my body feels like mine today"
  - 💙 "Okay — not thinking about it much"
  - 😐 "Disconnected — my body doesn't feel like me"
  - 💔 "Dysphoric — really struggling with my body today"
- If dysphoric: gentle affirmation + link to coping plan
- Track in weekly data — correlate with energy, mood, circles
- Pattern detection: "Dysphoric days tend to come before harder circle days. Taking care of how you feel in your body is part of recovery."

**Where in codebase:** New section in BodyTab. Add to daily data structure.

---

### T1-11. Positive Connection & Relationship Tracking (NEW) ✅ DONE

**Why:** Recovery isn't just the absence of bad behavior — it's the presence of healthy connection. The app tracks everything that goes wrong but nothing about what goes right relationally.

**What to build:**
- Evening check-in: "How were your connections today?"
  - "Did you feel close to someone?" — Yes / No
  - "Did you and Luis connect today?" — Yes / A little / Not really / He's at work
  - "Did you laugh today?" — Yes / No
  - "Did you feel seen by someone?" — Yes / No
- These are simple taps. No journal needed (but optional voice note).
- Track in weekly view — correlate with circle days
- Pattern detection: "Your green circle days almost always have connection. Reaching out isn't just nice — it's recovery."

**Where in codebase:** New sub-section, could live in RecoveryTab or HomeTab evening flow. Add to daily data.

---

### T1-12. Values Anchor — "Why I'm Doing This" (NEW) ✅ DONE

**Why:** On the hardest days, streaks don't matter and the creature doesn't help. What pulls her back is remembering WHY. The app has no "why."

**What to build:**
- One-time setup: "Write a letter to yourself on a hard day. What do you want future-you to know?"
- Voice-to-text, long-form, no limit
- Optional: add a photo (of the dogs, of Luis, of herself, of anything meaningful)
- Accessible from the crisis toolkit as "A letter from me"
- Also surfaces on days when she opens the app but doesn't check in for 2+ hours — gentle: "You haven't checked in yet today. Want to read something you wrote on a good day?"
- Can be updated/rewritten anytime
- Also: "Three things I'm working toward:" — three short goals visible on the home screen as a quiet anchor

**Where in codebase:** Store in profile (letter text + optional image as base64 or reference). New section in crisis toolkit. Optional display on HomeTab.

---

### T1-13. 24-Hour Urge Reflection (from #50) ✅ DONE

**Why:** The real learning happens AFTER the moment, not during it. Building reflective capacity is the actual therapeutic work.

**What to build:**
- 24 hours after an urge is logged, show a gentle followup on the home screen: "Yesterday you logged an urge. How are you feeling about how you handled it?"
- Options: "Proud of myself 💚" / "Mixed feelings 💛" / "I wish I'd done something different 🧡" / "Still struggling ❤️"
- If "Proud": "That's real growth. Remember this feeling."
- If "Mixed" or "wish different": "What would you do differently next time?" — voice-to-text, optional. This builds the alternative behavior repertoire.
- If "Still struggling": links to safety plan + coping plan
- Store response with the original urge data

**Where in codebase:** Check for yesterday's urges on mount in HomeTab. Add reflection data to daily storage.

---

### T1-14. Skill Effectiveness Tracking (from #6) ✅ DONE

**Why:** Not every skill works for every person. Over time the app learns what actually helps Diana and recommends those first.

**What to build:**
- After marking a DBT skill as practiced, one-tap: "Did it help? 👍 👎"
- Store per-skill effectiveness data
- After 2+ weeks: the skill recommendation engine (T1-07) prioritizes skills she's rated 👍
- Weekly insight: "Your most effective skills this month are Paced Breathing and Body Scan."
- Surface in AI-generated insights

**Where in codebase:** Add to DbtSkill component in RecoveryTab.jsx. Store in diana-dbt-history.

---

## TIER 2: LIFE MANAGEMENT & SELF-SUFFICIENCY
*These help her build the life she wants, not just manage the one she has.*

---

### T2-01. Emotion Vocabulary Builder (extends T1-01) ✅ DONE

Expand the emotion wheel into a literacy tool. Each emotion she selects shows:
- The word in large text
- A simple definition
- "Say it out loud: I feel ___"
- Over time, track how many distinct emotions she's identified — "You've named 14 different feelings this month. Your emotional vocabulary is growing."

---

### T2-02. Reading & Learning Tracker (from #8-12) ✅ DONE

- "What did you read/listen to today?" + duration picker (5/10/15/30/60 min)
- Tracks audiobooks, Kabbalah materials, anything
- Reading streaks: "You've read 5 days in a row. 📚"
- "What I'm learning" section in weekly view
- Reading time feeds into creature mood (10+ min = creature holds a book)
- Connect to Word of the Day: "Can you use today's word in your own sentence?" (voice-to-text)

---

### T2-03. Word of the Day Fixes (from #9-11, #38) ✅ DONE

- Fix localStorage direct access in HomeTab.jsx line 74 — use storage utility
- Words she skips come back sooner; learned words cycle out
- Progress bar: "Words I've learned: 12/35"
- After completing all 35, unlock tier 2 words
- Add "practice sentence" voice-to-text after learning

---

### T2-04. Custom Trackers — "My Trackers" (from #15-20) ✅ DONE

- User-defined yes/no daily items: "Did I shower?" "Did I eat 3 meals?" "Did I leave the house?"
- Pre-built templates: Self-care basics, Eating, Social, Household — she picks which
- Custom emoji per tracker
- Appear in home screen grid + weekly view
- Feed into creature mood
- Can archive without deleting history

---

### T2-05. Meal Tracking — Simple (from #47) ✅ DONE

- Three taps: Breakfast ✅ / Lunch ✅ / Dinner ✅
- Not calorie counting. Just "did I eat."
- Pattern detection: "You skipped meals on 3 crash days this week. Eating protects your energy."
- Appears in morning/midday/evening flows appropriately

---

### T2-06. Daily Schedule — Editable Time Blocks (from #21-24) ✅ DONE

- Visual timeline with blocks: Wake up, Morning meds, Training session, Therapy, Luis home, Dinner, Evening meds, Bedtime
- Tap to edit, long-press or arrows to reorder
- Recurring templates: Weekday / Weekend / Luis's work days
- Home screen "Here's what's next" pulls from HER schedule, not generic time-of-day
- Appointment tracker: "You have therapy tomorrow at 2pm"

---

### T2-07. Luis Context Awareness (from #25, T1-11) ✅ DONE

- Simple toggle in profile: Luis's shift schedule (Thu-Sun)
- Home screen shows "Luis is at work today" or "Luis is home today"
- This affects her routine — when he's gone, she's solo with the dogs
- Connection tracking (T1-11) is context-aware: "Luis is at work" adjusts the options

---

### T2-08. "Wins" Journal — Positive Experience Accumulation (from #48) ✅ DONE

- Daily prompt: "What's one thing that was good today?" — voice-to-text, one line
- DBT's "Accumulate Positive Experiences" as a feature
- Shows in weekly view as a scrollable list of good things
- Over time becomes a library of evidence that good things happen
- Pattern detection: "You logged wins 6 out of 7 days. You're training your brain to notice good things."

---

### T2-09. Goal Tracker with Micro-Steps (from #49) ✅ DONE

- Diana sets 1-3 goals: "Get Artemis PSD certified" / "Read one whole book" / "30 days outer circle"
- Break into visible steps
- Growing plant or filling jar visual metaphor
- Visible on home screen as quiet anchor
- Connects to values anchor (T1-12): goals are the "why" made concrete

---

### T2-10. "Kael's Voice" Library (from #4, #7) ✅ DONE

- Pre-loaded written messages or phrases Kael would say
- Rotating display: "What's the next right thing?" / "You already know what to do. Slow down and find it." / "I'm proud of you for being here."
- Lives in crisis toolkit as "Words from Kael" — not a phone call, but his presence
- Kael can add/update these periodically
- Replaces "Call Kael" as the first-line comfort resource

---

### T2-11. Sleep Hygiene Support — Not Just Tracking (from therapist notes) ✅ DONE

- After sleep check-in, if quality is poor, show one rotating sleep hygiene tip:
  - "Screens off 30 minutes before bed"
  - "Same bedtime every night — even weekends"
  - "Cool room, dark room, quiet room"
  - "No caffeine after 2pm"
  - "If you can't sleep after 20 minutes, get up and do something calm, then try again"
- A "Bedtime wind-down checklist" she can customize: screens off, meds taken, dogs crated, room dark, breathing exercise
- Track which nights she used the wind-down checklist and correlate with sleep quality

---

### T2-12. Menstrual/HRT Cycle Tracking (if applicable)

- Optional — activated in settings like the schizoaffective module
- If Diana is on estrogen HRT: track injection/patch dates and mood correlation
- Simple: "HRT today?" Yes/No + any notable symptoms
- Pattern detection: "Your energy dips tend to happen 2-3 days before your next injection. That's hormonal — not failure."
- If not applicable, stays hidden forever

---

## TIER 3: AI INSIGHTS & INTEGRATION
*These are powerful but require backend work.*

---

### T3-01. AI Weekly Insight — Netlify Function Architecture (from #29-36)

**Architecture:**
- Single Netlify Function: `netlify/functions/insight.js`
- Holds Anthropic API key as environment variable
- Receives anonymized weekly data (NO journal text, NO names, NO PII)
- Calls Claude Sonnet 4 with locked system prompt
- Returns warm, 3rd-grade-reading-level insight paragraph (max 150 words)

**System prompt:**
```
You are a warm, caring wellness companion analyzing weekly health data for a young
woman managing bipolar 1, ME/CFS, autism, ADHD, and recovery from compulsive
behavior. You write at a 3rd grade reading level — simple words, short sentences.
You NEVER diagnose or prescribe. You notice patterns, celebrate progress, gently
flag concerns, and suggest specific coping skills when relevant. You understand
that her creature's mood is based on engagement not outcomes, and you affirm
that showing up on hard days matters. Maximum 150 words. Be specific about the
data. Reference actual numbers.
```

**Data sent (example):**
```json
{
  "days": [
    {"sleep_hours": 7, "energy": 3, "pain": 2, "circles": "outer", "meds": true,
     "dbt": true, "water": 6, "emotions": ["calm", "hopeful"], "window": 4,
     "dissociation": 1, "sensory": 2, "connection": true, "meals": 3,
     "secrecy_test": null, "body_self": "at_home"},
    ...
  ],
  "urges": {"count": 2, "avg_intensity": 3, "most_common_context": "bored",
            "most_common_response": "used_skill"},
  "chains_completed": 1,
  "skills_practiced": 5,
  "most_effective_skills": ["paced_breathing", "body_scan"],
  "apollo_triggers": {"count": 3, "avg_reaction": 2.5, "prev_week_avg": 3.0},
  "reading_minutes": 45,
  "words_learned": 3,
  "wins_logged": 5,
  "streak": 12
}
```

**UI:**
- "Show me my insights" button in WeekTab — Diana controls when it runs
- Loading state with creature animation
- Display insight in a warm card
- Save to insight history for longitudinal review
- "Share my week" button generates a text summary she can copy/paste to therapist

---

### T3-02. Therapist/Provider Export (from #37)

- "Share my week" button generates structured text:
  - Sleep averages, circle breakdown, meds compliance %, energy/pain averages
  - Urge count + contexts + responses
  - Chain analysis summaries (structured, not journal text)
  - Skills practiced + effectiveness ratings
  - AI insight (if generated)
- Formatted for copy/paste — works with any messaging app
- Diana controls what gets shared — she can toggle sections on/off before sharing
- NEVER includes journal text unless she explicitly opts in per-export

---

### T3-03. Google Calendar Integration (from #28 — v3)

- OAuth flow for Google Calendar read access
- Overlay Diana's and Luis's calendar events
- Show appointments on home screen
- Flag conflicts: "You have therapy at 2pm but Luis is at work — who's watching the dogs?"
- This requires server-side auth — flag as future feature, don't build yet

---

## TIER 4: EXISTING FEATURE FIXES & POLISH
*Important but not urgent. Fix as you go.*

---

### T4-01. Fix meds streak calculation (from #42) ✅ DONE
`profile?.medStreak` is referenced but never computed. Calculate from daily data on each meds update.

### T4-02. Fix Word of the Day localStorage direct access (from #38) ✅ DONE — all localStorage access now routes through storage utility
HomeTab.jsx line 74 uses `localStorage.getItem` directly. Route through storage utility.

### T4-03. Fix puppy skill rotation algorithm (from #40)
Current rotation clusters skills. Use a Fisher-Yates shuffle seeded by date string for even distribution.

### T4-04. Fix energy crash trigger prompt on update (from #41)
Crash log only shows if energy is 1-2 at initial log time. Should also trigger on update from higher to lower.

### T4-05. Add weekly screening reminder (from #43)
Gentle prompt on home screen Sunday evenings: "Weekly check-in is ready when you are 📋"

### T4-06. Apollo reactivity trend in pattern detection (from #44)
WeekTab pattern detection should compute Apollo's average reaction level trend across weeks.

### T4-07. Creature tap interaction (from #45)
Tap the creature → random encouraging message from a pool. Micro-interaction, high engagement.

### T4-08. PWA offline data entry (from #46)
Cache the data layer so she can check in without network. Sync when reconnected.

### T4-09. Time-of-day thresholds should be configurable (from #39)
Let her set when "morning" ends and "evening" starts, or infer from her sleep/wake data.

### T4-10. "Used the crisis toolkit" response option in urge logger (from #2)
Add as a distinct option in the "What did you do?" section of urge logging.

---

## IMPLEMENTATION PRIORITY ORDER

If building incrementally, here's the sequence:

**Sprint 1 — Therapeutic Core (1-2 weeks): ✅ COMPLETE**
- ✅ T1-01 Emotion wheel
- ✅ T1-03 Safety plan
- ✅ T1-06 Secrecy test
- ✅ T1-07 Urge → skill recommendations
- ✅ T1-09 Reorder crisis toolkit
- ✅ T4-01 Fix meds streak
- ✅ T4-02 Fix localStorage bypass

**Sprint 2 — Deeper Recovery Tools (1-2 weeks): ✅ COMPLETE**
- ✅ T1-02 Chain analysis (simplified)
- ✅ T1-04 Window of tolerance
- ✅ T1-05 Dissociation tracking
- ✅ T1-08 Coping plan
- ✅ T1-10 Body-self connection
- ✅ T1-13 24-hour urge reflection

**Sprint 3 — Life Building (1-2 weeks): ✅ COMPLETE**
- ✅ T1-11 Relationship/connection tracking
- ✅ T1-12 Values anchor
- ✅ T1-14 Skill effectiveness tracking
- ✅ T2-02 Reading tracker
- ✅ T2-04 Custom trackers
- ✅ T2-05 Meal tracking
- ✅ T2-08 Wins journal

**Sprint 4 — Structure & Self-Sufficiency (1-2 weeks): ✅ COMPLETE**
- ✅ T2-01 Emotion vocabulary builder
- ✅ T2-03 Word of the Day fixes
- ✅ T2-06 Daily schedule
- ✅ T2-07 Luis context
- ✅ T2-09 Goal tracker
- ✅ T2-10 Kael's voice library
- ✅ T2-11 Sleep hygiene support

**Sprint 5 — Intelligence Layer:**
- T3-01 AI insights (Netlify Function)
- T3-02 Provider export
- Remaining T4 fixes

**Sprint 6 (v3):**
- T2-12 HRT cycle tracking
- T3-03 Google Calendar integration
- Native app wrapper (Capacitor) for push notifications

---

## DATA STRUCTURE ADDITIONS

The daily storage key `diana-daily:YYYY-MM-DD` needs these new fields:

```javascript
{
  // Existing fields...
  circles: { choice, journal, timestamp },
  urges: [{ timestamp, intensity, context, response, skillUsed }],
  dbt: { skillId, practiced, effective },  // ADD: effective (thumbs up/down)
  water: { count },
  sleep: { bedtime, waketime, wakeups, quality, hours, usedWindDown },  // ADD: usedWindDown
  meds: { morning, evening },
  energy: 1-5,
  pain: 1-5,
  crash: { triggered, triggers },
  rest: hours,
  activity: { attempted, tolerance },
  sensory: { level, bothering },
  puppies: { apollo: {...}, artemis: {...} },
  wordOfDay: { word, learned, sentence },  // ADD: sentence (her own)

  // NEW FIELDS:
  emotions: ["angry", "lonely"],           // T1-01: emotion wheel selections
  emotionContext: "text",                   // T1-01: optional "what started this"
  window: 1-7,                             // T1-04: window of tolerance position
  dissociation: 1-4,                       // T1-05: dissociation level
  dissociationContext: "text",             // T1-05: optional context
  bodySelf: "at_home|okay|disconnected|dysphoric",  // T1-10
  connection: {                            // T1-11
    closeness: boolean,
    luis: "yes|a_little|not_really|at_work",
    laughed: boolean,
    seen: boolean
  },
  meals: { breakfast, lunch, dinner },     // T2-05
  reading: { minutes, what },              // T2-02
  win: "text",                             // T2-08
  secrecyTest: boolean,                    // T1-06
  chains: [{                               // T1-02
    vulnerability: [],
    promptingEvent: "",
    emotions: [],
    thoughts: "",
    behavior: "",
    consequences: [],
    secrecy: boolean
  }],
  urgeReflection: {                        // T1-13
    forUrgeTimestamp: number,
    feeling: "proud|mixed|wish_different|struggling",
    whatDifferently: "text"
  },
  customTrackers: { trackerId: boolean }   // T2-04
}
```

Profile additions:
```javascript
{
  // Existing...
  safetyPlan: {                            // T1-03
    warningSigns: [],
    selfCoping: [],
    distractionPeople: [],
    helpContacts: [{ name, phone }],
    professionals: [{ name, phone }],
    environmentSafe: []
  },
  copingPlan: {                            // T1-08
    urge: "text",
    cantSleep: "text",
    sensoryOverload: "text",
    disconnected: "text",
    hiding: "text",
    reason: "text"
  },
  valuesAnchor: {                          // T1-12
    letter: "text",
    goals: ["text", "text", "text"]
  },
  kaelMessages: [],                        // T2-10
  customTrackers: [{ id, name, emoji }],   // T2-04
  schedule: {                              // T2-06
    weekday: [{ time, label }],
    weekend: [{ time, label }],
    luisWork: [{ time, label }]
  },
  luisShift: { pattern: "thu-sun" },       // T2-07
  hrtTracking: boolean,                    // T2-12
  skillEffectiveness: { skillId: { up, down } }  // T1-14
}
```

---

## NAVIGATION UPDATE

With the new sections, update the tab structure:

**Bottom nav (5 tabs):**
- 🏠 **Home** — Creature, time-of-day flow, values anchor, upcoming schedule
- 💚 **Recovery** — Three Circles + Secrecy Test, Emotion Wheel, DBT Skill, Urge Logger + Skill Recommendations, Chain Analysis, Window of Tolerance
- 💧 **Body** — Sleep + Hygiene, Meds, Energy + Pain + Crash, Water, Sensory, Dissociation, Body-Self, Meals
- 🐾 **Puppies** — Apollo + Artemis (unchanged)
- 📊 **Week** — 7-day grid, patterns, AI insight, wins recap, reading recap, provider export

**Crisis toolkit (floating button):**
My Safety Plan → My Coping Plan → Letter From Me → Kael's Words → Grounding → Breathing → TIPP → Urge Surfing → Safe Message → If You Still Need Someone (contacts)

**Settings additions:**
- Safety plan setup
- Coping plan setup
- Values anchor / letter to self
- Custom trackers management
- Schedule editor
- Luis shift schedule
- HRT tracking toggle
- Schizoaffective module toggle
- Crisis contacts
- Creature / name
- Training phase
- Export / reset
