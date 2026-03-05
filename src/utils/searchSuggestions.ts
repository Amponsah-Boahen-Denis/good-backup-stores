// Search suggestions and autocomplete utilities

export interface SearchSuggestion {
  text: string;
  type: 'completion' | 'correction' | 'category' | 'popular';
  score: number;
  category?: string;
}

// Popular search terms by frequency (would be populated from analytics)
const POPULAR_SEARCHES = [
  // Food & Dining
  'coffee shop', 'restaurant', 'pizza', 'chinese food', 'italian restaurant',
  'fast food', 'bar', 'bakery', 'ice cream', 'sushi', 'mexican food',

  // Shopping & Retail
  'supermarket', 'shopping mall', 'grocery store', 'clothing store', 'pharmacy',

  // Services
  'bank', 'atm', 'gas station', 'hair salon', 'laundry', 'car wash',

  // Healthcare
  'hospital', 'dentist', 'optician', 'veterinary', 'pharmacy',

  // Entertainment
  'cinema', 'museum', 'park', 'bowling', 'nightclub', 'casino',

  // Accommodation
  'hotel', 'motel', 'hostel', 'bnb',

  // Education
  'school', 'library', 'bookstore', 'college',

  // Health & Fitness
  'gym', 'yoga studio', 'sports center', 'spa',

  // Electronics
  'phone shop', 'computer store', 'electronics store',

  // Automotive
  'car dealer', 'auto repair', 'parking', 'car rental',

  // Transportation
  'airport', 'train station', 'bus station', 'taxi',

  // Government & Community
  'post office', 'police station', 'community center', 'town hall'
];

// Common misspellings and corrections
const SPELLING_CORRECTIONS: { [key: string]: string } = {
  'resturant': 'restaurant',
  'restaraunt': 'restaurant',
  'resteraunt': 'restaurant',
  'coffie': 'coffee',
  'coffe': 'coffee',
  'reciept': 'receipt',
  'recieve': 'receive',
  'seperate': 'separate',
  'definitly': 'definitely',
  'occured': 'occurred',
  'existance': 'existence',
  'priviledge': 'privilege',
  'accomodate': 'accommodate',
  'begining': 'beginning',
  'beleive': 'believe',
  'buisness': 'business',
  'calender': 'calendar',
  'cemetary': 'cemetery',
  'commited': 'committed',
  'concious': 'conscious',
  'curiousity': 'curiosity',
  'dissapear': 'disappear',
  'exaggerate': 'exaggerate',
  'exhilarate': 'exhilarate',
  'familar': 'familiar',
  'finaly': 'finally',
  'fourty': 'forty',
  'freind': 'friend',
  'goverment': 'government',
  'hieght': 'height',
  'immediatly': 'immediately',
  'independant': 'independent',
  'knowlege': 'knowledge',
  'lenght': 'length',
  'liason': 'liaison',
  'libary': 'library',
  'lightening': 'lightning',
  'maintainance': 'maintenance',
  'neccessary': 'necessary',
  'neighbour': 'neighbor',
  'noticable': 'noticeable',
  'occassion': 'occasion',
  'persue': 'pursue',
  'posession': 'possession',
  'prefered': 'preferred',
  'pronounciation': 'pronunciation',
  'reccommend': 'recommend',
  'rythm': 'rhythm',
  'seizeable': 'seizable',
  'thier': 'their',
  'tommorow': 'tomorrow',
  'tounge': 'tongue',
  'truely': 'truly',
  'untill': 'until',
  'vaccuum': 'vacuum',
  'wierd': 'weird'
};

// Category suggestions based on partial input
const CATEGORY_SUGGESTIONS: { [prefix: string]: string[] } = {
  // Food & Dining
  'rest': ['restaurant', 'restroom'],
  'coff': ['coffee shop', 'coffee'],
  'pizz': ['pizza', 'pizzeria'],
  'chin': ['chinese restaurant', 'chinese food'],
  'ital': ['italian restaurant', 'italian food'],
  'mex': ['mexican restaurant', 'mexican food'],
  'indi': ['indian restaurant', 'indian food'],
  'thai': ['thai restaurant', 'thai food'],
  'jap': ['japanese restaurant', 'japanese food'],
  'sush': ['sushi', 'sushi restaurant'],
  'burg': ['burger', 'burger restaurant'],
  'ice': ['ice cream', 'ice cream shop'],
  'bak': ['bakery', 'bakery'],
  'bar': ['bar', 'barber', 'barbecue'],
  'brew': ['brewery', 'brewpub'],

  // Shopping & Retail
  'shop': ['shopping mall', 'shop'],
  'mall': ['shopping mall', 'mall'],
  'groc': ['grocery store', 'grocery'],
  'cloth': ['clothing store', 'clothing'],
  'jew': ['jewelry store', 'jewelry'],
  'home': ['home goods', 'home improvement'],
  'beau': ['beauty salon', 'beauty products'],
  'sup': ['supermarket', 'supplies'],

  // Services
  'hair': ['hair salon', 'hairdresser'],
  'nail': ['nail salon', 'nails'],
  'mass': ['massage', 'massage parlor'],
  'laun': ['laundry', 'laundromat'],
  'clean': ['cleaning service', 'cleaners'],
  'plumb': ['plumbing', 'plumber'],
  'ectr': ['electrician', 'electrical'],
  'hand': ['handyman', 'handyman services'],
  'real': ['real estate', 'realtor'],
  'legal': ['lawyer', 'legal services'],

  // Healthcare
  'hosp': ['hospital', 'hospital'],
  'dent': ['dentist', 'dental clinic'],
  'opt': ['optician', 'optometrist'],
  'vet': ['veterinary', 'vet clinic'],
  'phar': ['pharmacy', 'pharmacy'],
  'ther': ['therapy', 'therapist'],
  'coun': ['counseling', 'counselor'],

  // Entertainment
  'cin': ['cinema', 'cinnamon'],
  'muse': ['museum', 'museum'],
  'conc': ['concert', 'concert hall'],
  'night': ['nightclub', 'nightclub'],
  'bowl': ['bowling', 'bowling alley'],
  'zoo': ['zoo', 'zoo'],
  'aqua': ['aquarium', 'aquarium'],
  'par': ['park', 'parks'],
  'sport': ['sports center', 'sports'],
  'gam': ['gaming', 'game store'],

  // Accommodation
  'hot': ['hotel', 'hot dog stand'],
  'mot': ['motel', 'motel'],
  'host': ['hostel', 'hostel'],
  'bnb': ['bnb', 'bed and breakfast'],
  'resort': ['resort', 'resort'],
  'spa': ['spa', 'spa'],

  // Finance
  'ban': ['bank', 'banner'],
  'atm': ['atm', 'atm'],
  'insur': ['insurance', 'insurance'],
  'invest': ['investment', 'investor'],

  // Education
  'sch': ['school', 'schedule'],
  'coll': ['college', 'college'],
  'univ': ['university', 'university'],
  'lib': ['library', 'liberty'],
  'book': ['bookstore', 'bookstore'],
  'tutor': ['tutoring', 'tutor'],
  'cours': ['courses', 'course'],

  // Health & Fitness
  'gym': ['gym', 'gymnasium'],
  'yog': ['yoga studio', 'yoga'],
  'pil': ['pilates', 'pilates studio'],
  'fit': ['fitness center', 'fitness'],
  'well': ['wellness center', 'wellness'],

  // Electronics
  'phon': ['phone shop', 'phone'],
  'comp': ['computer store', 'computer'],
  'elec': ['electronics store', 'electronics'],
  'tv': ['tv store', 'tv'],
  'tab': ['tablet', 'tablet'],
  'head': ['headphones', 'headphones'],
  'cam': ['camera', 'camera store'],
  'gamst': ['gaming store', 'gaming'],

  // Automotive
  'gas': ['gas station', 'gas'],
  'car': ['car dealer', 'car rental'],
  'auto': ['auto repair', 'auto parts'],
  'parking': ['parking', 'parking lot'],
  'wash': ['car wash', 'car wash'],
  'tire': ['tire shop', 'tires'],

  // Transportation
  'airp': ['airport', 'airport'],
  'train': ['train station', 'train'],
  'bus': ['bus station', 'bus'],
  'taxi': ['taxi', 'taxi'],
  'bike': ['bike rental', 'bike'],
  'rent': ['car rental', 'rental'],

  // Government & Community
  'post': ['post office', 'post'],
  'polic': ['police station', 'police'],
  'fire': ['fire station', 'fire'],
  'commu': ['community center', 'community'],
  'town': ['town hall', 'town'],
  'cour': ['courthouse', 'court']
};

// Generate autocomplete suggestions for partial queries
export function getAutocompleteSuggestions(partialQuery: string, maxSuggestions: number = 5): SearchSuggestion[] {
  const query = partialQuery.toLowerCase().trim();
  if (!query) return [];

  const suggestions: SearchSuggestion[] = [];

  // 1. Query completion from popular searches
  const completions = POPULAR_SEARCHES
    .filter(term => term.toLowerCase().startsWith(query))
    .map(term => ({
      text: term,
      type: 'completion' as const,
      score: 90 + (term.length - query.length) // Longer matches get slightly higher score
    }));

  suggestions.push(...completions);

  // 2. Category suggestions
  for (const [prefix, categories] of Object.entries(CATEGORY_SUGGESTIONS)) {
    if (query.startsWith(prefix) || prefix.startsWith(query)) {
      categories.forEach(category => {
        if (!suggestions.some(s => s.text === category)) {
          suggestions.push({
            text: category,
            type: 'category',
            score: 80,
            category: category
          });
        }
      });
    }
  }

  // 3. Popular searches that contain the query
  const containing = POPULAR_SEARCHES
    .filter(term => term.toLowerCase().includes(query) && !term.toLowerCase().startsWith(query))
    .map(term => ({
      text: term,
      type: 'popular' as const,
      score: 70
    }));

  suggestions.push(...containing);

  // Sort by score and limit results
  return suggestions
    .sort((a, b) => b.score - a.score)
    .slice(0, maxSuggestions);
}

// Get spelling correction suggestions
export function getSpellingCorrections(query: string): SearchSuggestion[] {
  const words = query.toLowerCase().split(/\s+/);
  const corrections: SearchSuggestion[] = [];

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    if (SPELLING_CORRECTIONS[word]) {
      const correctedWord = SPELLING_CORRECTIONS[word];
      const correctedQuery = [...words];
      correctedQuery[i] = correctedWord;

      corrections.push({
        text: correctedQuery.join(' '),
        type: 'correction',
        score: 95 // High priority for corrections
      });
    }
  }

  return corrections;
}

// Get category-based suggestions
export function getCategorySuggestions(query: string): SearchSuggestion[] {
  const queryLower = query.toLowerCase();
  const suggestions: SearchSuggestion[] = [];

  // Find categories that match the query
  for (const [prefix, categories] of Object.entries(CATEGORY_SUGGESTIONS)) {
    if (queryLower.includes(prefix) || prefix.includes(queryLower)) {
      categories.forEach(category => {
        suggestions.push({
          text: category,
          type: 'category',
          score: 75,
          category: category
        });
      });
    }
  }

  return suggestions;
}

// Get popular search suggestions
export function getPopularSuggestions(maxSuggestions: number = 3): SearchSuggestion[] {
  return POPULAR_SEARCHES
    .slice(0, maxSuggestions)
    .map(term => ({
      text: term,
      type: 'popular',
      score: 60
    }));
}

// Combined search suggestions (autocomplete + corrections + categories)
export function getSearchSuggestions(query: string, maxSuggestions: number = 8): SearchSuggestion[] {
  const allSuggestions: SearchSuggestion[] = [];

  // Get different types of suggestions
  const autocomplete = getAutocompleteSuggestions(query, 3);
  const corrections = getSpellingCorrections(query);
  const categories = getCategorySuggestions(query);
  const popular = corrections.length === 0 ? getPopularSuggestions(2) : [];

  allSuggestions.push(...autocomplete, ...corrections, ...categories, ...popular);

  // Remove duplicates and sort by score
  const uniqueSuggestions = allSuggestions.filter((suggestion, index, self) =>
    index === self.findIndex(s => s.text === suggestion.text)
  );

  return uniqueSuggestions
    .sort((a, b) => b.score - a.score)
    .slice(0, maxSuggestions);
}

// Detect if a query needs spelling correction
export function needsSpellingCorrection(query: string): boolean {
  const words = query.toLowerCase().split(/\s+/);
  return words.some(word => SPELLING_CORRECTIONS[word] !== undefined);
}

// Get the best correction for a query
export function getBestCorrection(query: string): string | null {
  const corrections = getSpellingCorrections(query);
  return corrections.length > 0 ? corrections[0].text : null;
}