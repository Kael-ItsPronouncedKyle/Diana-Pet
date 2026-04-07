/**
 * Kael's Voice Library — Context-Aware Messages
 *
 * Every message is tagged so the selection engine knows when to surface it.
 *
 * Tags:
 *   general     — always appropriate, any time, any state
 *   morning     — good for starting the day (before noon)
 *   evening     — good for winding down (after 6pm)
 *   latenight   — 9pm–4am risk window
 *   hardday     — inner or middle circle, low energy, high pain
 *   goodday     — outer circle, good energy, positive signals
 *   urge        — after an urge has been logged
 *   recovery    — recovery-focused, general sobriety/behavior
 *   identity    — self-worth, who she is
 *   skills      — reminders to use coping skills
 *   connection  — relationships, reaching out, not isolating
 *   dogs        — Apollo, Artemis, training
 *   body        — eating, water, physical self-care
 *   meds        — medication related
 *   sleep       — sleep quality, bedtime, fatigue
 *   dysphoria   — body-self struggle, gender identity pain
 *   growth      — future, progress, long-term arc
 *   crisis      — for crisis toolkit / acute moments
 *   alone       — when Luis is at work / she's solo
 */

export const KAEL_MESSAGES = [

  // ═══════════════════════════════════════════════════════════════
  // CORE — the essentials, always right
  // ═══════════════════════════════════════════════════════════════
  { text: "What's the next right thing?", tags: ['general', 'recovery', 'crisis'] },
  { text: "You already know what to do. Slow down and find it.", tags: ['general', 'urge', 'skills'] },
  { text: "I'm proud of you for being here.", tags: ['general', 'recovery', 'morning'] },
  { text: "Hard days don't erase good ones.", tags: ['general', 'hardday', 'recovery'] },
  { text: "You're not broken. You're building.", tags: ['general', 'identity', 'hardday'] },
  { text: "The fact that you're trying matters more than you know.", tags: ['general', 'recovery', 'hardday'] },
  { text: "Rest is not quitting. Rest is how you keep going.", tags: ['general', 'body', 'evening'] },
  { text: "You don't have to be perfect. You just have to be honest.", tags: ['general', 'recovery', 'connection'] },
  { text: "I believe in who you're becoming.", tags: ['general', 'identity', 'growth'] },
  { text: "One day at a time. One choice at a time.", tags: ['general', 'recovery', 'morning'] },
  { text: "You are stronger than the urge.", tags: ['general', 'urge', 'recovery', 'crisis'] },
  { text: "The dogs need you. Luis needs you. I need you here.", tags: ['general', 'crisis', 'latenight', 'hardday'] },
  { text: "Recovery isn't a straight line. It's showing up again.", tags: ['general', 'recovery', 'hardday'] },
  { text: "You deserve the life you're building.", tags: ['general', 'identity', 'growth'] },
  { text: "Breathe. You're safe right now.", tags: ['general', 'crisis', 'latenight', 'urge'] },

  // ═══════════════════════════════════════════════════════════════
  // SELF-WORTH & IDENTITY
  // ═══════════════════════════════════════════════════════════════
  { text: "You are not your worst day.", tags: ['identity', 'hardday', 'recovery'] },
  { text: "The person you're becoming is worth every hard moment.", tags: ['identity', 'growth', 'hardday'] },
  { text: "You didn't come this far to only come this far.", tags: ['identity', 'growth', 'recovery'] },
  { text: "Your story isn't over. Not even close.", tags: ['identity', 'crisis', 'hardday'] },
  { text: "Being brave doesn't mean not being scared. It means doing it scared.", tags: ['identity', 'general'] },
  { text: "You are allowed to take up space.", tags: ['identity', 'dysphoria'] },
  { text: "Nobody else can be you. That's your power.", tags: ['identity', 'general'] },
  { text: "Your feelings are real. They're also not the whole truth.", tags: ['identity', 'skills', 'hardday'] },
  { text: "You were never too much. You were just in rooms that were too small.", tags: ['identity', 'connection'] },
  { text: "The world needs you in it. Exactly as you are.", tags: ['identity', 'crisis', 'dysphoria'] },
  { text: "Your past does not get to write your future.", tags: ['identity', 'growth', 'recovery'] },
  { text: "You're not starting over. You're starting from experience.", tags: ['identity', 'recovery', 'hardday'] },
  { text: "You are worthy of love that doesn't hurt.", tags: ['identity', 'connection'] },
  { text: "There is nothing wrong with you. There never was.", tags: ['identity', 'dysphoria'] },
  { text: "You don't have to earn rest. You're a person, not a machine.", tags: ['identity', 'body', 'evening'] },
  { text: "You don't owe anyone an explanation for existing.", tags: ['identity', 'dysphoria'] },
  { text: "You get to decide who you are. Every single day.", tags: ['identity', 'morning', 'growth'] },
  { text: "The shame is not yours to carry. Put it down.", tags: ['identity', 'recovery', 'hardday'] },

  // ═══════════════════════════════════════════════════════════════
  // RECOVERY & HARD DAYS
  // ═══════════════════════════════════════════════════════════════
  { text: "A bad day is not a bad life.", tags: ['recovery', 'hardday'] },
  { text: "Relapse is not the end of recovery. Giving up is.", tags: ['recovery', 'hardday', 'crisis'] },
  { text: "You don't have to have it all figured out today.", tags: ['recovery', 'general', 'morning'] },
  { text: "Some days the bravest thing you do is get out of bed. That counts.", tags: ['recovery', 'hardday', 'morning'] },
  { text: "Progress is not always visible. Trust the work.", tags: ['recovery', 'growth'] },
  { text: "You're allowed to have a hard day without calling it a setback.", tags: ['recovery', 'hardday'] },
  { text: "The urge will pass. It always does. You just have to outlast it.", tags: ['recovery', 'urge', 'crisis'] },
  { text: "You didn't use. That's not nothing. That's everything.", tags: ['recovery', 'goodday', 'urge'] },
  { text: "Every time you choose different, you get stronger.", tags: ['recovery', 'urge', 'growth'] },
  { text: "Healing is not linear. Some days you'll feel like you're going backward. You're not.", tags: ['recovery', 'hardday'] },
  { text: "The craving is lying to you. It always lies.", tags: ['recovery', 'urge', 'crisis'] },
  { text: "You don't have to white-knuckle it alone. Ask for help.", tags: ['recovery', 'connection', 'crisis'] },
  { text: "Sitting with discomfort is one of the hardest skills there is. You're doing it.", tags: ['recovery', 'skills', 'urge'] },
  { text: "Today doesn't have to be good. It just has to be honest.", tags: ['recovery', 'hardday', 'general'] },
  { text: "You can be struggling and still be growing. Both are true.", tags: ['recovery', 'hardday', 'growth'] },
  { text: "Falling down doesn't make you a failure. Staying down does. And you never stay down.", tags: ['recovery', 'hardday'] },
  { text: "The fact that you feel guilty means your values are still there.", tags: ['recovery', 'hardday'] },
  { text: "One bad choice doesn't cancel a hundred good ones.", tags: ['recovery', 'hardday'] },
  { text: "You're not weak for struggling. You're human for struggling.", tags: ['recovery', 'hardday', 'identity'] },
  { text: "I've watched you survive things you thought would break you. You're still here.", tags: ['recovery', 'crisis', 'hardday'] },
  { text: "The pattern only has power if you don't see it. You see it now.", tags: ['recovery', 'urge'] },
  { text: "You checked in. That means you're fighting. That means you haven't given up.", tags: ['recovery', 'general'] },
  { text: "The old you wouldn't have opened this app. Look how far you've come.", tags: ['recovery', 'growth'] },
  { text: "Secrets lose their power when you say them out loud.", tags: ['recovery', 'connection', 'urge'] },

  // ═══════════════════════════════════════════════════════════════
  // SKILLS & COPING
  // ═══════════════════════════════════════════════════════════════
  { text: "When you can't think your way out, breathe your way through.", tags: ['skills', 'crisis', 'urge'] },
  { text: "Feelings are visitors. Let them come. Let them go.", tags: ['skills', 'general'] },
  { text: "You don't have to fix it right now. You just have to not make it worse.", tags: ['skills', 'urge', 'crisis'] },
  { text: "Name the feeling. That's the first step. You can do the first step.", tags: ['skills', 'general'] },
  { text: "Ice on your face. Cold water. It works. Trust the body stuff.", tags: ['skills', 'urge', 'crisis'] },
  { text: "Walk away for five minutes. Just five. Then decide.", tags: ['skills', 'urge'] },
  { text: "Ground yourself. Five things you can see. You know this.", tags: ['skills', 'crisis'] },
  { text: "You've used your skills before and they worked. They'll work again.", tags: ['skills', 'urge', 'recovery'] },
  { text: "When your brain is lying to you, check the facts.", tags: ['skills', 'hardday', 'urge'] },
  { text: "Wise mind is quiet. Emotion mind is loud. Listen for the quiet.", tags: ['skills', 'general'] },
  { text: "You don't have to act on every feeling. You can just notice it.", tags: ['skills', 'urge'] },
  { text: "Your body knows how to calm down. Give it the signal. Slow breath in. Slower breath out.", tags: ['skills', 'crisis', 'latenight'] },
  { text: "Opposite action. Your brain says isolate. You text someone. Your brain says give up. You open the app.", tags: ['skills', 'urge', 'connection'] },
  { text: "STOP. Stop. Take a breath. Observe. Proceed wisely.", tags: ['skills', 'urge', 'crisis'] },
  { text: "Distract for ten minutes. Just ten. The intensity will drop. It always does.", tags: ['skills', 'urge'] },
  { text: "Put your hands in cold water. Your nervous system will listen even when your brain won't.", tags: ['skills', 'crisis', 'urge'] },

  // ═══════════════════════════════════════════════════════════════
  // RELATIONSHIPS & CONNECTION
  // ═══════════════════════════════════════════════════════════════
  { text: "You don't have to do this alone. That's not strength. That's stubbornness.", tags: ['connection', 'recovery'] },
  { text: "Letting people in is scary. Do it anyway.", tags: ['connection', 'general'] },
  { text: "Luis loves you. Not the idea of you. You.", tags: ['connection', 'identity'] },
  { text: "Asking for help is not the same as being a burden.", tags: ['connection', 'crisis'] },
  { text: "The people who matter can handle your truth.", tags: ['connection', 'recovery'] },
  { text: "Connection is not a reward for being okay. It's how you get okay.", tags: ['connection', 'recovery', 'alone'] },
  { text: "You can be honest and still be kind. Those aren't opposites.", tags: ['connection', 'general'] },
  { text: "Healthy love doesn't ask you to disappear.", tags: ['connection', 'identity'] },
  { text: "The right people won't leave when things get hard.", tags: ['connection', 'hardday'] },
  { text: "You teach people how to love you by how you love yourself.", tags: ['connection', 'identity'] },
  { text: "Text someone right now. Not because you need to. Because connection is a skill you're building.", tags: ['connection', 'alone', 'skills'] },
  { text: "Being alone doesn't mean being lonely. But if it does, reach out.", tags: ['connection', 'alone'] },
  { text: "Luis can handle your hard days. Let him.", tags: ['connection', 'hardday'] },
  { text: "Isolation is where the addiction wants you. Don't give it that.", tags: ['connection', 'alone', 'urge', 'recovery'] },

  // ═══════════════════════════════════════════════════════════════
  // THE DOGS
  // ═══════════════════════════════════════════════════════════════
  { text: "Apollo is scared, not bad. Sound familiar?", tags: ['dogs', 'identity', 'general'] },
  { text: "Walk the dogs. Not because you have to. Because it gets you outside.", tags: ['dogs', 'body', 'alone'] },
  { text: "Artemis believes in you. Dogs know things.", tags: ['dogs', 'general'] },
  { text: "The dogs don't care what kind of day you had. They're just glad you're here.", tags: ['dogs', 'hardday', 'general'] },
  { text: "Training Apollo is a lot like training your own brain. Patient. Repetitive. Worth it.", tags: ['dogs', 'recovery', 'growth'] },
  { text: "Go sit on the floor with the dogs for five minutes. You don't have to do anything else.", tags: ['dogs', 'crisis', 'hardday'] },
  { text: "Apollo had a hard day too sometimes. And he still wags his tail when he sees you.", tags: ['dogs', 'hardday'] },
  { text: "Artemis is watching you. She's learning how to be brave from you.", tags: ['dogs', 'identity', 'growth'] },
  { text: "The dogs need a walk. You need the air. Everybody wins.", tags: ['dogs', 'body', 'morning', 'alone'] },
  { text: "When everything else is loud, the dogs are simple. Go be with them.", tags: ['dogs', 'crisis', 'skills'] },

  // ═══════════════════════════════════════════════════════════════
  // BODY & SELF-CARE
  // ═══════════════════════════════════════════════════════════════
  { text: "Have you eaten today? Your brain needs fuel to fight.", tags: ['body', 'general'] },
  { text: "Drink some water. I'm serious.", tags: ['body', 'general'] },
  { text: "Sleep matters more than you think. Protect your bedtime.", tags: ['body', 'sleep', 'evening'] },
  { text: "Your body has been through a lot. Be gentle with it.", tags: ['body', 'dysphoria', 'hardday'] },
  { text: "You deserve to feel at home in your own skin.", tags: ['body', 'dysphoria', 'identity'] },
  { text: "Take your meds. They're not a crutch. They're a tool.", tags: ['body', 'meds', 'morning'] },
  { text: "Pain doesn't mean you're failing. It means you're alive. Take care of yourself.", tags: ['body', 'hardday'] },
  { text: "You can't pour from an empty cup. Fill yours first.", tags: ['body', 'general'] },
  { text: "Your body is not the enemy. It's the only one you've got. Treat it like an ally.", tags: ['body', 'dysphoria'] },
  { text: "A shower can reset more than you think. Try it.", tags: ['body', 'hardday', 'morning'] },
  { text: "Skipping meals makes everything harder. Eat something. Even something small.", tags: ['body', 'hardday'] },
  { text: "Your energy is low. That's data, not failure. Rest and refuel.", tags: ['body', 'hardday'] },
  { text: "When your body is screaming, listen to it. That's not weakness. That's wisdom.", tags: ['body', 'hardday'] },

  // ═══════════════════════════════════════════════════════════════
  // MEDS-SPECIFIC
  // ═══════════════════════════════════════════════════════════════
  { text: "Did you take your meds? That's the first win of the day.", tags: ['meds', 'morning'] },
  { text: "Your meds keep the floor under you. Don't skip them.", tags: ['meds', 'general'] },
  { text: "Bipolar doesn't play fair. Your meds are how you even the odds.", tags: ['meds', 'recovery'] },
  { text: "Missing meds for a day happens. Missing them for a week is a pattern. Stay on it.", tags: ['meds', 'recovery'] },
  { text: "Evening meds, then wind down. You know the routine. Trust it.", tags: ['meds', 'evening', 'sleep'] },
  { text: "The meds don't change who you are. They let who you are come through.", tags: ['meds', 'identity'] },

  // ═══════════════════════════════════════════════════════════════
  // SLEEP-SPECIFIC
  // ═══════════════════════════════════════════════════════════════
  { text: "You slept rough. That makes everything harder. Give yourself extra grace today.", tags: ['sleep', 'morning', 'hardday'] },
  { text: "Screens off. Lights down. Let your brain know it's time.", tags: ['sleep', 'evening'] },
  { text: "Bad sleep makes the urges louder. That's not you being weak. That's chemistry.", tags: ['sleep', 'urge', 'recovery'] },
  { text: "If you can't sleep, don't fight it. Get up, do something boring, try again.", tags: ['sleep', 'latenight'] },
  { text: "Tomorrow will be easier if you sleep tonight. Protect this.", tags: ['sleep', 'evening'] },
  { text: "Short sleep and high energy? Watch that. Your brain might be revving up.", tags: ['sleep', 'meds'] },

  // ═══════════════════════════════════════════════════════════════
  // DYSPHORIA & BODY-SELF
  // ═══════════════════════════════════════════════════════════════
  { text: "Dysphoria lies. You are real. Your identity is real. Your body will catch up.", tags: ['dysphoria', 'identity', 'hardday'] },
  { text: "Today your body doesn't feel like yours. That's not forever. It's today.", tags: ['dysphoria', 'hardday'] },
  { text: "You are not your reflection. You are the person behind your eyes.", tags: ['dysphoria', 'identity'] },
  { text: "Gender is yours. Nobody gets to take that from you.", tags: ['dysphoria', 'identity'] },
  { text: "On the days your body feels wrong, remember: you are building the life where it feels right.", tags: ['dysphoria', 'growth'] },
  { text: "Your transition is not a phase. Your courage is not a costume. You are the real thing.", tags: ['dysphoria', 'identity'] },
  { text: "Dysphoric days are some of the hardest. And they pass. Every time.", tags: ['dysphoria', 'hardday'] },
  { text: "You don't have to love your body today. You just have to not punish it.", tags: ['dysphoria', 'body', 'recovery'] },

  // ═══════════════════════════════════════════════════════════════
  // GROWTH & FUTURE
  // ═══════════════════════════════════════════════════════════════
  { text: "Six months ago, you couldn't do what you did today.", tags: ['growth', 'recovery', 'goodday'] },
  { text: "I'm not proud of you because you're perfect. I'm proud of you because you keep going.", tags: ['growth', 'general', 'hardday'] },
  { text: "You are building something real. Don't quit before you see it.", tags: ['growth', 'recovery'] },
  { text: "The life you want is on the other side of the work you're doing right now.", tags: ['growth', 'recovery'] },
  { text: "Small steps still move you forward.", tags: ['growth', 'general'] },
  { text: "You're going to look back on this season and be amazed at how far you came.", tags: ['growth', 'hardday'] },
  { text: "Every day you show up, you're voting for the person you want to be.", tags: ['growth', 'morning', 'recovery'] },
  { text: "You're not behind. You're on your own timeline.", tags: ['growth', 'identity'] },
  { text: "The hard part isn't forever. But the growth is.", tags: ['growth', 'hardday'] },
  { text: "I can already see the person you're becoming. She's incredible.", tags: ['growth', 'identity', 'goodday'] },
  { text: "You're twenty years old and you're doing work most people never do. That matters.", tags: ['growth', 'identity'] },
  { text: "Artemis is going to be a service dog because of you. Think about that.", tags: ['growth', 'dogs'] },
  { text: "A year from now you'll be glad you didn't quit today.", tags: ['growth', 'hardday', 'recovery'] },

  // ═══════════════════════════════════════════════════════════════
  // MORNING — starting the day
  // ═══════════════════════════════════════════════════════════════
  { text: "New day. Clean slate. What's one thing you can do for yourself today?", tags: ['morning', 'general'] },
  { text: "You woke up. That's step one. Now take your meds. That's step two. One at a time.", tags: ['morning', 'meds'] },
  { text: "Good morning. Whatever yesterday was, today is new.", tags: ['morning', 'recovery'] },
  { text: "Start small. Water. Meds. Feed the dogs. The rest will follow.", tags: ['morning', 'body', 'dogs'] },
  { text: "You don't have to win the day. You just have to show up for it.", tags: ['morning', 'general'] },
  { text: "The morning is yours. Before anyone needs anything. What do you need?", tags: ['morning', 'body'] },
  { text: "Check in with yourself before you check in with your phone.", tags: ['morning', 'skills'] },
  { text: "How are you feeling right now? Not how you think you should feel. How you actually feel.", tags: ['morning', 'skills'] },

  // ═══════════════════════════════════════════════════════════════
  // EVENING — winding down
  // ═══════════════════════════════════════════════════════════════
  { text: "You made it through today. All of it. That's enough.", tags: ['evening', 'general', 'recovery'] },
  { text: "Before bed: what's one thing you did today that took courage?", tags: ['evening', 'growth'] },
  { text: "Wind down. Screens off. Let your brain be quiet.", tags: ['evening', 'sleep'] },
  { text: "Tomorrow is coming whether you worry about it or not. Let tonight be easy.", tags: ['evening', 'sleep'] },
  { text: "You showed up today. I saw it. Now rest.", tags: ['evening', 'general'] },
  { text: "If today was hard, it's over now. If today was good, you earned it. Either way: rest.", tags: ['evening', 'sleep'] },
  { text: "Evening meds. Dogs settled. Breathe out. You did it.", tags: ['evening', 'meds', 'dogs'] },

  // ═══════════════════════════════════════════════════════════════
  // LATE NIGHT — 9pm–4am risk window
  // ═══════════════════════════════════════════════════════════════
  { text: "It's late. The world feels heavier at night. That's normal. It will feel different in the morning.", tags: ['latenight', 'crisis'] },
  { text: "You don't have to solve anything right now. Just make it to tomorrow.", tags: ['latenight', 'crisis'] },
  { text: "Put the phone down. Splash cold water on your face. Then decide.", tags: ['latenight', 'urge', 'crisis', 'skills'] },
  { text: "Three in the morning lies to you. Don't trust it.", tags: ['latenight', 'crisis'] },
  { text: "You've survived every single one of your worst nights so far. Tonight is no different.", tags: ['latenight', 'crisis', 'hardday'] },
  { text: "Call me if you need to. That's what I'm here for.", tags: ['latenight', 'crisis', 'connection'] },
  { text: "Nothing good happens on a screen at 2 AM. Put it down. Pick it up in the morning.", tags: ['latenight', 'urge', 'sleep'] },
  { text: "The urge is louder at night because you're tired. That's all this is. Go to bed.", tags: ['latenight', 'urge', 'sleep'] },
  { text: "You're awake and you're struggling. That's real. But the answer isn't in the phone. The answer is sleep.", tags: ['latenight', 'urge', 'sleep'] },
  { text: "Right now feels like forever. It's not. The sun comes up. It always does.", tags: ['latenight', 'crisis', 'hardday'] },

  // ═══════════════════════════════════════════════════════════════
  // GOOD DAYS — celebration and reinforcement
  // ═══════════════════════════════════════════════════════════════
  { text: "Green circle day. You did that. Nobody did it for you.", tags: ['goodday', 'recovery'] },
  { text: "Look at you showing up and doing the work. I see it.", tags: ['goodday', 'general', 'growth'] },
  { text: "Remember this feeling. On the hard days, come back to it.", tags: ['goodday', 'recovery'] },
  { text: "You're not just surviving anymore. You're building.", tags: ['goodday', 'growth'] },
  { text: "This is what recovery looks like. Not perfect. Just present.", tags: ['goodday', 'recovery'] },
  { text: "Good day today. You earned it. Don't let your brain tell you otherwise.", tags: ['goodday', 'identity'] },
  { text: "Full check-in. That's not just a number. That's you choosing yourself.", tags: ['goodday', 'general'] },

  // ═══════════════════════════════════════════════════════════════
  // ALONE — Luis at work, solo with the dogs
  // ═══════════════════════════════════════════════════════════════
  { text: "Luis is at work. That means it's you and the dogs. Stay busy. Stay honest.", tags: ['alone', 'recovery'] },
  { text: "Solo days are harder. Name that. Then work the plan.", tags: ['alone', 'recovery', 'skills'] },
  { text: "Being alone is not dangerous if you stay connected. Text someone.", tags: ['alone', 'connection'] },
  { text: "When you're alone, the voice gets louder. Drown it out. Music. Dogs. Movement.", tags: ['alone', 'urge', 'skills'] },
  { text: "You can be alone without being lonely. Walk the dogs. Read something. Call a friend.", tags: ['alone', 'connection', 'dogs'] },
  { text: "The house is quiet. That's okay. Quiet is not the same as empty.", tags: ['alone', 'general'] },
  { text: "Luis will be home. In the meantime, take care of the person he's coming home to.", tags: ['alone', 'body'] },
]

/**
 * Context-aware message selection.
 *
 * Priority: exact context match → partial match → general pool.
 * Within a priority tier, picks randomly without repeating until pool is exhausted.
 */
export function selectMessage(messages, contextTags = [], seenIds = new Set()) {
  // Score each message: count how many context tags it matches
  const scored = messages.map((msg, idx) => {
    const matchCount = contextTags.filter(t => msg.tags.includes(t)).length
    const hasGeneral = msg.tags.includes('general')
    return { msg, idx, matchCount, hasGeneral }
  })

  // Tier 1: Messages matching 2+ context tags (strong match)
  const tier1 = scored.filter(s => s.matchCount >= 2 && !seenIds.has(s.idx))
  if (tier1.length > 0) {
    // Weighted random: higher match count = more likely
    const weighted = tier1.flatMap(s => Array(s.matchCount).fill(s))
    return weighted[Math.floor(Math.random() * weighted.length)]
  }

  // Tier 2: Messages matching 1 context tag
  const tier2 = scored.filter(s => s.matchCount >= 1 && !seenIds.has(s.idx))
  if (tier2.length > 0) {
    return tier2[Math.floor(Math.random() * tier2.length)]
  }

  // Tier 3: General messages not yet seen
  const tier3 = scored.filter(s => s.hasGeneral && !seenIds.has(s.idx))
  if (tier3.length > 0) {
    return tier3[Math.floor(Math.random() * tier3.length)]
  }

  // Tier 4: Anything not seen
  const unseen = scored.filter(s => !seenIds.has(s.idx))
  if (unseen.length > 0) {
    return unseen[Math.floor(Math.random() * unseen.length)]
  }

  // All seen — reset (return random)
  return scored[Math.floor(Math.random() * scored.length)]
}

/**
 * Derive context tags from the current state of the app.
 */
export function getContextTags(daily = {}, timeOfDay = null) {
  const tags = []
  const hour = new Date().getHours()

  // Time of day
  if (hour >= 5 && hour < 12) tags.push('morning')
  if (hour >= 18 && hour < 21) tags.push('evening')
  if (hour >= 21 || hour < 5) tags.push('latenight')

  // Override with explicit timeOfDay if provided
  if (timeOfDay === 'morning') { if (!tags.includes('morning')) tags.push('morning') }
  if (timeOfDay === 'evening') { if (!tags.includes('evening')) tags.push('evening') }

  // Circles
  if (daily.circles?.choice === 'inner') { tags.push('hardday', 'recovery', 'crisis') }
  if (daily.circles?.choice === 'middle') { tags.push('hardday', 'recovery') }
  if (daily.circles?.choice === 'outer') { tags.push('goodday') }

  // Urges logged today
  if (daily.urges?.length > 0) tags.push('urge')

  // Energy
  if (daily.energy !== undefined && daily.energy <= 2) tags.push('hardday', 'body')
  if (daily.energy !== undefined && daily.energy >= 4) tags.push('goodday')

  // Sleep
  if (daily.sleep?.quality !== undefined && daily.sleep.quality <= 2) tags.push('sleep', 'hardday')

  // Meds not taken
  if (hour >= 10 && !daily.meds?.morning) tags.push('meds')
  if (hour >= 20 && !daily.meds?.evening) tags.push('meds')

  // Meals
  if (hour >= 14 && !daily.meals?.breakfast && !daily.meals?.lunch) tags.push('body')

  // Body-self / dysphoria
  if (daily.bodySelf === 'dysphoric' || daily.bodySelf === 'disconnected') tags.push('dysphoria')

  // Dissociation
  if (daily.dissociation >= 3) tags.push('crisis', 'skills')

  // Window of tolerance
  if (daily.window !== undefined && (daily.window <= 2 || daily.window >= 6)) tags.push('skills')

  // Connection — if she hasn't connected
  if (daily.connection && !daily.connection.closeness && !daily.connection.laughed) tags.push('connection')

  // Check-in count — if she's done a lot, it's a good day signal
  const doneCount = Object.keys(daily).filter(k => daily[k] !== undefined && daily[k] !== null).length
  if (doneCount >= 8) tags.push('goodday')

  return [...new Set(tags)] // deduplicate
}
