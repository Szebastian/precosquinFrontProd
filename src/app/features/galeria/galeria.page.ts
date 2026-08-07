import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GalleryService, GalleryItem, GalleryItemCreate } from '../../core/services/gallery.service';

interface PendingFile {
  file: File;
  preview: string;
  title: string;
  status: 'pending' | 'uploading' | 'done' | 'error';
  error?: string;
}

interface Folder {
  name: string;
  cover: string;
  count: number;
  items: GalleryItem[];
}

@Component({
  selector: 'app-galeria',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <!-- Toast -->
      @if (toast()) {
        <div class="toast" [class.toast-success]="toastType() === 'success'" [class.toast-error]="toastType() === 'error'">
          {{ toast() }}
        </div>
      }

      <!-- ════════════════════════════════════════════════════
           VIEW: FOLDERS (main)
           ════════════════════════════════════════════════════ -->
      @if (view() === 'folders') {
        <div class="page-header">
          <div>
            <h1 class="page-title">Galería</h1>
            <p class="page-subtitle">{{ folders().length }} carpetas · {{ items().length }} imágenes en total</p>
          </div>
          <button class="btn btn-primary" (click)="showNewFolderModal.set(true)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/></svg>
            Nueva carpeta
          </button>
        </div>

        @if (loading()) {
          <div class="loading-state"><div class="spinner-lg"></div><p>Cargando carpetas...</p></div>
        } @else if (folders().length === 0) {
          <div class="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
            <h3>No hay carpetas</h3>
            <p>Creá una carpeta para organizar tus imágenes</p>
          </div>
        } @else {
          <div class="folders-grid">
            @for (folder of folders(); track folder.name) {
              <div class="folder-card" (click)="openFolder(folder.name)">
                <div class="folder-cover">
                  @if (folder.cover) {
                    <img [src]="folder.cover" [alt]="folder.name" />
                  } @else {
                    <div class="folder-cover-empty">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                    </div>
                  }
                  <div class="folder-count">{{ folder.count }}</div>
                </div>
                <div class="folder-info">
                  <span class="folder-name">{{ folder.name }}</span>
                  <span class="folder-count-label">{{ folder.count }} {{ folder.count === 1 ? 'imagen' : 'imágenes' }}</span>
                </div>
                <button class="folder-delete" (click)="deleteFolder(folder.name, $event)" title="Eliminar carpeta">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
              </div>
            }
          </div>
        }

        <!-- New Folder Modal -->
        @if (showNewFolderModal()) {
          <div class="modal-overlay" (click)="showNewFolderModal.set(false)">
            <div class="modal" (click)="$event.stopPropagation()">
              <div class="modal-header">
                <h2>Nueva carpeta</h2>
                <button class="btn-close" (click)="showNewFolderModal.set(false)">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
              <div class="modal-body">
                <div class="form-group">
                  <label class="form-label">Nombre de la carpeta</label>
                  <input type="text" class="form-input" [(ngModel)]="newFolderName" placeholder="Ej: Ensayos, Backstage, Presentaciones..." autofocus (keydown.enter)="createFolder()" />
                </div>
                <p class="form-hint">Las carpetas se usan para agrupar imágenes de la galería del home.</p>
              </div>
              <div class="modal-footer">
                <button class="btn btn-ghost" (click)="showNewFolderModal.set(false)">Cancelar</button>
                <button class="btn btn-primary" (click)="createFolder()" [disabled]="!newFolderName.trim()">Crear carpeta</button>
              </div>
            </div>
          </div>
        }
      }

      <!-- ════════════════════════════════════════════════════
           VIEW: FOLDER DETAIL (inside a folder)
           ════════════════════════════════════════════════════ -->
      @if (view() === 'folder') {
        <div class="page-header">
          <div class="header-with-back">
            <button class="btn-back" (click)="view.set('folders')">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <div>
              <h1 class="page-title">{{ selectedFolder() }}</h1>
              <p class="page-subtitle">{{ folderItems().length }} {{ folderItems().length === 1 ? 'imagen' : 'imágenes' }}</p>
            </div>
          </div>
        </div>

        <!-- Upload Zone -->
        <div class="upload-card">
          <div class="upload-zone"
            [class.upload-zone-active]="isDragOver()"
            [class.upload-zone-has-files]="pendingFiles().length > 0"
            (click)="fileInput.click()"
            (dragover)="onDragOver($event)"
            (dragleave)="onDragLeave($event)"
            (drop)="onDrop($event)">
            <input type="file" #fileInput accept="image/*" multiple hidden (change)="onFilesSelected($event)" />

            @if (pendingFiles().length === 0) {
              <div class="upload-icon">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
              </div>
              <h3 class="upload-title">Subir imágenes a "{{ selectedFolder() }}"</h3>
              <p class="upload-desc">Arrastrá fotos o hacé click para seleccionar</p>
            } @else {
              <div class="upload-header">
                <h3 class="upload-title-sm">{{ pendingFiles().length }} imagen(es) para subir</h3>
                <button class="btn-text" (click)="clearPending($event)">Limpiar</button>
              </div>
            }
          </div>

          @if (pendingFiles().length > 0) {
            <div class="upload-controls">
              <div class="controls-row">
                <div class="form-group">
                  <label class="form-label">Orden inicial</label>
                  <input type="number" class="form-input" [(ngModel)]="bulkSortOrder" min="0" />
                </div>
                <button class="btn btn-primary btn-upload" (click)="uploadAll()" [disabled]="uploading()">
                  @if (uploading()) {
                    <div class="spinner-sm"></div> Subiendo...
                  } @else {
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    Subir todo
                  }
                </button>
              </div>
            </div>

            <div class="pending-grid">
              @for (pf of pendingFiles(); track $index; let i = $index) {
                <div class="pending-card" [class.pending-done]="pf.status === 'done'" [class.pending-error]="pf.status === 'error'">
                  <div class="pending-img">
                    <img [src]="pf.preview" [alt]="pf.title" />
                    @if (pf.status === 'done') {
                      <div class="pending-status pending-ok"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></div>
                    }
                    @if (pf.status === 'error') {
                      <div class="pending-status pending-err"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></div>
                    }
                    @if (pf.status === 'uploading') {
                      <div class="pending-status pending-loading"><div class="spinner-sm"></div></div>
                    }
                  </div>
                  <div class="pending-label">{{ selectedFolder() }}</div>
                  @if (pf.status === 'pending') {
                    <button class="pending-remove" (click)="removePending(i, $event)" title="Quitar">×</button>
                  }
                </div>
              }
            </div>
          }
        </div>

        <!-- Images Grid inside folder -->
        @if (folderItems().length > 0) {
          <div class="images-grid">
            @for (item of folderItems(); track item.id) {
              <div class="image-card" [class.inactive]="!item.isActive">
                <div class="image-thumb" (click)="openEditModal(item)">
                  <img [src]="item.image" [alt]="item.title" loading="lazy" />
                  <div class="image-hover">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </div>
                </div>
                <div class="image-meta">
                  <span class="image-title">{{ item.title || 'Sin título' }}</span>
                  <span class="image-order">Orden: {{ item.sortOrder }}</span>
                </div>
                <div class="image-actions">
                  <button class="btn-icon" title="Editar" (click)="openEditModal(item)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  <button class="btn-icon btn-icon-danger" title="Eliminar" (click)="deleteItem(item)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                  </button>
                </div>
              </div>
            }
          </div>
        } @else if (!loading()) {
          <div class="empty-state">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            <p>Esta carpeta está vacía. Subí algunas imágenes arriba.</p>
          </div>
        }

        <!-- Edit Modal -->
        @if (showEditModal()) {
          <div class="modal-overlay" (click)="closeEditModal()">
            <div class="modal" (click)="$event.stopPropagation()">
              <div class="modal-header">
                <h2>Editar imagen</h2>
                <button class="btn-close" (click)="closeEditModal()">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
              <div class="modal-body">
                @if (editingItem()) {
                  <div class="edit-preview"><img [src]="editingItem()!.image" [alt]="editingItem()!.title" /></div>
                }
                <div class="form-group">
                  <label class="form-label">Título</label>
                  <input type="text" class="form-input" [(ngModel)]="editForm.title" placeholder="Título de la imagen" />
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label class="form-label">Mover a carpeta</label>
                    <select class="form-select" [(ngModel)]="editForm.category">
                      @for (f of folders(); track f.name) {
                        <option [value]="f.name">{{ f.name }}</option>
                      }
                    </select>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Orden</label>
                    <input type="number" class="form-input" [(ngModel)]="editForm.sortOrder" min="0" />
                  </div>
                </div>
                <div class="form-group">
                  <label class="form-checkbox">
                    <input type="checkbox" [(ngModel)]="editForm.isActive" />
                    <span>Activa</span>
                  </label>
                </div>
              </div>
              <div class="modal-footer">
                <button class="btn btn-ghost" (click)="closeEditModal()">Cancelar</button>
                <button class="btn btn-primary" (click)="saveEdit()" [disabled]="savingEdit()">
                  {{ savingEdit() ? 'Guardando...' : 'Guardar' }}
                </button>
              </div>
            </div>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .page-container { padding: var(--space-6); max-width: 1100px; margin: 0 auto; }
    .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-6); flex-wrap: wrap; gap: var(--space-3); }
    .page-title { font-size: 1.5rem; font-weight: var(--weight-bold); color: var(--gray-900); margin: 0; }
    .page-subtitle { font-size: var(--text-sm); color: var(--gray-500); margin: var(--space-1) 0 0; }
    .header-with-back { display: flex; align-items: center; gap: var(--space-3); }

    .toast { padding: var(--space-3) var(--space-4); border-radius: var(--radius-lg); margin-bottom: var(--space-4); font-size: var(--text-sm); font-weight: 500; }
    .toast-success { background: var(--success-50); color: var(--success-700); border: 1px solid var(--success-200); }
    .toast-error { background: var(--danger-50); color: var(--danger-700); border: 1px solid var(--danger-200); }

    /* ═══ FOLDERS GRID ═══ */
    .folders-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: var(--space-4); }
    .folder-card {
      position: relative; background: #fff; border-radius: var(--radius-xl); border: 1px solid var(--gray-200);
      box-shadow: var(--shadow-xs); cursor: pointer; transition: all 0.2s ease; overflow: hidden;
    }
    .folder-card:hover { box-shadow: var(--shadow-hover); transform: translateY(-2px); border-color: var(--gray-300); }
    .folder-cover { aspect-ratio: 4/3; background: var(--gray-100); overflow: hidden; position: relative; }
    .folder-cover img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.3s ease; }
    .folder-card:hover .folder-cover img { transform: scale(1.05); }
    .folder-cover-empty { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: var(--gray-300); }
    .folder-count {
      position: absolute; bottom: 8px; right: 8px; background: rgba(0,0,0,0.6); color: #fff;
      font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 99px; backdrop-filter: blur(4px);
    }
    .folder-info { padding: var(--space-3) var(--space-4); }
    .folder-name { display: block; font-size: var(--text-sm); font-weight: var(--weight-semibold); color: var(--gray-800); }
    .folder-count-label { display: block; font-size: 11px; color: var(--gray-400); margin-top: 2px; }
    .folder-delete {
      position: absolute; top: 8px; right: 8px; width: 28px; height: 28px; border-radius: var(--radius-md);
      border: none; background: rgba(255,255,255,0.9); color: var(--gray-400); cursor: pointer;
      display: flex; align-items: center; justify-content: center; opacity: 0; transition: all 0.15s;
      backdrop-filter: blur(4px);
    }
    .folder-card:hover .folder-delete { opacity: 1; }
    .folder-delete:hover { background: var(--danger-50); color: var(--danger-600); }

    /* ═══ BACK BUTTON ═══ */
    .btn-back {
      width: 36px; height: 36px; border-radius: var(--radius-md); border: 1px solid var(--gray-200);
      background: #fff; color: var(--gray-600); cursor: pointer; display: flex; align-items: center;
      justify-content: center; transition: all 0.15s; flex-shrink: 0;
    }
    .btn-back:hover { background: var(--gray-50); border-color: var(--gray-300); color: var(--gray-800); }

    /* ═══ UPLOAD ═══ */
    .upload-card { background: #fff; border-radius: var(--radius-xl); border: 1px solid var(--gray-200); box-shadow: var(--shadow-xs); margin-bottom: var(--space-5); overflow: hidden; }
    .upload-zone { border: 2px dashed var(--gray-300); margin: var(--space-4); padding: var(--space-8) var(--space-4); text-align: center; cursor: pointer; transition: all 0.2s; border-radius: var(--radius-xl); display: flex; flex-direction: column; align-items: center; gap: var(--space-2); color: var(--gray-500); }
    .upload-zone:hover { border-color: var(--brand-400); background: var(--brand-50); }
    .upload-zone-active { border-color: var(--brand-500); background: var(--brand-50); }
    .upload-zone-has-files { padding: var(--space-3) var(--space-4); border-style: solid; border-color: var(--gray-200); margin: 0; }
    .upload-icon { color: var(--gray-400); }
    .upload-title { font-size: var(--text-base); font-weight: var(--weight-semibold); color: var(--gray-800); margin: 0; }
    .upload-desc { font-size: var(--text-sm); color: var(--gray-500); margin: 0; }
    .upload-header { display: flex; align-items: center; justify-content: space-between; width: 100%; }
    .upload-title-sm { font-size: var(--text-sm); font-weight: var(--weight-semibold); color: var(--gray-800); margin: 0; }
    .btn-text { background: none; border: none; color: var(--danger-600); font-size: var(--text-sm); font-weight: 500; cursor: pointer; padding: 4px 8px; border-radius: var(--radius-md); }
    .btn-text:hover { background: var(--danger-50); }

    .upload-controls { padding: 0 var(--space-4); }
    .controls-row { display: flex; gap: var(--space-3); align-items: end; flex-wrap: wrap; }
    .controls-row .form-group { flex: 1; min-width: 120px; margin: 0; }
    .btn-upload { white-space: nowrap; height: 38px; }

    .pending-grid { display: flex; gap: var(--space-2); padding: var(--space-3) var(--space-4); overflow-x: auto; }
    .pending-card { flex: 0 0 100px; position: relative; border: 1px solid var(--gray-200); border-radius: var(--radius-md); overflow: hidden; }
    .pending-card.pending-done { border-color: var(--success-300); }
    .pending-card.pending-error { border-color: var(--danger-300); }
    .pending-img { aspect-ratio: 1; background: var(--gray-100); position: relative; }
    .pending-img img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .pending-status { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; }
    .pending-ok { background: rgba(16,185,129,0.7); }
    .pending-err { background: rgba(239,68,68,0.7); }
    .pending-loading { background: rgba(0,0,0,0.5); }
    .pending-title { width: 100%; border: none; border-top: 1px solid var(--gray-100); padding: 4px 6px; font-size: 11px; outline: none; box-sizing: border-box; }
    .pending-title:focus { background: var(--brand-50); }
    .pending-label { width: 100%; border-top: 1px solid var(--gray-100); padding: 4px 6px; font-size: 11px; color: var(--gray-500); box-sizing: border-box; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-align: center; }
    .pending-remove { position: absolute; top: 2px; right: 2px; width: 18px; height: 18px; border-radius: 50%; border: none; background: rgba(0,0,0,0.5); color: #fff; font-size: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.15s; }
    .pending-card:hover .pending-remove { opacity: 1; }

    /* ═══ IMAGES GRID ═══ */
    .images-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: var(--space-4); }
    .image-card {
      background: #fff; border-radius: var(--radius-xl); border: 1px solid var(--gray-200);
      overflow: hidden; transition: all 0.2s ease; position: relative;
    }
    .image-card:hover { box-shadow: var(--shadow-hover); }
    .image-card.inactive { opacity: 0.5; }
    .image-thumb { aspect-ratio: 1; background: var(--gray-100); position: relative; cursor: pointer; overflow: hidden; }
    .image-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.3s ease; }
    .image-card:hover .image-thumb img { transform: scale(1.05); }
    .image-hover {
      position: absolute; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center;
      justify-content: center; opacity: 0; transition: opacity 0.2s ease;
    }
    .image-card:hover .image-hover { opacity: 1; }
    .image-meta { padding: var(--space-2) var(--space-3); }
    .image-title { display: block; font-size: 12px; font-weight: var(--weight-medium); color: var(--gray-800); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .image-order { display: block; font-size: 11px; color: var(--gray-400); margin-top: 1px; }
    .image-actions { display: flex; gap: 4px; padding: 0 var(--space-3) var(--space-2); }
    .btn-icon { width: 28px; height: 28px; border-radius: var(--radius-md); border: none; background: none; color: var(--gray-400); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.15s; }
    .btn-icon:hover { background: var(--gray-100); color: var(--gray-700); }
    .btn-icon-danger:hover { background: var(--danger-50); color: var(--danger-600); }

    /* ═══ SHARED ═══ */
    .empty-state { text-align: center; padding: var(--space-16) var(--space-6); color: var(--gray-400); }
    .empty-state h3 { font-size: 1rem; color: var(--gray-600); margin: var(--space-4) 0 var(--space-1); }
    .empty-state p { font-size: var(--text-sm); margin: 0; }
    .loading-state { text-align: center; padding: var(--space-16) var(--space-6); color: var(--gray-500); }
    .spinner-lg { width: 28px; height: 28px; border: 3px solid var(--gray-200); border-top-color: var(--brand-600); border-radius: 50%; animation: spin 0.6s linear infinite; margin: 0 auto var(--space-3); }
    .spinner-sm { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.6s linear infinite; display: inline-block; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .btn { display: inline-flex; align-items: center; gap: var(--space-2); padding: 10px var(--space-4); border-radius: var(--radius-lg); font-size: var(--text-sm); font-weight: var(--weight-medium); border: none; cursor: pointer; transition: all var(--transition-fast); }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-primary { background: var(--brand-600); color: #fff; }
    .btn-primary:hover:not(:disabled) { background: var(--brand-700); }
    .btn-ghost { background: none; color: var(--gray-700); border: 1px solid var(--gray-300); }
    .btn-ghost:hover { background: var(--gray-50); }

    .form-group { margin-bottom: var(--space-4); }
    .form-label { display: block; font-size: var(--text-sm); font-weight: var(--weight-medium); color: var(--gray-700); margin-bottom: var(--space-1); }
    .form-hint { font-size: var(--text-xs); color: var(--gray-400); margin: 0; }
    .form-input, .form-select { width: 100%; padding: 10px var(--space-3); font-size: var(--text-sm); color: var(--gray-900); background: #fff; border: 1.5px solid var(--gray-300); border-radius: var(--radius-lg); outline: none; transition: border-color var(--transition-fast), box-shadow var(--transition-fast); box-sizing: border-box; }
    .form-input:focus, .form-select:focus { border-color: var(--brand-500); box-shadow: 0 0 0 3px rgba(99,102,241,0.12); }
    .form-select { appearance: none; background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e"); background-position: right 0.5rem center; background-repeat: no-repeat; background-size: 1.5em; padding-right: 2.5rem; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); }
    .form-checkbox { display: flex; align-items: center; gap: var(--space-2); cursor: pointer; font-size: var(--text-sm); color: var(--gray-700); }
    .form-checkbox input { width: 16px; height: 16px; accent-color: var(--brand-600); }

    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: var(--space-4); }
    .modal { background: #fff; border-radius: var(--radius-xl); box-shadow: 0 20px 60px rgba(0,0,0,0.2); width: 100%; max-width: 480px; max-height: 90vh; overflow-y: auto; }
    .modal-header { display: flex; align-items: center; justify-content: space-between; padding: var(--space-4) var(--space-5); border-bottom: 1px solid var(--gray-100); }
    .modal-header h2 { font-size: 1.1rem; font-weight: var(--weight-semibold); color: var(--gray-900); margin: 0; }
    .btn-close { width: 32px; height: 32px; border-radius: var(--radius-md); border: none; background: none; color: var(--gray-400); cursor: pointer; display: flex; align-items: center; justify-content: center; }
    .btn-close:hover { background: var(--gray-100); color: var(--gray-600); }
    .modal-body { padding: var(--space-5); }
    .modal-footer { display: flex; justify-content: flex-end; gap: var(--space-3); padding: var(--space-3) var(--space-5); border-top: 1px solid var(--gray-100); }
    .edit-preview { margin-bottom: var(--space-4); border-radius: var(--radius-lg); overflow: hidden; border: 1px solid var(--gray-200); }
    .edit-preview img { width: 100%; height: 180px; object-fit: cover; display: block; }
  `]
})
export class GaleriaPageComponent implements OnInit {
  private galleryService = inject(GalleryService);

  view = signal<'folders' | 'folder'>('folders');
  selectedFolder = signal('');
  items = signal<GalleryItem[]>([]);
  loading = signal(true);
  pendingFiles = signal<PendingFile[]>([]);
  uploading = signal(false);
  isDragOver = signal(false);
  toast = signal('');
  toastType = signal<'success' | 'error'>('success');

  showEditModal = signal(false);
  editingItem = signal<GalleryItem | null>(null);
  savingEdit = signal(false);
  editForm = { title: '', category: 'general', sortOrder: 0, isActive: true };

  showNewFolderModal = signal(false);
  newFolderName = '';

  bulkSortOrder = 0;

  folders = computed<Folder[]>(() => {
    const all = this.items();
    const map = new Map<string, GalleryItem[]>();
    for (const item of all) {
      const cat = item.category || 'General';
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(item);
    }
    const result: Folder[] = [];
    for (const [name, items] of map) {
      items.sort((a, b) => a.sortOrder - b.sortOrder);
      result.push({ name, cover: items[0]?.image || '', count: items.length, items });
    }
    result.sort((a, b) => a.name.localeCompare(b.name));
    return result;
  });

  folderItems = computed(() => {
    const folder = this.folders().find(f => f.name === this.selectedFolder());
    return folder ? folder.items : [];
  });

  ngOnInit(): void {
    this.loadItems();
  }

  loadItems(): void {
    this.loading.set(true);
    this.galleryService.getGallery().subscribe({
      next: (data) => { this.items.set(data); this.loading.set(false); },
      error: () => { this.loading.set(false); this.showToast('Error al cargar galería', 'error'); },
    });
  }

  openFolder(name: string): void {
    this.selectedFolder.set(name);
    this.bulkSortOrder = this.folderItems().length;
    this.view.set('folder');
  }

  createFolder(): void {
    const name = this.newFolderName.trim();
    if (!name) return;
    const exists = this.folders().some(f => f.name.toLowerCase() === name.toLowerCase());
    if (exists) { this.showToast('Ya existe una carpeta con ese nombre', 'error'); return; }
    this.showNewFolderModal.set(false);
    this.newFolderName = '';
    this.showToast(`Carpeta "${name}" creada. Subí imágenes para verla.`, 'success');
    this.openFolder(name);
  }

  deleteFolder(name: string, event: Event): void {
    event.stopPropagation();
    const folder = this.folders().find(f => f.name === name);
    if (!folder) return;
    if (folder.count > 0) {
      if (!confirm(`La carpeta "${name}" tiene ${folder.count} imágenes. ¿Eliminar todas las imágenes y la carpeta?`)) return;
      const deletions = folder.items.map(item => this.galleryService.deleteGalleryItem(item.id));
      let done = 0;
      for (const obs of deletions) {
        obs.subscribe({
          next: () => { done++; if (done === deletions.length) { this.showToast(`Carpeta "${name}" eliminada`, 'success'); this.loadItems(); } },
          error: () => { done++; },
        });
      }
    } else {
      this.showToast(`Carpeta "${name}" está vacía y se eliminará al recargar`, 'success');
    }
  }

  onDragOver(event: DragEvent): void { event.preventDefault(); event.stopPropagation(); this.isDragOver.set(true); }
  onDragLeave(event: DragEvent): void { event.preventDefault(); this.isDragOver.set(false); }
  onDrop(event: DragEvent): void {
    event.preventDefault(); event.stopPropagation(); this.isDragOver.set(false);
    if (event.dataTransfer?.files) this.addFiles(event.dataTransfer.files);
  }
  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) this.addFiles(input.files);
    input.value = '';
  }

  private addFiles(files: FileList): void {
    const newPending: PendingFile[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;
      if (file.size > 5 * 1024 * 1024) { this.showToast(`${file.name} supera 5MB`, 'error'); continue; }
      const folderName = this.selectedFolder();
      const pf: PendingFile = { file, preview: '', title: folderName || file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '), status: 'pending' };
      newPending.push(pf);
      const reader = new FileReader();
      reader.onload = () => { pf.preview = reader.result as string; this.pendingFiles.update(f => [...f]); };
      reader.readAsDataURL(file);
    }
    this.pendingFiles.set([...this.pendingFiles(), ...newPending]);
    this.bulkSortOrder = this.folderItems().length;
  }

  removePending(index: number, event: Event): void {
    event.stopPropagation();
    const files = [...this.pendingFiles()]; files.splice(index, 1); this.pendingFiles.set(files);
  }

  clearPending(event: Event): void { event.stopPropagation(); this.pendingFiles.set([]); }

  uploadAll(): void {
    const pending = this.pendingFiles().filter(f => f.status === 'pending' && f.preview);
    if (pending.length === 0) return;
    this.uploading.set(true);
    const category = this.selectedFolder();
    const items: GalleryItemCreate[] = pending.map((pf, i) => ({
      image: pf.preview, title: category, category, sortOrder: this.bulkSortOrder + i, isActive: true,
    }));
    this.galleryService.bulkCreateGalleryItems(items).subscribe({
      next: () => {
        pending.forEach(pf => pf.status = 'done');
        this.pendingFiles.update(f => [...f]);
        this.showToast(`${pending.length} imagen(es) subida(s) a "${category}"`, 'success');
        this.uploading.set(false);
        this.loadItems();
        setTimeout(() => { this.pendingFiles.set([]); }, 2000);
      },
      error: () => {
        pending.forEach(pf => { pf.status = 'error'; pf.error = 'Error'; });
        this.pendingFiles.update(f => [...f]);
        this.showToast('Error al subir', 'error');
        this.uploading.set(false);
      },
    });
  }

  deleteItem(item: GalleryItem): void {
    if (!confirm(`¿Eliminar "${item.title || 'esta imagen'}"?`)) return;
    this.galleryService.deleteGalleryItem(item.id).subscribe({
      next: () => { this.showToast('Eliminada', 'success'); this.loadItems(); },
      error: () => this.showToast('Error al eliminar', 'error'),
    });
  }

  openEditModal(item: GalleryItem): void {
    this.editingItem.set(item);
    this.editForm = { title: item.title, category: item.category, sortOrder: item.sortOrder, isActive: item.isActive };
    this.showEditModal.set(true);
  }

  closeEditModal(): void { this.showEditModal.set(false); this.editingItem.set(null); }

  saveEdit(): void {
    const item = this.editingItem();
    if (!item) return;
    this.savingEdit.set(true);
    this.galleryService.updateGalleryItem(item.id, this.editForm).subscribe({
      next: () => { this.showToast('Actualizada', 'success'); this.closeEditModal(); this.loadItems(); this.savingEdit.set(false); },
      error: () => { this.showToast('Error al guardar', 'error'); this.savingEdit.set(false); },
    });
  }

  private showToast(message: string, type: 'success' | 'error'): void {
    this.toast.set(message); this.toastType.set(type);
    setTimeout(() => this.toast.set(''), 3000);
  }
}
