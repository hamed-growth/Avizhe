// Avizhe / Industrial Editorial — shared, mobile-first design tokens.
export const T = {
  bg: "#fbfaf7",
  bgAlt: "#f0ede7",
  frame: "#ddd7ce",
  text: "#2B3C51",
  muted: "#517383",
  accent: "#B7C9D2",
  accentDark: "#517383",
  dark: "#2B3C51",
  line: "rgba(43,60,81,.14)",
  white: "#ffffff",
  radius: 26,
  ease: "cubic-bezier(.22,1,.36,1)",
};
export const WRAP = { maxWidth: 1240, mx: "auto", px: { xs: 3, sm: 4, md: 6 } };
const FA_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
export const fa = (n) => String(n).replace(/\d/g, (d) => FA_DIGITS[d]);
