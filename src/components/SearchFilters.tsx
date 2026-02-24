"use client";

import { useState } from "react";
import { Place } from "@/services/openstreet";

type FilterOptions = {
  hasWebsite: boolean | null;
  hasEmail: boolean | null;
  hasPhone: boolean | null;
  sortBy: "relevance" | "name" | "distance";
  maxResults: number;
};

type Props = {
  results: Place[];
  onFiltersChange: (filters: FilterOptions) => void;
  onClearFilters: () => void;
  hasResults: boolean;
};

export default function SearchFilters({ results, onFiltersChange, onClearFilters, hasResults }: Props) {
  const [filters, setFilters] = useState<FilterOptions>({
    hasWebsite: null,
    hasEmail: null,
    hasPhone: null,
    sortBy: "relevance",
    maxResults: 20,
  });

  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = <K extends keyof FilterOptions>(key: K, value: FilterOptions[K]) => {
    const newFilters = { ...filters, [key]: value } as FilterOptions;
    setFilters(newFilters);
    onFiltersChange(newFilters);
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
    onClearFilters();
  };

  const getContactStats = () => {
    const total = results.length;
    const withWebsite = results.filter(r => r.website).length;
    const withEmail = results.filter(r => r.email).length;
    const withPhone = results.filter(r => r.phone).length;
    
    return { total, withWebsite, withEmail, withPhone };
  };

  const stats = getContactStats();

  if (!hasResults) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">Filters</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 text-sm font-medium"
          >
            {isExpanded ? "Hide" : "Show"} Filters
          </button>
          <button
            onClick={handleClearFilters}
            className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 text-sm font-medium"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
          <div className="text-lg font-semibold">{stats.total}</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Total Stores</div>
        </div>
        <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded">
          <div className="text-lg font-semibold text-green-600 dark:text-green-400">{stats.withWebsite}</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">With Website</div>
        </div>
        <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
          <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">{stats.withEmail}</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">With Email</div>
        </div>
        <div className="text-center p-2 bg-purple-50 dark:bg-purple-900/20 rounded">
          <div className="text-lg font-semibold text-purple-600 dark:text-purple-400">{stats.withPhone}</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">With Phone</div>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          {/* Contact Information Filters */}
          <div>
            <h4 className="font-medium mb-2">Contact Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Website Filter */}
              <div>
                <p className="text-sm font-medium mb-2">Website</p>
                <div className="space-y-1">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="websiteFilter"
                      checked={filters.hasWebsite === null}
                      onChange={() => handleFilterChange("hasWebsite", null)}
                      className="border-gray-300"
                    />
                    <span className="text-sm">All</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="websiteFilter"
                      checked={filters.hasWebsite === true}
                      onChange={() => handleFilterChange("hasWebsite", true)}
                      className="border-gray-300"
                    />
                    <span className="text-sm">Has Website</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="websiteFilter"
                      checked={filters.hasWebsite === false}
                      onChange={() => handleFilterChange("hasWebsite", false)}
                      className="border-gray-300"
                    />
                    <span className="text-sm">No Website</span>
                  </label>
                </div>
              </div>

              {/* Email Filter */}
              <div>
                <p className="text-sm font-medium mb-2">Email</p>
                <div className="space-y-1">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="emailFilter"
                      checked={filters.hasEmail === null}
                      onChange={() => handleFilterChange("hasEmail", null)}
                      className="border-gray-300"
                    />
                    <span className="text-sm">All</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="emailFilter"
                      checked={filters.hasEmail === true}
                      onChange={() => handleFilterChange("hasEmail", true)}
                      className="border-gray-300"
                    />
                    <span className="text-sm">Has Email</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="emailFilter"
                      checked={filters.hasEmail === false}
                      onChange={() => handleFilterChange("hasEmail", false)}
                      className="border-gray-300"
                    />
                    <span className="text-sm">No Email</span>
                  </label>
                </div>
              </div>

              {/* Phone Filter */}
              <div>
                <p className="text-sm font-medium mb-2">Phone</p>
                <div className="space-y-1">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="phoneFilter"
                      checked={filters.hasPhone === null}
                      onChange={() => handleFilterChange("hasPhone", null)}
                      className="border-gray-300"
                    />
                    <span className="text-sm">All</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="phoneFilter"
                      checked={filters.hasPhone === true}
                      onChange={() => handleFilterChange("hasPhone", true)}
                      className="border-gray-300"
                    />
                    <span className="text-sm">Has Phone</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="phoneFilter"
                      checked={filters.hasPhone === false}
                      onChange={() => handleFilterChange("hasPhone", false)}
                      className="border-gray-300"
                    />
                    <span className="text-sm">No Phone</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Sort Options */}
          <div>
            <h4 className="font-medium mb-2">Sort By</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="sortBy"
                  value="relevance"
                  checked={filters.sortBy === "relevance"}
                  onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                  className="border-gray-300"
                />
                <span className="text-sm">Relevance</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="sortBy"
                  value="name"
                  checked={filters.sortBy === "name"}
                  onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                  className="border-gray-300"
                />
                <span className="text-sm">Name (A-Z)</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="sortBy"
                  value="distance"
                  checked={filters.sortBy === "distance"}
                  onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                  className="border-gray-300"
                />
                <span className="text-sm">Distance</span>
              </label>
            </div>
          </div>

          {/* Results Limit */}
          <div>
            <h4 className="font-medium mb-2">Show Results</h4>
            <select
              value={filters.maxResults}
              onChange={(e) => handleFilterChange("maxResults", parseInt(e.target.value))}
              className="w-full md:w-auto px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm"
            >
              <option value={10}>10 results</option>
              <option value={20}>20 results</option>
              <option value={50}>50 results</option>
              <option value={100}>100 results</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
