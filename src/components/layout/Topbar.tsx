'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import InputBase from '@mui/material/InputBase'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import MenuRoundedIcon from '@mui/icons-material/MenuRounded'

interface TopbarProps {
  onMenuClick?: () => void
  showMenuButton?: boolean
}

export default function Topbar({ onMenuClick, showMenuButton = false }: TopbarProps) {
  const [query, setQuery] = useState('')
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/kb?search=${encodeURIComponent(query.trim())}`)
    }
  }

  const dateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  })

  return (
    <AppBar position="static">
      <Toolbar>
        {/* Hamburger — mobile only */}
        {showMenuButton && (
          <IconButton
            edge="start"
            onClick={onMenuClick}
            size="small"
            sx={{ color: 'text.secondary', mr: '4px', flexShrink: 0 }}
            aria-label="open navigation menu"
          >
            <MenuRoundedIcon fontSize="small" />
          </IconButton>
        )}

        {/* Date — desktop only */}
        {!showMenuButton && (
          <Typography
            variant="caption"
            sx={{ whiteSpace: 'nowrap', color: 'text.disabled', letterSpacing: '0.06em', flexShrink: 0 }}
          >
            {dateStr}
          </Typography>
        )}

        {/* Search */}
        <Box
          component="form"
          onSubmit={handleSearch}
          sx={{ flex: 1, maxWidth: showMenuButton ? '100%' : 360 }}
        >
          <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <SearchRoundedIcon
              sx={{
                position: 'absolute',
                left: 8,
                fontSize: '14px',
                color: 'text.disabled',
                pointerEvents: 'none',
                zIndex: 1,
              }}
            />
            <InputBase
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search KB, ideas, articles..."
              inputProps={{ 'aria-label': 'global search' }}
              sx={{ pl: '28px', width: '100%' }}
            />
          </Box>
        </Box>

        {/* Live indicator */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px', ml: 'auto', flexShrink: 0 }}>
          <Box
            component="span"
            sx={{
              width: 5,
              height: 5,
              borderRadius: '50%',
              bgcolor: 'success.main',
              animation: 'neon-pulse 2.5s ease-in-out infinite',
              display: 'inline-block',
              flexShrink: 0,
            }}
          />
          <Typography
            variant="caption"
            sx={{
              color: 'text.disabled',
              letterSpacing: '0.08em',
              display: showMenuButton ? 'none' : 'block',
            }}
          >
            LIVE
          </Typography>
        </Box>
      </Toolbar>
    </AppBar>
  )
}
