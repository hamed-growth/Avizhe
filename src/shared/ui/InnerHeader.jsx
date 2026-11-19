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
        bgcolor: "rgba(250,248,246,.88)",
        backdropFilter: "blur(10px)",
        borderBottom: `1px solid ${T.line}`,
      }}
    >
      <Box
        sx={{
          ...WRAP,
          py: 1.5,
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
            fontWeight: 600,
            fontSize: "0.95rem",
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
