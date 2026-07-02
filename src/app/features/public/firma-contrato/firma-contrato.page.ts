import { Component } from '@angular/core';

@Component({
  selector: 'app-firma-contrato',
  standalone: true,
  template: `
    <div class="public-page">
      <div class="public-container animate-scale-in">
        <div class="public-brand">
          <div class="brand-icon-lg brand-icon-success">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><polyline points="10 9 9 9 8 9"/>
            </svg>
          </div>
          <h1 class="public-title">Firma de Contrato</h1>
          <p class="public-subtitle">Revisa y firma tu contrato de participacion</p>
        </div>

        <div class="contract-placeholder">
          <div class="contract-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
            </svg>
          </div>
          <p class="text-muted">El contrato se cargara aqui cuando sea enviado por el organizador.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .public-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, var(--gray-900) 0%, var(--brand-900) 100%);
      padding: var(--space-6);
    }

    .public-container {
      width: 100%;
      max-width: 640px;
      background-color: #fff;
      border-radius: var(--radius-2xl);
      box-shadow: var(--shadow-xl);
      padding: var(--space-8);
    }

    .public-brand {
      text-align: center;
      margin-bottom: var(--space-8);
    }

    .brand-icon-lg {
      width: 56px;
      height: 56px;
      border-radius: var(--radius-xl);
      background-color: var(--brand-600);
      color: #fff;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-bottom: var(--space-4);
    }

    .brand-icon-success {
      background-color: var(--success-600);
    }

    .public-title {
      font-size: var(--text-2xl);
      font-weight: var(--weight-bold);
      color: var(--gray-900);
      margin-bottom: var(--space-1);
    }

    .public-subtitle {
      font-size: var(--text-sm);
      color: var(--gray-500);
    }

    .contract-placeholder {
      text-align: center;
      padding: var(--space-10) var(--space-6);
      border: 2px dashed var(--gray-200);
      border-radius: var(--radius-xl);
      background-color: var(--gray-50);
    }

    .contract-icon {
      color: var(--gray-300);
      margin-bottom: var(--space-4);
      display: inline-block;
    }

    .text-muted {
      color: var(--gray-500);
      font-size: var(--text-sm);
    }
  `]
})
export class FirmaContratoPageComponent {}
