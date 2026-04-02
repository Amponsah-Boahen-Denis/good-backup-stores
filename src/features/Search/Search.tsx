"use client";

import { useEffect, useState } from "react";
import SearchForm from "@/components/SearchForm";
import LayoutToggle from "@/components/LayoutToggle";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorAlert from "@/components/ErrorAlert";
import { detectBrowserLocation } from "@/services/geolocation";
import { findNearbyStores, toSearchResult, SearchResult, Place } from "@/services/openstreet";
import { makeCacheKey, getSnapshot, getStoresByIds, upsertStores, upsertSnapshot } from "@/services/searchCache";
import { usePreferences } from "@/hooks/usePreferences";
import { trackStoreAppearance, incrementSearchCount } from "@/services/businessAnalytics";
import extractProductName from "@/utils/extractProductName";
import getProductCategory from "@/utils/getProductCategory";
import sanitizeInput from "@/utils/sanitizeInput";
import { scoreRelevance, sortByRelevance } from "@/utils/relevance";
import ResultsList from "@/components/ResultsList";
import { addHistory } from "@/services/history";
import { canPerformSearch, recordSearch } from "@/services/userPlans";
import PlanLimitAlert from "@/components/PlanLimitAlert";
import SearchFilters from "@/components/SearchFilters";
import { applyFilters, FilterOptions } from "@/utils/searchFilters";

type SearchState = {
  product: string;
  country: string;
  location: string;
};

export default function Search() {
  const { prefs, setLayout } = usePreferences();
  const prefsLayout = prefs.layout;
  const [state, setState] = useState<SearchState>({ product: "", country: "", location: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [filteredResults, setFilteredResults] = useState<SearchResult[]>([]);
  const [planLimitError, setPlanLimitError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({
    hasWebsite: null,
    hasEmail: null,
    hasPhone: null,
    sortBy: "relevance",
    maxResults: 20,
  });

  

  useEffect(() => {
    detectBrowserLocation().catch(() => {});
  }, []);

  const handleLayoutChange = async (layout: "grid" | "list") => {
    await setLayout(layout);
  };

  const handleFiltersChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
    const filtered = applyFilters(results, newFilters);
    setFilteredResults(filtered);
  };

  const handleClearFilters = () => {
    const defaultFilters: FilterOptions = {
      hasWebsite: null,
      hasEmail: null,
      hasPhone: null,
      sortBy: "relevance",
      maxResults: 20,
    };
    setFilters(defaultFilters);
    setFilteredResults(results);
  };

  const handleSubmit = async (data: { product: string; country: string; location: string; categories: string[] }) => {
    setError(null);
    setPlanLimitError(null);
    
    // Check plan limits before proceeding
    const searchCheck = canPerformSearch();
    if (!searchCheck.allowed) {
      setPlanLimitError(searchCheck.reason || "Search limit reached");
      return;
    }
    
    setIsLoading(true);
    try {
      const rawProduct = extractProductName(sanitizeInput(data.product));
      const country = sanitizeInput(data.country);
      const location = sanitizeInput(data.location);
      const selectedCategories = data.categories || [];

      if (!rawProduct) throw new Error("Please enter a product name.");
      if (!country && !location) throw new Error("Enter a country or a city/address.");

      setState({ product: rawProduct, country, location });

      const category = getProductCategory(rawProduct);
      const requestedCategories = selectedCategories.length > 0 ? selectedCategories : category ? [category.category] : [];

      let coords: { lat: number; lon: number } | null = null;
      if (location) {
        const geoRes = await (await import("@/services/openstreet")).geocodeLocation(location);
        if (geoRes.length > 0) {
          coords = { lat: parseFloat(geoRes[0].lat), lon: parseFloat(geoRes[0].lon) };
        }
      }

      // Plan-based target results (Starter default 20; Pro 200; Business 500).
      // For now infer from filters.maxResults as a proxy; backend will use plan limits.
      const targetResults = Math.max(filters.maxResults, 20);

      // DB-first cache via localStorage snapshots
      const cacheKey = makeCacheKey(rawProduct, requestedCategories.length > 0 ? requestedCategories : null, country || undefined, coords?.lat, coords?.lon, 5000);
      const snap = getSnapshot(cacheKey);

      let stores: Place[] | null = null;
      if (snap && snap.storeIds?.length && snap.storeIds.length >= targetResults) {
        const canonical = getStoresByIds(snap.storeIds);
        stores = canonical.map<Place>((s) => ({
          id: s.id,
          name: s.name,
          lat: s.lat,
          lon: s.lon,
          address: s.address,
          website: s.contact?.website ?? null,
          email: s.contact?.email ?? null,
          phone: s.contact?.phone ?? null,
          tags: s.tags,
          category: s.category,
        }));
      }

      if (!stores) {
        if (!coords) {
          if (country) {
            const geoCountry = await (await import("@/services/openstreet")).geocodeLocation(country);
            if (geoCountry.length > 0) {
              coords = { lat: parseFloat(geoCountry[0].lat), lon: parseFloat(geoCountry[0].lon) };
            }
          }
        }
        if (!coords) throw new Error("Failed to resolve location.");
        stores = await findNearbyStores(coords.lat, coords.lon, rawProduct, 5000, requestedCategories.length > 0 ? requestedCategories : null);

        // Write-back cache: upsert canonical stores and snapshot
        const ids = upsertStores(stores, requestedCategories.length > 0 ? requestedCategories : category?.category || null);
        upsertSnapshot({
          key: cacheKey,
          query: { product: rawProduct, category: requestedCategories.length > 0 ? requestedCategories : category ? [category.category] : null, country, lat: coords.lat, lon: coords.lon, radiusMeters: 5000 },
          storeIds: ids,
          totalCount: ids.length,
          source: snap ? "mixed" : "provider",
          createdAt: Date.now(),
        });
      }

      const categoryName = requestedCategories.length > 0 ? requestedCategories.join(", ") : category?.category ?? null;
      const scored = (stores || []).map((s) => ({
        ...s,
        category: categoryName,
        relevanceScore: scoreRelevance(rawProduct, { name: s.name, tags: s.tags, category: categoryName }),
      }));
      const ordered = sortByRelevance(scored);
      
      // Convert to simplified SearchResult format
      const simplifiedResults = ordered.map(toSearchResult);
      setResults(simplifiedResults);
      
      // Track store appearances in analytics
      ordered.forEach((store) => {
        trackStoreAppearance(store.id, store.name);
      });
      
      // Increment total search count
      incrementSearchCount();
      
      // Apply initial filters
      const filtered = applyFilters(simplifiedResults, filters);
      setFilteredResults(filtered);

      // Record successful search
      recordSearch();

      if (ordered.length === 0) {
        setError("Failed to fetch stores");
      }
      // Log history when we have a valid response (even if empty, skip)
      if (ordered.length > 0) {
        await addHistory({ product: rawProduct, country, location, resultsCount: ordered.length });
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e || "Unknown error");
      if (/429|Too Many/i.test(msg)) setError("Too many requests");
      else setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Search</h1>
        <LayoutToggle value={prefsLayout} onChange={handleLayoutChange} />
      </div>
      <SearchForm
        defaultCountry={state.country}
        defaultLocation={state.location}
        onSubmit={handleSubmit}
      />
      {planLimitError && (
        <PlanLimitAlert
          type="search"
          message={planLimitError}
          currentPlan="Starter"
          suggestedPlan="Pro"
          onDismiss={() => setPlanLimitError(null)}
        />
      )}
      {isLoading && <LoadingSpinner />}
      {error && <ErrorAlert message={error} />}
      {!isLoading && !error && results.length > 0 && (
        <>
          <SearchFilters
            results={results}
            onFiltersChange={handleFiltersChange}
            onClearFilters={handleClearFilters}
            hasResults={results.length > 0}
          />
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing {filteredResults.length} of {results.length} stores
              {filteredResults.length !== results.length && (
                <span className="ml-1 text-blue-600 dark:text-blue-400">(filtered)</span>
              )}
            </p>
          </div>
          <ResultsList items={filteredResults} layout={prefsLayout} />
        </>
      )}
    </section>
  );
}



