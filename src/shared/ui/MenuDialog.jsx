import { Link } from "react-router-dom";
import {
  Eyebrow,
  Icon,
  NAV_ITEMS,
  RoundButton,
  SurfaceDialog,
  Wordmark,
} from "./DesignSystem";
export const MENU = NAV_ITEMS;
export function MenuDialog({ open, onClose }) {
  return (
    <SurfaceDialog
      open={open}
      onClose={onClose}
      fullScreen
      titleId="menu-title"
      className="menu-dialog"
    >
      <div id="site-menu" className="menu-surface container">
        <div className="menu-top" dir="rtl">
          <Wordmark />
          <RoundButton label="بستن منو" name="close" onClick={onClose} />
        </div>
        <div className="menu-body">
          <div className="menu-intro">
            <Eyebrow>دنیای آویژه</Eyebrow>
            <h2 id="menu-title" dir="rtl">
              از شناخت مواد،
              <br />
              تا ساختن امکان‌ها.
            </h2>
            <p>به دنیای پویا شیمی آویژه خوش آمدید.</p>
          </div>
          <nav aria-label="همهٔ بخش‌ها">
            {NAV_ITEMS.map((item) => (
              <Link key={item.id} to={`/#${item.id}`} onClick={onClose}>
                <span>
                  {item.label}
                  <small dir="rtl">{item.description}</small>
                </span>
                <Icon />
              </Link>
            ))}
          </nav>
        </div>
        <div className="menu-bottom">
          <span>پویا شیمی آویژه</span>
          <span dir="rtl">مواد، آدم‌ها، امکان‌ها.</span>
        </div>
      </div>
    </SurfaceDialog>
  );
}
