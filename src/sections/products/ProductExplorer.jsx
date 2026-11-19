import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Box, Typography } from "@mui/material";
import { gsap, useGSAP, prefersReducedMotion } from "../../shared/gsap";
import { LineFrame } from "../../shared/ui/LineFrame";
import { T, fa } from "../../shared/theme";
import { CONTACT } from "../../data/contact";

const BG_OPEN = "rgba(250,248,246,1)";
const BG_CLEAR = "rgba(250,248,246,0)";

/**
 * Full-screen product explorer. The card's photo "flies" to the media column
 * (clone technique: a fixed <img> animates from the card rect to the target rect),
 * the page fades to the panel, then the content staggers in. Closing plays it backwards.
 *
 * props: cat      -> category from data/products
 *        origin   -> { left, top, width, height, src } of the clicked card image (or null)
 *        onExited -> called after the exit animation (parent unmounts + fixes the URL)
 */
export function ProductExplorer({ cat, origin, onExited }) {
  const overlayRef = useRef(null);
  const cloneRef = useRef(null);
  const mediaRef = useRef(null);
  const detailRef = useRef(null);
  const closingRef = useRef(false);
  const firstSwap = useRef(true);

  const [gradeId, setGradeId] = useState(cat.products[0].id);
  const idx = Math.max(0, cat.products.findIndex((p) => p.id === gradeId));
  const product = cat.products[idx];
  const many = cat.products.length > 1;
  const mediaSrc = product.image || cat.image;

  /* ---------- enter ---------- */
  useLayoutEffect(() => {
    const overlay = overlayRef.current;
    const clone = cloneRef.current;
    const media = mediaRef.current;
    const ctx = gsap.context(() => {
      if (prefersReducedMotion() || !origin) {
        gsap.set(clone, { display: "none" });
        gsap.from(overlay, { opacity: 0, duration: 0.35 });
        return;
      }
      const t = media.getBoundingClientRect();
      gsap.set(overlay, { backgroundColor: BG_CLEAR });
      gsap.set(media, { opacity: 0 });
      gsap.set(clone, {
        display: "block",
        left: origin.left,
        top: origin.top,
        width: origin.width,
        height: origin.height,
      });
      gsap
        .timeline()
        .to(overlay, { backgroundColor: BG_OPEN, duration: 0.55, ease: "power2.out" }, 0)
        .to(
          clone,
          { left: t.left, top: t.top, width: t.width, height: t.height, duration: 1.05, ease: "power4.inOut" },
          0,
        )
        .set(media, { opacity: 1 })
        .set(clone, { display: "none" })
        .from("[data-x]", { opacity: 0, y: 28, duration: 0.8, ease: "power3.out", stagger: 0.06 }, 0.6);
    }, overlay);
    overlay.querySelector("[data-close]")?.focus({ preventScroll: true });
    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------- exit ---------- */
  const close = useCallback(
    (after) => {
      if (closingRef.current) return;
      closingRef.current = true;
      const overlay = overlayRef.current;
      const finish = () => onExited(after);
      const card = document.querySelector(`[data-card-img="${cat.slug}"]`);
      if (prefersReducedMotion() || !card) {
        gsap.to(overlay, { opacity: 0, duration: 0.3, onComplete: finish });
        return;
      }
      overlay.scrollTo({ top: 0 });
      const media = mediaRef.current;
      const clone = cloneRef.current;
      const t = media.getBoundingClientRect();
      const o = card.getBoundingClientRect();
      clone.src = mediaSrc;
      gsap.set(clone, { display: "block", left: t.left, top: t.top, width: t.width, height: t.height });
      gsap.set(media, { opacity: 0 });
      gsap
        .timeline({ onComplete: finish })
        .to(overlay.querySelectorAll("[data-x]"), { opacity: 0, duration: 0.3, ease: "power2.in" }, 0)
        .to(clone, { left: o.left, top: o.top, width: o.width, height: o.height, duration: 0.9, ease: "power4.inOut" }, 0.1)
        .to(overlay, { backgroundColor: BG_CLEAR, duration: 0.6, ease: "power2.inOut" }, 0.3);
    },
    [cat.slug, mediaSrc, onExited],
  );

  /* ---------- grade switching ---------- */
  const select = useCallback(
    (next, block = "nearest") => {
      const n = (next + cat.products.length) % cat.products.length;
      setGradeId(cat.products[n].id);
      requestAnimationFrame(() =>
        detailRef.current?.scrollIntoView({ behavior: "smooth", block }),
      );
    },
    [cat.products],
  );

  useGSAP(
    () => {
      if (firstSwap.current) {
        firstSwap.current = false;
        return;
      }
      if (prefersReducedMotion()) return;
      gsap.fromTo("[data-d]", { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.65, ease: "power3.out", stagger: 0.07 });
      gsap.fromTo("[data-code]", { opacity: 0, yPercent: 35 }, { opacity: 1, yPercent: 0, duration: 0.7, ease: "power3.out" });
    },
    { scope: overlayRef, dependencies: [product.id] },
  );

  /* ---------- keyboard + scroll lock ---------- */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") close();
      // RTL: ArrowLeft = next, ArrowRight = previous
      if (many && e.key === "ArrowLeft") select(idx + 1);
      if (many && e.key === "ArrowRight") select(idx - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close, select, idx, many]);

  useEffect(() => {
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prev;
    };
  }, []);

  const goContact = () =>
    close(() =>
      setTimeout(() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" }), 250),
    );

  const padX = { xs: 3, md: 7 };

  return (
    <Box
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label={cat.name}
      dir="rtl"
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: 1250,
        bgcolor: T.bg,
        color: T.text,
        overflowY: "auto",
        overscrollBehavior: "contain",
      }}
    >
      {/* flying photo */}
      <Box
        ref={cloneRef}
        component="img"
        src={origin?.src}
        alt=""
        aria-hidden="true"
        sx={{
          display: "none",
          position: "fixed",
          zIndex: 5,
          objectFit: "cover",
          pointerEvents: "none",
        }}
      />

      <Box
        component="button"
        type="button"
        data-close=""
        data-x=""
        onClick={() => close()}
        sx={{
          position: "fixed",
          top: { xs: 14, md: 24 },
          left: { xs: 14, md: 28 },
          zIndex: 6,
          display: "flex",
          alignItems: "center",
          gap: 1,
          px: 2.25,
          py: 1,
          border: `1px solid ${T.line}`,
          borderRadius: 99,
          bgcolor: "rgba(250,248,246,.85)",
          backdropFilter: "blur(10px)",
          color: T.text,
          font: "inherit",
          fontWeight: 600,
          fontSize: "0.9rem",
          cursor: "pointer",
          "&:hover": { bgcolor: T.text, color: T.bg },
          "&:focus-visible": { outline: `2px solid ${T.accent}`, outlineOffset: 3 },
        }}
      >
        بستن <span aria-hidden="true">✕</span>
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: { md: "5fr 7fr" }, minHeight: "100dvh" }}>
        {/* media column */}
        <Box
          sx={{
            position: { xs: "relative", md: "sticky" },
            top: 0,
            height: { xs: "42dvh", md: "100dvh" },
            overflow: "hidden",
            bgcolor: T.frame,
          }}
        >
          <Box
            ref={mediaRef}
            component="img"
            src={mediaSrc}
            alt=""
            sx={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          />
          <Box
            aria-hidden="true"
            sx={{
              position: "absolute",
              inset: "auto 0 0 0",
              height: "55%",
              background: "linear-gradient(to top, rgba(28,18,10,.7), rgba(28,18,10,0))",
            }}
          />
          <LineFrame
            offset={-26}
            color="rgba(255,255,255,.8)"
            sx={{ position: "absolute", inset: 0, pointerEvents: "none" }}
          />
          <Box data-x="" sx={{ position: "absolute", bottom: { xs: 22, md: 44 }, insetInline: { xs: 28, md: 52 }, color: "#fff" }}>
            <Typography
              data-code=""
              sx={{ fontSize: { xs: "2.2rem", md: "4.5rem" }, fontWeight: 800, lineHeight: 1.1, direction: "ltr", textAlign: "right" }}
            >
              {product.code}
            </Typography>
            <Typography sx={{ mt: 0.5, opacity: 0.85 }}>{product.type}</Typography>
          </Box>
        </Box>

        {/* content column */}
        <Box sx={{ minWidth: 0 }}>
          <Box sx={{ px: padX, pt: { xs: 5, md: 14 } }}>
            <Typography data-x="" sx={{ color: T.accentDark, fontWeight: 600, direction: "ltr", textAlign: "right" }}>
              {cat.latin}
            </Typography>
            <Typography data-x="" component="h2" sx={{ mt: 1, fontSize: { xs: "2rem", md: "3.2rem" }, fontWeight: 600, lineHeight: 1.5 }}>
              {cat.name}
            </Typography>
            <Typography data-x="" sx={{ mt: 2, color: T.muted, lineHeight: 2.1, maxWidth: 620 }}>
              {cat.description}
            </Typography>

            {many && (
              <Box data-x="" sx={{ mt: 6 }}>
                <Typography sx={{ fontWeight: 600, mb: 1.5 }}>
                  انتخاب گرید <Box component="span" sx={{ color: T.muted, fontWeight: 400 }}>({fa(cat.products.length)} گرید)</Box>
                </Typography>
                <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(86px, 1fr))", gap: 1 }}>
                  {cat.products.map((p, i) => {
                    const on = i === idx;
                    return (
                      <Box
                        key={p.id}
                        component="button"
                        type="button"
                        onClick={() => select(i)}
                        aria-pressed={on}
                        sx={{
                          py: 1.25,
                          border: `1px solid ${on ? T.text : T.line}`,
                          bgcolor: on ? T.text : "transparent",
                          color: on ? T.bg : T.text,
                          font: "inherit",
                          fontSize: "0.85rem",
                          fontWeight: on ? 700 : 500,
                          direction: "ltr",
                          cursor: "pointer",
                          transition: "all .3s",
                          "&:hover": { borderColor: T.text },
                          "&:focus-visible": { outline: `2px solid ${T.accent}`, outlineOffset: 2 },
                        }}
                      >
                        {p.code}
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            )}
          </Box>

          {/* detail */}
          <Box ref={detailRef} sx={{ px: padX, pt: { xs: 6, md: 9 }, scrollMarginTop: 16 }}>
            <Box data-x="" sx={{ borderTop: `1px solid ${T.line}`, pt: 5 }}>
              <Typography data-d="" component="h3" sx={{ fontSize: { xs: "1.5rem", md: "2.1rem" }, fontWeight: 600, lineHeight: 1.6 }}>
                {product.name}
              </Typography>
              <Box data-d="" sx={{ mt: 1.5, display: "flex", gap: 1, flexWrap: "wrap" }}>
                <Chip>{product.type}</Chip>
                <Chip dim ltr>{product.code}</Chip>
              </Box>
              <Typography data-d="" sx={{ mt: 3, color: T.muted, lineHeight: 2.1, maxWidth: 620 }}>
                {product.summary}
              </Typography>

              <Box sx={{ mt: 5, display: "grid", gap: 5, gridTemplateColumns: { sm: "1fr 1fr" } }}>
                <Box data-d="">
                  <Heading>ویژگی‌ها</Heading>
                  <Box component="ul" sx={{ listStyle: "none", display: "grid", gap: 1.25 }}>
                    {product.features.map((f, i) => (
                      <Box component="li" key={f} sx={{ display: "flex", gap: 1.5, lineHeight: 1.9 }}>
                        <Box component="span" sx={{ color: T.accentDark, fontWeight: 700, fontSize: "0.8rem", pt: "0.2em", minWidth: 20 }}>
                          {fa(`0${i + 1}`)}
                        </Box>
                        {f}
                      </Box>
                    ))}
                  </Box>
                </Box>
                <Box data-d="">
                  <Heading>کاربردها</Heading>
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    {product.uses.map((u) => (
                      <Chip key={u}>{u}</Chip>
                    ))}
                  </Box>
                </Box>
              </Box>

              <Box data-d="" sx={{ mt: 6 }}>
                <Heading>مشخصات فنی</Heading>
                <Box component="dl" sx={{ borderTop: `1px solid ${T.line}` }}>
                  {product.specs.map((s) => (
                    <Box key={s.label} sx={{ display: "flex", justifyContent: "space-between", gap: 2, py: 1.75, borderBottom: `1px solid ${T.line}` }}>
                      <Box component="dt" sx={{ color: T.muted }}>{s.label}</Box>
                      <Box component="dd" sx={{ fontWeight: 600 }}>{s.value}</Box>
                    </Box>
                  ))}
                </Box>
              </Box>

              {many && (
                <Box data-d="" sx={{ mt: 6, display: "flex", justifyContent: "space-between", gap: 2 }}>
                  <NavBtn onClick={() => select(idx - 1, "start")}>→ گرید قبلی</NavBtn>
                  <NavBtn onClick={() => select(idx + 1, "start")}>گرید بعدی ←</NavBtn>
                </Box>
              )}
            </Box>
          </Box>

          {/* sticky CTA */}
          <Box
            data-x=""
            sx={{
              position: "sticky",
              bottom: 0,
              mt: 8,
              px: padX,
              py: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
              bgcolor: "rgba(250,248,246,.92)",
              backdropFilter: "blur(12px)",
              borderTop: `1px solid ${T.line}`,
            }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: "0.8rem", color: T.muted }}>گرید انتخاب‌شده</Typography>
              <Typography noWrap sx={{ fontWeight: 600 }}>{product.name}</Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 1, flexShrink: 0 }}>
              <Box
                component="a"
                href={`tel:${CONTACT.phones[0].tel}`}
                sx={{
                  display: { xs: "none", sm: "block" },
                  px: 2.5,
                  py: 1.5,
                  border: `1px solid ${T.text}`,
                  color: T.text,
                  textDecoration: "none",
                  fontWeight: 600,
                  "&:hover": { bgcolor: T.text, color: T.bg },
                  "&:focus-visible": { outline: `2px solid ${T.accent}`, outlineOffset: 3 },
                }}
              >
                تماس
              </Box>
              <Box
                component="button"
                type="button"
                onClick={goContact}
                sx={{
                  px: 3,
                  py: 1.5,
                  border: 0,
                  bgcolor: T.text,
                  color: T.bg,
                  font: "inherit",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "background-color .3s",
                  "&:hover": { bgcolor: T.accentDark },
                  "&:focus-visible": { outline: `2px solid ${T.accent}`, outlineOffset: 3 },
                }}
              >
                درخواست مشاوره
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

function Heading({ children }) {
  return (
    <Typography sx={{ color: T.accentDark, fontWeight: 600, mb: 1.5 }}>{children}</Typography>
  );
}

function Chip({ children, dim = false, ltr = false }) {
  return (
    <Box
      component="span"
      sx={{
        px: 1.5,
        py: 0.5,
        border: `1px solid ${dim ? T.line : T.accent}`,
        color: dim ? T.muted : T.text,
        fontSize: "0.85rem",
        direction: ltr ? "ltr" : "rtl",
      }}
    >
      {children}
    </Box>
  );
}

function NavBtn({ children, onClick }) {
  return (
    <Box
      component="button"
      type="button"
      onClick={onClick}
      sx={{
        px: 0,
        py: 1,
        border: 0,
        bgcolor: "transparent",
        color: T.text,
        font: "inherit",
        fontWeight: 600,
        cursor: "pointer",
        "&:hover": { color: T.accentDark },
        "&:focus-visible": { outline: `2px solid ${T.accent}`, outlineOffset: 3 },
      }}
    >
      {children}
    </Box>
  );
}
