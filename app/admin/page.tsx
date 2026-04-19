"use client";
import { useEffect, useMemo, useState } from "react";
import { TrendingUp, Package, ShoppingBag, Users, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { ordersApi, productsApi } from "@/lib/api";

type OrderLike = Record<string, unknown>;
type ProductLike = Record<string, unknown>;

type StatItem = {
  label: string;
  value: string;
  change: string;
  up: boolean | null;
  icon: typeof TrendingUp;
};

type RecentOrder = {
  id: string;
  customer: string;
  items: number;
  total: string;
  status: string;
  date: string;
};

const statusColors: Record<string, string> = {
  Fulfilled: "text-sage bg-sage/10",
  Processing: "text-clay bg-clay/10",
  Shipped: "text-mist bg-mist/20",
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    currencyDisplay: "code",
    maximumFractionDigits: 0,
  }).format(value);

const formatRelativeDate = (value?: string | number | Date) => {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
};

const extractList = <T,>(value: unknown): T[] => {
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
};

const getOrderDate = (order: OrderLike): Date | null => {
  const raw =
    (order.createdAt as string | undefined) ||
    (order.date as string | undefined) ||
    (order.placedAt as string | undefined) ||
    (order.orderDate as string | undefined);
  if (!raw) return null;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
};

const getOrderTotal = (order: OrderLike): number => {
  const raw =
    (order.total as number | string | undefined) ||
    (order.totalAmount as number | string | undefined) ||
    (order.grandTotal as number | string | undefined) ||
    (order.amount as number | string | undefined);
  if (typeof raw === "number") return raw;
  if (typeof raw === "string") return Number(raw.replace(/[^0-9.]/g, "")) || 0;
  return 0;
};

const getOrderItemsCount = (order: OrderLike): number => {
  const items =
    (order.items as unknown[]) ||
    (order.orderItems as unknown[]) ||
    (order.lines as unknown[]);
  if (Array.isArray(items)) return items.length;
  const quantity = order.quantity as number | undefined;
  return typeof quantity === "number" ? quantity : 0;
};

const getCustomerName = (order: OrderLike): string => {
  const direct = order.customerName as string | undefined;
  if (direct) return direct;
  const customer = order.customer as Record<string, unknown> | undefined;
  const first = customer?.firstName as string | undefined;
  const last = customer?.lastName as string | undefined;
  const full = [first, last].filter(Boolean).join(" ");
  if (full) return full;
  const email = (order.customerEmail as string | undefined) || (customer?.email as string | undefined);
  return email || "Guest";
};

const getOrderStatus = (order: OrderLike): string =>
  (order.status as string | undefined) || (order.state as string | undefined) || "Unknown";

const formatChange = (current: number, previous: number) => {
  if (previous <= 0) return "—";
  const delta = ((current - previous) / previous) * 100;
  const sign = delta >= 0 ? "+" : "";
  return `${sign}${delta.toFixed(1)}%`;
};

const getMonthLabel = () =>
  new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });

export default function AdminDashboard() {
  const [stats, setStats] = useState<StatItem[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const overviewLabel = useMemo(() => getMonthLabel(), []);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [ordersRes, productsRes] = await Promise.all([
          ordersApi.getAll(),
          productsApi.getAll({ page: 1, pageSize: 200 }),
        ]);
        const orders = extractList<OrderLike>(ordersRes);
        const products = extractList<ProductLike>(productsRes);
        const now = new Date();
        const last7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const prev7 = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

        const ordersWithDates = orders
          .map((order) => ({ order, date: getOrderDate(order) }))
          .filter((o) => o.date);

        const inLast7 = ordersWithDates.filter((o) => o.date && o.date >= last7);
        const inPrev7 = ordersWithDates.filter(
          (o) => o.date && o.date >= prev7 && o.date < last7
        );

        const revenueNow = inLast7.reduce((sum, o) => sum + getOrderTotal(o.order), 0);
        const revenuePrev = inPrev7.reduce((sum, o) => sum + getOrderTotal(o.order), 0);

        const ordersNow = inLast7.length;
        const ordersPrev = inPrev7.length;

        const productNow = products.length;
        const productsWithDates = products
          .map((product) => ({
            product,
            date: product.createdAt ? new Date(product.createdAt as string) : null,
          }))
          .filter((p) => p.date && !Number.isNaN(p.date.getTime()));
        const productNow7 = productsWithDates.filter((p) => p.date && p.date >= last7).length;
        const productPrev7 = productsWithDates.filter(
          (p) => p.date && p.date >= prev7 && p.date < last7
        ).length;

        const customersNow = new Set(
          inLast7.map((o) => getCustomerName(o.order)).filter(Boolean)
        ).size;
        const customersPrev = new Set(
          inPrev7.map((o) => getCustomerName(o.order)).filter(Boolean)
        ).size;

        const computedStats: StatItem[] = [
          {
            label: "Total Revenue",
            value: formatCurrency(revenueNow),
            change: formatChange(revenueNow, revenuePrev),
            up: revenuePrev > 0 ? revenueNow >= revenuePrev : null,
            icon: TrendingUp,
          },
          {
            label: "Products",
            value: productNow.toString(),
            change: formatChange(productNow7, productPrev7),
            up: productPrev7 > 0 ? productNow7 >= productPrev7 : null,
            icon: Package,
          },
          {
            label: "Orders",
            value: orders.length.toString(),
            change: formatChange(ordersNow, ordersPrev),
            up: ordersPrev > 0 ? ordersNow >= ordersPrev : null,
            icon: ShoppingBag,
          },
          {
            label: "Customers",
            value: new Set(orders.map((o) => getCustomerName(o))).size.toString(),
            change: formatChange(customersNow, customersPrev),
            up: customersPrev > 0 ? customersNow >= customersPrev : null,
            icon: Users,
          },
        ];

        const recent = [...orders]
          .map((order) => ({
            order,
            date: getOrderDate(order),
          }))
          .sort((a, b) => {
            const aTime = a.date ? a.date.getTime() : 0;
            const bTime = b.date ? b.date.getTime() : 0;
            return bTime - aTime;
          })
          .slice(0, 6)
          .map(({ order, date }) => {
            const rawId =
              (order.id as string | number | undefined) ||
              (order.orderNumber as string | number | undefined) ||
              (order.code as string | number | undefined) ||
              (order._id as string | undefined);
            const id = rawId ? `#${String(rawId)}` : "—";
            return {
              id,
              customer: getCustomerName(order),
              items: getOrderItemsCount(order),
              total: formatCurrency(getOrderTotal(order)),
              status: getOrderStatus(order),
              date: formatRelativeDate(date || undefined),
            };
          });

        if (!active) return;
        setStats(computedStats);
        setRecentOrders(recent);
      } catch (err) {
        if (!active) return;
        setError("Failed to load dashboard data.");
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-display text-4xl font-light">Dashboard</h1>
        <p className="font-mono text-xs text-ink/40 mt-1 tracking-widest">Overview — {overviewLabel}</p>
      </div>

      {error && (
        <div className="mb-6 border border-rust/30 bg-rust/5 px-4 py-3 font-mono text-xs text-rust">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {loading &&
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="bg-chalk p-6 border border-bone animate-pulse">
              <div className="flex justify-between items-start mb-4">
                <div className="h-3 w-24 bg-bone/70" />
                <div className="w-8 h-8 bg-bone" />
              </div>
              <div className="h-8 w-20 bg-bone/70 mb-2" />
              <div className="h-3 w-16 bg-bone/70" />
            </div>
          ))}
        {!loading &&
          stats.map(({ label, value, change, up, icon: Icon }) => (
            <div key={label} className="bg-chalk p-6 border border-bone">
              <div className="flex justify-between items-start mb-4">
                <p className="font-mono text-xs tracking-widest uppercase text-ink/40">{label}</p>
                <div className="w-8 h-8 bg-bone flex items-center justify-center">
                  <Icon size={14} className="text-ink/40" />
                </div>
              </div>
              <p className="font-display text-3xl font-light mb-2">{value}</p>
              <p
                className={`font-mono text-xs flex items-center gap-1 ${
                  up === null ? "text-ink/40" : up ? "text-sage" : "text-rust"
                }`}
              >
                {up === null ? null : up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {change}
              </p>
            </div>
          ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-chalk border border-bone">
        <div className="flex justify-between items-center px-6 py-4 border-b border-bone">
          <h2 className="font-mono text-xs tracking-widest uppercase">Recent Orders</h2>
          <a href="/admin/orders" className="font-mono text-xs text-clay hover:text-rust transition-colors tracking-widest">
            View All →
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-bone">
                {["Order", "Customer", "Items", "Total", "Status", "Date"].map((h) => (
                  <th key={h} className="text-left px-6 py-3 font-mono text-[10px] tracking-widest uppercase text-ink/40">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 font-mono text-xs text-ink/40">
                    Loading orders...
                  </td>
                </tr>
              )}
              {!loading && recentOrders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 font-mono text-xs text-ink/40">
                    No orders found.
                  </td>
                </tr>
              )}
              {!loading &&
                recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-bone/50 hover:bg-bone/30 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs">{order.id}</td>
                    <td className="px-6 py-4 font-body text-sm">{order.customer}</td>
                    <td className="px-6 py-4 font-mono text-xs text-ink/50">{order.items}</td>
                    <td className="px-6 py-4 font-mono text-sm font-medium">{order.total}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`font-mono text-[10px] tracking-widest uppercase px-2 py-1 ${
                          statusColors[order.status] || "text-ink/60 bg-bone/60"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-ink/40">{order.date}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}