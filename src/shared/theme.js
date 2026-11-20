export const T = {
  bg: "#f6f7fb",
  bgAlt: "#edf0f6",
  frame: "#e1e7ef",
  text: "#162733",
  muted: "#647284",
  accent: "#0751ff",
  accentDark: "#0649dc",
  dark: "#142530",
  line: "rgba(22,39,51,.12)",
};
export const WRAP = { maxWidth: 1360, mx: "auto", px: { xs: 2.5, md: 6 } };
const FA_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
export const fa = (n) => String(n).replace(/\d/g, (d) => FA_DIGITS[d]);

export const normalizeSearch = (value) =>
  String(value)
    .replace(/[۰-۹]/g, (digit) => FA_DIGITS.indexOf(digit))
    .replace(/[٠-٩]/g, (digit) => "٠١٢٣٤٥٦٧٨٩".indexOf(digit))
    .replace(/[يى]/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/\u200c/g, " ")
    .toLocaleLowerCase("fa")
    .trim();
