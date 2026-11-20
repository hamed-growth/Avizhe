import { CssBaseline, createTheme, ThemeProvider } from "@mui/material";
import {
  createBrowserRouter,
  Navigate,
  Outlet,
  RouterProvider,
  ScrollRestoration,
  useLocation,
  useParams,
} from "react-router-dom";
import HomePage from "./pages/HomePage.jsx";
import { T } from "./shared/theme.js";
import { Eyebrow, Icon, Wordmark } from "./shared/ui/DesignSystem.jsx";
import { Link } from "react-router-dom";

const theme = createTheme({
  direction: "rtl",
  palette: {
    primary: { main: T.accent },
    text: { primary: T.text, secondary: T.muted },
    background: { default: T.bg, paper: T.bg },
  },
  typography: {
    fontFamily: '"Vazirmatn", Tahoma, sans-serif',
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
  },
});

// Old detail-page URLs now open the in-page explorers.
function ProductRedirect() {
  const { category } = useParams();
  const { search } = useLocation();
  return (
    <Navigate
      to={{ pathname: "/", search, hash: `#products/${category}` }}
      replace
    />
  );
}

function NotFoundPage() {
  return (
    <div className="not-found-page container">
      <Wordmark />
      <main>
        <Eyebrow>۴۰۴ / صفحه پیدا نشد</Eyebrow>
        <h1>این مسیر به آویژه نمی‌رسد.</h1>
        <p>
          صفحه‌ای که دنبالش هستید پیدا نشد. از صفحهٔ اصلی، مسیر تازه‌ای را شروع
          کنید.
        </p>
        <Link to="/" className="button button--dark">
          بازگشت به صفحهٔ اصلی
          <Icon />
        </Link>
      </main>
      <span dir="rtl">مواد، آدم‌ها، امکان‌ها.</span>
    </div>
  );
}

function EventRedirect() {
  const { year } = useParams();
  return <Navigate to={{ pathname: "/", hash: `#events/${year}` }} replace />;
}

function RootLayout() {
  return (
    <>
      <Outlet />
      <ScrollRestoration />
    </>
  );
}

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/products/:category", element: <ProductRedirect /> },
      { path: "/events/:year", element: <EventRedirect /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);

export function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}
