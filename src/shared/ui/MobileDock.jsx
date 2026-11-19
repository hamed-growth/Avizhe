import { useEffect, useRef, useState } from "react";
import { Box, Typography } from "@mui/material";
import { T } from "../theme";

const ITEMS = [
  { id: "home", label: "خانه", icon: "home" },
  { id: "products", label: "محصولات", icon: "layers" },
  { id: "events", label: "رویدادها", icon: "calendar" },
  { id: "news", label: "اخبار", icon: "book" },
  { id: "contact", label: "تماس", icon: "message" },
];

function Glyph({ name }) {
  const paths = {
    home: <><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/></>,
    layers: <><rect x="3" y="3" width="18" height="7" rx="2"/><rect x="3" y="14" width="18" height="7" rx="2"/><path d="M7 7h6M7 18h6"/></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18M8 15h3"/></>,
    book: <><path d="M5 3h14a2 2 0 0 1 2 2v16H7a4 4 0 0 1-4-4V5a2 2 0 0 1 2-2zM3 17a4 4 0 0 1 4-4h14M7 7h10"/></>,
    message: <><path d="M20 11.5a8.5 8.5 0 0 1-8.5 8.5 8 8 0 0 1-3.7-.9L3 21l1.7-4.9A8.5 8.5 0 1 1 20 11.5z"/><path d="M8 11.5h8"/></>,
  };
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">{paths[name]}</svg>;
}

export function MobileDock({ hidden = false }) {
  const [active, setActive] = useState("home");
  const currentRef = useRef("home");
  useEffect(() => {
    const sections = [document.querySelector("section[aria-label='معرفی آویژه']"), ...ITEMS.slice(1).map((x) => document.getElementById(x.id))].filter(Boolean);
    // Choose the section that contains the upper-middle part of the viewport.
    const onScroll = () => {
      const targetY = window.scrollY + window.innerHeight * .4;
      let next = "home";
      sections.forEach((el, i) => { if (el.offsetTop <= targetY) next = i === 0 ? "home" : ITEMS[i].id; });
      if (next !== currentRef.current) { currentRef.current = next; setActive(next); }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); };
  }, []);
  return (
    <Box
      data-mobile-dock=""
      component="nav"
      aria-label="ناوبری سریع موبایل"
      dir="rtl"
      sx={{
        display: { xs: hidden ? "none" : "flex", md: "none" },
        position: "fixed", zIndex: 1100, bottom: "max(12px, env(safe-area-inset-bottom, 0px))",
        left: "max(12px, env(safe-area-inset-left, 0px))", right: "max(12px, env(safe-area-inset-right, 0px))",
        maxWidth: 520, mx: "auto", height: 72, px: .75, gap: .25, alignItems: "center",
        bgcolor: "rgba(28,38,34,.94)", border: "1px solid rgba(255,255,255,.17)",
        color: "#fff", borderRadius: "23px", boxShadow: "0 14px 36px rgba(13,24,19,.24)",
      }}
    >
      {ITEMS.map(({ id, label, icon }) => {
        const selected = active === id;
        return (
          <Box key={id} component="a" href={id === "home" ? "#" : `#${id}`}
            aria-current={selected ? "location" : undefined}
            onClick={(e) => {
              e.preventDefault();
              const node = id === "home" ? null : document.getElementById(id);
              const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
              if (id === "home") window.scrollTo({ top: 0, behavior });
              else node?.scrollIntoView({ behavior, block: "start" });
              window.history.replaceState(window.history.state, "", id === "home" ? "/" : `/#${id}`);
              setActive(id); currentRef.current = id;
            }}
            sx={{
              flex: 1, minWidth: 0, minHeight: 56, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: .25, textDecoration: "none",
              color: selected ? T.dark : "rgba(255,255,255,.72)",
              bgcolor: selected ? T.accent : "transparent", borderRadius: "17px",
              transition: "background-color .25s, color .25s, transform .25s",
              "&:active": { transform: "scale(.93)" },
              "&:focus-visible": { outline: `2px solid ${T.accent}`, outlineOffset: 2 },
            }}
          >
            <Glyph name={icon} />
            <Typography component="span" sx={{ fontSize: "0.66rem", lineHeight: 1.4, fontWeight: selected ? 800 : 500, color: "inherit", whiteSpace: "nowrap" }}>{label}</Typography>
          </Box>
        );
      })}
    </Box>
  );
}
