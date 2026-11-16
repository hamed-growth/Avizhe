import { useEffect, useRef, useState } from "react";
import gsap from "gsap"; // npm i gsap @gsap/react
import { Flip } from "gsap/Flip";
import { useGSAP } from "@gsap/react";
import { Box, Button, Dialog, Typography, useMediaQuery } from "@mui/material";

gsap.registerPlugin(useGSAP, Flip);

/* ---------- Config ---------- */
const SLIDE_SECONDS = 5; // auto-advance time
const OPEN_SECONDS = 1.05; // card -> fullscreen
const SWAP_AT = 0.55; // text + dots switch to the new slide
const WHEEL_GAP_MS = 120; // silence needed between two wheel gestures
const VISIBLE_CARDS = 3;
const REVEAL = "[data-hero-line],[data-hero-title],[data-hero-fade]";

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
const fa = (n) =>
  new Intl.NumberFormat("fa-IR", { minimumIntegerDigits: 2 }).format(n);
const fullImage = (s) => s.poster || `/media/hero/${s.image}.webp`;

export function HeroSection() {
  // activeSlide    -> text + dots (switches mid-transition)
  // carouselActive -> card queue (switches at the START of the transition)
  // bgSlide        -> fullscreen background (switches when the card is fully open)
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
  const trackRef = useRef(null);
  const cloneRef = useRef(null);
  const cloneImgRef = useRef(null);
  const cardRefs = useRef([]);
  const fillRefs = useRef([]);
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

  /* ---------- Core: open the target card to fullscreen ---------- */
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

    // Origin rect: the target card (clamped to the track if it is off-screen).
    const rootRect = root.getBoundingClientRect();
    const trackRect = trackRef.current.getBoundingClientRect();
    const r = cardRefs.current[target].getBoundingClientRect();
    const left = Math.min(r.left, trackRect.right - r.width);

    // Remember where every card is now; Flip animates them after React re-orders.
    flipRef.current = Flip.getState(root.querySelectorAll("[data-flip-id]"));

    const clone = cloneRef.current;
    const cloneImg = cloneImgRef.current;
    cloneImg.src = fullImage(slides[target]);
    gsap.set(clone, {
      display: "block",
      left: left - rootRect.left,
      top: r.top - rootRect.top,
      width: r.width,
      height: r.height,
      borderRadius: 12,
    });

    // The card leaves the queue right now; the clone takes its exact place.
    setCarouselActive(target);

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
      .fromTo(
        cloneImg,
        { scale: 1.12 },
        { scale: 1, duration: OPEN_SECONDS + 0.25, ease: "power3.out" },
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
    },
    {
      dependencies: [activeSlide, reduceMotion],
      scope: textRef,
      revertOnUpdate: true,
    },
  );

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
      }}
    >
      {/* Fullscreen backgrounds */}
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

      {/* The card that grows into the new background */}
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
          height: "70%",
          pointerEvents: "none",
          background:
            "linear-gradient(to top, rgba(8,12,18,.82) 0%, rgba(8,12,18,.45) 45%, rgba(8,12,18,0) 100%)",
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
              width: 32,
              height: 2,
              mb: 2.5,
              bgcolor: "white",
              borderRadius: "1px",
              transformOrigin: "right center",
            }}
          />
          <Box
            sx={{ overflow: "hidden", pb: "0.25em", mb: 1.5, maxWidth: 560 }}
          >
            <Typography
              variant="h4"
              data-hero-title=""
              sx={{
                fontSize: { xs: "1.7rem", sm: "2.4rem" },
                fontWeight: 600,
                lineHeight: 1.6,
                willChange: "transform",
              }}
            >
              {currentSlide.title}
            </Typography>
          </Box>
          <Typography
            variant="subtitle2"
            data-hero-fade=""
            sx={{
              color: "rgba(255,255,255,.78)",
              textAlign: "right",
              fontSize: "0.85rem",
              lineHeight: 2.1,
              maxWidth: 440,
            }}
          >
            {currentSlide.description}
          </Typography>
          {currentSlide.fullVideo && (
            <Button
              variant="outlined"
              data-hero-fade=""
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

        {/* Queue of upcoming slides */}
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
          sx={{
            alignSelf: "flex-end",
            flexShrink: 0,
            width: "min(100%, 320px)",
          }}
        >
          <Box
            ref={trackRef}
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
              display: "flex",
              alignItems: "center",
              gap: "5%",
              overflow: "hidden",
              height: 92,
              direction: "ltr",
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
                    flex: "0 0 29%",
                    height: 84,
                    p: 0,
                    overflow: "hidden",
                    cursor: "pointer",
                    borderRadius: "12px",
                    border: 0,
                    bgcolor: "rgba(255,255,255,.1)",
                    boxShadow: "0 6px 18px rgba(0,0,0,.25)",
                    filter: "brightness(.88)",
                    "&:hover": { filter: "brightness(1)" },
                    "&:focus-visible": {
                      outline: "2px solid white",
                      outlineOffset: 4,
                    },
                  }}
                >
                  <Box
                    component="img"
                    draggable={false}
                    src={
                      slide.poster || `/media/hero/${slide.image}-thumb.webp`
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
                        inset: 0,
                        display: "grid",
                        placeItems: "center",
                        color: "white",
                        fontSize: 14,
                        background: "rgba(0,0,0,.28)",
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
              alignItems: "center",
              justifyContent: "space-between",
              direction: "ltr",
              mt: 0.5,
            }}
          >
            <Box sx={{ display: "flex" }}>
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
                        height: 2,
                        borderRadius: 10,
                        width: active ? 32 : 10,
                        bgcolor: "rgba(255,255,255,.3)",
                        transition: reduceMotion ? "none" : "width 300ms ease",
                      }}
                    >
                      {active && (
                        <Box
                          component="span"
                          ref={(el) => (fillRefs.current[index] = el)}
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
            <Typography
              aria-hidden="true"
              sx={{
                fontSize: 12,
                letterSpacing: ".08em",
                color: "rgba(255,255,255,.7)",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {fa(activeSlide + 1)} / {fa(N)}
            </Typography>
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
              <Button
                onClick={() => setVideoOpen(false)}
                sx={{ color: "white" }}
              >
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
