"use client";
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";

interface ToastItem {
  id: string;
  message: string;
  type?: "info" | "success" | "error";
}
interface ToastCtx {
  push: (msg: string, type?: ToastItem["type"]) => void;
}
const ToastContext = createContext<ToastCtx | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const push = useCallback(
    (message: string, type: ToastItem["type"] = "info") => {
      const id = Math.random().toString(36).slice(2);
      setItems((prev) => [...prev, { id, message, type }]);
      setTimeout(
        () => setItems((prev) => prev.filter((t) => t.id !== id)),
        4000
      );
    },
    []
  );
  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div style={wrap} aria-live="polite" aria-atomic="true">
        {items.map((t) => (
          <div key={t.id} style={toastStyle(t.type)}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be inside ToastProvider");
  return ctx;
}

const wrap: React.CSSProperties = {
  position: "fixed",
  top: 16,
  right: 16,
  display: "flex",
  flexDirection: "column",
  gap: 10,
  zIndex: 9999,
  pointerEvents: "none",
};
const toastStyle = (type?: string): React.CSSProperties => ({
  background:
    type === "success"
      ? "linear-gradient(135deg,#16a34a,#22c55e)"
      : type === "error"
      ? "linear-gradient(135deg,#dc2626,#ef4444)"
      : "linear-gradient(135deg,#334155,#475569)",
  color: "#fff",
  fontSize: 13,
  padding: "10px 14px",
  borderRadius: 12,
  boxShadow: "0 4px 16px -4px rgba(0,0,0,0.5)",
  pointerEvents: "auto",
  minWidth: 200,
});
