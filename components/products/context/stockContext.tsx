import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Product } from "../../../types/product";
import { useAuth } from "../../auth/hooks/useAuth";

type StockOverrides = Record<string, number>;

function stockKey(scope: string) {
  return `ecommerce.productStockOverrides.v1:${scope}`;
}

type StockContextValue = {
  readonly getStock: (productId: string, fallback: number) => number;
  readonly consume: (productId: string, fallback: number) => boolean; // true if consumed
  readonly restoreMany: (items: Array<Product>) => void;
  readonly restoreOne: (item: Product) => void;
  readonly resetAll: () => void;
};

const StockContext = createContext<StockContextValue | undefined>(undefined);

function loadOverrides(key: string): StockOverrides {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as StockOverrides;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function saveOverrides(key: string, overrides: StockOverrides) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(overrides));
  } catch {
    // ignore
  }
}

export function StockProvider({ children }: { readonly children: React.ReactNode }) {
  const [overrides, setOverrides] = useState<StockOverrides>({});
  const { session } = useAuth();
  const scope = session?.userId ?? "guest";
  const key = stockKey(scope);

  useEffect(() => {
    setOverrides(loadOverrides(key));
  }, [key]);

  const value = useMemo<StockContextValue>(() => {
    const getStock = (productId: string, fallback: number) => {
      const v = overrides[productId];
      return Number.isFinite(v) ? v : fallback;
    };

    const consume = (productId: string, fallback: number) => {
      const current = getStock(productId, fallback);
      if (current <= 0) return false;
      const next = { ...overrides, [productId]: current - 1 };
      setOverrides(next);
      saveOverrides(key, next);
      return true;
    };

    const restoreOne = (item: Product) => {
      const current = getStock(item.id, item.stock);
      const next = { ...overrides, [item.id]: current + 1 };
      setOverrides(next);
      saveOverrides(key, next);
    };

    const restoreMany = (items: Array<Product>) => {
      if (items.length === 0) return;
      const next = { ...overrides };
      for (const it of items) {
        const current = Number.isFinite(next[it.id]) ? (next[it.id] as number) : it.stock;
        next[it.id] = current + 1;
      }
      setOverrides(next);
      saveOverrides(key, next);
    };

    const resetAll = () => {
      setOverrides({});
      if (typeof window !== "undefined") localStorage.removeItem(key);
    };

    return { getStock, consume, restoreMany, restoreOne, resetAll };
  }, [overrides, key]);

  return <StockContext.Provider value={value}>{children}</StockContext.Provider>;
}

export function useStock() {
  const ctx = useContext(StockContext);
  if (!ctx) throw new Error("useStock harus dipakai di dalam StockProvider");
  return ctx;
}

