import { useRef } from "react";
import { Box, Typography } from "@mui/material";
import { useReveal } from "../../shared/useReveal";
import { Brand } from "../../shared/ui/Brand";
import { MENU } from "../../shared/ui/MenuDialog";
import { T, WRAP, fa } from "../../shared/theme";
import { CONTACT } from "../../data/contact";

const MUTED = "rgba(241,233,223,.7)";

const Label = ({ children }) => (
  <Typography sx={{ color: T.accent, fontSize: "0.85rem", fontWeight: 600, mb: 1.5 }}>
    {children}
  </Typography>
);

// Numbers must stay left-to-right inside the RTL page, otherwise "۰۲۱-۱۲۳۴" renders scrambled.
const ltr = { direction: "ltr", unicodeBidi: "isolate", display: "inline-block" };

const scrollToId = (id) => (e) => {
  const el = document.getElementById(id);
  if (!el) return; // let the browser follow the href
  e.preventDefault();
  el.scrollIntoView({ behavior: "smooth" });
};

export function FooterSection() {
  const rootRef = useRef(null);
  useReveal(rootRef);

  return (
    <Box
      ref={rootRef}
      component="footer"
      id="contact"
      dir="rtl"
      sx={{ bgcolor: T.dark, color: "#f1e9df", pt: { xs: 8, md: 12 }, pb: 4 }}
    >
      <Box sx={WRAP}>
        <Box
          sx={{
            display: "grid",
            gap: { xs: 6, md: 8 },
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1.3fr 0.8fr 1fr 1fr" },
          }}
        >
          <Box data-reveal="">
            <Brand
              color="#f1e9df"
              markColor={T.accent}
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
            <Typography sx={{ mt: 2.5, maxWidth: 320, lineHeight: 2.1, color: MUTED }}>
              تأمین پراکسیدهای آلی و رزین‌های پلی‌استر غیراشباع برای صنعت.
            </Typography>
          </Box>

          <Box data-reveal="" data-delay="0.08" component="nav" aria-label="پیوندهای سریع">
            <Label>دسترسی سریع</Label>
            <Box sx={{ display: "grid", gap: 0.5 }}>
              {MENU.filter((m) => m.id !== "contact").map((m) => (
                <Box
                  key={m.id}
                  component="a"
                  href={`/#${m.id}`}
                  onClick={scrollToId(m.id)}
                  sx={{
                    width: "fit-content",
                    color: "inherit",
                    textDecoration: "none",
                    lineHeight: 2.1,
                    "&:hover": { color: T.accent },
                    "&:focus-visible": { outline: `2px solid ${T.accent}`, outlineOffset: 4 },
                  }}
                >
                  {m.label}
                </Box>
              ))}
            </Box>
          </Box>

          <Box data-reveal="" data-delay="0.16">
            <Label>نشانی</Label>
            <Typography component="address" sx={{ fontStyle: "normal", lineHeight: 2.1 }}>
              {CONTACT.address}
            </Typography>
          </Box>

          <Box data-reveal="" data-delay="0.24">
            <Label>تماس</Label>
            <Box sx={{ display: "grid", gap: 0.5, justifyItems: "start" }}>
              {CONTACT.phones.map((p) => (
                <Box
                  key={p.tel}
                  component="a"
                  href={`tel:${p.tel}`}
                  sx={{
                    ...ltr,
                    color: "inherit",
                    textDecoration: "none",
                    fontSize: "1.15rem",
                    lineHeight: 2,
                    "&:hover": { color: T.accent },
                    "&:focus-visible": { outline: `2px solid ${T.accent}`, outlineOffset: 4 },
                  }}
                >
                  {p.label}
                </Box>
              ))}
              {CONTACT.email && (
                <Box
                  component="a"
                  href={`mailto:${CONTACT.email}`}
                  sx={{
                    ...ltr,
                    color: MUTED,
                    textDecoration: "none",
                    "&:hover": { color: T.accent },
                    "&:focus-visible": { outline: `2px solid ${T.accent}`, outlineOffset: 4 },
                  }}
                >
                  {CONTACT.email}
                </Box>
              )}
            </Box>
          </Box>
        </Box>

        <Box
          data-line=""
          sx={{ mt: { xs: 7, md: 10 }, height: "1px", bgcolor: "rgba(241,233,223,.18)" }}
        />
        <Box
          sx={{
            mt: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <Typography sx={{ fontSize: "0.8rem", color: "rgba(241,233,223,.55)" }}>
            کلیه حقوق برای پویا شیمی آویژه محفوظ است. {fa(1405)}
          </Typography>
          <Box
            component="button"
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            sx={{
              border: 0,
              bgcolor: "transparent",
              color: "inherit",
              font: "inherit",
              fontSize: "0.85rem",
              cursor: "pointer",
              "&:hover": { color: T.accent },
              "&:focus-visible": { outline: `2px solid ${T.accent}`, outlineOffset: 4 },
            }}
          >
            بازگشت به بالا ↑
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
