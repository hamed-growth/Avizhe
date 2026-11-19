import { useEffect, useRef, useState } from "react";
import { Box, Typography } from "@mui/material";
import { gsap, useGSAP, prefersReducedMotion } from "../../shared/gsap";
import { useReveal } from "../../shared/useReveal";
import { SectionLabel, SectionTitle } from "../../shared/ui/Reveal";
import { T, WRAP } from "../../shared/theme";

const COMPANY = "پویا شیمی آویژه";
const DESCRIPTION =
  "پویا شیمی آویژه با تمرکز بر تأمین مواد اولیه شیمیایی، از جمله پراکسیدها و رزین‌ها، در کنار تولیدکنندگان صنعتی است. هدف ما این است که انتخاب مواد اولیه برای شما ساده‌تر و آگاهانه‌تر شود.";

// TODO: replace with the real company-introduction video
const VIDEO = "/media/videos/01.mp4";
const POSTER = "/media/posters/01.jpg";

export function IntroduceSection() {
  const rootRef = useRef(null);
  const wrapRef = useRef(null);
  const videoRef = useRef(null);
  const [muted, setMuted] = useState(true);

  useReveal(rootRef);

  // The video starts as an inset rounded card and opens to the full width while scrolling.
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const st = {
        trigger: wrapRef.current,
        start: "top 92%",
        end: "top 15%",
        scrub: 0.6,
      };
      gsap.fromTo(
        wrapRef.current,
        { clipPath: "inset(0% 9% round 28px)" },
        { clipPath: "inset(0% 0% round 0px)", ease: "none", scrollTrigger: st },
      );
      gsap.fromTo(
        videoRef.current,
        { scale: 1.18 },
        { scale: 1, ease: "none", scrollTrigger: st },
      );
    },
    { scope: rootRef },
  );

  // Play only while visible (saves battery/bandwidth, and avoids sound when off-screen).
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const io = new IntersectionObserver(
      ([e]) => (e.isIntersecting ? v.play().catch(() => {}) : v.pause()),
      { threshold: 0.25 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);

  return (
    <Box
      ref={rootRef}
      component="section"
      id="about"
      dir="rtl"
      aria-labelledby="about-title"
      sx={{ bgcolor: T.bg, color: T.text, pt: { xs: 9, md: 15 } }}
    >
      <Box
        sx={{
          ...WRAP,
          display: "grid",
          gap: { xs: 3, md: 10 },
          gridTemplateColumns: { md: "1fr 1fr" },
          alignItems: "end",
        }}
      >
        <Box>
          <SectionLabel>معرفی شرکت</SectionLabel>
          <SectionTitle id="about-title">{COMPANY}</SectionTitle>
        </Box>
        <Typography
          data-reveal=""
          data-delay="0.15"
          sx={{
            color: T.muted,
            fontSize: { xs: "0.95rem", md: "1.05rem" },
            lineHeight: 2.1,
          }}
        >
          {DESCRIPTION}
        </Typography>
      </Box>

      {/* Full-width video */}
      <Box
        ref={wrapRef}
        sx={{
          position: "relative",
          mt: { xs: 6, md: 10 },
          width: "100%",
          height: { xs: "62vw", md: "min(82vh, 56vw)" },
          minHeight: 280,
          overflow: "hidden",
          bgcolor: T.dark,
        }}
      >
        <Box
          ref={videoRef}
          component="video"
          src={VIDEO}
          poster={POSTER}
          muted={muted}
          loop
          playsInline
          preload="metadata"
          aria-label="ویدیوی معرفی شرکت"
          sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
        <Box
          component="button"
          type="button"
          onClick={() => setMuted((m) => !m)}
          aria-label={muted ? "پخش با صدا" : "قطع صدا"}
          sx={{
            position: "absolute",
            bottom: { xs: 14, md: 28 },
            insetInlineStart: { xs: 14, md: 40 },
            px: 2,
            py: 0.75,
            border: "1px solid rgba(255,255,255,.55)",
            borderRadius: 99,
            bgcolor: "rgba(28,18,10,.35)",
            backdropFilter: "blur(8px)",
            color: "#fff",
            font: "inherit",
            fontSize: "0.85rem",
            cursor: "pointer",
            "&:focus-visible": { outline: "2px solid #fff", outlineOffset: 3 },
          }}
        >
          {muted ? "فعال‌کردن صدا" : "قطع صدا"}
        </Box>
      </Box>
    </Box>
  );
}
