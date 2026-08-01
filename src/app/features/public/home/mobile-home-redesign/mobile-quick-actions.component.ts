import {
  Component,
  ChangeDetectionStrategy,
  input,
} from '@angular/core';

interface QuickAction {
  id: string;
  label: string;
  icon: string;
  href?: string;
}

@Component({
  selector: 'app-mobile-quick-actions',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="quick-actions">
      <div class="quick-grid">
        @for (action of actions(); track action.id) {
          <button
            class="quick-card"
            (click)="handleClick(action)"
          >
            <div class="quick-icon">{{ action.icon }}</div>
            <span class="quick-label">{{ action.label }}</span>
          </button>
        }
      </div>
    </section>
  `,
  styles: [`
    .quick-actions {
      padding: 20px 16px;
    }

    .quick-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
    }

    .quick-card {
      aspect-ratio: 1 / 1;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 16px;
      background: #181a1f;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 6px;
      cursor: pointer;
      transition: all 0.15s ease;
      padding: 12px 8px;
      color: #b0b5c0;
    }

    .quick-card:hover {
      border-color: rgba(255, 255, 255, 0.16);
      transform: translateY(-2px);
    }

    .quick-card:active {
      transform: translateY(0);
    }

    .quick-icon {
      font-size: 22px;
      line-height: 1;
    }

    .quick-label {
      font-size: 11px;
      font-weight: 500;
      text-align: center;
      color: #b0b5c0;
    }
  `],
})
export class MobileQuickActionsComponent {
  actions = input<QuickAction[]>([
    { id: 'inscripciones', label: 'Inscripciones', icon: '📝' },
    { id: 'bases', label: 'Bases', icon: '📄' },
    { id: 'categorias', label: 'Categorías', icon: '🎤' },
    { id: 'jurados', label: 'Jurados', icon: '👥' },
    { id: 'cronograma', label: 'Cronograma', icon: '📆' },
    { id: 'resultados', label: 'Resultados', icon: '📊' },
  ]);

  handleClick(action: QuickAction): void {
    window.location.href = action.href || `/panel/${action.id}`;
  }
}