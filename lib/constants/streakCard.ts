// Identity Sprint — Streak Share Card Caption System
// Three-tier caption logic per Flux H186 + Craft H186 specs.
//
// Tier 1: identity_name exists (identity profile label approved)
// Tier 2: becoming_statement exists (from applications.identity_declaration)
// Tier 3: generic fallback
//
// Caption day selection:
//   days 1–7   → day=7
//   days 8–14  → day=14
//   days 15–21 → day=21
//   days 22–29 → day=30
//   days 30+   → day=30+ (special bucket)

// ─── Tier 1: Identity name captions (H167 copy) ───────────────────────────

function getTier1Caption(day: number, identityName: string): string {
  // Uses the identity profile label, e.g. "The Grounded Creator"
  switch (day) {
    case 7:
      return `Day 7. ${identityName} is showing up. #IdentitySprint`
    case 14:
      return `14 days of ${identityName}. Every day. 🔥 #IdentitySprint`
    case 21:
      return `21 days in. ${identityName} — not a goal, a becoming. #IdentitySprint`
    case 30:
      return `Day 30. ${identityName}. The sprint is over. The identity isn't. #IdentitySprint`
    default:
      // 30+
      return `${identityName}. The sprint is over. The identity isn't. #IdentitySprint`
  }
}

// ─── Tier 2: Becoming statement captions (Craft H186 FINAL — verbatim) ────

function getTier2Caption(day: number, excerpt: string): string {
  switch (day) {
    case 7:
      return `Day 7. I'm becoming someone who ${excerpt}. #IdentitySprint`
    case 14:
      return `14 days of becoming someone who ${excerpt}. Not a habit. A becoming. 🔥 #IdentitySprint`
    case 21:
      return `21 days in. The person I said I was becoming on day 1 — someone who ${excerpt} — I'm starting to see them. #IdentitySprint`
    case 30:
      return `Day 30. On day 1 I wrote that I was becoming someone who ${excerpt}. I still am. The sprint is over. The identity isn't. #IdentitySprint`
    default:
      // 30+
      return `The sprint is over. The identity isn't. #IdentitySprint`
  }
}

// ─── Tier 3: Generic captions ─────────────────────────────────────────────

function getTier3Caption(day: number): string {
  switch (day) {
    case 7:
      return `Day 7. Showing up for who I'm becoming. #IdentitySprint`
    case 14:
      return `Day 14. 🔥 Showing up. Every day. #IdentitySprint`
    case 21:
      return `21 days of becoming. #IdentitySprint`
    case 30:
      return `Day 30. The sprint is over. The identity isn't. #IdentitySprint`
    default:
      // 30+
      return `The sprint is over. The identity isn't. #IdentitySprint`
  }
}

// ─── Day bucket resolver ───────────────────────────────────────────────────

function resolveDayBucket(dayNumber: number): number {
  if (dayNumber <= 7) return 7
  if (dayNumber <= 14) return 14
  if (dayNumber <= 21) return 21
  if (dayNumber <= 29) return 30
  return 31 // 30+ bucket — switch default handles this
}

// ─── Main export ───────────────────────────────────────────────────────────

/**
 * Returns the appropriate streak share caption for a participant.
 *
 * @param dayNumber       Current day in the sprint (1-indexed)
 * @param identityName    Identity profile label (e.g. "The Grounded Creator"), or null
 * @param becomingStatement  Raw becoming statement (applications.identity_declaration), or null
 */
export function getStreakCaption(
  dayNumber: number,
  identityName: string | null,
  becomingStatement: string | null
): string {
  const bucket = resolveDayBucket(dayNumber)

  // Truncate becoming_statement to first ~8 words
  const excerptWords =
    becomingStatement?.split(' ').slice(0, 8).join(' ') ?? null

  if (identityName) {
    // Tier 1 — identity label
    return getTier1Caption(bucket, identityName)
  } else if (excerptWords) {
    // Tier 2 — becoming_statement hybrid
    return getTier2Caption(bucket, excerptWords)
  } else {
    // Tier 3 — generic fallback
    return getTier3Caption(bucket)
  }
}
