interface Props { total: number; gitlab: number; linear: number; activity: number }

export default function StatsBar({ total, gitlab, linear, activity }: Props) {
  const gitlabPct = Math.round((gitlab / total) * 100)
  const linearPct = 100 - gitlabPct

  return (
    <div style={{ background: 'rgba(15,23,42,0.5)', border: '1px solid rgba(99,102,241,0.1)', backdropFilter: 'blur(12px)' }}
      className="rounded-2xl p-4 sm:p-5 mb-6 animate-fade-up">

      <div className="flex flex-wrap items-center gap-3 sm:gap-6 mb-4">
        {[
          { label: 'Total Tickets', val: total,    color: '#a855f7' },
          { label: 'GitLab',        val: gitlab,   color: '#f97316' },
          { label: 'Linear',        val: linear,   color: '#3b82f6' },
          { label: 'Recent',        val: activity, color: '#10b981' },
        ].map(s => (
          <div key={s.label} className="flex items-center gap-2 sm:gap-3">
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, boxShadow: `0 0 8px ${s.color}`, flexShrink: 0 }} />
            <span className="text-slate-400 text-xs">{s.label}</span>
            <span className="text-white font-bold text-sm">{s.val}</span>
          </div>
        ))}
        <div className="ml-auto text-slate-500 text-xs hidden sm:block">
          GitLab {gitlabPct}% · Linear {linearPct}%
        </div>
      </div>

      {/* Split progress bar */}
      <div style={{ background: 'rgba(15,23,42,0.8)', borderRadius: 100, height: 8, overflow: 'hidden' }}>
        <div style={{ display: 'flex', height: '100%' }}>
          <div style={{ width: `${gitlabPct}%`, background: 'linear-gradient(90deg, #f97316, #ef4444)', transition: 'width 1s ease', borderRadius: '100px 0 0 100px' }} />
          <div style={{ width: `${linearPct}%`, background: 'linear-gradient(90deg, #3b82f6, #06b6d4)', transition: 'width 1s ease', borderRadius: '0 100px 100px 0' }} />
        </div>
      </div>
    </div>
  )
}
