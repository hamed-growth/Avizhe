import { useRef } from "react";
import { Box, Typography } from "@mui/material";
import { Navigate, useParams, useSearchParams } from "react-router-dom";
import { gsap, useGSAP, prefersReducedMotion } from "../shared/gsap";
import { InnerHeader } from "../shared/ui/InnerHeader";
import { LineFrame } from "../shared/ui/LineFrame";
import { SectionLabel } from "../shared/ui/Reveal";
import { FooterSection } from "../sections/footer/footer";
import { T, WRAP, fa } from "../shared/theme";
import { getCategory } from "../data/products";

function Detail({ product, categoryImage }) {
  const ref = useRef(null);

  // Cross-fade the content every time another grade is selected.
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.fromTo(
        "[data-d]",
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.65, ease: "power3.out", stagger: 0.07 },
      );
    },
    { scope: ref, dependencies: [product.id], revertOnUpdate: true },
  );

  const List = ({ title, items }) => (
    <Box data-d="">
      <Typography sx={{ color: T.accentDark, fontWeight: 600, mb: 1.5 }}>{title}</Typography>
      <Box component="ul" sx={{ listStyle: "none", display: "grid", gap: 1 }}>
        {items.map((it) => (
          <Box component="li" key={it} sx={{ display: "flex", gap: 1.5, lineHeight: 1.9 }}>
            <Box component="span" aria-hidden="true" sx={{ mt: "0.95em", width: 14, height: "1.5px", bgcolor: T.accent, flexShrink: 0 }} />
            {it}
          </Box>
        ))}
      </Box>
    </Box>
  );

  return (
    <Box ref={ref} sx={{ minWidth: 0 }}>
      <Box data-d="" sx={{ display: "flex", alignItems: "baseline", gap: 2, flexWrap: "wrap" }}>
        <Typography component="h2" sx={{ fontSize: { xs: "1.6rem", md: "2.4rem" }, fontWeight: 600, lineHeight: 1.6 }}>
          {product.name}
        </Typography>
        <Typography sx={{ color: T.accentDark, fontWeight: 600, direction: "ltr" }}>{product.code}</Typography>
      </Box>
      <Typography data-d="" sx={{ mt: 1, color: T.muted }}>
        نوع: {product.type}
      </Typography>
      <Typography data-d="" sx={{ mt: 3, color: T.muted, lineHeight: 2.1, maxWidth: 640 }}>
        {product.summary}
      </Typography>

      {product.image && (
        <Box data-d="" component="img" src={product.image} alt={product.name} sx={{ mt: 4, maxWidth: 360, width: "100%", display: "block" }} />
      )}

      <Box sx={{ mt: 5, display: "grid", gap: 5, gridTemplateColumns: { sm: "1fr 1fr" } }}>
        <List title="ویژگی‌ها" items={product.features} />
        <List title="کاربردها" items={product.uses} />
      </Box>

      <Box data-d="" sx={{ mt: 6 }}>
        <Typography sx={{ color: T.accentDark, fontWeight: 600, mb: 1 }}>مشخصات فنی</Typography>
        <Box component="dl" sx={{ borderTop: `1px solid ${T.line}` }}>
          {product.specs.map((s) => (
            <Box
              key={s.label}
              sx={{ display: "flex", justifyContent: "space-between", gap: 2, py: 1.75, borderBottom: `1px solid ${T.line}` }}
            >
              <Box component="dt" sx={{ color: T.muted }}>{s.label}</Box>
              <Box component="dd" sx={{ fontWeight: 600 }}>{s.value}</Box>
            </Box>
          ))}
        </Box>
      </Box>

      <Box
        data-d=""
        component="a"
        href="/#contact"
        sx={{
          mt: 6,
          display: "inline-block",
          px: 4,
          py: 1.5,
          bgcolor: T.text,
          color: T.bg,
          textDecoration: "none",
          fontWeight: 600,
          transition: "background-color .3s",
          "&:hover": { bgcolor: T.accentDark },
          "&:focus-visible": { outline: `2px solid ${T.accent}`, outlineOffset: 3 },
        }}
      >
        درخواست مشاوره و قیمت
      </Box>
    </Box>
  );
}

export default function ProductPage() {
  const { category } = useParams();
  const cat = getCategory(category);
  const [params, setParams] = useSearchParams();
  const rootRef = useRef(null);

  if (!cat) return <Navigate to="/" replace />;

  const product = cat.products.find((p) => p.id === params.get("grade")) || cat.products[0];
  const many = cat.products.length > 1;

  return (
    <Box ref={rootRef} dir="rtl" sx={{ bgcolor: T.bg, color: T.text, minHeight: "100dvh" }}>
      <InnerHeader backTo="/#products" backLabel="همه‌ی محصولات" />

      <Box
        sx={{
          ...WRAP,
          py: { xs: 6, md: 10 },
          display: "grid",
          gap: { xs: 6, md: 10 },
          gridTemplateColumns: { md: "1fr 340px" },
          alignItems: "center",
        }}
      >
        <Box>
          <SectionLabel>{cat.latin}</SectionLabel>
          <Typography component="h1" sx={{ fontSize: { xs: "2rem", md: "3.4rem" }, fontWeight: 600, lineHeight: 1.5 }}>
            {cat.name}
          </Typography>
          <Typography sx={{ mt: 2.5, color: T.muted, lineHeight: 2.1, maxWidth: 620 }}>
            {cat.description}
          </Typography>
        </Box>
        <LineFrame sx={{ mx: { xs: 1.5, md: 0 } }} offset={12}>
          <Box
            component="img"
            src={cat.image}
            alt=""
            sx={{ width: "100%", aspectRatio: { xs: "16 / 10", md: "4 / 5" }, objectFit: "cover", display: "block" }}
          />
        </LineFrame>
      </Box>

      <Box sx={{ bgcolor: T.bgAlt, py: { xs: 6, md: 10 } }}>
        <Box
          sx={{
            ...WRAP,
            display: "grid",
            gap: { xs: 4, md: 8 },
            gridTemplateColumns: many ? { md: "260px 1fr" } : "1fr",
            alignItems: "start",
          }}
        >
          {many && (
            <Box
              component="nav"
              aria-label="گریدهای محصول"
              sx={{
                position: { md: "sticky" },
                top: { md: 96 },
                display: { xs: "flex", md: "block" },
                gap: 1,
                overflowX: { xs: "auto", md: "visible" },
                pb: { xs: 1, md: 0 },
                borderTop: { md: `1px solid ${T.line}` },
              }}
            >
              {cat.products.map((p, i) => {
                const on = p.id === product.id;
                return (
                  <Box
                    key={p.id}
                    component="button"
                    type="button"
                    onClick={() => setParams({ grade: p.id }, { replace: true, preventScrollReset: true })}
                    aria-current={on ? "true" : undefined}
                    sx={{
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      width: { md: "100%" },
                      textAlign: "right",
                      font: "inherit",
                      fontSize: "0.95rem",
                      px: { xs: 2, md: 0 },
                      py: { xs: 1, md: 1.5 },
                      border: { xs: `1px solid ${on ? T.text : T.line}`, md: 0 },
                      borderBottom: { md: `1px solid ${T.line}` },
                      borderRadius: { xs: 99, md: 0 },
                      bgcolor: { xs: on ? T.text : "transparent", md: "transparent" },
                      color: { xs: on ? T.bg : T.text, md: on ? T.accentDark : T.text },
                      fontWeight: on ? 700 : 400,
                      cursor: "pointer",
                      transition: "color .3s, padding .4s",
                      "&:hover": { pr: { md: 1 } },
                      "&:focus-visible": { outline: `2px solid ${T.accent}`, outlineOffset: 2 },
                    }}
                  >
                    <Box component="span" sx={{ display: { xs: "none", md: "inline" }, color: T.accentDark, fontSize: "0.8rem", minWidth: 22 }}>
                      {fa(String(i + 1).padStart(2, "0"))}
                    </Box>
                    <Box component="span" sx={{ whiteSpace: "nowrap", direction: "ltr" }}>{p.code}</Box>
                    <Box component="span" sx={{ display: { xs: "none", md: "inline" }, color: T.muted, fontWeight: 400, fontSize: "0.85rem" }}>
                      {p.type}
                    </Box>
                  </Box>
                );
              })}
            </Box>
          )}

          <Detail product={product} categoryImage={cat.image} />
        </Box>
      </Box>

      <FooterSection />
    </Box>
  );
}
