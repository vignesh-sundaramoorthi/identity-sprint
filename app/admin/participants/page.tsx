'use client'

import { useEffect, useState, useCallback } from 'react'

// ─── Domain inference ─────────────────────────────────────────────────────────

const DOMAIN_KEYWORDS: Record<string, string[]> = {
  health:        ['sleep', 'health', 'fitness', 'gym', 'exercise', 'diet', 'nutrition', 'weight', 'body', 'run', 'workout', 'energy', 'wake', 'morning'],
  career:        ['career', 'work', 'job', 'professional', 'productivity', 'business', 'focus', 'meeting', 'salary', 'promotion'],
  creativity:    ['creat', 'write', 'writing', 'art', 'design', 'music', 'draw', 'build', 'make', 'story', 'publish', 'content', 'code'],
  relationships: ['relationship', 'family', 'partner', 'friend', 'connect', 'people', 'present', 'marriage', 'social', 'listen'],
  learning:      ['learn', 'study', 'read', 'book', 'knowledge', 'skill', 'course', 'language', 'understand', 'master', 'upskill'],
  wellbeing:     ['mental', 'wellbeing', 'anxiety', 'stress', 'calm', 'mindful', 'meditat', 'reflect', 'journal', 'peace', 'therapy', 'mood'],
  financial:     ['money', 'financ', 'sav', 'invest', 'debt', 'budget', 'wealth', 'spend', 'income', 'retire'],
}

function inferDomain(text: string): string {
  const lower = text.toLowerCase()
  let best = { domain: 'health', score: 0 }
  for (const [domain, keywords] of Object.entries(DOMAIN_KEYWORDS)) {
    const score = keywords.filter((k) => lower.includes(k)).length
    if (score > best.score) best = { domain, score }
  }
  return best.domain
}

const DOMAIN_META: Record<string, { emoji: string; label: string }> = {
  health:        { emoji: '🏃', label: 'Health' },
  career:        { emoji: '💼', label: 'Career' },
  creativity:    { emoji: '🎨', label: 'Creativity' },
  relationships: { emoji: '🤝', label: 'Relationships' },
  learning:      { emoji: '📚', label: 'Learning' },
  wellbeing:     { emoji: '🧠', label: 'Wellbeing' },
  financial:     { emoji: '💰', label: 'Financial' },
}

const DOMAIN_CARDS: Record<string, {
  habit: string; whyItWorks: string; weekOneMin: string
  watchFor: string; identityAnchor: string; warning?: string
}> = {
  health: {
    habit: 'Consistent wake time',
    whyItWorks: '"Your wake time is the anchor for every other system — sleep quality, energy, appetite, recovery. Nothing else stacks reliably on top of bad sleep."',
    weekOneMin: "Within 30 min, 7 days. That's it. No bedtime yet.",
    watchFor: 'Health goals are clusters. If they name sleep + nutrition + exercise simultaneously: "Let\'s sequence these. Sleep is first."',
    identityAnchor: '"What kind of body are you becoming? → Then: \'Someone who [X] starts here.\'"',
  },
  career: {
    habit: '90-min deep work block',
    whyItWorks: '"The work that actually moves your career only happens when the urgent work is not competing with it. This block is how you protect your thinking."',
    weekOneMin: 'Same time daily. One block. Block is held even if the task is not perfect.',
    watchFor: '"I do not have 90 minutes." → "What is the shortest block you could protect every day without exception?" (60 min is fine.)',
    identityAnchor: '"What kind of professional are you becoming? Not what do you want to do — who are you becoming?" → Name the habit after they answer.',
  },
  creativity: {
    habit: '15 min creating before consuming',
    whyItWorks: '"Consuming first makes creating feel optional. Creating first makes consuming feel earned. A sequencing habit, not an inspiration habit."',
    weekOneMin: '15 minutes. First thing. Anything counts — does not have to be good.',
    watchFor: 'If they have a strong morning routine already: check whether creating or consuming comes first. Often email/news comes first. This is the reframe.',
    identityAnchor: '"What does someone who makes things for a living do first in the morning?"',
  },
  relationships: {
    habit: '20 min device-free presence',
    whyItWorks: '"People do not feel the hours you spend with them. They feel whether you were actually there. This is the simplest and most powerful relationship habit."',
    weekOneMin: 'One person, 20 minutes, no devices. Conversation topic does not matter.',
    watchFor: 'NO-cluster domain — one habit is enough. If they want to add more: "Let\'s get this one automatic first."',
    identityAnchor: '"Who do you want to be the kind of person for?"',
  },
  learning: {
    habit: '10 min daily spaced repetition',
    whyItWorks: '"Spaced retrieval outperforms re-reading by 50-80% in retention. 10 minutes of active recall beats 60 minutes of re-reading."',
    weekOneMin: '10 minutes, daily. Active recall only — not re-reading. Anki, flashcards, or closing the book and testing yourself.',
    watchFor: 'If they say they are bad at retaining things: they are consuming without retrieving. This habit is the fix.',
    identityAnchor: '"What would it feel like to actually know this — not just have read it?"',
  },
  wellbeing: {
    habit: '3-line evening reflection',
    whyItWorks: '"This is not journaling. It is pattern recognition. Three lines: what happened, what you felt, what you want to carry forward. Over 7 days, you will see what is actually running you."',
    weekOneMin: '3 lines, each evening. Pen and paper preferred. No word count. Just the 3 prompts.',
    watchFor: 'If they mention anxiety, depression, trauma, or medication: this habit is appropriate support, not treatment.',
    warning: 'SPECIALIST FLAG: If they mention anxiety, depression, trauma, or medication: "This is for self-awareness. Not a substitute for professional support."',
    identityAnchor: '"What would it look like to be someone who understood themselves better?"',
  },
  financial: {
    habit: 'Automate one financial flow',
    whyItWorks: '"The hardest financial decisions are the ones we make repeatedly. Automation turns a repeated hard decision into one decision, made once. After that, the behaviour happens regardless of mood."',
    weekOneMin: 'One automation set up this week. Amount is irrelevant. The habit is the setup, not the number.',
    watchFor: 'Do not prescribe amounts. "We are building the habit of acting, not the perfect financial plan."',
    warning: 'IMPORTANT: Do not prescribe amounts or savings rates. Focus on the habit of automating, not the figure.',
    identityAnchor: '"What would it feel like to be someone who handles money on autopilot, without it living in your head?"',
  },
}

interface Application {
  id: number; name: string; email: string; whatsapp?: string
  submitted_at: string; status: string; identity_goal: string
  tried_before: string; why_now: string; commitment: string
  identity_declaration?: string; outcome_type?: string
  stage_signal?: string; pre_sprint_signal?: string
  week_3_badge?: string; dm_identity_verbatim?: string
  outreach_door?: string
  relational_anchor_type?: string
  post_sprint_first_checkin_status?: string
  post_sprint_language_signal?: string
  sprint_completion_statement?: string
  sprint_completion_statement_type?: string
  moment_flag?: boolean
  moment_text?: string
}

interface IdentityProfile {
  label: string
  qualities: string[]
  signal_tone: 'H1' | 'H2' | 'none'
  generated_at: string
}

interface Participant {
  id: number; application_id: number; cohort_id?: number
  enrolled_at: string; status: string; habit_recommendation?: string
  // Phase 4 — Identity Profile fields (requires phase4-identity-profile.sql migration)
  identity_profile?: IdentityProfile | null
  identity_profile_approved?: boolean | null
  identity_profile_approved_at?: string | null
  anchor_statement?: string | null
  snapshot?: string | null  // BUG-020 fix: coach-authored day-in-the-life snapshot
  applications: Application
}

interface Checkin {
  id: number; application_id: number; week_number: number
  identity_rating: number; reflection_text?: string
  field_9_recognition?: string; field_9_verbatim?: string
  wall_triggered_at?: string; wall_responded_at?: string
  created_at: string
}

type SortField = 'name' | 'enrolled_at' | 'status' | 'latest_rating'
type SortDir = 'asc' | 'desc'

function Sparkline({ ratings }: { ratings: number[] }) {
  if (ratings.length === 0) return <span className="text-gray-300 text-xs">no data</span>
  if (ratings.length === 1) return <span className="text-gray-600 text-xs font-mono">{ratings[0]}/5</span>
  const w = 80; const h = 28; const pad = 4
  const plotW = w - 2 * pad; const plotH = h - 2 * pad
  const pts = ratings.map((r, i) => {
    const x = pad + (i / (ratings.length - 1)) * plotW
    const y = h - pad - ((r - 1) / 4) * plotH
    return `${x},${y}`
  })
  const last = ratings[ratings.length - 1]
  const color = last >= 4 ? '#22c55e' : last === 3 ? '#f59e0b' : '#ef4444'
  return (
    <div className="flex items-center gap-2">
      <svg width={w} height={h} className="overflow-visible">
        <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
        {ratings.map((r, i) => {
          const x = pad + (i / (ratings.length - 1)) * plotW
          const y = h - pad - ((r - 1) / 4) * plotH
          return <circle key={i} cx={x} cy={y} r="2.5" fill={color} />
        })}
      </svg>
      <span className="text-xs font-mono text-gray-500">{ratings.join(' → ')}</span>
    </div>
  )
}

function WallBanner({ checkin, name, onRespond }: { checkin: Checkin; name: string; onRespond: (id: number) => Promise<void> }) {
  const [busy, setBusy] = useState(false)
  if (!checkin.wall_triggered_at || checkin.wall_responded_at) return null
  const hoursElapsed = (Date.now() - new Date(checkin.wall_triggered_at).getTime()) / 3600000
  const urgent = hoursElapsed >= 4
  const handle = async () => { setBusy(true); await onRespond(checkin.id); setBusy(false) }
  return (
    <div className={`rounded-xl p-3 flex items-center justify-between gap-3 ${urgent ? 'bg-red-50 border border-red-200' : 'bg-amber-50 border border-amber-200'}`}>
      <div>
        <p className={`text-sm font-semibold ${urgent ? 'text-red-700' : 'text-amber-700'}`}>
          ⚠️ {urgent ? `${name} hit the wall ${Math.round(hoursElapsed)}h ago — they still need a response.` : `${name} hit the Week 3 wall — respond within 4 hours.`}
        </p>
        <p className="text-xs text-gray-500 mt-0.5">Week {checkin.week_number} · Rating: {checkin.identity_rating}/5</p>
      </div>
      <button onClick={handle} disabled={busy} className={`flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg ${urgent ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-500 hover:bg-amber-600'} text-white disabled:opacity-60 transition-colors`}>
        {busy ? 'Saving…' : 'Mark Responded'}
      </button>
    </div>
  )
}

function ParticipantDetail({ participant, checkins, onUpdate, onWallRespond }: {
  participant: Participant; checkins: Checkin[]
  onUpdate: (pid: number, aid: number, fields: Record<string, string>) => Promise<void>
  onWallRespond: (cid: number) => Promise<void>
}) {
  const app = participant.applications
  const inferred = inferDomain(app.identity_goal)
  const [domain, setDomain] = useState(inferred)
  const [showGuide, setShowGuide] = useState(false)
  const [habitRec, setHabitRec] = useState(participant.habit_recommendation ?? '')
  const [dmVerb, setDmVerb] = useState(app.dm_identity_verbatim ?? '')
  const [preSig, setPreSig] = useState(app.pre_sprint_signal ?? '')
  const [stageSig, setStageSig] = useState(app.stage_signal ?? '')
  const [outcome, setOutcome] = useState(app.outcome_type ?? '')
  const [outreachDoor, setOutreachDoor] = useState(app.outreach_door ?? 'unknown')
  const [relanchorType, setRelanchorType] = useState(app.relational_anchor_type ?? '')
  const [postCheckinStatus, setPostCheckinStatus] = useState(app.post_sprint_first_checkin_status ?? '')
  const [postLangSignal, setPostLangSignal] = useState(app.post_sprint_language_signal ?? '')
  const [completionStatement, setCompletionStatement] = useState(app.sprint_completion_statement ?? '')
  const [completionStatType, setCompletionStatType] = useState(app.sprint_completion_statement_type ?? '')
  const [momentFlag, setMomentFlag] = useState(app.moment_flag ?? false)
  const [momentText, setMomentText] = useState(app.moment_text ?? '')
  // Phase 4 — Identity Profile state
  const [signalTone, setSignalTone] = useState<'H1' | 'H2' | 'none'>(
    (app.pre_sprint_signal as 'H1' | 'H2' | 'none') || 'none'
  )
  const [identityProfile, setIdentityProfile] = useState<IdentityProfile | null>(participant.identity_profile ?? null)
  const [profileApproved, setProfileApproved] = useState(participant.identity_profile_approved ?? false)
  const [anchorStatement, setAnchorStatement] = useState(participant.anchor_statement ?? '')
  // BUG-020 fix (Forge H175): snapshot was uncontrolled — text silently lost on refresh.
  // Snapshot is the highest-trust coaching artifact; it cannot be recovered post-call.
  // Pattern mirrors anchorStatement: controlled state + persisted via approve body.
  const [snapshot, setSnapshot] = useState(participant.snapshot ?? '')
  const [showSnapshotGuide, setShowSnapshotGuide] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [approving, setApproving] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const ratings = checkins.map((c) => c.identity_rating)
  const walls = checkins.filter((c) => c.wall_triggered_at && !c.wall_responded_at)
  const card = DOMAIN_CARDS[domain]
  const meta = DOMAIN_META[domain]

  const generateProfile = async () => {
    setGenerating(true); setProfileError(null)
    try {
      const res = await fetch('/api/admin/generate-identity-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ participant_id: String(participant.id), signal_tone: signalTone }),
      })
      const data = await res.json()
      if (!res.ok) { setProfileError(data.error ?? 'Generation failed'); return }
      setIdentityProfile(data.profile)
    } catch {
      setProfileError('Network error — try again')
    } finally {
      setGenerating(false)
    }
  }

  const approveProfile = async () => {
    if (!identityProfile) return
    setApproving(true); setProfileError(null)
    try {
      const res = await fetch('/api/admin/approve-identity-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          participant_id: String(participant.id),
          anchor_statement: anchorStatement.trim() || undefined,
          // BUG-020 fix: include snapshot in approve body so it persists to DB
          snapshot: snapshot.trim() || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setProfileError(data.error ?? 'Approval failed'); return }
      setProfileApproved(true)
    } catch {
      setProfileError('Network error — try again')
    } finally {
      setApproving(false)
    }
  }

  const save = async () => {
    setSaving(true)
    await onUpdate(participant.id, app.id, {
      habit_recommendation: habitRec,
      dm_identity_verbatim: dmVerb,
      pre_sprint_signal: preSig,
      stage_signal: stageSig,
      outcome_type: outcome,
      outreach_door: outreachDoor,
      relational_anchor_type: relanchorType,
      post_sprint_first_checkin_status: postCheckinStatus,
      post_sprint_language_signal: postLangSignal,
      sprint_completion_statement: completionStatement,
      sprint_completion_statement_type: completionStatType,
      moment_flag: String(momentFlag),
      moment_text: momentText,
    })
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="border-t border-gray-100 bg-slate-50/60 p-5 space-y-4">
      {walls.map((c) => <WallBanner key={c.id} checkin={c} name={app.name} onRespond={onWallRespond} />)}

      {checkins.length > 0 && (
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Identity Rating Trend</p>
          <Sparkline ratings={ratings} />
          <div className="mt-2 space-y-1.5">
            {checkins.map((c) => (
              <div key={c.id} className="flex items-start gap-3 text-xs">
                <span className="text-gray-400 w-14 flex-shrink-0">Wk {c.week_number}</span>
                <span className={`font-bold w-6 flex-shrink-0 ${c.identity_rating >= 4 ? 'text-green-600' : c.identity_rating === 3 ? 'text-amber-600' : 'text-red-600'}`}>{c.identity_rating}/5</span>
                <div className="flex-1 min-w-0">
                  {c.reflection_text && <p className="text-gray-500 italic">&ldquo;{c.reflection_text.slice(0, 130)}{c.reflection_text.length > 130 ? '…' : ''}&rdquo;</p>}
                  <div className="flex gap-1.5 mt-0.5 flex-wrap">
                    {c.field_9_recognition && (
                      <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${c.field_9_recognition === 'H1' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                        {c.field_9_recognition === 'H1' ? '💡 H1' : '🔄 H2'}
                      </span>
                    )}
                    {c.wall_triggered_at && <span className="bg-red-100 text-red-600 px-1.5 py-0.5 rounded text-xs font-medium">🧱 Wall{c.wall_responded_at ? ' (ok)' : ' (pending)'}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {checkins.length === 0 && <p className="text-xs text-gray-400 italic">No check-ins yet.</p>}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Pre-Sprint Signal</label>
          <select value={preSig} onChange={(e) => setPreSig(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:border-indigo-400">
            <option value="">Not set</option>
            <option value="H1">H1 — That is exactly it</option>
            <option value="H2">H2 — Had not thought of it</option>
            <option value="none">None observed</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Stage Signal</label>
          <select value={stageSig} onChange={(e) => setStageSig(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:border-indigo-400">
            <option value="">Not set</option>
            <option value="action">🟢 Action</option>
            <option value="discovery">🟡 Discovery</option>
            <option value="assess">🔵 Assess</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Outcome Type</label>
          <select value={outcome} onChange={(e) => setOutcome(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:border-indigo-400">
            <option value="">Not set</option>
            <option value="A">A — Strong transformation</option>
            <option value="B">B — Moderate</option>
            <option value="C">C — Minimal / withdrawn</option>
          </select>
        </div>
      </div>

      {/* Outreach Door — pre-sprint acquisition tracking */}
      <div>
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">
          Outreach Door
          <span className="ml-1 text-gray-300 font-normal normal-case tracking-normal" title="Which outreach frame brought this participant in? Door A = identity change / exploration framing. Door B = mastery / depth framing. Platform refugees (BetterUp, Noom) → Door B by default.">ⓘ</span>
        </label>
        <select value={outreachDoor} onChange={(e) => setOutreachDoor(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:border-indigo-400">
          <option value="unknown">Unknown</option>
          <option value="a">Door A — Rescue Frame</option>
          <option value="b">Door B — Optimization Frame</option>
        </select>
        <p className="text-xs text-gray-400 mt-1">Set manually. Which outreach message did you send them?</p>
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">
          Relational Anchor Type
          <span className="ml-1 text-gray-300 font-normal normal-case tracking-normal" title="Did this participant name a relational witness before or after you asked? Spontaneous = named without prompting. Coached = named after 'Who in your life has noticed?' Probe. None = no relational anchor identified.">ⓘ</span>
        </label>
        <select value={relanchorType} onChange={(e) => setRelanchorType(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:border-indigo-400">
          <option value="">Not set</option>
          <option value="spontaneous">Spontaneous — named without prompting</option>
          <option value="coached">Coached — named after probe</option>
          <option value="none">None — no relational anchor</option>
        </select>
        <p className="text-xs text-gray-400 mt-1 italic">Did this participant name a relational witness before or after you asked?</p>
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">DM Identity Verbatim</label>
        <textarea value={dmVerb} onChange={(e) => setDmVerb(e.target.value)} rows={2} placeholder="Paste their DM answer here (optional)." className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:border-indigo-400 resize-none" />
      </div>

      {/* Post-Sprint Fields */}
      <div className="bg-slate-100 rounded-2xl p-4 space-y-3">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Post-Sprint</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">First Check-in (Post-Sprint)</label>
            <select value={postCheckinStatus} onChange={(e) => setPostCheckinStatus(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:border-indigo-400">
              <option value="">Not set</option>
              <option value="on_time">✅ On time</option>
              <option value="missed">❌ Missed</option>
              <option value="pending">⏳ Pending</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Post-Sprint Language Signal</label>
            <select value={postLangSignal} onChange={(e) => setPostLangSignal(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:border-indigo-400">
              <option value="">Not set</option>
              <option value="graduated">🎓 Graduated</option>
              <option value="threshold">⚠️ Threshold</option>
              <option value="unknown">❓ Unknown</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Sprint Completion Statement</label>
          <textarea value={completionStatement} onChange={(e) => setCompletionStatement(e.target.value)} rows={2} placeholder="Their New Chapter identity statement at sprint close…" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:border-indigo-400 resize-none" />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Statement Type</label>
          <select value={completionStatType} onChange={(e) => setCompletionStatType(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:border-indigo-400">
            <option value="">Not set</option>
            <option value="categorical">Categorical</option>
            <option value="process">Process</option>
            <option value="relational">Relational</option>
            <option value="null">Null</option>
          </select>
        </div>

        <div className="flex items-start gap-3">
          <input type="checkbox" id={`moment_flag_${participant.id}`} checked={momentFlag} onChange={(e) => setMomentFlag(e.target.checked)} className="mt-1 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
          <label htmlFor={`moment_flag_${participant.id}`} className="text-sm text-gray-700 font-medium">Recognition moment observed</label>
        </div>
        {momentFlag && (
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Moment Text</label>
            <textarea value={momentText} onChange={(e) => setMomentText(e.target.value)} rows={2} placeholder="Verbatim quote or coach note describing the recognition moment…" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:border-indigo-400 resize-none" />
          </div>
        )}
      </div>

      {/* ── Identity Profile (Phase 4 — requires phase4-identity-profile.sql migration) ── */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-indigo-700 uppercase tracking-wider">🪪 Identity Profile</p>
          {profileApproved && (
            <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">✅ Approved — visible to participant</span>
          )}
          {identityProfile && !profileApproved && (
            <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">Draft — pending approval</span>
          )}
        </div>

        {/* Signal tone selector — drives AI generation */}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
            Signal Tone
            <span className="ml-1 text-gray-400 font-normal normal-case tracking-normal" title="H1 = confirmation frame (they already know who they're becoming). H2 = recognition frame (they felt it but hadn't named it). Set based on your discovery call. REQUIRED before generating.">ⓘ</span>
          </label>
          <select
            value={signalTone}
            onChange={(e) => setSignalTone(e.target.value as 'H1' | 'H2' | 'none')}
            disabled={profileApproved}
            className="w-full border border-indigo-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:border-indigo-500 disabled:bg-gray-50 disabled:text-gray-400"
          >
            <option value="none">None — neutral framing</option>
            <option value="H1">H1 — &quot;That is exactly it&quot; (confirmation)</option>
            <option value="H2">H2 — &quot;I had not thought of it that way&quot; (recognition)</option>
          </select>
          <p className="text-xs text-indigo-500 mt-1">Set from discovery call observation. Drives the AI framing.</p>
        </div>

        {/* Generated profile display */}
        {identityProfile && (
          <div className="bg-white rounded-xl border border-indigo-200 p-4 space-y-2">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">AI Generated Draft</p>
            <p className="text-xl font-black text-indigo-900">{identityProfile.label}</p>
            <div className="flex gap-2 flex-wrap">
              {identityProfile.qualities.map((q) => (
                <span key={q} className="text-xs font-semibold bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full">{q}</span>
              ))}
            </div>
            <p className="text-xs text-gray-400">Generated {new Date(identityProfile.generated_at).toLocaleString()} · Tone: {identityProfile.signal_tone}</p>
          </div>
        )}

        {/* Coach-authored fields — Flux H174 LOCKED: these are NOT AI-generated */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">
              Day-in-the-life snapshot
            </label>
            {/* Craft H175 Option A: "How to write this" accordion — collapses by default */}
            {!profileApproved && (
              <button
                type="button"
                onClick={() => setShowSnapshotGuide(v => !v)}
                className="text-xs text-indigo-500 hover:text-indigo-700 underline"
              >
                {showSnapshotGuide ? 'Hide guide' : 'How to write this'}
              </button>
            )}
          </div>
          {showSnapshotGuide && (
            <div className="mb-2 bg-indigo-50 border border-indigo-200 rounded-xl p-3 text-xs text-indigo-800 space-y-2">
              <p className="font-semibold">Three parts every snapshot needs:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li><span className="font-medium">Opening habit moment</span> — What does their morning / evening / specific time look like?</li>
                <li><span className="font-medium">Decision frame</span> — What do they do when tempted that they don&apos;t do now?</li>
                <li><span className="font-medium">Identity anchor line</span> — Their own words reframed in first person, stated as already true.</li>
              </ol>
              <p className="font-semibold mt-1">Template:</p>
              <p className="font-mono bg-white rounded-lg p-2 border border-indigo-100 leading-relaxed">
                I wake up [specific time/detail].<br/>
                [Small daily practice they mentioned — present tense.]<br/><br/>
                When [the specific trigger they named], I [what the new version of them does].<br/><br/>
                [Closing identity line — their words, first person.]
              </p>
              <ul className="list-disc list-inside space-y-1 mt-1">
                <li>Use <span className="font-medium">their words</span> wherever possible</li>
                <li><span className="font-medium">2–3 sentences</span> is right — longer = description, not snapshot</li>
                <li>Aim for specific and true, not beautiful</li>
                <li><span className="font-medium">Write it same day</span> — the call is live in your memory now</li>
              </ul>
            </div>
          )}
          <textarea
            value={snapshot}
            onChange={(e) => setSnapshot(e.target.value)}
            rows={3}
            placeholder="Write this after your discovery call. First-person, specific to what they actually said."
            className="w-full border border-indigo-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:border-indigo-500 resize-none disabled:bg-gray-50 disabled:text-gray-400"
            disabled={profileApproved}
          />
          <p className="text-xs text-indigo-400 mt-1 italic">Write this after your discovery call. First-person, specific to what they actually said. Not AI-generated.</p>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
            Anchor statement
          </label>
          <textarea
            value={anchorStatement}
            onChange={(e) => setAnchorStatement(e.target.value)}
            rows={2}
            placeholder="Use their words from the call. Format: 'When [trigger], I [identity action].' e.g. 'When my alarm goes off, I am someone who gets up.'"
            className="w-full border border-indigo-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:border-indigo-500 resize-none disabled:bg-gray-50 disabled:text-gray-400"
            disabled={profileApproved}
          />
          <p className="text-xs text-indigo-400 mt-1 italic">Use their words from the call. &ldquo;When [trigger], I [identity action].&rdquo; This is what they heard from you — not AI-generated.</p>
        </div>

        {profileError && (
          <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{profileError}</p>
        )}

        {/* Actions */}
        {!profileApproved && (
          <div className="flex gap-3">
            <button
              onClick={generateProfile}
              disabled={generating || profileApproved}
              className="flex-1 bg-indigo-600 text-white py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 disabled:bg-indigo-300 transition-colors"
            >
              {generating ? 'Generating…' : identityProfile ? '↺ Re-generate Draft' : '✨ Generate Draft'}
            </button>
            {identityProfile && (
              <button
                onClick={approveProfile}
                disabled={approving}
                className="flex-1 bg-green-600 text-white py-2 rounded-xl text-sm font-bold hover:bg-green-700 disabled:bg-green-300 transition-colors"
              >
                {approving ? 'Approving…' : '✅ Approve & Reveal'}
              </button>
            )}
          </div>
        )}
        {profileApproved && (
          <p className="text-xs text-green-600 text-center font-medium">Profile approved and visible to participant. Permanent — cannot be changed.</p>
        )}
      </div>

      <div>
        <button onClick={() => setShowGuide(!showGuide)} className="flex items-center gap-2 text-sm font-bold text-indigo-700 hover:text-indigo-900 transition-colors">
          <span>📞 Discovery Call Guide</span>
          <span className="text-gray-400 text-xs">{showGuide ? '▲' : '▼'}</span>
        </button>

        {showGuide && (
          <div className="mt-3 bg-white rounded-2xl border border-indigo-100 p-4 space-y-3">
            <p className="text-xs text-gray-400 italic">You have already read their application. This helps you scope the one habit to start with.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Identity Goal</p>
                <p className="text-xs text-gray-700">{app.identity_goal}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">What They Have Tried</p>
                <p className="text-xs text-gray-700">{app.tried_before}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Why Now</p>
                <p className="text-xs text-gray-700">{app.why_now}</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Domain — inferred: {meta.emoji} {meta.label}</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(DOMAIN_META).map(([k, { emoji, label }]) => (
                  <button key={k} onClick={() => setDomain(k)} className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${domain === k ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                    {emoji} {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-indigo-600 text-white rounded-xl px-4 py-3">
              <p className="text-xs font-bold uppercase tracking-widest text-indigo-200 mb-0.5">Gateway Habit</p>
              <p className="text-base font-black">{meta.emoji} {card.habit}</p>
            </div>
            <div className="bg-gray-50 rounded-xl px-4 py-3">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Why It Works (say this)</p>
              <p className="text-xs text-gray-700 italic leading-relaxed">{card.whyItWorks}</p>
            </div>
            <div className="bg-gray-50 rounded-xl px-4 py-3">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Week 1 Minimum</p>
              <p className="text-xs text-gray-700">{card.weekOneMin}</p>
            </div>
            <div className="bg-amber-50 rounded-xl px-4 py-3">
              <p className="text-xs font-bold text-amber-600 uppercase tracking-wide mb-1">Watch For</p>
              <p className="text-xs text-amber-800">{card.watchFor}</p>
            </div>
            {card.warning && (
              <div className="bg-red-50 rounded-xl px-4 py-3">
                <p className="text-xs text-red-700">{card.warning}</p>
              </div>
            )}
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-3">
              <p className="text-xs font-bold text-indigo-600 uppercase tracking-wide mb-1">Identity Anchor — say this first</p>
              <p className="text-sm font-semibold text-indigo-800 leading-relaxed">{card.identityAnchor}</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Prescribed Habit (assign after the call)</label>
              <input type="text" value={habitRec} onChange={(e) => setHabitRec(e.target.value)} placeholder={`e.g. ${card.habit}`} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400" />
              <p className="text-xs text-gray-400 mt-1">Saves to sprint_participants.habit_recommendation</p>
            </div>
          </div>
        )}
      </div>

      {participant.habit_recommendation && (
        <div className="bg-indigo-600 text-white rounded-xl px-4 py-3">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-200 mb-0.5">Prescribed Habit</p>
          <p className="text-base font-black">{participant.habit_recommendation}</p>
          <p className="text-xs text-indigo-200 mt-0.5">{DOMAIN_META[inferred].emoji} {DOMAIN_META[inferred].label} (inferred domain)</p>
        </div>
      )}

      <button onClick={save} disabled={saving} className="w-full bg-indigo-600 text-white py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 disabled:bg-indigo-400 transition-colors">
        {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save Changes'}
      </button>
    </div>
  )
}

function ParticipantCard({ participant, checkins, onUpdate, onWallRespond }: {
  participant: Participant; checkins: Checkin[]
  onUpdate: (pid: number, aid: number, fields: Record<string, string>) => Promise<void>
  onWallRespond: (cid: number) => Promise<void>
}) {
  const app = participant.applications
  const [expanded, setExpanded] = useState(false)
  const ratings = checkins.map((c) => c.identity_rating)
  const latestRating = ratings[ratings.length - 1]
  const hasWall = checkins.some((c) => c.wall_triggered_at && !c.wall_responded_at)

  const stageColors: Record<string, string> = {
    action: 'bg-green-100 text-green-700',
    discovery: 'bg-amber-100 text-amber-700',
    assess: 'bg-blue-100 text-blue-700',
  }

  return (
    <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${hasWall ? 'border-red-200' : 'border-gray-100'}`}>
      <button onClick={() => setExpanded(!expanded)} className="w-full text-left p-5 hover:bg-gray-50/60 transition-colors">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <h3 className="text-base font-bold text-gray-900">{app.name}</h3>
              {hasWall && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-semibold">⚠️ Needs attention</span>}
              {participant.habit_recommendation && <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-semibold">💊 Habit assigned</span>}
            </div>
            <p className="text-xs text-gray-500">{app.email}{app.whatsapp ? ` · ${app.whatsapp}` : ''}</p>
            <p className="text-xs text-gray-600 mt-1 line-clamp-1 italic">{app.identity_goal}</p>
          </div>
          <div className="flex-shrink-0 flex flex-col items-end gap-1.5">
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${participant.status === 'active' ? 'bg-green-50 text-green-700' : participant.status === 'completed' ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
              {participant.status}
            </span>
            {app.stage_signal && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${stageColors[app.stage_signal] || 'bg-gray-100 text-gray-500'}`}>
                {app.stage_signal === 'action' ? '🟢' : app.stage_signal === 'discovery' ? '🟡' : '🔵'} {app.stage_signal}
              </span>
            )}
            {app.pre_sprint_signal && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full font-mono">{app.pre_sprint_signal}</span>
            )}
            {ratings.length > 0 && <Sparkline ratings={ratings} />}
            <span className="text-xs text-gray-400">{expanded ? '▲' : '▼'}</span>
          </div>
        </div>
      </button>

      {expanded && (
        <ParticipantDetail participant={participant} checkins={checkins} onUpdate={onUpdate} onWallRespond={onWallRespond} />
      )}
    </div>
  )
}

export default function ParticipantsPage() {
  const [participants, setParticipants] = useState<Participant[]>([])
  const [checkinsByApp, setCheckinsByApp] = useState<Record<number, Checkin[]>>({})
  const [loading, setLoading] = useState(true)
  const [sortField, setSortField] = useState<SortField>('enrolled_at')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [wallOnly, setWallOnly] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/admin/participants')
    if (res.ok) {
      const data = await res.json()
      setParticipants(data.participants || [])
      setCheckinsByApp(data.checkinsByApp || {})
    }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const handleUpdate = useCallback(async (pid: number, aid: number, fields: Record<string, string>) => {
    await fetch('/api/admin/participants', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ participant_id: pid, application_id: aid, ...fields }),
    })
    await load()
  }, [load])

  const handleWallRespond = useCallback(async (cid: number) => {
    await fetch('/api/admin/checkins', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ checkin_id: cid }),
    })
    await load()
  }, [load])

  const sorted = [...participants]
    .filter((p) => filterStatus === 'all' || p.status === filterStatus)
    .filter((p) => {
      if (!wallOnly) return true
      const c = checkinsByApp[p.application_id] || []
      return c.some((ch) => ch.wall_triggered_at && !ch.wall_responded_at)
    })
    .sort((a, b) => {
      let av: string | number = 0, bv: string | number = 0
      if (sortField === 'name') { av = a.applications.name.toLowerCase(); bv = b.applications.name.toLowerCase() }
      else if (sortField === 'enrolled_at') { av = a.enrolled_at; bv = b.enrolled_at }
      else if (sortField === 'status') { av = a.status; bv = b.status }
      else if (sortField === 'latest_rating') {
        const ac = checkinsByApp[a.application_id] || []
        const bc = checkinsByApp[b.application_id] || []
        av = ac.length > 0 ? ac[ac.length - 1].identity_rating : 0
        bv = bc.length > 0 ? bc[bc.length - 1].identity_rating : 0
      }
      if (av < bv) return sortDir === 'asc' ? -1 : 1
      if (av > bv) return sortDir === 'asc' ? 1 : -1
      return 0
    })

  const wallCount = participants.filter((p) => {
    const c = checkinsByApp[p.application_id] || []
    return c.some((ch) => ch.wall_triggered_at && !ch.wall_responded_at)
  }).length

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('asc') }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Sprint Participants</h1>
            <p className="text-gray-500 text-sm mt-1">
              {participants.length} enrolled
              {wallCount > 0 && <span className="ml-2 text-red-600 font-semibold">&middot; {wallCount} wall alert{wallCount > 1 ? 's' : ''}</span>}
            </p>
          </div>
          <div className="flex gap-3">
            <a href="/admin" className="text-gray-500 hover:text-gray-700 text-sm py-2 px-4">&larr; Admin Home</a>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-5 items-center">
          <div className="flex gap-2">
            {['all', 'active', 'completed', 'withdrawn'].map((s) => (
              <button key={s} onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${filterStatus === s ? 'bg-gray-800 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>
                {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
          <button onClick={() => setWallOnly(!wallOnly)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${wallOnly ? 'bg-red-600 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>
            Wall alerts{wallCount > 0 ? ` (${wallCount})` : ''}
          </button>
          <div className="ml-auto flex gap-2 items-center">
            <span className="text-xs text-gray-400">Sort:</span>
            {(['name', 'enrolled_at', 'status', 'latest_rating'] as SortField[]).map((f) => (
              <button key={f} onClick={() => toggleSort(f)}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${sortField === f ? 'bg-indigo-100 text-indigo-700' : 'bg-white text-gray-500 border border-gray-200'}`}>
                {f === 'enrolled_at' ? 'Enrolled' : f === 'latest_rating' ? 'Rating' : f.charAt(0).toUpperCase() + f.slice(1)}
                {sortField === f && <span className="ml-0.5">{sortDir === 'asc' ? '↑' : '↓'}</span>}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-400">Loading participants&hellip;</div>
        ) : sorted.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-4">👥</p>
            <p>{participants.length === 0 ? 'No participants yet. Enroll applicants from the admin page.' : 'No participants match your filters.'}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sorted.map((p) => (
              <ParticipantCard
                key={p.id}
                participant={p}
                checkins={checkinsByApp[p.application_id] || []}
                onUpdate={handleUpdate}
                onWallRespond={handleWallRespond}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
