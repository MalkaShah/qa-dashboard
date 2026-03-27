interface Activity { date: string; tool: string; workDone: string }
interface Props { data: Activity[] }

const TOOL_STYLE: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  'Authority Builder': { bg: 'rgba(245,158,11,0.1)',  text: '#fbbf24', border: 'rgba(245,158,11,0.25)', dot: '#f59e0b' },
  'Report Builder':    { bg: 'rgba(236,72,153,0.1)',  text: '#f472b6', border: 'rgba(236,72,153,0.25)', dot: '#ec4899' },
  'Content Genius':    { bg: 'rgba(16,185,129,0.1)',  text: '#34d399', border: 'rgba(16,185,129,0.25)', dot: '#10b981' },
  'GSC Performance':   { bg: 'rgba(59,130,246,0.1)',  text: '#60a5fa', border: 'rgba(59,130,246,0.25)', dot: '#3b82f6' },
  'Local SEO/GBP':     { bg: 'rgba(168,85,247,0.1)',  text: '#c084fc', border: 'rgba(168,85,247,0.25)', dot: '#a855f7' },
}
const DEFAULT_STYLE = { bg: 'rgba(99,102,241,0.1)', text: '#818cf8', border: 'rgba(99,102,241,0.25)', dot: '#6366f1' }

export default function ActivityTable({ data }: Props) {
  return (
    <div className="card-hover animate-fade-up" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
      <div style={{ background: 'rgba(15,23,42,0.7)', border: '1px solid rgba(148,163,184,0.08)', backdropFilter: 'blur(16px)', boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}
        className="rounded-2xl p-6 h-full">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.4), rgba(99,102,241,0.3))', border: '1px solid rgba(168,85,247,0.3)', boxShadow: '0 0 16px rgba(168,85,247,0.2)' }}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg">📋</div>
          <div>
            <h2 className="text-base font-bold text-white">Recent Activity</h2>
            <p className="text-slate-500 text-xs mt-0.5">Last 3 working days</p>
          </div>
          <div style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)' }}
            className="ml-auto text-purple-300 text-xs px-3 py-1 rounded-full">{data.length} entries</div>
        </div>

        {/* Timeline */}
        <div className="relative">
          <div style={{ position: 'absolute', left: 7, top: 12, bottom: 12, width: 1, background: 'linear-gradient(to bottom, rgba(99,102,241,0.5), rgba(6,182,212,0.2))' }} />

          <div className="space-y-4">
            {data.map((row, i) => {
              const c = TOOL_STYLE[row.tool] ?? DEFAULT_STYLE
              return (
                <div key={i} className="flex gap-4 animate-slide-in" style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'both' }}>
                  {/* Timeline dot */}
                  <div style={{ width: 15, height: 15, borderRadius: '50%', background: c.dot, boxShadow: `0 0 10px ${c.dot}, 0 0 4px ${c.dot}`, border: '2px solid rgba(6,11,24,0.8)', flexShrink: 0, marginTop: 14, zIndex: 1 }} />

                  <div style={{ background: 'rgba(6,11,24,0.5)', border: `1px solid ${c.border}`, flex: 1 }}
                    className="rounded-xl p-4 transition-all hover:border-opacity-60">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className="text-slate-400 font-mono text-xs">{row.date}</span>
                      <span style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}` }}
                        className="text-xs px-2.5 py-0.5 rounded-lg font-semibold">{row.tool}</span>
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed">{row.workDone}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
