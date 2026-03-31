export type GitLabTicket = { id: string; url: string; tool: string }
export type LinearTicket = { id: string; url: string; tool: string }
export type ActivityEntry = { date: string; tool: string; workDone: string }

// Sheet Product column → display name
const PRODUCT_MAP: Record<string, string> = {
  CA: 'Content Genius',
  'OTTO PPC': 'OTTO PPC',
  AB: 'Authority Builder',
  SE: 'Site Explorer',
  RB: 'Report Builder',
  GSC: 'GSC Performance',
  'GSC Performance': 'GSC Performance',
  'OTTO SEO': 'OTTO SEO',
  'OTTO & Audit': 'OTTO SEO',
  'LOCAL SEO/GBP': 'Local SEO/GBP',
  'LOCAL SEO': 'Local SEO/GBP',
  'LLM Visibility': 'LLM Visibility',
  'Keyword Ranker': 'Keyword Ranker',
  'AI QA Automation Tool': 'AI QA Automation Tool',
  'French Language transition in SA tool': 'French Localization',
  'French Localization': 'French Localization',
  'RB & GSC': 'Report Builder',
  'SE, LLMv and KRT': 'Site Explorer',
}

// Linear ticket prefix → tool name
const LINEAR_PREFIX_TOOL: Record<string, string> = {
  OTTO: 'OTTO SEO',
  SE: 'Site Explorer',
  GBP: 'Local SEO/GBP',
  CG: 'Content Genius',
  AB: 'Authority Builder',
  RB: 'Report Builder',
  GSC: 'GSC Performance',
  KR: 'Keyword Ranker',
  CB: 'Dashboard',
}

// Known tool patterns for text inference (ordered most-specific first)
const TOOL_TEXT_PATTERNS: [RegExp, string][] = [
  [/OTTO PPC/i, 'OTTO PPC'],
  [/OTTO SEO/i, 'OTTO SEO'],
  [/Report Builder/i, 'Report Builder'],
  [/Content Genius/i, 'Content Genius'],
  [/Site Explorer/i, 'Site Explorer'],
  [/Site Audit/i, 'Site Audit'],
  [/Authority Builder/i, 'Authority Builder'],
  [/Local (SEO|GBP)/i, 'Local SEO/GBP'],
  [/GSC|Google Search Console/i, 'GSC Performance'],
  [/Keyword Ranker/i, 'Keyword Ranker'],
  [/LLM Visibility/i, 'LLM Visibility'],
  [/Site Metrics/i, 'Site Metrics'],
  [/AI (QA|Agent)/i, 'AI QA Automation Tool'],
  [/Dashboard/i, 'Dashboard'],
]

function normalizeProduct(raw: string): string {
  const t = raw.trim()
  if (!t) return ''
  if (PRODUCT_MAP[t]) return PRODUCT_MAP[t]
  const lower = t.toLowerCase()
  for (const [k, v] of Object.entries(PRODUCT_MAP)) {
    if (k.toLowerCase() === lower) return v
  }
  // compound values like "SE, LLMv and KRT" — take first segment
  const first = t.split(/[,&]/)[0].trim()
  if (PRODUCT_MAP[first]) return PRODUCT_MAP[first]
  return t
}

function inferToolFromLinear(urls: string[]): string {
  for (const url of urls) {
    const m = url.match(/\/issue\/([A-Z]+)-\d+/i)
    if (m && LINEAR_PREFIX_TOOL[m[1].toUpperCase()]) return LINEAR_PREFIX_TOOL[m[1].toUpperCase()]
  }
  return ''
}

function inferToolFromText(text: string): string {
  for (const [pat, name] of TOOL_TEXT_PATTERNS) {
    if (pat.test(text)) return name
  }
  return ''
}

function parseDate(s: string): Date | null {
  if (!s.trim()) return null
  const parts = s.trim().split('/')
  if (parts.length !== 3) return null
  let [d, mo, y] = parts.map(Number)
  if (isNaN(d) || isNaN(mo) || isNaN(y)) return null
  if (y > 0 && y < 2024) y = 2026 // fix common year typos
  return new Date(y, mo - 1, d)
}

function extractUrls(cell: string): string[] {
  if (!cell) return []
  return cell.split(/\s+/).filter(s => s.startsWith('https://') || s.startsWith('http://'))
}

// RFC-4180 compliant CSV parser
function parseCSV(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQ = false
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (inQ) {
      if (ch === '"') {
        if (i + 1 < text.length && text[i + 1] === '"') { field += '"'; i++ }
        else inQ = false
      } else {
        field += ch
      }
    } else {
      if (ch === '"') { inQ = true }
      else if (ch === ',') { row.push(field); field = '' }
      else if (ch === '\n') { row.push(field); if (row.some(c => c)) rows.push(row); row = []; field = '' }
      else if (ch !== '\r') { field += ch }
    }
  }
  if (row.length > 0 || field) { row.push(field); if (row.some(c => c)) rows.push(row) }
  return rows
}

function getLinearId(url: string): string | null {
  const m = url.match(/\/issue\/([A-Z]+-\d+)/i)
  return m ? m[1].toUpperCase() : null
}

function getGitlabId(url: string): string | null {
  const m = url.match(/\/issues\/(\d+)/)
  return m ? `#${m[1]}` : null
}

function generateWorkDone(status: string, tool: string, gitUrls: string[], linUrls: string[]): string {
  if (status.length < 20) return status

  // Build ticket IDs for display
  const ids: string[] = [
    ...linUrls.map(getLinearId).filter((id): id is string => !!id),
    ...gitUrls.map(getGitlabId).filter((id): id is string => !!id),
  ]

  if (ids.length > 0) {
    const displayTool = tool || 'multiple modules'
    const shown = ids.slice(0, 6)
    const extra = ids.length > 6 ? ` +${ids.length - 6} more` : ''
    return `Bug hunting in ${displayTool} — ${ids.length} ticket${ids.length > 1 ? 's' : ''} created (${shown.join(', ')}${extra})`
  }

  // Extract "Ticket (if Any):" section
  const tm = status.match(/Ticket\s*\(if Any\)\s*:?\s*(.{10,250}?)(?:\.\s*$|\n|$)/i)
  if (tm) {
    const info = tm[1].trim().replace(/\.$/, '')
    if (info) return tool ? `${tool}: ${info}` : info
  }

  // Fall back to first non-boilerplate sentence
  const boilerplate = /^(conducted|performed|executed|identified|documented|ensured|reported|conveyed|prepared|discussed|attended|refined)/i
  const sentences = status.split(/\.\s+/)
  const meaningful = sentences.find(s => !boilerplate.test(s.trim()) && s.trim().length > 20)
  if (meaningful) return meaningful.trim().slice(0, 200)
  return sentences[0]?.slice(0, 200) || status.slice(0, 200)
}

export function parseSheetData(csv: string): {
  gitlab: GitLabTicket[]
  linear: LinearTicket[]
  activity: ActivityEntry[]
} {
  const rows = parseCSV(csv)

  const gitlabMap = new Map<string, GitLabTicket>()
  const linearMap = new Map<string, LinearTicket>()
  const activityRows: { date: Date; dateStr: string; tool: string; workDone: string }[] = []

  // Row 0 is the header — skip it
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]
    const dateStr   = (row[0] ?? '').trim()
    const status    = (row[1] ?? '').trim()
    const ticketCell = (row[2] ?? '').trim()
    const productRaw = (row[3] ?? '').trim()

    const urls      = extractUrls(ticketCell)
    const gitUrls   = urls.filter(u => u.includes('gitlab.com') && /\/issues\/\d+/.test(u))
    const linUrls   = urls.filter(u => u.includes('linear.app') && /\/issue\/[A-Z]+-\d+/i.test(u))

    // Resolve tool name
    let tool = normalizeProduct(productRaw)
    if (!tool) tool = inferToolFromLinear(linUrls)
    if (!tool && status) tool = inferToolFromText(status)

    // Accumulate deduplicated tickets
    for (const url of gitUrls) {
      if (!gitlabMap.has(url)) {
        const id = getGitlabId(url)
        if (id) gitlabMap.set(url, { id, url, tool: tool || 'General' })
      }
    }
    for (const url of linUrls) {
      if (!linearMap.has(url)) {
        const id = getLinearId(url)
        if (id) linearMap.set(url, { id, url, tool: tool || 'General' })
      }
    }

    // Activity: only rows with a date
    const date = parseDate(dateStr)
    if (date && status) {
      const dd = String(date.getDate()).padStart(2, '0')
      const mm = String(date.getMonth() + 1).padStart(2, '0')
      const yyyy = date.getFullYear()
      activityRows.push({
        date,
        dateStr: `${dd}/${mm}/${yyyy}`,
        tool: tool || 'General',
        workDone: generateWorkDone(status, tool, gitUrls, linUrls),
      })
    }
  }

  // Most recent 3 activity entries
  activityRows.sort((a, b) => b.date.getTime() - a.date.getTime())
  const activity = activityRows.slice(0, 3).map(({ dateStr, tool, workDone }) => ({ date: dateStr, tool, workDone }))

  return {
    gitlab: Array.from(gitlabMap.values()),
    linear: Array.from(linearMap.values()),
    activity,
  }
}
