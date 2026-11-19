import { Box } from "@mui/material";
import { Link } from "react-router-dom";
import { Brand } from "./Brand";
import { T, WRAP } from "../theme";

/** Slim header for the detail pages. `backTo` returns to the section on the home page. */
export function InnerHeader({ backTo = "/", backLabel = "بازگشت" }) {
  return (
    <Box
      component="header"
      dir="rtl"
      sx={{
        position: "sticky",
        top: 0,
        zIndex: 20,
        bgcolor: "rgba(251,250,247,.9)",
        backdropFilter: "blur(20px)",
        borderBottom: `1px solid ${T.line}`,
      }}
    >
      <Box
        sx={{
          ...WRAP,
          py: 1.5, minHeight: 76,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Brand />
        <Box
          component={Link}
          to={backTo}
          sx={{
            color: T.text,
            textDecoration: "none",
            fontWeight: 800,
            fontSize: { xs: ".78rem", md: ".95rem" },
            borderRadius: 99,
            py: 1.2,
            px: 2,
            border: `1px solid ${T.line}`,
            minHeight: 44,
            display: "flex",
            alignItems: "center",
            gap: 1,
            "&:hover": { color: T.accentDark },
            "&:focus-visible": { outline: `2px solid ${T.accent}`, outlineOffset: 4 },
          }}
        >
          {backLabel} <span aria-hidden="true">→</span>
        </Box>
      </Box>
    </Box>
  );
}
