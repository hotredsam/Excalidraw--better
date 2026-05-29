export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

type Listener = (toasts: Toast[]) => void;

let toasts: Toast[] = [];
const listeners = new Set<Listener>();
let nextId = 1;

function emit() {
  for (const l of listeners) l(toasts);
}

export function subscribeToasts(listener: Listener): () => void {
  listeners.add(listener);
  listener(toasts);
  return () => listeners.delete(listener);
}

export function notify(message: string, type: ToastType = 'info', ttl = 3500) {
  const id = nextId++;
  toasts = [...toasts, { id, message, type }];
  emit();
  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id);
    emit();
  }, ttl);
}

export const toastSuccess = (m: string) => notify(m, 'success');
export const toastError = (m: string) => notify(m, 'error', 5000);
export const toastInfo = (m: string) => notify(m, 'info');
