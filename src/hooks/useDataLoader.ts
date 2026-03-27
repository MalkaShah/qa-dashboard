import { useState, useEffect, useCallback } from 'react'
import { gitlabTickets, linearTickets, activityData } from '../data/sheetData'

export type AppData = {
  gitlab: typeof gitlabTickets
  linear: typeof linearTickets
  activity: typeof activityData
}

const REFRESH_INTERVAL = 5 * 60 * 1000 // 5 minutes

export function useDataLoader() {
  const [data, setData] = useState<AppData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // Simulated async load — swap for real API calls when ready
      // e.g. fetch Google Sheets CSV + Linear GraphQL API
      await new Promise<void>(resolve => setTimeout(resolve, 650))
      setData({ gitlab: gitlabTickets, linear: linearTickets, activity: activityData })
      setLastUpdated(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data. Please refresh.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    const interval = setInterval(load, REFRESH_INTERVAL)
    return () => clearInterval(interval)
  }, [load])

  return { data, loading, error, refresh: load, lastUpdated }
}
