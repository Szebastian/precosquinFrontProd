import {
  Component,
  ChangeDetectionStrategy,
  signal,
  output,
} from '@angular/core';

@Component({
  selector: 'app-mobile-fab',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      class="fab"
      (click)="clicked.emit()"
      aria-label="Acción rápida"
    >
      <span class="fab-icon" [class.rotated]="isOpen()">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </span>
    </button>
  `,
  styles: [`
    .fab {
      position: fixed;
      bottom: 88px;
      right: 16px;
      width: 56px;
      height: 56px;
      border-radius: 16px;
      background: #c9a87d;
      border: none;
      color: #0e0f12;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 16px rgba(201, 168, 125, 0.3);
      transition: all 0.2s ease;
      z-index: 90;
    }

    .fab:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(201, 168, 125, 0.4);
    }

    .fab:active {
      transform: translateY(0);
      box-shadow: 0 2px 8px rgba(201, 168, 125, 0.3);
    }

    .fab-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s ease;
    }

    .fab-icon.rotated {
      transform: rotate(45deg);
    }

    .fab-icon svg {
      stroke: currentColor;
    }
  `],
})
export class MobileFabComponent {
  isOpen = signal(false);
  clicked = output<void>();

  toggle(): void {
    this.isOpen.update((v) => !v);
  }
}