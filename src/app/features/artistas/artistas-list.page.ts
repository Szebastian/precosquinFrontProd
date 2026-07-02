import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InscriptionsService, Inscription } from '../../core/services/inscriptions.service';

@Component({
  selector: 'app-artistas-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div class="header-left">
          <div class="header-icon artistas">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <div>
            <h1 class="page-title">Artistas</h1>
            <p class="page-subtitle">Directorio de artistas inscriptos en el festival</p>
          </div>
        </div>
      </div>

      <div class="stats-row">
        <div class="stat-card stat-total">
          <div class="stat-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
              <rect width="8" height="4" x="8" y="2" rx="1" ry="1"/>
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ totalInscriptions() }}</span>
            <span class="stat-label">Total</span>
          </div>
        </div>
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

      <div class="card">
        <div class="card-header">
          <div class="filter-tabs">
            <button class="filter-tab" [class.active]="statusFilter() === ''" (click)="statusFilter.set('')">
              Todas
              <span class="tab-count">{{ totalInscriptions() }}</span>
            </button>
            <button class="filter-tab" [class.active]="statusFilter() === 'PENDIENTE'" (click)="statusFilter.set('PENDIENTE')">
              Pendientes
              <span class="tab-count">{{ pendingCount() }}</span>
            </button>
            <button class="filter-tab" [class.active]="statusFilter() === 'EN_REVISION'" (click)="statusFilter.set('EN_REVISION')">
              En Revisión
              <span class="tab-count">{{ reviewCount() }}</span>
            </button>
            <button class="filter-tab" [class.active]="statusFilter() === 'APROBADA'" (click)="statusFilter.set('APROBADA')">
              Aprobadas
              <span class="tab-count">{{ approvedCount() }}</span>
            </button>
            <button class="filter-tab" [class.active]="statusFilter() === 'RECHAZADA'" (click)="statusFilter.set('RECHAZADA')">
              Rechazadas
              <span class="tab-count">{{ rejectedCount() }}</span>
            </button>
          </div>
          <div class="search-bar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
            </svg>
            <input type="search" class="form-input search-input" placeholder="Buscar por nombre, email o nombre artístico..." [ngModel]="searchQuery()" (ngModelChange)="searchQuery.set($event)" />
          </div>
        </div>

        <div class="filter-row">
          <select class="form-select" [ngModel]="categoryFilter()" (ngModelChange)="categoryFilter.set($event)">
            <option value="">Todas las categorías</option>
            <option value="musica">Música</option>
            <option value="danza">Danza</option>
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
              <p>Cargando artistas...</p>
            </div>
          } @else if (filteredInscriptions().length === 0) {
            <div class="empty-state">
              <div class="empty-icon-wrap">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <h3 class="empty-title">No hay artistas</h3>
              <p class="empty-desc">{{ searchQuery() || statusFilter() || categoryFilter() ? 'No se encontraron artistas con los filtros aplicados.' : 'Aún no se han registrado artistas inscriptos.' }}</p>
            </div>
          } @else {
            <div class="inscriptions-grid">
              @for (inscription of filteredInscriptions(); track inscription.id) {
                <div class="inscription-card" [class]="'status-' + inscription.status.toLowerCase()" (click)="toggleDetail(inscription.id)">
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
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92Z"/>
                      </svg>
                      <span>{{ inscription.phone }}</span>
                    </div>
                    <div class="meta-item">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                      </svg>
                      <span>{{ inscription.email }}</span>
                    </div>
                  </div>

                  <div class="card-tags">
                    @if (inscription.style) {
                      <span class="tag">{{ inscription.style }}</span>
                    }
                    @if (inscription.proposal_name) {
                      <span class="tag tag-proposal">{{ inscription.proposal_name }}</span>
                    }
                    @if (inscription.age) {
                      <span class="tag">{{ inscription.age }} años</span>
                    }
                  </div>

                  @if (expandedId() === inscription.id) {
                    <div class="card-detail" (click)="$event.stopPropagation()">
                      <div class="detail-grid">
                        @if (inscription.dni) {
                          <div class="detail-item">
                            <span class="detail-label">DNI</span>
                            <span class="detail-value">{{ inscription.dni }}</span>
                          </div>
                        }
                        @if (inscription.birth_date) {
                          <div class="detail-item">
                            <span class="detail-label">Fecha de Nacimiento</span>
                            <span class="detail-value">{{ inscription.birth_date }}</span>
                          </div>
                        }
                        @if (inscription.address) {
                          <div class="detail-item full-width">
                            <span class="detail-label">Dirección</span>
                            <span class="detail-value">{{ inscription.address }}{{ inscription.locality ? ', ' + inscription.locality : '' }}{{ inscription.province ? ', ' + inscription.province : '' }}</span>
                          </div>
                        }
                        @if (inscription.bio) {
                          <div class="detail-item full-width">
                            <span class="detail-label">Biografía</span>
                            <span class="detail-value bio-text">{{ inscription.bio }}</span>
                          </div>
                        }
                        @if (inscription.choreographer_name) {
                          <div class="detail-item">
                            <span class="detail-label">Coreógrafo</span>
                            <span class="detail-value">{{ inscription.choreographer_name }}</span>
                          </div>
                        }
                        @if (inscription.dance_list) {
                          <div class="detail-item full-width">
                            <span class="detail-label">Lista de Bailes</span>
                            <span class="detail-value">{{ inscription.dance_list }}</span>
                          </div>
                        }
                        @if (inscription.themes && inscription.themes.length > 0) {
                          <div class="detail-item full-width">
                            <span class="detail-label">Temas / Obras</span>
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
                        @if (inscription.members && inscription.members.length > 0) {
                          <div class="detail-item full-width">
                            <span class="detail-label">Miembros del Grupo</span>
                            <div class="members-list">
                              @for (member of inscription.members; track $index) {
                                <div class="member-item">
                                  <span class="member-avatar-sm">{{ getInitials(member.fullName || member.name || '') }}</span>
                                  <div class="member-info">
                                    <strong>{{ member.fullName || member.name || 'Miembro' }}</strong>
                                    @if (member.role) {
                                      <span class="member-role">{{ member.role }}</span>
                                    }
                                    @if (member.age) {
                                      <span class="member-meta">{{ member.age }} años</span>
                                    }
                                  </div>
                                </div>
                              }
                            </div>
                          </div>
                        }
                      </div>
                      @if (inscription.status !== 'CONTRATO_FIRMADO') {
                        <div class="status-actions">
                          <span class="status-actions-label">Cambiar estado:</span>
                          <div class="status-actions-buttons">
                            @if (inscription.status === 'PENDIENTE') {
                              <button class="action-btn action-review" (click)="changeStatus(inscription, 'EN_REVISION')" [disabled]="updatingId() === inscription.id">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                                Revisión
                              </button>
                              <button class="action-btn action-approve" (click)="changeStatus(inscription, 'APROBADA')" [disabled]="updatingId() === inscription.id">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
                                Aprobar
                              </button>
                              <button class="action-btn action-reject" (click)="changeStatus(inscription, 'RECHAZADA')" [disabled]="updatingId() === inscription.id">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
                                Rechazar
                              </button>
                            }
                            @if (inscription.status === 'EN_REVISION') {
                              <button class="action-btn action-approve" (click)="changeStatus(inscription, 'APROBADA')" [disabled]="updatingId() === inscription.id">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
                                Aprobar
                              </button>
                              <button class="action-btn action-reject" (click)="changeStatus(inscription, 'RECHAZADA')" [disabled]="updatingId() === inscription.id">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
                                Rechazar
                              </button>
                            }
                            @if (inscription.status === 'RECHAZADA') {
                              <button class="action-btn action-review" (click)="changeStatus(inscription, 'EN_REVISION')" [disabled]="updatingId() === inscription.id">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                                Volver a Revisión
                              </button>
                            }
                          </div>
                        </div>
                      }
                      <div class="detail-footer">
                        <span class="detail-date">Inscrito: {{ formatDate(inscription.created_at) }}</span>
                        <span class="detail-id">ID: {{ inscription.id | slice:0:8 }}</span>
                      </div>
                    </div>
                  }
                </div>
              }
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { color: var(--gray-900); }

    .page-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 1.5rem;
    }

    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.75rem;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .header-icon {
      width: 48px;
      height: 48px;
      border-radius: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      background: rgba(34, 197, 94, 0.1);
      color: var(--success-500, #22c55e);
    }

    .page-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--gray-900);
      margin: 0 0 0.25rem;
    }

    .page-subtitle {
      font-size: 0.875rem;
      color: var(--gray-500);
      margin: 0;
    }

    /* Stats */
    .stats-row {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 1rem;
      margin-bottom: 1.75rem;
    }

    .stat-card {
      background: var(--gray-100);
      border-radius: 0.75rem;
      padding: 1rem 1.25rem;
      display: flex;
      align-items: center;
      gap: 0.875rem;
      border: 1px solid var(--gray-200);
      transition: all 0.2s ease;
    }

    .stat-card:hover {
      border-color: var(--gray-300);
      box-shadow: 0 2px 8px rgba(0,0,0,0.04);
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

    .stat-total .stat-icon { background: rgba(99,102,241,0.1); color: #6366f1; }
    .stat-pending .stat-icon { background: rgba(245,158,11,0.1); color: #f59e0b; }
    .stat-review .stat-icon { background: rgba(59,130,246,0.1); color: #3b82f6; }
    .stat-approved .stat-icon { background: rgba(34,197,94,0.1); color: #22c55e; }
    .stat-rejected .stat-icon { background: rgba(239,68,68,0.1); color: #ef4444; }

    .stat-content {
      display: flex;
      flex-direction: column;
    }

    .stat-value {
      font-size: 1.375rem;
      font-weight: 700;
      color: var(--gray-900);
      line-height: 1.2;
    }

    .stat-label {
      font-size: 0.75rem;
      color: var(--gray-500);
      font-weight: 500;
    }

    /* Card */
    .card {
      background: var(--gray-100);
      border-radius: 0.75rem;
      border: 1px solid var(--gray-200);
      overflow: hidden;
    }

    .card-header {
      padding: 1rem 1.25rem;
      border-bottom: 1px solid var(--gray-200);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .filter-tabs {
      display: flex;
      gap: 0.25rem;
      flex-wrap: wrap;
    }

    .filter-tab {
      padding: 0.5rem 0.875rem;
      font-size: 0.8125rem;
      font-weight: 500;
      color: var(--gray-500);
      background: none;
      border: none;
      border-radius: 0.5rem;
      cursor: pointer;
      transition: all 0.15s ease;
      display: flex;
      align-items: center;
      gap: 0.375rem;
    }

    .filter-tab:hover {
      color: var(--gray-700);
      background: var(--gray-200);
    }

    .filter-tab.active {
      color: var(--brand-500, #6366f1);
      background: rgba(99,102,241,0.08);
    }

    .tab-count {
      font-size: 0.6875rem;
      padding: 0.125rem 0.375rem;
      background: var(--gray-200);
      border-radius: 9999px;
      color: var(--gray-500);
      font-weight: 600;
    }

    .filter-tab.active .tab-count {
      background: rgba(99,102,241,0.15);
      color: var(--brand-500, #6366f1);
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
      padding: 0.5rem 0.75rem;
      font-size: 0.8125rem;
      color: var(--gray-900);
      background: var(--gray-200);
      border: 1px solid var(--gray-300);
      border-radius: 0.5rem;
    }

    .search-input::placeholder { color: var(--gray-500); }

    .filter-row {
      padding: 0.75rem 1.25rem;
      display: flex;
      gap: 0.75rem;
      border-bottom: 1px solid var(--gray-200);
    }

    .form-select {
      padding: 0.5rem 2rem 0.5rem 0.75rem;
      font-size: 0.8125rem;
      font-weight: 500;
      color: var(--gray-700);
      background-color: var(--gray-200);
      border: 1px solid var(--gray-300);
      border-radius: 0.5rem;
      cursor: pointer;
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 0.625rem center;
    }

    .card-body { padding: 0; }

    /* Loading / Empty */
    .loading-state, .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      color: var(--gray-500);
    }

    .loading-state p, .empty-state p {
      color: var(--gray-500);
      margin: 1rem 0 0;
    }

    .empty-icon-wrap {
      width: 80px;
      height: 80px;
      border-radius: 1.5rem;
      background: var(--gray-200);
      color: var(--gray-400);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.25rem;
    }

    .empty-title {
      font-size: 1rem;
      font-weight: 600;
      color: var(--gray-900);
      margin: 0 0 0.5rem;
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
      border-top-color: var(--brand-500, #6366f1);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 0 auto;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    /* Inscriptions Grid */
    .inscriptions-grid {
      display: flex;
      flex-direction: column;
    }

    .inscription-card {
      padding: 1.25rem;
      border-bottom: 1px solid var(--gray-200);
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .inscription-card:hover {
      background: var(--gray-200);
    }

    .inscription-card:last-child {
      border-bottom: none;
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
      color: var(--brand-500, #6366f1);
    }

    .cat-danza {
      background: rgba(236,72,153,0.1);
      color: #ec4899;
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

    .stage-name {
      font-size: 0.8125rem;
      color: var(--brand-500, #6366f1);
      margin: 0.125rem 0 0;
      font-style: italic;
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
    .badge-contrato_firmado { background: rgba(168,85,247,0.1); color: #9333ea; }

    .card-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      margin-bottom: 0.5rem;
    }

    .meta-item {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      font-size: 0.8125rem;
      color: var(--gray-500);
    }

    .card-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.375rem;
      margin-top: 0.5rem;
    }

    .tag {
      font-size: 0.6875rem;
      padding: 0.1875rem 0.5rem;
      background: var(--gray-200);
      color: var(--gray-600);
      border-radius: 0.25rem;
      font-weight: 500;
    }

    .tag-proposal {
      background: rgba(99,102,241,0.08);
      color: var(--brand-500, #6366f1);
    }

    /* Detail */
    .card-detail {
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid var(--gray-200);
    }

    .detail-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.75rem;
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
      color: var(--gray-500);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .detail-value {
      font-size: 0.8125rem;
      color: var(--gray-700);
      line-height: 1.4;
    }

    .bio-text {
      white-space: pre-wrap;
    }

    .themes-list {
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
    }

    .theme-item {
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
      padding: 0.5rem 0.625rem;
      background: var(--gray-200);
      border-radius: 0.375rem;
    }

    .theme-number {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: rgba(99,102,241,0.1);
      color: var(--brand-500, #6366f1);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.625rem;
      font-weight: 700;
      flex-shrink: 0;
    }

    .theme-info {
      display: flex;
      flex-direction: column;
    }

    .theme-info strong {
      font-size: 0.8125rem;
      color: var(--gray-900);
    }

    .theme-meta {
      font-size: 0.75rem;
      color: var(--gray-500);
    }

    .members-list {
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
    }

    .member-item {
      display: flex;
      align-items: center;
      gap: 0.625rem;
      padding: 0.5rem 0.75rem;
      background: var(--gray-200);
      border-radius: 0.5rem;
    }

    .member-avatar-sm {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: var(--gray-300);
      color: var(--gray-700);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.625rem;
      font-weight: 700;
      flex-shrink: 0;
    }

    .member-info {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .member-info strong {
      font-size: 0.8125rem;
      color: var(--gray-900);
    }

    .member-role {
      font-size: 0.6875rem;
      padding: 0.125rem 0.375rem;
      background: rgba(99,102,241,0.08);
      color: var(--brand-500, #6366f1);
      border-radius: 0.25rem;
      font-weight: 500;
    }

    .member-meta {
      font-size: 0.75rem;
      color: var(--gray-500);
    }

    .detail-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 1rem;
      padding-top: 0.75rem;
      border-top: 1px solid var(--gray-200);
    }

    .detail-date, .detail-id {
      font-size: 0.75rem;
      color: var(--gray-400);
    }

    /* Status Actions */
    .status-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid var(--gray-200);
      flex-wrap: wrap;
    }

    .status-actions-label {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--gray-500);
      text-transform: uppercase;
      letter-spacing: 0.04em;
      flex-shrink: 0;
    }

    .status-actions-buttons {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .action-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.4375rem 0.875rem;
      font-size: 0.8125rem;
      font-weight: 600;
      border: none;
      border-radius: 0.5rem;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .action-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .action-review {
      background: rgba(59,130,246,0.1);
      color: #2563eb;
    }
    .action-review:hover:not(:disabled) {
      background: rgba(59,130,246,0.2);
    }

    .action-approve {
      background: rgba(34,197,94,0.1);
      color: #16a34a;
    }
    .action-approve:hover:not(:disabled) {
      background: rgba(34,197,94,0.2);
    }

    .action-reject {
      background: rgba(239,68,68,0.1);
      color: #dc2626;
    }
    .action-reject:hover:not(:disabled) {
      background: rgba(239,68,68,0.2);
    }

    @media (max-width: 768px) {
      .stats-row { grid-template-columns: repeat(2, 1fr); }
      .stats-row > :last-child { grid-column: 1 / -1; }
      .card-header { flex-direction: column; align-items: stretch; }
      .search-input { width: 100%; }
      .filter-row { flex-direction: column; }
      .detail-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class ArtistasListPageComponent implements OnInit {
  private inscriptionsService = inject(InscriptionsService);

  allInscriptions = signal<Inscription[]>([]);
  loading = signal(true);
  statusFilter = signal('');
  categoryFilter = signal('');
  subcategoryFilter = signal('');
  searchQuery = signal('');
  expandedId = signal<string | null>(null);
  updatingId = signal<string | null>(null);

  totalInscriptions = computed(() => this.allInscriptions().length);
  pendingCount = computed(() => this.allInscriptions().filter(i => i.status === 'PENDIENTE').length);
  reviewCount = computed(() => this.allInscriptions().filter(i => i.status === 'EN_REVISION').length);
  approvedCount = computed(() => this.allInscriptions().filter(i => i.status === 'APROBADA').length);
  rejectedCount = computed(() => this.allInscriptions().filter(i => i.status === 'RECHAZADA').length);

  availableSubcategories = computed(() => {
    const cat = this.categoryFilter();
    const subs = new Set<string>();
    for (const ins of this.allInscriptions()) {
      if (!cat || ins.category === cat) {
        subs.add(ins.subcategory);
      }
    }
    return Array.from(subs).sort();
  });

  filteredInscriptions = computed(() => {
    let result = this.allInscriptions();
    const status = this.statusFilter();
    const cat = this.categoryFilter();
    const sub = this.subcategoryFilter();
    const q = this.searchQuery().toLowerCase();

    if (status) result = result.filter(i => i.status === status);
    if (cat) result = result.filter(i => i.category === cat);
    if (sub) result = result.filter(i => i.subcategory === sub);
    if (q) {
      result = result.filter(i =>
        i.full_name.toLowerCase().includes(q) ||
        i.email.toLowerCase().includes(q) ||
        (i.stage_name && i.stage_name.toLowerCase().includes(q))
      );
    }

    return result;
  });

  ngOnInit(): void {
    this.loadInscriptions();
  }

  loadInscriptions(): void {
    this.loading.set(true);
    this.inscriptionsService.getInscriptions({ page_size: 100 }).subscribe({
      next: (res) => {
        this.allInscriptions.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  toggleDetail(id: string): void {
    this.expandedId.update(current => current === id ? null : id);
  }

  changeStatus(inscription: Inscription, newStatus: string): void {
    this.updatingId.set(inscription.id);
    this.inscriptionsService.updateStatus(inscription.id, newStatus).subscribe({
      next: () => {
        this.allInscriptions.update(list =>
          list.map(i => i.id === inscription.id ? { ...i, status: newStatus } : i)
        );
        this.updatingId.set(null);
      },
      error: (err) => {
        console.error('Error changing status:', err);
        alert('Error al cambiar estado: ' + (err?.error?.detail || err.message || 'Error desconocido'));
        this.updatingId.set(null);
      }
    });
  }

  getInitials(name: string): string {
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  }

  formatStatus(status: string): string {
    const map: Record<string, string> = {
      PENDIENTE: 'Pendiente',
      EN_REVISION: 'En Revisión',
      APROBADA: 'Aprobada',
      RECHAZADA: 'Rechazada',
      CONTRATO_FIRMADO: 'Contrato Firmado',
    };
    return map[status] || status;
  }

  formatDate(dateStr: string): string {
    try {
      return new Date(dateStr).toLocaleDateString('es-AR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  }
}
