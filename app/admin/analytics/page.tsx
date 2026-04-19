"use client";
import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  TrendingUp,
  ShoppingBag,
  DollarSign,
  Receipt,
  Layers,
  RefreshCw,
} from "lucide-react";
import { ordersApi, productsApi } from "@/lib/api";

type Dict = Record<string, unknown>;

type TimeRange = 7 | 30 | 90;

type TrendPoint = {
  label: string;
  date: Date;
  revenue: number;
  orders: number;
};

type KpiCard = {
  label: string;
  value: string;
  helper: string;
  icon: typeof TrendingUp;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);

const extractList = <T,>(value: unknown): T[] => {
  if (Array.isArray(value)) return value as T[];
  if (value && typeof value === "object") {
    const candidate = value as { data?: unknown; items?: unknown };
    if (Array.isArray(candidate.items)) return candidate.items as T[];
    if (Array.isArray(candidate.data)) return candidate.data as T[];
    if (candidate.data && typeof candidate.data === "object") {
      const nested = candidate.data as { items?: unknown };
      if (Array.isArray(nested.items)) return nested.items as T[];
    }
  }
  return [];
};

const parseDate = (value: unknown): Date | null => {
  if (!value || (typeof value !== "string" && typeof value !== "number")) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const getOrderDate = (order: Dict): Date | null =>
  parseDate(order.createdAt) ||
  parseDate(order.date) ||
  parseDate(order.placedAt) ||
  parseDate(order.orderDate);

const getOrderTotal = (order: Dict): number => {
  const raw =
    (order.total as number | string | undefined) ??
    (order.totalAmount as number | string | undefined) ??
    (order.grandTotal as number | string | undefined) ??
    (order.amount as number | string | undefined);

  if (typeof raw === "number") return raw;
  if (typeof raw === "string") {
    const parsed = Number(raw.replace(/[^0-9.-]/g, ""));
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const getOrderStatus = (order: Dict): string =>
  ((order.status as string | undefined) || (order.state as string | undefined) || "Unknown").toString();

const startOfDay = (date: Date): Date => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const dayKey = (date: Date): string => date.toISOString().slice(0, 10);

const getCategoryFromProduct = (product: Dict): string => {
  const value = product.category as string | undefined;
  return value && value.trim() ? value : "Uncategorized";
};

export default function AdminAnalyticsPage() {
  const [range, setRange] = useState<TimeRange>(30);
  const [orders, setOrders] = useState<Dict[]>([]);
  const [products, setProducts] = useState<Dict[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const [ordersRes, productsRes] = await Promise.all([
        ordersApi.getAll(),
        productsApi.getAll({ page: 1, pageSize: 500 }),
      ]);
      setOrders(extractList<Dict>(ordersRes));
      setProducts(extractList<Dict>(productsRes));
    } catch {
      setError("Failed to load analytics from server.");
      setOrders([]);
      setProducts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadData(false);
  }, []);

  const analytics = useMemo(() => {
    const now = new Date();
    const end = startOfDay(now);
    const start = new Date(end);
    start.setDate(end.getDate() - (range - 1));

    const recentOrders = orders
      .map((order) => ({
        order,
        date: getOrderDate(order),
        total: getOrderTotal(order),
      }))
      .filter((item) => item.date && item.date >= start && item.date <= now) as Array<{
      order: Dict;
      date: Date;
      total: number;
    }>;

    const totalRevenue = recentOrders.reduce((sum, o) => sum + o.total, 0);
    const totalOrders = recentOrders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const paidCount = recentOrders.filter((o) => {
      const status = getOrderStatus(o.order).toLowerCase();
      return status.includes("paid") || status.includes("fulfilled") || status.includes("completed");
    }).length;

    const dailyMap = new Map<string, TrendPoint>();
    for (let i = 0; i < range; i += 1) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      const key = dayKey(day);
      dailyMap.set(key, {
        label: day.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        date: day,
        revenue: 0,
        orders: 0,
      });
    }

    for (const row of recentOrders) {
      const key = dayKey(startOfDay(row.date));
      const target = dailyMap.get(key);
      if (!target) continue;
      target.revenue += row.total;
      target.orders += 1;
    }

    const trend = Array.from(dailyMap.values());

    const statusCountMap = new Map<string, number>();
    for (const row of recentOrders) {
      const status = getOrderStatus(row.order);
      statusCountMap.set(status, (statusCountMap.get(status) || 0) + 1);
    }
    const statusBreakdown = Array.from(statusCountMap.entries())
      .map(([status, count]) => ({ status, count }))
      .sort((a, b) => b.count - a.count);

    const categoryMap = new Map<string, number>();
    for (const product of products) {
      const category = getCategoryFromProduct(product);
      categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
    }
    const categoryBreakdown = Array.from(categoryMap.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    const maxRevenue = trend.reduce((max, p) => (p.revenue > max ? p.revenue : max), 0);

    const kpis: KpiCard[] = [
      {
        label: `Revenue (${range}d)`,
        value: formatCurrency(totalRevenue),
        helper: `${totalOrders} orders`,
        icon: DollarSign,
      },
      {
        label: "Average Order",
        value: formatCurrency(avgOrderValue),
        helper: "Per order in selected period",
        icon: Receipt,
      },
      {
        label: "Total Orders",
        value: String(totalOrders),
        helper: `${paidCount} paid/fulfilled`,
        icon: ShoppingBag,
      },
      {
        label: "Products",
        value: String(products.length),
        helper: `${categoryMap.size} categories`,
        icon: Layers,
      },
    ];

    return {
      kpis,
      trend,
      maxRevenue,
      statusBreakdown,
      categoryBreakdown,
    };
  }, [orders, products, range]);

  return (
    <div className="p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="font-display text-4xl font-light">Analytics</h1>
          <p className="font-mono text-xs text-ink/40 mt-1 tracking-widest">Live insights from orders and products</p>
        </div>
        <div className="flex items-center gap-2">
          {[7, 30, 90].map((days) => (
            <button
              key={days}
              type="button"
              onClick={() => setRange(days as TimeRange)}
              className={`px-3 py-2 border font-mono text-xs tracking-widest uppercase transition-colors ${
                range === days
                  ? "border-ink bg-ink text-chalk"
                  : "border-bone text-ink/60 hover:border-ink hover:text-ink"
              }`}
            >
              {days}d
            </button>
          ))}
          <button
            type="button"
            onClick={() => void loadData(true)}
            className="ml-2 inline-flex items-center gap-2 border border-bone px-3 py-2 font-mono text-xs tracking-widest uppercase text-ink/60 hover:border-ink hover:text-ink transition-colors"
            disabled={refreshing || loading}
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 border border-rust/30 bg-rust/5 px-4 py-3 font-mono text-xs text-rust tracking-widest uppercase">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {analytics.kpis.map(({ label, value, helper, icon: Icon }) => (
          <div key={label} className="bg-chalk p-5 border border-bone">
            <div className="flex items-start justify-between mb-4">
              <p className="font-mono text-[10px] tracking-widest uppercase text-ink/40">{label}</p>
              <Icon size={14} className="text-ink/30" />
            </div>
            <p className="font-display text-3xl font-light mb-2">{loading ? "—" : value}</p>
            <p className="font-mono text-[10px] tracking-widest uppercase text-ink/40">{loading ? "Loading" : helper}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <section className="xl:col-span-2 bg-chalk border border-bone p-6">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 size={16} className="text-ink/40" />
            <h2 className="font-mono text-xs tracking-widest uppercase">Revenue Trend</h2>
          </div>

          <div className="h-56 flex items-end gap-1.5">
            {analytics.trend.map((point) => {
              const barHeight = analytics.maxRevenue > 0 ? Math.max(4, (point.revenue / analytics.maxRevenue) * 100) : 4;
              return (
                <div key={point.label} className="group flex-1 flex flex-col items-center justify-end">
                  <div className="w-full bg-clay/80 group-hover:bg-rust transition-colors" style={{ height: `${barHeight}%` }} />
                  <p className="mt-2 font-mono text-[9px] tracking-widest uppercase text-ink/35 hidden sm:block">
                    {point.label}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="border border-bone px-3 py-2">
              <p className="font-mono text-[10px] tracking-widest uppercase text-ink/40 mb-1">Peak Day</p>
              <p className="font-body text-sm text-ink/80">
                {analytics.trend.reduce((top, row) => (row.revenue > top.revenue ? row : top), analytics.trend[0] || { label: "—", revenue: 0, orders: 0, date: new Date() }).label}
              </p>
            </div>
            <div className="border border-bone px-3 py-2">
              <p className="font-mono text-[10px] tracking-widest uppercase text-ink/40 mb-1">Peak Revenue</p>
              <p className="font-body text-sm text-ink/80">
                {formatCurrency(analytics.maxRevenue)}
              </p>
            </div>
            <div className="border border-bone px-3 py-2">
              <p className="font-mono text-[10px] tracking-widest uppercase text-ink/40 mb-1">Total Days</p>
              <p className="font-body text-sm text-ink/80">{range}</p>
            </div>
          </div>
        </section>

        <section className="bg-chalk border border-bone p-6">
          <h2 className="font-mono text-xs tracking-widest uppercase mb-5">Order Status</h2>
          <div className="space-y-3">
            {loading && <p className="font-mono text-xs text-ink/40">Loading status data...</p>}
            {!loading && analytics.statusBreakdown.length === 0 && (
              <p className="font-mono text-xs text-ink/40">No orders in selected period.</p>
            )}
            {!loading &&
              analytics.statusBreakdown.map((row) => {
                const total = analytics.statusBreakdown.reduce((sum, x) => sum + x.count, 0) || 1;
                const width = (row.count / total) * 100;
                return (
                  <div key={row.status}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-mono text-[10px] tracking-widest uppercase text-ink/60">{row.status}</p>
                      <p className="font-mono text-[10px] tracking-widest uppercase text-ink/40">{row.count}</p>
                    </div>
                    <div className="h-2 bg-bone">
                      <div className="h-full bg-sage" style={{ width: `${width}%` }} />
                    </div>
                  </div>
                );
              })}
          </div>

          <h3 className="font-mono text-xs tracking-widest uppercase mt-8 mb-4">Top Categories</h3>
          <div className="space-y-3">
            {loading && <p className="font-mono text-xs text-ink/40">Loading category data...</p>}
            {!loading && analytics.categoryBreakdown.length === 0 && (
              <p className="font-mono text-xs text-ink/40">No products available.</p>
            )}
            {!loading &&
              analytics.categoryBreakdown.map((row) => {
                const max = analytics.categoryBreakdown[0]?.count || 1;
                const width = (row.count / max) * 100;
                return (
                  <div key={row.category}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-mono text-[10px] tracking-widest uppercase text-ink/60">{row.category}</p>
                      <p className="font-mono text-[10px] tracking-widest uppercase text-ink/40">{row.count}</p>
                    </div>
                    <div className="h-2 bg-bone">
                      <div className="h-full bg-clay" style={{ width: `${width}%` }} />
                    </div>
                  </div>
                );
              })}
          </div>
        </section>
      </div>
    </div>
  );
}
