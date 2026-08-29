import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface GuestRow {
  tipo: string;
  nombre: string;
  dni: string;
  fecha: string;
  esPrincipal: boolean;
  source: 'precosequin' | 'pena' | 'stand';
  sourceId: string;
}

interface InscRaw { id: string; full_name: string; dni: string; created_at: string; accompanying_persons?: { fullName: string; dni: string }[]; }
interface PenaRaw { id: string; nombre_grupo: string; dni_responsable: string; created_at: string; acompaniantes?: { nombre: string; dni: string }[]; }
interface StandRaw { id: string; full_name: string; dni: string; created_at: string; }

@Component({
  selector: 'app-invitados-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="invitados">
      <div class="inv-header">
        <div>
          <h1 class="inv-title">Invitados</h1>
          <p class="inv-sub">Listado completo de todos los invitados incluyendo acompañantes</p>
        </div>
        <div class="inv-stats">
          <span class="stat">Precosequin: <strong>{{ precosequinCount() }}</strong></span>
          <span class="stat">Peñas: <strong>{{ penaCount() }}</strong></span>
          <span class="stat">Stands: <strong>{{ standsCount() }}</strong></span>
        </div>
        <button class="btn-export" (click)="exportCSV()">Exportar CSV</button>
      </div>

      @if (loading()) {
        <div class="loading"><div class="spinner"></div>Cargando todos los invitados...</div>
      }
      @else if (allData().length === 0) {
        <div class="empty">Sin invitados registrados</div>
      }
      @else {
        <div class="table-info">{{ allData().length }} invitados en total</div>
        <div class="table-wrap">
          <table class="inv-table">
            <thead><tr><th>Nombre</th><th>DNI</th><th>Fecha</th><th>Acciones</th></tr></thead>
            <tbody>
              @for (r of allData(); track $index) {
                <tr [class.row-acomp]="!r.esPrincipal">
                  <td><strong>{{ r.nombre }}</strong></td>
                  <td style="font-family:monospace;">{{ r.dni || '—' }}</td>
                  <td style="font-size:11px; color:#64748b;">{{ r.fecha | date:'dd/MM/yyyy' }}</td>
                  <td>
                    @if (r.esPrincipal) {
                      <div class="actions">
                        <button class="btn-action btn-edit" (click)="openEdit(r)" title="Editar">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <button class="btn-action btn-delete" (click)="confirmDelete(r)" title="Eliminar">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        </button>
                      </div>
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>

    <!-- MODAL EDITAR INSCRIPCION PRECOSEQUIN -->
    @if (editModal() && editModal()?.source === 'precosequin') {
      <div class="modal-overlay" (click)="closeModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>Editar Inscripción Precosequin</h2>
            <button class="modal-close" (click)="closeModal()">✕</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Nombre Completo</label>
              <input type="text" [(ngModel)]="editData().full_name" />
            </div>
            <div class="form-group">
              <label>DNI</label>
              <input type="text" [(ngModel)]="editData().dni" />
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

    <!-- MODAL EDITAR PEÑA -->
    @if (editModal() && editModal()?.source === 'pena') {
      <div class="modal-overlay" (click)="closeModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>Editar Acreditación Peña</h2>
            <button class="modal-close" (click)="closeModal()">✕</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Nombre del Grupo</label>
              <input type="text" [(ngModel)]="editData().nombre_grupo" />
            </div>
            <div class="form-group">
              <label>DNI Responsable</label>
              <input type="text" [(ngModel)]="editData().dni_responsable" />
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

    <!-- MODAL EDITAR STAND -->
    @if (editModal() && editModal()?.source === 'stand') {
      <div class="modal-overlay" (click)="closeModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>Editar Stand</h2>
            <button class="modal-close" (click)="closeModal()">✕</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Nombre</label>
              <input type="text" [(ngModel)]="editData().full_name" />
            </div>
            <div class="form-group">
              <label>DNI</label>
              <input type="text" [(ngModel)]="editData().dni" />
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
            <h2>Eliminar Invitado</h2>
            <button class="modal-close" (click)="deleteModal.set(null)">✕</button>
          </div>
          <div class="modal-body">
            <p>¿Estás seguro de eliminar a <strong>{{ deleteModal()?.nombre }}</strong>?</p>
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
    .invitados { padding:16px; max-width:1280px; margin:0 auto; }
    .inv-header { display:flex; justify-content:space-between; align-items:flex-start; gap:16px; margin-bottom:16px; flex-wrap:wrap; }
    .inv-title { font-family:var(--font-display); font-size:24px; font-weight:800; color:#0f172a; margin:0 0 4px; }
    .inv-sub { font-size:13px; color:#64748b; margin:0; }
    .inv-stats { display:flex; gap:12px; flex-wrap:wrap; }
    .stat { font-size:13px; color:#475569; background:#f1f5f9; padding:8px 12px; border-radius:999px; }
    .btn-export { padding:10px 16px; border-radius:10px; border:none; background:#1e293b; color:#fff; font-size:13px; font-weight:600; cursor:pointer; }
    .table-info { font-size:13px; color:#64748b; margin-bottom:12px; font-weight:600; }
    .table-wrap { overflow:auto; background:#fff; border:1px solid #e2e8f0; border-radius:14px; }
    .inv-table { width:100%; border-collapse:collapse; font-size:13px; }
    .inv-table th { background:#f8fafc; color:#475569; font-size:11px; text-transform:uppercase; letter-spacing:0.05em; padding:12px 14px; text-align:center; border-bottom:1px solid #e2e8f0; white-space:nowrap; }
    .inv-table td { padding:12px 14px; border-bottom:1px solid #f1f5f9; vertical-align:top; }
    .inv-table tr.row-acomp td { padding-left:32px; }
    .inv-table tr.row-acomp td:first-child::before { content:'↳ '; color:#94a3b8; }
    .badge { padding:3px 8px; border-radius:6px; font-size:11px; font-weight:700; background:#f1f5f9; color:#475569; }
    .badge-blue { background:#dbeafe; color:#1e40af; }
    .badge-violet { background:#ede9fe; color:#6d28d9; }
    .badge-yellow { background:#fef9c7; color:#854d0e; }
    .loading, .empty { text-align:center; padding:48px; color:#64748b; }
    .spinner { width:28px; height:28px; border:3px solid #e2e8f0; border-top-color:#3b82f6; border-radius:50%; animation:spin 0.7s linear infinite; margin:0 auto 12px; }
    @keyframes spin { to { transform:rotate(360deg); } }
    .actions { display:flex; gap:6px; }
    .btn-action { width:32px; height:32px; display:inline-flex; align-items:center; justify-content:center; border-radius:8px; border:1px solid #e2e8f0; background:#fff; cursor:pointer; transition:all 0.15s; }
    .btn-edit { color:#3b82f6; }
    .btn-edit:hover { background:#eff6ff; border-color:#3b82f6; }
    .btn-delete { color:#ef4444; }
    .btn-delete:hover { background:#fef2f2; border-color:#ef4444; }
    @media (max-width:768px) { .inv-table { min-width:500px; } }

    /* Modal */
    .modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; z-index:1000; padding:16px; }
    .modal { background:#fff; border-radius:16px; width:100%; max-width:520px; box-shadow:0 20px 60px rgba(0,0,0,0.2); }
    .modal-sm { max-width:400px; }
    .modal-header { display:flex; justify-content:space-between; align-items:center; padding:20px 24px 0; }
    .modal-header h2 { font-size:18px; font-weight:700; color:#0f172a; margin:0; }
    .modal-close { background:none; border:none; font-size:18px; color:#94a3b8; cursor:pointer; padding:4px; }
    .modal-body { padding:20px 24px; }
    .modal-body p { color:#475569; font-size:14px; }
    .modal-footer { display:flex; justify-content:flex-end; gap:10px; padding:0 24px 20px; }
    .form-group { margin-bottom:14px; }
    .form-group label { display:block; font-size:12px; font-weight:600; color:#475569; margin-bottom:4px; text-transform:uppercase; letter-spacing:0.04em; }
    .form-group input { width:100%; padding:10px 12px; border:1px solid #e2e8f0; border-radius:8px; font-size:14px; box-sizing:border-box; }
    .form-group input:focus { outline:none; border-color:#3b82f6; box-shadow:0 0 0 3px rgba(59,130,246,0.1); }
    .btn-cancel { padding:10px 16px; border-radius:8px; border:1px solid #e2e8f0; background:#fff; font-size:13px; cursor:pointer; }
    .btn-save { padding:10px 20px; border-radius:8px; border:none; background:#3b82f6; color:#fff; font-size:13px; font-weight:600; cursor:pointer; }
    .btn-save:disabled { opacity:0.5; cursor:not-allowed; }
    .btn-danger { padding:10px 20px; border-radius:8px; border:none; background:#ef4444; color:#fff; font-size:13px; font-weight:600; cursor:pointer; }
    .btn-danger:disabled { opacity:0.5; cursor:not-allowed; }
    .warn-text { color:#94a3b8; font-size:13px; margin:8px 0 0; }

    /* Dark mode */
    :host-context(.dark) .inv-title { color:#f8fafc; }
    :host-context(.dark) .inv-sub { color:#94a3b8; }
    :host-context(.dark) .stat { color:#e2e8f0; background:#1e293b; border:1px solid #334155; }
    :host-context(.dark) .table-info { color:#94a3b8; }
    :host-context(.dark) .table-wrap { background:#1e293b; border-color:#334155; }
    :host-context(.dark) .inv-table th { background:#0f172a; color:#94a3b8; border-bottom-color:#334155; text-align:center; }
    :host-context(.dark) .inv-table td { color:#e2e8f0; border-bottom-color:#1e293b; }
    :host-context(.dark) .inv-table td strong { color:#f8fafc; }
    :host-context(.dark) .inv-table tr.row-acomp td:first-child::before { color:#64748b; }
    :host-context(.dark) .btn-action { background:#1e293b; border-color:#334155; }
    :host-context(.dark) .btn-edit:hover { background:rgba(59,130,246,0.15); }
    :host-context(.dark) .btn-delete:hover { background:rgba(239,68,68,0.15); }
    :host-context(.dark) .btn-export { background:#334155; }
    :host-context(.dark) .btn-export:hover { background:#475569; }
    :host-context(.dark) .modal { background:#1e293b; }
    :host-context(.dark) .modal-header h2 { color:#f8fafc; }
    :host-context(.dark) .modal-close { color:#94a3b8; }
    :host-context(.dark) .modal-body p { color:#e2e8f0; }
    :host-context(.dark) .form-group label { color:#94a3b8; }
    :host-context(.dark) .form-group input { background:#0f172a; border-color:#334155; color:#f1f5f9; }
    :host-context(.dark) .btn-cancel { background:#334155; border-color:#475569; color:#e2e8f0; }
  `]
})
export class InvitadosPageComponent implements OnInit {
  private http = inject(HttpClient);

  inscriptos = signal<InscRaw[]>([]);
  pena = signal<PenaRaw[]>([]);
  stands = signal<StandRaw[]>([]);

  loadingInsc = signal(false);
  loadingPena = signal(false);
  loadingStands = signal(false);

  loading = computed(() => this.loadingInsc() || this.loadingPena() || this.loadingStands());

  precosequinCount = computed(() => this.inscriptos().length);
  penaCount = computed(() => this.pena().length);
  standsCount = computed(() => this.stands().length);

  allData = computed(() => {
    const rows: GuestRow[] = [];
    for (const r of this.inscriptos()) {
      rows.push({ tipo: 'Precosequin', nombre: r.full_name, dni: r.dni, fecha: r.created_at, esPrincipal: true, source: 'precosequin', sourceId: r.id });
      for (const a of r.accompanying_persons || []) {
        rows.push({ tipo: 'Precosequin', nombre: a.fullName, dni: a.dni, fecha: r.created_at, esPrincipal: false, source: 'precosequin', sourceId: r.id });
      }
    }
    for (const r of this.pena()) {
      rows.push({ tipo: 'Peña', nombre: r.nombre_grupo, dni: r.dni_responsable, fecha: r.created_at, esPrincipal: true, source: 'pena', sourceId: r.id });
      for (const a of r.acompaniantes || []) {
        rows.push({ tipo: 'Peña', nombre: a.nombre, dni: a.dni, fecha: r.created_at, esPrincipal: false, source: 'pena', sourceId: r.id });
      }
    }
    for (const r of this.stands()) {
      rows.push({ tipo: 'Stand', nombre: r.full_name, dni: r.dni, fecha: r.created_at, esPrincipal: true, source: 'stand', sourceId: r.id });
    }
    return rows;
  });

  editModal = signal<GuestRow | null>(null);
  editData = signal<any>({});
  saving = signal(false);

  deleteModal = signal<GuestRow | null>(null);
  deleting = signal(false);

  ngOnInit(): void {
    this.loadingInsc.set(true);
    this.http.get<any>(`${environment.apiUrl}/inscriptions/?page_size=100`).subscribe({
      next: (res) => {
        this.inscriptos.set((res.data || []).map((r: any) => ({
          id: r.id, full_name: r.full_name, dni: r.dni || '', created_at: r.created_at,
          accompanying_persons: (r.accompanying_persons || []).map((a: any) => ({ fullName: a.fullName || a.full_name || '', dni: a.dni || '' }))
        })));
        this.loadingInsc.set(false);
      },
      error: () => this.loadingInsc.set(false)
    });

    this.loadingPena.set(true);
    this.http.get<any>(`${environment.apiUrl}/pena-acreditaciones/?page=1&page_size=100`).subscribe({
      next: (res) => {
        this.pena.set((res.data || []).map((r: any) => ({
          id: r.id, nombre_grupo: r.nombre_grupo, dni_responsable: r.dni_responsable, created_at: r.created_at,
          acompaniantes: (r.acompaniantes || []).map((a: any) => ({ nombre: a.nombre || '', dni: a.dni || '' }))
        })));
        this.loadingPena.set(false);
      },
      error: () => this.loadingPena.set(false)
    });

    this.loadingStands.set(true);
    this.http.get<any>(`${environment.apiUrl}/stands/?page_size=100`).subscribe({
      next: (res) => {
        this.stands.set((res.data || []).map((r: any) => ({
          id: r.id, full_name: r.person?.full_name || r.info?.stand_name || '', dni: r.person?.dni || '', created_at: r.created_at
        })));
        this.loadingStands.set(false);
      },
      error: () => this.loadingStands.set(false)
    });
  }

  openEdit(row: GuestRow): void {
    const raw = row.source === 'precosequin'
      ? this.inscriptos().find(r => r.id === row.sourceId)
      : row.source === 'pena'
        ? this.pena().find(r => r.id === row.sourceId)
        : this.stands().find(r => r.id === row.sourceId);

    this.editModal.set(row);
    this.editData.set(raw ? { ...raw } : {});
  }

  closeModal(): void {
    this.editModal.set(null);
    this.saving.set(false);
  }

  saveEdit(): void {
    const row = this.editModal();
    const data = this.editData();
    if (!row) return;
    this.saving.set(true);

    let url = '';
    let payload: any = {};

    if (row.source === 'precosequin') {
      url = `${environment.apiUrl}/inscriptions/${data.id}`;
      payload = { full_name: data.full_name, dni: data.dni };
    } else if (row.source === 'pena') {
      url = `${environment.apiUrl}/pena-acreditaciones/${data.id}`;
      payload = { nombre_grupo: data.nombre_grupo, dni_responsable: data.dni_responsable };
    } else if (row.source === 'stand') {
      url = `${environment.apiUrl}/stands/${data.id}`;
      payload = { full_name: data.full_name, dni: data.dni };
    }

    this.http.put(url, payload).subscribe({
      next: () => { this.closeModal(); this.reloadSource(row.source); },
      error: (err) => { this.saving.set(false); alert(err.error?.detail || 'Error al guardar'); }
    });
  }

  confirmDelete(row: GuestRow): void {
    this.deleteModal.set(row);
  }

  executeDelete(): void {
    const row = this.deleteModal();
    if (!row) return;
    this.deleting.set(true);

    let url = '';
    if (row.source === 'precosequin') url = `${environment.apiUrl}/inscriptions/${row.sourceId}`;
    else if (row.source === 'pena') url = `${environment.apiUrl}/pena-acreditaciones/${row.sourceId}`;
    else if (row.source === 'stand') url = `${environment.apiUrl}/stands/${row.sourceId}`;

    this.http.delete(url).subscribe({
      next: () => { this.deleteModal.set(null); this.deleting.set(false); this.reloadSource(row.source); },
      error: (err) => { this.deleting.set(false); alert(err.error?.detail || 'Error al eliminar'); }
    });
  }

  private reloadSource(source: string): void {
    if (source === 'precosequin') {
      this.loadingInsc.set(true);
      this.http.get<any>(`${environment.apiUrl}/inscriptions/?page_size=100`).subscribe({
        next: (res) => {
          this.inscriptos.set((res.data || []).map((r: any) => ({
            id: r.id, full_name: r.full_name, dni: r.dni || '', created_at: r.created_at,
            accompanying_persons: (r.accompanying_persons || []).map((a: any) => ({ fullName: a.fullName || a.full_name || '', dni: a.dni || '' }))
          })));
          this.loadingInsc.set(false);
        },
        error: () => this.loadingInsc.set(false)
      });
    } else if (source === 'pena') {
      this.loadingPena.set(true);
      this.http.get<any>(`${environment.apiUrl}/pena-acreditaciones/?page=1&page_size=100`).subscribe({
        next: (res) => {
          this.pena.set((res.data || []).map((r: any) => ({
            id: r.id, nombre_grupo: r.nombre_grupo, dni_responsable: r.dni_responsable, created_at: r.created_at,
            acompaniantes: (r.acompaniantes || []).map((a: any) => ({ nombre: a.nombre || '', dni: a.dni || '' }))
          })));
          this.loadingPena.set(false);
        },
        error: () => this.loadingPena.set(false)
      });
    } else if (source === 'stand') {
      this.loadingStands.set(true);
      this.http.get<any>(`${environment.apiUrl}/stands/?page_size=100`).subscribe({
        next: (res) => {
          this.stands.set((res.data || []).map((r: any) => ({
            id: r.id, full_name: r.person?.full_name || r.info?.stand_name || '', dni: r.person?.dni || '', created_at: r.created_at
          })));
          this.loadingStands.set(false);
        },
        error: () => this.loadingStands.set(false)
      });
    }
  }

  exportCSV(): void {
    const headers = ['Nombre','DNI','Fecha'];
    const lines = [headers.join(',')];
    for (const r of this.allData()) {
      lines.push([r.nombre, r.dni, r.fecha].map(v => '"' + String(v||'').replace(/"/g,'""') + '"').join(','));
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'invitados-todos.csv'; a.click(); URL.revokeObjectURL(url);
  }
}
