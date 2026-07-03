import { Injectable, signal, computed } from '@angular/core';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  action?: { label: string; callback: () => void };
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private _toasts = signal<Toast[]>([]);
  toasts = computed(() => this._toasts());

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private add(toast: Omit<Toast, 'id'>) {
    const id = this.generateId();
    const newToast: Toast = { ...toast, id, duration: toast.duration ?? 5000 };
    this._toasts.update(t => [...t, newToast]);

    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => this.remove(id), newToast.duration);
    }
    return id;
  }

  success(title: string, message?: string, options?: { duration?: number; action?: Toast['action'] }) {
    return this.add({ type: 'success', title, message, ...options });
  }

  error(title: string, message?: string, options?: { duration?: number; action?: Toast['action'] }) {
    return this.add({ type: 'error', title, message, duration: options?.duration ?? 8000, ...options });
  }

  warning(title: string, message?: string, options?: { duration?: number; action?: Toast['action'] }) {
    return this.add({ type: 'warning', title, message, ...options });
  }

  info(title: string, message?: string, options?: { duration?: number; action?: Toast['action'] }) {
    return this.add({ type: 'info', title, message, ...options });
  }

  remove(id: string) {
    this._toasts.update(t => t.filter(x => x.id !== id));
  }

  clear() {
    this._toasts.set([]);
  }
}