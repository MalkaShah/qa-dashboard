interface Ticket { tool: string }

const TOOL_STYLE: Record<string, { bar: string; bg: string; text: string; glow: string }> = {
  'OTTO SEO':            { bar: '#f97316', bg: 'rgba(249,115,22,0.12)',  text: '#fb923c', glow: 'rgba(249,115,22,0.3)'  },
  'OTTO PPC':            { bar: '#ef4444', bg: 'rgba(239,68,68,0.12)',   text: '#f87171', glow: 'rgba(239,68,68,0.3)'   },
  'Site Explorer':       { bar: '#06b6d4', bg: 'rgba(6,182,212,0.12)',   text: '#22d3ee', glow: 'rgba(6,182,212,0.3)'   },
  'Content Genius':      { bar: '#10b981', bg: 'rgba(16,185,129,0.12)',  text: '#34d399', glow: 'rgba(16,185,129,0.3)'  },
  'Authority Builder':   { bar: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  text: '#fbbf24', glow: 'rgba(245,158,11,0.3)'  },
  'GSC':                 { bar: '#3b82f6', bg: 'rgba(59,130,246,0.12)',  text: '#60a5fa', glow: 'rgba(59,130,246,0.3)'  },
  'Report Builder':      { bar: '#ec4899', bg: 'rgba(236,72,153,0.12)',  text: '#f472b6', glow: 'rgba(236,72,153,0.3)'  },
  'French Localization': { bar: '#a855f7', bg: 'rgba(168,85,247,0.12)', text: '#c084fc', glow: 'rgba(168,85,247,0.3)'  },
  'Local SEO/GBP':       { bar: '#8b5cf6', bg: 'rgba(139,92,246,0.12)', text: '#a78bfa', glow: 'rgba(139,92,246,0.3)'  },
}
const DEFAULT = { bar: '#6366f1', bg: 'rgba(99,102,241,0.12)', text: '#818cf8', glow: 'rgba(99,102,241,0.3)' }

interface Props { gitlab: Ticket[]; linear: Ticket[] }

export default function ToolBreakdown({ gitlab, linear }: Props) {
  const counts: Record<string, { gl: number; ln: number }> = {}
  for (const t of gitlab) {
    if (!counts[t.tool]) counts[t.tool] = { gl: 0, ln: 0 }
    counts[t.tool].gl++
  }
  for (const t of linear) {
    if (!counts[t.tool]) counts[t.tool] = { gl: 0, ln: 0 }
    counts[t.tool].ln++
  }

  const rows = Object.entries(counts)
    .map(([tool, c]) => ({ tool, total: c.gl + c.ln, gl: c.gl, ln: c.ln }))
    .sort((a, b) => b.total - a.total)

  const max = rows[0]?.total ?? 1

  return (
    <div className="card-hover animate-fade-up" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
      <div style={{ background: 'rgba(15,23,42,0.7)', border: '1px solid rgba(99,102,241,0.12)', backdropFilter: 'blur(16px)', boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}
        className="rounded-2xl p-4 sm:p-6 mb-6">

        {/* Header */}
        <div className="flex items-center gap-3 mb-5 sm:mb-6">
          <div style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)', boxShadow: '0 0 20px rgba(99,102,241,0.35)', flexShrink: 0 }}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-base sm:text-lg">📊</div>
          <div className="min-w-0">
            <h2 className="text-sm sm:text-base font-bold text-white">Ticket Distribution</h2>
            <p className="text-slate-500 text-xs mt-0.5">Breakdown by tool · GitLab + Linear</p>
          </div>
          {/* Legend — hidden on small screens to save space */}
          <div className="ml-auto hidden sm:flex items-center gap-3 text-xs text-slate-500 flex-shrink-0">
            <span className="flex items-center gap-1.5">
              <span style={{ width: 8, height: 8, borderRadius: 2, background: '#f97316', display: 'inline-block', flexShrink: 0 }} />
              GitLab
            </span>
            <span className="flex items-center gap-1.5">
              <span style={{ width: 8, height: 8, borderRadius: 2, background: '#3b82f6', display: 'inline-block', flexShrink: 0 }} />
              Linear
            </span>
          </div>
        </div>

        {/* Rows */}
        <div className="space-y-2.5 sm:space-y-3">
          {rows.map(({ tool, total, gl, ln }, i) => {
            const c = TOOL_STYLE[tool] ?? DEFAULT
            const pct = (total / max) * 100
            const glPct = total > 0 ? (gl / total) * 100 : 0
            const lnPct = 100 - glPct
            return (
              <div key={tool} className="animate-slide-in" style={{ animationDelay: `${i * 55}ms`, animationFillMode: 'both' }}>
                <div className="flex items-center justify-between mb-1.5 gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div style={{ width: 3, height: 12, background: c.bar, borderRadius: 2, boxShadow: `0 0 6px ${c.glow}`, flexShrink: 0 }} />
                    <span style={{ color: c.text }} className="text-xs font-semibold truncate">{tool}</span>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
                    {gl > 0 && (
                      <span style={{ background: 'rgba(249,115,22,0.15)', color: '#fb923c', border: '1px solid rgba(249,115,22,0.2)' }}
                        className="text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0.5 rounded font-mono hidden xs:inline">{gl} GL</span>
                    )}
                    {ln > 0 && (
                      <span style={{ background: 'rgba(59,130,246,0.15)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.2)' }}
                        className="text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0.5 rounded font-mono hidden xs:inline">{ln} LN</span>
                    )}
                    <span className="text-white font-bold text-xs w-5 text-right">{total}</span>
                  </div>
                </div>
                <div style={{ background: 'rgba(15,23,42,0.8)', borderRadius: 100, height: 5, overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', display: 'flex', transition: 'width 0.8s cubic-bezier(0.34,1.56,0.64,1)', transitionDelay: `${i * 55}ms` }}>
                    {gl > 0 && <div style={{ width: `${glPct}%`, background: 'linear-gradient(90deg, #ea580c, #f97316)', borderRadius: ln > 0 ? '100px 0 0 100px' : 100, boxShadow: '0 0 8px rgba(249,115,22,0.4)' }} />}
                    {ln > 0 && <div style={{ width: `${lnPct}%`, background: 'linear-gradient(90deg, #3b82f6, #06b6d4)', borderRadius: gl > 0 ? '0 100px 100px 0' : 100, boxShadow: '0 0 8px rgba(59,130,246,0.4)' }} />}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
