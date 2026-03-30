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
import IconButton from '@mui/material/IconButton'
// MUI Icons
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded'
import TaskAltRoundedIcon from '@mui/icons-material/TaskAltRounded'
import LightbulbRoundedIcon from '@mui/icons-material/LightbulbRounded'
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded'
import AutoStoriesRoundedIcon from '@mui/icons-material/AutoStoriesRounded'
import LinkRoundedIcon from '@mui/icons-material/LinkRounded'
import TerminalRoundedIcon from '@mui/icons-material/TerminalRounded'
import BoltRoundedIcon from '@mui/icons-material/BoltRounded'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import type { SvgIconComponent } from '@mui/icons-material'

const nav: { href: string; label: string; Icon: SvgIconComponent; accent: string }[] = [
  { href: '/dashboard', label: 'Dashboard',   Icon: GridViewRoundedIcon,    accent: '#4cc9f0' },
  { href: '/tasks',     label: 'Tasks',        Icon: TaskAltRoundedIcon,     accent: '#f72585' },
  { href: '/ideas',     label: 'Ideas',        Icon: LightbulbRoundedIcon,   accent: '#9b5de5' },
  { href: '/articles',  label: 'Writing',      Icon: EditNoteRoundedIcon,    accent: '#f4a261' },
  { href: '/kb',        label: 'Knowledge',    Icon: AutoStoriesRoundedIcon, accent: '#06d6a0' },
  { href: '/links',     label: 'Links',        Icon: LinkRoundedIcon,        accent: '#4361ee' },
  { href: '/dev',       label: 'Dev Activity', Icon: TerminalRoundedIcon,    accent: '#4cc9f0' },
]

interface SidebarProps {
  mobileOpen?: boolean
  onClose?: () => void
  isMobile?: boolean
}

function SidebarContent({
  isMobile,
  onClose,
  pathname,
}: {
  isMobile: boolean
  onClose?: () => void
  pathname: string
}) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Logo */}
      <Box sx={{ px: '20px', pt: '20px', mb: '28px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Box>
          <Typography
            variant="overline"
            sx={{ color: 'text.disabled', display: 'block', mb: '4px' }}
          >
            System
          </Typography>
          <Typography
            sx={{
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
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
        {isMobile && (
          <IconButton
            onClick={onClose}
            size="small"
            sx={{ color: 'text.disabled', mt: '4px', mr: '-4px' }}
            aria-label="close menu"
          >
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      {/* Nav */}
      <List sx={{ px: '10px', flex: 1 }}>
        {nav.map(({ href, label, Icon, accent }) => {
          const active = pathname.startsWith(href)
          return (
            <ListItemButton
              key={href}
              component={Link}
              href={href}
              selected={active}
              onClick={isMobile ? onClose : undefined}
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
                  '& .MuiSvgIcon-root': { fontSize: '18px' },
                }}
              >
                <Icon />
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
          onClick={isMobile ? onClose : undefined}
          sx={{
            justifyContent: 'center',
            bgcolor: 'var(--bg-elevated)',
            border: '0.5px solid var(--border-mid)',
            borderRadius: 'var(--radius-md)',
            gap: '8px',
            '&:hover': { bgcolor: 'var(--bg-overlay)' },
          }}
        >
          <BoltRoundedIcon sx={{ fontSize: '14px', color: 'var(--neon-cyan)' }} />
          <Typography
            sx={{
              fontSize: '12px',
              fontFamily: 'var(--font-mono)',
              color: 'text.secondary',
            }}
          >
            Quick capture
          </Typography>
        </ListItemButton>
      </Box>
    </Box>
  )
}

export default function Sidebar({ mobileOpen = false, onClose, isMobile = false }: SidebarProps) {
  const pathname = usePathname()

  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        sx={{ zIndex: 1300 }}
        ModalProps={{ keepMounted: true }}
      >
        <SidebarContent isMobile pathname={pathname} onClose={onClose} />
      </Drawer>
    )
  }

  return (
    <Drawer variant="permanent" sx={{ zIndex: 100 }}>
      <SidebarContent isMobile={false} pathname={pathname} />
    </Drawer>
  )
}
