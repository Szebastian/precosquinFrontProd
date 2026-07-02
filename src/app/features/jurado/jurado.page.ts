import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '@core/auth/auth.service';

interface JuradoStats {
  inscriptions_assigned: number;
  pending_evaluations: number;
  completed_evaluations: number;
  average_score: number;
}

interface InscriptionToEvaluate {
  id: string;
  artist_name: string;
  stage_name: string;
  category: string;
  subcategory: string;
  status: string;
  submitted_at: string;
  evaluation_status: 'pending' | 'in_progress' | 'completed';
  score?: number;
}

@Component({
  selector: 'app-jurado',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard">
      <!-- Welcome Section -->
      <div class="welcome-section">
        <div>
          <h1 class="welcome-title">Panel del Jurado</h1>
          <p class="welcome-subtitle">{{ auth.profile()?.full_name || 'Jurado' }} - Evaluá a los artistas inscriptos en Pre-Cosquín</p>
        </div>
        <div class="welcome-actions">
          <a routerLink="/panel/jurado/inscripciones" class="btn btn-primary btn-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
              <rect width="8" height="4" x="8" y="2" rx="1" ry="1"/>
            </svg>
            Ver Inscripciones
          </a>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="stats-grid">
        <div class="stat-card stat-card-brand">
          <div class="stat-card-inner">
            <div class="stat-icon-wrapper">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                <rect width="8" height="4" x="8" y="2" rx="1" ry="1"/>
              </svg>
            </div>
            <div class="stat-content">
              <p class="stat-value">{{ stats()?.inscriptions_assigned || 0 }}</p>
              <p class="stat-label">Inscripciones Asignadas</p>
            </div>
          </div>
          <div class="stat-footer">
            <span class="stat-trend-info">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>
              </svg>
              Para tu evaluación
            </span>
          </div>
        </div>

        <div class="stat-card stat-card-warning">
          <div class="stat-card-inner">
            <div class="stat-icon-wrapper">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <div class="stat-content">
              <p class="stat-value">{{ stats()?.pending_evaluations || 0 }}</p>
              <p class="stat-label">Pendientes de Evaluar</p>
            </div>
          </div>
          <div class="stat-footer">
            <a routerLink="/panel/jurado/inscripciones" class="stat-link">Evaluar ahora →</a>
          </div>
        </div>

        <div class="stat-card stat-card-success">
          <div class="stat-card-inner">
            <div class="stat-icon-wrapper">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <div class="stat-content">
              <p class="stat-value">{{ stats()?.completed_evaluations || 0 }}</p>
              <p class="stat-label">Evaluaciones Completadas</p>
            </div>
          </div>
          <div class="stat-footer">
            <span class="stat-trend-up">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                <polyline points="17 6 23 6 23 12"/>
              </svg>
              Progreso excelente
            </span>
          </div>
        </div>

        <div class="stat-card stat-card-info">
          <div class="stat-card-inner">
            <div class="stat-icon-wrapper">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            </div>
            <div class="stat-content">
              <p class="stat-value">{{ stats()?.average_score || 0 }}</p>
              <p class="stat-label">Promedio de Puntuación</p>
            </div>
          </div>
          <div class="stat-footer">
            <span class="stat-trend-info">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>
              </svg>
              Sobre 10 puntos
            </span>
          </div>
        </div>
      </div>

      <!-- Inscriptions to Evaluate -->
      <div class="card card-elevated">
        <div class="card-header">
          <div>
            <h3 class="card-title">Inscripciones para Evaluar</h3>
            <p class="card-description">Artistas asignados para tu evaluación</p>
          </div>
          <a routerLink="/panel/jurado/inscripciones" class="text-link">Ver todas</a>
        </div>
        <div class="card-body">
          @if (pendingInscriptions().length === 0) {
            <div class="empty-state">
              <div class="empty-icon-wrap">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <h4 class="empty-title">Todo evaluado</h4>
              <p class="empty-desc">No tenés inscripciones pendientes de evaluación.</p>
            </div>
          } @else {
            <div class="inscription-list">
              @for (inscription of pendingInscriptions(); track inscription.id) {
                <div class="inscription-item" [class.in-progress]="inscription.evaluation_status === 'in_progress'">
                  <div class="inscription-avatar" [class]="inscription.category.toLowerCase()">
                    {{ getInitials(inscription.artist_name) }}
                  </div>
                  <div class="inscription-info">
                    <h4 class="inscription-name">{{ inscription.artist_name }}</h4>
                    <p class="inscription-meta">
                      <span class="inscription-category">{{ inscription.category }} › {{ inscription.subcategory }}</span>
                      <span class="inscription-separator">·</span>
                      <span class="inscription-date">{{ formatDate(inscription.submitted_at) }}</span>
                    </p>
                  </div>
                  <div class="inscription-status">
                    @if (inscription.evaluation_status === 'pending') {
                      <span class="status-badge status-pending">Pendiente</span>
                    } @else if (inscription.evaluation_status === 'in_progress') {
                      <span class="status-badge status-progress">En progreso</span>
                    } @else {
                      <span class="status-badge status-completed">Completada</span>
                    }
                  </div>
                </div>
              }
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard {
      max-width: 1400px;
      margin: 0 auto;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.75rem;
      background: transparent;
      transition: all 0.3s ease;
    }

    /* Welcome Section */
    .welcome-section {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
    }

    .welcome-title {
      font-size: 1.875rem;
      font-weight: 700;
      color: var(--gray-900);
      margin: 0 0 0.25rem 0;
      line-height: 1.2;
      transition: color 0.3s ease;
    }

    :host-context(.dark) .welcome-title {
      color: var(--gray-100);
    }

    .welcome-subtitle {
      font-size: 0.9375rem;
      color: var(--gray-500);
      margin: 0;
      transition: color 0.3s ease;
    }

    :host-context(.dark) .welcome-subtitle {
      color: var(--gray-400);
    }

    .btn-sm {
      padding: 8px 1rem;
      font-size: 0.8125rem;
    }

    /* Stats Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(1, 1fr);
      gap: 1.25rem;
    }

    @media (min-width: 640px) {
      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (min-width: 1024px) {
      .stats-grid {
        grid-template-columns: repeat(4, 1fr);
      }
    }

    .stat-card {
      border-radius: 1rem;
      padding: 1.5rem;
      background: #fff;
      border: 1px solid var(--gray-200);
      transition: all 0.2s ease;
    }

    :host-context(.dark) .stat-card {
      background: #1e293b;
      border-color: #334155;
    }

    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    }

    .stat-card-brand { border-top: 3px solid var(--brand-500); }
    .stat-card-warning { border-top: 3px solid var(--warning-500); }
    .stat-card-success { border-top: 3px solid var(--success-500); }
    .stat-card-info { border-top: 3px solid var(--info-500); }

    .stat-card-inner {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .stat-icon-wrapper {
      width: 52px;
      height: 52px;
      border-radius: 0.875rem;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .stat-card-brand .stat-icon-wrapper {
      background: linear-gradient(135deg, var(--brand-500), var(--brand-600));
      color: #fff;
    }

    .stat-card-warning .stat-icon-wrapper {
      background: linear-gradient(135deg, var(--warning-500), var(--warning-600));
      color: #fff;
    }

    .stat-card-success .stat-icon-wrapper {
      background: linear-gradient(135deg, var(--success-500), var(--success-600));
      color: #fff;
    }

    .stat-card-info .stat-icon-wrapper {
      background: linear-gradient(135deg, var(--info-500), var(--info-600));
      color: #fff;
    }

    .stat-content { flex: 1; min-width: 0; }

    .stat-value {
      font-size: 2rem;
      font-weight: 700;
      color: var(--gray-900);
      margin: 0;
      line-height: 1;
      transition: color 0.3s ease;
    }

    :host-context(.dark) .stat-value {
      color: var(--gray-100);
    }

    .stat-label {
      font-size: 0.875rem;
      color: var(--gray-500);
      margin: 0.375rem 0 0 0;
      font-weight: 500;
      transition: color 0.3s ease;
    }

    :host-context(.dark) .stat-label {
      color: var(--gray-400);
    }

    .stat-footer {
      padding-top: 0.875rem;
      border-top: 1px solid var(--gray-100);
      transition: border-color 0.3s ease;
    }

    :host-context(.dark) .stat-footer {
      border-color: #334155;
    }

    .stat-trend-up {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--success-600);
    }

    .stat-trend-info {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.75rem;
      font-weight: 500;
      color: var(--gray-500);
    }

    :host-context(.dark) .stat-trend-info {
      color: var(--gray-400);
    }

    .stat-link {
      font-size: 0.875rem;
      color: var(--brand-600);
      font-weight: 500;
      text-decoration: none;
      transition: color 0.2s ease;
    }

    .stat-link:hover {
      color: var(--brand-700);
    }

    /* Cards */
    .card {
      background: #fff;
      border-radius: 1rem;
      border: 1px solid var(--gray-200);
      overflow: hidden;
      transition: all 0.3s ease;
    }

    :host-context(.dark) .card {
      background: #1e293b;
      border-color: #334155;
    }

    .card-elevated {
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
    }

    .card-header {
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid var(--gray-100);
      display: flex;
      align-items: center;
      justify-content: space-between;
      transition: border-color 0.3s ease;
    }

    :host-context(.dark) .card-header {
      border-color: #334155;
    }

    .card-title {
      font-size: 1rem;
      font-weight: 600;
      color: var(--gray-900);
      margin: 0;
      transition: color 0.3s ease;
    }

    :host-context(.dark) .card-title {
      color: var(--gray-100);
    }

    .card-description {
      font-size: 0.8125rem;
      color: var(--gray-500);
      margin: 0.25rem 0 0 0;
      transition: color 0.3s ease;
    }

    :host-context(.dark) .card-description {
      color: var(--gray-400);
    }

    .card-body { padding: 0; }

    /* Inscription List */
    .inscription-list {
      display: flex;
      flex-direction: column;
    }

    .inscription-item {
      display: flex;
      align-items: center;
      gap: 0.875rem;
      padding: 1rem 1.5rem;
      border-bottom: 1px solid var(--gray-100);
      transition: all 0.2s ease;
      cursor: pointer;
    }

    .inscription-item:last-child {
      border-bottom: none;
    }

    .inscription-item:hover {
      background: var(--gray-50);
    }

    :host-context(.dark) .inscription-item:hover {
      background: #334155;
    }

    .inscription-item.in-progress {
      background: rgba(245, 158, 11, 0.04);
    }

    :host-context(.dark) .inscription-item.in-progress {
      background: rgba(245, 158, 11, 0.08);
    }

    .inscription-avatar {
      width: 40px;
      height: 40px;
      border-radius: 0.75rem;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      font-size: 0.8125rem;
      font-weight: 600;
      background: var(--brand-100);
      color: var(--brand-600);
      transition: all 0.3s ease;
    }

    :host-context(.dark) .inscription-avatar {
      background: rgba(99, 102, 241, 0.2);
      color: var(--brand-400);
    }

    .inscription-avatar.música,
    .inscription-avatar.musica {
      background: var(--info-100);
      color: var(--info-600);
    }

    :host-context(.dark) .inscription-avatar.música,
    :host-context(.dark) .inscription-avatar.musica {
      background: rgba(59, 130, 246, 0.2);
      color: var(--info-400);
    }

    .inscription-avatar.danza {
      background: var(--warning-100);
      color: var(--warning-600);
    }

    :host-context(.dark) .inscription-avatar.danza {
      background: rgba(245, 158, 11, 0.2);
      color: var(--warning-400);
    }

    .inscription-info {
      flex: 1;
      min-width: 0;
    }

    .inscription-name {
      font-size: 0.9375rem;
      font-weight: 600;
      color: var(--gray-900);
      margin: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      transition: color 0.3s ease;
    }

    :host-context(.dark) .inscription-name {
      color: var(--gray-100);
    }

    .inscription-meta {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      font-size: 0.8125rem;
      color: var(--gray-500);
      margin: 0.125rem 0 0 0;
      transition: color 0.3s ease;
    }

    :host-context(.dark) .inscription-meta {
      color: var(--gray-400);
    }

    .inscription-separator {
      color: var(--gray-300);
    }

    :host-context(.dark) .inscription-separator {
      color: #475569;
    }

    .inscription-status {
      flex-shrink: 0;
    }

    .status-badge {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 9999px;
      font-size: 0.6875rem;
      font-weight: 600;
    }

    .status-pending {
      background: var(--gray-100);
      color: var(--gray-600);
    }

    :host-context(.dark) .status-pending {
      background: #334155;
      color: var(--gray-400);
    }

    .status-progress {
      background: rgba(245, 158, 11, 0.1);
      color: var(--warning-600);
    }

    :host-context(.dark) .status-progress {
      background: rgba(245, 158, 11, 0.2);
      color: var(--warning-400);
    }

    .status-completed {
      background: rgba(34, 197, 94, 0.1);
      color: var(--success-600);
    }

    :host-context(.dark) .status-completed {
      background: rgba(34, 197, 94, 0.2);
      color: var(--success-400);
    }

    /* Empty State */
    .empty-state {
      text-align: center;
      padding: 3rem 1.5rem;
    }

    .empty-icon-wrap {
      width: 64px;
      height: 64px;
      border-radius: 9999px;
      background: var(--success-50);
      color: var(--success-500);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1rem;
    }

    :host-context(.dark) .empty-icon-wrap {
      background: rgba(34, 197, 94, 0.15);
      color: var(--success-400);
    }

    .empty-title {
      font-size: 1rem;
      font-weight: 600;
      color: var(--gray-900);
      margin: 0 0 0.375rem;
    }

    :host-context(.dark) .empty-title {
      color: var(--gray-100);
    }

    .empty-desc {
      font-size: 0.875rem;
      color: var(--gray-500);
      margin: 0;
    }

    :host-context(.dark) .empty-desc {
      color: var(--gray-400);
    }

    /* Links */
    .text-link {
      font-size: 0.875rem;
      color: var(--brand-600);
      font-weight: 500;
      text-decoration: none;
      transition: color 0.2s ease;
    }

    .text-link:hover {
      color: var(--brand-700);
    }

    /* Buttons */
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 10px 1rem;
      font-size: 0.875rem;
      font-weight: 500;
      border-radius: 0.75rem;
      border: none;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.2s ease;
    }

    .btn-primary {
      background: var(--brand-600);
      color: #fff;
    }

    .btn-primary:hover {
      background: var(--brand-700);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
    }
  `]
})
export class JuradoPageComponent implements OnInit {
  auth = inject(AuthService);

  stats = signal<JuradoStats | null>(null);

  pendingInscriptions = signal<InscriptionToEvaluate[]>([]);

  ngOnInit(): void {
    this.loadStats();
    this.loadInscriptions();
  }

  private loadStats(): void {
    this.stats.set({
      inscriptions_assigned: 8,
      pending_evaluations: 5,
      completed_evaluations: 3,
      average_score: 7.5
    });
  }

  private loadInscriptions(): void {
    this.pendingInscriptions.set([
      {
        id: '1',
        artist_name: 'Carlos Méndez',
        stage_name: 'El Trovero',
        category: 'Música',
        subcategory: 'Solista Vocal',
        status: 'pending',
        submitted_at: '2026-06-20T10:00:00Z',
        evaluation_status: 'pending'
      },
      {
        id: '2',
        artist_name: 'María García',
        stage_name: 'María del Sur',
        category: 'Danza',
        subcategory: 'Pareja Tradicional',
        status: 'pending',
        submitted_at: '2026-06-19T14:30:00Z',
        evaluation_status: 'in_progress'
      },
      {
        id: '3',
        artist_name: 'Los Hermanos Rodríguez',
        stage_name: '',
        category: 'Música',
        subcategory: 'Conjunto Folklórico',
        status: 'pending',
        submitted_at: '2026-06-18T09:15:00Z',
        evaluation_status: 'pending'
      },
      {
        id: '4',
        artist_name: 'Ana Lucía Paredes',
        stage_name: 'Anita la Voz del Malvinas',
        category: 'Música',
        subcategory: 'Solista Instrumental',
        status: 'pending',
        submitted_at: '2026-06-17T16:45:00Z',
        evaluation_status: 'pending'
      },
      {
        id: '5',
        artist_name: 'Grupo Raíces',
        stage_name: '',
        category: 'Danza',
        subcategory: 'Grupo Danzas',
        status: 'pending',
        submitted_at: '2026-06-16T11:20:00Z',
        evaluation_status: 'pending'
      }
    ]);
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' });
  }
}
