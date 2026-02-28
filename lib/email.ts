// Identity Sprint — Email Utilities (Resend)
import { Resend } from 'resend'

const COACH_EMAIL = 'v80102050@gmail.com'
const FROM_EMAIL = 'Identity Sprint <onboarding@resend.dev>'

function getResend() {
  const key = process.env.RESEND_API_KEY
  if (!key) {
    console.warn('[Email] RESEND_API_KEY not set — email skipped')
    return null
  }
  return new Resend(key)
}

// ============================================================
// Milestone notification to coach
// ============================================================
export async function sendMilestoneNotification(params: {
  userName: string
  userEmail: string
  dayNumber: number
  durationDays: number
  token: string
}) {
  const resend = getResend()
  if (!resend) return

  const trackerUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://identity-sprint.vercel.app'}/tracker/${params.token}`

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: COACH_EMAIL,
      subject: `🏆 Milestone reached: ${params.userName} hit Day ${params.dayNumber}!`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #7c3aed;">Milestone Alert 🎉</h2>
          <p><strong>${params.userName}</strong> (${params.userEmail}) just reached <strong>Day ${params.dayNumber}</strong> of their ${params.durationDays}-day challenge!</p>
          <p>This is a milestone day — they deserve a review session prompt and some encouragement.</p>
          <a href="${trackerUrl}" style="display:inline-block;background:#7c3aed;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;margin-top:16px;">
            View Their Tracker
          </a>
          <hr style="margin:24px 0;border:none;border-top:1px solid #eee;" />
          <p style="color:#888;font-size:12px;">Identity Sprint Coach Dashboard</p>
        </div>
      `,
    })
    console.log(`[Email] Milestone notification sent for ${params.userName} day ${params.dayNumber}`)
  } catch (err) {
    console.error('[Email] Failed to send milestone notification:', err)
  }
}

// ============================================================
// Adaptive algorithm: low adherence notification
// ============================================================
export async function sendLowAdherenceNotification(params: {
  userName: string
  userEmail: string
  habitName: string
  adherencePct: number
  simplerVersion: string | null
  token: string
}) {
  const resend = getResend()
  if (!resend) return

  const trackerUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://identity-sprint.vercel.app'}/tracker/${params.token}`

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: COACH_EMAIL,
      subject: `⚠️ Low adherence: ${params.userName} needs support`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #f59e0b;">Adherence Alert ⚠️</h2>
          <p><strong>${params.userName}</strong> (${params.userEmail}) has dropped below 60% adherence on a habit.</p>
          
          <table style="border-collapse:collapse;width:100%;margin:16px 0;">
            <tr>
              <td style="padding:8px;border:1px solid #eee;font-weight:600;">Habit</td>
              <td style="padding:8px;border:1px solid #eee;">${params.habitName}</td>
            </tr>
            <tr>
              <td style="padding:8px;border:1px solid #eee;font-weight:600;">7-Day Adherence</td>
              <td style="padding:8px;border:1px solid #eee;color:#ef4444;">${params.adherencePct}%</td>
            </tr>
            ${params.simplerVersion ? `
            <tr>
              <td style="padding:8px;border:1px solid #eee;font-weight:600;">Suggested Simplification</td>
              <td style="padding:8px;border:1px solid #eee;color:#7c3aed;">${params.simplerVersion}</td>
            </tr>
            ` : ''}
          </table>

          <p>The app has already suggested the simplified version to the user. Consider reaching out for a coaching check-in.</p>
          
          <a href="${trackerUrl}" style="display:inline-block;background:#7c3aed;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;margin-top:16px;">
            View Their Tracker
          </a>
          <hr style="margin:24px 0;border:none;border-top:1px solid #eee;" />
          <p style="color:#888;font-size:12px;">Identity Sprint Coach Dashboard</p>
        </div>
      `,
    })
    console.log(`[Email] Low adherence notification sent for ${params.userName}`)
  } catch (err) {
    console.error('[Email] Failed to send low adherence notification:', err)
  }
}
