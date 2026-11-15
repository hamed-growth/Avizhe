import { Box } from "@mui/material";

export function HeroSection() {
  return (
    <Box
      sx={{
        backgroundColor: "#c3c3c3",
        height: "100dvh",
      }}
    >
      <Box
        component="img"
        src="/media/hero/industry.webp"
        alt="Industry"
        sx={{
          display: "block",
          width: "100%",
          height: "100%",
          objectFit: "cover",
          borderRadius: "3px",
        }}
      />
    </Box>
  );
}
