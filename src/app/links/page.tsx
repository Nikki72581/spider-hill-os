'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface LinkCard {
  title: string
  url: string
  favIconUrl?: string
  description?: string
}

interface LinkCollection {
  title: string
  cards: LinkCard[]
}

const staticCollections: LinkCollection[] = [
  {
    title: 'Things to Share',
    cards: [
      {
        title: 'The Creator of TypeScript',
        url: 'https://www.google.com/search?q=the+creator+of+typescript&oq=the+creator+of+typescript&gs_lcrp=EgZjaHJvbWUyBggAEEUYOTIHCAEQABjvBdIBCDUzMjJqMGoxqAIAsAIA&sourceid=chrome&ie=UTF-8#fpstate=ive&vld=cid:341b6898,vid:uMqx8NNT4xY,st:0',
        favIconUrl: 'https://www.gstatic.com/images/branding/searchlogo/ico/favicon.ico',
      },
    ],
  },
  {
    title: 'Junova.io',
    cards: [
      {
        title: 'Junova Learning Center',
        url: 'https://www.junova.io/studio/structure',
        favIconUrl: 'https://www.junova.io/favicon.svg',
        description: 'Content Studio',
      },
      {
        title: 'Junova — ERP + AI Consulting',
        url: 'https://www.junova.io/learn/guides',
        favIconUrl: 'https://www.junova.io/favicon.svg',
        description: 'Guides & Learning',
      },
    ],
  },
  {
    title: 'Acumatica Systems',
    cards: [
      {
        title: 'Local 26R1',
        url: 'http://desktop-3v587o1/Acumatica26R1/',
        description: 'Customization Projects',
      },
    ],
  },
  {
    title: 'Commission Flow App',
    cards: [
      {
        title: 'commissionflow – Vercel',
        url: 'https://vercel.com/nikki72581s-projects/commissionflow',
        favIconUrl: 'https://assets.vercel.com/image/upload/front/favicon/vercel/favicon.ico',
        description: 'Deployments & Monitoring',
      },
      {
        title: 'Clerk.com',
        url: 'https://dashboard.clerk.com/apps/app_36G1LG5zKweJmirHUf9sLGLOJjZ/instances/ins_36G1LMHGiK4KvxE9mlAagovQk6U',
        favIconUrl: 'https://dashboard.clerk.com/assets/favicon-dark.png',
        description: 'Authentication & Users',
      },
      {
        title: 'CommissionFlow Git',
        url: 'https://github.com/Nikki72581/commissionflow',
        favIconUrl: 'https://github.githubassets.com/favicons/favicon-dark.svg',
        description: 'Project Repository',
      },
      {
        title: 'CommissionFlow – Napkin AI',
        url: 'https://app.napkin.ai/page/CgoiCHByb2Qtb25lEiwKBFBhZ2UaJGE5YjQ5ZjJmLWFlMjgtNDY2YS1iODI1LTE4Zjg4ZWFkMTc4Mw?step=verify',
        favIconUrl: 'https://app.napkin.ai/favicon-16x16.png?v=2',
        description: 'Visual Diagrams',
      },
      {
        title: 'Prisma Data Platform',
        url: 'https://console.prisma.io/cminmlt7z0ccsxdfkqu8a07af/cminmmlpc0cd3xdfki1sfsrvy/cmip96ies1363xdfkt05lumtp/dashboard',
        favIconUrl: 'https://console.prisma.io/favicon.png',
        description: 'Database',
      },
      {
        title: 'ARFlow – AR Portal',
        url: 'https://arflow.junova.io/',
        favIconUrl: 'https://arflow.junova.io/favicon.ico?favicon.0b3bf435.ico',
        description: 'B2B Accounts Receivable',
      },
      {
        title: 'Atlas Alpha',
        url: 'https://atlas-alpha-blush.vercel.app/dashboard/finance/dimensions',
        favIconUrl: 'https://atlas-alpha-blush.vercel.app/favicon.ico',
      },
    ],
  },
  {
    title: 'Tools',
    cards: [
      {
        title: 'Notion',
        url: 'https://www.notion.so/The-Ultimate-Productivity-System-Purple-49a373b2a89a4f1a8e8c9ed62e4f5957',
        description: 'Ultimate Productivity System',
      },
      {
        title: 'PolitePost.net',
        url: 'https://politepost.net/',
        favIconUrl: 'https://politepost.net/favicon.png',
        description: 'AI Email Rewriting',
      },
      {
        title: 'Microsoft Defender – Quarantine',
        url: 'https://security.microsoft.com/quarantine?viewid=Email&tid=255cb1ad-9df7-4886-8bf2-269afd27ae8a',
        favIconUrl: 'https://security.microsoft.com/favicon.ico',
        description: 'Email Quarantine',
      },
      {
        title: 'W3Schools',
        url: 'https://www.w3schools.com/',
        favIconUrl: 'https://www.w3schools.com/favicon.ico',
        description: 'Web Tutorials',
      },
      {
        title: 'Claude',
        url: 'https://claude.ai/new',
        favIconUrl: 'https://claude.ai/favicon.ico',
        description: 'AI Assistant',
      },
      {
        title: 'Exchange Admin Center',
        url: 'https://admin.exchange.microsoft.com/#/otherFeatures',
        favIconUrl: 'https://res.cdn.office.net/admincenter/admin-content/images/exchange_favicon.ico',
        description: 'Email Administration',
      },
      {
        title: 'The Component Gallery',
        url: 'https://component.gallery/',
        favIconUrl: 'https://component.gallery/favicon.ico',
        description: 'UI Component Reference',
      },
      {
        title: 'Junova Mail',
        url: 'https://outlook.office.com/mail/inbox/id/AAQkAGFjYWI5NzMzLWFkNDYtNGIxOC05YzJlLTdlMzc1NDc1NzA2YgAQAPXK05zp6h9Jux6hjRuJiDM%3D',
        favIconUrl: 'https://res.public.onecdn.static.microsoft/owamail/20251128003.09/resources/images/favicons/mail-seen.ico',
        description: 'Nicole Ronchetti – Outlook',
      },
      {
        title: 'Hugging Face – Learn',
        url: 'https://huggingface.co/learn',
        favIconUrl: 'https://huggingface.co/favicon.ico',
        description: 'ML & AI Education',
      },
      {
        title: 'AI SDK',
        url: 'https://ai-sdk.dev/',
        favIconUrl: 'https://ai-sdk.dev/favicon.ico',
        description: 'Vercel AI SDK Docs',
      },
    ],
  },
]

const ACCENT_COLORS = [
  'var(--neon-amber)',
  'var(--neon-cyan)',
  'var(--neon-blue)',
  'var(--neon-purple)',
  'var(--neon-green)',
  'var(--neon-pink)',
]

const staticAccents: Record<string, string> = {
  'Things to Share':     'var(--neon-amber)',
  'Junova.io':           'var(--neon-cyan)',
  'Acumatica Systems':   'var(--neon-blue)',
  'Commission Flow App': 'var(--neon-purple)',
  'Tools':               'var(--neon-green)',
}

const STORAGE_KEY = 'spider-hill-links'

interface StoredLink extends LinkCard {
  collection: string
}

function getAccent(name: string, allNames: string[]): string {
  if (staticAccents[name]) return staticAccents[name]
  const idx = allNames.indexOf(name)
  return ACCENT_COLORS[idx % ACCENT_COLORS.length]
}

function FavIcon({ url, title }: { url?: string; title: string }) {
  const [failed, setFailed] = useState(false)

  const placeholder = (
    <div style={{
      width: '16px',
      height: '16px',
      borderRadius: '3px',
      background: 'var(--bg-overlay)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '9px',
      color: 'var(--text-muted)',
      flexShrink: 0,
    }}>
      {title.charAt(0).toUpperCase()}
    </div>
  )

  if (!url || failed || url.startsWith('data:')) return placeholder

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt=""
      width={16}
      height={16}
      style={{ borderRadius: '3px', flexShrink: 0, objectFit: 'contain' }}
      onError={() => setFailed(true)}
    />
  )
}

interface AddLinkModalProps {
  open: boolean
  existingCollections: string[]
  onClose: () => void
  onAdd: (link: StoredLink) => void
}

function AddLinkModal({ open, existingCollections, onClose, onAdd }: AddLinkModalProps) {
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [description, setDescription] = useState('')
  const [favIconUrl, setFavIconUrl] = useState('')
  const [collection, setCollection] = useState(existingCollections[0] ?? '')
  const [newCollection, setNewCollection] = useState('')
  const [useNewCollection, setUseNewCollection] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const col = useNewCollection ? newCollection.trim() : collection
    if (!title.trim() || !url.trim() || !col) return
    onAdd({
      title: title.trim(),
      url: url.trim(),
      description: description.trim() || undefined,
      favIconUrl: favIconUrl.trim() || undefined,
      collection: col,
    })
    // Reset form
    setTitle(''); setUrl(''); setDescription(''); setFavIconUrl('')
    setNewCollection(''); setUseNewCollection(false)
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent style={{ background: 'var(--bg-surface)', border: '0.5px solid var(--border-mid)', maxWidth: '420px' }}>
        <DialogHeader>
          <DialogTitle style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Add Link
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <Label style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Title *
            </Label>
            <Input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Link title"
              required
              autoFocus
              style={{ background: 'var(--bg-overlay)', borderColor: 'var(--border-mid)', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: '13px' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <Label style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              URL *
            </Label>
            <Input
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://"
              required
              type="url"
              style={{ background: 'var(--bg-overlay)', borderColor: 'var(--border-mid)', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: '13px' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <Label style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Description
            </Label>
            <Input
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Short description (optional)"
              style={{ background: 'var(--bg-overlay)', borderColor: 'var(--border-mid)', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: '13px' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <Label style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Favicon URL
            </Label>
            <Input
              value={favIconUrl}
              onChange={e => setFavIconUrl(e.target.value)}
              placeholder="https://example.com/favicon.ico (optional)"
              style={{ background: 'var(--bg-overlay)', borderColor: 'var(--border-mid)', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: '13px' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <Label style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Collection *
            </Label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button
                type="button"
                variant={!useNewCollection ? 'default' : 'outline'}
                size="sm"
                onClick={() => setUseNewCollection(false)}
                style={{
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 600,
                  background: !useNewCollection ? 'var(--neon-blue)' : 'var(--bg-overlay)',
                  color: !useNewCollection ? '#000' : 'var(--text-muted)',
                  border: '0.5px solid var(--border-mid)',
                }}
              >
                Existing
              </Button>
              <Button
                type="button"
                variant={useNewCollection ? 'default' : 'outline'}
                size="sm"
                onClick={() => setUseNewCollection(true)}
                style={{
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 600,
                  background: useNewCollection ? 'var(--neon-blue)' : 'var(--bg-overlay)',
                  color: useNewCollection ? '#000' : 'var(--text-muted)',
                  border: '0.5px solid var(--border-mid)',
                }}
              >
                New
              </Button>
            </div>
            {useNewCollection ? (
              <Input
                value={newCollection}
                onChange={e => setNewCollection(e.target.value)}
                placeholder="New collection name"
                required
                style={{ background: 'var(--bg-overlay)', borderColor: 'var(--border-mid)', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: '13px' }}
              />
            ) : (
              <Select value={collection} onValueChange={setCollection} required>
                <SelectTrigger style={{ background: 'var(--bg-overlay)', borderColor: 'var(--border-mid)', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{ background: 'var(--bg-overlay)', borderColor: 'var(--border-mid)' }}>
                  {existingCollections.map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '4px' }}>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              style={{
                fontFamily: 'var(--font-mono)',
                background: 'var(--bg-overlay)',
                borderColor: 'var(--border-mid)',
                color: 'var(--text-muted)',
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              style={{
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                background: 'var(--neon-blue)',
                color: '#000',
                border: 'none',
              }}
            >
              Add Link
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function LinksPage() {
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [userLinks, setUserLinks] = useState<StoredLink[]>([])

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setUserLinks(JSON.parse(stored))
    } catch {
      // ignore
    }
  }, [])

  function addLink(link: StoredLink) {
    const updated = [...userLinks, link]
    setUserLinks(updated)
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)) } catch { /* ignore */ }
    setShowModal(false)
  }

  const collections: LinkCollection[] = [...staticCollections]
  for (const link of userLinks) {
    const existing = collections.find(c => c.title === link.collection)
    const card: LinkCard = { title: link.title, url: link.url, description: link.description, favIconUrl: link.favIconUrl }
    if (existing) {
      existing.cards.push(card)
    } else {
      collections.push({ title: link.collection, cards: [card] })
    }
  }

  const allNames = collections.map(c => c.title)

  const query = search.toLowerCase().trim()
  const filtered = collections
    .map(col => ({
      ...col,
      cards: col.cards.filter(card =>
        !query ||
        card.title.toLowerCase().includes(query) ||
        (card.description ?? '').toLowerCase().includes(query) ||
        col.title.toLowerCase().includes(query)
      ),
    }))
    .filter(col => col.cards.length > 0)

  const totalLinks = collections.reduce((acc, c) => acc + c.cards.length, 0)

  return (
    <div style={{ maxWidth: '900px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontWeight: 800, fontSize: '24px', letterSpacing: '-0.02em', marginBottom: '2px' }}>Links</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
            {totalLinks} links · {collections.length} collections
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ position: 'relative' }}>
            <Input
              type="text"
              placeholder="Search links..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-48 h-9"
              style={{
                background: 'var(--bg-surface)',
                borderColor: 'var(--border-mid)',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-mono)',
                fontSize: '13px',
              }}
            />
          </div>

          <Button
            onClick={() => setShowModal(true)}
            size="sm"
            style={{
              background: 'var(--neon-blue)',
              color: '#000',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              border: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            + Add Link
          </Button>
        </div>
      </div>

      {/* Collections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {filtered.map(col => {
          const accent = getAccent(col.title, allNames)
          return (
            <div key={col.title}>
              {/* Section header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <div style={{ width: '3px', height: '16px', borderRadius: '2px', background: accent, flexShrink: 0 }} />
                <span style={{
                  fontSize: '11px', fontFamily: 'var(--font-mono)', color: accent,
                  letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600,
                }}>
                  {col.title}
                </span>
                <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                  {col.cards.length}
                </span>
              </div>

              {/* Cards grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: '8px',
              }}>
                {col.cards.map(card => (
                  <a
                    key={card.url}
                    href={card.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-surface)',
                      border: '0.5px solid var(--border-subtle)',
                      textDecoration: 'none',
                      transition: 'border-color 0.15s, background 0.15s',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={e => {
                      const el = e.currentTarget as HTMLAnchorElement
                      el.style.borderColor = accent
                      el.style.background = 'var(--bg-elevated)'
                    }}
                    onMouseLeave={e => {
                      const el = e.currentTarget as HTMLAnchorElement
                      el.style.borderColor = 'var(--border-subtle)'
                      el.style.background = 'var(--bg-surface)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FavIcon url={card.favIconUrl} title={card.title} />
                      <span style={{
                        fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1,
                      }}>
                        {card.title}
                      </span>
                    </div>
                    {card.description && (
                      <span style={{
                        fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {card.description}
                      </span>
                    )}
                  </a>
                ))}
              </div>
            </div>
          )
        })}

        {filtered.length === 0 && (
          <div style={{ color: 'var(--text-secondary)', fontSize: '13px', padding: '40px 0', textAlign: 'center' }}>
            No links match &ldquo;{search}&rdquo;
          </div>
        )}
      </div>

      <AddLinkModal
        open={showModal}
        existingCollections={collections.map(c => c.title)}
        onClose={() => setShowModal(false)}
        onAdd={addLink}
      />
    </div>
  )
}
