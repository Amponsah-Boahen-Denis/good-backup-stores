"use client";

import { useState } from "react";
import Link from "next/link";
import Button from "@/components/Button";

type Props = {
  type: "search" | "store" | "feature";
  message: string;
  currentPlan: string;
  suggestedPlan?: string;
  onDismiss?: () => void;
};

export default function PlanLimitAlert({ 
  type, 
  message, 
  suggestedPlan = "Pro", 
  onDismiss 
}: Props) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  const getIcon = () => {
    switch (type) {
      case "search":
        return "🔍";
      case "store":
        return "🏪";
      case "feature":
        return "⭐";
      default:
        return "⚠️";
    }
  };

  const getTitle = () => {
    switch (type) {
      case "search":
        return "Daily Search Limit Reached";
      case "store":
        return "Store Limit Reached";
      case "feature":
        return "Feature Not Available";
      default:
        return "Plan Limit Reached";
    }
  };

  return (
    <div className="rounded-lg border border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20 p-4 mb-4">
      <div className="flex items-start gap-3">
        <span className="text-2xl">{getIcon()}</span>
        <div className="flex-1">
          <h3 className="font-semibold text-orange-800 dark:text-orange-200 mb-1">
            {getTitle()}
          </h3>
          <p className="text-sm text-orange-700 dark:text-orange-300 mb-3">
            {message}
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <Link href="/Pricing">
              <Button className="bg-orange-600 hover:bg-orange-700 text-white text-sm px-4 py-2">
                Upgrade to {suggestedPlan}
              </Button>
            </Link>
            <Button 
              onClick={handleDismiss}
              className="bg-gray-500 hover:bg-gray-600 text-white text-sm px-4 py-2"
            >
              Dismiss
            </Button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-orange-500 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-200"
          aria-label="Dismiss alert"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
