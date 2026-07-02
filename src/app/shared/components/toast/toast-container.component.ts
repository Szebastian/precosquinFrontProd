import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from './toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container" aria-live="polite" aria-atomic="true">
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          class="toast animate-slide-in-right"
          [ngClass]="{
            'toast-success': toast.type === 'success',
            'toast-error': toast.type === 'error',
            'toast-warning': toast.type === 'warning',
            'toast-info': toast.type === 'info'
          }"
          role="alert"
        >
          <div class="toast-icon">
            @switch (toast.type) {
              @case ('success') {
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              }
              @case ('error') {
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" x2="9" y1="9" y2="15"/><line x1="9" x2="15" y1="9" y2="15"/></svg>
              }
              @case ('warning') {
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>
              }
              @case ('info') {
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="16" y2="12"/><line x1="12" x2="12.01" y1="8" y2="8"/></svg>
              }
            }
          </div>
          <div class="toast-content">
            <p class="toast-title">{{ toast.title }}</p>
            @if (toast.message) {
              <p class="toast-message">{{ toast.message }}</p>
            }
            @if (toast.action) {
              <button
                (click)="handleAction(toast)"
                class="toast-action"
              >
                {{ toast.action.label }}
              </button>
            }
          </div>
          <button
            (click)="toastService.remove(toast.id)"
            class="toast-close"
            aria-label="Cerrar notificacion"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: var(--space-4);
      right: var(--space-4);
      z-index: var(--z-toast);
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
      width: 100%;
      max-width: 380px;
    }

    .toast {
      display: flex;
      align-items: flex-start;
      gap: var(--space-3);
      padding: var(--space-4);
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-lg);
      border: 1px solid;
    }

    .toast-success {
      background-color: var(--success-50);
      border-color: var(--success-100);
      color: var(--success-700);
    }

    .toast-error {
      background-color: var(--danger-50);
      border-color: var(--danger-100);
      color: var(--danger-700);
    }

    .toast-warning {
      background-color: var(--warning-50);
      border-color: var(--warning-100);
      color: var(--warning-700);
    }

    .toast-info {
      background-color: var(--info-50);
      border-color: var(--info-100);
      color: var(--info-700);
    }

    .toast-icon {
      flex-shrink: 0;
      margin-top: 1px;
    }

    .toast-content {
      flex: 1;
      min-width: 0;
    }

    .toast-title {
      font-size: var(--text-sm);
      font-weight: var(--weight-semibold);
    }

    .toast-message {
      font-size: var(--text-xs);
      opacity: 0.85;
      margin-top: 2px;
    }

    .toast-action {
      margin-top: var(--space-2);
      font-size: var(--text-xs);
      font-weight: var(--weight-semibold);
      color: inherit;
      background: none;
      border: none;
      cursor: pointer;
      text-decoration: underline;
      padding: 0;
    }

    .toast-action:hover {
      opacity: 0.7;
    }

    .toast-close {
      flex-shrink: 0;
      opacity: 0.5;
      background: none;
      border: none;
      color: inherit;
      cursor: pointer;
      padding: 2px;
      transition: opacity var(--transition-fast);
    }

    .toast-close:hover {
      opacity: 1;
    }
  `]
})
export class ToastContainerComponent {
  toastService = inject(ToastService);

  handleAction(toast: Toast): void {
    toast.action?.callback();
    this.toastService.remove(toast.id);
  }
}
