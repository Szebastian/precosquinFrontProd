import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="not-found-page">
      <div class="not-found-container">
        <div class="not-found-code">404</div>
        <h1 class="not-found-title">Página no encontrada</h1>
        <p class="not-found-desc">
          Lo sentimos, la página que buscás no existe o fue movida a otro lugar.
        </p>
        <div class="not-found-actions">
          <a routerLink="/" class="not-found-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            Volver al inicio
          </a>
          <a routerLink="/noticias" class="not-found-btn not-found-btn-outline">
            Ver noticias
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .not-found-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #f8f6f2 0%, #fff 100%);
      padding: var(--space-4);
      text-align: center;
    }

    .not-found-container {
      max-width: 480px;
    }

    .not-found-code {
      font-family: var(--font-display);
      font-size: 8rem;
      font-weight: var(--weight-extrabold);
      color: var(--brand-200);
      line-height: 1;
      margin-bottom: var(--space-4);
      user-select: none;
    }

    .not-found-title {
      font-family: var(--font-display);
      font-size: var(--text-3xl);
      font-weight: var(--weight-extrabold);
      color: var(--gray-900);
      margin: 0 0 var(--space-3);
    }

    .not-found-desc {
      font-size: var(--text-base);
      color: var(--gray-500);
      margin: 0 0 var(--space-8);
      line-height: 1.6;
    }

    .not-found-actions {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-3);
      flex-wrap: wrap;
    }

    .not-found-btn {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      padding: 0.75rem 1.5rem;
      background: var(--brand-600);
      color: #fff;
      border-radius: var(--radius-full);
      text-decoration: none;
      font-size: var(--text-sm);
      font-weight: var(--weight-bold);
      transition: all var(--transition-fast);
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
    }

    .not-found-btn:hover {
      background: var(--brand-700);
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(37, 99, 235, 0.35);
    }

    .not-found-btn-outline {
      background: transparent;
      color: var(--brand-600);
      border: 1.5px solid var(--brand-300);
      box-shadow: none;
    }

    .not-found-btn-outline:hover {
      background: var(--brand-50);
      border-color: var(--brand-500);
      box-shadow: none;
    }
  `]
})
export class NotFoundComponent {}
