// ⚠️ PLACEHOLDER CONTENT — swap covers / photos / videos / texts with the real exhibition files.
// Each event: { year, title, place, summary, cover, photos: [], videos: [{src, poster}], upcoming? }
const P = (n) => `/media/photos/${n}.web.webp`;

export const EVENTS = [
  {
    year: 1402,
    title: "نمایشگاه سال ۱۴۰۲",
    place: "محل برگزاری",
    summary: "گزارش تصویری حضور آویژه در رویداد سال ۱۴۰۲.",
    cover: P(3),
    photos: [P(3), P(4), P(5)],
    videos: [],
  },
  {
    year: 1403,
    title: "نمایشگاه سال ۱۴۰۳",
    place: "محل برگزاری",
    summary: "گزارش تصویری و ویدیویی حضور آویژه در رویداد سال ۱۴۰۳.",
    cover: "/media/posters/01.jpg",
    photos: [P(6), P(7), P(8), P(4)],
    videos: [{ src: "/media/videos/01.mp4", poster: "/media/posters/01.jpg" }],
  },
  {
    year: 1404,
    title: "نمایشگاه سال ۱۴۰۴",
    place: "محل برگزاری",
    summary: "گزارش تصویری و ویدیویی حضور آویژه در رویداد سال ۱۴۰۴.",
    cover: "/media/posters/02.jpg",
    photos: [P(5), P(3), P(7), P(6), P(8)],
    videos: [{ src: "/media/videos/02.mp4", poster: "/media/posters/02.jpg" }],
  },
  {
    year: 1405,
    title: "نمایشگاه سال ۱۴۰۵",
    place: "محل برگزاری",
    summary: "رویداد امسال در راه است. تصاویر و ویدیوها پس از برگزاری اینجا قرار می‌گیرند.",
    cover: P(8),
    photos: [],
    videos: [],
    upcoming: true,
  },
];

export const getEvent = (year) => EVENTS.find((e) => String(e.year) === String(year));
