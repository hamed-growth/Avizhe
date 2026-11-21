import { useCallback, useEffect, useRef, useState } from "react";
import { Box, Typography } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { useReveal } from "../../shared/useReveal";
import { SectionLabel, SectionTitle } from "../../shared/ui/Reveal";
import { T, WRAP, fa } from "../../shared/theme";
import { CATEGORIES, getCategory } from "../../data/products";
import { ProductExplorer } from "./ProductExplorer";

const HASH_RE = /^#products\/([\w-]+)$/;

function ProductCard({ cat, index, onOpen }) {
  const count = cat.products.length;
  return (
    <Box
      component="a" href={`/#products/${cat.slug}`}
      onClick={(e) => { e.preventDefault(); onOpen(cat.slug, e.currentTarget.querySelector("[data-card-img]")); }}
      data-reveal="" data-delay={index * 0.12} aria-label={`مشاهده ${cat.name}`}
      sx={{
        display: "block", flex: { xs: "0 0 min(78vw, 330px)", md: "initial" },
        minWidth: 0, scrollSnapAlign: "start", color: "inherit", textDecoration: "none",
        mt: { md: index === 1 ? 10 : 0 },
        "&:hover .product-img": { transform: "scale(1.075)" },
        "&:hover .product-arrow": { transform: "translateX(-5px) rotate(-45deg)", bgcolor: T.accent },
        "&:active .product-img": { transform: "scale(1.035)" },
        "&:focus-visible": { outline: `2px solid ${T.accentDark}`, outlineOffset: 5, borderRadius: "26px" },
      }}
    >
      <Box sx={{ position: "relative", overflow: "hidden", bgcolor: T.frame, aspectRatio: { xs: "4 / 4.7", md: "4 / 4.75" }, borderRadius: { xs: "23px", md: "29px" } }}>
        <Box
          data-card-img={cat.slug} className="product-img" component="img" src={cat.image}
          alt="" loading="lazy" sx={{ display: "block", width: "100%", height: "100%", objectFit: "cover", transition: `transform 1s ${T.ease}` }}
        />
        <Box sx={{ position: "absolute", inset: "40% 0 0", background: "linear-gradient(to top,rgba(10,18,14,.72),transparent)" }} />
        <Box sx={{ position: "absolute", right: { xs: 17, md: 24 }, left: { xs: 17, md: 24 }, top: { xs: 17, md: 24 }, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box sx={{ border: "1px solid rgba(255,255,255,.5)", borderRadius: 99, px: 1.5, py: .6, color: "#fff", backdropFilter: "blur(12px)", bgcolor: "rgba(0,0,0,.15)", fontSize: ".72rem", fontWeight: 700 }}>{count === 1 ? "یک محصول" : `${fa(count)} گرید`}</Box>
          <Typography sx={{ color: "rgba(255,255,255,.85)", fontWeight: 800, fontSize: ".85rem" }}>{fa(String(index+1).padStart(2,"0"))}</Typography>
        </Box>
        <Box sx={{ position: "absolute", right: { xs: 19, md: 29 }, left: { xs: 19, md: 29 }, bottom: { xs: 20, md: 31 } }}>
          <Typography component="h3" sx={{ color: "white", fontSize: { xs: "1.45rem", md: "2.2rem" }, lineHeight: 1.5, fontWeight: 800 }}>{cat.name}</Typography>
          <Typography sx={{ mt: .5, direction: "ltr", textAlign: "right", color: "rgba(255,255,255,.76)", fontSize: ".75rem", letterSpacing: ".07em" }}>{cat.latin}</Typography>
        </Box>
      </Box>
      <Box sx={{ pt: { xs: 2, md: 2.5 }, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
        <Typography sx={{ color: T.text, fontWeight: 700, fontSize: { xs: ".92rem", md: "1.05rem" } }}>مشاهده گریدها و کاربردها</Typography>
        <Box className="product-arrow" aria-hidden="true" sx={{ width: 42, height: 42, border: `1px solid ${T.line}`, display: "grid", placeItems: "center", borderRadius: "50%", flexShrink: 0, transition: `all .35s ${T.ease}`, fontSize: "1.3rem" }}>←</Box>
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
      requestAnimationFrame(() => document.querySelector(`[data-card-img="${shown}"]`)?.closest('a')?.focus({ preventScroll: true }));
    },
    [navigate, shown],
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
          <SectionTitle id="products-title">مواد اولیه، برای ایده‌های بزرگ.</SectionTitle>
          <Typography
            data-reveal=""
            sx={{ mt: 2.5, color: T.muted, lineHeight: 2.1, fontSize: { xs: "0.95rem", md: "1.05rem" } }}
          >
            خانواده محصول را انتخاب کنید؛ گریدها، ویژگی‌ها و کاربردها بدون خروج از صفحه در دسترس شماست.
          </Typography>
        </Box>

        <Box sx={{ display: { xs: "flex", md: "none" }, alignItems: "center", justifyContent: "space-between", mb: 2.5 }}>
          <Typography sx={{ fontWeight: 700, fontSize: ".8rem" }}>کاتالوگ تعاملی</Typography>
          <Typography sx={{ color: T.muted, fontSize: ".75rem" }}>برای دیدن بیشتر ورق بزنید ←</Typography>
        </Box>
        <Box
          data-snap-scroll=""
          aria-label="دسته‌بندی محصولات؛ برای جابه‌جایی به طرفین بکشید"
          sx={{
            display: { xs: "flex", md: "grid" },
            gridTemplateColumns: { md: "1fr 1fr" },
            gap: { xs: 2, md: 10 },
            overflowX: { xs: "auto", md: "visible" },
            overflowY: "hidden",
            scrollSnapType: { xs: "x mandatory", md: "none" },
            scrollPaddingInline: { xs: 24, md: 0 },
            overscrollBehaviorX: "contain",
            px: { xs: 3, md: 0 }, mx: { xs: -3, md: 0 },
            pb: { xs: 2.5, md: 0 },
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
