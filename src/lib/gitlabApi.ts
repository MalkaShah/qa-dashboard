const PROXY = '/.netlify/functions/gitlab-mrs'

export type MRState = 'opened' | 'merged' | 'closed'

export interface GitLabMR {
  iid: number
  title: string
  state: MRState
  created_at: string
  merged_at: string | null
  web_url: string
  target_branch: string
  source_branch: string
}

export async function fetchGitLabMRs(): Promise<GitLabMR[]> {
  const res = await fetch(PROXY)
  if (!res.ok) throw new Error(`GitLab MR proxy HTTP ${res.status}`)
  const json = await res.json() as GitLabMR[] | { error?: string }

  if (!Array.isArray(json)) {
    const errBody = json as { error?: string }
    throw new Error(errBody.error ?? 'Unexpected response from gitlab-mrs function')
  }

  return json
}
