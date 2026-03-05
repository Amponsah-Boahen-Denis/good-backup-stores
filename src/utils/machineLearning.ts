// Machine learning approaches for enhanced search functionality

export interface QueryIntent {
  type: 'store' | 'product' | 'location' | 'information' | 'mixed';
  confidence: number;
  entities: {
    products?: string[];
    locations?: string[];
    categories?: string[];
  };
}

export interface UserProfile {
  id: string;
  searchHistory: Array<{
    query: string;
    timestamp: number;
    resultsClicked: number;
    category?: string;
  }>;
  preferences: {
    preferredCategories: string[];
    preferredPriceRange: string;
    preferredLocations: string[];
    searchFrequency: number;
  };
  behaviorPatterns: {
    avgSessionDuration: number;
    commonSearchTimes: number[];
    deviceType: string;
    location: string;
  };
}

export interface SearchPersonalization {
  categoryBoost: { [category: string]: number };
  locationPreference: string[];
  priceRangePreference: string;
  timeBasedSuggestions: string[];
}

// Query intent detection using keyword analysis and patterns
export function detectQueryIntent(query: string): QueryIntent {
  const words = query.toLowerCase().split(/\s+/).filter(word => word.length > 0);
  const entities: QueryIntent['entities'] = {};

  // Intent indicators
  const storeIndicators = ['near', 'in', 'at', 'find', 'locate', 'search', 'show me', 'where'];
  const productIndicators = ['buy', 'purchase', 'get', 'need', 'want', 'looking for', 'find me'];
  const locationIndicators = ['where', 'location', 'address', 'directions', 'map', 'nearby'];
  const informationIndicators = ['what', 'how', 'when', 'why', 'info', 'about', 'tell me'];

  let storeScore = 0;
  let productScore = 0;
  let locationScore = 0;
  let informationScore = 0;

  // Analyze each word
  for (const word of words) {
    if (storeIndicators.includes(word)) storeScore += 2;
    if (productIndicators.includes(word)) productScore += 2;
    if (locationIndicators.includes(word)) locationScore += 2;
    if (informationIndicators.includes(word)) informationScore += 2;
  }

  // Pattern-based detection
  const hasLocationPreposition = /\b(in|at|near|around|close to)\b/i.test(query);
  const hasBusinessType = /\b(restaurant|shop|store|cafe|hotel|bank|hospital|school)\b/i.test(query);
  const hasProductTerms = /\b(phone|laptop|coffee|food|clothes|book)\b/i.test(query);
  const startsWithQuestion = /^(what|how|when|where|why|who)/i.test(query);

  if (hasLocationPreposition) locationScore += 1;
  if (hasBusinessType) storeScore += 1;
  if (hasProductTerms) productScore += 1;
  if (startsWithQuestion) informationScore += 1;

  // Extract entities
  entities.products = extractProductEntities(query);
  entities.locations = extractLocationEntities(query);
  entities.categories = extractCategoryEntities(query);

  // Determine primary intent
  const scores = { store: storeScore, product: productScore, location: locationScore, information: informationScore };
  const maxScore = Math.max(...Object.values(scores));
  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);

  let intent: QueryIntent['type'] = 'mixed';
  let confidence = 0;

  if (maxScore > 0) {
    if (storeScore === maxScore) intent = 'store';
    else if (productScore === maxScore) intent = 'product';
    else if (locationScore === maxScore) intent = 'location';
    else if (informationScore === maxScore) intent = 'information';

    confidence = maxScore / Math.max(totalScore, 1);
  }

  // If confidence is low, classify as mixed
  if (confidence < 0.3) {
    intent = 'mixed';
    confidence = 0.5;
  }

  return { type: intent, confidence, entities };
}

// Extract product-related entities from query
function extractProductEntities(query: string): string[] {
  const productKeywords = [
    'phone', 'mobile', 'laptop', 'computer', 'coffee', 'food', 'restaurant',
    'hotel', 'bank', 'hospital', 'school', 'supermarket', 'pharmacy',
    'gas station', 'cinema', 'gym', 'shopping', 'clothes', 'book'
  ];

  const words = query.toLowerCase().split(/\s+/);
  return words.filter(word => productKeywords.some(keyword => word.includes(keyword)));
}

// Extract location-related entities from query
function extractLocationEntities(query: string): string[] {
  // Simple extraction - in real implementation, this would use NLP/NER
  const locationPatterns = [
    /\b\d+\s+\w+\s+(street|st|avenue|ave|road|rd|boulevard|blvd|lane|ln|drive|dr)\b/gi,
    /\b\d+\s+\w+\s+(city|town|village)\b/gi,
    /\b(zip|postal)\s*code\s*\d+\b/gi
  ];

  const locations: string[] = [];
  for (const pattern of locationPatterns) {
    const matches = query.match(pattern);
    if (matches) locations.push(...matches);
  }

  return locations;
}

// Extract category entities from query
function extractCategoryEntities(query: string): string[] {
  const categories = [
    // Food & Dining
    'restaurant', 'cafe', 'bar', 'bakery', 'diner', 'eatery', 'fast food', 'takeaway',
    'pizza', 'chinese', 'italian', 'mexican', 'indian', 'thai', 'japanese', 'seafood',
    'steakhouse', 'vegetarian', 'vegan', 'breakfast', 'brunch', 'ice cream', 'dessert',
    'coffee shop', 'pub', 'brewery', 'grill', 'bistro', 'catering', 'food truck',

    // Shopping & Retail
    'store', 'shop', 'mall', 'market', 'boutique', 'retail', 'supermarket', 'grocery',
    'department store', 'shopping center', 'outlet', 'clothing', 'fashion', 'jewelry',
    'home goods', 'furniture', 'beauty', 'cosmetics', 'specialty store', 'convenience store',

    // Healthcare & Medical
    'hospital', 'clinic', 'doctor', 'pharmacy', 'medical', 'health', 'dentist',
    'optician', 'veterinary', 'therapy', 'counseling', 'emergency', 'urgent care',
    'specialist', 'surgeon', 'nurse', 'medical center', 'health clinic', 'wellness',

    // Entertainment & Culture
    'cinema', 'theater', 'museum', 'gallery', 'park', 'sports', 'concert', 'music',
    'nightclub', 'casino', 'bowling', 'arcade', 'zoo', 'aquarium', 'amusement park',
    'stadium', 'arena', 'performance', 'live music', 'comedy club', 'art', 'culture',

    // Transportation
    'airport', 'train station', 'bus station', 'taxi', 'parking', 'metro', 'subway',
    'ferry', 'bike rental', 'car rental', 'rideshare', 'limousine', 'shuttle',
    'transportation', 'travel', 'commute', 'public transport', 'railway',

    // Automotive
    'car dealer', 'auto repair', 'gas station', 'car wash', 'mechanic',
    'tire shop', 'auto parts', 'service station', 'dealership', 'used cars',
    'new cars', 'maintenance', 'repair shop', 'body shop', 'detailing',

    // Finance
    'bank', 'atm', 'insurance', 'financial services', 'credit union', 'investment',
    'brokerage', 'mortgage', 'loan', 'savings', 'checking', 'money transfer',
    'currency exchange', 'financial advisor', 'accounting', 'tax services',

    // Education
    'school', 'college', 'university', 'library', 'academy', 'training', 'courses',
    'classes', 'tutoring', 'preschool', 'kindergarten', 'daycare', 'bookstore',
    'educational', 'learning center', 'study', 'research', 'knowledge',

    // Health & Fitness
    'gym', 'fitness', 'health club', 'workout', 'exercise', 'yoga', 'pilates',
    'sports', 'personal trainer', 'wellness', 'nutrition', 'diet', 'meditation',
    'physical therapy', 'rehabilitation', 'sports medicine', 'athletic training',

    // Electronics & Technology
    'computer store', 'phone shop', 'tv store', 'electronics', 'technology', 'gadgets',
    'laptop', 'smartphone', 'tablet', 'headphones', 'camera', 'gaming', 'accessories',
    'appliances', 'audio', 'video', 'mobile', 'cell phone', 'tech support',

    // Accommodation
    'hotel', 'motel', 'guesthouse', 'hostel', 'bnb', 'resort', 'inn', 'lodge',
    'vacation rental', 'apartment', 'villa', 'cottage', 'bed and breakfast', 'boutique hotel',
    'luxury hotel', 'budget hotel', 'spa resort', 'business hotel', 'extended stay',

    // Services
    'laundry', 'dry cleaning', 'hair salon', 'barber', 'nail salon', 'massage',
    'spa', 'cleaning', 'plumbing', 'electrician', 'handyman', 'legal', 'real estate',
    'tattoo', 'piercing', 'photography', 'printing', 'shipping', 'delivery',

    // Religious & Community
    'church', 'temple', 'mosque', 'synagogue', 'chapel', 'cathedral', 'shrine',
    'religious center', 'worship', 'spiritual', 'faith', 'prayer', 'meditation center',
    'community center', 'town hall', 'civic center', 'meeting hall', 'recreation center',
    'senior center', 'youth center', 'cultural center', 'event hall', 'banquet hall',

    // Government
    'post office', 'police station', 'fire station', 'city hall', 'courthouse',
    'dmv', 'license bureau', 'public services', 'municipal', 'administration'
  ];

  const words = query.toLowerCase().split(/\s+/);
  return words.filter(word => categories.includes(word));
}

// Build user profile from search history
export function buildUserProfile(searchHistory: Array<{ query: string; timestamp: number; resultsClicked: number; category?: string }>): UserProfile {
  const profile: UserProfile = {
    id: generateUserId(),
    searchHistory: searchHistory,
    preferences: {
      preferredCategories: [],
      preferredPriceRange: 'moderate',
      preferredLocations: [],
      searchFrequency: 0
    },
    behaviorPatterns: {
      avgSessionDuration: 0,
      commonSearchTimes: [],
      deviceType: 'unknown',
      location: 'unknown'
    }
  };

  if (searchHistory.length === 0) return profile;

  // Analyze category preferences
  const categoryCounts = new Map<string, number>();
  searchHistory.forEach(search => {
    if (search.category) {
      categoryCounts.set(search.category, (categoryCounts.get(search.category) || 0) + 1);
    }
  });

  profile.preferences.preferredCategories = Array.from(categoryCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([category]) => category);

  // Calculate search frequency (searches per day)
  const firstSearch = Math.min(...searchHistory.map(s => s.timestamp));
  const lastSearch = Math.max(...searchHistory.map(s => s.timestamp));
  const daysDiff = (lastSearch - firstSearch) / (1000 * 60 * 60 * 24);
  profile.preferences.searchFrequency = daysDiff > 0 ? searchHistory.length / daysDiff : searchHistory.length;

  // Analyze search times
  const hourCounts = new Array(24).fill(0);
  searchHistory.forEach(search => {
    const hour = new Date(search.timestamp).getHours();
    hourCounts[hour]++;
  });

  profile.behaviorPatterns.commonSearchTimes = hourCounts
    .map((count, hour) => ({ hour, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)
    .map(item => item.hour);

  return profile;
}

// Generate personalized search suggestions
export function generatePersonalizedSuggestions(userProfile: UserProfile, currentQuery: string = ''): string[] {
  const suggestions: string[] = [];

  // Category-based suggestions
  if (userProfile.preferences.preferredCategories.length > 0) {
    const topCategory = userProfile.preferences.preferredCategories[0];
    suggestions.push(`${topCategory} near me`);
    suggestions.push(`best ${topCategory} in town`);
  }

  // Time-based suggestions
  const currentHour = new Date().getHours();
  if (userProfile.behaviorPatterns.commonSearchTimes.includes(currentHour)) {
    suggestions.push('recent searches');
  }

  // Location-based suggestions
  if (userProfile.preferences.preferredLocations.length > 0) {
    const location = userProfile.preferences.preferredLocations[0];
    suggestions.push(`${location} restaurants`);
    suggestions.push(`things to do in ${location}`);
  }

  // Frequency-based suggestions
  if (userProfile.preferences.searchFrequency > 1) {
    suggestions.push('trending searches');
  }

  return suggestions.slice(0, 5);
}

// Apply personalization to search results
export function personalizeSearchResults(
  results: Array<any & { relevanceScore: number; category?: string }>,
  userProfile: UserProfile
): Array<any & { relevanceScore: number }> {
  return results.map(result => {
    let personalizedScore = result.relevanceScore;

    // Boost results in preferred categories
    if (result.category && userProfile.preferences.preferredCategories.includes(result.category)) {
      personalizedScore *= 1.2; // 20% boost
    }

    // Boost results clicked frequently in history
    const relevantHistory = userProfile.searchHistory.filter(h =>
      h.category === result.category && h.resultsClicked > 0
    );

    if (relevantHistory.length > 0) {
      personalizedScore *= 1.1; // 10% boost for historically relevant results
    }

    return {
      ...result,
      relevanceScore: personalizedScore
    };
  }).sort((a, b) => b.relevanceScore - a.relevanceScore);
}

// A/B testing framework for search algorithms
export class SearchABTesting {
  private experiments: Map<string, {
    name: string;
    variants: Array<{ name: string; weight: number }>;
    active: boolean;
  }> = new Map();

  // Create a new experiment
  createExperiment(name: string, variants: Array<{ name: string; weight: number }>): void {
    this.experiments.set(name, { name, variants, active: true });
  }

  // Assign user to a variant
  assignVariant(experimentName: string, userId: string): string {
    const experiment = this.experiments.get(experimentName);
    if (!experiment || !experiment.active) return 'control';

    // Simple hash-based assignment for consistency
    const hash = this.simpleHash(userId + experimentName);
    const totalWeight = experiment.variants.reduce((sum, v) => sum + v.weight, 0);
    const normalizedHash = Math.abs(hash) % totalWeight;

    let cumulativeWeight = 0;
    for (const variant of experiment.variants) {
      cumulativeWeight += variant.weight;
      if (normalizedHash < cumulativeWeight) {
        return variant.name;
      }
    }

    return 'control';
  }

  // Record experiment result
  recordResult(experimentName: string, variant: string, userId: string, metric: string, value: number): void {
    // In a real implementation, this would send data to analytics service
    console.log(`Experiment ${experimentName}: ${variant} for user ${userId} - ${metric}: ${value}`);
  }

  // Simple hash function for consistent user assignment
  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash;
  }
}

// Global A/B testing instance
export const searchABTesting = new SearchABTesting();

// Initialize default experiments
searchABTesting.createExperiment('relevance_algorithm', [
  { name: 'current', weight: 70 },
  { name: 'enhanced', weight: 30 }
]);

searchABTesting.createExperiment('suggestions_enabled', [
  { name: 'enabled', weight: 80 },
  { name: 'disabled', weight: 20 }
]);

// Generate user ID (simple implementation)
function generateUserId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}