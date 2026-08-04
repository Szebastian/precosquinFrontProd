import { Component, input } from '@angular/core';

@Component({
  selector: 'app-home-separator',
  standalone: true,
  template: `
    <div class="section-separator" [class.separator-diagonal]="variant() === 'diagonal'">
      <div class="separator-bg">
        <img src="assets/img/separador.webp" alt="" class="separator-img" width="800" height="464" loading="eager" decoding="async" />
        <div class="separator-overlay" [class.separator-overlay-dark]="variant() === 'diagonal'"></div>
      </div>
      <div class="separator-content" [class.separator-content-sm]="variant() === 'diagonal'">
        <div class="separator-inner">
          <ng-content></ng-content>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .section-separator { position: relative; overflow: hidden; }
    .separator-bg { position: absolute; inset: 0; z-index: 0; }
    .separator-img { width: 100%; height: 100%; object-fit: cover; filter: blur(3px) brightness(0.7); transform: scale(1.1); }
    .separator-overlay { position: absolute; inset: 0; background: linear-gradient(135deg, rgba(37, 99, 235, 0.85) 0%, rgba(29, 78, 216, 0.9) 100%); mix-blend-mode: multiply; }
    .separator-overlay-dark { background: linear-gradient(135deg, rgba(29, 78, 216, 0.9) 0%, rgba(30, 58, 138, 0.95) 100%); }
    .separator-content { position: relative; z-index: 3; padding: 20px 24px 28px; width: 100%; box-sizing: border-box; }
    .separator-content-sm { padding: 16px 24px 24px; }
    .separator-inner { width: 100%; text-align: center; }
    :host ::ng-deep .separator-label { display: inline-block; font-size: 10px; font-weight: var(--weight-bold); letter-spacing: 0.2em; color: rgba(255,255,255,0.8); margin-bottom: var(--space-3); }
    :host ::ng-deep .separator-title { font-family: var(--font-display); font-size: 2rem; font-weight: var(--weight-extrabold); color: #fff; margin: 0 0 var(--space-6); text-shadow: 0 2px 10px rgba(0,0,0,0.2); }
    :host ::ng-deep .separator-cats { display: flex; align-items: center; justify-content: center; flex-wrap: wrap; gap: var(--space-3); }
    :host ::ng-deep .sep-cat { font-size: var(--text-sm); font-weight: var(--weight-semibold); color: rgba(255,255,255,0.9); background: rgba(255,255,255,0.12); padding: 6px 16px; border-radius: var(--radius-full); backdrop-filter: blur(4px); border: 1px solid rgba(255,255,255,0.15); }
    :host ::ng-deep .sep-cat-dot { width: 4px; height: 4px; border-radius: 50%; background: rgba(255,255,255,0.4); }
    :host ::ng-deep .separator-stats { display: flex; align-items: center; justify-content: center; gap: var(--space-8); }
    :host ::ng-deep .sep-stat { display: flex; flex-direction: column; align-items: center; gap: 4px; }
    :host ::ng-deep .sep-stat-value { font-family: var(--font-display); font-size: 2.5rem; font-weight: var(--weight-extrabold); color: #fff; line-height: 1; text-shadow: 0 2px 10px rgba(0,0,0,0.2); }
    :host ::ng-deep .sep-stat-label { font-size: var(--text-xs); font-weight: var(--weight-bold); color: rgba(255,255,255,0.8); text-transform: uppercase; letter-spacing: 0.1em; }
    :host ::ng-deep .sep-stat-divider { width: 1px; height: 40px; background: rgba(255,255,255,0.25); }
    @media (max-width: 1024px) { :host ::ng-deep .separator-title { font-size: 1.5rem; } :host ::ng-deep .separator-cats { gap: var(--space-2); } :host ::ng-deep .sep-cat { font-size: 11px; padding: 4px 10px; } :host ::ng-deep .separator-stats { gap: var(--space-5); } :host ::ng-deep .sep-stat-value { font-size: 2rem; } }
    @media (max-width: 640px) {
      .separator-content { padding: var(--space-3) var(--space-3) var(--space-4); }
      .separator-content-sm { padding: var(--space-2) var(--space-3) var(--space-3); }
      :host ::ng-deep .separator-title { font-size: 1.25rem; margin-bottom: var(--space-4); }
      :host ::ng-deep .separator-cats { gap: 6px; }
      :host ::ng-deep .sep-cat { font-size: 10px; padding: 4px 8px; }
      :host ::ng-deep .separator-stats { gap: var(--space-3); flex-wrap: wrap; }
      :host ::ng-deep .sep-stat-value { font-size: 1.5rem; }
      :host ::ng-deep .sep-stat-label { font-size: 0.6rem; }
      :host ::ng-deep .sep-stat-divider { height: 24px; }
    }
  `]
})
export class HomeComponentSeparatorComponent {
  variant = input<'wave' | 'diagonal'>('wave');
}
