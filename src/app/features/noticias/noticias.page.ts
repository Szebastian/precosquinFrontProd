import { Component, OnInit, signal, inject, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

interface NewsItem {
  id?: number;
  category: string;
  title: string;
  description: string;
  image: string;
  imagePosition: string;
  thumbType: 'img' | 'icon';
  thumbSrc: string;
  thumbBg: string;
}

@Component({
  selector: 'app-noticias-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">Noticias del Carrusel</h1>
          <p class="page-subtitle">Gestionar las noticias que se muestran en el carrusel de la página de inicio</p>
        </div>
        <button class="btn btn-primary" (click)="openCreateModal()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Nueva Noticia
        </button>
      </div>

      <!-- Toast -->
      @if (toast()) {
        <div class="toast" [class.toast-success]="toastType() === 'success'" [class.toast-error]="toastType() === 'error'">
          {{ toast() }}
        </div>
      }

      <!-- News Grid -->
      <div class="news-list-grid">
        @if (loading()) {
          <div class="loading-state">
            <div class="spinner-lg"></div>
            <p>Cargando noticias...</p>
          </div>
        } @else if (newsList().length === 0) {
          <div class="empty-state">
            <div class="empty-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <path d="M16 8h2m-2 4h2m-14 0h6m-6-4h6m-6 8h14"/>
              </svg>
            </div>
            <h3 class="empty-title">No hay noticias cargadas</h3>
            <p class="empty-desc">Las noticias que agregues aquí se mostrarán automáticamente en el carrusel del home.</p>
            <button class="btn btn-primary mt-4" (click)="openCreateModal()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Crear primera noticia
            </button>
          </div>
        } @else {
          @for (item of newsList(); track item.id) {
            <div class="news-card" [class.news-card-deleting]="deletingId() === item.id">
              <div class="news-card-img-wrapper" [style.background-image]="'url(' + item.image + ')'" [style.background-position]="item.imagePosition || 'center center'">
                <div class="news-card-overlay"></div>
                <span class="news-card-badge">{{ item.category }}</span>
                <div class="news-card-actions-top">
                  <button class="btn-card-action" title="Editar" (click)="editNews(item)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                </div>
              </div>
              <div class="news-card-body">
                <h3 class="news-card-title">{{ item.title }}</h3>
                <div class="news-card-footer">
                  <div class="news-thumb-preview" [ngClass]="item.thumbBg">
                    @if (item.thumbType === 'img') {
                      <img [src]="item.thumbSrc" alt="thumbnail" />
                    } @else {
                      <span [innerHTML]="sanitizeHtml(item.thumbSrc)"></span>
                    }
                  </div>
                  <button class="btn-icon btn-danger" title="Eliminar noticia" (click)="deleteNews(item.id!)">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          }
        }
      </div>

      <!-- Create / Edit Modal -->
      @if (showModal()) {
        <div class="modal-overlay" (click)="closeModal()">
          <div class="modal modal-lg" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <div class="modal-header-content">
                <h2>{{ editingId() ? 'Editar Noticia' : 'Nueva Noticia' }}</h2>
                <p class="modal-header-desc">{{ editingId() ? 'Modificá los datos de la noticia publicada' : 'Completá los datos para publicar una nueva noticia en el carrusel del sitio' }}</p>
              </div>
              <button class="btn-close" (click)="closeModal()">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            <div class="modal-body">
              <div class="modal-grid">
                <!-- Form Side -->
                <div class="modal-form-side">

                  <!-- Section: Contenido Principal -->
                  <div class="form-section">
                    <h3 class="form-section-title">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                      Contenido Principal
                    </h3>

                    <div class="form-group">
                      <label class="form-label">Categoría *</label>
                      <p class="form-label-desc">Etiqueta que identifica el tipo de noticia. Se muestra como badge en el carrusel.</p>
                      <input type="text" class="form-input" #categoryInput [(ngModel)]="form.category"
                        placeholder="Ej: FESTIVAL 2027, REGLAMENTO, INSCRIPCIONES" />
                      <div class="quick-tags">
                        <span class="quick-tags-label">Sugerencias:</span>
                        @for (tag of quickTags; track tag) {
                          <button class="tag-btn" (click)="form.category = tag"
                            [class.tag-active]="form.category === tag">{{ tag }}</button>
                        }
                      </div>
                    </div>

                    <div class="form-group">
                      <label class="form-label">Título *</label>
                      <p class="form-label-desc">Título llamativo que aparece en el carrusel principal y en las cards del home. Debe ser conciso y atractivo.</p>
                      <textarea class="form-input form-textarea" [(ngModel)]="form.title"
                        placeholder="Ej: Se abren las inscripciones para el certamen Nuevos Valores"
                        rows="3"></textarea>
                      <div class="form-hint-row">
                        <span class="form-hint">Usá un título claro y directo</span>
                        <span class="form-hint" [class.hint-warning]="form.title.length > 100">{{ form.title.length }}/120</span>
                      </div>
                    </div>

                    <div class="form-group">
                      <label class="form-label">Descripción *</label>
                      <p class="form-label-desc">Texto completo de la noticia que se muestra en la página pública /noticias. Incluí todos los detalles relevantes para que la audiencia tenga la información completa.</p>
                      <textarea class="form-input form-textarea" [(ngModel)]="form.description"
                        placeholder="Escribí aquí el contenido completo de la noticia. Incluí fechas, horarios, lugares y cualquier detalle importante para los artistas y el público..."
                        rows="6"></textarea>
                      <div class="form-hint-row">
                        <span class="form-hint">Mínimo 50 caracteres para una noticia profesional</span>
                        <span class="form-hint" [class.hint-warning]="form.description.length > 0 && form.description.length < 50">{{ form.description.length }} caracteres</span>
                      </div>
                    </div>
                  </div>

                  <!-- Section: Imagen Destacada -->
                  <div class="form-section">
                    <h3 class="form-section-title">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                      Imagen Destacada
                    </h3>
                    <p class="form-section-desc">Imagen que aparece como fondo en el carrusel del home y como header en la página de noticias. Se recomienda una resolución de 1200x600px o superior.</p>

                    <div class="form-group">
                      <label class="form-label">Seleccionar imagen *</label>
                      <div class="image-upload-zone" [class.image-loaded]="form.image"
                        (click)="imageInput.click()" (dragover)="$event.preventDefault()" (drop)="onImageDrop($event)">
                        @if (form.image) {
                          <img [src]="form.image" class="image-preview" alt="preview" />
                          <div class="image-overlay">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                            <span>Cambiar imagen</span>
                          </div>
                        } @else {
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                          <span>Arrastrá una imagen aquí o hacé click para seleccionar</span>
                          <span class="upload-hint">JPG, PNG o WebP. Máximo 5MB.</span>
                        }
                      </div>
                      <input type="file" #imageInput accept="image/*" hidden (change)="onImageSelect($event)" />
                      <div class="image-presets">
                        <span class="quick-tags-label">Imágenes rápidas:</span>
                        @for (preset of imagePresets; track preset.value) {
                          <button class="preset-btn" [class.preset-active]="form.image === preset.value"
                            (click)="form.image = preset.value">
                            <img [src]="preset.value" [alt]="preset.label" />
                            <span>{{ preset.label }}</span>
                          </button>
                        }
                      </div>
                      <div class="url-input-group">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                        <input type="text" class="form-input" [(ngModel)]="form.image"
                          placeholder="O ingresá una URL de imagen directamente..." />
                      </div>

                      <!-- Focal Point Picker -->
                      <div class="focal-point-section">
                        <label class="form-label">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>
                          Punto de Foco
                        </label>
                        <p class="form-label-desc">Elegí qué parte de la imagen debe ser el centro visual en el carrusel y hero.</p>

                        @if (!form.image) {
                          <div class="focal-empty">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                            <span>Seleccioná una imagen primero para configurar el punto de foco</span>
                          </div>
                        } @else {
                          <div class="focal-wrapper">
                            <div class="focal-image-preview"
                              [style.background-image]="'url(' + form.image + ')'"
                              [style.background-position]="form.imagePosition">
                              <div class="focal-grid">
                                @for (pos of focalPositions; track pos.value) {
                                  <button
                                    class="focal-btn"
                                    [class.focal-active]="form.imagePosition === pos.value"
                                    (click)="form.imagePosition = pos.value"
                                    [title]="pos.label"
                                  >
                                    <span class="focal-dot"></span>
                                  </button>
                                }
                              </div>
                              <div class="focal-crosshair" [style.left]="getFocalX() + '%'" [style.top]="getFocalY() + '%'"></div>
                            </div>
                            <div class="focal-info-row">
                              <div class="focal-label-badge">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>
                                Foco: {{ getFocalLabel() }}
                              </div>
                              <span class="focal-hint">Podés hacer click en cualquier zona de la imagen</span>
                            </div>
                          </div>
                        }
                      </div>

                    </div>
                  </div>

                  <!-- Section: Thumbnail del Carrusel -->
                  <div class="form-section">
                    <h3 class="form-section-title">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/></svg>
                      Thumbnail del Carrusel
                    </h3>
                    <p class="form-section-desc">Configurá la miniatura que aparece en la barra lateral derecha del carrusel del home.</p>

                    <div class="form-row">
                      <div class="form-group col">
                        <label class="form-label">Color de fondo</label>
                        <div class="color-options">
                          @for (color of thumbColors; track color.value) {
                            <button class="color-btn" [ngClass]="color.value"
                              [class.color-active]="form.thumbBg === color.value"
                              (click)="form.thumbBg = color.value" [title]="color.label">
                              @if (form.thumbBg === color.value) {
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                              }
                            </button>
                          }
                        </div>
                      </div>
                      <div class="form-group col">
                        <label class="form-label">Tipo de contenido</label>
                        <div class="toggle-group">
                          <button class="toggle-btn" [class.toggle-active]="form.thumbType === 'img'"
                            (click)="form.thumbType = 'img'">Imagen</button>
                          <button class="toggle-btn" [class.toggle-active]="form.thumbType === 'icon'"
                            (click)="form.thumbType = 'icon'">Ícono SVG</button>
                        </div>
                      </div>
                    </div>

                    @if (form.thumbType === 'img') {
                      <div class="form-group">
                        <label class="form-label">Seleccionar imagen del thumbnail</label>
                        <div class="thumb-presets">
                          @for (preset of thumbImagePresets; track preset.value) {
                            <button class="thumb-preset" [class.thumb-preset-active]="form.thumbSrc === preset.value"
                              (click)="form.thumbSrc = preset.value">
                              <img [src]="preset.value" [alt]="preset.label" />
                            </button>
                          }
                        </div>
                        <div class="url-input-group">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                          <input type="text" class="form-input" [(ngModel)]="form.thumbSrc"
                            placeholder="Ruta de imagen del thumbnail..." />
                        </div>
                      </div>
                    } @else {
                      <div class="form-group">
                        <label class="form-label">Seleccionar ícono SVG</label>
                        <div class="icon-presets">
                          @for (icon of iconPresets; track icon.name) {
                            <button class="icon-preset" [class.icon-preset-active]="form.thumbSrc === icon.svg"
                              (click)="form.thumbSrc = icon.svg" [title]="icon.name">
                              <span [innerHTML]="icon.svg"></span>
                            </button>
                          }
                        </div>
                        <textarea class="form-input form-textarea code-textarea mt-2" [(ngModel)]="form.thumbSrc"
                          placeholder="O pegá el código SVG del ícono aquí..." rows="3"></textarea>
                      </div>
                    }
                  </div>
                </div>

                <!-- Live Preview Side -->
                <div class="modal-preview-side">
                  <span class="preview-tag">VISTA PREVIA</span>
                  <p class="preview-desc">Así se verá tu noticia en el carrusel del home</p>

                  <div class="carousel-preview-container">
                    <div class="featured-news-preview" [style.background-image]="form.image ? 'url(' + form.image + ')' : 'none'" [style.background-position]="form.imagePosition || 'center center'">
                      <div class="featured-overlay"></div>
                      <div class="featured-content">
                        <span class="news-category-preview">{{ form.category || 'CATEGORÍA' }}</span>
                        <h1 class="featured-title-preview">{{ form.title || 'Título de la Noticia' }}</h1>
                      </div>
                    </div>

                    <div class="secondary-news-item-preview">
                      <div class="news-item-content">
                        <h3 class="news-item-title">{{ form.title || 'Título de la Noticia' }}</h3>
                      </div>
                      <div class="news-item-thumb" [ngClass]="form.thumbBg">
                        @if (form.thumbType === 'img') {
                          <img [src]="form.thumbSrc" alt="preview" />
                        } @else {
                          <span [innerHTML]="form.thumbSrc"></span>
                        }
                      </div>
                    </div>
                  </div>

                  <div class="preview-checklist">
                    <span class="preview-check" [class.check-ok]="form.category">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>
                      Categoría
                    </span>
                    <span class="preview-check" [class.check-ok]="form.title">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>
                      Título
                    </span>
                    <span class="preview-check" [class.check-ok]="form.description">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>
                      Descripción
                    </span>
                    <span class="preview-check" [class.check-ok]="form.image">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>
                      Imagen
                    </span>
                  </div>
                </div>
              </div>

              @if (errorMsg()) {
                <div class="alert alert-error mt-4">{{ errorMsg() }}</div>
              }
            </div>
            <div class="modal-footer">
              <div class="modal-footer-left">
                <span class="footer-hint" [class.hint-ok]="form.category && form.title && form.description && form.image">
                  @if (form.category && form.title && form.description && form.image) {
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
                    Todo listo para publicar
                  } @else {
                    Completá todos los campos obligatorios (*)
                  }
                </span>
              </div>
              <div class="modal-footer-right">
                <button class="btn btn-secondary" (click)="closeModal()">Cancelar</button>
                <button class="btn btn-primary" (click)="saveNews()"
                  [disabled]="saving() || !form.category || !form.title || !form.image">
                  @if (saving()) {
                    <span class="spinner"></span> Guardando...
                  } @else {
                    {{ editingId() ? 'Guardar Cambios' : 'Publicar Noticia' }}
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-container {
      max-width: var(--content-max-width);
      padding: var(--space-4);
    }

    .page-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: var(--space-6);
      gap: var(--space-4);
    }

    .page-title {
      font-size: 1.5rem;
      font-weight: var(--weight-bold);
      color: var(--gray-900);
      margin-bottom: var(--space-1);
    }

    .page-subtitle {
      font-size: var(--text-sm);
      color: var(--gray-500);
    }

    /* Toast */
    .toast {
      position: fixed;
      top: var(--space-4);
      right: var(--space-4);
      padding: var(--space-3) var(--space-5);
      border-radius: var(--radius-lg);
      font-size: var(--text-sm);
      font-weight: var(--weight-medium);
      z-index: 2000;
      animation: slideIn 0.3s ease;
    }

    .toast-success { background: #065f46; color: #fff; }
    .toast-error { background: #991b1b; color: #fff; }

    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }

    /* Grid */
    .news-list-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: var(--space-6);
      margin-top: var(--space-4);
    }

    .news-card {
      background: white;
      border-radius: var(--radius-xl);
      border: 1px solid var(--gray-200);
      overflow: hidden;
      box-shadow: var(--shadow-sm);
      display: flex;
      flex-direction: column;
      transition: all var(--transition-base);
    }

    .news-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-md);
    }

    .news-card-deleting {
      opacity: 0.5;
      transform: scale(0.95);
    }

    .news-card-img-wrapper {
      height: 180px;
      background-size: cover;
      background-position: center;
      position: relative;
      display: flex;
      align-items: flex-end;
      padding: var(--space-3);
    }

    .news-card-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%);
    }

    .news-card-badge {
      position: relative;
      z-index: 5;
      font-size: 10px;
      font-weight: var(--weight-bold);
      background-color: var(--brand-accent);
      color: var(--gray-900);
      padding: 3px 10px;
      border-radius: var(--radius-sm);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .news-card-actions-top {
      position: absolute;
      top: var(--space-2);
      right: var(--space-2);
      z-index: 5;
      display: flex;
      gap: var(--space-1);
      opacity: 0;
      transition: opacity 0.2s;
    }

    .news-card:hover .news-card-actions-top { opacity: 1; }

    .btn-card-action {
      width: 28px;
      height: 28px;
      border-radius: var(--radius-md);
      border: none;
      background: rgba(255,255,255,0.9);
      color: var(--gray-700);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      backdrop-filter: blur(4px);
    }

    .btn-card-action:hover { background: #fff; color: var(--brand-600); }

    .news-card-body {
      padding: var(--space-4);
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .news-card-title {
      font-size: var(--text-sm);
      font-weight: var(--weight-semibold);
      color: var(--gray-800);
      margin: 0 0 var(--space-4) 0;
      line-height: 1.4;
      flex: 1;
    }

    .news-card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid var(--gray-100);
      padding-top: var(--space-3);
    }

    .news-thumb-preview {
      width: 48px;
      height: 48px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      color: white;
    }

    .news-thumb-preview img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      padding: 4px;
    }

    .news-thumb-preview ::ng-deep svg {
      width: 20px;
      height: 20px;
      color: white;
    }

    .bg-blue {
      background-color: var(--brand-500);
      background-image: url('/assets/img/simbolAzul.png');
      background-size: cover;
      background-position: center;
    }
    .bg-gold {
      background-color: var(--brand-accent);
      color: var(--gray-900) !important;
      background-image: url('/assets/img/simbolMostaza.png');
      background-size: cover;
      background-position: center;
    }
    .bg-gray { background-color: var(--gray-300); color: var(--gray-700) !important; }

    /* Modal */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: var(--space-4);
    }

    .modal {
      background: #fff;
      border-radius: var(--radius-xl);
      box-shadow: 0 20px 60px rgba(0,0,0,0.15);
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
    }

    .modal-lg { max-width: 960px; }

    .modal-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      padding: var(--space-5) var(--space-6);
      border-bottom: 1px solid var(--gray-100);
    }

    .modal-header h2 {
      font-size: 1.25rem;
      font-weight: var(--weight-bold);
      color: var(--gray-900);
      margin: 0;
    }

    .modal-header-content { flex: 1; }

    .modal-header-desc {
      margin: 4px 0 0;
      font-size: 0.8rem;
      color: var(--gray-400);
      line-height: 1.4;
    }

    .btn-close {
      width: 32px;
      height: 32px;
      border-radius: var(--radius-md);
      border: none;
      background: none;
      color: var(--gray-400);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .btn-close:hover { background: var(--gray-100); color: var(--gray-600); }

    .modal-body {
      padding: var(--space-6);
      overflow-y: auto;
    }

    .modal-grid {
      display: grid;
      grid-template-columns: 1.2fr 1fr;
      gap: var(--space-6);
    }

    @media (max-width: 768px) {
      .modal-grid { grid-template-columns: 1fr; }
    }

    .form-group { margin-bottom: var(--space-4); }

    .form-row {
      display: flex;
      gap: var(--space-4);
    }

    .col { flex: 1; }

    .form-label {
      display: block;
      font-size: var(--text-xs);
      font-weight: var(--weight-semibold);
      color: var(--gray-700);
      margin-bottom: var(--space-1);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .form-input,
    .form-select {
      width: 100%;
      padding: 10px var(--space-3);
      font-size: var(--text-sm);
      color: var(--gray-900);
      background: #fff;
      border: 1.5px solid var(--gray-200);
      border-radius: var(--radius-lg);
      outline: none;
      transition: all var(--transition-fast);
      box-sizing: border-box;
    }

    .form-input:focus,
    .form-select:focus {
      border-color: var(--brand-500);
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
    }

    .form-textarea { resize: vertical; min-height: 80px; }

    .form-hint {
      font-size: 11px;
      color: var(--gray-400);
      margin-top: 4px;
      display: block;
    }

    .form-label-desc {
      font-size: 0.75rem;
      color: var(--gray-400);
      line-height: 1.4;
      margin: 2px 0 6px;
    }

    .form-hint-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 4px;
    }

    .form-hint-row .form-hint { margin-top: 0; }

    .hint-warning { color: var(--warning) !important; font-weight: 600; }

    .form-section {
      margin-bottom: var(--space-5);
      padding: var(--space-4);
      background: var(--gray-50);
      border: 1px solid var(--gray-200);
      border-radius: var(--radius-lg);
    }

    .form-section:last-child { margin-bottom: 0; }

    .form-section-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.85rem;
      font-weight: var(--weight-bold);
      color: var(--gray-800);
      margin: 0 0 var(--space-3);
      padding-bottom: var(--space-2);
      border-bottom: 1px solid var(--gray-200);
    }

    .form-section-title svg { color: var(--brand-500); flex-shrink: 0; }

    .form-section-desc {
      font-size: 0.75rem;
      color: var(--gray-400);
      line-height: 1.45;
      margin: 0 0 var(--space-3);
    }

    .upload-hint {
      font-size: 0.7rem;
      color: var(--gray-400);
      margin-top: 2px;
    }

    .url-input-group {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 8px;
    }

    .url-input-group svg { color: var(--gray-400); flex-shrink: 0; }
    .url-input-group .form-input { flex: 1; }

    .image-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 6px;
      color: #fff;
      font-weight: var(--weight-medium);
      font-size: var(--text-sm);
      opacity: 0;
      transition: opacity 0.2s;
    }

    .image-overlay svg { width: 20px; height: 20px; }

    .quick-tags-label {
      font-size: 0.7rem;
      color: var(--gray-400);
      margin-right: 4px;
    }

    .code-textarea {
      font-family: monospace;
      font-size: 11px;
      min-height: 80px;
      background-color: var(--gray-50);
    }

    .mt-2 { margin-top: 0.5rem; }
    .mt-4 { margin-top: 1rem; }

    /* Quick Tags */
    .quick-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 6px;
    }

    .tag-btn {
      font-size: 11px;
      background: var(--gray-100);
      color: var(--gray-600);
      padding: 3px 10px;
      border-radius: var(--radius-full);
      border: 1.5px solid transparent;
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .tag-btn:hover { background: var(--brand-50); color: var(--brand-700); border-color: var(--brand-200); }
    .tag-active { background: var(--brand-100) !important; color: var(--brand-700) !important; border-color: var(--brand-300) !important; }

    /* Image Upload Zone */
    .image-upload-zone {
      border: 2px dashed var(--gray-300);
      border-radius: var(--radius-lg);
      height: 160px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--space-2);
      cursor: pointer;
      transition: all var(--transition-fast);
      color: var(--gray-400);
      font-size: var(--text-sm);
      position: relative;
      overflow: hidden;
    }

    .image-upload-zone:hover {
      border-color: var(--brand-400);
      background: var(--brand-50);
      color: var(--brand-600);
    }

    .image-upload-zone.image-loaded {
      border-style: solid;
      border-color: var(--brand-300);
    }

    .image-preview {
      width: 100%;
      height: 100%;
      object-fit: cover;
      position: absolute;
    }

    .image-upload-zone:hover .image-overlay { opacity: 1; }

    .image-presets {
      display: flex;
      gap: 8px;
      margin-top: 8px;
    }

    .preset-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      padding: 6px;
      border: 2px solid var(--gray-200);
      border-radius: var(--radius-md);
      background: white;
      cursor: pointer;
      transition: all var(--transition-fast);
      width: 80px;
    }

    .preset-btn img {
      width: 60px;
      height: 40px;
      object-fit: cover;
      border-radius: 4px;
    }

    .preset-btn span {
      font-size: 10px;
      color: var(--gray-500);
    }

    .preset-btn:hover { border-color: var(--brand-400); }
    .preset-active { border-color: var(--brand-500) !important; background: var(--brand-50) !important; }

    /* Color Options */
    .color-options {
      display: flex;
      gap: 8px;
      margin-top: 6px;
    }

    .color-btn {
      width: 36px;
      height: 36px;
      border-radius: var(--radius-md);
      border: 2px solid transparent;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      transition: all var(--transition-fast);
    }

    .color-btn:hover { transform: scale(1.1); }
    .color-active { border-color: var(--gray-900); box-shadow: 0 0 0 2px white, 0 0 0 4px var(--gray-900); }

    /* Toggle Group */
    .toggle-group {
      display: flex;
      border: 1.5px solid var(--gray-200);
      border-radius: var(--radius-lg);
      overflow: hidden;
      margin-top: 6px;
    }

    .toggle-btn {
      flex: 1;
      padding: 8px;
      font-size: var(--text-xs);
      font-weight: var(--weight-medium);
      border: none;
      background: white;
      color: var(--gray-500);
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .toggle-btn:first-child { border-right: 1px solid var(--gray-200); }
    .toggle-active { background: var(--brand-600) !important; color: #fff !important; }

    /* Thumb Presets */
    .thumb-presets {
      display: flex;
      gap: 8px;
      margin-top: 6px;
    }

    .thumb-preset {
      width: 56px;
      height: 56px;
      border-radius: var(--radius-md);
      border: 2px solid var(--gray-200);
      background: white;
      padding: 4px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .thumb-preset img { width: 100%; height: 100%; object-fit: contain; }
    .thumb-preset:hover { border-color: var(--brand-400); }
    .thumb-preset-active { border-color: var(--brand-500); background: var(--brand-50); }

    /* Icon Presets */
    .icon-presets {
      display: flex;
      gap: 8px;
      margin-top: 6px;
    }

    .icon-preset {
      width: 44px;
      height: 44px;
      border-radius: var(--radius-md);
      border: 2px solid var(--gray-200);
      background: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--gray-600);
    }

    .icon-preset ::ng-deep svg { width: 20px; height: 20px; }
    .icon-preset:hover { border-color: var(--brand-400); color: var(--brand-600); }
    .icon-preset-active { border-color: var(--brand-500); background: var(--brand-50); color: var(--brand-600); }

    /* Preview */
    .modal-preview-side {
      background-color: var(--gray-50);
      border-radius: var(--radius-xl);
      padding: var(--space-5);
      border: 1px dashed var(--gray-300);
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }

    .preview-tag {
      font-size: 10px;
      font-weight: var(--weight-bold);
      color: var(--gray-400);
      letter-spacing: 0.1em;
    }

    .carousel-preview-container {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
      flex: 1;
      justify-content: center;
    }

    .featured-news-preview {
      height: 200px;
      border-radius: var(--radius-lg);
      background-size: cover;
      background-position: center;
      background-color: var(--gray-300);
      position: relative;
      display: flex;
      align-items: flex-end;
      padding: var(--space-4);
      box-shadow: var(--shadow-sm);
    }

    .featured-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%);
      border-radius: var(--radius-lg);
    }

    .featured-content {
      position: relative;
      z-index: 10;
      color: white;
    }

    .news-category-preview {
      font-size: 9px;
      font-weight: var(--weight-bold);
      text-transform: uppercase;
      background-color: var(--brand-accent);
      color: var(--gray-900);
      padding: 2px 6px;
      border-radius: var(--radius-sm);
    }

    .featured-title-preview {
      font-size: var(--text-md);
      color: white;
      margin: 6px 0 0 0;
      line-height: 1.3;
    }

    .secondary-news-item-preview {
      display: flex;
      background: white;
      border-radius: var(--radius-md);
      border: 1px solid var(--gray-200);
      overflow: hidden;
      height: 72px;
    }

    .secondary-news-item-preview .news-item-content {
      flex: 1;
      padding: var(--space-3);
      display: flex;
      align-items: center;
    }

    .secondary-news-item-preview .news-item-title {
      font-size: 12px;
      font-weight: var(--weight-bold);
      color: var(--gray-800);
      margin: 0;
      line-height: 1.3;
    }

    .secondary-news-item-preview .news-item-thumb {
      width: 72px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .secondary-news-item-preview .news-item-thumb img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      padding: 4px;
    }

    .secondary-news-item-preview .news-item-thumb ::ng-deep svg {
      width: 18px;
      height: 18px;
      color: white;
    }

    /* Buttons */
    .btn {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      padding: 10px var(--space-4);
      font-size: var(--text-sm);
      font-weight: var(--weight-medium);
      border-radius: var(--radius-lg);
      border: none;
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-primary { background: var(--brand-600); color: #fff; }
    .btn-primary:hover:not(:disabled) { background: var(--brand-700); }
    .btn-secondary { background: var(--gray-100); color: var(--gray-700); }
    .btn-secondary:hover { background: var(--gray-200); }

    .btn-icon {
      width: 32px;
      height: 32px;
      border-radius: var(--radius-md);
      border: none;
      background: none;
      color: var(--gray-400);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all var(--transition-fast);
    }

    .btn-icon:hover { background: var(--gray-100); color: var(--gray-700); }
    .btn-icon.btn-danger:hover { background: var(--danger-50); color: var(--danger-600); }

    .modal-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-4) var(--space-6);
      border-top: 1px solid var(--gray-100);
    }

    .modal-footer-left { flex: 1; }
    .modal-footer-right { display: flex; gap: var(--space-3); flex-shrink: 0; }

    .footer-hint {
      font-size: 0.8rem;
      color: var(--gray-400);
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .footer-hint.hint-ok { color: var(--success); font-weight: 600; }
    .footer-hint svg { flex-shrink: 0; }

    .preview-desc {
      font-size: 0.75rem;
      color: var(--gray-400);
      margin: 0;
    }

    .preview-checklist {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-top: var(--space-3);
      padding-top: var(--space-3);
      border-top: 1px dashed var(--gray-200);
    }

    .preview-check {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.78rem;
      color: var(--gray-400);
    }

    .preview-check svg { flex-shrink: 0; }
    .preview-check.check-ok { color: var(--success); font-weight: 600; }
    .preview-check.check-ok svg { stroke: var(--success); }

    .alert {
      padding: var(--space-3) var(--space-4);
      border-radius: var(--radius-lg);
      font-size: var(--text-sm);
    }

    .alert-error { background: var(--danger-50); color: var(--danger-600); }

    /* States */
    .empty-state {
      grid-column: 1 / -1;
      text-align: center;
      padding: var(--space-12) var(--space-4);
    }

    .empty-icon {
      color: var(--gray-300);
      margin-bottom: var(--space-4);
    }

    .empty-title {
      font-size: var(--text-lg);
      font-weight: var(--weight-semibold);
      color: var(--gray-900);
      margin-bottom: var(--space-2);
    }

    .empty-desc {
      font-size: var(--text-sm);
      color: var(--gray-500);
      max-width: 360px;
      margin: 0 auto;
    }

    .loading-state {
      grid-column: 1 / -1;
      text-align: center;
      padding: var(--space-12) var(--space-4);
      color: var(--gray-500);
    }

    .spinner-lg {
      width: 32px;
      height: 32px;
      border: 3px solid var(--gray-200);
      border-top-color: var(--brand-600);
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
      margin: 0 auto var(--space-4);
    }

    .spinner {
      width: 14px;
      height: 14px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    /* ========== DARK MODE ========== */
    :host-context(.dark) .page-title { color: #f1f5f9; }
    :host-context(.dark) .page-subtitle { color: #94a3b8; }

    :host-context(.dark) .news-card {
      background: #1e293b;
      border-color: #334155;
    }

    :host-context(.dark) .news-card-title { color: #e2e8f0; }
    :host-context(.dark) .news-card-footer { border-top-color: #334155; }

    :host-context(.dark) .empty-icon { color: #475569; }
    :host-context(.dark) .empty-title { color: #e2e8f0; }
    :host-context(.dark) .empty-desc { color: #94a3b8; }
    :host-context(.dark) .loading-state { color: #94a3b8; }
    :host-context(.dark) .spinner-lg { border-color: #334155; border-top-color: var(--brand-400); }

    /* Modal dark */
    :host-context(.dark) .modal {
      background: #1e293b;
      box-shadow: 0 20px 60px rgba(0,0,0,0.5);
    }

    :host-context(.dark) .modal-header { border-bottom-color: #334155; }
    :host-context(.dark) .modal-header h2 { color: #f1f5f9; }
    :host-context(.dark) .modal-header-desc { color: #94a3b8; }
    :host-context(.dark) .btn-close { color: #94a3b8; }
    :host-context(.dark) .btn-close:hover { background: #334155; color: #e2e8f0; }
    :host-context(.dark) .modal-footer { border-top-color: #334155; }
    :host-context(.dark) .footer-hint { color: #64748b; }
    :host-context(.dark) .footer-hint.hint-ok { color: #4ade80; }

    /* Forms dark */
    :host-context(.dark) .form-label { color: #cbd5e1; }
    :host-context(.dark) .form-label-desc { color: #64748b; }
    :host-context(.dark) .form-section { background: #0f172a; border-color: #334155; }
    :host-context(.dark) .form-section-title { color: #e2e8f0; border-bottom-color: #334155; }
    :host-context(.dark) .form-section-desc { color: #64748b; }

    :host-context(.dark) .form-input,
    :host-context(.dark) .form-select,
    :host-context(.dark) .form-textarea {
      background: #0f172a;
      border-color: #334155;
      color: #f1f5f9;
    }

    :host-context(.dark) .form-input::placeholder,
    :host-context(.dark) .form-textarea::placeholder {
      color: #64748b;
    }

    :host-context(.dark) .form-input:focus,
    :host-context(.dark) .form-select:focus {
      border-color: var(--brand-400);
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
    }

    :host-context(.dark) .form-hint { color: #64748b; }
    :host-context(.dark) .code-textarea { background-color: #0f172a; }
    :host-context(.dark) .upload-hint { color: #64748b; }
    :host-context(.dark) .url-input-group svg { color: #64748b; }
    :host-context(.dark) .quick-tags-label { color: #64748b; }

    /* Buttons dark */
    :host-context(.dark) .btn-secondary { background: #334155; color: #e2e8f0; }
    :host-context(.dark) .btn-secondary:hover { background: #475569; }
    :host-context(.dark) .btn-icon { color: #94a3b8; }
    :host-context(.dark) .btn-icon:hover { background: #334155; color: #e2e8f0; }
    :host-context(.dark) .btn-icon.btn-danger:hover { background: rgba(239,68,68,0.15); color: #f87171; }

    /* Tags dark */
    :host-context(.dark) .tag-btn { background: #334155; color: #94a3b8; border-color: #475569; }
    :host-context(.dark) .tag-btn:hover { background: rgba(99,102,241,0.15); color: var(--brand-400); border-color: rgba(99,102,241,0.3); }
    :host-context(.dark) .tag-active { background: rgba(99,102,241,0.2) !important; color: var(--brand-400) !important; border-color: rgba(99,102,241,0.4) !important; }

    /* Image upload dark */
    :host-context(.dark) .image-upload-zone { border-color: #475569; color: #94a3b8; }
    :host-context(.dark) .image-upload-zone:hover { border-color: var(--brand-400); background: rgba(99,102,241,0.08); color: var(--brand-400); }

    /* Presets dark */
    :host-context(.dark) .preset-btn { background: #0f172a; border-color: #334155; }
    :host-context(.dark) .preset-btn span { color: #94a3b8; }
    :host-context(.dark) .preset-btn:hover { border-color: var(--brand-400); }
    :host-context(.dark) .preset-active { border-color: var(--brand-400) !important; background: rgba(99,102,241,0.1) !important; }

    :host-context(.dark) .thumb-preset { background: #0f172a; border-color: #334155; }
    :host-context(.dark) .thumb-preset:hover { border-color: var(--brand-400); }
    :host-context(.dark) .thumb-preset-active { border-color: var(--brand-400); background: rgba(99,102,241,0.1); }

    :host-context(.dark) .icon-preset { background: #0f172a; border-color: #334155; color: #94a3b8; }
    :host-context(.dark) .icon-preset:hover { border-color: var(--brand-400); color: var(--brand-400); }
    :host-context(.dark) .icon-preset-active { border-color: var(--brand-400); background: rgba(99,102,241,0.1); color: var(--brand-400); }

    /* Toggle dark */
    :host-context(.dark) .toggle-group { border-color: #334155; }
    :host-context(.dark) .toggle-btn { background: #0f172a; color: #94a3b8; border-color: #334155; }
    :host-context(.dark) .toggle-btn:first-child { border-right-color: #334155; }
    :host-context(.dark) .toggle-active { background: var(--brand-600) !important; color: #fff !important; }

    /* Color active dark */
    :host-context(.dark) .color-active { border-color: #e2e8f0; box-shadow: 0 0 0 2px #1e293b, 0 0 0 4px #e2e8f0; }

    /* Preview dark */
    :host-context(.dark) .preview-desc { color: #64748b; }
    :host-context(.dark) .preview-check { color: #64748b; }
    :host-context(.dark) .preview-check.check-ok { color: #4ade80; }
    :host-context(.dark) .preview-checklist { border-top-color: #334155; }

    /* Preview side dark */
    :host-context(.dark) .modal-preview-side { background-color: #0f172a; border-color: #334155; }
    :host-context(.dark) .preview-tag { color: #64748b; }
    :host-context(.dark) .secondary-news-item-preview { background: #1e293b; border-color: #334155; }
    :host-context(.dark) .secondary-news-item-preview .news-item-title { color: #e2e8f0; }

    /* Alert dark */
    :host-context(.dark) .alert-error { background: rgba(239,68,68,0.12); color: #f87171; }

    /* Focal Point Picker styles */
    .focal-point-section {
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid var(--gray-200);
    }
    .focal-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 24px;
      background: var(--gray-50);
      border: 2px dashed var(--gray-300);
      border-radius: var(--radius-lg);
      color: var(--gray-400);
      font-size: 12px;
      text-align: center;
    }
    .focal-wrapper {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-top: 8px;
    }
    .focal-image-preview {
      width: 100%;
      height: 180px;
      background-size: cover;
      border-radius: var(--radius-lg);
      border: 2px solid var(--gray-200);
      position: relative;
      overflow: hidden;
      background-color: var(--gray-100);
      transition: background-position 0.3s ease;
    }
    .focal-grid {
      position: absolute;
      inset: 0;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      grid-template-rows: repeat(3, 1fr);
      background: rgba(0, 0, 0, 0.3);
      z-index: 10;
    }
    .focal-btn {
      background: transparent;
      border: none;
      outline: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color 0.2s;
      z-index: 11;
      position: relative;
    }
    .focal-btn:hover {
      background-color: rgba(255, 255, 255, 0.2);
    }
    .focal-dot {
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.5);
      border: 2px solid rgba(0, 0, 0, 0.3);
      transition: all 0.2s;
      pointer-events: none;
    }
    .focal-btn:hover .focal-dot {
      background: #fff;
      transform: scale(1.3);
      border-color: rgba(0, 0, 0, 0.4);
    }
    .focal-active {
      background-color: rgba(255, 255, 255, 0.15);
    }
    .focal-active .focal-dot {
      background: var(--brand-500);
      box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.5);
      border-color: #fff;
      transform: scale(1.5);
    }
    .focal-crosshair {
      position: absolute;
      width: 24px;
      height: 24px;
      transform: translate(-50%, -50%);
      z-index: 12;
      pointer-events: none;
    }
    .focal-crosshair::before,
    .focal-crosshair::after {
      content: '';
      position: absolute;
      background: var(--brand-500);
      border-radius: 2px;
    }
    .focal-crosshair::before {
      width: 2px;
      height: 100%;
      left: 50%;
      transform: translateX(-50%);
    }
    .focal-crosshair::after {
      width: 100%;
      height: 2px;
      top: 50%;
      transform: translateY(-50%);
    }
    .focal-info-row {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .focal-label-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      font-weight: 600;
      color: var(--brand-700);
      background: var(--brand-50);
      padding: 5px 10px;
      border-radius: var(--radius-md);
      border: 1px solid var(--brand-200);
    }
    .focal-hint {
      font-size: 11px;
      color: var(--gray-400);
    }

    /* Focal point dark mode overrides */
    :host-context(.dark) .focal-point-section {
      border-top-color: #334155;
    }
    :host-context(.dark) .focal-empty {
      background: #0f172a;
      border-color: #475569;
      color: #64748b;
    }
    :host-context(.dark) .focal-image-preview {
      border-color: #475569;
      background-color: #1e293b;
    }
    :host-context(.dark) .focal-label-badge {
      color: #93c5fd;
      background: rgba(59, 130, 246, 0.1);
      border-color: rgba(59, 130, 246, 0.3);
    }
    :host-context(.dark) .focal-hint { color: #64748b; }
  `]
})
export class NoticiasPageComponent implements OnInit, AfterViewInit {
  private http = inject(HttpClient);
  private sanitizer = inject(DomSanitizer);
  @ViewChild('categoryInput') categoryInput!: ElementRef<HTMLInputElement>;

  newsList = signal<NewsItem[]>([]);
  loading = signal(true);
  saving = signal(false);
  showModal = signal(false);
  editingId = signal<number | null>(null);
  deletingId = signal<number | null>(null);
  errorMsg = signal('');
  toast = signal('');
  toastType = signal<'success' | 'error'>('success');

  form: NewsItem = this.getEmptyForm();

  quickTags = ['FESTIVAL 2027', 'REGLAMENTO', 'URGENTE', 'CRONOGRAMA', 'JURADO', 'INSCRIPCIONES'];

  imagePresets = [
    { value: 'assets/home-background.jpg', label: 'Principal' },
    { value: 'assets/rayentray.png', label: 'Rayentray' },
    { value: 'assets/hidro.jpeg', label: 'Histórico' },
  ];

  thumbColors = [
    { value: 'bg-blue', label: 'Azul' },
    { value: 'bg-gold', label: 'Dorado' },
    { value: 'bg-gray', label: 'Gris' },
  ];

  thumbImagePresets = [
    { value: 'assets/img/cruzBaila.png', label: 'Cruz' },
    { value: 'assets/img/logoballena.png', label: 'Ballena' },
  ];

  iconPresets = [
    { name: 'Documento', svg: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/></svg>' },
    { name: 'Calendario', svg: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>' },
    { name: 'Música', svg: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>' },
    { name: 'Estrella', svg: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>' },
  ];

  sanitizeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  focalPositions = [
    { value: 'top left', label: 'Arriba Izquierda' },
    { value: 'top center', label: 'Arriba Centro' },
    { value: 'top right', label: 'Arriba Derecha' },
    { value: 'center left', label: 'Centro Izquierda' },
    { value: 'center center', label: 'Centro' },
    { value: 'center right', label: 'Centro Derecha' },
    { value: 'bottom left', label: 'Abajo Izquierda' },
    { value: 'bottom center', label: 'Abajo Centro' },
    { value: 'bottom right', label: 'Abajo Derecha' }
  ];

  getFocalLabel(): string {
    const pos = this.focalPositions.find(p => p.value === this.form.imagePosition);
    return pos ? pos.label : 'Centro';
  }

  getFocalX(): number {
    const pos = this.form.imagePosition || 'center center';
    if (pos.includes('left')) return 15;
    if (pos.includes('right')) return 85;
    return 50;
  }

  getFocalY(): number {
    const pos = this.form.imagePosition || 'center center';
    if (pos.includes('top')) return 15;
    if (pos.includes('bottom')) return 85;
    return 50;
  }

  ngOnInit(): void {
    this.loadNews();
  }

  ngAfterViewInit(): void {}

  private focusCategory() {
    setTimeout(() => {
      this.categoryInput?.nativeElement?.focus();
    }, 100);
  }

  private getEmptyForm(): NewsItem {
    return {
      category: '',
      title: '',
      description: '',
      image: '',
      imagePosition: 'center center',
      thumbType: 'img',
      thumbSrc: 'assets/img/cruzBaila.png',
      thumbBg: 'bg-blue'
    };
  }

  loadNews() {
    this.loading.set(true);
    this.http.get<NewsItem[]>(`${environment.apiUrl}/news`).subscribe({
      next: (data) => {
        this.newsList.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  openCreateModal() {
    this.editingId.set(null);
    this.form = this.getEmptyForm();
    this.errorMsg.set('');
    this.showModal.set(true);
    this.focusCategory();
  }

  editNews(item: NewsItem) {
    this.editingId.set(item.id ?? null);
    this.form = { ...item };
    this.errorMsg.set('');
    this.showModal.set(true);
    this.focusCategory();
  }

  saveNews() {
    this.saving.set(true);
    this.errorMsg.set('');

    const payload = this.editingId() ? { ...this.form, id: this.editingId() } : this.form;

    this.http.post<NewsItem>(`${environment.apiUrl}/news`, payload).subscribe({
      next: () => {
        this.saving.set(false);
        this.closeModal();
        this.loadNews();
        this.showToast(this.editingId() ? 'Noticia actualizada' : 'Noticia publicada', 'success');
      },
      error: (err) => {
        this.saving.set(false);
        this.errorMsg.set(err.error?.detail || 'Error al guardar la noticia');
      }
    });
  }

  deleteNews(id: number) {
    if (!confirm('¿Estás seguro de eliminar esta noticia del carrusel?')) return;
    this.deletingId.set(id);

    this.http.delete(`${environment.apiUrl}/news/${id}`).subscribe({
      next: () => {
        this.deletingId.set(null);
        this.loadNews();
        this.showToast('Noticia eliminada', 'success');
      },
      error: (err) => {
        this.deletingId.set(null);
        this.showToast(err.error?.detail || 'Error al eliminar', 'error');
      }
    });
  }

  closeModal() {
    this.showModal.set(false);
    this.editingId.set(null);
    this.errorMsg.set('');
  }

  onImageSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.form.image = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onImageDrop(event: DragEvent) {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        this.form.image = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  private showToast(message: string, type: 'success' | 'error') {
    this.toastType.set(type);
    this.toast.set(message);
    setTimeout(() => this.toast.set(''), 3000);
  }
}
