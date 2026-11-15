import { useEffect, useRef, useState } from "react";
import { Box, Typography, useMediaQuery } from "@mui/material";

const slides = [
  { name: "صنعت", image: "industry" },
  { name: "پراکسیدها", image: "peroxides" },
  { name: "رزین‌ها", image: "resins" },
  {
    name: "ویدیوی معرفی",
    image: "video",
    video: "/media/videos/hero-preview.mp4",
    poster: "/media/posters/hero-preview.jpg",
  },
];

export function HeroSection() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const videoRef = useRef(null);
  const swipeRef = useRef(null);
  const suppressClickRef = useRef(false);
  const [touching, setTouching] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (slides[activeSlide].video && !reduceMotion) {
      video.play().catch(() => {});
    } else {
      video.pause();
      video.currentTime = 0;
    }
  }, [activeSlide, reduceMotion]);

  useEffect(() => {
    if (paused || touching || reduceMotion) return;
    const timer = window.setTimeout(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 5000);
    return () => window.clearTimeout(timer);
  }, [activeSlide, paused, touching, reduceMotion]);

  return (
    <Box
      sx={{
        backgroundColor: "#c3c3c3",
        height: "100dvh",
        position: "relative",
        overflow: "hidden",
        minHeight: 560,
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
            borderRadius: "3px",
            opacity: activeSlide === index ? 1 : 0,
            pointerEvents: "none",
            transition: reduceMotion ? "none" : "opacity 800ms ease",
          }}
        />
      ))}

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
      ></Box>

      <Box
        sx={{
          position: "absolute",
          bottom: 0,
          color: "white",
          textAlign: "right",
          width: "100%",
          height: "55%",
          p: 3,
          pt: 6,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            mb: 2,
          }}
        >
          بهترین فروش خاورمیانه
        </Typography>
        <Typography
          variant="subtitle2"
          sx={{
            color: "#f6f6f6",
            textAlign: "right",
            pl: { xs: 0, sm: 10 },
          }}
        >
          ما به شما کمک می‌کنیم تا بهترین محصولات را با کیفیت بالا و قیمت مناسب
          پیدا کنید. این تصمیم با شماست که با ماباشید تا خدمات بیشتر دریافت کنید
        </Typography>
        {/* Image Slider */}
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
              setActiveSlide(
                (current) =>
                  (current +
                    (event.key === "ArrowRight" ? 1 : -1) +
                    slides.length) %
                  slides.length,
              );
            }
          }}
          sx={{ mt: { xs: 5, sm: 10 }, ml: "auto", width: "min(100%, 440px)" }}
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
                setActiveSlide(
                  (current) =>
                    (current + (dx < 0 ? 1 : -1) + slides.length) %
                    slides.length,
                );
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
              const offset =
                (index - activeSlide + slides.length) % slides.length;
              const position = offset === slides.length - 1 ? -1 : offset;
              const visible = Math.abs(position) <= 1;
              return (
                <Box
                  key={slide.image}
                  component="button"
                  type="button"
                  aria-label={`نمایش ${slide.name}`}
                  aria-pressed={selected}
                  aria-hidden={!visible}
                  tabIndex={visible ? 0 : -1}
                  onClick={() => setActiveSlide(index)}
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
                    opacity: visible ? (selected ? 1 : 0.65) : 0,
                    visibility: visible ? "visible" : "hidden",
                    pointerEvents: visible ? "auto" : "none",
                    bgcolor: "rgba(255,255,255,.1)",
                    boxShadow: selected ? "0 8px 28px rgba(0,0,0,.2)" : "none",
                    transition: reduceMotion
                      ? "none"
                      : "all 550ms cubic-bezier(.22,1,.36,1)",
                    "&:hover": { opacity: 1 },
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
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              direction: "ltr",
              mt: 1,
            }}
          >
            {slides.map((slide, index) => (
              <Box
                key={slide.image}
                component="button"
                type="button"
                aria-label={`انتخاب ${slide.name}`}
                aria-pressed={activeSlide === index}
                onClick={() => setActiveSlide(index)}
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
                    display: "block",
                    height: 3,
                    borderRadius: 10,
                    width: activeSlide === index ? 21 : 17,
                    bgcolor:
                      activeSlide === index ? "white" : "rgba(255,255,255,.3)",
                    transition: reduceMotion ? "none" : "all 300ms ease",
                  }}
                />
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
