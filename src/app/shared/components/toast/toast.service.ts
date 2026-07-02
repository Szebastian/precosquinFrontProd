import { Injectable, signal, computed } from '@angular/core';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: { label: string; callback: () => void };
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private _toasts = signal<Toast[]>([]);

  readonly toasts = this._toasts.asReadonly();

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private addToast(type: ToastType, title: string, message?: string, duration = 5000): void {
    const toast: Toast = {
      id: this.generateId(),
      type,
      title,
      message,
      duration
    };

    this._toasts.update(toasts => [...toasts, toast]);

    if (duration > 0) {
      setTimeout(() => this.remove(toast.id), duration);
    }
  }

  success(title: string, message?: string, duration?: number): void {
    this.addToast('success', title, message, duration);
  }

  error(title: string, message?: string, duration?: number): void {
    this.addToast('error', title, message, duration ?? 7000);
  }

  warning(title: string, message?: string, duration?: number): void {
    this.addToast('warning', title, message, duration);
  }

  info(title: string, message?: string, duration?: number): void {
    this.addToast('info', title, message, duration);
  }

  remove(id: string): void {
    this._toasts.update(toasts => toasts.filter(t => t.id !== id));
  }

  clear(): void {
    this._toasts.set([]);
  }
}