import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home-scoreboard',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="portal-scoreboard">
      <div class="scoreboard-inner">
        <div class="score-item">
          <span class="score-label">UBICACIÓN</span>
          <span class="score-value">PUERTO PIRÁMIDES</span>
        </div>
        <div class="score-divider"></div>
        <div class="score-item">
          <span class="score-label">PROVINCIA</span>
          <span class="score-value">CHUBUT, PATAGONIA</span>
        </div>
        <div class="score-divider"></div>
        <div class="score-item">
          <span class="score-label">EDICIÓN</span>
          <span class="score-value">PRE-COSQUÍN 2027</span>
        </div>
        <div class="score-divider"></div>
        <div class="score-item score-action">
          <a routerLink="/inscripcion" class="score-link">VER MÁS INFORMACIÓN</a>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .portal-scoreboard { background-color: #fff; border-top: 1px solid #E6DED0; border-bottom: 1px solid #E6DED0; padding: 12px 0; box-shadow: 0 1px 3px rgba(0,0,0,0.04); width: 100vw; margin-left: calc(-50vw + 50%); border-radius: 0; }
    .scoreboard-inner { width: 100%; display: flex; align-items: center; justify-content: center; gap: 32px; padding: 0 48px; flex-wrap: wrap; }
    .score-item { display: flex; align-items: center; gap: var(--space-3); }
    .score-label { font-size: var(--text-xs); color: #857a68; font-weight: var(--weight-bold); }
    .score-value { font-size: var(--text-sm); color: #17191C; font-weight: var(--weight-bold); font-family: var(--font-display); }
    .score-divider { width: 1px; height: 20px; background-color: #E6DED0; }
    .score-link { background-color: #D9A928; color: #17191C; padding: 0.3rem 1rem; border-radius: var(--radius-full); font-size: var(--text-xs); font-weight: var(--weight-bold); text-decoration: none; transition: all var(--transition-fast); }
    .score-link:hover { background: #B98B1D; }
    .score-link:focus-visible { outline: 2px solid #2855B8; outline-offset: 2px; }
    @media (max-width: 640px) {
      .portal-scoreboard { padding: 8px 0; border-radius: 0; width: 100vw; margin-left: calc(-50vw + 50%); }
      .scoreboard-inner { flex-direction: column; gap: 8px; padding: 0 16px; }
      .score-divider { width: 40px; height: 1px; }
      .score-item { justify-content: center; }
      .score-label { font-size: 0.6rem; }
      .score-value { font-size: var(--text-xs); }
      .score-link { font-size: 0.6rem; padding: 0.25rem 0.75rem; }
    }
  `]
})
export class HomeScoreboardComponent {}
