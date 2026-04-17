"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { ShoppingBag, User, Menu, X, ChevronDown } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";

const categories = ["Women", "Men", "Accessories", "New Arrivals", "Sale"];

export function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const { toggleCart, itemCount } = useCartStore();
    const { isAuthenticated, user, logout } = useAuthStore();
    const count = itemCount();

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const headerClass = scrolled
        ? "bg-chalk/95 backdrop-blur-sm shadow-sm"
        : "bg-gradient-to-b from-ink/70 via-ink/30 to-transparent";
    const textClass = scrolled ? "text-ink" : "text-chalk";
    const mutedTextClass = scrolled ? "text-ink/70 hover:text-ink" : "text-chalk/80 hover:text-chalk";

    return (
        <>
            <header
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${headerClass}`}
            >
                <div className="max-w-screen-xl mx-auto px-6 md:px-12">
                    <div className="flex items-center justify-between h-16 md:h-20">
                        {/* Logo */}
                        <Link href="/" className={`font-display text-2xl md:text-3xl font-light tracking-[0.15em] hover:text-clay transition-colors duration-300 ${textClass}`}>
                            HABA
                        </Link>

                        {/* Desktop Nav */}
                        <nav className="hidden md:flex items-center gap-8">
                            {categories.map((cat) => (
                                <Link
                                    key={cat}
                                    href={`/products?category=${cat.toLowerCase().replace(" ", "-")}`}
                                    className={`font-mono text-xs tracking-widest uppercase transition-colors duration-200 ${mutedTextClass}`}
                                >
                                    {cat}
                                </Link>
                            ))}
                        </nav>

                        {/* Actions */}
                        <div className="flex items-center gap-4 md:gap-6">
                            {isAuthenticated ? (
                                <div className="hidden md:flex items-center gap-1 group relative">
                                    <button className="font-mono text-xs tracking-widest uppercase text-ink/70 hover:text-ink flex items-center gap-1 transition-colors">
                                        <User size={14} />
                                        {user?.firstName}
                                        <ChevronDown size={12} />
                                    </button>
                                    <div className="absolute top-full right-0 mt-2 bg-chalk border border-bone shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 min-w-36">
                                        {user?.role === "Admin" && (
                                            <Link href="/admin" className="block px-4 py-3 font-mono text-xs tracking-widest uppercase hover:bg-bone transition-colors">
                                                Admin
                                            </Link>
                                        )}
                                        <Link href="/profile" className="block px-4 py-3 font-mono text-xs tracking-widest uppercase hover:bg-bone transition-colors">
                                            Profile
                                        </Link>
                                        <button onClick={logout} className="w-full text-left px-4 py-3 font-mono text-xs tracking-widest uppercase hover:bg-bone text-rust transition-colors">
                                            Sign Out
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <Link href="/login" className={`hidden md:block font-mono text-xs tracking-widest uppercase transition-colors ${mutedTextClass}`}>
                                    Sign In
                                </Link>
                            )}

                            {/* Cart */}
                            <button
                                onClick={toggleCart}
                                className={`relative p-1 hover:text-clay transition-colors duration-200 ${textClass}`}
                                aria-label="Open cart"
                            >
                                <ShoppingBag size={20} strokeWidth={1.5} />
                                {count > 0 && (
                                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-rust text-chalk text-[10px] font-mono flex items-center justify-center rounded-full">
                                        {count}
                                    </span>
                                )}
                            </button>

                            {/* Mobile menu toggle */}
                            <button
                                onClick={() => setMobileOpen(!mobileOpen)}
                                className={`md:hidden ${textClass}`}
                                aria-label="Toggle menu"
                            >
                                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileOpen && (
                    <div className="md:hidden bg-chalk border-t border-bone px-6 py-6 animate-fade-in">
                        <nav className="flex flex-col gap-6">
                            {categories.map((cat) => (
                                <Link
                                    key={cat}
                                    href={`/products?category=${cat.toLowerCase().replace(" ", "-")}`}
                                    onClick={() => setMobileOpen(false)}
                                    className="font-mono text-sm tracking-widest uppercase text-ink/70 hover:text-ink"
                                >
                                    {cat}
                                </Link>
                            ))}
                            <hr className="border-bone" />
                            {isAuthenticated ? (
                                <>
                                    {user?.role === "Admin" && (
                                        <Link href="/admin" onClick={() => setMobileOpen(false)} className="font-mono text-sm tracking-widest uppercase">Admin Panel</Link>
                                    )}
                                    <button onClick={() => { logout(); setMobileOpen(false); }} className="text-left font-mono text-sm tracking-widest uppercase text-rust">
                                        Sign Out
                                    </button>
                                </>
                            ) : (
                                <Link href="/login" onClick={() => setMobileOpen(false)} className="font-mono text-sm tracking-widest uppercase">
                                    Sign In
                                </Link>
                            )}
                        </nav>
                    </div>
                )}
            </header>
        </>
    );
}