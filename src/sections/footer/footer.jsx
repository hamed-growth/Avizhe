import { useRef } from "react";
import { Box, Typography } from "@mui/material";
import { useReveal } from "../../shared/useReveal";
import { Brand } from "../../shared/ui/Brand";
import { T, WRAP, fa } from "../../shared/theme";
import { CONTACT } from "../../data/contact";

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
      sx={{ bgcolor: T.dark, color: "#f1e9df", pt: { xs: 8, md: 12 }, pb: 4 }}
    >
      <Box sx={WRAP}>
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
              {CONTACT.address}
            </Typography>
          </Box>

          <Box data-reveal="" data-delay="0.2">
            <Label>تماس</Label>
            <Box sx={{ display: "grid", gap: 0.5 }}>
              {CONTACT.phones.map((p) => (
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
              {CONTACT.email && (
                <Box
                  component="a"
                  href={`mailto:${CONTACT.email}`}
                  sx={{ color: "rgba(241,233,223,.7)", textDecoration: "none", "&:hover": { color: T.accent } }}
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
        <Typography sx={{ mt: 3, fontSize: "0.8rem", color: "rgba(241,233,223,.5)" }}>
          © {fa(1405)} پویا شیمی آویژه. تمامی حقوق محفوظ است.
        </Typography>
      </Box>
    </Box>
  );
}
