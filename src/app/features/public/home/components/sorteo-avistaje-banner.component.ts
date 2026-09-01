import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sorteo-avistaje-banner',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="sorteo-banner" (click)="goToForm()" role="button" tabindex="0"
             (keydown.enter)="goToForm()" (keydown.space)="goToForm()">
      <div class="sorteo-bg-image"></div>
      <div class="sorteo-overlay"></div>
      <div class="sorteo-glow-1"></div>
      <div class="sorteo-inner">
        <div class="sorteo-left">
          <div class="sorteo-eyebrow">
            <span class="sorteo-eyebrow-dot"></span>
            SORTEO EXCLUSIVO
          </div>
          <h2 class="sorteo-title">Avistaje de Ballenas y Snorkelling</h2>
          <p class="sorteo-desc">Participá por un viaje de avistaje de ballenas y snorkelling para <strong>4 personas</strong> en la Peninsula Valdés.</p>
          <div class="sorteo-prize-mobile">
            <span class="sorteo-prize-label">Premio</span>
            <span class="sorteo-prize-value">4 Personas</span>
          </div>
          <div class="sorteo-cta">
            Participar Ahora
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5 19 12l-7 7"/></svg>
          </div>
        </div>
        <div class="sorteo-right">
          <div class="sorteo-prize">
            <span class="sorteo-prize-label">Premio</span>
            <span class="sorteo-prize-value">4 Personas</span>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .sorteo-banner {
      background: linear-gradient(135deg, #0a1628 0%, #0f2035 50%, #0c1a2e 100%);
      border-radius: 20px;
      padding: 40px 44px;
      cursor: pointer;
      transition: all 0.35s ease;
      box-shadow: 0 12px 40px rgba(0,0,0,0.35), 0 2px 6px rgba(0,0,0,0.2);
      border: 1px solid rgba(6,182,212,0.15);
      position: relative;
      overflow: hidden;
    }
    .sorteo-bg-image {
      position: absolute;
      top: 0;
      right: 0;
      width: 55%;
      height: 100%;
      background: url('/assets/img/avistaje-bote.jpg') center/cover no-repeat;
      opacity: 0.25;
      mask-image: linear-gradient(to left, rgba(0,0,0,0.7) 0%, transparent 100%);
      -webkit-mask-image: linear-gradient(to left, rgba(0,0,0,0.7) 0%, transparent 100%);
      pointer-events: none;
      z-index: 0;
    }
    .sorteo-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(90deg, #0a1628 30%, transparent 70%);
      pointer-events: none;
      z-index: 1;
    }
    .sorteo-banner:hover {
      transform: translateY(-3px);
      box-shadow: 0 20px 50px rgba(0,0,0,0.4), 0 0 30px rgba(6,182,212,0.08);
      border-color: rgba(6,182,212,0.35);
    }
    .sorteo-glow-1 {
      position: absolute;
      top: -50%;
      right: -15%;
      width: 350px;
      height: 350px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 65%);
      pointer-events: none;
      z-index: 1;
    }
    .sorteo-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 40px;
      position: relative;
      z-index: 2;
    }
    .sorteo-left { flex: 1; }
    .sorteo-eyebrow {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 11px;
      font-weight: 700;
      color: #22d3ee;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-bottom: 12px;
    }
    .sorteo-eyebrow-dot {
      width: 6px;
      height: 6px;
      background: #22d3ee;
      border-radius: 50%;
      animation: pulse-dot 2s ease-in-out infinite;
    }
    @keyframes pulse-dot {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(1.3); }
    }
    .sorteo-title {
      font-family: var(--font-display, 'Playfair Display', serif);
      font-size: 28px;
      font-weight: 800;
      color: #f8fafc;
      margin: 0 0 10px;
      line-height: 1.15;
      letter-spacing: -0.02em;
    }
    .sorteo-desc {
      font-size: 15px;
      color: rgba(248,250,252,0.75);
      margin: 0 0 20px;
      line-height: 1.6;
    }
    .sorteo-desc strong { color: #f1f5f9; }
    .sorteo-cta {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      background: linear-gradient(135deg, #06b6d4, #0891b2);
      color: white;
      padding: 14px 28px;
      border-radius: 999px;
      font-size: 14px;
      font-weight: 800;
      letter-spacing: 0.03em;
      text-transform: uppercase;
      transition: all 0.25s ease;
      box-shadow: 0 4px 18px rgba(6,182,212,0.35);
    }
    .sorteo-banner:hover .sorteo-cta {
      background: linear-gradient(135deg, #22d3ee, #06b6d4);
      transform: translateX(3px);
      box-shadow: 0 6px 24px rgba(6,182,212,0.5);
    }
    .sorteo-right {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      flex-shrink: 0;
    }
    .sorteo-prize {
      display: flex;
      flex-direction: column;
      align-items: center;
      background: rgba(6,182,212,0.08);
      border: 1px solid rgba(6,182,212,0.2);
      border-radius: 12px;
      padding: 10px 20px;
    }
    .sorteo-prize-label {
      font-size: 10px;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }
    .sorteo-prize-value {
      font-size: 18px;
      font-weight: 800;
      color: #22d3ee;
    }
    .sorteo-prize-mobile { display: none; }

    @media (max-width: 768px) {
      .sorteo-banner { padding: 28px 24px; border-radius: 16px; }
      .sorteo-bg-image { width: 100%; opacity: 0.15; }
      .sorteo-overlay { background: linear-gradient(180deg, #0a1628 20%, transparent 80%); }
      .sorteo-inner { flex-direction: column; text-align: center; gap: 20px; }
      .sorteo-title { font-size: 22px; }
      .sorteo-desc { font-size: 14px; }
      .sorteo-prize-mobile { display: flex; }
      .sorteo-right { display: none; }
      .sorteo-cta { width: 100%; justify-content: center; }
    }
    @media (max-width: 480px) {
      .sorteo-banner { padding: 22px 18px; }
      .sorteo-title { font-size: 20px; }
    }
  `]
})
export class SorteoAvistajeBannerComponent {
  private router = inject(Router);
  goToForm(): void {
    this.router.navigate(['/sorteo-avistaje']);
  }
}
