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

        <Box sx={{ display: { xs: "flex", md: "none" }, alignItems: "center", justifyContent: "space-between", mb: 2.5 }}>
          <Typography sx={{ fontWeight: 700, fontSize: ".8rem" }}>آرشیو رویدادها</Typography>
          <Typography sx={{ color: T.muted, fontSize: ".75rem" }}>ورق بزنید ←</Typography>
        </Box>
        <Box data-snap-scroll="" aria-label="آرشیو تصویری رویدادها" sx={{ display: { xs: "flex", md: "none" }, gap: 2, overflowX: "auto", scrollSnapType: "x mandatory", scrollPaddingInline: 24, mx: -3, px: 3, pb: 3, overscrollBehaviorX: "contain" }}>
          {[...EVENTS].reverse().map((e, i) => (
            <Box key={e.year} component={Link} to={`/events/${e.year}`} data-reveal="" aria-label={`مشاهده رویداد ${fa(e.year)}`}
              sx={{ display: "block", flex: "0 0 min(76vw, 320px)", minWidth: 0, color: "inherit", textDecoration: "none", scrollSnapAlign: "start", "&:active img": { transform: "scale(1.05)" }, "&:focus-visible": { outline: `2px solid ${T.accentDark}`, outlineOffset: 5, borderRadius: "24px" } }}>
              <Box sx={{ position: "relative", height: 315, borderRadius: "24px", overflow: "hidden", bgcolor: T.frame }}>
                <Box component="img" src={e.cover} alt="" loading="lazy" sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: `transform .9s ${T.ease}` }} />
                <Box sx={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(12,22,17,.83),transparent 65%)" }} />
                <Box sx={{ position: "absolute", right: 19, top: 19, bgcolor: e.upcoming ? T.accent : "rgba(255,255,255,.9)", color: T.text, px: 1.4, py: .5, fontWeight: 800, fontSize: ".75rem", borderRadius: 99 }}>{e.upcoming ? "به‌زودی" : "گزارش رویداد"}</Box>
                <Box sx={{ position: "absolute", bottom: 19, left: 19, right: 19, color: "white" }}>
                  <Typography sx={{ fontSize: "3rem", lineHeight: 1.2, fontWeight: 900, color: "white" }}>{fa(e.year)}</Typography>
                  <Typography sx={{ mt: 1.25, fontSize: "1.02rem", fontWeight: 700, color: "white" }}>{e.title}</Typography>
                  <Typography sx={{ mt: .75, fontSize: ".8rem", color: "rgba(255,255,255,.78)" }}>{meta(e)}</Typography>
                </Box>
              </Box>
              <Box sx={{ py: 2, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
                <Typography sx={{ fontWeight: 700, fontSize: ".86rem" }}>دیدن تصاویر و جزئیات</Typography>
                <Box aria-hidden="true" sx={{ borderRadius: "50%", width: 40, height: 40, display: "grid", placeItems: "center", border: `1px solid ${T.line}` }}>←</Box>
              </Box>
            </Box>
          ))}
        </Box>

        <Box
          ref={listRef}
          component="ul"
          onPointerLeave={() => setActive(-1)}
          sx={{ display: { xs: "none", md: "block" }, listStyle: "none", borderTop: `1px solid ${T.line}` }}
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
