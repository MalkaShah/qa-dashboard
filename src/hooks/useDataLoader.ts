import { useState, useEffect, useCallback } from 'react'
import { parseSheetData } from '../lib/parseSheet'
import { fetchLinearTickets, fetchGhlTickets } from '../lib/linearApi'
import type { GhlTicket } from '../lib/linearApi'
import { gitlabTickets as fallbackGitlab, linearTickets as fallbackLinear, activityData as fallbackActivity } from '../data/sheetData'

export type { GhlTicket }

export type AppData = {
  gitlab: { id: string; url: string; tool: string }[]
  linear: { id: string; url: string; tool: string }[]
  activity: { date: string; tool: string; workDone: string }[]
  ghlTickets: GhlTicket[]
}

const SHEET_ID = import.meta.env.VITE_GOOGLE_SHEET_ID || '1ETrRr3oEyNJ3aQBGzw1Kf3GkHCJuGZFqe12bB81Lqi0'
const REFRESH_INTERVAL = 5 * 60 * 1000

export function useDataLoader() {
  const [data, setData] = useState<AppData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [isLive, setIsLive] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)

    const [sheetResult, linearResult, ghlResult] = await Promise.allSettled([
      fetch(
        `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`,
        { cache: 'no-store' }
      )
        .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.text() })
        .then(csv => parseSheetData(csv)),
      fetchLinearTickets(),
      fetchGhlTickets(),
    ])

    if (sheetResult.status === 'rejected')
      console.warn('[QA Dashboard] Sheet fetch failed:', (sheetResult as PromiseRejectedResult).reason)
    if (linearResult.status === 'rejected')
      console.warn('[QA Dashboard] Linear fetch failed:', (linearResult as PromiseRejectedResult).reason)
    if (ghlResult.status === 'rejected')
      console.warn('[QA Dashboard] GHL fetch failed:', (ghlResult as PromiseRejectedResult).reason)

    const sheet = sheetResult.status === 'fulfilled' ? sheetResult.value : null
    const linear = linearResult.status === 'fulfilled' ? linearResult.value : fallbackLinear
    const ghlTickets = ghlResult.status === 'fulfilled' ? ghlResult.value : []

    setData({
      gitlab: sheet?.gitlab ?? fallbackGitlab,
      linear,
      activity: sheet?.activity ?? fallbackActivity,
      ghlTickets,
    })
    setIsLive(sheetResult.status === 'fulfilled' || linearResult.status === 'fulfilled')
    setLastUpdated(new Date())
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
    const interval = setInterval(load, REFRESH_INTERVAL)
    return () => clearInterval(interval)
  }, [load])

  return { data, loading, error, refresh: load, lastUpdated, isLive }
}
