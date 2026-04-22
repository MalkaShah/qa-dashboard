const LINEAR_API = 'https://api.linear.app/graphql'

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

async function runPagedQuery<T>(
  apiKey: string,
  userId: string,
  query: string
): Promise<T[]> {
  const all: T[] = []
  let cursor: string | null = null

  do {
    const res = await fetch(LINEAR_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: apiKey },
      body: JSON.stringify({ query, variables: { userId, after: cursor } }),
    })
    if (!res.ok) throw new Error(`Linear API HTTP ${res.status}`)
    const json = await res.json()
    if (json.errors?.length) throw new Error(json.errors[0]?.message ?? 'Linear GraphQL error')

    const { nodes, pageInfo } = json.data.issues
    all.push(...nodes)
    cursor = pageInfo.hasNextPage ? pageInfo.endCursor : null
  } while (cursor)

  return all
}

export async function fetchLinearTickets(): Promise<{ id: string; url: string; tool: string }[]> {
  const apiKey = import.meta.env.VITE_LINEAR_API_KEY
  const userId = import.meta.env.VITE_LINEAR_USER_ID
  if (!apiKey || !userId) throw new Error('Linear env vars not configured')

  const all = await runPagedQuery<LinearNode>(apiKey, userId, QUERY)
  return all.map(n => ({
    id: n.identifier,
    url: n.url,
    tool: TEAM_KEY_TO_TOOL[n.team.key.toUpperCase()] ?? n.team.name,
  }))
}

export async function fetchGhlTickets(): Promise<GhlTicket[]> {
  const apiKey = import.meta.env.VITE_LINEAR_API_KEY
  const userId = import.meta.env.VITE_LINEAR_USER_ID
  if (!apiKey || !userId) throw new Error('Linear env vars not configured')

  const all = await runPagedQuery<GhlNode>(apiKey, userId, GHL_QUERY)
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
