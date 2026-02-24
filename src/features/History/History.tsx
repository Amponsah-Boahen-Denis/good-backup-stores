"use client";

import { useEffect, useState } from "react";
import { clearHistory, listHistory, SearchHistoryItem } from "@/services/history";
import { listStores } from "@/services/userStores";
import Button from "@/components/Button";

export default function History() {
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [storesCount, setStoresCount] = useState<number>(0);

  useEffect(() => {
    listHistory().then(setHistory);
    listStores().then((s) => setStoresCount(s.length));
  }, []);

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">History</h1>
        <p className="text-sm text-black/70 dark:text-white/70">Recent searches and your submitted stores.</p>
      </header>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Recent searches</h2>
          {history.length > 0 && (
            <Button variant="secondary" onClick={async () => { await clearHistory(); setHistory([]); }}>Clear history</Button>
          )}
        </div>
        {history.length === 0 ? (
          <p className="text-sm text-black/60 dark:text-white/60">No searches yet.</p>
        ) : (
          <ul className="divide-y divide-black/10 dark:divide-white/15 rounded-md border border-black/10 dark:border-white/15">
            {history.map((h) => (
              <li key={h.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-sm"><span className="font-medium">{h.product}</span> · {h.country || "(no country)"} · {h.location || "(no city)"}</p>
                    <p className="text-xs text-black/60 dark:text-white/60">{new Date(h.createdAt).toLocaleString()} · {h.resultsCount} result(s)</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Your submitted stores</h2>
        <p className="text-sm text-black/60 dark:text-white/60">Total: {storesCount}</p>
      </section>
    </main>
  );
}



