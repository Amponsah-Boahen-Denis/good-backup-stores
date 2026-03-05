// Data quality improvement utilities for business listings

export interface BusinessDataQuality {
  completeness: number; // 0-1 score
  accuracy: number; // 0-1 score
  freshness: number; // 0-1 score
  issues: string[];
  suggestions: string[];
}

export interface EnrichedBusinessData {
  id: string;
  name: string;
  address: string;
  phone?: string;
  email?: string;
  website?: string;
  rating?: number;
  reviewCount?: number;
  priceLevel?: number;
  openingHours?: string;
  features?: string[];
  photos?: string[];
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
  lastUpdated: number;
  dataSource: string;
}

// Assess data quality of a business listing
export function assessDataQuality(business: any): BusinessDataQuality {
  const issues: string[] = [];
  const suggestions: string[] = [];

  let completenessScore = 0;
  let totalFields = 0;

  // Check name
  totalFields++;
  if (!business.name || business.name.trim().length < 2) {
    issues.push("Missing or invalid business name");
    suggestions.push("Add a proper business name");
  } else {
    completenessScore++;
  }

  // Check address
  totalFields++;
  if (!business.address || business.address.trim().length < 5) {
    issues.push("Missing or incomplete address");
    suggestions.push("Add complete street address with city and postal code");
  } else {
    completenessScore++;
  }

  // Check phone
  totalFields++;
  if (!business.phone) {
    issues.push("Missing phone number");
    suggestions.push("Add business phone number for customer contact");
  } else {
    completenessScore++;
    // Validate phone format (basic check)
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(business.phone.replace(/[\s\-\(\)]/g, ''))) {
      issues.push("Phone number format may be invalid");
      suggestions.push("Verify phone number format");
    }
  }

  // Check email
  totalFields++;
  if (!business.email) {
    issues.push("Missing email address");
    suggestions.push("Add business email address");
  } else {
    completenessScore++;
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(business.email)) {
      issues.push("Email address format is invalid");
      suggestions.push("Correct email address format");
    }
  }

  // Check website
  totalFields++;
  if (!business.website) {
    issues.push("Missing website");
    suggestions.push("Add business website URL");
  } else {
    completenessScore++;
    // Basic URL validation
    try {
      new URL(business.website);
    } catch {
      issues.push("Website URL format is invalid");
      suggestions.push("Provide valid website URL starting with http:// or https://");
    }
  }

  // Check rating
  if (business.rating !== undefined) {
    if (typeof business.rating !== 'number' || business.rating < 1 || business.rating > 5) {
      issues.push("Rating is invalid (should be 1-5)");
      suggestions.push("Provide rating between 1 and 5 stars");
    }
  }

  // Check opening hours
  if (!business.openingHours) {
    suggestions.push("Add business opening hours for better user experience");
  }

  // Check features
  if (!business.features || business.features.length === 0) {
    suggestions.push("Add business features (WiFi, parking, delivery, etc.)");
  }

  const completeness = totalFields > 0 ? completenessScore / totalFields : 0;

  // Assess accuracy (simplified - in real implementation, this would involve verification)
  const accuracy = calculateAccuracyScore(business);

  // Assess freshness
  const freshness = calculateFreshnessScore(business.lastUpdated);

  return {
    completeness,
    accuracy,
    freshness,
    issues,
    suggestions
  };
}

// Calculate accuracy score based on data consistency
function calculateAccuracyScore(business: any): number {
  let score = 1.0; // Start with perfect score

  // Check for inconsistent data patterns
  if (business.name && business.name.length > 100) {
    score -= 0.2; // Suspiciously long name
  }

  if (business.phone && business.phone.length > 20) {
    score -= 0.2; // Suspiciously long phone number
  }

  if (business.website && business.website.length > 200) {
    score -= 0.2; // Suspiciously long URL
  }

  // Check for placeholder data
  const placeholders = ['n/a', 'none', 'unknown', 'tbd', '123-456-7890', 'example.com'];
  const fieldsToCheck = [business.name, business.address, business.phone, business.email, business.website];

  for (const field of fieldsToCheck) {
    if (field && placeholders.some(p => field.toLowerCase().includes(p))) {
      score -= 0.3;
      break;
    }
  }

  return Math.max(0, score);
}

// Calculate freshness score based on last update time
function calculateFreshnessScore(lastUpdated?: number): number {
  if (!lastUpdated) return 0;

  const now = Date.now();
  const ageInDays = (now - lastUpdated) / (1000 * 60 * 60 * 24);

  if (ageInDays < 30) return 1.0; // Very fresh
  if (ageInDays < 90) return 0.8; // Fresh
  if (ageInDays < 180) return 0.6; // Somewhat fresh
  if (ageInDays < 365) return 0.4; // Getting stale
  return 0.2; // Stale
}

// Enrich business data with additional information
export async function enrichBusinessData(business: any): Promise<EnrichedBusinessData> {
  const enriched: EnrichedBusinessData = {
    id: business.id || generateBusinessId(business),
    name: business.name || 'Unknown Business',
    address: business.address || '',
    phone: business.phone,
    email: business.email,
    website: business.website,
    rating: business.rating,
    reviewCount: business.reviewCount,
    priceLevel: business.priceLevel,
    openingHours: business.openingHours,
    features: business.features || [],
    photos: business.photos || [],
    socialMedia: business.socialMedia || {},
    lastUpdated: business.lastUpdated || Date.now(),
    dataSource: business.dataSource || 'unknown'
  };

  // Attempt to enrich missing data
  if (!enriched.website && enriched.name) {
    enriched.website = await findBusinessWebsite(enriched.name, enriched.address);
  }

  if (!enriched.rating && enriched.name) {
    const ratingData = await findBusinessRating(enriched.name, enriched.address);
    if (ratingData) {
      enriched.rating = ratingData.rating;
      enriched.reviewCount = ratingData.reviewCount;
    }
  }

  if (!enriched.openingHours && enriched.name) {
    enriched.openingHours = await findBusinessHours(enriched.name, enriched.address);
  }

  enriched.lastUpdated = Date.now();

  return enriched;
}

// Generate a unique business ID
function generateBusinessId(business: any): string {
  const components = [
    business.name || 'unknown',
    business.address || 'unknown',
    business.lat?.toString() || '0',
    business.lon?.toString() || '0'
  ];

  // Simple hash function
  let hash = 0;
  for (let i = 0; i < components.join('|').length; i++) {
    const char = components.join('|').charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  return Math.abs(hash).toString(36);
}

// Placeholder functions for external data enrichment (would integrate with real APIs)
async function findBusinessWebsite(name: string, address: string): Promise<string | undefined> {
  // In a real implementation, this would search Google/Bing for the business website
  // For now, return undefined to indicate no enrichment possible
  return undefined;
}

async function findBusinessRating(name: string, address: string): Promise<{ rating: number; reviewCount: number } | null> {
  // In a real implementation, this would query Google Places API or similar
  // For now, return null
  return null;
}

async function findBusinessHours(name: string, address: string): Promise<string | undefined> {
  // In a real implementation, this would query business hours APIs
  // For now, return undefined
  return undefined;
}

// Detect and merge duplicate business listings
export function findDuplicateBusinesses(businesses: any[]): Array<{ original: any; duplicates: any[] }> {
  const duplicates: Array<{ original: any; duplicates: any[] }> = [];
  const processed = new Set<string>();

  for (let i = 0; i < businesses.length; i++) {
    if (processed.has(businesses[i].id)) continue;

    const business = businesses[i];
    const potentialDuplicates: any[] = [];

    for (let j = i + 1; j < businesses.length; j++) {
      if (areBusinessesDuplicates(business, businesses[j])) {
        potentialDuplicates.push(businesses[j]);
        processed.add(businesses[j].id);
      }
    }

    if (potentialDuplicates.length > 0) {
      duplicates.push({
        original: business,
        duplicates: potentialDuplicates
      });
    }

    processed.add(business.id);
  }

  return duplicates;
}

// Check if two businesses are likely duplicates
function areBusinessesDuplicates(business1: any, business2: any): boolean {
  // Check name similarity (simple string matching)
  const name1 = (business1.name || '').toLowerCase().trim();
  const name2 = (business2.name || '').toLowerCase().trim();

  if (name1 === name2 && name1.length > 0) return true;

  // Check address similarity
  const addr1 = (business1.address || '').toLowerCase().trim();
  const addr2 = (business2.address || '').toLowerCase().trim();

  if (addr1 === addr2 && addr1.length > 0) return true;

  // Check coordinate proximity (within 100 meters)
  if (business1.lat && business1.lon && business2.lat && business2.lon) {
    const distance = calculateDistance(business1.lat, business1.lon, business2.lat, business2.lon);
    if (distance < 100) return true;
  }

  return false;
}

// Calculate distance between coordinates (Haversine formula)
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

  return R * c;
}

// Merge duplicate business listings
export function mergeDuplicateBusinesses(original: any, duplicates: any[]): any {
  const merged = { ...original };

  // Merge contact information (prefer non-null values)
  if (!merged.phone && duplicates.some(d => d.phone)) {
    merged.phone = duplicates.find(d => d.phone)?.phone;
  }

  if (!merged.email && duplicates.some(d => d.email)) {
    merged.email = duplicates.find(d => d.email)?.email;
  }

  if (!merged.website && duplicates.some(d => d.website)) {
    merged.website = duplicates.find(d => d.website)?.website;
  }

  // Merge ratings (weighted average)
  const allRatings = [original.rating, ...duplicates.map(d => d.rating)].filter(r => r != null);
  if (allRatings.length > 0) {
    merged.rating = allRatings.reduce((a, b) => a + b, 0) / allRatings.length;
  }

  // Merge features (combine unique features)
  const allFeatures = new Set([...(original.features || []), ...duplicates.flatMap(d => d.features || [])]);
  merged.features = Array.from(allFeatures);

  // Update last modified timestamp
  merged.lastUpdated = Date.now();

  return merged;
}