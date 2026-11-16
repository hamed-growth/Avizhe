import { useEffect, useRef, useState } from "react";
import gsap from "gsap"; // npm i gsap @gsap/react
import { Flip } from "gsap/Flip";
import { useGSAP } from "@gsap/react";
import { Box, Button, Dialog, Typography, useMediaQuery } from "@mui/material";

gsap.registerPlugin(useGSAP, Flip);

/* ---------- Config ---------- */
const SLIDE_SECONDS = 5; // auto-advance (the blue bar fills over this time)
const OPEN_SECONDS = 1.0; // card -> image frame
const SWAP_AT = 0.5; // text switches to the new slide
const WHEEL_GAP_MS = 120;
const VISIBLE_CARDS = 3;
const REVEAL = "[data-hero-title],[data-hero-fade]";
const BRAND = "آویژه";

const T = {
  bg: "#f7f9fc",
  text: "#0b1530",
  muted: "#6b7385",
  accent: "#1f4fd8",
  track: "#d9dfeb",
  leaf: "#1b2b4b",
  leaf2: "#8fa1bd",
};

const slides = [
  {
    name: "صنعت",
    image: "industry",
    title: "همراه صنعت، از انتخاب تا تأمین",
    description:
      "برای انتخاب مواد اولیه متناسب با نیاز تولیدتان، در کنار شما هستیم. با آویژه، مسیر تأمین را آگاهانه‌تر پیش ببرید.",
  },
  {
    name: "پراکسیدها",
    image: "peroxides",
    title: "انتخاب دقیق پراکسیدها برای تولید شما",
    description:
      "پراکسید مناسب را با توجه به کاربرد و شرایط فرایند خود انتخاب کنید. آویژه در بررسی گزینه‌ها و تأمین محصول همراه شماست.",
  },
  {
    name: "رزین‌ها",
    image: "resins",
    title: "رزین متناسب با ایده و کاربرد شما",
    description:
      "هر محصول از انتخاب مواد اولیه آغاز می‌شود. برای شناخت و تأمین رزین متناسب با نیاز صنعت خود، با آویژه همراه شوید.",
  },
  {
    name: "ویدیوی معرفی",
    image: "video",
    video: "/media/videos/hero-preview.mp4",
    poster: "/media/posters/hero-preview.jpg",
    fullVideo: "/media/videos/hero.mp4",
    title: "آویژه را از نزدیک ببینید",
    description:
      "با تماشای ویدیوی معرفی، بیشتر با آویژه و مسیر همراهی ما با صنعت آشنا شوید.",
  },
];

const N = slides.length;
const fullImage = (s) => s.poster || `/media/hero/${s.image}.webp`;
const radiusOf = (el, fallback) =>
  parseFloat(getComputedStyle(el).borderTopLeftRadius) || fallback;

function Logo() {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
      <svg width="34" height="30" viewBox="0 0 34 30" aria-hidden="true">
        <path d="M2 3c9-1 15 4 15 14v10C7 27 1 20 2 3z" fill={T.leaf} />
        <path d="M32 4c-8 0-14 4-15 13v10c10-1 17-8 15-23z" fill={T.leaf2} />
      </svg>
      <Typography sx={{ fontSize: 20, fontWeight: 700, color: T.text }}>
        {BRAND}
      </Typography>
    </Box>
  );
}

export function HeroSection({ onMenuClick }) {
  // activeSlide    -> text (switches mid-transition)
  // carouselActive -> card queue (switches at the START of the transition)
  // bgSlide        -> image in the frame (switches when the card has landed)
  const [activeSlide, setActiveSlide] = useState(0);
  const [carouselActive, setCarouselActive] = useState(0);
  const [bgSlide, setBgSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const [touching, setTouching] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);
  const currentSlide = slides[activeSlide];
  const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  const rootRef = useRef(null);
  const textRef = useRef(null);
  const frameRef = useRef(null);
  const trackRef = useRef(null);
  const cloneRef = useRef(null);
  const cloneImgRef = useRef(null);
  const fillRef = useRef(null);
  const cardRefs = useRef([]);
  const videoRef = useRef(null);
  const swipeRef = useRef(null);
  const suppressClickRef = useRef(false);

  const activeRef = useRef(0);
  const busyRef = useRef(false);
  const flipRef = useRef(null);
  const tlRef = useRef(null);
  const progressRef = useRef(null);
  const goRef = useRef(() => {});

  // Cards = every slide except the active one, in circular order after it.
  const queue = Array.from(
    { length: N - 1 },
    (_, k) => (carouselActive + 1 + k) % N,
  );

  const commit = (index) => {
    activeRef.current = index;
    setActiveSlide(index);
  };

  /* ---------- Core: the card flies into the image frame ---------- */
  const go = (target) => {
    const from = activeRef.current;
    const root = rootRef.current;
    if (!root || busyRef.current || target === from) return;

    if (reduceMotion) {
      setCarouselActive(target);
      commit(target);
      setBgSlide(target);
      return;
    }
    busyRef.current = true;

    const rootRect = root.getBoundingClientRect();
    const frame = frameRef.current;
    const fr = frame.getBoundingClientRect();
    const trackRect = trackRef.current.getBoundingClientRect();
    const card = cardRefs.current[target];
    const r = card.getBoundingClientRect();
    const startLeft = Math.min(r.left, trackRect.right - r.width);

    flipRef.current = Flip.getState(root.querySelectorAll("[data-flip-id]"));

    const clone = cloneRef.current;
    const cloneImg = cloneImgRef.current;
    cloneImg.src = fullImage(slides[target]);
    gsap.set(clone, {
      display: "block",
      left: startLeft - rootRect.left,
      top: r.top - rootRect.top,
      width: r.width,
      height: r.height,
      borderRadius: radiusOf(card, 22),
    });

    setCarouselActive(target); // the card leaves the queue; the clone takes its place

    const textEls = gsap.utils.toArray(REVEAL, textRef.current);
    tlRef.current = gsap
      .timeline({
        onComplete: () => {
          setBgSlide(target);
          requestAnimationFrame(() =>
            requestAnimationFrame(() => {
              gsap.set(clone, { display: "none" });
              busyRef.current = false;
            }),
          );
        },
      })
      .to(
        textEls,
        {
          opacity: 0,
          y: -14,
          filter: "blur(6px)",
          duration: 0.35,
          stagger: 0.04,
          ease: "power2.in",
        },
        0,
      )
      .to(
        clone,
        {
          left: fr.left - rootRect.left,
          top: fr.top - rootRect.top,
          width: fr.width,
          height: fr.height,
          borderRadius: radiusOf(frame, 32),
          duration: OPEN_SECONDS,
          ease: "power3.inOut",
        },
        0,
      )
      .fromTo(
        cloneImg,
        { scale: 1.15 },
        { scale: 1, duration: OPEN_SECONDS + 0.2, ease: "power3.out" },
        0,
      )
      .add(() => commit(target), SWAP_AT);
  };
  goRef.current = go;

  /* ---------- Remaining cards glide into place (Flip) ---------- */
  useGSAP(
    () => {
      const state = flipRef.current;
      if (!state) return;
      flipRef.current = null;
      Flip.from(state, {
        targets: rootRef.current.querySelectorAll("[data-flip-id]"),
        duration: 0.8,
        ease: "power3.inOut",
        onEnter: (els) =>
          gsap.fromTo(
            els,
            { opacity: 0, scale: 0.85 },
            {
              opacity: 1,
              scale: 1,
              duration: 0.6,
              delay: 0.25,
              ease: "power3.out",
            },
          ),
      });
    },
    { dependencies: [carouselActive], scope: rootRef },
  );

  /* ---------- New text enters (mask reveal; Persian is never split per letter) ---------- */
  useGSAP(
    () => {
      if (!textRef.current) return;
      if (reduceMotion) {
        gsap.set(gsap.utils.toArray(REVEAL, textRef.current), {
          clearProps: "all",
        });
        return;
      }
      gsap.fromTo(
        "[data-hero-title]",
        { yPercent: 110, opacity: 1, y: 0, filter: "none" },
        { yPercent: 0, duration: 0.85, ease: "power4.out" },
      );
      gsap.fromTo(
        "[data-hero-fade]",
        { opacity: 0, y: 18, filter: "blur(4px)" },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.08,
          delay: 0.12,
        },
      );
    },
    {
      dependencies: [activeSlide, reduceMotion],
      scope: textRef,
      revertOnUpdate: true,
    },
  );

  /* ---------- Timed auto-advance: the blue bar fills, then the next card opens ---------- */
  useEffect(() => {
    if (reduceMotion || videoOpen || !fillRef.current) return;
    const tween = gsap.fromTo(
      fillRef.current,
      { scaleX: 0 },
      {
        scaleX: 1,
        duration: SLIDE_SECONDS,
        ease: "none",
        onComplete: () => goRef.current((activeRef.current + 1) % N),
      },
    );
    progressRef.current = tween;
    return () => tween.kill();
  }, [activeSlide, reduceMotion, videoOpen]);

  useEffect(() => {
    const tween = progressRef.current;
    if (!tween) return;
    if (paused || touching) tween.pause();
    else tween.resume();
  }, [paused, touching, activeSlide, reduceMotion, videoOpen]);

  /* ---------- Scroll (wheel) = next / previous slide ---------- */
  useEffect(() => {
    const el = rootRef.current;
    if (!el || videoOpen) return;
    let lastTs = 0;
    let locked = false;
    const onWheel = (e) => {
      if (Math.abs(e.deltaY) < 8 || Math.abs(e.deltaX) > Math.abs(e.deltaY))
        return;
      const next = activeRef.current + (e.deltaY > 0 ? 1 : -1);
      if (next < 0 || next >= N) return; // first/last slide: page scrolls normally
      e.preventDefault();
      const now = performance.now();
      const gap = now - lastTs;
      lastTs = now;
      if (busyRef.current) {
        locked = true;
        return;
      }
      if (locked && gap < WHEEL_GAP_MS) return;
      locked = true;
      goRef.current(next);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [videoOpen]);

  /* ---------- Video in the frame ---------- */
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (slides[bgSlide].video && !reduceMotion && !videoOpen) {
      video.play().catch(() => {});
    } else {
      video.pause();
      video.currentTime = 0;
    }
  }, [bgSlide, reduceMotion, videoOpen]);

  useEffect(
    () => () => {
      tlRef.current?.kill();
      progressRef.current?.kill();
    },
    [],
  );

  return (
    <Box
      ref={rootRef}
      component="section"
      dir="rtl"
      aria-roledescription="carousel"
      aria-label="معرفی آویژه"
      onKeyDown={(event) => {
        // RTL: ArrowLeft moves forward, ArrowRight moves back
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
          event.preventDefault();
          go(
            (activeRef.current + (event.key === "ArrowLeft" ? 1 : -1) + N) % N,
          );
        }
      }}
      sx={{
        position: "relative",
        overflow: "hidden",
        bgcolor: T.bg,
        color: T.text,
        height: "100vh",
        "@supports (height: 100svh)": { height: "100svh" },
        minHeight: { xs: 560, md: 640 },
        display: "flex",
        flexDirection: "column",
        px: { xs: 2, md: 6 },
        pt: { xs: 1.5, md: 2.5 },
        pb: { xs: 1.5, md: 5 },
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 1200,
          mx: "auto",
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          gap: { xs: 1.5, md: 4 },
        }}
      >
        {/* Header */}
        <Box
          component="header"
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 1,
          }}
        >
          <Logo />
          <Box
            component="button"
            type="button"
            aria-label="منو"
            onClick={onMenuClick}
            sx={{
              display: "grid",
              gap: "6px",
              p: 1.25,
              border: 0,
              bgcolor: "transparent",
              color: T.text,
              cursor: "pointer",
              "&:focus-visible": {
                outline: `2px solid ${T.accent}`,
                borderRadius: 1,
              },
            }}
          >
            {[0, 1, 2].map((i) => (
              <Box
                key={i}
                component="span"
                sx={{
                  width: 26,
                  height: 2.5,
                  bgcolor: "currentColor",
                  borderRadius: 2,
                }}
              />
            ))}
          </Box>
        </Box>

        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "5fr 7fr" },
            gridTemplateRows: {
              xs: "minmax(0, 1fr) auto",
              md: "minmax(0, 1fr)",
            },
            gap: { xs: 1.5, md: 8 },
            alignItems: { xs: "stretch", md: "center" },
          }}
        >
          {/* Image frame */}
          <Box
            ref={frameRef}
            sx={{
              order: { xs: 1, md: 2 },
              position: "relative",
              overflow: "hidden",
              borderRadius: { xs: "32px", md: "40px" },
              height: "100%",
              minHeight: 150,
              bgcolor: "#dfe5ef",
              boxShadow: "0 20px 50px rgba(15,25,60,.12)",
            }}
          >
            {slides.map((slide, index) => (
              <Box
                key={slide.image}
                component={slide.video ? "video" : "img"}
                src={slide.video || `/media/hero/${slide.image}.webp`}
                {...(slide.video
                  ? {
                      ref: videoRef,
                      poster: slide.poster,
                      muted: true,
                      loop: true,
                      playsInline: true,
                      preload: "none",
                    }
                  : { alt: "" })}
                aria-hidden="true"
                sx={{
                  position: "absolute",
                  inset: 0,
                  display: "block",
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  opacity: bgSlide === index ? 1 : 0,
                  pointerEvents: "none",
                }}
              />
            ))}
            {slides[bgSlide].fullVideo && (
              <Button
                onClick={() => setVideoOpen(true)}
                sx={{
                  position: "absolute",
                  zIndex: 1,
                  bottom: 14,
                  insetInlineStart: 14,
                  px: 2,
                  py: 0.6,
                  gap: 1,
                  minWidth: 0,
                  fontSize: 13,
                  fontWeight: 700,
                  color: T.accent,
                  bgcolor: "rgba(255,255,255,.92)",
                  borderRadius: "999px",
                  boxShadow: "0 6px 18px rgba(0,0,0,.18)",
                  "&:hover": { bgcolor: "#fff" },
                }}
              >
                <Box
                  component="span"
                  aria-hidden="true"
                  sx={{
                    width: 0,
                    height: 0,
                    borderTop: "5px solid transparent",
                    borderBottom: "5px solid transparent",
                    borderLeft: "8px solid currentColor",
                  }}
                />
                تماشای ویدیو
              </Button>
            )}
          </Box>

          {/* Text + queue */}
          <Box sx={{ order: { xs: 2, md: 1 }, px: { xs: 1, md: 0 } }}>
            <Box
              aria-hidden="true"
              sx={{
                width: 96,
                height: 4,
                mb: { xs: 1.5, md: 3 },
                borderRadius: 4,
                bgcolor: T.track,
                overflow: "hidden",
              }}
            >
              <Box
                ref={fillRef}
                sx={{
                  height: "100%",
                  borderRadius: 4,
                  bgcolor: T.accent,
                  transformOrigin: "right center",
                }}
              />
            </Box>

            <Box ref={textRef}>
              <Box
                sx={{
                  overflow: "hidden",
                  pb: "0.25em",
                  mb: { xs: 0.5, md: 1.5 },
                }}
              >
                <Typography
                  component="h1"
                  data-hero-title=""
                  sx={{
                    fontSize: {
                      xs: "clamp(1.3rem, 5.4vw, 1.7rem)",
                      md: "2.9rem",
                    },
                    fontWeight: 800,
                    lineHeight: { xs: 1.5, md: 1.55 },
                    minHeight: { xs: "3em", md: 0 },
                    color: T.text,
                    willChange: "transform",
                  }}
                >
                  {currentSlide.title}
                </Typography>
              </Box>
              <Typography
                data-hero-fade=""
                sx={{
                  color: T.muted,
                  fontSize: { xs: "0.85rem", md: "1.05rem" },
                  lineHeight: { xs: 1.85, md: 2.1 },
                  maxWidth: 480,
                  display: "-webkit-box",
                  WebkitBoxOrient: "vertical",
                  WebkitLineClamp: 3,
                  overflow: "hidden",
                  minHeight: { xs: "calc(3 * 1.85em)", md: 0 },
                  "@media (max-height: 680px)": {
                    WebkitLineClamp: 2,
                    minHeight: { xs: "calc(2 * 1.85em)", md: 0 },
                  },
                }}
              >
                {currentSlide.description}
              </Typography>
            </Box>

            {/* Queue of upcoming slides */}
            <Box
              role="region"
              aria-label="اسلایدهای بعدی"
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
              onFocus={() => setPaused(true)}
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget))
                  setPaused(false);
              }}
              sx={{ mt: { xs: 1.5, md: 5 }, maxWidth: 520 }}
            >
              <Box
                ref={trackRef}
                dir="rtl"
                onPointerDown={(event) => {
                  if (event.pointerType === "mouse" || !event.isPrimary) return;
                  suppressClickRef.current = false;
                  swipeRef.current = {
                    id: event.pointerId,
                    x: event.clientX,
                    y: event.clientY,
                  };
                  setTouching(true);
                }}
                onPointerMove={(event) => {
                  const start = swipeRef.current;
                  if (!start || start.id !== event.pointerId) return;
                  const dx = event.clientX - start.x;
                  const dy = event.clientY - start.y;
                  if (Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy)) {
                    suppressClickRef.current = true;
                    event.currentTarget.setPointerCapture(event.pointerId);
                  }
                }}
                onPointerUp={(event) => {
                  const start = swipeRef.current;
                  if (!start || start.id !== event.pointerId) return;
                  const dx = event.clientX - start.x;
                  const dy = event.clientY - start.y;
                  if (Math.abs(dx) >= 40 && Math.abs(dx) > Math.abs(dy)) {
                    suppressClickRef.current = true;
                    // RTL: the queue slides rightwards when moving forward
                    go((activeRef.current + (dx > 0 ? 1 : -1) + N) % N);
                  }
                  swipeRef.current = null;
                  setTouching(false);
                }}
                onPointerCancel={() => {
                  swipeRef.current = null;
                  setTouching(false);
                }}
                onClickCapture={(event) => {
                  if (suppressClickRef.current) {
                    event.preventDefault();
                    event.stopPropagation();
                    suppressClickRef.current = false;
                  }
                }}
                sx={{
                  display: "flex",
                  gap: "12px",
                  overflow: "hidden",
                  py: 1,
                  touchAction: "pan-y pinch-zoom",
                  userSelect: "none",
                }}
              >
                {queue.map((index, slot) => {
                  const slide = slides[index];
                  const visible = slot < VISIBLE_CARDS;
                  return (
                    <Box
                      key={slide.image}
                      ref={(el) => (cardRefs.current[index] = el)}
                      data-flip-id={slide.image}
                      component="button"
                      type="button"
                      aria-label={`نمایش ${slide.name}`}
                      aria-hidden={!visible}
                      tabIndex={visible ? 0 : -1}
                      onClick={() => go(index)}
                      sx={{
                        position: "relative",
                        flex: "0 0 calc((100% - 24px) / 3)",
                        height: {
                          xs: "clamp(60px, 11svh, 96px)",
                          md: "clamp(90px, 15svh, 130px)",
                        },
                        p: 0,
                        border: 0,
                        overflow: "hidden",
                        cursor: "pointer",
                        borderRadius: "22px",
                        bgcolor: "#dfe5ef",
                        boxShadow: "0 8px 22px rgba(15,25,60,.14)",
                        "&:focus-visible": {
                          outline: `2px solid ${T.accent}`,
                          outlineOffset: 3,
                        },
                      }}
                    >
                      <Box
                        component="img"
                        draggable={false}
                        src={
                          slide.poster ||
                          `/media/hero/${slide.image}-thumb.webp`
                        }
                        alt={slide.name}
                        sx={{
                          display: "block",
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                      {slide.video && (
                        <Box
                          component="span"
                          aria-hidden="true"
                          sx={{
                            position: "absolute",
                            insetInlineStart: 10,
                            bottom: 10,
                            width: 28,
                            height: 28,
                            borderRadius: "50%",
                            bgcolor: "rgba(255,255,255,.92)",
                            display: "grid",
                            placeItems: "center",
                            color: T.accent,
                            fontSize: 11,
                          }}
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
      </Box>

      {/* The card that flies into the image frame */}
      <Box
        ref={cloneRef}
        aria-hidden="true"
        sx={{
          display: "none",
          position: "absolute",
          zIndex: 3,
          overflow: "hidden",
          pointerEvents: "none",
          boxShadow: "0 24px 60px rgba(15,25,60,.28)",
          willChange: "left, top, width, height",
        }}
      >
        <Box
          component="img"
          ref={cloneImgRef}
          alt=""
          sx={{
            display: "block",
            width: "100%",
            height: "100%",
            objectFit: "cover",
            willChange: "transform",
          }}
        />
      </Box>

      <Dialog
        open={videoOpen}
        onClose={() => setVideoOpen(false)}
        aria-label="ویدیوی معرفی آویژه"
        fullWidth
        maxWidth="md"
        slotProps={{ paper: { sx: { bgcolor: "#111", borderRadius: 2 } } }}
      >
        {videoOpen && (
          <>
            <Box sx={{ display: "flex", justifyContent: "flex-end", p: 1 }}>
              <Button
                onClick={() => setVideoOpen(false)}
                sx={{ color: "white" }}
              >
                بستن
              </Button>
            </Box>
            <Box
              component="video"
              src={slides[bgSlide].fullVideo}
              poster={slides[bgSlide].poster}
              controls
              autoPlay
              playsInline
              sx={{ display: "block", width: "100%", maxHeight: "75dvh" }}
            />
          </>
        )}
      </Dialog>
    </Box>
  );
}
