import { useEffect, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { Box, Button, Typography, useMediaQuery } from "@mui/material";

/* ---------- Content (متن‌ها نمونه‌اند؛ با متن واقعی شرکت جایگزین کنید) ---------- */
const COMPANY = "پویا شیمی آویژه";
const LEAD = "شریک شما در تأمین مواد اولیه شیمیایی صنعتی";
const PARAGRAPHS = [
  "پویا شیمی آویژه با تمرکز بر تأمین مواد اولیه شیمیایی، از جمله پراکسیدها و رزین‌ها، در کنار تولیدکنندگان صنعتی است. هدف ما این است که انتخاب مواد اولیه برای شما ساده‌تر و آگاهانه‌تر شود.",
  "محصول مناسب را بر اساس کاربرد و شرایط فرایند تولید شما بررسی می‌کنیم و مسیر تأمین را از انتخاب تا تحویل همراهی می‌کنیم.",
];
const FOCUS = [
  { title: "پراکسیدها", text: "انتخاب متناسب با کاربرد و شرایط فرایند" },
  { title: "رزین‌ها", text: "رزین مناسب ایده و نیاز تولید شما" },
  { title: "تأمین صنعتی", text: "همراهی در مسیر تأمین، از انتخاب تا تحویل" },
];
const IMAGE = "/media/hero/industry.webp";

/* ---------- Tokens ---------- */
const C = {
  bg: "#eef1f3",
  text: "#14202b",
  muted: "#4b5a67",
  line: "rgba(20,32,43,.16)",
};

const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export function IntroduceSection({ ctaHref = "#products" }) {
  const rootRef = useRef(null);
  const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  // One reveal, played once when the section scrolls into view.
  useIsoLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || reduceMotion) return;

    const ctx = gsap.context(() => {
      gsap.set("[data-i-title]", { yPercent: 110 });
      gsap.set("[data-i-fade]", { opacity: 0, y: 20 });
      gsap.set("[data-i-frame]", { clipPath: "inset(100% 0% 0% 0%)" });
      gsap.set("[data-i-img]", { scale: 1.2 });
    }, root);

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        ctx.add(() => {
          gsap
            .timeline({ defaults: { ease: "power4.out" } })
            .to(
              "[data-i-frame]",
              { clipPath: "inset(0% 0% 0% 0%)", duration: 1.2, ease: "power3.inOut" },
              0,
            )
            .to("[data-i-img]", { scale: 1, duration: 1.6 }, 0)
            .to("[data-i-title]", { yPercent: 0, duration: 0.9 }, 0.15)
            .to(
              "[data-i-fade]",
              { opacity: 1, y: 0, duration: 0.8, stagger: 0.09 },
              0.4,
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
        bgcolor: C.bg,
        color: C.text,
        py: { xs: 8, md: 14 },
        px: { xs: 3, md: 6 },
      }}
    >
      <Box
        sx={{
          maxWidth: 1200,
          mx: "auto",
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "6fr 5fr" },
          gap: { xs: 6, md: 10 },
          alignItems: "center",
        }}
      >
        {/* Text (right side in RTL) */}
        <Box>
          <Box sx={{ overflow: "hidden", pb: "0.2em" }}>
            <Typography
              id="about-title"
              component="h2"
              variant="h3"
              data-i-title=""
              sx={{ fontWeight: 800, lineHeight: 1.35, willChange: "transform" }}
            >
              {COMPANY}
            </Typography>
          </Box>

          <Typography
            data-i-fade=""
            variant="h6"
            sx={{ mt: 2, fontWeight: 500, color: C.text }}
          >
            {LEAD}
          </Typography>

          <Box sx={{ mt: 3, maxWidth: 560 }}>
            {PARAGRAPHS.map((p) => (
              <Typography
                key={p}
                data-i-fade=""
                sx={{ color: C.muted, lineHeight: 2.1, mb: 2 }}
              >
                {p}
              </Typography>
            ))}
          </Box>

          <Box
            component="ul"
            sx={{
              listStyle: "none",
              m: 0,
              mt: 4,
              p: 0,
              maxWidth: 560,
            }}
          >
            {FOCUS.map((item) => (
              <Box
                key={item.title}
                component="li"
                data-i-fade=""
                sx={{
                  display: "flex",
                  alignItems: "baseline",
                  justifyContent: "space-between",
                  gap: 3,
                  py: 1.75,
                  borderTop: `1px solid ${C.line}`,
                  "&:last-of-type": { borderBottom: `1px solid ${C.line}` },
                }}
              >
                <Typography sx={{ fontWeight: 700, flexShrink: 0 }}>
                  {item.title}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: C.muted, textAlign: "left" }}
                >
                  {item.text}
                </Typography>
              </Box>
            ))}
          </Box>

          <Button
            data-i-fade=""
            href={ctaHref}
            variant="outlined"
            sx={{
              mt: 4,
              px: 3,
              py: 1,
              color: C.text,
              borderColor: C.text,
              borderRadius: "999px",
              "&:hover": { bgcolor: C.text, color: "#fff", borderColor: C.text },
              "&:focus-visible": { outline: `2px solid ${C.text}`, outlineOffset: 3 },
            }}
          >
            آشنایی با محصولات
          </Button>
        </Box>

        {/* Image (left side in RTL) */}
        <Box
          data-i-frame=""
          sx={{
            overflow: "hidden",
            borderRadius: "24px",
            aspectRatio: { xs: "4 / 3", md: "4 / 5" },
            bgcolor: "rgba(20,32,43,.08)",
          }}
        >
          <Box
            component="img"
            data-i-img=""
            src={IMAGE}
            alt=""
            loading="lazy"
            sx={{
              display: "block",
              width: "100%",
              height: "100%",
              objectFit: "cover",
              willChange: "transform",
            }}
          />
        </Box>
      </Box>
    </Box>
  );
}
