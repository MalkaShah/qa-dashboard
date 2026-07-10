import type { Handler } from '@netlify/functions'

const GITLAB_API = 'https://gitlab.com/api/v4'
const PROJECT_ID = '18412775'
const AUTHOR_USERNAME = 'syeda.malka'
const PER_PAGE = 100

interface GitLabMR {
  iid: number
  title: string
  state: 'opened' | 'merged' | 'closed'
  created_at: string
  merged_at: string | null
  web_url: string
  target_branch: string
  source_branch: string
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  const token = process.env.GITLAB_TOKEN
  if (!token) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'GITLAB_TOKEN not configured' }),
    }
  }

  const headers: Record<string, string> = {
    'PRIVATE-TOKEN': token,
    'Content-Type': 'application/json',
  }

  const allMRs: GitLabMR[] = []
  let page = 1

  try {
    while (true) {
      const url =
        `${GITLAB_API}/projects/${PROJECT_ID}/merge_requests` +
        `?author_username=${AUTHOR_USERNAME}&state=all&per_page=${PER_PAGE}&page=${page}`

      const res = await fetch(url, { headers })

      if (!res.ok) {
        return {
          statusCode: res.status,
          body: JSON.stringify({ error: `GitLab API error: ${res.status} ${res.statusText}` }),
        }
      }

      const batch = (await res.json()) as GitLabMR[]
      allMRs.push(...batch)

      if (batch.length < PER_PAGE) break
      page++
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(allMRs),
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `Failed to fetch GitLab MRs: ${message}` }),
    }
  }
}
