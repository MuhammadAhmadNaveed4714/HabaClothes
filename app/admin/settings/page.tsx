"use client";
import { useMemo, useState } from "react";
import { Save, Shield, Bell, Store, UserRound, Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

export default function AdminSettingsPage() {
  const { user } = useAuthStore();

  const fullName = useMemo(() => {
    if (!user) return "";
    return [user.firstName, user.lastName].filter(Boolean).join(" ");
  }, [user]);

  const [storeName, setStoreName] = useState("");
  const [supportEmail, setSupportEmail] = useState(user?.email ?? "");
  const [supportPhone, setSupportPhone] = useState("");
  const [currency, setCurrency] = useState("PKR");
  const [timezone, setTimezone] = useState("UTC");
  const [notifyOrders, setNotifyOrders] = useState(true);
  const [notifyLowStock, setNotifyLowStock] = useState(true);
  const [notifyCustomers, setNotifyCustomers] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    // Simulate API call
    setTimeout(() => {
      setSaved(true);
      setSaving(false);
      setTimeout(() => setSaved(false), 2000);
    }, 800);
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-display text-4xl font-light">Settings</h1>
        <p className="font-mono text-xs text-ink/40 mt-1 tracking-widest">Manage store and account preferences</p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        <section className="bg-chalk border border-bone">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-bone">
            <Store size={16} className="text-ink/40" />
            <h2 className="font-mono text-xs tracking-widest uppercase">Store</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-6 py-6">
            <label className="space-y-2">
              <span className="font-mono text-xs tracking-widest uppercase text-ink/40">Store name</span>
              <input
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full border border-bone bg-transparent px-4 py-2 font-body text-sm focus:outline-none focus:border-ink"
                placeholder="Haba Studio"
              />
            </label>
            <label className="space-y-2">
              <span className="font-mono text-xs tracking-widest uppercase text-ink/40">Support email</span>
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full border border-bone bg-transparent px-4 py-2 font-body text-sm focus:outline-none focus:border-ink"
                placeholder="support@haba.com"
              />
            </label>
            <label className="space-y-2">
              <span className="font-mono text-xs tracking-widest uppercase text-ink/40">Support phone</span>
              <input
                value={supportPhone}
                onChange={(e) => setSupportPhone(e.target.value)}
                className="w-full border border-bone bg-transparent px-4 py-2 font-body text-sm focus:outline-none focus:border-ink"
                placeholder="+1 555 000 111"
              />
            </label>
            <label className="space-y-2">
              <span className="font-mono text-xs tracking-widest uppercase text-ink/40">Currency</span>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full border border-bone bg-transparent px-4 py-2 font-body text-sm focus:outline-none focus:border-ink"
              >
                <option value="PKR">PKR</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="AED">AED</option>
              </select>
            </label>
            <label className="space-y-2">
              <span className="font-mono text-xs tracking-widest uppercase text-ink/40">Timezone</span>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full border border-bone bg-transparent px-4 py-2 font-body text-sm focus:outline-none focus:border-ink"
              >
                <option value="UTC">UTC</option>
                <option value="America/New_York">America/New_York</option>
                <option value="Europe/London">Europe/London</option>
                <option value="Asia/Dubai">Asia/Dubai</option>
              </select>
            </label>
          </div>
        </section>

        <section className="bg-chalk border border-bone">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-bone">
            <UserRound size={16} className="text-ink/40" />
            <h2 className="font-mono text-xs tracking-widest uppercase">Account</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-6 py-6">
            <label className="space-y-2">
              <span className="font-mono text-xs tracking-widest uppercase text-ink/40">Name</span>
              <input
                value={fullName}
                readOnly
                className="w-full border border-bone bg-bone/30 px-4 py-2 font-body text-sm text-ink/60"
              />
            </label>
            <label className="space-y-2">
              <span className="font-mono text-xs tracking-widest uppercase text-ink/40">Email</span>
              <input
                value={user?.email ?? ""}
                readOnly
                className="w-full border border-bone bg-bone/30 px-4 py-2 font-body text-sm text-ink/60"
              />
            </label>
          </div>
        </section>

        <section className="bg-chalk border border-bone">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-bone">
            <Bell size={16} className="text-ink/40" />
            <h2 className="font-mono text-xs tracking-widest uppercase">Notifications</h2>
          </div>
          <div className="px-6 py-6 space-y-4">
            <label className="flex items-center justify-between gap-4 border border-bone px-4 py-3">
              <div>
                <p className="font-body text-sm">New orders</p>
                <p className="font-mono text-[10px] uppercase tracking-widest text-ink/40">Receive alerts for each order</p>
              </div>
              <input
                type="checkbox"
                checked={notifyOrders}
                onChange={(e) => setNotifyOrders(e.target.checked)}
                className="h-4 w-4 accent-ink"
              />
            </label>
            <label className="flex items-center justify-between gap-4 border border-bone px-4 py-3">
              <div>
                <p className="font-body text-sm">Low stock</p>
                <p className="font-mono text-[10px] uppercase tracking-widest text-ink/40">Alerts when inventory drops</p>
              </div>
              <input
                type="checkbox"
                checked={notifyLowStock}
                onChange={(e) => setNotifyLowStock(e.target.checked)}
                className="h-4 w-4 accent-ink"
              />
            </label>
            <label className="flex items-center justify-between gap-4 border border-bone px-4 py-3">
              <div>
                <p className="font-body text-sm">Customer activity</p>
                <p className="font-mono text-[10px] uppercase tracking-widest text-ink/40">Follow new signups</p>
              </div>
              <input
                type="checkbox"
                checked={notifyCustomers}
                onChange={(e) => setNotifyCustomers(e.target.checked)}
                className="h-4 w-4 accent-ink"
              />
            </label>
          </div>
        </section>

        <section className="bg-chalk border border-bone">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-bone">
            <Shield size={16} className="text-ink/40" />
            <h2 className="font-mono text-xs tracking-widest uppercase">Security</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-6 py-6">
            <label className="space-y-2">
              <span className="font-mono text-xs tracking-widest uppercase text-ink/40">Current password</span>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full border border-bone bg-transparent px-4 py-2 font-body text-sm focus:outline-none focus:border-ink"
              />
            </label>
            <label className="space-y-2">
              <span className="font-mono text-xs tracking-widest uppercase text-ink/40">New password</span>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border border-bone bg-transparent px-4 py-2 font-body text-sm focus:outline-none focus:border-ink"
              />
            </label>
            <label className="space-y-2">
              <span className="font-mono text-xs tracking-widest uppercase text-ink/40">Confirm password</span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border border-bone bg-transparent px-4 py-2 font-body text-sm focus:outline-none focus:border-ink"
              />
            </label>
          </div>
        </section>

        <div className="flex items-center justify-between">
          <p className="font-mono text-xs text-ink/40 tracking-widest">
            {saving ? "Saving settings..." : saved ? "Settings saved" : "Changes are saved locally"}
          </p>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 border border-ink px-5 py-2 font-mono text-xs tracking-widest uppercase hover:bg-ink hover:text-chalk transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Save size={14} />
            )}
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
