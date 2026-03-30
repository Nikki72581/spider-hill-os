'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import InputBase from '@mui/material/InputBase'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'

export default function Topbar() {
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
        {/* Date */}
        <Typography
          variant="caption"
          sx={{ whiteSpace: 'nowrap', color: 'text.disabled', letterSpacing: '0.06em' }}
        >
          {dateStr}
        </Typography>

        {/* Search */}
        <Box
          component="form"
          onSubmit={handleSearch}
          sx={{ flex: 1, maxWidth: 360 }}
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px', ml: 'auto' }}>
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
            sx={{ color: 'text.disabled', letterSpacing: '0.08em' }}
          >
            LIVE
          </Typography>
        </Box>
      </Toolbar>
    </AppBar>
  )
}
