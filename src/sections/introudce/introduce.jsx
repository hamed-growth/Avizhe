import { Link } from "react-router-dom";
import { Eyebrow, Icon } from "../../shared/ui/DesignSystem";
export function IntroduceSection() {
  return (
    <section
      className="about-section section-space"
      id="about"
      aria-labelledby="about-title"
    >
      <div className="container about-grid" data-enter>
        <div className="about-copy">
          <Eyebrow>داستان آویژه</Eyebrow>
          <h2 id="about-title">
            پشت هر محصول،
            <br />
            یک دنیای در حرکت.
          </h2>
          <p>
            پویا شیمی آویژه در زمینهٔ رزین‌های پلی‌استر غیراشباع و پراکسیدهای آلی
            فعالیت می‌کند. دنیای ما، نقطهٔ تلاقی مواد، فرایندها و آدم‌هاست.
          </p>
          <p className="muted">
            از شناخت نیاز شما تا انتخاب محصول متناسب با فرایند تولید، اینجا مسیر
            آشنایی و گفت‌وگو باز است.
          </p>
          <Link to="/#products" className="text-link">
            با محصولات آشنا شوید
            <Icon />
          </Link>
        </div>
        <div className="about-visual">
          <img
            src="/media/hero/industry.webp"
            alt="یکی از کارکنان پویا شیمی آویژه در فضای کارخانه"
            loading="lazy"
          />
          <div className="about-image-caption">
            <span dir="rtl">
              آدم‌ها.
              <br />
              فرایندها.
              <br />
              امکان‌ها.
            </span>
            <span className="image-stamp" aria-hidden="true">
              آویژه
            </span>
          </div>
        </div>
      </div>
      <div className="container material-strip">
        <span dir="rtl">همراهیِ خوب، از اینجا شروع می‌شود.</span>
        <span>مواد اولیه. ارتباط ماندگار.</span>
        <span className="strip-mark" aria-hidden="true">
          ✳
        </span>
      </div>
    </section>
  );
}
