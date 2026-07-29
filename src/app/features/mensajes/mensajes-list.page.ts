import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessagesService, Message } from '../../core/services/messages.service';

@Component({
  selector: 'app-mensajes-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div class="header-left">
          <div class="header-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
            </svg>
          </div>
          <div>
            <h1 class="page-title">Mensajes</h1>
            <p class="page-subtitle">Bandeja de entrada de contactos</p>
          </div>
        </div>
        <div class="header-right">
          @if (unreadCount() > 0) {
            <span class="unread-badge">{{ unreadCount() }} sin leer</span>
          }
          <span class="last-update">Actualizado: {{ lastUpdate() }}</span>
        </div>
      </div>

      <div class="stats-row">
        <div class="stat-card" (click)="filterUnread.set(false)">
          <div class="stat-icon-wrap stat-icon-total">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ totalMessages() }}</span>
            <span class="stat-label">Total</span>
          </div>
        </div>
        <div class="stat-card" (click)="filterUnread.set(true)">
          <div class="stat-icon-wrap stat-icon-unread">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <div class="stat-info">
            <span class="stat-value val-danger">{{ unreadCount() }}</span>
            <span class="stat-label">Sin leer</span>
          </div>
        </div>
      </div>

      <div class="main-card">
        <div class="card-body">
          @if (loading()) {
            <div class="loading-state">
              <div class="spinner"></div>
              <p class="loading-text">Cargando mensajes...</p>
            </div>
          } @else if (messages().length === 0) {
            <div class="empty-state">
              <div class="empty-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
              </div>
              <h3 class="empty-title">{{ filterUnread() ? 'No hay mensajes sin leer' : 'No hay mensajes' }}</h3>
              <p class="empty-desc">{{ filterUnread() ? 'Todos los mensajes fueron leídos.' : 'Aún no se han recibido mensajes de contacto.' }}</p>
              @if (filterUnread()) {
                <button class="empty-clear-btn" (click)="filterUnread.set(false)">Ver todos</button>
              }
            </div>
          } @else {
            <div class="messages-list">
              @for (msg of messages(); track msg.id) {
                <div
                  class="message-row"
                  [class.unread]="!msg.is_read"
                  [class.expanded]="expandedId() === msg.id"
                  (click)="toggleDetail(msg)"
                >
                  <div class="message-summary">
                    <div class="message-left">
                      <div class="message-avatar" [class.avatar-unread]="!msg.is_read">
                        {{ getInitials(msg.name) }}
                      </div>
                      <div class="message-info">
                        <div class="message-name-row">
                          <span class="message-name">{{ msg.name }}</span>
                          @if (!msg.is_read) {
                            <span class="unread-dot"></span>
                          }
                          @if (msg.source === 'email') {
                            <span class="source-badge email-badge">Email</span>
                          }
                        </div>
                        <div class="message-subject">{{ msg.subject }}</div>
                        <div class="message-preview">{{ msg.message | slice:0:80 }}{{ msg.message.length > 80 ? '...' : '' }}</div>
                      </div>
                    </div>
                    <div class="message-right">
                      <span class="message-date">{{ formatDate(msg.created_at) }}</span>
                    </div>
                  </div>

                  @if (expandedId() === msg.id) {
                    <div class="message-detail" (click)="$event.stopPropagation()">
                      <div class="detail-fields">
                        <div class="detail-row">
                          <span class="detail-label">Email</span>
                          <a class="detail-value detail-link" [href]="'mailto:' + msg.email">{{ msg.email }}</a>
                        </div>
                        @if (msg.phone) {
                          <div class="detail-row">
                            <span class="detail-label">Teléfono</span>
                            <a class="detail-value detail-link" [href]="'tel:' + msg.phone">{{ msg.phone }}</a>
                          </div>
                        }
                        <div class="detail-row">
                          <span class="detail-label">Fecha</span>
                          <span class="detail-value">{{ formatFullDate(msg.created_at) }}</span>
                        </div>
                        @if (msg.inscription_id) {
                          <div class="detail-row">
                            <span class="detail-label">Inscripción</span>
                            <span class="detail-value detail-id">{{ msg.inscription_id }}</span>
                          </div>
                        }
                      </div>
                        <div class="detail-message">
                          <div class="detail-message-label">Mensaje</div>
                          <div class="detail-message-text">{{ msg.message }}</div>
                        </div>
                        @if (msg.source) {
                          <div class="detail-row">
                            <span class="detail-label">Origen</span>
                            <span class="detail-value">{{ msg.source === 'email' ? 'Correo electrónico' : 'Formulario web' }}</span>
                          </div>
                        }
                      <div class="detail-actions">
                        <a class="action-btn btn-reply" [href]="'mailto:' + msg.email + '?subject=Re: ' + msg.subject">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/></svg>
                          Responder
                        </a>
                        @if (!msg.is_read) {
                          <button class="action-btn btn-read" (click)="markAsRead(msg.id)">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
                            Marcar leído
                          </button>
                        }
                        <button class="action-btn btn-delete" (click)="deleteMessage(msg.id)">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                          Eliminar
                        </button>
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
    :host { display: block; }
    .page-container { max-width: 900px; margin: 0 auto; padding: 1.5rem 2rem; }
    .page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 1.75rem; }
    .header-left { display: flex; align-items: center; gap: 1rem; }
    .header-icon { width: 44px; height: 44px; border-radius: 0.75rem; display: flex; align-items: center; justify-content: center; background: rgba(96, 165, 250, 0.12); color: #60a5fa; flex-shrink: 0; }
    .page-title { font-size: 1.5rem; font-weight: 700; color: #0f172a; margin: 0; }
    .page-subtitle { font-size: 0.85rem; color: #64748b; margin: 2px 0 0; }
    .header-right { display: flex; align-items: center; gap: 12px; }
    .unread-badge { background: #ef4444; color: #fff; padding: 4px 12px; border-radius: 999px; font-size: 0.75rem; font-weight: 600; }
    .last-update { font-size: 0.75rem; color: #94a3b8; }
    .stats-row { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: 1.5rem; }
    .stat-card { display: flex; align-items: center; gap: 12px; padding: 16px 20px; background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; cursor: pointer; transition: all 0.15s; }
    .stat-card:hover { border-color: #cbd5e1; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
    .stat-icon-wrap { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .stat-icon-total { background: rgba(96,165,250,0.12); color: #60a5fa; }
    .stat-icon-unread { background: rgba(239,68,68,0.12); color: #ef4444; }
    .stat-info { display: flex; flex-direction: column; }
    .stat-value { font-size: 1.25rem; font-weight: 700; color: #0f172a; }
    .stat-value.val-danger { color: #ef4444; }
    .stat-label { font-size: 0.75rem; color: #64748b; }
    .main-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; }
    .card-body { padding: 0; }
    .loading-state, .empty-state { padding: 3rem; text-align: center; }
    .spinner { width: 32px; height: 32px; border: 3px solid #e2e8f0; border-top-color: #3b82f6; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 12px; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .loading-text { font-size: 0.85rem; color: #64748b; margin: 0; }
    .empty-icon { color: #cbd5e1; margin-bottom: 12px; }
    .empty-title { font-size: 1rem; font-weight: 600; color: #0f172a; margin: 0 0 4px; }
    .empty-desc { font-size: 0.85rem; color: #64748b; margin: 0 0 16px; }
    .empty-clear-btn { background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; padding: 8px 16px; border-radius: 8px; font-size: 0.8rem; font-weight: 600; cursor: pointer; }
    .messages-list { display: flex; flex-direction: column; }
    .message-row { border-bottom: 1px solid #f1f5f9; cursor: pointer; transition: background 0.1s; }
    .message-row:last-child { border-bottom: none; }
    .message-row:hover { background: #f8fafc; }
    .message-row.unread { background: #eff6ff; }
    .message-row.unread:hover { background: #dbeafe; }
    .message-row.expanded { background: #f8fafc; }
    .message-summary { display: flex; align-items: center; justify-content: space-between; padding: 14px 20px; gap: 16px; }
    .message-left { display: flex; align-items: center; gap: 12px; min-width: 0; flex: 1; }
    .message-avatar { width: 40px; height: 40px; border-radius: 50%; background: #e2e8f0; color: #475569; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700; flex-shrink: 0; }
    .message-avatar.avatar-unread { background: #3b82f6; color: #fff; }
    .message-info { min-width: 0; flex: 1; }
    .message-name-row { display: flex; align-items: center; gap: 6px; }
    .message-name { font-size: 0.9rem; font-weight: 600; color: #0f172a; }
    .unread-dot { width: 8px; height: 8px; border-radius: 50%; background: #3b82f6; flex-shrink: 0; }
    .message-subject { font-size: 0.8rem; font-weight: 600; color: #334155; margin-top: 2px; }
    .message-preview { font-size: 0.8rem; color: #64748b; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .message-right { flex-shrink: 0; }
    .message-date { font-size: 0.75rem; color: #94a3b8; white-space: nowrap; }
    .message-detail { padding: 0 20px 16px; border-top: 1px solid #e2e8f0; }
    .detail-fields { display: flex; flex-direction: column; gap: 8px; padding: 12px 0; }
    .detail-row { display: flex; align-items: center; gap: 8px; }
    .detail-label { font-size: 0.7rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; width: 80px; flex-shrink: 0; }
    .detail-value { font-size: 0.85rem; color: #0f172a; }
    .detail-link { color: #2563eb; text-decoration: none; }
    .detail-link:hover { text-decoration: underline; }
    .detail-id { font-family: 'Courier New', monospace; font-size: 0.75rem; color: #64748b; }
    .detail-message { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px; margin: 8px 0; }
    .detail-message-label { font-size: 0.7rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px; }
    .detail-message-text { font-size: 0.85rem; color: #1e293b; line-height: 1.6; white-space: pre-wrap; }
    .detail-actions { display: flex; gap: 8px; margin-top: 12px; flex-wrap: wrap; }
    .action-btn { display: inline-flex; align-items: center; gap: 6px; padding: 7px 14px; border-radius: 8px; font-size: 0.8rem; font-weight: 600; cursor: pointer; border: none; text-decoration: none; transition: all 0.15s; }
    .btn-reply { background: #2563eb; color: #fff; }
    .btn-reply:hover { background: #1d4ed8; }
    .btn-read { background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; }
    .btn-read:hover { background: #dcfce7; }
    .btn-delete { background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; }
    .btn-delete:hover { background: #fee2e2; }
    .source-badge { font-size: 0.65rem; font-weight: 600; padding: 2px 6px; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.03em; }
    .email-badge { background: #dbeafe; color: #1e40af; }
  `]
})
export class MensajesListPageComponent implements OnInit {
  private messagesService = inject(MessagesService);

  messages = signal<Message[]>([]);
  loading = signal(true);
  expandedId = signal<string | null>(null);
  filterUnread = signal(false);
  totalMessages = signal(0);
  unreadCount = signal(0);

  lastUpdate = computed(() => {
    const now = new Date();
    return now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  });

  ngOnInit(): void {
    this.loadMessages();
  }

  loadMessages(): void {
    this.loading.set(true);
    this.messagesService.getMessages({ page_size: 50, unread_only: this.filterUnread() }).subscribe({
      next: (res) => {
        this.messages.set(res.data);
        this.totalMessages.set(res.total);
        this.unreadCount.set(res.unread);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  toggleDetail(msg: Message): void {
    if (this.expandedId() === msg.id) {
      this.expandedId.set(null);
    } else {
      this.expandedId.set(msg.id);
      if (!msg.is_read) {
        this.markAsRead(msg.id);
      }
    }
  }

  markAsRead(id: string): void {
    this.messagesService.markAsRead(id).subscribe({
      next: () => {
        this.messages.update(list =>
          list.map(m => m.id === id ? { ...m, is_read: true } : m)
        );
        this.unreadCount.update(c => Math.max(0, c - 1));
      }
    });
  }

  deleteMessage(id: string): void {
    this.messagesService.deleteMessage(id).subscribe({
      next: () => {
        this.messages.update(list => list.filter(m => m.id !== id));
        this.totalMessages.update(c => Math.max(0, c - 1));
        this.expandedId.set(null);
      }
    });
  }

  getInitials(name: string): string {
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  }

  formatDate(dateStr: string): string {
    try {
      const d = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - d.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'Ahora';
      if (diffMins < 60) return `Hace ${diffMins}m`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `Hace ${diffHours}h`;
      return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
    } catch {
      return dateStr;
    }
  }

  formatFullDate(dateStr: string): string {
    try {
      return new Date(dateStr).toLocaleDateString('es-AR', {
        day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  }
}
