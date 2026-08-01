import { Component, ChangeDetectionStrategy, input } from '@angular/core';

@Component({
  selector: 'app-mobile-empty-state',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="empty-state">
      <div class="empty-icon" [innerHTML]="icon()"></div>
      <h3 class="empty-title">{{ title() }}</h3>
      <p class="empty-description">{{ description() }}</p>
      @if (actionLabel()) {
        <button class="empty-action">
          {{ actionLabel() }}
        </button>
      }
    </div>
  `,
  styles: [`
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 24px;
      text-align: center;
    }

    .empty-icon {
      width: 64px;
      height: 64px;
      border-radius: 20px;
      background: rgba(201, 168, 125, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 20px;
    }

    .empty-icon svg {
      width: 32px;
      height: 32px;
      stroke: #c9a87d;
      fill: none;
      stroke-width: 1.5;
    }

    .empty-title {
      font-size: 18px;
      font-weight: 600;
      color: #ffffff;
      margin: 0 0 8px;
    }

    .empty-description {
      font-size: 14px;
      color: #7b8395;
      margin: 0 0 20px;
      max-width: 280px;
      line-height: 1.5;
    }

    .empty-action {
      border: none;
      border-radius: 12px;
      padding: 12px 24px;
      font-size: 14px;
      font-weight: 600;
      color: #0e0f12;
      background: #c9a87d;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .empty-action:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(201, 168, 125, 0.3);
    }
  `],
})
export class MobileEmptyStateComponent {
  title = input('Sin contenido');
  description = input('No hay información disponible en este momento');
  icon = input(
    '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M8 15h8M9 9h.01M15 9h.01"/></svg>'
  );
  actionLabel = input('');
}