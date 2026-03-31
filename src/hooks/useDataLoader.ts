import { useState, useEffect, useCallback } from 'react'
import { parseSheetData } from '../lib/parseSheet'
import { gitlabTickets as fallbackGitlab, linearTickets as fallbackLinear, activityData as fallbackActivity } from '../data/sheetData'

export type AppData = {
  gitlab: { id: string; url: string; tool: string }[]
  linear: { id: string; url: string; tool: string }[]
  activity: { date: string; tool: string; workDone: string }[]
}

const SHEET_ID = '1ETrRr3oEyNJ3aQBGzw1Kf3GkHCJuGZFqe12bB81Lqi0'
const REFRESH_INTERVAL = 5 * 60 * 1000 // 5 minutes

export function useDataLoader() {
  const [data, setData] = useState<AppData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [isLive, setIsLive] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(
        `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`,
        { cache: 'no-store' }
      )
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const csv = await res.text()
      const parsed = parseSheetData(csv)
      setData(parsed)
      setIsLive(true)
      setLastUpdated(new Date())
    } catch (err) {
      console.warn('[QA Dashboard] Live sheet fetch failed, using fallback data:', err)
      // Silently fall back to hardcoded data — no error banner shown
      setData({ gitlab: fallbackGitlab, linear: fallbackLinear, activity: fallbackActivity })
      setIsLive(false)
      setLastUpdated(new Date())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    const interval = setInterval(load, REFRESH_INTERVAL)
    return () => clearInterval(interval)
  }, [load])

  return { data, loading, error, refresh: load, lastUpdated, isLive }
}
