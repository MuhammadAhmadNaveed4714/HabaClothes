"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { UserRound, Mail, ShieldCheck, ShoppingBag, RefreshCw, LogOut } from "lucide-react";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { User } from "@/types";

const formatDate = (value: Date) =>
  value.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

export default function ProfilePage() {
  const router = useRouter();
  const { hasHydrated, isAuthenticated, user, setAuth, logout } = useAuthStore();
  const { items, itemCount, total } = useCartStore();

  const [checkingSession, setCheckingSession] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!isAuthenticated) router.push("/login");
  }, [hasHydrated, isAuthenticated, router]);

  const initials = useMemo(() => {
    const first = user?.firstName?.[0] || "";
    const last = user?.lastName?.[0] || "";
    const combined = `${first}${last}`.toUpperCase();
    return combined || "U";
  }, [user]);

  const displayName = useMemo(() => {
    if (!user) return "";
    return [user.firstName, user.lastName].filter(Boolean).join(" ");
  }, [user]);

  const cartSummary = useMemo(() => {
    return {
      items: itemCount(),
      subtotal: total(),
      lines: items.length,
    };
  }, [itemCount, total, items]);

  const refreshSession = async () => {
    setCheckingSession(true);
    setError(null);
    try {
      const response = await authApi.me();
      const resolvedUser = (response?.data?.user as User | undefined) || (response?.user as User | undefined) || (response?.data as User | undefined);
      const resolvedToken = (response?.token as string | undefined) || user?.token || null;

      if (!resolvedUser) {
        setError("Could not refresh profile right now.");
        return;
      }
      if (resolvedToken) setAuth(resolvedUser, resolvedToken);
      setUpdatedAt(new Date());
    } catch {
      setError("Session refresh failed. Please sign in again.");
    } finally {
      setCheckingSession(false);
    }
  };

  if (!hasHydrated) {
    return (
      <div className="min-h-screen pt-20 px-6 md:px-12">
        <div className="max-w-screen-xl mx-auto py-10">
          <div className="h-8 w-56 skeleton mb-6" />
          <div className="h-32 w-full skeleton" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) return null;

  return (
    <div className="relative min-h-screen pt-20 px-6 md:px-12 pb-16 overflow-hidden">
      <div className="pointer-events-none absolute -top-24 -left-16 w-72 h-72 rounded-full bg-clay/20 blur-3xl" />
      <div className="pointer-events-none absolute top-40 -right-16 w-80 h-80 rounded-full bg-sage/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 w-72 h-72 rounded-full bg-bone/70 blur-3xl" />
      <div className="max-w-screen-xl mx-auto py-8">
        <div className="mb-8">
          <p className="font-mono text-xs tracking-widest uppercase text-ink/40 mb-2">Account</p>
          <h1 className="font-display text-5xl font-light">Your Profile</h1>
        </div>

        {error && (
          <div className="mb-6 border border-rust/30 bg-rust/5 px-4 py-3 font-mono text-xs text-rust">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <section className="lg:col-span-2 bg-chalk/65 backdrop-blur-xl border border-chalk/70 shadow-[0_12px_40px_rgba(13,13,13,0.08)]">
            <div className="px-6 py-5 border-b border-bone flex items-center justify-between">
              <h2 className="font-mono text-xs tracking-widest uppercase">Personal Details</h2>
              <button
                type="button"
                onClick={refreshSession}
                disabled={checkingSession}
                className="inline-flex items-center gap-2 border border-bone px-3 py-2 font-mono text-[10px] tracking-widest uppercase text-ink/60 hover:text-ink hover:border-ink transition-colors disabled:opacity-60"
              >
                <RefreshCw size={12} className={checkingSession ? "animate-spin" : ""} />
                Refresh
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2 flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-ink text-chalk flex items-center justify-center font-mono text-sm tracking-widest">
                  {initials}
                </div>
                <div>
                  <p className="font-body text-lg">{displayName || "Customer"}</p>
                  <p className="font-mono text-xs tracking-widest uppercase text-ink/40">Role: {user.role}</p>
                </div>
              </div>

              <div>
                <p className="label">First Name</p>
                <div className="border border-bone px-4 py-3 font-body text-sm bg-bone/20">{user.firstName || "—"}</div>
              </div>

              <div>
                <p className="label">Last Name</p>
                <div className="border border-bone px-4 py-3 font-body text-sm bg-bone/20">{user.lastName || "—"}</div>
              </div>

              <div className="md:col-span-2">
                <p className="label">Email</p>
                <div className="border border-bone px-4 py-3 font-body text-sm bg-bone/20">{user.email}</div>
              </div>
            </div>
          </section>

          <section className="bg-chalk/60 backdrop-blur-xl border border-chalk/70 shadow-[0_12px_40px_rgba(13,13,13,0.08)] p-6">
            <h2 className="font-mono text-xs tracking-widest uppercase mb-5">Quick Stats</h2>
            <div className="space-y-4">
              <div className="border border-chalk/80 bg-chalk/40 backdrop-blur-md px-4 py-3">
                <p className="font-mono text-[10px] tracking-widest uppercase text-ink/40 mb-1">Cart Items</p>
                <p className="font-display text-3xl font-light">{cartSummary.items}</p>
              </div>
              <div className="border border-chalk/80 bg-chalk/40 backdrop-blur-md px-4 py-3">
                <p className="font-mono text-[10px] tracking-widest uppercase text-ink/40 mb-1">Cart Lines</p>
                <p className="font-display text-3xl font-light">{cartSummary.lines}</p>
              </div>
              <div className="border border-chalk/80 bg-chalk/40 backdrop-blur-md px-4 py-3">
                <p className="font-mono text-[10px] tracking-widest uppercase text-ink/40 mb-1">Cart Subtotal</p>
                <p className="font-display text-3xl font-light">${cartSummary.subtotal.toFixed(2)}</p>
              </div>
            </div>
          </section>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <Link href="/products" className="border border-chalk/80 bg-chalk/60 backdrop-blur-md px-5 py-4 hover:border-ink transition-colors shadow-[0_10px_30px_rgba(13,13,13,0.06)]">
            <div className="flex items-center gap-3 mb-2">
              <ShoppingBag size={16} className="text-ink/50" />
              <p className="font-mono text-xs tracking-widest uppercase">Continue Shopping</p>
            </div>
            <p className="font-body text-sm text-ink/60">Browse the latest items and complete your cart.</p>
          </Link>

          <Link href="/admin" className="border border-chalk/80 bg-chalk/60 backdrop-blur-md px-5 py-4 hover:border-ink transition-colors shadow-[0_10px_30px_rgba(13,13,13,0.06)]">
            <div className="flex items-center gap-3 mb-2">
              <ShieldCheck size={16} className="text-ink/50" />
              <p className="font-mono text-xs tracking-widest uppercase">Admin Panel</p>
            </div>
            <p className="font-body text-sm text-ink/60">
              {user.role === "Admin" ? "Open dashboard and manage your store." : "Admin access required."}
            </p>
          </Link>

          <button
            type="button"
            onClick={() => {
              logout();
              router.push("/");
            }}
            className="text-left border border-chalk/80 bg-chalk/60 backdrop-blur-md px-5 py-4 hover:border-rust transition-colors shadow-[0_10px_30px_rgba(13,13,13,0.06)]"
          >
            <div className="flex items-center gap-3 mb-2">
              <LogOut size={16} className="text-rust" />
              <p className="font-mono text-xs tracking-widest uppercase text-rust">Sign Out</p>
            </div>
            <p className="font-body text-sm text-ink/60">End your session on this device.</p>
          </button>
        </div>

        <div className="mt-6 border border-chalk/80 bg-chalk/45 backdrop-blur-md px-4 py-3 shadow-[0_10px_30px_rgba(13,13,13,0.05)]">
          <p className="font-mono text-[10px] tracking-widest uppercase text-ink/40">
            Session {updatedAt ? `refreshed on ${formatDate(updatedAt)}` : "active"}
          </p>
        </div>
      </div>
    </div>
  );
}
