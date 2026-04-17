"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ShoppingBag, Heart, ChevronDown } from "lucide-react";
import { Product } from "@/types";
import { productsApi } from "@/lib/api";
import { useCartStore } from "@/store/cartStore";
import clsx from "clsx";

export default function ProductDetailPage() {
    const { id } = useParams<{ id: string }>();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedSize, setSelectedSize] = useState<string>("");
    const [selectedColor, setSelectedColor] = useState<string>("");
    const [qty, setQty] = useState(1);
    const [added, setAdded] = useState(false);
    const [openAccordion, setOpenAccordion] = useState<string | null>("description");
    const { addItem } = useCartStore();

    useEffect(() => {
        const fetch = async () => {
            try {
                const data = await productsApi.getById(Number(id));
                setProduct(data);
            } catch {
                setProduct(null);
                setError("We couldn't load this product from the server. Please try again.");
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [id]);

    const handleAddToCart = () => {
        if (!product) return;
        addItem(product, qty, selectedSize, selectedColor);
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-20 px-6 md:px-12">
                <div className="max-w-screen-xl mx-auto grid md:grid-cols-2 gap-12 py-12">
                    <div className="aspect-[3/4] skeleton" />
                    <div className="space-y-4 pt-4">
                        <div className="h-8 skeleton w-3/4" />
                        <div className="h-6 skeleton w-24" />
                        <div className="h-4 skeleton w-full" />
                        <div className="h-4 skeleton w-2/3" />
                    </div>
                </div>
            </div>
        );
    }

    if (error && !loading) {
        return (
            <div className="min-h-screen pt-20">
                <div className="max-w-screen-xl mx-auto px-6 md:px-12 py-8">
                    <Link href="/products" className="inline-flex items-center gap-2 font-mono text-xs tracking-widest uppercase text-ink/40 hover:text-ink transition-colors mb-8">
                        <ChevronLeft size={12} />
                        Back to Products
                    </Link>
                    <div className="border border-rust/30 bg-rust/5 px-6 py-5">
                        <p className="font-mono text-xs tracking-widest uppercase text-rust">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!product) return null;

    const accordions = [
        {
            id: "description",
            title: "Description",
            content: product.description,
        },
        {
            id: "materials",
            title: "Materials & Care",
            content: "100% European Linen. Machine wash cold, tumble dry low, or lay flat to dry. Iron on medium heat while slightly damp. Do not bleach.",
        },
        {
            id: "shipping",
            title: "Shipping & Returns",
            content: "Free standard shipping on orders over $150. Express delivery available. Returns accepted within 30 days of purchase — items must be unworn and in original condition.",
        },
    ];

    return (
        <div className="min-h-screen pt-20">
            <div className="max-w-screen-xl mx-auto px-6 md:px-12 py-8">
                {/* Breadcrumb */}
                <Link href="/products" className="inline-flex items-center gap-2 font-mono text-xs tracking-widest uppercase text-ink/40 hover:text-ink transition-colors mb-8">
                    <ChevronLeft size={12} />
                    Back to Products
                </Link>

                <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
                    {/* Image */}
                    <div className="relative aspect-[3/4] bg-bone overflow-hidden">
                        <Image
                            src={product.imageUrl || `https://via.placeholder.com/600x800/E8E2D9/0D0D0D?text=${encodeURIComponent(product.name)}`}
                            alt={product.name}
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>

                    {/* Details */}
                    <div className="py-4">
                        <p className="font-mono text-xs tracking-widest uppercase text-ink/40 mb-3">
                            {product.category}
                        </p>
                        <h1 className="font-display text-4xl md:text-5xl font-light mb-4">
                            {product.name}
                        </h1>
                        <p className="font-display text-3xl text-clay mb-8">
                            ${product.price.toFixed(2)}
                        </p>

                        {/* Color */}
                        {product.colors && product.colors.length > 0 && (
                            <div className="mb-6">
                                <p className="label">
                                    Color {selectedColor && <span className="text-ink">— {selectedColor}</span>}
                                </p>
                                <div className="flex gap-2">
                                    {product.colors.map((color) => (
                                        <button
                                            key={color}
                                            onClick={() => setSelectedColor(color)}
                                            className={clsx(
                                                "px-3 py-1.5 font-mono text-xs tracking-widest border transition-colors",
                                                selectedColor === color
                                                    ? "border-ink bg-ink text-chalk"
                                                    : "border-bone hover:border-ink text-ink/60 hover:text-ink"
                                            )}
                                        >
                                            {color}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Size */}
                        {product.sizes && product.sizes.length > 0 && (
                            <div className="mb-8">
                                <div className="flex justify-between items-center mb-2">
                                    <p className="label m-0">Size</p>
                                    <button className="font-mono text-xs text-ink/40 hover:text-ink transition-colors underline">
                                        Size Guide
                                    </button>
                                </div>
                                <div className="flex gap-2 flex-wrap">
                                    {product.sizes.map((size) => (
                                        <button
                                            key={size}
                                            onClick={() => setSelectedSize(size)}
                                            className={clsx(
                                                "w-12 h-12 font-mono text-xs tracking-wider border transition-colors",
                                                selectedSize === size
                                                    ? "border-ink bg-ink text-chalk"
                                                    : "border-bone hover:border-ink text-ink/60 hover:text-ink"
                                            )}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Qty + Add to Cart */}
                        <div className="flex gap-3 mb-4">
                            <div className="flex border border-bone items-center">
                                <button
                                    onClick={() => setQty(Math.max(1, qty - 1))}
                                    className="px-3 py-3 text-ink/50 hover:text-ink transition-colors"
                                >
                                    −
                                </button>
                                <span className="font-mono text-sm px-3">{qty}</span>
                                <button
                                    onClick={() => setQty(Math.min(product.stock, qty + 1))}
                                    className="px-3 py-3 text-ink/50 hover:text-ink transition-colors"
                                >
                                    +
                                </button>
                            </div>

                            <button
                                onClick={handleAddToCart}
                                disabled={product.stock === 0}
                                className={clsx(
                                    "flex-1 flex items-center justify-center gap-2 font-mono text-xs tracking-widest uppercase transition-colors duration-300",
                                    added
                                        ? "bg-sage text-chalk"
                                        : product.stock === 0
                                            ? "bg-bone text-ink/30 cursor-not-allowed"
                                            : "bg-ink text-chalk hover:bg-rust"
                                )}
                            >
                                <ShoppingBag size={14} />
                                {product.stock === 0 ? "Sold Out" : added ? "Added to Bag!" : "Add to Bag"}
                            </button>

                            <button className="w-12 h-12 border border-bone flex items-center justify-center hover:border-ink transition-colors group">
                                <Heart size={16} className="text-ink/40 group-hover:text-rust group-hover:fill-rust transition-colors" />
                            </button>
                        </div>

                        {product.stock <= 5 && product.stock > 0 && (
                            <p className="font-mono text-xs text-rust mb-6">Only {product.stock} left in stock</p>
                        )}

                        {/* Accordions */}
                        <div className="border-t border-bone mt-8">
                            {accordions.map((acc) => (
                                <div key={acc.id} className="border-b border-bone">
                                    <button
                                        onClick={() => setOpenAccordion(openAccordion === acc.id ? null : acc.id)}
                                        className="w-full flex justify-between items-center py-4 text-left group"
                                    >
                                        <span className="font-mono text-xs tracking-widest uppercase group-hover:text-clay transition-colors">
                                            {acc.title}
                                        </span>
                                        <ChevronDown
                                            size={14}
                                            className={clsx(
                                                "text-ink/40 transition-transform duration-300",
                                                openAccordion === acc.id && "rotate-180"
                                            )}
                                        />
                                    </button>
                                    {openAccordion === acc.id && (
                                        <div className="pb-4 animate-fade-in">
                                            <p className="font-body text-sm text-ink/70 leading-relaxed">{acc.content}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
