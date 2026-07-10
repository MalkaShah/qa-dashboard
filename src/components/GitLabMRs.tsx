import { useState } from 'react'
import type { GitLabMR, MRState } from '../lib/gitlabApi'

// State badge palette
const STATE_STYLE: Record<MRState, { bg: string; border: string; text: string; glow: string; label: string }> = {
  opened: {
    bg:     'rgba(16,185,129,0.14)',
    border: 'rgba(16,185,129,0.35)',
    text:   '#34d399',
    glow:   'rgba(16,185,129,0.2)',
    label:  'Open',
  },
  merged: {
    bg:     'rgba(168,85,247,0.14)',
    border: 'rgba(168,85,247,0.35)',
    text:   '#c084fc',
    glow:   'rgba(168,85,247,0.2)',
    label:  'Merged',
  },
  closed: {
    bg:     'rgba(239,68,68,0.14)',
    border: 'rgba(239,68,68,0.35)',
    text:   '#f87171',
    glow:   'rgba(239,68,68,0.2)',
    label:  'Closed',
  },
}

type FilterTab = 'All' | MRState

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function StatBadge({ label, count, active, onClick, color }: {
  label: string
  count: number
  active: boolean
  onClick: () => void
  color: { bg: string; border: string; text: string; glow: string }
}) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? color.bg : 'rgba(6,11,24,0.5)',
        border: `1px solid ${active ? color.border : 'rgba(148,163,184,0.08)'}`,
        color: active ? color.text : '#64748b',
        boxShadow: active ? `0 0 12px ${color.glow}` : 'none',
        transition: 'all 0.15s ease',
        cursor: 'pointer',
      }}
      className="text-xs px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5"
    >
      {label}
      <span
        style={{
          background: active ? color.bg : 'rgba(148,163,184,0.08)',
          border: `1px solid ${active ? color.border : 'rgba(148,163,184,0.1)'}`,
          color: active ? color.text : '#475569',
          padding: '0 6px',
          borderRadius: 100,
          fontSize: 10,
          fontWeight: 700,
        }}
      >
        {count}
      </span>
    </button>
  )
}

export default function GitLabMRs({ mrs, error }: { mrs: GitLabMR[]; error?: string | null }) {
  const [activeTab, setActiveTab] = useState<FilterTab>('All')

  const counts = {
    opened: mrs.filter(m => m.state === 'opened').length,
    merged:  mrs.filter(m => m.state === 'merged').length,
    closed:  mrs.filter(m => m.state === 'closed').length,
  }

  const filtered = activeTab === 'All' ? mrs : mrs.filter(m => m.state === activeTab)

  return (
    <div
      className="card-hover animate-fade-up mb-6"
      style={{ animationDelay: '450ms', animationFillMode: 'both' }}
    >
      <div
        style={{
          background: 'rgba(15,23,42,0.7)',
          border: '1px solid rgba(168,85,247,0.15)',
          backdropFilter: 'blur(16px)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
        }}
        className="rounded-2xl p-4 sm:p-6"
      >
        {/* Header */}
        <div className="flex items-start sm:items-center gap-3 mb-5 flex-wrap">
          <div
            style={{
              background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
              boxShadow: '0 0 20px rgba(168,85,247,0.35)',
              flexShrink: 0,
            }}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-base sm:text-lg"
          >
            ⎇
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm sm:text-base font-bold text-white">GitLab Merge Requests</h2>
            <p className="text-slate-500 text-xs mt-0.5">
              {mrs.length} total &mdash; {counts.opened} open, {counts.merged} merged, {counts.closed} closed
            </p>
          </div>

          {/* Total badge */}
          <div
            style={{
              background: 'rgba(168,85,247,0.12)',
              border: '1px solid rgba(168,85,247,0.25)',
              boxShadow: '0 0 12px rgba(168,85,247,0.1)',
            }}
            className="text-purple-300 text-xs px-2.5 py-1.5 rounded-full font-bold flex-shrink-0"
          >
            {mrs.length} total
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {/* All tab */}
          <button
            onClick={() => setActiveTab('All')}
            style={{
              background: activeTab === 'All' ? 'rgba(99,102,241,0.15)' : 'rgba(6,11,24,0.5)',
              border: `1px solid ${activeTab === 'All' ? 'rgba(99,102,241,0.3)' : 'rgba(148,163,184,0.08)'}`,
              color: activeTab === 'All' ? '#818cf8' : '#64748b',
              boxShadow: activeTab === 'All' ? '0 0 12px rgba(99,102,241,0.15)' : 'none',
              transition: 'all 0.15s ease',
              cursor: 'pointer',
            }}
            className="text-xs px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5"
          >
            All
            <span
              style={{
                background: activeTab === 'All' ? 'rgba(99,102,241,0.2)' : 'rgba(148,163,184,0.08)',
                border: `1px solid ${activeTab === 'All' ? 'rgba(99,102,241,0.3)' : 'rgba(148,163,184,0.1)'}`,
                color: activeTab === 'All' ? '#818cf8' : '#475569',
                padding: '0 6px',
                borderRadius: 100,
                fontSize: 10,
                fontWeight: 700,
              }}
            >
              {mrs.length}
            </span>
          </button>

          <StatBadge
            label="Open"
            count={counts.opened}
            active={activeTab === 'opened'}
            onClick={() => setActiveTab('opened')}
            color={STATE_STYLE.opened}
          />
          <StatBadge
            label="Merged"
            count={counts.merged}
            active={activeTab === 'merged'}
            onClick={() => setActiveTab('merged')}
            color={STATE_STYLE.merged}
          />
          <StatBadge
            label="Closed"
            count={counts.closed}
            active={activeTab === 'closed'}
            onClick={() => setActiveTab('closed')}
            color={STATE_STYLE.closed}
          />
        </div>

        {/* MR list */}
        <div className="flex flex-col gap-2 max-h-96 overflow-y-auto pr-1">
          {filtered.map(mr => {
            const s = STATE_STYLE[mr.state]
            const dateIso = mr.state === 'merged' && mr.merged_at ? mr.merged_at : mr.created_at
            const dateLabel = mr.state === 'merged' ? 'Merged' : mr.state === 'closed' ? 'Closed' : 'Opened'

            return (
              <a
                key={mr.iid}
                href={mr.web_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: 'rgba(6,11,24,0.55)',
                  border: `1px solid ${s.border}44`,
                  transition: 'all 0.15s ease',
                  textDecoration: 'none',
                }}
                className="flex items-start sm:items-center gap-3 p-3 rounded-xl group"
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLAnchorElement
                  el.style.background = s.bg
                  el.style.borderColor = s.border
                  el.style.boxShadow = `0 0 14px ${s.glow}`
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLAnchorElement
                  el.style.background = 'rgba(6,11,24,0.55)'
                  el.style.borderColor = `${s.border}44`
                  el.style.boxShadow = 'none'
                }}
              >
                {/* MR number */}
                <div
                  style={{ color: s.text, flexShrink: 0 }}
                  className="font-mono text-xs font-bold w-12 text-right"
                >
                  !{mr.iid}
                </div>

                {/* Title */}
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-medium truncate group-hover:text-slate-100 transition-colors">
                    {mr.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {/* Target branch pill */}
                    <span
                      style={{
                        background: 'rgba(6,11,24,0.7)',
                        border: '1px solid rgba(148,163,184,0.12)',
                        color: '#94a3b8',
                        fontFamily: 'monospace',
                      }}
                      className="text-[10px] px-1.5 py-0.5 rounded"
                    >
                      {mr.target_branch}
                    </span>
                    {/* Date */}
                    <span className="text-slate-600 text-[10px]">
                      {dateLabel} {formatDate(dateIso)}
                    </span>
                  </div>
                </div>

                {/* State badge */}
                <div
                  style={{
                    background: s.bg,
                    border: `1px solid ${s.border}`,
                    color: s.text,
                    flexShrink: 0,
                  }}
                  className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                >
                  {s.label}
                </div>

                {/* Arrow */}
                <span
                  style={{ color: s.text }}
                  className="text-xs opacity-30 group-hover:opacity-100 transition-opacity flex-shrink-0"
                >
                  ↗
                </span>
              </a>
            )
          })}
        </div>

        {error && mrs.length === 0 && (
          <div className="text-center py-8" style={{ color: '#f87171', fontSize: 13 }}>
            ⚠️ Failed to load MRs: {error}
          </div>
        )}
        {!error && filtered.length === 0 && (
          <div className="text-center py-8 text-slate-600 text-sm">
            No merge requests in this filter
          </div>
        )}
      </div>
    </div>
  )
}
