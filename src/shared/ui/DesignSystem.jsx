import { useEffect, useRef, useState } from "react";
import { Dialog } from "@mui/material";
import { Link, useLocation, useNavigate } from "react-router-dom";

export function Icon({ name = "arrow", size = 22, ...props }) {
  const paths = {
    arrow: <path d="M19 12H5m6-6-6 6 6 6" />,
    right: <path d="m9 5 7 7-7 7" />,
    left: <path d="m15 5-7 7 7 7" />,
    close: <path d="m6 6 12 12M6 18 18 6" />,
    menu: <path d="M3 6h18M3 12h18M3 18h18" />,
    play: <path d="m9 5 11 7-11 7Z" fill="currentColor" stroke="none" />,
    plus: <path d="M12 5v14M5 12h14" />,
    search: (
      <>
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m16 16 5 5" />
      </>
    ),
    up: <path d="M12 20V4m-6 6 6-6 6 6" />,
    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="3" />
        <path d="m3 7 9 6 9-6" />
      </>
    ),
    phone: (
      <path d="M7 3H4a1 1 0 0 0-1 1c0 9.4 7.6 17 17 17a1 1 0 0 0 1-1v-3l-5-2-2 2a14 14 0 0 1-7-7l2-2Z" />
    ),
    location: (
      <>
        <path d="M20 10c0 6-8 11-8 11S4 16 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </>
    ),
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {paths[name]}
    </svg>
  );
}
export function Eyebrow({ children, light = false }) {
  return (
    <p className={`eyebrow${light ? " eyebrow--light" : ""}`}>
      <span aria-hidden="true" />
      {children}
    </p>
  );
}
export function SectionHeading({ id, label, title, description, children }) {
  return (
    <div className="section-heading">
      <div>
        <Eyebrow>{label}</Eyebrow>
        <h2 id={id}><span className="motion-title-clip"><span data-motion-heading>{title}</span></span></h2>
        {description && <p className="section-description">{description}</p>}
      </div>
      {children}
    </div>
  );
}
export function RoundButton({
  label,
  name = "arrow",
  className = "",
  ...props
}) {
  return (
    <button
      className={`round-button ${className}`}
      type="button"
      aria-label={label}
      {...props}
    >
      <Icon name={name} />
    </button>
  );
}
export const NAV_ITEMS = [
  { id: "about", label: "دربارهٔ آویژه", description: "داستان و آدم‌های ما" },
  { id: "products", label: "محصولات", description: "رزین‌ها و پراکسیدهای آلی" },
  { id: "events", label: "رویدادها", description: "دیدارها و خاطره‌های مشترک" },
  { id: "news", label: "مجلهٔ آویژه", description: "خبرها و خواندنی‌های صنعت" },
  { id: "contact", label: "تماس با ما", description: "شروع یک گفت‌وگوی تازه" },
];
export function Wordmark({ light = false }) {
  return (
    <Link
      to="/"
      className={`wordmark${light ? " wordmark--light" : ""}`}
      aria-label="پویا شیمی آویژه، صفحهٔ اصلی"
      dir="rtl"
    >
      <span className="wordmark-symbol" aria-hidden="true" />
      <span>
        <strong>پویا شیمی آویژه</strong>
        <small>صنایع شیمیایی</small>
      </span>
    </Link>
  );
}
export function SiteHeader({ onMenuClick, menuOpen }) {
  const [active, setActive] = useState("home");
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        }),
      { rootMargin: "-15% 0px -70% 0px" },
    );
    ["home", ...NAV_ITEMS.map((item) => item.id)].forEach((id) => {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    });
    return () => observer.disconnect();
  }, []);
  return (
    <header className="site-header">
      <div className="container header-inner" dir="rtl">
        <Wordmark />
        <nav className="desktop-nav" aria-label="منوی اصلی" dir="rtl">
          {NAV_ITEMS.slice(0, 4).map((item) => (
            <Link
              key={item.id}
              to={`/#${item.id}`}
              aria-current={active === item.id ? "location" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="header-actions">
          <Link to="/#contact" className="header-contact">
            گفت‌وگو با آویژه
            <Icon name="arrow" size={17} />
          </Link>
          <button
            type="button"
            className="menu-button"
            aria-label="باز کردن منو"
            aria-expanded={menuOpen}
            aria-controls="site-menu"
            onClick={onMenuClick}
          >
            <Icon name="menu" size={25} />
          </button>
        </div>
      </div>
    </header>
  );
}
export function SurfaceDialog({
  open = true,
  onClose,
  titleId,
  className = "",
  children,
  fullScreen = false,
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      fullWidth
      maxWidth="lg"
      aria-labelledby={titleId}
      className={`surface-dialog ${className}`}
      slotProps={{
        paper: { className: "surface-dialog-paper" },
        backdrop: { className: "surface-dialog-backdrop" },
      }}
    >
      {children}
    </Dialog>
  );
}
// Browser Back dismisses an explorer opened from a card.
export function useHashExplorer(section) {
  const { hash } = useLocation();
  const navigate = useNavigate();
  const pushed = useRef(false);
  const returnFocus = useRef(null);
  const value = hash.startsWith(`#${section}/`)
    ? hash.slice(section.length + 2)
    : null;
  const open = (id, target) => {
    returnFocus.current = target || document.activeElement;
    pushed.current = true;
    navigate({ hash: `#${section}/${id}` }, { preventScrollReset: true });
  };
  const close = () => {
    if (pushed.current) navigate(-1);
    else
      navigate(
        { hash: `#${section}` },
        { replace: true, preventScrollReset: true },
      );
    pushed.current = false;
    requestAnimationFrame(() =>
      returnFocus.current?.focus({ preventScroll: true }),
    );
  };
  const change = (id) =>
    navigate(
      { hash: `#${section}/${id}` },
      { replace: true, preventScrollReset: true },
    );
  return { value, open, close, change };
}
