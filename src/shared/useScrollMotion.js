import { gsap, ScrollTrigger, useGSAP } from "./gsap";

/** All scroll choreography belongs to this page's React/GSAP context. */
export function useScrollMotion(scopeRef) {
  useGSAP(() => {
    const root = scopeRef.current;
    if (!root) return;
    const select = gsap.utils.selector(root);
    const media = gsap.matchMedia();
    let disposed = false;
    let refreshTimer;

    const refresh = () => {
      clearTimeout(refreshTimer);
      refreshTimer = setTimeout(() => {
        if (!disposed && root.isConnected) ScrollTrigger.refresh();
      }, 140);
    };

    media.add({
      desktop: "(min-width: 900px)",
      mobile: "(max-width: 899px)",
      reduced: "(prefers-reduced-motion: reduce)",
    }, (context) => {
      const { desktop, reduced } = context.conditions;
      root.dataset.scrollMotion = reduced ? "reduced" : desktop ? "desktop" : "mobile";
      if (reduced) return;

      root.classList.add("has-scroll-motion");
      const focusAnimations = [];
      const frames = select(".about-visual, .product-image, .event-spotlight-image, .journal-image");

      gsap.fromTo(select(".scroll-progress-fill"), { scaleX: 0 }, {
        scaleX: 1,
        ease: "none",
        scrollTrigger: { start: 0, end: "max", scrub: 0.15 },
      });

      // Animate the stable frame, so replacing a carousel/year image inherits its position.
      frames.forEach((frame) => {
        frame.classList.add("motion-media");
        gsap.set(frame, { "--media-scale": desktop ? 1.12 : 1.07 });
        gsap.fromTo(frame, { "--media-y": desktop ? "-4%" : "-2%" }, {
          "--media-y": desktop ? "4%" : "2%",
          ease: "none",
          scrollTrigger: {
            trigger: frame,
            start: "clamp(top bottom)",
            end: "clamp(bottom top)",
            scrub: desktop ? 0.8 : 0.4,
            invalidateOnRefresh: true,
          },
        });
      });

      const hero = select(".hero-section")[0];
      if (desktop && hero) {
        gsap.to(select(".hero-orbits"), {
          yPercent: 13,
          ease: "none",
          scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: 1 },
        });
        gsap.to(select(".hero-media-motion"), {
          y: -35,
          scale: 0.975,
          transformOrigin: "center top",
          ease: "none",
          scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: 0.8 },
        });
      }

      function reveal(targets, from = {}, trigger, stagger = 0) {
        const elements = gsap.utils.toArray(targets).filter((el) => el.getBoundingClientRect().bottom > 0);
        if (!elements.length) return;
        const anchor = trigger || elements[0];
        const alreadyVisible = anchor.getBoundingClientRect().top <= window.innerHeight * 0.88;
        const animation = gsap.from(elements, {
          opacity: 0,
          y: desktop ? 42 : 24,
          duration: desktop ? 1.05 : 0.75,
          ease: "power3.out",
          stagger,
          ...from,
          ...(!alreadyVisible && {
            scrollTrigger: { trigger: anchor, start: "clamp(top 88%)", once: true },
          }),
        });
        focusAnimations.push({ elements, animation });
        return animation;
      }

      // Preserve connected Persian glyphs: reveal whole lines, never individual letters.
      reveal(select(".hero-intro > div:first-child > .eyebrow"), { y: 15, duration: 0.75 });
      reveal(select("[data-hero-line]"), {
        yPercent: 105, y: 0, opacity: 1, duration: 1.1, stagger: 0.13,
      }, hero);
      reveal(select(".hero-description > *"), { delay: 0.15 }, hero, 0.08);
      reveal(select(".story-stage"), { y: 30, delay: 0.2, duration: 1.15 });
      reveal(select(".hero-toolbar, .hero-footnote"), { y: 16, delay: 0.3 }, hero, 0.08);

      select(".section-heading").forEach((heading) => {
        reveal(heading.querySelectorAll(".eyebrow"), { y: 12, duration: 0.7 }, heading);
        reveal(heading.querySelectorAll("[data-motion-heading]"), {
          yPercent: 105, y: 0, opacity: 1, duration: 1.05,
        }, heading);
        reveal(heading.querySelectorAll(".section-description, .section-side-note, .year-tabs"), {
          y: 20, delay: 0.12,
        }, heading, 0.08);
      });

      const about = select(".about-grid")[0];
      if (about) {
        reveal(about.querySelectorAll(".about-copy > *"), { y: 30 }, about, 0.1);
        reveal(about.querySelectorAll(".about-visual"), {
          y: desktop ? 48 : 24,
          clipPath: "inset(12% 0% 0% 0% round 24px)",
          duration: 1.25,
        });
      }
      reveal(select(".material-strip > span"), { y: 16 }, select(".material-strip")[0], 0.12);

      select(".product-card").forEach((card, index) => {
        reveal(card, {
          y: desktop ? 75 : 32,
          rotation: desktop ? (index === 0 ? -1.4 : 1.4) : 0,
          delay: desktop ? index * 0.15 : 0,
          duration: 1.15,
          transformOrigin: "center bottom",
        });
      });
      reveal(select(".product-assistance > *"), { y: 18 }, select(".product-assistance")[0], 0.1);
      reveal(select(".event-spotlight"), { y: desktop ? 58 : 28, duration: 1.15 });
      reveal(select(".event-bottom-line > span"), { y: 14 }, select(".event-bottom-line")[0], 0.1);
      reveal(select(".journal-featured"), { y: desktop ? 56 : 28, duration: 1.1 });
      select(".journal-list-item").forEach((item, index) => reveal(item, {
        x: desktop ? -28 : 0, y: 25, delay: desktop ? index * 0.1 : 0,
      }));
      reveal(select(".journal-note"), { y: 15 });

      const invitation = select(".footer-invitation")[0];
      if (invitation) {
        reveal(invitation.querySelectorAll(".eyebrow, h2, .footer-invitation-aside"), {
          y: desktop ? 45 : 25,
        }, invitation, 0.12);
      }
      reveal(select(".footer-grid > *"), { y: 26 }, select(".footer-grid")[0], 0.1);
      reveal(select(".footer-bottom > *"), { y: 12, duration: 0.7 }, select(".footer-bottom")[0], 0.08);

      select(".material-strip, .product-assistance, .footer-invitation, .footer-bottom").forEach((line) => {
        gsap.fromTo(line, { "--rule-scale": 0 }, {
          "--rule-scale": 1, duration: 1.25, ease: "power3.inOut",
          scrollTrigger: { trigger: line, start: "clamp(top 92%)", once: true },
        });
      });

      // A keyboard user must never wait for an entrance before seeing the focused link.
      const onFocus = (event) => focusAnimations.forEach(({ elements, animation }) => {
        if (elements.some((el) => el.contains(event.target))) animation.totalProgress(1);
      });
      root.addEventListener("focusin", onFocus);
      refresh();
      return () => {
        root.removeEventListener("focusin", onFocus);
        root.classList.remove("has-scroll-motion");
        frames.forEach((frame) => frame.classList.remove("motion-media"));
      };
    });

    // Lazy media, web fonts and responsive content can move trigger boundaries.
    const resizeObserver = new ResizeObserver(refresh);
    resizeObserver.observe(root);
    root.addEventListener("load", refresh, true);
    document.fonts?.ready.then(refresh);

    return () => {
      disposed = true;
      clearTimeout(refreshTimer);
      resizeObserver.disconnect();
      root.removeEventListener("load", refresh, true);
      media.revert();
      delete root.dataset.scrollMotion;
    };
  }, { scope: scopeRef });
}
