import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpEventType, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { PartnersService, Partner } from '@core/services/partners.service';

interface PartnerFormData {
  name: string;
  logo_url: string;
  link_url: string;
  category: 'sponsor' | 'colaborador';
  order: number;
  is_active: boolean;
}

@Component({
  selector: 'app-partners-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="partners-admin">
      <div class="partners-header">
        <div>
          <h1 class="page-title">Partners — Sponsor & Colaboradores</h1>
          <p class="page-sub">Gestioná los logos que aparecen en el footer del sitio público</p>
        </div>
        <button class="btn-primary" (click)="openCreateModal()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Agregar Partner
        </button>
      </div>

      <!-- Filters -->
      <div class="toolbar">
        <div class="search-bar">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" placeholder="Buscar nombre..." [ngModel]="search()" (ngModelChange)="search.set($event)" />
          @if (search()) { <button class="clear" (click)="search.set('')">✕</button> }
        </div>
        <select class="filter-select" [ngModel]="categoryFilter()" (ngModelChange)="categoryFilter.set($event)">
          <option value="">Todos</option>
          <option value="sponsor">Sponsors</option>
          <option value="colaborador">Colaboradores</option>
        </select>
        <label class="toggle-inactive">
          <input type="checkbox" [ngModel]="showInactive()" (ngModelChange)="showInactive.set($event); load()" />
          <span>Inactivos</span>
        </label>
      </div>

      @if (loading()) {
        <div class="loading"><div class="spinner"></div><p>Cargando partners...</p></div>
      } @else if (filteredPartners().length === 0) {
        <div class="empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          <h3>Sin partners</h3>
          <p>Agregá sponsors o colaboradores con el botón de arriba.</p>
        </div>
      } @else {
        <!-- Sponsors Section -->
        @if (sponsors().length > 0) {
          <div class="section">
            <h2 class="section-title">Sponsors (Destacados)</h2>
            <div class="partners-grid">
              @for (p of sponsors(); track p.id) {
                <div class="partner-card" [class.inactive]="!p.is_active">
                  <div class="partner-logo-wrap">
                    <img [src]="p.logo_url" [alt]="p.name" class="partner-logo" />
                  </div>
                  <div class="partner-info">
                    <span class="partner-name">{{ p.name }}</span>
                    @if (p.link_url) {
                      <a class="partner-link" [href]="p.link_url" target="_blank" title="Abrir enlace">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                      </a>
                    }
                  </div>
                  <div class="partner-actions">
                    <span class="order-badge" title="Orden">{{ p.order }}</span>
                    <button class="btn-icon" (click)="moveUp(p)" title="Mover arriba" [disabled]="isFirst(p)">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"/></svg>
                    </button>
                    <button class="btn-icon" (click)="moveDown(p)" title="Mover abajo" [disabled]="isLast(p)">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
                    </button>
                    <button class="btn-icon" (click)="toggleActive(p)" [title]="p.is_active ? 'Desactivar' : 'Activar'">
                      @if (p.is_active) {
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      } @else {
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      }
                    </button>
                    <button class="btn-icon" (click)="openEditModal(p)" title="Editar">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button class="btn-icon" (click)="confirmDelete(p)" title="Eliminar">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                  </div>
                </div>
              }
            </div>
          </div>
        }

        <!-- Colaboradores Section -->
        @if (colaboradores().length > 0) {
          <div class="section">
            <h2 class="section-title">Colaboradores</h2>
            <div class="partners-grid">
              @for (p of colaboradores(); track p.id) {
                <div class="partner-card" [class.inactive]="!p.is_active">
                  <div class="partner-logo-wrap">
                    <img [src]="p.logo_url" [alt]="p.name" class="partner-logo" />
                  </div>
                  <div class="partner-info">
                    <span class="partner-name">{{ p.name }}</span>
                    @if (p.link_url) {
                      <a class="partner-link" [href]="p.link_url" target="_blank" title="Abrir enlace">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                      </a>
                    }
                  </div>
                  <div class="partner-actions">
                    <span class="order-badge" title="Orden">{{ p.order }}</span>
                    <button class="btn-icon" (click)="moveUp(p)" title="Mover arriba" [disabled]="isFirst(p)">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"/></svg>
                    </button>
                    <button class="btn-icon" (click)="moveDown(p)" title="Mover abajo" [disabled]="isLast(p)">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
                    </button>
                    <button class="btn-icon" (click)="toggleActive(p)" [title]="p.is_active ? 'Desactivar' : 'Activar'">
                      @if (p.is_active) {
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      } @else {
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      }
                    </button>
                    <button class="btn-icon" (click)="openEditModal(p)" title="Editar">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button class="btn-icon" (click)="confirmDelete(p)" title="Eliminar">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                  </div>
                </div>
              }
            </div>
          </div>
        }
      }
    </div>

    <!-- CREATE / EDIT MODAL -->
    @if (showModal()) {
      <div class="modal-overlay" (click)="closeModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>{{ editingPartner() ? 'Editar Partner' : 'Agregar Partner' }}</h2>
            <button class="modal-close" (click)="closeModal()">✕</button>
          </div>
          <div class="modal-body">
            <!-- Logo Upload -->
            <div class="form-group">
              <label class="form-label">Logo</label>
              @if (formData().logo_url) {
                <div class="logo-preview">
                  <img [src]="formData().logo_url" alt="Preview" class="preview-img" />
                  <button class="remove-logo" (click)="updateField('logo_url', '')">✕</button>
                </div>
              }
              <div class="upload-area" (click)="fileInput.click()" (dragover)="$event.preventDefault()" (drop)="onDrop($event)">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                <p>Arrastrá el logo o <span class="upload-link">hacé click</span></p>
                <p class="upload-hint">WebP, PNG o JPG — máx 2MB</p>
              </div>
              <input #fileInput type="file" accept="image/webp,image/png,image/jpeg" (change)="onFileSelected($event)" style="display:none" />
              @if (uploading()) {
                <div class="upload-progress"><div class="spinner-sm"></div><span>Subiendo logo...</span></div>
              }
              <input class="form-input" placeholder="O pegá la URL del logo (assets/img/...)" [ngModel]="formData().logo_url" (ngModelChange)="updateField('logo_url', $event)" />
            </div>

            <!-- Name -->
            <div class="form-group">
              <label class="form-label">Nombre</label>
              <input class="form-input" placeholder="Ej: Hotel Rayentray" [ngModel]="formData().name" (ngModelChange)="updateField('name', $event)" />
            </div>

            <!-- Link URL -->
            <div class="form-group">
              <label class="form-label">Enlace (opcional)</label>
              <input class="form-input" placeholder="https://www.instagram.com/..." [ngModel]="formData().link_url" (ngModelChange)="updateField('link_url', $event)" />
            </div>

            <!-- Category + Order -->
            <div class="form-row">
              <div class="form-group form-half">
                <label class="form-label">Categoría</label>
                <select class="form-select" [ngModel]="formData().category" (ngModelChange)="updateField('category', $event)">
                  <option value="sponsor">Sponsor (Destacado)</option>
                  <option value="colaborador">Colaborador</option>
                </select>
              </div>
              <div class="form-group form-half">
                <label class="form-label">Orden</label>
                <input class="form-input" type="number" min="0" [ngModel]="formData().order" (ngModelChange)="updateField('order', +$event)" />
              </div>
            </div>

            <!-- Active -->
            <div class="form-group">
              <label class="toggle-label">
                <input type="checkbox" [ngModel]="formData().is_active" (ngModelChange)="updateField('is_active', $event)" />
                <span class="toggle-slider"></span>
                <span>Activo (visible en el sitio)</span>
              </label>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-cancel" (click)="closeModal()">Cancelar</button>
            <button class="btn-save" (click)="savePartner()" [disabled]="saving() || !formData().name || !formData().logo_url">
              @if (saving()) { Guardando... } @else { {{ editingPartner() ? 'Guardar cambios' : 'Crear partner' }} }
            </button>
          </div>
        </div>
      </div>
    }

    <!-- DELETE MODAL -->
    @if (deleteTarget()) {
      <div class="modal-overlay" (click)="deleteTarget.set(null)">
        <div class="modal modal-sm" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>Eliminar Partner</h2>
            <button class="modal-close" (click)="deleteTarget.set(null)">✕</button>
          </div>
          <div class="modal-body">
            <p>¿Estás seguro de eliminar <strong>{{ deleteTarget()?.name }}</strong>?</p>
            <p class="warn-text">Esta acción no se puede deshacer.</p>
          </div>
          <div class="modal-footer">
            <button class="btn-cancel" (click)="deleteTarget.set(null)">Cancelar</button>
            <button class="btn-danger" (click)="executeDelete()" [disabled]="deleting()">
              @if (deleting()) { Eliminando... } @else { Eliminar }
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .partners-admin { padding: 16px; max-width: 1200px; margin: 0 auto; }
    .partners-header { display:flex; justify-content:space-between; align-items:flex-start; gap:16px; margin-bottom:20px; flex-wrap:wrap; }
    .page-title { font-family:var(--font-display); font-size:22px; font-weight:800; color:#0f172a; margin:0 0 4px; }
    .page-sub { font-size:13px; color:#64748b; margin:0; }
    .btn-primary { display:inline-flex; align-items:center; gap:6px; padding:10px 18px; border-radius:10px; border:none; background:#3b82f6; color:#fff; font-size:13px; font-weight:600; cursor:pointer; transition:all 0.15s; }
    .btn-primary:hover { background:#2563eb; }
    .toolbar { display:flex; gap:12px; margin-bottom:20px; flex-wrap:wrap; align-items:center; }
    .search-bar { display:flex; align-items:center; gap:8px; background:#fff; border:1px solid #e2e8f0; border-radius:12px; padding:0 14px; flex:1; min-width:200px; }
    .search-bar input { flex:1; border:none; outline:none; padding:10px 0; font-size:14px; background:transparent; }
    .search-bar .clear { background:none; border:none; cursor:pointer; color:#94a3b8; font-size:14px; }
    .filter-select { padding:10px 14px; border-radius:10px; border:1px solid #e2e8f0; background:#fff; font-size:13px; }
    .toggle-inactive { display:flex; align-items:center; gap:6px; font-size:13px; color:#475569; cursor:pointer; user-select:none; }
    .toggle-inactive input { accent-color:#3b82f6; }

    .loading, .empty { text-align:center; padding:48px; color:#64748b; }
    .spinner { width:28px; height:28px; border:3px solid #e2e8f0; border-top-color:#3b82f6; border-radius:50%; animation:spin 0.7s linear infinite; margin:0 auto 12px; }
    @keyframes spin { to { transform:rotate(360deg); } }
    .empty h3 { color:#0f172a; margin:8px 0 4px; }
    .empty p { font-size:13px; margin:0; }

    .section { margin-bottom:28px; }
    .section-title { font-size:14px; font-weight:700; color:#475569; text-transform:uppercase; letter-spacing:0.08em; margin:0 0 12px; padding-bottom:8px; border-bottom:1px solid #e2e8f0; }

    .partners-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(280px, 1fr)); gap:12px; }
    .partner-card { display:flex; align-items:center; gap:12px; padding:12px 16px; background:#fff; border:1px solid #e2e8f0; border-radius:12px; transition:all 0.15s; }
    .partner-card:hover { border-color:#3b82f6; box-shadow:0 2px 8px rgba(59,130,246,0.08); }
    .partner-card.inactive { opacity:0.5; }
    .partner-logo-wrap { width:60px; height:60px; display:flex; align-items:center; justify-content:center; background:#f8fafc; border-radius:10px; flex-shrink:0; overflow:hidden; }
    .partner-logo { max-width:56px; max-height:56px; object-fit:contain; }
    .partner-info { flex:1; min-width:0; display:flex; align-items:center; gap:6px; }
    .partner-name { font-size:13px; font-weight:600; color:#0f172a; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .partner-link { color:#94a3b8; text-decoration:none; display:flex; flex-shrink:0; }
    .partner-link:hover { color:#3b82f6; }
    .partner-actions { display:flex; align-items:center; gap:4px; flex-shrink:0; }
    .order-badge { font-size:11px; font-weight:700; color:#94a3b8; min-width:20px; text-align:center; }
    .btn-icon { width:28px; height:28px; display:inline-flex; align-items:center; justify-content:center; border-radius:6px; border:none; background:transparent; cursor:pointer; transition:all 0.15s; }
    .btn-icon:hover { background:#f1f5f9; }
    .btn-icon:disabled { opacity:0.3; cursor:not-allowed; }

    /* Modal */
    .modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; z-index:1000; padding:16px; }
    .modal { background:#fff; border-radius:16px; width:100%; max-width:520px; box-shadow:0 20px 60px rgba(0,0,0,0.2); max-height:90vh; overflow-y:auto; }
    .modal-sm { max-width:400px; }
    .modal-header { display:flex; justify-content:space-between; align-items:center; padding:20px 24px 0; }
    .modal-header h2 { font-size:18px; font-weight:700; color:#0f172a; margin:0; }
    .modal-close { background:none; border:none; font-size:18px; color:#94a3b8; cursor:pointer; padding:4px; }
    .modal-body { padding:20px 24px; }
    .modal-body p { margin:0 0 8px; color:#334155; font-size:14px; }
    .modal-footer { display:flex; justify-content:flex-end; gap:10px; padding:0 24px 20px; }
    .btn-cancel { padding:10px 16px; border-radius:8px; border:1px solid #e2e8f0; background:#fff; font-size:13px; cursor:pointer; }
    .btn-save { padding:10px 20px; border-radius:8px; border:none; background:#3b82f6; color:#fff; font-size:13px; font-weight:600; cursor:pointer; }
    .btn-save:disabled { opacity:0.5; cursor:not-allowed; }
    .btn-danger { padding:10px 20px; border-radius:8px; border:none; background:#ef4444; color:#fff; font-size:13px; font-weight:600; cursor:pointer; }
    .btn-danger:disabled { opacity:0.5; cursor:not-allowed; }
    .warn-text { color:#94a3b8; font-size:13px; margin:8px 0 0; }

    .form-group { margin-bottom:16px; }
    .form-label { display:block; font-size:12px; font-weight:600; color:#475569; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:6px; }
    .form-input { width:100%; padding:10px 14px; border:1px solid #e2e8f0; border-radius:10px; font-size:14px; outline:none; transition:border-color 0.15s; }
    .form-input:focus { border-color:#3b82f6; }
    .form-select { width:100%; padding:10px 14px; border:1px solid #e2e8f0; border-radius:10px; font-size:14px; background:#fff; }
    .form-row { display:flex; gap:16px; }
    .form-half { flex:1; }

    .upload-area { border:2px dashed #e2e8f0; border-radius:12px; padding:24px; text-align:center; cursor:pointer; transition:all 0.15s; }
    .upload-area:hover { border-color:#3b82f6; background:#f8fafc; }
    .upload-area p { margin:4px 0; font-size:13px; color:#64748b; }
    .upload-link { color:#3b82f6; font-weight:600; }
    .upload-hint { font-size:11px; color:#94a3b8; }
    .upload-progress { display:flex; align-items:center; gap:8px; margin-top:8px; font-size:13px; color:#3b82f6; }
    .spinner-sm { width:16px; height:16px; border:2px solid #e2e8f0; border-top-color:#3b82f6; border-radius:50%; animation:spin 0.7s linear infinite; }
    .logo-preview { display:flex; align-items:center; gap:8px; margin-bottom:8px; }
    .preview-img { height:48px; max-width:120px; object-fit:contain; background:#f8fafc; padding:4px 8px; border-radius:8px; border:1px solid #e2e8f0; }
    .remove-logo { background:none; border:none; color:#ef4444; cursor:pointer; font-size:16px; }

    .toggle-label { display:flex; align-items:center; gap:10px; cursor:pointer; font-size:13px; color:#334155; user-select:none; }
    .toggle-label input { accent-color:#3b82f6; width:16px; height:16px; }

    /* Dark mode */
    :host-context(.dark) .page-title { color:#f8fafc; }
    :host-context(.dark) .page-sub { color:#94a3b8; }
    :host-context(.dark) .search-bar { background:#1e293b; border-color:#334155; }
    :host-context(.dark) .search-bar input { color:#f1f5f9; }
    :host-context(.dark) .search-bar svg { color:#94a3b8; }
    :host-context(.dark) .filter-select { background:#1e293b; border-color:#334155; color:#f1f5f9; }
    :host-context(.dark) .filter-select option { background:#1e293b; }
    :host-context(.dark) .toggle-inactive { color:#94a3b8; }
    :host-context(.dark) .section-title { color:#94a3b8; border-color:#334155; }
    :host-context(.dark) .loading, :host-context(.dark) .empty { color:#94a3b8; }
    :host-context(.dark) .empty h3 { color:#f1f5f9; }
    :host-context(.dark) .partner-card { background:#1e293b; border-color:#334155; }
    :host-context(.dark) .partner-card:hover { border-color:#3b82f6; }
    :host-context(.dark) .partner-logo-wrap { background:#0f172a; }
    :host-context(.dark) .partner-name { color:#f1f5f9; }
    :host-context(.dark) .btn-icon:hover { background:#334155; }
    :host-context(.dark) .modal { background:#1e293b; }
    :host-context(.dark) .modal-header h2 { color:#f8fafc; }
    :host-context(.dark) .modal-body p { color:#e2e8f0; }
    :host-context(.dark) .form-input { background:#0f172a; border-color:#334155; color:#f1f5f9; }
    :host-context(.dark) .form-select { background:#0f172a; border-color:#334155; color:#f1f5f9; }
    :host-context(.dark) .upload-area { border-color:#334155; }
    :host-context(.dark) .upload-area:hover { background:#0f172a; }
    :host-context(.dark) .preview-img { background:#0f172a; border-color:#334155; }
    :host-context(.dark) .btn-cancel { background:#334155; border-color:#475569; color:#e2e8f0; }
    :host-context(.dark) .toggle-label { color:#e2e8f0; }
  `]
})
export class PartnersAdminPageComponent implements OnInit {
  private http = inject(HttpClient);
  private partnersService = inject(PartnersService);

  partners = signal<Partner[]>([]);
  loading = signal(true);
  search = signal('');
  categoryFilter = signal('');
  showInactive = signal(false);

  showModal = signal(false);
  editingPartner = signal<Partner | null>(null);
  formData = signal<PartnerFormData>({ name: '', logo_url: '', link_url: '', category: 'colaborador', order: 0, is_active: true });
  uploading = signal(false);
  saving = signal(false);

  deleteTarget = signal<Partner | null>(null);
  deleting = signal(false);

  sponsors = computed(() => {
    let list = this.partners().filter(p => p.category === 'sponsor');
    if (this.search()) list = list.filter(p => p.name.toLowerCase().includes(this.search().toLowerCase()));
    return list;
  });

  colaboradores = computed(() => {
    let list = this.partners().filter(p => p.category === 'colaborador');
    if (this.search()) list = list.filter(p => p.name.toLowerCase().includes(this.search().toLowerCase()));
    return list;
  });

  filteredPartners = computed(() => [...this.sponsors(), ...this.colaboradores()]);

  ngOnInit() { this.load(); }

  load(): void {
    this.loading.set(true);
    this.partnersService.getAllList().subscribe({
      next: (res) => { this.partners.set(res.data || []); this.loading.set(false); },
      error: () => { this.loading.set(false); }
    });
  }

  openCreateModal(): void {
    this.editingPartner.set(null);
    this.formData.set({ name: '', logo_url: '', link_url: '', category: 'colaborador', order: this.partners().length, is_active: true });
    this.showModal.set(true);
  }

  openEditModal(p: Partner): void {
    this.editingPartner.set(p);
    this.formData.set({ name: p.name, logo_url: p.logo_url, link_url: p.link_url || '', category: p.category, order: p.order, is_active: p.is_active });
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingPartner.set(null);
  }

  updateField(field: string, value: any): void {
    this.formData.update(f => ({ ...f, [field]: value }));
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) this.uploadFile(input.files[0]);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    const file = event.dataTransfer?.files?.[0];
    if (file) this.uploadFile(file);
  }

  uploadFile(file: File): void {
    if (file.size > 2 * 1024 * 1024) { alert('El archivo excede 2MB'); return; }
    this.uploading.set(true);
    const ext = file.name.split('.').pop() || 'webp';
    const path = `partners/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const formData = new FormData();
    formData.append('file', file);

    this.http.post<{ path: string }>(`${environment.apiUrl}/storage/upload/logos/${path}`, formData).subscribe({
      next: (res) => {
        const publicUrl = `${environment.supabaseUrl}/storage/v1/object/public/logos/${path}`;
        this.updateField('logo_url', publicUrl);
        this.uploading.set(false);
      },
      error: () => { this.uploading.set(false); alert('Error al subir el logo'); }
    });
  }

  savePartner(): void {
    const data = this.formData();
    if (!data.name || !data.logo_url) return;
    this.saving.set(true);

    const obs = this.editingPartner()
      ? this.partnersService.update(this.editingPartner()!.id, data as any)
      : this.partnersService.create(data as any);

    obs.subscribe({
      next: () => { this.saving.set(false); this.closeModal(); this.load(); },
      error: (err) => { this.saving.set(false); alert(err.error?.detail || 'Error al guardar'); }
    });
  }

  confirmDelete(p: Partner): void { this.deleteTarget.set(p); }

  executeDelete(): void {
    const p = this.deleteTarget();
    if (!p) return;
    this.deleting.set(true);
    this.partnersService.delete(p.id).subscribe({
      next: () => { this.deleteTarget.set(null); this.deleting.set(false); this.load(); },
      error: (err) => { this.deleting.set(false); alert(err.error?.detail || 'Error al eliminar'); }
    });
  }

  isFirst(p: Partner): boolean {
    const list = p.category === 'sponsor' ? this.sponsors() : this.colaboradores();
    return list[0]?.id === p.id;
  }

  isLast(p: Partner): boolean {
    const list = p.category === 'sponsor' ? this.sponsors() : this.colaboradores();
    return list[list.length - 1]?.id === p.id;
  }

  moveUp(p: Partner): void {
    const list = p.category === 'sponsor' ? this.sponsors() : this.colaboradores();
    const idx = list.findIndex(x => x.id === p.id);
    if (idx <= 0) return;
    const prev = list[idx - 1];
    this.partnersService.reorder(p.id, prev.order).subscribe(() => {
      this.partnersService.reorder(prev.id, p.order).subscribe(() => this.load());
    });
  }

  moveDown(p: Partner): void {
    const list = p.category === 'sponsor' ? this.sponsors() : this.colaboradores();
    const idx = list.findIndex(x => x.id === p.id);
    if (idx < 0 || idx >= list.length - 1) return;
    const next = list[idx + 1];
    this.partnersService.reorder(p.id, next.order).subscribe(() => {
      this.partnersService.reorder(next.id, p.order).subscribe(() => this.load());
    });
  }

  toggleActive(p: Partner): void {
    this.partnersService.update(p.id, { is_active: !p.is_active } as any).subscribe(() => this.load());
  }
}
