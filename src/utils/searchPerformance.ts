// Performance optimization utilities for search operations

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
  accessCount: number;
  lastAccessed: number;
}

export interface SearchMetrics {
  totalSearches: number;
  cacheHits: number;
  cacheMisses: number;
  averageResponseTime: number;
  errorCount: number;
  popularQueries: Array<{ query: string; count: number }>;
  slowQueries: Array<{ query: string; avgTime: number }>;
}

export class SearchCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private maxSize: number;
  private defaultTTL: number;

  constructor(maxSize: number = 100, defaultTTL: number = 30 * 60 * 1000) { // 30 minutes default
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTL;
  }

  // Generate cache key from search parameters
  generateKey(params: any): string {
    return JSON.stringify(params, Object.keys(params).sort());
  }

  // Get item from cache
  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    // Update access statistics
    entry.accessCount++;
    entry.lastAccessed = Date.now();

    return entry.data;
  }

  // Set item in cache
  set(key: string, data: T, ttl?: number): void {
    // Evict least recently used items if cache is full
    if (this.cache.size >= this.maxSize) {
      this.evictLRU();
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
      accessCount: 0,
      lastAccessed: Date.now()
    });
  }

  // Evict least recently used items
  private evictLRU(): void {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  // Clear expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  // Get cache statistics
  getStats(): { size: number; hitRate: number; totalAccesses: number } {
    let totalAccesses = 0;
    let hits = 0;

    for (const entry of this.cache.values()) {
      totalAccesses += entry.accessCount;
      if (entry.accessCount > 0) hits += entry.accessCount;
    }

    return {
      size: this.cache.size,
      hitRate: totalAccesses > 0 ? hits / totalAccesses : 0,
      totalAccesses
    };
  }

  // Clear all cache entries
  clear(): void {
    this.cache.clear();
  }
}

export class SearchPerformanceMonitor {
  private metrics: SearchMetrics = {
    totalSearches: 0,
    cacheHits: 0,
    cacheMisses: 0,
    averageResponseTime: 0,
    errorCount: 0,
    popularQueries: [],
    slowQueries: []
  };

  private queryStats = new Map<string, { count: number; totalTime: number; errors: number }>();
  private responseTimes: number[] = [];
  private maxResponseTimeHistory = 1000;

  // Record a search operation
  recordSearch(params: {
    query: string;
    responseTime: number;
    wasCached: boolean;
    hadError: boolean;
    resultCount: number;
  }): void {
    this.metrics.totalSearches++;

    if (params.wasCached) {
      this.metrics.cacheHits++;
    } else {
      this.metrics.cacheMisses++;
    }

    if (params.hadError) {
      this.metrics.errorCount++;
    }

    // Update response time statistics
    this.responseTimes.push(params.responseTime);
    if (this.responseTimes.length > this.maxResponseTimeHistory) {
      this.responseTimes.shift();
    }

    this.metrics.averageResponseTime = this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length;

    // Update query-specific statistics
    const queryKey = params.query.toLowerCase().trim();
    const existing = this.queryStats.get(queryKey) || { count: 0, totalTime: 0, errors: 0 };
    existing.count++;
    existing.totalTime += params.responseTime;
    if (params.hadError) existing.errors++;

    this.queryStats.set(queryKey, existing);

    this.updatePopularQueries();
    this.updateSlowQueries();
  }

  // Update popular queries list
  private updatePopularQueries(): void {
    this.metrics.popularQueries = Array.from(this.queryStats.entries())
      .map(([query, stats]) => ({ query, count: stats.count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  // Update slow queries list
  private updateSlowQueries(): void {
    this.metrics.slowQueries = Array.from(this.queryStats.entries())
      .filter(([_, stats]) => stats.count >= 3) // Only include queries with at least 3 searches
      .map(([query, stats]) => ({ query, avgTime: stats.totalTime / stats.count }))
      .sort((a, b) => b.avgTime - a.avgTime)
      .slice(0, 10);
  }

  // Get current metrics
  getMetrics(): SearchMetrics {
    return { ...this.metrics };
  }

  // Get cache hit rate
  getCacheHitRate(): number {
    const total = this.metrics.cacheHits + this.metrics.cacheMisses;
    return total > 0 ? this.metrics.cacheHits / total : 0;
  }

  // Get error rate
  getErrorRate(): number {
    return this.metrics.totalSearches > 0 ? this.metrics.errorCount / this.metrics.totalSearches : 0;
  }

  // Get optimization suggestions
  getOptimizationSuggestions(): string[] {
    const suggestions: string[] = [];

    const hitRate = this.getCacheHitRate();
    if (hitRate < 0.3) {
      suggestions.push("Cache hit rate is low. Consider increasing cache TTL or implementing better cache warming strategies.");
    }

    const errorRate = this.getErrorRate();
    if (errorRate > 0.1) {
      suggestions.push(`Error rate is ${Math.round(errorRate * 100)}%. Investigate common error patterns and improve error handling.`);
    }

    if (this.metrics.averageResponseTime > 2000) {
      suggestions.push("Average response time is high. Consider implementing result pagination or optimizing database queries.");
    }

    const slowQueries = this.metrics.slowQueries.filter(q => q.avgTime > 3000);
    if (slowQueries.length > 0) {
      suggestions.push(`Some queries are slow. Consider optimizing: ${slowQueries.slice(0, 3).map(q => `"${q.query}"`).join(', ')}`);
    }

    if (this.metrics.totalSearches > 1000 && hitRate < 0.5) {
      suggestions.push("High search volume with low cache efficiency. Consider implementing a more sophisticated caching strategy.");
    }

    return suggestions;
  }

  // Reset metrics (useful for testing or periodic resets)
  reset(): void {
    this.metrics = {
      totalSearches: 0,
      cacheHits: 0,
      cacheMisses: 0,
      averageResponseTime: 0,
      errorCount: 0,
      popularQueries: [],
      slowQueries: []
    };
    this.queryStats.clear();
    this.responseTimes = [];
  }

  // Export metrics for external analysis
  exportMetrics(): any {
    return {
      ...this.metrics,
      cacheHitRate: this.getCacheHitRate(),
      errorRate: this.getErrorRate(),
      exportedAt: new Date().toISOString()
    };
  }
}

// Global instances
export const searchCache = new SearchCache<any>(200, 45 * 60 * 1000); // 45 minutes TTL
export const searchPerformanceMonitor = new SearchPerformanceMonitor();

// Periodic cache cleanup
setInterval(() => {
  searchCache.cleanup();
}, 10 * 60 * 1000); // Clean up every 10 minutes