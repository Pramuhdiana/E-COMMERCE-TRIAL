import type { Session, User } from "./types";
import { USERS as SEEDED_USERS } from "../../data/users";

const LS_USERS = "ecommerce.users.v1";
const LS_SESSION = "ecommerce.session.v1";

function safeJsonParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function loadUsers(): Array<User> {
  if (typeof window === "undefined") return [];
  const parsed = safeJsonParse<Array<User>>(localStorage.getItem(LS_USERS));
  if (Array.isArray(parsed)) return parsed;
  // Seed awal dari file `data/users.ts` (sekali, ketika localStorage belum ada).
  const initial = Array.isArray(SEEDED_USERS) ? [...SEEDED_USERS] : [];
  localStorage.setItem(LS_USERS, JSON.stringify(initial));
  return initial;
}

export function saveUsers(users: Array<User>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_USERS, JSON.stringify(users));
}

export function loadSession(): Session | null {
  if (typeof window === "undefined") return null;
  const parsed = safeJsonParse<Session>(localStorage.getItem(LS_SESSION));
  if (!parsed) return null;
  if (typeof parsed.userId !== "string" || typeof parsed.phone !== "string") return null;
  return parsed;
}

export function saveSession(session: Session | null) {
  if (typeof window === "undefined") return;
  if (!session) {
    localStorage.removeItem(LS_SESSION);
    return;
  }
  localStorage.setItem(LS_SESSION, JSON.stringify(session));
}

