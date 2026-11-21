import { CssBaseline, createTheme, ThemeProvider } from '@mui/material'
import { createBrowserRouter, Navigate, Outlet, RouterProvider, ScrollRestoration, useParams } from 'react-router-dom'
import HomePage from './pages/HomePage.jsx'
import EventPage from './pages/EventPage.jsx'

const theme = createTheme({
  palette: { primary: { main: "#252923" }, secondary: { main: "#ed885f" }, background: { default: "#fbfaf7" } },
  shape: { borderRadius: 18 },
  typography: {
    fontFamily: '"Estedad", "Vazirmatn", Tahoma, sans-serif',
    button: { textTransform: "none", fontWeight: 700 },
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
