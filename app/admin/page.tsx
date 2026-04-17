"use client";
import { TrendingUp, Package, ShoppingBag, Users, ArrowUpRight, ArrowDownRight } from "lucide-react";

const stats = [
  { label: "Total Revenue", value: "$24,380", change: "+12.5%", up: true, icon: TrendingUp },
  { label: "Products", value: "148", change: "+3 this week", up: true, icon: Package },
  { label: "Orders", value: "1,204", change: "+8.2%", up: true, icon: ShoppingBag },
  { label: "Customers", value: "892", change: "-1.4%", up: false, icon: Users },
];

const recentOrders = [
  { id: "#ORD-1204", customer: "Amira Hassan", items: 3, total: "$432.00", status: "Fulfilled", date: "Today" },
  { id: "#ORD-1203", customer: "Karim Mansour", items: 1, total: "$145.00", status: "Processing", date: "Today" },
  { id: "#ORD-1202", customer: "Sara Nour", items: 2, total: "$298.00", status: "Shipped", date: "Yesterday" },
  { id: "#ORD-1201", customer: "Omar Fathi", items: 4, total: "$621.00", status: "Fulfilled", date: "Yesterday" },
  { id: "#ORD-1200", customer: "Layla Aziz", items: 1, total: "$89.00", status: "Processing", date: "2 days ago" },
];

const statusColors: Record<string, string> = {
  Fulfilled: "text-sage bg-sage/10",
  Processing: "text-clay bg-clay/10",
  Shipped: "text-mist bg-mist/20",
};

export default function AdminDashboard() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-display text-4xl font-light">Dashboard</h1>
        <p className="font-mono text-xs text-ink/40 mt-1 tracking-widest">Overview — April 2025</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map(({ label, value, change, up, icon: Icon }) => (
          <div key={label} className="bg-chalk p-6 border border-bone">
            <div className="flex justify-between items-start mb-4">
              <p className="font-mono text-xs tracking-widest uppercase text-ink/40">{label}</p>
              <div className="w-8 h-8 bg-bone flex items-center justify-center">
                <Icon size={14} className="text-ink/40" />
              </div>
            </div>
            <p className="font-display text-3xl font-light mb-2">{value}</p>
            <p className={`font-mono text-xs flex items-center gap-1 ${up ? "text-sage" : "text-rust"}`}>
              {up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
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
              {recentOrders.map((order) => (
                <tr key={order.id} className="border-b border-bone/50 hover:bg-bone/30 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs">{order.id}</td>
                  <td className="px-6 py-4 font-body text-sm">{order.customer}</td>
                  <td className="px-6 py-4 font-mono text-xs text-ink/50">{order.items}</td>
                  <td className="px-6 py-4 font-mono text-sm font-medium">{order.total}</td>
                  <td className="px-6 py-4">
                    <span className={`font-mono text-[10px] tracking-widest uppercase px-2 py-1 ${statusColors[order.status]}`}>
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