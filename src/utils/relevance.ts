export type Scored<T> = T & { relevanceScore: number };

export function scoreRelevance(query: string, candidate: { name?: string; tags?: string[]; category?: string | null; distance?: number }): number {
  const q = (query || "").toLowerCase().trim();
  if (!q) return 0;

  let score = 0;
  const name = (candidate.name || "").toLowerCase();
  const category = (candidate.category || "").toLowerCase();
  const tags = (candidate.tags || []).map((t) => (t || "").toLowerCase());

  // Split query into words for multi-word matching
  const queryWords = q.split(/\s+/).filter(word => word.length > 0);

  // Multi-word query handling
  if (queryWords.length > 1) {
    let matchedWords = 0;
    for (const word of queryWords) {
      if (name.includes(word)) matchedWords++;
      if (category && category.includes(word)) matchedWords += 0.5;
      if (tags.some(tag => tag.includes(word))) matchedWords += 0.3;
    }
    score += matchedWords * 20; // Boost for multi-word matches
  }

  // Field weighting system
  // Name matches get highest weight
  if (name.startsWith(q)) score += 50; // Exact prefix match in name
  if (name.includes(q)) score += 30; // Substring match in name

  // Category matches get medium weight
  if (category && q && category.includes(q)) score += 15;

  // Tag matches get lower weight
  for (const t of tags) {
    if (t.includes(q)) score += 10;
  }

  // Distance-based scoring (closer = higher score)
  if (candidate.distance !== undefined && candidate.distance >= 0) {
    // Boost score based on proximity (max 10 points for very close locations)
    const distanceScore = Math.max(0, 10 - (candidate.distance / 1000)); // 1 point per km closer
    score += distanceScore;
  }

  // Business type matching boost
  if (category && queryWords.some(word => category.includes(word))) {
    score += 5; // Additional boost for category matches
  }

  return Math.round(score * 100) / 100; // Round to 2 decimal places
}

export function sortByRelevance<T extends { relevanceScore: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    // Primary sort by relevance score
    if (b.relevanceScore !== a.relevanceScore) {
      return b.relevanceScore - a.relevanceScore;
    }
    // Secondary sort by name length (shorter names often more relevant)
    const aName = (a as any).name || "";
    const bName = (b as any).name || "";
    return aName.length - bName.length;
  });
}


