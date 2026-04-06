import { useState, useEffect, useCallback, useRef } from "react";

// ─── Constants ───────────────────────────────────────────────────────────────

const CREATURES = [
  { id: "puppy", emoji: "🐶", name: "Puppy" },
  { id: "kitty", emoji: "🐱", name: "Kitty" },
  { id: "angel", emoji: "👼", name: "Angel" },
  { id: "dragon", emoji: "🐲", name: "Dragon" },
  { id: "bunny", emoji: "🐰", name: "Bunny" },
  { id: "fox", emoji: "🦊", name: "Fox" },
];

const COLORS = {
  bg: "#FFF8F3", card: "#FFFFFF", primary: "#6BA89E", primaryLight: "#E8F4F1",
  accent: "#E8907E", accentLight: "#FDE8E4", text: "#3D3535", textLight: "#8A7F7F",
  green: "#6BBF8A", greenBg: "#E6F7EC", yellow: "#F0C050", yellowBg: "#FFF8E1",
  red: "#E87B7B", redBg: "#FDECEC", blue: "#6BA8D6", blueBg: "#E8F1FA",
};

const DBT_SKILLS = [
  { id: "wise-mind", name: "Wise Mind", desc: "The place where your feelings and your thinking meet.", practice: "Sit still for one minute. Ask yourself: what does my wise mind say?" },
  { id: "tipp-temp", name: "TIPP: Temperature", desc: "Use cold to slow your body down fast.", practice: "Splash cold water on your face or hold ice cubes. This tells your body to slow down." },
  { id: "tipp-breath", name: "TIPP: Paced Breathing", desc: "Slow breathing calms your whole system.", practice: "Breathe in for 4 counts. Breathe out for 6 counts. Do this 5 times." },
  { id: "tipp-exercise", name: "TIPP: Intense Exercise", desc: "Moving your body changes how you feel.", practice: "Do 5 minutes of something that gets your heart going. Jumping jacks, fast walking, dancing." },
  { id: "tipp-relax", name: "TIPP: Progressive Relaxation", desc: "Tense and release to find calm.", practice: "Squeeze your fists tight for 5 seconds. Let go. Feel the difference. Do your whole body." },
  { id: "stop", name: "STOP Skill", desc: "A quick pause before you react.", practice: "Stop what you're doing. Take a breath. Observe what's happening inside you. Proceed with care." },
  { id: "opposite-action", name: "Opposite Action", desc: "Do the opposite of what your emotion says.", practice: "Feeling like hiding? Go sit near someone. Feeling like lashing out? Speak softly." },
  { id: "radical-accept", name: "Radical Acceptance", desc: "Accepting what is — just for this moment.", practice: "This is what is right now. I don't have to like it. I just have to stop fighting it for this moment." },
  { id: "soothe-touch", name: "Self-Soothe: Touch", desc: "Use gentle touch to calm down.", practice: "Find something soft. A blanket, a pet, warm water on your hands. Focus on how it feels." },
  { id: "soothe-smell", name: "Self-Soothe: Smell", desc: "A familiar smell can ground you.", practice: "Light a candle, smell coffee, step outside and breathe. Focus on one smell." },
  { id: "soothe-sight", name: "Self-Soothe: Sight", desc: "Looking at something beautiful helps.", practice: "Look at something beautiful. A photo, the sky, your pet. Really look at it for 30 seconds." },
  { id: "soothe-sound", name: "Self-Soothe: Sound", desc: "Music and sound can shift your mood.", practice: "Put on one song you love. Close your eyes. Just listen." },
  { id: "soothe-taste", name: "Self-Soothe: Taste", desc: "Eating mindfully is a skill.", practice: "Eat one thing slowly. Really taste it. Let it be just about that one thing." },
  { id: "observe-describe", name: "Observe and Describe", desc: "Name what you feel without judging.", practice: "Say: 'I notice I feel angry. I notice my chest is tight.' Just notice." },
  { id: "check-facts", name: "Check the Facts", desc: "Is what you feel matching what is real?", practice: "What are the facts? What am I adding with my mind? Separate the two." },
  { id: "body-scan", name: "Body Scan", desc: "Notice where you hold tension.", practice: "Start at your toes. Move up slowly. Where are you holding tension? Just notice it." },
  { id: "cope-ahead", name: "Cope Ahead", desc: "Practice handling hard things in your mind.", practice: "Think of something hard coming up. Picture yourself handling it well. What skills will you use?" },
  { id: "build-mastery", name: "Build Mastery", desc: "Do one thing that makes you feel capable.", practice: "Do one thing today that makes you feel capable. Even something small. Fold laundry. Finish a task. Feel it." },
  { id: "middle-path", name: "Walking the Middle Path", desc: "Two things can be true at once.", practice: "I can be struggling AND making progress. Both are real." },
  { id: "dear-man", name: "DEAR MAN", desc: "Ask for what you need clearly and kindly.", practice: "Describe what happened. Express how you feel. Ask for what you need. Stay firm but kind." },
  { id: "accepts", name: "Distract with ACCEPTS", desc: "Healthy ways to shift your focus.", practice: "Activities, Contributing, Comparisons, Emotions (opposite), Push away, Thoughts, Sensations. Pick one." },
  { id: "half-smile", name: "Half-Smile", desc: "Your face can send calm signals to your brain.", practice: "Relax your face. Let your lips turn up just slightly. Hold it for one minute." },
];

const WORDS = [
  { id: "boundaries", word: "Boundaries", def: "Boundaries are the lines you draw to keep yourself safe and healthy.", sentence: "Diana set a boundary by telling her friend she needed time alone." },
  { id: "trigger", word: "Trigger", def: "A trigger is something that sets off a strong feeling or reaction in you.", sentence: "Loud noise was a trigger for Diana's sensory overload." },
  { id: "regulate", word: "Regulate", def: "Regulate means to bring something back into balance — like your feelings or energy.", sentence: "Diana used deep breathing to regulate her emotions." },
  { id: "grounding", word: "Grounding", def: "Grounding means bringing yourself back to the present moment.", sentence: "When things felt too big, Diana used a grounding exercise." },
  { id: "advocate", word: "Advocate", def: "An advocate is someone who speaks up for you — or you speaking up for yourself.", sentence: "Diana learned to be her own advocate at the doctor's office." },
  { id: "consent", word: "Consent", def: "Consent means saying yes freely, with no pressure.", sentence: "Consent matters in every relationship Diana has." },
  { id: "sensory", word: "Sensory", def: "Sensory means related to your senses — sight, sound, touch, taste, and smell.", sentence: "Diana had a sensory overload day from too much noise." },
  { id: "resilience", word: "Resilience", def: "Resilience is the ability to keep going after hard things happen.", sentence: "Every time Diana checks in on a hard day, she builds resilience." },
  { id: "routine", word: "Routine", def: "A routine is a set of things you do in the same order, often at the same time.", sentence: "Diana's morning routine helps her brain feel ready for the day." },
  { id: "impulse", word: "Impulse", def: "An impulse is a sudden urge to do something without thinking.", sentence: "Diana noticed the impulse and paused before acting on it." },
  { id: "mindful", word: "Mindful", def: "Mindful means paying attention to right now, on purpose, without judging.", sentence: "Diana practiced being mindful while she ate her lunch." },
  { id: "compassion", word: "Compassion", def: "Compassion is caring about someone's pain — including your own.", sentence: "Diana showed herself compassion on a hard day." },
  { id: "threshold", word: "Threshold", def: "A threshold is the point where something changes — like going from okay to overwhelmed.", sentence: "Diana noticed she was close to her threshold and took a break." },
  { id: "reinforce", word: "Reinforce", def: "Reinforce means to make something stronger by repeating it.", sentence: "Every time Apollo sits on command, Diana reinforces it with a treat." },
  { id: "desensitize", word: "Desensitize", def: "Desensitize means to slowly get used to something that used to be scary.", sentence: "Apollo is being desensitized to other dogs by seeing them from far away." },
  { id: "affirm", word: "Affirm", def: "Affirm means to say something true and positive out loud.", sentence: "Diana affirmed herself: 'I am doing my best and that is enough.'" },
  { id: "autonomy", word: "Autonomy", def: "Autonomy means having the freedom to make your own choices.", sentence: "Diana values her autonomy in deciding her own path." },
  { id: "accommodate", word: "Accommodate", def: "Accommodate means to make changes so something works for someone.", sentence: "The app accommodates Diana's reading level with simple words." },
  { id: "validate", word: "Validate", def: "Validate means to let someone know their feelings make sense.", sentence: "Kael validated Diana's frustration about the doctor's visit." },
  { id: "escalate", word: "Escalate", def: "Escalate means something is getting bigger or more intense.", sentence: "Diana noticed the argument starting to escalate, so she took a break." },
  { id: "de-escalate", word: "De-escalate", def: "De-escalate means to calm something down before it gets too big.", sentence: "Diana used the STOP skill to de-escalate her anger." },
  { id: "stability", word: "Stability", def: "Stability means things staying steady and predictable.", sentence: "Taking her meds every day gives Diana more stability." },
  { id: "tolerance", word: "Tolerance", def: "Tolerance is how much of something you can handle.", sentence: "Diana's activity tolerance changes day to day with her ME/CFS." },
  { id: "coping", word: "Coping", def: "Coping means dealing with something hard in a healthy way.", sentence: "Diana's coping skills got stronger every week she practiced." },
  { id: "sustainable", word: "Sustainable", def: "Sustainable means something you can keep doing without burning out.", sentence: "Diana found a sustainable routine that works on hard days too." },
  { id: "reciprocal", word: "Reciprocal", def: "Reciprocal means both sides give and receive equally.", sentence: "A good relationship is reciprocal — both people show up for each other." },
  { id: "consequence", word: "Consequence", def: "A consequence is what happens because of something you did.", sentence: "A natural consequence of staying up late is feeling tired the next day." },
  { id: "antecedent", word: "Antecedent", def: "An antecedent is what happens right before a behavior — the thing that sets it off.", sentence: "Diana tracked her antecedents to understand her urge patterns." },
  { id: "disclose", word: "Disclose", def: "Disclose means to share personal information with someone you trust.", sentence: "Diana got to choose what to disclose and when." },
  { id: "maintenance", word: "Maintenance", def: "Maintenance means keeping something working by taking care of it regularly.", sentence: "Recovery is about maintenance — doing small things every day." },
];

const PUPPY_PHASES = {
  1: {
    label: "Phase 1: Foundation (Weeks 1-4)",
    both: ["Name game", "Crate practice", "Separation time", "Handling (paws/ears/mouth)", "Potty praise", "Sit", "Leave it", "Mat practice", "Leash wearing", "Down", "Watch me", "Stay (short)", "Leash walking intro", "Door rule", "Come", "Bite redirection", "Chew rotation", "Solo adventure"],
    apolloOnly: [], artemisOnly: [], dailyCount: 7,
  },
  2: {
    label: "Phase 2: Real Skills (Weeks 5-10)",
    both: ["Loose leash walking", "Direction changes", "Come from distance", "Stay (30 sec)", "Wait at food bowl", "No jumping", "Place command", "Visitor greeting", "It's Yer Choice game"],
    apolloOnly: ["Quiet area walks", "Desensitization work", "Trigger log"],
    artemisOnly: ["Touch (nose to palm)", "Calm exposure to dogs at distance"],
    dailyCount: 8,
  },
  3: {
    label: "Phase 3: Real World (Weeks 11-16)",
    both: ["Public practice", "Other adults giving commands", "Walking together (two handlers)", "Place together (same room)", "Doorbell → place"],
    apolloOnly: ["Reactivity progress check", "Professional assessment needed?"],
    artemisOnly: ["Sustained focus (30-60 sec)", "Settle on cue", "Under command", "Leave food on floor", "Stranger neutrality", "PSD readiness check"],
    dailyCount: 8,
  },
};

const PUPPY_TIPS = [
  "Train them one at a time — always 🐾",
  "5-10 minutes per session. Stop before they get bored.",
  "Always end on a win!",
  "Apollo is scared, not bad. Patience is the plan.",
  "A 15-minute walk with a loose leash beats a 45-minute pulling battle.",
  "If it's going badly — stop, breathe, start over with something simple.",
];

const CRASH_TRIGGERS = ["Did too much yesterday", "Didn't sleep well", "Stress", "Sensory overload", "Heat", "Forgot to eat", "Skipped meds", "Other"];
const URGE_CONTEXTS = ["Bored", "Lonely", "Stressed", "Manic energy", "Triggered by something I saw", "Can't sleep", "Fighting with someone", "Don't know", "Other"];
const URGE_RESPONSES = ["Used a skill", "Called someone", "Rode it out", "Acted out", "Still in it"];
const SENSORY_BOTHERS = ["Noise", "Light", "Touch/texture", "Smells", "Too many people", "Screens", "Temperature", "Everything"];

const MANIA_QUESTIONS = [
  "Did you sleep a lot less than usual this week but feel okay or great?",
  "Are your thoughts moving faster than normal?",
  "Have you been spending money in ways that feel unusual for you?",
  "Do you feel like you can do anything — like nothing could go wrong?",
  "Have people told you that you're talking faster or louder?",
  "Have you been starting lots of new projects or plans?",
  "Is your sex drive way higher than your normal?",
];

const SCHIZOAFFECTIVE_QUESTIONS = [
  "Have you been hearing things other people don't hear?",
  "Have you seen things that might not be there?",
  "Do you feel like someone is watching you or following you?",
  "Have your thoughts felt mixed up or hard to organize?",
  "Have you felt like the TV or radio was sending you messages?",
  "Have people or things felt unreal — like you're in a dream?",
];

// ─── Helpers ────────────────────────────────────────────────────────────────

const today = () => new Date().toISOString().slice(0, 10);
const weekKey = () => {
  const d = new Date();
  const jan1 = new Date(d.getFullYear(), 0, 1);
  const wk = Math.ceil(((d - jan1) / 86400000 + jan1.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${String(wk).padStart(2, "0")}`;
};
const getHour = () => new Date().getHours();
const getTimeOfDay = () => { const h = getHour(); return h < 12 ? "morning" : h < 17 ? "midday" : "evening"; };

const storage = {
  async get(key) {
    try { const r = await window.storage.get(key); return r ? JSON.parse(r.value) : null; }
    catch { return null; }
  },
  async set(key, val) {
    try { await window.storage.set(key, JSON.stringify(val)); return true; }
    catch { return false; }
  },
};

const getDailyKey = (date) => `diana-daily:${date || today()}`;

// ─── Main App ───────────────────────────────────────────────────────────────

export default function DianaCompanion() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [dailyData, setDailyData] = useState(null);
  const [tab, setTab] = useState("home");
  const [showCrisis, setShowCrisis] = useState(false);
  const [subView, setSubView] = useState(null);

  // Load data on mount
  useEffect(() => {
    (async () => {
      const p = await storage.get("diana-profile");
      const d = await storage.get(getDailyKey());
      setProfile(p);
      setDailyData(d || {});
      setLoading(false);
    })();
  }, []);

  const saveProfile = async (p) => { setProfile(p); await storage.set("diana-profile", p); };
  const saveDaily = async (d) => { setDailyData(d); await storage.set(getDailyKey(), d); };
  const updateDaily = async (patch) => {
    const next = { ...dailyData, ...patch };
    setDailyData(next);
    await storage.set(getDailyKey(), next);
  };

  // Streak management
  const updateStreak = async (p) => {
    const t = today();
    if (p.lastCheckIn === t) return p;
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
    const yStr = yesterday.toISOString().slice(0, 10);
    const streak = p.lastCheckIn === yStr ? (p.streak || 0) + 1 : 1;
    const next = { ...p, streak, lastCheckIn: t };
    await saveProfile(next);
    return next;
  };

  const doCheckIn = async () => {
    if (profile) { const p = await updateStreak(profile); setProfile(p); }
  };

  // Count completed sections
  const checkinCount = (() => {
    if (!dailyData) return 0;
    let c = 0;
    if (dailyData.circles) c++;
    if (dailyData.water > 0) c++;
    if (dailyData.energy) c++;
    if (dailyData.sleep?.bedtime) c++;
    if (dailyData.meds?.morning || dailyData.meds?.evening) c++;
    if (dailyData.dbt?.practiced) c++;
    if (dailyData.puppies?.apollo || dailyData.puppies?.artemis) c++;
    if (dailyData.sensory?.level) c++;
    return c;
  })();

  if (loading) return (
    <div style={{ background: COLORS.bg, height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Nunito', sans-serif" }}>
      <div style={{ fontSize: 48, animation: "pulse 1.5s infinite" }}>💚</div>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap'); @keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.2); } }`}</style>
    </div>
  );

  if (!profile) return <Onboarding onComplete={saveProfile} />;

  return (
    <div style={{ background: COLORS.bg, minHeight: "100vh", fontFamily: "'Nunito', sans-serif", color: COLORS.text, maxWidth: 430, margin: "0 auto", position: "relative", paddingBottom: 80 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes bounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        @keyframes wiggle { 0%,100% { transform: rotate(0deg); } 25% { transform: rotate(-5deg); } 75% { transform: rotate(5deg); } }
        @keyframes glow { 0%,100% { filter: brightness(1); } 50% { filter: brightness(1.3) drop-shadow(0 0 12px gold); } }
        @keyframes sleepy { 0%,100% { transform: translateY(0); opacity: 0.6; } 50% { transform: translateY(2px); opacity: 0.5; } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes breatheIn { 0% { transform: scale(1); } 50% { transform: scale(1.4); } 100% { transform: scale(1); } }
        @keyframes sparkle { 0%,100% { opacity: 0; } 50% { opacity: 1; } }
        input, textarea, select { font-family: 'Nunito', sans-serif; }
      `}</style>

      {/* Crisis floating button */}
      <button onClick={() => setShowCrisis(true)} style={{
        position: "fixed", top: 16, right: 16, zIndex: 999, width: 44, height: 44, borderRadius: "50%",
        background: COLORS.accentLight, border: `2px solid ${COLORS.accent}`, fontSize: 20,
        display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
      }}>❤️‍🩹</button>

      {showCrisis && <CrisisToolkit profile={profile} onClose={() => setShowCrisis(false)} />}

      {/* Main content */}
      <div style={{ padding: "16px 16px 0", paddingTop: 8 }}>
        {tab === "home" && <HomeScreen profile={profile} dailyData={dailyData} checkinCount={checkinCount} onStartFlow={(v) => { setTab(v.tab); setSubView(v.sub); }} doCheckIn={doCheckIn} />}
        {tab === "recovery" && <RecoveryTab dailyData={dailyData} updateDaily={updateDaily} doCheckIn={doCheckIn} subView={subView} setSubView={setSubView} />}
        {tab === "body" && <BodyTab dailyData={dailyData} updateDaily={updateDaily} profile={profile} saveProfile={saveProfile} doCheckIn={doCheckIn} subView={subView} setSubView={setSubView} />}
        {tab === "puppies" && <PuppyTab dailyData={dailyData} updateDaily={updateDaily} profile={profile} saveProfile={saveProfile} doCheckIn={doCheckIn} />}
        {tab === "week" && <WeekTab profile={profile} />}
      </div>

      {/* Bottom nav */}
      <div style={{
        position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430,
        background: COLORS.card, borderTop: "1px solid #f0e8e2", display: "flex", justifyContent: "space-around",
        paddingBottom: "env(safe-area-inset-bottom, 8px)", paddingTop: 8, zIndex: 100
      }}>
        {[
          { id: "home", icon: "🏠", label: "Home" },
          { id: "recovery", icon: "💚", label: "Recovery" },
          { id: "body", icon: "💧", label: "Body" },
          { id: "puppies", icon: "🐾", label: "Puppies" },
          { id: "week", icon: "📊", label: "Week" },
        ].map(t => (
          <button key={t.id} onClick={() => { setTab(t.id); setSubView(null); }} style={{
            background: "none", border: "none", display: "flex", flexDirection: "column", alignItems: "center",
            color: tab === t.id ? COLORS.primary : COLORS.textLight, fontSize: 11, fontWeight: tab === t.id ? 700 : 400,
            cursor: "pointer", padding: "4px 8px", fontFamily: "'Nunito', sans-serif"
          }}>
            <span style={{ fontSize: 22 }}>{t.icon}</span>{t.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Card Component ─────────────────────────────────────────────────────────

function Card({ children, style, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: COLORS.card, borderRadius: 20, padding: 16, marginBottom: 12,
      boxShadow: "0 1px 4px rgba(0,0,0,0.04)", animation: "fadeUp 0.3s ease-out",
      ...(onClick ? { cursor: "pointer" } : {}), ...style
    }}>{children}</div>
  );
}

function TapButton({ children, active, color, bg, onClick, style }) {
  return (
    <button onClick={onClick} style={{
      background: active ? (bg || COLORS.primaryLight) : COLORS.card,
      border: `2px solid ${active ? (color || COLORS.primary) : "#ede7e1"}`,
      borderRadius: 16, padding: "10px 16px", fontSize: 15, fontWeight: 600,
      color: active ? (color || COLORS.primary) : COLORS.text, cursor: "pointer",
      fontFamily: "'Nunito', sans-serif", transition: "all 0.15s", ...style
    }}>{children}</button>
  );
}

function SectionTitle({ children }) {
  return <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8, color: COLORS.text }}>{children}</h2>;
}

// ─── Onboarding ─────────────────────────────────────────────────────────────

function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0);
  const [creature, setCreature] = useState(null);
  const [name, setName] = useState("");
  const [schizoModule, setSchizoModule] = useState(false);

  const finish = () => {
    onComplete({
      creature, creatureName: name || "Buddy", streak: 0, lastCheckIn: null,
      schizoModule, crisisContacts: { kael: "", luis: "" }, puppyPhase: 1,
      puppyPhaseStart: today()
    });
  };

  return (
    <div style={{ background: COLORS.bg, minHeight: "100vh", fontFamily: "'Nunito', sans-serif", color: COLORS.text, padding: 24, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap');`}</style>
      {step === 0 && (
        <div style={{ textAlign: "center", animation: "fadeUp 0.4s ease-out" }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Welcome! 💚</h1>
          <p style={{ fontSize: 16, color: COLORS.textLight, marginBottom: 24 }}>Let's set up your companion. First, pick a friend!</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 24 }}>
            {CREATURES.map(c => (
              <button key={c.id} onClick={() => setCreature(c)} style={{
                background: creature?.id === c.id ? COLORS.primaryLight : COLORS.card,
                border: `2px solid ${creature?.id === c.id ? COLORS.primary : "#ede7e1"}`,
                borderRadius: 20, padding: 16, fontSize: 36, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4
              }}>
                {c.emoji}<span style={{ fontSize: 13, fontWeight: 600 }}>{c.name}</span>
              </button>
            ))}
          </div>
          {creature && <button onClick={() => setStep(1)} style={btnStyle()}>Next →</button>}
        </div>
      )}
      {step === 1 && (
        <div style={{ textAlign: "center", animation: "fadeUp 0.4s ease-out", width: "100%" }}>
          <div style={{ fontSize: 64, marginBottom: 12 }}>{creature.emoji}</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Name your {creature.name}!</h2>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Type a name..." style={{
            width: "100%", maxWidth: 280, padding: "12px 16px", borderRadius: 16, border: `2px solid #ede7e1`,
            fontSize: 18, textAlign: "center", fontFamily: "'Nunito', sans-serif", marginBottom: 20, outline: "none"
          }} />
          <br />
          <button onClick={() => setStep(2)} style={btnStyle()}>Next →</button>
        </div>
      )}
      {step === 2 && (
        <div style={{ textAlign: "center", animation: "fadeUp 0.4s ease-out" }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>One more thing</h2>
          <p style={{ fontSize: 15, color: COLORS.textLight, marginBottom: 16, lineHeight: 1.5 }}>
            Would you like your app to check on how your thoughts are doing too?
          </p>
          <p style={{ fontSize: 13, color: COLORS.textLight, marginBottom: 20 }}>
            (You can change this later in settings.)
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button onClick={() => { setSchizoModule(true); setStep(3); }} style={btnStyle(COLORS.primaryLight, COLORS.primary)}>Yes, please</button>
            <button onClick={() => { setSchizoModule(false); setStep(3); }} style={btnStyle("#f5f0eb", COLORS.textLight)}>Not right now</button>
          </div>
        </div>
      )}
      {step === 3 && (
        <div style={{ textAlign: "center", animation: "fadeUp 0.4s ease-out" }}>
          <div style={{ fontSize: 72, marginBottom: 12, animation: "bounce 1s infinite" }}>{creature.emoji}</div>
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Meet {name || "Buddy"}!</h2>
          <p style={{ fontSize: 15, color: COLORS.textLight, marginBottom: 24 }}>
            {name || "Buddy"} is here for you. Every time you check in, they grow happier. Even on hard days.
          </p>
          <button onClick={finish} style={btnStyle()}>Let's go! 💚</button>
        </div>
      )}
    </div>
  );
}

function btnStyle(bg, color) {
  return {
    background: bg || COLORS.primary, color: color || "white", border: "none", borderRadius: 16,
    padding: "12px 28px", fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "'Nunito', sans-serif"
  };
}

// ─── Home Screen ────────────────────────────────────────────────────────────

function HomeScreen({ profile, dailyData, checkinCount, onStartFlow, doCheckIn }) {
  const tod = getTimeOfDay();
  const greetings = { morning: "Good morning!", midday: "Afternoon check-in!", evening: "Evening wind-down!" };
  const creatureAnim = checkinCount === 0 ? "sleepy 3s infinite" : checkinCount <= 1 ? "bounce 1s infinite" : checkinCount <= 3 ? "wiggle 0.6s infinite" : "glow 2s infinite";
  const creatureMsgs = [
    "Sleeping... 💤", "Happy to see you! 💚", "Feeling good together! 💛", "We're glowing today! ✨"
  ];
  const creatureMsg = creatureMsgs[Math.min(checkinCount, 3)];

  const allDone = !!(dailyData?.circles && dailyData?.water >= 8 && dailyData?.sleep?.bedtime && dailyData?.energy && (dailyData?.meds?.morning || dailyData?.meds?.evening));
  const celebrations = [
    "You showed up for yourself today. That's everything.",
    `${profile.creatureName} is so proud of you.`,
    "Every check-in is practice. You're getting stronger."
  ];

  const flowItems = {
    morning: [
      { label: "😴 Sleep check", done: !!dailyData?.sleep?.bedtime, go: { tab: "body", sub: "sleep" } },
      { label: "💊 Morning meds", done: !!dailyData?.meds?.morning, go: { tab: "body", sub: "meds" } },
      { label: "⚡ Energy level", done: !!dailyData?.energy, go: { tab: "body", sub: "energy" } },
    ],
    midday: [
      { label: "💧 Water check", done: (dailyData?.water || 0) > 0, go: { tab: "body", sub: "water" } },
      { label: "🐾 Puppy training", done: !!(dailyData?.puppies?.apollo || dailyData?.puppies?.artemis), go: { tab: "puppies" } },
      { label: "🧠 DBT skill", done: !!dailyData?.dbt?.practiced, go: { tab: "recovery", sub: "dbt" } },
    ],
    evening: [
      { label: "💚 Three Circles", done: !!dailyData?.circles, go: { tab: "recovery", sub: "circles" } },
      { label: "💊 Evening meds", done: !!dailyData?.meds?.evening, go: { tab: "body", sub: "meds" } },
      { label: "😌 Sensory check", done: !!dailyData?.sensory?.level, go: { tab: "body", sub: "sensory" } },
      { label: "💧 Water final", done: (dailyData?.water || 0) >= 8, go: { tab: "body", sub: "water" } },
    ],
  };

  // Word of the day
  const [wordData, setWordData] = useState(null);
  useEffect(() => {
    (async () => {
      const seen = (await storage.get("diana-words-seen")) || [];
      const unseen = WORDS.filter(w => !seen.includes(w.id));
      const pool = unseen.length > 0 ? unseen : WORDS;
      // Deterministic daily pick
      const dayNum = Math.floor(Date.now() / 86400000);
      const pick = pool[dayNum % pool.length];
      setWordData({ ...pick, learned: dailyData?.wordOfDay?.learned || false });
    })();
  }, [dailyData?.wordOfDay?.learned]);

  const markWordLearned = async () => {
    await updateDailyField({ wordOfDay: { word: wordData.id, learned: true } });
    const seen = (await storage.get("diana-words-seen")) || [];
    if (!seen.includes(wordData.id)) await storage.set("diana-words-seen", [...seen, wordData.id]);
    setWordData(prev => ({ ...prev, learned: true }));
  };

  // Bit of a hack — need updateDaily from parent
  const updateDailyField = async (patch) => {
    const d = (await storage.get(getDailyKey())) || {};
    const next = { ...d, ...patch };
    await storage.set(getDailyKey(), next);
  };

  return (
    <div>
      {/* Creature */}
      <Card style={{ textAlign: "center", paddingTop: 24, paddingBottom: 20 }}>
        <div style={{ fontSize: 72, animation: creatureAnim, marginBottom: 8, filter: checkinCount === 0 ? "grayscale(0.3)" : "none" }}>
          {profile.creature.emoji}
          {checkinCount >= 4 && <span style={{ position: "relative", top: -20, fontSize: 24, animation: "sparkle 1.5s infinite" }}>✨</span>}
        </div>
        <div style={{ fontSize: 18, fontWeight: 700 }}>{profile.creatureName}</div>
        <div style={{ fontSize: 14, color: COLORS.textLight, marginTop: 4 }}>{creatureMsg}</div>
        {profile.streak > 0 && (
          <div style={{ marginTop: 8, fontSize: 13, fontWeight: 600, color: COLORS.primary }}>
            🔥 {profile.streak} day streak
          </div>
        )}
      </Card>

      {allDone && (
        <Card style={{ background: COLORS.greenBg, textAlign: "center" }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: COLORS.green }}>
            {celebrations[Math.floor(Math.random() * celebrations.length)]}
          </div>
        </Card>
      )}

      {/* Time of day flow */}
      <Card>
        <SectionTitle>{greetings[tod]}</SectionTitle>
        <p style={{ fontSize: 13, color: COLORS.textLight, marginBottom: 12 }}>Here's what's next:</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {flowItems[tod].map((item, i) => (
            <button key={i} onClick={() => { doCheckIn(); onStartFlow(item.go); }} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              background: item.done ? COLORS.greenBg : "#faf6f2", border: `1.5px solid ${item.done ? COLORS.green : "#ede7e1"}`,
              borderRadius: 14, padding: "10px 14px", cursor: "pointer", fontFamily: "'Nunito', sans-serif"
            }}>
              <span style={{ fontSize: 14, fontWeight: 600 }}>{item.label}</span>
              <span style={{ fontSize: 16 }}>{item.done ? "✅" : "⬜"}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* Today's status */}
      <Card>
        <SectionTitle>Today so far</SectionTitle>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, fontSize: 13, color: COLORS.textLight }}>
          {[
            ["Circles", !!dailyData?.circles],
            ["Sleep", !!dailyData?.sleep?.bedtime],
            ["Meds", !!(dailyData?.meds?.morning || dailyData?.meds?.evening)],
            ["Energy", !!dailyData?.energy],
            ["Water", (dailyData?.water || 0) > 0],
            ["DBT", !!dailyData?.dbt?.practiced],
            ["Sensory", !!dailyData?.sensory?.level],
            ["Puppies", !!(dailyData?.puppies?.apollo || dailyData?.puppies?.artemis)],
          ].map(([label, done]) => (
            <span key={label} style={{ background: done ? COLORS.greenBg : "#f5f0eb", padding: "4px 10px", borderRadius: 10, fontWeight: 600, color: done ? COLORS.green : COLORS.textLight }}>
              {done ? "✅" : "⬜"} {label}
            </span>
          ))}
        </div>
      </Card>

      {/* Word of the Day */}
      {wordData && (
        <Card style={{ background: COLORS.blueBg }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.blue, textTransform: "uppercase", marginBottom: 6 }}>Word of the Day</div>
          <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>{wordData.word}</div>
          <p style={{ fontSize: 14, marginBottom: 6, lineHeight: 1.5 }}>{wordData.def}</p>
          <p style={{ fontSize: 13, color: COLORS.textLight, marginBottom: 6, fontStyle: "italic" }}>"{wordData.sentence}"</p>
          <p style={{ fontSize: 13, color: COLORS.blue, marginBottom: 10 }}>🗣 Say it out loud: "{wordData.word}"</p>
          {!wordData.learned ? (
            <button onClick={markWordLearned} style={btnStyle(COLORS.blue, "white")}>I learned this ✅</button>
          ) : (
            <span style={{ fontSize: 14, fontWeight: 600, color: COLORS.green }}>✅ Learned!</span>
          )}
        </Card>
      )}
    </div>
  );
}

// ─── Recovery Tab ───────────────────────────────────────────────────────────

function RecoveryTab({ dailyData, updateDaily, doCheckIn, subView, setSubView }) {
  const view = subView || "circles";
  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        {[["circles", "💚 Circles"], ["urge", "🔥 Urge Log"], ["dbt", "🧠 DBT"]].map(([id, label]) => (
          <TapButton key={id} active={view === id} onClick={() => setSubView(id)} style={{ flex: 1, fontSize: 13, padding: "8px 4px" }}>{label}</TapButton>
        ))}
      </div>
      {view === "circles" && <CirclesCheckin dailyData={dailyData} updateDaily={updateDaily} doCheckIn={doCheckIn} />}
      {view === "urge" && <UrgeLogger dailyData={dailyData} updateDaily={updateDaily} doCheckIn={doCheckIn} />}
      {view === "dbt" && <DBTSkill dailyData={dailyData} updateDaily={updateDaily} doCheckIn={doCheckIn} />}
    </div>
  );
}

function CirclesCheckin({ dailyData, updateDaily, doCheckIn }) {
  const [journal, setJournal] = useState(dailyData?.journal || "");
  const circle = dailyData?.circles;

  const messages = {
    outer: "💚 Healthy choices today. That's real strength.",
    middle: "💛 You noticed the pull. That awareness matters.",
    inner: "❤️ You're still here. That matters."
  };
  const prompts = {
    outer: "What helped you stay here today?",
    middle: "What did you notice pulling you? No judgment.",
    inner: "What happened? You don't have to explain everything."
  };

  const select = async (c) => { await updateDaily({ circles: c, circlesTime: new Date().toISOString() }); doCheckIn(); };
  const saveJournal = async () => { await updateDaily({ journal }); };

  return (
    <div>
      <SectionTitle>Three Circles</SectionTitle>
      <p style={{ fontSize: 14, color: COLORS.textLight, marginBottom: 12 }}>Where are you today? Tap one.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
        {[
          ["outer", "💚", "Outer Circle", "Healthy choices. Things that help me heal.", COLORS.green, COLORS.greenBg],
          ["middle", "💛", "Middle Circle", "Warning signs. Slipping toward old patterns.", COLORS.yellow, COLORS.yellowBg],
          ["inner", "❤️", "Inner Circle", "Acted out. But checking in still matters.", COLORS.red, COLORS.redBg],
        ].map(([id, emoji, title, desc, color, bg]) => (
          <button key={id} onClick={() => select(id)} style={{
            background: circle === id ? bg : COLORS.card, border: `2px solid ${circle === id ? color : "#ede7e1"}`,
            borderRadius: 20, padding: 14, textAlign: "left", cursor: "pointer", fontFamily: "'Nunito', sans-serif"
          }}>
            <div style={{ fontSize: 16, fontWeight: 700 }}>{emoji} {title}</div>
            <div style={{ fontSize: 13, color: COLORS.textLight, marginTop: 2 }}>{desc}</div>
          </button>
        ))}
      </div>
      {circle && (
        <Card style={{ background: circle === "outer" ? COLORS.greenBg : circle === "middle" ? COLORS.yellowBg : COLORS.redBg }}>
          <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 10 }}>{messages[circle]}</p>
          <p style={{ fontSize: 14, color: COLORS.textLight, marginBottom: 8 }}>{prompts[circle]}</p>
          <textarea value={journal} onChange={e => setJournal(e.target.value)} onBlur={saveJournal}
            placeholder="You can type, talk, or skip this."
            style={{ width: "100%", minHeight: 80, borderRadius: 14, border: `1.5px solid #ede7e1`, padding: 12, fontSize: 14, fontFamily: "'Nunito', sans-serif", resize: "vertical" }}
          />
          <p style={{ fontSize: 12, color: COLORS.textLight, marginTop: 4 }}>Voice-to-text works too. Always optional.</p>
        </Card>
      )}
    </div>
  );
}

function UrgeLogger({ dailyData, updateDaily, doCheckIn }) {
  const [step, setStep] = useState(0);
  const [intensity, setIntensity] = useState(0);
  const [context, setContext] = useState("");
  const [response, setResponse] = useState("");
  const [showCrisis, setShowCrisis] = useState(false);

  const urges = dailyData?.urges || [];

  const logUrge = async () => {
    const entry = { timestamp: new Date().toISOString(), intensity, context, response };
    await updateDaily({ urges: [...urges, entry] });
    doCheckIn();
    if (response === "Still in it") setShowCrisis(true);
    setStep(4);
  };

  if (showCrisis) return <CrisisToolkit onClose={() => { setShowCrisis(false); setStep(0); }} />;

  return (
    <div>
      <SectionTitle>Urge Logger</SectionTitle>
      {step === 0 && (
        <>
          <button onClick={() => setStep(1)} style={{
            ...btnStyle(COLORS.accentLight, COLORS.accent), width: "100%", padding: 16, fontSize: 16, marginBottom: 16
          }}>I'm having an urge right now</button>
          {urges.length > 0 && (
            <Card>
              <p style={{ fontSize: 14, fontWeight: 600 }}>Logged today: {urges.length}</p>
              {urges.map((u, i) => (
                <div key={i} style={{ fontSize: 13, color: COLORS.textLight, marginTop: 4 }}>
                  {new Date(u.timestamp).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })} — intensity {u.intensity}/5 — {u.context}
                </div>
              ))}
            </Card>
          )}
        </>
      )}
      {step === 1 && (
        <Card>
          <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 10 }}>How strong is it? (1-5)</p>
          <div style={{ display: "flex", gap: 8 }}>
            {[1, 2, 3, 4, 5].map(n => (
              <TapButton key={n} active={intensity === n} onClick={() => { setIntensity(n); setStep(2); }}
                color={COLORS.accent} bg={COLORS.accentLight} style={{ flex: 1, fontSize: 18 }}>{n}</TapButton>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: COLORS.textLight, marginTop: 4 }}>
            <span>Small pull</span><span>Overwhelming</span>
          </div>
        </Card>
      )}
      {step === 2 && (
        <Card>
          <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 10 }}>What's happening?</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {URGE_CONTEXTS.map(c => (
              <TapButton key={c} active={context === c} onClick={() => { setContext(c); setStep(3); }}
                style={{ fontSize: 13, padding: "8px 12px" }}>{c}</TapButton>
            ))}
          </div>
        </Card>
      )}
      {step === 3 && (
        <Card>
          <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 10 }}>What did you do?</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {URGE_RESPONSES.map(r => (
              <TapButton key={r} active={response === r} onClick={() => { setResponse(r); setTimeout(logUrge, 100); }}
                style={{ fontSize: 13, padding: "8px 12px" }}>{r}</TapButton>
            ))}
          </div>
        </Card>
      )}
      {step === 4 && (
        <Card style={{ textAlign: "center", background: COLORS.primaryLight }}>
          <p style={{ fontSize: 16, fontWeight: 700, color: COLORS.primary, marginBottom: 8 }}>
            You noticed it and you came here. That takes courage. 💚
          </p>
          <button onClick={() => { setStep(0); setIntensity(0); setContext(""); setResponse(""); }} style={btnStyle()}>Done</button>
        </Card>
      )}
    </div>
  );
}

function DBTSkill({ dailyData, updateDaily, doCheckIn }) {
  const dayNum = Math.floor(Date.now() / 86400000);
  const skill = DBT_SKILLS[dayNum % DBT_SKILLS.length];
  const practiced = dailyData?.dbt?.practiced && dailyData?.dbt?.skillId === skill.id;

  const markPracticed = async () => {
    await updateDaily({ dbt: { skillId: skill.id, practiced: true } });
    doCheckIn();
    // Also save to history
    const hist = (await storage.get("diana-dbt-history")) || [];
    hist.push({ date: today(), skillId: skill.id });
    await storage.set("diana-dbt-history", hist);
  };

  return (
    <div>
      <SectionTitle>Skill of the Day</SectionTitle>
      <Card style={{ background: COLORS.primaryLight }}>
        <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 6, color: COLORS.primary }}>{skill.name}</div>
        <p style={{ fontSize: 14, marginBottom: 10, lineHeight: 1.5 }}>{skill.desc}</p>
        <div style={{ background: COLORS.card, borderRadius: 14, padding: 12, marginBottom: 12 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: COLORS.textLight, marginBottom: 4 }}>Try it right now:</p>
          <p style={{ fontSize: 14, lineHeight: 1.5 }}>{skill.practice}</p>
        </div>
        {!practiced ? (
          <button onClick={markPracticed} style={btnStyle()}>I practiced this ✅</button>
        ) : (
          <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.green }}>✅ Nice work. That's a real skill you just used. 💪</div>
        )}
      </Card>
    </div>
  );
}

// ─── Body Tab ───────────────────────────────────────────────────────────────

function BodyTab({ dailyData, updateDaily, profile, saveProfile, doCheckIn, subView, setSubView }) {
  const view = subView || "sleep";
  const items = [
    ["sleep", "😴 Sleep"], ["meds", "💊 Meds"], ["energy", "⚡ Energy"],
    ["water", "💧 Water"], ["sensory", "😌 Sensory"], ["mania", "🔍 Weekly"]
  ];
  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
        {items.map(([id, label]) => (
          <TapButton key={id} active={view === id} onClick={() => setSubView(id)} style={{ fontSize: 12, padding: "6px 10px" }}>{label}</TapButton>
        ))}
      </div>
      {view === "sleep" && <SleepTracker dailyData={dailyData} updateDaily={updateDaily} doCheckIn={doCheckIn} />}
      {view === "meds" && <MedsTracker dailyData={dailyData} updateDaily={updateDaily} doCheckIn={doCheckIn} />}
      {view === "energy" && <EnergyPainTracker dailyData={dailyData} updateDaily={updateDaily} doCheckIn={doCheckIn} />}
      {view === "water" && <WaterTracker dailyData={dailyData} updateDaily={updateDaily} doCheckIn={doCheckIn} />}
      {view === "sensory" && <SensoryTracker dailyData={dailyData} updateDaily={updateDaily} doCheckIn={doCheckIn} />}
      {view === "mania" && <WeeklyScreening dailyData={dailyData} profile={profile} saveProfile={saveProfile} />}
    </div>
  );
}

function SleepTracker({ dailyData, updateDaily, doCheckIn }) {
  const sleep = dailyData?.sleep || {};
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const update = async (patch) => {
    const next = { ...sleep, ...patch };
    // Auto-calc hours
    if (next.bedtime !== undefined && next.waketime !== undefined) {
      let diff = next.waketime - next.bedtime;
      if (diff < 0) diff += 24;
      next.hoursSlept = diff;
    }
    await updateDaily({ sleep: next });
    doCheckIn();

    // Mania flag check
    if (next.hoursSlept && next.hoursSlept < 5 && (next.quality === "good" || next.quality === "amazing")) {
      next.maniaFlag = true;
    }
  };

  return (
    <div>
      <SectionTitle>😴 Sleep Check-in</SectionTitle>
      <Card>
        <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>What time did you go to bed?</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
          {[20, 21, 22, 23, 0, 1, 2, 3, 4].map(h => (
            <TapButton key={`bed${h}`} active={sleep.bedtime === h} onClick={() => update({ bedtime: h })}
              style={{ fontSize: 13, padding: "6px 10px" }}>{h === 0 ? "12am" : h < 12 ? `${h}am` : h === 12 ? "12pm" : `${h - 12}pm`}</TapButton>
          ))}
        </div>
        <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>What time did you wake up?</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
          {[5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map(h => (
            <TapButton key={`wake${h}`} active={sleep.waketime === h} onClick={() => update({ waketime: h })}
              style={{ fontSize: 13, padding: "6px 10px" }}>{h < 12 ? `${h}am` : h === 12 ? "12pm" : `${h - 12}pm`}</TapButton>
          ))}
        </div>
        <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Did you wake up during the night?</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
          {[["no", "No"], ["once", "Once"], ["few", "A few times"], ["lot", "A lot"]].map(([id, label]) => (
            <TapButton key={id} active={sleep.wakeups === id} onClick={() => update({ wakeups: id })}
              style={{ fontSize: 13, padding: "8px 12px" }}>{label}</TapButton>
          ))}
        </div>
        {sleep.hoursSlept !== undefined && (
          <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.primary, marginBottom: 12 }}>
            About {sleep.hoursSlept} hours of sleep
          </div>
        )}
        <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>How do you feel about your sleep?</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {[["terrible", "😴 Terrible"], ["notgreat", "😕 Not great"], ["okay", "😐 Okay"], ["good", "😊 Good"], ["amazing", "🌟 Amazing"]].map(([id, label]) => (
            <TapButton key={id} active={sleep.quality === id} onClick={() => update({ quality: id })}
              style={{ fontSize: 13, padding: "8px 12px" }}>{label}</TapButton>
          ))}
        </div>
      </Card>
      {sleep.maniaFlag && (
        <Card style={{ background: COLORS.yellowBg }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: COLORS.yellow }}>
            💛 Short sleep + high energy can be a sign your mood is shifting. Maybe check in with your support team today?
          </p>
        </Card>
      )}
    </div>
  );
}

function MedsTracker({ dailyData, updateDaily, doCheckIn }) {
  const meds = dailyData?.meds || {};
  const h = getHour();

  const update = async (patch) => { await updateDaily({ meds: { ...meds, ...patch } }); doCheckIn(); };

  // Count consecutive meds days
  const [streak, setStreak] = useState(0);
  useEffect(() => {
    (async () => {
      let s = 0;
      for (let i = 1; i <= 30; i++) {
        const d = new Date(); d.setDate(d.getDate() - i);
        const data = await storage.get(`diana-daily:${d.toISOString().slice(0, 10)}`);
        if (data?.meds?.morning || data?.meds?.evening) s++; else break;
      }
      if (meds.morning || meds.evening) s++;
      setStreak(s);
    })();
  }, [meds.morning, meds.evening]);

  return (
    <div>
      <SectionTitle>💊 Medication Check</SectionTitle>
      {(h < 17 || h >= 20) && (
        <Card>
          <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 10 }}>Morning meds?</p>
          <div style={{ display: "flex", gap: 8 }}>
            {[["yes", "Yes ✅"], ["notyet", "Not yet"], ["none", "I don't have morning meds"]].map(([id, label]) => (
              <TapButton key={id} active={meds.morning === id} onClick={() => update({ morning: id })}
                style={{ flex: 1, fontSize: 12, padding: "10px 4px" }}>{label}</TapButton>
            ))}
          </div>
          {meds.morning === "notyet" && (
            <p style={{ fontSize: 13, color: COLORS.textLight, marginTop: 8 }}>That's okay. Here's a reminder for later. 💊</p>
          )}
        </Card>
      )}
      {h >= 17 && (
        <Card>
          <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 10 }}>Evening meds?</p>
          <div style={{ display: "flex", gap: 8 }}>
            {[["yes", "Yes ✅"], ["notyet", "Not yet"], ["none", "I don't have evening meds"]].map(([id, label]) => (
              <TapButton key={id} active={meds.evening === id} onClick={() => update({ evening: id })}
                style={{ flex: 1, fontSize: 12, padding: "10px 4px" }}>{label}</TapButton>
            ))}
          </div>
          {meds.evening === "notyet" && (
            <p style={{ fontSize: 13, color: COLORS.textLight, marginTop: 8 }}>That's okay. Here's a reminder for later. 💊</p>
          )}
        </Card>
      )}
      {streak > 1 && (
        <Card style={{ background: COLORS.greenBg, textAlign: "center" }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: COLORS.green }}>You've taken your meds {streak} days in a row 💊</p>
        </Card>
      )}
    </div>
  );
}

function EnergyPainTracker({ dailyData, updateDaily, doCheckIn }) {
  const energy = dailyData?.energy;
  const pain = dailyData?.pain;
  const crash = dailyData?.crash || {};
  const rest = dailyData?.rest;
  const activity = dailyData?.activity || {};

  const update = async (patch) => { await updateDaily(patch); doCheckIn(); };

  const energyLevels = [
    ["crashed", "😴", "Crashed", "No energy. Rest is okay."],
    ["verylow", "🥱", "Very low", "Moving slow. Doing what I can."],
    ["gettingby", "😐", "Getting by", "Not great, not terrible."],
    ["good", "😊", "Good energy", "Feeling pretty solid today."],
    ["great", "🌟", "Great energy", "Let's go! Feeling strong."],
  ];

  const affirmations = {
    crashed: "Rest is not giving up — it's taking care of yourself. 💚",
    verylow: "Moving slow is still moving. 💛",
  };

  return (
    <div>
      <SectionTitle>⚡ Energy & Pain</SectionTitle>
      <Card>
        <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 10 }}>Energy level</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {energyLevels.map(([id, emoji, label, desc]) => (
            <TapButton key={id} active={energy === id} onClick={() => update({ energy: id })}
              style={{ textAlign: "left", fontSize: 14 }}>
              {emoji} <strong>{label}</strong> — {desc}
            </TapButton>
          ))}
        </div>
        {energy && affirmations[energy] && (
          <p style={{ fontSize: 14, color: COLORS.primary, fontWeight: 600, marginTop: 8 }}>{affirmations[energy]}</p>
        )}
      </Card>

      <Card>
        <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 10 }}>Pain level (1-5)</p>
        <div style={{ display: "flex", gap: 8 }}>
          {[1, 2, 3, 4, 5].map(n => (
            <TapButton key={n} active={pain === n} onClick={() => update({ pain: n })}
              color={n >= 4 ? COLORS.red : COLORS.primary} bg={n >= 4 ? COLORS.redBg : COLORS.primaryLight}
              style={{ flex: 1, fontSize: 16 }}>{n}</TapButton>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: COLORS.textLight, marginTop: 4 }}>
          <span>No pain</span><span>Severe</span>
        </div>
        {pain >= 4 && <p style={{ fontSize: 14, color: COLORS.accent, fontWeight: 600, marginTop: 8 }}>Hard day. You still showed up. That counts. ❤️</p>}
      </Card>

      {(energy === "crashed" || energy === "verylow") && (
        <Card>
          <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 10 }}>Did something trigger this crash?</p>
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <TapButton active={crash.triggered === true} onClick={() => update({ crash: { ...crash, triggered: true } })}>Yes</TapButton>
            <TapButton active={crash.triggered === false} onClick={() => update({ crash: { ...crash, triggered: false } })}>No</TapButton>
          </div>
          {crash.triggered && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {CRASH_TRIGGERS.map(t => (
                <TapButton key={t} active={(crash.triggers || []).includes(t)}
                  onClick={() => {
                    const cur = crash.triggers || [];
                    const next = cur.includes(t) ? cur.filter(x => x !== t) : [...cur, t];
                    update({ crash: { ...crash, triggers: next } });
                  }}
                  style={{ fontSize: 12, padding: "6px 10px" }}>{t}</TapButton>
              ))}
            </div>
          )}
        </Card>
      )}

      <Card>
        <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 10 }}>Hours of rest today (including sleep)</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {[0, 2, 4, 6, 8, 10, 12, 14, 16].map(n => (
            <TapButton key={n} active={rest === n} onClick={() => update({ rest: n })}
              style={{ fontSize: 13, padding: "6px 10px" }}>{n}h</TapButton>
          ))}
        </div>
      </Card>

      <Card>
        <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 10 }}>Did you try to do something active today?</p>
        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
          <TapButton active={activity.attempted === true} onClick={() => update({ activity: { ...activity, attempted: true } })}>Yes</TapButton>
          <TapButton active={activity.attempted === false} onClick={() => update({ activity: { ...activity, attempted: false } })}>No</TapButton>
        </div>
        {activity.attempted && (
          <>
            <p style={{ fontSize: 14, color: COLORS.textLight, marginBottom: 8 }}>How did your body handle it?</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {[["fine", "Fine"], ["crashed", "Okay at first but crashed later"], ["toomuch", "Too much"]].map(([id, label]) => (
                <TapButton key={id} active={activity.tolerance === id} onClick={() => update({ activity: { ...activity, tolerance: id } })}
                  style={{ fontSize: 12, padding: "6px 10px" }}>{label}</TapButton>
              ))}
            </div>
          </>
        )}
      </Card>
    </div>
  );
}

function WaterTracker({ dailyData, updateDaily, doCheckIn }) {
  const water = dailyData?.water || 0;

  const update = async (n) => { await updateDaily({ water: Math.max(0, n) }); if (n > 0) doCheckIn(); };

  return (
    <div>
      <SectionTitle>💧 Water</SectionTitle>
      <Card style={{ textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} onClick={() => update(i + 1)} style={{
              width: 40, height: 40, borderRadius: "50%", cursor: "pointer",
              background: i < water ? COLORS.blue : "#f0ebe5",
              border: `2px solid ${i < water ? COLORS.blue : "#e0d8d0"}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, transition: "all 0.2s"
            }}>{i < water ? "💧" : ""}</div>
          ))}
        </div>
        <p style={{ fontSize: 16, fontWeight: 700, color: COLORS.blue, marginBottom: 12 }}>{water} / 8 glasses</p>
        <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
          <button onClick={() => update(water + 1)} style={btnStyle(COLORS.blue, "white")}>+ Add</button>
          <button onClick={() => update(water - 1)} style={btnStyle("#f0ebe5", COLORS.textLight)}>- Undo</button>
        </div>
        {water >= 8 && (
          <p style={{ fontSize: 15, fontWeight: 700, color: COLORS.green, marginTop: 12 }}>🎉 You hit your water goal!</p>
        )}
      </Card>
    </div>
  );
}

function SensoryTracker({ dailyData, updateDaily, doCheckIn }) {
  const sensory = dailyData?.sensory || {};
  const levels = [
    [1, "😌", "Calm", "Everything feels manageable"],
    [2, "😐", "A little busy", "Some things are bothering me"],
    [3, "😣", "Overloaded", "Too much noise / light / touch / people"],
    [4, "🤯", "Shutting down", "I need to get somewhere quiet"],
    [5, "💥", "Meltdown zone", "Everything is too much right now"],
  ];

  const update = async (patch) => { await updateDaily({ sensory: { ...sensory, ...patch } }); doCheckIn(); };

  return (
    <div>
      <SectionTitle>😌 Sensory Load</SectionTitle>
      <Card>
        <p style={{ fontSize: 14, color: COLORS.textLight, marginBottom: 10 }}>How overloaded do your senses feel right now?</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {levels.map(([n, emoji, label, desc]) => (
            <TapButton key={n} active={sensory.level === n} onClick={() => update({ level: n })}
              color={n >= 4 ? COLORS.red : COLORS.primary} bg={n >= 4 ? COLORS.redBg : COLORS.primaryLight}
              style={{ textAlign: "left", fontSize: 13 }}>
              {emoji} <strong>{label}</strong> — {desc}
            </TapButton>
          ))}
        </div>
      </Card>

      {sensory.level >= 4 && (
        <Card style={{ background: COLORS.redBg }}>
          <p style={{ fontSize: 15, fontWeight: 600, color: COLORS.red, marginBottom: 4 }}>
            Can you get to a quiet place? Try closing your eyes for 30 seconds. Put on headphones with no music — just quiet.
          </p>
        </Card>
      )}

      {sensory.level && (
        <Card>
          <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>What's bothering you most?</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {SENSORY_BOTHERS.map(b => (
              <TapButton key={b} active={(sensory.bothering || []).includes(b)}
                onClick={() => {
                  const cur = sensory.bothering || [];
                  update({ bothering: cur.includes(b) ? cur.filter(x => x !== b) : [...cur, b] });
                }}
                style={{ fontSize: 12, padding: "6px 10px" }}>{b}</TapButton>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function WeeklyScreening({ dailyData, profile, saveProfile }) {
  const [maniaAnswers, setManiaAnswers] = useState({});
  const [schizoAnswers, setSchizoAnswers] = useState({});
  const [saved, setSaved] = useState(false);

  const setMania = (i, val) => setManiaAnswers(prev => ({ ...prev, [i]: val }));
  const setSchizo = (i, val) => setSchizoAnswers(prev => ({ ...prev, [i]: val }));

  const maniaYes = Object.values(maniaAnswers).filter(v => v === "yes").length;
  const schizoYes = Object.values(schizoAnswers).filter(v => v === "yes").length;

  const saveScreening = async () => {
    await storage.set(`diana-weekly:${weekKey()}`, { mania: maniaAnswers, schizoaffective: schizoAnswers, date: today() });
    setSaved(true);
  };

  return (
    <div>
      <SectionTitle>🔍 Weekly Mood Check</SectionTitle>
      <Card>
        <p style={{ fontSize: 14, color: COLORS.textLight, marginBottom: 12 }}>
          These questions help you and your team spot shifts early. No wrong answers.
        </p>
        {MANIA_QUESTIONS.map((q, i) => (
          <div key={i} style={{ marginBottom: 12 }}>
            <p style={{ fontSize: 14, marginBottom: 6 }}>{q}</p>
            <div style={{ display: "flex", gap: 6 }}>
              {["yes", "sometimes", "no"].map(v => (
                <TapButton key={v} active={maniaAnswers[i] === v} onClick={() => setMania(i, v)}
                  color={v === "yes" ? COLORS.yellow : COLORS.primary} bg={v === "yes" ? COLORS.yellowBg : COLORS.primaryLight}
                  style={{ flex: 1, fontSize: 12, padding: "6px 4px" }}>{v}</TapButton>
              ))}
            </div>
          </div>
        ))}
      </Card>

      {maniaYes >= 3 && (
        <Card style={{ background: COLORS.yellowBg }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: COLORS.yellow }}>
            💛 Some of these can be signs that your mood is shifting up. That doesn't mean something is wrong — but it's worth talking to your support team this week.
          </p>
        </Card>
      )}
      {Object.keys(maniaAnswers).length === MANIA_QUESTIONS.length && maniaYes < 3 && (
        <Card style={{ background: COLORS.greenBg }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: COLORS.green }}>Everything looks steady this week. Nice. 💚</p>
        </Card>
      )}

      {profile?.schizoModule && (
        <>
          <SectionTitle>🧠 Brain Check</SectionTitle>
          <Card>
            <p style={{ fontSize: 14, color: COLORS.textLight, marginBottom: 12 }}>
              Let's check in on how your brain is doing. Just notice — no judgment.
            </p>
            {SCHIZOAFFECTIVE_QUESTIONS.map((q, i) => (
              <div key={i} style={{ marginBottom: 12 }}>
                <p style={{ fontSize: 14, marginBottom: 6 }}>{q}</p>
                <div style={{ display: "flex", gap: 6 }}>
                  {["yes", "sometimes", "no"].map(v => (
                    <TapButton key={v} active={schizoAnswers[i] === v} onClick={() => setSchizo(i, v)}
                      style={{ flex: 1, fontSize: 12, padding: "6px 4px" }}>{v}</TapButton>
                  ))}
                </div>
              </div>
            ))}
            {schizoYes >= 2 && (
              <div style={{ background: COLORS.yellowBg, borderRadius: 14, padding: 12, marginTop: 8 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: COLORS.yellow }}>
                  💛 Some of these can happen when your brain is under extra stress. It's a good idea to let your doctor or therapist know.
                </p>
              </div>
            )}
          </Card>
        </>
      )}

      {!saved ? (
        <button onClick={saveScreening} style={{ ...btnStyle(), width: "100%" }}>Save Weekly Check ✅</button>
      ) : (
        <div style={{ textAlign: "center", padding: 12, fontSize: 15, fontWeight: 700, color: COLORS.green }}>✅ Saved!</div>
      )}
    </div>
  );
}

// ─── Puppy Tab ──────────────────────────────────────────────────────────────

function PuppyTab({ dailyData, updateDaily, profile, saveProfile, doCheckIn }) {
  const phase = profile?.puppyPhase || 1;
  const pData = PUPPY_PHASES[phase];
  const puppies = dailyData?.puppies || {};
  const [activeDog, setActiveDog] = useState("apollo");
  const tipIdx = Math.floor(Date.now() / 86400000) % PUPPY_TIPS.length;

  // Get today's subset of skills
  const dayNum = Math.floor(Date.now() / 86400000);
  const getSkills = (dog) => {
    let skills = [...pData.both];
    if (dog === "apollo") skills = [...skills, ...pData.apolloOnly];
    if (dog === "artemis") skills = [...skills, ...pData.artemisOnly];
    // Rotate subset
    const daily = [];
    for (let i = 0; i < pData.dailyCount && i < skills.length; i++) {
      daily.push(skills[(dayNum + i) % skills.length]);
    }
    return daily;
  };

  const dogData = puppies[activeDog] || {};
  const skills = dogData.skills || {};

  const toggleSkill = async (skill) => {
    const next = { ...skills, [skill]: !skills[skill] };
    await updateDaily({
      puppies: { ...puppies, [activeDog]: { ...dogData, skills: next } }
    });
    doCheckIn();
  };

  const setTrainer = async (t) => {
    await updateDaily({
      puppies: { ...puppies, [activeDog]: { ...dogData, trainer: t } }
    });
  };

  const [notes, setNotes] = useState(dogData.notes || "");
  const saveNotes = async () => {
    await updateDaily({
      puppies: { ...puppies, [activeDog]: { ...dogData, notes } }
    });
  };

  // Trigger log for Apollo
  const [triggerText, setTriggerText] = useState("");
  const [triggerLevel, setTriggerLevel] = useState(0);
  const addTrigger = async () => {
    if (!triggerText) return;
    const triggers = dogData.triggers || [];
    triggers.push({ text: triggerText, level: triggerLevel, time: new Date().toISOString() });
    await updateDaily({
      puppies: { ...puppies, apollo: { ...dogData, triggers } }
    });
    setTriggerText(""); setTriggerLevel(0);
  };

  // Phase advancement
  const phaseStart = profile?.puppyPhaseStart || today();
  const weeksIn = Math.floor((Date.now() - new Date(phaseStart).getTime()) / (7 * 86400000));
  const canAdvance = (phase === 1 && weeksIn >= 4) || (phase === 2 && weeksIn >= 6);

  const advancePhase = async () => {
    if (phase < 3) await saveProfile({ ...profile, puppyPhase: phase + 1, puppyPhaseStart: today() });
  };

  return (
    <div>
      <SectionTitle>🐾 Puppy Training</SectionTitle>
      <Card style={{ background: COLORS.primaryLight, padding: 12 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: COLORS.primary }}>{pData.label}</p>
        <p style={{ fontSize: 12, color: COLORS.textLight }}>💡 {PUPPY_TIPS[tipIdx]}</p>
      </Card>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <TapButton active={activeDog === "apollo"} onClick={() => setActiveDog("apollo")} style={{ flex: 1 }}>
          🐾 Apollo
        </TapButton>
        <TapButton active={activeDog === "artemis"} onClick={() => setActiveDog("artemis")} style={{ flex: 1 }}>
          ⭐ Artemis
        </TapButton>
      </div>

      <Card>
        <p style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>
          {activeDog === "apollo" ? "🐾 Apollo" : "⭐ Artemis"} — Today's Skills
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {getSkills(activeDog).map(skill => (
            <button key={skill} onClick={() => toggleSkill(skill)} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              background: skills[skill] ? COLORS.greenBg : "#faf6f2",
              border: `1.5px solid ${skills[skill] ? COLORS.green : "#ede7e1"}`,
              borderRadius: 12, padding: "8px 12px", cursor: "pointer", fontFamily: "'Nunito', sans-serif"
            }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{skill}</span>
              <span>{skills[skill] ? "✅" : "⬜"}</span>
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Who trained today?</p>
        <div style={{ display: "flex", gap: 6 }}>
          {["Diana", "Luis", "Both"].map(t => (
            <TapButton key={t} active={dogData.trainer === t} onClick={() => setTrainer(t)}
              style={{ flex: 1, fontSize: 13 }}>{t}</TapButton>
          ))}
        </div>
      </Card>

      {activeDog === "apollo" && phase >= 2 && (
        <Card>
          <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Apollo Trigger Log</p>
          <input value={triggerText} onChange={e => setTriggerText(e.target.value)}
            placeholder="What was the trigger?"
            style={{ width: "100%", padding: "8px 12px", borderRadius: 12, border: "1.5px solid #ede7e1", fontSize: 14, fontFamily: "'Nunito', sans-serif", marginBottom: 8 }}
          />
          <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
            {[1, 2, 3, 4, 5].map(n => (
              <TapButton key={n} active={triggerLevel === n} onClick={() => setTriggerLevel(n)}
                style={{ flex: 1, fontSize: 14 }}>{n}</TapButton>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: COLORS.textLight, marginBottom: 8 }}>
            <span>Mild</span><span>Big reaction</span>
          </div>
          <button onClick={addTrigger} style={btnStyle()}>Log Trigger</button>
          {(dogData.triggers || []).map((t, i) => (
            <p key={i} style={{ fontSize: 12, color: COLORS.textLight, marginTop: 4 }}>{t.text} — level {t.level}</p>
          ))}
        </Card>
      )}

      <Card>
        <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>Notes</p>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} onBlur={saveNotes}
          placeholder="How did it go? (voice-to-text works)"
          style={{ width: "100%", minHeight: 60, borderRadius: 12, border: "1.5px solid #ede7e1", padding: 10, fontSize: 14, fontFamily: "'Nunito', sans-serif", resize: "vertical" }}
        />
      </Card>

      {canAdvance && phase < 3 && (
        <button onClick={advancePhase} style={{ ...btnStyle(COLORS.accent, "white"), width: "100%", marginBottom: 16 }}>
          Move to Phase {phase + 1} →
        </button>
      )}
    </div>
  );
}

// ─── Week Tab ───────────────────────────────────────────────────────────────

function WeekTab({ profile }) {
  const [weekData, setWeekData] = useState([]);
  const [patterns, setPatterns] = useState([]);

  useEffect(() => {
    (async () => {
      const days = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        const data = await storage.get(`diana-daily:${key}`);
        days.push({ date: key, day: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getDay()], data: data || {} });
      }
      setWeekData(days);

      // Pattern detection
      const p = [];
      const energyDays = days.filter(d => d.data.energy);
      const crashDays = days.filter(d => d.data.energy === "crashed" || d.data.energy === "verylow");

      // Crash after high activity
      let crashAfterPush = 0;
      for (let i = 1; i < days.length; i++) {
        if ((days[i].data.energy === "crashed" || days[i].data.energy === "verylow") && days[i - 1].data.activity?.attempted) {
          crashAfterPush++;
        }
      }
      if (crashAfterPush >= 2) p.push("You've crashed after active days a few times. Your body might need more rest after pushing hard. 💛");

      // Sleep-mood
      const lowSleepRedCircle = days.filter(d => d.data.sleep?.hoursSlept < 6 && (d.data.circles === "middle" || d.data.circles === "inner"));
      if (lowSleepRedCircle.length >= 2) p.push("When you sleep less than 6 hours, your circles tend toward yellow or red. Sleep matters. 💤");

      // Pain-sleep
      const painAfterBadSleep = days.filter(d => d.data.sleep?.hoursSlept < 6 && d.data.pain >= 3);
      if (painAfterBadSleep.length >= 2) p.push("Your pain has been higher on days you slept less. 💛");

      // Sensory-crash
      let sensoryToCrash = 0;
      for (let i = 1; i < days.length; i++) {
        if (days[i - 1].data.sensory?.level >= 3 && (days[i].data.energy === "crashed" || days[i].data.energy === "verylow")) sensoryToCrash++;
      }
      if (sensoryToCrash >= 2) p.push("Sensory overload days seem to lead to crashes the next day. 😌");

      // DBT streak
      const dbtDays = days.filter(d => d.data.dbt?.practiced).length;
      if (dbtDays >= 5) p.push(`You practiced DBT skills ${dbtDays} out of 7 days. That's building a real habit. 🧠`);

      // Meds
      const medDays = days.filter(d => d.data.meds?.morning === "yes" || d.data.meds?.evening === "yes").length;
      if (medDays >= 7) p.push("You've taken your meds every day this week. That matters more than you know. 💊");

      // Urge patterns
      const eveningUrges = days.flatMap(d => (d.data.urges || []).filter(u => new Date(u.timestamp).getHours() >= 17)).length;
      const totalUrges = days.flatMap(d => d.data.urges || []).length;
      if (totalUrges >= 3 && eveningUrges / totalUrges > 0.6) p.push("Most of your urges happened in the evening. That's useful to know. 🌙");

      // Positive streaks
      const circleGreen = days.filter(d => d.data.circles === "outer").length;
      if (circleGreen >= 5) p.push(`${circleGreen} green circle days this week. That's real progress. 💚`);

      // Puppy
      const apolloDays = days.filter(d => d.data.puppies?.apollo).length;
      if (apolloDays >= 4) p.push(`Apollo trained ${apolloDays} days this week — that consistency matters! 🐾`);

      setPatterns(p);
    })();
  }, []);

  const circleColor = { outer: COLORS.green, middle: COLORS.yellow, inner: COLORS.red };
  const energyEmoji = { crashed: "😴", verylow: "🥱", gettingby: "😐", good: "😊", great: "🌟" };

  return (
    <div>
      <SectionTitle>📊 Your Week</SectionTitle>

      {/* Grid */}
      <Card>
        <div style={{ overflowX: "auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: `80px repeat(${weekData.length}, 1fr)`, gap: 4, fontSize: 11, minWidth: 400 }}>
            <div></div>
            {weekData.map(d => (
              <div key={d.date} style={{ textAlign: "center", fontWeight: 700, fontSize: 12 }}>
                {d.day}<br /><span style={{ fontWeight: 400, fontSize: 10, color: COLORS.textLight }}>{d.date.slice(5)}</span>
              </div>
            ))}

            <div style={{ fontWeight: 600 }}>Circle</div>
            {weekData.map(d => (
              <div key={d.date} style={{ textAlign: "center" }}>
                <div style={{ width: 20, height: 20, borderRadius: "50%", background: d.data.circles ? circleColor[d.data.circles] : "#e0d8d0", margin: "0 auto" }}></div>
              </div>
            ))}

            <div style={{ fontWeight: 600 }}>Energy</div>
            {weekData.map(d => <div key={d.date} style={{ textAlign: "center", fontSize: 16 }}>{d.data.energy ? energyEmoji[d.data.energy] : "—"}</div>)}

            <div style={{ fontWeight: 600 }}>Pain</div>
            {weekData.map(d => <div key={d.date} style={{ textAlign: "center" }}>{d.data.pain || "—"}</div>)}

            <div style={{ fontWeight: 600 }}>Sleep</div>
            {weekData.map(d => <div key={d.date} style={{ textAlign: "center" }}>{d.data.sleep?.hoursSlept ? `${d.data.sleep.hoursSlept}h` : "—"}</div>)}

            <div style={{ fontWeight: 600 }}>Water</div>
            {weekData.map(d => <div key={d.date} style={{ textAlign: "center" }}>{d.data.water || "—"}</div>)}

            <div style={{ fontWeight: 600 }}>Meds</div>
            {weekData.map(d => <div key={d.date} style={{ textAlign: "center" }}>{(d.data.meds?.morning === "yes" || d.data.meds?.evening === "yes") ? "✅" : "—"}</div>)}

            <div style={{ fontWeight: 600 }}>DBT</div>
            {weekData.map(d => <div key={d.date} style={{ textAlign: "center" }}>{d.data.dbt?.practiced ? "✅" : "—"}</div>)}

            <div style={{ fontWeight: 600 }}>Sensory</div>
            {weekData.map(d => <div key={d.date} style={{ textAlign: "center" }}>{d.data.sensory?.level || "—"}</div>)}

            <div style={{ fontWeight: 600 }}>Urges</div>
            {weekData.map(d => <div key={d.date} style={{ textAlign: "center" }}>{(d.data.urges || []).length || "—"}</div>)}

            <div style={{ fontWeight: 600 }}>Puppies</div>
            {weekData.map(d => <div key={d.date} style={{ textAlign: "center" }}>{(d.data.puppies?.apollo || d.data.puppies?.artemis) ? "✅" : "—"}</div>)}
          </div>
        </div>
      </Card>

      {/* Patterns */}
      {patterns.length > 0 && (
        <Card>
          <SectionTitle>Patterns this week</SectionTitle>
          {patterns.map((p, i) => (
            <div key={i} style={{ fontSize: 14, lineHeight: 1.5, marginBottom: 8, padding: "8px 12px", background: COLORS.primaryLight, borderRadius: 12 }}>
              {p}
            </div>
          ))}
        </Card>
      )}
      {patterns.length === 0 && weekData.filter(d => Object.keys(d.data).length > 0).length < 3 && (
        <Card style={{ background: COLORS.primaryLight, textAlign: "center" }}>
          <p style={{ fontSize: 14, color: COLORS.primary }}>Keep checking in! After a few more days, patterns will start to appear here. 💚</p>
        </Card>
      )}
    </div>
  );
}

// ─── Crisis Toolkit ─────────────────────────────────────────────────────────

function CrisisToolkit({ profile, onClose }) {
  const [view, setView] = useState("menu");
  const [breathPhase, setBreathPhase] = useState(0);
  const breathRef = useRef(null);

  const startBreathing = () => {
    setView("breathe");
    let phase = 0;
    breathRef.current = setInterval(() => {
      phase = (phase + 1) % 4;
      setBreathPhase(phase);
    }, 4000);
  };

  useEffect(() => () => { if (breathRef.current) clearInterval(breathRef.current); }, []);

  const breathLabels = ["Breathe in...", "Hold...", "Breathe out...", "Hold..."];

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000, background: COLORS.bg,
      overflowY: "auto", fontFamily: "'Nunito', sans-serif", color: COLORS.text
    }}>
      <div style={{ padding: 20, maxWidth: 430, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800 }}>❤️‍🩹 You're Safe Here</h1>
          <button onClick={() => { if (breathRef.current) clearInterval(breathRef.current); onClose(); }}
            style={{ background: "none", border: "none", fontSize: 24, cursor: "pointer" }}>✕</button>
        </div>

        {view === "menu" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <CrisisCard emoji="🌍" title="Grounding — 5-4-3-2-1" onClick={() => setView("ground")} />
            <CrisisCard emoji="🫁" title="Box Breathing" onClick={startBreathing} />
            <CrisisCard emoji="🧊" title="TIPP — Ice Dive" onClick={() => setView("tipp")} />
            <CrisisCard emoji="🌊" title="Urge Surfing" onClick={() => setView("surf")} />
            <CrisisCard emoji="📞" title="Call Someone" onClick={() => setView("call")} />

            <Card style={{ background: COLORS.accentLight, textAlign: "center" }}>
              <p style={{ fontSize: 16, fontWeight: 700, color: COLORS.accent }}>
                You are not your worst moment. You are here. You are trying. That is enough right now. ❤️
              </p>
            </Card>
          </div>
        )}

        {view === "ground" && (
          <div>
            <button onClick={() => setView("menu")} style={{ background: "none", border: "none", fontSize: 14, color: COLORS.primary, fontWeight: 600, cursor: "pointer", marginBottom: 12 }}>← Back</button>
            <Card>
              <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12 }}>🌍 Grounding — 5-4-3-2-1</h2>
              <p style={{ fontSize: 16, lineHeight: 1.8 }}>Look around you. Find:</p>
              <div style={{ fontSize: 18, lineHeight: 2.2, marginTop: 8 }}>
                <div><strong>5</strong> things you can <strong>see</strong> 👀</div>
                <div><strong>4</strong> things you can <strong>touch</strong> ✋</div>
                <div><strong>3</strong> things you can <strong>hear</strong> 👂</div>
                <div><strong>2</strong> things you can <strong>smell</strong> 👃</div>
                <div><strong>1</strong> thing you can <strong>taste</strong> 👅</div>
              </div>
            </Card>
          </div>
        )}

        {view === "breathe" && (
          <div>
            <button onClick={() => { clearInterval(breathRef.current); setView("menu"); }} style={{ background: "none", border: "none", fontSize: 14, color: COLORS.primary, fontWeight: 600, cursor: "pointer", marginBottom: 12 }}>← Back</button>
            <Card style={{ textAlign: "center", paddingTop: 32, paddingBottom: 32 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 24 }}>🫁 Box Breathing</h2>
              <div style={{
                width: 120, height: 120, borderRadius: "50%", margin: "0 auto 20px",
                background: COLORS.primaryLight, border: `3px solid ${COLORS.primary}`,
                animation: "breatheIn 16s infinite", display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: COLORS.primary }}>{breathLabels[breathPhase]}</span>
              </div>
              <p style={{ fontSize: 14, color: COLORS.textLight }}>4 seconds each. Just watch and follow.</p>
            </Card>
          </div>
        )}

        {view === "tipp" && (
          <div>
            <button onClick={() => setView("menu")} style={{ background: "none", border: "none", fontSize: 14, color: COLORS.primary, fontWeight: 600, cursor: "pointer", marginBottom: 12 }}>← Back</button>
            <Card>
              <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12 }}>🧊 TIPP — Ice Dive</h2>
              <p style={{ fontSize: 16, lineHeight: 1.8 }}>
                Fill a bowl with cold water. Hold your breath. Put your face in for 15-30 seconds.
              </p>
              <p style={{ fontSize: 14, color: COLORS.textLight, marginTop: 8 }}>
                This activates your dive reflex and calms your whole nervous system fast.
              </p>
            </Card>
          </div>
        )}

        {view === "surf" && (
          <div>
            <button onClick={() => setView("menu")} style={{ background: "none", border: "none", fontSize: 14, color: COLORS.primary, fontWeight: 600, cursor: "pointer", marginBottom: 12 }}>← Back</button>
            <Card>
              <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12 }}>🌊 Urge Surfing</h2>
              <p style={{ fontSize: 16, lineHeight: 1.8 }}>
                The urge is a wave. It gets bigger, peaks, and then it goes down.
              </p>
              <p style={{ fontSize: 16, lineHeight: 1.8, marginTop: 8 }}>
                You don't have to act on it. Just notice it. Where do you feel it in your body?
              </p>
              <p style={{ fontSize: 16, lineHeight: 1.8, marginTop: 8 }}>
                Breathe into that spot. The wave is already starting to fall. You're riding it. You're okay.
              </p>
            </Card>
          </div>
        )}

        {view === "call" && (
          <div>
            <button onClick={() => setView("menu")} style={{ background: "none", border: "none", fontSize: 14, color: COLORS.primary, fontWeight: 600, cursor: "pointer", marginBottom: 12 }}>← Back</button>
            <Card>
              <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16 }}>📞 Call Someone</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <CallButton emoji="💚" label="Call Kael" number={profile?.crisisContacts?.kael} />
                <CallButton emoji="💛" label="Call Luis" number={profile?.crisisContacts?.luis} />
                <CallButton emoji="📞" label="988 Suicide & Crisis Lifeline" number="988" />
                <div style={{ background: COLORS.card, borderRadius: 16, padding: 14, border: "1.5px solid #ede7e1" }}>
                  <div style={{ fontWeight: 700 }}>💬 Crisis Text Line</div>
                  <div style={{ fontSize: 14, color: COLORS.textLight }}>Text HOME to 741741</div>
                </div>
                <CallButton emoji="📞" label="SAMHSA Helpline" number="18006624357" />
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

function CrisisCard({ emoji, title, onClick }) {
  return (
    <button onClick={onClick} style={{
      background: COLORS.card, borderRadius: 20, padding: 16, border: "1.5px solid #ede7e1",
      display: "flex", alignItems: "center", gap: 12, cursor: "pointer", fontFamily: "'Nunito', sans-serif",
      width: "100%", textAlign: "left"
    }}>
      <span style={{ fontSize: 28 }}>{emoji}</span>
      <span style={{ fontSize: 16, fontWeight: 700 }}>{title}</span>
    </button>
  );
}

function CallButton({ emoji, label, number }) {
  return (
    <a href={number ? `tel:${number}` : "#"} style={{
      background: COLORS.card, borderRadius: 16, padding: 14, border: "1.5px solid #ede7e1",
      display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: COLORS.text
    }}>
      <span style={{ fontSize: 22 }}>{emoji}</span>
      <div>
        <div style={{ fontWeight: 700, fontSize: 15 }}>{label}</div>
        {number && <div style={{ fontSize: 13, color: COLORS.textLight }}>{number}</div>}
        {!number && <div style={{ fontSize: 13, color: COLORS.textLight }}>Tap to set number in settings</div>}
      </div>
    </a>
  );
}
