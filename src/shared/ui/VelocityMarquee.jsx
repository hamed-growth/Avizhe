import { Box } from "@mui/material";
import { T } from "../theme";

export function VelocityMarquee({ items = [] }) {
  if (!items.length) return null;
  const repeatedItems = [...items, ...items];

  return (
    <Box
      component="div"
      aria-label={items.join("، ")}
      sx={{
        overflow: "hidden",
        py: { xs: 2, md: 2.5 },
        color: T.ink,
        borderBlock: "1px solid rgba(43,60,81,.15)",
      }}
    >
      <Box
        component="div"
        aria-hidden="true"
        sx={{
          display: "flex",
          width: "max-content",
          animation: "avizhe-marquee 28s linear infinite",
          "@keyframes avizhe-marquee": {
            from: { transform: "translateX(0)" },
            to: { transform: "translateX(50%)" },
          },
          "@media (prefers-reduced-motion: reduce)": { animation: "none" },
        }}
      >
        {repeatedItems.map((item, index) => (
          <Box
            component="span"
            key={`${item}-${index}`}
            sx={{ px: { xs: 2, md: 3 }, whiteSpace: "nowrap", fontWeight: 600 }}
          >
            {item}
            <Box component="span" sx={{ color: T.accent, px: 2 }} aria-hidden="true">
              •
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
