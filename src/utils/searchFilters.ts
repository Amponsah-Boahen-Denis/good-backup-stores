import { Place } from "@/services/openstreet";

export type FilterOptions = {
  hasWebsite: boolean | null;
  hasEmail: boolean | null;
  hasPhone: boolean | null;
  sortBy: "relevance" | "name" | "distance";
  maxResults: number;
};

export function applyFilters(results: (Place & { relevanceScore: number })[], filters: FilterOptions): (Place & { relevanceScore: number })[] {
  let filtered = [...results];

  // Apply contact information filters
  if (filters.hasWebsite !== null) {
    filtered = filtered.filter(place => 
      filters.hasWebsite ? !!place.website : !place.website
    );
  }

  if (filters.hasEmail !== null) {
    filtered = filtered.filter(place => 
      filters.hasEmail ? !!place.email : !place.email
    );
  }

  if (filters.hasPhone !== null) {
    filtered = filtered.filter(place => 
      filters.hasPhone ? !!place.phone : !place.phone
    );
  }

  // Apply sorting
  filtered.sort((a, b) => {
    switch (filters.sortBy) {
      case "name":
        return a.name.localeCompare(b.name);
      case "distance":
        // Note: We don't have distance data in Place type yet
        // For now, we'll use relevance score as a proxy
        return a.relevanceScore - b.relevanceScore;
      case "relevance":
      default:
        return b.relevanceScore - a.relevanceScore;
    }
  });

  // Apply max results limit
  return filtered.slice(0, filters.maxResults);
}

export function getFilterStats(results: (Place & { relevanceScore: number })[]) {
  const total = results.length;
  const withWebsite = results.filter(r => r.website).length;
  const withEmail = results.filter(r => r.email).length;
  const withPhone = results.filter(r => r.phone).length;
  
  return {
    total,
    withWebsite,
    withEmail,
    withPhone,
    withoutWebsite: total - withWebsite,
    withoutEmail: total - withEmail,
    withoutPhone: total - withPhone,
  };
}

export function hasActiveFilters(filters: FilterOptions): boolean {
  return (
    filters.hasWebsite !== null ||
    filters.hasEmail !== null ||
    filters.hasPhone !== null ||
    filters.sortBy !== "relevance" ||
    filters.maxResults !== 20
  );
}

export function getFilterDescription(filters: FilterOptions): string {
  const parts: string[] = [];
  
  if (filters.hasWebsite === true) parts.push("with website");
  if (filters.hasWebsite === false) parts.push("without website");
  if (filters.hasEmail === true) parts.push("with email");
  if (filters.hasEmail === false) parts.push("without email");
  if (filters.hasPhone === true) parts.push("with phone");
  if (filters.hasPhone === false) parts.push("without phone");
  
  if (filters.sortBy !== "relevance") {
    parts.push(`sorted by ${filters.sortBy}`);
  }
  
  return parts.length > 0 ? parts.join(", ") : "no filters";
}
