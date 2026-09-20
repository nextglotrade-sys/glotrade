// import Link from "next/link";
import ProductCard from "./ProductCard";
import type { ProductCardData } from "@/types/product";
import { apiGet } from "@/utils/api";
import MobileCategoryBrowser from "./MobileCategoryBrowser";
import DesktopCategoryTree from "./DesktopCategoryTree";
import ProductFilters from "@/components/filters/ProductFilters";
import MobileQuickChips from "./MobileQuickChips";
import DesktopQuickChips from "./DesktopQuickChips";
import { defaultLocale, translate, Locale } from "@/utils/i18n";
import EmptyState from "@/components/common/EmptyState";

type Product = {
  _id: string;
  title: string;
  price: number;
  currency: string;
  images?: string[];
  likes?: number;
  featured?: boolean;
  brand?: string;
  discount?: number;
  rating?: number;
  shippingOptions?: { method: string; cost: number; estimatedDays: number }[];
  seller?: { username?: string; reputation?: number; isVerified?: boolean };
};

// kept for potential future use on a "Featured" section
// type FeaturedResponse = {
//   status: string;
//   data: Product[];
// };
type Category = { _id: string; name: string; slug: string; parentId?: string };
type CategoriesResponse = { status: string; data: Category[] };
type SearchResponse = {
  status: string;
  data: { products: Product[]; total: number; page: number; totalPages: number };
};

// withParams helper now lives inside reusable components; remove here.

// Cache marketplace listing page at the edge for 60 seconds
export const revalidate = 60;

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;
  const locale = defaultLocale as Locale;

  const selectedCategory = params?.category;
  const minPrice = params?.minPrice;
  const maxPrice = params?.maxPrice;
  const condition = params?.condition;
  const sort = params?.sort;
  const ratingMin = params?.ratingMin;
  const freeShipping = params?.freeShipping;
  const etaMaxDays = params?.etaMaxDays;
  const discountMin = params?.discountMin;

  // Collect attribute filters (attr_*)
  const attributeEntries = Object.entries(params || {}).filter(([k, v]) => k.startsWith("attr_") && v !== "");
  const attributeQuery: Record<string, string> = Object.fromEntries(attributeEntries as [string, string][]);

  const [searchRes, categoriesRes] = await Promise.all([
    apiGet<SearchResponse>("/api/v1/market/products", {
      query: {
        query: params?.q,
        category: selectedCategory,
        minPrice,
        maxPrice,
        condition,
        sort,
        ratingMin,
        freeShipping,
        etaMaxDays,
        discountMin,
        ...attributeQuery,
        limit: 30,
      },
      // CRITICAL: Add ISR to reduce 216K requests/day to ~288/day (99.87% reduction)
      // Revalidate every 5 minutes - balances freshness with performance
      next: { revalidate: 300 }
    }).catch(
      () =>
        ({ status: "success", data: { products: [], total: 0, page: 1, totalPages: 1 } } as SearchResponse)
    ),
    apiGet<CategoriesResponse>("/api/v1/market/categories", {
      // Categories change rarely, cache for 1 hour
      next: { revalidate: 3600 }
    }).catch(
      () => ({ status: "success", data: [] } as CategoriesResponse)
    ),
  ]);
  const products: Product[] = searchRes.data?.products || [];
  const categories: Category[] = categoriesRes.data || [];

  // Build child map for mobile quick leaves
  // remove unused desktop helpers (handled in DesktopCategoryTree)

  return (
    <div className="w-full max-w-none mx-auto px-2 md:px-8 py-6">
      <h1 className="text-2xl font-semibold mb-6">{translate(locale, "market.title")}</h1>
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
        <aside className="hidden lg:block">
          <div className="sticky top-20 space-y-6">
            <DesktopCategoryTree categories={categories} params={params} selectedCategoryName={selectedCategory} basePath="/marketplace" locale={locale} />

            <ProductFilters
              basePath="/marketplace"
              params={params}
              selectedCategory={selectedCategory}
              minPrice={minPrice}
              maxPrice={maxPrice}
              condition={condition}
              sort={sort}
              variant="desktop"
              locale={locale}
            />
          </div>
        </aside>

        <main>
          <DesktopQuickChips params={params} basePath="/marketplace" locale={locale} />
          {/* Mobile filters toolbar */}
          <div className="lg:hidden mb-4 space-y-3 sticky top-16 z-20 bg-white dark:bg-neutral-950 py-2">
            <MobileCategoryBrowser categories={categories} params={params} selectedCategoryName={selectedCategory} basePath="/marketplace" locale={locale} />
            <MobileQuickChips params={params} basePath="/marketplace" locale={locale} />
            <ProductFilters
              basePath="/marketplace"
              params={params}
              selectedCategory={selectedCategory}
              minPrice={minPrice}
              maxPrice={maxPrice}
              condition={condition}
              sort={sort}
              variant="mobile"
              locale={locale}
            />
          </div>
          {products.length === 0 ? (
            <div className="mt-8">
              <EmptyState
                title="No products found"
                description="Try adjusting your filters or search keywords."
                action={{ label: "Clear Filters", href: "/marketplace", variant: "outline" }}
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {products.map((p) => (
                <ProductCard key={p._id} product={p as unknown as ProductCardData} locale={locale} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
