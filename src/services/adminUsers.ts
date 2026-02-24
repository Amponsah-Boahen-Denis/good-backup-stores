import { AppUser, UserStatus } from "@/types/user";

const STORAGE_KEY = "admin:users";
import { safeGet, safeParse, safeWriteJSON } from "@/services/storage";

function readAll(): AppUser[] {
  if (typeof window === "undefined") return [];
  const raw = safeGet(STORAGE_KEY);
  return safeParse<AppUser[]>(raw, []);
}

function writeAll(users: AppUser[]) {
  if (typeof window === "undefined") return;
  safeWriteJSON(STORAGE_KEY, users);
}

export async function listUsers(): Promise<AppUser[]> {
  return readAll();
}

export async function upsertUser(input: Omit<AppUser, "id" | "createdAt" | "updatedAt"> & { id?: string }): Promise<AppUser> {
  const users = readAll();
  const now = Date.now();
  if (input.id) {
    const idx = users.findIndex((u) => u.id === input.id);
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...input, id: input.id, updatedAt: now } as AppUser;
      writeAll(users);
      return users[idx];
    }
  }
  const created: AppUser = {
    id: crypto.randomUUID(),
    name: input.name,
    email: input.email,
    status: input.status as UserStatus,
    createdAt: now,
    updatedAt: now,
  };
  users.unshift(created);
  writeAll(users);
  return created;
}

export async function setUserStatus(id: string, status: UserStatus): Promise<void> {
  const users = readAll();
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) return;
  users[idx] = { ...users[idx], status, updatedAt: Date.now() };
  writeAll(users);
}

export async function stats(): Promise<{ total: number; blocked: number; onHold: number; active: number; registeredToday: number; }>{
  const users = readAll();
  const total = users.length;
  const blocked = users.filter((u) => u.status === "blocked").length;
  const onHold = users.filter((u) => u.status === "on_hold").length;
  const active = users.filter((u) => u.status === "active").length;
  const startOfDay = new Date(); startOfDay.setHours(0,0,0,0);
  const registeredToday = users.filter((u) => u.createdAt >= startOfDay.getTime()).length;
  return { total, blocked, onHold, active, registeredToday };
}

export async function setUserPlan(id: string, planType: "starter" | "pro" | "business"): Promise<void> {
  const users = readAll();
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) return;
  users[idx] = { ...users[idx], planType, updatedAt: Date.now() };
  writeAll(users);
}

export async function deleteUser(id: string): Promise<void> {
  const users = readAll();
  const filtered = users.filter((u) => u.id !== id);
  writeAll(filtered);
}


