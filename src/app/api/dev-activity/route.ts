import { NextResponse } from 'next/server'

const GITHUB_TOKEN = process.env.GITHUB_TOKEN
const GITHUB_USERNAME = process.env.GITHUB_USERNAME || 'Nikki72581'
const VERCEL_TOKEN = process.env.VERCEL_TOKEN
const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID
const REFRESH_INTERVAL_MS = parseInt(process.env.REFRESH_INTERVAL_MS || '300000', 10)

interface CommitSummary {
  sha: string
  message: string
}

interface FeedItem {
  id: string
  source: 'github' | 'vercel'
  action: string
  timestamp: string
  details: Record<string, unknown>
}

interface DeploymentItem {
  projectName: string
  status: 'ready' | 'building' | 'error' | 'queued'
  lastDeployAt: string
  branch: string
  buildDuration?: number
  url?: string
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

// In-memory cache
let cachedData: DevActivityData | null = null
let lastFetchTime = 0

function weekStart(): Date {
  const d = new Date()
  d.setDate(d.getDate() - 7)
  d.setHours(0, 0, 0, 0)
  return d
}

async function fetchGitHubData(): Promise<{
  commitsThisWeek: number
  activeRepos: number
  feedItems: FeedItem[]
}> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  }
  if (GITHUB_TOKEN) headers['Authorization'] = `Bearer ${GITHUB_TOKEN}`

  const res = await fetch(
    `https://api.github.com/users/${GITHUB_USERNAME}/events?per_page=100`,
    { headers }
  )

  if (!res.ok) {
    throw new Error(`GitHub API ${res.status}: ${await res.text()}`)
  }

  const events: Record<string, unknown>[] = await res.json()
  const since = weekStart()

  let commitsThisWeek = 0
  const activeRepoSet = new Set<string>()
  const feedItems: FeedItem[] = []

  for (const event of events) {
    if (event.type !== 'PushEvent') continue

    const eventDate = new Date(event.created_at as string)
    const payload = event.payload as Record<string, unknown>
    const repo = (event.repo as Record<string, string>)?.name ?? 'unknown'
    const commits = (payload?.commits as CommitSummary[]) ?? []
    const branch = ((payload?.ref as string) ?? '').replace('refs/heads/', '') || 'main'
    const repoShort = repo.split('/')[1] ?? repo

    if (eventDate >= since) {
      commitsThisWeek += commits.length
      activeRepoSet.add(repo)
    }

    feedItems.push({
      id: `gh-${event.id as string}`,
      source: 'github',
      action: `Pushed ${commits.length} commit${commits.length !== 1 ? 's' : ''} to \`${repoShort}\``,
      timestamp: event.created_at as string,
      details: {
        repo,
        branch,
        commits: commits.slice(0, 3).map(c => ({
          sha: c.sha.substring(0, 7),
          message: c.message.split('\n')[0],
        })),
        commitCount: commits.length,
      },
    })
  }

  return { commitsThisWeek, activeRepos: activeRepoSet.size, feedItems }
}

async function fetchVercelData(): Promise<{
  deploysThisWeek: number
  failedDeploys: number
  deployments: DeploymentItem[]
  feedItems: FeedItem[]
}> {
  if (!VERCEL_TOKEN) {
    return { deploysThisWeek: 0, failedDeploys: 0, deployments: [], feedItems: [] }
  }

  const headers = { Authorization: `Bearer ${VERCEL_TOKEN}` }
  const teamParam = VERCEL_TEAM_ID ? `?teamId=${VERCEL_TEAM_ID}` : ''

  const [deploymentsRes, projectsRes] = await Promise.all([
    fetch(`https://api.vercel.com/v6/deployments?limit=20${VERCEL_TEAM_ID ? `&teamId=${VERCEL_TEAM_ID}` : ''}`, { headers }),
    fetch(`https://api.vercel.com/v9/projects${teamParam}`, { headers }),
  ])

  if (!deploymentsRes.ok) throw new Error(`Vercel deployments API ${deploymentsRes.status}`)
  if (!projectsRes.ok) throw new Error(`Vercel projects API ${projectsRes.status}`)

  const deploymentsJson = await deploymentsRes.json()
  const projectsJson = await projectsRes.json()

  const since = weekStart()
  const rawDeployments: Record<string, unknown>[] = deploymentsJson.deployments ?? []
  const rawProjects: Record<string, unknown>[] = projectsJson.projects ?? []

  let deploysThisWeek = 0
  let failedDeploys = 0

  for (const dep of rawDeployments) {
    const createdMs = (dep.created as number) ?? 0
    const depDate = new Date(createdMs)
    if (depDate >= since) {
      deploysThisWeek++
      const state = (dep.state as string) ?? ''
      if (state === 'ERROR') failedDeploys++
    }
  }

  // Per-project latest deployment status
  const deployments: DeploymentItem[] = rawProjects.map(proj => {
    const latestDeploys = (proj.latestDeployments as Record<string, unknown>[]) ?? []
    const latest = latestDeploys[0]

    const rawState = ((latest?.state ?? latest?.readyState ?? 'QUEUED') as string).toUpperCase()
    let status: DeploymentItem['status'] = 'queued'
    if (rawState === 'READY') status = 'ready'
    else if (rawState === 'BUILDING' || rawState === 'INITIALIZING') status = 'building'
    else if (rawState === 'ERROR' || rawState === 'CANCELED') status = 'error'

    const createdMs = latest?.created as number | undefined
    const lastDeployAt = createdMs
      ? new Date(createdMs).toISOString()
      : (latest?.createdAt as string | undefined) ?? new Date().toISOString()

    const buildingAt = latest?.buildingAt as number | undefined
    const ready = latest?.ready as number | undefined
    const buildDuration =
      buildingAt && ready ? Math.round((ready - buildingAt) / 1000) : undefined

    const meta = (latest?.meta as Record<string, string> | undefined) ?? {}
    const url = latest?.url as string | undefined

    return {
      projectName: proj.name as string,
      status,
      lastDeployAt,
      branch: meta.githubCommitRef ?? 'main',
      buildDuration,
      url: url ? `https://${url}` : undefined,
    }
  })

  // Feed items from recent deployments
  const feedItems: FeedItem[] = rawDeployments.slice(0, 15).map(dep => {
    const createdMs = (dep.created as number) ?? Date.now()
    const meta = (dep.meta as Record<string, string> | undefined) ?? {}
    const state = ((dep.state as string) ?? 'QUEUED').toUpperCase()
    const verbMap: Record<string, string> = {
      READY: 'Deployed',
      ERROR: 'Failed to deploy',
      BUILDING: 'Building',
      INITIALIZING: 'Building',
      QUEUED: 'Queued',
      CANCELED: 'Canceled',
    }
    const verb = verbMap[state] ?? 'Deployed'
    const name = dep.name as string ?? 'project'
    const branch = meta.githubCommitRef ?? 'production'

    return {
      id: `vc-${dep.uid as string}`,
      source: 'vercel',
      action: `${verb} \`${name}\` → ${branch}`,
      timestamp: new Date(createdMs).toISOString(),
      details: {
        state,
        url: dep.url ? `https://${dep.url}` : undefined,
        branch,
        commitMessage: meta.githubCommitMessage ?? '',
      },
    }
  })

  return { deploysThisWeek, failedDeploys, deployments, feedItems }
}

async function fetchFreshData(): Promise<DevActivityData> {
  const [github, vercel] = await Promise.all([
    fetchGitHubData(),
    fetchVercelData(),
  ])

  const feed = [...github.feedItems, ...vercel.feedItems]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 20)

  return {
    momentum: {
      commitsThisWeek: github.commitsThisWeek,
      deploysThisWeek: vercel.deploysThisWeek,
      activeRepos: github.activeRepos,
      failedDeploys: vercel.failedDeploys,
    },
    deployments: vercel.deployments,
    feed,
    lastRefreshed: new Date().toISOString(),
  }
}

export async function GET() {
  try {
    const now = Date.now()

    // Serve fresh cache
    if (cachedData && now - lastFetchTime < REFRESH_INTERVAL_MS) {
      return NextResponse.json(cachedData)
    }

    // Stale-while-revalidate: return cached, refresh in background
    if (cachedData) {
      fetchFreshData()
        .then(data => {
          cachedData = data
          lastFetchTime = Date.now()
        })
        .catch(console.error)
      return NextResponse.json(cachedData)
    }

    // Cold start — fetch synchronously
    const data = await fetchFreshData()
    cachedData = data
    lastFetchTime = now
    return NextResponse.json(data)
  } catch (err) {
    console.error('Dev activity error:', err)
    if (cachedData) return NextResponse.json(cachedData)
    return NextResponse.json({ error: 'Failed to fetch dev activity' }, { status: 500 })
  }
}
