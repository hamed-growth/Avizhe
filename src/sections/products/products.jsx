import { useCallback, useEffect, useRef, useState } from "react";
import { Box, Typography } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { useReveal } from "../../shared/useReveal";
import { LineFrame } from "../../shared/ui/LineFrame";
import { SectionLabel, SectionTitle } from "../../shared/ui/Reveal";
import { T, WRAP, fa } from "../../shared/theme";
import { CATEGORIES, getCategory } from "../../data/products";
import { ProductExplorer } from "./ProductExplorer";

const HASH_RE = /^#products\/([\w-]+)$/;

function ProductCard({ cat, index, onOpen }) {
  const count = cat.products.length;
  return (
    <Box
      component="a"
      href={`/#products/${cat.slug}`}
      onClick={(e) => {
        e.preventDefault();
        onOpen(cat.slug, e.currentTarget.querySelector("[data-card-img]"));
      }}
      data-reveal=""
      data-delay={index * 0.15}
      aria-label={cat.name}
      sx={{
        display: "block",
        color: "inherit",
        textDecoration: "none",
        // second card sits lower on desktop: a calm, editorial rhythm
        mt: { md: index === 1 ? 10 : 0 },
        "&:hover .p-img": { transform: "scale(1.05)" },
        "&:hover .p-arrow": { bgcolor: T.text, color: T.bg, transform: "rotate(-45deg)" },
        "&:focus-visible": { outline: `2px solid ${T.accent}`, outlineOffset: 10 },
      }}
    >
      <LineFrame flip={index === 1} offset={14}>
        <Box
          sx={{
            position: "relative",
            aspectRatio: { xs: "4 / 4.6", md: "4 / 5" },
            overflow: "hidden",
            bgcolor: T.frame,
          }}
        >
          <Box
            className="p-img"
            data-card-img={cat.slug}
            component="img"
            src={cat.image}
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

      <Box
        sx={{
          mt: 4,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Box>
          <Typography
            component="h3"
            sx={{ fontSize: { xs: "1.3rem", md: "1.7rem" }, fontWeight: 600, lineHeight: 1.6 }}
          >
            {cat.name}
          </Typography>
          <Typography
            sx={{ mt: 0.5, color: T.muted, fontSize: "0.9rem", direction: "ltr", textAlign: "right" }}
          >
            {cat.latin}
          </Typography>
          <Typography sx={{ mt: 1.5, color: T.accentDark, fontSize: "0.9rem", fontWeight: 600 }}>
            {count === 1 ? "یک محصول" : `${fa(count)} گرید`}
          </Typography>
        </Box>
        <Box
          className="p-arrow"
          aria-hidden="true"
          sx={{
            width: 52,
            height: 52,
            flexShrink: 0,
            display: "grid",
            placeItems: "center",
            border: `1.5px solid ${T.text}`,
            borderRadius: "50%",
            fontSize: "1.3rem",
            transition: "all .5s cubic-bezier(.2,.7,.2,1)",
          }}
        >
          ←
        </Box>
      </Box>
    </Box>
  );
}

export function ProductsSection() {
  const rootRef = useRef(null);
  useReveal(rootRef);

  const { hash } = useLocation();
  const navigate = useNavigate();
  const hashSlug = HASH_RE.exec(hash)?.[1] ?? null;
  const [shown, setShown] = useState(null); // slug currently rendered in the explorer
  const originRef = useRef(null); // card image rect, for the expand animation
  const pushedRef = useRef(false); // did we push a history entry (so Back can close)?
  const closingRef = useRef(false);

  // The URL is the source of truth: "/#products/resins" opens, anything else closes.
  useEffect(() => {
    if (hashSlug && getCategory(hashSlug) && !closingRef.current) setShown(hashSlug);
    if (!hashSlug) {
      closingRef.current = false;
      setShown(null);
    }
  }, [hashSlug]);

  const open = useCallback(
    (slug, imgEl) => {
      if (imgEl) {
        const r = imgEl.getBoundingClientRect();
        originRef.current = { slug, left: r.left, top: r.top, width: r.width, height: r.height, src: imgEl.currentSrc || imgEl.src };
      }
      pushedRef.current = true;
      navigate({ hash: `#products/${slug}` }, { preventScrollReset: true });
    },
    [navigate],
  );

  const onExited = useCallback(
    (after) => {
      closingRef.current = true;
      setShown(null);
      originRef.current = null;
      if (pushedRef.current) navigate(-1);
      else navigate({ pathname: "/", hash: "#products" }, { replace: true, preventScrollReset: true });
      pushedRef.current = false;
      after?.();
    },
    [navigate],
  );

  const cat = shown ? getCategory(shown) : null;
  const origin = originRef.current?.slug === shown ? originRef.current : null;

  return (
    <Box
      ref={rootRef}
      component="section"
      id="products"
      dir="rtl"
      aria-labelledby="products-title"
      sx={{ bgcolor: T.bgAlt, color: T.text, py: { xs: 9, md: 16 }, overflow: "hidden" }}
    >
      <Box sx={WRAP}>
        <Box sx={{ maxWidth: 640, mb: { xs: 7, md: 12 } }}>
          <SectionLabel>محصولات</SectionLabel>
          <SectionTitle id="products-title">دو خانواده محصول، یک مسیر تأمین</SectionTitle>
          <Typography
            data-reveal=""
            sx={{ mt: 2.5, color: T.muted, lineHeight: 2.1, fontSize: { xs: "0.95rem", md: "1.05rem" } }}
          >
            روی هر محصول کلیک کنید تا گریدها، ویژگی‌ها و کاربردها در همین‌جا باز شود.
          </Typography>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { md: "1fr 1fr" },
            gap: { xs: 8, md: 10 },
            px: { xs: 1.5, md: 0 }, // room for the outside line-frame on small screens
          }}
        >
          {CATEGORIES.map((c, i) => (
            <ProductCard key={c.slug} cat={c} index={i} onOpen={open} />
          ))}
        </Box>
      </Box>

      {cat && <ProductExplorer key={cat.slug} cat={cat} origin={origin} onExited={onExited} />}
    </Box>
  );
}
