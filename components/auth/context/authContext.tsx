import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Session, User } from "../types";
import { loadSession, loadUsers, saveSession, saveUsers } from "../storage";

type AuthState = {
  readonly session: Session | null;
  readonly isLoggedIn: boolean;
};

type AuthActions = {
  readonly register: (input: { phone: string; password: string }) => { ok: true } | { ok: false; message: string };
  readonly login: (input: { phone: string; password: string }) => { ok: true } | { ok: false; message: string };
  readonly logout: () => void;
};

type AuthContextValue = AuthState & AuthActions;

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function normalizePhone(phone: string) {
  return phone.replace(/\s+/g, "").replace(/^\+62/, "0");
}

function isValidPhone(phone: string) {
  const p = normalizePhone(phone);
  return /^0\d{9,14}$/.test(p);
}

function isValidPassword(password: string) {
  return password.length >= 6;
}

export function AuthProvider({ children }: { readonly children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [users, setUsers] = useState<Array<User>>([]);

  useEffect(() => {
    setUsers(loadUsers());
    setSession(loadSession());
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    const register: AuthActions["register"] = ({ phone, password }) => {
      const p = normalizePhone(phone);
      if (!isValidPhone(p)) return { ok: false, message: "Nomor telepon tidak valid." };
      if (!isValidPassword(password)) return { ok: false, message: "Password minimal 6 karakter." };
      if (users.some((u) => u.phone === p)) return { ok: false, message: "Nomor telepon sudah terdaftar." };

      const user: User = { id: `u-${Date.now()}`, phone: p, password, createdAt: Date.now() };
      const nextUsers = [user, ...users];
      setUsers(nextUsers);
      saveUsers(nextUsers);

      const nextSession: Session = { userId: user.id, phone: user.phone, createdAt: Date.now() };
      setSession(nextSession);
      saveSession(nextSession);
      return { ok: true };
    };

    const login: AuthActions["login"] = ({ phone, password }) => {
      const p = normalizePhone(phone);
      const user = users.find((u) => u.phone === p);
      if (!user) return { ok: false, message: "Akun tidak ditemukan. Silakan daftar." };
      if (user.password !== password) return { ok: false, message: "Password salah." };

      const nextSession: Session = { userId: user.id, phone: user.phone, createdAt: Date.now() };
      setSession(nextSession);
      saveSession(nextSession);
      return { ok: true };
    };

    const logout = () => {
      setSession(null);
      saveSession(null);
    };

    return {
      session,
      isLoggedIn: Boolean(session),
      register,
      login,
      logout,
    };
  }, [session, users]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth harus dipakai di dalam AuthProvider");
  return ctx;
}

