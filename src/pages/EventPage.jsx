import { useCallback, useEffect, useRef, useState } from "react";
import { Box, Dialog, Typography } from "@mui/material";
import { Link, Navigate, useParams } from "react-router-dom";
import { useReveal } from "../shared/useReveal";
import { InnerHeader } from "../shared/ui/InnerHeader";
import { LineFrame } from "../shared/ui/LineFrame";
import { SectionLabel } from "../shared/ui/Reveal";
import { FooterSection } from "../sections/footer/footer";
import { T, WRAP, fa } from "../shared/theme";
import { EVENTS, getEvent } from "../data/events";

function Lightbox({ photos, index, onClose, onIndex }) {
  const open = index !== null;
  const swipeStart = useRef(null);
  const go = useCallback(
    (d) => onIndex((i) => (i + d + photos.length) % photos.length),
    [photos.length, onIndex],
  );

  useEffect(() => {
    if (!open) return;
    // RTL: the right arrow = previous, the left arrow = next
    const onKey = (e) => {
      if (e.key === "ArrowLeft") go(1);
      if (e.key === "ArrowRight") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, go]);

  const btn = {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    width: 48,
    height: 48,
    border: "1px solid rgba(255,255,255,.5)",
    borderRadius: "50%",
    bgcolor: "rgba(0,0,0,.3)",
    color: "#fff",
    fontSize: "1.3rem",
    cursor: "pointer",
    "&:focus-visible": { outline: "2px solid #fff", outlineOffset: 3 },
  };

  return (
    <Dialog
      fullScreen
      open={open}
      onClose={onClose}
      slotProps={{ paper: { sx: { bgcolor: "rgba(20,13,8,.96)" } } }}
    >
      {open && (
        <Box dir="rtl"
          onTouchStart={(e) => { swipeStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; }}
          onTouchEnd={(e) => {
            const start = swipeStart.current;
            if (!start || photos.length < 2) return;
            const dx = e.changedTouches[0].clientX - start.x;
            const dy = e.changedTouches[0].clientY - start.y;
            if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.3) go(dx < 0 ? 1 : -1);
            swipeStart.current = null;
          }}
          sx={{ position: "relative", height: "100%", display: "grid", placeItems: "center", p: { xs: 1, md: 6 } }}>
          <Box
            component="img"
            src={photos[index]}
            alt=""
            sx={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
          />
          <Box component="button" type="button" onClick={onClose} aria-label="بستن" sx={{ ...btn, top: 28, left: 20, right: "auto", transform: "none" }}>
            ✕
          </Box>
          {photos.length > 1 && (
            <>
              <Box component="button" type="button" onClick={() => go(-1)} aria-label="قبلی" sx={{ ...btn, right: 16 }}>→</Box>
              <Box component="button" type="button" onClick={() => go(1)} aria-label="بعدی" sx={{ ...btn, left: 16 }}>←</Box>
            </>
          )}
          <Typography sx={{ position: "absolute", bottom: 20, color: "#fff", fontSize: "0.9rem" }}>
            {fa(index + 1)} / {fa(photos.length)}
          </Typography>
        </Box>
      )}
    </Dialog>
  );
}

export default function EventPage() {
  const { year } = useParams();
  const event = getEvent(year);
  const rootRef = useRef(null);
  const [light, setLight] = useState(null);

  useReveal(rootRef, [year]);
  useEffect(() => setLight(null), [year]);

  if (!event) return <Navigate to="/" replace />;

  const i = EVENTS.findIndex((e) => e.year === event.year);
  const prev = EVENTS[i - 1];
  const next = EVENTS[i + 1];

  return (
    <Box ref={rootRef} dir="rtl" sx={{ bgcolor: T.bg, color: T.text, minHeight: "100dvh" }}>
      <InnerHeader backTo="/#events" backLabel="همه‌ی رویدادها" />

      <Box sx={{ ...WRAP, pt: { xs: 6, md: 10 } }}>
        <SectionLabel>{event.place}</SectionLabel>
        <Box sx={{ display: "flex", alignItems: "baseline", gap: { xs: 2, md: 4 }, flexWrap: "wrap" }}>
          <Typography component="h1" sx={{ fontSize: { xs: "clamp(4rem, 15vw, 6rem)", md: "9rem" }, fontWeight: 900, lineHeight: 1.1, color: T.accentDark }}>
            {fa(event.year)}
          </Typography>
          <Typography sx={{ fontSize: { xs: "1.1rem", md: "1.6rem" }, fontWeight: 600 }}>{event.title}</Typography>
        </Box>
        <Typography data-reveal="" sx={{ mt: 2.5, color: T.muted, lineHeight: 2.1, maxWidth: 640 }}>
          {event.summary}
        </Typography>

        <LineFrame sx={{ mt: { xs: 6, md: 9 }, mx: { xs: 1.5, md: 0 } }} offset={14}>
          <Box
            component="img"
            src={event.cover}
            alt=""
            sx={{ width: "100%", aspectRatio: { xs: "4 / 4.2", md: "21 / 9" }, objectFit: "cover", display: "block", borderRadius: { xs: "22px", md: "12px" } }}
          />
        </LineFrame>
      </Box>

      {/* videos */}
      {event.videos.length > 0 && (
        <Box sx={{ ...WRAP, pt: { xs: 8, md: 14 } }}>
          <SectionLabel>ویدیوها</SectionLabel>
          <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { md: event.videos.length > 1 ? "1fr 1fr" : "1fr" } }}>
            {event.videos.map((v) => (
              <Box
                key={v.src}
                data-reveal=""
                component="video"
                src={v.src}
                poster={v.poster}
                controls
                playsInline
                preload="none"
                sx={{ width: "100%", aspectRatio: "16 / 9", bgcolor: T.dark, display: "block", borderRadius: "18px" }}
              />
            ))}
          </Box>
        </Box>
      )}

      {/* photos */}
      {event.photos.length > 0 && (
        <Box sx={{ ...WRAP, pt: { xs: 8, md: 14 } }}>
          <SectionLabel>تصاویر</SectionLabel>
          <Box sx={{ columnCount: { xs: 2, md: 3 }, columnGap: { xs: 1.5, md: 3 } }}>
            {event.photos.map((src, idx) => (
              <Box
                key={src + idx}
                component="button"
                type="button"
                data-reveal=""
                onClick={() => setLight(idx)}
                aria-label={`نمایش تصویر ${fa(idx + 1)}`}
                sx={{
                  display: "block",
                  width: "100%",
                  mb: { xs: 1.5, md: 3 },
                  p: 0,
                  border: 0,
                  bgcolor: T.frame,
                  overflow: "hidden",
                  borderRadius: { xs: "14px", md: "18px" },
                  breakInside: "avoid",
                  cursor: "zoom-in",
                  "&:hover img": { transform: "scale(1.05)" },
                  "&:focus-visible": { outline: `2px solid ${T.accent}`, outlineOffset: 3 },
                }}
              >
                <Box
                  component="img"
                  src={src}
                  alt=""
                  loading="lazy"
                  sx={{ width: "100%", display: "block", transition: "transform 1s cubic-bezier(.2,.7,.2,1)" }}
                />
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {event.upcoming && (
        <Box sx={{ ...WRAP, py: 10 }}>
          <Typography sx={{ color: T.muted }}>گالری این رویداد پس از برگزاری تکمیل می‌شود.</Typography>
        </Box>
      )}

      {/* prev / next event */}
      <Box sx={{ ...WRAP, py: { xs: 8, md: 14 } }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", gap: 3, borderTop: `1px solid ${T.line}`, pt: 4 }}>
          {[
            { e: prev, label: "رویداد قبل", arrow: "→" },
            { e: next, label: "رویداد بعد", arrow: "←" },
          ].map(({ e, label, arrow }, k) => (
            <Box key={k} sx={{ flex: 1 }}>
              {e && (
                <Box
                  component={Link}
                  to={`/events/${e.year}`}
                  sx={{
                    display: "block",
                    color: "inherit",
                    textDecoration: "none",
                    textAlign: k === 0 ? "right" : "left",
                    "&:hover .y": { color: T.accentDark },
                    "&:focus-visible": { outline: `2px solid ${T.accent}`, outlineOffset: 6 },
                  }}
                >
                  <Typography sx={{ color: T.muted, fontSize: "0.85rem" }}>{k === 0 ? `${arrow} ${label}` : `${label} ${arrow}`}</Typography>
                  <Typography className="y" sx={{ fontSize: { xs: "2rem", md: "3.5rem" }, fontWeight: 800, transition: "color .3s" }}>
                    {fa(e.year)}
                  </Typography>
                </Box>
              )}
            </Box>
          ))}
        </Box>
      </Box>

      <FooterSection />
      <Lightbox photos={event.photos} index={light} onClose={() => setLight(null)} onIndex={setLight} />
    </Box>
  );
}
