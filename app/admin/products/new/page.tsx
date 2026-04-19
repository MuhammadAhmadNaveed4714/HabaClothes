"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Save, UploadCloud } from "lucide-react";
import { AxiosError } from "axios";
import { productsApi } from "@/lib/api";

const parseList = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const getApiErrorMessage = (err: unknown, fallback: string) => {
  const response = (err as AxiosError<{ message?: string; title?: string; errors?: Record<string, string[]> }>)?.response;
  const data = response?.data;
  const validationErrors = data?.errors
    ? Object.values(data.errors).flat().filter(Boolean)
    : [];

  if (validationErrors.length > 0) return validationErrors.join(" ");
  return data?.message || data?.title || fallback;
};

export default function AdminAddProductPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [sizes, setSizes] = useState("");
  const [colors, setColors] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const imagePreview = useMemo(() => {
    if (!imageFile) return "";
    return URL.createObjectURL(imageFile);
  }, [imageFile]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!name || !category || !price) {
      setError("Name, category, and price are required.");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("category", category);
    formData.append("price", price);
    formData.append("stock", stock || "0");
    formData.append("imageUrl", imageUrl || "");

    const sizeList = parseList(sizes);
    const colorList = parseList(colors);
    if (sizeList.length > 0) formData.append("sizes", sizeList.join(","));
    if (colorList.length > 0) formData.append("colors", colorList.join(","));
    if (imageFile) {
      formData.append("image", imageFile);
    }

    setLoading(true);
    try {
      await productsApi.create(formData);
      setSaved(true);
      window.setTimeout(() => {
        router.push("/admin/products");
      }, 1200);
    } catch (err) {
      const message = getApiErrorMessage(err, "Failed to create product.");
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-display text-4xl font-light">Add Product</h1>
        <p className="font-mono text-xs text-ink/40 mt-1 tracking-widest">Create a new catalog item</p>
      </div>

      {error && (
        <div className="mb-6 border border-rust/30 bg-rust/5 px-4 py-3 font-mono text-xs text-rust">
          {error}
        </div>
      )}
      {saved && (
        <div className="mb-6 border border-sage/30 bg-sage/10 px-4 py-3 font-mono text-xs text-sage">
          Product saved. Redirecting...
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <section className="bg-chalk border border-bone">
          <div className="px-6 py-4 border-b border-bone">
            <h2 className="font-mono text-xs tracking-widest uppercase">Details</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-6 py-6">
            <label className="space-y-2">
              <span className="font-mono text-xs tracking-widest uppercase text-ink/40">Name</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-bone bg-transparent px-4 py-2 font-body text-sm focus:outline-none focus:border-ink"
                placeholder="Moss Knit Dress"
              />
            </label>
            <label className="space-y-2">
              <span className="font-mono text-xs tracking-widest uppercase text-ink/40">Category</span>
              <input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-bone bg-transparent px-4 py-2 font-body text-sm focus:outline-none focus:border-ink"
                placeholder="Women"
              />
            </label>
            <label className="space-y-2 md:col-span-2">
              <span className="font-mono text-xs tracking-widest uppercase text-ink/40">Description</span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border border-bone bg-transparent px-4 py-2 font-body text-sm focus:outline-none focus:border-ink min-h-[120px]"
                placeholder="Short description of the product..."
              />
            </label>
          </div>
        </section>

        <section className="bg-chalk border border-bone">
          <div className="px-6 py-4 border-b border-bone">
            <h2 className="font-mono text-xs tracking-widest uppercase">Pricing & Inventory</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-6 py-6">
            <label className="space-y-2">
              <span className="font-mono text-xs tracking-widest uppercase text-ink/40">Price</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full border border-bone bg-transparent px-4 py-2 font-body text-sm focus:outline-none focus:border-ink"
                placeholder="220"
              />
            </label>
            <label className="space-y-2">
              <span className="font-mono text-xs tracking-widest uppercase text-ink/40">Stock</span>
              <input
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full border border-bone bg-transparent px-4 py-2 font-body text-sm focus:outline-none focus:border-ink"
                placeholder="18"
              />
            </label>
            <label className="space-y-2">
              <span className="font-mono text-xs tracking-widest uppercase text-ink/40">Sizes</span>
              <input
                value={sizes}
                onChange={(e) => setSizes(e.target.value)}
                className="w-full border border-bone bg-transparent px-4 py-2 font-body text-sm focus:outline-none focus:border-ink"
                placeholder="XS, S, M, L"
              />
            </label>
            <label className="space-y-2">
              <span className="font-mono text-xs tracking-widest uppercase text-ink/40">Colors</span>
              <input
                value={colors}
                onChange={(e) => setColors(e.target.value)}
                className="w-full border border-bone bg-transparent px-4 py-2 font-body text-sm focus:outline-none focus:border-ink"
                placeholder="Clay, Ink"
              />
            </label>
          </div>
        </section>

        <section className="bg-chalk border border-bone">
          <div className="px-6 py-4 border-b border-bone">
            <h2 className="font-mono text-xs tracking-widest uppercase">Product Image</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-6 py-6">
            <label className="space-y-2">
              <span className="font-mono text-xs tracking-widest uppercase text-ink/40">Image URL</span>
              <input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full border border-bone bg-transparent px-4 py-2 font-body text-sm focus:outline-none focus:border-ink"
                placeholder="https://example.com/image.jpg"
              />
            </label>
            <label className="flex flex-col gap-3 border border-dashed border-bone px-6 py-8 items-center justify-center text-center">
              <UploadCloud size={20} className="text-ink/40" />
              <span className="font-mono text-xs tracking-widest uppercase text-ink/40">Upload image</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                className="text-xs"
              />
            </label>
            <div className="border border-bone bg-bone/20 flex items-center justify-center min-h-[180px]">
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <span className="font-mono text-xs text-ink/40">No image selected</span>
              )}
            </div>
          </div>
        </section>

        <div className="flex items-center justify-between">
          <p className="font-mono text-xs text-ink/40 tracking-widest">
            {loading ? "Saving product..." : "Click save to store this product"}
          </p>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 border border-ink px-5 py-2 font-mono text-xs tracking-widest uppercase hover:bg-ink hover:text-chalk transition-colors disabled:opacity-60"
          >
            <Save size={14} />
            Save product
          </button>
        </div>
      </form>
    </div>
  );
}
