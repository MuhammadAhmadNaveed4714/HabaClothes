"use client";
import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutGrid, Package, ShoppingCart, Users, Settings, LogOut, BarChart3 } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import clsx from "clsx";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutGrid },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "Admin") {
      router.push("/auth/login");
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || user?.role !== "Admin") return null;

  return (
    <div className="min-h-screen flex bg-bone">
      {/* Sidebar */}
      <aside className="w-56 bg-ink flex flex-col fixed top-0 left-0 bottom-0 z-40">
        <div className="px-6 py-8 border-b border-chalk/10">
          <Link href="/" className="font-display text-2xl font-light tracking-[0.15em] text-chalk hover:text-clay transition-colors">
            HABA
          </Link>
          <p className="font-mono text-xs text-chalk/30 mt-1">Admin Panel</p>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex items-center gap-3 px-3 py-2.5 font-mono text-xs tracking-widest uppercase transition-colors duration-200 rounded",
                pathname === href
                  ? "bg-clay/20 text-clay"
                  : "text-chalk/40 hover:text-chalk hover:bg-chalk/5"
              )}
            >
              <Icon size={14} />
              {label}
            </Link>
          ))}
        </nav>

        <div className="px-3 py-6 border-t border-chalk/10">
          <div className="px-3 py-2 mb-2">
            <p className="font-mono text-xs text-chalk/60">{user?.firstName} {user?.lastName}</p>
            <p className="font-mono text-[10px] text-chalk/30 mt-0.5">{user?.email}</p>
          </div>
          <button
            onClick={() => { logout(); router.push("/"); }}
            className="flex items-center gap-3 px-3 py-2.5 font-mono text-xs tracking-widest uppercase text-chalk/30 hover:text-rust transition-colors w-full rounded"
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="ml-56 flex-1 min-h-screen">
        {children}
      </div>
    </div>
  );
}