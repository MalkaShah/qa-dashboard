import { useState } from 'react'

interface Ticket { id: string; url: string; tool: string }

const TOOL_STYLE: Record<string, { bg: string; text: string; border: string; glow: string }> = {
  'OTTO SEO':           { bg: 'rgba(249,115,22,0.12)', text: '#fb923c', border: 'rgba(249,115,22,0.25)', glow: 'rgba(249,115,22,0.15)' },
  'OTTO PPC':           { bg: 'rgba(239,68,68,0.12)',  text: '#f87171', border: 'rgba(239,68,68,0.25)',  glow: 'rgba(239,68,68,0.15)'  },
  'Site Explorer':      { bg: 'rgba(6,182,212,0.12)',  text: '#22d3ee', border: 'rgba(6,182,212,0.25)',  glow: 'rgba(6,182,212,0.15)'  },
  'Content Genius':     { bg: 'rgba(16,185,129,0.12)', text: '#34d399', border: 'rgba(16,185,129,0.25)', glow: 'rgba(16,185,129,0.15)' },
  'Authority Builder':  { bg: 'rgba(245,158,11,0.12)', text: '#fbbf24', border: 'rgba(245,158,11,0.25)', glow: 'rgba(245,158,11,0.15)' },
  'GSC':                { bg: 'rgba(59,130,246,0.12)', text: '#60a5fa', border: 'rgba(59,130,246,0.25)', glow: 'rgba(59,130,246,0.15)' },
  'Report Builder':     { bg: 'rgba(236,72,153,0.12)', text: '#f472b6', border: 'rgba(236,72,153,0.25)', glow: 'rgba(236,72,153,0.15)' },
  'French Localization':{ bg: 'rgba(168,85,247,0.12)', text: '#c084fc', border: 'rgba(168,85,247,0.25)', glow: 'rgba(168,85,247,0.15)' },
}
const DEFAULT = { bg: 'rgba(99,102,241,0.1)', text: '#818cf8', border: 'rgba(99,102,241,0.2)', glow: 'rgba(99,102,241,0.1)' }

export default function GitLabLinks({ tickets }: { tickets: Ticket[] }) {
  const tools = ['All', ...Array.from(new Set(tickets.map(t => t.tool)))]
  const [active, setActive] = useState('All')
  const [search, setSearch] = useState('')

  const filtered = tickets
    .filter(t => active === 'All' || t.tool === active)
    .filter(t => t.id.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="card-hover animate-fade-up" style={{ animationDelay: '400ms', animationFillMode: 'both' }}>
      <div style={{ background: 'rgba(15,23,42,0.7)', border: '1px solid rgba(249,115,22,0.12)', backdropFilter: 'blur(16px)', boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}
        className="rounded-2xl p-4 sm:p-6">

        {/* Header */}
        <div className="flex items-center gap-3 mb-4 sm:mb-5 flex-wrap">
          <div style={{ background: 'linear-gradient(135deg, #ea580c, #ef4444)', boxShadow: '0 0 20px rgba(249,115,22,0.35)', flexShrink: 0 }}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-base sm:text-lg">🦊</div>
          <div className="min-w-0">
            <h2 className="text-sm sm:text-base font-bold text-white">GitLab Tickets</h2>
            <p className="text-slate-500 text-xs mt-0.5">{filtered.length} of {tickets.length} tickets</p>
          </div>
          {/* Search + count */}
          <div className="ml-auto flex items-center gap-2 flex-wrap">
            <div style={{ background: 'rgba(6,11,24,0.6)', border: '1px solid rgba(148,163,184,0.1)', borderRadius: 10 }}
              className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search #ID…"
                style={{ background: 'transparent', border: 'none', outline: 'none', color: '#f1f5f9', fontSize: 12, width: 80 }} />
            </div>
            <div style={{ background: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.25)', boxShadow: '0 0 12px rgba(249,115,22,0.1)' }}
              className="text-orange-300 text-xs px-2.5 sm:px-3 py-1.5 rounded-full font-bold flex-shrink-0">{tickets.length} total</div>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-1 sm:gap-1.5 mb-4 sm:mb-5">
          {tools.map(tool => {
            const c = TOOL_STYLE[tool] ?? DEFAULT
            const isActive = active === tool
            return (
              <button key={tool} onClick={() => setActive(tool)}
                style={{
                  background: isActive ? c.bg : 'rgba(6,11,24,0.5)',
                  border: `1px solid ${isActive ? c.border : 'rgba(148,163,184,0.06)'}`,
                  color: isActive ? c.text : '#64748b',
                  boxShadow: isActive ? `0 0 12px ${c.glow}` : 'none',
                  transition: 'all 0.15s ease',
                }}
                className="text-xs px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg font-medium">
                {tool}
                {isActive && active !== 'All' && (
                  <span style={{ background: c.bg, marginLeft: 5 }} className="text-[10px] px-1.5 rounded-full">
                    {tickets.filter(t => t.tool === tool).length}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Ticket grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-1.5 sm:gap-2 max-h-60 sm:max-h-64 overflow-y-auto pr-1">
          {filtered.map(t => {
            const c = TOOL_STYLE[t.tool] ?? DEFAULT
            return (
              <a key={t.id + t.url} href={t.url} target="_blank" rel="noopener noreferrer"
                style={{ background: 'rgba(6,11,24,0.6)', border: `1px solid ${c.border}22`, transition: 'all 0.15s ease' }}
                className="flex flex-col p-2 sm:p-2.5 rounded-xl group"
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = c.bg; el.style.borderColor = c.border; el.style.boxShadow = `0 0 12px ${c.glow}` }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'rgba(6,11,24,0.6)'; el.style.borderColor = `${c.border}22`; el.style.boxShadow = 'none' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: c.text, boxShadow: `0 0 4px ${c.text}`, flexShrink: 0 }} />
                    <span style={{ color: c.text }} className="font-mono text-xs font-bold truncate">{t.id}</span>
                  </div>
                  <span style={{ color: c.text }} className="text-xs opacity-40 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-1">↗</span>
                </div>
                <p style={{ color: c.text }} className="text-[10px] opacity-50 mt-1 truncate pl-[17px]">{t.tool}</p>
              </a>
            )
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-8 text-slate-600 text-sm">No tickets match your search</div>
        )}
      </div>
    </div>
  )
}
