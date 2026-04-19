"use client";
import { X, Trash2, Plus, Minus } from "lucide-react";
import Image from "next/image";
import { useCartStore } from "@/store/cartStore";

const WHATSAPP_BUSINESS_NUMBER = "03123456789";

const getWhatsAppPhone = (phone: string) => {
    const digits = phone.replace(/\D/g, "");
    if (digits.startsWith("0")) return `92${digits.slice(1)}`;
    if (digits.startsWith("92")) return digits;
    return digits;
};

export function CartDrawer() {
    const { items, isOpen, toggleCart, removeItem, updateQuantity, total } = useCartStore();
    const totalPrice = total();

    const handleCheckoutOnWhatsApp = () => {
        const lines = items.map((item, index) => {
            const size = item.size ? ` | Size: ${item.size}` : "";
            const color = item.color ? ` | Color: ${item.color}` : "";
            const lineTotal = item.product.price * item.quantity;
            return `${index + 1}. ${item.product.name} x${item.quantity}${size}${color} | $${lineTotal.toFixed(2)}`;
        });

        const message = [
            "Hello, I want to place this order:",
            "",
            ...lines,
            "",
            `Total: $${totalPrice.toFixed(2)}`,
        ].join("\n");

        const phone = getWhatsAppPhone(WHATSAPP_BUSINESS_NUMBER);
        const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
        toggleCart();
        window.location.href = url;
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 z-50 cart-overlay"
                onClick={toggleCart}
            />

            {/* Drawer */}
            <aside className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-sm bg-chalk flex flex-col shadow-2xl animate-fade-in">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-bone">
                    <h2 className="font-display text-2xl font-light">
                        Your Bag{" "}
                        <span className="font-mono text-sm font-normal text-ink/40">
                            ({items.length})
                        </span>
                    </h2>
                    <button onClick={toggleCart} className="text-ink/60 hover:text-ink transition-colors">
                        <X size={20} strokeWidth={1.5} />
                    </button>
                </div>

                {/* Items */}
                <div className="flex-1 overflow-y-auto px-6 py-4">
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                            <p className="font-display text-2xl font-light text-ink/40">Your bag is empty</p>
                            <button onClick={toggleCart} className="btn-ghost">Continue Shopping</button>
                        </div>
                    ) : (
                        <ul className="space-y-6">
                            {items.map((item) => (
                                <li
                                    key={`${item.product.id}-${item.size}`}
                                    className="flex gap-4 pb-6 border-b border-bone/60 last:border-0"
                                >
                                    {/* Image */}
                                    <div className="w-20 h-24 bg-bone flex-shrink-0 relative overflow-hidden">
                                        <Image
                                            src={item.product.imageUrl || "/placeholder.jpg"}
                                            alt={item.product.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-body text-sm font-medium truncate">{item.product.name}</h3>
                                        {item.size && (
                                            <p className="font-mono text-xs text-ink/50 mt-0.5">Size: {item.size}</p>
                                        )}
                                        <p className="font-mono text-xs text-clay mt-1">
                                            ${item.product.price.toFixed(2)}
                                        </p>

                                        {/* Qty controls */}
                                        <div className="flex items-center gap-3 mt-3">
                                            <button
                                                onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.size)}
                                                className="w-6 h-6 border border-ink/20 flex items-center justify-center hover:border-ink transition-colors"
                                            >
                                                <Minus size={10} />
                                            </button>
                                            <span className="font-mono text-xs w-4 text-center">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.size)}
                                                className="w-6 h-6 border border-ink/20 flex items-center justify-center hover:border-ink transition-colors"
                                            >
                                                <Plus size={10} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Remove */}
                                    <button
                                        onClick={() => removeItem(item.product.id, item.size)}
                                        className="text-ink/30 hover:text-rust transition-colors self-start mt-1"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Footer */}
                {items.length > 0 && (
                    <div className="px-6 py-6 border-t border-bone space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="font-mono text-xs tracking-widest uppercase text-ink/50">Total</span>
                            <span className="font-display text-2xl">${totalPrice.toFixed(2)}</span>
                        </div>
                        <p className="font-mono text-xs text-ink/40">Shipping calculated at checkout</p>
                        <button onClick={handleCheckoutOnWhatsApp} className="btn-primary w-full text-center block">
                            Proceed to Checkout
                        </button>
                        <button onClick={toggleCart} className="btn-ghost w-full text-center">
                            Continue Shopping
                        </button>
                    </div>
                )}
            </aside>
        </>
    );
}