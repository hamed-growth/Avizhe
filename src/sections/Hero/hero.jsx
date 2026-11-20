import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { fa } from "../../shared/theme";
import {
  Eyebrow,
  Icon,
  RoundButton,
  SurfaceDialog,
} from "../../shared/ui/DesignSystem";

const stories = [
  {
    image: "/media/photos/5.web.webp",
    position: "center 49%",
    category: "فیلم برگزیده",
    title: "داستان یک ماده.",
    subtitle: "از کارخانه تا محصول نهایی",
    video: "/media/videos/hero.mp4",
    poster: "/media/posters/hero-preview.jpg",
    description: "از فضای کارخانه تا محصول نهایی؛ آویژه را از نزدیک ببینید.",
  },
  {
    image: "/media/photos/6.web.webp",
    position: "center 46%",
    category: "فرایند تولید",
    title: "از فرایند، تا محصول.",
    subtitle: "روایت جریان کار در کارخانه",
    description: "نگاهی نزدیک‌تر به جریان کار و زندگی در مجموعهٔ آویژه.",
  },
  {
    image: "/media/hero/industry.webp",
    position: "center 39%",
    category: "آدم‌های آویژه",
    title: "آدم‌ها، پشت هر محصول.",
    subtitle: "همراهان هر روزِ صنعت",
    description: "هر محصول، حاصل همراهی آدم‌هایی است که صنعت را پیش می‌برند.",
  },
  {
    image: "/media/hero/resins.webp",
    position: "center 45%",
    category: "دنیای مواد",
    title: "آغاز امکان‌های تازه.",
    subtitle: "رزین‌های پلی‌استر غیراشباع",
    description: "رزین‌های پلی‌استر غیراشباع؛ از انتخاب گرید تا کاربرد.",
  },
  {
    image: "/media/hero/peroxides.webp",
    position: "center 60%",
    category: "نگاهی نزدیک‌تر",
    title: "جزئیاتی که اثر می‌گذارند.",
    subtitle: "پراکسیدهای آلی در تولید",
    description: "پراکسیدهای آلی و نقش آن‌ها در فرایند تولید.",
  },
  {
    image: "/media/photos/7.web.webp",
    position: "center 45%",
    category: "زندگی در آویژه",
    title: "هر روز، رو به جلو.",
    subtitle: "قاب‌هایی از یک روز در آویژه",
    description: "روایتی تصویری از یک روز در آویژه.",
  },
];
const filters = [
  { id: "all", label: "همهٔ روایت‌ها" },
  { id: "film", label: "فیلم‌ها" },
  { id: "photo", label: "عکس‌ها" },
  { id: "people", label: "زندگی در آویژه" },
];

export function HeroSection() {
  const [filter, setFilter] = useState("all");
  const [active, setActive] = useState(0);
  const [viewer, setViewer] = useState(null);
  const swipe = useRef(null);
  const available = stories.filter(
    (story, index) =>
      filter === "all" ||
      (filter === "film"
        ? story.video
        : filter === "people"
          ? [1, 2, 5].includes(index)
          : !story.video),
  );
  const index = active % available.length;
  const story = available[index];
  const secondary = [1, 2]
    .map((offset) => available[(index + offset) % available.length])
    .filter((s, i, arr) => s !== story && arr.indexOf(s) === i);
  const go = (step) =>
    setActive(
      (current) => (current + step + available.length) % available.length,
    );
  return (
    <section className="hero-section" id="home" aria-label="معرفی آویژه">
      <div className="hero-orbits" aria-hidden="true" />
      <div className="container hero-inner">
        <div className="hero-intro" dir="rtl">
          <div>
            <Eyebrow>از نزدیک با آویژه</Eyebrow>
            <h1>
              <span className="motion-title-clip"><span data-hero-line>صنعت،</span></span>
              <span className="motion-title-clip"><span data-hero-line>در حرکت<span className="hero-title-dot">.</span></span></span>
            </h1>
          </div>
          <div className="hero-description" dir="rtl">
            <span className="mini-label">پویا شیمی آویژه</span>
            <h2>پشت هر محصول، یک داستان.</h2>
            <p>
              نگاهی نزدیک‌تر به مواد، آدم‌ها و مسیری که پشت هر محصول جریان دارد.
            </p>
          </div>
        </div>
        <div className="hero-media-motion"><div
          className={`story-stage${secondary.length ? "" : " story-stage--single"}`}
          dir="rtl"
          onTouchStart={(e) => {
            swipe.current = {
              x: e.touches[0].clientX,
              y: e.touches[0].clientY,
            };
          }}
          onTouchEnd={(e) => {
            if (!swipe.current) return;
            const dx = e.changedTouches[0].clientX - swipe.current.x;
            const dy = e.changedTouches[0].clientY - swipe.current.y;
            if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy))
              go(dx > 0 ? 1 : -1);
            swipe.current = null;
          }}
        >
          <button
            type="button"
            className="story-card story-card--featured"
            onClick={() => setViewer(story)}
            aria-label={
              story.video
                ? `پخش فیلم: ${story.title}`
                : `نمایش تصویر: ${story.title}`
            }
            key={story.image}
          >
            <img
              src={story.image}
              style={{ objectPosition: story.position }}
              alt={story.title}
              fetchPriority="high"
            />
            <span className="story-shade" />
            <span className="story-badge">
              <span />
              {story.category}
            </span>
            <span className="feature-play">
              <Icon name={story.video ? "play" : "plus"} size={33} />
            </span>
            <span className="story-caption">
              <span className="story-title">{story.title}</span>
              <span className="story-subtitle" dir="rtl">
                {story.subtitle}
              </span>
            </span>
            <span className="story-type">{story.video ? "فیلم" : "عکس"}</span>
          </button>
          <div className="secondary-stories">
            {secondary.map((item) => (
              <button
                className="story-card story-card--small"
                type="button"
                key={item.image}
                onClick={() => setActive(available.indexOf(item))}
                aria-label={`انتخاب روایت: ${item.title}`}
              >
                <img
                  src={item.image}
                  style={{ objectPosition: item.position }}
                  alt=""
                />
                <span className="story-shade" />
                <span className="story-small-label">{item.category}</span>
                <span className="story-caption">
                  <span className="story-title">{item.title}</span>
                  <span className="story-subtitle" dir="rtl">
                    {item.subtitle}
                  </span>
                </span>
                <span className="story-corner">
                  <Icon name="plus" size={18} />
                </span>
              </button>
            ))}
          </div>
        </div>
        </div><div className="hero-toolbar">
          <div className="story-pagination" dir="rtl">
            <span className="story-count" aria-live="polite" aria-atomic="true">
              {fa(String(index + 1).padStart(2, "0"))}{" "}
              <span>/ {fa(String(available.length).padStart(2, "0"))}</span>
            </span>
            <div className="story-progress" aria-hidden="true">
              <span
                style={{
                  width: `${100 / available.length}%`,
                  transform: `translateX(${-index * 100}%)`,
                }}
              />
            </div>
            <div className="story-arrows">
              <RoundButton
                label="روایت قبلی"
                name="right"
                onClick={() => go(-1)}
                disabled={available.length < 2}
              />
              <RoundButton
                label="روایت بعدی"
                name="left"
                className="round-button--blue"
                onClick={() => go(1)}
                disabled={available.length < 2}
              />
            </div>
          </div>
          <div className="story-tabs" role="tablist" aria-label="نوع روایت">
            {filters.map((tab) => (
              <button
                key={tab.id}
                id={`story-tab-${tab.id}`}
                type="button"
                role="tab"
                aria-selected={filter === tab.id}
                aria-controls="story-filter-description"
                tabIndex={filter === tab.id ? 0 : -1}
                onClick={() => {
                  setFilter(tab.id);
                  setActive(0);
                }}
                onKeyDown={(e) => {
                  if (
                    !["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)
                  )
                    return;
                  e.preventDefault();
                  const n =
                    e.key === "Home"
                      ? 0
                      : e.key === "End"
                        ? filters.length - 1
                        : (filters.findIndex((x) => x.id === filter) +
                            (e.key === "ArrowLeft" ? 1 : -1) +
                            filters.length) %
                          filters.length;
                  setFilter(filters[n].id);
                  setActive(0);
                  document
                    .getElementById(`story-tab-${filters[n].id}`)
                    ?.focus();
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <Link to="/#about" className="button button--dark hero-cta">
            دنیای آویژه را کشف کنید
            <Icon />
          </Link>
        </div>
        <p
          id="story-filter-description"
          role="tabpanel"
          aria-labelledby={`story-tab-${filter}`}
          className="sr-only"
        >
          {story.description}
        </p>
        <div className="hero-footnote" dir="rtl">
          <span>مواد، آدم‌ها، امکان‌ها.</span>
          <span>
            برای کشف بیشتر، پایین بروید <span aria-hidden="true">↓</span>
          </span>
        </div>
      </div>
      <SurfaceDialog
        open={!!viewer}
        onClose={() => setViewer(null)}
        titleId="story-viewer-title"
        className="media-dialog"
      >
        {viewer && (
          <>
            <div className="dialog-topbar">
              <div>
                <Eyebrow>{viewer.category}</Eyebrow>
                <h2 id="story-viewer-title">{viewer.title}</h2>
              </div>
              <RoundButton
                label="بستن نمایشگر"
                name="close"
                onClick={() => setViewer(null)}
              />
            </div>
            {viewer.video ? (
              <video
                controls
                autoPlay
                playsInline
                preload="metadata"
                poster={viewer.poster}
                src={viewer.video}
              />
            ) : (
              <img
                className="story-viewer-image"
                src={viewer.image}
                alt={viewer.title}
              />
            )}
            <p className="media-description">{viewer.description}</p>
          </>
        )}
      </SurfaceDialog>
    </section>
  );
}
