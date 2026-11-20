import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export { gsap, ScrollTrigger, useGSAP };

// Fonts, lazy images and the video change the page height after the first layout,
// which leaves ScrollTrigger start positions stale (sections near the bottom -
// like the footer - then reveal too late or never). Refresh whenever the height changes.
if (typeof window !== "undefined" && !window.__stRefreshBound) {
  window.__stRefreshBound = true;
  let t;
  const refresh = () => {
    clearTimeout(t);
    t = setTimeout(() => ScrollTrigger.refresh(), 150);
  };
  window.addEventListener("load", refresh);
  document.fonts?.ready.then(refresh);
  if ("ResizeObserver" in window) new ResizeObserver(refresh).observe(document.documentElement);
}

export const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
