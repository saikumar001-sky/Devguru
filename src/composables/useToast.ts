import { readonly, ref } from "vue";

export type ToastKind = "success" | "error" | "info";

export interface Toast {
  id: number;
  kind: ToastKind;
  message: string;
}

const toasts = ref<Toast[]>([]);
let nextId = 0;

function push(kind: ToastKind, message: string, duration = 2800) {
  const id = nextId++;
  toasts.value.push({ id, kind, message });
  window.setTimeout(() => dismiss(id), duration);
}

function dismiss(id: number) {
  toasts.value = toasts.value.filter((toast) => toast.id !== id);
}

export const toast = {
  success: (message: string) => push("success", message),
  error: (message: string) => push("error", message, 4500),
  info: (message: string) => push("info", message),
};

export function useToasts() {
  return { toasts: readonly(toasts), dismiss };
}
