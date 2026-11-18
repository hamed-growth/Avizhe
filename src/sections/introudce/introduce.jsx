import { useEffect, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { Box, Typography, useMediaQuery } from "@mui/material";

const COMPANY = "پویا شیمی آویژه";
const DESCRIPTION =
  "پویا شیمی آویژه با تمرکز بر تأمین مواد اولیه شیمیایی، از جمله پراکسیدها و رزین‌ها، در کنار تولیدکنندگان صنعتی است. هدف ما این است که انتخاب مواد اولیه برای شما ساده‌تر و آگاهانه‌تر شود.";

const C = {
  bg: "#faf8f6",
  text: "#3a2a1f",
  muted: "#5d4d41",
};

const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export function IntroduceSection() {
  const rootRef = useRef(null);
  const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  useIsoLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || reduceMotion) return;

    const ctx = gsap.context(() => {
      gsap.set("[data-i-title]", { yPercent: 110 });
      gsap.set("[data-i-fade]", { opacity: 0, y: 20 });
    }, root);

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        ctx.add(() => {
          gsap
            .timeline({ defaults: { ease: "power4.out" } })
            .to("[data-i-title]", { yPercent: 0, duration: 0.9 })
            .to(
              "[data-i-fade]",
              { opacity: 1, y: 0, duration: 0.8 },
              0.2,
            );
        });
      },
      { threshold: 0, rootMargin: "0px 0px -10% 0px" },
    );
    io.observe(root);

    return () => {
      io.disconnect();
      ctx.revert();
    };
  }, [reduceMotion]);

  return (
    <Box
      ref={rootRef}
      component="section"
      id="about"
      dir="rtl"
      aria-labelledby="about-title"
      sx={{
        height: "100dvh",
        bgcolor: C.bg,
        color: C.text,
        py: { xs: 8, md: 14 },
        px: { xs: 3, md: 6 },
      }}
    >
      <Box sx={{ maxWidth: 1168, mx: "auto" }}>
        <Box sx={{ overflow: "hidden", pb: "0.2em" }}>
          <Typography
            id="about-title"
            component="h2"
            data-i-title=""
            sx={{
              fontSize: { xs: "1.8rem", md: "3rem" },
              fontWeight: 600,
              lineHeight: 1.5,
            }}
          >
            {COMPANY}
          </Typography>
        </Box>
        <Typography
          data-i-fade=""
          sx={{
            mt: 2.5,
            maxWidth: 680,
            color: C.muted,
            fontSize: { xs: "0.95rem", md: "1.05rem" },
            lineHeight: 2.1,
          }}
        >
          {DESCRIPTION}
        </Typography>
      </Box>
    </Box>
  );
}
