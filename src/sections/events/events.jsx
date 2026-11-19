import { useRef, useState } from "react";
import { Box, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { gsap, useGSAP } from "../../shared/gsap";
import { useReveal } from "../../shared/useReveal";
import { SectionLabel, SectionTitle } from "../../shared/ui/Reveal";
import { T, WRAP, fa } from "../../shared/theme";
import { EVENTS } from "../../data/events";

const meta = (e) =>
  e.upcoming
    ? "به‌زودی"
    : [
        e.photos.length ? `${fa(e.photos.length)} عکس` : null,
        e.videos.length ? `${fa(e.videos.length)} ویدیو` : null,
      ]
        .filter(Boolean)
        .join(" · ");

export function EventsSection() {
  const rootRef = useRef(null);
  const listRef = useRef(null);
  const previewRef = useRef(null);
  const [active, setActive] = useState(-1);

  useReveal(rootRef);

  // Desktop: a photo follows the cursor while hovering a year row.
  useGSAP(
    () => {
      const prev = previewRef.current;
      const list = listRef.current;
      if (!prev || !list) return;
      const mm = gsap.matchMedia();
      mm.add("(hover: hover) and (min-width: 900px)", () => {
        const x = gsap.quickTo(prev, "x", { duration: 0.6, ease: "power3" });
        const y = gsap.quickTo(prev, "y", { duration: 0.6, ease: "power3" });
        const move = (e) => {
          x(e.clientX);
          y(e.clientY);
        };
        list.addEventListener("pointermove", move);
        return () => list.removeEventListener("pointermove", move);
      });
      return () => mm.revert();
    },
    { scope: rootRef },
  );

  return (
    <Box
      ref={rootRef}
      component="section"
      id="events"
      dir="rtl"
      aria-labelledby="events-title"
      sx={{ bgcolor: T.bg, color: T.text, py: { xs: 9, md: 16 } }}
    >
      <Box sx={WRAP}>
        <Box sx={{ maxWidth: 640, mb: { xs: 6, md: 10 } }}>
          <SectionLabel>رویدادها</SectionLabel>
          <SectionTitle id="events-title">هر سال، یک رویداد؛ هر رویداد، یک روایت</SectionTitle>
        </Box>

        <Box
          ref={listRef}
          component="ul"
          onPointerLeave={() => setActive(-1)}
          sx={{ listStyle: "none", borderTop: `1px solid ${T.line}` }}
        >
          {EVENTS.map((e, i) => (
            <Box component="li" key={e.year} data-reveal="" sx={{ borderBottom: `1px solid ${T.line}` }}>
              <Box
                component={Link}
                to={`/events/${e.year}`}
                onPointerEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(-1)}
                sx={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  gap: { xs: 2, md: 5 },
                  py: { xs: 3, md: 4.5 },
                  color: "inherit",
                  textDecoration: "none",
                  opacity: active === -1 || active === i ? 1 : 0.35,
                  transition: "opacity .4s, padding .5s cubic-bezier(.2,.7,.2,1)",
                  "&:hover": { pr: { md: 2 } },
                  "&:focus-visible": { outline: `2px solid ${T.accent}`, outlineOffset: -2 },
                }}
              >
                <Typography
                  component="span"
                  sx={{
                    fontSize: { xs: "2.8rem", md: "6rem" },
                    fontWeight: 800,
                    lineHeight: 1.2,
                    minWidth: { md: 360 },
                    color: active === i ? T.accentDark : T.text,
                    transition: "color .4s",
                  }}
                >
                  {fa(e.year)}
                </Typography>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontSize: { xs: "1rem", md: "1.3rem" }, fontWeight: 600 }}>
                    {e.title}
                  </Typography>
                  <Typography sx={{ mt: 0.5, color: T.muted, fontSize: "0.9rem" }}>
                    {meta(e)}
                  </Typography>
                </Box>

                {/* mobile / touch thumbnail */}
                <Box
                  component="img"
                  src={e.cover}
                  alt=""
                  loading="lazy"
                  sx={{
                    display: { xs: "block", md: "none" },
                    width: 64,
                    height: 84,
                    objectFit: "cover",
                    flexShrink: 0,
                  }}
                />
                <Box
                  aria-hidden="true"
                  sx={{ display: { xs: "none", md: "block" }, fontSize: "1.6rem" }}
                >
                  ←
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

      {/* cursor-following preview (desktop, hover devices only) */}
      <Box
        ref={previewRef}
        aria-hidden="true"
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 10,
          width: 260,
          height: 340,
          mt: "-170px",
          ml: "-130px",
          pointerEvents: "none",
          overflow: "hidden",
          opacity: active === -1 ? 0 : 1,
          transform: "scale(1)",
          transition: "opacity .35s",
          display: { xs: "none", md: "block" },
        }}
      >
        {EVENTS.map((e, i) => (
          <Box
            key={e.year}
            component="img"
            src={e.cover}
            alt=""
            sx={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: active === i ? 1 : 0,
              transform: active === i ? "scale(1)" : "scale(1.12)",
              transition: "opacity .45s, transform .8s cubic-bezier(.2,.7,.2,1)",
            }}
          />
        ))}
      </Box>
    </Box>
  );
}
