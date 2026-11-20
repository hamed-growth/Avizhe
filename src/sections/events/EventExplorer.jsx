import { useRef, useState } from "react";
import { EVENTS } from "../../data/events";
import { fa } from "../../shared/theme";
import {
  Eyebrow,
  RoundButton,
  SurfaceDialog,
} from "../../shared/ui/DesignSystem";

export function EventExplorer({ event, onClose, onYear }) {
  const items = [
    { type: "photo", src: event.cover },
    ...event.videos.map((v) => ({ ...v, type: "video" })),
    ...event.photos
      .filter((src) => src !== event.cover)
      .map((src) => ({ type: "photo", src })),
  ];
  const [index, setIndex] = useState(0);
  const swipe = useRef(null);
  const item = items[index];
  const go = (step) =>
    setIndex((current) => (current + step + items.length) % items.length);
  return (
    <SurfaceDialog
      onClose={onClose}
      fullScreen
      titleId="event-explorer-title"
      className="event-explorer"
    >
      <div className="explorer-topbar">
        <div>
          <span className="explorer-brand" dir="rtl">
            آویژه / رویدادها
          </span>
          <span className="explorer-breadcrumb">
            رویدادها / {fa(event.year)}
          </span>
        </div>
        <RoundButton label="بستن گالری رویداد" name="close" onClick={onClose} />
      </div>
      <div
        className="event-explorer-body"
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
            e.preventDefault();
            go(e.key === "ArrowLeft" ? 1 : -1);
          }
        }}
      >
        <div className="event-gallery-main">
          <div
            className="gallery-stage"
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
            {item.type === "video" ? (
              <video
                key={item.src}
                src={item.src}
                poster={item.poster}
                controls
                playsInline
                preload="metadata"
              />
            ) : (
              <img
                key={item.src}
                src={item.src}
                alt={`تصویر ${fa(index + 1)} از ${event.title}`}
              />
            )}
          </div>
          {items.length > 1 && (
            <>
              <div className="gallery-controls">
                <div>
                  <RoundButton
                    label="تصویر قبلی"
                    name="right"
                    onClick={() => go(-1)}
                  />
                  <RoundButton
                    label="تصویر بعدی"
                    name="left"
                    className="round-button--blue"
                    onClick={() => go(1)}
                  />
                </div>
                <span aria-live="polite">
                  {fa(index + 1)} / {fa(items.length)}
                </span>
              </div>
              <div
                className="gallery-filmstrip"
                aria-label="تصاویر و فیلم‌های رویداد"
              >
                {items.map((media, n) => (
                  <button
                    key={media.src}
                    type="button"
                    aria-label={`نمایش ${media.type === "video" ? "فیلم" : "تصویر"} ${fa(n + 1)}`}
                    aria-pressed={n === index}
                    className={n === index ? "selected" : ""}
                    onClick={() => setIndex(n)}
                  >
                    <img
                      src={media.type === "video" ? media.poster : media.src}
                      alt=""
                      loading="lazy"
                    />
                    {media.type === "video" && (
                      <span aria-hidden="true">▶</span>
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
        <aside className="event-gallery-info">
          <div className="year-tabs">
            {[...EVENTS].reverse().map((e) => (
              <button
                key={e.year}
                type="button"
                className={e.year === event.year ? "selected" : ""}
                aria-pressed={e.year === event.year}
                onClick={() => onYear(e.year)}
              >
                {fa(e.year)}
              </button>
            ))}
          </div>
          <div>
            <Eyebrow>آرشیو رویدادهای آویژه</Eyebrow>
            <span className="event-year">{fa(event.year)}</span>
            <h2 id="event-explorer-title">{event.title}</h2>
            <p>{event.summary}</p>
            {event.upcoming ? (
              <p className="upcoming-message">
                گالری این رویداد پس از برگزاری تکمیل می‌شود.
              </p>
            ) : (
              <div className="gallery-media-meta">
                <span>{fa(event.photos.length)} عکس</span>
                <span>{fa(event.videos.length)} ویدیو</span>
              </div>
            )}
          </div>
          <span className="gallery-signoff" dir="rtl">
            آدم‌ها، دیدارها، ارتباط‌ها.
          </span>
        </aside>
      </div>
    </SurfaceDialog>
  );
}
