import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-stands-predio-section',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section id="predio" class="stands-predio-section">
      <!-- Banner promocional -->
      <div class="stands-banner" (click)="navigateToStands()" role="button" tabindex="0"
           (keydown.enter)="navigateToStands()" (keydown.space)="navigateToStands()">
        <div class="stands-banner-inner">
          <div class="stands-badge">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Z"/><path d="M9 14h6"/><path d="M9 8h6"/><path d="M9 18h6"/></svg>
          </div>
          <div class="stands-banner-content">
            <h3 class="stands-banner-title">¿Comerciante o emprendedor?</h3>
            <p class="stands-banner-desc">
              Postulá tu stand o puesto para Pre-Cosquín Sede Puerto Pirámides.
            </p>
          </div>
          <div class="stands-banner-cta">
            <span class="stands-cta-text">Postular mi Stand / Puesto</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5 19 12l-7 7"/></svg>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    /* ═══ SECTION WRAPPER ═══ */
    .stands-predio-section {
      padding: 0;
      max-width: none;
      margin: 0;
    }

    /* ═══ BANNER PROMOCIONAL ═══ */
    .stands-banner {
      background: #0B1B3D;
      border-radius: 12px;
      padding: 28px 32px;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
      border: none;
      position: relative;
      overflow: hidden;
    }
    .stands-banner:hover {
      transform: translateY(-2px);
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
    }
    .stands-banner::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -20%;
      width: 200px;
      height: 200px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.05);
      pointer-events: none;
    }
    .stands-banner-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }
    .stands-badge {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 44px;
      height: 44px;
      background: rgba(255, 255, 255, 0.15);
      border-radius: 14px;
      color: #FFFFFF;
      flex-shrink: 0;
    }
    .stands-banner-content {
      flex: 1;
    }
    .stands-banner-title {
      font-family: var(--font-display, 'Playfair Display', serif);
      font-size: 18px;
      font-weight: 700;
      color: #FFFFFF;
      margin: 0 0 4px;
    }
    .stands-banner-desc {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.8);
      margin: 0;
      line-height: 1.4;
    }
    .stands-banner-cta {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #F59E0B;
      color: #17191C;
      padding: 10px 18px;
      border-radius: 999px;
      font-size: 13px;
      font-weight: 700;
      transition: all 0.2s ease;
      flex-shrink: 0;
    }
    .stands-banner:hover .stands-banner-cta {
      background: #EAB308;
    }
    .stands-cta-text {
      letter-spacing: 0.04em;
    }

    /* ═══ RESPONSIVE ═══ */
    @media (max-width: 640px) {
      .stands-predio-section {
        padding: 20px 12px;
      }
      .stands-banner {
        padding: 20px 24px;
      }
      .stands-banner-inner {
        flex-direction: column;
        text-align: center;
      }
      .stands-banner-cta {
        margin-top: 12px;
      }
    }
  `]
})
export class StandsPredioSectionComponent {
  private router = inject(Router);

  navigateToStands(): void {
    this.router.navigate(['/stands/nuevo']);
  }
}
