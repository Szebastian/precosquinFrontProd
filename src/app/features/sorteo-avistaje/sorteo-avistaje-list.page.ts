import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface SorteoRow {
  id: string;
  ticket_option: string;
  full_name: string;
  whatsapp: string;
  email: string;
  province: string | null;
  city: string;
  comprobante_url: string | null;
  comprobante_numero: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

@Component({
  selector: 'app-sorteo-avistaje-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="sorteo-admin">
      <div class="sorteo-header">
        <div>
          <h1 class="sorteo-title">Sorteo Avistaje de Ballenas y Snorkelling</h1>
          <p class="sorteo-sub">Participantes registrados para el sorteo del viaje en bote para 4 personas</p>
        </div>
        <div class="sorteo-stats">
          <span class="stat total">Total: <strong>{{ total() }}</strong></span>
          <span class="stat stat-pendiente">Pendientes: <strong>{{ pendientesCount() }}</strong></span>
          <span class="stat stat-validado">Validados: <strong>{{ validadosCount() }}</strong></span>
          <span class="stat stat-rechazado">Rechazados: <strong>{{ rechazadosCount() }}</strong></span>
        </div>
      </div>

      <div class="toolbar">
        <div class="search-bar">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" placeholder="Buscar nombre, email o WhatsApp..." [ngModel]="search()" (ngModelChange)="search.set($event); load()" />
          @if (search()) { <button class="clear" (click)="search.set(''); load()">✕</button> }
        </div>
        <select class="filter-select" [ngModel]="statusFilter()" (ngModelChange)="statusFilter.set($event); page.set(1); load()">
          <option value="">Todos los estados</option>
          <option value="pendiente_validacion">Pendientes</option>
          <option value="validado">Validados</option>
          <option value="rechazado">Rechazados</option>
        </select>
        <button class="btn-export" (click)="exportCSV()">Exportar CSV</button>
      </div>

      @if (loading()) {
        <div class="loading"><div class="spinner"></div><p>Cargando...</p></div>
      } @else if (rows().length === 0) {
        <div class="empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
          <h3>Sin participantes</h3>
          <p>Aún no hay registros en el sorteo de avistaje.</p>
        </div>
      } @else {
        <div class="table-wrap">
          <table class="sorteo-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>WhatsApp</th>
                <th>Ciudad</th>
                <th>Provincia</th>
                <th>Comprobante</th>
                <th>Nro. Comp.</th>
                <th>Estado</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (r of rows(); track r.id; let i = $index) {
                <tr>
                  <td class="row-num">{{ (page() - 1) * pageSize + i + 1 }}</td>
                  <td><strong>{{ r.full_name }}</strong></td>
                  <td><span class="email-text">{{ r.email }}</span></td>
                  <td><span class="phone-text">{{ r.whatsapp }}</span></td>
                  <td>{{ r.city }}</td>
                  <td>{{ r.province || '-' }}</td>
                  <td>
                    @if (r.comprobante_url) {
                      <a class="comprobante-link" [href]="r.comprobante_url" target="_blank" title="Ver comprobante">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>
                        Ver
                      </a>
                    } @else {
                      <span class="no-file">Sin archivo</span>
                    }
                  </td>
                  <td><span class="mono-text">{{ r.comprobante_numero || '-' }}</span></td>
                  <td>
                    <span class="badge"
                      [class.badge-pendiente]="r.status === 'pendiente_validacion'"
                      [class.badge-validado]="r.status === 'validado'"
                      [class.badge-rechazado]="r.status === 'rechazado'"
                    >{{ statusLabel(r.status) }}</span>
                  </td>
                  <td class="date-cell">{{ r.created_at | date:'dd/MM/yy HH:mm' }}</td>
                  <td>
                    <div class="actions">
                       @if (r.status === 'pendiente_validacion') {
                         <button class="btn-action btn-approve" (click)="confirmModal.set(r)" title="Confirmar depósito">
                           <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                         </button>
                       } @else if (r.status === 'validado') {
                         <button class="btn-action btn-reject" (click)="changeStatus(r, 'rechazado')" title="Rechazar">
                           <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                         </button>
                       } @else {
                         <button class="btn-action btn-approve" (click)="confirmModal.set(r)" title="Confirmar depósito">
                           <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                         </button>
                       }
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

    <!-- DELETE CONFIRM MODAL -->
    @if (deleteModal()) {
      <div class="modal-overlay" (click)="deleteModal.set(null)">
        <div class="modal modal-sm" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>Eliminar Participante</h2>
            <button class="modal-close" (click)="deleteModal.set(null)">✕</button>
          </div>
          <div class="modal-body">
            <p>¿Estás seguro de eliminar el registro de <strong>{{ deleteModal()?.full_name }}</strong>?</p>
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

    <!-- CONFIRM DEPOSIT MODAL -->
    @if (confirmModal()) {
      <div class="modal-overlay" (click)="confirmModal.set(null)">
        <div class="modal modal-confirm" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>Confirmar Depósito</h2>
            <button class="modal-close" (click)="confirmModal.set(null)">✕</button>
          </div>
          <div class="modal-body">
            <p class="warn-text">¿Estás seguro de que el depósito se recibió correctamente? Se enviará un email de confirmación al participante.</p>
            <div class="confirm-info">
              <div class="confirm-row"><span class="confirm-label">Nombre:</span> <strong>{{ confirmModal()?.full_name }}</strong></div>
              <div class="confirm-row"><span class="confirm-label">Email:</span> <span class="confirm-value">{{ confirmModal()?.email }}</span></div>
              <div class="confirm-row"><span class="confirm-label">WhatsApp:</span> <span class="confirm-value">{{ confirmModal()?.whatsapp }}</span></div>
              <div class="confirm-row"><span class="confirm-label">Ciudad:</span> <span class="confirm-value">{{ confirmModal()?.city }}, {{ confirmModal()?.province || '' }}</span></div>
              <div class="confirm-row"><span class="confirm-label">Nro. Comp.:</span> <span class="confirm-value mono">{{ confirmModal()?.comprobante_numero || '-' }}</span></div>
              @if (confirmModal()?.comprobante_url) {
                <div class="confirm-row">
                  <span class="confirm-label">Comprobante:</span>
                  <a class="comprobante-link" [href]="confirmModal()!.comprobante_url" target="_blank">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>
                    Ver comprobante
                  </a>
                </div>
              }
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-cancel" (click)="confirmModal.set(null)">Cancelar</button>
<button class="btn-confirm" (click)="confirmApprove()" [disabled]="confirming()">
  @if (confirming()) { Confirmando... } @else { ✅ Confirmar depósito }
</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .sorteo-admin { padding: 16px; max-width: 1200px; margin: 0 auto; }
    .sorteo-header { display:flex; justify-content:space-between; align-items:flex-start; gap:16px; margin-bottom:20px; flex-wrap:wrap; }
    .sorteo-title { font-family:var(--font-display); font-size:22px; font-weight:800; color:#0f172a; margin:0 0 4px; }
    .sorteo-sub { font-size:13px; color:#64748b; margin:0; }
    .sorteo-stats { display:flex; gap:8px; flex-wrap:wrap; }
    .stat { font-size:13px; color:#475569; background:#f1f5f9; padding:8px 12px; border-radius:999px; font-weight:500; }
    .stat-pendiente { background:#fef3c7; color:#92400e; }
    .stat-validado { background:#d1fae5; color:#065f46; }
    .stat-rechazado { background:#fee2e2; color:#991b1b; }
    .toolbar { display:flex; gap:12px; margin-bottom:16px; flex-wrap:wrap; }
    .search-bar { display:flex; align-items:center; gap:8px; background:#fff; border:1px solid #e2e8f0; border-radius:12px; padding:0 14px; flex:1; min-width:220px; }
    .search-bar input { flex:1; border:none; outline:none; padding:12px 0; font-size:14px; }
    .search-bar .clear { background:none; border:none; cursor:pointer; color:#94a3b8; font-size:14px; }
    .filter-select { padding:10px 14px; border-radius:10px; border:1px solid #e2e8f0; background:#fff; font-size:13px; }
    .btn-export { padding:10px 16px; border-radius:10px; border:none; background:#1e293b; color:#fff; font-size:13px; font-weight:600; cursor:pointer; }
    .btn-export:hover { background:#0f172a; }
    .loading, .empty { text-align:center; padding:48px; color:#64748b; }
    .spinner { width:28px; height:28px; border:3px solid #e2e8f0; border-top-color:#3b82f6; border-radius:50%; animation:spin 0.7s linear infinite; margin:0 auto 12px; }
    @keyframes spin { to { transform:rotate(360deg); } }
    .empty h3 { color:#0f172a; margin:8px 0 4px; }
    .empty p { font-size:13px; margin:0; }
    .table-wrap { overflow:auto; background:#fff; border:1px solid #e2e8f0; border-radius:14px; }
    .sorteo-table { width:100%; border-collapse:collapse; font-size:13px; }
    .sorteo-table th { background:#f8fafc; color:#475569; font-size:11px; text-transform:uppercase; letter-spacing:0.05em; padding:12px 12px; text-align:left; border-bottom:1px solid #e2e8f0; white-space:nowrap; }
    .sorteo-table td { padding:10px 12px; border-bottom:1px solid #f1f5f9; vertical-align:middle; }
    .sorteo-table tr:last-child td { border-bottom:none; }
    .row-num { color:#94a3b8; font-size:12px; font-weight:600; width:36px; }
    .email-text { color:#475569; font-size:12px; word-break:break-all; }
    .phone-text { color:#475569; font-size:12px; white-space:nowrap; }
    .mono-text { font-family:monospace; font-size:12px; color:#475569; }
    .date-cell { font-size:12px; color:#64748b; white-space:nowrap; }
    .comprobante-link { display:inline-flex; align-items:center; gap:4px; color:#3b82f6; text-decoration:none; font-size:12px; font-weight:500; }
    .comprobante-link:hover { color:#2563eb; text-decoration:underline; }
    .no-file { color:#94a3b8; font-size:12px; font-style:italic; }
    .badge { padding:3px 8px; border-radius:6px; font-size:11px; font-weight:700; white-space:nowrap; }
    .badge-pendiente { background:#fef3c7; color:#92400e; }
    .badge-validado { background:#d1fae5; color:#065f46; }
    .badge-rechazado { background:#fee2e2; color:#991b1b; }
    .actions { display:flex; gap:6px; }
    .btn-action { width:32px; height:32px; display:inline-flex; align-items:center; justify-content:center; border-radius:8px; border:1px solid #e2e8f0; background:#fff; cursor:pointer; transition:all 0.15s; }
    .btn-approve { color:#22c55e; }
    .btn-approve:hover { background:#f0fdf4; border-color:#22c55e; }
    .btn-reject { color:#ef4444; }
    .btn-reject:hover { background:#fef2f2; border-color:#ef4444; }
    .btn-delete { color:#ef4444; }
    .btn-delete:hover { background:#fef2f2; border-color:#ef4444; }
    .pagination { display:flex; gap:12px; align-items:center; justify-content:center; margin-top:16px; font-size:13px; color:#64748b; }
    .pagination button { padding:8px 14px; border-radius:8px; border:1px solid #e2e8f0; background:#fff; cursor:pointer; font-size:13px; }
    .pagination button:disabled { opacity:0.4; cursor:not-allowed; }
    @media (max-width:768px) { .sorteo-table { min-width:1000px; } }

    /* Modal */
    .modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; z-index:1000; padding:16px; }
    .modal { background:#fff; border-radius:16px; width:100%; max-width:420px; box-shadow:0 20px 60px rgba(0,0,0,0.2); }
    .modal-sm { max-width:400px; }
    .modal-header { display:flex; justify-content:space-between; align-items:center; padding:20px 24px 0; }
    .modal-header h2 { font-size:18px; font-weight:700; color:#0f172a; margin:0; }
    .modal-close { background:none; border:none; font-size:18px; color:#94a3b8; cursor:pointer; padding:4px; }
    .modal-body { padding:20px 24px; }
    .modal-body p { margin:0 0 8px; color:#334155; font-size:14px; }
    .modal-footer { display:flex; justify-content:flex-end; gap:10px; padding:0 24px 20px; }
    .btn-cancel { padding:10px 16px; border-radius:8px; border:1px solid #e2e8f0; background:#fff; font-size:13px; cursor:pointer; }
    .btn-danger { padding:10px 20px; border-radius:8px; border:none; background:#ef4444; color:#fff; font-size:13px; font-weight:600; cursor:pointer; }
    .btn-danger:disabled { opacity:0.5; cursor:not-allowed; }
    .warn-text { color:#94a3b8; font-size:13px; margin:8px 0 0; }

    .modal-confirm { max-width:460px; }
    .confirm-info { margin-top:8px; }
    .confirm-row { display:flex; gap:8px; padding:4px 0; font-size:13px; border-bottom:1px solid #f1f5f9; }
    .confirm-label { color:#64748b; font-weight:600; min-width:90px; flex-shrink:0; }
    .confirm-value { color:#0f172a; }
    .mono { font-family:monospace; }
    .btn-confirm { padding:10px 20px; border-radius:8px; border:none; background:#22c55e; color:#fff; font-size:13px; font-weight:600; cursor:pointer; }
    .btn-confirm:hover:not(:disabled) { background:#16a34a; }
    /* Dark mode */
    :host-context(.dark) .sorteo-title { color:#f8fafc; }
    :host-context(.dark) .sorteo-sub { color:#94a3b8; }
    :host-context(.dark) .stat { color:#e2e8f0; background:#1e293b; border:1px solid #334155; }
    :host-context(.dark) .stat-pendiente { background:rgba(245,158,11,0.15); color:#fde68a; border-color:rgba(245,158,11,0.3); }
    :host-context(.dark) .stat-validado { background:rgba(34,197,94,0.15); color:#86efac; border-color:rgba(34,197,94,0.3); }
    :host-context(.dark) .stat-rechazado { background:rgba(239,68,68,0.15); color:#fca5a5; border-color:rgba(239,68,68,0.3); }
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
    :host-context(.dark) .sorteo-table th { background:#0f172a; color:#94a3b8; border-bottom-color:#334155; }
    :host-context(.dark) .sorteo-table td { color:#e2e8f0; border-bottom-color:#1e293b; }
    :host-context(.dark) .sorteo-table td strong { color:#f8fafc; }
    :host-context(.dark) .email-text { color:#94a3b8; }
    :host-context(.dark) .phone-text { color:#cbd5e1; }
    :host-context(.dark) .mono-text { color:#94a3b8; }
    :host-context(.dark) .date-cell { color:#64748b; }
    :host-context(.dark) .badge { background:#334155; color:#e2e8f0; }
    :host-context(.dark) .badge-pendiente { background:rgba(245,158,11,0.2); color:#fde68a; }
    :host-context(.dark) .badge-validado { background:rgba(34,197,94,0.2); color:#86efac; }
    :host-context(.dark) .badge-rechazado { background:rgba(239,68,68,0.2); color:#fca5a5; }
    :host-context(.dark) .btn-action { background:#1e293b; border-color:#334155; }
    :host-context(.dark) .btn-approve:hover { background:rgba(34,197,94,0.15); }
    :host-context(.dark) .btn-reject:hover { background:rgba(239,68,68,0.15); }
    :host-context(.dark) .btn-delete:hover { background:rgba(239,68,68,0.15); }
    :host-context(.dark) .pagination { color:#94a3b8; }
    :host-context(.dark) .pagination button { background:#1e293b; border-color:#334155; color:#e2e8f0; }
    :host-context(.dark) .modal { background:#1e293b; }
    :host-context(.dark) .modal-header h2 { color:#f8fafc; }
    :host-context(.dark) .modal-close { color:#94a3b8; }
    :host-context(.dark) .modal-body p { color:#e2e8f0; }
    :host-context(.dark) .btn-cancel { background:#334155; border-color:#475569; color:#e2e8f0; }
    :host-context(.dark) .confirm-row { border-color:#334155; }
    :host-context(.dark) .confirm-label { color:#94a3b8; }
    :host-context(.dark) .confirm-value { color:#e2e8f0; }
    :host-context(.dark) .btn-confirm { background:#22c55e; }
    :host-context(.dark) .btn-confirm:hover:not(:disabled) { background:#16a34a; }
  `]
})
export class SorteoAvistajeListPageComponent implements OnInit {
  private http = inject(HttpClient);
  rows = signal<SorteoRow[]>([]);
  total = signal(0);
  loading = signal(false);
  search = signal('');
  statusFilter = signal('');
  page = signal(1);
  pageSize = 50;

  deleteModal = signal<SorteoRow | null>(null);
  confirmModal = signal<SorteoRow | null>(null);
  deleting = signal(false);
  confirming = signal(false);

  pendientesCount = signal(0);
  validadosCount = signal(0);
  rechazadosCount = signal(0);

  ngOnInit() {
    this.load();
    this.loadStats();
  }

  load(): void {
    this.loading.set(true);
    let params = new HttpParams()
      .set('page', this.page().toString())
      .set('page_size', this.pageSize.toString());
    if (this.search()) params = params.set('search', this.search());
    if (this.statusFilter()) params = params.set('status', this.statusFilter());

    this.http.get<{ data: SorteoRow[]; total: number }>(`${environment.apiUrl}/sorteo-avistaje`, { params }).subscribe({
      next: (res) => { this.rows.set(res.data || []); this.total.set(res.total || 0); this.loading.set(false); },
      error: () => { this.loading.set(false); }
    });
  }

  loadStats(): void {
    const allParams = new HttpParams().set('page_size', '200');
    this.http.get<{ data: SorteoRow[]; total: number }>(`${environment.apiUrl}/sorteo-avistaje`, { params: allParams }).subscribe({
      next: (res) => {
        const all = res.data || [];
        this.pendientesCount.set(all.filter(r => r.status === 'pendiente_validacion').length);
        this.validadosCount.set(all.filter(r => r.status === 'validado').length);
        this.rechazadosCount.set(all.filter(r => r.status === 'rechazado').length);
      },
      error: () => {}
    });
  }

  changeStatus(row: SorteoRow, newStatus: string): void {
    this.http.patch(`${environment.apiUrl}/sorteo-avistaje/${row.id}/status`, null, {
      params: { status: newStatus }
    }).subscribe({
      next: () => { this.load(); this.loadStats(); },
      error: (err) => alert(err.error?.detail || 'Error al cambiar estado')
    });
  }

  confirmApprove(): void {
    const row = this.confirmModal();
    if (!row) return;
    this.confirming.set(true);
    this.http.patch(`${environment.apiUrl}/sorteo-avistaje/${row.id}/status`, null, {
      params: { status: 'validado' }
    }).subscribe({
      next: () => {
        this.confirming.set(false);
        this.confirmModal.set(null);
        this.load();
        this.loadStats();
      },
      error: (err) => {
        this.confirming.set(false);
        alert(err.error?.detail || 'Error al confirmar el depósito');
      }
    });
  }

  confirmDelete(row: SorteoRow): void {
    this.deleteModal.set(row);
  }

  executeDelete(): void {
    const row = this.deleteModal();
    if (!row) return;
    this.deleting.set(true);
    this.http.delete(`${environment.apiUrl}/sorteo-avistaje/${row.id}`).subscribe({
      next: () => { this.deleteModal.set(null); this.deleting.set(false); this.load(); this.loadStats(); },
      error: (err) => { this.deleting.set(false); alert(err.error?.detail || 'Error al eliminar'); }
    });
  }

  statusLabel(v: string): string {
    const m: Record<string, string> = { pendiente_validacion: 'Pendiente', validado: 'Validado', rechazado: 'Rechazado' };
    return m[v] || v;
  }

  exportCSV(): void {
    const headers = ['Nombre', 'Email', 'WhatsApp', 'Ciudad', 'Provincia', 'Nro. Comprobante', 'Estado', 'Fecha'];
    const lines = [headers.join(',')];
    for (const r of this.rows()) {
      lines.push([
        '"' + r.full_name.replace(/"/g, '""') + '"',
        '"' + r.email.replace(/"/g, '""') + '"',
        '"' + r.whatsapp.replace(/"/g, '""') + '"',
        '"' + r.city.replace(/"/g, '""') + '"',
        '"' + (r.province || '').replace(/"/g, '""') + '"',
        '"' + (r.comprobante_numero || '').replace(/"/g, '""') + '"',
        '"' + this.statusLabel(r.status) + '"',
        r.created_at
      ].join(','));
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'sorteo-avistaje.csv'; a.click(); URL.revokeObjectURL(url);
  }
}
