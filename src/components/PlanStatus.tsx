"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getCurrentUserPlan, getRemainingSearches, getRemainingStoreSlots, getPlanDisplayName, getUpgradeSuggestions } from "@/services/userPlans";

export default function PlanStatus() {
  const [plan, setPlan] = useState(getCurrentUserPlan());
  const [remainingSearches, setRemainingSearches] = useState(getRemainingSearches());
  const [remainingStores, setRemainingStores] = useState(getRemainingStoreSlots());
  const [upgradeSuggestions, setUpgradeSuggestions] = useState(getUpgradeSuggestions());

  useEffect(() => {
    // Update stats when component mounts or plan changes
    const currentPlan = getCurrentUserPlan();
    setPlan(currentPlan);
    setRemainingSearches(getRemainingSearches());
    setRemainingStores(getRemainingStoreSlots());
    setUpgradeSuggestions(getUpgradeSuggestions());
  }, []);

  const getPlanColor = (planType: string) => {
    switch (planType) {
      case "starter":
        return "text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800";
      case "pro":
        return "text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20";
      case "business":
        return "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20";
      default:
        return "text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800";
    }
  };

  const getUsageColor = (remaining: number, total: number) => {
    const percentage = (remaining / total) * 100;
    if (percentage > 50) return "text-green-600 dark:text-green-400";
    if (percentage > 20) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">Your Plan</h3>
        <Link href="/Pricing">
          <button className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 text-sm font-medium">
            Upgrade
          </button>
        </Link>
      </div>

      {/* Current Plan */}
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPlanColor(plan.planType)}`}>
            {getPlanDisplayName(plan.planType)}
          </span>
          {plan.planType === "starter" && (
            <span className="text-xs text-gray-500 dark:text-gray-400">Free</span>
          )}
        </div>
      </div>

      {/* Usage Stats */}
      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Daily Searches</span>
            <span className={getUsageColor(remainingSearches, plan.limits.searchesPerDay)}>
              {remainingSearches} / {plan.limits.searchesPerDay} remaining
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${
                remainingSearches > plan.limits.searchesPerDay * 0.5 
                  ? "bg-green-500" 
                  : remainingSearches > plan.limits.searchesPerDay * 0.2 
                  ? "bg-yellow-500" 
                  : "bg-red-500"
              }`}
              style={{ width: `${(remainingSearches / plan.limits.searchesPerDay) * 100}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Store Listings</span>
            <span className={getUsageColor(remainingStores, plan.limits.maxStoresUserCanAdd)}>
              {remainingStores} / {plan.limits.maxStoresUserCanAdd} remaining
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${
                remainingStores > plan.limits.maxStoresUserCanAdd * 0.5 
                  ? "bg-green-500" 
                  : remainingStores > plan.limits.maxStoresUserCanAdd * 0.2 
                  ? "bg-yellow-500" 
                  : "bg-red-500"
              }`}
              style={{ width: `${(remainingStores / plan.limits.maxStoresUserCanAdd) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Upgrade Suggestions */}
      {upgradeSuggestions.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Upgrade Suggestions:
          </h4>
          <ul className="space-y-1">
            {upgradeSuggestions.map((suggestion, index) => (
              <li key={index} className="text-xs text-gray-600 dark:text-gray-400">
                • {suggestion}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
