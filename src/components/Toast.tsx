import { create } from "zustand";
import { useEffect } from "react";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";
import styles from "./Toast.module.css";

type ToastKind = "info" | "success" | "warn" | "error";

interface Toast {
  id: string;
  kind: ToastKind;
  text: string;
}

interface ToastState {
  toasts: Toast[];
  push: (kind: ToastKind, text: string) => void;
  dismiss: (id: string) => void;
}

const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  push: (kind, text) => {
    const id = Math.random().toString(36).slice(2);
    set({ toasts: [...get().toasts, { id, kind, text }] });
    setTimeout(() => get().dismiss(id), 4500);
  },
  dismiss: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
}));

export const toast = {
  info: (text: string) => useToastStore.getState().push("info", text),
  success: (text: string) => useToastStore.getState().push("success", text),
  warn: (text: string) => useToastStore.getState().push("warn", text),
  error: (text: string) => useToastStore.getState().push("error", text),
};

const icons = {
  info: Info,
  success: CheckCircle2,
  warn: AlertTriangle,
  error: AlertTriangle,
};

export function ToastHost() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  useEffect(() => {
    // empty effect to keep hooks consistent if list changes
  }, [toasts]);

  return (
    <div className={styles.host}>
      {toasts.map((t) => {
        const Icon = icons[t.kind];
        return (
          <div key={t.id} className={`${styles.toast} ${styles[t.kind]}`}>
            <Icon size={18} />
            <div className={styles.text}>{t.text}</div>
            <button
              className={styles.close}
              aria-label="Dismiss"
              onClick={() => dismiss(t.id)}
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
