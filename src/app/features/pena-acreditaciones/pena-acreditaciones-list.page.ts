import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { NotificationService } from '../../core/services/notification.service';

interface PenaRow {
  id: string;
  nombre_grupo: string;
  nombre_responsable: string;
  dni_responsable: string;
  telefono: string;
  dia_presentacion: string;
  acompaniantes: { nombre: string; dni: string; rol: string }[];
  status: string;
  created_at: string;
}

@Component({
  selector: 'app-pena-acreditaciones-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="pena-admin">
      <div class="pena-header">
        <div>
          <h1 class="pena-title">Acreditaciones Peña Oficial</h1>
          <p class="pena-sub">Artistas y acompañantes registrados para control de acceso</p>
        </div>
        <div class="pena-stats">
          <span class="stat">Total: <strong>{{ total() }}</strong></span>
          <span class="stat">Noche 1: <strong>{{ noche1Count() }}</strong></span>
          <span class="stat">Noche 2: <strong>{{ noche2Count() }}</strong></span>
        </div>
      </div>

      <div class="toolbar">
        <div class="search-bar">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" placeholder="Buscar grupo, responsable o DNI..." [ngModel]="search()" (ngModelChange)="search.set($event); load()" />
          @if (search()) { <button class="clear" (click)="search.set(''); load()">✕</button> }
        </div>
        <select class="filter-select" [ngModel]="diaFilter()" (ngModelChange)="diaFilter.set($event); load()">
          <option value="">Todas las noches</option>
          <option value="noche1">Noche 1 — Sábado 5</option>
          <option value="noche2">Noche 2 — Domingo 6</option>
          <option value="ambas">Ambas noches</option>
        </select>
        <button class="btn-export" (click)="exportCSV()">Exportar CSV</button>
      </div>

      @if (loading()) {
        <div class="loading"><div class="spinner"></div><p>Cargando...</p></div>
      } @else if (rows().length === 0) {
        <div class="empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
          <h3>Sin acreditaciones</h3>
          <p>Aún no hay artistas registrados en la Peña.</p>
        </div>
      } @else {
        <div class="table-wrap">
          <table class="pena-table">
            <thead>
              <tr><th>Grupo</th><th>Responsable</th><th>DNI</th><th>Teléfono</th><th>Día</th><th>Acompañantes</th><th>Fecha</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              @for (r of rows(); track r.id) {
                <tr>
                  <td><strong>{{ r.nombre_grupo }}</strong></td>
                  <td>{{ r.nombre_responsable }}</td>
                  <td style="font-family: monospace;">{{ r.dni_responsable }}</td>
                  <td>{{ r.telefono }}</td>
                  <td><span class="badge" [class.badge-blue]="r.dia_presentacion==='noche1'" [class.badge-violet]="r.dia_presentacion==='noche2'" [class.badge-gold]="r.dia_presentacion==='ambas'">{{ diaLabel(r.dia_presentacion) }}</span></td>
                  <td>
                    <span class="acomp-count">{{ r.acompaniantes.length }}</span>
                    <div class="acomp-list">
                      @for (a of r.acompaniantes; track $index) {
                        <span class="acomp-chip">{{ a.nombre }} · {{ a.dni }} · {{ rolLabel(a.rol) }}</span>
                      }
                    </div>
                  </td>
                  <td style="font-size:12px; color:#64748b;">{{ r.created_at | date:'dd/MM HH:mm' }}</td>
                  <td>
                    <div class="actions">
                      <button class="btn-action btn-edit" (click)="openEdit(r)" title="Editar">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      <button class="btn-action btn-delete" (click)="confirmDelete(r)" title="Eliminar">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
        <div class="pagination">
          <span>Página {{ page() }} — {{ total() }} registros</span>
          <button [disabled]="page()<=1" (click)="page.set(page()-1); load()">Anterior</button>
          <button [disabled]="rows().length < pageSize" (click)="page.set(page()+1); load()">Siguiente</button>
        </div>
      }
    </div>

    <!-- MODAL EDITAR -->
    @if (editModal()) {
      <div class="modal-overlay" (click)="closeModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>Editar Acreditación</h2>
            <button class="modal-close" (click)="closeModal()">✕</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Nombre del Grupo</label>
              <input type="text" [(ngModel)]="editData().nombre_grupo" />
            </div>
            <div class="form-group">
              <label>Nombre del Responsable</label>
              <input type="text" [(ngModel)]="editData().nombre_responsable" />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>DNI Responsable</label>
                <input type="text" [(ngModel)]="editData().dni_responsable" />
              </div>
              <div class="form-group">
                <label>Teléfono</label>
                <input type="text" [(ngModel)]="editData().telefono" />
              </div>
            </div>
            <div class="form-group">
              <label>Día de Presentación</label>
              <select [(ngModel)]="editData().dia_presentacion">
                <option value="noche1">Noche 1 — Sábado 5</option>
                <option value="noche2">Noche 2 — Domingo 6</option>
                <option value="ambas">Ambas noches</option>
              </select>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-cancel" (click)="closeModal()">Cancelar</button>
            <button class="btn-save" (click)="saveEdit()" [disabled]="saving()">
              @if (saving()) { Guardando... } @else { Guardar }
            </button>
          </div>
        </div>
      </div>
    }

    <!-- MODAL CONFIRMAR ELIMINAR -->
    @if (deleteModal()) {
      <div class="modal-overlay" (click)="deleteModal.set(null)">
        <div class="modal modal-sm" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>Eliminar Acreditación</h2>
            <button class="modal-close" (click)="deleteModal.set(null)">✕</button>
          </div>
          <div class="modal-body">
            <p>¿Estás seguro de eliminar la acreditación de <strong>{{ deleteModal()?.nombre_grupo }}</strong>?</p>
            <p class="warn-text">Esta acción no se puede deshacer.</p>
          </div>
          <div class="modal-footer">
            <button class="btn-cancel" (click)="deleteModal.set(null)">Cancelar</button>
            <button class="btn-danger" (click)="executeDelete()" [disabled]="deleting()">
              @if (deleting()) { Eliminando... } @else { Eliminar }
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .pena-admin { padding: 16px; max-width: 1200px; margin: 0 auto; }
    .pena-header { display:flex; justify-content:space-between; align-items:flex-start; gap:16px; margin-bottom:20px; flex-wrap:wrap; }
    .pena-title { font-family:var(--font-display); font-size:22px; font-weight:800; color:#0f172a; margin:0 0 4px; }
    .pena-sub { font-size:13px; color:#64748b; margin:0; }
    .pena-stats { display:flex; gap:12px; flex-wrap:wrap; }
    .stat { font-size:13px; color:#475569; background:#f1f5f9; padding:8px 12px; border-radius:999px; }
    .toolbar { display:flex; gap:12px; margin-bottom:16px; flex-wrap:wrap; }
    .search-bar { display:flex; align-items:center; gap:8px; background:#fff; border:1px solid #e2e8f0; border-radius:12px; padding:0 14px; flex:1; min-width:220px; }
    .search-bar input { flex:1; border:none; outline:none; padding:12px 0; font-size:14px; }
    .search-bar .clear { background:none; border:none; cursor:pointer; color:#94a3b8; }
    .filter-select { padding:10px 14px; border-radius:10px; border:1px solid #e2e8f0; background:#fff; font-size:13px; }
    .btn-export { padding:10px 16px; border-radius:10px; border:none; background:#1e293b; color:#fff; font-size:13px; font-weight:600; cursor:pointer; }
    .btn-export:hover { background:#0f172a; }
    .loading, .empty { text-align:center; padding:48px; color:#64748b; }
    .spinner { width:28px; height:28px; border:3px solid #e2e8f0; border-top-color:#3b82f6; border-radius:50%; animation:spin 0.7s linear infinite; margin:0 auto 12px; }
    @keyframes spin { to { transform:rotate(360deg); } }
    .table-wrap { overflow:auto; background:#fff; border:1px solid #e2e8f0; border-radius:14px; }
    .pena-table { width:100%; border-collapse:collapse; font-size:13px; }
    .pena-table th { background:#f8fafc; color:#475569; font-size:11px; text-transform:uppercase; letter-spacing:0.05em; padding:12px 14px; text-align:left; border-bottom:1px solid #e2e8f0; white-space:nowrap; }
    .pena-table td { padding:12px 14px; border-bottom:1px solid #f1f5f9; vertical-align:top; }
    .pena-table tr:last-child td { border-bottom:none; }
    .badge { padding:3px 8px; border-radius:6px; font-size:11px; font-weight:700; background:#f1f5f9; color:#475569; }
    .badge-blue { background:#dbeafe; color:#1e40af; }
    .badge-violet { background:#ede9fe; color:#6d28d9; }
    .badge-gold { background:#fef3c7; color:#92400e; }
    .acomp-count { display:inline-block; background:#eff6ff; color:#1e40af; font-weight:700; padding:2px 8px; border-radius:999px; font-size:12px; margin-bottom:6px; }
    .acomp-list { display:flex; flex-direction:column; gap:4px; }
    .acomp-chip { font-size:11px; color:#475569; background:#f8fafc; border:1px solid #e2e8f0; padding:3px 8px; border-radius:6px; }
    .actions { display:flex; gap:6px; }
    .btn-action { width:32px; height:32px; display:inline-flex; align-items:center; justify-content:center; border-radius:8px; border:1px solid #e2e8f0; background:#fff; cursor:pointer; transition:all 0.15s; }
    .btn-edit { color:#3b82f6; }
    .btn-edit:hover { background:#eff6ff; border-color:#3b82f6; }
    .btn-delete { color:#ef4444; }
    .btn-delete:hover { background:#fef2f2; border-color:#ef4444; }
    .pagination { display:flex; gap:12px; align-items:center; justify-content:center; margin-top:16px; font-size:13px; color:#64748b; }
    .pagination button { padding:8px 14px; border-radius:8px; border:1px solid #e2e8f0; background:#fff; cursor:pointer; }
    .pagination button:disabled { opacity:0.4; cursor:not-allowed; }
    @media (max-width:768px) { .pena-table { min-width:900px; } }

    /* Modal */
    .modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; z-index:1000; padding:16px; }
    .modal { background:#fff; border-radius:16px; width:100%; max-width:520px; box-shadow:0 20px 60px rgba(0,0,0,0.2); }
    .modal-sm { max-width:400px; }
    .modal-header { display:flex; justify-content:space-between; align-items:center; padding:20px 24px 0; }
    .modal-header h2 { font-size:18px; font-weight:700; color:#0f172a; margin:0; }
    .modal-close { background:none; border:none; font-size:18px; color:#94a3b8; cursor:pointer; padding:4px; }
    .modal-body { padding:20px 24px; }
    .modal-footer { display:flex; justify-content:flex-end; gap:10px; padding:0 24px 20px; }
    .form-group { margin-bottom:14px; }
    .form-group label { display:block; font-size:12px; font-weight:600; color:#475569; margin-bottom:4px; text-transform:uppercase; letter-spacing:0.04em; }
    .form-group input, .form-group select { width:100%; padding:10px 12px; border:1px solid #e2e8f0; border-radius:8px; font-size:14px; box-sizing:border-box; }
    .form-group input:focus, .form-group select:focus { outline:none; border-color:#3b82f6; box-shadow:0 0 0 3px rgba(59,130,246,0.1); }
    .form-row { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
    .btn-cancel { padding:10px 16px; border-radius:8px; border:1px solid #e2e8f0; background:#fff; font-size:13px; cursor:pointer; }
    .btn-save { padding:10px 20px; border-radius:8px; border:none; background:#3b82f6; color:#fff; font-size:13px; font-weight:600; cursor:pointer; }
    .btn-save:disabled { opacity:0.5; cursor:not-allowed; }
    .btn-danger { padding:10px 20px; border-radius:8px; border:none; background:#ef4444; color:#fff; font-size:13px; font-weight:600; cursor:pointer; }
    .btn-danger:disabled { opacity:0.5; cursor:not-allowed; }
    .warn-text { color:#94a3b8; font-size:13px; margin:8px 0 0; }

    /* Dark mode */
    :host-context(.dark) .pena-title { color:#f8fafc; }
    :host-context(.dark) .pena-sub { color:#94a3b8; }
    :host-context(.dark) .stat { color:#e2e8f0; background:#1e293b; border:1px solid #334155; }
    :host-context(.dark) .search-bar { background:#1e293b; border-color:#334155; color:#f1f5f9; }
    :host-context(.dark) .search-bar input { color:#f1f5f9; background:transparent; }
    :host-context(.dark) .search-bar input::placeholder { color:#64748b; }
    :host-context(.dark) .search-bar svg { color:#94a3b8; }
    :host-context(.dark) .filter-select { background:#1e293b; border-color:#334155; color:#f1f5f9; }
    :host-context(.dark) .filter-select option { background:#1e293b; }
    :host-context(.dark) .btn-export { background:#334155; }
    :host-context(.dark) .btn-export:hover { background:#475569; }
    :host-context(.dark) .loading, :host-context(.dark) .empty { color:#94a3b8; }
    :host-context(.dark) .empty h3 { color:#f1f5f9; }
    :host-context(.dark) .table-wrap { background:#1e293b; border-color:#334155; }
    :host-context(.dark) .pena-table th { background:#0f172a; color:#94a3b8; border-bottom-color:#334155; }
    :host-context(.dark) .pena-table td { color:#e2e8f0; border-bottom-color:#1e293b; }
    :host-context(.dark) .pena-table td strong { color:#f8fafc; }
    :host-context(.dark) .badge { background:#334155; color:#e2e8f0; }
    :host-context(.dark) .badge-blue { background:rgba(59,130,246,0.2); color:#93c5fd; }
    :host-context(.dark) .badge-violet { background:rgba(139,92,246,0.2); color:#c4b5fd; }
    :host-context(.dark) .badge-gold { background:rgba(245,158,11,0.2); color:#fde68a; }
    :host-context(.dark) .acomp-count { background:rgba(59,130,246,0.15); color:#93c5fd; }
    :host-context(.dark) .acomp-chip { color:#cbd5e1; background:#0f172a; border-color:#334155; }
    :host-context(.dark) .pagination { color:#94a3b8; }
    :host-context(.dark) .pagination button { background:#1e293b; border-color:#334155; color:#e2e8f0; }
    :host-context(.dark) .btn-action { background:#1e293b; border-color:#334155; }
    :host-context(.dark) .btn-edit:hover { background:rgba(59,130,246,0.15); }
    :host-context(.dark) .btn-delete:hover { background:rgba(239,68,68,0.15); }
    :host-context(.dark) .modal { background:#1e293b; }
    :host-context(.dark) .modal-header h2 { color:#f8fafc; }
    :host-context(.dark) .modal-close { color:#94a3b8; }
    :host-context(.dark) .modal-body p { color:#e2e8f0; }
    :host-context(.dark) .form-group label { color:#94a3b8; }
    :host-context(.dark) .form-group input, :host-context(.dark) .form-group select { background:#0f172a; border-color:#334155; color:#f1f5f9; }
    :host-context(.dark) .btn-cancel { background:#334155; border-color:#475569; color:#e2e8f0; }
  `]
})
export class PenaAcreditacionesListPageComponent implements OnInit {
  private http = inject(HttpClient);
  private notifications = inject(NotificationService);
  rows = signal<PenaRow[]>([]);
  total = signal(0);
  loading = signal(false);
  search = signal('');
  diaFilter = signal('');
  page = signal(1);
  pageSize = 20;

  editModal = signal<PenaRow | null>(null);
  editData = signal<any>({});
  saving = signal(false);

  deleteModal = signal<PenaRow | null>(null);
  deleting = signal(false);

  noche1Count = computed(() => this.rows().filter(r => r.dia_presentacion === 'noche1').length);
  noche2Count = computed(() => this.rows().filter(r => r.dia_presentacion === 'noche2').length);

  ngOnInit() {
    this.load();
    this.markAllAsRead();
  }

  private markAllAsRead(): void {
    this.http.patch(`${environment.apiUrl}/pena-acreditaciones/read-all`, {}).subscribe({
      next: () => this.notifications.penaUnread.set(0),
      error: () => {},
    });
  }

  load(): void {
    this.loading.set(true);
    let params = new HttpParams().set('page', this.page().toString()).set('page_size', this.pageSize.toString());
    if (this.search()) params = params.set('search', this.search());
    if (this.diaFilter()) params = params.set('dia', this.diaFilter());
    this.http.get<{ data: PenaRow[]; total: number }>(`${environment.apiUrl}/pena-acreditaciones/`, { params }).subscribe({
      next: (res) => { this.rows.set(res.data || []); this.total.set(res.total || 0); this.loading.set(false); },
      error: () => { this.loading.set(false); }
    });
  }

  openEdit(row: PenaRow): void {
    this.editData.set({ ...row, acompaniantes: [...row.acompaniantes] });
    this.editModal.set(row);
  }

  closeModal(): void {
    this.editModal.set(null);
    this.saving.set(false);
  }

  saveEdit(): void {
    const data = this.editData();
    this.saving.set(true);
    const payload = {
      nombre_grupo: data.nombre_grupo,
      nombre_responsable: data.nombre_responsable,
      dni_responsable: data.dni_responsable,
      telefono: data.telefono,
      dia_presentacion: data.dia_presentacion,
      acompaniantes: data.acompaniantes || [],
    };
    this.http.put(`${environment.apiUrl}/pena-acreditaciones/${data.id}`, payload).subscribe({
      next: () => { this.closeModal(); this.load(); },
      error: (err) => { this.saving.set(false); alert(err.error?.detail || 'Error al guardar'); }
    });
  }

  confirmDelete(row: PenaRow): void {
    this.deleteModal.set(row);
  }

  executeDelete(): void {
    const row = this.deleteModal();
    if (!row) return;
    this.deleting.set(true);
    this.http.delete(`${environment.apiUrl}/pena-acreditaciones/${row.id}`).subscribe({
      next: () => { this.deleteModal.set(null); this.deleting.set(false); this.load(); },
      error: (err) => { this.deleting.set(false); alert(err.error?.detail || 'Error al eliminar'); }
    });
  }

  diaLabel(v: string): string {
    return v === 'noche1' ? 'Noche 1' : v === 'noche2' ? 'Noche 2' : v === 'ambas' ? 'Ambas' : v;
  }
  rolLabel(v: string): string {
    const m: Record<string,string> = { musico: 'Músico', asistente: 'Asistente', tecnico_chofer: 'Técnico', acompaniante: 'Acompañante' };
    return m[v] || v;
  }
  exportCSV(): void {
    const headers = ['Grupo','Responsable','DNI','Telefono','Dia','Acompaniantes','Fecha'];
    const lines = [headers.join(',')];
    for (const r of this.rows()) {
      const acomp = r.acompaniantes.map(a => a.nombre + ' (' + a.dni + ')').join(' | ');
      lines.push([r.nombre_grupo, r.nombre_responsable, r.dni_responsable, r.telefono, r.dia_presentacion, '"' + acomp.replace(/"/g,'""') + '"', r.created_at].join(','));
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'pena-acreditaciones.csv'; a.click(); URL.revokeObjectURL(url);
  }
}
