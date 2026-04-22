import type { GhlTicket } from '../lib/linearApi'

const STATUS_TYPE_ORDER: Record<string, number> = {
  started: 0, unstarted: 1, triage: 2, backlog: 3, completed: 4, cancelled: 5,
}

function groupByStatus(tickets: GhlTicket[]) {
  const map = new Map<string, { color: string; type: string; tickets: GhlTicket[] }>()
  for (const t of tickets) {
    if (!map.has(t.status)) map.set(t.status, { color: t.statusColor, type: t.statusType, tickets: [] })
    map.get(t.status)!.tickets.push(t)
  }
  return Array.from(map.entries())
    .sort((a, b) => (STATUS_TYPE_ORDER[a[1].type] ?? 9) - (STATUS_TYPE_ORDER[b[1].type] ?? 9))
}


const CSS = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f1f5f9; color: #1e293b; }
  .page { max-width: 900px; margin: 0 auto; padding: 32px 24px; }
  .header { background: linear-gradient(135deg, #7c3aed 0%, #2563eb 100%); border-radius: 16px; padding: 32px 36px; color: white; margin-bottom: 24px; }
  .header h1 { font-size: 26px; font-weight: 800; margin-bottom: 4px; }
  .header p { opacity: 0.75; font-size: 14px; }
  .header .meta { display: flex; gap: 20px; margin-top: 16px; flex-wrap: wrap; }
  .header .meta span { background: rgba(255,255,255,0.15); border-radius: 100px; padding: 4px 14px; font-size: 12px; font-weight: 600; }
  .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; margin-bottom: 24px; }
  .stat-card { background: white; border-radius: 12px; padding: 16px 20px; box-shadow: 0 1px 4px rgba(0,0,0,0.08); border-left: 4px solid; }
  .stat-card .num { font-size: 32px; font-weight: 800; line-height: 1; }
  .stat-card .lbl { font-size: 12px; color: #64748b; margin-top: 4px; font-weight: 500; }
  .section { background: white; border-radius: 12px; padding: 20px 24px; margin-bottom: 16px; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }
  .section-title { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; padding-bottom: 10px; border-bottom: 1px solid #f1f5f9; }
  .section-title h2 { font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; }
  .badge { border-radius: 100px; padding: 2px 10px; font-size: 11px; font-weight: 700; }
  table { width: 100%; border-collapse: collapse; }
  th { text-align: left; font-size: 11px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; padding: 8px 10px; border-bottom: 1px solid #f1f5f9; }
  td { padding: 9px 10px; font-size: 13px; border-bottom: 1px solid #f8fafc; vertical-align: top; }
  tr:last-child td { border-bottom: none; }
  .id { font-family: monospace; font-weight: 700; white-space: nowrap; }
  a { color: #2563eb; text-decoration: none; }
  a:hover { text-decoration: underline; }
  .dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; flex-shrink: 0; }
  .footer { text-align: center; font-size: 11px; color: #94a3b8; margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; }
  @media print { body { background: white; } .page { padding: 16px; } }
`

export function generateWeeklyReport(
  ghlTickets: GhlTicket[],
  activities: { date: string; tool: string; workDone: string }[]
): void {
  const today = new Date()
  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - today.getDay() + 1)
  const fmt = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  const groups = groupByStatus(ghlTickets)

  const statusCounts: Record<string, number> = {}
  for (const [status, g] of groups) statusCounts[status] = g.tickets.length

  const inProgress = ghlTickets.filter(t => t.statusType === 'started').length
  const pending = ghlTickets.filter(t => ['unstarted', 'triage', 'backlog'].includes(t.statusType)).length
  const done = ghlTickets.filter(t => t.statusType === 'completed').length
  const blocked = ghlTickets.filter(t => t.status.toLowerCase().includes('block')).length

  const summaryCards = [
    { num: ghlTickets.length, lbl: 'Total GHL Tickets', color: '#7c3aed' },
    { num: inProgress, lbl: 'In Progress', color: '#3b82f6' },
    { num: pending, lbl: 'Pending', color: '#f59e0b' },
    { num: done, lbl: 'Done', color: '#22c55e' },
    { num: blocked, lbl: 'Blocked', color: '#ef4444' },
  ]

  const groupHtml = groups.map(([status, g]) => `
    <div class="section">
      <div class="section-title">
        <span class="dot" style="background:${g.color};box-shadow:0 0 6px ${g.color}44"></span>
        <h2 style="color:${g.color}">${status}</h2>
        <span class="badge" style="background:${g.color}18;color:${g.color}">${g.tickets.length}</span>
      </div>
      <table>
        <thead><tr><th>ID</th><th>Title</th><th>Product</th></tr></thead>
        <tbody>
          ${g.tickets.map(t => `
            <tr>
              <td><span class="id" style="color:${g.color}">${t.id}</span></td>
              <td><a href="${t.url}" target="_blank">${t.title}</a></td>
              <td style="color:#64748b;font-size:12px">${t.tool}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `).join('')

  const activityHtml = activities.length ? `
    <div class="section">
      <div class="section-title"><h2>Recent Activity</h2></div>
      <table>
        <thead><tr><th>Date</th><th>Tool</th><th>Work Done</th></tr></thead>
        <tbody>
          ${activities.map(a => `
            <tr>
              <td style="color:#64748b;white-space:nowrap">${a.date}</td>
              <td style="color:#7c3aed;font-weight:600;white-space:nowrap">${a.tool}</td>
              <td>${a.workDone}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  ` : ''

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GHL Weekly QA Report — Week of ${fmt(weekStart)}</title>
  <style>${CSS}</style>
</head>
<body>
  <div class="page">
    <div class="header">
      <h1>🏷️ GHL Weekly QA Report</h1>
      <p>Prepared by Syeda Malka &nbsp;·&nbsp; Search Atlas QA</p>
      <div class="meta">
        <span>📅 Week of ${fmt(weekStart)}</span>
        <span>Generated ${fmt(today)}</span>
        <span>${ghlTickets.length} GHL Tickets</span>
      </div>
    </div>

    <div class="summary">
      ${summaryCards.map(c => `
        <div class="stat-card" style="border-color:${c.color}">
          <div class="num" style="color:${c.color}">${c.num}</div>
          <div class="lbl">${c.lbl}</div>
        </div>
      `).join('')}
    </div>

    ${activityHtml}
    ${groupHtml}

    <div class="footer">GHL Weekly QA Report &nbsp;·&nbsp; Data from Linear API &nbsp;·&nbsp; Syeda Malka &nbsp;·&nbsp; Search Atlas</div>
  </div>
</body>
</html>`

  openHtml(html, `GHL-Weekly-Report-${today.toISOString().slice(0, 10)}.html`)
}

export function generateSmokeCycleReport(
  allGhlTickets: GhlTicket[],
  smokeSheetData?: { totalCases: number; passed: number; failed: number; blocked: number }
): void {
  const today = new Date()

  // Get start of current week (Monday)
  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - ((today.getDay() + 6) % 7))
  weekStart.setHours(0, 0, 0, 0)

  // Tickets created this week
  const thisWeekTickets = allGhlTickets.filter(t => new Date(t.createdAt) >= weekStart)

  const fmt = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  const groups = groupByStatus(thisWeekTickets)

  const weekNum = Math.ceil(((today.getTime() - new Date(today.getFullYear(), 0, 1).getTime()) / 86400000 + new Date(today.getFullYear(), 0, 1).getDay() + 1) / 7)

  const execSection = smokeSheetData ? `
    <div class="summary">
      <div class="stat-card" style="border-color:#6366f1">
        <div class="num" style="color:#6366f1">${smokeSheetData.totalCases}</div>
        <div class="lbl">Total Test Cases</div>
      </div>
      <div class="stat-card" style="border-color:#22c55e">
        <div class="num" style="color:#22c55e">${smokeSheetData.passed}</div>
        <div class="lbl">Passed</div>
      </div>
      <div class="stat-card" style="border-color:#ef4444">
        <div class="num" style="color:#ef4444">${smokeSheetData.failed}</div>
        <div class="lbl">Failed</div>
      </div>
      <div class="stat-card" style="border-color:#f59e0b">
        <div class="num" style="color:#f59e0b">${smokeSheetData.blocked}</div>
        <div class="lbl">Blocked</div>
      </div>
      <div class="stat-card" style="border-color:#3b82f6">
        <div class="num" style="color:#3b82f6">${smokeSheetData.totalCases > 0 ? Math.round((smokeSheetData.passed / smokeSheetData.totalCases) * 100) : 0}%</div>
        <div class="lbl">Pass Rate</div>
      </div>
    </div>
  ` : `
    <div class="section" style="border-left:4px solid #f59e0b;background:#fffbeb">
      <p style="color:#92400e;font-size:13px;font-weight:600">⚠️ Smoke test sheet not connected — test case counts unavailable. Configure <code>VITE_SMOKE_SHEET_ID</code> to enable.</p>
    </div>
  `

  const ticketGroupHtml = groups.length ? groups.map(([status, g]) => `
    <div class="section">
      <div class="section-title">
        <span class="dot" style="background:${g.color};box-shadow:0 0 6px ${g.color}44"></span>
        <h2 style="color:${g.color}">${status}</h2>
        <span class="badge" style="background:${g.color}18;color:${g.color}">${g.tickets.length}</span>
      </div>
      <table>
        <thead><tr><th>ID</th><th>Title</th><th>Product</th><th>Created</th></tr></thead>
        <tbody>
          ${g.tickets.map(t => `
            <tr>
              <td><span class="id" style="color:${g.color}">${t.id}</span></td>
              <td><a href="${t.url}" target="_blank">${t.title}</a></td>
              <td style="color:#64748b;font-size:12px">${t.tool}</td>
              <td style="color:#94a3b8;font-size:11px;white-space:nowrap">${new Date(t.createdAt).toLocaleDateString('en-GB')}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `).join('') : `
    <div class="section">
      <p style="color:#64748b;font-size:13px;text-align:center;padding:16px 0">No GHL tickets created this week (${fmt(weekStart)} – ${fmt(today)})</p>
    </div>
  `

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GHL Smoke Cycle Report — Week ${weekNum}</title>
  <style>${CSS}</style>
</head>
<body>
  <div class="page">
    <div class="header">
      <h1>🧪 GHL Smoke Cycle Report</h1>
      <p>Prepared by Syeda Malka &nbsp;·&nbsp; Search Atlas QA</p>
      <div class="meta">
        <span>📅 Week ${weekNum} · ${fmt(weekStart)}</span>
        <span>Generated ${fmt(today)}</span>
        <span>${thisWeekTickets.length} Tickets This Week</span>
      </div>
    </div>

    <div class="section" style="margin-bottom:20px">
      <div class="section-title"><h2>📊 Test Execution Summary</h2></div>
      ${execSection}
    </div>

    <div class="section-title" style="padding:0 4px 8px">
      <h2 style="font-size:14px;font-weight:700;color:#1e293b">🐛 Tickets Created This Week</h2>
      <span class="badge" style="background:#6366f115;color:#6366f1">${thisWeekTickets.length}</span>
    </div>
    ${ticketGroupHtml}

    <div class="footer">GHL Smoke Cycle Report &nbsp;·&nbsp; Data from Linear API &nbsp;·&nbsp; Syeda Malka &nbsp;·&nbsp; Search Atlas</div>
  </div>
</body>
</html>`

  openHtml(html, `GHL-Smoke-Cycle-Week${weekNum}-${today.toISOString().slice(0, 10)}.html`)
}

function openHtml(html: string, _filename: string): void {
  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = _filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 10000)
}
