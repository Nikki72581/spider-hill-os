'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Drawer from '@mui/material/Drawer'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'

const nav = [
  { href: '/dashboard', label: 'Dashboard',    icon: '◈', accent: '#4cc9f0' },
  { href: '/tasks',     label: 'Tasks',         icon: '◻', accent: '#f72585' },
  { href: '/ideas',     label: 'Ideas',         icon: '◆', accent: '#9b5de5' },
  { href: '/articles',  label: 'Writing',       icon: '◉', accent: '#f4a261' },
  { href: '/kb',        label: 'Knowledge',     icon: '◎', accent: '#06d6a0' },
  { href: '/links',     label: 'Links',         icon: '⬡', accent: '#4361ee' },
  { href: '/dev',       label: 'Dev Activity',  icon: '⊞', accent: '#4cc9f0' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <Drawer variant="permanent" sx={{ zIndex: 100 }}>
      {/* Logo */}
      <Box sx={{ px: '20px', pt: '20px', mb: '28px' }}>
        <Typography
          variant="overline"
          sx={{ color: 'text.disabled', display: 'block', mb: '4px' }}
        >
          System
        </Typography>
        <Typography
          sx={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: '18px',
            color: 'text.primary',
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
          }}
        >
          Spider Hill
        </Typography>
        <Typography
          sx={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            fontWeight: 500,
            color: 'primary.main',
            letterSpacing: '0.1em',
            mt: '-2px',
          }}
        >
          OS v1.0
        </Typography>
      </Box>

      {/* Nav */}
      <List sx={{ px: '10px', flex: 1 }}>
        {nav.map(({ href, label, icon, accent }) => {
          const active = pathname.startsWith(href)
          return (
            <ListItemButton
              key={href}
              component={Link}
              href={href}
              selected={active}
              sx={{
                borderLeft: `2px solid ${active ? accent : 'transparent'}`,
                pl: '12px',
                '&.Mui-selected': { bgcolor: 'var(--bg-elevated)' },
                '&.Mui-selected:hover': { bgcolor: 'var(--bg-overlay)' },
                '&:hover': { bgcolor: 'var(--bg-elevated)' },
              }}
            >
              <ListItemIcon
                sx={{
                  color: active ? accent : 'text.disabled',
                  fontSize: '14px',
                  '& span': { lineHeight: 1 },
                }}
              >
                <span>{icon}</span>
              </ListItemIcon>
              <ListItemText
                primary={label}
                primaryTypographyProps={{
                  fontWeight: active ? 600 : 400,
                  color: active ? 'text.primary' : 'text.secondary',
                }}
              />
            </ListItemButton>
          )
        })}
      </List>

      <Divider sx={{ mx: '10px', mb: '16px' }} />

      {/* Quick capture */}
      <Box sx={{ px: '10px', pb: '20px' }}>
        <ListItemButton
          component={Link}
          href="/capture"
          sx={{
            justifyContent: 'center',
            bgcolor: 'var(--bg-elevated)',
            border: '0.5px solid var(--border-mid)',
            borderRadius: 'var(--radius-md)',
            '&:hover': { bgcolor: 'var(--bg-overlay)' },
          }}
        >
          <Typography
            sx={{
              fontSize: '12px',
              fontFamily: 'var(--font-mono)',
              color: 'text.secondary',
            }}
          >
            ⌘ Quick capture
          </Typography>
        </ListItemButton>
      </Box>
    </Drawer>
  )
}
