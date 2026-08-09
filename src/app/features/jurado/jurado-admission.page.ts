import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InscriptionsService, Inscription } from '../../core/services/inscriptions.service';

interface ValidationCheck {
  label: string;
  passed: boolean;
  detail?: string;
}

@Component({
  selector: 'app-inscriptions-admission',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div class="header-left">
          <div class="header-icon admission">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
              <path d="m9 12 2 2 4-4"/>
            </svg>
          </div>
          <div>
            <h1 class="page-title">Admisión de Inscriptos</h1>
            <p class="page-subtitle">Validar documentación y autorizar acceso al escenario</p>
          </div>
        </div>
      </div>

      <!-- Stats -->
      <div class="stats-row">
        <div class="stat-card stat-pending">
          <div class="stat-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ pendingCount() }}</span>
            <span class="stat-label">Pendientes</span>
          </div>
        </div>
        <div class="stat-card stat-review">
          <div class="stat-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ reviewCount() }}</span>
            <span class="stat-label">En Revisión</span>
          </div>
        </div>
        <div class="stat-card stat-approved">
          <div class="stat-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/>
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ approvedCount() }}</span>
            <span class="stat-label">Aprobadas</span>
          </div>
        </div>
        <div class="stat-card stat-rejected">
          <div class="stat-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ rejectedCount() }}</span>
            <span class="stat-label">Rechazadas</span>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="card">
        <div class="card-header">
          <div class="filter-tabs">
            <button class="filter-tab" [class.active]="activeTab() === 'pending'" (click)="activeTab.set('pending')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
              </svg>
              Pendientes
              <span class="tab-count">{{ pendingCount() }}</span>
            </button>
            <button class="filter-tab" [class.active]="activeTab() === 'review'" (click)="activeTab.set('review')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
              </svg>
              En Revisión
              <span class="tab-count">{{ reviewCount() }}</span>
            </button>
            <button class="filter-tab" [class.active]="activeTab() === 'all'" (click)="activeTab.set('all')">
              Todas
              <span class="tab-count">{{ filteredByTab().length }}</span>
            </button>
          </div>
          <div class="search-bar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
            </svg>
            <input type="search" class="form-input search-input" placeholder="Buscar por nombre, DNI o artístico..." [ngModel]="searchQuery()" (ngModelChange)="searchQuery.set($event)" />
          </div>
        </div>

        <div class="filter-row">
          <select class="form-select" [ngModel]="categoryFilter()" (ngModelChange)="categoryFilter.set($event)">
            <option value="">Todas las categorías</option>
            <option value="Música">Música</option>
            <option value="Danza">Danza</option>
          </select>
          <select class="form-select" [ngModel]="subcategoryFilter()" (ngModelChange)="subcategoryFilter.set($event)">
            <option value="">Todas las subcategorías</option>
            @for (sub of availableSubcategories(); track sub) {
              <option [value]="sub">{{ sub }}</option>
            }
          </select>
        </div>

        <div class="card-body">
          @if (loading()) {
            <div class="loading-state">
              <div class="spinner-lg"></div>
              <p>Cargando inscripciones...</p>
            </div>
          } @else if (displayInscriptions().length === 0) {
            <div class="empty-state">
              <div class="empty-icon-wrap">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
                  <path d="m9 12 2 2 4-4"/>
                </svg>
              </div>
              <h3 class="empty-title">No hay inscripciones</h3>
              <p class="empty-desc">{{ searchQuery() || categoryFilter() ? 'No se encontraron inscripciones con los filtros aplicados.' : 'No hay inscripciones pendientes de admisión.' }}</p>
            </div>
          } @else {
            <div class="inscriptions-grid">
              @for (inscription of displayInscriptions(); track inscription.id) {
                <div class="admission-card" [class]="'status-' + inscription.status.toLowerCase()" (click)="toggleDetail(inscription.id)">
                  <div class="card-top">
                    <div class="artist-avatar" [class]="'cat-' + inscription.category.toLowerCase()">
                      {{ getInitials(inscription.full_name) }}
                    </div>
                    <div class="artist-info">
                      <h3 class="artist-name">{{ inscription.full_name }}</h3>
                      @if (inscription.stage_name) {
                        <p class="stage-name">"{{ inscription.stage_name }}"</p>
                      }
                    </div>
                    <span class="status-badge" [class]="'badge-' + inscription.status.toLowerCase()">
                      {{ formatStatus(inscription.status) }}
                    </span>
                  </div>

                  <div class="card-meta">
                    <div class="meta-item">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2Z"/>
                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                      </svg>
                      <span>{{ inscription.category }} › {{ inscription.subcategory }}</span>
                    </div>
                    <div class="meta-item">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                      </svg>
                      <span>{{ inscription.email }}</span>
                    </div>
                    @if (inscription.dni) {
                      <div class="meta-item">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <rect width="18" height="12" x="3" y="6" rx="2"/><path d="M7 6V4a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2"/>
                        </svg>
                        <span>DNI {{ inscription.dni }}</span>
                      </div>
                    }
                  </div>

                  <!-- Validation Summary -->
                  <div class="validation-summary">
                    @for (check of getValidationChecks(inscription); track check.label) {
                      <div class="check-item" [class.check-pass]="check.passed" [class.check-fail]="!check.passed">
                        @if (check.passed) {
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
                        } @else {
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
                        }
                        <span>{{ check.label }}</span>
                      </div>
                    }
                  </div>

                  <!-- Expanded Detail -->
                  @if (expandedId() === inscription.id) {
                    <div class="card-detail" (click)="$event.stopPropagation()">
                      <!-- Full Info -->
                      <div class="detail-section">
                        <h4 class="detail-section-title">Información del Artista</h4>
                        <div class="detail-grid">
                          @if (inscription.bio) {
                            <div class="detail-item full-width">
                              <span class="detail-label">Biografía</span>
                              <span class="detail-value bio-text">{{ inscription.bio }}</span>
                            </div>
                          }
                          @if (inscription.technical_needs) {
                            <div class="detail-item full-width">
                              <span class="detail-label">Necesidades Técnicas</span>
                              <span class="detail-value">{{ inscription.technical_needs }}</span>
                            </div>
                          }
                          @if (inscription.choreographer_name) {
                            <div class="detail-item">
                              <span class="detail-label">Coreógrafo</span>
                              <span class="detail-value">{{ inscription.choreographer_name }}</span>
                            </div>
                          }
                          @if (inscription.style) {
                            <div class="detail-item">
                              <span class="detail-label">Estilo</span>
                              <span class="detail-value">{{ inscription.style }}</span>
                            </div>
                          }
                        </div>
                      </div>

                      <!-- Repertoire / Themes -->
                      @if (inscription.themes && inscription.themes.length > 0) {
                        <div class="detail-section">
                          <h4 class="detail-section-title">
                            Repertorio / Obras
                            <span class="repertoire-count" [class.repertoire-ok]="inscription.themes.length >= 6" [class.repertoire-warn]="inscription.themes.length < 6">
                              {{ inscription.themes.length }}/6
                            </span>
                          </h4>
                          <div class="themes-list">
                            @for (theme of inscription.themes; track $index) {
                              <div class="theme-item">
                                <span class="theme-number">{{ $index + 1 }}</span>
                                <div class="theme-info">
                                  <strong>{{ theme.title || theme.name || 'Tema ' + ($index + 1) }}</strong>
                                  @if (theme.rhythm || theme.style) {
                                    <span class="theme-meta">{{ theme.rhythm || theme.style }}</span>
                                  }
                                  @if (theme.author || theme.composer) {
                                    <span class="theme-meta">de {{ theme.author || theme.composer }}</span>
                                  }
                                </div>
                              </div>
                            }
                          </div>
                        </div>
                      }

                      <!-- Members -->
                      @if (inscription.members && inscription.members.length > 0) {
                        <div class="detail-section">
                          <h4 class="detail-section-title">Miembros del Grupo</h4>
                          <div class="members-list">
                            @for (member of inscription.members; track $index) {
                              <div class="member-item">
                                <span class="member-avatar-sm">{{ getInitials(member.fullName || member.name || '') }}</span>
                                <div class="member-info">
                                  <strong>{{ member.fullName || member.name || 'Miembro' }}</strong>
                                  @if (member.role) {
                                    <span class="member-role">{{ member.role }}</span>
                                  }
                                  @if (member.instrument) {
                                    <span class="member-instrument">{{ member.instrument }}</span>
                                  }
                                </div>
                              </div>
                            }
                          </div>
                        </div>
                      }

                      <!-- Full Validation Checklist -->
                      <div class="detail-section">
                        <h4 class="detail-section-title">Checklist de Validación</h4>
                        <div class="checklist">
                          @for (check of getValidationChecks(inscription); track check.label) {
                            <div class="checklist-item" [class.check-pass]="check.passed" [class.check-fail]="!check.passed">
                              <div class="check-icon">
                                @if (check.passed) {
                                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
                                } @else {
                                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
                                }
                              </div>
                              <div class="check-content">
                                <span class="check-label">{{ check.label }}</span>
                                @if (check.detail) {
                                  <span class="check-detail">{{ check.detail }}</span>
                                }
                              </div>
                            </div>
                          }
                        </div>
                      </div>

                      <!-- Declaration Checks -->
                      <div class="detail-section">
                        <h4 class="detail-section-title">Declaraciones Juradas</h4>
                        <div class="declarations-grid">
                          <div class="declaration-item" [class.decl-ok]="inscription.accept_regulations" [class.decl-fail]="!inscription.accept_regulations">
                            <span class="decl-icon">{{ inscription.accept_regulations ? '✓' : '✗' }}</span>
                            <span>Reglamento aceptado</span>
                          </div>
                          <div class="declaration-item" [class.decl-ok]="inscription.accept_no_prior_win" [class.decl-fail]="!inscription.accept_no_prior_win">
                            <span class="decl-icon">{{ inscription.accept_no_prior_win ? '✓' : '✗' }}</span>
                            <span>Sin premios previos</span>
                          </div>
                          <div class="declaration-item" [class.decl-ok]="inscription.accept_not_juror_org" [class.decl-fail]="!inscription.accept_not_juror_org">
                            <span class="decl-icon">{{ inscription.accept_not_juror_org ? '✓' : '✗' }}</span>
                            <span>No es jurado/organizador</span>
                          </div>
                        </div>
                      </div>

                      <!-- Action Buttons -->
                      @if (inscription.status !== 'APROBADA' && inscription.status !== 'RECHAZADA') {
                        <div class="action-buttons">
                          <button class="btn-action btn-approve" (click)="admitParticipant(inscription)" [disabled]="processingId() === inscription.id">
                            @if (processingId() === inscription.id) {
                              <div class="btn-spinner"></div>
                            } @else {
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
                            }
                            Admitir / Aprobar
                          </button>
                          <button class="btn-action btn-reject" (click)="openRejectModal(inscription)" [disabled]="processingId() === inscription.id">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
                            Observar / Rechazar
                          </button>
                        </div>
                      }
                    </div>
                  }
                </div>
              }
            </div>
          }
        </div>
      </div>

      <!-- Reject Modal -->
      @if (rejectModalOpen()) {
        <div class="modal-overlay" (click)="closeRejectModal()">
          <div class="modal-container" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <div class="modal-icon reject">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
              </div>
              <div>
                <h3 class="modal-title">Observar / Rechazar</h3>
                <p class="modal-subtitle">{{ rejectTarget()?.full_name }}</p>
              </div>
            </div>
            <div class="modal-body">
              <label class="form-label">Motivo de observación (opcional)</label>
              <textarea
                class="form-textarea"
                rows="4"
                placeholder="Describa el motivo de la observación o rechazo..."
                [ngModel]="rejectReason()"
                (ngModelChange)="rejectReason.set($event)"
              ></textarea>
            </div>
            <div class="modal-actions">
              <button class="btn-modal btn-cancel" (click)="closeRejectModal()">Cancelar</button>
              <button class="btn-modal btn-confirm-reject" (click)="confirmReject()" [disabled]="processingId() === rejectTarget()?.id">
                @if (processingId() === rejectTarget()?.id) {
                  <div class="btn-spinner"></div>
                }
                Confirmar Rechazo
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Regulation Modal -->
      @if (regulationModalOpen()) {
        <div class="modal-overlay" (click)="regulationModalOpen.set(false)">
          <div class="modal-container modal-wide" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <div class="modal-icon info">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>
              </div>
              <div>
                <h3 class="modal-title">Reglamento Pre-Cosquín</h3>
                <p class="modal-subtitle">Requisitos de admisión</p>
              </div>
            </div>
            <div class="modal-body regulation-body">
              <div class="reg-section">
                <h4>Repertorio Obligatorio</h4>
                <p>Los participantes de rubros musicales deben presentar un repertorio de <strong>mínimo 6 obras</strong> folclóricas argentinas.</p>
              </div>
              <div class="reg-section">
                <h4>Canción Inédita</h4>
                <p>Para la categoría de Canción Inédita es obligatorio presentar <strong>partitura</strong> y <strong>letra cargada</strong> de la obra original.</p>
              </div>
              <div class="reg-section">
                <h4>Documentación Requerida</h4>
                <ul>
                  <li>DNI vigente</li>
                  <li>Declaración jurada de no haber ganado premios previos en el festival</li>
                  <li>Declaración de no ser jurado ni organizador del certamen</li>
                  <li>Aceptación del reglamento general</li>
                </ul>
              </div>
              <div class="reg-section">
                <h4>Evaluación</h4>
                <p>El jurado evaluará originalidad, calidad interpretativa, conexión con el folklore y cumplimiento del reglamento.</p>
              </div>
            </div>
            <div class="modal-actions">
              <button class="btn-modal btn-ok" (click)="regulationModalOpen.set(false)">Entendido</button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-container {
      padding: 1.5rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 0.875rem;
    }

    .header-icon {
      width: 44px;
      height: 44px;
      border-radius: 0.75rem;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .header-icon.admission {
      background: rgba(34,197,94,0.1);
      color: #16a34a;
    }

    :host-context(.dark) .header-icon.admission {
      background: rgba(74,222,128,0.15);
      color: #4ade80;
    }

    .page-title {
      font-size: 1.375rem;
      font-weight: 700;
      color: var(--gray-900);
      margin: 0;
      line-height: 1.2;
    }

    :host-context(.dark) .page-title {
      color: var(--gray-100);
    }

    .page-subtitle {
      font-size: 0.875rem;
      color: var(--gray-500);
      margin: 0.125rem 0 0;
    }

    /* Stats */
    .stats-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0.75rem;
      margin-bottom: 1.5rem;
    }

    @media (max-width: 768px) {
      .stats-row {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    .stat-card {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem 1.125rem;
      background: #fff;
      border: 1px solid var(--gray-200);
      border-radius: 0.75rem;
    }

    :host-context(.dark) .stat-card {
      background: #1a1f2e;
      border-color: #2d3348;
    }

    .stat-icon {
      width: 40px;
      height: 40px;
      border-radius: 0.625rem;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .stat-pending .stat-icon { background: rgba(245,158,11,0.1); color: #d97706; }
    .stat-review .stat-icon { background: rgba(59,130,246,0.1); color: #2563eb; }
    .stat-approved .stat-icon { background: rgba(34,197,94,0.1); color: #16a34a; }
    .stat-rejected .stat-icon { background: rgba(239,68,68,0.1); color: #dc2626; }

    :host-context(.dark) .stat-pending .stat-icon { background: rgba(251,191,36,0.15); color: #fbbf24; }
    :host-context(.dark) .stat-review .stat-icon { background: rgba(96,165,250,0.15); color: #60a5fa; }
    :host-context(.dark) .stat-approved .stat-icon { background: rgba(74,222,128,0.15); color: #4ade80; }
    :host-context(.dark) .stat-rejected .stat-icon { background: rgba(248,113,113,0.15); color: #f87171; }

    .stat-content {
      display: flex;
      flex-direction: column;
    }

    .stat-value {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--gray-900);
      line-height: 1.2;
    }

    :host-context(.dark) .stat-value {
      color: var(--gray-100);
    }

    .stat-label {
      font-size: 0.75rem;
      color: var(--gray-500);
      font-weight: 500;
    }

    /* Card */
    .card {
      background: #fff;
      border: 1px solid var(--gray-200);
      border-radius: 0.75rem;
      overflow: hidden;
    }

    :host-context(.dark) .card {
      background: #1a1f2e;
      border-color: #2d3348;
    }

    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.75rem 1.25rem;
      border-bottom: 1px solid var(--gray-200);
      flex-wrap: wrap;
      gap: 0.75rem;
    }

    :host-context(.dark) .card-header {
      border-color: #2d3348;
    }

    .filter-tabs {
      display: flex;
      gap: 0.25rem;
      flex-wrap: wrap;
    }

    .filter-tab {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.5rem 0.875rem;
      font-size: 0.8125rem;
      font-weight: 500;
      color: var(--gray-500);
      background: none;
      border: 1px solid transparent;
      border-radius: 0.5rem;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .filter-tab:hover {
      color: var(--gray-700);
      background: var(--gray-100);
    }

    .filter-tab.active {
      color: #16a34a;
      background: rgba(34,197,94,0.08);
      border-color: rgba(34,197,94,0.2);
    }

    :host-context(.dark) .filter-tab {
      color: var(--gray-400);
    }

    :host-context(.dark) .filter-tab:hover {
      color: var(--gray-200);
      background: rgba(255,255,255,0.05);
    }

    :host-context(.dark) .filter-tab.active {
      color: #4ade80;
      background: rgba(74,222,128,0.1);
    }

    .tab-count {
      font-size: 0.6875rem;
      padding: 0.125rem 0.375rem;
      background: var(--gray-100);
      border-radius: 9999px;
      color: var(--gray-500);
      font-weight: 600;
    }

    .filter-tab.active .tab-count {
      background: rgba(34,197,94,0.15);
      color: #16a34a;
    }

    :host-context(.dark) .tab-count {
      background: rgba(255,255,255,0.06);
      color: var(--gray-400);
    }

    :host-context(.dark) .filter-tab.active .tab-count {
      background: rgba(74,222,128,0.15);
      color: #4ade80;
    }

    .search-bar {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--gray-400);
      flex-shrink: 0;
    }

    .search-input {
      width: 240px;
    }

    .filter-row {
      padding: 0.75rem 1.25rem;
      display: flex;
      gap: 0.75rem;
      border-bottom: 1px solid var(--gray-200);
    }

    :host-context(.dark) .filter-row {
      border-color: #2d3348;
    }

    .form-select {
      padding: 0.5rem 2rem 0.5rem 0.75rem;
      font-size: 0.8125rem;
      font-weight: 500;
      color: var(--gray-700);
      background: white;
      border: 1px solid var(--gray-300);
      border-radius: 0.5rem;
      cursor: pointer;
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 0.625rem center;
    }

    :host-context(.dark) .form-select {
      background: #252b3b;
      border-color: #3d4460;
      color: var(--gray-200);
    }

    .form-input {
      padding: 0.5rem 0.75rem;
      font-size: 0.8125rem;
      border: 1px solid var(--gray-300);
      border-radius: 0.5rem;
      background: white;
      color: var(--gray-900);
      outline: none;
      transition: border-color 0.15s ease;
    }

    .form-input:focus {
      border-color: #16a34a;
      box-shadow: 0 0 0 3px rgba(34,197,94,0.1);
    }

    :host-context(.dark) .form-input {
      background: #252b3b;
      border-color: #3d4460;
      color: var(--gray-200);
    }

    .card-body {
      padding: 0;
    }

    /* Loading / Empty */
    .loading-state, .empty-state {
      text-align: center;
      padding: 4rem 2rem;
    }

    .loading-state p, .empty-state p {
      color: var(--gray-500);
      margin: 1rem 0 0;
    }

    .empty-icon-wrap {
      width: 80px;
      height: 80px;
      border-radius: 1.5rem;
      background: var(--gray-50);
      color: var(--gray-300);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.25rem;
    }

    :host-context(.dark) .empty-icon-wrap {
      background: rgba(255,255,255,0.03);
      color: var(--gray-600);
    }

    .empty-title {
      font-size: 1rem;
      font-weight: 600;
      color: var(--gray-900);
      margin: 0 0 0.5rem;
    }

    :host-context(.dark) .empty-title {
      color: var(--gray-200);
    }

    .empty-desc {
      font-size: 0.875rem;
      color: var(--gray-500);
      max-width: 360px;
      margin: 0 auto;
    }

    .spinner-lg {
      width: 36px;
      height: 36px;
      border: 3px solid var(--gray-200);
      border-top-color: #16a34a;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 0 auto;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    /* Admission Cards */
    .inscriptions-grid {
      display: flex;
      flex-direction: column;
    }

    .admission-card {
      padding: 1.25rem;
      border-bottom: 1px solid var(--gray-100);
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .admission-card:hover {
      background: var(--gray-50);
    }

    .admission-card:last-child {
      border-bottom: none;
    }

    :host-context(.dark) .admission-card {
      border-color: #2d3348;
    }

    :host-context(.dark) .admission-card:hover {
      background: rgba(255,255,255,0.02);
    }

    .card-top {
      display: flex;
      align-items: center;
      gap: 0.875rem;
      margin-bottom: 0.75rem;
    }

    .artist-avatar {
      width: 44px;
      height: 44px;
      border-radius: 0.75rem;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8125rem;
      font-weight: 700;
      flex-shrink: 0;
      letter-spacing: 0.02em;
    }

    .cat-música, .cat-musica {
      background: rgba(99,102,241,0.1);
      color: #6366f1;
    }

    .cat-danza {
      background: rgba(236,72,153,0.1);
      color: #ec4899;
    }

    :host-context(.dark) .cat-música,
    :host-context(.dark) .cat-musica {
      background: rgba(129,140,248,0.15);
      color: #818cf8;
    }

    :host-context(.dark) .cat-danza {
      background: rgba(244,114,182,0.15);
      color: #f472b6;
    }

    .artist-info {
      flex: 1;
      min-width: 0;
    }

    .artist-name {
      font-size: 0.9375rem;
      font-weight: 600;
      color: var(--gray-900);
      margin: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    :host-context(.dark) .artist-name {
      color: var(--gray-100);
    }

    .stage-name {
      font-size: 0.8125rem;
      color: #6366f1;
      margin: 0.125rem 0 0;
      font-style: italic;
    }

    :host-context(.dark) .stage-name {
      color: #818cf8;
    }

    .status-badge {
      font-size: 0.6875rem;
      font-weight: 600;
      padding: 0.25rem 0.625rem;
      border-radius: 9999px;
      flex-shrink: 0;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    .badge-pendiente { background: rgba(245,158,11,0.1); color: #d97706; }
    .badge-en_revision { background: rgba(59,130,246,0.1); color: #2563eb; }
    .badge-aprobada { background: rgba(34,197,94,0.1); color: #16a34a; }
    .badge-rechazada { background: rgba(239,68,68,0.1); color: #dc2626; }
    .badge-contrato_firmado { background: rgba(139,92,246,0.1); color: #7c3aed; }

    :host-context(.dark) .badge-pendiente { background: rgba(251,191,36,0.15); color: #fbbf24; }
    :host-context(.dark) .badge-en_revision { background: rgba(96,165,250,0.15); color: #60a5fa; }
    :host-context(.dark) .badge-aprobada { background: rgba(74,222,128,0.15); color: #4ade80; }
    :host-context(.dark) .badge-rechazada { background: rgba(248,113,113,0.15); color: #f87171; }
    :host-context(.dark) .badge-contrato_firmado { background: rgba(167,139,250,0.15); color: #a78bfa; }

    .card-meta {
      display: flex;
      gap: 1.25rem;
      flex-wrap: wrap;
      margin-bottom: 0.75rem;
    }

    .meta-item {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      font-size: 0.8125rem;
      color: var(--gray-500);
    }

    :host-context(.dark) .meta-item {
      color: var(--gray-400);
    }

    .meta-item svg {
      flex-shrink: 0;
      opacity: 0.5;
    }

    /* Validation Summary */
    .validation-summary {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .check-item {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      font-size: 0.75rem;
      font-weight: 500;
      padding: 0.25rem 0.5rem;
      border-radius: 0.375rem;
    }

    .check-item.check-pass {
      color: #16a34a;
      background: rgba(34,197,94,0.08);
    }

    .check-item.check-fail {
      color: #dc2626;
      background: rgba(239,68,68,0.08);
    }

    :host-context(.dark) .check-item.check-pass {
      color: #4ade80;
      background: rgba(74,222,128,0.1);
    }

    :host-context(.dark) .check-item.check-fail {
      color: #f87171;
      background: rgba(248,113,113,0.1);
    }

    /* Detail Panel */
    .card-detail {
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid var(--gray-200);
      animation: slideDown 0.2s ease;
    }

    :host-context(.dark) .card-detail {
      border-color: #2d3348;
    }

    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-4px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .detail-section {
      margin-bottom: 1.25rem;
    }

    .detail-section:last-child {
      margin-bottom: 0;
    }

    .detail-section-title {
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--gray-700);
      margin: 0 0 0.75rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    :host-context(.dark) .detail-section-title {
      color: var(--gray-300);
    }

    .repertoire-count {
      font-size: 0.6875rem;
      font-weight: 700;
      padding: 0.15em 0.5em;
      border-radius: 0.375rem;
    }

    .repertoire-ok {
      background: rgba(34,197,94,0.1);
      color: #16a34a;
    }

    .repertoire-warn {
      background: rgba(245,158,11,0.1);
      color: #d97706;
    }

    :host-context(.dark) .repertoire-ok { background: rgba(74,222,128,0.15); color: #4ade80; }
    :host-context(.dark) .repertoire-warn { background: rgba(251,191,36,0.15); color: #fbbf24; }

    .detail-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.875rem;
    }

    .detail-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .detail-item.full-width {
      grid-column: 1 / -1;
    }

    .detail-label {
      font-size: 0.6875rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--gray-400);
    }

    .detail-value {
      font-size: 0.875rem;
      color: var(--gray-900);
      line-height: 1.5;
    }

    :host-context(.dark) .detail-value {
      color: var(--gray-200);
    }

    .bio-text {
      font-style: italic;
      color: var(--gray-600);
    }

    :host-context(.dark) .bio-text {
      color: var(--gray-400);
    }

    /* Themes */
    .themes-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .theme-item {
      display: flex;
      align-items: flex-start;
      gap: 0.625rem;
      padding: 0.5rem 0.625rem;
      background: var(--gray-50);
      border-radius: 0.5rem;
    }

    :host-context(.dark) .theme-item {
      background: rgba(255,255,255,0.03);
    }

    .theme-number {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: rgba(99,102,241,0.1);
      color: #6366f1;
      font-size: 0.6875rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    :host-context(.dark) .theme-number {
      background: rgba(129,140,248,0.15);
      color: #818cf8;
    }

    .theme-info {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .theme-info strong {
      font-size: 0.8125rem;
      color: var(--gray-900);
    }

    :host-context(.dark) .theme-info strong {
      color: var(--gray-200);
    }

    .theme-meta {
      font-size: 0.75rem;
      color: var(--gray-500);
    }

    /* Members */
    .members-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .member-item {
      display: flex;
      align-items: center;
      gap: 0.625rem;
      padding: 0.5rem 0.625rem;
      background: var(--gray-50);
      border-radius: 0.5rem;
    }

    :host-context(.dark) .member-item {
      background: rgba(255,255,255,0.03);
    }

    .member-avatar-sm {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: rgba(99,102,241,0.1);
      color: #6366f1;
      font-size: 0.625rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    :host-context(.dark) .member-avatar-sm {
      background: rgba(129,140,248,0.15);
      color: #818cf8;
    }

    .member-info {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .member-info strong {
      font-size: 0.8125rem;
      color: var(--gray-900);
    }

    :host-context(.dark) .member-info strong {
      color: var(--gray-200);
    }

    .member-role, .member-instrument {
      font-size: 0.75rem;
      color: var(--gray-500);
    }

    /* Checklist */
    .checklist {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .checklist-item {
      display: flex;
      align-items: flex-start;
      gap: 0.625rem;
      padding: 0.625rem 0.75rem;
      border-radius: 0.5rem;
      font-size: 0.875rem;
    }

    .checklist-item.check-pass {
      background: rgba(34,197,94,0.06);
      color: var(--gray-900);
    }

    .checklist-item.check-fail {
      background: rgba(239,68,68,0.06);
      color: var(--gray-900);
    }

    :host-context(.dark) .checklist-item.check-pass {
      background: rgba(74,222,128,0.08);
    }

    :host-context(.dark) .checklist-item.check-fail {
      background: rgba(248,113,113,0.08);
    }

    .check-icon {
      flex-shrink: 0;
      margin-top: 0.1em;
    }

    .checklist-item.check-pass .check-icon { color: #16a34a; }
    .checklist-item.check-fail .check-icon { color: #dc2626; }

    :host-context(.dark) .checklist-item.check-pass .check-icon { color: #4ade80; }
    :host-context(.dark) .checklist-item.check-fail .check-icon { color: #f87171; }

    .check-content {
      display: flex;
      flex-direction: column;
      gap: 0.125rem;
    }

    .check-label {
      font-weight: 500;
    }

    .check-detail {
      font-size: 0.75rem;
      color: var(--gray-500);
    }

    /* Declarations */
    .declarations-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 0.5rem;
    }

    .declaration-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 0.75rem;
      border-radius: 0.5rem;
      font-size: 0.8125rem;
      font-weight: 500;
    }

    .declaration-item.decl-ok {
      background: rgba(34,197,94,0.06);
      color: #16a34a;
    }

    .declaration-item.decl-fail {
      background: rgba(239,68,68,0.06);
      color: #dc2626;
    }

    :host-context(.dark) .declaration-item.decl-ok {
      background: rgba(74,222,128,0.08);
      color: #4ade80;
    }

    :host-context(.dark) .declaration-item.decl-fail {
      background: rgba(248,113,113,0.08);
      color: #f87171;
    }

    .decl-icon {
      font-weight: 700;
      font-size: 1rem;
    }

    /* Action Buttons */
    .action-buttons {
      display: flex;
      gap: 0.75rem;
      margin-top: 1.25rem;
      padding-top: 1.25rem;
      border-top: 1px solid var(--gray-200);
      flex-wrap: wrap;
    }

    :host-context(.dark) .action-buttons {
      border-color: #2d3348;
    }

    .btn-action {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.875rem 1.5rem;
      font-size: 0.9375rem;
      font-weight: 600;
      border-radius: 0.75rem;
      border: none;
      cursor: pointer;
      transition: all 0.2s ease;
      flex: 1;
      min-width: 180px;
    }

    .btn-action:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-approve {
      background: #16a34a;
      color: #fff;
      box-shadow: 0 2px 8px rgba(22,163,74,0.3);
    }

    .btn-approve:hover:not(:disabled) {
      background: #15803d;
      box-shadow: 0 4px 12px rgba(22,163,74,0.4);
      transform: translateY(-1px);
    }

    .btn-reject {
      background: #fff;
      color: #dc2626;
      border: 2px solid rgba(239,68,68,0.3);
    }

    .btn-reject:hover:not(:disabled) {
      background: rgba(239,68,68,0.06);
      border-color: rgba(239,68,68,0.5);
    }

    :host-context(.dark) .btn-reject {
      background: transparent;
      color: #f87171;
      border-color: rgba(248,113,113,0.3);
    }

    :host-context(.dark) .btn-reject:hover:not(:disabled) {
      background: rgba(248,113,113,0.1);
      border-color: rgba(248,113,113,0.5);
    }

    .btn-spinner {
      width: 18px;
      height: 18px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }

    /* Modal */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      padding: 1rem;
      animation: fadeIn 0.15s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .modal-container {
      background: #fff;
      border-radius: 1rem;
      width: 100%;
      max-width: 440px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.2);
      animation: modalSlideUp 0.2s ease;
    }

    .modal-wide {
      max-width: 560px;
    }

    :host-context(.dark) .modal-container {
      background: #1a1f2e;
    }

    @keyframes modalSlideUp {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .modal-header {
      display: flex;
      align-items: center;
      gap: 0.875rem;
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid var(--gray-200);
    }

    :host-context(.dark) .modal-header {
      border-color: #2d3348;
    }

    .modal-icon {
      width: 40px;
      height: 40px;
      border-radius: 0.625rem;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .modal-icon.reject {
      background: rgba(239,68,68,0.1);
      color: #dc2626;
    }

    .modal-icon.info {
      background: rgba(59,130,246,0.1);
      color: #2563eb;
    }

    :host-context(.dark) .modal-icon.reject { background: rgba(248,113,113,0.15); color: #f87171; }
    :host-context(.dark) .modal-icon.info { background: rgba(96,165,250,0.15); color: #60a5fa; }

    .modal-title {
      font-size: 1rem;
      font-weight: 700;
      color: var(--gray-900);
      margin: 0;
    }

    :host-context(.dark) .modal-title {
      color: var(--gray-100);
    }

    .modal-subtitle {
      font-size: 0.8125rem;
      color: var(--gray-500);
      margin: 0.125rem 0 0;
    }

    .modal-body {
      padding: 1.25rem 1.5rem;
    }

    .form-label {
      display: block;
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--gray-700);
      margin-bottom: 0.5rem;
    }

    :host-context(.dark) .form-label {
      color: var(--gray-300);
    }

    .form-textarea {
      width: 100%;
      padding: 0.625rem 0.75rem;
      font-size: 0.875rem;
      border: 1px solid var(--gray-300);
      border-radius: 0.5rem;
      background: white;
      color: var(--gray-900);
      resize: vertical;
      outline: none;
      font-family: inherit;
      transition: border-color 0.15s ease;
    }

    .form-textarea:focus {
      border-color: #dc2626;
      box-shadow: 0 0 0 3px rgba(239,68,68,0.1);
    }

    :host-context(.dark) .form-textarea {
      background: #252b3b;
      border-color: #3d4460;
      color: var(--gray-200);
    }

    .modal-actions {
      display: flex;
      gap: 0.75rem;
      padding: 1rem 1.5rem;
      border-top: 1px solid var(--gray-200);
      justify-content: flex-end;
    }

    :host-context(.dark) .modal-actions {
      border-color: #2d3348;
    }

    .btn-modal {
      padding: 0.625rem 1.25rem;
      font-size: 0.875rem;
      font-weight: 600;
      border-radius: 0.5rem;
      border: none;
      cursor: pointer;
      transition: all 0.15s ease;
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
    }

    .btn-cancel {
      background: var(--gray-100);
      color: var(--gray-700);
    }

    :host-context(.dark) .btn-cancel {
      background: rgba(255,255,255,0.06);
      color: var(--gray-300);
    }

    .btn-cancel:hover {
      background: var(--gray-200);
    }

    .btn-confirm-reject {
      background: #dc2626;
      color: #fff;
    }

    .btn-confirm-reject:hover:not(:disabled) {
      background: #b91c1c;
    }

    .btn-confirm-reject:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-ok {
      background: #2563eb;
      color: #fff;
    }

    .btn-ok:hover {
      background: #1d4ed8;
    }

    .regulation-body {
      max-height: 400px;
      overflow-y: auto;
    }

    .reg-section {
      margin-bottom: 1.25rem;
    }

    .reg-section:last-child {
      margin-bottom: 0;
    }

    .reg-section h4 {
      font-size: 0.875rem;
      font-weight: 700;
      color: var(--gray-900);
      margin: 0 0 0.375rem;
    }

    :host-context(.dark) .reg-section h4 {
      color: var(--gray-200);
    }

    .reg-section p, .reg-section li {
      font-size: 0.8125rem;
      color: var(--gray-600);
      line-height: 1.6;
      margin: 0;
    }

    :host-context(.dark) .reg-section p,
    :host-context(.dark) .reg-section li {
      color: var(--gray-400);
    }

    .reg-section ul {
      padding-left: 1.25rem;
      margin: 0.25rem 0 0;
    }

    .reg-section li {
      margin-bottom: 0.25rem;
    }

    @media (max-width: 640px) {
      .page-container {
        padding: 1rem;
      }

      .action-buttons {
        flex-direction: column;
      }

      .btn-action {
        min-width: auto;
      }

      .filter-tabs {
        width: 100%;
      }

      .search-bar {
        width: 100%;
      }

      .search-input {
        width: 100%;
      }
    }
  `]
})
export class InscriptionsAdmissionComponent implements OnInit {
  private inscriptionsService = inject(InscriptionsService);

  loading = signal(true);
  inscriptions = signal<Inscription[]>([]);
  activeTab = signal<'pending' | 'review' | 'all'>('pending');
  searchQuery = signal('');
  categoryFilter = signal('');
  subcategoryFilter = signal('');
  expandedId = signal<string | null>(null);
  processingId = signal<string | null>(null);

  // Reject modal
  rejectModalOpen = signal(false);
  rejectTarget = signal<Inscription | null>(null);
  rejectReason = signal('');

  // Regulation modal
  regulationModalOpen = signal(false);

  ngOnInit(): void {
    this.loadInscriptions();
  }

  loadInscriptions(): void {
    this.loading.set(true);
    this.inscriptionsService.getInscriptions({ page_size: 200 }).subscribe({
      next: (res) => {
        this.inscriptions.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  filteredByTab = computed(() => {
    const tab = this.activeTab();
    const all = this.inscriptions();
    if (tab === 'pending') return all.filter(i => i.status === 'PENDIENTE');
    if (tab === 'review') return all.filter(i => i.status === 'EN_REVISION');
    return all;
  });

  displayInscriptions = computed(() => {
    let list = this.filteredByTab();
    const q = this.searchQuery().toLowerCase();
    const cat = this.categoryFilter();
    const sub = this.subcategoryFilter();

    if (q) {
      list = list.filter(i =>
        i.full_name.toLowerCase().includes(q) ||
        i.email.toLowerCase().includes(q) ||
        i.stage_name?.toLowerCase().includes(q) ||
        i.dni?.includes(q)
      );
    }
    if (cat) list = list.filter(i => i.category === cat);
    if (sub) list = list.filter(i => i.subcategory === sub);
    return list;
  });

  availableSubcategories = computed(() => {
    const cat = this.categoryFilter();
    const subs = new Set(this.inscriptions()
      .filter(i => !cat || i.category === cat)
      .map(i => i.subcategory)
    );
    return Array.from(subs).sort();
  });

  pendingCount = computed(() => this.inscriptions().filter(i => i.status === 'PENDIENTE').length);
  reviewCount = computed(() => this.inscriptions().filter(i => i.status === 'EN_REVISION').length);
  approvedCount = computed(() => this.inscriptions().filter(i => i.status === 'APROBADA').length);
  rejectedCount = computed(() => this.inscriptions().filter(i => i.status === 'RECHAZADA').length);

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  formatStatus(status: string): string {
    const map: Record<string, string> = {
      'PENDIENTE': 'Pendiente',
      'EN_REVISION': 'En Revisión',
      'APROBADA': 'Aprobada',
      'RECHAZADA': 'Rechazada',
      'CONTRATO_FIRMADO': 'Contrato Firmado'
    };
    return map[status] || status;
  }

  toggleDetail(id: string): void {
    this.expandedId.set(this.expandedId() === id ? null : id);
  }

  getValidationChecks(inscription: Inscription): ValidationCheck[] {
    const checks: ValidationCheck[] = [];

    // DNI
    checks.push({
      label: 'DNI presentado',
      passed: !!inscription.dni,
      detail: inscription.dni ? `DNI: ${inscription.dni}` : 'No se encontró DNI'
    });

    // Bio
    checks.push({
      label: 'Biografía cargada',
      passed: !!inscription.bio && inscription.bio.length >= 10,
      detail: inscription.bio ? `${inscription.bio.length} caracteres` : 'Falta biografía'
    });

    // Declarations
    checks.push({
      label: 'Reglamento aceptado',
      passed: !!inscription.accept_regulations
    });

    checks.push({
      label: 'Sin premios previos',
      passed: !!inscription.accept_no_prior_win
    });

    checks.push({
      label: 'No es jurado/organizador',
      passed: !!inscription.accept_not_juror_org
    });

    // Category-specific checks
    if (inscription.category === 'Música') {
      const themeCount = inscription.themes?.length || 0;
      checks.push({
        label: 'Repertorio mínimo (6 obras)',
        passed: themeCount >= 6,
        detail: `${themeCount} de 6 obras`
      });

      // Check for Canción Inédita
      if (inscription.subcategory === 'Canción Inédita') {
        checks.push({
          label: 'Partitura presentada',
          passed: false,
          detail: 'Requiere verificación manual de partitura'
        });
        checks.push({
          label: 'Letra de canción inédita',
          passed: !!inscription.songs_list,
          detail: inscription.songs_list ? 'Letra cargada' : 'Letra no encontrada'
        });
      }
    }

    // Members for groups
    if (['Conjunto Vocal', 'Conjunto Instrumental', 'Conjunto de Malambo', 'Conjunto de Baile'].includes(inscription.subcategory)) {
      checks.push({
        label: 'Miembros del grupo',
        passed: (inscription.members?.length || 0) >= 2,
        detail: `${inscription.members?.length || 0} miembros`
      });
    }

    // Dance list for dance categories
    if (inscription.category === 'Danza') {
      checks.push({
        label: 'Lista de bailes',
        passed: !!inscription.dance_list,
        detail: inscription.dance_list ? 'Cargada' : 'No presentada'
      });
    }

    return checks;
  }

  admitParticipant(inscription: Inscription): void {
    this.processingId.set(inscription.id);
    this.inscriptionsService.updateStatus(inscription.id, 'APROBADA').subscribe({
      next: () => {
        this.inscriptions.update(list =>
          list.map(i => i.id === inscription.id ? { ...i, status: 'APROBADA' } : i)
        );
        this.processingId.set(null);
        this.expandedId.set(null);
      },
      error: () => {
        this.processingId.set(null);
      }
    });
  }

  openRejectModal(inscription: Inscription): void {
    this.rejectTarget.set(inscription);
    this.rejectReason.set('');
    this.rejectModalOpen.set(true);
  }

  closeRejectModal(): void {
    this.rejectModalOpen.set(false);
    this.rejectTarget.set(null);
    this.rejectReason.set('');
  }

  confirmReject(): void {
    const target = this.rejectTarget();
    if (!target) return;

    this.processingId.set(target.id);
    this.inscriptionsService.updateStatus(target.id, 'RECHAZADA', this.rejectReason() || undefined).subscribe({
      next: () => {
        this.inscriptions.update(list =>
          list.map(i => i.id === target.id ? { ...i, status: 'RECHAZADA' } : i)
        );
        this.processingId.set(null);
        this.closeRejectModal();
        this.expandedId.set(null);
      },
      error: () => {
        this.processingId.set(null);
      }
    });
  }
}
