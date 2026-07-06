import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home-declaracion-hero',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="declaracion-hero">
      <div class="declaracion-hero-inner">
        <div class="declaracion-hero-content">
          <span class="declaracion-hero-badge">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/></svg>
            DOCUMENTO INSTITUCIONAL
          </span>
          <h2 class="declaracion-hero-title">Declarado de Interés Cultural, Turístico y Comunitario</h2>
          <p class="declaracion-hero-desc">
            El Concejo Deliberante de Puerto Pirámides respalda oficialmente el Pre-Cosquín 2027 como sede
            del certamen que impulsa nuevos valores del folclore patagónico. Los días 5 y 6 de septiembre.
          </p>
          <div class="declaracion-hero-actions">
            <a routerLink="/institucional/declaracion" class="declaracion-hero-btn">
              VER DECLARACIÓN COMPLETA
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </a>
          </div>
        </div>
        <div class="declaracion-hero-highlight">
          <div class="highlight-card">
            <span class="highlight-value">N° 35/26</span>
            <span class="highlight-label">Declaración C.D.P.P</span>
          </div>
          <div class="highlight-card">
            <span class="highlight-value">5-6 Sept</span>
            <span class="highlight-label">Fechas Oficiales</span>
          </div>
          <div class="highlight-card">
            <span class="highlight-value">2024+</span>
            <span class="highlight-label">Sede Desde</span>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .declaracion-hero { background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #1d4ed8 100%); padding: var(--space-12) var(--space-4); position: relative; overflow: hidden; }
    .declaracion-hero::before { content: ''; position: absolute; top: -50%; right: -10%; width: 400px; height: 400px; border-radius: 50%; background: rgba(255,255,255,0.03); }
    .declaracion-hero-inner { max-width: 1200px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; gap: var(--space-10); }
    .declaracion-hero-content { flex: 1; max-width: 650px; }
    .declaracion-hero-badge { display: inline-flex; align-items: center; gap: var(--space-2); font-size: 10px; font-weight: var(--weight-bold); letter-spacing: 0.15em; color: rgba(255,255,255,0.8); background: rgba(255,255,255,0.1); padding: 5px 14px; border-radius: var(--radius-full); margin-bottom: var(--space-4); border: 1px solid rgba(255,255,255,0.12); }
    .declaracion-hero-title { font-family: var(--font-display); font-size: var(--text-3xl); font-weight: var(--weight-extrabold); color: #fff; margin: 0 0 var(--space-4); line-height: 1.15; }
    .declaracion-hero-desc { font-size: var(--text-base); color: rgba(255,255,255,0.8); margin: 0 0 var(--space-6); line-height: 1.6; max-width: 550px; }
    .declaracion-hero-btn { display: inline-flex; align-items: center; gap: 10px; background: var(--brand-accent); color: var(--gray-900); padding: 12px 24px; border-radius: var(--radius-full); font-size: var(--text-sm); font-weight: var(--weight-extrabold); text-decoration: none; letter-spacing: 0.05em; transition: all var(--transition-fast); white-space: nowrap; box-shadow: 0 4px 15px rgba(0,0,0,0.2); }
    .declaracion-hero-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.3); }
    .declaracion-hero-highlight { display: flex; flex-direction: column; gap: var(--space-3); flex-shrink: 0; }
    .highlight-card { background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12); border-radius: var(--radius-lg); padding: var(--space-4) var(--space-5); backdrop-filter: blur(4px); text-align: center; min-width: 140px; }
    .highlight-value { display: block; font-family: var(--font-display); font-size: var(--text-xl); font-weight: var(--weight-extrabold); color: #fff; line-height: 1; margin-bottom: 4px; }
    .highlight-label { display: block; font-size: 10px; font-weight: var(--weight-bold); letter-spacing: 0.1em; color: rgba(255,255,255,0.6); text-transform: uppercase; }
    @media (max-width: 1024px) {
      .declaracion-hero-inner { flex-direction: column; text-align: center; }
      .declaracion-hero-desc { margin-left: auto; margin-right: auto; }
      .declaracion-hero-highlight { flex-direction: row; }
    }
    @media (max-width: 480px) {
      .declaracion-hero-highlight { flex-direction: column; width: 100%; }
      .highlight-card { min-width: auto; width: 100%; }
    }
  `]
})
export class HomeDeclaracionHeroComponent {}
