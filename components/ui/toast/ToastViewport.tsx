import { useToast } from "./ToastContext";

export function ToastViewport() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="pointer-events-none fixed right-4 top-20 z-50 flex w-[320px] flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 shadow-lg"
          role="status"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="font-medium">{t.message}</div>
            <button
              type="button"
              className="text-gray-400 hover:text-gray-700"
              onClick={() => removeToast(t.id)}
              aria-label="Tutup"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

