import { useRef } from "react";
import { Box, Typography } from "@mui/material";
import { useReveal } from "../../shared/useReveal";
import { LineFrame } from "../../shared/ui/LineFrame";
import { SectionLabel, SectionTitle } from "../../shared/ui/Reveal";
import { T, WRAP } from "../../shared/theme";
import { NEWS } from "../../data/news";

const Meta = ({ n }) => (
  <Typography sx={{ color: T.accentDark, fontSize: "0.85rem", fontWeight: 600 }}>
    {n.kind} · {n.date}
  </Typography>
);

export function NewsSection() {
  const rootRef = useRef(null);
  useReveal(rootRef);
  const [featured, ...rest] = NEWS;

  return (
    <Box
      ref={rootRef}
      component="section"
      id="news"
      dir="rtl"
      aria-labelledby="news-title"
      sx={{ bgcolor: T.bgAlt, color: T.text, py: { xs: 9, md: 16 }, overflow: "hidden" }}
    >
      <Box sx={WRAP}>
        <Box sx={{ maxWidth: 640, mb: { xs: 6, md: 10 } }}>
          <SectionLabel>اخبار و مقالات</SectionLabel>
          <SectionTitle id="news-title">آخرین اخبار و مقالات</SectionTitle>
        </Box>

        <Box
          sx={{
            display: "grid",
            gap: { xs: 6, md: 9 },
            gridTemplateColumns: { md: "7fr 5fr" },
            px: { xs: 1.5, md: 0 },
          }}
        >
          {/* featured */}
          <Box
            component="a"
            href={featured.href}
            data-reveal=""
            sx={{
              color: "inherit",
              textDecoration: "none",
              "&:hover .n-img": { transform: "scale(1.04)" },
              "&:focus-visible": { outline: `2px solid ${T.accent}`, outlineOffset: 10 },
            }}
          >
            <LineFrame offset={12}>
              <Box sx={{ aspectRatio: "16 / 11", overflow: "hidden", bgcolor: T.frame }}>
                <Box
                  className="n-img"
                  component="img"
                  src={featured.image}
                  alt=""
                  loading="lazy"
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                    transition: "transform 1.1s cubic-bezier(.2,.7,.2,1)",
                  }}
                />
              </Box>
            </LineFrame>
            <Box sx={{ mt: 4 }}>
              <Meta n={featured} />
              <Typography
                component="h3"
                sx={{ mt: 1, fontSize: { xs: "1.25rem", md: "1.7rem" }, fontWeight: 600, lineHeight: 1.7 }}
              >
                {featured.title}
              </Typography>
              <Typography sx={{ mt: 1.5, color: T.muted, lineHeight: 2 }}>
                {featured.excerpt}
              </Typography>
            </Box>
          </Box>

          {/* list */}
          <Box component="ul" sx={{ listStyle: "none", alignSelf: "start", borderTop: `1px solid ${T.line}` }}>
            {rest.map((n) => (
              <Box component="li" key={n.id} data-reveal="" sx={{ borderBottom: `1px solid ${T.line}` }}>
                <Box
                  component="a"
                  href={n.href}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 3,
                    py: 3.5,
                    color: "inherit",
                    textDecoration: "none",
                    transition: "padding .5s cubic-bezier(.2,.7,.2,1)",
                    "&:hover": { pr: 1.5 },
                    "&:focus-visible": { outline: `2px solid ${T.accent}`, outlineOffset: -2 },
                  }}
                >
                  <Box>
                    <Meta n={n} />
                    <Typography sx={{ mt: 0.75, fontWeight: 600, lineHeight: 1.9, fontSize: "1.05rem" }}>
                      {n.title}
                    </Typography>
                  </Box>
                  <Box aria-hidden="true" sx={{ fontSize: "1.4rem" }}>←</Box>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
