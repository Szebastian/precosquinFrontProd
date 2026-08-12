import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home-cta-banner',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="cta-banner">
      <div class="cta-inner">
        <div class="cta-content">
          <span class="cta-badge">INSCRIPCIONES 2027</span>
          <h2 class="cta-title">¿Listo para participar?</h2>
          <p class="cta-desc">Inscribí tu propuesta artística y formá parte del festival folclórico más importante de la Patagonia.</p>
          <p class="cta-urgency">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            Inscripciones abiertas hasta el 31 de agosto
          </p>
        </div>
        <a routerLink="/inscripcion" class="cta-btn">
          INSCRIBIRME AHORA
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
        </a>
      </div>

      <div class="cta-stands-section">
        <div class="cta-stands-content">
          <h3 class="cta-stands-title">¿Tenés un stand?</h3>
          <p class="cta-stands-desc">Solicitá tu espacio en el recinto del festival.</p>
        </div>
        <a routerLink="/stands/nuevo" class="cta-stands-btn">SOLICITAR STAND</a>
      </div>
    </section>
  `,
  styles: [`
    .cta-banner { background: #2855B8; padding: 48px 24px; width: 100%; border-radius: var(--radius); box-shadow: var(--shadow-card); }
    .cta-inner { width: 100%; max-width: 1200px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; gap: 32px; }
    .cta-content { flex: 1; }
    .cta-badge { display: inline-block; font-size: 10px; font-weight: var(--weight-bold); letter-spacing: 0.15em; color: rgba(255,255,255,0.9); background: rgba(255,255,255,0.12); padding: 5px 14px; border-radius: var(--radius-full); margin-bottom: var(--space-4); }
    .cta-title { font-family: var(--font-display); font-size: 2.25rem; font-weight: var(--weight-extrabold); color: #fff; margin: 0 0 var(--space-3); line-height: 1.15; }
    .cta-desc { font-size: var(--text-base); color: rgba(255,255,255,0.85); margin: 0 0 var(--space-2); max-width: 500px; line-height: 1.6; }
    .cta-urgency { display: inline-flex; align-items: center; gap: 6px; font-size: var(--text-sm); font-weight: var(--weight-bold); color: #D9A928; margin: 0; padding: 4px 0; }
    .cta-btn {
      display: inline-flex; align-items: center; gap: 10px; background: #D9A928; color: #17191C;
      padding: 14px 28px; border-radius: var(--radius-full); font-size: var(--text-sm); font-weight: var(--weight-extrabold);
      text-decoration: none; letter-spacing: 0.05em; transition: all var(--transition-fast); white-space: nowrap; box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    }
    .cta-btn:hover { background: #B98B1D; transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.3); }
    .cta-btn:focus-visible { outline: 3px solid #F7F3EA; outline-offset: 2px; }
    @media (min-width: 1280px) {
      .cta-title { font-size: 2.25rem; }
      .cta-desc { font-size: var(--text-base); max-width: 500px; }
    }
    @media (min-width: 1600px) {
      .cta-inner { max-width: 1280px; }
      .cta-title { font-size: 2.5rem; }
    }
    @media (min-width: 1920px) {
      .cta-inner { max-width: 1400px; }
      .cta-title { font-size: 2.75rem; }
    }
    @media (min-width: 2560px) {
      .cta-inner { max-width: 1520px; }
    }
    @media (max-width: 1024px) {
      .cta-inner { flex-direction: column; text-align: center; }
      .cta-desc { margin: 0 auto; }
    }
    @media (max-width: 640px) {
      .cta-banner { padding: var(--space-8) var(--space-4); }
      .cta-title { font-size: 1.5rem; }
      .cta-btn { width: 100%; justify-content: center; padding: 14px 24px; }
    }

    .cta-stands-section {
      margin-top: var(--space-8);
      padding-top: var(--space-8);
      border-top: 1px solid rgba(255,255,255,0.12);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }

    .cta-stands-content { flex: 1; }

    .cta-stands-title {
      font-family: var(--font-display);
      font-size: 1.5rem;
      font-weight: var(--weight-extrabold);
      color: #fff;
      margin: 0 0 var(--space-2);
    }

    .cta-stands-desc {
      font-size: var(--text-sm);
      color: rgba(255,255,255,0.8);
      margin: 0;
    }

    .cta-stands-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: transparent;
      color: #fff;
      padding: 12px 24px;
      border-radius: var(--radius-full);
      font-size: var(--text-sm);
      font-weight: var(--weight-bold);
      text-decoration: none;
      transition: all var(--transition-fast);
      white-space: nowrap;
      border: 1.5px solid rgba(255,255,255,0.3);
    }

    .cta-stands-btn:hover {
      background: rgba(255,255,255,0.15);
      border-color: rgba(255,255,255,0.5);
    }

    @media (max-width: 640px) {
      .cta-stands-section {
        flex-direction: column;
        text-align: center;
      }
    }
  `]
})
export class HomeCtaBannerComponent {}
