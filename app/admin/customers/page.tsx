"use client";
import { useEffect, useMemo, useState } from "react";
import { Users, Search, RefreshCw } from "lucide-react";
import { ordersApi } from "@/lib/api";

type OrderLike = Record<string, unknown>;

type CustomerRow = {
  key: string;
  name: string;
  email: string;
  orders: number;
  totalSpent: number;
  lastOrderAt: Date | null;
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

const getCustomerIdentity = (order: OrderLike): { key: string; name: string; email: string } => {
  const customer = order.customer as Record<string, unknown> | undefined;
  const customerId =
    (customer?.id as string | number | undefined) ||
    (customer?.userId as string | number | undefined) ||
    (order.customerId as string | number | undefined);

  const first = (customer?.firstName as string | undefined) || "";
  const last = (customer?.lastName as string | undefined) || "";
  const fullName = [first, last].filter(Boolean).join(" ").trim();

  const email =
    ((order.customerEmail as string | undefined) ||
      (customer?.email as string | undefined) ||
      "").trim();

  const name =
    (order.customerName as string | undefined)?.trim() ||
    fullName ||
    email ||
    "Guest";

  const key = customerId
    ? String(customerId)
    : email
      ? email.toLowerCase()
      : name.toLowerCase();

  return { key, name, email };
};

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const loadCustomers = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const response = await ordersApi.getAll();
      const orderList = extractList<OrderLike>(response);

      const map = new Map<string, CustomerRow>();

      for (const order of orderList) {
        const identity = getCustomerIdentity(order);
        const total = getOrderTotal(order);
        const createdAt = getOrderDate(order);

        const existing = map.get(identity.key);
        if (!existing) {
          map.set(identity.key, {
            key: identity.key,
            name: identity.name,
            email: identity.email,
            orders: 1,
            totalSpent: total,
            lastOrderAt: createdAt,
          });
          continue;
        }

        existing.orders += 1;
        existing.totalSpent += total;

        if (createdAt && (!existing.lastOrderAt || createdAt > existing.lastOrderAt)) {
          existing.lastOrderAt = createdAt;
        }

        if (!existing.email && identity.email) {
          existing.email = identity.email;
        }
      }

      const rows = Array.from(map.values()).sort((a, b) => b.totalSpent - a.totalSpent);
      setCustomers(rows);
    } catch {
      setError("Failed to load customers from server.");
      setCustomers([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadCustomers(false);
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return customers;
    return customers.filter((row) =>
      row.name.toLowerCase().includes(term) ||
      row.email.toLowerCase().includes(term)
    );
  }, [customers, search]);

  const summary = useMemo(() => {
    const totalSpent = filtered.reduce((sum, row) => sum + row.totalSpent, 0);
    const totalOrders = filtered.reduce((sum, row) => sum + row.orders, 0);
    const avgOrdersPerCustomer = filtered.length > 0 ? totalOrders / filtered.length : 0;
    return {
      customers: filtered.length,
      totalSpent,
      avgOrdersPerCustomer,
    };
  }, [filtered]);

  return (
    <div className="p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="font-display text-4xl font-light">Customers</h1>
          <p className="font-mono text-xs text-ink/40 mt-1 tracking-widest">Users aggregated from real order history</p>
        </div>
        <button
          type="button"
          onClick={() => void loadCustomers(true)}
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
          <p className="font-mono text-[10px] tracking-widest uppercase text-ink/40 mb-2">Customers</p>
          <p className="font-display text-3xl font-light">{loading ? "—" : summary.customers}</p>
        </div>
        <div className="bg-chalk border border-bone p-5">
          <p className="font-mono text-[10px] tracking-widest uppercase text-ink/40 mb-2">Total Spent</p>
          <p className="font-display text-3xl font-light">{loading ? "—" : formatCurrency(summary.totalSpent)}</p>
        </div>
        <div className="bg-chalk border border-bone p-5">
          <p className="font-mono text-[10px] tracking-widest uppercase text-ink/40 mb-2">Avg. Orders / Customer</p>
          <p className="font-display text-3xl font-light">
            {loading ? "—" : summary.avgOrdersPerCustomer.toFixed(1)}
          </p>
        </div>
      </div>

      <div className="bg-chalk border border-bone">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between px-6 py-4 border-b border-bone">
          <div className="flex items-center gap-2 font-mono text-xs tracking-widest uppercase text-ink/40">
            <Users size={14} />
            Customer List
          </div>
          <label className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email"
              className="w-64 border border-bone bg-transparent pl-9 pr-3 py-2 font-mono text-xs tracking-widest uppercase focus:outline-none focus:border-ink"
            />
          </label>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-bone">
                {["Customer", "Email", "Orders", "Total Spent", "Last Order"].map((head) => (
                  <th key={head} className="text-left px-6 py-3 font-mono text-[10px] tracking-widest uppercase text-ink/40">
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 font-mono text-xs text-ink/40">
                    Loading customers...
                  </td>
                </tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 font-mono text-xs text-ink/40">
                    No customers found.
                  </td>
                </tr>
              )}
              {!loading &&
                filtered.map((row) => (
                  <tr key={row.key} className="border-b border-bone/50 hover:bg-bone/30 transition-colors">
                    <td className="px-6 py-4 font-body text-sm">{row.name}</td>
                    <td className="px-6 py-4 font-mono text-xs text-ink/50">{row.email || "—"}</td>
                    <td className="px-6 py-4 font-mono text-xs text-ink/55">{row.orders}</td>
                    <td className="px-6 py-4 font-mono text-sm">{formatCurrency(row.totalSpent)}</td>
                    <td className="px-6 py-4 font-mono text-xs text-ink/40">
                      {row.lastOrderAt ? row.lastOrderAt.toLocaleDateString() : "—"}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
