"use client";

import { useEffect, useState } from "react";
import { getBusinessAnalytics } from "@/services/businessAnalytics";
import type { BusinessAnalytics } from "@/services/businessAnalytics";

export default function BusinessAnalytics() {
  const [analytics, setAnalytics] = useState<BusinessAnalytics | null>(null);

  useEffect(() => {
    const data = getBusinessAnalytics();
    setAnalytics(data);
  }, []);

  if (!analytics) return null;

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-medium">Business Analytics</h2>
        <p className="text-xs text-black/60 dark:text-white/60 mt-1">Track how your submitted stores perform in searches</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
          <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">Total Stores</p>
          <p className="text-2xl font-bold text-blue-900 dark:text-blue-100 mt-1">{analytics.totalStores}</p>
        </div>

        <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 p-4 rounded-lg">
          <p className="text-xs text-green-700 dark:text-green-300 font-medium">Search Appearances</p>
          <p className="text-2xl font-bold text-green-900 dark:text-green-100 mt-1">{analytics.totalAppearances}</p>
        </div>

        <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 p-4 rounded-lg">
          <p className="text-xs text-purple-700 dark:text-purple-300 font-medium">Avg per Store</p>
          <p className="text-2xl font-bold text-purple-900 dark:text-purple-100 mt-1">{analytics.averageAppearancesPerStore}</p>
        </div>

        <div className="bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 p-4 rounded-lg">
          <p className="text-xs text-orange-700 dark:text-orange-300 font-medium">Total Clicks</p>
          <p className="text-2xl font-bold text-orange-900 dark:text-orange-100 mt-1">{analytics.totalClicks}</p>
        </div>
      </div>

      {/* Store Details */}
      {analytics.stores.length > 0 ? (
        <div className="bg-black/5 dark:bg-white/5 rounded-lg p-4">
          <h3 className="text-sm font-medium mb-3">Store Performance</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {analytics.stores.map((store) => (
              <div
                key={store.storeId}
                className="flex items-center justify-between text-sm p-3 bg-white dark:bg-black/40 rounded border border-black/10 dark:border-white/10"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{store.storeName}</p>
                  <p className="text-xs text-black/60 dark:text-white/60 mt-1">
                    {store.lastAppeared ? (
                      <>Last appeared {new Date(store.lastAppeared).toLocaleDateString()}</>
                    ) : (
                      <>Never appeared in results</>
                    )}
                  </p>
                </div>
                <div className="flex gap-2 ml-2">
                  <div className="text-right">
                    <p className="text-xs text-black/60 dark:text-white/60">Appearances</p>
                    <p className="font-semibold text-base">{store.appearances}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-black/60 dark:text-white/60">Clicks</p>
                    <p className="font-semibold text-base">{store.clicks}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 p-6 rounded-lg text-center">
          <p className="text-sm text-black/60 dark:text-white/60">
            No analytics yet. Submit a store and search for products to see analytics here.
          </p>
        </div>
      )}
    </section>
  );
}
