// User plan management and limit enforcement
// This will be replaced with backend API calls later

export type PlanType = "starter" | "pro" | "business";

export type PlanLimits = {
  searchesPerDay: number;
  storesPerSearch: number;
  maxStoresUserCanAdd: number;
  contactFields: string[];
  searchHistoryDays: number;
  supportLevel: "basic" | "priority";
  features: string[];
};

export type UserPlan = {
  planType: PlanType;
  limits: PlanLimits;
  usage: {
    searchesToday: number;
    searchesResetDate: string; // ISO date string
    storesAdded: number;
  };
};

// Plan definitions matching our pricing page
export const PLAN_DEFINITIONS: Record<PlanType, PlanLimits> = {
  starter: {
    searchesPerDay: 4,
    storesPerSearch: 20,
    maxStoresUserCanAdd: 1,
    contactFields: ["phone"],
    searchHistoryDays: 7,
    supportLevel: "basic",
    features: ["basic_search", "search_history"],
  },
  pro: {
    searchesPerDay: 20,
    storesPerSearch: 50,
    maxStoresUserCanAdd: 5,
    contactFields: ["phone", "email"],
    searchHistoryDays: 30,
    supportLevel: "priority",
    features: ["basic_search", "search_history", "advanced_filters", "export_results"],
  },
  business: {
    searchesPerDay: 200,
    storesPerSearch: 500,
    maxStoresUserCanAdd: 10,
    contactFields: ["phone", "email", "website"],
    searchHistoryDays: -1, // unlimited
    supportLevel: "priority",
    features: ["basic_search", "search_history", "advanced_filters", "export_results", "analytics", "custom_branding"],
  },
};

// Get current user plan (will be from localStorage for now, backend later)
import { safeGet, safeWriteJSON } from "@/services/storage";

export function getCurrentUserPlan(): UserPlan {
  const stored = safeGet("userPlan");
  if (stored) {
    const parsed = JSON.parse(stored);
    const today = new Date().toDateString();
    if (parsed.usage.searchesResetDate !== today) {
      parsed.usage.searchesToday = 0;
      parsed.usage.searchesResetDate = today;
      safeWriteJSON("userPlan", parsed);
    }
    return parsed;
  }

  const defaultPlan: UserPlan = {
    planType: "starter",
    limits: PLAN_DEFINITIONS.starter,
    usage: {
      searchesToday: 0,
      searchesResetDate: new Date().toDateString(),
      storesAdded: 0,
    },
  };

  safeWriteJSON("userPlan", defaultPlan);
  return defaultPlan;
}

// Update user plan (for when they upgrade)
export function updateUserPlan(planType: PlanType): UserPlan {
  const currentPlan = getCurrentUserPlan();
  const newPlan: UserPlan = {
    planType,
    limits: PLAN_DEFINITIONS[planType],
    usage: {
      ...currentPlan.usage,
      // Keep current usage, just update limits
    },
  };
  
  safeWriteJSON("userPlan", newPlan);
  return newPlan;
}

// Check if user can perform a search
export function canPerformSearch(): { allowed: boolean; reason?: string } {
  const plan = getCurrentUserPlan();

  if (plan.usage.searchesToday >= plan.limits.searchesPerDay) {
    return {
      allowed: false,
      reason: `You've reached your daily search limit of ${plan.limits.searchesPerDay}. Upgrade your plan for more searches.`,
    };
  }

  return { allowed: true };
}

// Record a search (call after successful search)
export function recordSearch(): void {
  const plan = getCurrentUserPlan();
  plan.usage.searchesToday += 1;
  safeWriteJSON("userPlan", plan);
}

// Check if user can add a store
export function canAddStore(): { allowed: boolean; reason?: string } {
  const plan = getCurrentUserPlan();
  
  if (plan.usage.storesAdded >= plan.limits.maxStoresUserCanAdd) {
    return {
      allowed: false,
      reason: `You've reached your store limit of ${plan.limits.maxStoresUserCanAdd}. Upgrade your plan to add more stores.`,
    };
  }
  
  return { allowed: true };
}

// Record a store addition
export function recordStoreAdded(): void {
  const plan = getCurrentUserPlan();
  plan.usage.storesAdded += 1;
  safeWriteJSON("userPlan", plan);
}

// Get remaining searches for today
export function getRemainingSearches(): number {
  const plan = getCurrentUserPlan();
  return Math.max(0, plan.limits.searchesPerDay - plan.usage.searchesToday);
}

// Get remaining store slots
export function getRemainingStoreSlots(): number {
  const plan = getCurrentUserPlan();
  return Math.max(0, plan.limits.maxStoresUserCanAdd - plan.usage.storesAdded);
}

// Check if user has a specific feature
export function hasFeature(feature: string): boolean {
  const plan = getCurrentUserPlan();
  return plan.limits.features.includes(feature);
}

// Get plan display name
export function getPlanDisplayName(planType: PlanType): string {
  const names: Record<PlanType, string> = {
    starter: "Starter",
    pro: "Pro",
    business: "Business",
  };
  return names[planType];
}

// Get upgrade suggestions based on current usage
export function getUpgradeSuggestions(): string[] {
  const plan = getCurrentUserPlan();
  const suggestions: string[] = [];
  
  if (plan.usage.searchesToday >= plan.limits.searchesPerDay * 0.8) {
    suggestions.push("You're using most of your daily searches. Consider upgrading for more searches.");
  }
  
  if (plan.usage.storesAdded >= plan.limits.maxStoresUserCanAdd * 0.8) {
    suggestions.push("You're approaching your store limit. Upgrade to add more stores.");
  }
  
  return suggestions;
}
