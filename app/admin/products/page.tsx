"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Package, Search, Plus } from "lucide-react";
import { productsApi } from "@/lib/api";
import { Product } from "@/types";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);

function extractList<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (value && typeof value === "object") {
    const v = value as { data?: unknown; items?: unknown };
    if (Array.isArray(v.items)) return v.items as T[];
    if (Array.isArray(v.data)) return v.data as T[];
    if (v.data && typeof v.data === "object") {
      const d = v.data as { items?: unknown };
      if (Array.isArray(d.items)) return d.items as T[];
    }
  }
  return [];
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const categories = useMemo(() => {
    const unique = new Set(products.map((p) => p.category).filter(Boolean));
    return ["all", ...Array.from(unique)];
  }, [products]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await productsApi.getAll({
          search: query || undefined,
          category: category === "all" ? undefined : category,
          page: 1,
          pageSize: 200,
        });
        const list = extractList<Product>(res);
        if (!active) return;
        setProducts(list);
      } catch (err) {
        if (!active) return;
        setError("Failed to load products.");
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [query, category]);

  const handleDelete = async (product: Product) => {
    const confirmed = window.confirm(`Delete ${product.name}? This cannot be undone.`);
    if (!confirmed) return;
    setDeletingId(product.id);
    setError(null);
    try {
      await productsApi.delete(product.id);
      setProducts((prev) => prev.filter((item) => item.id !== product.id));
    } catch (err) {
      setError("Failed to delete product.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="font-display text-4xl font-light">Products</h1>
          <p className="font-mono text-xs text-ink/40 mt-1 tracking-widest">Manage your catalog</p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 border border-ink px-5 py-2 font-mono text-xs tracking-widest uppercase hover:bg-ink hover:text-chalk transition-colors"
        >
          <Plus size={14} />
          Add product
        </Link>
      </div>

      {error && (
        <div className="mb-6 border border-rust/30 bg-rust/5 px-4 py-3 font-mono text-xs text-rust">
          {error}
        </div>
      )}

      <div className="bg-chalk border border-bone mb-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between px-6 py-4 border-b border-bone">
          <div className="flex items-center gap-2 font-mono text-xs tracking-widest uppercase text-ink/40">
            <Package size={14} />
            Catalog
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products"
                className="w-56 border border-bone bg-transparent pl-9 pr-3 py-2 font-mono text-xs tracking-widest uppercase focus:outline-none focus:border-ink"
              />
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="border border-bone bg-transparent px-3 py-2 font-mono text-xs tracking-widest uppercase focus:outline-none focus:border-ink"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === "all" ? "All categories" : cat}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-bone">
                {[
                  "Product",
                  "Category",
                  "Price",
                  "Stock",
                  "Status",
                  "Created",
                  "Actions",
                ].map((h) => (
                  <th key={h} className="text-left px-6 py-3 font-mono text-[10px] tracking-widest uppercase text-ink/40">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={7} className="px-6 py-10 font-mono text-xs text-ink/40">
                    Loading products...
                  </td>
                </tr>
              )}
              {!loading && products.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-10 font-mono text-xs text-ink/40">
                    No products found.
                  </td>
                </tr>
              )}
              {!loading &&
                products.map((product) => {
                  const created = product.createdAt ? new Date(product.createdAt) : null;
                  const createdLabel = created && !Number.isNaN(created.getTime())
                    ? created.toLocaleDateString()
                    : "—";
                  const inStock = product.stock > 0;
                  return (
                    <tr key={product.id} className="border-b border-bone/50 hover:bg-bone/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 border border-bone bg-bone/20 overflow-hidden flex items-center justify-center">
                            {product.imageUrl ? (
                              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <Package size={16} className="text-ink/30" />
                            )}
                          </div>
                          <div>
                            <p className="font-body text-sm">{product.name}</p>
                            <p className="font-mono text-[10px] uppercase tracking-widest text-ink/40">ID {product.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-ink/60">{product.category}</td>
                      <td className="px-6 py-4 font-mono text-sm font-medium">{formatCurrency(product.price)}</td>
                      <td className="px-6 py-4 font-mono text-xs text-ink/50">{product.stock}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`font-mono text-[10px] tracking-widest uppercase px-2 py-1 ${
                            inStock ? "text-sage bg-sage/10" : "text-rust bg-rust/10"
                          }`}
                        >
                          {inStock ? "In stock" : "Out of stock"}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-ink/40">{createdLabel}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            className="font-mono text-[10px] tracking-widest uppercase text-clay hover:text-rust transition-colors"
                          >
                            Update
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDelete(product)}
                            disabled={deletingId === product.id}
                            className="font-mono text-[10px] tracking-widest uppercase text-rust hover:text-ink transition-colors disabled:opacity-60"
                          >
                            {deletingId === product.id ? "Deleting" : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
