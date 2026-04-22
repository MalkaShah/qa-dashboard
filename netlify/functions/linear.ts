import type { Handler } from '@netlify/functions'

const LINEAR_API = 'https://api.linear.app/graphql'

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  const apiKey = process.env.LINEAR_API_KEY
  const userId = process.env.LINEAR_USER_ID

  if (!apiKey || !userId) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'LINEAR_API_KEY or LINEAR_USER_ID not configured' }),
    }
  }

  let query: string
  let variables: Record<string, unknown>

  try {
    const body = JSON.parse(event.body || '{}')
    query = body.query
    variables = { ...body.variables, userId }
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON body' }) }
  }

  const res = await fetch(LINEAR_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: apiKey },
    body: JSON.stringify({ query, variables }),
  })

  const data = await res.json()

  return {
    statusCode: res.status,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }
}
