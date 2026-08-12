import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StandsService, STAND_STATUS, STAND_STATUS_LABELS, Stand } from '../../../core/services/stands.service';

@Component({
  selector: 'app-admin-stands',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">Gestión de Stands</h1>
          <p class="page-subtitle">Revisar y gestionar solicitudes de stands del festival</p>
        </div>
      </div>

      <div class="filter-bar">
        <div class="filter-group">
          <label class="filter-label">Estado</label>
          <select class="filter-select" [(ngModel)]="statusFilter" (change)="loadStands()">
            <option value="">Todos los estados</option>
            <option value="PENDIENTE">Pendiente</option>
            <option value="EN_REVISION">En Revisión</option>
            <option value="APROBADO">Aprobado</option>
            <option value="RECHAZADO">Rechazado</option>
            <option value="ASIGNADO">Asignado</option>
            <option value="CONFIRMADO">Confirmado</option>
            <option value="CANCELADO">Cancelado</option>
          </select>
        </div>
        <div class="filter-group">
          <label class="filter-label">Buscar</label>
          <input type="text" class="filter-input" [(ngModel)]="searchTerm" placeholder="Nombre, email..." />
        </div>
        <button class="btn btn-secondary btn-sm" (click)="loadStands()">Buscar</button>
      </div>

      @if (loading()) {
        <div class="loading-state">
          <div class="spinner-lg"></div>
          <p>Cargando stands...</p>
        </div>
      } @else if (stands().data.length === 0) {
        <div class="empty-state">
          <div class="empty-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="9" y1="9" x2="15" y2="9"/>
              <line x1="9" y1="13" x2="15" y2="13"/>
            </svg>
          </div>
          <h3 class="empty-title">No hay stands</h3>
          <p class="empty-desc">No se encontraron solicitudes de stands con los filtros aplicados.</p>
        </div>
      } @else {
        <div class="table-wrapper">
          <table class="table">
            <thead>
              <tr>
                <th>Stand</th>
                <th>Persona</th>
                <th>Email</th>
                <th>Tipo</th>
                <th>Estado</th>
                <th>Actualizado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              @for (stand of stands().data; track stand.id) {
                <tr>
                  <td>
                    <div class="stand-cell">
                      <span class="stand-name">{{ getStandName(stand) }}</span>
                    </div>
                  </td>
                  <td><span class="text-cell">{{ getStandPerson(stand) }}</span></td>
                  <td><span class="text-cell">{{ getStandEmail(stand) }}</span></td>
                  <td><span class="text-cell">{{ getStandType(stand) }}</span></td>
                  <td>
                    <span class="status-badge" [class]="'status-' + stand.status.toLowerCase()">
                      {{ STAND_STATUS_LABELS[stand.status] || stand.status }}
                    </span>
                  </td>
                  <td><span class="text-muted">{{ formatDate(stand.updated_at) }}</span></td>
                  <td>
                    <div class="actions-cell">
                      <button class="btn-icon" title="Ver detalle" (click)="viewStand(stand)">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s9-7 17-7v14c0 .6-.4 1-1 1H8l-7 7Z"/></svg>
                      </button>
                      <button class="btn-icon" title="Cambiar estado" (click)="openStatusModal(stand)">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                      </button>
                      <button class="btn-icon btn-danger" title="Eliminar" (click)="deleteStand(stand)">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <div class="pagination">
          <span class="pagination-info">
            {{ (page() - 1) * pageSize() + 1 }}-{{ min(page() * pageSize(), stands().total) }} de {{ stands().total }}
          </span>
          <div class="pagination-controls">
            <button class="btn btn-secondary btn-sm" (click)="prevPage()" [disabled]="page() <= 1">Anterior</button>
            <button class="btn btn-secondary btn-sm" (click)="nextPage()" [disabled]="page() * pageSize() >= stands().total">Siguiente</button>
          </div>
        </div>
      }

      @if (viewingStand()) {
        <div class="modal-overlay" (click)="viewingStand.set(null)">
          <div class="modal modal-lg" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h2>Detalles de Stand</h2>
              <button class="btn-close" (click)="viewingStand.set(null)">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            <div class="modal-body">
              @if (viewingStand(); as s) {
                <div class="stand-detail">
                  <div class="detail-section">
                    <h3>Persona</h3>
                    <p><strong>Nombre:</strong> {{ s.person?.full_name }}</p>
                    <p><strong>DNI:</strong> {{ s.person?.dni }}</p>
                    <p><strong>Email:</strong> {{ s.person?.email }}</p>
                    <p><strong>Teléfono:</strong> {{ s.person?.phone }}</p>
                    <p><strong>Localidad:</strong> {{ s.person?.locality }}</p>
                    <p><strong>Representa empresa:</strong> {{ s.person?.represents_company }}</p>
                  </div>
                  <div class="detail-section">
                    <h3>Stand</h3>
                    <p><strong>Tipo:</strong> {{ getStandTypeLabel(s.info?.stand_type) }}</p>
                    <p><strong>Nombre:</strong> {{ s.info?.stand_name }}</p>
                    <p><strong>Descripción:</strong> {{ s.info?.description }}</p>
                    <p><strong>Productos:</strong> {{ s.info?.main_products }}</p>
                    <p><strong>Instagram:</strong> {{ s.info?.instagram }}</p>
                    <p><strong>Sitio web:</strong> {{ s.info?.website }}</p>
                  </div>
                  <div class="detail-section">
                    <h3>Días y Horarios</h3>
                    <p><strong>Días:</strong> {{ getDaysLabel(s.dates?.days) }}</p>
                    <p><strong>Desde:</strong> {{ s.dates?.start_time }}</p>
                    <p><strong>Hasta:</strong> {{ s.dates?.end_time }}</p>
                  </div>
                  <div class="detail-section">
                    <h3>Equipamiento</h3>
                    <p><strong>Espacio:</strong> {{ getSpaceLabel(s.equipment?.space_size) }}</p>
                    <p><strong>Estructura propia:</strong> {{ s.equipment?.brings_structure }}</p>
                    <p><strong>Elementos:</strong> {{ getEquipmentLabels(s.equipment?.elements) }}</p>
                    <p><strong>Mesas:</strong> {{ s.equipment?.table_count }}</p>
                    <p><strong>Sillas:</strong> {{ s.equipment?.chair_count }}</p>
                  </div>
                  <div class="detail-section">
                    <h3>Electricidad</h3>
                    <p><strong>Necesita:</strong> {{ s.electricity?.needs_electricity }}</p>
                    <p><strong>Equipamiento:</strong> {{ s.electricity?.equipment?.join(', ') }}</p>
                    <p><strong>Potencia:</strong> {{ s.electricity?.power_watts }} W</p>
                  </div>
                  @if (s.gastronomy && s.gastronomy.prepares_food === 'Si') {
                    <div class="detail-section">
                      <h3>Gastronomía</h3>
                      <p><strong>Tipos:</strong> {{ getFoodLabels(s.gastronomy.food_types) }}</p>
                      <p><strong>Gas:</strong> {{ s.gastronomy.uses_gas }}</p>
                      @if (s.gastronomy.gas_type) {
                        <p><strong>Tipo de gas:</strong> {{ getGasTypeLabel(s.gastronomy.gas_type) }}</p>
                        <p><strong>Cantidad:</strong> {{ s.gastronomy.gas_amount }} kg/mes</p>
                      }
                      <p><strong>Certificación:</strong> {{ s.gastronomy.has_certification }}</p>
                      @if (s.gastronomy.certification_doc_url) {
                        <p><a [href]="s.gastronomy.certification_doc_url" target="_blank">Ver certificado</a></p>
                      }
                    </div>
                  }
                  @if (s.commercial && s.commercial.commercial_modality) {
                    <div class="detail-section">
                      <h3>Datos Comerciales</h3>
                      <p><strong>Modalidad:</strong> {{ getModalityLabel(s.commercial.commercial_modality) }}</p>
                      <p><strong>Rango de precios:</strong> {{ getPriceRangeLabel(s.commercial.price_range) }}</p>
                    </div>
                  }
                  @if (s.personnel && s.personnel.count > 0) {
                    <div class="detail-section">
                      <h3>Personal</h3>
                      <p><strong>Cantidad:</strong> {{ s.personnel.count }}</p>
                      @if (s.personnel.names) {
                        <ul>
                          @for (p of s.personnel.names; track $index) {
                            <li>{{ p.name }} — {{ p.id_number }}</li>
                          }
                        </ul>
                      }
                    </div>
                  }
                  @if (s.logistics && s.logistics.needs_vehicle) {
                    <div class="detail-section">
                      <h3>Logística</h3>
                      <p><strong>Ingreso vehículo:</strong> {{ s.logistics.needs_vehicle }}</p>
                      @if (s.logistics.vehicle_type) {
                        <p><strong>Tipo:</strong> {{ getVehicleLabel(s.logistics.vehicle_type) }}</p>
                        <p><strong>Patente:</strong> {{ s.logistics.vehicle_plate }}</p>
                      }
                      <p><strong>Ingreso anticipado:</strong> {{ s.logistics.early_access }}</p>
                      <p><strong>Necesita ayuda:</strong> {{ s.logistics.needs_help }}</p>
                    </div>
                  }
                  <div class="detail-section">
                    <h3>Documentación</h3>
                    @if (s.docs?.dni_front_url) {
                      <p><a [href]="s.docs.dni_front_url" target="_blank">DNI — Frente</a></p>
                    }
                    @if (s.docs?.dni_back_url) {
                      <p><a [href]="s.docs.dni_back_url" target="_blank">DNI — Dorso</a></p>
                    }
                    @if (s.docs?.cuit_url) {
                      <p><a [href]="s.docs.cuit_url" target="_blank">CUIT</a></p>
                    }
                    @if (s.docs?.logo_url) {
                      <p><a [href]="s.docs.logo_url" target="_blank">Logo</a></p>
                    }
                    @if (s.docs?.stand_photos && s.docs.stand_photos.length > 0) {
                      <p><strong>Fotos del stand:</strong></p>
                      <div class="doc-photos">
                        @for (photo of s.docs.stand_photos; track $index) {
                          <img [src]="photo" [alt]="'Foto ' + ($index + 1)" class="doc-photo-thumb" />
                        }
                      </div>
                    }
                    @if (s.docs?.social_links) {
                      <p><strong>Redes sociales:</strong> {{ s.docs.social_links }}</p>
                    }
                  </div>
                  @if (s.observations) {
                    <div class="detail-section">
                      <h3>Observaciones</h3>
                      <p>{{ s.observations }}</p>
                    </div>
                  }
                  @if (s.stand_number || s.location_sector || s.location_size) {
                    <div class="detail-section">
                      <h3>Ubicación</h3>
                      @if (s.stand_number) { <p><strong>Numero de stand:</strong> {{ s.stand_number }}</p> }
                      @if (s.location_sector) { <p><strong>Sector:</strong> {{ s.location_sector }}</p> }
                      @if (s.location_size) { <p><strong>Tamaño:</strong> {{ s.location_size }}</p> }
                    </div>
                  }
                  @if (s.admin_notes) {
                    <div class="detail-section">
                      <h3>Notas del admin</h3>
                      <p>{{ s.admin_notes }}</p>
                    </div>
                  }
                  <div class="detail-meta">
                    <p class="text-muted">Creado: {{ formatDate(s.created_at) }}</p>
                    <p class="text-muted">Actualizado: {{ formatDate(s.updated_at) }}</p>
                  </div>
                </div>
              }
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" (click)="viewingStand.set(null)">Cerrar</button>
              <button class="btn btn-primary" (click)="viewingStand.set(null)">Cambiar estado</button>
            </div>
          </div>
        </div>
      }

      @if (statusModalStand()) {
        <div class="modal-overlay" (click)="statusModalStand.set(null)">
          <div class="modal modal-sm" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h2>Cambiar estado</h2>
              <button class="btn-close" (click)="statusModalStand.set(null)">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            <div class="modal-body">
              <div class="form-group">
                <label class="form-label">Nuevo estado</label>
                <select class="form-select" [(ngModel)]="newStatus">
                  <option value="PENDIENTE">Pendiente</option>
                  <option value="EN_REVISION">En Revisión</option>
                  <option value="APROBADO">Aprobado</option>
                  <option value="RECHAZADO">Rechazado</option>
                  <option value="ASIGNADO">Asignado</option>
                  <option value="CONFIRMADO">Confirmado</option>
                  <option value="CANCELADO">Cancelado</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Motivo (opcional)</label>
                <textarea class="form-textarea" [(ngModel)]="statusReason" placeholder="Detalle del cambio..." rows="3"></textarea>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" (click)="statusModalStand.set(null)">Cancelar</button>
              <button class="btn btn-primary" (click)="saveStatus()" [disabled]="saving()">Guardar</button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styleUrl: './admin-stands.scss',
})
export class AdminStandsPageComponent implements OnInit {
  STAND_STATUS_LABELS = STAND_STATUS_LABELS;
  statuses = STAND_STATUS;

  stands = signal<{ data: Stand[]; total: number; page: number; page_size: number }>({
    data: [], total: 0, page: 1, page_size: 20,
  });
  loading = signal(true);
  statusFilter = signal('');
  searchTerm = signal('');
  page = signal(1);
  pageSize = signal(20);
  viewingStand = signal<Stand | null>(null);
  statusModalStand = signal<Stand | null>(null);
  newStatus = signal('PENDIENTE');
  statusReason = signal('');
  saving = signal(false);

  private standsService = inject(StandsService);

  ngOnInit(): void {
    this.loadStands();
  }

  loadStands(): void {
    this.loading.set(true);
    this.standsService.listStands({
      page: this.page(),
      page_size: this.pageSize(),
      status: this.statusFilter() || undefined,
      search: this.searchTerm() || undefined,
    }).subscribe({
      next: (res) => {
        this.stands.set(res);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  prevPage(): void {
    if (this.page() > 1) {
      this.page.update(v => v - 1);
      this.loadStands();
    }
  }

  nextPage(): void {
    this.page.update(v => v + 1);
    this.loadStands();
  }

  min(a: number, b: number): number {
    return Math.min(a, b);
  }

  viewStand(stand: Stand): void {
    this.viewingStand.set(stand);
  }

  openStatusModal(stand: Stand): void {
    this.statusModalStand.set(stand);
    this.newStatus.set(stand.status);
    this.statusReason.set('');
  }

  saveStatus(): void {
    const stand = this.statusModalStand();
    if (!stand) return;
    this.saving.set(true);
    this.standsService.updateStatus(stand.id, {
      status: this.newStatus(),
      reason: this.statusReason() || undefined,
    }).subscribe({
      next: () => {
        this.saving.set(false);
        this.statusModalStand.set(null);
        this.loadStands();
      },
      error: (err) => {
        this.saving.set(false);
        alert(err.error?.detail || 'Error al actualizar');
      },
    });
  }

  deleteStand(stand: Stand): void {
    const name = stand.info?.stand_name || 'este stand';
    if (!confirm(`¿Eliminar permanentemente "${name}"? Esta acción no se puede deshacer.`)) return;
    this.standsService.deleteStand(stand.id).subscribe({
      next: () => this.loadStands(),
      error: (err) => alert(err.error?.detail || 'Error al eliminar'),
    });
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  getStandName(stand: Stand): string {
    return stand.info?.stand_name || 'Sin nombre';
  }

  getStandPerson(stand: Stand): string {
    return stand.person?.full_name || '-';
  }

  getStandEmail(stand: Stand): string {
    return stand.person?.email || '-';
  }

  getStandType(stand: Stand): string {
    const types: Record<string, string> = {
      EXPOSICION: 'Exposición',
      GASTRONOMIA: 'Gastronomía',
      COMERCIAL: 'Comercial',
      ARTISTICO: 'Artístico',
    };
    return types[stand.info?.stand_type] || stand.info?.stand_type || '-';
  }

  getStandTypeLabel(val: string): string {
    const labels: Record<string, string> = {
      EXPOSICION: 'Stands de Exposición',
      GASTRONOMIA: 'Stands de Gastronomía',
      COMERCIAL: 'Stands Comerciales',
      ARTISTICO: 'Stands Artísticos',
    };
    return labels[val] || val;
  }

  getDaysLabel(days: string[]): string {
    if (!days || days.length === 0) return '-';
    const labels: Record<string, string> = {
      jueves: 'Jueves', viernes: 'Viernes', sabado: 'Sábado',
      domingo: 'Domingo', todos: 'Todos',
    };
    return days.map(d => labels[d] || d).join(', ');
  }

  getSpaceLabel(val: string): string {
    const labels: Record<string, string> = {
      '2x2': '2×2 m', '3x3': '3×3 m', '4x4': '4×4 m',
      '4x5': '4×5 m', '5x5': '5×5 m', '5x6': '5×6 m', '6x6': '6×6 m',
    };
    return labels[val] || val;
  }

  getEquipmentLabels(vals: string[]): string {
    if (!vals || vals.length === 0) return '-';
    const labels: Record<string, string> = {
      carpa: 'Carpa / Barandales', tarima: 'Tarima', cama_musical: 'Cama musical',
      luces: 'Iluminación', ganchos: 'Ganchos / Estructuras de techo',
      barras: 'Barras de vaso / Barra', caja_fuerte: 'Caja fuerte',
    };
    return vals.map(v => labels[v] || v).join(', ');
  }

  getFoodLabels(vals: string[]): string {
    if (!vals || vals.length === 0) return '-';
    const labels: Record<string, string> = {
      empanadas: 'Empanadas', asados: 'Asados / Parrilla', pasteleria: 'Pastelería / Dulces',
      comida_rapida: 'Comida Rápida', bebidas: 'Bebidas / Infusiones',
      heladeria: 'Heladería', otros: 'Otros',
    };
    return vals.map(v => labels[v] || v).join(', ');
  }

  getGasTypeLabel(val: string): string {
    const labels: Record<string, string> = {
      natural: 'Gas Natural', licuado: 'Gas Licuado (GLP)',
    };
    return labels[val] || val;
  }

  getModalityLabel(val: string): string {
    const labels: Record<string, string> = {
      venta: 'Venta directa', servicio: 'Servicio',
      exhibicion: 'Exhibición / Portfolio', experiencia: 'Experiencia interactiva',
    };
    return labels[val] || val;
  }

  getPriceRangeLabel(val: string): string {
    const labels: Record<string, string> = {
      gratis: 'Gratis', accesible: 'Accesible (hasta $5.000)',
      medio: 'Medio ($5.000 - $15.000)', alto: 'Alto ($15.000+)',
    };
    return labels[val] || val;
  }

  getVehicleLabel(val: string): string {
    const labels: Record<string, string> = {
      auto: 'Automóvil', camioneta: 'Camioneta / Furgón',
      camion: 'Camión', moto: 'Moto / Bicicleta',
    };
    return labels[val] || val;
  }
}
