'use client'

import { useState, useCallback } from 'react'
import { getStreakCaption } from '@/lib/constants/streakCard'

interface StreakShareCardProps {
  dayNumber: number
  userName: string | null
  identityName: string | null        // identity profile label (approved)
  becomingStatement: string | null   // from applications.identity_declaration
  token: string                      // challenge token (for OG URL if needed)
}

const MILESTONE_DAYS = [7, 14, 21, 30]

function isMilestoneDay(day: number): boolean {
  return MILESTONE_DAYS.includes(day)
}

function getOgImageUrl(day: number, name: string | null): string {
  const params = new URLSearchParams({ day: String(day) })
  if (name) params.set('name', name)
  return `/api/og/streak?${params.toString()}`
}

export default function StreakShareCard({
  dayNumber,
  userName,
  identityName,
  becomingStatement,
}: StreakShareCardProps) {
  const [open, setOpen] = useState(false)
  const [caption, setCaption] = useState<string>(() =>
    getStreakCaption(dayNumber, identityName, becomingStatement)
  )
  const [copied, setCopied] = useState(false)
  const [sharing, setSharing] = useState(false)

  const displayName = userName ? userName.split(' ')[0] : null
  const ogUrl = getOgImageUrl(dayNumber, displayName)

  // Absolute URL for sharing (works client-side)
  const absoluteOgUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}${ogUrl}`
      : ogUrl

  const handleCopyCaption = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(caption)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback: select text in textarea
    }
  }, [caption])

  const handleNativeShare = useCallback(async () => {
    if (!navigator.share) return
    setSharing(true)
    try {
      await navigator.share({
        title: 'Identity Sprint Streak',
        text: caption,
        url: absoluteOgUrl,
      })
    } catch {
      // User cancelled — no-op
    } finally {
      setSharing(false)
    }
  }, [caption, absoluteOgUrl])

  const handleDownload = useCallback(() => {
    const a = document.createElement('a')
    a.href = ogUrl
    a.download = `identity-sprint-day-${dayNumber}.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }, [ogUrl, dayNumber])

  // Determine if we should show the button prominently (milestone) or subtly (always)
  const isMilestone = isMilestoneDay(dayNumber)

  if (!isMilestone) {
    // Subtle "share" link — always visible but unobtrusive
    return (
      <>
        <button
          onClick={() => setOpen(true)}
          className="w-full text-center text-xs text-gray-400 hover:text-indigo-400 transition-colors py-2 mb-2"
        >
          Share your streak →
        </button>
        {open && (
          <ShareModal
            dayNumber={dayNumber}
            caption={caption}
            setCaption={setCaption}
            ogUrl={ogUrl}
            absoluteOgUrl={absoluteOgUrl}
            copied={copied}
            sharing={sharing}
            onCopy={handleCopyCaption}
            onNativeShare={handleNativeShare}
            onDownload={handleDownload}
            onClose={() => setOpen(false)}
          />
        )}
      </>
    )
  }

  return (
    <>
      {/* Milestone: prominent share card */}
      <div className="rounded-2xl mb-4 overflow-hidden bg-gradient-to-br from-[#1e1b4b] via-[#1a1040] to-[#0f0f1a] border border-indigo-800/50">
        <div className="h-0.5 bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-500" />
        <div className="p-5">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-400/70">
              Milestone — Day {dayNumber}
            </span>
          </div>
          <p className="text-white font-semibold text-sm mb-3">
            Share your streak 🔥
          </p>
          <button
            onClick={() => setOpen(true)}
            className="w-full bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white py-3 rounded-xl font-semibold text-sm transition-colors"
          >
            Share Day {dayNumber} Card
          </button>
        </div>
        <div className="h-0.5 bg-gradient-to-r from-transparent via-indigo-800/50 to-transparent" />
      </div>

      {open && (
        <ShareModal
          dayNumber={dayNumber}
          caption={caption}
          setCaption={setCaption}
          ogUrl={ogUrl}
          absoluteOgUrl={absoluteOgUrl}
          copied={copied}
          sharing={sharing}
          onCopy={handleCopyCaption}
          onNativeShare={handleNativeShare}
          onDownload={handleDownload}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}

// ─── Share Modal ──────────────────────────────────────────────────────────────

interface ShareModalProps {
  dayNumber: number
  caption: string
  setCaption: (v: string) => void
  ogUrl: string
  absoluteOgUrl: string
  copied: boolean
  sharing: boolean
  onCopy: () => void
  onNativeShare: () => void
  onDownload: () => void
  onClose: () => void
}

function ShareModal({
  dayNumber,
  caption,
  setCaption,
  ogUrl,
  absoluteOgUrl,
  copied,
  sharing,
  onCopy,
  onNativeShare,
  onDownload,
  onClose,
}: ShareModalProps) {
  const hasNativeShare = typeof navigator !== 'undefined' && !!navigator.share

  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(absoluteOgUrl)}`
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(caption)}&url=${encodeURIComponent(absoluteOgUrl)}`

  return (
    <div className="fixed inset-0 bg-black/70 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-[#0f0f1a] border border-indigo-900/50 rounded-2xl w-full max-w-sm shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-indigo-900/40">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-400/70">
              Share Your Streak
            </p>
            <p className="text-white font-semibold text-sm">Day {dayNumber}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Card preview */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={ogUrl}
            alt={`Day ${dayNumber} streak card`}
            className="w-full rounded-xl border border-indigo-900/40 object-cover"
            style={{ aspectRatio: '1200/630' }}
          />

          {/* Caption editor */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-indigo-400/60 mb-1.5">
              Caption (edit before sharing)
            </label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={4}
              className="w-full text-sm bg-[#1a1040] border border-indigo-800/50 rounded-xl p-3 resize-none focus:outline-none focus:border-indigo-500 text-indigo-100 placeholder-indigo-800"
            />
            <button
              onClick={onCopy}
              className="mt-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              {copied ? '✓ Copied!' : 'Copy caption'}
            </button>
          </div>

          {/* Share actions */}
          <div className="space-y-2">
            {/* Mobile: Web Share API */}
            {hasNativeShare && (
              <button
                onClick={onNativeShare}
                disabled={sharing}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white py-3 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
              >
                {sharing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sharing...
                  </>
                ) : (
                  '📤 Share'
                )}
              </button>
            )}

            {/* Desktop: platform links */}
            <div className="flex gap-2">
              <a
                href={linkedInUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 bg-[#0a66c2]/20 hover:bg-[#0a66c2]/30 border border-[#0a66c2]/40 text-[#5aa3e8] py-2.5 rounded-xl font-semibold text-xs transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
                LinkedIn
              </a>
              <a
                href={twitterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 bg-[#1da1f2]/10 hover:bg-[#1da1f2]/20 border border-[#1da1f2]/30 text-[#60b8f5] py-2.5 rounded-xl font-semibold text-xs transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                X / Twitter
              </a>
            </div>

            {/* Download */}
            <button
              onClick={onDownload}
              className="w-full flex items-center justify-center gap-2 border border-indigo-800/50 hover:border-indigo-700 text-indigo-300 hover:text-indigo-200 py-2.5 rounded-xl font-semibold text-sm transition-colors"
            >
              ↓ Download image
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
