import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InscriptionsService, Inscription } from '../../core/services/inscriptions.service';

@Component({
  selector: 'app-inscripciones-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div class="header-left">
          <div class="header-icon admin">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
              <rect width="8" height="4" x="8" y="2" rx="1" ry="1"/>
            </svg>
          </div>
          <div>
            <h1 class="page-title">Inscripciones</h1>
            <p class="page-subtitle">Gestiona todas las inscripciones del festival</p>
          </div>
        </div>
      </div>

      <div class="stats-row">
        <div class="stat-card stat-total">
          <div class="stat-content">
            <span class="stat-value">{{ totalInscriptions() }}</span>
            <span class="stat-label">Total</span>
          </div>
        </div>
        <div class="stat-card stat-pending">
          <div class="stat-content">
            <span class="stat-value">{{ pendingCount() }}</span>
            <span class="stat-label">Pendientes</span>
          </div>
        </div>
        <div class="stat-card stat-review">
          <div class="stat-content">
            <span class="stat-value">{{ reviewCount() }}</span>
            <span class="stat-label">En Revisión</span>
          </div>
        </div>
        <div class="stat-card stat-approved">
          <div class="stat-content">
            <span class="stat-value">{{ approvedCount() }}</span>
            <span class="stat-label">Aprobadas</span>
          </div>
        </div>
        <div class="stat-card stat-rejected">
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
              Todas <span class="tab-count">{{ totalInscriptions() }}</span>
            </button>
            <button class="filter-tab" [class.active]="statusFilter() === 'PENDIENTE'" (click)="statusFilter.set('PENDIENTE')">
              Pendientes <span class="tab-count">{{ pendingCount() }}</span>
            </button>
            <button class="filter-tab" [class.active]="statusFilter() === 'EN_REVISION'" (click)="statusFilter.set('EN_REVISION')">
              En Revisión <span class="tab-count">{{ reviewCount() }}</span>
            </button>
            <button class="filter-tab" [class.active]="statusFilter() === 'APROBADA'" (click)="statusFilter.set('APROBADA')">
              Aprobadas <span class="tab-count">{{ approvedCount() }}</span>
            </button>
            <button class="filter-tab" [class.active]="statusFilter() === 'RECHAZADA'" (click)="statusFilter.set('RECHAZADA')">
              Rechazadas <span class="tab-count">{{ rejectedCount() }}</span>
            </button>
          </div>
          <div class="search-bar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
            </svg>
            <input type="search" class="form-input search-input" placeholder="Buscar por nombre, email o artístico..." [ngModel]="searchQuery()" (ngModelChange)="searchQuery.set($event)" />
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
          } @else if (filteredInscriptions().length === 0) {
            <div class="empty-state">
              <div class="empty-icon-wrap">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                  <rect width="8" height="4" x="8" y="2" rx="1" ry="1"/>
                </svg>
              </div>
              <h3 class="empty-title">No hay inscripciones</h3>
              <p class="empty-desc">{{ searchQuery() || statusFilter() || categoryFilter() ? 'No se encontraron inscripciones con los filtros aplicados.' : 'Aún no se han registrado inscripciones de artistas.' }}</p>
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
                        @if (inscription.technical_needs) {
                          <div class="detail-item full-width">
                            <span class="detail-label">Necesidades Técnicas</span>
                            <span class="detail-value">{{ inscription.technical_needs }}</span>
                          </div>
                        }
                        @if (inscription.rider_tecnico) {
                          <div class="detail-item full-width">
                            <span class="detail-label">Rider Técnico</span>
                            <div class="rider-summary">
                              @if (inscription.rider_tecnico.sonido?.microfonos?.length) {
                                <span class="rider-tag">Micrófonos: {{ inscription.rider_tecnico.sonido.microfonos.join(', ') }}</span>
                              }
                              @if (inscription.rider_tecnico.sonido?.diBoxes) {
                                <span class="rider-tag">DI Boxes: {{ inscription.rider_tecnico.sonido.diBoxes }}</span>
                              }
                              @if (inscription.rider_tecnico.stagePlotInstruments?.length) {
                                <span class="rider-tag">Stage Plot: {{ inscription.rider_tecnico.stagePlotInstruments.length }} instrumentos</span>
                              }
                              @if (inscription.rider_tecnico.monitorCount) {
                                <span class="rider-tag">Monitores: {{ inscription.rider_tecnico.monitorCount }}</span>
                              }
                              @if (inscription.rider_tecnico.otros) {
                                <span class="rider-tag">{{ inscription.rider_tecnico.otros }}</span>
                              }
                            </div>
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
                        @if (inscription.accompanying_persons && inscription.accompanying_persons.length > 0) {
                          <div class="detail-item full-width">
                            <span class="detail-label">Acompañantes</span>
                            <div class="members-list">
                              @for (person of inscription.accompanying_persons; track $index) {
                                <div class="member-item">
                                  <span class="member-avatar-sm">{{ getInitials(person.fullName || '') }}</span>
                                  <div class="member-info">
                                    <strong>{{ person.fullName || 'Sin nombre' }}</strong>
                                    @if (person.dni) {
                                      <span class="member-role">DNI {{ person.dni }}</span>
                                    }
                                  </div>
                                </div>
                              }
                            </div>
                          </div>
                        }
                      </div>

                      <div class="detail-footer">
                        <span class="detail-date">Inscrito: {{ formatDate(inscription.created_at) }}</span>
                        <span class="detail-id">ID: {{ inscription.id | slice:0:8 }}</span>
                      </div>

                      <div class="admin-actions">
                        @if (inscription.status !== 'APROBADA') {
                          <button class="action-btn approve" (click)="updateStatus(inscription.id, 'APROBADA')" [disabled]="updatingId() === inscription.id">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 11 3 3L22 4"/></svg>
                            Aprobar
                          </button>
                        }
                        @if (inscription.status !== 'RECHAZADA') {
                          <button class="action-btn reject" (click)="updateStatus(inscription.id, 'RECHAZADA')" [disabled]="updatingId() === inscription.id">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
                            Rechazar
                          </button>
                        }
                        @if (inscription.status === 'PENDIENTE') {
                          <button class="action-btn review" (click)="updateStatus(inscription.id, 'EN_REVISION')" [disabled]="updatingId() === inscription.id">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                            Revisar
                          </button>
                        }
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
    .page-container { max-width: 1200px; margin: 0 auto; padding: 1.5rem; }
    .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.75rem; }
    .header-left { display: flex; align-items: center; gap: 1rem; }
    .header-icon { width: 48px; height: 48px; border-radius: 1rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .header-icon.admin { background: rgba(37, 99, 235, 0.1); color: #2563eb; }
    .page-title { font-size: 1.5rem; font-weight: 700; color: var(--gray-900); margin: 0 0 0.25rem; }
    .page-subtitle { font-size: 0.875rem; color: var(--gray-500); margin: 0; }

    .stats-row { display: grid; grid-template-columns: repeat(5, 1fr); gap: 1rem; margin-bottom: 1.75rem; }
    .stat-card { background: white; border-radius: 0.75rem; padding: 1rem 1.25rem; display: flex; align-items: center; gap: 0.875rem; border: 1px solid var(--gray-200); }
    .stat-value { font-size: 1.5rem; font-weight: 700; color: var(--gray-900); display: block; }
    .stat-label { font-size: 0.75rem; color: var(--gray-500); }
    .stat-total .stat-value { color: #2563eb; }
    .stat-pending .stat-value { color: #f59e0b; }
    .stat-review .stat-value { color: #8b5cf6; }
    .stat-approved .stat-value { color: #22c55e; }
    .stat-rejected .stat-value { color: #ef4444; }

    .card { background: white; border-radius: 0.75rem; border: 1px solid var(--gray-200); overflow: hidden; }
    .card-header { display: flex; align-items: center; justify-content: space-between; padding: 1rem 1.5rem; border-bottom: 1px solid var(--gray-100); flex-wrap: wrap; gap: 0.75rem; }
    .filter-tabs { display: flex; gap: 0.25rem; flex-wrap: wrap; }
    .filter-tab { padding: 0.5rem 0.75rem; font-size: 0.8125rem; font-weight: 500; color: var(--gray-500); background: none; border: none; border-radius: 0.5rem; cursor: pointer; transition: all 0.15s; display: flex; align-items: center; gap: 0.375rem; }
    .filter-tab:hover { color: var(--gray-700); background: var(--gray-100); }
    .filter-tab.active { color: #2563eb; background: rgba(37, 99, 235, 0.08); font-weight: 600; }
    .tab-count { font-size: 0.6875rem; background: var(--gray-100); padding: 0.125rem 0.375rem; border-radius: 999px; }
    .filter-tab.active .tab-count { background: rgba(37, 99, 235, 0.15); color: #2563eb; }
    .search-bar { display: flex; align-items: center; gap: 0.5rem; color: var(--gray-400); }
    .search-input { max-width: 280px; }
    .filter-row { display: flex; gap: 0.75rem; padding: 0.75rem 1.5rem; border-bottom: 1px solid var(--gray-100); }
    .filter-row select { max-width: 200px; }
    .card-body { padding: 0; }

    .loading-state { text-align: center; padding: 3rem; color: var(--gray-500); }
    .spinner-lg { width: 32px; height: 32px; border: 3px solid var(--gray-200); border-top-color: #2563eb; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 1rem; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .empty-state { text-align: center; padding: 3rem; }
    .empty-icon-wrap { color: var(--gray-300); margin-bottom: 1rem; }
    .empty-title { font-size: 1rem; font-weight: 600; color: var(--gray-900); margin-bottom: 0.5rem; }
    .empty-desc { font-size: 0.875rem; color: var(--gray-500); max-width: 360px; margin: 0 auto; }

    .inscriptions-grid { display: flex; flex-direction: column; }
    .inscription-card { padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--gray-100); cursor: pointer; transition: background 0.15s; }
    .inscription-card:hover { background: var(--gray-50); }
    .inscription-card:last-child { border-bottom: none; }

    .card-top { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem; }
    .artist-avatar { width: 40px; height: 40px; border-radius: 0.5rem; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700; color: white; flex-shrink: 0; }
    .cat-música { background: #2563eb; }
    .cat-danza { background: #8b5cf6; }
    .artist-info { flex: 1; min-width: 0; }
    .artist-name { font-size: 0.9375rem; font-weight: 600; color: var(--gray-900); margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .stage-name { font-size: 0.8125rem; color: var(--gray-500); margin: 0.125rem 0 0; font-style: italic; }

    .status-badge { font-size: 0.6875rem; font-weight: 600; padding: 0.25rem 0.625rem; border-radius: 999px; white-space: nowrap; flex-shrink: 0; }
    .badge-pendiente { background: #fef3c7; color: #92400e; }
    .badge-en_revision { background: #ede9fe; color: #5b21b6; }
    .badge-aprobada { background: #dcfce7; color: #166534; }
    .badge-rechazada { background: #fee2e2; color: #991b1b; }
    .badge-contrato_firmado { background: #dbeafe; color: #1e40af; }

    .card-meta { display: flex; gap: 1.25rem; flex-wrap: wrap; margin-bottom: 0.5rem; }
    .meta-item { display: flex; align-items: center; gap: 0.375rem; font-size: 0.8125rem; color: var(--gray-500); }
    .meta-item svg { color: var(--gray-400); flex-shrink: 0; }

    .card-tags { display: flex; gap: 0.375rem; flex-wrap: wrap; }
    .tag { font-size: 0.6875rem; padding: 0.25rem 0.5rem; background: var(--gray-100); color: var(--gray-600); border-radius: 0.25rem; }
    .tag-proposal { background: rgba(37, 99, 235, 0.08); color: #2563eb; }

    .card-detail { margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--gray-100); }
    .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
    .detail-item { display: flex; flex-direction: column; gap: 0.125rem; }
    .detail-item.full-width { grid-column: 1 / -1; }
    .detail-label { font-size: 0.6875rem; font-weight: 600; color: var(--gray-400); text-transform: uppercase; letter-spacing: 0.05em; }
    .detail-value { font-size: 0.8125rem; color: var(--gray-900); }
    .bio-text { white-space: pre-wrap; line-height: 1.6; color: var(--gray-600); }

    .rider-summary { display: flex; flex-wrap: wrap; gap: 0.375rem; }
    .rider-tag { font-size: 0.6875rem; padding: 0.25rem 0.5rem; background: rgba(37, 99, 235, 0.06); color: #2563eb; border-radius: 0.25rem; }

    .themes-list, .members-list { display: flex; flex-direction: column; gap: 0.5rem; }
    .theme-item { display: flex; align-items: flex-start; gap: 0.625rem; padding: 0.5rem 0.75rem; background: var(--gray-50); border-radius: 0.5rem; }
    .theme-number { width: 22px; height: 22px; border-radius: 50%; background: #6366f1; color: white; display: flex; align-items: center; justify-content: center; font-size: 0.6875rem; font-weight: 700; flex-shrink: 0; }
    .theme-info { display: flex; flex-direction: column; gap: 0.125rem; }
    .theme-info strong { font-size: 0.8125rem; color: var(--gray-900); }
    .theme-meta { font-size: 0.75rem; color: var(--gray-500); }

    .member-item { display: flex; align-items: center; gap: 0.625rem; padding: 0.5rem 0.75rem; background: var(--gray-50); border-radius: 0.5rem; }
    .member-avatar-sm { width: 28px; height: 28px; border-radius: 50%; background: var(--gray-200); color: var(--gray-600); display: flex; align-items: center; justify-content: center; font-size: 0.625rem; font-weight: 700; flex-shrink: 0; }
    .member-info { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
    .member-info strong { font-size: 0.8125rem; color: var(--gray-900); }
    .member-role { font-size: 0.6875rem; padding: 0.125rem 0.375rem; background: rgba(99,102,241,0.08); color: #6366f1; border-radius: 0.25rem; font-weight: 500; }
    .member-meta { font-size: 0.75rem; color: var(--gray-500); }

    .detail-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 1rem; padding-top: 0.75rem; border-top: 1px solid var(--gray-100); }
    .detail-date, .detail-id { font-size: 0.75rem; color: var(--gray-400); }

    .admin-actions { display: flex; gap: 0.5rem; margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px solid var(--gray-100); flex-wrap: wrap; }
    .action-btn { display: inline-flex; align-items: center; gap: 0.375rem; padding: 0.5rem 0.875rem; border-radius: 0.5rem; font-size: 0.75rem; font-weight: 600; border: none; cursor: pointer; transition: all 0.15s; }
    .action-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .action-btn.approve { background: #dcfce7; color: #166534; }
    .action-btn.approve:hover:not(:disabled) { background: #bbf7d0; }
    .action-btn.reject { background: #fee2e2; color: #991b1b; }
    .action-btn.reject:hover:not(:disabled) { background: #fecaca; }
    .action-btn.review { background: #ede9fe; color: #5b21b6; }
    .action-btn.review:hover:not(:disabled) { background: #ddd6fe; }

    :host-context(.dark) .page-title { color: var(--gray-100); }
    :host-context(.dark) .page-subtitle { color: var(--gray-400); }
    :host-context(.dark) .stat-card { background: var(--gray-100); border-color: var(--gray-200); }
    :host-context(.dark) .stat-value { color: var(--gray-100); }
    :host-context(.dark) .stat-label { color: var(--gray-400); }
    :host-context(.dark) .card { background: var(--gray-100); border-color: var(--gray-200); }
    :host-context(.dark) .card-header { border-color: var(--gray-200); }
    :host-context(.dark) .filter-tab { color: var(--gray-400); }
    :host-context(.dark) .filter-tab:hover { color: var(--gray-200); background: var(--gray-200); }
    :host-context(.dark) .filter-tab.active { color: #60a5fa; background: rgba(96,165,250,0.1); }
    :host-context(.dark) .filter-row { border-color: var(--gray-200); }
    :host-context(.dark) .inscription-card { border-color: var(--gray-200); }
    :host-context(.dark) .inscription-card:hover { background: var(--gray-200); }
    :host-context(.dark) .artist-name { color: var(--gray-100); }
    :host-context(.dark) .card-detail { border-color: var(--gray-200); }
    :host-context(.dark) .detail-label { color: var(--gray-400); }
    :host-context(.dark) .detail-value { color: var(--gray-200); }
    :host-context(.dark) .theme-info strong { color: var(--gray-200); }
    :host-context(.dark) .member-info strong { color: var(--gray-200); }
    :host-context(.dark) .detail-footer { border-color: var(--gray-200); }
    :host-context(.dark) .admin-actions { border-color: var(--gray-200); }
    :host-context(.dark) .theme-item,
    :host-context(.dark) .member-item { background: rgba(255,255,255,0.03); }
    :host-context(.dark) .member-avatar-sm { background: rgba(255,255,255,0.08); color: var(--gray-300); }
    :host-context(.dark) .empty-title { color: var(--gray-200); }

    @media (max-width: 768px) {
      .stats-row { grid-template-columns: repeat(2, 1fr); }
      .stats-row > :last-child { grid-column: 1 / -1; }
      .card-header { flex-direction: column; align-items: stretch; }
      .search-input { width: 100%; max-width: none; }
      .filter-row { flex-direction: column; }
      .filter-row select { max-width: none; }
      .detail-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class InscripcionesListPageComponent implements OnInit {
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

  updateStatus(id: string, newStatus: string): void {
    this.updatingId.set(id);
    this.inscriptionsService.updateStatus(id, newStatus).subscribe({
      next: () => {
        this.allInscriptions.update(list =>
          list.map(i => i.id === id ? { ...i, status: newStatus } : i)
        );
        this.updatingId.set(null);
      },
      error: () => {
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
