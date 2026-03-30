import { createTheme } from '@mui/material/styles'

export const spiderHillTheme = createTheme({
  palette: {
    mode: 'dark',
    primary:    { main: '#4cc9f0' },  // neon-cyan
    secondary:  { main: '#9b5de5' },  // neon-purple
    error:      { main: '#f72585' },  // neon-pink
    warning:    { main: '#f4a261' },  // neon-amber
    success:    { main: '#06d6a0' },  // neon-green
    info:       { main: '#4361ee' },  // neon-blue
    background: {
      default: '#080810',  // bg-base
      paper:   '#0f0f1a',  // bg-surface
    },
    text: {
      primary:   '#eeeef5',
      secondary: '#8888aa',
      disabled:  '#44445a',
    },
    divider: 'rgba(255,255,255,0.05)',
  },
  typography: {
    fontFamily: "'Syne', sans-serif",
    h1: { fontWeight: 800, letterSpacing: '-0.02em' },
    h2: { fontWeight: 700, letterSpacing: '-0.02em' },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    body1: { fontSize: '14px', lineHeight: 1.6 },
    body2: { fontSize: '13px', lineHeight: 1.5 },
    caption: {
      fontSize: '11px',
      fontFamily: "'Space Mono', monospace",
      letterSpacing: '0.06em',
    },
    overline: {
      fontSize: '11px',
      fontFamily: "'Space Mono', monospace",
      letterSpacing: '0.15em',
      textTransform: 'uppercase',
    },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none', // removes MUI's default elevation gradient
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          width: 220,
          background: '#0f0f1a',
          borderRight: '0.5px solid rgba(255,255,255,0.05)',
          position: 'fixed',
          height: '100vh',
          top: 0,
          left: 0,
          boxShadow: 'none',
          overflowX: 'hidden',
        },
      },
    },
    MuiAppBar: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          background: '#0f0f1a',
          borderBottom: '0.5px solid rgba(255,255,255,0.05)',
          color: '#eeeef5',
          boxShadow: 'none',
        },
      },
    },
    MuiToolbar: {
      styleOverrides: {
        root: {
          minHeight: '56px !important',
          height: '56px',
          paddingLeft: '32px !important',
          paddingRight: '32px !important',
          gap: '24px',
        },
      },
    },
    MuiList: {
      styleOverrides: {
        root: { padding: 0 },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          marginBottom: 2,
          paddingTop: 9,
          paddingBottom: 9,
          transition: 'all 0.15s',
          '&:hover': {
            background: '#161625',
          },
          '&.Mui-selected': {
            background: '#161625',
          },
          '&.Mui-selected:hover': {
            background: '#1d1d2e',
          },
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          minWidth: '30px',
          color: '#44445a',
        },
      },
    },
    MuiListItemText: {
      styleOverrides: {
        primary: {
          fontSize: '14px',
          fontFamily: "'Syne', sans-serif",
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          fontFamily: "'Syne', sans-serif",
          fontSize: '12px',
          color: '#eeeef5',
          background: '#161625',
          border: '0.5px solid rgba(255,255,255,0.10)',
          borderRadius: '6px',
          height: '32px',
          transition: 'border-color 0.15s',
          '&:hover': {
            borderColor: 'rgba(255,255,255,0.18)',
          },
          '&.Mui-focused': {
            borderColor: '#4cc9f0',
          },
        },
        input: {
          padding: '0 8px',
          '&::placeholder': {
            color: '#44445a',
            opacity: 1,
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          fontFamily: "'Syne', sans-serif",
          textTransform: 'none',
          borderRadius: 10,
          transition: 'all 0.15s',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontFamily: "'Space Mono', monospace",
          fontSize: '10px',
          letterSpacing: '0.06em',
          height: 22,
          borderRadius: 20,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          background: '#1d1d2e',
          border: '0.5px solid rgba(255,255,255,0.10)',
          fontSize: '11px',
          fontFamily: "'Space Mono', monospace",
          color: '#eeeef5',
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: 'rgba(255,255,255,0.05)',
        },
      },
    },
  },
})
