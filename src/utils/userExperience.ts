// User experience enhancements for search functionality

export interface SearchHistoryEntry {
  id: string;
  query: string;
  country: string;
  location: string;
  resultCount: number;
  timestamp: number;
  wasSuccessful: boolean;
}

export interface SavedSearch {
  id: string;
  name: string;
  query: string;
  country: string;
  location: string;
  filters: any;
  createdAt: number;
  lastUsed?: number;
  useCount: number;
}

export interface UserPreferences {
  defaultCountry?: string;
  defaultLocation?: string;
  preferredLayout: 'grid' | 'list';
  maxResults: number;
  autoSuggestions: boolean;
  searchHistoryEnabled: boolean;
  theme: 'light' | 'dark' | 'auto';
  language: string;
}

export class SearchHistoryManager {
  private static readonly STORAGE_KEY = 'search_history';
  private static readonly MAX_ENTRIES = 50;

  // Add a search to history
  static addEntry(entry: Omit<SearchHistoryEntry, 'id' | 'timestamp'>): void {
    const history = this.getHistory();
    const newEntry: SearchHistoryEntry = {
      ...entry,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: Date.now()
    };

    // Add to beginning of array
    history.unshift(newEntry);

    // Keep only the most recent entries
    const trimmed = history.slice(0, this.MAX_ENTRIES);

    // Remove duplicates (same query, country, location within last hour)
    const filtered = trimmed.filter((item, index) => {
      if (index === 0) return true; // Keep the first (newest) entry
      const timeDiff = Math.abs(item.timestamp - newEntry.timestamp);
      const isDuplicate = item.query === newEntry.query &&
                         item.country === newEntry.country &&
                         item.location === newEntry.location &&
                         timeDiff < 3600000; // 1 hour
      return !isDuplicate;
    });

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
  }

  // Get search history
  static getHistory(): SearchHistoryEntry[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  // Clear search history
  static clearHistory(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  // Get recent searches (last N searches)
  static getRecentSearches(limit: number = 10): SearchHistoryEntry[] {
    return this.getHistory().slice(0, limit);
  }

  // Get popular search terms
  static getPopularTerms(limit: number = 10): Array<{ term: string; count: number }> {
    const history = this.getHistory();
    const termCounts = new Map<string, number>();

    history.forEach(entry => {
      const term = entry.query.toLowerCase().trim();
      termCounts.set(term, (termCounts.get(term) || 0) + 1);
    });

    return Array.from(termCounts.entries())
      .map(([term, count]) => ({ term, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  // Search history by query
  static searchHistory(query: string): SearchHistoryEntry[] {
    const history = this.getHistory();
    const searchTerm = query.toLowerCase().trim();

    return history.filter(entry =>
      entry.query.toLowerCase().includes(searchTerm) ||
      entry.country.toLowerCase().includes(searchTerm) ||
      entry.location.toLowerCase().includes(searchTerm)
    );
  }
}

export class SavedSearchesManager {
  private static readonly STORAGE_KEY = 'saved_searches';

  // Save a search
  static saveSearch(search: Omit<SavedSearch, 'id' | 'createdAt' | 'useCount'>): string {
    const searches = this.getSavedSearches();
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);

    const newSearch: SavedSearch = {
      ...search,
      id,
      createdAt: Date.now(),
      useCount: 0
    };

    searches.push(newSearch);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(searches));

    return id;
  }

  // Get all saved searches
  static getSavedSearches(): SavedSearch[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  // Get a specific saved search
  static getSavedSearch(id: string): SavedSearch | null {
    const searches = this.getSavedSearches();
    return searches.find(search => search.id === id) || null;
  }

  // Update a saved search (increment use count)
  static useSavedSearch(id: string): void {
    const searches = this.getSavedSearches();
    const search = searches.find(s => s.id === id);

    if (search) {
      search.lastUsed = Date.now();
      search.useCount++;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(searches));
    }
  }

  // Delete a saved search
  static deleteSavedSearch(id: string): void {
    const searches = this.getSavedSearches().filter(search => search.id !== id);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(searches));
  }

  // Get most used saved searches
  static getMostUsed(limit: number = 5): SavedSearch[] {
    return this.getSavedSearches()
      .sort((a, b) => b.useCount - a.useCount)
      .slice(0, limit);
  }

  // Get recently used saved searches
  static getRecentlyUsed(limit: number = 5): SavedSearch[] {
    return this.getSavedSearches()
      .filter(search => search.lastUsed)
      .sort((a, b) => (b.lastUsed || 0) - (a.lastUsed || 0))
      .slice(0, limit);
  }
}

export class UserPreferencesManager {
  private static readonly STORAGE_KEY = 'user_preferences';
  private static readonly DEFAULT_PREFERENCES: UserPreferences = {
    preferredLayout: 'list',
    maxResults: 20,
    autoSuggestions: true,
    searchHistoryEnabled: true,
    theme: 'auto',
    language: 'en'
  };

  // Get user preferences
  static getPreferences(): UserPreferences {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? { ...this.DEFAULT_PREFERENCES, ...JSON.parse(stored) } : this.DEFAULT_PREFERENCES;
    } catch {
      return this.DEFAULT_PREFERENCES;
    }
  }

  // Update user preferences
  static updatePreferences(updates: Partial<UserPreferences>): void {
    const current = this.getPreferences();
    const updated = { ...current, ...updates };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
  }

  // Reset to defaults
  static resetPreferences(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  // Get preferred layout
  static getPreferredLayout(): 'grid' | 'list' {
    return this.getPreferences().preferredLayout;
  }

  // Set preferred layout
  static setPreferredLayout(layout: 'grid' | 'list'): void {
    this.updatePreferences({ preferredLayout: layout });
  }

  // Check if auto-suggestions are enabled
  static areAutoSuggestionsEnabled(): boolean {
    return this.getPreferences().autoSuggestions;
  }

  // Check if search history is enabled
  static isSearchHistoryEnabled(): boolean {
    return this.getPreferences().searchHistoryEnabled;
  }

  // Get max results preference
  static getMaxResults(): number {
    return this.getPreferences().maxResults;
  }

  // Get theme preference
  static getTheme(): 'light' | 'dark' | 'auto' {
    return this.getPreferences().theme;
  }
}

// Quick access functions for common operations
export const addToSearchHistory = SearchHistoryManager.addEntry;
export const getSearchHistory = SearchHistoryManager.getHistory;
export const getRecentSearches = SearchHistoryManager.getRecentSearches;
export const getPopularSearchTerms = SearchHistoryManager.getPopularTerms;

export const saveSearch = SavedSearchesManager.saveSearch;
export const getSavedSearches = SavedSearchesManager.getSavedSearches;
export const useSavedSearch = SavedSearchesManager.useSavedSearch;

export const getUserPreferences = UserPreferencesManager.getPreferences;
export const updateUserPreferences = UserPreferencesManager.updatePreferences;
export const getPreferredLayout = UserPreferencesManager.getPreferredLayout;
export const setPreferredLayout = UserPreferencesManager.setPreferredLayout;