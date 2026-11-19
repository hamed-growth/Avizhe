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
const VISIBLE_CARDS = 3;
const REVEAL = "[data-hero-title],[data-hero-fade]";
const BRAND = "پویا شیمی آویژه";
const HEADER_TONE = "light"; // "light" = white header + soft scrim (safe on any photo), "dark" = brown header for bright photos

const FONT = '"Estedad", "Vazirmatn", Tahoma, sans-serif';
const T = {
  bg: "#fbfaf7",
  frame: "#ddd7ce",
  text: "#252923",
  muted: "#646a61",
  accent: "#ed885f",
  accentOnImage: "#ffd0b2",
  track: "rgba(237,136,95,.3)",
  shadow: "rgba(20,32,24,.22)",
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
  const [inView, setInView] = useState(true);
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

  /* ---------- One-time frame opening ---------- */
  useGSAP(
    () => {
      let stored = false;
      try {
        stored = sessionStorage.getItem("hero-intro") === "1";
      } catch {}
      if (reduceMotion || stored || introPlayedRef.current) {
        introSkippedRef.current = true;
        busyRef.current = false;
        setIntroDone(true);
        return;
      }
      introPlayedRef.current = true;
      busyRef.current = true;
      const frame = frameRef.current;
      const image = frame.querySelector("img");
      const header = frame.querySelector("header");
      const track = fillRef.current.parentElement;
      const titles = rootRef.current.querySelectorAll("[data-hero-title]");
      const fades = rootRef.current.querySelectorAll("[data-hero-fade]");
      const cards = rootRef.current.querySelectorAll("[data-flip-id]");
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
      gsap.set(frame, { clipPath: "inset(62% 22% 6% 22% round 40px)" });
      gsap.set(image, { scale: 1.3 });
      gsap.set(header, { opacity: 0, y: -14 });
      gsap.set(track, {
        opacity: 0,
        scaleX: 0.4,
        transformOrigin: "right center",
      });
      gsap.set(titles, { yPercent: 110 });
      gsap.set(fades, { opacity: 0, y: 16 });
      gsap.set(cards, { opacity: 0, y: 48, scale: 0.9 });
      safetyTimeout = setTimeout(() => {
        timeline?.kill();
        finish();
      }, 4000);
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
          .to(
            frame,
            {
              clipPath: `inset(0% 0% 0% 0% round ${radiusOf(frame, 36)}px)`,
              duration: 1.15,
              ease: "power4.inOut",
            },
            0,
          )
          .to(image, { scale: 1, duration: 1.7 }, 0)
          .to(header, { opacity: 1, y: 0, duration: 0.7 }, 0.55)
          .to(titles, { yPercent: 0, duration: 0.9, ease: "power4.out" }, 0.7)
          .to(track, { opacity: 1, scaleX: 1, duration: 0.5 }, 0.85)
          .to(
            cards,
            { opacity: 1, y: 0, scale: 1, duration: 0.8, stagger: 0.09 },
            0.85,
          )
          .to(fades, { opacity: 1, y: 0, duration: 0.7, stagger: 0.08 }, 0.95);
      };
      void play();
      return () => {
        cancelled = true;
        clearTimeout(safetyTimeout);
        clearTimeout(decodeTimeout);
        timeline?.kill();
        clear();
        busyRef.current = false;
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
    if (paused || touching || !inView) tween.pause();
    else tween.resume();
  }, [paused, touching, inView, activeSlide, reduceMotion, videoOpen, introDone]);

  // Keep the visual timer and preview video idle when the hero is off-screen.
  useEffect(() => {
    const hero = rootRef.current;
    if (!hero || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: .08 });
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  /* ---------- Video in the frame ---------- */
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (slides[bgSlide].video && !reduceMotion && !videoOpen && inView) {
      video.play().catch(() => {});
    } else {
      video.pause();
      video.currentTime = 0;
    }
  }, [bgSlide, reduceMotion, videoOpen, inView]);

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
        height: { xs: "auto", md: "100vh" },
        "@supports (height: 100svh)": { height: { xs: "auto", md: "100svh" } },
        minHeight: { xs: 0, md: 640 },
        px: { xs: 1.5, md: 0 }, pt: { xs: 1.5, md: 0 }, pb: { xs: 2, md: 0 },
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
          gridTemplateRows: { xs: "minmax(535px, 73svh) auto", md: "minmax(0, 1fr)" },
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
            borderRadius: { xs: "26px", md: "0px" },
            isolation: "isolate",
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
              px: { xs: 2.5, md: 5 },
              py: { xs: 2.5, md: 3 },
              color: headerColor,
            }}
          >
            <Box
              component="a"
              href="/"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: { xs: 1.25, md: 1.75 },
                color: "inherit",
                textDecoration: "none",
                borderRadius: 1,
                "&:focus-visible": {
                  outline: `2px solid ${T.accentOnImage}`,
                  outlineOffset: 6,
                },
              }}
            >
              <Box
                component="span"
                aria-hidden="true"
                sx={{
                  width: { xs: 36, md: 52 },
                  height: { xs: 36, md: 52 },
                  flexShrink: 0,
                  bgcolor: HEADER_TONE === "light" ? T.accentOnImage : T.text,
                  // Match the palette using the transparent logo as a mask.
                  // Compensate for the PNG's empty margins within the mask.
                  maskImage: 'url("/logo.png")',
                  maskMode: "alpha",
                  maskSize: "148%",
                  maskPosition: "center",
                  maskRepeat: "no-repeat",
                  WebkitMaskImage: 'url("/logo.png")',
                  WebkitMaskSize: "148%",
                  WebkitMaskPosition: "center",
                  WebkitMaskRepeat: "no-repeat",
                }}
              />
              <Typography
                component="span"
                sx={{
                  fontSize: { xs: "0.8rem", md: "1.1rem" },
                  fontWeight: 800,
                  lineHeight: 1.8,
                  color: "inherit",
                }}
              >
                {BRAND}
              </Typography>
            </Box>
            <Box
              component="button"
              type="button"
              aria-label="منو"
              onClick={onMenuClick}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.25,
                px: { xs: 1.5, md: 2 },
                py: { xs: 1, md: 1.25 },
                minHeight: 44,
                border: "1px solid rgba(255,255,255,.42)",
                borderRadius: "999px",
                bgcolor: "rgba(12,20,16,.15)",
                backdropFilter: "blur(14px)",
                color: "inherit",
                cursor: "pointer",
                "&:focus-visible": {
                  outline: "2px solid currentColor",
                  borderRadius: 1,
                },
              }}
            >
              <Typography component="span" sx={{ fontSize: ".75rem", fontWeight: 700, color: "inherit" }}>فهرست</Typography>
              <Box sx={{ display: "grid", gap: "5px" }} aria-hidden="true">
                {[0, 1].map((i) => (
                  <Box key={i} component="span" sx={{ width: 18, height: 1.5, borderRadius: 2, bgcolor: "currentColor" }} />
                ))}
              </Box>
            </Box>
          </Box>

          {/* Title (+ optional paragraph) anchored to the bottom of the image */}
          <Box
            ref={textRef}
            sx={{
              position: "absolute",
              zIndex: 5,
              bottom: { xs: 30, md: 48 },
              left: { xs: 24, md: "auto" },
              right: { xs: 24, md: 56 },
              width: { md: "min(560px, 46%)" },
              color: "#fff",
            }}
          >
            <Typography data-hero-fade="" component="p" sx={{ color: T.accentOnImage, fontWeight: 800, fontSize: ".73rem", letterSpacing: ".12em", mb: 1.25 }}>
              AVIZHE / MATERIAL SOLUTIONS
            </Typography>
            <Box sx={{ overflow: "hidden", pb: "0.25em" }}>
              <Typography
                component="h1"
                data-hero-title=""
                sx={{
                  fontSize: {
                    xs: "clamp(2rem, 7.3vw, 2.9rem)",
                    md: "clamp(3rem, 4.3vw, 4.6rem)",
                  },
                  fontWeight: 800,
                  letterSpacing: "-.045em",
                  lineHeight: 1.43,
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
                  fontSize: { xs: "0.88rem", md: "1.05rem" },
                  lineHeight: { xs: 2, md: 2.1 },
                  display: "-webkit-box",
                  WebkitBoxOrient: "vertical",
                  WebkitLineClamp: { xs: 2, md: 3 },
                  overflow: "hidden",
                }}
              >
                {currentSlide.description}
              </Typography>
            )}

            <Box data-hero-fade="" sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1.5, mt: { xs: 3.5, md: 4 } }}>
              <Box component="a" href="#products" sx={{ display: "inline-flex", alignItems: "center", gap: 1.5, minHeight: 46, px: 2.25, borderRadius: 99, bgcolor: T.accent, color: "#1c2622", fontWeight: 800, fontSize: ".87rem", textDecoration: "none", boxShadow: "0 10px 26px rgba(0,0,0,.13)", transition: "transform .25s ease", "&:active": { transform: "scale(.96)" }, "&:hover": { transform: "translateY(-3px)" } }}>
                کشف محصولات <Box component="span" aria-hidden="true" sx={{ fontSize: "1.2rem" }}>←</Box>
              </Box>
              <Typography component="span" sx={{ color: "rgba(255,255,255,.88)", fontSize: ".78rem", fontWeight: 600, direction: "ltr", fontVariantNumeric: "tabular-nums" }}>
                {String(activeSlide + 1).padStart(2, "0")} / {String(N).padStart(2, "0")}
              </Typography>
            </Box>

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
          <Box sx={{ display: { xs: "flex", md: "none" }, alignItems: "center", justifyContent: "space-between", px: 1, mb: .75 }}>
            <Typography sx={{ fontSize: ".76rem", fontWeight: 800, color: T.text }}>در مسیر آویژه</Typography>
            <Typography sx={{ fontSize: ".72rem", color: T.muted }}>برای تغییر، لمس یا سوایپ کنید ←</Typography>
          </Box>
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
                    borderRadius: { xs: "16px", md: "22px" },
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
                  <Box aria-hidden="true" sx={{ position: "absolute", inset: "45% 0 0", background: "linear-gradient(to top,rgba(0,0,0,.7),transparent)" }} />
                  <Typography component="span" sx={{ position: "absolute", bottom: 9, right: 10, left: 6, fontSize: { xs: ".67rem", md: ".76rem" }, fontWeight: 800, color: "#fff", textAlign: "right", textShadow: "0 1px 8px rgba(0,0,0,.4)" }}>{slide.name}</Typography>
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
