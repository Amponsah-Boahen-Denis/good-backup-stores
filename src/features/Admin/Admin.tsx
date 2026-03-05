"use client";

import { useEffect, useMemo, useState } from "react";
import { AppUser, UserStatus } from "@/types/user";
import { listUsers, setUserStatus, stats, setUserPlan, deleteUser } from "@/services/adminUsers";
import { getHistoryAnalytics, HistoryAnalytics } from "@/services/history";
import { getSystemSettings, updateSystemSettings, clearAllCaches, resetAllAnalytics, exportAllData, importData, SystemSettings } from "@/services/adminSystem";
import { getPendingStores, approveStore, rejectStore, getModerationStats, ModeratedStore } from "@/services/adminModeration";

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-black/10 dark:border-white/15 p-4">
      <p className="text-xs text-black/60 dark:text-white/60">{label}</p>
      <p className="text-xl font-semibold">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: UserStatus }) {
  const color = status === "active" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
    : status === "blocked" ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300"
    : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300";
  const label = status === "on_hold" ? "On hold" : status.charAt(0).toUpperCase() + status.slice(1);
  return <span className={`px-2 py-0.5 rounded-full text-xs ${color}`}>{label}</span>;
}

export default function Admin() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<{ total: number; blocked: number; onHold: number; active: number; registeredToday: number } | null>(null);
  const [analytics, setAnalytics] = useState<HistoryAnalytics | null>(null);
  const [systemSettings, setSystemSettings] = useState<SystemSettings | null>(null);
  const [pendingStores, setPendingStores] = useState<ModeratedStore[]>([]);
  const [moderationStats, setModerationStats] = useState<{ pending: number; approved: number; rejected: number; total: number } | null>(null);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const [u, m, a, settings, pending, modStats] = await Promise.all([
        listUsers(),
        stats(),
        getHistoryAnalytics(),
        Promise.resolve(getSystemSettings()),
        getPendingStores(),
        Promise.resolve(getModerationStats()),
      ]);
      setUsers(u);
      setMetrics(m);
      setAnalytics(a);
      setSystemSettings(settings);
      setPendingStores(pending);
      setModerationStats(modStats);
    } catch {
      setError("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refresh(); }, []);

  const actions = useMemo(() => ({
    block: async (id: string) => { await setUserStatus(id, "blocked"); await refresh(); },
    hold: async (id: string) => { await setUserStatus(id, "on_hold"); await refresh(); },
    activate: async (id: string) => { await setUserStatus(id, "active"); await refresh(); },
    setPlan: async (id: string, plan: "starter" | "pro" | "business") => { await setUserPlan(id, plan); await refresh(); },
    delete: async (id: string) => { if (confirm("Are you sure you want to delete this user?")) { await deleteUser(id); await refresh(); } },
    updateSettings: (updates: Partial<SystemSettings>) => { updateSystemSettings(updates); setSystemSettings(getSystemSettings()); },
    clearCaches: async () => { if (confirm("Clear all caches? This will reset search performance.")) { await clearAllCaches(); await refresh(); } },
    resetAnalytics: async () => { if (confirm("Reset all analytics? This cannot be undone.")) { await resetAllAnalytics(); await refresh(); } },
    exportData: async () => {
      const data = await exportAllData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `admin-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    },
    importData: async (file: File) => {
      const text = await file.text();
      const result = await importData(text);
      alert(result.message);
      if (result.success) await refresh();
    },
    approveStore: async (storeId: string) => { await approveStore(storeId, "admin"); await refresh(); },
    rejectStore: async (storeId: string, reason: string) => { await rejectStore(storeId, "admin", reason); await refresh(); },
  }), []);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Admin Dashboard</h1>
        <p className="text-sm text-black/60 dark:text-white/60">Owner-only controls. Frontend-only demo; will connect to API later.</p>
      </header>

      {error && (
        <div className="rounded-md border border-rose-200 bg-rose-50 text-rose-800 px-3 py-2 text-sm">{error}</div>
      )}

      <section>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <Stat label="Total users" value={metrics?.total ?? 0} />
          <Stat label="Active" value={metrics?.active ?? 0} />
          <Stat label="Blocked" value={metrics?.blocked ?? 0} />
          <Stat label="On hold" value={metrics?.onHold ?? 0} />
          <Stat label="Registered today" value={metrics?.registeredToday ?? 0} />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Search analytics</h2>
        {!analytics ? (
          <p className="text-sm text-black/60 dark:text-white/60">Loading analytics...</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <Stat label="Total searches" value={analytics.totalSearches} />
            <Stat label="Searches today" value={analytics.searchesToday} />
            <Stat label="Unique products" value={analytics.uniqueProducts} />
            <div className="col-span-2 lg:col-span-3 rounded-lg border border-black/10 dark:border-white/15 p-4">
              <p className="text-xs text-black/60 dark:text-white/60 mb-2">Top products</p>
              <ul className="text-sm space-y-1">
                {analytics.topProducts.length === 0 ? (
                  <li className="text-black/60 dark:text-white/60">No data</li>
                ) : analytics.topProducts.map((t) => (
                  <li key={t.name} className="flex justify-between"><span>{t.name}</span><span className="text-black/60 dark:text-white/60">{t.count}</span></li>
                ))}
              </ul>
            </div>
            <div className="col-span-2 lg:col-span-3 rounded-lg border border-black/10 dark:border-white/15 p-4">
              <p className="text-xs text-black/60 dark:text-white/60 mb-2">Top countries</p>
              <ul className="text-sm space-y-1">
                {analytics.topCountries.length === 0 ? (
                  <li className="text-black/60 dark:text-white/60">No data</li>
                ) : analytics.topCountries.map((t) => (
                  <li key={t.name} className="flex justify-between"><span>{t.name}</span><span className="text-black/60 dark:text-white/60">{t.count}</span></li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">System Settings</h2>
        {systemSettings && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-lg border border-black/10 dark:border-white/15 p-4 space-y-3">
              <h3 className="font-medium">General Settings</h3>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={systemSettings.maintenanceMode}
                  onChange={(e) => actions.updateSettings({ maintenanceMode: e.target.checked })}
                />
                Maintenance Mode
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={systemSettings.allowStoreSubmissions}
                  onChange={(e) => actions.updateSettings({ allowStoreSubmissions: e.target.checked })}
                />
                Allow Store Submissions
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={systemSettings.requireApproval}
                  onChange={(e) => actions.updateSettings({ requireApproval: e.target.checked })}
                />
                Require Approval for New Stores
              </label>
            </div>
            <div className="rounded-lg border border-black/10 dark:border-white/15 p-4 space-y-3">
              <h3 className="font-medium">Limits & Performance</h3>
              <label className="block">
                Max Search Results:
                <input
                  type="number"
                  value={systemSettings.maxSearchResults}
                  onChange={(e) => actions.updateSettings({ maxSearchResults: parseInt(e.target.value) || 50 })}
                  className="ml-2 px-2 py-1 border rounded w-20"
                />
              </label>
              <label className="block">
                Cache Expiry (hours):
                <input
                  type="number"
                  value={systemSettings.cacheExpiryHours}
                  onChange={(e) => actions.updateSettings({ cacheExpiryHours: parseInt(e.target.value) || 24 })}
                  className="ml-2 px-2 py-1 border rounded w-20"
                />
              </label>
            </div>
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Store Moderation</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <Stat label="Pending" value={moderationStats?.pending ?? 0} />
          <Stat label="Approved" value={moderationStats?.approved ?? 0} />
          <Stat label="Rejected" value={moderationStats?.rejected ?? 0} />
          <Stat label="Total" value={moderationStats?.total ?? 0} />
        </div>
        {pendingStores.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-medium">Pending Approval</h3>
            <div className="space-y-2">
              {pendingStores.map((store) => (
                <div key={store.id} className="rounded-lg border border-black/10 dark:border-white/15 p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{store.name}</h4>
                      <p className="text-sm text-black/60 dark:text-white/60">{store.address}</p>
                      <p className="text-sm text-black/60 dark:text-white/60">{store.country}</p>
                      {store.website && <p className="text-sm text-blue-600 dark:text-blue-400">{store.website}</p>}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => actions.approveStore(store.id)}
                        className="px-3 py-1 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 text-sm"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          const reason = prompt("Rejection reason:");
                          if (reason) actions.rejectStore(store.id, reason);
                        }}
                        className="px-3 py-1 rounded-md bg-rose-600 text-white hover:bg-rose-700 text-sm"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Users</h2>
        {loading ? (
          <p className="text-sm text-black/60 dark:text-white/60">Loading...</p>
        ) : users.length === 0 ? (
          <p className="text-sm text-black/60 dark:text-white/60">No users found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-black/10 dark:border-white/15 text-left">
                  <th className="py-2 pr-4">Name</th>
                  <th className="py-2 pr-4">Email</th>
                  <th className="py-2 pr-4">Plan</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Created</th>
                  <th className="py-2 pr-4">Updated</th>
                  <th className="py-2 pr-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-black/5 dark:border-white/10">
                    <td className="py-2 pr-4 whitespace-nowrap">{u.name}</td>
                    <td className="py-2 pr-4 whitespace-nowrap">{u.email}</td>
                    <td className="py-2 pr-4 whitespace-nowrap">
                      <select
                        value={u.planType || "starter"}
                        onChange={(e) => actions.setPlan(u.id, e.target.value as "starter" | "pro" | "business")}
                        className="px-2 py-1 border rounded text-sm"
                      >
                        <option value="starter">Starter</option>
                        <option value="pro">Pro</option>
                        <option value="business">Business</option>
                      </select>
                    </td>
                    <td className="py-2 pr-4 whitespace-nowrap"><StatusBadge status={u.status} /></td>
                    <td className="py-2 pr-4 whitespace-nowrap">{new Date(u.createdAt).toLocaleString()}</td>
                    <td className="py-2 pr-4 whitespace-nowrap">{new Date(u.updatedAt).toLocaleString()}</td>
                    <td className="py-2 pr-4 whitespace-nowrap flex gap-2 flex-wrap">
                      {u.status !== "blocked" && (
                        <button onClick={() => actions.block(u.id)} className="px-2 py-1 rounded-md bg-rose-600 text-white hover:bg-rose-700 text-xs">Block</button>
                      )}
                      {u.status !== "on_hold" && (
                        <button onClick={() => actions.hold(u.id)} className="px-2 py-1 rounded-md bg-amber-500 text-white hover:bg-amber-600 text-xs">Hold</button>
                      )}
                      {u.status !== "active" && (
                        <button onClick={() => actions.activate(u.id)} className="px-2 py-1 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 text-xs">Activate</button>
                      )}
                      <button onClick={() => actions.delete(u.id)} className="px-2 py-1 rounded-md bg-red-600 text-white hover:bg-red-700 text-xs">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Data Management</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-lg border border-black/10 dark:border-white/15 p-4 space-y-3">
            <h3 className="font-medium">System Controls</h3>
            <div className="space-y-2">
              <button
                onClick={actions.clearCaches}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
              >
                Clear All Caches
              </button>
              <button
                onClick={actions.resetAnalytics}
                className="w-full px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 text-sm"
              >
                Reset Analytics
              </button>
            </div>
          </div>
          <div className="rounded-lg border border-black/10 dark:border-white/15 p-4 space-y-3">
            <h3 className="font-medium">Data Backup</h3>
            <div className="space-y-2">
              <button
                onClick={actions.exportData}
                className="w-full px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 text-sm"
              >
                Export All Data
              </button>
              <label className="block">
                <span className="text-sm text-black/60 dark:text-white/60">Import Data:</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) actions.importData(file);
                  }}
                  className="mt-1 block w-full text-sm text-black/60 dark:text-white/60 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </label>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}



