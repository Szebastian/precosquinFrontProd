import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  template: `
    <div class="empty-container">
      <div class="empty-icon-wrap">
        <svg [attr.width]="iconSize()" [attr.height]="iconSize()" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          @switch (icon()) {
            @case ('calendar') {
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            }
            @case ('music') {
              <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
            }
            @case ('search') {
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            }
            @default {
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            }
          }
        </svg>
      </div>
      <h3 class="empty-title">{{ title() }}</h3>
      <p class="empty-desc">{{ description() }}</p>
      @if (actionLabel()) {
        <button class="empty-action" (click)="actionClick.emit()">
          {{ actionLabel() }}
        </button>
      }
    </div>
  `,
  styles: [`
    .empty-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: var(--space-12) var(--space-6);
      min-height: 300px;
    }
    .empty-icon-wrap {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: rgba(76, 139, 230, 0.08);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: var(--space-5);
      color: var(--brand-400);
    }
    .empty-title {
      font-size: var(--text-lg);
      font-weight: var(--weight-semibold);
      color: var(--gray-800);
      margin: 0 0 var(--space-2);
    }
    .empty-desc {
      font-size: var(--text-sm);
      color: var(--gray-500);
      margin: 0 0 var(--space-6);
      max-width: 360px;
      line-height: 1.6;
    }
    .empty-action {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 10px 20px;
      font-size: var(--text-sm);
      font-weight: var(--weight-semibold);
      color: var(--brand-600);
      background: rgba(76, 139, 230, 0.08);
      border: 1px solid rgba(76, 139, 230, 0.2);
      border-radius: 999px;
      cursor: pointer;
      transition: all 0.15s ease;
      min-height: 48px;
    }
    .empty-action:hover {
      background: rgba(76, 139, 230, 0.15);
    }
  `]
})
export class EmptyStateComponent {
  title = input.required<string>();
  description = input.required<string>();
  icon = input<'calendar' | 'music' | 'search'>('calendar');
  iconSize = input(48);
  actionLabel = input<string>('');
  actionClick = output<void>();
}
