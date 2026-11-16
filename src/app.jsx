import { CssBaseline, createTheme, ThemeProvider } from '@mui/material'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import HomePage from './pages/HomePage.jsx'

const theme = createTheme({
  typography: {
    fontFamily: '"Estedad", Tahoma, sans-serif',
  },
})

const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
])

export function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RouterProvider router={router} />
    </ThemeProvider>
  )
}
