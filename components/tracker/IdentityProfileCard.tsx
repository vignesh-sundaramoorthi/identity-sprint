'use client'

import { IdentityProfile } from '@/lib/types'

interface IdentityProfileCardProps {
  identityProfile: IdentityProfile | null
  identityProfileApproved: boolean
  anchorStatement: string | null
  snapshot: string | null
}

export default function IdentityProfileCard({
  identityProfile,
  identityProfileApproved,
  anchorStatement,
  snapshot,
}: IdentityProfileCardProps) {
  const isRevealed = identityProfileApproved && identityProfile !== null

  if (!isRevealed) {
    // Pending / frosted card
    return (
      <div className="relative overflow-hidden rounded-2xl mb-4">
        {/* Frosted dark card */}
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 border border-indigo-900/40 rounded-2xl p-6">
          {/* Blurred placeholder content behind */}
          <div className="absolute inset-0 flex flex-col gap-3 p-6 pointer-events-none select-none opacity-20 blur-sm">
            <div className="h-4 bg-indigo-400 rounded w-2/3" />
            <div className="h-3 bg-indigo-300 rounded w-1/2" />
            <div className="flex gap-2 mt-2">
              <div className="h-6 bg-indigo-500 rounded-full w-20" />
              <div className="h-6 bg-indigo-500 rounded-full w-24" />
              <div className="h-6 bg-indigo-500 rounded-full w-16" />
            </div>
            <div className="h-3 bg-indigo-200 rounded w-full mt-2" />
            <div className="h-3 bg-indigo-200 rounded w-4/5" />
          </div>

          {/* Overlay content */}
          <div className="relative z-10 text-center py-2">
            <div className="w-10 h-10 rounded-full bg-indigo-900/60 border border-indigo-700/50 flex items-center justify-center mx-auto mb-3">
              <svg
                className="w-5 h-5 text-indigo-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                />
              </svg>
            </div>
            <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400/80 mb-1">
              Identity Profile
            </p>
            <p className="text-white font-semibold text-sm leading-snug">
              Your Identity Profile is being crafted by your coach.
            </p>
            <p className="text-indigo-300/70 text-xs mt-1">
              You&apos;ll see it here on Day 1.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Approved — reveal the full profile
  return (
    <div className="rounded-2xl mb-4 overflow-hidden bg-gradient-to-br from-[#1e1b4b] via-[#1a1040] to-[#0f0f1a] border border-indigo-800/50 shadow-lg shadow-indigo-950/40">
      {/* Top accent line */}
      <div className="h-0.5 bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-500" />

      <div className="p-5">
        {/* Label */}
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-400/70">
            Identity Profile
          </span>
        </div>

        <h3 className="text-white font-black text-xl leading-tight mb-3 tracking-tight">
          {identityProfile.label}
        </h3>

        {/* Qualities */}
        <div className="flex flex-wrap gap-2 mb-4">
          {identityProfile.qualities.map((quality, i) => (
            <span
              key={i}
              className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-900/60 border border-indigo-700/50 text-indigo-200"
            >
              {quality}
            </span>
          ))}
        </div>

        {/* Anchor statement */}
        {anchorStatement && (
          <div className="border-t border-indigo-800/40 pt-4 mb-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-indigo-400/60 mb-1.5">
              Your Anchor
            </p>
            <p className="text-indigo-100 text-sm leading-relaxed font-medium">
              &ldquo;{anchorStatement}&rdquo;
            </p>
          </div>
        )}

        {/* Snapshot */}
        {snapshot && (
          <div className="border-t border-indigo-800/40 pt-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-indigo-400/60 mb-1.5">
              Your Snapshot
            </p>
            <p className="text-indigo-200/80 text-sm leading-relaxed italic">
              {snapshot}
            </p>
          </div>
        )}
      </div>

      {/* Bottom accent */}
      <div className="h-0.5 bg-gradient-to-r from-transparent via-indigo-800/50 to-transparent" />
    </div>
  )
}
