import { Component } from '@angular/core';

@Component({
  selector: 'app-inscripciones-list',
  standalone: true,
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">Inscripciones</h1>
          <p class="page-subtitle">Gestiona las inscripciones de artistas</p>
        </div>
        <button class="btn btn-primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>
          Nueva inscripcion
        </button>
      </div>

      <div class="card">
        <div class="card-header flex-between">
          <div class="filter-tabs">
            <button class="filter-tab active">Todas</button>
            <button class="filter-tab">Pendientes</button>
            <button class="filter-tab">Aprobadas</button>
            <button class="filter-tab">Rechazadas</button>
          </div>
          <input type="search" class="form-input search-input" placeholder="Buscar artista..." />
        </div>
        <div class="card-body p-0">
          <div class="empty-state">
            <div class="empty-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                <rect width="8" height="4" x="8" y="2" rx="1" ry="1"/>
              </svg>
            </div>
            <h3 class="empty-title">Sin inscripciones</h3>
            <p class="empty-desc">Aun no hay inscripciones registradas en el sistema.</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container { max-width: var(--content-max-width); }
    .page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: var(--space-6); }
    .page-title { font-size: var(--text-2xl); font-weight: var(--weight-bold); color: var(--gray-900); margin-bottom: var(--space-1); }
    .page-subtitle { font-size: var(--text-sm); color: var(--gray-500); }
    .flex-between { display: flex; align-items: center; justify-content: space-between; }
    .filter-tabs { display: flex; gap: var(--space-1); }
    .filter-tab { padding: var(--space-2) var(--space-3); font-size: var(--text-sm); font-weight: var(--weight-medium); color: var(--gray-500); background: none; border: none; border-radius: var(--radius-lg); cursor: pointer; transition: all var(--transition-fast); }
    .filter-tab:hover { color: var(--gray-700); background-color: var(--gray-100); }
    .filter-tab.active { color: var(--brand-600); background-color: var(--brand-50); }
    .search-input { max-width: 240px; }
    .p-0 { padding: 0; }
    .empty-state { text-align: center; padding: var(--space-12) var(--space-6); }
    .empty-icon { color: var(--gray-300); margin-bottom: var(--space-4); display: inline-block; }
    .empty-title { font-size: var(--text-lg); font-weight: var(--weight-semibold); color: var(--gray-900); margin-bottom: var(--space-2); }
    .empty-desc { font-size: var(--text-sm); color: var(--gray-500); max-width: 360px; margin: 0 auto; }
  `]
})
export class InscripcionesListPageComponent {}
