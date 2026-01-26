"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info";

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  push: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const push = useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const success = useCallback((message: string) => push(message, "success"), [push]);
  const error = useCallback((message: string) => push(message, "error"), [push]);
  const warning = useCallback((message: string) => push(message, "warning"), [push]);
  const info = useCallback((message: string) => push(message, "info"), [push]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ push, success, error, warning, info }}>
      {children}
      <div style={styles.container}>
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onDismiss={() => dismiss(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

interface ToastProps {
  toast: ToastItem;
  onDismiss: () => void;
}

export function Toast({ toast, onDismiss }: ToastProps) {
  const icons = {
    success: <CheckCircle size={20} color="#166534" />,
    error: <AlertCircle size={20} color="#991b1b" />,
    warning: <AlertTriangle size={20} color="#92400e" />,
    info: <Info size={20} color="#1e40af" />,
  };

  const bgColors = {
    success: "#dcfce7",
    error: "#fee2e2",
    warning: "#fef3c7",
    info: "#dbeafe",
  };

  const borderColors = {
    success: "#86efac",
    error: "#fca5a5",
    warning: "#fcd34d",
    info: "#93c5fd",
  };

  return (
    <div
      style={{
        ...styles.toast,
        backgroundColor: bgColors[toast.type],
        borderColor: borderColors[toast.type],
      }}
    >
      {icons[toast.type]}
      <span style={styles.message}>{toast.message}</span>
      <button onClick={onDismiss} style={styles.dismiss}>
        <X size={16} />
      </button>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: "fixed",
    bottom: "1rem",
    right: "1rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    zIndex: 9999,
  },
  toast: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    padding: "0.75rem 1rem",
    borderRadius: "0.5rem",
    border: "1px solid",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    minWidth: "280px",
    maxWidth: "400px",
  },
  message: {
    flex: 1,
    fontSize: "0.875rem",
    color: "#111827",
  },
  dismiss: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "0.25rem",
    color: "#6b7280",
    display: "flex",
    alignItems: "center",
  },
};
