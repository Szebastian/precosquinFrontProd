import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { InscriptionsService, Inscription } from '../../core/services/inscriptions.service';
import { ExportService } from '../../core/services/export.service';

@Component({
  selector: 'app-inscripciones-profile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="profile-container">
      <!-- Loading -->
      @if (loading()) {
        <div class="loading-state">
          <div class="spinner"></div>
          <p class="loading-text">Cargando perfil...</p>
        </div>
      } @else if (!inscription()) {
        <div class="empty-state">
          <div class="empty-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="12" cy="12" r="10"/>
              <path d="m15 9-6 6"/><path d="m9 9 6 6"/>
            </svg>
          </div>
          <h3 class="empty-title">Inscripción no encontrada</h3>
          <p class="empty-desc">No se pudo encontrar la inscripción solicitada.</p>
          <button class="back-btn" (click)="goBack()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>
            Volver al listado
          </button>
        </div>
      } @else {
        <!-- Header Actions -->
        <div class="profile-header-actions">
          <button class="back-btn" (click)="goBack()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>
            Volver
          </button>
          <div class="export-actions">
            <button class="export-btn export-btn-excel" (click)="exportExcel()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <path d="M14 2v6h6"/>
                <path d="M8 13h2"/><path d="M16 13h-2"/><path d="M8 17h8"/>
              </svg>
              Exportar Ficha Excel
            </button>
          </div>
        </div>

        <!-- Profile Header -->
        <div class="profile-header-card">
          <div class="profile-header-content">
            <div class="profile-avatar" [class.cat-musica]="inscription()!.category === 'Música'" [class.cat-danza]="inscription()!.category === 'Danza'">
              {{ getInitials(inscription()!.full_name) }}
            </div>
            <div class="profile-header-info">
              <div class="profile-name-row">
                <h1 class="profile-name">{{ inscription()!.full_name }}</h1>
                @if (inscription()!.stage_name) {
                  <span class="profile-stage">"{{ inscription()!.stage_name }}"</span>
                }
              </div>
              <div class="profile-meta-row">
                <span class="meta-badge meta-badge-cat">{{ inscription()!.category }}</span>
                <span class="meta-badge meta-badge-sub">{{ inscription()!.subcategory }}</span>
                <span class="status-badge" [class]="'badge-' + inscription()!.status.toLowerCase()">
                  {{ formatStatus(inscription()!.status) }}
                </span>
                @if (inscription()!.city || inscription()!.locality) {
                  <span class="meta-location">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                    {{ inscription()!.city || inscription()!.locality }}
                  </span>
                }
              </div>
            </div>
          </div>
        </div>

        <!-- Main Grid -->
        <div class="profile-grid">
          <!-- Left Column -->
          <div class="profile-main">
            <!-- Card 1: Datos de Identidad -->
            <div class="profile-card">
              <div class="card-header">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <h2 class="card-title">Datos de Identidad</h2>
              </div>
              <div class="card-body">
                <div class="data-grid">
                  <div class="data-field">
                    <span class="field-label">Nombre Completo</span>
                    <span class="field-value">{{ inscription()!.full_name }}</span>
                  </div>
                  @if (inscription()!.stage_name) {
                    <div class="data-field">
                      <span class="field-label">Nombre Artístico</span>
                      <span class="field-value">{{ inscription()!.stage_name }}</span>
                    </div>
                  }
                  <div class="data-field">
                    <span class="field-label">DNI</span>
                    <span class="field-value field-value-mono">{{ inscription()!.dni || '-' }}</span>
                  </div>
                  <div class="data-field">
                    <span class="field-label">Fecha de Nacimiento</span>
                    <span class="field-value">
                      {{ inscription()!.birth_date || '-' }}
                      @if (inscription()!.age) {
                        <span class="age-tag" [class.age-minor]="inscription()!.age! < 18">
                          {{ inscription()!.age }} años
                          @if (inscription()!.age! < 18) {
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                          }
                        </span>
                      }
                    </span>
                  </div>
                  <div class="data-field">
                    <span class="field-label">Localidad</span>
                    <span class="field-value">{{ inscription()!.locality || '-' }}</span>
                  </div>
                  <div class="data-field">
                    <span class="field-label">Provincia</span>
                    <span class="field-value">{{ inscription()!.province || '-' }}</span>
                  </div>
                  <div class="data-field">
                    <span class="field-label">Teléfono</span>
                    <span class="field-value field-value-mono">{{ inscription()!.phone || '-' }}</span>
                  </div>
                  <div class="data-field">
                    <span class="field-label">Correo Electrónico</span>
                    <span class="field-value field-value-mono">{{ inscription()!.email }}</span>
                  </div>
                  @if (inscription()!.address) {
                    <div class="data-field data-field-full">
                      <span class="field-label">Dirección</span>
                      <span class="field-value">{{ inscription()!.address }}</span>
                    </div>
                  }
                </div>
              </div>
            </div>

            <!-- Card 2: Nómina de Integrantes -->
            @if (inscription()!.members && inscription()!.members!.length > 0) {
              <div class="profile-card">
                <div class="card-header">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                  <h2 class="card-title">Nómina de Integrantes</h2>
                  <span class="card-count">{{ inscription()!.members!.length }}</span>
                </div>
                <div class="card-body card-body-table">
                  <table class="data-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Nombre Completo</th>
                        <th>DNI</th>
                        <th>Rol / Instrumento</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (member of inscription()!.members; track $index) {
                        <tr>
                          <td class="td-index">{{ $index + 1 }}</td>
                          <td class="td-name">{{ member.fullName || member.name || 'Sin nombre' }}</td>
                          <td class="td-mono">{{ getMemberDni(member) }}</td>
                          <td>
                            @if (member.role) {
                              <span class="role-badge">{{ member.role }}</span>
                            } @else if (member.instrument) {
                              <span class="role-badge role-badge-instrument">{{ member.instrument }}</span>
                            } @else {
                              -
                            }
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            }

            <!-- Card 3: Repertorio -->
            @if (inscription()!.themes && inscription()!.themes!.length > 0) {
              <div class="profile-card">
                <div class="card-header">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 18V5l12-2v13"/>
                    <circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
                  </svg>
                  <h2 class="card-title">Repertorio Declarado</h2>
                  <span class="card-count">{{ inscription()!.themes!.length }}</span>
                </div>
                <div class="card-body card-body-table">
                  <table class="data-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Título de la Obra</th>
                        <th>Autor / Compositor</th>
                        <th>Ritmo / Estilo</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (theme of inscription()!.themes; track $index) {
                        <tr>
                          <td class="td-index">{{ $index + 1 }}</td>
                          <td class="td-name">{{ theme.title || theme.name || 'Sin título' }}</td>
                          <td>{{ theme.author || theme.composer || 'Anónimo' }}</td>
                          <td>
                            @if (theme.rhythm || theme.style) {
                              <span class="style-badge">{{ theme.rhythm || theme.style }}</span>
                            } @else { - }
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            }

            <!-- Songs List (if no themes but has songs_list) -->
            @if ((!inscription()!.themes || inscription()!.themes!.length === 0) && inscription()!.songs_list) {
              <div class="profile-card">
                <div class="card-header">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
                  </svg>
                  <h2 class="card-title">Temas a Interpretar</h2>
                </div>
                <div class="card-body">
                  <pre class="songs-pre">{{ inscription()!.songs_list }}</pre>
                </div>
              </div>
            }
          </div>

          <!-- Right Column (Sidebar) -->
          <div class="profile-sidebar">
            <!-- Documentación Checklist -->
            <div class="profile-card sidebar-card">
              <div class="card-header">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                  <path d="m9 12 2 2 4-4"/>
                </svg>
                <h2 class="card-title">Documentación</h2>
              </div>
              <div class="card-body">
                <div class="checklist">
                  <div class="check-item" [class.check-ok]="inscription()!.dni_front_url">
                    <div class="check-icon" [class.check-ok]="inscription()!.dni_front_url">
                      @if (inscription()!.dni_front_url) {
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="m9 11 3 3L22 4"/></svg>
                      } @else {
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>
                      }
                    </div>
                    <div class="check-info">
                      <span class="check-label">DNI</span>
                      <span class="check-status" [class.status-ok]="inscription()!.dni_front_url" [class.status-missing]="!inscription()!.dni_front_url">
                        {{ inscription()!.dni_front_url ? 'Cargado' : 'Pendiente' }}
                      </span>
                    </div>
                  </div>

                  <div class="check-item" [class.check-ok]="inscription()!.accept_regulations">
                    <div class="check-icon" [class.check-ok]="inscription()!.accept_regulations">
                      @if (inscription()!.accept_regulations) {
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="m9 11 3 3L22 4"/></svg>
                      } @else {
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>
                      }
                    </div>
                    <div class="check-info">
                      <span class="check-label">Decl. Jurada de Incompatibilidad</span>
                      <span class="check-status" [class.status-ok]="inscription()!.accept_regulations" [class.status-missing]="!inscription()!.accept_regulations">
                        {{ inscription()!.accept_regulations ? 'Firmada' : 'Pendiente' }}
                      </span>
                    </div>
                  </div>

                  <div class="check-item" [class.check-ok]="hasMinorAuth()">
                    <div class="check-icon" [class.check-ok]="hasMinorAuth()">
                      @if (hasMinorAuth()) {
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="m9 11 3 3L22 4"/></svg>
                      } @else if (inscription()!.age && inscription()!.age! >= 18) {
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
                      } @else {
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>
                      }
                    </div>
                    <div class="check-info">
                      <span class="check-label">Autorización de Menores</span>
                      <span class="check-status"
                        [class.status-ok]="hasMinorAuth()"
                        [class.status-na]="inscription()!.age && inscription()!.age! >= 18"
                        [class.status-missing]="!hasMinorAuth() && inscription()!.age && inscription()!.age! < 18">
                        @if (inscription()!.age && inscription()!.age! >= 18) {
                          N/A (Mayor)
                        } @else if (hasMinorAuth()) {
                          Presentada
                        } @else {
                          Pendiente
                        }
                      </span>
                    </div>
                  </div>

                  <div class="check-item" [class.check-ok]="inscription()!.promo_photo_url">
                    <div class="check-icon" [class.check-ok]="inscription()!.promo_photo_url">
                      @if (inscription()!.promo_photo_url) {
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="m9 11 3 3L22 4"/></svg>
                      } @else {
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>
                      }
                    </div>
                    <div class="check-info">
                      <span class="check-label">Foto Promocional</span>
                      <span class="check-status" [class.status-ok]="inscription()!.promo_photo_url" [class.status-missing]="!inscription()!.promo_photo_url">
                        {{ inscription()!.promo_photo_url ? 'Cargada' : 'Pendiente' }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Quick Info Card -->
            <div class="profile-card sidebar-card">
              <div class="card-header">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 16v-4"/><path d="M12 8h.01"/>
                </svg>
                <h2 class="card-title">Resumen</h2>
              </div>
              <div class="card-body">
                <div class="summary-rows">
                  <div class="summary-row">
                    <span class="summary-label">Inscripción</span>
                    <span class="summary-value">{{ formatDate(inscription()!.created_at) }}</span>
                  </div>
                  <div class="summary-row">
                    <span class="summary-label">ID</span>
                    <span class="summary-value summary-value-mono">{{ inscription()!.id | slice:0:8 }}</span>
                  </div>
                  <div class="summary-row">
                    <span class="summary-label">Rubro</span>
                    <span class="summary-value">{{ inscription()!.category }} › {{ inscription()!.subcategory }}</span>
                  </div>
                  @if (inscription()!.members && inscription()!.members!.length) {
                    <div class="summary-row">
                      <span class="summary-label">Integrantes</span>
                      <span class="summary-value">{{ inscription()!.members!.length }}</span>
                    </div>
                  }
                  @if (inscription()!.themes && inscription()!.themes!.length) {
                    <div class="summary-row">
                      <span class="summary-label">Obras</span>
                      <span class="summary-value">{{ inscription()!.themes!.length }}</span>
                    </div>
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }

    .profile-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 1.5rem 2rem;
    }

    /* Loading & Empty */
    .loading-state, .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 6rem 2rem;
      text-align: center;
    }
    .spinner {
      width: 32px; height: 32px;
      border: 3px solid var(--gray-200);
      border-top-color: var(--brand-400, #60a5fa);
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .loading-text { font-size: 0.875rem; color: var(--gray-500); margin-top: 1rem; }
    .empty-icon { color: var(--gray-300); margin-bottom: 1rem; }
    .empty-title { font-size: 1.125rem; font-weight: 700; color: var(--gray-700); margin: 0 0 0.5rem; }
    .empty-desc { font-size: 0.875rem; color: var(--gray-400); margin: 0 0 1.5rem; }

    /* Header Actions */
    .profile-header-actions {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.5rem;
    }
    .back-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: var(--gray-100);
      border: 1px solid var(--gray-200);
      border-radius: 0.5rem;
      color: var(--gray-600);
      font-size: 0.8125rem;
      font-weight: 500;
      font-family: inherit;
      cursor: pointer;
      transition: all 0.15s;
    }
    .back-btn:hover {
      background: var(--gray-200);
      color: var(--gray-800);
    }
    .export-actions { display: flex; gap: 0.5rem; }
    .export-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      font-size: 0.8125rem;
      font-weight: 600;
      font-family: inherit;
      cursor: pointer;
      transition: all 0.15s;
      white-space: nowrap;
    }
    .export-btn-excel {
      background: rgba(34, 197, 94, 0.12);
      color: #4ade80;
      border: 1px solid rgba(34, 197, 94, 0.2);
    }
    .export-btn-excel:hover {
      background: rgba(34, 197, 94, 0.2);
      border-color: rgba(34, 197, 94, 0.35);
    }

    /* Profile Header Card */
    .profile-header-card {
      background: var(--gray-100);
      border: 1px solid var(--gray-200);
      border-radius: 0.875rem;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
    }
    .profile-header-content {
      display: flex;
      align-items: center;
      gap: 1.25rem;
    }
    .profile-avatar {
      width: 72px;
      height: 72px;
      border-radius: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      font-weight: 800;
      color: white;
      flex-shrink: 0;
    }
    .cat-musica { background: linear-gradient(135deg, #3b82f6, #1d4ed8); }
    .cat-danza { background: linear-gradient(135deg, #8b5cf6, #6d28d9); }
    .profile-header-info { flex: 1; min-width: 0; }
    .profile-name-row {
      display: flex;
      align-items: baseline;
      gap: 0.75rem;
      flex-wrap: wrap;
      margin-bottom: 0.5rem;
    }
    .profile-name {
      font-family: var(--font-display);
      font-size: 1.5rem;
      font-weight: 800;
      color: var(--gray-900);
      margin: 0;
      letter-spacing: -0.02em;
    }
    .profile-stage {
      font-size: 0.9375rem;
      color: var(--gray-400);
      font-style: italic;
    }
    .profile-meta-row {
      display: flex;
      align-items: center;
      gap: 0.625rem;
      flex-wrap: wrap;
    }
    .meta-badge {
      font-size: 0.6875rem;
      font-weight: 600;
      padding: 0.25rem 0.625rem;
      border-radius: 0.375rem;
    }
    .meta-badge-cat {
      background: rgba(59, 130, 246, 0.12);
      color: #3b82f6;
    }
    .meta-badge-sub {
      background: rgba(139, 92, 246, 0.1);
      color: #8b5cf6;
    }
    .status-badge {
      font-size: 0.6875rem;
      font-weight: 600;
      padding: 0.25rem 0.625rem;
      border-radius: 999px;
      white-space: nowrap;
    }
    .badge-pendiente { background: rgba(251, 191, 36, 0.15); color: #fbbf24; }
    .badge-en_revision { background: rgba(139, 92, 246, 0.15); color: #a78bfa; }
    .badge-aprobada { background: rgba(34, 197, 94, 0.15); color: #4ade80; }
    .badge-rechazada { background: rgba(239, 68, 68, 0.15); color: #f87171; }
    .badge-contrato_firmado { background: rgba(96, 165, 250, 0.15); color: #60a5fa; }
    .meta-location {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.75rem;
      color: var(--gray-400);
    }
    .meta-location svg { opacity: 0.6; }

    /* Profile Grid */
    .profile-grid {
      display: grid;
      grid-template-columns: 1fr 340px;
      gap: 1.5rem;
      align-items: start;
    }

    /* Cards */
    .profile-card {
      background: var(--gray-100);
      border: 1px solid var(--gray-200);
      border-radius: 0.875rem;
      overflow: hidden;
    }
    .profile-main { display: flex; flex-direction: column; gap: 1.5rem; }
    .card-header {
      display: flex;
      align-items: center;
      gap: 0.625rem;
      padding: 1rem 1.25rem;
      border-bottom: 1px solid var(--gray-200);
    }
    .card-header svg { color: var(--gray-400); flex-shrink: 0; }
    .card-title {
      font-size: 0.875rem;
      font-weight: 700;
      color: var(--gray-800);
      margin: 0;
      flex: 1;
    }
    .card-count {
      font-size: 0.6875rem;
      font-weight: 700;
      background: var(--gray-200);
      color: var(--gray-600);
      padding: 0.125rem 0.5rem;
      border-radius: 999px;
      min-width: 1.5rem;
      text-align: center;
    }
    .card-body { padding: 1.25rem; }
    .card-body-table { padding: 0; overflow-x: auto; }

    /* Data Grid */
    .data-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
    }
    .data-field-full { grid-column: 1 / -1; }
    .field-label {
      display: block;
      font-size: 0.6875rem;
      font-weight: 600;
      color: var(--gray-500);
      text-transform: uppercase;
      letter-spacing: 0.04em;
      margin-bottom: 0.25rem;
    }
    .field-value {
      font-size: 0.875rem;
      color: var(--gray-800);
      line-height: 1.5;
    }
    .field-value-mono { font-family: var(--font-mono); font-size: 0.8125rem; }
    .age-tag {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      margin-left: 0.5rem;
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.125rem 0.5rem;
      border-radius: 999px;
      background: rgba(34, 197, 94, 0.1);
      color: #4ade80;
    }
    .age-minor {
      background: rgba(239, 68, 68, 0.1);
      color: #f87171;
    }

    /* Tables */
    .data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.8125rem;
    }
    .data-table th {
      padding: 0.75rem 1rem;
      text-align: left;
      font-size: 0.6875rem;
      font-weight: 700;
      color: var(--gray-500);
      text-transform: uppercase;
      letter-spacing: 0.04em;
      background: var(--gray-200);
      border-bottom: 1px solid var(--gray-200);
      white-space: nowrap;
    }
    .data-table td {
      padding: 0.625rem 1rem;
      border-bottom: 1px solid var(--gray-200);
      color: var(--gray-700);
    }
    .data-table tr:last-child td { border-bottom: none; }
    .data-table tr:hover { background: rgba(96, 165, 250, 0.03); }
    .td-index {
      width: 2.5rem;
      text-align: center;
      color: var(--gray-400);
      font-weight: 600;
      font-size: 0.75rem;
    }
    .td-name { font-weight: 600; color: var(--gray-800); }
    .td-mono { font-family: var(--font-mono); font-size: 0.75rem; }
    .role-badge {
      display: inline-block;
      font-size: 0.6875rem;
      font-weight: 500;
      padding: 0.125rem 0.5rem;
      background: var(--gray-200);
      border-radius: 0.25rem;
      color: var(--gray-600);
    }
    .role-badge-instrument {
      background: rgba(59, 130, 246, 0.1);
      color: #3b82f6;
    }
    .style-badge {
      display: inline-block;
      font-size: 0.6875rem;
      font-weight: 500;
      padding: 0.125rem 0.5rem;
      background: rgba(139, 92, 246, 0.1);
      color: #8b5cf6;
      border-radius: 0.25rem;
    }

    /* Songs Pre */
    .songs-pre {
      font-family: inherit;
      font-size: 0.8125rem;
      line-height: 1.6;
      color: var(--gray-600);
      white-space: pre-wrap;
      margin: 0;
      padding: 0.75rem;
      background: var(--gray-200);
      border-radius: 0.5rem;
      max-height: 300px;
      overflow-y: auto;
    }

    /* Sidebar */
    .sidebar-card { position: sticky; top: 1.5rem; }
    .profile-sidebar { display: flex; flex-direction: column; gap: 1.5rem; }

    /* Checklist */
    .checklist {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .check-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.625rem 0.75rem;
      background: var(--gray-200);
      border-radius: 0.5rem;
      border: 1px solid transparent;
      transition: all 0.15s;
    }
    .check-item.check-ok {
      background: rgba(34, 197, 94, 0.06);
      border-color: rgba(34, 197, 94, 0.12);
    }
    .check-icon {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      background: rgba(239, 68, 68, 0.1);
      color: #f87171;
    }
    .check-icon.check-ok {
      background: rgba(34, 197, 94, 0.15);
      color: #4ade80;
    }
    .check-info { flex: 1; min-width: 0; }
    .check-label {
      display: block;
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--gray-800);
      line-height: 1.3;
    }
    .check-status {
      display: block;
      font-size: 0.6875rem;
      font-weight: 500;
      margin-top: 0.125rem;
    }
    .status-ok { color: #4ade80; }
    .status-na { color: var(--gray-400); }
    .status-missing { color: #f87171; }

    /* Summary */
    .summary-rows { display: flex; flex-direction: column; gap: 0.5rem; }
    .summary-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.5rem 0;
      border-bottom: 1px solid var(--gray-200);
    }
    .summary-row:last-child { border-bottom: none; }
    .summary-label {
      font-size: 0.75rem;
      color: var(--gray-500);
      font-weight: 500;
    }
    .summary-value {
      font-size: 0.8125rem;
      color: var(--gray-800);
      font-weight: 600;
    }
    .summary-value-mono { font-family: var(--font-mono); font-size: 0.75rem; }

    /* Dark Mode */
    :host-context(.dark) .profile-header-card,
    :host-context(.dark) .profile-card { background: var(--gray-800); border-color: var(--gray-700); }
    :host-context(.dark) .card-header { border-color: var(--gray-700); }
    :host-context(.dark) .card-title { color: var(--gray-100); }
    :host-context(.dark) .card-count { background: var(--gray-700); color: var(--gray-300); }
    :host-context(.dark) .profile-name { color: var(--gray-50); }
    :host-context(.dark) .profile-stage { color: var(--gray-400); }
    :host-context(.dark) .field-value { color: var(--gray-200); }
    :host-context(.dark) .td-name { color: var(--gray-100); }
    :host-context(.dark) .data-table td { color: var(--gray-300); border-color: var(--gray-700); }
    :host-context(.dark) .data-table th { background: var(--gray-700); border-color: var(--gray-700); }
    :host-context(.dark) .check-item { background: var(--gray-700); }
    :host-context(.dark) .check-item.check-ok { background: rgba(34, 197, 94, 0.08); border-color: rgba(34, 197, 94, 0.15); }
    :host-context(.dark) .check-label { color: var(--gray-200); }
    :host-context(.dark) .summary-value { color: var(--gray-200); }
    :host-context(.dark) .summary-row { border-color: var(--gray-700); }
    :host-context(.dark) .songs-pre { background: var(--gray-700); color: var(--gray-300); }
    :host-context(.dark) .back-btn { background: var(--gray-700); border-color: var(--gray-600); color: var(--gray-300); }
    :host-context(.dark) .back-btn:hover { background: var(--gray-600); color: var(--gray-100); }

    /* Responsive */
    @media (max-width: 900px) {
      .profile-container { padding: 1rem; }
      .profile-grid { grid-template-columns: 1fr; }
      .sidebar-card { position: static; }
      .profile-header-content { flex-direction: column; text-align: center; }
      .profile-name-row { justify-content: center; }
      .profile-meta-row { justify-content: center; }
      .data-grid { grid-template-columns: 1fr; }
      .profile-header-actions { flex-direction: column; gap: 0.75rem; align-items: stretch; }
      .export-actions { justify-content: stretch; }
      .export-btn { flex: 1; justify-content: center; }
    }
  `]
})
export class InscripcionesProfilePageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private inscriptionsService = inject(InscriptionsService);
  private exportService = inject(ExportService);

  inscription = signal<Inscription | null>(null);
  loading = signal(true);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadInscription(id);
    } else {
      this.loading.set(false);
    }
  }

  loadInscription(id: string): void {
    this.loading.set(true);
    this.inscriptionsService.getInscription(id).subscribe({
      next: (data) => {
        this.inscription.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  hasMinorAuth(): boolean {
    const i = this.inscription();
    if (!i) return false;
    if (i.age && i.age >= 18) return true;
    return !!(i as any).minor_authorization_url || !!(i as any).accept_parental_consent;
  }

  getInitials(name: string): string {
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  }

  getMemberDni(member: any): string {
    return member.dni || member.DNI || '-';
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
        day: 'numeric', month: 'short', year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  }

  exportExcel(): void {
    const i = this.inscription();
    if (i) {
      this.exportService.exportSingleProfile(i);
    }
  }

  goBack(): void {
    this.router.navigate(['/panel/inscripciones']);
  }
}
