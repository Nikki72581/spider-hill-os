export type TaskStatus = 'OPEN' | 'IN_PROGRESS' | 'DONE' | 'ARCHIVED'
export type TaskCategory = 'WORK' | 'HOME' | 'WRITING' | 'PERSONAL'
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
export type IdeaStatus = 'RAW' | 'DEVELOPING' | 'READY' | 'PARKED'
export type ArticleStatus = 'IDEA' | 'OUTLINE' | 'DRAFTING' | 'EDITING' | 'PUBLISHED' | 'ARCHIVED'
export type KBDomain = 'TECH' | 'WORK' | 'HOME' | 'PERSONAL'

export interface Task {
  id: string
  title: string
  body?: string | null
  status: TaskStatus
  category: TaskCategory
  priority: Priority
  dueDate?: string | null
  tags: string[]
  articleId?: string | null
  createdAt: string
  updatedAt: string
}

export interface Idea {
  id: string
  title: string
  body?: string | null
  status: IdeaStatus
  category: TaskCategory
  tags: string[]
  article?: Article | null
  createdAt: string
  updatedAt: string
}

export interface Article {
  id: string
  title: string
  status: ArticleStatus
  platform?: string | null
  body?: string | null
  notes?: string | null
  dueDate?: string | null
  publishedAt?: string | null
  tags: string[]
  ideaId?: string | null
  sourceIdea?: Idea | null
  createdAt: string
  updatedAt: string
}

export interface KBEntry {
  id: string
  title: string
  body: string
  domain: KBDomain
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface DashboardStats {
  tasksOpen: number
  tasksDueToday: number
  ideasRaw: number
  articlesInProgress: number
  kbEntries: number
}
