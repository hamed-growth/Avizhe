import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Box, Typography } from "@mui/material";
import { gsap, useGSAP, prefersReducedMotion } from "../../shared/gsap";
import { T, fa } from "../../shared/theme";
import { EVENTS } from "../../data/events";

const DARK = "rgba(36,26,18,1)";
const DARK_CLEAR = "rgba(36,26,18,0)";
const INK = "#f1e9df";

/** Rect an image occupies when shown with object-fit: contain inside `box`. */
const fitRect = (box, nw, nh) => {
  const s = Math.min(box.width / nw, box.height / nh);
  const w = nw * s;
  const h = nh * s;
  return { left: box.left + (box.width - w) / 2, top: box.top + (box.height - h) / 2, width: w, height: h };
};

const buildItems = (e) => [
  { type: "photo", src: e.cover },
  ...e.videos.map((v) => ({ type: "video", src: v.src, poster: v.poster })),
  ...e.photos.filter((p) => p !== e.cover).map((src) => ({ type: "photo", src })),
];

/**
 * "Cinema" explorer for one yearly event. The row's photo flies into the stage,
 * the page turns dark, then the gallery (video + photos) is browsable with
 * arrows / keyboard / swipe / filmstrip, and the year can be switched in place.
 *
 * props: event, origin ({left,top,width,height,src} | null), onExited(after), onYear(year)
 */
export function EventExplorer({ event, origin, onExited, onYear }) {
  const overlayRef = useRef(null);
  const cloneRef = useRef(null);
  const viewerRef = useRef(null);
  const stripRef = useRef(null);
  const closingRef = useRef(false);
  const firstSwap = useRef(true);
  const dirRef = useRef(1);
  const swipeRef = useRef(null);
  const firstYear = useRef(true);

  const items = useMemo(() => buildItems(event), [event]);
  const [idx, setIdx] = useState(0);
  const i = Math.min(idx, items.length - 1);
  const item = items[i];

  useEffect(() => setIdx(0), [event.year]);

  /* ---------- measuring the stage (where the photo lands / leaves) ---------- */
  const stageRect = useCallback(() => {
    const box = viewerRef.current.getBoundingClientRect();
    const img = viewerRef.current.querySelector("img");
    if (img && img.naturalWidth) return fitRect(box, img.naturalWidth, img.naturalHeight);
    const vid = viewerRef.current.querySelector("video");
    return (vid || viewerRef.current).getBoundingClientRect();
  }, []);

  /* ---------- enter ---------- */
  useLayoutEffect(() => {
    const overlay = overlayRef.current;
    const clone = cloneRef.current;
    const viewer = viewerRef.current;
    let dead = false;
    const ctx = gsap.context(() => {
      if (prefersReducedMotion() || !origin) {
        gsap.set(clone, { display: "none" });
        gsap.from(overlay, { opacity: 0, duration: 0.35 });
        return;
      }
      // hide everything synchronously so nothing flashes while the photo decodes
      gsap.set(overlay, { backgroundColor: DARK_CLEAR });
      gsap.set(viewer, { opacity: 0 });
      gsap.set("[data-x]", { opacity: 0 });
      gsap.set(clone, { display: "block", left: origin.left, top: origin.top, width: origin.width, height: origin.height });

      const start = async () => {
        const img = viewer.querySelector("img");
        // always await (even when cached) so `ctx` is assigned before it is used below
        await (img && !img.complete ? img.decode().catch(() => {}) : Promise.resolve());
        if (dead) return;
        ctx.add(() => {
          const t = stageRect();
          gsap
            .timeline()
            .to(overlay, { backgroundColor: DARK, duration: 0.6, ease: "power2.out" }, 0)
            .to(clone, { left: t.left, top: t.top, width: t.width, height: t.height, duration: 1.05, ease: "power4.inOut" }, 0)
            .set(viewer, { opacity: 1 })
            .set(clone, { display: "none" })
            .fromTo("[data-x]", { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", stagger: 0.06 }, 0.55);
        });
      };
      start();
    }, overlay);
    overlay.querySelector("[data-close]")?.focus({ preventScroll: true });
    return () => {
      dead = true;
      ctx.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------- exit ---------- */
  const close = useCallback(
    (after) => {
      if (closingRef.current) return;
      closingRef.current = true;
      const overlay = overlayRef.current;
      const finish = () => onExited(after);
      const row = document.querySelector(`[data-ev-row="${event.year}"]`);
      const cur = items[Math.min(idx, items.length - 1)];
      if (prefersReducedMotion() || !row) {
        gsap.to(overlay, { opacity: 0, duration: 0.3, onComplete: finish });
        return;
      }
      overlay.scrollTo({ top: 0 });
      const t = stageRect();
      const o = row.getBoundingClientRect();
      const clone = cloneRef.current;
      clone.src = cur.type === "video" ? cur.poster : cur.src;
      gsap.set(clone, { display: "block", left: t.left, top: t.top, width: t.width, height: t.height });
      gsap.set(viewerRef.current, { opacity: 0 });
      gsap
        .timeline({ onComplete: finish })
        .to(overlay.querySelectorAll("[data-x]"), { opacity: 0, duration: 0.3, ease: "power2.in" }, 0)
        .to(clone, { left: o.left, top: o.top, width: o.width, height: o.height, opacity: 0.0, duration: 0.9, ease: "power4.inOut" }, 0.1)
        .to(overlay, { backgroundColor: DARK_CLEAR, duration: 0.6, ease: "power2.inOut" }, 0.3);
    },
    [event.year, items, idx, onExited, stageRect],
  );

  /* ---------- navigation inside the gallery ---------- */
  const go = useCallback(
    (d) => {
      if (items.length < 2) return;
      dirRef.current = d;
      setIdx((cur) => (Math.min(cur, items.length - 1) + d + items.length) % items.length);
    },
    [items.length],
  );
  const jump = (n) => {
    dirRef.current = n > i ? 1 : -1;
    setIdx(n);
  };

  // slide/fade the new item in; roll the year numeral when the year changes
  useGSAP(
    () => {
      if (firstSwap.current) {
        firstSwap.current = false;
        return;
      }
      if (prefersReducedMotion()) return;
      gsap.fromTo(
        "[data-item]",
        { opacity: 0, scale: 0.97, x: dirRef.current * -36 },
        { opacity: 1, scale: 1, x: 0, duration: 0.7, ease: "power3.out" },
      );
    },
    { scope: overlayRef, dependencies: [event.year, i] },
  );
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      // first run: wait for the photo flight to land; later runs (year switch): start right away
      const d = firstYear.current ? 0.85 : 0;
      firstYear.current = false;
      gsap.fromTo("[data-year]", { yPercent: 40, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.8, ease: "power4.out", delay: d });
      gsap.fromTo("[data-info]", { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out", stagger: 0.05, delay: d + 0.1 });
    },
    { scope: overlayRef, dependencies: [event.year], revertOnUpdate: true },
  );

  useEffect(() => {
    stripRef.current
      ?.querySelector(`[data-thumb="${i}"]`)
      ?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }, [i, event.year]);

  /* ---------- keyboard + scroll lock ---------- */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") close();
      // RTL: ArrowLeft = next, ArrowRight = previous
      if (e.key === "ArrowLeft") go(1);
      if (e.key === "ArrowRight") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close, go]);

  useEffect(() => {
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prev;
    };
  }, []);

  const circle = {
    width: 52,
    height: 52,
    display: "grid",
    placeItems: "center",
    border: "1px solid rgba(241,233,223,.45)",
    borderRadius: "50%",
    bgcolor: "rgba(36,26,18,.45)",
    backdropFilter: "blur(8px)",
    color: INK,
    fontSize: "1.3rem",
    cursor: "pointer",
    transition: "all .3s",
    "&:hover": { bgcolor: INK, color: T.dark },
    "&:focus-visible": { outline: `2px solid ${T.accent}`, outlineOffset: 3 },
  };

  const photos = event.photos.length;
  const videos = event.videos.length;

  return (
    <Box
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label={event.title}
      dir="rtl"
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: 1250,
        bgcolor: T.dark,
        color: INK,
        overflowY: "auto",
        overscrollBehavior: "contain",
      }}
    >
      <Box
        ref={cloneRef}
        component="img"
        src={origin?.src}
        alt=""
        aria-hidden="true"
        sx={{ display: "none", position: "fixed", zIndex: 5, objectFit: "cover", pointerEvents: "none" }}
      />

      <Box
        component="button"
        type="button"
        data-close=""
        data-x=""
        onClick={() => close()}
        sx={{
          position: "fixed",
          top: { xs: 14, md: 24 },
          left: { xs: 14, md: 28 },
          zIndex: 6,
          display: "flex",
          alignItems: "center",
          gap: 1,
          px: 2.25,
          py: 1,
          border: "1px solid rgba(241,233,223,.4)",
          borderRadius: 99,
          bgcolor: "rgba(36,26,18,.6)",
          backdropFilter: "blur(10px)",
          color: INK,
          font: "inherit",
          fontWeight: 600,
          fontSize: "0.9rem",
          cursor: "pointer",
          "&:hover": { bgcolor: INK, color: T.dark },
          "&:focus-visible": { outline: `2px solid ${T.accent}`, outlineOffset: 3 },
        }}
      >
        بستن <span aria-hidden="true">✕</span>
      </Box>

      <Box
        sx={{
          display: "grid",
          minHeight: "100dvh",
          gridTemplateColumns: { md: "minmax(320px, 4fr) 8fr" },
          gridTemplateRows: { xs: "auto auto auto", md: "100dvh" },
        }}
      >
        {/* info column (start side) */}
        <Box
          sx={{
            order: { xs: 2, md: 1 },
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: 4,
            px: { xs: 3, md: 7 },
            pt: { xs: 3, md: 12 },
            pb: { xs: 8, md: 6 },
          }}
        >
          <Box data-x="" sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {EVENTS.map((e) => {
              const on = e.year === event.year;
              return (
                <Box
                  key={e.year}
                  component="button"
                  type="button"
                  onClick={() => !on && onYear(e.year)}
                  aria-pressed={on}
                  sx={{
                    px: 2,
                    py: 0.75,
                    border: `1px solid ${on ? T.accent : "rgba(241,233,223,.28)"}`,
                    borderRadius: 99,
                    bgcolor: on ? T.accent : "transparent",
                    color: on ? T.dark : INK,
                    font: "inherit",
                    fontWeight: on ? 700 : 500,
                    fontSize: "0.9rem",
                    cursor: "pointer",
                    transition: "all .3s",
                    "&:hover": { borderColor: T.accent },
                    "&:focus-visible": { outline: `2px solid ${T.accent}`, outlineOffset: 3 },
                  }}
                >
                  {fa(e.year)}
                </Box>
              );
            })}
          </Box>

          <Box data-x="">
            <Box sx={{ overflow: "hidden", pb: "0.1em" }}>
              <Typography
                data-year=""
                component="h2"
                sx={{ fontSize: { xs: "4.5rem", md: "8.5rem" }, fontWeight: 800, lineHeight: 1.1, color: T.accent }}
              >
                {fa(event.year)}
              </Typography>
            </Box>
            <Typography data-info="" sx={{ mt: 1, fontSize: { xs: "1.2rem", md: "1.6rem" }, fontWeight: 600 }}>
              {event.title}
            </Typography>
            <Typography data-info="" sx={{ mt: 0.5, color: "rgba(241,233,223,.65)" }}>
              {event.place}
            </Typography>
            <Typography data-info="" sx={{ mt: 3, color: "rgba(241,233,223,.8)", lineHeight: 2.1, maxWidth: 420 }}>
              {event.summary}
            </Typography>
            <Box data-info="" sx={{ mt: 3, display: "flex", gap: 3, color: T.accent, fontWeight: 600 }}>
              {event.upcoming ? (
                <span>به‌زودی</span>
              ) : (
                <>
                  {photos > 0 && <span>{fa(photos)} عکس</span>}
                  {videos > 0 && <span>{fa(videos)} ویدیو</span>}
                </>
              )}
            </Box>
          </Box>

          <Box data-x="" sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {items.length > 1 && (
              <>
                <Box component="button" type="button" onClick={() => go(-1)} aria-label="قبلی" sx={circle}>→</Box>
                <Box component="button" type="button" onClick={() => go(1)} aria-label="بعدی" sx={circle}>←</Box>
              </>
            )}
            <Typography sx={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
              {fa(i + 1)} / {fa(items.length)}
            </Typography>
          </Box>
        </Box>

        {/* stage (viewer + filmstrip) */}
        <Box sx={{ order: { xs: 1, md: 2 }, display: "flex", flexDirection: "column", minWidth: 0 }}>
          <Box
            ref={viewerRef}
            onPointerDown={(e) => (swipeRef.current = e.clientX)}
            onPointerUp={(e) => {
              if (swipeRef.current === null) return;
              const dx = e.clientX - swipeRef.current;
              swipeRef.current = null;
              // RTL: dragging right reveals the next (left-hand) item
              if (dx > 60) go(1);
              if (dx < -60) go(-1);
            }}
            sx={{
              height: { xs: "62dvh", md: "calc(100dvh - 150px)" },
              mt: { xs: 8, md: 0 },
              px: { xs: 2, md: 6 },
              pt: { md: 10 },
              pb: 2,
              display: "grid",
              placeItems: "center",
              touchAction: "pan-y",
            }}
          >
            {item.type === "photo" ? (
              <Box
                key={item.src}
                data-item=""
                component="img"
                src={item.src}
                alt=""
                draggable={false}
                sx={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", display: "block", userSelect: "none" }}
              />
            ) : (
              <Box
                key={item.src}
                data-item=""
                component="video"
                src={item.src}
                poster={item.poster}
                controls
                playsInline
                preload="metadata"
                sx={{ width: "100%", maxHeight: "100%", aspectRatio: "16 / 9", bgcolor: "#000", display: "block" }}
              />
            )}
          </Box>

          {/* filmstrip */}
          <Box
            ref={stripRef}
            data-x=""
            sx={{
              height: { md: 150 },
              display: "flex",
              alignItems: "center",
              gap: 1.25,
              px: { xs: 2, md: 6 },
              py: 2,
              overflowX: "auto",
              scrollbarWidth: "none",
              "&::-webkit-scrollbar": { display: "none" },
            }}
          >
            {items.map((it, n) => {
              const on = n === i;
              return (
                <Box
                  key={it.src}
                  component="button"
                  type="button"
                  data-thumb={n}
                  onClick={() => jump(n)}
                  aria-label={`نمایش مورد ${fa(n + 1)}`}
                  aria-current={on ? "true" : undefined}
                  sx={{
                    position: "relative",
                    flexShrink: 0,
                    width: 64,
                    height: 86,
                    p: 0,
                    border: `1.5px solid ${on ? T.accent : "transparent"}`,
                    bgcolor: "transparent",
                    opacity: on ? 1 : 0.5,
                    cursor: "pointer",
                    transition: "opacity .3s, border-color .3s, transform .3s",
                    transform: on ? "translateY(-4px)" : "none",
                    "&:hover": { opacity: 1 },
                    "&:focus-visible": { outline: `2px solid ${T.accent}`, outlineOffset: 2 },
                  }}
                >
                  <Box
                    component="img"
                    src={it.type === "video" ? it.poster : it.src}
                    alt=""
                    loading="lazy"
                    sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                  {it.type === "video" && (
                    <Box
                      aria-hidden="true"
                      sx={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", bgcolor: "rgba(0,0,0,.35)", fontSize: "1.1rem" }}
                    >
                      ▶
                    </Box>
                  )}
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
