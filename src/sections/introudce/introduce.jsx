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
  const [playing, setPlaying] = useState(false);
  const userPaused = useRef(false);

  useReveal(rootRef);

  // The video starts as an inset rounded card and opens to the full width while scrolling.
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const mobile = window.matchMedia("(max-width: 899px)").matches;
      const st = {
        trigger: wrapRef.current,
        start: "top 92%",
        end: "top 15%",
        scrub: 0.6,
      };
      gsap.fromTo(
        wrapRef.current,
        { clipPath: mobile ? "inset(0% 4% round 28px)" : "inset(0% 9% round 28px)" },
        { clipPath: mobile ? "inset(0% 0% round 28px)" : "inset(0% 0% round 0px)", ease: "none", scrollTrigger: st },
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
      ([e]) => {
        if (e.isIntersecting && !userPaused.current && !prefersReducedMotion()) {
          v.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
        } else { v.pause(); setPlaying(false); }
      },
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
      sx={{ bgcolor: T.bg, color: T.text, pt: { xs: 9, md: 15 }, pb: { xs: 2, md: 0 } }}
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

      <Box data-reveal="" sx={{ ...WRAP, mt: { xs: 5, md: 8 } }}>
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: { xs: 1, md: 2 }, borderTop: `1px solid ${T.line}`, pt: { xs: 2.5, md: 3.5 } }}>
          {["شناخت نیاز", "انتخاب آگاهانه", "مسیر تأمین"].map((step, i) => (
            <Box key={step} sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 1.1 }}>
              <Typography sx={{ fontWeight: 900, fontSize: ".8rem", color: T.accentDark, direction: "ltr" }}>{String(i+1).padStart(2,"0")}</Typography>
              <Typography sx={{ fontSize: { xs: ".78rem", md: "1rem" }, fontWeight: 700, lineHeight: 1.8 }}>{step}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Full-width video */}
      <Box
        ref={wrapRef}
        sx={{
          position: "relative",
          mt: { xs: 6, md: 10 },
          mx: { xs: 1.5, md: 0 },
          width: { xs: "calc(100% - 24px)", md: "100%" },
          height: { xs: "min(120vw, 510px)", md: "min(82vh, 56vw)" },
          minHeight: 320,
          borderRadius: { xs: "28px", md: 0 },
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
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
        <Box sx={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(12,24,18,.58),transparent 55%)", pointerEvents: "none" }} />
        <Box sx={{ position: "absolute", top: { xs: 20, md: 32 }, right: { xs: 20, md: 40 }, color: "white", display: "flex", alignItems: "center", gap: 1, border: "1px solid rgba(255,255,255,.38)", borderRadius: 99, px: 1.75, py: 1, backdropFilter: "blur(9px)" }}>
          <Box component="span" sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: T.accent }} />
          <Typography sx={{ color: "inherit", fontWeight: 700, fontSize: ".76rem" }}>داستان آویژه</Typography>
        </Box>
        <Box sx={{ position: "absolute", bottom: { xs: 82, md: 96 }, right: { xs: 20, md: 40 }, left: 20, color: "#fff", pointerEvents: "none" }}>
          <Typography sx={{ fontSize: { xs: "1.75rem", md: "3rem" }, fontWeight: 800, lineHeight: 1.5, color: "inherit" }}>همراه صنعت، در مسیر ساختن.</Typography>
        </Box>
        <Box component="button" type="button" onClick={() => {
          const v = videoRef.current;
          if (!v) return;
          if (v.paused) { userPaused.current = false; v.play().catch(() => {}); }
          else { userPaused.current = true; v.pause(); }
        }} aria-label={playing ? "توقف ویدیو" : "پخش ویدیو"}
          sx={{ position: "absolute", bottom: { xs: 17, md: 27 }, right: { xs: 17, md: 40 }, minHeight: 44, px: 2, borderRadius: 99, border: "1px solid rgba(255,255,255,.4)", background: "rgba(12,24,18,.42)", backdropFilter: "blur(12px)", color: "white", font: "inherit", fontSize: ".82rem", fontWeight: 700, cursor: "pointer" }}>
          {playing ? "Ⅱ  مکث" : "▶  پخش ویدیو"}
        </Box>
        <Box
          component="button"
          type="button"
          onClick={() => setMuted((m) => !m)}
          aria-label={muted ? "پخش با صدا" : "قطع صدا"}
          sx={{
            position: "absolute",
            bottom: { xs: 17, md: 27 },
            insetInlineStart: { xs: 17, md: 40 },
            minHeight: 44,
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
