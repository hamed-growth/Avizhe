import { CssBaseline, createTheme, ThemeProvider } from '@mui/material'
import { createBrowserRouter, Navigate, Outlet, RouterProvider, ScrollRestoration, useParams } from 'react-router-dom'
import HomePage from './pages/HomePage.jsx'
import EventPage from './pages/EventPage.jsx'

const theme = createTheme({
  typography: {
    fontFamily: '"Estedad", Tahoma, sans-serif',
  },
})

// Old product URLs now open the in-page explorer.
function ProductRedirect() {
  const { category } = useParams()
  return <Navigate to={{ pathname: '/', hash: `#products/${category}` }} replace />
}

function RootLayout() {
  return (
    <>
      <Outlet />
      <ScrollRestoration />
    </>
  )
}

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/products/:category', element: <ProductRedirect /> },
      { path: '/events/:year', element: <EventPage /> },
    ],
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
