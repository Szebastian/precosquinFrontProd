import { Component, signal, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

const API = `${environment.apiUrl}/cronograma`;

interface PresentationItem {
  id: string;
  order: number;
  time: string;
  category: string;
  subcategory: string;
  participantName: string;
  groupName: string;
  stage: string;
  day: string;
  observations: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface AgendaEvent {
  id: string;
  time: string;
  title: string;
  description: string;
  location: string;
  eventType: string;
  day: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

@Component({
  selector: 'app-cronograma-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <!-- Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Cronograma</h1>
          <p class="page-subtitle">Gestionar presentaciones y agenda del festival</p>
        </div>
        <button class="btn btn-primary" (click)="openCreateModal()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          {{ activeTab() === 'presentations' ? 'Nueva Presentación' : 'Nuevo Evento' }}
        </button>
      </div>

      <!-- Toast -->
      @if (toast()) {
        <div class="toast" [class.toast-success]="toastType() === 'success'" [class.toast-error]="toastType() === 'error'">
          {{ toast() }}
        </div>
      }

      <!-- Tabs -->
      <div class="tabs-bar">
        <button class="tab-btn" [class.tab-active]="activeTab() === 'presentations'" (click)="activeTab.set('presentations')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
          Presentaciones
          <span class="tab-count">{{ presentations().length }}</span>
        </button>
        <button class="tab-btn" [class.tab-active]="activeTab() === 'agenda'" (click)="activeTab.set('agenda')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          Agenda
          <span class="tab-count">{{ agendaEvents().length }}</span>
        </button>
      </div>

      <!-- Tab description -->
      <div class="tab-description" [class.tab-desc-pres]="activeTab() === 'presentations'" [class.tab-desc-agenda]="activeTab() === 'agenda'">
        @if (activeTab() === 'presentations') {
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
          <span><strong>Presentaciones</strong> — Orden de actuación de los participantes. Definí quién toca, en qué categoría, escenario y horario.</span>
        } @else {
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
          <span><strong>Agenda</strong> — Cronograma general del evento. Soundchecks, ensayos, aperturas, descansos y otros momentos del festival.</span>
        }
      </div>

      <!-- Search -->
      <div class="search-bar">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input type="text" class="search-input" placeholder="Buscar..."
          [ngModel]="searchTerm()" (ngModelChange)="searchTerm.set($event)" />
      </div>

      <!-- Loading -->
      @if (loading()) {
        <div class="loading-state">
          <div class="spinner-lg"></div>
          <p>Cargando...</p>
        </div>
      }

      <!-- PRESENTATIONS TAB -->
      @if (!loading() && activeTab() === 'presentations') {
        @if (filteredPresentations().length === 0) {
          <div class="empty-state">
            <div class="empty-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
            </div>
            <h3 class="empty-title">No hay presentaciones cargadas</h3>
            <p class="empty-desc">Agregá las presentaciones del festival para que aparezcan en el cronograma público.</p>
            <button class="btn btn-primary mt-4" (click)="openCreateModal()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Crear primera presentación
            </button>
          </div>
        } @else {
          <div class="data-table">
            <div class="table-header">
              <span class="col-order">#</span>
              <span class="col-time">Hora</span>
              <span class="col-name">Participante</span>
              <span class="col-category">Categoría</span>
              <span class="col-stage">Escenario</span>
              <span class="col-day">Día</span>
              <span class="col-status">Estado</span>
              <span class="col-actions">Acciones</span>
            </div>
            @for (item of filteredPresentations(); track item.id) {
              <div class="table-row">
                <span class="col-order">{{ item.order }}</span>
                <span class="col-time">{{ item.time || '—' }}</span>
                <span class="col-name">
                  <strong>{{ item.participantName }}</strong>
                  @if (item.groupName) {
                    <small>{{ item.groupName }}</small>
                  }
                </span>
                <span class="col-category">
                  <span class="badge badge-blue">{{ item.category }}</span>
                  @if (item.subcategory) {
                    <small>{{ item.subcategory }}</small>
                  }
                </span>
                <span class="col-stage">{{ item.stage || '—' }}</span>
                <span class="col-day">{{ item.day || '—' }}</span>
                <span class="col-status">
                  <span class="status-dot" [class]="'status-' + item.status"></span>
                  {{ item.status }}
                </span>
                <span class="col-actions">
                  <button class="btn-icon" title="Editar" (click)="editPresentation(item)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  <button class="btn-icon btn-danger" title="Eliminar" (click)="deletePresentation(item.id)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                  </button>
                </span>
              </div>
            }
          </div>
        }
      }

      <!-- AGENDA TAB -->
      @if (!loading() && activeTab() === 'agenda') {
        @if (filteredAgenda().length === 0) {
          <div class="empty-state">
            <div class="empty-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </div>
            <h3 class="empty-title">No hay eventos en la agenda</h3>
            <p class="empty-desc">Agregá los eventos del festival: soundchecks, ensayos, aperturas, descansos, etc.</p>
            <button class="btn btn-primary mt-4" (click)="openCreateModal()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Crear primer evento
            </button>
          </div>
        } @else {
          <div class="data-table">
            <div class="table-header">
              <span class="col-time">Hora</span>
              <span class="col-name">Título</span>
              <span class="col-category">Tipo</span>
              <span class="col-stage">Lugar</span>
              <span class="col-day">Día</span>
              <span class="col-status">Estado</span>
              <span class="col-actions">Acciones</span>
            </div>
            @for (item of filteredAgenda(); track item.id) {
              <div class="table-row">
                <span class="col-time">{{ item.time || '—' }}</span>
                <span class="col-name">
                  <strong>{{ item.title }}</strong>
                  @if (item.description) {
                    <small>{{ item.description | slice:0:60 }}{{ item.description.length > 60 ? '...' : '' }}</small>
                  }
                </span>
                <span class="col-category">
                  <span class="badge" [ngClass]="getEventBadgeClass(item.eventType)">{{ getEventLabel(item.eventType) }}</span>
                </span>
                <span class="col-stage">{{ item.location || '—' }}</span>
                <span class="col-day">{{ item.day || '—' }}</span>
                <span class="col-status">
                  <span class="status-dot" [class]="'status-' + item.status"></span>
                  {{ item.status }}
                </span>
                <span class="col-actions">
                  <button class="btn-icon" title="Editar" (click)="editAgendaEvent(item)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  <button class="btn-icon btn-danger" title="Eliminar" (click)="deleteAgendaEvent(item.id)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                  </button>
                </span>
              </div>
            }
          </div>
        }
      }

      <!-- ═══════════════════════════════════════════════════════ -->
      <!-- MODAL: Create/Edit Presentation                       -->
      <!-- ═══════════════════════════════════════════════════════ -->
      @if (showModal() && activeTab() === 'presentations') {
        <div class="modal-overlay" (click)="closeModal()">
          <div class="modal modal-pres" (click)="$event.stopPropagation()">
            <div class="modal-header modal-header-pres">
              <div>
                <div class="modal-icon-pres">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
                </div>
                <h2>{{ editingId() ? 'Editar Presentación' : 'Nueva Presentación' }}</h2>
                <p class="modal-header-desc">Definí el orden de actuación del participante</p>
              </div>
              <button class="btn-close" (click)="closeModal()">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            <div class="modal-body">
              <!-- Sección: Horario -->
              <div class="form-section">
                <div class="form-section-header">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  Horario
                </div>
                <div class="form-row">
                  <div class="form-group form-group-sm">
                    <label class="form-label">Día *</label>
                    <select class="form-input" [(ngModel)]="presForm.day">
                      <option value="">Seleccionar día...</option>
                      @for (day of dayOptions; track day.value) {
                        <option [value]="day.value">{{ day.label }}</option>
                      }
                    </select>
                  </div>
                  <div class="form-group form-group-sm">
                    <label class="form-label">Hora *</label>
                    <select class="form-input" [(ngModel)]="presForm.time">
                      <option value="">Seleccionar hora...</option>
                      @for (h of timeOptions; track h) {
                        <option [value]="h">{{ h }}</option>
                      }
                    </select>
                  </div>
                </div>
              </div>

              <!-- Sección: Participante -->
              <div class="form-section">
                <div class="form-section-header">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  Datos del participante
                </div>
                <div class="form-group">
                  <label class="form-label">Nombre del participante *</label>
                  <input type="text" class="form-input" [(ngModel)]="presForm.participantName" placeholder="Ej: María García" />
                </div>
                <div class="form-group">
                  <label class="form-label">Grupo / Orquesta</label>
                  <input type="text" class="form-input" [(ngModel)]="presForm.groupName" placeholder="Ej: Orquesta Sinfónica Juvenil (opcional)" />
                </div>
              </div>

              <!-- Sección: Categoría y escenario -->
              <div class="form-section">
                <div class="form-section-header">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
                  Categoría y escenario
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label class="form-label">Categoría *</label>
                    <select class="form-input" [(ngModel)]="presForm.category">
                      <option value="">Seleccionar...</option>
                      @for (cat of categoryOptions; track cat) {
                        <option [value]="cat">{{ cat }}</option>
                      }
                    </select>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Subcategoría</label>
                    <select class="form-input" [(ngModel)]="presForm.subcategory">
                      <option value="">Ninguna</option>
                      @for (sub of subcategoryOptions; track sub) {
                        <option [value]="sub">{{ sub }}</option>
                      }
                    </select>
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label class="form-label">Escenario</label>
                    <select class="form-input" [(ngModel)]="presForm.stage">
                      <option value="">Seleccionar...</option>
                      @for (s of stageOptions; track s) {
                        <option [value]="s">{{ s }}</option>
                      }
                    </select>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Orden de actuación</label>
                    <input type="number" class="form-input" [(ngModel)]="presForm.order" min="0" placeholder="0" />
                  </div>
                </div>
              </div>

              <!-- Sección: Estado y notas -->
              <div class="form-section">
                <div class="form-section-header">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                  Publicación
                </div>
                <div class="form-group">
                  <label class="form-label">Estado</label>
                  <div class="radio-cards">
                    <label class="radio-card" [class.radio-card-active]="presForm.status === 'published'">
                      <input type="radio" [(ngModel)]="presForm.status" value="published" hidden />
                      <span class="radio-card-dot status-dot-bg status-published"></span>
                      <span class="radio-card-label">Publicado</span>
                      <span class="radio-card-desc">Visible en el cronograma público</span>
                    </label>
                    <label class="radio-card" [class.radio-card-active]="presForm.status === 'draft'">
                      <input type="radio" [(ngModel)]="presForm.status" value="draft" hidden />
                      <span class="radio-card-dot status-dot-bg status-draft"></span>
                      <span class="radio-card-label">Borrador</span>
                      <span class="radio-card-desc">Solo visible en el panel</span>
                    </label>
                    <label class="radio-card" [class.radio-card-active]="presForm.status === 'hidden'">
                      <input type="radio" [(ngModel)]="presForm.status" value="hidden" hidden />
                      <span class="radio-card-dot status-dot-bg status-hidden"></span>
                      <span class="radio-card-label">Oculto</span>
                      <span class="radio-card-desc">No se muestra en ningún lado</span>
                    </label>
                  </div>
                </div>
                <div class="form-group">
                  <label class="form-label">Observaciones internas</label>
                  <textarea class="form-input form-textarea" [(ngModel)]="presForm.observations" rows="2" placeholder="Notas privadas sobre esta presentación (opcional)"></textarea>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" (click)="closeModal()">Cancelar</button>
              <button class="btn btn-primary btn-pres" (click)="savePresentation()" [disabled]="saving()">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                {{ saving() ? 'Guardando...' : (editingId() ? 'Guardar cambios' : 'Crear presentación') }}
              </button>
            </div>
          </div>
        </div>
      }

      <!-- ═══════════════════════════════════════════════════════ -->
      <!-- MODAL: Create/Edit Agenda Event                        -->
      <!-- ═══════════════════════════════════════════════════════ -->
      @if (showModal() && activeTab() === 'agenda') {
        <div class="modal-overlay" (click)="closeModal()">
          <div class="modal modal-agenda" (click)="$event.stopPropagation()">
            <div class="modal-header modal-header-agenda">
              <div>
                <div class="modal-icon-agenda">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                </div>
                <h2>{{ editingId() ? 'Editar Evento' : 'Nuevo Evento' }}</h2>
                <p class="modal-header-desc">Agregá un momento a la agenda del festival</p>
              </div>
              <button class="btn-close" (click)="closeModal()">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            <div class="modal-body">
              <!-- Sección: Horario -->
              <div class="form-section">
                <div class="form-section-header">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  Horario
                </div>
                <div class="form-row">
                  <div class="form-group form-group-sm">
                    <label class="form-label">Día *</label>
                    <select class="form-input" [(ngModel)]="agendaForm.day">
                      <option value="">Seleccionar día...</option>
                      @for (day of dayOptions; track day.value) {
                        <option [value]="day.value">{{ day.label }}</option>
                      }
                    </select>
                  </div>
                  <div class="form-group form-group-sm">
                    <label class="form-label">Hora *</label>
                    <select class="form-input" [(ngModel)]="agendaForm.time">
                      <option value="">Seleccionar hora...</option>
                      @for (h of timeOptions; track h) {
                        <option [value]="h">{{ h }}</option>
                      }
                    </select>
                  </div>
                </div>
              </div>

              <!-- Sección: Evento -->
              <div class="form-section">
                <div class="form-section-header">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
                  Datos del evento
                </div>
                <div class="form-group">
                  <label class="form-label">Título del evento *</label>
                  <input type="text" class="form-input" [(ngModel)]="agendaForm.title" placeholder="Ej: Soundcheck orquesta principal" />
                </div>
                <div class="form-group">
                  <label class="form-label">Descripción</label>
                  <textarea class="form-input form-textarea" [(ngModel)]="agendaForm.description" rows="2" placeholder="Detalles del evento (opcional)"></textarea>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label class="form-label">Tipo de evento</label>
                    <select class="form-input" [(ngModel)]="agendaForm.eventType">
                      @for (t of eventTypeOptions; track t.value) {
                        <option [value]="t.value">{{ t.label }}</option>
                      }
                    </select>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Lugar</label>
                    <select class="form-input" [(ngModel)]="agendaForm.location">
                      <option value="">Seleccionar...</option>
                      @for (s of stageOptions; track s) {
                        <option [value]="s">{{ s }}</option>
                      }
                      <option value="Otro">Otro lugar</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- Sección: Estado -->
              <div class="form-section">
                <div class="form-section-header">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                  Publicación
                </div>
                <div class="form-group">
                  <div class="radio-cards">
                    <label class="radio-card" [class.radio-card-active]="agendaForm.status === 'published'">
                      <input type="radio" [(ngModel)]="agendaForm.status" value="published" hidden />
                      <span class="radio-card-dot status-dot-bg status-published"></span>
                      <span class="radio-card-label">Publicado</span>
                      <span class="radio-card-desc">Visible en la agenda pública</span>
                    </label>
                    <label class="radio-card" [class.radio-card-active]="agendaForm.status === 'draft'">
                      <input type="radio" [(ngModel)]="agendaForm.status" value="draft" hidden />
                      <span class="radio-card-dot status-dot-bg status-draft"></span>
                      <span class="radio-card-label">Borrador</span>
                      <span class="radio-card-desc">Solo visible en el panel</span>
                    </label>
                    <label class="radio-card" [class.radio-card-active]="agendaForm.status === 'hidden'">
                      <input type="radio" [(ngModel)]="agendaForm.status" value="hidden" hidden />
                      <span class="radio-card-dot status-dot-bg status-hidden"></span>
                      <span class="radio-card-label">Oculto</span>
                      <span class="radio-card-desc">No se muestra</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" (click)="closeModal()">Cancelar</button>
              <button class="btn btn-primary btn-agenda" (click)="saveAgendaEvent()" [disabled]="saving()">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                {{ saving() ? 'Guardando...' : (editingId() ? 'Guardar cambios' : 'Crear evento') }}
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
      background: #f5f3ef;
      min-height: 100vh;
      margin: calc(var(--space-4) * -1);
      padding: var(--space-4);
    }

    .page-container { max-width: var(--content-max-width); }

    .page-header {
      display: flex; align-items: flex-start; justify-content: space-between;
      margin-bottom: var(--space-5); flex-wrap: wrap; gap: var(--space-3);
    }
    .page-title {
      font-size: var(--text-2xl); font-weight: var(--weight-bold);
      color: #1a1a1a; margin-bottom: var(--space-1);
    }
    .page-subtitle { font-size: var(--text-sm); color: #6b6560; }

    /* Toast */
    .toast {
      padding: 12px 16px; border-radius: 10px; margin-bottom: var(--space-4);
      font-size: var(--text-sm); font-weight: 500;
      animation: slideDown 0.2s ease;
    }
    .toast-success { background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }
    .toast-error { background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; }
    @keyframes slideDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }

    /* Tabs */
    .tabs-bar {
      display: flex; gap: 2px; background: #ebe8e4;
      border-radius: 12px; padding: 4px; margin-bottom: var(--space-3);
    }
    .tab-btn {
      display: flex; align-items: center; gap: 6px;
      padding: 10px 18px; font-size: var(--text-sm); font-weight: 500;
      color: #7a7570; background: transparent; border: none;
      border-radius: 9px; cursor: pointer; transition: all 0.2s ease;
      flex: 1; justify-content: center;
    }
    .tab-btn:hover { color: #4a4540; background: rgba(255,255,255,0.5); }
    .tab-active { color: #fff; background: #4c8be6; box-shadow: 0 2px 8px rgba(76,139,230,0.3); }
    .tab-count {
      background: rgba(0,0,0,0.06); color: #7a7570;
      padding: 1px 7px; border-radius: 999px; font-size: 11px; font-weight: 600;
    }
    .tab-active .tab-count { background: rgba(255,255,255,0.25); color: #fff; }

    /* Tab description */
    .tab-description {
      display: flex; align-items: flex-start; gap: 8px;
      padding: 12px 16px; border-radius: 10px; margin-bottom: var(--space-4);
      font-size: var(--text-sm); line-height: 1.5;
    }
    .tab-desc-pres { background: #e8f0fe; color: #1a56db; border: 1px solid #c3dafe; }
    .tab-desc-agenda { background: #e6f9ee; color: #0f766e; border: 1px solid #a7f3d0; }
    .tab-description svg { flex-shrink: 0; margin-top: 2px; }

    /* Search */
    .search-bar {
      display: flex; align-items: center; gap: 10px;
      background: #fff; border: 1.5px solid #e0ddd9; border-radius: 12px;
      padding: 0 16px; margin-bottom: var(--space-4);
      transition: all 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    }
    .search-bar:focus-within {
      border-color: #4c8be6; box-shadow: 0 0 0 3px rgba(76,139,230,0.12), 0 2px 8px rgba(0,0,0,0.06);
    }
    .search-bar svg { color: #9a9590; flex-shrink: 0; }
    .search-input {
      flex: 1; border: none; outline: none; padding: 12px 0;
      font-size: var(--text-sm); color: #1a1a1a; background: transparent;
    }
    .search-input::placeholder { color: #a09a94; }

    /* Loading */
    .loading-state { display: flex; flex-direction: column; align-items: center; padding: var(--space-12); color: #7a7570; gap: var(--space-3); }
    .spinner-lg {
      width: 36px; height: 36px; border: 3px solid #e0ddd9;
      border-top-color: #4c8be6; border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* Empty State */
    .empty-state {
      text-align: center; padding: var(--space-12) var(--space-6);
      background: #fff; border-radius: 16px;
      border: 1px solid #e8e5e1;
    }
    .empty-icon { margin-bottom: var(--space-4); color: #c5c0ba; }
    .empty-title { font-size: var(--text-lg); font-weight: var(--weight-semibold); color: #1a1a1a; margin-bottom: var(--space-2); }
    .empty-desc { font-size: var(--text-sm); color: #7a7570; max-width: 380px; margin: 0 auto; }
    .mt-4 { margin-top: var(--space-4); }

    /* Table */
    .data-table {
      background: #fff; border: 1px solid #e0ddd9; border-radius: 14px;
      overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.04);
    }
    .table-header, .table-row {
      display: grid; gap: var(--space-3); align-items: center;
      padding: 14px 18px; font-size: var(--text-sm);
    }
    .table-header {
      background: #f8f6f3; font-weight: 600; color: #5a5550;
      font-size: var(--text-xs); text-transform: uppercase; letter-spacing: 0.05em;
      border-bottom: 1px solid #e8e5e1;
    }
    .table-row {
      border-bottom: 1px solid #f0ede9; transition: background 0.15s;
    }
    .table-row:last-child { border-bottom: none; }
    .table-row:hover { background: #faf9f7; }

    .col-order {
      width: 44px; text-align: center; color: #9a9590; font-weight: 700;
      font-size: 12px; font-family: var(--font-mono);
    }
    .col-time {
      width: 72px; font-family: var(--font-mono); font-weight: 600;
      color: #3a3530; font-size: 13px;
      background: #f4f2ef; padding: 4px 8px; border-radius: 6px;
      text-align: center;
    }
    .col-name, .col-category { display: flex; flex-direction: column; gap: 2px; }
    .col-name strong { color: #1a1a1a; font-weight: 600; }
    .col-name small, .col-category small { color: #8a8580; font-size: 12px; }
    .col-stage, .col-day { color: #5a5550; font-size: 13px; }
    .col-status {
      display: flex; align-items: center; gap: 6px;
      text-transform: capitalize; font-size: 12px; color: #5a5550;
    }
    .col-actions { display: flex; gap: 4px; justify-content: flex-end; }

    .table-header .col-order { grid-column: 1; }
    .table-header .col-time { grid-column: 2; }
    .table-header .col-name { grid-column: 3; }
    .table-header .col-category { grid-column: 4; }
    .table-header .col-stage { grid-column: 5; }
    .table-header .col-day { grid-column: 6; }
    .table-header .col-status { grid-column: 7; }
    .table-header .col-actions { grid-column: 8; }

    .table-row, .table-header { grid-template-columns: 44px 72px 1fr 1fr 100px 90px 90px 80px; }

    /* Status dots */
    .status-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
    .status-published { background: #22c55e; box-shadow: 0 0 0 2px rgba(34,197,94,0.2); }
    .status-draft { background: #f59e0b; box-shadow: 0 0 0 2px rgba(245,158,11,0.2); }
    .status-hidden { background: #a09a94; box-shadow: 0 0 0 2px rgba(160,154,148,0.2); }

    /* Badges */
    .badge {
      display: inline-flex; padding: 3px 10px; border-radius: 6px;
      font-size: 11px; font-weight: 600; text-transform: capitalize;
      white-space: nowrap;
    }
    .badge-blue { background: #e8f0fe; color: #1a56db; }
    .badge-green { background: #e6f9ee; color: #0f766e; }
    .badge-orange { background: #fff4e6; color: #c2410c; }
    .badge-purple { background: #f3e8ff; color: #7e22ce; }
    .badge-red { background: #fee2e2; color: #b91c1c; }
    .badge-gray { background: #f0ede9; color: #5a5550; }
    .badge-cyan { background: #ecfeff; color: #0e7490; }

    /* Buttons */
    .btn {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 9px 18px; border-radius: 10px; font-size: var(--text-sm);
      font-weight: 500; border: none; cursor: pointer; transition: all 0.2s;
      white-space: nowrap;
    }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-primary {
      background: #4c8be6; color: #fff;
      box-shadow: 0 2px 8px rgba(76,139,230,0.3);
    }
    .btn-primary:hover:not(:disabled) { background: #3a7bd4; box-shadow: 0 4px 12px rgba(76,139,230,0.4); }
    .btn-secondary { background: #ebe8e4; color: #4a4540; }
    .btn-secondary:hover { background: #e0ddd9; }
    .btn-icon {
      display: inline-flex; align-items: center; justify-content: center;
      width: 34px; height: 34px; border-radius: 9px; border: none;
      background: transparent; color: #8a8580; cursor: pointer;
      transition: all 0.15s;
    }
    .btn-icon:hover { background: #f0ede9; color: #3a3530; }
    .btn-icon.btn-danger:hover { background: #fee2e2; color: #b91c1c; }
    .btn-close { background: #f0ede9; color: #7a7570; flex-shrink: 0; }

    /* Modal */
    .modal-overlay {
      position: fixed; inset: 0; background: rgba(20,18,16,0.5); z-index: 1000;
      display: flex; align-items: center; justify-content: center;
      padding: var(--space-4); backdrop-filter: blur(4px);
      animation: fadeIn 0.15s ease;
    }
    .modal {
      background: #fff; border-radius: 18px; width: 100%; max-width: 600px;
      max-height: 90vh; overflow-y: auto;
      box-shadow: 0 24px 80px rgba(0,0,0,0.2), 0 8px 24px rgba(0,0,0,0.1);
      animation: scaleIn 0.2s ease;
      border-top: 4px solid #4c8be6;
    }
    .modal-pres { border-top-color: #2563eb; }
    .modal-agenda { border-top-color: #16a34a; }
    @keyframes fadeIn { from { opacity: 0; } }
    @keyframes scaleIn { from { opacity: 0; transform: scale(0.95) translateY(8px); } }

    .modal-header {
      display: flex; align-items: flex-start; justify-content: space-between;
      padding: 22px 24px 0; gap: var(--space-3);
    }
    .modal-header h2 { font-size: var(--text-lg); font-weight: var(--weight-bold); color: #1a1a1a; }
    .modal-header-desc { font-size: var(--text-sm); color: #7a7570; margin-top: 3px; }
    .modal-header-pres { padding-top: 16px; }
    .modal-header-agenda { padding-top: 16px; }

    .modal-body { padding: 18px 24px; }
    .modal-footer {
      display: flex; justify-content: flex-end; gap: var(--space-2);
      padding: 16px 24px; border-top: 1px solid #f0ede9;
      background: #faf9f7; border-radius: 0 0 18px 18px;
    }

    /* Form sections */
    .form-section {
      margin-bottom: var(--space-4);
      padding-bottom: var(--space-4);
      border-bottom: 1px solid #f0ede9;
    }
    .form-section:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
    .form-section-header {
      display: flex; align-items: center; gap: 6px;
      font-size: 11px; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.06em; color: #9a9590;
      margin-bottom: var(--space-3);
    }

    /* Forms */
    .form-group { margin-bottom: var(--space-3); }
    .form-group-sm { flex: 1; }
    .form-row { display: flex; gap: var(--space-3); }
    .form-label { display: block; font-size: var(--text-sm); font-weight: 500; color: #3a3530; margin-bottom: 5px; }
    .form-input {
      width: 100%; padding: 10px 13px; border: 1.5px solid #e0ddd9;
      border-radius: 10px; font-size: var(--text-sm); color: #1a1a1a;
      background: #faf9f7; transition: all 0.2s;
      outline: none; box-sizing: border-box;
    }
    .form-input:focus {
      border-color: #4c8be6; background: #fff;
      box-shadow: 0 0 0 3px rgba(76,139,230,0.1);
    }
    .form-textarea { resize: vertical; min-height: 60px; }
    select.form-input { cursor: pointer; appearance: auto; }

    /* Radio cards */
    .radio-cards { display: flex; gap: var(--space-2); }
    .radio-card {
      flex: 1; display: flex; flex-direction: column; align-items: center;
      gap: 5px; padding: 12px 8px; border: 1.5px solid #e0ddd9;
      border-radius: 12px; cursor: pointer; transition: all 0.2s;
      text-align: center; background: #faf9f7;
    }
    .radio-card:hover { border-color: #c5c0ba; background: #f4f2ef; }
    .radio-card-active { border-color: #4c8be6; background: #e8f0fe; }
    .radio-card-dot { width: 9px; height: 9px; border-radius: 50%; }
    .status-dot-bg.status-published { background: #22c55e; }
    .status-dot-bg.status-draft { background: #f59e0b; }
    .status-dot-bg.status-hidden { background: #a09a94; }
    .radio-card-label { font-size: 12px; font-weight: 600; color: #3a3530; }
    .radio-card-desc { font-size: 10px; color: #7a7570; line-height: 1.3; }

    .btn-pres { background: #2563eb; }
    .btn-pres:hover:not(:disabled) { background: #1d4ed8; }
    .btn-agenda { background: #16a34a; }
    .btn-agenda:hover:not(:disabled) { background: #15803d; }

    /* Responsive */
    @media (max-width: 768px) {
      :host { margin: calc(var(--space-3) * -1); padding: var(--space-3); }
      .page-header { flex-direction: column; }
      .form-row { flex-direction: column; gap: 0; }
      .table-header { display: none; }
      .table-row {
        grid-template-columns: 1fr auto; gap: var(--space-2);
        padding: 14px; position: relative;
      }
      .col-order, .col-stage, .col-day, .col-status { display: none; }
      .col-actions { position: absolute; top: 14px; right: 14px; }
      .col-name { grid-column: 1; }
      .col-category { grid-column: 1; }
      .col-time { grid-column: 2; grid-row: 1; }
      .modal { max-width: 100%; margin: var(--space-4); }
      .radio-cards { flex-direction: column; }
    }

    /* ══════════════════════════════════════════ */
    /* DARK MODE                                 */
    /* ══════════════════════════════════════════ */
    :host-context(.dark) { background: #0f1117; }

    :host-context(.dark) .page-title { color: #f1f5f9; }
    :host-context(.dark) .page-subtitle { color: #94a3b8; }

    :host-context(.dark) .toast-success { background: rgba(34,197,94,0.15); color: #4ade80; border-color: rgba(34,197,94,0.3); }
    :host-context(.dark) .toast-error { background: rgba(239,68,68,0.15); color: #f87171; border-color: rgba(239,68,68,0.3); }

    /* Tabs dark */
    :host-context(.dark) .tabs-bar { background: #1e2130; }
    :host-context(.dark) .tab-btn { color: #64748b; }
    :host-context(.dark) .tab-btn:hover { color: #94a3b8; background: rgba(255,255,255,0.04); }
    :host-context(.dark) .tab-active { background: #4c8be6; color: #fff; box-shadow: 0 2px 10px rgba(76,139,230,0.35); }
    :host-context(.dark) .tab-count { background: rgba(255,255,255,0.08); color: #64748b; }
    :host-context(.dark) .tab-active .tab-count { background: rgba(255,255,255,0.2); color: #fff; }

    /* Tab description dark */
    :host-context(.dark) .tab-desc-pres { background: rgba(76,139,230,0.12); color: #93bbfd; border-color: rgba(76,139,230,0.25); }
    :host-context(.dark) .tab-desc-agenda { background: rgba(34,197,94,0.12); color: #6ee7b7; border-color: rgba(34,197,94,0.25); }

    /* Search dark */
    :host-context(.dark) .search-bar { background: #1a1d2e; border-color: #2a2d3e; box-shadow: 0 1px 4px rgba(0,0,0,0.2); }
    :host-context(.dark) .search-bar:focus-within { border-color: #4c8be6; box-shadow: 0 0 0 3px rgba(76,139,230,0.15), 0 2px 8px rgba(0,0,0,0.3); }
    :host-context(.dark) .search-bar svg { color: #64748b; }
    :host-context(.dark) .search-input { color: #e2e8f0; }
    :host-context(.dark) .search-input::placeholder { color: #4a5568; }

    /* Loading dark */
    :host-context(.dark) .loading-state { color: #64748b; }
    :host-context(.dark) .spinner-lg { border-color: #2a2d3e; border-top-color: #4c8be6; }

    /* Empty state dark */
    :host-context(.dark) .empty-state { background: #161927; border-color: #2a2d3e; }
    :host-context(.dark) .empty-icon { color: #334155; }
    :host-context(.dark) .empty-title { color: #e2e8f0; }
    :host-context(.dark) .empty-desc { color: #64748b; }

    /* Table dark */
    :host-context(.dark) .data-table { background: #161927; border-color: #2a2d3e; box-shadow: 0 1px 6px rgba(0,0,0,0.3); }
    :host-context(.dark) .table-header { background: #1a1d2e; color: #94a3b8; border-bottom-color: #2a2d3e; }
    :host-context(.dark) .table-row { border-bottom-color: #1e2130; }
    :host-context(.dark) .table-row:hover { background: #1a1d2e; }

    :host-context(.dark) .col-order { color: #475569; }
    :host-context(.dark) .col-time { color: #e2e8f0; background: #1e2130; }
    :host-context(.dark) .col-name strong { color: #f1f5f9; }
    :host-context(.dark) .col-name small,
    :host-context(.dark) .col-category small { color: #64748b; }
    :host-context(.dark) .col-stage,
    :host-context(.dark) .col-day,
    :host-context(.dark) .col-status { color: #94a3b8; }

    /* Badges dark */
    :host-context(.dark) .badge-blue { background: rgba(37,99,235,0.2); color: #60a5fa; }
    :host-context(.dark) .badge-green { background: rgba(16,185,129,0.2); color: #34d399; }
    :host-context(.dark) .badge-orange { background: rgba(234,88,12,0.2); color: #fb923c; }
    :host-context(.dark) .badge-purple { background: rgba(147,51,234,0.2); color: #c084fc; }
    :host-context(.dark) .badge-red { background: rgba(220,38,38,0.2); color: #f87171; }
    :host-context(.dark) .badge-gray { background: rgba(100,116,139,0.2); color: #94a3b8; }
    :host-context(.dark) .badge-cyan { background: rgba(14,165,233,0.2); color: #38bdf8; }

    /* Buttons dark */
    :host-context(.dark) .btn-secondary { background: #2a2d3e; color: #e2e8f0; }
    :host-context(.dark) .btn-secondary:hover { background: #334155; }
    :host-context(.dark) .btn-icon { color: #64748b; }
    :host-context(.dark) .btn-icon:hover { background: #2a2d3e; color: #e2e8f0; }
    :host-context(.dark) .btn-icon.btn-danger:hover { background: rgba(239,68,68,0.15); color: #f87171; }

    /* Modal dark */
    :host-context(.dark) .modal-overlay { background: rgba(0,0,0,0.65); }
    :host-context(.dark) .modal { background: #161927; border-color: #2a2d3e; box-shadow: 0 24px 80px rgba(0,0,0,0.5); }
    :host-context(.dark) .modal-header h2 { color: #f1f5f9; }
    :host-context(.dark) .modal-header-desc { color: #94a3b8; }
    :host-context(.dark) .modal-icon-pres { background: rgba(37,99,235,0.15); color: #60a5fa; }
    :host-context(.dark) .modal-icon-agenda { background: rgba(34,197,94,0.15); color: #4ade80; }
    :host-context(.dark) .modal-body { background: #161927; }
    :host-context(.dark) .modal-footer { background: #1a1d2e; border-top-color: #2a2d3e; }
    :host-context(.dark) .btn-close { background: #2a2d3e; color: #94a3b8; }
    :host-context(.dark) .btn-close:hover { background: #334155; color: #e2e8f0; }

    /* Form sections dark */
    :host-context(.dark) .form-section { border-bottom-color: #1e2130; }
    :host-context(.dark) .form-section-header { color: #475569; }
    :host-context(.dark) .form-label { color: #cbd5e1; }
    :host-context(.dark) .form-input,
    :host-context(.dark) select.form-input,
    :host-context(.dark) textarea.form-input {
      background-color: transparent !important;
      color: #f1f5f9 !important;
      border-color: rgba(255, 255, 255, 0.08) !important;
    }
    :host-context(.dark) .form-input::placeholder,
    :host-context(.dark) textarea.form-input::placeholder {
      color: #64748b !important;
    }
    :host-context(.dark) .form-input:focus {
      border-color: #4c8be6 !important;
      background-color: transparent !important;
      box-shadow: 0 0 0 3px rgba(76,139,230,0.15) !important;
    }
    :host-context(.dark) select.form-input option {
      background-color: #1a1d2e;
      color: #f1f5f9;
    }

    /* Radio cards dark */
    :host-context(.dark) .radio-card { background: #1e2130; border-color: #2a2d3e; }
    :host-context(.dark) .radio-card:hover { background: #252838; border-color: #334155; }
    :host-context(.dark) .radio-card-active { border-color: #4c8be6; background: rgba(76,139,230,0.12); }
    :host-context(.dark) .radio-card-label { color: #ffffff; }
    :host-context(.dark) .radio-card-desc { color: #94a3b8; }

    /* Status dots dark */
    :host-context(.dark) .status-published { background: #4ade80; box-shadow: 0 0 0 2px rgba(74,222,128,0.25); }
    :host-context(.dark) .status-draft { background: #fbbf24; box-shadow: 0 0 0 2px rgba(251,191,36,0.25); }
    :host-context(.dark) .status-hidden { background: #64748b; box-shadow: 0 0 0 2px rgba(100,116,139,0.25); }
    :host-context(.dark) .status-dot-bg.status-published { background: #4ade80; }
    :host-context(.dark) .status-dot-bg.status-draft { background: #fbbf24; }
    :host-context(.dark) .status-dot-bg.status-hidden { background: #64748b; }
  `]
})
export class CronogramaPageComponent implements OnInit {
  private http = inject(HttpClient);

  // State
  activeTab = signal<'presentations' | 'agenda'>('presentations');
  loading = signal(true);
  saving = signal(false);
  showModal = signal(false);
  editingId = signal<string | null>(null);
  searchTerm = signal('');
  toast = signal('');
  toastType = signal<'success' | 'error'>('success');

  presentations = signal<PresentationItem[]>([]);
  agendaEvents = signal<AgendaEvent[]>([]);

  // Forms
  presForm = this.emptyPresForm();
  agendaForm = this.emptyAgendaForm();

  // Options
  timeOptions = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
    '20:00', '20:30', '21:00', '21:30', '22:00', '22:30', '23:00',
  ];

  dayOptions = [
    { value: 'viernes-14', label: 'Viernes 14 de Noviembre' },
    { value: 'sabado-15', label: 'Sábado 15 de Noviembre' },
    { value: 'domingo-16', label: 'Domingo 16 de Noviembre' },
  ];

  categoryOptions = [
    'Solista', 'Dúo', 'Trío', 'Cuarteto', 'Quinteto',
    'Orquesta', 'Coro', 'Banda', 'Ensemble', 'Otro',
  ];

  subcategoryOptions = [
    'Infantil', 'Juvenil', 'Adulto', 'Senior', 'Abierto',
    'Folklor', 'Clásico', 'Popular', 'Jazz', 'Rock', 'Otro',
  ];

  stageOptions = [
    'Escenario Principal', 'Escenario Secundario', 'Sala de Conciertos',
    'Aire Libre', 'Salón Interior', 'Otro',
  ];

  eventTypeOptions = [
    { value: 'soundcheck', label: '🔊 Soundcheck' },
    { value: 'rehearsal', label: '🎭 Ensayo' },
    { value: 'opening', label: '🎊 Apertura' },
    { value: 'closing', label: '🎉 Cierre' },
    { value: 'break', label: '☕ Descanso' },
    { value: 'presentation', label: '🎵 Presentación' },
    { value: 'other', label: '📋 Otro' },
  ];

  // Filtered
  filteredPresentations = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const items = this.presentations();
    if (!term) return items;
    return items.filter(p =>
      p.participantName.toLowerCase().includes(term) ||
      p.groupName?.toLowerCase().includes(term) ||
      p.category.toLowerCase().includes(term) ||
      p.subcategory?.toLowerCase().includes(term)
    );
  });

  filteredAgenda = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const items = this.agendaEvents();
    if (!term) return items;
    return items.filter(e =>
      e.title.toLowerCase().includes(term) ||
      e.description?.toLowerCase().includes(term) ||
      e.location?.toLowerCase().includes(term)
    );
  });

  ngOnInit() {
    this.loadAll();
  }

  loadAll() {
    this.loading.set(true);
    let loaded = 0;
    const check = () => { loaded++; if (loaded === 2) this.loading.set(false); };

    this.http.get<any>(`${API}/presentations?page_size=200`).subscribe({
      next: (res) => { this.presentations.set(res.data || []); check(); },
      error: () => { this.presentations.set([]); check(); }
    });
    this.http.get<any>(`${API}/agenda?page_size=200`).subscribe({
      next: (res) => { this.agendaEvents.set(res.data || []); check(); },
      error: () => { this.agendaEvents.set([]); check(); }
    });
  }

  // ─── Presentation CRUD ───

  openCreateModal() {
    this.editingId.set(null);
    if (this.activeTab() === 'presentations') {
      this.presForm = this.emptyPresForm();
    } else {
      this.agendaForm = this.emptyAgendaForm();
    }
    this.showModal.set(true);
  }

  editPresentation(item: PresentationItem) {
    this.editingId.set(item.id);
    this.presForm = {
      order: item.order,
      time: item.time || '',
      category: item.category,
      subcategory: item.subcategory || '',
      participantName: item.participantName,
      groupName: item.groupName || '',
      stage: item.stage || '',
      day: item.day || '',
      observations: item.observations || '',
      status: item.status,
    };
    this.showModal.set(true);
  }

  savePresentation() {
    if (!this.presForm.participantName || !this.presForm.category || !this.presForm.day || !this.presForm.time) return;
    this.saving.set(true);
    const payload = {
      ...this.presForm,
      order: Number(this.presForm.order) || 0,
    };

    const req = this.editingId()
      ? this.http.patch(`${API}/presentations/${this.editingId()}`, payload)
      : this.http.post(`${API}/presentations`, payload);

    req.subscribe({
      next: () => {
        this.showToast(this.editingId() ? 'Presentación actualizada' : 'Presentación creada', 'success');
        this.closeModal();
        this.loadAll();
      },
      error: (err) => {
        this.showToast(err.error?.detail || 'Error al guardar', 'error');
        this.saving.set(false);
      }
    });
  }

  deletePresentation(id: string) {
    if (!confirm('¿Eliminar esta presentación?')) return;
    this.http.delete(`${API}/presentations/${id}`).subscribe({
      next: () => { this.showToast('Presentación eliminada', 'success'); this.loadAll(); },
      error: (err) => this.showToast(err.error?.detail || 'Error al eliminar', 'error')
    });
  }

  // ─── Agenda CRUD ───

  editAgendaEvent(item: AgendaEvent) {
    this.editingId.set(item.id);
    this.agendaForm = {
      time: item.time || '',
      title: item.title,
      description: item.description || '',
      location: item.location || '',
      eventType: item.eventType,
      day: item.day || '',
      status: item.status,
    };
    this.showModal.set(true);
  }

  saveAgendaEvent() {
    if (!this.agendaForm.title || !this.agendaForm.day || !this.agendaForm.time) return;
    this.saving.set(true);

    const req = this.editingId()
      ? this.http.patch(`${API}/agenda/${this.editingId()}`, this.agendaForm)
      : this.http.post(`${API}/agenda`, this.agendaForm);

    req.subscribe({
      next: () => {
        this.showToast(this.editingId() ? 'Evento actualizado' : 'Evento creado', 'success');
        this.closeModal();
        this.loadAll();
      },
      error: (err) => {
        this.showToast(err.error?.detail || 'Error al guardar', 'error');
        this.saving.set(false);
      }
    });
  }

  deleteAgendaEvent(id: string) {
    if (!confirm('¿Eliminar este evento?')) return;
    this.http.delete(`${API}/agenda/${id}`).subscribe({
      next: () => { this.showToast('Evento eliminado', 'success'); this.loadAll(); },
      error: (err) => this.showToast(err.error?.detail || 'Error al eliminar', 'error')
    });
  }

  // ─── Helpers ───

  closeModal() {
    this.showModal.set(false);
    this.editingId.set(null);
    this.saving.set(false);
  }

  showToast(msg: string, type: 'success' | 'error') {
    this.toast.set(msg);
    this.toastType.set(type);
    setTimeout(() => this.toast.set(''), 3000);
  }

  getEventBadgeClass(type: string): string {
    const map: Record<string, string> = {
      presentation: 'badge-blue',
      soundcheck: 'badge-orange',
      rehearsal: 'badge-purple',
      opening: 'badge-green',
      closing: 'badge-red',
      break: 'badge-gray',
      other: 'badge-cyan',
    };
    return map[type] || 'badge-gray';
  }

  getEventLabel(type: string): string {
    const found = this.eventTypeOptions.find(t => t.value === type);
    return found ? found.label : type;
  }

  emptyPresForm() {
    return {
      order: 0, time: '', category: '', subcategory: '',
      participantName: '', groupName: '', stage: '', day: '',
      observations: '', status: 'published',
    };
  }

  emptyAgendaForm() {
    return {
      time: '', title: '', description: '', location: '',
      eventType: 'soundcheck', day: '', status: 'published',
    };
  }
}
