import { createTheme } from '@mui/material/styles';

export const getTheme = (mode) =>
  createTheme({
    palette: {
      mode,
      ...(mode === 'light'
        ? {
            // 🌤 Light Theme
            primary: {
              main: '#1976d2',
              light: '#63a4ff',
              dark: '#004ba0',
              contrastText: '#fff',
            },
            secondary: {
              main: '#9c27b0',
              light: '#d05ce3',
              dark: '#6a0080',
              contrastText: '#fff',
            },
            background: {
              default: '#f4f6f8',
              paper: '#ffffff',
            },
            text: {
              primary: '#212121',
              secondary: '#424242',
            },
            divider: '#e0e0e0',
          }
        : {
            // 🌑 Dark Theme (ChatGPT-style)
            primary: {
              main: '#90caf9',
              light: '#e3f2fd',
              dark: '#42a5f5',
              contrastText: '#000',
            },
            secondary: {
              main: '#f48fb1',
              light: '#f8bbd0',
              dark: '#c2185b',
              contrastText: '#000',
            },
            background: {
              default: '#1e1e1e', // ChatGPT-ish dark ash
              paper: '#2a2a2a',   // lighter than default
            },
            text: {
              primary: '#e0e0e0',
              secondary: '#b0b0b0',
            },
            divider: '#333',
          }),
    },

    typography: {
      fontFamily: 'Roboto, Arial, sans-serif',
    },

    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 12,
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            textTransform: 'none',
            fontWeight: 500,
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: 'none',
          },
        },
      },
    },
  });
