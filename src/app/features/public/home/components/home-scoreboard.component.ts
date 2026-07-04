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
    .portal-scoreboard { background-color: white; border-top: 1px solid var(--gray-200); border-bottom: 1px solid var(--gray-200); padding: var(--space-3) 0; margin-top: var(--space-8); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    .scoreboard-inner { max-width: 1200px; margin: 0 auto; display: flex; align-items: center; justify-content: center; gap: var(--space-6); padding: 0 var(--space-4); flex-wrap: wrap; }
    .score-item { display: flex; align-items: center; gap: var(--space-3); }
    .score-label { font-size: var(--text-xs); color: var(--gray-700); font-weight: var(--weight-bold); }
    .score-value { font-size: var(--text-sm); color: var(--gray-900); font-weight: var(--weight-bold); font-family: var(--font-display); }
    .score-divider { width: 1px; height: 20px; background-color: var(--gray-300); }
    .score-link { background-color: var(--brand-accent); color: var(--gray-900); padding: 0.3rem 1rem; border-radius: var(--radius-full); font-size: var(--text-xs); font-weight: var(--weight-bold); text-decoration: none; transition: opacity var(--transition-fast); }
    .score-link:hover { opacity: 0.8; }
  `]
})
export class HomeScoreboardComponent {}
