import { Component, OnInit, signal, computed, inject, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessagesService, Message } from '../../core/services/messages.service';

interface Notification {
  id: string;
  type: 'info' | 'email' | 'alert';
  title: string;
  message: string;
  time: string;
  dismissed: boolean;
}

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
          <button class="refresh-btn" (click)="loadMessages()" [class.spinning]="refreshing()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
          </button>
          <span class="last-update">Actualizado: {{ lastUpdate() }}</span>
        </div>
      </div>

      @if (emailNotifications().length > 0) {
        <div class="notification-bar email-notification">
          <div class="notif-content">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1e40af" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
            <div class="notif-text">
              <strong>{{ emailNotifications().length }} nuevo{{ emailNotifications().length > 1 ? 's' : '' }} por correo</strong>
              <span>{{ getEmailNotifSummary() }}</span>
            </div>
          </div>
          <button class="notif-dismiss" (click)="dismissEmailNotifs()">✕</button>
        </div>
      }

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
        <div class="stat-card">
          <div class="stat-icon-wrap stat-icon-email">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          </div>
          <div class="stat-info">
            <span class="stat-value val-blue">{{ emailCount() }}</span>
            <span class="stat-label">Por email</span>
          </div>
        </div>
      </div>

      @if (refreshing()) {
        <div class="refresh-bar">
          <div class="refresh-spinner"></div>
          <span>Actualizando...</span>
        </div>
      }

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
                  [class.email-source]="msg.source === 'email'"
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
  styles: [
    `
    :host { display: block; }
    .page-container { max-width: 960px; margin: 0 auto; padding: 1.5rem 2rem; }
    .page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 1.5rem; }
    .header-left { display: flex; align-items: center; gap: 1rem; }
    .header-icon { width: 44px; height: 44px; border-radius: 0.75rem; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #1e3a8a, #3b82f6); color: #fff; flex-shrink: 0; box-shadow: 0 2px 8px rgba(30, 58, 138, 0.2); }
    .page-title { font-size: 1.5rem; font-weight: 700; color: #0f172a; margin: 0; }
    .page-subtitle { font-size: 0.85rem; color: #64748b; margin: 2px 0 0; }
    .header-right { display: flex; align-items: center; gap: 10px; }
    .unread-badge { background: #ef4444; color: #fff; padding: 4px 14px; border-radius: 999px; font-size: 0.78rem; font-weight: 600; letter-spacing: 0.02em; box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3); animation: pulse-badge 2s infinite; }
    @keyframes pulse-badge { 0%, 100% { box-shadow: 0 2px 8px rgba(239,68,68,0.3); } 50% { box-shadow: 0 2px 16px rgba(239,68,68,0.5); } }
    .last-update { font-size: 0.75rem; color: #94a3b8; }
    .refresh-btn { background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 10px; cursor: pointer; color: #475569; display: flex; align-items: center; transition: all 0.15s; }
    .refresh-btn:hover { background: #e2e8f0; }
    .refresh-btn.spinning svg { animation: spin 0.6s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1.5rem; }
    .stat-card { display: flex; align-items: center; gap: 12px; padding: 16px 20px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; cursor: pointer; transition: all 0.15s; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
    .stat-card:hover { border-color: #cbd5e1; box-shadow: 0 4px 12px rgba(0,0,0,0.06); transform: translateY(-1px); }
    .stat-icon-wrap { width: 42px; height: 42px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .stat-icon-total { background: rgba(96,165,250,0.12); color: #60a5fa; }
    .stat-icon-unread { background: rgba(239,68,68,0.12); color: #ef4444; }
    .stat-icon-email { background: rgba(168,85,247,0.12); color: #a855f7; }
    .stat-info { display: flex; flex-direction: column; }
    .stat-value { font-size: 1.3rem; font-weight: 700; color: #0f172a; }
    .stat-value.val-danger { color: #ef4444; }
    .stat-value.val-blue { color: #6366f1; }
    .stat-label { font-size: 0.75rem; color: #64748b; margin-top: 1px; }
    .notification-bar { display: flex; align-items: center; justify-content: space-between; padding: 12px 20px; border-radius: 10px; margin-bottom: 1rem; animation: slideIn 0.3s ease-out; }
    .notification-bar.email-notification { background: #eff6ff; border: 1px solid #bfdbfe; }
    .notif-content { display: flex; align-items: center; gap: 10px; }
    .notif-text { display: flex; flex-direction: column; }
    .notif-text strong { font-size: 0.85rem; color: #1e3a8a; }
    .notif-text span { font-size: 0.75rem; color: #64748b; }
    .notif-dismiss { background: none; border: none; color: #94a3b8; cursor: pointer; font-size: 1rem; padding: 4px 8px; border-radius: 4px; transition: background 0.15s; }
    .notif-dismiss:hover { background: rgba(0,0,0,0.05); }
    @keyframes slideIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
    .refresh-bar { display: flex; align-items: center; gap: 10px; padding: 8px 16px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; margin-bottom: 1rem; font-size: 0.8rem; color: #2563eb; font-weight: 500; }
    .refresh-spinner { width: 16px; height: 16px; border: 2px solid #bfdbfe; border-top-color: #3b82f6; border-radius: 50%; animation: spin 0.6s linear infinite; }
    .main-card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.04); }
    .card-body { padding: 0; }
    .loading-state, .empty-state { padding: 3rem; text-align: center; }
    .spinner { width: 32px; height: 32px; border: 3px solid #e2e8f0; border-top-color: #3b82f6; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 12px; }
    .loading-text { font-size: 0.85rem; color: #64748b; margin: 0; }
    .empty-icon { color: #cbd5e1; margin-bottom: 12px; }
    .empty-title { font-size: 1rem; font-weight: 600; color: #0f172a; margin: 0 0 4px; }
    .empty-desc { font-size: 0.85rem; color: #64748b; margin: 0 0 16px; }
    .empty-clear-btn { background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; padding: 8px 16px; border-radius: 8px; font-size: 0.8rem; font-weight: 600; cursor: pointer; transition: all 0.15s; }
    .empty-clear-btn:hover { background: #e2e8f0; }
    .messages-list { display: flex; flex-direction: column; }
    .message-row { border-bottom: 1px solid #f1f5f9; cursor: pointer; transition: background 0.15s; }
    .message-row:last-child { border-bottom: none; }
    .message-row:hover { background: #f8fafc; }
    .message-row.unread { background: #eff6ff; border-left: 3px solid #3b82f6; }
    .message-row.unread:hover { background: #dbeafe; }
    .message-row.expanded { background: #f8fafc; }
    .message-row.email-source { border-left-color: #a855f7; }
    .message-row.email-source.unread { background: #faf5ff; }
    .message-summary { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; gap: 16px; }
    .message-left { display: flex; align-items: center; gap: 12px; min-width: 0; flex: 1; }
    .message-avatar { width: 42px; height: 42px; border-radius: 50%; background: #e2e8f0; color: #475569; display: flex; align-items: center; justify-content: center; font-size: 0.78rem; font-weight: 700; flex-shrink: 0; }
    .message-avatar.avatar-unread { background: #3b82f6; color: #fff; }
    .message-info { min-width: 0; flex: 1; }
    .message-name-row { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
    .message-name { font-size: 0.95rem; font-weight: 600; color: #0f172a; }
    .unread-dot { width: 8px; height: 8px; border-radius: 50%; background: #3b82f6; flex-shrink: 0; animation: pulse-dot 1.5s infinite; }
    @keyframes pulse-dot { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
    .message-subject { font-size: 0.85rem; font-weight: 600; color: #334155; margin-top: 3px; }
    .message-preview { font-size: 0.8rem; color: #64748b; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .message-right { flex-shrink: 0; }
    .message-date { font-size: 0.75rem; color: #94a3b8; white-space: nowrap; }
    .message-detail { padding: 0 20px 16px; border-top: 1px solid #e2e8f0; }
    .detail-fields { display: flex; flex-wrap: wrap; gap: 8px 24px; padding: 16px 0; }
    .detail-row { display: flex; align-items: center; gap: 8px; min-width: 200px; }
    .detail-label { font-size: 0.7rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; width: 70px; flex-shrink: 0; }
    .detail-value { font-size: 0.88rem; color: #1e293b; word-break: break-all; }
    .detail-link { color: #2563eb; text-decoration: none; font-weight: 500; }
    .detail-link:hover { text-decoration: underline; }
    .detail-id { font-family: 'Courier New', monospace; font-size: 0.75rem; color: #64748b; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; }
    .detail-message { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px 20px; margin: 8px 0; }
    .detail-message-label { font-size: 0.7rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; }
    .detail-message-text { font-size: 0.88rem; color: #1e293b; line-height: 1.7; white-space: pre-wrap; }
    .detail-actions { display: flex; gap: 8px; margin-top: 16px; flex-wrap: wrap; }
    .action-btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 8px; font-size: 0.8rem; font-weight: 600; cursor: pointer; border: none; text-decoration: none; transition: all 0.15s; }
    .btn-reply { background: #2563eb; color: #fff; }
    .btn-reply:hover { background: #1d4ed8; transform: translateY(-1px); }
    .btn-read { background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; }
    .btn-read:hover { background: #dcfce7; }
    .btn-delete { background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; }
    .btn-delete:hover { background: #fee2e2; }
    .source-badge { font-size: 0.62rem; font-weight: 700; padding: 2px 8px; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.04em; }
    .email-badge { background: #f3e8ff; color: #7c3aed; border: 1px solid #e9d5ff; }
    `,
  ],
})
export class MensajesListPageComponent implements OnInit, AfterViewInit, OnDestroy {
  private messagesService = inject(MessagesService);

  messages = signal<Message[]>([]);
  loading = signal(true);
  refreshing = signal(false);
  error = signal<string | null>(null);
  expandedId = signal<string | null>(null);
  filterUnread = signal(false);
  totalMessages = signal(0);
  unreadCount = signal(0);
  emailNotifications = signal<Notification[]>([]);
  private pollInterval: number | null = null;
  private previousUnread = 0;

  lastUpdate = computed(() => {
    const now = new Date();
    return now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  });

  emailCount = computed(() => this.messages().filter(m => m.source === 'email').length);

  ngOnInit(): void {
    this.loadMessages();
    this.startPolling();
    this.previousUnread = this.unreadCount();
  }

  ngAfterViewInit(): void {
    this.checkForNewEmails();
  }

  ngOnDestroy(): void {
    if (this.pollInterval !== null) {
      clearInterval(this.pollInterval);
    }
  }

  startPolling(): void {
    this.pollInterval = window.setInterval(() => {
      this.loadMessages();
    }, 30000);
  }

  loadMessages(): void {
    this.loading.set(true);
    this.error.set(null);
    this.refreshing.set(true);
    this.messagesService.getMessages({ page_size: 50, unread_only: this.filterUnread() }).subscribe({
      next: (res) => {
        this.messages.set(res.data);
        this.totalMessages.set(res.total);
        this.unreadCount.set(res.unread);
        this.loading.set(false);
        this.refreshing.set(false);
        this.checkForNewEmails();
      },
      error: () => {
        this.loading.set(false);
        this.refreshing.set(false);
        this.error.set("Error al cargar los mensajes.");
      },
    });
  }

  checkForNewEmails(): void {
    if (this.previousUnread > 0 && this.unreadCount() > this.previousUnread) {
      const diff = this.unreadCount() - this.previousUnread;
      const emailNotifs = this.messages().filter(m => m.source === 'email' && !m.is_read);
      if (emailNotifs.length > 0) {
        this.emailNotifications.update(current => {
          const existing = current.filter(n => {
            const msg = emailNotifs.find(e => e.subject === n.title);
            return !msg;
          });
          const newNotifs = emailNotifs.slice(0, 3).map(m => ({
            id: m.id,
            type: 'email' as const,
            title: m.subject,
            message: m.message.slice(0, 60),
            time: this.formatDate(m.created_at),
            dismissed: false,
          }));
          return [...existing, ...newNotifs];
        });
      }
    }
    this.previousUnread = this.unreadCount();
  }

  getEmailNotifSummary(): string {
    const count = this.emailNotifications().length;
    if (count === 0) return '';
    return `${count} mensaje${count > 1 ? 's' : ''} por correo recibido${count > 1 ? 's' : ''}`;
  }

  dismissEmailNotifs(): void {
    this.emailNotifications.set([]);
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
          list.map(m => (m.id === id ? { ...m, is_read: true } : m))
        );
        this.unreadCount.update(c => Math.max(0, c - 1));
      },
    });
  }

  deleteMessage(id: string): void {
    this.messagesService.deleteMessage(id).subscribe({
      next: () => {
        this.messages.update(list => list.filter(m => m.id !== id));
        this.totalMessages.update(c => Math.max(0, c - 1));
        this.expandedId.set(null);
      },
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
        day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  }
}