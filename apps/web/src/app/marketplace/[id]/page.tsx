import { apiGet } from "@/utils/api";
import Link from "next/link";
import { ShieldCheck, Truck, BadgeCheck, Star, MapPin } from "lucide-react";
import ProductReviews from "@/components/reviews/ProductReviews";
import ProductImageGallery from "@/components/product/ProductImageGallery";
import SyncScroll from "@/components/utils/SyncScroll";
import ExploreInterests from "@/components/recommendations/ExploreInterests";
import DescriptionClamp from "@/components/common/DescriptionClamp";
import AddToCartControl from "@/components/product/AddToCartControl";
import AttributePicker from "@/components/product/AttributePicker";
import QtySelectControl from "@/components/product/QtySelectControl";
import BulkPricingTiers from "@/components/product/BulkPricingTiers";
import { defaultLocale, translate, Locale } from "@/utils/i18n";
import { formatCurrency } from "@/utils/format";
type Product = {
  _id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  images?: string[];
  brand?: string;
  discount?: number;
  rating?: number;
  shippingOptions?: { method: string; cost: number; estimatedDays: number }[];
  category?: string;
  attributes?: Record<string, string | string[]>;
  location?: { country: string; city?: string };
  quantity?: number;
  minOrderQuantity?: number;
  bulkPricing?: Array<{
    minQuantity: number;
    maxQuantity?: number;
    pricePerUnit?: number;
    discountPercent?: number;
  }>;
  variants?: Array<{ sku?: string; price?: number; quantity: number; attributes: Record<string, string> }>;
  seller?: { username?: string; store?: { name?: string } };
  views?: number;

};

type ProductResponse = { status: string; data: Product };
type Category = { _id: string; name: string; slug: string; parentId?: string };
type CategoriesResponse = { status: string; data: Category[] };
// Review types kept for future API-powered reviews
// type Review = { _id: string; rating: number; comment?: string };
// type ReviewsData = { reviews: Review[]; total: number };
// type ReviewsResponse = { status: string; data: ReviewsData };
// Cache product detail pages at the edge for 5 minutes
export const revalidate = 300;

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const locale = defaultLocale as Locale;

  const [productRes, categoriesRes] = await Promise.all([
    apiGet<ProductResponse>(`/api/v1/market/products/${id}`, {
      next: { revalidate: 300 } // Revalidate every 5 minutes
    }),
    apiGet<CategoriesResponse>(`/api/v1/market/categories`, {
      next: { revalidate: 3600 } // Revalidate every 1 hour
    }).catch(() => ({ status: "success", data: [] } as CategoriesResponse)),
  ]);
  const product = productRes.data;
  const categories = categoriesRes.data || [];

  // Check if product exists
  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">{translate(locale, "product.notFound")}</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">{translate(locale, "product.notFoundDesc")}</p>
          <Link href="/marketplace" className="bg-emerald-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-emerald-700 transition-colors text-sm sm:text-base font-medium">
            {translate(locale, "product.backToMarket")}
          </Link>
        </div>
      </div>
    );
  }

  // Use the product's stored rating instead of calculating from reviews
  // The rating field has been updated by our rating system
  const averageRating = product.rating || 0;

  // Build dynamic breadcrumb trail from category parent chain
  const slugToCategory = new Map<string, Category>();
  const nameToCategory = new Map<string, Category>();
  for (const c of categories) {
    slugToCategory.set(c.slug, c);
    nameToCategory.set(c.name, c);
  }
  const trail: Category[] = [];
  let current: Category | undefined = nameToCategory.get(product.category as string);
  if (current) {
    trail.push(current);
    while (current.parentId) {
      const parent = slugToCategory.get(current.parentId);
      if (!parent) break;
      trail.push(parent);
      current = parent;
    }
    trail.reverse();
  }

  // Fetch kept for future use; mocked UI below mirrors the provided reference layout
  // let reviews: ReviewsData = { reviews: [], total: 0 };
  // try {
  //   const rev = await apiGet<ReviewsResponse>(
  //     `/api/v1/market/products/${id}/reviews`,
  //     { query: { limit: 5 } }
  //   );
  //   reviews = rev.data;
  // } catch { }

  const discounted = typeof product.discount === 'number' && product.discount > 0
    ? Math.max(0, Math.round((product.price * (100 - product.discount)) / 100))
    : undefined;
  const colorName = (product.attributes?.Color || product.attributes?.color || "").toString();
  const colorSwatch = (name: string): string => {
    const n = name.toLowerCase();
    if (n.includes("black")) return "#111827";
    if (n.includes("white")) return "#e5e7eb";
    if (n.includes("gray") || n.includes("grey")) return "#9ca3af";
    if (n.includes("blue")) return "#3b82f6";
    if (n.includes("red")) return "#ef4444";
    if (n.includes("green")) return "#10b981";
    if (n.includes("yellow")) return "#f59e0b";
    if (n.includes("purple")) return "#8b5cf6";
    if (n.includes("pink")) return "#ec4899";
    if (n.includes("orange")) return "#f97316";
    if (n.includes("brown")) return "#a16207";
    return "#6b7280";
  };
  // compute shipping info if needed in future (not used in UI copy yet)
  // const hasFreeShipping = product.shippingOptions?.some((s) => (s.cost ?? 0) === 0);
  // const eta = product.shippingOptions?.reduce((min, s) => (
  //   typeof s.estimatedDays === 'number' && s.estimatedDays < min ? s.estimatedDays : min
  // ), Number.MAX_SAFE_INTEGER);

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900">


      <div className="mx-auto max-w-7xl px-3 sm:px-4 py-4 sm:py-6 lg:px-8 lg:py-8">
        {/* Breadcrumbs */}
        <nav className="mb-3 text-xs sm:text-sm text-neutral-500">
          <Link href="/" className="hover:underline text-neutral-600">{translate(locale, "nav.home")}</Link>
          {trail.length ? (
            <>
              {trail.map((c, idx) => (
                <span key={c.slug}>
                  <span className="mx-1 sm:mx-2">›</span>
                  {idx < trail.length - 1 ? (
                    <Link href={`/marketplace?category=${encodeURIComponent(c.name)}`} className="hover:underline">{c.name}</Link>
                  ) : (
                    <span className="text-neutral-700">{c.name}</span>
                  )}
                </span>
              ))}
            </>
          ) : null}
        </nav>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 items-start lg:min-h-[calc(100vh-120px)]">
          {/* Sync right wheel to left scroll on desktop; allow full left scroll range */}
          <SyncScroll leftId="pd-left" rightId="pd-right" bottomAlignTargetId="pd-left-end" offset={0} mode="full" />
          {/* Gallery (left) */}
          <div id="pd-left" className="w-full lg:h-full lg:overflow-y-auto lg:pr-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <ProductImageGallery images={product.images || []} title={product.title} />
            {/* Reviews under gallery (desktop only) */}
            <div className="mt-8 hidden lg:block">
              <ProductReviews productId={product._id} productTitle={product.title} locale={locale} />
            </div>
            {/* bottom sentinel for alignment */}
            <div id="pd-left-end" className="h-1" />
          </div>

          {/* Summary (right) */}
          <div id="pd-right" tabIndex={0} className="w-full lg:sticky lg:top-[76px] lg:max-h-[calc(100vh-100px)] lg:overflow-y-auto lg:self-start focus:outline-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold leading-tight">{product.title}</h1>

            <div className="mt-3 sm:mt-4">
              <h3 className="text-sm sm:text-base font-semibold mb-2">{translate(locale, "product.description")}</h3>
              <DescriptionClamp text={product.description} clampLines={2} locale={locale} />
            </div>

            {/* rating row */}
            <div className="mt-2 flex flex-col sm:flex-row sm:items-center gap-2 text-sm justify-between">
              <span className="flex flex-row sm:items-center gap-1 sm:gap-2">
                <span className="text-neutral-500">
                  {(product.views || 0) > 0 ? (
                    (product.views || 0) >= 1000
                      ? `${((product.views || 0) / 1000).toFixed(1)}k+ ${translate(locale, "product.views")}`
                      : `${product.views || 0}+ ${translate(locale, "product.views")}`
                  ) : (
                    translate(locale, "product.newProduct")
                  )}
                </span>
                {/* SINGLE VENDOR MODE: Vendor info removed */}
              </span>
              {averageRating > 0 ? (
                <span className="inline-flex items-center gap-2">
                  <span className="text-sm sm:text-lg">{averageRating.toFixed(1)}</span>
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={14}
                        className={`sm:w-4 sm:h-4 ${star <= Math.round(averageRating)
                          ? "fill-neutral-900 text-neutral-900 dark:fill-neutral-100 dark:text-neutral-100"
                          : "text-neutral-300 dark:text-neutral-600"
                          }`}
                      />
                    ))}
                  </div>
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 text-neutral-500">
                  <span className="text-xs sm:text-sm">{translate(locale, "product.noReviews")}</span>
                </span>
              )}
            </div>

            {/* price area (responsive) */}
            <div className="mt-3 flex flex-row items-baseline justify-between gap-2 sm:gap-4">
              <div className="inline-flex w-auto items-baseline rounded px-3 py-1.5 text-orange-500 bg-orange-50 dark:text-range-900 dark:bg-range-900/20">
                <span className="text-3xl md:text-4xl font-extrabold leading-none">{formatCurrency(discounted ?? product.price)}</span>
                <span className="text-xs font-semibold ml-1 leading-none">{product.currency}</span>
              </div>
              {discounted !== undefined ? (
                <div className="inline-flex items-baseline gap-2">
                  <span className="line-through text-neutral-500 dark:text-neutral-200 text-xs sm:text-sm">{formatCurrency(product.price)} <span className="text-[10px] sm:text-xs">{product.currency}</span></span>
                  <span className="rounded bg-rose-500 text-white text-xs sm:text-sm px-2 py-0.5">-{product.discount}% {translate(locale, "product.off")}</span>
                </div>
              ) : null}
            </div>

            {/* shipping/credit band */}
            <div className="mt-3 rounded border border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20 px-3 py-2 font-semibold text-xs sm:text-sm w-fit flex items-center gap-4">
              {product.shippingOptions && product.shippingOptions.length > 0 ? (
                product.shippingOptions.some(option => option.cost === 0) ? (
                  <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-300">
                    <Truck size={14} className="sm:w-4 sm:h-4" /> {translate(locale, "product.shipping.freeAvailable")}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-300">
                    <Truck size={14} className="sm:w-4 sm:h-4" /> From {product.currency} {formatCurrency(Math.min(...product.shippingOptions.map(opt => opt.cost)))}
                  </span>
                )
              ) : (
                <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-300">
                  <Truck size={14} className="sm:w-4 sm:h-4" /> {translate(locale, "product.shipping.freeAvailable")}
                </span>
              )}
              <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-300">
                <BadgeCheck size={14} className="sm:w-4 sm:h-4" /> {translate(locale, "product.securePayments")}
              </span>
            </div>

            {/* region info */}
            {product.location?.country || product.location?.city ? (
              <div className="mt-3 text-xs sm:text-sm text-neutral-600 inline-flex items-center gap-2">
                <MapPin size={14} className="sm:w-4 sm:h-4 text-neutral-500" />
                <span>{[product.location?.city, product.location?.country].filter(Boolean).join(", ")}</span>
              </div>
            ) : null}

            {/* Bulk Pricing Tiers */}
            {product.bulkPricing && product.bulkPricing.length > 0 && (
              <BulkPricingTiers
                productId={product._id}
                price={product.price}
                currency={product.currency}
                tiers={product.bulkPricing}
                locale={locale}
              />
            )}

            {/* options */}
            <div className="mt-3 sm:mt-4 space-y-3">
              {/* Attributes (preferred) or fallback Color row */}
              {product.attributes && Object.keys(product.attributes).length ? (
                <AttributePicker productId={product._id} attributes={product.attributes as any} locale={locale} />
              ) : (
                <div className="flex items-center gap-3 text-xs sm:text-sm">
                  <span className="w-12 text-black font-semibold">{translate(locale, "product.color")}</span>
                  <div className="flex items-center gap-2">
                    <button
                      className="h-6 w-6 sm:h-7 sm:w-7 rounded-full border border-neutral-300"
                      aria-label={colorName || "color"}
                      style={{ backgroundColor: colorSwatch(colorName) }}
                      title={colorName}
                    />
                    {colorName ? <span className="text-neutral-600 text-xs sm:text-sm">{colorName}</span> : null}
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3 text-xs sm:text-sm">
                <span className="w-12 text-black font-semibold">{translate(locale, "product.qty")}</span>
                <div className="flex flex-col gap-1">
                  <QtySelectControl
                    productId={product._id}
                    minQty={Math.max(1, Number(product.minOrderQuantity || 1))}
                    maxQty={(() => {
                      try {
                        // derive from selected variant if we have a current variant label
                        const el = typeof document !== 'undefined' ? document.getElementById(`variant-label-${product._id}`) : null;
                        const label = el?.textContent || '';
                        if (label && Array.isArray(product.variants) && product.variants.length) {
                          const parsed: Record<string, string> = Object.fromEntries(label.split('|').map(p => p.trim()).filter(Boolean).map(kv => kv.split(':').map(s => s.trim()) as [string, string]));
                          const match = product.variants.find(v => Object.entries(parsed).every(([k, vv]) => (v.attributes || {})[k] === vv));
                          if (match) return Math.max(0, Number(match.quantity || 0));
                        }
                      } catch { }
                      return Math.max(0, Number(product.quantity || 0));
                    })()}
                    locale={locale}
                    className="w-20 rounded-full border border-neutral-300 bg-white dark:bg-neutral-900 px-3 sm:px-4 py-2 text-xs sm:text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-neutral-400 focus:border-neutral-400 transition"
                  />
                  {(product.minOrderQuantity ?? 1) > 1 && (
                    <span className="text-[10px] sm:text-xs text-amber-600 dark:text-amber-400 font-medium">
                      {translate(locale, "product.minOrder")}: {product.minOrderQuantity} units
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-5">
              <AddToCartControl
                productId={product._id}
                variantLabel={colorName || undefined}
                minQty={Math.max(1, Number(product.minOrderQuantity || 1))}
                maxQty={Math.max(0, Number(product.quantity || 0))}
                locale={locale}
              />
            </div>

            {/* attributes moved above Qty inside options */}

            <div className="mt-3 sm:mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              <div className="rounded border border-neutral-200 dark:border-neutral-800 p-3 flex items-center gap-2 text-xs sm:text-sm">
                <Truck size={14} className="sm:w-4 sm:h-4" />
                {product.shippingOptions && product.shippingOptions.length > 0 ? (
                  product.shippingOptions.some(option => option.cost === 0) ? (
                    translate(locale, "product.shipping.freeAvailable")
                  ) : (
                    `${translate(locale, "product.shipping.from")} ${product.currency} ${formatCurrency(Math.min(...product.shippingOptions.map(opt => opt.cost)))}`
                  )
                ) : (
                  translate(locale, "product.shipping.freeOnOrders")
                )}
              </div>
              <div className="rounded border border-neutral-200 dark:border-neutral-800 p-3 flex items-center gap-2 text-xs sm:text-sm">
                <ShieldCheck size={14} className="sm:w-4 sm:h-4" /> {translate(locale, "product.securePaymentsPrivacy")}
              </div>
            </div>
          </div>
        </div>

        {/* Reviews: placed below both sections on mobile */}
        <div className="lg:hidden mt-10 border-t border-neutral-100 dark:border-neutral-800 pt-8">
          <ProductReviews productId={product._id} productTitle={product.title} locale={locale} />
        </div>

        {/* Explore your interests */}
        <div className="mt-12 border-t border-neutral-100 dark:border-neutral-800 pt-8 mb-12">
          <ExploreInterests productId={product._id} seedBrand={product.brand} seedCategory={product.category} locale={locale} />
        </div>
      </div>

      {/* Sticky Mobile Add to Cart Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 p-3 z-40 flex items-center justify-between shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <div className="flex flex-col">
          <span className="text-[10px] text-neutral-500 font-semibold uppercase tracking-wider">{translate(locale, "product.price")}</span>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold text-orange-600">{formatCurrency(discounted ?? product.price)}</span>
            <span className="text-[10px] text-neutral-400 font-medium">{product.currency}</span>
          </div>
        </div>
        <div className="w-[60%]">
          <AddToCartControl
            productId={product._id}
            variantLabel={colorName || undefined}
            minQty={Math.max(1, Number(product.minOrderQuantity || 1))}
            maxQty={Math.max(0, Number(product.quantity || 0))}
            locale={locale}
          />
        </div>
      </div>
      {/* Spacer for sticky bar on mobile */}
      <div className="lg:hidden h-20" />
    </div>
  );
}
