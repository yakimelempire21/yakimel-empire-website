"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, ChevronDown } from "lucide-react";
import {
  TABS,
  industriesFor,
  isListed,
  parseTab,
  productsForTab,
  type Product,
  type TabId,
} from "@/lib/products";
import ProductCard from "@/components/ProductCard";
import { ContactModal } from "@/components/ContactWidget";

const focus =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

// "All Products" and "Websites" are always shown; other tabs only when they
// have at least one product listed on this page.
const VISIBLE_TABS = TABS.filter(
  (t) => t.id === "all" || t.id === "websites" || productsForTab(t.id).some(isListed),
);

export default function ProductsBrowser() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const requestedTab = parseTab(searchParams.get("type"));
  // A hidden tab in the URL (?type=apps) falls back to All Products.
  const tab: TabId = VISIBLE_TABS.some((t) => t.id === requestedTab) ? requestedTab : "all";

  const [query, setQuery] = useState("");
  const [industryChoice, setIndustryChoice] = useState("all");
  const [notify, setNotify] = useState<Product | null>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const tabProducts = useMemo(() => productsForTab(tab).filter(isListed), [tab]);
  const industries = useMemo(() => industriesFor(tabProducts), [tabProducts]);
  // A previously chosen industry may not exist under the newly selected tab.
  const industry = industries.includes(industryChoice) ? industryChoice : "all";

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tabProducts.filter((p) => {
      if (industry !== "all" && p.industry !== industry) return false;
      if (!q) return true;
      return [p.name, p.description, p.categoryLabel, p.industry].some((field) =>
        field.toLowerCase().includes(q),
      );
    });
  }, [tabProducts, query, industry]);

  const selectTab = useCallback(
    (id: TabId) => {
      const params = new URLSearchParams(searchParams.toString());
      if (id === "all") params.delete("type");
      else params.set("type", id);
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  function onTabKeyDown(e: React.KeyboardEvent, index: number) {
    const last = VISIBLE_TABS.length - 1;
    let next = index;
    if (e.key === "ArrowRight") next = index === last ? 0 : index + 1;
    else if (e.key === "ArrowLeft") next = index === 0 ? last : index - 1;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = last;
    else return;
    e.preventDefault();
    selectTab(VISIBLE_TABS[next].id);
    tabRefs.current[VISIBLE_TABS[next].id]?.focus();
  }

  function clearFilters() {
    setQuery("");
    setIndustryChoice("all");
  }

  const activeTab = TABS.find((t) => t.id === tab) ?? TABS[0];

  return (
    <div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div
          role="tablist"
          aria-label="Product categories"
          className="flex w-full gap-1 overflow-x-auto rounded-full border border-white/10 bg-surface/60 p-1.5 lg:w-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {VISIBLE_TABS.map((t, i) => {
            const selected = t.id === tab;
            return (
              <button
                key={t.id}
                ref={(el) => {
                  tabRefs.current[t.id] = el;
                }}
                role="tab"
                id={`tab-${t.id}`}
                type="button"
                aria-selected={selected}
                aria-controls="products-panel"
                tabIndex={selected ? 0 : -1}
                onClick={() => selectTab(t.id)}
                onKeyDown={(e) => onTabKeyDown(e, i)}
                className={`shrink-0 whitespace-nowrap rounded-full px-5 py-2 text-sm font-medium transition-colors ${focus} ${
                  selected
                    ? "bg-brand text-white"
                    : "text-dim-invert hover:text-ink-invert"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row lg:w-[34rem]">
          <div className="relative flex-1">
            <label htmlFor="product-search" className="sr-only">
              {activeTab.searchPlaceholder.replace("...", "")}
            </label>
            <Search
              size={16}
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-dim-invert"
            />
            <input
              id="product-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={activeTab.searchPlaceholder}
              autoComplete="off"
              className={`w-full rounded-full border border-white/10 bg-surface/60 py-2.5 pl-10 pr-4 text-sm text-ink-invert placeholder:text-dim-invert ${focus}`}
            />
          </div>

          <div className="relative sm:w-48">
            <label htmlFor="industry-filter" className="sr-only">
              Filter by industry
            </label>
            <select
              id="industry-filter"
              value={industry}
              onChange={(e) => setIndustryChoice(e.target.value)}
              className={`w-full appearance-none rounded-full border border-white/10 bg-surface/60 py-2.5 pl-4 pr-10 text-sm text-ink-invert ${focus}`}
            >
              <option value="all" className="bg-bg-dark">
                All industries
              </option>
              {industries.map((name) => (
                <option key={name} value={name} className="bg-bg-dark">
                  {name}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              aria-hidden="true"
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-dim-invert"
            />
          </div>
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {visible.length} {visible.length === 1 ? "product" : "products"} shown
      </p>

      <div
        role="tabpanel"
        id="products-panel"
        aria-labelledby={`tab-${tab}`}
        className="mt-6"
      >
        {visible.length > 0 ? (
          <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {visible.map((p) => (
              <li key={p.slug}>
                <ProductCard product={p} onNotify={setNotify} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-surface/40 px-6 py-16 text-center">
            <p className="font-display text-xl font-bold text-ink-invert">
              No products match your search
            </p>
            <p className="mt-2 text-sm text-dim-invert">
              Try a different keyword or industry.
            </p>
            <button
              type="button"
              onClick={clearFilters}
              className={`mt-6 rounded-full border border-white/25 px-6 py-2.5 text-sm font-medium text-ink-invert transition-colors hover:border-white/60 hover:bg-white/5 ${focus}`}
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      <ContactModal
        key={notify?.slug ?? "none"}
        open={notify !== null}
        onClose={() => setNotify(null)}
        initialMessage={
          notify ? `Please notify me when ${notify.name} launches.` : ""
        }
      />
    </div>
  );
}
