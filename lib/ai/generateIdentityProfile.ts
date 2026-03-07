// Identity Sprint — AI Identity Profile Generator
// Uses Anthropic Claude Sonnet via @anthropic-ai/sdk
// Before running: npm install @anthropic-ai/sdk
// signal_tone MUST be validated at API route level BEFORE this is called
// identity_profile is PERMANENT once stored — never delete or overwrite

// eslint-disable-next-line @typescript-eslint/no-require-imports
const Anthropic = require('@anthropic-ai/sdk').default ?? require('@anthropic-ai/sdk')

export type SignalTone = 'H1' | 'H2' | 'none'

export interface IdentityProfileInput {
  name: string
  identity_goal: string
  primary_craving: string | null
  secondary_craving: string | null
  primary_failure: string | null
  // pre_sprint_signal intentionally OMITTED — signal_tone is the validated, admin-set value.
  // pre_sprint_signal (raw DB field) is NOT passed to AI to prevent stale/unvalidated data
  // from influencing generation. Probe MEDIUM finding — resolved.
  signal_tone: SignalTone
  domain: string | null
}

export interface IdentityProfile {
  label: string           // e.g. "The Grounded Creator"
  qualities: string[]     // 3 qualities, e.g. ["Consistent", "Present", "Intentional"]
  signal_tone: SignalTone // preserved from input for audit trail
  generated_at: string    // ISO timestamp
}

const SYSTEM_PROMPT = `You are writing a deeply personal identity profile for someone who has just completed a discovery call with their transformation coach, Vignesh.

This is NOT a generic self-help label. It is a coach-crafted identity anchor — written as if Vignesh personally observed this person and named what he saw in them.

The profile has two parts:
1. A label — 2-3 words starting with "The" (e.g. "The Grounded Creator", "The Disciplined Builder", "The Present Father")
2. Three qualities — single words or short phrases that describe the identity, comma-separated (e.g. "Consistent, Present, Intentional")

Rules:
- Never use the word "habits" — use "practices" if needed
- Never use generic self-help language (no "best self", no "journey", no "transformation")
- The label must feel specific to this person, not like an archetype template
- Qualities must feel earned, not aspirational — grounded in who they already are becoming
- H1 signal tone = confirmation frame (they already know who they're becoming; this names it clearly)
- H2 signal tone = recognition frame (they felt this but couldn't articulate it; this surfaces it)
- "none" signal tone = neutral, grounded, no framing modifier needed

Respond ONLY with valid JSON in this exact format:
{
  "label": "The [Identity Label]",
  "qualities": ["Quality 1", "Quality 2", "Quality 3"]
}`

function buildUserPrompt(input: IdentityProfileInput): string {
  const toneInstruction = {
    H1: 'SIGNAL TONE: H1 (confirmation). This person has clearly self-identified their direction. Name what they already know about themselves.',
    H2: 'SIGNAL TONE: H2 (recognition). This person has been operating from this identity but hasn\'t named it yet. Surface what they felt but couldn\'t articulate.',
    none: 'SIGNAL TONE: neutral. Ground the profile in what they\'ve described without a specific framing modifier.',
  }[input.signal_tone]

  return `Person: ${input.name}
Identity goal: ${input.identity_goal}
Primary craving: ${input.primary_craving ?? 'not specified'}
Secondary craving: ${input.secondary_craving ?? 'not specified'}
Primary failure pattern: ${input.primary_failure ?? 'not specified'}
Domain: ${input.domain ?? 'not specified'}

${toneInstruction}

Generate the identity profile JSON.`
}

export async function generateIdentityProfile(
  input: IdentityProfileInput
): Promise<IdentityProfile> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY not configured')
  }

  const client = new Anthropic({ apiKey })

  const message = await client.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 256,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: buildUserPrompt(input),
      },
    ],
  })

  const content = message.content[0]
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from AI')
  }

  let parsed: { label: string; qualities: string[] }
  try {
    parsed = JSON.parse(content.text.trim())
  } catch {
    throw new Error(`AI returned invalid JSON: ${content.text}`)
  }

  if (
    typeof parsed.label !== 'string' ||
    !Array.isArray(parsed.qualities) ||
    parsed.qualities.length !== 3 ||
    parsed.qualities.some((q) => typeof q !== 'string')
  ) {
    throw new Error(`AI returned malformed profile structure: ${content.text}`)
  }

  return {
    label: parsed.label,
    qualities: parsed.qualities,
    signal_tone: input.signal_tone,
    generated_at: new Date().toISOString(),
  }
}
