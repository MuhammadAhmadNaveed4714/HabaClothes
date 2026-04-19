import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

const featuredCategories = [
    { name: "Collections", href: "/products?category=collections", label: "Curated for Her" },
    { name: "Seasonal", href: "/products?category=seasonal", label: "Latest Trends" },
    { name: "Basics", href: "/products?category=basics", label: "Essentials" },
];

export default function HomePage() {
    return (
        <div className="min-h-screen">
            {/* Hero */}
            <section className="relative min-h-screen flex items-end pt-24 md:pt-28 pb-10 md:pb-14 px-6 md:px-12 overflow-hidden bg-ink">
                {/* Background texture */}
                <div
                    className="absolute inset-0 opacity-20"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23F5F2EC' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }}
                />

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-transparent" />

                <div className="relative z-10 max-w-screen-xl mx-auto w-full">
                    <div className="max-w-3xl animate-fade-up">
                        <p className="font-mono text-xs tracking-[0.3em] uppercase text-clay mb-6">
                            Spring / Summer 2025
                        </p>
                        <h1 className="font-display text-6xl md:text-8xl lg:text-9xl font-light text-chalk leading-none mb-8">
                            Dress with
                            <br />
                            <em className="not-italic text-clay">intention.</em>
                        </h1>
                        <p className="font-body text-chalk/60 text-lg font-light max-w-md mb-10 leading-relaxed">
                            Garments crafted for those who understand that true style lies in the details — and the silence between them.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <Link href="/products" className="btn-primary">
                                Explore Collection
                            </Link>
                            <Link href="/products?category=new-arrivals" className="btn-outline border-chalk text-chalk hover:bg-chalk hover:text-ink">
                                New Arrivals
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Categories */}
            <section className="py-20 px-6 md:px-12 bg-chalk">
                <div className="max-w-screen-xl mx-auto">
                    <div className="flex items-center justify-between mb-12">
                        <h2 className="section-title">Shop by Category</h2>
                        <Link href="/products" className="hidden md:flex items-center gap-2 font-mono text-xs tracking-widest uppercase text-ink/50 hover:text-ink transition-colors">
                            All Products <ArrowRight size={14} />
                        </Link>
                    </div>

                    <div className="flex gap-4 md:gap-6 overflow-x-auto pb-4 scroll-smooth">
                        {featuredCategories.map((cat) => (
                            <Link
                                key={cat.name}
                                href={cat.href}
                                className="relative group overflow-hidden card-hover flex-shrink-0 w-full sm:w-96 h-56 md:h-64"
                            >
                                <div className="absolute inset-0 bg-bone" />
                                {/* Placeholder gradient */}
                                <div
                                    className="absolute inset-0 opacity-60 transition-transform duration-700 group-hover:scale-105"
                                    style={{
                                        background: cat.name === "Collections"
                                            ? "linear-gradient(135deg, #B5936B 0%, #7A8C72 100%)"
                                            : cat.name === "Seasonal"
                                                ? "linear-gradient(135deg, #9B4A2A 0%, #B5936B 100%)"
                                                : "linear-gradient(135deg, #C5CBD8 0%, #7A8C72 100%)",
                                    }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-ink/60 to-transparent" />
                                <div className="absolute bottom-0 left-0 p-6">
                                    <p className="font-mono text-xs tracking-widest uppercase text-chalk/60 mb-1">
                                        {cat.label}
                                    </p>
                                    <h3 className="font-display text-3xl font-light text-chalk">{cat.name}</h3>
                                </div>
                                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <ArrowRight size={20} className="text-chalk" />
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Editorial Strip */}
            <section className="py-20 px-6 md:px-12 bg-ink text-chalk">
                <div className="max-w-screen-xl mx-auto grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <p className="font-mono text-xs tracking-[0.3em] uppercase text-clay mb-6">Our Philosophy</p>
                        <h2 className="font-display text-5xl md:text-6xl font-light leading-tight mb-8">
                            Fewer pieces,<br />
                            <em>worn more.</em>
                        </h2>
                        <p className="font-body text-chalk/50 leading-relaxed mb-8 max-w-md">
                            HabaClothes champions the slow wardrobe. Each piece is designed to outlast trends and grow with your story — made from materials that age beautifully.
                        </p>
                        <Link href="/products" className="btn-outline border-chalk text-chalk hover:bg-chalk hover:text-ink inline-block">
                            Discover More
                        </Link>
                    </div>
                    <div className="relative h-80 md:h-96 bg-chalk/5 border border-chalk/10 flex items-center justify-center">
                        <p className="font-display text-6xl font-light text-chalk/10">HABA</p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative bg-chalk border-t border-bone px-6 md:px-12 overflow-hidden">
                {/* Decorative wave background */}
                <div 
                    className="absolute top-0 left-0 right-0 h-16 opacity-8 pointer-events-none"
                    style={{
                        background: "linear-gradient(90deg, transparent 0%, rgba(181, 147, 107, 0.15) 50%, transparent 100%)",
                        maskImage: "radial-gradient(ellipse 100% 100% at 50% 0%, transparent 0%, black 100%)",
                        WebkitMaskImage: "radial-gradient(ellipse 100% 100% at 50% 0%, transparent 0%, black 100%)",
                    }}
                />
                
                <div className="relative z-10 max-w-screen-xl mx-auto py-16">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-12">
                        {[
                            { title: "Shop", links: ["Collections", "Seasonal", "Basics", "Accessories", "New Arrivals"] },
                            { title: "Help", links: ["Sizing Guide", "Shipping & Returns", "FAQ", "Contact"] },
                            { title: "Company", links: ["About", "Sustainability", "Press", "Careers"] },
                            { title: "Follow", links: ["Instagram", "Pinterest", "TikTok", "Newsletter"] },
                        ].map((col) => (
                            <div key={col.title} className="space-y-4">
                                <h4 className="font-mono text-xs tracking-widest uppercase text-ink/50 font-medium">{col.title}</h4>
                                <ul className="space-y-3">
                                    {col.links.map((link) => (
                                        <li key={link}>
                                            <a 
                                                href="#" 
                                                className="font-body text-sm text-ink/60 hover:text-clay transition-colors duration-200 inline-block relative group"
                                            >
                                                {link}
                                                <span className="absolute bottom-0 left-0 w-0 h-px bg-clay transition-all duration-300 group-hover:w-full" />
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-gradient-to-r from-transparent via-bone to-transparent mb-8" />

                    {/* Bottom section */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6 md:gap-4">
                        <p className="font-display text-lg md:text-xl font-light tracking-widest text-ink/40">HABA</p>
                        <p className="font-mono text-xs text-ink/40 text-center md:text-right">© 2025 HabaClothes. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
