// ─────────────────────────────────────────────────────────────────────────────
// Identity Sprint — Habit Library
// Source: Sage H75 research + Craft H82 verbatim copy
// Phase 2: Admin Discovery Call Guide + Participant Prescription Display
// ─────────────────────────────────────────────────────────────────────────────

export type Domain =
  | 'health'
  | 'career'
  | 'creativity'
  | 'relationships'
  | 'learning'
  | 'wellbeing'
  | 'financial'

export type HabitEntry = {
  domain: Domain
  domainLabel: string
  domainEmoji: string
  habitName: string

  // Admin Discovery Call Guide fields (Craft H82 verbatim)
  whyItWorks: string          // "say this on the call"
  week1Minimum: string        // minimum viable version
  watchFor: string            // cluster/resistance signal
  identityAnchor: string      // most important line — highlighted in UI

  // Participant-facing prescription fields (Craft H82 verbatim)
  mechanism: string           // 2-sentence why it works (identity level)
  identityConnection: string  // "Someone who [identity_goal] starts here because..."
  week1Scope: string          // what week 1 looks like
  closingLine: string         // "You don't need to X. Just this. For now."

  // Sequencing note (for multi-domain)
  sequencingNote?: string
}

// ─── Domain keyword inference map ────────────────────────────────────────────
// Used to pre-select domain chip from identity_goal text (admin convenience)
export const DOMAIN_KEYWORDS: Record<Domain, string[]> = {
  health: ['health', 'fit', 'body', 'workout', 'exercise', 'sleep', 'eat', 'nutrition', 'gym', 'weight', 'run', 'sport', 'energy', 'recover'],
  career: ['career', 'work', 'job', 'professional', 'business', 'focus', 'productivity', 'deep work', 'skill', 'income', 'startup', 'leader', 'promotion'],
  creativity: ['creat', 'art', 'write', 'music', 'design', 'build', 'make', 'draw', 'paint', 'photo', 'film', 'blog', 'content', 'creative'],
  relationships: ['relationship', 'family', 'partner', 'friend', 'connect', 'present', 'love', 'social', 'community'],
  learning: ['learn', 'study', 'skill', 'read', 'knowledge', 'upskill', 'course', 'grow', 'improve', 'develop'],
  wellbeing: ['mental', 'wellbeing', 'anxiety', 'stress', 'mindful', 'peace', 'calm', 'reflect', 'journal', 'emotion', 'mood', 'happy'],
  financial: ['financ', 'money', 'sav', 'invest', 'debt', 'budget', 'wealth', 'income', 'spend'],
}

export function inferDomainFromGoal(identityGoal: string): Domain | null {
  const lower = identityGoal.toLowerCase()
  const scores: Record<Domain, number> = {
    health: 0, career: 0, creativity: 0, relationships: 0,
    learning: 0, wellbeing: 0, financial: 0,
  }
  for (const [domain, keywords] of Object.entries(DOMAIN_KEYWORDS) as [Domain, string[]][]) {
    for (const kw of keywords) {
      if (lower.includes(kw)) scores[domain]++
    }
  }
  const sorted = (Object.entries(scores) as [Domain, number][]).sort((a, b) => b[1] - a[1])
  return sorted[0][1] > 0 ? sorted[0][0] : null
}

// ─── Habit Library ────────────────────────────────────────────────────────────
// Verbatim from Craft H82 — do not paraphrase

export const HABIT_LIBRARY: Record<Domain, HabitEntry> = {
  health: {
    domain: 'health',
    domainLabel: 'Health',
    domainEmoji: '🏃',
    habitName: 'Consistent wake time',
    // Admin card copy
    whyItWorks: `"Your wake time is the anchor for every other system — sleep quality, energy, appetite, recovery. We start here because nothing else stacks reliably on top of bad sleep."`,
    week1Minimum: 'Within 30 min, 7 days. That\'s it. No bedtime yet.',
    watchFor: 'Health goals are almost always clusters. If they name sleep + nutrition + exercise simultaneously: "Let\'s sequence these. Sleep is first."',
    identityAnchor: '"What kind of body are you becoming? → Then: \'Someone who [X] starts here.\'"',
    sequencingNote: 'Start here if health domain. Sleep → Nutrition → Exercise (sequenced — cannot skip).',
    // Participant copy
    mechanism: `Your body's alertness, appetite, energy, and recovery all synchronise around a single anchor: when you wake up. Locking your wake time stabilises every system downstream — which is why it's the first habit, not the most obvious one.`,
    identityConnection: `Someone who is building a healthier body starts here, because sleep architecture is the foundation everything else depends on. You can't out-train bad sleep.`,
    week1Scope: `Pick a wake time. Hold it within 30 minutes — weekends included. That's it. No bedtime requirement, no tracking apps. Just a consistent wake time.`,
    closingLine: `You don't need to fix everything. Just this. For now.`,
  },

  career: {
    domain: 'career',
    domainLabel: 'Career',
    domainEmoji: '💼',
    habitName: '90-minute deep work block',
    whyItWorks: `"The work that actually moves your career only happens when the urgent work isn't competing with it. This block is how you protect your thinking."`,
    week1Minimum: 'Same time daily. One block. Block is held even if the task isn\'t perfect.',
    watchFor: '"I don\'t have 90 minutes." → Response: "What\'s the shortest block you could protect every day without exception?" (60 min is fine.)',
    identityAnchor: '"What kind of professional are you becoming? Not what do you want to do — who are you becoming?" → Name the habit after they answer.',
    mechanism: `Consistent cognitive output comes from protecting uninterrupted time — not willpower, not motivation, not better tools. A single daily block, started and protected the same way each day, builds the neural pattern that professional identity change requires.`,
    identityConnection: `Someone who is becoming the professional they want to be starts here, because the work that actually matters only happens when the work you've been asked to do isn't competing with it.`,
    week1Scope: `Block 90 minutes — same time each day. No notifications, no email. One meaningful piece of work. The task doesn't matter this week. Holding the block does.`,
    closingLine: `You don't need to overhaul your calendar. Just this. For now.`,
  },

  creativity: {
    domain: 'creativity',
    domainLabel: 'Creativity',
    domainEmoji: '🎨',
    habitName: '15 minutes creating before consuming',
    whyItWorks: `"Consuming first makes creating feel optional. Creating first makes consuming feel earned. It's a sequencing habit, not an inspiration habit."`,
    week1Minimum: '15 minutes. First thing. Anything counts — doesn\'t have to be good.',
    watchFor: 'If they have a strong "morning routine" already: check whether creating or consuming comes first. Often they consume (email, news) and feel stuck later. This is the reframe.',
    identityAnchor: '"What does someone who makes things for a living do first in the morning?"',
    mechanism: `The creative habit that's most resistant to formation is morning output before input. It feels counterintuitive — but the research is consistent: creation before consumption protects the generative state before external stimuli override it.`,
    identityConnection: `Someone who is building a creative practice starts here, because consuming first makes creating feel optional. Creating first makes consuming feel earned.`,
    week1Scope: `15 minutes of output — writing, drawing, building, composing — before opening email, social, or news. It doesn't have to be good. It just has to happen first.`,
    closingLine: `You don't need to produce a masterpiece. Just this. For now.`,
  },

  relationships: {
    domain: 'relationships',
    domainLabel: 'Relationships',
    domainEmoji: '🤝',
    habitName: '20 minutes of device-free presence',
    whyItWorks: `"People don't feel the hours you spend with them. They feel whether you were actually there. This is the simplest and most powerful relationship habit there is."`,
    week1Minimum: 'One person, 20 minutes, no devices. Conversation topic doesn\'t matter.',
    watchFor: 'This is a NO-cluster domain — one habit is enough. If they want to add more: "Let\'s get this one automatic first."',
    identityAnchor: '"Who do you want to be the kind of person for?"',
    mechanism: `Relationship quality correlates strongly with undivided attention — not with hours spent together. A short period of genuine presence every day does more for connection than hours spent in the same room on separate screens.`,
    identityConnection: `Someone who values deep relationships starts here, because presence is the only signal the people around you can actually feel.`,
    week1Scope: `Choose one person. 20 minutes. No devices — yours or theirs. The conversation can be about anything. The habit is being fully there.`,
    closingLine: `You don't need to fix every relationship. Just this. For now.`,
  },

  learning: {
    domain: 'learning',
    domainLabel: 'Learning',
    domainEmoji: '📚',
    habitName: '10 minutes of daily spaced repetition',
    whyItWorks: `"Spaced retrieval outperforms re-reading by 50–80% in retention. You're not spending more time — you're spending better time. 10 minutes of active recall beats 60 minutes of re-reading."`,
    week1Minimum: '10 minutes, daily. Active recall only — not re-reading. Anki, flashcards, or just closing the book and testing yourself.',
    watchFor: 'If they describe themselves as "bad at retaining things": that\'s the signal. They\'re consuming without retrieving. This habit is the fix.',
    identityAnchor: '"What would it feel like to actually know this — not just have read it?"',
    mechanism: `Spaced repetition is one of the most well-validated learning interventions in cognitive science — and one of the most underpracticed. Short, consistent daily review outperforms longer, irregular study sessions by a wide margin.`,
    identityConnection: `Someone who is becoming someone who knows this deeply starts here, because consistency of retrieval matters more than volume of consumption.`,
    week1Scope: `10 minutes of active recall — not re-reading, not highlighting. Flashcards, self-quizzing, or teaching back to yourself. Same time each day.`,
    closingLine: `You don't need to learn everything faster. Just this. For now.`,
  },

  wellbeing: {
    domain: 'wellbeing',
    domainLabel: 'Wellbeing',
    domainEmoji: '🧠',
    habitName: '3-line evening reflection',
    whyItWorks: `"This isn't journaling. It's pattern recognition. Three lines: what happened, what you felt, what you want to carry forward. Over 7 days, you'll see what's actually running you."`,
    week1Minimum: '3 lines, each evening. Pen and paper preferred — lower activation energy than an app. No word count. No structure beyond the 3 prompts.',
    watchFor: '⚠️ SPECIALIST FLAG: If they mention anxiety, depression, trauma, or medication: this habit is appropriate support, not treatment. "This is for self-awareness. It\'s not a substitute for professional support — and I can say that clearly if you want."',
    identityAnchor: '"What would it look like to be someone who understood themselves better?"',
    mechanism: `Structured reflective practice reduces rumination and builds emotional granularity — the ability to identify what you're actually feeling, not just whether it's good or bad. Three lines, nightly, creates a running narrative of who you're becoming.`,
    identityConnection: `Someone who wants to feel better and stay better starts here, because understanding your own patterns is the first step to changing them.`,
    week1Scope: `Three lines, each evening: what happened, what you felt, what you want to carry forward. Not a journal. Not a therapy session. Just three lines.`,
    closingLine: `You don't need to process everything. Just this. For now.`,
  },

  financial: {
    domain: 'financial',
    domainLabel: 'Financial',
    domainEmoji: '💰',
    habitName: 'Automate one financial flow',
    whyItWorks: `"The hardest financial decisions are the ones we have to make repeatedly. Automation turns a repeated hard decision into one decision, made once. After that, the behaviour happens regardless of mood."`,
    week1Minimum: 'One automation set up this week. Amount is irrelevant. The habit is the setup, not the number.',
    watchFor: '⚠️ IMPORTANT: Don\'t prescribe amounts. "The research supports automation. It doesn\'t support optimal savings rates — that varies too much by individual situation. We\'re building the habit of acting, not the perfect financial plan."',
    identityAnchor: '"What would it feel like to be someone who handles money on autopilot, without it living in your head?"',
    mechanism: `Financial habits are uniquely suited to automation because the decision — the hard part — only needs to happen once. After setup, the behaviour repeats without willpower, cognitive load, or mood involvement.`,
    identityConnection: `Someone who is becoming someone who handles money intentionally starts here, because the most powerful financial decision you can make is removing a decision from your daily willpower budget.`,
    week1Scope: `Pick one flow to automate: savings transfer, bill payment, investment contribution — any amount, doesn't matter. The habit is setting up the automation, not the dollar figure.`,
    closingLine: `You don't need to fix your entire financial life. Just this. For now.`,
  },
}

export const DOMAIN_ORDER: Domain[] = [
  'health', 'career', 'creativity', 'relationships', 'learning', 'wellbeing', 'financial'
]
