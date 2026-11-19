// Single source of truth for colours / layout, shared by every section.
// Same palette as the Hero so the whole site feels like one piece.
export const T = {
  bg: "#faf8f6",
  bgAlt: "#f3eee8",
  frame: "#d8cdc0",
  text: "#3a2a1f",
  muted: "#5d4d41",
  accent: "#c8ab85",
  accentDark: "#86683f", // readable on light backgrounds (labels)
  dark: "#241a12",
  line: "rgba(58,42,31,.16)",
};

export const WRAP = { maxWidth: 1240, mx: "auto", px: { xs: 3, md: 6 } };

const FA_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
export const fa = (n) => String(n).replace(/\d/g, (d) => FA_DIGITS[d]);
