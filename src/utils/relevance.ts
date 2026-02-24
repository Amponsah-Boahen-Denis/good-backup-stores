export type Scored<T> = T & { relevanceScore: number };

export function scoreRelevance(query: string, candidate: { name?: string; tags?: string[]; category?: string | null }): number {
  const q = (query || "").toLowerCase().trim();
  if (!q) return 0;
  let score = 0;
  const name = (candidate.name || "").toLowerCase();
  const category = (candidate.category || "").toLowerCase();
  const tags = (candidate.tags || []).map((t) => (t || "").toLowerCase());

  // Exact starts-with boost
  if (name.startsWith(q)) score += 50;
  // Substring match
  if (name.includes(q)) score += 30;
  // Category match
  if (category && q && category.includes(q)) score += 15;
  // Tag matches
  for (const t of tags) if (t.includes(q)) score += 10;

  return score;
}

export function sortByRelevance<T extends { relevanceScore: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => b.relevanceScore - a.relevanceScore);
}


