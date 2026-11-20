import { Link } from "react-router-dom";
import { CONTACT } from "../../data/contact";
import {
  Eyebrow,
  Icon,
  NAV_ITEMS,
  Wordmark,
} from "../../shared/ui/DesignSystem";

export function FooterSection() {
  const sample = CONTACT.email.endsWith("@example.com");
  return (
    <footer id="contact" className="site-footer">
      <div className="container">
        <div className="footer-invitation" data-enter>
          <div>
            <Eyebrow light>راه‌های ارتباط با آویژه</Eyebrow>
            <h2>
              گفت‌وگو،
              <br />
              شروع اتفاق‌های خوب.
            </h2>
          </div>
          <div className="footer-invitation-aside">
            <p>
              برای شناخت محصولات و مطرح کردن نیازهای تولیدتان، با پویا شیمی
              آویژه در ارتباط باشید.
            </p>
            <span className="footer-monogram" aria-hidden="true">
              آویژه
            </span>
          </div>
        </div>
        <div className="footer-grid">
          <div className="footer-brand">
            <Wordmark light />
            <p>رزین‌های پلی‌استر غیراشباع و پراکسیدهای آلی؛ همراه با صنعت.</p>
            <span dir="rtl">مواد، آدم‌ها، امکان‌ها.</span>
          </div>
          <nav aria-label="دسترسی سریع">
            <h3>دنیای آویژه</h3>
            {NAV_ITEMS.filter((item) => item.id !== "contact").map((item) => (
              <Link to={`/#${item.id}`} key={item.id}>
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="footer-contact">
            <h3>راه‌های ارتباطی</h3>
            {CONTACT.phones.map((phone) => (
              <div className="contact-line" key={phone.tel}>
                <Icon name="phone" size={18} />
                {sample ? (
                  <span dir="ltr">{phone.label}</span>
                ) : (
                  <a href={`tel:${phone.tel}`} dir="ltr">
                    {phone.label}
                  </a>
                )}
              </div>
            ))}
            <div className="contact-line">
              <Icon name="mail" size={18} />
              {sample ? (
                <span dir="ltr">{CONTACT.email}</span>
              ) : (
                <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
              )}
            </div>
            {sample && (
              <small className="contact-placeholder-note">
                اطلاعات تماس نمونه است و پیش از انتشار تکمیل می‌شود.
              </small>
            )}
          </div>
          <div className="footer-address">
            <h3>اینجا آویژه است</h3>
            <div className="contact-line">
              <Icon name="location" size={20} />
              <address>{CONTACT.address}</address>
            </div>
            <span className="footer-location-word" dir="rtl">
              پیوندی از
              <br />
              جنس شیمی.
            </span>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© ۱۴۰۵ پویا شیمی آویژه. تمامی حقوق محفوظ است.</p>
          <button
            className="back-to-top"
            type="button"
            onClick={() =>
              window.scrollTo({
                top: 0,
                behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
                  .matches
                  ? "instant"
                  : "smooth",
              })
            }
          >
            بازگشت به بالا
            <Icon name="up" size={19} />
          </button>
        </div>
      </div>
    </footer>
  );
}
