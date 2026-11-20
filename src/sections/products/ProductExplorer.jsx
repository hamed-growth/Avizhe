import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { fa, normalizeSearch } from "../../shared/theme";
import {
  Eyebrow,
  Icon,
  RoundButton,
  SurfaceDialog,
} from "../../shared/ui/DesignSystem";

export function ProductExplorer({ cat, onClose }) {
  const [gradeId, setGradeId] = useState(() => {
    const grade = new URLSearchParams(window.location.search).get("grade");
    return cat.products.some((p) => p.id === grade)
      ? grade
      : cat.products[0].id;
  });
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const product = cat.products.find((p) => p.id === gradeId) || cat.products[0];
  const filtered = cat.products.filter((p) =>
    normalizeSearch(`${p.code} ${p.name} ${p.type}`).includes(
      normalizeSearch(query),
    ),
  );
  const contact = () =>
    navigate(
      { pathname: "/", hash: "#contact" },
      { replace: true, preventScrollReset: true },
    );
  return (
    <SurfaceDialog
      onClose={onClose}
      fullScreen
      titleId="product-explorer-title"
      className="product-explorer"
    >
      <div className="explorer-topbar">
        <div>
          <span className="explorer-brand" dir="rtl">
            آویژه / محصولات
          </span>
          <span className="explorer-breadcrumb">محصولات / {cat.name}</span>
        </div>
        <RoundButton label="بستن جزئیات محصول" name="close" onClick={onClose} />
      </div>
      <div className="product-explorer-grid">
        <aside className="product-explorer-media">
          <img src={product.image || cat.image} alt={cat.name} />
          <div>
            <Eyebrow light>دنیای مواد آویژه</Eyebrow>
            <span dir="rtl">
              {cat.slug === "resins"
                ? "فراتر از\nیک ماده."
                : "آغاز یک\nمسیر تازه."}
            </span>
            <p>{cat.name}</p>
          </div>
        </aside>
        <div className="product-explorer-content">
          <Eyebrow>کاتالوگ محصولات</Eyebrow>
          <h2 id="product-explorer-title">{cat.name}</h2>
          <p className="section-description">{cat.description}</p>
          {cat.products.length > 1 && (
            <div className="grade-selector">
              <label className="search-field">
                <Icon name="search" size={20} />
                <input
                  type="search"
                  placeholder="جست‌وجوی نام یا کد گرید..."
                  aria-label="جست‌وجوی گرید محصول"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </label>
              <div className="grade-options" aria-label="انتخاب گرید">
                {filtered.map((grade) => (
                  <button
                    type="button"
                    key={grade.id}
                    className={grade.id === product.id ? "selected" : ""}
                    aria-pressed={grade.id === product.id}
                    onClick={() => setGradeId(grade.id)}
                  >
                    <span dir="ltr">{grade.code}</span>
                    <span>{grade.type}</span>
                  </button>
                ))}
                {!filtered.length && (
                  <p className="empty-state" role="status">
                    گریدی با این عبارت پیدا نشد. نام یا کد دیگری را امتحان کنید.
                  </p>
                )}
              </div>
              <p className="grade-counter">
                {fa(filtered.length)} گرید از {fa(cat.products.length)} گرید
              </p>
            </div>
          )}
          <div className="grade-detail" key={product.id} aria-live="polite">
            <div className="grade-title">
              <span className="pill pill--blue" dir="ltr">
                {product.code}
              </span>
              <span className="muted">{product.type}</span>
            </div>
            <h3>{product.name}</h3>
            <p className="grade-summary">{product.summary}</p>
            <div className="product-detail-lists">
              {[
                { title: "ویژگی‌ها", items: product.features },
                { title: "کاربردها", items: product.uses },
              ].map((list) => (
                <div key={list.title}>
                  <h4>{list.title}</h4>
                  <ul>
                    {list.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="specifications">
              <h4>مشخصات فنی</h4>
              <dl>
                {product.specs.map((spec) => (
                  <div key={spec.label}>
                    <dt>{spec.label}</dt>
                    <dd>{spec.value}</dd>
                  </div>
                ))}
              </dl>
              {product.specs.every((spec) => spec.value === "—") && (
                <p className="data-note">
                  مشخصات فنی این گرید هنوز در کاتالوگ ثبت نشده است.
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            className="button button--blue product-inquiry"
            onClick={contact}
          >
            درخواست اطلاعات و مشاوره
            <Icon />
          </button>
        </div>
      </div>
    </SurfaceDialog>
  );
}
