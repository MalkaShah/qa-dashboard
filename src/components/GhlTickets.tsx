import { useState } from 'react'
import type { GhlTicket } from '../hooks/useDataLoader'

// Order statuses: active work first, resolved last
const STATUS_TYPE_ORDER: Record<string, number> = {
  started: 0,
  unstarted: 1,
  triage: 2,
  backlog: 3,
  completed: 4,
  cancelled: 5,
}

interface StatusGroup {
  status: string
  statusColor: string
  statusType: string
  tickets: GhlTicket[]
}

export default function GhlTickets({ tickets }: { tickets: GhlTicket[] }) {
  const [expanded, setExpanded] = useState<string | null>(null)

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

  const toggle = (status: string) => setExpanded(prev => prev === status ? null : status)

  return (
    <div className="animate-fade-up" style={{ animationDelay: '350ms', animationFillMode: 'both', marginBottom: '1.5rem' }}>
      <div style={{ background: 'rgba(15,23,42,0.7)', border: '1px solid rgba(59,130,246,0.15)', backdropFilter: 'blur(16px)', boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}
        className="rounded-2xl p-6">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)', boxShadow: '0 0 20px rgba(124,58,237,0.35)' }}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0">🏷️</div>
          <div>
            <h2 className="text-base font-bold text-white">GHL Tickets</h2>
            <p className="text-slate-500 text-xs mt-0.5">Created by Syeda Malka · GHL label</p>
          </div>
          <div style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(37,99,235,0.2))', border: '1px solid rgba(124,58,237,0.3)', boxShadow: '0 0 12px rgba(124,58,237,0.15)' }}
            className="ml-auto text-violet-300 text-xs px-3 py-1.5 rounded-full font-bold flex-shrink-0">
            {tickets.length} total
          </div>
        </div>

        {/* Status summary pills */}
        <div className="flex flex-wrap gap-2 mb-5">
          {groups.map(g => (
            <button
              key={g.status}
              onClick={() => toggle(g.status)}
              style={{
                background: expanded === g.status
                  ? `${g.statusColor}22`
                  : 'rgba(15,23,42,0.6)',
                border: `1px solid ${expanded === g.status ? g.statusColor + '55' : 'rgba(148,163,184,0.1)'}`,
                boxShadow: expanded === g.status ? `0 0 12px ${g.statusColor}22` : 'none',
                transition: 'all 0.15s ease',
                cursor: 'pointer',
                borderRadius: 100,
                padding: '6px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: g.statusColor, boxShadow: `0 0 6px ${g.statusColor}`, flexShrink: 0, display: 'inline-block' }} />
              <span style={{ color: expanded === g.status ? '#e2e8f0' : '#94a3b8', fontSize: 12, fontWeight: 600 }}>{g.status}</span>
              <span style={{ background: `${g.statusColor}33`, color: g.statusColor, border: `1px solid ${g.statusColor}44`, borderRadius: 100, padding: '1px 8px', fontSize: 11, fontWeight: 700, lineHeight: 1.6 }}>
                {g.tickets.length}
              </span>
            </button>
          ))}
        </div>

        {/* Expanded ticket list */}
        {groups.map(g => expanded === g.status && (
          <div key={g.status}
            style={{ background: 'rgba(6,11,24,0.5)', border: `1px solid ${g.statusColor}22`, borderRadius: 12, padding: '4px 0', marginTop: 4 }}>
            {g.tickets.map((t, i) => (
              <a
                key={t.id}
                href={t.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  padding: '10px 14px',
                  borderBottom: i < g.tickets.length - 1 ? '1px solid rgba(148,163,184,0.05)' : 'none',
                  textDecoration: 'none',
                  transition: 'background 0.12s ease',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = `${g.statusColor}0d`)}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <span style={{ color: g.statusColor, fontFamily: 'monospace', fontSize: 11, fontWeight: 700, flexShrink: 0, marginTop: 2 }}>{t.id}</span>
                <span style={{ color: '#94a3b8', fontSize: 12, lineHeight: 1.5, flex: 1 }}>{t.title}</span>
                <span style={{ color: '#475569', fontSize: 13, flexShrink: 0, marginTop: 1 }}>↗</span>
              </a>
            ))}
          </div>
        ))}

        {tickets.length === 0 && (
          <p className="text-slate-600 text-sm text-center py-6">No GHL tickets found</p>
        )}
      </div>
    </div>
  )
}
