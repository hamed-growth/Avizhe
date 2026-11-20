import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { HeroSection } from "../sections/Hero/hero";
import { IntroduceSection } from "../sections/introudce/introduce";
import { ProductsSection } from "../sections/products/products";
import { EventsSection } from "../sections/events/events";
import { NewsSection } from "../sections/news/news";
import { FooterSection } from "../sections/footer/footer";
import { MenuDialog } from "../shared/ui/MenuDialog";
import { SiteHeader } from "../shared/ui/DesignSystem";
import { useScrollMotion } from "../shared/useScrollMotion";

export default function HomePage() {
  const rootRef = useRef(null);
  useScrollMotion(rootRef);
  const [menuOpen, setMenuOpen] = useState(false);
  const { hash } = useLocation();
  useEffect(() => {
    if (!hash || hash.includes("/")) return;
    const timer = setTimeout(
      () =>
        document
          .getElementById(hash.slice(1))
          ?.scrollIntoView({
            behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
              .matches
              ? "instant"
              : "smooth",
          }),
      80,
    );
    return () => clearTimeout(timer);
  }, [hash]);
  return (
    <div className="site-shell" ref={rootRef}>
      <div className="scroll-progress" aria-hidden="true"><span className="scroll-progress-fill" /></div>
      <a className="skip-link" href="#main-content">
        رفتن به محتوای اصلی
      </a>
      <SiteHeader onMenuClick={() => setMenuOpen(true)} menuOpen={menuOpen} />
      <main id="main-content">
        <HeroSection />
        <IntroduceSection />
        <ProductsSection />
        <EventsSection />
        <NewsSection />
      </main>
      <FooterSection />
      <MenuDialog open={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>
  );
}
