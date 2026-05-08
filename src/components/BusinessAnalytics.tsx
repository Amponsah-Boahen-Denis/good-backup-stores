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
        <h2 className="text-lg font-medium text-gray-900">Business Analytics</h2>
        <p className="text-xs text-gray-600 mt-1">Track how your submitted stores perform in searches</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#E7F0F7] border border-[#0A66C2]/20 p-4 rounded-lg">
          <p className="text-xs text-[#0A66C2] font-medium">Total Stores</p>
          <p className="text-2xl font-bold text-[#0A66C2] mt-1">{analytics.totalStores}</p>
        </div>

        <div className="bg-[#E7F0F7] border border-[#0A66C2]/20 p-4 rounded-lg">
          <p className="text-xs text-[#0A66C2] font-medium">Search Appearances</p>
          <p className="text-2xl font-bold text-[#0A66C2] mt-1">{analytics.totalAppearances}</p>
        </div>

        <div className="bg-[#E7F0F7] border border-[#0A66C2]/20 p-4 rounded-lg">
          <p className="text-xs text-[#0A66C2] font-medium">Avg per Store</p>
          <p className="text-2xl font-bold text-[#0A66C2] mt-1">{analytics.averageAppearancesPerStore}</p>
        </div>

        <div className="bg-[#E7F0F7] border border-[#0A66C2]/20 p-4 rounded-lg">
          <p className="text-xs text-[#0A66C2] font-medium">Total Clicks</p>
          <p className="text-2xl font-bold text-[#0A66C2] mt-1">{analytics.totalClicks}</p>
        </div>
      </div>

      {/* Store Details */}
      {analytics.stores.length > 0 ? (
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h3 className="text-sm font-medium mb-3 text-gray-900">Store Performance</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {analytics.stores.map((store) => (
              <div
                key={store.storeId}
                className="flex items-center justify-between text-sm p-3 bg-gray-50 rounded border border-gray-200"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate text-gray-900">{store.storeName}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    {store.lastAppeared ? (
                      <>Last appeared {new Date(store.lastAppeared).toLocaleDateString()}</>
                    ) : (
                      <>Never appeared in results</>
                    )}
                  </p>
                </div>
                <div className="flex gap-2 ml-2">
                  <div className="text-right">
                    <p className="text-xs text-gray-600">Appearances</p>
                    <p className="font-semibold text-base text-[#0A66C2]">{store.appearances}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-600">Clicks</p>
                    <p className="font-semibold text-base text-[#0A66C2]">{store.clicks}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-[#E7F0F7] border border-[#0A66C2]/20 p-6 rounded-lg text-center">
          <p className="text-sm text-[#0A66C2]">
            No analytics yet. Submit a store and search for products to see analytics here.
          </p>
        </div>
      )}
    </section>
  );
}
