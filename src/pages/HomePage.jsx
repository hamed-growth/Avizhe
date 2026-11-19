import { useEffect, useState } from "react";
import { Box } from "@mui/material";
import { useLocation } from "react-router-dom";
import { HeroSection } from "../sections/Hero/hero";
import { IntroduceSection } from "../sections/introudce/introduce";
import { ProductsSection } from "../sections/products/products";
import { EventsSection } from "../sections/events/events";
import { NewsSection } from "../sections/news/news";
import { FooterSection } from "../sections/footer/footer";
import { MenuDialog } from "../shared/ui/MenuDialog";
import { ScrollTrigger } from "../shared/gsap";
import { MobileDock } from "../shared/ui/MobileDock";
import { TopProgress } from "../shared/ui/TopProgress";

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { hash } = useLocation();

  // Coming back from a detail page ("/#products"): land on that section.
  useEffect(() => {
    if (!hash) return;
    const t = setTimeout(() => {
      ScrollTrigger.refresh();
      document.getElementById(hash.slice(1))?.scrollIntoView();
    }, 120);
    return () => clearTimeout(t);
  }, [hash]);

  return (
    <Box component="main" sx={{ p: 0, m: 0 }}>
      <TopProgress />
      <HeroSection onMenuClick={() => setMenuOpen(true)} />
      <IntroduceSection />
      <ProductsSection />
      <EventsSection />
      <NewsSection />
      <FooterSection />
      <MenuDialog open={menuOpen} onClose={() => setMenuOpen(false)} />
      <MobileDock hidden={menuOpen || hash.startsWith("#products/")} />
    </Box>
  );
}
