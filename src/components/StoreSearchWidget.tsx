"use client";

import { useState } from "react";
import Button from "@/components/Button";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorAlert from "@/components/ErrorAlert";

type SearchResult = {
  id: string;
  name: string;
  address?: string;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  lat: number;
  lon: number;
};

export default function StoreSearchWidget() {
  const [searchData, setSearchData] = useState({
    storeName: "",
    address: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const [searched, setSearched] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSearchData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResults(null);

    if (!searchData.storeName.trim()) {
      setError("Please enter a store name");
      return;
    }

    setIsLoading(true);
    setSearched(true);

    try {
      const params = new URLSearchParams({
        name: searchData.storeName.trim(),
        ...(searchData.address.trim() && { address: searchData.address.trim() }),
      });

      const response = await fetch(`/api/stores/search?${params}`);

      if (!response.ok) {
        throw new Error("Search failed");
      }

      const data = await response.json();
      setResults(data.results || []);

      if (data.results.length === 0) {
        setError("No stores found matching your search");
      }
    } catch (err) {
      console.error("Search error:", err);
      setError("Failed to search stores. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setSearchData({ storeName: "", address: "" });
    setResults(null);
    setError(null);
    setSearched(false);
  };

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-6 bg-white dark:bg-gray-800">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">Search Our Database</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Check if your store is already in our database or find specific stores
          </p>
        </div>

        <form onSubmit={handleSearch} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="storeName" className="text-sm font-medium">
              Store Name *
            </label>
            <input
              id="storeName"
              name="storeName"
              type="text"
              value={searchData.storeName}
              onChange={handleInputChange}
              placeholder="e.g., Apple Store, Local Electronics"
              className="w-full h-10 rounded-md border border-gray-300 dark:border-gray-600 px-3 text-sm bg-transparent"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="address" className="text-sm font-medium">
              Address (Optional)
            </label>
            <input
              id="address"
              name="address"
              type="text"
              value={searchData.address}
              onChange={handleInputChange}
              placeholder="e.g., 123 Main St, New York"
              className="w-full h-10 rounded-md border border-gray-300 dark:border-gray-600 px-3 text-sm bg-transparent"
            />
          </div>

          {error && <ErrorAlert message={error} />}

          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? "Searching..." : "Search"}
            </Button>
            {searched && (
              <Button
                type="button"
                onClick={handleClear}
                variant="secondary"
                className="flex-1"
              >
                Clear
              </Button>
            )}
          </div>
        </form>

        {isLoading && <LoadingSpinner />}

        {results && results.length > 0 && (
          <div className="space-y-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium">Found {results.length} store(s):</p>
            <div className="space-y-2">
              {results.map((store) => (
                <div
                  key={store.id}
                  className="rounded-md bg-green-50 dark:bg-green-900/20 p-3 border border-green-200 dark:border-green-800"
                >
                  <div className="space-y-1">
                    <h4 className="font-medium text-green-900 dark:text-green-200">
                      ✓ {store.name}
                    </h4>
                    {store.address && (
                      <p className="text-xs text-green-800 dark:text-green-300">
                        📍 {store.address}
                      </p>
                    )}
                    <div className="text-xs text-green-700 dark:text-green-400 space-y-0.5">
                      {store.phone && <p>📞 {store.phone}</p>}
                      {store.email && <p>✉️ {store.email}</p>}
                      {store.website && (
                        <p>
                          🌐{" "}
                          <a
                            href={store.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline hover:no-underline"
                          >
                            Visit website
                          </a>
                        </p>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      ID: {store.id}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {searched && results && results.length === 0 && !error && (
          <div className="rounded-md bg-yellow-50 dark:bg-yellow-900/20 p-3 border border-yellow-200 dark:border-yellow-800">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              Your store isn't in our database yet. Consider{" "}
              <a href="/Profile" className="font-medium underline hover:no-underline">
                submitting it
              </a>
              !
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
