import { useRef } from "react";
import { Box, Typography } from "@mui/material";
import { useReveal } from "../../shared/useReveal";
import { SectionLabel, SectionTitle } from "../../shared/ui/Reveal";
import { T, WRAP } from "../../shared/theme";
import { NEWS } from "../../data/news";

const hasLink = (item) => Boolean(item.href && item.href !== "#");
const Meta = ({ n }) => <Typography sx={{ color: T.accentDark, fontSize: ".8rem", fontWeight: 800 }}>{n.kind} <Box component="span" sx={{ mx: .6, opacity: .6 }}>·</Box> {n.date}</Typography>;

export function NewsSection() {
  const rootRef = useRef(null);
  useReveal(rootRef);
  const [featured, ...rest] = NEWS;
  return (
    <Box ref={rootRef} component="section" id="news" dir="rtl" aria-labelledby="news-title"
      sx={{ bgcolor: T.bgAlt, color: T.text, py: { xs: 9, md: 16 }, overflow: "hidden" }}>
      <Box sx={WRAP}>
        <Box sx={{ maxWidth: 700, mb: { xs: 5, md: 10 } }}>
          <SectionLabel>از دنیای آویژه</SectionLabel>
          <SectionTitle id="news-title">تازه‌ها، تجربه‌ها و نگاه ما.</SectionTitle>
        </Box>
        <Box sx={{ display: "grid", gap: { xs: 4, md: 9 }, gridTemplateColumns: { md: "7fr 5fr" }, alignItems: "start" }}>
          <Box component={hasLink(featured) ? "a" : "article"}
            {...(hasLink(featured) ? { href: featured.href } : {})} data-reveal=""
            sx={{ color: "inherit", textDecoration: "none", display: "block", "&:hover .news-image": { transform: hasLink(featured) ? "scale(1.05)" : "none" } }}>
            <Box sx={{ position: "relative", borderRadius: { xs: "24px", md: "30px" }, overflow: "hidden", aspectRatio: { xs: "4 / 3.6", md: "16 / 11" }, bgcolor: T.frame }}>
              <Box className="news-image" component="img" src={featured.image} alt="" loading="lazy"
                sx={{ width: "100%", height: "100%", display: "block", objectFit: "cover", transition: `transform 1s ${T.ease}` }} />
              <Box sx={{ position: "absolute", top: 20, right: 20, px: 1.75, py: .8, borderRadius: 99, bgcolor: "rgba(251,250,247,.95)", fontWeight: 800, fontSize: ".75rem" }}>{featured.kind}</Box>
              <Box sx={{ position: "absolute", inset: "55% 0 0", background: "linear-gradient(to top,rgba(15,27,19,.62),transparent)", pointerEvents: "none" }} />
              <Typography sx={{ position: "absolute", bottom: 20, left: 22, color: "white", fontSize: ".78rem", fontWeight: 800, letterSpacing: ".08em" }}>AVIZHE JOURNAL / 01</Typography>
            </Box>
            <Box sx={{ pt: { xs: 2.5, md: 3.5 } }}>
              <Meta n={featured} />
              <Typography component="h3" sx={{ mt: 1.2, fontSize: { xs: "1.3rem", md: "1.95rem" }, fontWeight: 800, lineHeight: 1.7 }}>{featured.title}</Typography>
              <Typography sx={{ mt: 1.25, fontSize: ".92rem", color: T.muted, lineHeight: 2 }}>{featured.excerpt}</Typography>
              {!hasLink(featured) && <Typography sx={{ mt: 1.5, fontSize: ".79rem", color: T.accentDark, fontWeight: 700 }}>متن کامل به‌زودی منتشر می‌شود</Typography>}
            </Box>
          </Box>
          <Box component="ul" sx={{ listStyle: "none", display: "grid", gap: { xs: 1.5, md: 0 }, borderTop: { md: `1px solid ${T.line}` } }}>
            {rest.map((n, i) => (
              <Box component="li" key={n.id} data-reveal="" sx={{ borderBottom: { md: `1px solid ${T.line}` } }}>
                <Box component={hasLink(n) ? "a" : "article"} {...(hasLink(n) ? { href: n.href } : {})}
                  sx={{ display: "flex", alignItems: "center", gap: 2.5, py: { xs: 2.25, md: 4 }, px: { xs: 2, md: 0 }, bgcolor: { xs: "rgba(255,255,255,.62)", md: "transparent" }, border: { xs: `1px solid ${T.line}`, md: 0 }, borderRadius: { xs: "19px", md: 0 }, textDecoration: "none", color: "inherit", transition: "background-color .3s", "&:hover": hasLink(n) ? { bgcolor: "rgba(255,255,255,.75)" } : {} }}>
                  <Typography component="span" sx={{ fontSize: ".9rem", color: T.accentDark, fontWeight: 900, alignSelf: "flex-start", pt: .5, direction: "ltr" }}>{String(i+2).padStart(2,"0")}</Typography>
                  <Box sx={{ flex: 1 }}>
                    <Meta n={n} />
                    <Typography component="h3" sx={{ fontSize: { xs: ".95rem", md: "1.15rem" }, fontWeight: 800, lineHeight: 1.9, mt: .7 }}>{n.title}</Typography>
                    {!hasLink(n) && <Typography sx={{ fontSize: ".71rem", color: T.muted, mt: 1 }}>به‌زودی</Typography>}
                  </Box>
                  {hasLink(n) && <Box aria-hidden="true" sx={{ fontSize: "1.5rem", color: T.accentDark }}>←</Box>}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
