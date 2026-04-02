"use client";

import { useEffect, useState } from "react";
import { clearHistory, listHistory, SearchHistoryItem, getHistoryAnalytics, HistoryAnalytics } from "@/services/history";
import { listStores } from "@/services/userStores";
import Button from "@/components/Button";

function StatCard({ title, value, subtitle, icon }: { title: string; value: string | number; subtitle?: string; icon: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50/50 p-6 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
      <div className="flex items-center gap-3">
        <div className="text-2xl">{icon}</div>
        <div>
          <p className="text-sm font-medium text-slate-600">{title}</p>
          <p className="text-3xl font-bold text-slate-900">{value}</p>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}

function SearchHistoryCard({ item }: { item: SearchHistoryItem }) {
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md hover:border-slate-300">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">🔍</span>
            <h3 className="font-semibold text-slate-900">{item.product}</h3>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
            {item.country && (
              <span className="flex items-center gap-1">
                <span className="text-base">📍</span>
                {item.country}
              </span>
            )}
            {item.location && (
              <span className="flex items-center gap-1">
                <span className="text-base">🏙️</span>
                {item.location}
              </span>
            )}
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>{formatDate(item.createdAt)}</span>
            <span className="flex items-center gap-1">
              <span className="text-base">📊</span>
              {item.resultsCount} result{item.resultsCount !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function History() {
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [storesCount, setStoresCount] = useState<number>(0);
  const [analytics, setAnalytics] = useState<HistoryAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      listHistory().then(setHistory),
      listStores().then((s) => setStoresCount(s.length)),
      getHistoryAnalytics().then(setAnalytics)
    ]).finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-slate-200 rounded w-48"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-slate-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 space-y-8">
      {/* Hero Header */}
      <header className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-50 text-sky-700 text-sm font-medium">
          <span className="text-base">📈</span>
          Your Search Journey
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">Search History</h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Track your discoveries and see how your search patterns evolve over time.
        </p>
      </header>

      {/* Stats Overview */}
      {analytics && (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Searches"
            value={analytics.totalSearches}
            subtitle="All time"
            icon="🔍"
          />
          <StatCard
            title="Searches Today"
            value={analytics.searchesToday}
            subtitle="Active today"
            icon="⚡"
          />
          <StatCard
            title="Unique Products"
            value={analytics.uniqueProducts}
            subtitle="Different items"
            icon="🛍️"
          />
          <StatCard
            title="Your Stores"
            value={storesCount}
            subtitle="Contributed"
            icon="🏪"
          />
        </section>
      )}

      {/* Recent Searches */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Recent Searches</h2>
            <p className="text-slate-600 mt-1">Your latest discovery missions</p>
          </div>
          {history.length > 0 && (
            <Button
              variant="secondary"
              onClick={async () => {
                await clearHistory();
                setHistory([]);
                setAnalytics(null);
              }}
              className="rounded-xl px-4 py-2 text-sm font-medium"
            >
              🗑️ Clear History
            </Button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="text-center py-12 space-y-4">
            <div className="text-6xl">🔍</div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-slate-900">No searches yet</h3>
              <p className="text-slate-600 max-w-md mx-auto">
                Start exploring stores by searching for products in your area.
                Your search history will appear here.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {history.map((item) => (
              <SearchHistoryCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>

      {/* Insights Section */}
      {analytics && analytics.topProducts.length > 0 && (
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Your Search Insights</h2>
            <p className="text-slate-600 mt-1">What you've been looking for most</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Products */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <span className="text-xl">🛒</span>
                Top Products
              </h3>
              <div className="space-y-3">
                {analytics.topProducts.slice(0, 5).map((product, index) => (
                  <div key={product.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-700 text-xs font-bold flex items-center justify-center">
                        {index + 1}
                      </span>
                      <span className="font-medium text-slate-900 capitalize">{product.name}</span>
                    </div>
                    <span className="text-sm text-slate-500">{product.count}x</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Countries */}
            {analytics.topCountries.length > 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="text-xl">🌍</span>
                  Top Countries
                </h3>
                <div className="space-y-3">
                  {analytics.topCountries.slice(0, 5).map((country, index) => (
                    <div key={country.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center">
                          {index + 1}
                        </span>
                        <span className="font-medium text-slate-900 capitalize">{country.name}</span>
                      </div>
                      <span className="text-sm text-slate-500">{country.count}x</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}
    </main>
  );
}



