import { createTheme } from '@mui/material/styles';

// Create a farm/agricultural inspired theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2E7D32', // Forest green
      light: '#4CAF50', // Green
      dark: '#1B5E20', // Dark green
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#795548', // Brown (soil)
      light: '#A1887F', // Light brown
      dark: '#5D4037', // Dark brown
      contrastText: '#ffffff',
    },
    error: {
      main: '#D32F2F',
      light: '#EF5350',
      dark: '#C62828',
    },
    warning: {
      main: '#FF9800', // Orange (pumpkin)
      light: '#FFB74D',
      dark: '#F57C00',
    },
    info: {
      main: '#1976D2', // Blue (water/sky)
      light: '#42A5F5',
      dark: '#1565C0',
    },
    success: {
      main: '#689F38', // Light green (young plants)
      light: '#8BC34A',
      dark: '#558B2F',
    },
    background: {
      default: '#F9F7F3', // Light cream (like parchment)
      paper: '#FFFFFF',
    },
    text: {
      primary: '#33372E', // Dark green-gray
      secondary: '#707070', // Medium gray
      disabled: 'rgba(0, 0, 0, 0.38)',
    },
    divider: 'rgba(115, 136, 91, 0.12)', // Olive-ish
  },

  typography: {
    fontFamily: '"Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 300,
      fontSize: '2.5rem',
    },
    h2: {
      fontWeight: 400,
      fontSize: '2rem',
    },
    h3: {
      fontWeight: 400,
      fontSize: '1.75rem',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    h5: {
      fontWeight: 500,
      fontSize: '1.25rem',
    },
    h6: {
      fontWeight: 500,
      fontSize: '1rem',
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: 1.75,
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.57,
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 400,
      lineHeight: 1.43,
    },
    button: {
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.75,
      textTransform: 'none',
    },
    caption: {
      fontSize: '0.75rem',
      fontWeight: 400,
      lineHeight: 1.66,
    },
    overline: {
      fontSize: '0.75rem',
      fontWeight: 600,
      lineHeight: 2.66,
      textTransform: 'uppercase',
    },
  },

  shape: {
    borderRadius: 8, // Slightly more rounded corners
  },

  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          padding: '8px 16px',
        },
        contained: {
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          border: '1px solid rgba(115, 136, 91, 0.08)', // Very subtle border
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            boxShadow: '0 6px 16px rgba(0, 0, 0, 0.1)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 4px rgba(0, 0, 0, 0.1)',
          backgroundImage: 'linear-gradient(to right, #2E7D32, #1B5E20)', // Gradient
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          border: 'none',
          backgroundImage: 'linear-gradient(to bottom, rgba(249, 247, 243, 0.9), rgba(249, 247, 243, 1))',
          backgroundSize: 'cover',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(115, 136, 91, 0.04)', // Very light olive color
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600,
          color: '#33372E', // Dark green-gray
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: '2px 8px',
          '&.Mui-selected': {
            backgroundColor: 'rgba(46, 125, 50, 0.08)', // Light green with transparency
            '&:hover': {
              backgroundColor: 'rgba(46, 125, 50, 0.12)',
            },
          },
          '&:hover': {
            backgroundColor: 'rgba(46, 125, 50, 0.04)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        elevation1: {
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
        },
        elevation2: {
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        },
      },
    },
  },
});

export default theme; 