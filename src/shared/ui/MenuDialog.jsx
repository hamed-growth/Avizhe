import { useRef } from "react";
import { Box, Dialog, IconButton, Typography } from "@mui/material";
import { gsap, useGSAP, prefersReducedMotion } from "../gsap";
import { T, fa } from "../theme";

export const MENU = [
  { id: "about", label: "معرفی شرکت" },
  { id: "products", label: "محصولات" },
  { id: "events", label: "رویدادها" },
  { id: "news", label: "اخبار و مقالات" },
  { id: "contact", label: "تماس با ما" },
];

function MenuContent({ onPick, onClose }) {
  const ref = useRef(null);
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from("[data-menu-item]", {
        yPercent: 110,
        opacity: 0,
        duration: 0.9,
        ease: "power4.out",
        stagger: 0.07,
        delay: 0.15,
      });
    },
    { scope: ref },
  );

  return (
    <Box
      ref={ref}
      dir="rtl"
      sx={{ minHeight: "100%", display: "flex", flexDirection: "column", px: { xs: 3.5, md: 8 }, py: { xs: 3.5, md: 5 }, background: "radial-gradient(ellipse at 12% 92%, rgba(237,136,95,.13), transparent 48%)" }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography sx={{ fontWeight: 900, fontSize: ".78rem", color: T.accentDark, letterSpacing: ".06em" }}>AVIZHE — EXPLORE</Typography>
        <IconButton onClick={onClose} aria-label="بستن منو" sx={{ width: 48, height: 48, color: T.text, border: `1px solid ${T.line}`, bgcolor: "white", fontSize: "1.25rem" }}>✕</IconButton>
      </Box>
      <Box component="nav" aria-label="فهرست اصلی" sx={{ my: "auto", py: 5 }}>
        <Typography sx={{ color: T.muted, fontWeight: 700, fontSize: ".8rem", mb: 3 }}>به کجا می‌خواهید بروید؟</Typography>
        {MENU.map((m, i) => (
          <Box key={m.id} sx={{ overflow: "hidden", borderBottom: `1px solid ${T.line}` }}>
            <Box
              data-menu-item=""
              component="a"
              href={`/#${m.id}`}
              onClick={(e) => {
                e.preventDefault();
                onPick(m.id);
              }}
              sx={{
                display: "flex",
                alignItems: "baseline",
                gap: 3,
                py: { xs: 2.4, md: 2.5 },
                color: T.text,
                textDecoration: "none",
                fontSize: { xs: "clamp(1.75rem, 7.7vw, 2.6rem)", md: "3.7rem" },
                fontWeight: 800,
                transition: "color .25s, transform .35s",
                "&:active": { transform: "translateX(-6px)" },
                "&:hover": { color: T.accentDark },
                "&:focus-visible": { outline: `2px solid ${T.accent}`, outlineOffset: -2 },
              }}
            >
              <Box component="span" sx={{ fontSize: "0.9rem", color: T.accentDark }}>
                {fa(`0${i + 1}`)}
              </Box>
              {m.label}
              <Box component="span" aria-hidden="true" sx={{ mr: "auto", fontSize: "1rem", fontWeight: 600, color: T.accentDark }}>↖</Box>
            </Box>
          </Box>
        ))}
      </Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", borderTop: `1px solid ${T.line}`, pt: 2.5, gap: 2 }}>
        <Typography sx={{ color: T.muted, fontSize: ".78rem" }}>پویا شیمی آویژه</Typography>
        <Typography sx={{ color: T.muted, fontSize: ".72rem", direction: "ltr" }}>MATERIALS. POSSIBILITIES.</Typography>
      </Box>
    </Box>
  );
}

export function MenuDialog({ open, onClose }) {
  const pick = (id) => {
    onClose();
    // wait until the dialog released the body scroll lock
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth" });
    }, 350);
  };
  return (
    <Dialog
      fullScreen
      open={open}
      onClose={onClose}
      slotProps={{ paper: { sx: { bgcolor: T.bg } } }}
    >
      <MenuContent onPick={pick} onClose={onClose} />
    </Dialog>
  );
}
