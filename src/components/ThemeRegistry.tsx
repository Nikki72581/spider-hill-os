'use client'

import { useState } from 'react'
import createCache from '@emotion/cache'
import { useServerInsertedHTML } from 'next/navigation'
import { CacheProvider } from '@emotion/react'
import { ThemeProvider } from '@mui/material/styles'
import { spiderHillTheme } from '@/theme/muiTheme'

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  const [{ cache, flush }] = useState(() => {
    const c = createCache({ key: 'mui' })
    c.compat = true
    const prevInsert = c.insert.bind(c)
    let inserted: string[] = []
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(c as any).insert = function (...args: Parameters<typeof prevInsert>) {
      const serialized = args[1]
      if (c.inserted[serialized.name] === undefined) {
        inserted.push(serialized.name)
      }
      return prevInsert(...args)
    }
    const flush = () => {
      const prev = inserted
      inserted = []
      return prev
    }
    return { cache: c, flush }
  })

  useServerInsertedHTML(() => {
    const names = flush()
    if (!names.length) return null
    const styles = names.map(name => cache.inserted[name] as string).join('')
    return (
      <style
        key={cache.key}
        data-emotion={`${cache.key} ${names.join(' ')}`}
        dangerouslySetInnerHTML={{ __html: styles }}
      />
    )
  })

  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={spiderHillTheme}>
        {children}
      </ThemeProvider>
    </CacheProvider>
  )
}
