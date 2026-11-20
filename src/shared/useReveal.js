import { gsap, useGSAP, prefersReducedMotion } from "./gsap";

/**
 * Scroll reveals driven by data attributes (one hook, used by every section):
 *   data-reveal            -> fade + rise
 *   data-mask              -> wrapper (overflow hidden); its first child slides up
 *   data-line              -> a 1px divider that draws itself
 * Optional data-delay="0.2" on data-reveal.
 */
export function useReveal(scopeRef, deps = []) {
  useGSAP(
    () => {
      const root = scopeRef.current;
      if (!root || prefersReducedMotion()) return;
      // clamp(): if the element can never reach "start" (it sits at the very bottom of the
      // page, e.g. the footer), the trigger fires at the max scroll instead of never.
      const at = (el, start = "top 88%") => ({
        trigger: el,
        start: `clamp(${start})`,
        once: true,
      });

      gsap.utils.toArray("[data-reveal]", root).forEach((el) => {
        gsap.from(el, {
          opacity: 0,
          y: 32,
          duration: 1,
          ease: "power3.out",
          delay: Number(el.dataset.delay || 0),
          scrollTrigger: at(el),
        });
      });

      gsap.utils.toArray("[data-mask]", root).forEach((el) => {
        gsap.from(el.firstElementChild, {
          yPercent: 115,
          duration: 1,
          ease: "power4.out",
          scrollTrigger: at(el, "top 90%"),
        });
      });

      gsap.utils.toArray("[data-line]", root).forEach((el) => {
        gsap.from(el, {
          scaleX: 0,
          transformOrigin: "right center",
          duration: 1.2,
          ease: "power3.inOut",
          scrollTrigger: at(el, "top 92%"),
        });
      });
    },
    { scope: scopeRef, dependencies: deps },
  );
}
