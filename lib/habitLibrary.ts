// ─────────────────────────────────────────────────────────────────────────────
// Identity Sprint — Habit Library
// Source: Sage H75 research + Craft H82 verbatim copy
// Phase 2 Improvement: 3 habits per domain (coach picks the best fit)
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
  rank: 1 | 2 | 3  // 1 = primary recommendation; 2,3 = alternatives

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

// Returns top-2 domains (for multi-domain awareness in guide)
export function inferTopDomainsFromGoal(identityGoal: string): Domain[] {
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
  return (Object.entries(scores) as [Domain, number][])
    .filter(([, s]) => s > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([d]) => d)
}

// ─── Habit Library ────────────────────────────────────────────────────────────
// 3 habits per domain, ranked 1-3.
// Rank 1 = primary gateway habit (Craft H82 verbatim)
// Ranks 2-3 = alternatives when rank 1 doesn't fit the specific person

export const HABIT_LIBRARY: Record<Domain, HabitEntry[]> = {
  health: [
    {
      domain: 'health',
      domainLabel: 'Health',
      domainEmoji: '🏃',
      habitName: 'Consistent wake time',
      rank: 1,
      whyItWorks: `"Your wake time is the anchor for every other system — sleep quality, energy, appetite, recovery. We start here because nothing else stacks reliably on top of bad sleep."`,
      week1Minimum: 'Within 30 min, 7 days. That\'s it. No bedtime yet.',
      watchFor: 'Health goals are almost always clusters. If they name sleep + nutrition + exercise simultaneously: "Let\'s sequence these. Sleep is first."',
      identityAnchor: '"What kind of body are you becoming? → Then: \'Someone who [X] starts here.\'"',
      sequencingNote: 'Start here if health domain. Sleep → Nutrition → Exercise (sequenced — cannot skip).',
      mechanism: `Your body's alertness, appetite, energy, and recovery all synchronise around a single anchor: when you wake up. Locking your wake time stabilises every system downstream — which is why it's the first habit, not the most obvious one.`,
      identityConnection: `Someone who is building a healthier body starts here, because sleep architecture is the foundation everything else depends on. You can't out-train bad sleep.`,
      week1Scope: `Pick a wake time. Hold it within 30 minutes — weekends included. That's it. No bedtime requirement, no tracking apps. Just a consistent wake time.`,
      closingLine: `You don't need to fix everything. Just this. For now.`,
    },
    {
      domain: 'health',
      domainLabel: 'Health',
      domainEmoji: '🏃',
      habitName: 'Daily movement anchor (10 min)',
      rank: 2,
      whyItWorks: `"We're not building a fitness routine. We're building the identity of someone who moves every day. 10 minutes is the minimum that makes it identity-relevant — not just 'a walk.'"`,
      week1Minimum: '10 minutes of intentional movement, every day. Doesn\'t matter what it is. The identity is "person who moves daily."',
      watchFor: 'They\'ll want to go straight to 45-min gym sessions. "Let\'s anchor the identity first. 10 minutes every day beats 3 gym sessions followed by 2 weeks of nothing."',
      identityAnchor: '"Are you someone who exercises, or someone who moves every day? They\'re different identities. Which one is yours?"',
      sequencingNote: 'Use when sleep is already stable, or when movement is the stated identity (not just a health outcome).',
      mechanism: `Daily movement anchors your physical identity before your physical outcomes change. Identity shifts faster than the body — and it's the identity shift that makes the habit stick.`,
      identityConnection: `Someone who is building a healthier body starts here when sleep is already reliable — because consistent daily movement is the second anchor in the sequence.`,
      week1Scope: `10 minutes of intentional movement, daily. Walk, stretch, lift, swim — doesn't matter. The requirement is: intentional, every day, logged (even a phone note counts).`,
      closingLine: `You don't need a gym membership. Just this. For now.`,
    },
    {
      domain: 'health',
      domainLabel: 'Health',
      domainEmoji: '🏃',
      habitName: 'Single food upgrade (one rule)',
      rank: 3,
      whyItWorks: `"The biggest nutrition mistake is changing everything at once. One rule, held perfectly, changes your identity faster than 10 rules held partially. What's the one thing?"`,
      week1Minimum: 'One food rule, defined by them, held every day. No tracking. No apps. Just: did I follow the one rule today?',
      watchFor: 'Nutrition goals often signal relationship with food, not nutrition knowledge. Listen for all-or-nothing language. If you hear it: "Let\'s pick the version of this you can do on a bad day."',
      identityAnchor: '"What\'s one food decision that, if you made it automatically, would feel like the kind of person you\'re becoming?"',
      mechanism: `Single-rule food changes succeed because they're binary. Did I do it or not? There's no ambiguity, no tracking fatigue, no decision every day. One rule, made once, held consistently.`,
      identityConnection: `Someone building a healthier relationship with food starts here — one rule, chosen by you, held every day. Not a diet. A decision.`,
      week1Scope: `Define one food rule. Make it binary (yes/no). Examples: "No snacking after dinner." "Vegetables with lunch." "No alcohol on weekdays." One rule. Every day.`,
      closingLine: `You don't need a meal plan. Just this. For now.`,
    },
  ],

  career: [
    {
      domain: 'career',
      domainLabel: 'Career',
      domainEmoji: '💼',
      habitName: '90-minute deep work block',
      rank: 1,
      whyItWorks: `"The work that actually moves your career only happens when the urgent work isn't competing with it. This block is how you protect your thinking."`,
      week1Minimum: 'Same time daily. One block. Block is held even if the task isn\'t perfect.',
      watchFor: '"I don\'t have 90 minutes." → Response: "What\'s the shortest block you could protect every day without exception?" (60 min is fine.)',
      identityAnchor: '"What kind of professional are you becoming? Not what do you want to do — who are you becoming?" → Name the habit after they answer.',
      mechanism: `Consistent cognitive output comes from protecting uninterrupted time — not willpower, not motivation, not better tools. A single daily block, started and protected the same way each day, builds the neural pattern that professional identity change requires.`,
      identityConnection: `Someone who is becoming the professional they want to be starts here, because the work that actually matters only happens when the work you've been asked to do isn't competing with it.`,
      week1Scope: `Block 90 minutes — same time each day. No notifications, no email. One meaningful piece of work. The task doesn't matter this week. Holding the block does.`,
      closingLine: `You don't need to overhaul your calendar. Just this. For now.`,
    },
    {
      domain: 'career',
      domainLabel: 'Career',
      domainEmoji: '💼',
      habitName: 'Daily end-of-day shutdown ritual',
      rank: 2,
      whyItWorks: `"Most people's workday doesn't end — it just gets interrupted by sleep. A shutdown ritual closes the cognitive loop, which is what actually lets your brain recover and think better the next day."`,
      week1Minimum: '10 minutes at the same time each day. Three steps: log tomorrow\'s one priority, close all tabs/apps, say "shutdown complete." That\'s the whole ritual.',
      watchFor: 'If they describe themselves as always-on, can\'t switch off, or "always thinking about work" — this is the habit. Not work-life balance advice. Neurological pattern interruption.',
      identityAnchor: '"What would it feel like to leave work at work — not physically, but mentally?"',
      mechanism: `The brain treats incomplete tasks differently than complete ones (the Zeigarnik effect). A shutdown ritual signals completion, which reduces involuntary work-related intrusion and improves next-day cognitive performance.`,
      identityConnection: `Someone who is becoming a more intentional professional starts here — not by working less, but by ending cleanly so the next day starts strong.`,
      week1Scope: `Set a shutdown alarm at the same time daily. Log your one priority for tomorrow. Close all work tabs. Say "shutdown complete" (out loud is better). Done.`,
      closingLine: `You don't need better work-life balance. Just this. For now.`,
    },
    {
      domain: 'career',
      domainLabel: 'Career',
      domainEmoji: '💼',
      habitName: 'Weekly one-person outreach',
      rank: 3,
      whyItWorks: `"Career growth doesn't happen in the work — it happens in the conversations. Most people wait until they need something. People who build careers proactively reach out when they don't need anything."`,
      week1Minimum: 'One genuine, specific message to one person. No pitch. No ask. Just: something you noticed, something you appreciated, something that made you think of them.',
      watchFor: 'This can feel transactional to them. "We\'re not networking. We\'re building the identity of someone who maintains relationships in their field. Those are different things."',
      identityAnchor: '"Who in your field do you respect most? When did you last reach out just to say so?"',
      mechanism: `Professional relationships compound — but only if they're maintained outside of need. One genuine outreach per week, over 12 months, builds more career capital than any skill course.`,
      identityConnection: `Someone building a strong professional reputation starts here — because the conversations that open doors happen before you need a door opened.`,
      week1Scope: `Identify one person in your field. Send one message this week: a specific compliment on their work, a question you genuinely have, or something you want to share. No pitch. No ask. One message.`,
      closingLine: `You don't need a networking strategy. Just this. For now.`,
    },
  ],

  creativity: [
    {
      domain: 'creativity',
      domainLabel: 'Creativity',
      domainEmoji: '🎨',
      habitName: '15 minutes creating before consuming',
      rank: 1,
      whyItWorks: `"Consuming first makes creating feel optional. Creating first makes consuming feel earned. It's a sequencing habit, not an inspiration habit."`,
      week1Minimum: '15 minutes. First thing. Anything counts — doesn\'t have to be good.',
      watchFor: 'If they have a strong "morning routine" already: check whether creating or consuming comes first. Often they consume (email, news) and feel stuck later. This is the reframe.',
      identityAnchor: '"What does someone who makes things for a living do first in the morning?"',
      mechanism: `The creative habit that's most resistant to formation is morning output before input. It feels counterintuitive — but the research is consistent: creation before consumption protects the generative state before external stimuli override it.`,
      identityConnection: `Someone who is building a creative practice starts here, because consuming first makes creating feel optional. Creating first makes consuming feel earned.`,
      week1Scope: `15 minutes of output — writing, drawing, building, composing — before opening email, social, or news. It doesn't have to be good. It just has to happen first.`,
      closingLine: `You don't need to produce a masterpiece. Just this. For now.`,
    },
    {
      domain: 'creativity',
      domainLabel: 'Creativity',
      domainEmoji: '🎨',
      habitName: 'Daily idea capture (3 ideas)',
      rank: 2,
      whyItWorks: `"Creativity is a supply chain. If you're not feeding it daily, you'll run out mid-project. Three ideas a day — any ideas, any domain — trains the generative muscle."`,
      week1Minimum: '3 ideas, written down, every day. Ideas don\'t have to be good. The habit is generating, not filtering.',
      watchFor: '"I don\'t have 3 ideas today." → Response: "What\'s the worst idea you could write down right now?" (They always have one. And that unlocks two more.)',
      identityAnchor: '"Do you think of yourself as someone who has ideas, or someone who judges ideas? Generators are different from evaluators."',
      mechanism: `Idea generation is a trainable muscle. Most people stop generating early because they evaluate simultaneously. Separating generation from evaluation — even for 5 minutes daily — compounds creative output within weeks.`,
      identityConnection: `Someone who is building a creative practice starts here — not by making better things, but by generating more consistently. Volume creates selection options.`,
      week1Scope: `Each day: write 3 ideas in a notebook or app. Any domain. Quantity only — no quality filter this week. The habit is: I generate daily.`,
      closingLine: `You don't need good ideas yet. Just this. For now.`,
    },
    {
      domain: 'creativity',
      domainLabel: 'Creativity',
      domainEmoji: '🎨',
      habitName: 'Weekly completion (finish one small thing)',
      rank: 3,
      whyItWorks: `"Most creative people have abandoned projects, not absent creativity. Finishing small things — regardless of quality — trains the completion muscle that big projects require."`,
      week1Minimum: 'One thing, finished and closed. Can be tiny: a sketch, a paragraph, a chord progression, a recipe. Finished = done, not perfect.',
      watchFor: 'Perfectionism signal: "I want to do it right before I show anyone." → Response: "Who are you finishing this for? The habit is completion, not publication."',
      identityAnchor: '"Are you a starter or a finisher? Most creative people are starters. The identity we\'re building is: finisher."',
      mechanism: `Creative identity is built from completed work — not from ideas, not from starts, not from drafts. The psychological experience of finishing something, even small, builds the identity of someone who completes creative work.`,
      identityConnection: `Someone who is becoming a consistent creative practitioner starts here — because the creative identity that sticks is built from finished things, not started ones.`,
      week1Scope: `Finish one small creative thing this week. Define it at the start: a sketch, a page, a scene, a song section. When it's done, mark it complete and move on. Don't revise. Finish.`,
      closingLine: `You don't need to make something great. Just this. For now.`,
    },
  ],

  relationships: [
    {
      domain: 'relationships',
      domainLabel: 'Relationships',
      domainEmoji: '🤝',
      habitName: '20 minutes of device-free presence',
      rank: 1,
      whyItWorks: `"People don't feel the hours you spend with them. They feel whether you were actually there. This is the simplest and most powerful relationship habit there is."`,
      week1Minimum: 'One person, 20 minutes, no devices. Conversation topic doesn\'t matter.',
      watchFor: 'This is a NO-cluster domain — one habit is enough. If they want to add more: "Let\'s get this one automatic first."',
      identityAnchor: '"Who do you want to be the kind of person for?"',
      mechanism: `Relationship quality correlates strongly with undivided attention — not with hours spent together. A short period of genuine presence every day does more for connection than hours spent in the same room on separate screens.`,
      identityConnection: `Someone who values deep relationships starts here, because presence is the only signal the people around you can actually feel.`,
      week1Scope: `Choose one person. 20 minutes. No devices — yours or theirs. The conversation can be about anything. The habit is being fully there.`,
      closingLine: `You don't need to fix every relationship. Just this. For now.`,
    },
    {
      domain: 'relationships',
      domainLabel: 'Relationships',
      domainEmoji: '🤝',
      habitName: 'One genuine message per day',
      rank: 2,
      whyItWorks: `"Relationships atrophy from neglect, not conflict. One message a day — specific, genuine, not asking for anything — is how you stop the drift before it becomes distance."`,
      week1Minimum: 'One message per day to someone outside your immediate household. Specific to them — not a forward or a meme. Something you thought of because of them.',
      watchFor: '"I\'m not good at staying in touch." → Response: "That\'s the identity we\'re changing. Not because you\'re bad at it — because you haven\'t had a system for it."',
      identityAnchor: '"Who in your life would be surprised to hear from you this week?"',
      mechanism: `Social maintenance is one of the most well-documented predictors of wellbeing — but most people let it become reactive (responding when contacted) rather than proactive. A daily outreach habit inverts that pattern.`,
      identityConnection: `Someone who values connection starts here — not by scheduling deep conversations, but by maintaining the thread that makes those conversations possible.`,
      week1Scope: `Every day: send one message to one person. Must be specific — reference something real about them or a conversation you've had. Can be short. The habit is: proactive, genuine, daily.`,
      closingLine: `You don't need to reconnect with everyone. Just this. For now.`,
    },
    {
      domain: 'relationships',
      domainLabel: 'Relationships',
      domainEmoji: '🤝',
      habitName: 'Weekly no-agenda time (one relationship)',
      rank: 3,
      whyItWorks: `"Most adult relationships only happen when there's a reason. No-agenda time — a walk, a coffee, sitting together — is what the relationship actually runs on. We've forgotten it because schedules replaced it."`,
      week1Minimum: 'One block of unscheduled time with one person this week. No task. No agenda. Just proximity and willingness to talk.',
      watchFor: 'They\'ll want to make it "productive" (a walk with a podcast, a coffee where they check email). "The habit is the unstructured time. That\'s the rare resource."',
      identityAnchor: '"Who in your life do you want to know better — not catch up with, but actually know?"',
      mechanism: `Unstructured time is where relational depth forms. Task-oriented time builds coordination; unstructured time builds intimacy. Most adults are coordination-rich and intimacy-poor without knowing why.`,
      identityConnection: `Someone building deeper relationships starts here — because depth comes from unscheduled presence, not from planned quality time.`,
      week1Scope: `Schedule one block of unstructured time with one person this week. Walk, sit, drive somewhere. No agenda. No task. Just: be together and see what comes up.`,
      closingLine: `You don't need a deeper social life. Just this. For now.`,
    },
  ],

  learning: [
    {
      domain: 'learning',
      domainLabel: 'Learning',
      domainEmoji: '📚',
      habitName: '10 minutes of daily spaced repetition',
      rank: 1,
      whyItWorks: `"Spaced retrieval outperforms re-reading by 50–80% in retention. You're not spending more time — you're spending better time. 10 minutes of active recall beats 60 minutes of re-reading."`,
      week1Minimum: '10 minutes, daily. Active recall only — not re-reading. Anki, flashcards, or just closing the book and testing yourself.',
      watchFor: 'If they describe themselves as "bad at retaining things": that\'s the signal. They\'re consuming without retrieving. This habit is the fix.',
      identityAnchor: '"What would it feel like to actually know this — not just have read it?"',
      mechanism: `Spaced repetition is one of the most well-validated learning interventions in cognitive science — and one of the most underpracticed. Short, consistent daily review outperforms longer, irregular study sessions by a wide margin.`,
      identityConnection: `Someone who is becoming someone who knows this deeply starts here, because consistency of retrieval matters more than volume of consumption.`,
      week1Scope: `10 minutes of active recall — not re-reading, not highlighting. Flashcards, self-quizzing, or teaching back to yourself. Same time each day.`,
      closingLine: `You don't need to learn everything faster. Just this. For now.`,
    },
    {
      domain: 'learning',
      domainLabel: 'Learning',
      domainEmoji: '📚',
      habitName: 'Teach-back after every learning session',
      rank: 2,
      whyItWorks: `"The generation effect is clear: explaining something cements it. You don't need a student — explain it to your notes, a voice memo, or yourself in the mirror. The act of generation is the learning."`,
      week1Minimum: 'After every learning session (podcast, book chapter, course video): spend 2 minutes explaining what you just learned out loud. To anyone. Or no one.',
      watchFor: '"That feels embarrassing." → Response: "Voice memo. Just you and your phone. The point is the act of generation, not the audience."',
      identityAnchor: '"Could you explain this to someone who knows nothing about it? If not — that\'s what we\'re building toward."',
      mechanism: `The protégé effect: teaching something requires reorganising knowledge, identifying gaps, and retrieving material in a different form — all of which dramatically increase retention compared to passive review.`,
      identityConnection: `Someone who is building mastery in their field starts here — because the test of whether you understand something is whether you can explain it, not whether you've read it.`,
      week1Scope: `After every learning session this week: 2-minute voice memo or self-explanation of the main thing you learned. Don't listen back. The generation is what matters.`,
      closingLine: `You don't need a tutor. Just this. For now.`,
    },
    {
      domain: 'learning',
      domainLabel: 'Learning',
      domainEmoji: '📚',
      habitName: 'Single-skill daily practice (20 min)',
      rank: 3,
      whyItWorks: `"People who improve fast don't consume more — they practice more deliberately. 20 minutes of deliberate practice on one skill, daily, beats 2-hour irregular study sessions for skill acquisition."`,
      week1Minimum: '20 minutes on one specific skill. Not general reading about it — actual practice. Focused, with feedback (even self-feedback).',
      watchFor: 'They confuse consumption with practice. "Reading about X is not the same as practicing X. What\'s the smallest practice unit for your specific skill?"',
      identityAnchor: '"What\'s the one skill that, if you improved by 20%, would change your life most?"',
      mechanism: `Deliberate practice — focused effort at the edge of current capability with feedback — is the mechanism behind expert skill development. Daily exposure at 20 minutes outperforms longer irregular sessions for most skills.`,
      identityConnection: `Someone who is becoming skilled at something specific starts here — because the identity of "someone who practices daily" is the foundation that everything else is built on.`,
      week1Scope: `Pick one skill. Practice it for 20 minutes every day — same time, deliberate focus, at the edge of your ability. No passive consumption. Active, effortful practice.`,
      closingLine: `You don't need more resources. Just this. For now.`,
    },
  ],

  wellbeing: [
    {
      domain: 'wellbeing',
      domainLabel: 'Wellbeing',
      domainEmoji: '🧠',
      habitName: '3-line evening reflection',
      rank: 1,
      whyItWorks: `"This isn't journaling. It's pattern recognition. Three lines: what happened, what you felt, what you want to carry forward. Over 7 days, you'll see what's actually running you."`,
      week1Minimum: '3 lines, each evening. Pen and paper preferred — lower activation energy than an app. No word count. No structure beyond the 3 prompts.',
      watchFor: '⚠️ SPECIALIST FLAG: If they mention anxiety, depression, trauma, or medication: this habit is appropriate support, not treatment. "This is for self-awareness. It\'s not a substitute for professional support — and I can say that clearly if you want."',
      identityAnchor: '"What would it look like to be someone who understood themselves better?"',
      mechanism: `Structured reflective practice reduces rumination and builds emotional granularity — the ability to identify what you're actually feeling, not just whether it's good or bad. Three lines, nightly, creates a running narrative of who you're becoming.`,
      identityConnection: `Someone who wants to feel better and stay better starts here, because understanding your own patterns is the first step to changing them.`,
      week1Scope: `Three lines, each evening: what happened, what you felt, what you want to carry forward. Not a journal. Not a therapy session. Just three lines.`,
      closingLine: `You don't need to process everything. Just this. For now.`,
    },
    {
      domain: 'wellbeing',
      domainLabel: 'Wellbeing',
      domainEmoji: '🧠',
      habitName: 'Daily non-negotiable wind-down (20 min)',
      rank: 2,
      whyItWorks: `"The transition between active and rest is where most wellbeing habits break. 20 minutes of a defined wind-down activity — same every night — trains your nervous system that the day is over."`,
      week1Minimum: '20 minutes of the same activity, every night, no screens. Walk, stretch, read fiction, shower — anything low-stimulation and consistent.',
      watchFor: 'They\'ll want to "optimise" the wind-down (sleep hygiene routine, meditation, journaling, breathing exercises). "Pick one thing. Same thing. Every night. That\'s it."',
      identityAnchor: '"What does someone who sleeps well and feels rested do at the end of each day?"',
      mechanism: `Conditioned relaxation: when the same activity precedes sleep consistently, the nervous system learns to down-regulate on cue. Variety undermines this — consistency is the mechanism, not the activity itself.`,
      identityConnection: `Someone who wants to feel calmer and more rested starts here — because the transition into rest is a trainable habit, not a personality trait.`,
      week1Scope: `Pick one wind-down activity: walk, stretch, read fiction, bath. Same activity, same time, every night, 20 minutes. No variations this week — consistency is what makes it work.`,
      closingLine: `You don't need a full sleep protocol. Just this. For now.`,
    },
    {
      domain: 'wellbeing',
      domainLabel: 'Wellbeing',
      domainEmoji: '🧠',
      habitName: 'Morning sunlight (10 min outside)',
      rank: 3,
      whyItWorks: `"Cortisol onset — your body's natural morning alerting signal — anchors on light, not on alarm clocks. 10 minutes of outdoor light in the first hour resets your circadian rhythm and affects mood for the rest of the day."`,
      week1Minimum: '10 minutes outside within 1 hour of waking. No sunglasses. Movement optional. The light exposure is the mechanism.',
      watchFor: '"What if it\'s cloudy?" → Response: "Outdoor light on a cloudy day is still 10-50x brighter than indoor light. It still works."',
      identityAnchor: '"What kind of morning person do you want to be? Not the alarm you set — the first thing you do after it."',
      mechanism: `Morning light exposure within the first hour sets the cortisol rhythm that governs alertness, mood, and sleep timing for the rest of the day. This is one of the most evidence-backed, lowest-effort wellbeing interventions available.`,
      identityConnection: `Someone who wants to feel better through the day starts here — because the first 60 minutes after waking determine the neurological baseline for the next 16 hours.`,
      week1Scope: `Within 1 hour of waking: go outside for 10 minutes. Walk, stand, sit — doesn't matter. No sunglasses. That's it.`,
      closingLine: `You don't need a wellness routine. Just this. For now.`,
    },
  ],

  financial: [
    {
      domain: 'financial',
      domainLabel: 'Financial',
      domainEmoji: '💰',
      habitName: 'Automate one financial flow',
      rank: 1,
      whyItWorks: `"The hardest financial decisions are the ones we have to make repeatedly. Automation turns a repeated hard decision into one decision, made once. After that, the behaviour happens regardless of mood."`,
      week1Minimum: 'One automation set up this week. Amount is irrelevant. The habit is the setup, not the number.',
      watchFor: '⚠️ IMPORTANT: Don\'t prescribe amounts. "The research supports automation. It doesn\'t support optimal savings rates — that varies too much by individual situation. We\'re building the habit of acting, not the perfect financial plan."',
      identityAnchor: '"What would it feel like to be someone who handles money on autopilot, without it living in your head?"',
      mechanism: `Financial habits are uniquely suited to automation because the decision — the hard part — only needs to happen once. After setup, the behaviour repeats without willpower, cognitive load, or mood involvement.`,
      identityConnection: `Someone who is becoming someone who handles money intentionally starts here, because the most powerful financial decision you can make is removing a decision from your daily willpower budget.`,
      week1Scope: `Pick one flow to automate: savings transfer, bill payment, investment contribution — any amount, doesn't matter. The habit is setting up the automation, not the dollar figure.`,
      closingLine: `You don't need to fix your entire financial life. Just this. For now.`,
    },
    {
      domain: 'financial',
      domainLabel: 'Financial',
      domainEmoji: '💰',
      habitName: 'Weekly 10-minute money check-in',
      rank: 2,
      whyItWorks: `"Most financial anxiety comes from not looking. A 10-minute weekly check — same day, same time — replaces dread with data. You can't change what you don't see."`,
      week1Minimum: '10 minutes, same day each week. Open your accounts, look at the numbers. That\'s it. No action required this week — just looking.',
      watchFor: 'Financial anxiety is common here. "The goal this week isn\'t to fix anything. It\'s just to look. Looking is the first habit."',
      identityAnchor: '"What would it feel like to know exactly where you stand, every week?"',
      mechanism: `Financial avoidance is one of the most common maladaptive patterns around money — and looking at accounts, even without acting, has been shown to increase financial behaviour change more than any planning tool.`,
      identityConnection: `Someone who is becoming financially intentional starts here — not by budgeting, not by cutting expenses, but by making looking at their finances a non-negotiable weekly event.`,
      week1Scope: `Pick a day. Set a recurring alarm: "Money check-in." Open your main accounts. Look at the numbers. Note one thing. That's the whole habit. 10 minutes.`,
      closingLine: `You don't need a budget yet. Just this. For now.`,
    },
    {
      domain: 'financial',
      domainLabel: 'Financial',
      domainEmoji: '💰',
      habitName: 'One unnecessary expense cut (30 days)',
      rank: 3,
      whyItWorks: `"Financial identity is built from small, visible commitments — not from large sacrifices. Cutting one specific thing, consciously, for 30 days builds more financial agency than a full budget audit."`,
      week1Minimum: 'Name one thing you spend money on that you don\'t value. Remove it for 30 days. Tell someone what you\'re doing (accountability).',
      watchFor: 'They\'ll pick something too large (eating out entirely, all entertainment). "Pick one specific thing. Not a category — a thing. The specificity is what makes it work."',
      identityAnchor: '"What\'s one thing you spend money on mostly out of habit, not because it adds real value to your life?"',
      mechanism: `Small, visible financial commitments build financial self-efficacy — the belief that you can influence your financial outcomes. Self-efficacy is a stronger predictor of financial behaviour change than financial knowledge.`,
      identityConnection: `Someone who is becoming more intentional with money starts here — because one specific, visible commitment builds the confidence that larger changes require.`,
      week1Scope: `Name one specific expense you're cutting for 30 days. Write it down. Tell one person. The amount doesn't matter — the conscious choice does.`,
      closingLine: `You don't need a full budget review. Just this. For now.`,
    },
  ],
}

export const DOMAIN_ORDER: Domain[] = [
  'health', 'career', 'creativity', 'relationships', 'learning', 'wellbeing', 'financial'
]

// Get ranked habits for a domain (rank 1 first)
export function getDomainHabits(domain: Domain): HabitEntry[] {
  return HABIT_LIBRARY[domain].sort((a, b) => a.rank - b.rank)
}
