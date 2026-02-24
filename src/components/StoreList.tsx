"use client";

import Image from "next/image";
import Button from "@/components/Button";
import { StoreSubmission } from "@/services/userStores";

type Props = {
  items: StoreSubmission[];
  onEdit: (item: StoreSubmission) => void;
  onDelete: (id: string) => void;
};

export default function StoreList({ items, onEdit, onDelete }: Props) {
  if (!items.length) {
    return <p className="text-sm text-black/60 dark:text-white/60">You have not added any stores yet.</p>;
  }
  return (
    <ul className="divide-y divide-black/10 dark:divide-white/15 rounded-md border border-black/10 dark:border-white/15">
      {items.map((s) => (
        <li key={s.id} className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex gap-3 flex-1">
              {s.logo && (
                <Image
                  src={s.logo}
                  alt={`${s.name} logo`}
                  width={48}
                  height={48}
                  className="w-12 h-12 object-contain rounded flex-shrink-0"
                />
              )}
              <div className="space-y-1 flex-1">
                <h3 className="font-medium">{s.name}</h3>
                <p className="text-xs text-black/70 dark:text-white/70">{s.address}</p>
                <p className="text-xs text-black/60 dark:text-white/60">{s.country}</p>
                <div className="text-xs text-black/60 dark:text-white/60 space-y-1">
                  {s.website && <div>🌐 <a className="underline text-blue-600 dark:text-blue-400" href={s.website} target="_blank" rel="noopener noreferrer">Website</a></div>}
                  {s.email && <div>✉️ {s.email}</div>}
                  {s.phone && <div>📞 {s.phone}</div>}
                  {s.lat && s.lon && <div>📍 {s.lat.toFixed(4)}, {s.lon.toFixed(4)}</div>}
                </div>
              </div>
            </div>
            <div className="shrink-0 flex items-center gap-2">
              <Button variant="secondary" onClick={() => onEdit(s)}>Edit</Button>
              <Button onClick={() => onDelete(s.id)}>Delete</Button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}


