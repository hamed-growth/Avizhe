import { Box, Typography } from "@mui/material";
import { T } from "../theme";

/** Clips its child so useReveal can slide it up from below (data-mask). */
export function Mask({ children, sx = {} }) {
  return (
    <Box data-mask="" sx={{ overflow: "hidden", pb: "0.2em", ...sx }}>
      {children}
    </Box>
  );
}

/** Small section eyebrow: a line + a label. */
export function SectionLabel({ children, light = false }) {
  return (
    <Box
      data-reveal=""
      sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2.5 }}
    >
      <Box
        component="span"
        sx={{ width: 26, height: 3, borderRadius: 9, bgcolor: T.accent }}
      />
      <Typography
        component="span"
        sx={{
          fontSize: "0.79rem",
          fontWeight: 800,
          letterSpacing: 0,
          color: light ? T.accent : T.accentDark,
        }}
      >
        {children}
      </Typography>
    </Box>
  );
}

export function SectionTitle({ id, children, color = T.text }) {
  return (
    <Mask>
      <Typography
        id={id}
        component="h2"
        sx={{
          fontSize: { xs: "clamp(1.9rem, 7.2vw, 2.6rem)", md: "clamp(2.8rem, 4vw, 4.3rem)" },
          fontWeight: 800,
          letterSpacing: "-.035em",
          lineHeight: 1.45,
          color,
        }}
      >
        {children}
      </Typography>
    </Mask>
  );
}
