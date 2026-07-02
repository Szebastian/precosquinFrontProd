import { Component } from '@angular/core';

@Component({
  selector: 'app-staff',
  standalone: true,
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">Staff</h1>
          <p class="page-subtitle">Tareas operativas y checklists</p>
        </div>
      </div>
      <div class="card">
        <div class="card-body">
          <div class="empty-state">
            <div class="empty-icon">&#128203;</div>
            <h3 class="empty-title">Panel de staff</h3>
            <p class="empty-desc">Aca el staff gestiona checklists, contactos y reporta incidencias.</p>
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
    .empty-state { text-align: center; padding: var(--space-12) var(--space-6); }
    .empty-icon { font-size: 3rem; margin-bottom: var(--space-4); }
    .empty-title { font-size: var(--text-lg); font-weight: var(--weight-semibold); color: var(--gray-900); margin-bottom: var(--space-2); }
    .empty-desc { font-size: var(--text-sm); color: var(--gray-500); max-width: 360px; margin: 0 auto; }
  `]
})
export class StaffPageComponent {}
