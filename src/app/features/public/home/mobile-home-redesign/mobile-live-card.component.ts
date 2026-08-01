import {
  Component,
  ChangeDetectionStrategy,
  input,
} from '@angular/core';

@Component({
  selector: 'app-mobile-live-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="live-card">
      <div class="live-badge">
        <span class="live-dot"></span>
        <span class="live-text">EN VIVO</span>
      </div>

      <div class="live-content">
        <h3 class="live-title">{{ title() }}</h3>
        <p class="live-desc">{{ description() }}</p>
      </div>

      <button class="live-btn">
        Ver transmisión
      </button>
    </div>
  `,
  styles: [`
    .live-card {
      background: #181a1f;
      border-radius: 20px;
      margin: 20px 16px;
      padding: 20px;
      border: 1px solid rgba(220, 20, 60, 0.3);
    }

    .live-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(220, 20, 60, 0.15);
      border-radius: 999px;
      padding: 4px 12px;
      margin-bottom: 12px;
    }

    .live-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #dc143c;
      box-shadow: 0 0 8px rgba(220, 20, 60, 0.6);
      animation: pulse 1.5s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    .live-text {
      font-size: 11px;
      font-weight: 700;
      color: #dc143c;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .live-content {
      margin-bottom: 16px;
    }

    .live-title {
      font-size: 18px;
      font-weight: 600;
      color: #ffffff;
      margin: 0 0 6px;
    }

    .live-desc {
      font-size: 14px;
      color: #7b8395;
      margin: 0;
    }

    .live-btn {
      width: 100%;
      border: none;
      border-radius: 16px;
      padding: 14px;
      font-size: 15px;
      font-weight: 600;
      color: #0e0f12;
      background: #dc143c;
      cursor: pointer;
      transition: transform 0.1s ease, box-shadow 0.1s ease;
    }

    .live-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 16px rgba(220, 20, 60, 0.3);
    }

    .live-btn:active {
      transform: translateY(0);
    }
  `],
})
export class MobileLiveCardComponent {
  title = input('Concert de apertura');
  description = input('Transmisión en vivo desde el escenario principal');
}