import { SearchResult } from "@/services/openstreet";
import Image from "next/image";
import { trackStoreClick } from "@/services/businessAnalytics";

type Props = {
  items: SearchResult[];
  layout: "grid" | "list";
};

export default function ResultsList({ items, layout }: Props) {
  const handleStoreInteraction = (storeId: string) => {
    trackStoreClick(storeId);
  };
  if (!items || items.length === 0) {
    return <p className="text-sm text-black/60 dark:text-white/60">No stores found.</p>;
  }
  if (layout === "grid") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((p) => (
          <article key={p.id} className="rounded-md border border-black/10 dark:border-white/15 p-4">
            {p.logo && (
              <Image
                src={p.logo}
                alt={`${p.name} logo`}
                width={48}
                height={48}
                className="w-12 h-12 object-contain mb-2 rounded"
              />
            )}
            <h3 className="font-medium text-base">{p.name}</h3>
            <p className="text-xs text-black/70 dark:text-white/70 mt-1">{p.address || "Address not available"}</p>
            <div className="mt-3 text-xs text-black/60 dark:text-white/60 space-y-1">
              {p.phone && <p>📞 {p.phone}</p>}
              {p.email && <p>✉️ {p.email}</p>}
              {p.website && (
                <p>
                  🌐 <a className="underline text-blue-600 dark:text-blue-400 hover:no-underline" href={p.website} target="_blank" rel="noopener noreferrer" onClick={() => handleStoreInteraction(p.id)}>Visit website</a>
                </p>
              )}
            </div>
            {(p.lat && p.lon) && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">📍 {p.lat.toFixed(4)}, {p.lon.toFixed(4)}</p>
            )}
          </article>
        ))}
      </div>
    );
  }
  return (
    <ul className="divide-y divide-black/10 dark:divide-white/15 rounded-md border border-black/10 dark:border-white/15">
      {items.map((p) => (
        <li key={p.id} className="p-4">
          <div className="flex gap-3">
            {p.logo && (
              <Image
                src={p.logo}
                alt={`${p.name} logo`}
                width={48}
                height={48}
                className="w-12 h-12 object-contain rounded flex-shrink-0"
              />
            )}
            <div className="flex-1">
              <h3 className="font-medium text-base">{p.name}</h3>
              <p className="text-xs text-black/70 dark:text-white/70 mt-1">{p.address || "Address not available"}</p>
              <div className="mt-2 text-xs text-black/60 dark:text-white/60 space-y-1">
                {p.phone && <p>📞 {p.phone}</p>}
                {p.email && <p>✉️ {p.email}</p>}
                {p.website && (
                  <p>
                    🌐 <a className="underline text-blue-600 dark:text-blue-400 hover:no-underline" href={p.website} target="_blank" rel="noopener noreferrer" onClick={() => handleStoreInteraction(p.id)}>Visit website</a>
                  </p>
                )}
              </div>
              {(p.lat && p.lon) && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">📍 {p.lat.toFixed(4)}, {p.lon.toFixed(4)}</p>
              )}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}


