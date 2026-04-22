import type { GhlTicket } from '../hooks/useDataLoader'
import { generateWeeklyReport, generateSmokeCycleReport } from '../lib/reportGenerator'

const STATUS_TYPE_ORDER: Record<string, number> = {
  started: 0, unstarted: 1, triage: 2, backlog: 3, completed: 4, cancelled: 5,
}

const DAY_SCHEDULE: Record<number, { label: string; icon: string; desc: string }> = {
  2: { label: 'Sanity Test', icon: '🔬', desc: 'GHL Sanity Testing Day' },
  4: { label: 'Smoke Suite', icon: '🧪', desc: 'GHL Smoke Test Suite' },
}

interface StatusGroup { status: string; color: string; type: string; count: number }

export default function GhlHub({
  tickets,
  activities,
}: {
  tickets: GhlTicket[]
  activities: { date: string; tool: string; workDone: string }[]
}) {
  const today = new Date()
  const dayOfWeek = today.getDay() // 0=Sun, 1=Mon, 2=Tue...
  const todaySchedule = DAY_SCHEDULE[dayOfWeek]

  // Status summary — collapse into type buckets
  const typeMap = new Map<string, StatusGroup>()
  for (const t of tickets) {
    if (!typeMap.has(t.status)) {
      typeMap.set(t.status, { status: t.status, color: t.statusColor, type: t.statusType, count: 0 })
    }
    typeMap.get(t.status)!.count++
  }
  const statusGroups = Array.from(typeMap.values())
    .sort((a, b) => (STATUS_TYPE_ORDER[a.type] ?? 9) - (STATUS_TYPE_ORDER[b.type] ?? 9))
    .slice(0, 6)

  const handleWeekly = () => generateWeeklyReport(tickets, activities)
  const handleSmoke = () => generateSmokeCycleReport(tickets)

  return (
    <div className="animate-fade-up" style={{ animationDelay: '150ms', animationFillMode: 'both', marginBottom: '1.5rem' }}>
      <div style={{
        background: 'rgba(15,23,42,0.7)',
        border: '1px solid rgba(124,58,237,0.2)',
        backdropFilter: 'blur(16px)',
        boxShadow: '0 4px 32px rgba(124,58,237,0.08)',
        borderRadius: 20,
        padding: '24px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background glow */}
        <div style={{ position: 'absolute', top: -60, right: -60, width: 280, height: 280, background: 'radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)', boxShadow: '0 0 20px rgba(124,58,237,0.4)', borderRadius: 12, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>🏷️</div>
          <div style={{ flex: 1 }}>
            <h2 style={{ color: '#fff', fontWeight: 700, fontSize: 15, margin: 0 }}>GHL Operations Hub</h2>
            <p style={{ color: '#475569', fontSize: 12, margin: 0 }}>Main product · GHL-specific testing & reporting</p>
          </div>
          <div style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.25)', borderRadius: 100, padding: '4px 12px', display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#a78bfa', boxShadow: '0 0 6px #a78bfa', display: 'inline-block' }} />
            <span style={{ color: '#a78bfa', fontSize: 11, fontWeight: 700 }}>{tickets.length} tickets</span>
          </div>
        </div>

        {/* Main grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>

          {/* Left: Weekly schedule */}
          <div style={{ background: 'rgba(6,11,24,0.5)', border: '1px solid rgba(148,163,184,0.07)', borderRadius: 14, padding: '16px 18px' }}>
            <p style={{ color: '#475569', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Weekly GHL Testing</p>

            {/* Tuesday */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, marginBottom: 8,
              background: dayOfWeek === 2 ? 'rgba(124,58,237,0.15)' : 'rgba(15,23,42,0.4)',
              border: `1px solid ${dayOfWeek === 2 ? 'rgba(124,58,237,0.35)' : 'rgba(148,163,184,0.06)'}`,
            }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>🔬</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ color: '#e2e8f0', fontSize: 13, fontWeight: 600 }}>Tuesday</span>
                  {dayOfWeek === 2 && <span style={{ background: '#7c3aed', color: 'white', fontSize: 9, fontWeight: 700, borderRadius: 100, padding: '1px 7px', textTransform: 'uppercase' }}>Today</span>}
                </div>
                <span style={{ color: '#64748b', fontSize: 11 }}>Sanity Test — GHL</span>
              </div>
            </div>

            {/* Thursday */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10,
              background: dayOfWeek === 4 ? 'rgba(59,130,246,0.15)' : 'rgba(15,23,42,0.4)',
              border: `1px solid ${dayOfWeek === 4 ? 'rgba(59,130,246,0.35)' : 'rgba(148,163,184,0.06)'}`,
            }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>🧪</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ color: '#e2e8f0', fontSize: 13, fontWeight: 600 }}>Thursday</span>
                  {dayOfWeek === 4 && <span style={{ background: '#3b82f6', color: 'white', fontSize: 9, fontWeight: 700, borderRadius: 100, padding: '1px 7px', textTransform: 'uppercase' }}>Today</span>}
                </div>
                <span style={{ color: '#64748b', fontSize: 11 }}>Smoke Test Suite — GHL</span>
              </div>
            </div>

            {/* Today callout if it's a GHL day */}
            {todaySchedule && (
              <div style={{ marginTop: 10, background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 8, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 14 }}>⚡</span>
                <span style={{ color: '#c4b5fd', fontSize: 12, fontWeight: 600 }}>Today: Run {todaySchedule.label}!</span>
              </div>
            )}
          </div>

          {/* Right: Ticket status overview */}
          <div style={{ background: 'rgba(6,11,24,0.5)', border: '1px solid rgba(148,163,184,0.07)', borderRadius: 14, padding: '16px 18px' }}>
            <p style={{ color: '#475569', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Ticket Status Overview</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {statusGroups.map(g => {
                const pct = tickets.length > 0 ? (g.count / tickets.length) * 100 : 0
                return (
                  <div key={g.status} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: g.color, flexShrink: 0, boxShadow: `0 0 5px ${g.color}` }} />
                    <span style={{ color: '#94a3b8', fontSize: 12, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.status}</span>
                    <div style={{ width: 60, height: 4, background: 'rgba(148,163,184,0.1)', borderRadius: 100, flexShrink: 0 }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: g.color, borderRadius: 100, boxShadow: `0 0 4px ${g.color}` }} />
                    </div>
                    <span style={{ color: g.color, fontSize: 12, fontWeight: 700, width: 22, textAlign: 'right', flexShrink: 0 }}>{g.count}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Report buttons */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button onClick={handleWeekly}
            style={{
              background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(37,99,235,0.2))',
              border: '1px solid rgba(124,58,237,0.35)',
              borderRadius: 10, padding: '10px 20px',
              color: '#c4b5fd', fontSize: 13, fontWeight: 600,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(124,58,237,0.35), rgba(37,99,235,0.35))'; e.currentTarget.style.boxShadow = '0 0 20px rgba(124,58,237,0.2)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(37,99,235,0.2))'; e.currentTarget.style.boxShadow = 'none' }}
          >
            <span style={{ fontSize: 16 }}>📄</span>
            Generate Weekly Report
          </button>

          <button onClick={handleSmoke}
            style={{
              background: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(6,182,212,0.2))',
              border: '1px solid rgba(59,130,246,0.35)',
              borderRadius: 10, padding: '10px 20px',
              color: '#93c5fd', fontSize: 13, fontWeight: 600,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(59,130,246,0.35), rgba(6,182,212,0.35))'; e.currentTarget.style.boxShadow = '0 0 20px rgba(59,130,246,0.2)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(6,182,212,0.2))'; e.currentTarget.style.boxShadow = 'none' }}
          >
            <span style={{ fontSize: 16 }}>🧪</span>
            Generate Smoke Cycle Report
          </button>
        </div>
      </div>
    </div>
  )
}
