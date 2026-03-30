'use client'

import { useState, useEffect, useCallback } from 'react'

const REFRESH_INTERVAL_MS = parseInt(
  process.env.NEXT_PUBLIC_REFRESH_INTERVAL_MS ?? '300000',
  10
)

export interface DeploymentItem {
  projectName: string
  status: 'ready' | 'building' | 'error' | 'queued'
  lastDeployAt: string
  branch: string
  buildDuration?: number
  url?: string
}

export interface FeedItem {
  id: string
  source: 'github' | 'vercel'
  action: string
  timestamp: string
  details: Record<string, unknown>
}

export interface DevActivityData {
  momentum: {
    commitsThisWeek: number
    deploysThisWeek: number
    activeRepos: number
    failedDeploys: number
  }
  deployments: DeploymentItem[]
  feed: FeedItem[]
  lastRefreshed: string
}

export function useDevActivity() {
  const [data, setData] = useState<DevActivityData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/dev-activity')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json: DevActivityData = await res.json()
      setData(json)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Fetch failed')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, REFRESH_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}
