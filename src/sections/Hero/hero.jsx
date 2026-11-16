import { useEffect, useRef, useState } from "react";
import gsap from "gsap"; // npm i gsap @gsap/react @fontsource/estedad
import { Flip } from "gsap/Flip";
import { useGSAP } from "@gsap/react";
import { Box, Button, Dialog, Typography, useMediaQuery } from "@mui/material";

gsap.registerPlugin(useGSAP, Flip);

/* ---------- Config ---------- */
const SLIDE_SECONDS = 5; // the tan line fills over this time, then the next card opens
const OPEN_SECONDS = 1.0;
const SWAP_AT = 0.5;
const WHEEL_GAP_MS = 120;
const VISIBLE_CARDS = 3;
const INTRO_ONCE_PER_SESSION = false;
const INTRO_SAFETY_MS = 4000;
const REVEAL = "[data-hero-title],[data-hero-fade]";
const BRAND = "AVISHE"; // Latin wordmark (Persian letters must not be letter-spaced)
const HEADER_TONE = "light"; // "light" = white header + soft scrim (safe on any photo), "dark" = brown header for bright photos

const FONT = '"Estedad", "Vazirmatn", Tahoma, sans-serif';
const T = {
  bg: "#faf8f6",
  frame: "#d8cdc0",
  text: "#3a2a1f",
  muted: "#5d4d41",
  accent: "#c8ab85",
  accentOnImage: "#e6cba3",
  track: "rgba(200,171,133,.28)",
  shadow: "rgba(86,60,38,.16)",
};
const headerColor = HEADER_TONE === "light" ? "#fff" : T.text;

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

export function HeroSection({ onMenuClick, showDescription = true }) {
  // activeSlide -> text | carouselActive -> card queue (switches first) | bgSlide -> image in the frame (switches last)
  const [activeSlide, setActiveSlide] = useState(0);
  const [carouselActive, setCarouselActive] = useState(0);
  const [bgSlide, setBgSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const [touching, setTouching] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);
  const [introDone, setIntroDone] = useState(false);
  const introPlayedRef = useRef(false);
  const introSkippedRef = useRef(false);
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

  const queue = Array.from(
    { length: N - 1 },
    (_, k) => (carouselActive + 1 + k) % N,
  );

  const commit = (index) => {
    activeRef.current = index;
    setActiveSlide(index);
  };

  /* ---------- The card flies into the image frame ---------- */
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
      borderRadius: radiusOf(card, 24),
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
          borderRadius: radiusOf(frame, 36),
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

  /* ---------- Cards appear first, then the frame opens ---------- */
  useGSAP(
    () => {
      let stored = false;
      try {
        stored = INTRO_ONCE_PER_SESSION && sessionStorage.getItem("hero-intro") === "1";
      } catch {}
      if (reduceMotion || window.matchMedia("(prefers-reduced-motion: reduce)").matches || stored || introPlayedRef.current) {
        introSkippedRef.current = true;
        busyRef.current = false;
        setIntroDone(true);
        return;
      }
      introPlayedRef.current = true;
      introSkippedRef.current = false;
      busyRef.current = true;
      const frame = frameRef.current;
      const image = frame.querySelector("img");
      const header = frame.querySelector("header");
      const track = fillRef.current.parentElement;
      const titles = rootRef.current.querySelectorAll("[data-hero-title]");
      const fades = rootRef.current.querySelectorAll("[data-hero-fade]");
      const cards = rootRef.current.querySelectorAll("[data-flip-id]");
      const radius = radiusOf(frame, 36);
      const opening = { progress: 0 };
      // Open from the bottom center while preserving the corner radius.
      const updateFrameClip = () => {
        const remaining = 1 - opening.progress;
        const top = 88 * remaining;
        const horizontal = 30 * remaining;
        frame.style.clipPath = `inset(${top}% ${horizontal}% 0% ${horizontal}% round ${radius}px)`;
      };
      let cancelled = false;
      let finished = false;
      let timeline;
      let decodeTimeout;
      let safetyTimeout;
      const clear = () => {
        gsap.set(frame, { clearProps: "clipPath" });
        gsap.set(image, { clearProps: "transform" });
        gsap.set(header, { clearProps: "opacity,transform" });
        gsap.set(track, { clearProps: "opacity,transform" });
        gsap.set([...titles, ...fades], {
          clearProps: "opacity,transform,filter",
        });
        gsap.set(cards, { clearProps: "opacity,transform" });
      };
      const finish = () => {
        if (cancelled || finished) return;
        finished = true;
        clearTimeout(safetyTimeout);
        clearTimeout(decodeTimeout);
        clear();
        try {
          sessionStorage.setItem("hero-intro", "1");
        } catch {}
        busyRef.current = false;
        setIntroDone(true);
      };
      gsap.set(frame, { clipPath: `inset(88% 30% 0% 30% round ${radius}px)` });
      gsap.set(image, { scale: 1.3 });
      gsap.set(header, { opacity: 0, y: -14 });
      gsap.set(track, {
        opacity: 0,
        scaleX: 0.4,
        transformOrigin: "right center",
      });
      gsap.set(titles, { yPercent: 110 });
      gsap.set(fillRef.current, { scaleX: 0 });
      gsap.set(fades, { opacity: 0, y: 16 });
      gsap.set(cards, {
        opacity: 0, y: 70, scale: 0.82,
        rotate: (index) => [-6, 0, 6][index % 3],
      });
      safetyTimeout = setTimeout(() => {
        timeline?.kill();
        finish();
      }, INTRO_SAFETY_MS);
      const preload = new Image();
      preload.src = fullImage(slides[0]);
      const play = async () => {
        try {
          await Promise.race([
            preload.decode(),
            new Promise((resolve) => {
              decodeTimeout = setTimeout(resolve, 1200);
            }),
          ]);
        } catch {}
        clearTimeout(decodeTimeout);
        if (cancelled || finished) return;
        timeline = gsap
          .timeline({ defaults: { ease: "power3.out" }, onComplete: finish })
          .to(cards, {
            opacity: 1, y: 0, scale: 1, rotate: 0,
            duration: 0.85, stagger: 0.12, ease: "back.out(1.5)",
          }, 0)
          .to(
            opening,
            {
              progress: 1,
              onUpdate: updateFrameClip,
              duration: 1.15,
              ease: "power4.inOut",
            },
            0.45,
          )
          .to(image, { scale: 1, duration: 1.8 }, 0.45)
          .to(header, { opacity: 1, y: 0, duration: 0.7 }, 1)
          .to(titles, { yPercent: 0, duration: 0.9, ease: "power4.out" }, 1.15)
          .to(track, { opacity: 1, scaleX: 1, duration: 0.5 }, 1.3)
          .to(fades, { opacity: 1, y: 0, duration: 0.7, stagger: 0.08 }, 1.4);
      };
      void play();
      return () => {
        cancelled = true;
        clearTimeout(safetyTimeout);
        clearTimeout(decodeTimeout);
        timeline?.kill();
        clear();
        busyRef.current = false;
        // Let StrictMode's replacement setup play an interrupted intro.
        if (!finished) introPlayedRef.current = false;
      };
    },
    { scope: rootRef, dependencies: [] },
  );

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

  /* ---------- New text enters (mask reveal; never split per letter) ---------- */
  useGSAP(
    () => {
      if (!textRef.current) return;
      if (!introDone && !reduceMotion && !introSkippedRef.current) return;
      if (reduceMotion) {
        gsap.set(gsap.utils.toArray(REVEAL, textRef.current), {
          clearProps: "all",
        });
        return;
      }
      gsap.fromTo(
        "[data-hero-title]",
        { yPercent: 110, opacity: 1, y: 0, filter: "none" },
        { yPercent: 0, duration: 0.9, ease: "power4.out" },
      );
      gsap.fromTo(
        "[data-hero-fade]",
        { opacity: 0, y: 16, filter: "blur(4px)" },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.7,
          ease: "power3.out",
          delay: 0.15,
          stagger: 0.08,
        },
      );
    },
    {
      dependencies: [activeSlide, reduceMotion],
      scope: textRef,
      revertOnUpdate: true,
    },
  );

  /* ---------- Timer: the tan line fills, then the next card opens ---------- */
  useEffect(() => {
    if (!introDone) return;
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
  }, [activeSlide, reduceMotion, videoOpen, introDone]);

  useEffect(() => {
    if (!introDone) return;
    const tween = progressRef.current;
    if (!tween) return;
    if (paused || touching) tween.pause();
    else tween.resume();
  }, [paused, touching, activeSlide, reduceMotion, videoOpen, introDone]);

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
        display: "flex",
        bgcolor: T.bg,
        color: T.text,
        fontFamily: FONT,
        "& .MuiTypography-root, & .MuiButton-root": { fontFamily: "inherit" },
        height: "100vh",
        "@supports (height: 100svh)": { height: "100svh" },
        minHeight: { xs: 560, md: 640 },
        p: { xs: 1.5, md: 3 },
      }}
    >
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          width: "100%",
          maxWidth: 1280,
          mx: "auto",
          display: "grid",
          gridTemplateColumns: "1fr",
          gridTemplateRows: { xs: "minmax(0, 1fr) auto", md: "minmax(0, 1fr)" },
          gap: 1.5,
        }}
      >
        {/* Big image frame: header, title and (optional) paragraph sit on top of it */}
        <Box
          ref={frameRef}
          sx={{
            gridArea: "1 / 1",
            position: "relative",
            overflow: "hidden",
            height: "100%",
            minHeight: 150,
            borderRadius: { xs: "36px", md: "44px" },
            bgcolor: T.frame,
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
                : {
                    alt: "",
                    ...(index === 0 ? { fetchPriority: "high" } : {}),
                  })}
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

          {/* Scrims (above the flying card so nothing pops at the end) */}
          {HEADER_TONE === "light" && (
            <Box
              aria-hidden="true"
              sx={{
                position: "absolute",
                zIndex: 4,
                inset: "0 0 auto 0",
                height: "32%",
                pointerEvents: "none",
                background:
                  "linear-gradient(to bottom, rgba(36,24,14,.38), rgba(36,24,14,0))",
              }}
            />
          )}
          <Box
            aria-hidden="true"
            sx={{
              position: "absolute",
              zIndex: 4,
              inset: "auto 0 0 0",
              height: { xs: "58%", md: "55%" },
              pointerEvents: "none",
              background:
                "linear-gradient(to top, rgba(28,18,10,.78) 0%, rgba(28,18,10,.45) 45%, rgba(28,18,10,0) 100%)",
            }}
          />

          <Box
            component="header"
            sx={{
              position: "absolute",
              zIndex: 5,
              top: 0,
              insetInline: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              px: { xs: 3.5, md: 5 },
              py: { xs: 2.25, md: 3 },
              color: headerColor,
            }}
          >
            <Typography
              component="span"
              sx={{
                fontFamily: 'Georgia, "Times New Roman", serif !important',
                fontSize: 15,
                fontWeight: 500,
                letterSpacing: ".34em",
                color: "inherit",
              }}
            >
              {BRAND}
            </Typography>
            <Box
              component="button"
              type="button"
              aria-label="منو"
              onClick={onMenuClick}
              sx={{
                display: "grid",
                gap: "6px",
                p: 1,
                border: 0,
                bgcolor: "transparent",
                color: "inherit",
                cursor: "pointer",
                "&:focus-visible": {
                  outline: "2px solid currentColor",
                  borderRadius: 1,
                },
              }}
            >
              {[0, 1, 2].map((i) => (
                <Box
                  key={i}
                  component="span"
                  sx={{ width: 24, height: 1.5, bgcolor: "currentColor" }}
                />
              ))}
            </Box>
          </Box>

          {/* Title (+ optional paragraph) anchored to the bottom of the image */}
          <Box
            ref={textRef}
            sx={{
              position: "absolute",
              zIndex: 5,
              bottom: { xs: 22, md: 48 },
              left: { xs: 26, md: "auto" },
              right: { xs: 26, md: 56 },
              width: { md: "min(560px, 46%)" },
              color: "#fff",
            }}
          >
            <Box sx={{ overflow: "hidden", pb: "0.25em" }}>
              <Typography
                component="h1"
                data-hero-title=""
                sx={{
                  fontSize: {
                    xs: "clamp(1.55rem, 6.6vw, 2.05rem)",
                    md: "3.1rem",
                  },
                  fontWeight: 400,
                  lineHeight: 1.5,
                  color: "#fff",
                  textShadow: "0 2px 18px rgba(0,0,0,.28)",
                  willChange: "transform",
                }}
              >
                {currentSlide.title}
              </Typography>
            </Box>

            {/* The accent line is the timer */}
            <Box
              aria-hidden="true"
              sx={{
                width: 56,
                height: 2,
                my: { xs: 1, md: 1.75 },
                bgcolor: "rgba(255,255,255,.32)",
                overflow: "hidden",
              }}
            >
              <Box
                ref={fillRef}
                sx={{
                  height: "100%",
                  bgcolor: T.accentOnImage,
                  transformOrigin: "right center",
                }}
              />
            </Box>

            {showDescription && (
              <Typography
                data-hero-fade=""
                sx={{
                  color: "rgba(255,255,255,.88)",
                  fontSize: { xs: "0.85rem", md: "1.05rem" },
                  lineHeight: { xs: 1.9, md: 2.1 },
                  display: "-webkit-box",
                  WebkitBoxOrient: "vertical",
                  WebkitLineClamp: { xs: 2, md: 3 },
                  overflow: "hidden",
                }}
              >
                {currentSlide.description}
              </Typography>
            )}

            {currentSlide.fullVideo && (
              <Button
                data-hero-fade=""
                onClick={() => setVideoOpen(true)}
                sx={{
                  mt: 1.5,
                  px: 2,
                  py: 0.6,
                  gap: 1,
                  minWidth: 0,
                  fontSize: 13,
                  fontWeight: 500,
                  color: "#fff",
                  border: "1px solid rgba(255,255,255,.55)",
                  bgcolor: "rgba(255,255,255,.14)",
                  backdropFilter: "blur(6px)",
                  borderRadius: "999px",
                  "&:hover": { bgcolor: "rgba(255,255,255,.26)" },
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
        </Box>

        {/* Queue of upcoming slides: under the image on mobile, over its corner on desktop */}
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
          sx={{
            gridArea: { xs: "2 / 1", md: "1 / 1" },
            alignSelf: { md: "end" },
            justifySelf: { md: "end" }, // RTL: the left corner
            position: "relative",
            zIndex: 5,
            width: { xs: "auto", md: "min(46%, 460px)" },
            m: { xs: 0, md: "0 32px 32px" },
            px: { xs: 0.5, md: 0 },
          }}
        >
          <Box
            ref={trackRef}
            dir="rtl"
            onPointerDown={(event) => {
              if (!introDone) return;
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
              p: "6px 8px 14px",
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
                    aspectRatio: "1.1 / 1",
                    p: 0,
                    border: 0,
                    overflow: "hidden",
                    cursor: "pointer",
                    borderRadius: "24px",
                    bgcolor: T.frame,
                    boxShadow: `0 10px 24px ${T.shadow}`,
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
                        insetInlineStart: 8,
                        bottom: 8,
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        bgcolor: "rgba(255,255,255,.9)",
                        display: "grid",
                        placeItems: "center",
                        color: T.text,
                        fontSize: 9,
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
          boxShadow: `0 24px 60px ${T.shadow}`,
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
