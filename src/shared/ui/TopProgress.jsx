import { useEffect, useRef } from "react";
import { Box } from "@mui/material";
import { T } from "../theme";
export function TopProgress() {
  const bar = useRef(null);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const progress = max > 0 ? Math.max(0, Math.min(1, window.scrollY / max)) : 0;
        if (bar.current) bar.current.style.transform = `scaleX(${progress})`;
      });
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("scroll", update); window.removeEventListener("resize", update); };
  }, []);
  return <Box aria-hidden="true" sx={{ position: "fixed", top: 0, right: 0, left: 0, zIndex: 1200, height: 3, pointerEvents: "none" }}>
    <Box ref={bar} sx={{ width: "100%", height: "100%", transform: "scaleX(0)", transformOrigin: "right center", background: `linear-gradient(90deg, ${T.accent}, #ffc6a9)` }} />
  </Box>;
}
