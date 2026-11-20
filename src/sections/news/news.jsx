import { useState } from "react";
import { NEWS } from "../../data/news";
import {
  Eyebrow,
  Icon,
  RoundButton,
  SectionHeading,
  SurfaceDialog,
} from "../../shared/ui/DesignSystem";

const Meta = ({ article }) => (
  <div className="article-meta">
    <span>{article.kind}</span>
    <time>{article.date}</time>
  </div>
);
export function NewsSection() {
  const [article, setArticle] = useState(null);
  const [featured, ...rest] = NEWS;
  return (
    <section
      className="news-section section-space"
      id="news"
      aria-labelledby="news-title"
    >
      <div className="container">
        <SectionHeading
          id="news-title"
          label="مجلهٔ آویژه"
          title="از دل صنعت، برای شما."
          description="خبرها و موضوعاتی برای نزدیک‌تر شدن به دنیای آویژه."
        />
        <div className="journal-grid">
          <button
            type="button"
            className="journal-featured"
            onClick={() => setArticle(featured)}
            data-enter
          >
            <div className="journal-image">
              <img
                src={featured.image}
                alt="فضای کارخانهٔ پویا شیمی آویژه"
                loading="lazy"
              />
              <span className="pill">از آویژه بخوانید</span>
              <span className="journal-image-title" dir="rtl">
                از دل
                <br />
                صنعت.
              </span>
            </div>
            <Meta article={featured} />
            <h3>{featured.title}</h3>
            <p>{featured.excerpt}</p>
            <span className="text-link">
              مشاهدهٔ پیش‌نمایش
              <Icon />
            </span>
          </button>
          <div className="journal-list">
            {rest.map((item) => (
              <button
                type="button"
                key={item.id}
                className="journal-list-item"
                onClick={() => setArticle(item)}
                data-enter
              >
                <div>
                  <Meta article={item} />
                  <h3>{item.title}</h3>
                  <span className="journal-read">مشاهدهٔ پیش‌نمایش</span>
                </div>
                <span className="journal-list-icon">
                  <Icon />
                </span>
              </button>
            ))}
            <div className="journal-note">
              <span dir="rtl">با آگاهی، رو به جلو.</span>
              <p>خواندن، آغاز یک نگاه تازه است.</p>
            </div>
          </div>
        </div>
      </div>
      <SurfaceDialog
        open={!!article}
        onClose={() => setArticle(null)}
        titleId="article-title"
        className="article-dialog"
      >
        {article && (
          <article>
            <div className="dialog-topbar">
              <Eyebrow>مجلهٔ آویژه / پیش‌نمایش</Eyebrow>
              <RoundButton
                label="بستن پیش‌نمایش مقاله"
                name="close"
                onClick={() => setArticle(null)}
              />
            </div>
            {article.image && (
              <img className="article-cover" src={article.image} alt="" />
            )}
            <div className="article-content">
              <Meta article={article} />
              <h2 id="article-title">{article.title}</h2>
              {article.excerpt && <p>{article.excerpt}</p>}
              <div className="article-pending">
                <Icon name="grid" />
                <p>
                  این مطلب در مرحلهٔ آماده‌سازی است. متن کامل پس از انتشار در
                  مجلهٔ آویژه در دسترس قرار می‌گیرد.
                </p>
              </div>
              <button
                type="button"
                className="button button--dark"
                onClick={() => setArticle(null)}
              >
                بازگشت به مجله
                <Icon />
              </button>
            </div>
          </article>
        )}
      </SurfaceDialog>
    </section>
  );
}
