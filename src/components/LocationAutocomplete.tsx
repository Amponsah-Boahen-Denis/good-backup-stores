"use client";

import { useEffect, useMemo, useState } from "react";
import { geocodeLocation } from "@/services/openstreet";

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
};

export default function LocationAutocomplete({ value, onChange, placeholder = "City or address", id }: Props) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    geocodeLocation(query)
      .then((results) => {
        if (cancelled) return;
        setSuggestions(results.slice(0, 5).map((r) => r.display_name));
      })
      .catch(() => {
        if (cancelled) return;
        setError("Failed to fetch suggestions");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [query]);

  const listId = useMemo(() => `${id || "location"}-listbox`, [id]);

  return (
    <div className="flex flex-col gap-1 relative">
      <label htmlFor={id} className="text-sm font-medium">City / Address</label>
      <input
        id={id}
        aria-label="City or address"
        aria-autocomplete="list"
        aria-controls={listId}
        aria-expanded={suggestions.length > 0}
        role="combobox"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onBlur={() => onChange(query)}
        placeholder={placeholder}
        className="h-10 rounded-xl border border-sky-200 bg-white/80 px-3 text-sm text-slate-900 placeholder:text-slate-400 transition duration-200 ease-out focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
      />
      {loading && <div className="absolute top-full left-0 mt-1 text-xs">Loading...</div>}
      {error && <div role="alert" className="absolute top-full left-0 mt-1 text-xs text-red-600">{error}</div>}
      {suggestions.length > 0 && (
        <ul id={listId} role="listbox" className="absolute top-full left-0 mt-1 w-full bg-white dark:bg-black border border-black/10 dark:border-white/15 rounded-md shadow">
          {suggestions.map((s) => (
            <li key={s} role="option" aria-selected={false}>
              <button
                type="button"
                className="w-full text-left px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => { onChange(s); setQuery(s); setSuggestions([]); }}
              >
                {s}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}


