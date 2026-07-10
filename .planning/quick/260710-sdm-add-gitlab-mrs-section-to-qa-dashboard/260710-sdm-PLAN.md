---
phase: quick
plan: 260710-sdm
type: execute
wave: 1
depends_on: []
files_modified:
  - netlify/functions/gitlab-mrs.ts
  - src/lib/gitlabApi.ts
  - src/components/GitLabMRs.tsx
  - src/hooks/useDataLoader.ts
  - src/App.tsx
  - .env.local
autonomous: true
requirements: []

must_haves:
  truths:
    - "Dashboard shows a 'My Merge Requests' section with MR cards"
    - "MR state is visually distinct — Open (green), Merged (purple), Closed (red)"
    - "Each MR card links to the MR on GitLab (web_url)"
    - "GitLab token is never exposed to the browser"
    - "Section appears after the GitLabLinks section in App.tsx"
  artifacts:
    - path: "netlify/functions/gitlab-mrs.ts"
      provides: "Server-side proxy that injects GITLAB_TOKEN and forwards to GitLab REST API"
    - path: "src/lib/gitlabApi.ts"
      provides: "Client-side fetch helper calling /.netlify/functions/gitlab-mrs"
    - path: "src/components/GitLabMRs.tsx"
      provides: "Rendered MR list with state badges, title, branch, date"
    - path: "src/hooks/useDataLoader.ts"
      provides: "gitlabMRs field added to AppData, fetched in parallel"
    - path: "src/App.tsx"
      provides: "GitLabMRs component wired in below GitLabLinks"
  key_links:
    - from: "src/lib/gitlabApi.ts"
      to: "/.netlify/functions/gitlab-mrs"
      via: "fetch GET with ?page= query param"
    - from: "netlify/functions/gitlab-mrs.ts"
      to: "https://gitlab.com/api/v4/projects/18412775/merge_requests"
      via: "Authorization: Bearer ${GITLAB_TOKEN}"
    - from: "src/hooks/useDataLoader.ts"
      to: "src/lib/gitlabApi.ts"
      via: "fetchGitLabMRs() in Promise.allSettled"
---

<objective>
Add a "My Merge Requests" section to the QA Dashboard displaying all MRs authored by syeda.malka in GitLab project 18412775.

Purpose: Give Syeda a single-glance view of her MR activity alongside ticket data, without exposing the GitLab token to the browser.
Output: A working GitLabMRs component in the dashboard, backed by a server-side Netlify proxy, using the same dark-card visual language as existing components.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
</execution_context>

<context>
@src/App.tsx
@src/hooks/useDataLoader.ts
@src/lib/linearApi.ts
@netlify/functions/linear.ts
@src/components/GitLabLinks.tsx

<interfaces>
<!-- Existing patterns the executor must follow exactly -->

From netlify/functions/linear.ts — Netlify handler pattern:
```typescript
import type { Handler } from '@netlify/functions'
export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' }
  const apiKey = process.env.LINEAR_API_KEY
  // ... fetch external API, forward response
  return { statusCode: res.status, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }
}
```

From src/hooks/useDataLoader.ts — AppData type and Promise.allSettled pattern:
```typescript
export type AppData = {
  gitlab: { id: string; url: string; tool: string }[]
  linear: { id: string; url: string; tool: string }[]
  activity: { date: string; tool: string; workDone: string }[]
  ghlTickets: GhlTicket[]
  // gitlabMRs will be added here
}
const [sheetResult, linearResult, ghlResult] = await Promise.allSettled([...])
```

From src/components/GitLabLinks.tsx — dark card shell styling to match:
```
background: 'rgba(15,23,42,0.7)'
border: '1px solid rgba(XX,XX,XX,0.12)'
backdropFilter: 'blur(16px)'
boxShadow: '0 4px 24px rgba(0,0,0,0.3)'
className="rounded-2xl p-4 sm:p-6"
```
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Netlify proxy + fetch helper + GitLabMR type</name>
  <files>netlify/functions/gitlab-mrs.ts, src/lib/gitlabApi.ts, .env.local</files>
  <action>
**Step A — Add GITLAB_TOKEN to .env.local**

Append to `.env.local` (do NOT prefix with VITE_):
```
# Server-side only (used by Netlify function, NOT exposed to browser)
GITLAB_TOKEN=<your-gitlab-personal-access-token>
```

**Step B — Create `netlify/functions/gitlab-mrs.ts`**

Follow the `netlify/functions/linear.ts` pattern exactly. Key differences:
- Method: GET (not POST) — forward query params from the incoming request
- Auth header: `Authorization: Bearer ${token}` (not bare key like Linear)
- No request body to parse — query params only
- Hardcode the GitLab project URL base in the function

Implementation spec:
```typescript
import type { Handler } from '@netlify/functions'

const GITLAB_BASE = 'https://gitlab.com/api/v4/projects/18412775/merge_requests'

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  const token = process.env.GITLAB_TOKEN
  if (!token) {
    return { statusCode: 500, body: JSON.stringify({ error: 'GITLAB_TOKEN not configured' }) }
  }

  // Forward query params (page, per_page, state, author_username) from caller
  const params = new URLSearchParams(event.queryStringParameters ?? {})
  const url = `${GITLAB_BASE}?${params.toString()}`

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  })

  const data = await res.json()
  return {
    statusCode: res.status,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }
}
```

**Step C — Create `src/lib/gitlabApi.ts`**

Export the `GitLabMR` type and `fetchGitLabMRs()` function.

```typescript
const PROXY = '/.netlify/functions/gitlab-mrs'

export interface GitLabMR {
  iid: number
  title: string
  state: 'opened' | 'merged' | 'closed'
  created_at: string
  merged_at: string | null
  web_url: string
  target_branch: string
  source_branch: string
}

export async function fetchGitLabMRs(): Promise<GitLabMR[]> {
  const all: GitLabMR[] = []
  let page = 1
  const PER_PAGE = 100

  while (true) {
    const params = new URLSearchParams({
      author_username: 'syeda.malka',
      state: 'all',
      per_page: String(PER_PAGE),
      page: String(page),
    })
    const res = await fetch(`${PROXY}?${params.toString()}`)
    if (!res.ok) throw new Error(`GitLab proxy HTTP ${res.status}`)
    const batch = await res.json() as GitLabMR[]
    all.push(...batch)
    // GitLab returns fewer items than per_page on last page
    if (batch.length < PER_PAGE) break
    page++
  }

  return all
}
```
  </action>
  <verify>
    <automated>cd D:/ClaudeWork/qa-dashboard && npx tsc --noEmit 2>&1 | head -30</automated>
  </verify>
  <done>No TypeScript errors. `.env.local` has GITLAB_TOKEN. `netlify/functions/gitlab-mrs.ts` exports a Handler. `src/lib/gitlabApi.ts` exports GitLabMR type and fetchGitLabMRs function.</done>
</task>

<task type="auto">
  <name>Task 2: GitLabMRs component + wire into useDataLoader + App.tsx</name>
  <files>src/components/GitLabMRs.tsx, src/hooks/useDataLoader.ts, src/App.tsx</files>
  <action>
**Step A — Create `src/components/GitLabMRs.tsx`**

Match the dark card shell from `GitLabLinks.tsx` exactly (same background, border, backdropFilter, rounded-2xl). Use indigo/violet accent color (`rgba(99,102,241,...)`) to differentiate from the orange-accented GitLabLinks.

State badge colors:
- `opened` → green: `rgba(16,185,129,0.15)` bg, `#34d399` text, `rgba(16,185,129,0.3)` border
- `merged` → purple: `rgba(168,85,247,0.15)` bg, `#c084fc` text, `rgba(168,85,247,0.3)` border
- `closed` → red: `rgba(239,68,68,0.15)` bg, `#f87171` text, `rgba(239,68,68,0.3)` border

Each MR card shows:
- State badge (Open / Merged / Closed) with colored dot
- MR title (truncated, white, links to web_url)
- Target branch label (small, slate-400)
- Date: show `merged_at` if merged, otherwise `created_at` — formatted as `MMM D, YYYY` using `new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })`

Count summary in header: `{opened} open · {merged} merged · {closed} closed`

Section header: fox emoji replaced by git icon (use an inline SVG of a git-merge icon or simple `⎇` symbol), title "My Merge Requests", subtitle shows total count.

```tsx
import type { GitLabMR } from '../lib/gitlabApi'

const STATE_STYLE = {
  opened: { bg: 'rgba(16,185,129,0.15)', text: '#34d399', border: 'rgba(16,185,129,0.3)', label: 'Open' },
  merged: { bg: 'rgba(168,85,247,0.15)', text: '#c084fc', border: 'rgba(168,85,247,0.3)', label: 'Merged' },
  closed: { bg: 'rgba(239,68,68,0.15)',  text: '#f87171', border: 'rgba(239,68,68,0.3)',  label: 'Closed' },
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function GitLabMRs({ mrs }: { mrs: GitLabMR[] }) {
  const opened = mrs.filter(m => m.state === 'opened').length
  const merged = mrs.filter(m => m.state === 'merged').length
  const closed = mrs.filter(m => m.state === 'closed').length

  return (
    <div className="card-hover animate-fade-up" style={{ animationDelay: '450ms', animationFillMode: 'both' }}>
      <div style={{ background: 'rgba(15,23,42,0.7)', border: '1px solid rgba(99,102,241,0.15)', backdropFilter: 'blur(16px)', boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}
        className="rounded-2xl p-4 sm:p-6">

        {/* Header */}
        <div className="flex items-center gap-3 mb-4 sm:mb-5 flex-wrap">
          <div style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)', boxShadow: '0 0 20px rgba(99,102,241,0.35)', flexShrink: 0 }}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-white text-base font-bold">⎇</div>
          <div className="min-w-0">
            <h2 className="text-sm sm:text-base font-bold text-white">My Merge Requests</h2>
            <p className="text-slate-500 text-xs mt-0.5">{mrs.length} total · {opened} open · {merged} merged · {closed} closed</p>
          </div>
          <div className="ml-auto" style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 9999 }}
            className="text-indigo-300 text-xs px-3 py-1.5 font-bold">{mrs.length}</div>
        </div>

        {/* MR list */}
        <div className="flex flex-col gap-2 max-h-80 overflow-y-auto pr-1">
          {mrs.map(mr => {
            const s = STATE_STYLE[mr.state] ?? STATE_STYLE.closed
            const displayDate = formatDate(mr.merged_at ?? mr.created_at)
            return (
              <a key={mr.iid} href={mr.web_url} target="_blank" rel="noopener noreferrer"
                style={{ background: 'rgba(6,11,24,0.5)', border: '1px solid rgba(99,102,241,0.08)', transition: 'all 0.15s ease', textDecoration: 'none' }}
                className="flex items-start gap-3 p-3 rounded-xl group"
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'rgba(99,102,241,0.08)'; el.style.borderColor = 'rgba(99,102,241,0.2)' }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'rgba(6,11,24,0.5)'; el.style.borderColor = 'rgba(99,102,241,0.08)' }}>
                {/* State badge */}
                <span style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.text, flexShrink: 0 }}
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full mt-0.5">{s.label}</span>
                {/* Content */}
                <div className="min-w-0 flex-1">
                  <p className="text-white text-xs font-medium truncate group-hover:text-indigo-200 transition-colors">{mr.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span style={{ background: 'rgba(100,116,139,0.15)', color: '#64748b', borderRadius: 4 }}
                      className="font-mono text-[10px] px-1.5 py-0.5">→ {mr.target_branch}</span>
                    <span className="text-slate-600 text-[10px]">{displayDate}</span>
                  </div>
                </div>
                <span className="text-slate-700 text-xs group-hover:text-slate-400 transition-colors flex-shrink-0">↗</span>
              </a>
            )
          })}
        </div>

        {mrs.length === 0 && (
          <div className="text-center py-8 text-slate-600 text-sm">No merge requests found</div>
        )}
      </div>
    </div>
  )
}
```

**Step B — Update `src/hooks/useDataLoader.ts`**

1. Add `gitlabMRs` to the `AppData` type:
```typescript
import { fetchGitLabMRs } from '../lib/gitlabApi'
import type { GitLabMR } from '../lib/gitlabApi'

export type AppData = {
  gitlab: { id: string; url: string; tool: string }[]
  linear: { id: string; url: string; tool: string }[]
  activity: { date: string; tool: string; workDone: string }[]
  ghlTickets: GhlTicket[]
  gitlabMRs: GitLabMR[]
}
```

2. Add `fetchGitLabMRs()` to the `Promise.allSettled` call (4th element):
```typescript
const [sheetResult, linearResult, ghlResult, gitlabMRsResult] = await Promise.allSettled([
  fetch(...).then(...),   // existing sheet fetch
  fetchLinearTickets(),   // existing
  fetchGhlTickets(),      // existing
  fetchGitLabMRs(),       // NEW
])
```

3. Add warn log for new result:
```typescript
if (gitlabMRsResult.status === 'rejected')
  console.warn('[QA Dashboard] GitLab MRs fetch failed:', (gitlabMRsResult as PromiseRejectedResult).reason)
```

4. Include in `setData`:
```typescript
setData({
  gitlab: sheet?.gitlab ?? fallbackGitlab,
  linear,
  activity: sheet?.activity ?? fallbackActivity,
  ghlTickets,
  gitlabMRs: gitlabMRsResult.status === 'fulfilled' ? gitlabMRsResult.value : [],
})
```

**Step C — Update `src/App.tsx`**

1. Add import at top:
```typescript
import GitLabMRs from './components/GitLabMRs'
```

2. Place the component after the `<GitLabLinks>` section and before the footer `<div>`:
```tsx
{/* GitLab full width */}
<GitLabLinks tickets={data.gitlab} />

{/* My Merge Requests full width */}
<GitLabMRs mrs={data.gitlabMRs} />

<div className="mt-8 sm:mt-10 text-center ...">
```
  </action>
  <verify>
    <automated>cd D:/ClaudeWork/qa-dashboard && npx tsc --noEmit 2>&1 | head -30</automated>
  </verify>
  <done>TypeScript compiles with no errors. `AppData` includes `gitlabMRs: GitLabMR[]`. `GitLabMRs` component is imported and rendered in App.tsx after `GitLabLinks`. `npm run dev` starts without errors and the section renders (with empty state when proxy is unavailable locally, no crash).</done>
</task>

</tasks>

<verification>
After both tasks:
1. `npx tsc --noEmit` passes with zero errors
2. `npm run dev` starts without crashes
3. Browser shows "My Merge Requests" section below "GitLab Tickets"
4. On Netlify deploy, section populates with real MR data (token injected server-side)
5. Network tab shows requests going to `/.netlify/functions/gitlab-mrs` — no direct `gitlab.com` calls from browser, no token in browser environment
</verification>

<success_criteria>
- `netlify/functions/gitlab-mrs.ts` proxies GitLab REST API with GITLAB_TOKEN server-side
- `src/lib/gitlabApi.ts` exports `GitLabMR` type and `fetchGitLabMRs()` with pagination
- `src/components/GitLabMRs.tsx` renders MR list with Open/Merged/Closed state badges
- `useDataLoader.ts` fetches MRs in parallel with other data sources and adds `gitlabMRs` to AppData
- `App.tsx` renders `<GitLabMRs>` after `<GitLabLinks>` with no TypeScript errors
- `.env.local` contains `GITLAB_TOKEN` (server-side, no VITE_ prefix)
</success_criteria>

<output>
No SUMMARY.md needed for quick tasks. Return completion confirmation to user.
</output>
