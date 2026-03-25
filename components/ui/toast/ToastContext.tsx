import { createContext, useContext, useMemo, useState } from "react";

type Toast = {
  readonly id: string;
  readonly message: string;
};

type ToastContextValue = {
  readonly toasts: ReadonlyArray<Toast>;
  readonly pushToast: (message: string) => void;
  readonly removeToast: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { readonly children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ReadonlyArray<Toast>>([]);

  const value = useMemo<ToastContextValue>(() => {
    const removeToast = (id: string) => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    const pushToast = (message: string) => {
      const id = `t-${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const toast: Toast = { id, message };
      setToasts((prev) => [toast, ...prev].slice(0, 5));
      window.setTimeout(() => removeToast(id), 2500);
    };

    return { toasts, pushToast, removeToast };
  }, [toasts]);

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast harus dipakai di dalam ToastProvider");
  return ctx;
}

