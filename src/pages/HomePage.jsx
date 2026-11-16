import { Box } from "@mui/material";
import { HeroSection } from "../sections/Hero/hero";
import { IntroduceSection } from "../sections/introudce/introduce";

export default function HomePage() {
  return (
    <Box component="main" sx={{ p: 0, m: 0 }}>
      <HeroSection />
      <IntroduceSection />
    </Box>
  );
}
