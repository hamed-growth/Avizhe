import { CATEGORIES, getCategory } from "../../data/products";
import { fa } from "../../shared/theme";
import {
  Icon,
  SectionHeading,
  useHashExplorer,
} from "../../shared/ui/DesignSystem";
import { ProductExplorer } from "./ProductExplorer";

export function ProductsSection() {
  const explorer = useHashExplorer("products");
  const cat = getCategory(explorer.value);
  return (
    <section
      className="products-section section-space"
      id="products"
      aria-labelledby="products-title"
    >
      <div className="container">
        <SectionHeading
          id="products-title"
          label="محصولات آویژه"
          title={
            <>
              مواد درست.
              <br />
              امکان‌های بیشتر.
            </>
          }
          description="دو خانوادهٔ محصول، برای شناخت و انتخاب متناسب با فرایند شما."
        >
          <span className="section-side-note" dir="rtl">
            انتخابی متناسب با صنعت شما.
          </span>
        </SectionHeading>
        <div className="product-grid">
          {CATEGORIES.map((category) => (
            <a
              href={`/#products/${category.slug}`}
              className="product-card"
              key={category.slug}
              data-enter
              onClick={(e) => {
                e.preventDefault();
                explorer.open(category.slug, e.currentTarget);
              }}
            >
              <div className="product-image">
                <img
                  data-card-img={category.slug}
                  src={category.image}
                  alt={category.name}
                  loading="lazy"
                />
                <span className="pill product-count">
                  {fa(category.products.length)}{" "}
                  {category.products.length === 1 ? "محصول" : "گرید محصول"}
                </span>
                <span className="product-image-word" dir="rtl">
                  {category.slug === "resins" ? "رزین‌ها." : "پراکسیدها."}
                </span>
                <span className="product-card-action">
                  <Icon />
                </span>
              </div>
              <div className="product-card-info">
                <div>
                  <h3>{category.name}</h3>
                  <p dir="rtl">
                    {category.slug === "resins"
                      ? "گریدهای متنوع برای فرایندهای مختلف"
                      : "آغازگرهای فرایند پخت رزین"}
                  </p>
                </div>
                <span className="mini-label">مشاهدهٔ محصولات</span>
              </div>
            </a>
          ))}
        </div>
        <div className="product-assistance">
          <div>
            <Icon name="grid" />
            <p>برای انتخاب گرید مناسب، از همین‌جا شروع کنید.</p>
          </div>
          <a href="/#contact" className="text-link">
            گفت‌وگو با آویژه
            <Icon />
          </a>
        </div>
      </div>
      {cat && (
        <ProductExplorer key={cat.slug} cat={cat} onClose={explorer.close} />
      )}
    </section>
  );
}
