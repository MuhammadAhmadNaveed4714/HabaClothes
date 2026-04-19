"use client";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Heart } from "lucide-react";
import { useState } from "react";
import { Product } from "@/types";
import { useCartStore } from "@/store/cartStore";
import clsx from "clsx";

interface ProductCardProps {
    product: Product;
    className?: string;
}

const getFallbackProductImage = (name: string) => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="533" viewBox="0 0 400 533"><rect width="100%" height="100%" fill="#E8E2D9"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#0D0D0D" font-family="Arial, sans-serif" font-size="20">${name}</text></svg>`;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

export function ProductCard({ product, className }: ProductCardProps) {
    const [wishlist, setWishlist] = useState(false);
    const [added, setAdded] = useState(false);
    const { addItem } = useCartStore();

    const handleQuickAdd = (e: React.MouseEvent) => {
        e.preventDefault();
        addItem(product, 1);
        setAdded(true);
        setTimeout(() => setAdded(false), 1500);
    };

    return (
        <div className={clsx("group relative card-hover", className)}>
            <Link href={`/products/${product.id}`} className="block">
                {/* Image container */}
                <div className="relative aspect-[3/4] bg-bone overflow-hidden mb-4">
                    <Image
                        src={product.imageUrl || getFallbackProductImage(product.name)}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />

                    {/* Quick add overlay */}
                    <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <button
                            onClick={handleQuickAdd}
                            className={clsx(
                                "w-full py-3 flex items-center justify-center gap-2 font-mono text-xs tracking-widest uppercase transition-colors duration-200",
                                added
                                    ? "bg-sage text-chalk"
                                    : "bg-ink text-chalk hover:bg-rust"
                            )}
                        >
                            <ShoppingBag size={14} />
                            {added ? "Added!" : "Quick Add"}
                        </button>
                    </div>

                    {/* Wishlist */}
                    <button
                        onClick={(e) => { e.preventDefault(); setWishlist(!wishlist); }}
                        className="absolute top-3 right-3 w-8 h-8 bg-chalk/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-chalk"
                    >
                        <Heart
                            size={14}
                            className={wishlist ? "fill-rust text-rust" : "text-ink"}
                        />
                    </button>

                    {/* Stock badge */}
                    {product.stock <= 5 && product.stock > 0 && (
                        <span className="absolute top-3 left-3 bg-rust text-chalk font-mono text-[10px] tracking-widest px-2 py-1 uppercase">
                            Only {product.stock} left
                        </span>
                    )}
                    {product.stock === 0 && (
                        <span className="absolute top-3 left-3 bg-ink/60 text-chalk font-mono text-[10px] tracking-widest px-2 py-1 uppercase">
                            Sold Out
                        </span>
                    )}
                </div>

                {/* Info */}
                <div className="space-y-1">
                    <p className="font-mono text-[10px] tracking-widest uppercase text-ink/40">{product.category}</p>
                    <h3 className="font-body text-sm font-medium text-ink leading-snug">{product.name}</h3>
                    <p className="font-mono text-sm text-clay">PKR {product.price.toFixed(2)}</p>
                </div>
            </Link>
        </div>
    );
}

export function ProductCardSkeleton() {
    return (
        <div className="animate-pulse">
            <div className="aspect-[3/4] skeleton mb-4" />
            <div className="space-y-2">
                <div className="h-3 skeleton w-16" />
                <div className="h-4 skeleton w-3/4" />
                <div className="h-4 skeleton w-20" />
            </div>
        </div>
    );
}