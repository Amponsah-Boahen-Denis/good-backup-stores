// Lightweight wrappers for OpenStreetMap Nominatim (geocoding) and Overpass (places)
// NOTE: For production, add rate limiting and proper user-agent headers via proxy/server.

export type GeocodeResult = {
  display_name: string;
  lat: string;
  lon: string;
  address?: Record<string, string>;
};

export async function geocodeLocation(query: string): Promise<GeocodeResult[]> {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", query);
  url.searchParams.set("format", "json");
  url.searchParams.set("addressdetails", "1");
  const res = await fetch(url.toString(), {
    headers: { "Accept": "application/json" },
  });
  if (!res.ok) throw new Error(`Geocoding failed: ${res.status}`);
  return (await res.json()) as GeocodeResult[];
}

export async function reverseGeocode(lat: number, lon: number): Promise<GeocodeResult | null> {
  const url = new URL("https://nominatim.openstreetmap.org/reverse");
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lon", String(lon));
  url.searchParams.set("format", "json");
  url.searchParams.set("addressdetails", "1");
  const res = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) return null;
  const json = await res.json();
  return json as GeocodeResult;
}

export type Place = {
  id: string;
  name: string;
  lat: number;
  lon: number;
  address?: string;
  website?: string | null;
  email?: string | null;
  phone?: string | null;
  tags?: string[];
  category?: string | null;
};

// Simplified result for frontend display (only essential data)
export type SearchResult = {
  id: string;
  name: string;
  address?: string; // Made optional for consistency
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  logo?: string | null;
  lat: number;
  lon: number;
  relevanceScore?: number; // Added for search filtering/sorting
};

export type CategoryInfo = { category: string; googleTypes: string[] } | null;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function categoryToOverpassFilters(categoryInfo: CategoryInfo): string[] {
  if (!categoryInfo) return [];
  const cat = categoryInfo.category.toLowerCase();

  // Expanded category mapping to cover all store and business categories
  const map: Record<string, string[]> = {
    supermarket: [
      'nwr["shop"="supermarket"]',
      'nwr["shop"="convenience"]',
      'nwr["shop"="grocery"]',
      'nwr["amenity"="marketplace"]',
    ],
    electronics: [
      'nwr["shop"="electronics"]',
      'nwr["shop"="computer"]',
      'nwr["shop"="mobile_phone"]',
      'nwr["shop"="hifi"]',
    ],
    clothing: [
      'nwr["shop"="clothes"]',
      'nwr["shop"="shoes"]',
      'nwr["shop"="fashion"]',
      'nwr["shop"="boutique"]',
    ],
    pharmacy: [
      'nwr["amenity"="pharmacy"]',
      'nwr["shop"="chemist"]',
    ],
    beauty: [
      'nwr["shop"="beauty"]',
      'nwr["shop"="cosmetics"]',
      'nwr["shop"="perfumery"]',
      'nwr["shop"="hairdresser"]',
      'nwr["shop"="nails"]',
    ],
    automotive: [
      'nwr["shop"="car"]',
      'nwr["shop"="car_parts"]',
      'nwr["shop"="tyres"]',
      'nwr["amenity"="car_repair"]',
      'nwr["amenity"="car_wash"]',
    ],
    sports: [
      'nwr["shop"="sports"]',
      'nwr["shop"="bicycle"]',
      'nwr["shop"="outdoor"]',
    ],
    household: [
      'nwr["shop"="houseware"]',
      'nwr["shop"="kitchen"]',
      'nwr["shop"="bathroom_furnishing"]',
    ],
    pets: [
      'nwr["shop"="pet"]',
      'nwr["shop"="pet_grooming"]',
    ],
    books: [
      'nwr["shop"="books"]',
      'nwr["shop"="stationery"]',
      'nwr["amenity"="library"]',
    ],
    furniture: [
      'nwr["shop"="furniture"]',
      'nwr["shop"="interior_decoration"]',
    ],
    toys: [
      'nwr["shop"="toys"]',
      'nwr["shop"="games"]',
    ],
    hardware: [
      'nwr["shop"="hardware"]',
      'nwr["shop"="doityourself"]',
      'nwr["shop"="tool_hire"]',
    ],
    baby: [
      'nwr["shop"="baby_goods"]',
      'nwr["shop"="children"]',
    ],
    jewelry: [
      'nwr["shop"="jewelry"]',
      'nwr["shop"="watch"]',
    ],
    gardening: [
      'nwr["shop"="garden_centre"]',
      'nwr["shop"="florist"]',
      'nwr["shop"="garden"]',
    ],
    // Food & Dining
    restaurants: [
      'nwr["amenity"="restaurant"]',
      'nwr["amenity"="cafe"]',
      'nwr["amenity"="fast_food"]',
    ],
    food: [
      'nwr["shop"="bakery"]',
      'nwr["shop"="butcher"]',
      'nwr["shop"="confectionery"]',
      'nwr["shop"="deli"]',
      'nwr["shop"="ice_cream"]',
    ],
    bakeries: [
      'nwr["shop"="bakery"]',
      'nwr["shop"="pastry"]',
    ],
    // Professional Services
    software: [
      'nwr["office"="it"]',
      'nwr["office"="software"]',
      'nwr["office"="company"]',
      'nwr["office"="yes"]',
    ],
    consulting: [
      'nwr["office"="consulting"]',
      'nwr["office"="accountant"]',
      'nwr["office"="lawyer"]',
      'nwr["office"="architect"]',
    ],
    legal: [
      'nwr["office"="lawyer"]',
      'nwr["amenity"="courthouse"]',
    ],
    accounting: [
      'nwr["office"="accountant"]',
      'nwr["office"="tax_advisor"]',
    ],
    real_estate: [
      'nwr["office"="estate_agent"]',
      'nwr["office"="property_management"]',
    ],
    insurance: [
      'nwr["office"="insurance"]',
    ],
    // Healthcare & Wellness
    hospitals: [
      'nwr["amenity"="hospital"]',
      'nwr["amenity"="clinic"]',
    ],
    dentists: [
      'nwr["amenity"="dentist"]',
    ],
    veterinary: [
      'nwr["amenity"="veterinary"]',
    ],
    fitness: [
      'nwr["amenity"="gym"]',
      'nwr["leisure"="fitness_centre"]',
    ],
    spas: [
      'nwr["shop"="beauty"]',
      'nwr["leisure"="spa"]',
    ],
    // Education
    schools: [
      'nwr["amenity"="school"]',
      'nwr["amenity"="university"]',
      'nwr["amenity"="college"]',
    ],
    libraries: [
      'nwr["amenity"="library"]',
    ],
    training: [
      'nwr["amenity"="school"]',
      'nwr["office"="educational_institution"]',
    ],
    // Financial Services
    banks: [
      'nwr["amenity"="bank"]',
      'nwr["amenity"="atm"]',
    ],
    financial: [
      'nwr["office"="financial"]',
      'nwr["office"="accountant"]',
    ],
    // Entertainment & Leisure
    entertainment: [
      'nwr["amenity"="cinema"]',
      'nwr["amenity"="theatre"]',
      'nwr["shop"="music"]',
    ],
    hotels: [
      'nwr["tourism"="hotel"]',
      'nwr["tourism"="motel"]',
    ],
    tourism: [
      'nwr["tourism"="information"]',
      'nwr["tourism"="attraction"]',
    ],
    parks: [
      'nwr["leisure"="park"]',
      'nwr["leisure"="garden"]',
    ],
    // Transportation
    gas_stations: [
      'nwr["amenity"="fuel"]',
    ],
    parking: [
      'nwr["amenity"="parking"]',
    ],
    transport: [
      'nwr["amenity"="bus_station"]',
      'nwr["amenity"="taxi"]',
    ],
    // Other Services
    repair: [
      'nwr["shop"="repair"]',
      'nwr["craft"="shoemaker"]',
      'nwr["craft"="tailor"]',
    ],
    cleaning: [
      'nwr["shop"="dry_cleaning"]',
      'nwr["shop"="laundry"]',
    ],
    construction: [
      'nwr["office"="construction_company"]',
      'nwr["craft"="builder"]',
    ],
    manufacturing: [
      'nwr["craft"="yes"]',
      'nwr["industrial"="yes"]',
    ],
  };

  const base = map[cat] || [];
  const fromGoogle: string[] = [];
  // Deduplicate
  const set = new Set<string>([...base, ...fromGoogle]);
  return Array.from(set);
}

// Calculate distance between two coordinates using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Distance in meters
}

// Very basic Overpass query with optional category filters - limited to closest 20 stores
// TEMPORARY GOOGLE PLACES TEST MODE
/* eslint-disable @typescript-eslint/no-unused-vars */
export async function findNearbyStores(
  lat: number,
  lon: number,
  _productQuery: string,
  _radiusMeters = 5000,
  _categoryInfo: CategoryInfo | string[] | null = null,
  maxResults = 20,
): Promise<Place[]> {
  /* eslint-enable @typescript-eslint/no-unused-vars */
  // TEMPORARY: Replace OpenStreetMap Overpass search with Google Places API test endpoint.
  // The original Overpass query is commented out below for reference.
  /*
  const overpass = "https://overpass-api.de/api/interpreter";
  const requestedCategories = Array.isArray(categoryInfo)
    ? categoryInfo
    : categoryInfo
      ? [categoryInfo]
      : [];
  const filters = requestedCategories
    .flatMap((item) =>
      categoryToOverpassFilters(
        typeof item === "string"
          ? { category: item, googleTypes: [] }
          : item
      )
    );
  const target = filters.length
    ? filters.map((f) => `${f}(around:${radiusMeters},${lat},${lon});`).join("\n    ")
    : `nwr["shop"](around:${radiusMeters},${lat},${lon});
    nwr["amenity"~"restaurant|cafe|bank|pharmacy|hospital|school|fuel|parking|cinema|theatre|gym|dentist|veterinary"](around:${radiusMeters},${lat},${lon});
    nwr["office"](around:${radiusMeters},${lat},${lon});
    nwr["craft"](around:${radiusMeters},${lat},${lon});
    nwr["tourism"~"hotel|motel|information|attraction"](around:${radiusMeters},${lat},${lon});
    nwr["leisure"~"park|garden|spa|fitness_centre"](around:${radiusMeters},${lat},${lon});
    nwr["industrial"](around:${radiusMeters},${lat},${lon});`;

  const query = `[
    out:json
  ];
  (
    ${target}
  );
  out center;`;

  const res = await fetch(overpass, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" },
    body: new URLSearchParams({ data: query }).toString(),
  });
  if (!res.ok) throw new Error(`Places failed: ${res.status}`);
  const data = await res.json();
  const elements = Array.isArray(data?.elements) ? data.elements : [];
  */

  type GooglePlaceAddressComponent = {
    shortText?: string;
    longText?: string;
    text?: string;
  };

  type GooglePlaceDetails = {
    name?: string;
    addressComponents?: GooglePlaceAddressComponent[];
  };

  const googlePlacesTestUrl =
    "https://places.googleapis.com/v1/places/GyuEmsRBfy61i59si0?fields=addressComponents&key=deni11";

  const res = await fetch(googlePlacesTestUrl, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`Google Places request failed: ${res.status}`);
  const placeData = (await res.json()) as GooglePlaceDetails;

  const addressParts = Array.isArray(placeData.addressComponents)
    ? placeData.addressComponents.map((component) => {
        return (
          component.shortText || component.longText || component.text || ""
        );
      })
    : [];

  const address = addressParts.filter(Boolean).join(", ") || undefined;
  const elements = [
    {
      id: placeData.name || "google-place-test",
      tags: {
        name: placeData.name || "Google Places Test",
        "addr:full": address,
      },
      lat: 0,
      lon: 0,
    },
  ];
  
  // Overpass element typings
  type OverpassTags = Record<string, string | undefined>;
  type OverpassElement = {
    id: number | string;
    lat?: number;
    lon?: number;
    center?: { lat?: number; lon?: number };
    tags?: OverpassTags;
  };

  // Map elements to places and calculate distances
  const places = (elements as OverpassElement[]).map((el) => {
    const placeLat = el.lat ?? el.center?.lat ?? 0;
    const placeLon = el.lon ?? el.center?.lon ?? 0;
    
    return {
      id: String(el.id),
      name: el.tags?.name || "Unnamed",
      lat: placeLat,
      lon: placeLon,
      distance: calculateDistance(lat, lon, placeLat, placeLon),
      address: (() => {
        const t: OverpassTags = el.tags || {};
        const full = t["addr:full"];
        if (full) return full as string;
        
        // Try to build address from available parts
        const parts = [
          t["addr:housename"],
          t["addr:housenumber"],
          t["addr:street"],
          t["addr:suburb"],
          t["addr:city"] || t["addr:town"] || t["addr:village"],
          t["addr:state"],
          t["addr:postcode"],
          t["addr:country"],
        ].filter(Boolean);
        
        if (parts.length > 0) {
          return parts.join(", ");
        }
        
        // Fallback: try to use display_name or name with location context
        const displayName = t["display_name"];
        if (displayName && typeof displayName === "string") {
          // Extract address-like part from display_name
          const nameParts = displayName.split(',');
          if (nameParts.length > 1) {
            // Remove the store name (usually first part) and return the rest
            return nameParts.slice(1).join(',').trim();
          }
        }
        
        // Last resort: use name if it looks like an address
        const name = t["name"];
        if (name && typeof name === 'string' && name.includes(',')) {
          return name;
        }
        
        return undefined;
      })(),
      website: (el.tags?.["contact:website"] || el.tags?.website || el.tags?.url) ?? null,
      email: (el.tags?.["contact:email"] || el.tags?.email) ?? null,
      phone: (el.tags?.["contact:phone"] || el.tags?.phone) ?? null,
      tags: Object.keys(el.tags || {}),
    };
  });

  // Sort by distance and limit to maxResults
  return places
    .sort((a, b) => a.distance - b.distance)
    .slice(0, maxResults)
    .map(({ ...place }) => place); // Remove distance from final result
}

// Convert Place to SearchResult (only essential data for display)
export function toSearchResult(place: Place & { relevanceScore?: number }): SearchResult {
  return {
    id: place.id,
    name: place.name,
    address: place.address,
    phone: place.phone || null,
    email: place.email || null,
    website: place.website || null,
    lat: place.lat,
    lon: place.lon,
    relevanceScore: place.relevanceScore,
  };
}


