// Fuzzy search utilities for typo tolerance and approximate matching

export interface FuzzyMatch {
  text: string;
  score: number;
  distance: number;
}

// Levenshtein distance calculation for measuring edit distance between strings
export function levenshteinDistance(a: string, b: string): number {
  const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));

  for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= b.length; j++) matrix[j][0] = j;

  for (let j = 1; j <= b.length; j++) {
    for (let i = 1; i <= a.length; i++) {
      const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,     // deletion
        matrix[j - 1][i] + 1,     // insertion
        matrix[j - 1][i - 1] + indicator // substitution
      );
    }
  }

  return matrix[b.length][a.length];
}

// Soundex algorithm for phonetic matching
export function soundex(word: string): string {
  if (!word) return '';

  const w = word.toUpperCase();
  const codes: { [key: string]: string } = {
    'B': '1', 'F': '1', 'P': '1', 'V': '1',
    'C': '2', 'G': '2', 'J': '2', 'K': '2', 'Q': '2', 'S': '2', 'X': '2', 'Z': '2',
    'D': '3', 'T': '3',
    'L': '4',
    'M': '5', 'N': '5',
    'R': '6'
  };

  let result = w[0];
  let previousCode = codes[w[0]];

  for (let i = 1; i < w.length && result.length < 4; i++) {
    const code = codes[w[i]];
    if (code && code !== previousCode) {
      result += code;
      previousCode = code;
    }
  }

  return result.padEnd(4, '0');
}

// Common abbreviations and their expansions
const ABBREVIATIONS: { [key: string]: string[] } = {
  'rest': ['restaurant', 'restaurant'],
  'cafe': ['coffee', 'coffee shop', 'café'],
  'hotel': ['hotel', 'motel', 'inn', 'lodge'],
  'shop': ['store', 'shop', 'boutique'],
  'phone': ['mobile', 'cell', 'smartphone', 'telephone'],
  'laptop': ['notebook', 'computer', 'laptop'],
  'tv': ['television', 'tv', 'display'],
  'gym': ['fitness', 'gym', 'health club'],
  'bank': ['bank', 'financial', 'credit union'],
  'school': ['school', 'academy', 'college', 'university'],
  'hospital': ['hospital', 'clinic', 'medical center'],
  'airport': ['airport', 'airfield', 'terminal'],
  'station': ['station', 'terminal', 'depot']
};

// Expand abbreviations in a query
export function expandAbbreviations(query: string): string[] {
  const words = query.toLowerCase().split(/\s+/);
  const expanded: string[] = [];

  for (const word of words) {
    if (ABBREVIATIONS[word]) {
      expanded.push(...ABBREVIATIONS[word]);
    } else {
      expanded.push(word);
    }
  }

  return expanded;
}

// Find fuzzy matches for a query against a list of candidates
export function findFuzzyMatches(query: string, candidates: string[], maxDistance: number = 2): FuzzyMatch[] {
  const matches: FuzzyMatch[] = [];
  const queryLower = query.toLowerCase();

  for (const candidate of candidates) {
    const candidateLower = candidate.toLowerCase();
    const distance = levenshteinDistance(queryLower, candidateLower);

    if (distance <= maxDistance) {
      // Calculate relevance score (lower distance = higher score)
      const score = Math.max(0, 100 - (distance * 25));
      matches.push({ text: candidate, score, distance });
    }
  }

  return matches.sort((a, b) => b.score - a.score);
}

// Check if two words sound similar using Soundex
export function soundsSimilar(word1: string, word2: string): boolean {
  return soundex(word1) === soundex(word2);
}

// Generate query variations for broader matching
export function generateQueryVariations(query: string): string[] {
  const variations = new Set<string>();
  const words = query.toLowerCase().split(/\s+/);

  // Add original query
  variations.add(query);

  // Add expanded abbreviations
  const expanded = expandAbbreviations(query);
  if (expanded.join(' ') !== query) {
    variations.add(expanded.join(' '));
  }

  // Add phonetic variations for single words
  if (words.length === 1) {
    // Common misspellings and variations
    const commonVariations: { [key: string]: string[] } = {
      'coffee': ['coffe', 'coffie', 'cafe', 'café'],
      'restaurant': ['resturant', 'restaraunt', 'resteraunt'],
      'hotel': ['hotle', 'hotal'],
      'phone': ['fone', 'fone'],
      'computer': ['computor', 'compter'],
      'internet': ['internat', 'net'],
      'shopping': ['shoping', 'shoppin'],
      'supermarket': ['supermarkt', 'super market']
    };

    if (commonVariations[words[0]]) {
      commonVariations[words[0]].forEach(variation => variations.add(variation));
    }
  }

  return Array.from(variations);
}