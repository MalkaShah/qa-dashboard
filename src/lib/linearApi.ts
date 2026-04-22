const PROXY = '/.netlify/functions/linear'

type PageInfo = { hasNextPage: boolean; endCursor: string }
type IssuesPage<T> = { nodes: T[]; pageInfo: PageInfo }

const TEAM_KEY_TO_TOOL: Record<string, string> = {
  OTTO: 'OTTO SEO',
  SE: 'Site Explorer',
  GBP: 'Local SEO/GBP',
  CG: 'Content Genius',
  AB: 'Authority Builder',
  RB: 'Report Builder',
  GSC: 'GSC Performance',
  KR: 'Keyword Ranker',
  CB: 'Dashboard',
  SA: 'Site Audit',
  SM: 'Site Metrics',
}

interface LinearNode {
  identifier: string
  url: string
  team: { key: string; name: string }
}

interface GhlNode {
  identifier: string
  title: string
  url: string
  createdAt: string
  team: { key: string; name: string }
  state: { name: string; color: string; type: string }
}

export type GhlTicket = {
  id: string
  title: string
  url: string
  tool: string
  status: string
  statusColor: string
  statusType: string
  createdAt: string
}

const QUERY = `
  query GetMyIssues($userId: ID!, $after: String) {
    issues(
      filter: { creator: { id: { eq: $userId } } }
      first: 250
      after: $after
      orderBy: createdAt
    ) {
      nodes {
        identifier
        url
        team { key name }
      }
      pageInfo { hasNextPage endCursor }
    }
  }
`

const GHL_QUERY = `
  query GetGhlIssues($userId: ID!, $after: String) {
    issues(
      filter: {
        creator: { id: { eq: $userId } }
        title: { containsIgnoreCase: "GHL" }
      }
      first: 250
      after: $after
      orderBy: createdAt
    ) {
      nodes {
        identifier
        title
        url
        createdAt
        team { key name }
        state { name color type }
      }
      pageInfo { hasNextPage endCursor }
    }
  }
`

async function runPagedQuery<T>(query: string, after?: string | null): Promise<IssuesPage<T>> {
  const res = await fetch(PROXY, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables: { after: after ?? null } }),
  })
  if (!res.ok) throw new Error(`Linear proxy HTTP ${res.status}`)
  const json = await res.json() as { error?: string; errors?: { message?: string }[]; data?: { issues?: IssuesPage<T> } }
  if (json.error) throw new Error(json.error)
  if (json.errors?.length) throw new Error(json.errors[0]?.message ?? 'Linear GraphQL error')
  const issues = json.data?.issues
  if (!issues) throw new Error('No issues data in response')
  return issues
}

async function fetchAllPages<T>(query: string): Promise<T[]> {
  const all: T[] = []
  let cursor: string | null = null

  do {
    const page: IssuesPage<T> = await runPagedQuery<T>(query, cursor)
    all.push(...page.nodes)
    cursor = page.pageInfo.hasNextPage ? page.pageInfo.endCursor : null
  } while (cursor)

  return all
}

export async function fetchLinearTickets(): Promise<{ id: string; url: string; tool: string }[]> {
  const all = await fetchAllPages<LinearNode>(QUERY)
  return all.map(n => ({
    id: n.identifier,
    url: n.url,
    tool: TEAM_KEY_TO_TOOL[n.team.key.toUpperCase()] ?? n.team.name,
  }))
}

export async function fetchGhlTickets(): Promise<GhlTicket[]> {
  const all = await fetchAllPages<GhlNode>(GHL_QUERY)
  return all.map(n => ({
    id: n.identifier,
    title: n.title,
    url: n.url,
    createdAt: n.createdAt,
    tool: TEAM_KEY_TO_TOOL[n.team.key.toUpperCase()] ?? n.team.name,
    status: n.state.name,
    statusColor: n.state.color,
    statusType: n.state.type,
  }))
}
