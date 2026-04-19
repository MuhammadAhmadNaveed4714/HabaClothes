"use client";
import { useEffect, useMemo, useState } from "react";
import { Search, ShoppingBag, RefreshCw } from "lucide-react";
import { ordersApi } from "@/lib/api";

type OrderLike = Record<string, unknown>;

type OrderRow = {
  id: string;
  customer: string;
  customerEmail: string;
  items: number;
  total: number;
  status: string;
  createdAt: Date | null;
};

const statusColor: Record<string, string> = {
  fulfilled: "text-sage bg-sage/10",
  processing: "text-clay bg-clay/10",
  shipped: "text-mist bg-mist/20",
  paid: "text-sage bg-sage/10",
  pending: "text-rust bg-rust/10",
  cancelled: "text-rust bg-rust/10",
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

const parseDate = (value: unknown): Date | null => {
  if (!value || (typeof value !== "string" && typeof value !== "number")) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const getOrderDate = (order: OrderLike): Date | null =>
  parseDate(order.createdAt) ||
  parseDate(order.date) ||
  parseDate(order.placedAt) ||
  parseDate(order.orderDate);

const getOrderTotal = (order: OrderLike): number => {
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

const getOrderItemsCount = (order: OrderLike): number => {
  const items =
    (order.items as unknown[] | undefined) ||
    (order.orderItems as unknown[] | undefined) ||
    (order.lines as unknown[] | undefined);
  if (Array.isArray(items)) return items.length;
  const quantity = order.quantity as number | undefined;
  return typeof quantity === "number" ? quantity : 0;
};

const getCustomerName = (order: OrderLike): string => {
  const direct = order.customerName as string | undefined;
  if (direct && direct.trim()) return direct;

  const customer = order.customer as Record<string, unknown> | undefined;
  const first = customer?.firstName as string | undefined;
  const last = customer?.lastName as string | undefined;
  const full = [first, last].filter(Boolean).join(" ").trim();
  if (full) return full;

  const email =
    (order.customerEmail as string | undefined) ||
    (customer?.email as string | undefined);

  return email || "Guest";
};

const getCustomerEmail = (order: OrderLike): string => {
  const customer = order.customer as Record<string, unknown> | undefined;
  return (
    (order.customerEmail as string | undefined) ||
    (customer?.email as string | undefined) ||
    ""
  );
};

const getOrderStatus = (order: OrderLike): string =>
  ((order.status as string | undefined) ||
    (order.state as string | undefined) ||
    "Unknown").toString();

const getOrderId = (order: OrderLike): string => {
  const raw =
    (order.id as string | number | undefined) ||
    (order.orderNumber as string | number | undefined) ||
    (order.code as string | number | undefined) ||
    (order._id as string | undefined);
  return raw ? String(raw) : "—";
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const loadOrders = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const response = await ordersApi.getAll();
      const list = extractList<OrderLike>(response);
      const mapped = list.map((order) => ({
        id: getOrderId(order),
        customer: getCustomerName(order),
        customerEmail: getCustomerEmail(order),
        items: getOrderItemsCount(order),
        total: getOrderTotal(order),
        status: getOrderStatus(order),
        createdAt: getOrderDate(order),
      }));
      mapped.sort((a, b) => {
        const aTime = a.createdAt ? a.createdAt.getTime() : 0;
        const bTime = b.createdAt ? b.createdAt.getTime() : 0;
        return bTime - aTime;
      });
      setOrders(mapped);
    } catch {
      setError("Failed to load orders from server.");
      setOrders([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadOrders(false);
  }, []);

  const statuses = useMemo(() => {
    const set = new Set(orders.map((o) => o.status).filter(Boolean));
    return ["all", ...Array.from(set)];
  }, [orders]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return orders.filter((order) => {
      const byStatus = statusFilter === "all" || order.status === statusFilter;
      const bySearch =
        term.length === 0 ||
        order.id.toLowerCase().includes(term) ||
        order.customer.toLowerCase().includes(term) ||
        order.customerEmail.toLowerCase().includes(term);
      return byStatus && bySearch;
    });
  }, [orders, search, statusFilter]);

  const summary = useMemo(() => {
    const revenue = filtered.reduce((sum, row) => sum + row.total, 0);
    const itemCount = filtered.reduce((sum, row) => sum + row.items, 0);
    return {
      orders: filtered.length,
      revenue,
      items: itemCount,
    };
  }, [filtered]);

  return (
    <div className="p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="font-display text-4xl font-light">Orders</h1>
          <p className="font-mono text-xs text-ink/40 mt-1 tracking-widest">Track and manage customer purchases</p>
        </div>
        <button
          type="button"
          onClick={() => void loadOrders(true)}
          disabled={loading || refreshing}
          className="inline-flex items-center gap-2 border border-bone px-4 py-2 font-mono text-xs tracking-widest uppercase text-ink/60 hover:border-ink hover:text-ink transition-colors disabled:opacity-60"
        >
          <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-6 border border-rust/30 bg-rust/5 px-4 py-3 font-mono text-xs text-rust tracking-widest uppercase">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-chalk border border-bone p-5">
          <p className="font-mono text-[10px] tracking-widest uppercase text-ink/40 mb-2">Orders</p>
          <p className="font-display text-3xl font-light">{loading ? "—" : summary.orders}</p>
        </div>
        <div className="bg-chalk border border-bone p-5">
          <p className="font-mono text-[10px] tracking-widest uppercase text-ink/40 mb-2">Revenue</p>
          <p className="font-display text-3xl font-light">{loading ? "—" : formatCurrency(summary.revenue)}</p>
        </div>
        <div className="bg-chalk border border-bone p-5">
          <p className="font-mono text-[10px] tracking-widest uppercase text-ink/40 mb-2">Items Sold</p>
          <p className="font-display text-3xl font-light">{loading ? "—" : summary.items}</p>
        </div>
      </div>

      <div className="bg-chalk border border-bone">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between px-6 py-4 border-b border-bone">
          <div className="flex items-center gap-2 font-mono text-xs tracking-widest uppercase text-ink/40">
            <ShoppingBag size={14} />
            All Orders
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by order or customer"
                className="w-64 border border-bone bg-transparent pl-9 pr-3 py-2 font-mono text-xs tracking-widest uppercase focus:outline-none focus:border-ink"
              />
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-bone bg-transparent px-3 py-2 font-mono text-xs tracking-widest uppercase focus:outline-none focus:border-ink"
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status === "all" ? "All statuses" : status}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-bone">
                {["Order", "Customer", "Items", "Total", "Status", "Date"].map((head) => (
                  <th key={head} className="text-left px-6 py-3 font-mono text-[10px] tracking-widest uppercase text-ink/40">
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 font-mono text-xs text-ink/40">
                    Loading orders...
                  </td>
                </tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 font-mono text-xs text-ink/40">
                    No orders found.
                  </td>
                </tr>
              )}
              {!loading &&
                filtered.map((order) => {
                  const statusKey = order.status.toLowerCase();
                  return (
                    <tr key={`${order.id}-${order.customer}-${order.total}`} className="border-b border-bone/50 hover:bg-bone/30 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs">#{order.id}</td>
                      <td className="px-6 py-4">
                        <p className="font-body text-sm">{order.customer}</p>
                        {order.customerEmail && (
                          <p className="font-mono text-[10px] tracking-widest uppercase text-ink/35 mt-1">{order.customerEmail}</p>
                        )}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-ink/55">{order.items}</td>
                      <td className="px-6 py-4 font-mono text-sm">{formatCurrency(order.total)}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`font-mono text-[10px] tracking-widest uppercase px-2 py-1 ${
                            statusColor[statusKey] || "text-ink/60 bg-bone/60"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-ink/40">
                        {order.createdAt ? order.createdAt.toLocaleDateString() : "—"}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
