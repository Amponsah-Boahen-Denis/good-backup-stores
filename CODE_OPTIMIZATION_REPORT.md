# Code Optimization & Quality Report

**Date:** April 4, 2026  
**Project:** Store Finder App (Next.js + React)

---

## Executive Summary

Your codebase is **well-structured and functional** with good TypeScript usage and modern patterns. Minor optimizations in error handling, memory management, and API robustness would improve production readiness.

**Overall Score: 7.5/10** ✅

---

## Critical Issues

### 1. **Error Handling - Missing Try-Catch Blocks**

**File:** `src/features/Search/Search.tsx`
```typescript
// ❌ Missing error handling for async operations
const category = getProductCategory(rawProduct);
// Could fail if product parsing logic has issues
```

**Recommendation:**
```typescript
// ✅ Add proper error boundaries
try {
  const category = getProductCategory(rawProduct);
  // ...
} catch (err) {
  setError("Failed to categorize product. Please try again.");
  return;
}
```

---

### 2. **API Rate Limiting Not Implemented**

**File:** `src/services/openstreet.ts`

**Issue:** Direct calls to OpenStreetMap/Nominatim without rate limiting
- Risk of IP blocking from API providers
- No circuit breaker pattern
- No retry logic

**Recommendation:**
```typescript
// Add exponential backoff and rate limiting
const rateLimiter = new RateLimiter({
  maxRequests: 10,
  windowMs: 1000 // 10 requests per second
});

export async function fetchWithRateLimit(url: string) {
  await rateLimiter.acquire();
  return fetch(url);
}
```

---

### 3. **Memory Leaks in Event Listeners**

**File:** `src/services/searchPerformance.ts`
```typescript
// ⚠️ setInterval in module scope without cleanup
setInterval(() => {
  searchCache.cleanup();
}, 10 * 60 * 1000);
```

**Risk:** This interval runs forever, even after component unmount

**Recommendation:**
```typescript
// Move to component lifecycle or add cleanup logic
export const setupCacheCleanup = () => {
  const interval = setInterval(() => searchCache.cleanup(), 10 * 60 * 1000);
  return () => clearInterval(interval); // Return cleanup function
};
```

---

### 4. **Type Safety Issues**

**Files:** Multiple components
```typescript
// ❌ Using 'any' types
export async function assessDataQuality(business: any): BusinessDataQuality
function calculateAccuracyScore(business: any): number
```

**Recommendation:**
```typescript
// ✅ Define proper interfaces
interface Business {
  name?: string;
  address?: string;
  phone?: string;
  website?: string;
  email?: string;
  [key: string]: any;
}

export async function assessDataQuality(business: Business): BusinessDataQuality
```

---

## Performance Issues

### 5. **Unoptimized Search Results Rendering**

**File:** `src/components/ResultsList.tsx`

**Issue:** Same JSX rendered twice with minimal differences (grid vs list)
```typescript
// ❌ Code duplication - 60+ lines of nearly identical code
if (layout === "grid") {
  return (<div className="grid ...">...</div>);
}
return (<ul className="divide-y ...">...</ul>);
```

**Recommendation:**
```typescript
// ✅ Extract common card component
const StoreCard = ({ store }: { store: SearchResult }) => (
  <article className="rounded-md border ...">
    {/* Common content */}
  </article>
);

// Reuse in both layouts
const Layout = layout === "grid" ? "grid grid-cols-3" : "divide-y";
return <div className={Layout}>{items.map((p) => <StoreCard key={p.id} store={p} />)}</div>;
```

---

### 6. **Missing Pagination**

**Issue:** Loading all results at once
```typescript
// ❌ No pagination
.slice(0, maxResults) // Only limits to 20, but still processes all
```

**Recommendation:** Implement cursor-based pagination for large datasets

---

### 7. **Unoptimized Distance Calculations**

**File:** `src/services/openstreet.ts`
```typescript
// ❌ Calculating distance for every result, even if we limit to 20
places.map((el) => {
  // ... 
  distance: calculateDistance(...), // Run haversine for each
})
```

**Better Approach:**
```typescript
// ✅ Let Overpass API do geo filtering instead
const target = filters.map((f) => 
  `${f}(around:${radiusMeters},${lat},${lon});`
).join("\n");
// Overpass already returns nearest results
```

---

## Code Quality Issues

### 8. **Missing Input Validation**

**File:** `src/components/SearchForm.tsx`
```typescript
// ⚠️ Limited validation
if (!product) throw new Error("Please enter a product name.");
// But no check for:
// - Minimum length
// - Special characters/injection
// - Extremely long inputs
```

**Recommendation:**
```typescript
const validateInput = (input: string, minLength: number = 2, maxLength: number = 100) => {
  if (input.length < minLength) throw new Error(`Minimum ${minLength} characters`);
  if (input.length > maxLength) throw new Error(`Maximum ${maxLength} characters`);
  if (!/^[a-zA-Z0-9\s\-&\.']*$/.test(input)) throw new Error("Invalid characters");
};
```

---

### 9. **Unused Dependencies**

**File:** `package.json`
```json
"dependencies": {
  "sanitize-html": "^2.17.0", // Used but check if necessary
  "mongodb": "^5.8.0" // Included but may not be fully utilized
}
```

**Recommendation:** Audit actual usage. Consider `html-entities` or built-in sanitization if sanitize-html isn't heavily used.

---

### 10. **CSS Tailwind Optimization**

**Issue:** Potential unused Tailwind classes not being purged

**Recommendation:**
```javascript
// tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  // ... rest of config
}
```

---

## Database/Async Issues

### 11. **Missing Request Timeout Handling**

**File:** `src/services/openstreet.ts`
```typescript
// ❌ No timeout
const res = await fetch(url.toString(), {
  headers: { "Accept": "application/json" },
  // Missing: timeout
});
```

**Recommendation:**
```typescript
// ✅ Add timeout
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 10000);

try {
  const res = await fetch(url.toString(), {
    signal: controller.signal,
    // ...
  });
} finally {
  clearTimeout(timeoutId);
}
```

---

### 12. **No Data Validation on API Responses**

**File:** `src/app/api/stores/search/route.ts`
```typescript
// ⚠️ Assumes data structure without validation
const stores = await listStores();
const results = stores.filter((store) => { ... });
```

**Recommendation:** Use Zod or similar for runtime validation:
```typescript
import { z } from 'zod';

const StoreSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  address: z.string().optional(),
  phone: z.string().nullable(),
  // ...
});

const stores = await listStores();
const validated = z.array(StoreSchema).parse(stores);
```

---

## Best Practices

### 13. **ESLint Configuration is Minimal**

**File:** `eslint.config.mjs`
```javascript
// ❌ Only extends Next.js defaults
// Missing:
// - performance rules
// - accessibility (a11y) rules
// - best practices
```

**Recommendation:**
```javascript
// Add more comprehensive rules
const eslintConfig = [
  ...compat.extends(
    "next/core-web-vitals",
    "next/typescript",
    "plugin:security/recommended"
  ),
  // Custom rules
];
```

---

### 14. **Missing Environment Variable Validation**

**File:** `src/app/layout.tsx` and others

**Issue:** No checking if required env vars exist at runtime

**Recommendation:**
```typescript
// src/config/env.ts
export const REQUIRED_ENV_VARS = ['NEXT_PUBLIC_API_BASE'] as const;

export const validateEnv = () => {
  for (const envVar of REQUIRED_ENV_VARS) {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
  }
};

// Call in layout.tsx
validateEnv();
```

---

### 15. **Generic Cache Implementation Could Be Optimized**

**File:** `src/utils/searchPerformance.ts`
```typescript
// Current: O(n) iteration for LRU eviction
private evictLRU(): void {
  // Finds minimum by iterating all entries
  let min = Infinity;
  let minKey = '';
  for (const [key, entry] of this.cache.entries()) {
    if (entry.lastAccessed < min) {
      min = entry.lastAccessed;
      minKey = key;
    }
  }
  if (minKey) this.cache.delete(minKey);
}
```

**Better Approach:** Use a priority queue or sorted map for O(log n) operations

---

## Recommendations Summary

### 🔴 **High Priority (Do First)**
1. Add rate limiting to OpenStreet API calls
2. Fix memory leak in `searchPerformance.ts` interval
3. Replace `any` types with proper interfaces
4. Add request timeout handling

### 🟡 **Medium Priority (Do Soon)**
5. Extract code duplication in `ResultsList.tsx`
6. Add proper input validation
7. Implement error boundaries for async operations
8. Add API response validation

### 🟢 **Low Priority (Nice to Have)**
9. Enhance ESLint configuration
10. Add environment variable validation
11. Optimize cache data structure
12. Add pagination for large datasets

---

## Performance Checklist

- [ ] Add request timeouts (5-10s max)
- [ ] Implement rate limiting per IP
- [ ] Add circuit breaker for API failures
- [ ] Compress images in search results
- [ ] Lazy load ResultsList components
- [ ] Add loading skeletons
- [ ] Implement virtual scrolling for large lists
- [ ] Add service worker for offline caching

---

## Testing Recommendations

```bash
# Add test suite
npm install -D vitest @testing-library/react @testing-library/jest-dom

# Add coverage monitoring
npm install -D @vitest/coverage-v8
```

---

## Deployment Checklist

- [ ] Enable Vercel Edge Functions for API routes
- [ ] Set up environment variables on hosting
- [ ] Configure CORS for API calls
- [ ] Add monitoring/error tracking (Sentry)
- [ ] Set up analytics (Google Analytics 4)
- [ ] Test with real data at scale
- [ ] Load testing for peak capacity

---

**Overall Assessment:** Your code is clean and well-organized. Focus on error handling and rate limiting for production stability. The current setup is suitable for MVP, but add the high-priority items before scaling.

