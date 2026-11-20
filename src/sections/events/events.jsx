import { useState } from "react";
import { EVENTS, getEvent } from "../../data/events";
import { fa } from "../../shared/theme";
import {
  Eyebrow,
  Icon,
  SectionHeading,
  useHashExplorer,
} from "../../shared/ui/DesignSystem";
import { EventExplorer } from "./EventExplorer";

export function EventsSection() {
  const [year, setYear] = useState(1404);
  const explorer = useHashExplorer("events");
  const selected = getEvent(year) || EVENTS[0];
  const event = getEvent(explorer.value);
  return (
    <section
      className="events-section section-space"
      id="events"
      aria-labelledby="events-title"
    >
      <div className="container">
        <SectionHeading
          id="events-title"
          label="رویدادهای آویژه"
          title="دیدارها، ماندگار می‌شوند."
          description="قاب‌هایی از رویدادها و مسیر همراهی آویژه."
        >
          <div className="year-tabs" aria-label="انتخاب سال رویداد">
            {[...EVENTS].reverse().map((item) => (
              <button
                key={item.year}
                type="button"
                aria-pressed={year === item.year}
                className={year === item.year ? "selected" : ""}
                onClick={() => setYear(item.year)}
              >
                {fa(item.year)}
                {item.upcoming && (
                  <span className="upcoming-dot" aria-label="به‌زودی" />
                )}
              </button>
            ))}
          </div>
        </SectionHeading>
        <div className="event-spotlight" data-enter>
          <a
            href={`/#events/${selected.year}`}
            className="event-spotlight-image"
            onClick={(e) => {
              e.preventDefault();
              explorer.open(selected.year, e.currentTarget);
            }}
            aria-label={`مشاهدهٔ گالری ${selected.title}`}
            data-ev-row={selected.year}
          >
            <img
              key={selected.cover}
              src={selected.cover}
              alt={selected.title}
              loading="lazy"
            />
            <span className="pill event-media-count">
              {selected.upcoming
                ? "به‌زودی"
                : `${fa(selected.photos.length)} عکس · ${fa(selected.videos.length)} ویدیو`}
            </span>
            <span className="event-image-caption" dir="rtl">
              دیدارهایی
              <br />
              برای همراهی.
            </span>
          </a>
          <div className="event-spotlight-copy" key={selected.year}>
            <span className="event-year">{fa(selected.year)}</span>
            <Eyebrow>
              {selected.upcoming ? "رویداد پیش رو" : "آرشیو رویدادها"}
            </Eyebrow>
            <h3>{selected.title}</h3>
            <p>{selected.summary}</p>
            <button
              type="button"
              className="button button--dark"
              onClick={(e) => explorer.open(selected.year, e.currentTarget)}
            >
              {selected.upcoming ? "اطلاعات رویداد" : "تماشای روایت این رویداد"}
              <Icon />
            </button>
          </div>
        </div>
        <div className="event-bottom-line">
          <span>هر دیدار، شروع یک ارتباط تازه.</span>
          <span dir="rtl">با هم، مسیرهای تازه‌ای می‌سازیم.</span>
        </div>
      </div>
      {event && (
        <EventExplorer
          key={event.year}
          event={event}
          onClose={explorer.close}
          onYear={explorer.change}
        />
      )}
    </section>
  );
}
