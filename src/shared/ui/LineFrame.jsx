import { Fragment, useRef } from "react";
import { Box } from "@mui/material";
import { gsap, useGSAP, prefersReducedMotion } from "../gsap";
import { T } from "../theme";

/**
 * The signature detail of the site: two thin corner brackets that sit OUTSIDE
 * the photo (top-right + bottom-left, like the brand collage) and draw
 * themselves when the image scrolls into view.
 *
 * props: flip -> mirror (top-left + bottom-right) | offset -> gap from the image
 * NOTE: parent must not clip overflow, otherwise the lines are cut.
 */
export function LineFrame({
  children = null,
  offset = 14,
  flip = false,
  color = T.accent,
  sx,
}) {
  const ref = useRef(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const xs = gsap.utils.toArray("[data-lf-x]", ref.current);
      const ys = gsap.utils.toArray("[data-lf-y]", ref.current);
      const tl = gsap.timeline({
        scrollTrigger: { trigger: ref.current, start: "top 85%", once: true },
      });
      tl.from(xs, {
        scaleX: 0,
        duration: 1.1,
        ease: "power3.inOut",
        stagger: 0.18,
      }).from(
        ys,
        { scaleY: 0, duration: 1.1, ease: "power3.inOut", stagger: 0.18 },
        0.15,
      );
    },
    { scope: ref },
  );

  const first = flip ? "left" : "right";
  const second = flip ? "right" : "left";
  const corners = [
    { v: "top", s: first },
    { v: "bottom", s: second },
  ];
  const o = `${-offset}px`;

  return (
    <Box ref={ref} sx={{ position: "relative", ...sx }}>
      {corners.map(({ v, s }) => (
        <Fragment key={`${v}-${s}`}>
          <Box
            data-lf-x=""
            aria-hidden="true"
            sx={{
              position: "absolute",
              [v]: o,
              [s]: o,
              width: "62%",
              height: "1.5px",
              bgcolor: color,
              transformOrigin: `${s} center`,
              pointerEvents: "none",
              zIndex: 2,
            }}
          />
          <Box
            data-lf-y=""
            aria-hidden="true"
            sx={{
              position: "absolute",
              [v]: o,
              [s]: o,
              width: "1.5px",
              height: "46%",
              bgcolor: color,
              transformOrigin: `center ${v}`,
              pointerEvents: "none",
              zIndex: 2,
            }}
          />
        </Fragment>
      ))}
      {children}
    </Box>
  );
}
