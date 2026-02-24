import { StoreSubmission } from "@/services/userStores";

export type StoreStatus = "pending" | "approved" | "rejected";

export type ModeratedStore = StoreSubmission & {
  status: StoreStatus;
  moderatedBy?: string;
  moderatedAt?: number;
  rejectionReason?: string;
};

const STORAGE_KEY = "admin:moderated-stores";
import { safeGet, safeParse, safeWriteJSON } from "@/services/storage";

function readAll(): ModeratedStore[] {
  if (typeof window === "undefined") return [];
  const raw = safeGet(STORAGE_KEY);
  return safeParse<ModeratedStore[]>(raw, []);
}

function writeAll(stores: ModeratedStore[]) {
  if (typeof window === "undefined") return;
  safeWriteJSON(STORAGE_KEY, stores);
}

export async function getPendingStores(): Promise<ModeratedStore[]> {
  const stores = readAll();
  return stores.filter(s => s.status === "pending");
}

export async function getAllModeratedStores(): Promise<ModeratedStore[]> {
  return readAll();
}

export async function approveStore(storeId: string, adminId: string): Promise<void> {
  const stores = readAll();
  const idx = stores.findIndex(s => s.id === storeId);
  if (idx === -1) return;

  stores[idx] = {
    ...stores[idx],
    status: "approved",
    moderatedBy: adminId,
    moderatedAt: Date.now(),
    rejectionReason: undefined,
  };
  writeAll(stores);
}

export async function rejectStore(storeId: string, adminId: string, reason: string): Promise<void> {
  const stores = readAll();
  const idx = stores.findIndex(s => s.id === storeId);
  if (idx === -1) return;

  stores[idx] = {
    ...stores[idx],
    status: "rejected",
    moderatedBy: adminId,
    moderatedAt: Date.now(),
    rejectionReason: reason,
  };
  writeAll(stores);
}

export async function submitStoreForModeration(store: StoreSubmission): Promise<void> {
  const stores = readAll();
  const moderated: ModeratedStore = {
    ...store,
    status: "pending",
  };
  stores.push(moderated);
  writeAll(stores);
}

export function getModerationStats(): { pending: number; approved: number; rejected: number; total: number } {
  const stores = readAll();
  return {
    pending: stores.filter(s => s.status === "pending").length,
    approved: stores.filter(s => s.status === "approved").length,
    rejected: stores.filter(s => s.status === "rejected").length,
    total: stores.length,
  };
}