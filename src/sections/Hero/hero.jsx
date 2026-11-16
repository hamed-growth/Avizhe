import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Box, Button, Dialog, Typography, useMediaQuery } from "@mui/material";

/* ---------- Config ---------- */
const SLIDE_SECONDS = 5; // time before auto-advance (the "timed" part)
const OPEN_SECONDS = 1.05; // card -> fullscreen duration
const SWAP_AT = 0.55; // when text + thumbnails switch to the new slide
const WHEEL_GAP_MS = 120; // silence needed between two wheel gestures
const CARD_EASE = "cubic-bezier(.22,1,.36,1)";
const REVEAL = "[data-hero-line],[data-hero-title],[data-hero-fade]";

const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

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

export function HeroSection() {
  // activeSlide: drives text, thumbnails, dots (switches mid-transition)
  // bgSlide: drives the fullscreen background (switches when the card finished opening)
  const [activeSlide, setActiveSlide] = useState(0);
  const [bgSlide, setBgSlide] = useState(0);
  const [opening, setOpening] = useState(null); // index of the card being opened
  const [transitioning, setTransitioning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [touching, setTouching] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);
  const currentSlide = slides[activeSlide];
  const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  const rootRef = useRef(null);
  const textRef = useRef(null);
  const cloneRef = useRef(null);
  const cloneImgRef = useRef(null);
  const cardRefs = useRef([]);
  const fillRefs = useRef([]);
  const videoRef = useRef(null);
  const swipeRef = useRef(null);
  const suppressClickRef = useRef(false);

  const activeRef = useRef(0);
  const busyRef = useRef(false);
  const tlRef = useRef(null);
  const progressRef = useRef(null);
  const goRef = useRef(() => {});
  const frameRef = useRef(null);

  const commit = (index) => {
    activeRef.current = index;
    setActiveSlide(index);
  };

  /* ---------- Core: open the target card to fullscreen ---------- */
  const go = (target) => {
    const from = activeRef.current;
    const root = rootRef.current;
    if (!root || busyRef.current || videoOpen || target === from) return;

    if (reduceMotion) {
      commit(target);
      setBgSlide(target);
      return;
    }

    busyRef.current = true;
    setTransitioning(true);

    // The card that visually "opens": the neighbour if visible, else the active one.
    const pos = (target - from + N) % N;
    const near = pos === 1 || pos === N - 1;
    const originEl = cardRefs.current[near ? target : from];
    const rootRect = root.getBoundingClientRect();
    const r = originEl.getBoundingClientRect();

    const clone = cloneRef.current;
    const cloneImg = cloneImgRef.current;
    cloneImg.src = fullImage(slides[target]);

    gsap.set(clone, {
      display: "block",
      left: r.left - rootRect.left,
      top: r.top - rootRect.top,
      width: r.width,
      height: r.height,
      borderRadius: near ? 14 : 20,
    });
    setOpening(near ? target : null);

    const textEls = gsap.utils.toArray(REVEAL, textRef.current);

    tlRef.current = gsap
      .timeline({
        onComplete: () => {
          setBgSlide(target); // real background takes over under the clone...
          frameRef.current = requestAnimationFrame(() => {
            frameRef.current = requestAnimationFrame(() => {
              gsap.set(clone, { display: "none" }); // ...then the clone leaves
              busyRef.current = false;
              setTransitioning(false);
            });
          });
        },
      })
      // old text leaves
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
      // card grows to the full hero
      .to(
        clone,
        {
          left: 0,
          top: 0,
          width: rootRect.width,
          height: rootRect.height,
          borderRadius: 0,
          duration: OPEN_SECONDS,
          ease: "power3.inOut",
        },
        0,
      )
      // image settles inside the growing card
      .fromTo(
        cloneImg,
        { scale: 1.12 },
        { scale: 1, duration: OPEN_SECONDS + 0.25, ease: "power3.out" },
        0,
      )
      // switch text / thumbnails / dots while the card is almost open
      .add(() => {
        setOpening(null);
        commit(target);
      }, SWAP_AT);
  };
  goRef.current = go;

  useIsoLayoutEffect(() => {
    if (!reduceMotion || !busyRef.current) return;
    tlRef.current?.kill();
    cancelAnimationFrame(frameRef.current);
    gsap.set(cloneRef.current, { display: "none" });
    setBgSlide(activeRef.current);
    setOpening(null);
    busyRef.current = false;
    setTransitioning(false);
  }, [reduceMotion]);

  /* ---------- New text enters (mask reveal, no per-letter split: Persian joins letters) ---------- */
  useIsoLayoutEffect(() => {
    if (!textRef.current) return;
    if (reduceMotion) {
      gsap.set(gsap.utils.toArray(REVEAL, textRef.current), { clearProps: "all" });
      return;
    }
    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-hero-line]",
        { opacity: 0, scaleX: 0.4, y: 0, filter: "none" },
        { opacity: 1, scaleX: 1, duration: 0.6, ease: "power3.out" },
      );
      gsap.fromTo(
        "[data-hero-title]",
        { yPercent: 110, opacity: 1, y: 0, filter: "none" },
        { yPercent: 0, duration: 0.85, ease: "power4.out", delay: 0.08 },
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
          delay: 0.18,
        },
      );
    }, textRef);
    return () => ctx.revert();
  }, [activeSlide, reduceMotion]);

  /* ---------- Timed auto-advance: the active dot fills over SLIDE_SECONDS ---------- */
  useEffect(() => {
    if (reduceMotion || videoOpen) return;
    const fill = fillRefs.current[activeSlide];
    if (!fill) return;
    const tween = gsap.fromTo(
      fill,
      { scaleX: 0 },
      {
        scaleX: 1,
        duration: SLIDE_SECONDS,
        ease: "none",
        onComplete: () => goRef.current((activeRef.current + 1) % N),
      },
    );
    progressRef.current = tween;
    return () => {
      tween.kill();
      progressRef.current = null;
    };
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
      if (e.ctrlKey) return;
      if (Math.abs(e.deltaY) < 8 || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      const bounds = el.getBoundingClientRect();
      if (
        bounds.top < -1 ||
        bounds.bottom < window.innerHeight - 1 ||
        bounds.height > window.innerHeight + 1
      ) return;
      const next = activeRef.current + (e.deltaY > 0 ? 1 : -1);
      // at the first/last slide let the page scroll normally
      if (next < 0 || next >= N) return;
      e.preventDefault();
      const now = performance.now();
      const gap = now - lastTs;
      lastTs = now;
      if (busyRef.current) {
        locked = true;
        return;
      }
      if (locked && gap < WHEEL_GAP_MS) return; // same trackpad gesture / inertia
      locked = true;
      goRef.current(next);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [videoOpen]);

  /* ---------- Video background ---------- */
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
      cancelAnimationFrame(frameRef.current);
    },
    [],
  );

  return (
    <Box
      ref={rootRef}
      sx={{
        backgroundColor: "#c3c3c3",
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        position: "relative",
        overflow: "hidden",

        "&:before": {
          content: '""',
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          zIndex: 1,
          boxShadow: "inset -100px -62px 100px -18px rgba(32,36,42,0.58)",
        },
      }}
    >
      {/* Fullscreen backgrounds (the opening card hides the swap, so no crossfade) */}
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
            borderRadius: "3px",
            opacity: bgSlide === index ? 1 : 0,
            pointerEvents: "none",
          }}
        />
      ))}

      {/* The card that grows into the new background (animated by GSAP) */}
      <Box
        ref={cloneRef}
        aria-hidden="true"
        sx={{
          display: "none",
          position: "absolute",
          overflow: "hidden",
          pointerEvents: "none",
          boxShadow: "0 24px 60px rgba(0,0,0,.35)",
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

      <Box
        sx={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          p: 2,
          height: "50%",
          background:
            "linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent)",
          backdropFilter: "blur(5px)",
          WebkitBackdropFilter: "blur(5px)",
          maskImage: "linear-gradient(to top, #000 0%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to top, #000 0%, #000 50% , #00000063 100%)",
        }}
      />

      <Box
        sx={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          gap: 3,
          color: "white",
          textAlign: "right",
          width: "100%",
          minHeight: "55dvh",
          p: 3,
          pt: 6,
          pb: "calc(32px + env(safe-area-inset-bottom, 0px))",
          zIndex: 2,
        }}
      >
        <Box ref={textRef} dir="rtl">
          <Box
            aria-hidden="true"
            data-hero-line=""
            sx={{
              width: 56,
              height: 4,
              mb: 2,
              bgcolor: "white",
              borderRadius: "1px",
              transformOrigin: "right center",
            }}
          />
          <Box sx={{ overflow: "hidden", pb: "0.2em", mb: 1.8 }}>
            <Typography variant="h4" data-hero-title="" sx={{ willChange: "transform" }}>
              {currentSlide.title}
            </Typography>
          </Box>
          <Typography
            variant="subtitle2"
            data-hero-fade=""
            sx={{
              color: "#f6f6f6",
              textAlign: "right",
              pl: { xs: 0, sm: 10 },
            }}
          >
            {currentSlide.description}
          </Typography>
          {currentSlide.fullVideo && (
            <Button
              variant="outlined"
              data-hero-fade=""
              disabled={transitioning}
              onClick={() => setVideoOpen(true)}
              sx={{
                mt: 2,
                px: 2,
                py: 1,
                gap: 1.5,
                color: "white",
                borderColor: "rgba(255,255,255,.5)",
                borderRadius: "999px",
                "&:hover": {
                  borderColor: "white",
                  bgcolor: "rgba(255,255,255,.1)",
                },
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

        {/* Card slider */}
        <Box
          role="region"
          aria-label="اسلایدر تصاویر محصولات"
          aria-roledescription="carousel"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget))
              setPaused(false);
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
              event.preventDefault();
              go(
                (activeRef.current +
                  (event.key === "ArrowRight" ? 1 : -1) +
                  N) %
                  N,
              );
            }
          }}
          sx={{ alignSelf: "flex-end", flexShrink: 0, width: "min(100%, 440px)" }}
        >
          <Box
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
                go((activeRef.current + (dx < 0 ? 1 : -1) + N) % N);
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
              position: "relative",
              overflow: "hidden",
              height: 108,
              direction: "ltr",
              touchAction: "pan-y pinch-zoom",
              userSelect: "none",
            }}
          >
            {slides.map((slide, index) => {
              const selected = activeSlide === index;
              const offset = (index - activeSlide + N) % N;
              const position = offset === N - 1 ? -1 : offset;
              const visible = Math.abs(position) <= 1;
              const isOpening = opening === index;
              return (
                <Box
                  key={slide.image}
                  ref={(el) => {
                    cardRefs.current[index] = el;
                  }}
                  component="button"
                  type="button"
                  aria-label={`نمایش ${slide.name}`}
                  aria-pressed={selected}
                  aria-hidden={!visible}
                  tabIndex={visible ? 0 : -1}
                  onClick={() => go(index)}
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: `${50 + position * 34}%`,
                    transform: "translate(-50%, -50%)",
                    width: selected ? "32%" : "24%",
                    minWidth: 0,
                    height: selected ? 100 : 76,
                    p: 0,
                    overflow: "hidden",
                    cursor: "pointer",
                    borderRadius: selected ? "20px" : "14px",
                    border: "1px solid",
                    borderColor: selected
                      ? "rgba(255,255,255,.85)"
                      : "rgba(255,255,255,.18)",
                    opacity: isOpening ? 0 : visible ? (selected ? 1 : 0.65) : 0,
                    visibility: visible ? "visible" : "hidden",
                    pointerEvents: visible ? "auto" : "none",
                    bgcolor: "rgba(255,255,255,.1)",
                    boxShadow: selected ? "0 8px 28px rgba(0,0,0,.2)" : "none",
                    transition: reduceMotion
                      ? "none"
                      : `left 550ms ${CARD_EASE}, width 550ms ${CARD_EASE}, height 550ms ${CARD_EASE}, border-radius 550ms ${CARD_EASE}, border-color 550ms ease, box-shadow 550ms ease, opacity 250ms ease`,
                    "&:hover": { opacity: isOpening ? 0 : 1 },
                    "&:focus-visible": {
                      outline: "2px solid white",
                      outlineOffset: 4,
                    },
                  }}
                >
                  <Box
                    component="img"
                    draggable={false}
                    src={slide.poster || `/media/hero/${slide.image}-thumb.webp`}
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
                        inset: 0,
                        display: "grid",
                        placeItems: "center",
                        color: "white",
                        fontSize: 24,
                        background: "rgba(0,0,0,.15)",
                      }}
                    >
                      ▶
                    </Box>
                  )}
                </Box>
              );
            })}
          </Box>

          {/* Dots: the active one is the timer progress */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              direction: "ltr",
              mt: 1,
            }}
          >
            {slides.map((slide, index) => {
              const active = activeSlide === index;
              return (
                <Box
                  key={slide.image}
                  component="button"
                  type="button"
                  aria-label={`انتخاب ${slide.name}`}
                  aria-pressed={active}
                  onClick={() => go(index)}
                  sx={{
                    border: 0,
                    p: "10px 3px",
                    bgcolor: "transparent",
                    cursor: "pointer",
                    "&:focus-visible": {
                      outline: "2px solid white",
                      borderRadius: 1,
                    },
                  }}
                >
                  <Box
                    component="span"
                    sx={{
                      position: "relative",
                      display: "block",
                      overflow: "hidden",
                      height: 3,
                      borderRadius: 10,
                      width: active ? 40 : 17,
                      bgcolor: "rgba(255,255,255,.3)",
                      transition: reduceMotion ? "none" : "width 300ms ease",
                    }}
                  >
                    {active && (
                      <Box
                        component="span"
                        ref={(el) => {
                          fillRefs.current[index] = el;
                        }}
                        sx={{
                          position: "absolute",
                          inset: 0,
                          bgcolor: "white",
                          transformOrigin: "left center",
                        }}
                      />
                    )}
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>
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
              <Button onClick={() => setVideoOpen(false)} sx={{ color: "white" }}>
                بستن
              </Button>
            </Box>
            <Box
              component="video"
              src={currentSlide.fullVideo}
              poster={currentSlide.poster}
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
