"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { Product } from "@/types";
import { productsApi } from "@/lib/api";
import { ProductCard, ProductCardSkeleton } from "@/components/product/ProductCard";

const CATEGORIES = ["All", "Women", "Men", "Accessories", "New Arrivals", "Sale"];
const SORT_OPTIONS = [
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
];


export default function ProductsPage() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [sort, setSort] = useState("newest");
  const [search, setSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat) {
      const match = CATEGORIES.find((c) => c.toLowerCase().replace(" ", "-") === cat);
      if (match) setActiveCategory(match);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await productsApi.getAll({
          category: activeCategory !== "All" ? activeCategory : undefined,
          search: search || undefined,
        });
        setProducts(data);
      } catch {
        setProducts([]);
        setError("We couldn't load products from the server. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [activeCategory, search]);

  const sorted = [...products].sort((a, b) => {
    if (sort === "price_asc") return a.price - b.price;
    if (sort === "price_desc") return b.price - a.price;
    return b.id - a.id;
  });

  return (
    <div className="min-h-screen pt-20">
      {/* Page Header */}
      <div className="border-b border-bone px-6 md:px-12 py-8">
        <div className="max-w-screen-xl mx-auto">
          <h1 className="font-display text-5xl font-light mb-2">
            {activeCategory === "All" ? "All Products" : activeCategory}
          </h1>
          <p className="font-mono text-xs text-ink/40 tracking-widest">
            {loading ? "—" : `${products.length} pieces`}
          </p>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-6 md:px-12 py-8">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row gap-4 justify-between mb-10">
          {/* Category filters */}
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`font-mono text-xs tracking-widest uppercase px-4 py-2 border transition-colors duration-200 ${
                  activeCategory === cat
                    ? "bg-ink text-chalk border-ink"
                    : "border-bone text-ink/50 hover:border-ink hover:text-ink"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sort & Search */}
          <div className="flex gap-3 items-center">
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="font-mono text-xs tracking-wider border-b border-ink/20 bg-transparent px-2 py-1.5 focus:outline-none focus:border-ink w-36 placeholder:text-ink/30 transition-colors"
            />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="font-mono text-xs tracking-widest uppercase border border-bone bg-transparent px-3 py-2 focus:outline-none focus:border-ink cursor-pointer"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Grid */}
        {error && !loading && (
          <div className="mb-8 border border-rust/30 bg-rust/5 px-4 py-3">
            <p className="font-mono text-xs tracking-widest uppercase text-rust">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : sorted.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
        </div>

        {!loading && !error && sorted.length === 0 && (
          <div className="text-center py-24">
            <p className="font-display text-3xl font-light text-ink/30 mb-4">No products found</p>
            <button onClick={() => { setActiveCategory("All"); setSearch(""); }} className="btn-ghost">
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
