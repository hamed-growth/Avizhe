import { Box, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { T } from "../theme";

export const BRAND = "پویا شیمی آویژه";

/** Logo (tinted through a mask, same trick as the Hero header) + name. */
export function Brand({ color = T.text, markColor = T.text, to = "/", onClick }) {
  const mask = {
    maskImage: 'url("/logo.png")',
    maskMode: "alpha",
    maskSize: "148%",
    maskPosition: "center",
    maskRepeat: "no-repeat",
    WebkitMaskImage: 'url("/logo.png")',
    WebkitMaskSize: "148%",
    WebkitMaskPosition: "center",
    WebkitMaskRepeat: "no-repeat",
  };
  return (
    <Box
      component={Link}
      to={to}
      onClick={onClick}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        color,
        textDecoration: "none",
        "&:focus-visible": { outline: `2px solid ${T.accent}`, outlineOffset: 6 },
      }}
    >
      <Box
        component="span"
        aria-hidden="true"
        sx={{ width: 44, height: 44, flexShrink: 0, bgcolor: markColor, ...mask }}
      />
      <Typography
        component="span"
        sx={{ fontSize: "1rem", fontWeight: 600, color: "inherit" }}
      >
        {BRAND}
      </Typography>
    </Box>
  );
}
