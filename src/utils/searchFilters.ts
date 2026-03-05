import { Place, SearchResult } from "@/services/openstreet";

export type FilterOptions = {
  hasWebsite: boolean | null;
  hasEmail: boolean | null;
  hasPhone: boolean | null;
  sortBy: "relevance" | "name" | "distance" | "rating";
  maxResults: number;
  // Advanced filters
  maxDistance?: number; // in meters
  minRating?: number; // 1-5 scale
  maxRating?: number;
  priceRange?: "budget" | "moderate" | "expensive" | "luxury";
  hasWiFi?: boolean;
  hasParking?: boolean;
  hasDelivery?: boolean;
  isOpenNow?: boolean;
  category?: string;
  features?: string[]; // Additional features like "outdoor_seating", "wheelchair_accessible", etc.
};

export type PlaceWithMetadata = Place & {
  relevanceScore: number;
  distance?: number; // in meters
  rating?: number; // 1-5 scale
  priceLevel?: number; // 1-4 scale (1=budget, 4=luxury)
  features?: string[];
  isOpen?: boolean;
  openingHours?: string;
};

// Calculate distance between two coordinates using Haversine formula
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
}

// Check if a business is currently open (simplified implementation)
export function isBusinessOpen(openingHours?: string): boolean {
  if (!openingHours) return true; // Assume open if no hours specified

  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTime = currentHour * 60 + currentMinute;

  // Parse simple time format like "09:00-17:00"
  const timeRanges = openingHours.split(',').map(range => range.trim());

  for (const range of timeRanges) {
    const match = range.match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/);
    if (match) {
      const [, startHour, startMin, endHour, endMin] = match;
      const startTime = parseInt(startHour) * 60 + parseInt(startMin);
      const endTime = parseInt(endHour) * 60 + parseInt(endMin);

      if (currentTime >= startTime && currentTime <= endTime) {
        return true;
      }
    }
  }

  return false;
}

// Apply advanced filters to search results
export function applyFilters(
  results: SearchResult[],
  filters: FilterOptions,
  userLocation?: { lat: number; lon: number }
): SearchResult[] {
  let filtered = [...results];

  // Distance-based filtering (only for PlaceWithMetadata)
  if (filters.maxDistance !== undefined && userLocation) {
    filtered = filtered.filter(place => {
      const placeAsMetadata = place as any;
      if (!placeAsMetadata.distance) {
        // Calculate distance if not already calculated
        placeAsMetadata.distance = calculateDistance(
          userLocation.lat, userLocation.lon,
          place.lat, place.lon
        );
      }
      return placeAsMetadata.distance <= filters.maxDistance!;
    });
  }

  // Rating filters (only for PlaceWithMetadata)
  if (filters.minRating !== undefined) {
    filtered = filtered.filter(place => {
      const placeAsMetadata = place as any;
      return !placeAsMetadata.rating || placeAsMetadata.rating >= filters.minRating!;
    });
  }
  if (filters.maxRating !== undefined) {
    filtered = filtered.filter(place => {
      const placeAsMetadata = place as any;
      return !placeAsMetadata.rating || placeAsMetadata.rating <= filters.maxRating!;
    });
  }

  // Price range filtering (only for PlaceWithMetadata)
  if (filters.priceRange) {
    const priceLevelMap = {
      'budget': [1],
      'moderate': [1, 2],
      'expensive': [2, 3],
      'luxury': [3, 4]
    };
    const allowedLevels = priceLevelMap[filters.priceRange];
    filtered = filtered.filter(place => {
      const placeAsMetadata = place as any;
      return !placeAsMetadata.priceLevel || allowedLevels.includes(placeAsMetadata.priceLevel);
    });
  }

  // Feature filters (only for PlaceWithMetadata)
  if (filters.hasWiFi !== undefined) {
    filtered = filtered.filter(place => {
      const placeAsMetadata = place as any;
      return (placeAsMetadata.features?.includes('wifi') ?? false) === filters.hasWiFi;
    });
  }
  if (filters.hasParking !== undefined) {
    filtered = filtered.filter(place => {
      const placeAsMetadata = place as any;
      return (placeAsMetadata.features?.includes('parking') ?? false) === filters.hasParking;
    });
  }
  if (filters.hasDelivery !== undefined) {
    filtered = filtered.filter(place => {
      const placeAsMetadata = place as any;
      return (placeAsMetadata.features?.includes('delivery') ?? false) === filters.hasDelivery;
    });
  }

  // Open hours filtering (only for PlaceWithMetadata)
  if (filters.isOpenNow) {
    filtered = filtered.filter(place => {
      const placeAsMetadata = place as any;
      return placeAsMetadata.isOpen !== false;
    });
  }

  // Category filtering (only for PlaceWithMetadata)
  if (filters.category) {
    filtered = filtered.filter(place => {
      const placeAsMetadata = place as any;
      return !placeAsMetadata.category || placeAsMetadata.category?.toLowerCase().includes(filters.category!.toLowerCase());
    });
  }

  // Additional features filtering (only for PlaceWithMetadata)
  if (filters.features && filters.features.length > 0) {
    filtered = filtered.filter(place => {
      const placeAsMetadata = place as any;
      return filters.features!.every(feature =>
        placeAsMetadata.features?.includes(feature)
      );
    });
  }

  // Legacy contact filters
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

  // Enhanced sorting
  filtered.sort((a, b) => {
    switch (filters.sortBy) {
      case "name":
        return a.name.localeCompare(b.name);
      case "distance":
        const aMetadata = a as any;
        const bMetadata = b as any;
        const aDist = aMetadata.distance || Infinity;
        const bDist = bMetadata.distance || Infinity;
        return aDist - bDist;
      case "rating":
        const aRating = (a as any).rating || 0;
        const bRating = (b as any).rating || 0;
        return bRating - aRating;
      case "relevance":
      default:
        const aScore = a.relevanceScore || 0;
        const bScore = b.relevanceScore || 0;
        return bScore - aScore;
    }
  });

  // Apply max results limit
  return filtered.slice(0, filters.maxResults);
}

// Get available filter options based on current results
export function getAvailableFilters(results: PlaceWithMetadata[]): {
  categories: string[];
  features: string[];
  priceRanges: string[];
  hasRatings: boolean;
} {
  const categories = new Set<string>();
  const features = new Set<string>();
  const priceRanges = new Set<string>();
  let hasRatings = false;

  for (const result of results) {
    if (result.category) categories.add(result.category);
    if (result.features) {
      result.features.forEach(feature => features.add(feature));
    }
    if (result.priceLevel) {
      const priceMap: { [key: number]: string } = {
        1: 'budget',
        2: 'moderate',
        3: 'expensive',
        4: 'luxury'
      };
      priceRanges.add(priceMap[result.priceLevel]);
    }
    if (result.rating) hasRatings = true;
  }

  return {
    categories: Array.from(categories).sort(),
    features: Array.from(features).sort(),
    priceRanges: Array.from(priceRanges),
    hasRatings
  };
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
