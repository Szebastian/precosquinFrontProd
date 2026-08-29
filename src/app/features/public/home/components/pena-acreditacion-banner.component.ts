import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pena-acreditacion-banner',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="pena-banner" (click)="goToForm()" role="button" tabindex="0"
             (keydown.enter)="goToForm()" (keydown.space)="goToForm()">
      <div class="pena-banner-inner">
        <div class="pena-badge">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/><circle cx="12" cy="8" r="6" opacity="0.15"/><path d="M12 2a10 10 0 0 1 10 10" opacity="0.2"/></svg>
        </div>
        <div class="pena-content">
          <h3 class="pena-title">¿Sos artista agendado en la Peña?</h3>
          <p class="pena-desc">Acreditá a tu grupo, músicos y acompañantes/staff para el control de acceso en puerta.</p>
        </div>
        <div class="pena-cta">
          <span class="pena-cta-text">Registrar Acompañantes Peña</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5 19 12l-7 7"/></svg>
        </div>
      </div>
      <div class="pena-glow"></div>
    </section>
  `,
  styles: [`
    .pena-banner {
      background: linear-gradient(135deg, #1e293b 0%, #0f172a 60%, #1e3a5f 100%);
      border-radius: 16px;
      padding: 28px 32px;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 10px 30px rgba(0,0,0,0.25), 0 1px 3px rgba(0,0,0,0.15);
      border: 1px solid rgba(255,255,255,0.07);
      position: relative;
      overflow: hidden;
    }
    .pena-banner:hover {
      transform: translateY(-2px);
      box-shadow: 0 16px 40px rgba(0,0,0,0.3);
      border-color: rgba(59,130,246,0.2);
    }
    .pena-banner::before {
      content: '';
      position: absolute;
      top: -40%;
      right: -15%;
      width: 260px;
      height: 260px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%);
      pointer-events: none;
    }
    .pena-glow {
      position: absolute;
      bottom: -30%;
      left: -10%;
      width: 180px;
      height: 180px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(217,169,40,0.08) 0%, transparent 70%);
      pointer-events: none;
    }
    .pena-banner-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
      position: relative;
      z-index: 1;
    }
    .pena-badge {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      background: rgba(59,130,246,0.12);
      border: 1px solid rgba(59,130,246,0.2);
      border-radius: 14px;
      color: #60a5fa;
      flex-shrink: 0;
    }
    .pena-content { flex: 1; min-width: 0; }
    .pena-title {
      font-family: var(--font-display, 'Playfair Display', serif);
      font-size: 19px;
      font-weight: 800;
      color: #f8fafc;
      margin: 0 0 6px;
      line-height: 1.2;
      letter-spacing: -0.01em;
    }
    .pena-desc {
      font-size: 14px;
      color: rgba(248,250,252,0.7);
      margin: 0;
      line-height: 1.5;
    }
    .pena-cta {
      display: flex;
      align-items: center;
      gap: 10px;
      background: #D9A928;
      color: #0f172a;
      padding: 12px 22px;
      border-radius: 999px;
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      transition: all 0.2s ease;
      flex-shrink: 0;
      box-shadow: 0 4px 14px rgba(217,169,40,0.3);
    }
    .pena-banner:hover .pena-cta {
      background: #EAB308;
      transform: translateX(2px);
      box-shadow: 0 6px 18px rgba(217,169,40,0.4);
    }
    .pena-cta-text { white-space: nowrap; }

    @media (max-width: 820px) {
      .pena-banner-inner { flex-direction: column; text-align: center; }
      .pena-cta { width: 100%; justify-content: center; margin-top: 4px; }
    }
    @media (max-width: 640px) {
      .pena-banner { padding: 22px 20px; border-radius: 14px; }
      .pena-title { font-size: 17px; }
      .pena-desc { font-size: 13px; }
      .pena-cta { font-size: 12px; padding: 11px 18px; }
    }
  `]
})
export class PenaAcreditacionBannerComponent {
  private router = inject(Router);
  goToForm(): void {
    this.router.navigate(['/acreditacion-pena']);
  }
}
