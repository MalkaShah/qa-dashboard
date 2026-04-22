import { useEffect } from 'react'
import type { GhlTicket } from '../hooks/useDataLoader'

const STATUS_TYPE_ORDER: Record<string, number> = {
  started: 0, unstarted: 1, triage: 2, backlog: 3, completed: 4, cancelled: 5,
}

const STATUS_EMOJI: Record<string, string> = {
  started: '🔵', unstarted: '🟡', triage: '📋', backlog: '📋',
  completed: '✅', cancelled: '⛔',
}

interface StatusGroup {
  status: string
  statusColor: string
  statusType: string
  tickets: GhlTicket[]
}

export default function GhlReportModal({ tickets, onClose }: { tickets: GhlTicket[]; onClose: () => void }) {
  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  // Group by status
  const groupMap = new Map<string, StatusGroup>()
  for (const t of tickets) {
    if (!groupMap.has(t.status)) {
      groupMap.set(t.status, { status: t.status, statusColor: t.statusColor, statusType: t.statusType, tickets: [] })
    }
    groupMap.get(t.status)!.tickets.push(t)
  }
  const groups = Array.from(groupMap.values()).sort(
    (a, b) => (STATUS_TYPE_ORDER[a.statusType] ?? 9) - (STATUS_TYPE_ORDER[b.statusType] ?? 9)
  )

  const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'stretch' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* Backdrop */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }} onClick={onClose} />

      {/* Panel — slides in from right */}
      <div style={{
        position: 'absolute', top: 0, right: 0, bottom: 0,
        width: '100%', maxWidth: 720,
        background: '#07101f',
        borderLeft: '1px solid rgba(124,58,237,0.2)',
        boxShadow: '-8px 0 48px rgba(0,0,0,0.6)',
        display: 'flex', flexDirection: 'column',
        animation: 'slideInRight 0.22s ease-out',
      }}>

        {/* Sticky header */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid rgba(124,58,237,0.15)',
          background: 'rgba(7,16,31,0.95)',
          backdropFilter: 'blur(12px)',
          flexShrink: 0,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)', boxShadow: '0 0 16px rgba(124,58,237,0.4)', borderRadius: 10, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>🏷️</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ color: '#fff', fontWeight: 700, fontSize: 15, margin: 0 }}>GHL Tickets Report</h2>
            <p style={{ color: '#64748b', fontSize: 12, margin: 0 }}>Syeda Malka · {tickets.length} tickets · {today}</p>
          </div>
          <button onClick={onClose} style={{
            background: 'rgba(148,163,184,0.08)', border: '1px solid rgba(148,163,184,0.12)',
            borderRadius: 8, width: 32, height: 32, cursor: 'pointer', color: '#94a3b8',
            fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, transition: 'all 0.12s ease',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; e.currentTarget.style.color = '#f87171' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(148,163,184,0.08)'; e.currentTarget.style.color = '#94a3b8' }}
          >✕</button>
        </div>

        {/* Status summary row */}
        <div style={{ padding: '12px 24px', borderBottom: '1px solid rgba(148,163,184,0.06)', flexShrink: 0, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {groups.map(g => (
            <div key={g.status} style={{
              background: `${g.statusColor}18`,
              border: `1px solid ${g.statusColor}33`,
              borderRadius: 100, padding: '4px 12px',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: g.statusColor, display: 'inline-block', flexShrink: 0 }} />
              <span style={{ color: '#94a3b8', fontSize: 11, fontWeight: 500 }}>{g.status}</span>
              <span style={{ color: g.statusColor, fontSize: 11, fontWeight: 700 }}>{g.tickets.length}</span>
            </div>
          ))}
        </div>

        {/* Scrollable ticket list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {groups.map(g => (
            <div key={g.status}>
              {/* Group header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 13 }}>{STATUS_EMOJI[g.statusType] ?? '📌'}</span>
                <span style={{ color: g.statusColor, fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{g.status}</span>
                <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${g.statusColor}33, transparent)` }} />
                <span style={{ background: `${g.statusColor}22`, color: g.statusColor, border: `1px solid ${g.statusColor}33`, borderRadius: 100, padding: '1px 10px', fontSize: 11, fontWeight: 700 }}>{g.tickets.length}</span>
              </div>

              {/* Tickets */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginLeft: 4 }}>
                {g.tickets.map(t => (
                  <a key={t.id} href={t.url} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 10px', borderRadius: 8, textDecoration: 'none', transition: 'background 0.12s ease' }}
                    onMouseEnter={e => (e.currentTarget.style.background = `${g.statusColor}0e`)}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <span style={{ color: g.statusColor, fontFamily: 'monospace', fontSize: 11, fontWeight: 700, flexShrink: 0, minWidth: 70, marginTop: 1 }}>{t.id}</span>
                    <span style={{ color: '#94a3b8', fontSize: 12, lineHeight: 1.5, flex: 1 }}>{t.title}</span>
                    <span style={{ color: '#334155', fontSize: 12, flexShrink: 0 }}>↗</span>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 24px', borderTop: '1px solid rgba(148,163,184,0.06)', flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#334155', fontSize: 11 }}>Data from Linear API · Created by Syeda Malka</span>
          <button onClick={onClose} style={{
            background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.25)',
            borderRadius: 8, padding: '6px 16px', color: '#a78bfa', fontSize: 12, fontWeight: 600, cursor: 'pointer',
          }}>Close</button>
        </div>
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(40px); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
    </div>
  )
}
