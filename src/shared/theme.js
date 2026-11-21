// Avizhe / Industrial Editorial — shared, mobile-first design tokens.
export const T = {
  bg: "#fbfaf7",
  bgAlt: "#f0ede7",
  frame: "#ddd7ce",
  text: "#252923",
  muted: "#646a61",
  accent: "#ed885f",
  accentDark: "#a94a2d",
  dark: "#1c2622",
  line: "rgba(37,41,35,.14)",
  white: "#ffffff",
  radius: 26,
  ease: "cubic-bezier(.22,1,.36,1)",
};
export const WRAP = { maxWidth: 1240, mx: "auto", px: { xs: 3, sm: 4, md: 6 } };
const FA_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
export const fa = (n) => String(n).replace(/\d/g, (d) => FA_DIGITS[d]);
