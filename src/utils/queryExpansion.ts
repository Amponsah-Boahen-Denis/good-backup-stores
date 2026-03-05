// Query expansion and synonym utilities for broader search matching

export interface SynonymGroup {
  terms: string[];
  category?: string;
}

// Product and service synonyms
const PRODUCT_SYNONYMS: SynonymGroup[] = [
  // Food & Dining
  { terms: ['coffee', 'cafe', 'café', 'coffee shop', 'coffeeshop', 'espresso', 'latte', 'cappuccino'], category: 'food' },
  { terms: ['restaurant', 'diner', 'eatery', 'bistro', 'cafe', 'grill', 'dining', 'eateries'], category: 'food' },
  { terms: ['bar', 'pub', 'tavern', 'drinks', 'alcohol', 'cocktail', 'beer', 'wine', 'brewery'], category: 'food' },
  { terms: ['bakery', 'bread', 'pastries', 'cake', 'cookies', 'muffins', 'donuts', 'croissant'], category: 'food' },
  { terms: ['pizza', 'pizzeria', 'italian', 'pasta', 'spaghetti', 'lasagna'], category: 'food' },
  { terms: ['fast food', 'burger', 'hamburger', 'fries', 'mcdonalds', 'kfc', 'subway'], category: 'food' },
  { terms: ['chinese', 'asian', 'sushi', 'japanese', 'thai', 'vietnamese', 'korean'], category: 'food' },
  { terms: ['mexican', 'taco', 'burrito', 'enchilada', 'quesadilla', 'nachos'], category: 'food' },
  { terms: ['indian', 'curry', 'tandoori', 'naan', 'masala', 'biryani'], category: 'food' },
  { terms: ['italian', 'pasta', 'pizza', 'gelato', 'risotto', 'cannoli'], category: 'food' },
  { terms: ['seafood', 'fish', 'lobster', 'crab', 'shrimp', 'oyster', 'sushi'], category: 'food' },
  { terms: ['steakhouse', 'steak', 'ribs', 'bbq', 'barbecue', 'grill'], category: 'food' },
  { terms: ['vegetarian', 'vegan', 'salad', 'organic', 'healthy', 'gluten free'], category: 'food' },
  { terms: ['ice cream', 'frozen yogurt', 'gelato', 'dessert', 'sweet', 'treats'], category: 'food' },
  { terms: ['breakfast', 'brunch', 'pancakes', 'waffles', 'eggs', 'bacon'], category: 'food' },

  // Electronics & Technology
  { terms: ['phone', 'mobile', 'cellphone', 'smartphone', 'telephone', 'iphone', 'android', 'samsung'], category: 'electronics' },
  { terms: ['laptop', 'notebook', 'computer', 'pc', 'macbook', 'dell', 'hp', 'lenovo'], category: 'electronics' },
  { terms: ['tv', 'television', 'display', 'monitor', 'screen', 'smart tv', 'led', 'oled'], category: 'electronics' },
  { terms: ['tablet', 'ipad', 'kindle', 'ebook', 'reader'], category: 'electronics' },
  { terms: ['headphones', 'earbuds', 'earphones', 'audio', 'music', 'sound'], category: 'electronics' },
  { terms: ['camera', 'photography', 'dslr', 'canon', 'nikon', 'sony'], category: 'electronics' },
  { terms: ['gaming', 'video games', 'playstation', 'xbox', 'nintendo', 'pc gaming'], category: 'electronics' },
  { terms: ['accessories', 'charger', 'cable', 'case', 'screen protector', 'stylus'], category: 'electronics' },

  // Accommodation
  { terms: ['hotel', 'motel', 'inn', 'lodge', 'resort', 'guesthouse', 'boutique hotel'], category: 'accommodation' },
  { terms: ['hostel', 'backpacker', 'youth hostel', 'budget accommodation'], category: 'accommodation' },
  { terms: ['bnb', 'airbnb', 'vacation rental', 'apartment', 'villa'], category: 'accommodation' },
  { terms: ['spa', 'resort', 'wellness', 'relaxation', 'massage'], category: 'accommodation' },

  // Finance & Banking
  { terms: ['bank', 'financial', 'credit union', 'banking', 'money', 'savings'], category: 'finance' },
  { terms: ['atm', 'cash machine', 'cashpoint', 'withdraw', 'deposit'], category: 'finance' },
  { terms: ['insurance', 'life insurance', 'car insurance', 'health insurance'], category: 'finance' },
  { terms: ['investment', 'stocks', 'brokerage', 'financial advisor'], category: 'finance' },

  // Health & Fitness
  { terms: ['gym', 'fitness', 'health club', 'workout', 'exercise', 'training'], category: 'health' },
  { terms: ['yoga', 'pilates', 'meditation', 'wellness', 'spa'], category: 'health' },
  { terms: ['sports', 'athletics', 'running', 'cycling', 'swimming'], category: 'health' },
  { terms: ['personal trainer', 'fitness instructor', 'coach', 'workout'], category: 'health' },

  // Healthcare
  { terms: ['hospital', 'clinic', 'medical center', 'healthcare', 'doctor', 'physician'], category: 'healthcare' },
  { terms: ['pharmacy', 'drugstore', 'chemist', 'medical store', 'apothecary'], category: 'healthcare' },
  { terms: ['dentist', 'dental', 'teeth', 'orthodontist', 'oral health'], category: 'healthcare' },
  { terms: ['optician', 'eyeglasses', 'contacts', 'eye care', 'vision'], category: 'healthcare' },
  { terms: ['veterinary', 'vet', 'animal hospital', 'pet care', 'animal clinic'], category: 'healthcare' },
  { terms: ['therapy', 'counseling', 'psychologist', 'mental health', 'psychiatry'], category: 'healthcare' },

  // Education
  { terms: ['school', 'academy', 'college', 'university', 'education', 'learning'], category: 'education' },
  { terms: ['library', 'bookstore', 'books', 'reading', 'literature'], category: 'education' },
  { terms: ['tutoring', 'private lessons', 'coaching', 'mentoring'], category: 'education' },
  { terms: ['courses', 'classes', 'workshops', 'training', 'certification'], category: 'education' },
  { terms: ['kindergarten', 'preschool', 'nursery', 'daycare'], category: 'education' },

  // Shopping & Retail
  { terms: ['supermarket', 'grocery', 'store', 'market', 'shop', 'retail'], category: 'shopping' },
  { terms: ['mall', 'shopping center', 'plaza', 'outlet', 'department store'], category: 'shopping' },
  { terms: ['boutique', 'specialty store', 'gift shop', 'souvenir'], category: 'shopping' },
  { terms: ['clothing', 'fashion', 'apparel', 'clothes', 'shoes', 'accessories'], category: 'shopping' },
  { terms: ['jewelry', 'watches', 'luxury goods', 'designer'], category: 'shopping' },
  { terms: ['home goods', 'furniture', 'decor', 'housewares'], category: 'shopping' },
  { terms: ['beauty', 'cosmetics', 'salon', 'spa', 'hair', 'nails'], category: 'shopping' },

  // Automotive
  { terms: ['gas station', 'petrol station', 'fuel station', 'filling station', 'bp', 'shell'], category: 'automotive' },
  { terms: ['car dealer', 'auto dealer', 'car sales', 'new cars', 'used cars'], category: 'automotive' },
  { terms: ['auto repair', 'mechanic', 'car service', 'maintenance', 'tire'], category: 'automotive' },
  { terms: ['parking', 'car park', 'parking lot', 'garage', 'valet'], category: 'automotive' },
  { terms: ['car wash', 'auto detailing', 'cleaning', 'waxing'], category: 'automotive' },
  { terms: ['car rental', 'rent a car', 'vehicle rental', 'hire car'], category: 'automotive' },

  // Transportation
  { terms: ['airport', 'airfield', 'terminal', 'aerodrome', 'international airport'], category: 'transport' },
  { terms: ['train station', 'railway station', 'rail station', 'metro', 'subway'], category: 'transport' },
  { terms: ['bus station', 'bus terminal', 'coach station', 'bus stop'], category: 'transport' },
  { terms: ['taxi', 'cab', 'uber', 'lyft', 'rideshare', 'limousine'], category: 'transport' },
  { terms: ['bike rental', 'bicycle', 'scooter', 'ebike', 'cycling'], category: 'transport' },
  { terms: ['ferry', 'boat', 'water taxi', 'marine transport'], category: 'transport' },

  // Entertainment & Culture
  { terms: ['cinema', 'movie theater', 'theater', 'movies', 'films', 'hollywood'], category: 'entertainment' },
  { terms: ['museum', 'art gallery', 'gallery', 'exhibition', 'art', 'culture'], category: 'entertainment' },
  { terms: ['concert', 'music', 'live music', 'venue', 'performance'], category: 'entertainment' },
  { terms: ['nightclub', 'club', 'dance club', 'disco', 'dj'], category: 'entertainment' },
  { terms: ['casino', 'gambling', 'poker', 'slot machines', 'betting'], category: 'entertainment' },
  { terms: ['bowling', 'billiards', 'pool hall', 'arcade', 'games'], category: 'entertainment' },
  { terms: ['park', 'recreation', 'playground', 'outdoor activities'], category: 'entertainment' },
  { terms: ['zoo', 'aquarium', 'animal park', 'wildlife', 'marine life'], category: 'entertainment' },

  // Services
  { terms: ['laundry', 'dry cleaning', 'cleaners', 'wash', 'ironing'], category: 'services' },
  { terms: ['hair salon', 'barber', 'haircut', 'styling', 'beauty salon'], category: 'services' },
  { terms: ['nail salon', 'manicure', 'pedicure', 'nails', 'beauty'], category: 'services' },
  { terms: ['tattoo', 'piercing', 'body art', 'ink', 'tattoo parlor'], category: 'services' },
  { terms: ['massage', 'spa', 'relaxation', 'therapy', 'wellness'], category: 'services' },
  { terms: ['cleaning', 'housekeeping', 'maid service', 'janitorial'], category: 'services' },
  { terms: ['plumbing', 'electrician', 'handyman', 'repair', 'maintenance'], category: 'services' },
  { terms: ['legal', 'lawyer', 'attorney', 'law firm', 'legal services'], category: 'services' },
  { terms: ['real estate', 'property', 'houses', 'apartments', 'realtor'], category: 'services' },

  // Religious & Community
  { terms: ['church', 'temple', 'mosque', 'synagogue', 'religious', 'worship'], category: 'religious' },
  { terms: ['community center', 'town hall', 'civic center', 'meeting hall'], category: 'community' },
  { terms: ['post office', 'mail', 'shipping', 'postal services'], category: 'government' },
  { terms: ['police station', 'law enforcement', 'public safety', 'emergency'], category: 'government' },
  { terms: ['fire station', 'fire department', 'emergency services'], category: 'government' }
];

// Category expansion mappings
const CATEGORY_EXPANSIONS: { [key: string]: string[] } = {
  'food': [
    'restaurant', 'cafe', 'bar', 'bakery', 'diner', 'eatery', 'fast food', 'takeaway',
    'pizza', 'chinese', 'italian', 'mexican', 'indian', 'thai', 'japanese', 'seafood',
    'steakhouse', 'vegetarian', 'vegan', 'breakfast', 'brunch', 'ice cream', 'dessert',
    'coffee shop', 'pub', 'brewery', 'grill', 'bistro', 'catering', 'food truck'
  ],
  'electronics': [
    'computer store', 'phone shop', 'tv store', 'electronics', 'technology', 'gadgets',
    'laptop', 'smartphone', 'tablet', 'headphones', 'camera', 'gaming', 'accessories',
    'appliances', 'audio', 'video', 'mobile', 'cell phone', 'tech support'
  ],
  'accommodation': [
    'hotel', 'motel', 'guesthouse', 'hostel', 'bnb', 'resort', 'inn', 'lodge',
    'vacation rental', 'apartment', 'villa', 'cottage', 'bed and breakfast', 'boutique hotel',
    'luxury hotel', 'budget hotel', 'spa resort', 'business hotel', 'extended stay'
  ],
  'healthcare': [
    'hospital', 'clinic', 'doctor', 'pharmacy', 'medical', 'health', 'dentist',
    'optician', 'veterinary', 'therapy', 'counseling', 'emergency', 'urgent care',
    'specialist', 'surgeon', 'nurse', 'medical center', 'health clinic', 'wellness'
  ],
  'shopping': [
    'store', 'shop', 'mall', 'market', 'boutique', 'retail', 'supermarket', 'grocery',
    'department store', 'shopping center', 'outlet', 'clothing', 'fashion', 'jewelry',
    'home goods', 'furniture', 'beauty', 'cosmetics', 'specialty store', 'convenience store'
  ],
  'entertainment': [
    'cinema', 'theater', 'museum', 'gallery', 'park', 'sports', 'concert', 'music',
    'nightclub', 'casino', 'bowling', 'arcade', 'zoo', 'aquarium', 'amusement park',
    'stadium', 'arena', 'performance', 'live music', 'comedy club', 'art', 'culture'
  ],
  'transport': [
    'airport', 'train station', 'bus station', 'taxi', 'parking', 'metro', 'subway',
    'ferry', 'bike rental', 'car rental', 'rideshare', 'limousine', 'shuttle',
    'transportation', 'travel', 'commute', 'public transport', 'railway'
  ],
  'automotive': [
    'car dealer', 'auto repair', 'gas station', 'parking', 'car wash', 'mechanic',
    'tire shop', 'auto parts', 'service station', 'dealership', 'used cars',
    'new cars', 'maintenance', 'repair shop', 'body shop', 'detailing'
  ],
  'finance': [
    'bank', 'atm', 'insurance', 'financial services', 'credit union', 'investment',
    'brokerage', 'mortgage', 'loan', 'savings', 'checking', 'money transfer',
    'currency exchange', 'financial advisor', 'accounting', 'tax services'
  ],
  'education': [
    'school', 'college', 'university', 'library', 'academy', 'training', 'courses',
    'classes', 'tutoring', 'preschool', 'kindergarten', 'daycare', 'bookstore',
    'educational', 'learning center', 'study', 'research', 'knowledge'
  ],
  'health': [
    'gym', 'fitness', 'health club', 'workout', 'exercise', 'yoga', 'pilates',
    'sports', 'personal trainer', 'wellness', 'nutrition', 'diet', 'meditation',
    'physical therapy', 'rehabilitation', 'sports medicine', 'athletic training'
  ],
  'services': [
    'laundry', 'dry cleaning', 'hair salon', 'barber', 'nail salon', 'massage',
    'spa', 'cleaning', 'plumbing', 'electrician', 'handyman', 'legal', 'real estate',
    'tattoo', 'piercing', 'photography', 'printing', 'shipping', 'delivery'
  ],
  'religious': [
    'church', 'temple', 'mosque', 'synagogue', 'chapel', 'cathedral', 'shrine',
    'religious center', 'worship', 'spiritual', 'faith', 'prayer', 'meditation center'
  ],
  'community': [
    'community center', 'town hall', 'civic center', 'meeting hall', 'recreation center',
    'senior center', 'youth center', 'cultural center', 'event hall', 'banquet hall'
  ],
  'government': [
    'post office', 'police station', 'fire station', 'city hall', 'courthouse',
    'dmv', 'license bureau', 'public services', 'municipal', 'administration'
  ],
  'culture': [
    'museum', 'art gallery', 'gallery', 'exhibition', 'historical site', 'heritage',
    'cultural center', 'theater', 'performing arts', 'library', 'archive', 'history'
  ]
};

// Regional variations for different countries
const REGIONAL_VARIATIONS: { [key: string]: { [country: string]: string[] } } = {
  'restaurant': {
    'US': ['diner', 'eatery', 'grill'],
    'UK': ['pub', 'cafe', 'chippy'],
    'IN': ['dhaba', 'tiffin', 'mess'],
    'JP': ['izakaya', 'ramen', 'sushi'],
    'IT': ['trattoria', 'ristorante', 'pizzeria']
  },
  'store': {
    'US': ['shop', 'market', 'outlet'],
    'UK': ['shop', 'store', 'emporium'],
    'IN': ['kirana', 'bazaar', 'mandi'],
    'DE': ['laden', 'geschäft', 'markt']
  },
  'coffee': {
    'US': ['coffee shop', 'cafe'],
    'UK': ['coffee shop', 'cafe'],
    'IT': ['espresso bar', 'bar'],
    'FR': ['cafe', 'bistro'],
    'TR': ['kahve', 'çay bahçesi']
  }
};

// Find synonyms for a given term
export function findSynonyms(term: string): string[] {
  const termLower = term.toLowerCase();
  const synonyms = new Set<string>();

  // Check product synonyms
  for (const group of PRODUCT_SYNONYMS) {
    if (group.terms.some(t => t.toLowerCase().includes(termLower) || termLower.includes(t))) {
      group.terms.forEach(t => synonyms.add(t));
    }
  }

  // Always include the original term
  synonyms.add(termLower);

  return Array.from(synonyms);
}

// Expand a category to related terms
export function expandCategory(category: string): string[] {
  const categoryLower = category.toLowerCase();
  const expansions = new Set<string>();

  // Add original category
  expansions.add(categoryLower);

  // Add category expansions
  if (CATEGORY_EXPANSIONS[categoryLower]) {
    CATEGORY_EXPANSIONS[categoryLower].forEach(term => expansions.add(term));
  }

  return Array.from(expansions);
}

// Get regional variations for a term in a specific country
export function getRegionalVariations(term: string, country: string): string[] {
  const termLower = term.toLowerCase();
  const countryUpper = country.toUpperCase();
  const variations = new Set<string>();

  // Add original term
  variations.add(termLower);

  // Check regional variations
  if (REGIONAL_VARIATIONS[termLower] && REGIONAL_VARIATIONS[termLower][countryUpper]) {
    REGIONAL_VARIATIONS[termLower][countryUpper].forEach(variation => variations.add(variation));
  }

  return Array.from(variations);
}

// Generate expanded queries for broader matching
export function expandQuery(query: string, country?: string): string[] {
  const words = query.toLowerCase().split(/\s+/);
  const expandedQueries = new Set<string>();

  // Add original query
  expandedQueries.add(query);

  // Expand each word with synonyms
  const synonymExpansions: string[][] = words.map(word => findSynonyms(word));

  // Generate combinations of synonyms
  function generateCombinations(arrays: string[][], index: number = 0, current: string[] = []): void {
    if (index === arrays.length) {
      expandedQueries.add(current.join(' '));
      return;
    }

    for (const term of arrays[index]) {
      generateCombinations(arrays, index + 1, [...current, term]);
    }
  }

  generateCombinations(synonymExpansions);

  // Add regional variations if country is specified
  if (country) {
    const regionalQueries = new Set<string>();
    for (const q of expandedQueries) {
      const regionalVariations = getRegionalVariations(q, country);
      regionalVariations.forEach(variation => regionalQueries.add(variation));
    }
    expandedQueries.clear();
    regionalQueries.forEach(q => expandedQueries.add(q));
  }

  return Array.from(expandedQueries).slice(0, 10); // Limit to 10 variations to avoid explosion
}

// Detect query intent (store vs product search)
export function detectQueryIntent(query: string): 'store' | 'product' | 'location' | 'mixed' {
  const words = query.toLowerCase().split(/\s+/);
  const storeIndicators = ['near', 'in', 'at', 'find', 'locate', 'search'];
  const productIndicators = ['buy', 'purchase', 'get', 'need', 'want'];
  const locationIndicators = ['where', 'location', 'address', 'directions'];

  let storeScore = 0;
  let productScore = 0;
  let locationScore = 0;

  for (const word of words) {
    if (storeIndicators.includes(word)) storeScore++;
    if (productIndicators.includes(word)) productScore++;
    if (locationIndicators.includes(word)) locationScore++;
  }

  const maxScore = Math.max(storeScore, productScore, locationScore);
  if (maxScore === 0) return 'mixed';

  if (storeScore === maxScore) return 'store';
  if (productScore === maxScore) return 'product';
  return 'location';
}