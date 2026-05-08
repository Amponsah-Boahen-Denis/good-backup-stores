"use client";

import { useEffect, useMemo, useState } from "react";
import { AppUser, UserStatus } from "@/types/user";
import { listUsers, setUserStatus, stats } from "@/services/adminUsers";
import { getHistoryAnalytics, HistoryAnalytics } from "@/services/history";
import { clearAllCaches, resetAllAnalytics, exportAllData, importData } from "@/services/adminSystem";
import { getPendingStores, approveStore, rejectStore, getModerationStats, ModeratedStore } from "@/services/adminModeration";

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[1.5rem] border border-[#0A66C2]/20 bg-[#E7F0F7]/50 p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5">
      <p className="text-[11px] uppercase tracking-[0.25em] text-[#0A66C2]/70">
        {label}
      </p>
      <p className="mt-3 text-3xl font-semibold text-[#0A66C2]">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: UserStatus }) {
  const color = status === "active" ? "bg-[#0A66C2]/10 text-[#0A66C2] border-[#0A66C2]/20"
    : status === "blocked" ? "bg-red-100 text-red-700 border-red-200"
    : "bg-amber-100 text-amber-700 border-amber-200";
  const label = status === "on_hold" ? "On hold" : status.charAt(0).toUpperCase() + status.slice(1);
  return <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium tracking-wide transition border ${color}`}>
    {label}
  </span>;
}

export default function Admin() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<{ total: number; blocked: number; onHold: number; active: number; registeredToday: number } | null>(null);
  const [analytics, setAnalytics] = useState<HistoryAnalytics | null>(null);
  const [pendingStores, setPendingStores] = useState<ModeratedStore[]>([]);
  const [moderationStats, setModerationStats] = useState<{ pending: number; approved: number; rejected: number; total: number } | null>(null);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const [u, m, a, pending, modStats] = await Promise.all([
        listUsers(),
        stats(),
        getHistoryAnalytics(),
        getPendingStores(),
        Promise.resolve(getModerationStats()),
      ]);
      setUsers(u);
      setMetrics(m);
      setAnalytics(a);
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
    activate: async (id: string) => { await setUserStatus(id, "active"); await refresh(); },
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
    <main className="mx-auto max-w-6xl px-4 py-10 space-y-8 bg-[#E7F0F7]">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-[#0A66C2]">Admin Dashboard</h1>
        <p className="text-sm text-[#0A66C2]/70">Owner-only controls. Frontend-only demo; will connect to API later.</p>
      </header>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 text-red-800 px-3 py-2 text-sm">{error}</div>
      )}

      <section className="rounded-[1.5rem] bg-white border border-[#0A66C2]/10 p-6 shadow-sm">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <Stat label="Total users" value={metrics?.total ?? 0} />
          <Stat label="Active" value={metrics?.active ?? 0} />
          <Stat label="Blocked" value={metrics?.blocked ?? 0} />
          <Stat label="On hold" value={metrics?.onHold ?? 0} />
          <Stat label="Registered today" value={metrics?.registeredToday ?? 0} />
        </div>
      </section>

      <section className="space-y-3 rounded-[1.5rem] bg-white border border-[#0A66C2]/10 p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-[#0A66C2]">Search analytics</h2>
          <span className="text-sm text-[#0A66C2]/70">Realtime overview</span>
        </div>
        {!analytics ? (
          <p className="text-sm text-[#0A66C2]/70">Loading analytics...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
            <Stat label="Total searches" value={analytics.totalSearches} />
            <Stat label="Searches today" value={analytics.searchesToday} />
            <Stat label="Unique products" value={analytics.uniqueProducts} />
            <div className="rounded-lg border border-[#0A66C2]/20 p-4 bg-[#E7F0F7]/30">
              <p className="text-xs text-[#0A66C2]/70 mb-2">Top products</p>
              <ul className="text-sm space-y-1">
                {analytics.topProducts.length === 0 ? (
                  <li className="text-[#0A66C2]/70">No data</li>
                ) : analytics.topProducts.map((t) => (
                  <li key={t.name} className="flex justify-between"><span className="text-[#0A66C2]">{t.name}</span><span className="text-[#0A66C2]/70">{t.count}</span></li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg border border-[#0A66C2]/20 p-4 bg-[#E7F0F7]/30">
              <p className="text-xs text-[#0A66C2]/70 mb-2">Top countries</p>
              <ul className="text-sm space-y-1">
                {analytics.topCountries.length === 0 ? (
                  <li className="text-[#0A66C2]/70">No data</li>
                ) : analytics.topCountries.map((t) => (
                  <li key={t.name} className="flex justify-between"><span className="text-[#0A66C2]">{t.name}</span><span className="text-[#0A66C2]/70">{t.count}</span></li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </section>


      <section className="space-y-3 rounded-[1.5rem] bg-white border border-[#0A66C2]/10 p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-[#0A66C2]">Store Moderation</h2>
          <span className="text-sm text-[#0A66C2]/70">Review queue</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <Stat label="Pending" value={moderationStats?.pending ?? 0} />
          <Stat label="Approved" value={moderationStats?.approved ?? 0} />
          <Stat label="Rejected" value={moderationStats?.rejected ?? 0} />
          <Stat label="Total" value={moderationStats?.total ?? 0} />
        </div>
        {pendingStores.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-medium text-[#0A66C2]">Pending Approval</h3>
            <div className="space-y-4">
              {pendingStores.map((store) => (
                <div key={store.id} className="rounded-2xl border border-[#0A66C2]/20 bg-[#E7F0F7]/50 p-4 shadow-sm transition hover:-translate-y-0.5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h4 className="font-medium text-[#0A66C2]">{store.name}</h4>
                      <p className="text-sm text-[#0A66C2]/70">{store.address}</p>
                      <p className="text-sm text-[#0A66C2]/70">{store.country}</p>
                      {store.website && <p className="text-sm text-[#0A66C2]">{store.website}</p>}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => actions.approveStore(store.id)}
                        className="px-3 py-1 rounded-full bg-[#0A66C2] text-white hover:bg-[#0A66C2]/90 transition text-sm"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          const reason = prompt("Rejection reason:");
                          if (reason) actions.rejectStore(store.id, reason);
                        }}
                        className="px-3 py-1 rounded-full bg-red-600 text-white hover:bg-red-700 transition text-sm"
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

      <section className="space-y-3 rounded-[1.5rem] bg-white border border-[#0A66C2]/10 p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-[#0A66C2]">Users</h2>
          <span className="text-sm text-[#0A66C2]/70">User management</span>
        </div>
        {loading ? (
          <p className="text-sm text-[#0A66C2]/70">Loading...</p>
        ) : users.length === 0 ? (
          <p className="text-sm text-[#0A66C2]/70">No users found.</p>
        ) : (
          <div className="overflow-x-auto rounded-[1.5rem] border border-[#0A66C2]/10 bg-white shadow-sm">
            <table className="min-w-full text-sm divide-y divide-[#0A66C2]/10">
              <thead className="bg-[#E7F0F7]/50">
                <tr className="border-b border-[#0A66C2]/10 text-left">
                  <th className="py-2 pr-4 text-[#0A66C2]">Name</th>
                  <th className="py-2 pr-4 text-[#0A66C2]">Email</th>
                  <th className="py-2 pr-4 text-[#0A66C2]">Status</th>
                  <th className="py-2 pr-4 text-[#0A66C2]">Created</th>
                  <th className="py-2 pr-4 text-[#0A66C2]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-[#0A66C2]/5">
                    <td className="py-3 pr-4 whitespace-nowrap text-[#0A66C2]">{u.name}</td>
                    <td className="py-3 pr-4 whitespace-nowrap text-[#0A66C2]/70">{u.email}</td>
                    <td className="py-2 pr-4 whitespace-nowrap"><StatusBadge status={u.status} /></td>
                    <td className="py-2 pr-4 whitespace-nowrap text-[#0A66C2]/70">{new Date(u.createdAt).toLocaleString()}</td>
                    <td className="py-2 pr-4 whitespace-nowrap flex gap-2 flex-wrap">
                      {u.status !== "active" && (
                        <button onClick={() => actions.activate(u.id)} className="px-3 py-1 rounded-full bg-[#0A66C2] text-white hover:bg-[#0A66C2]/90 transition text-xs">
                          {u.status === "on_hold" ? "Approve" : "Activate"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="space-y-3 rounded-[1.5rem] bg-white border border-[#0A66C2]/10 p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-[#0A66C2]">Data Management</h2>
          <span className="text-sm text-[#0A66C2]/70">Backup and maintenance</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-[#0A66C2]/20 bg-[#E7F0F7]/50 p-4 space-y-3 shadow-sm">
            <h3 className="font-medium text-[#0A66C2]">System Controls</h3>
            <div className="space-y-2">
              <button
                onClick={actions.clearCaches}
                className="w-full px-4 py-2 bg-[#0A66C2] text-white rounded-full hover:bg-[#0A66C2]/90 transition text-sm"
              >
                Clear All Caches
              </button>
              <button
                onClick={actions.resetAnalytics}
                className="w-full px-4 py-2 bg-amber-600 text-white rounded-full hover:bg-amber-700 transition text-sm"
              >
                Reset Analytics
              </button>
            </div>
          </div>
          <div className="rounded-2xl border border-[#0A66C2]/20 bg-[#E7F0F7]/50 p-4 space-y-3 shadow-sm">
            <h3 className="font-medium text-[#0A66C2]">Data Backup</h3>
            <div className="space-y-2">
              <button
                onClick={actions.exportData}
                className="w-full px-4 py-2 bg-[#0A66C2] text-white rounded-full hover:bg-[#0A66C2]/90 transition text-sm"
              >
                Export All Data
              </button>
              <label className="block">
                <span className="text-sm text-[#0A66C2]/70">Import Data:</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) actions.importData(file);
                  }}
                  className="mt-1 block w-full text-sm text-[#0A66C2]/70 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-[#E7F0F7] file:text-[#0A66C2] hover:file:bg-[#E7F0F7]/80"
                />
              </label>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}



