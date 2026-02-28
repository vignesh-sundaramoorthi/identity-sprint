// ─────────────────────────────────────────────────────────────────────────────
// Identity Sprint — Behavioral Assessment Engine
// Based on: Atomic Habits (James Clear) + Self-Determination Theory
// ─────────────────────────────────────────────────────────────────────────────

export type CravingType =
  | 'stability'    // needs routine, predictability, control
  | 'novelty'      // needs variety, excitement, new experiences
  | 'connection'   // needs social reinforcement, accountability
  | 'recognition'  // needs visible progress, external validation
  | 'competence'   // needs skill-building, mastery arc
  | 'autonomy'     // needs to feel in control of the process

export type FailureCause =
  | 'no_identity_anchor'      // Never shifted self-image
  | 'willpower_reliance'      // Relied on motivation, not systems
  | 'environment_not_designed'// Environment worked against them
  | 'habit_too_big'           // Started too ambitious
  | 'no_immediate_reward'     // No satisfying feedback loop
  | 'vague_intention'         // No clear cue or plan
  | 'social_environment'      // People around them undermined it

export type CravingProfile = {
  primary: CravingType
  secondary: CravingType
  scores: Record<CravingType, number>
}

export type FailureProfile = {
  primary: FailureCause
  secondary: FailureCause | null
  causes: FailureCause[]
}

export type HabitBlueprint = {
  cravingProfile: CravingProfile
  failureProfile: FailureProfile
  headline: string
  insight: string
  designPrinciples: string[]
  firstHabit: string
  warning: string
}

// ─── Craving scoring maps ────────────────────────────────────────────────────

const Q1_CRAVING: Record<string, Partial<Record<CravingType, number>>> = {
  'To feel appreciated / respected':   { recognition: 3, connection: 1 },
  'To feel more in control of my life': { stability: 3, autonomy: 2 },
  'To learn useful skills & improve':   { competence: 3, autonomy: 1 },
  'To feel supported by people':        { connection: 3, stability: 1 },
  'To bring more excitement into life': { novelty: 3, autonomy: 1 },
}

const Q2_CRAVING: Record<string, Partial<Record<CravingType, number>>> = {
  'Feeling bored or uninspired':        { novelty: 3, recognition: 1 },
  'Feeling not good enough yet':        { competence: 3, recognition: 1 },
  'Feeling alone in the journey':       { connection: 3, stability: 1 },
  'Feeling undervalued / unnoticed':    { recognition: 3, connection: 1 },
  'Life feels messy or out of control': { stability: 3, autonomy: 2 },
}

const Q3_CRAVING: Record<string, Partial<Record<CravingType, number>>> = {
  'Being recognised for results':       { recognition: 3, connection: 1 },
  'Clear steps and structure':          { stability: 3, competence: 1 },
  'Trying something new':               { novelty: 3, autonomy: 1 },
  'Doing it with someone':              { connection: 3, stability: 1 },
  'Getting better at a skill':          { competence: 3, autonomy: 1 },
}

const Q4_CRAVING: Record<string, Partial<Record<CravingType, number>>> = {
  'Planning, organising, routines':     { stability: 3, autonomy: 1 },
  'New experiences / variety':          { novelty: 3, autonomy: 1 },
  'Skill practice & improvement':       { competence: 3, stability: 1 },
  'Community / group vibe':             { connection: 3, recognition: 1 },
  'Winning, achievement, being seen':   { recognition: 3, competence: 1 },
}

const Q5_CRAVING: Record<string, Partial<Record<CravingType, number>>> = {
  'Feeling stable and consistent':      { stability: 3, competence: 1 },
  'Feeling proud of a skill I built':   { competence: 3, recognition: 1 },
  'Feeling supported throughout':       { connection: 3, stability: 1 },
  'Feeling excited and alive again':    { novelty: 3, autonomy: 1 },
  'Feeling recognised for my growth':   { recognition: 3, connection: 1 },
}

// ─── Failure cause maps ──────────────────────────────────────────────────────

const FAILURE_MAP: Record<string, FailureCause[]> = {
  "I relied on motivation — it worked until I stopped feeling like it":
    ['willpower_reliance', 'no_identity_anchor'],
  "I started too big and got overwhelmed":
    ['habit_too_big', 'willpower_reliance'],
  "My environment made it too hard to stay consistent":
    ['environment_not_designed', 'vague_intention'],
  "I didn't see results fast enough and lost interest":
    ['no_immediate_reward', 'habit_too_big'],
  "Life got busy and I never built it into my routine properly":
    ['vague_intention', 'environment_not_designed'],
  "The people around me didn't support it":
    ['social_environment', 'no_identity_anchor'],
  "I never really believed I was the kind of person who could do it":
    ['no_identity_anchor', 'willpower_reliance'],
}

// ─── Scoring engine ──────────────────────────────────────────────────────────

function scoreCravings(answers: Record<string, string>): CravingProfile {
  const scores: Record<CravingType, number> = {
    stability: 0, novelty: 0, connection: 0,
    recognition: 0, competence: 0, autonomy: 0,
  }

  const maps = [
    { key: 'q1', map: Q1_CRAVING },
    { key: 'q2', map: Q2_CRAVING },
    { key: 'q3', map: Q3_CRAVING },
    { key: 'q4', map: Q4_CRAVING },
    { key: 'q5', map: Q5_CRAVING },
  ]

  for (const { key, map } of maps) {
    const answer = answers[key]
    if (answer && map[answer]) {
      for (const [craving, score] of Object.entries(map[answer])) {
        scores[craving as CravingType] += score ?? 0
      }
    }
  }

  const sorted = (Object.entries(scores) as [CravingType, number][])
    .sort((a, b) => b[1] - a[1])

  return {
    primary: sorted[0][0],
    secondary: sorted[1][0],
    scores,
  }
}

function scoreFailures(failureAnswer: string): FailureProfile {
  const causes = FAILURE_MAP[failureAnswer] ?? ['willpower_reliance']
  return {
    primary: causes[0],
    secondary: causes[1] ?? null,
    causes,
  }
}

// ─── Blueprint generator ─────────────────────────────────────────────────────

const CRAVING_LABELS: Record<CravingType, string> = {
  stability: 'Stability & Structure',
  novelty: 'Novelty & Excitement',
  connection: 'Connection & Belonging',
  recognition: 'Recognition & Progress',
  competence: 'Mastery & Competence',
  autonomy: 'Autonomy & Control',
}

const FAILURE_LABELS: Record<FailureCause, string> = {
  no_identity_anchor: 'Missing identity anchor',
  willpower_reliance: 'Relying on willpower',
  environment_not_designed: 'Environment not designed',
  habit_too_big: 'Habit too ambitious',
  no_immediate_reward: 'No immediate reward',
  vague_intention: 'Vague intention / no cue',
  social_environment: 'Social environment working against you',
}

const DESIGN_PRINCIPLES: Record<CravingType, string[]> = {
  stability: [
    'Anchor new habits to existing daily routines (implementation intentions)',
    'Same time, same place — consistency of context beats willpower',
    'Design your environment to make the behaviour the default choice',
  ],
  novelty: [
    'Introduce variety within structure — rotate how you do the habit, not whether',
    'Set progressive challenges so the habit keeps evolving',
    'Gamify it — track streaks, unlock new levels, celebrate novelty milestones',
  ],
  connection: [
    'Find or create an accountability partner for the habit',
    'Make the habit social where possible (workout partner, study group)',
    'Share your commitment publicly — social stakes increase follow-through',
  ],
  recognition: [
    'Make progress visible — habit tracker, milestone board, before/after metrics',
    'Build in celebration rituals at key milestones',
    'Share wins regularly — recognition from others reinforces the identity',
  ],
  competence: [
    'Frame every rep as skill practice, not just completion',
    'Set skill-based milestones (not just consistency milestones)',
    'Learn the science behind what you\'re doing — mastery needs understanding',
  ],
  autonomy: [
    'You design the habit — pick the form that fits YOUR life, not someone else\'s',
    'Build flexibility in — the habit can adapt, as long as the identity stays',
    'Reject any system that feels like following someone else\'s rules',
  ],
}

const FAILURE_FIX: Record<FailureCause, string> = {
  no_identity_anchor: 'We\'ll start by building the identity, not the habit.',
  willpower_reliance: 'We\'ll design systems so you don\'t need to feel motivated.',
  environment_not_designed: 'We\'ll redesign your environment before we change your behaviour.',
  habit_too_big: 'We\'ll start absurdly small — 2-minute rule, then scale.',
  no_immediate_reward: 'We\'ll wire in an immediate reward for every rep.',
  vague_intention: 'We\'ll create an implementation intention: when X happens, I will Y.',
  social_environment: 'We\'ll either bring your environment on side, or find a new one.',
}

export function generateBlueprint(
  answers: Record<string, string>,
  failureAnswer: string
): HabitBlueprint {
  const cravingProfile = scoreCravings(answers)
  const failureProfile = scoreFailures(failureAnswer)

  const primaryCraving = cravingProfile.primary
  const primaryFailure = failureProfile.primary

  const headlines: Record<CravingType, string> = {
    stability: 'You thrive with structure. The system is the secret.',
    novelty: 'You need the journey to feel alive. Boring habits won\'t stick for you.',
    connection: 'You change faster with people than alone.',
    recognition: 'Visible progress is your fuel. Make the wins undeniable.',
    competence: 'You\'re motivated by getting better. Frame everything as skill-building.',
    autonomy: 'You need to own the process. Prescribed routines will fail you.',
  }

  return {
    cravingProfile,
    failureProfile,
    headline: headlines[primaryCraving],
    insight: `Your primary craving is **${CRAVING_LABELS[primaryCraving]}**, with **${CRAVING_LABELS[cravingProfile.secondary]}** as a strong secondary driver. Previous attempts likely failed because of **${FAILURE_LABELS[primaryFailure]}**. ${FAILURE_FIX[primaryFailure]}`,
    designPrinciples: DESIGN_PRINCIPLES[primaryCraving],
    firstHabit: `Design your first habit around ${CRAVING_LABELS[primaryCraving].toLowerCase()} — make it feel ${primaryCraving === 'novelty' ? 'exciting' : primaryCraving === 'connection' ? 'social' : primaryCraving === 'recognition' ? 'measurable' : primaryCraving === 'competence' ? 'like practice' : primaryCraving === 'autonomy' ? 'like your choice' : 'predictable and automatic'}.`,
    warning: `Watch out: if your habit starts feeling like ${primaryCraving === 'novelty' ? 'repetitive busywork' : primaryCraving === 'connection' ? 'a solo grind' : primaryCraving === 'recognition' ? 'invisible effort' : primaryCraving === 'competence' ? 'mindless repetition' : primaryCraving === 'autonomy' ? 'someone else\'s system' : 'chaos or unpredictability'}, you\'ll disengage. Build in a reset mechanism.`,
  }
}

export { CRAVING_LABELS, FAILURE_LABELS, FAILURE_MAP }
