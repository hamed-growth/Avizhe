import { useRef } from "react";
import { Box, Dialog, IconButton } from "@mui/material";
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
      sx={{ minHeight: "100%", display: "flex", flexDirection: "column", px: { xs: 3.5, md: 8 }, py: 3 }}
    >
      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <IconButton onClick={onClose} aria-label="بستن منو" sx={{ color: T.text, fontSize: "1.6rem" }}>
          ✕
        </IconButton>
      </Box>
      <Box component="nav" sx={{ my: "auto" }}>
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
                py: { xs: 2, md: 2.5 },
                color: T.text,
                textDecoration: "none",
                fontSize: { xs: "1.8rem", md: "3.2rem" },
                fontWeight: 600,
                "&:hover": { color: T.accentDark },
                "&:focus-visible": { outline: `2px solid ${T.accent}`, outlineOffset: -2 },
              }}
            >
              <Box component="span" sx={{ fontSize: "0.9rem", color: T.accentDark }}>
                {fa(`0${i + 1}`)}
              </Box>
              {m.label}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export function MenuDialog({ open, onClose }) {
  const pick = (id) => {
    onClose();
    // wait until the dialog released the body scroll lock
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
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
