import { useState } from 'react'

interface Ticket { id: string; url: string; tool: string }

const TEAM_STYLE: Record<string, { bg: string; text: string; bar: string; border: string; glow: string }> = {
  'OTTO SEO':         { bg: 'rgba(249,115,22,0.12)', text: '#fb923c', bar: '#f97316', border: 'rgba(249,115,22,0.25)', glow: 'rgba(249,115,22,0.15)' },
  'Site Explorer':    { bg: 'rgba(6,182,212,0.12)',  text: '#22d3ee', bar: '#06b6d4', border: 'rgba(6,182,212,0.25)',  glow: 'rgba(6,182,212,0.15)'  },
  'Local SEO/GBP':    { bg: 'rgba(168,85,247,0.12)', text: '#c084fc', bar: '#a855f7', border: 'rgba(168,85,247,0.25)', glow: 'rgba(168,85,247,0.15)' },
  'Content Genius':   { bg: 'rgba(16,185,129,0.12)', text: '#34d399', bar: '#10b981', border: 'rgba(16,185,129,0.25)', glow: 'rgba(16,185,129,0.15)' },
  'Authority Builder':{ bg: 'rgba(245,158,11,0.12)', text: '#fbbf24', bar: '#f59e0b', border: 'rgba(245,158,11,0.25)', glow: 'rgba(245,158,11,0.15)' },
}
const DEFAULT = { bg: 'rgba(99,102,241,0.12)', text: '#818cf8', bar: '#6366f1', border: 'rgba(99,102,241,0.25)', glow: 'rgba(99,102,241,0.15)' }

function parseTitle(url: string): string {
  try {
    const parts = url.split('/')
    const slug = parts[parts.length - 1]
    // Remove leading ID prefix like "otto-1064-" if present
    const cleaned = slug.replace(/^[a-z]+-\d+-/, '')
    return cleaned.replace(/-/g, ' ').replace(/^\w/, c => c.toUpperCase())
  } catch {
    return ''
  }
}

export default function LinearTickets({ tickets }: { tickets: Ticket[] }) {
  const [hovered, setHovered] = useState<string | null>(null)

  const groups = tickets.reduce<Record<string, Ticket[]>>((acc, t) => {
    acc[t.tool] = [...(acc[t.tool] ?? []), t]
    return acc
  }, {})

  return (
    <div className="card-hover animate-fade-up" style={{ animationDelay: '300ms', animationFillMode: 'both' }}>
      <div style={{ background: 'rgba(15,23,42,0.7)', border: '1px solid rgba(59,130,246,0.15)', backdropFilter: 'blur(16px)', boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}
        className="rounded-2xl p-6 h-full">

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div style={{ background: 'linear-gradient(135deg, #1d4ed8, #06b6d4)', boxShadow: '0 0 20px rgba(59,130,246,0.35)' }}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg">⚡</div>
          <div>
            <h2 className="text-base font-bold text-white">Linear Tickets</h2>
            <p className="text-slate-500 text-xs mt-0.5">Created by Syeda Malka</p>
          </div>
          <div style={{ background: 'linear-gradient(135deg, rgba(29,78,216,0.2), rgba(6,182,212,0.2))', border: '1px solid rgba(59,130,246,0.3)', boxShadow: '0 0 12px rgba(59,130,246,0.15)' }}
            className="ml-auto text-blue-300 text-xs px-3 py-1.5 rounded-full font-bold">{tickets.length} total</div>
        </div>

        {/* Grouped list */}
        <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
          {Object.entries(groups).map(([tool, items]) => {
            const c = TEAM_STYLE[tool] ?? DEFAULT
            return (
              <div key={tool}>
                {/* Group header */}
                <div className="flex items-center gap-2 mb-2">
                  <div style={{ width: 3, height: 12, background: c.bar, borderRadius: 2, boxShadow: `0 0 6px ${c.bar}` }} />
                  <span style={{ color: c.text }} className="text-xs font-bold uppercase tracking-wider">{tool}</span>
                  <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${c.border}, transparent)`, marginLeft: 4 }} />
                  <span style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}` }} className="text-[10px] px-2 py-0.5 rounded-full font-bold">{items.length}</span>
                </div>

                {/* Ticket cards */}
                <div className="space-y-1.5 ml-3">
                  {items.map(t => {
                    const title = parseTitle(t.url)
                    const isHov = hovered === t.id
                    return (
                      <a key={t.id} href={t.url} target="_blank" rel="noopener noreferrer"
                        onMouseEnter={() => setHovered(t.id)}
                        onMouseLeave={() => setHovered(null)}
                        style={{
                          background: isHov ? c.bg : 'rgba(6,11,24,0.5)',
                          border: `1px solid ${isHov ? c.border : 'rgba(148,163,184,0.06)'}`,
                          boxShadow: isHov ? `0 0 12px ${c.glow}` : 'none',
                          transition: 'all 0.15s ease',
                          display: 'block',
                        }}
                        className="rounded-xl px-3 py-2.5 group">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span style={{ color: c.text }} className="font-mono text-xs font-bold flex-shrink-0">{t.id}</span>
                              {isHov && <div style={{ width: 4, height: 4, borderRadius: '50%', background: c.bar, boxShadow: `0 0 6px ${c.bar}` }} />}
                            </div>
                            {title && (
                              <p style={{ color: isHov ? '#e2e8f0' : '#94a3b8' }}
                                className="text-xs leading-relaxed transition-colors truncate"
                                title={title}>
                                {title}
                              </p>
                            )}
                          </div>
                          <span style={{ color: c.text, opacity: isHov ? 1 : 0.3, flexShrink: 0 }}
                            className="text-sm transition-opacity mt-0.5">↗</span>
                        </div>
                      </a>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
