import { useRef } from "react";
import { Box, Typography } from "@mui/material";
import { useReveal } from "../../shared/useReveal";
import { Brand } from "../../shared/ui/Brand";
import { T, WRAP, fa } from "../../shared/theme";
import { CONTACT } from "../../data/contact";

const HAS_EMAIL = Boolean(CONTACT.email && !CONTACT.email.endsWith("@example.com"));
const HAS_ADDRESS = Boolean(CONTACT.address && !CONTACT.address.startsWith("نشانی شرکت"));
const REAL_PHONES = CONTACT.phones.filter((p) => !p.tel.includes("00000"));
const CONTACT_READY = HAS_EMAIL || REAL_PHONES.length > 0;

const Label = ({ children }) => (
  <Typography sx={{ color: T.accent, fontSize: "0.85rem", fontWeight: 600, mb: 1.5 }}>
    {children}
  </Typography>
);

export function FooterSection() {
  const rootRef = useRef(null);
  useReveal(rootRef);

  return (
    <Box
      ref={rootRef}
      component="footer"
      id="contact"
      dir="rtl"
      sx={{ bgcolor: T.dark, color: "#f1e9df", pt: { xs: 7, md: 12 }, pb: { xs: "calc(92px + env(safe-area-inset-bottom, 0px))", md: 4 }, overflow: "hidden" }}
    >
      <Box sx={WRAP}>
        <Box data-reveal="" sx={{ pb: { xs: 5, md: 9 }, mb: { xs: 5, md: 8 }, borderBottom: "1px solid rgba(255,255,255,.15)", display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 3, flexWrap: "wrap" }}>
          <Box sx={{ maxWidth: 800 }}>
            <Typography sx={{ color: T.accent, fontWeight: 800, fontSize: ".8rem", mb: 2 }}>شروع یک همکاری تازه</Typography>
            <Typography component="h2" sx={{ color: "#f7f4ee", fontWeight: 800, letterSpacing: "-.035em", lineHeight: 1.55, fontSize: { xs: "clamp(2rem, 8vw, 3rem)", md: "clamp(3rem, 5vw, 5rem)" } }}>
              آینده‌ی تولید، از یک گفت‌وگو آغاز می‌شود.
            </Typography>
          </Box>
          {HAS_EMAIL && <Box component="a" href={`mailto:${CONTACT.email}`} sx={{ borderRadius: 99, minHeight: 54, display: "flex", alignItems: "center", gap: 2, px: 3, color: T.dark, bgcolor: T.accent, textDecoration: "none", fontWeight: 800, "&:hover": { bgcolor: "#EBEBEB" } }}>شروع گفت‌وگو <Box component="span" aria-hidden="true">↗</Box></Box>}
        </Box>
        <Box
          sx={{
            display: "grid",
            gap: { xs: 6, md: 8 },
            gridTemplateColumns: { md: "1.2fr 1fr 1fr" },
          }}
        >
          <Box data-reveal="">
            <Brand color="#f1e9df" markColor={T.accent} />
            <Typography sx={{ mt: 2.5, maxWidth: 340, lineHeight: 2.1, color: "rgba(241,233,223,.7)" }}>
              تأمین پراکسیدهای آلی و رزین‌های پلی‌استر غیراشباع برای صنعت.
            </Typography>
          </Box>

          <Box data-reveal="" data-delay="0.1">
            <Label>نشانی</Label>
            <Typography component="address" sx={{ fontStyle: "normal", lineHeight: 2.1 }}>
              {HAS_ADDRESS ? CONTACT.address : "اطلاعات نشانی پس از تأیید شرکت در این بخش قرار می‌گیرد."}
            </Typography>
          </Box>

          <Box data-reveal="" data-delay="0.2">
            <Label>تماس</Label>
            <Box sx={{ display: "grid", gap: 0.5 }}>
              {REAL_PHONES.map((p) => (
                <Box
                  key={p.tel}
                  component="a"
                  href={`tel:${p.tel}`}
                  sx={{
                    color: "inherit",
                    textDecoration: "none",
                    fontSize: "1.15rem",
                    lineHeight: 2,
                    width: "fit-content",
                    "&:hover": { color: T.accent },
                    "&:focus-visible": { outline: `2px solid ${T.accent}`, outlineOffset: 4 },
                  }}
                >
                  {p.label}
                </Box>
              ))}
              {HAS_EMAIL && (
                <Box
                  component="a"
                  href={`mailto:${CONTACT.email}`}
                  sx={{ color: "rgba(241,233,223,.7)", textDecoration: "none", "&:hover": { color: T.accent } }}
                >
                  {CONTACT.email}
                </Box>
              )}
              {!CONTACT_READY && <Typography sx={{ color: "rgba(241,233,223,.7)", lineHeight: 2, fontSize: ".92rem" }}>راه‌های ارتباطی پس از ثبت اطلاعات رسمی شرکت فعال می‌شوند.</Typography>}
            </Box>
          </Box>
        </Box>

        <Box
          data-line=""
          sx={{ mt: { xs: 7, md: 10 }, height: "1px", bgcolor: "rgba(241,233,223,.18)" }}
        />
        <Typography sx={{ mt: 3, fontSize: "0.8rem", color: "rgba(241,233,223,.5)" }}>
          © {fa(1405)} پویا شیمی آویژه. تمامی حقوق محفوظ است.
        </Typography>
      </Box>
    </Box>
  );
}
