import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

interface InviteResult {
  id: string;
  email: string;
  temp_password: string;
  message: string;
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">Administración</h1>
          <p class="page-subtitle">Gestionar usuarios, permisos y configuración del sistema</p>
        </div>
        <button class="btn btn-primary" (click)="showInviteModal.set(true)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
            <line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/>
          </svg>
          Invitar Usuario
        </button>
      </div>

      <div class="tabs">
        @for (tab of tabs; track tab.key) {
          <button
            class="tab"
            [class.active]="activeTab() === tab.key"
            (click)="activeTab.set(tab.key); loadUsers()"
          >
            {{ tab.label }}
            <span class="tab-count">{{ getCountForRole(tab.key) }}</span>
          </button>
        }
      </div>

      <div class="card">
        <div class="card-body">
          @if (loading()) {
            <div class="loading-state">
              <div class="spinner-lg"></div>
              <p>Cargando usuarios...</p>
            </div>
          } @else if (users().length === 0) {
            <div class="empty-state">
              <div class="empty-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                  <line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/>
                </svg>
              </div>
              <h3 class="empty-title">No hay usuarios</h3>
              <p class="empty-desc">Invitá profesionales para que formen parte del jurado o staff del festival.</p>
            </div>
          } @else {
            <div class="table-wrapper">
              <table class="table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Rol</th>
                    <th>Estado</th>
                    <th>Creado</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  @for (user of users(); track user.id) {
                    <tr>
                      <td>
                        <div class="user-cell">
                          <div class="avatar-sm" [attr.data-role]="user.role">
                            {{ getInitials(user.full_name) }}
                          </div>
                          <span class="user-name">{{ user.full_name }}</span>
                        </div>
                      </td>
                      <td><span class="text-muted">{{ user.email }}</span></td>
                      <td>
                        <span class="role-badge" [attr.data-role]="user.role">{{ getRoleLabel(user.role) }}</span>
                      </td>
                      <td>
                        <span class="status-dot" [class.active]="user.is_active"></span>
                        {{ user.is_active ? 'Activo' : 'Inactivo' }}
                      </td>
                      <td><span class="text-muted">{{ formatDate(user.created_at) }}</span></td>
                      <td>
                        <div class="actions-cell">
                          <button class="btn-icon" title="Editar rol" (click)="editUser(user)">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                            </svg>
                          </button>
                          <button class="btn-icon btn-danger" title="Desactivar" (click)="deactivateUser(user)" [disabled]="user.id === currentUserId()">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                              <line x1="17" x2="22" y1="11" y2="16"/>
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>
      </div>

      @if (showInviteModal()) {
        <div class="modal-overlay" (click)="showInviteModal.set(false)">
          <div class="modal" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h2>Invitar Usuario</h2>
              <button class="btn-close" (click)="showInviteModal.set(false)">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
                </svg>
              </button>
            </div>
            <div class="modal-body">
              @if (!inviteResult()) {
                <div class="form-group">
                  <label class="form-label">Nombre completo *</label>
                  <input type="text" class="form-input" [(ngModel)]="inviteForm.full_name" placeholder="Ej: María García" />
                </div>
                <div class="form-group">
                  <label class="form-label">Email *</label>
                  <input type="email" class="form-input" [(ngModel)]="inviteForm.email" placeholder="maria&#64;ejemplo.com" />
                </div>
                <div class="form-group">
                  <label class="form-label">Rol *</label>
                  <div class="role-options">
                    @for (role of roleOptions; track role.value) {
                      <label class="role-option" [class.selected]="inviteForm.role === role.value">
                        <input type="radio" name="role" [value]="role.value" [(ngModel)]="inviteForm.role" />
                        <span class="role-icon" [innerHTML]="role.icon"></span>
                        <div>
                          <span class="role-name">{{ role.label }}</span>
                          <span class="role-desc">{{ role.desc }}</span>
                        </div>
                      </label>
                    }
                  </div>
                </div>
                @if (inviteError()) {
                  <div class="alert alert-error">{{ inviteError() }}</div>
                }
              } @else {
                <div class="invite-success">
                  <div class="success-icon-lg">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/>
                    </svg>
                  </div>
                  <h3>Invitación Enviada</h3>
                  <p>Se creó la cuenta para <strong>{{ inviteResult()!.email }}</strong></p>
                  <div class="temp-credentials">
                    <span class="cred-label">Contraseña temporal:</span>
                    <code class="cred-value">{{ inviteResult()!.temp_password }}</code>
                  </div>
                  <p class="cred-note">Compartí esta contraseña con el usuario. Se le pedirá cambiarla al iniciar sesión.</p>
                </div>
              }
            </div>
            <div class="modal-footer">
              @if (!inviteResult()) {
                <button class="btn btn-secondary" (click)="showInviteModal.set(false)">Cancelar</button>
                <button class="btn btn-primary" (click)="sendInvite()" [disabled]="!inviteForm.email || !inviteForm.full_name || inviting()">
                  @if (inviting()) {
                    <span class="spinner"></span> Enviando...
                  } @else {
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <line x1="22" x2="11" y1="2" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                    </svg>
                    Enviar Invitación
                  }
                </button>
              } @else {
                <button class="btn btn-primary" (click)="closeInviteModal()">Cerrar</button>
              }
            </div>
          </div>
        </div>
      }

      @if (editingUser()) {
        <div class="modal-overlay" (click)="editingUser.set(null)">
          <div class="modal modal-sm" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h2>Editar Usuario</h2>
              <button class="btn-close" (click)="editingUser.set(null)">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
                </svg>
              </button>
            </div>
            <div class="modal-body">
              <div class="edit-user-info">
                <strong>{{ editingUser()!.full_name }}</strong>
                <span class="text-muted">{{ editingUser()!.email }}</span>
              </div>
              <div class="form-group">
                <label class="form-label">Rol</label>
                <select class="form-select" [(ngModel)]="editRole">
                  <option value="jurado">Jurado</option>
                  <option value="organizador">Organizador</option>
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" (click)="editingUser.set(null)">Cancelar</button>
              <button class="btn btn-primary" (click)="saveUser()">Guardar</button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-container { max-width: 960px; }

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

    .tabs {
      display: flex;
      gap: var(--space-1);
      margin-bottom: var(--space-6);
      border-bottom: 2px solid var(--gray-100);
      padding-bottom: 0;
    }

    .tab {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      padding: var(--space-3) var(--space-4);
      font-size: var(--text-sm);
      font-weight: var(--weight-medium);
      color: var(--gray-500);
      background: none;
      border: none;
      border-bottom: 2px solid transparent;
      margin-bottom: -2px;
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .tab:hover { color: var(--gray-700); }

    .tab.active {
      color: var(--brand-600);
      border-bottom-color: var(--brand-600);
    }

    .tab-count {
      font-size: 11px;
      padding: 1px 6px;
      background: var(--gray-100);
      border-radius: var(--radius-full);
      color: var(--gray-500);
    }

    .tab.active .tab-count {
      background: var(--brand-50);
      color: var(--brand-600);
    }

    .card {
      background: #fff;
      border-radius: var(--radius-xl);
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
      border: 1px solid var(--gray-200);
      overflow: hidden;
    }

    .card-body {
      padding: 0;
    }

    .table-wrapper {
      overflow-x: auto;
    }

    .table {
      width: 100%;
      border-collapse: collapse;
    }

    .table th {
      text-align: left;
      padding: var(--space-3) var(--space-4);
      font-size: var(--text-xs);
      font-weight: var(--weight-semibold);
      color: var(--gray-500);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      background: var(--gray-50);
      border-bottom: 1px solid var(--gray-200);
    }

    .table td {
      padding: var(--space-3) var(--space-4);
      font-size: var(--text-sm);
      color: var(--gray-700);
      border-bottom: 1px solid var(--gray-100);
    }

    .table tr:last-child td {
      border-bottom: none;
    }

    .table tr:hover td {
      background: var(--gray-50);
    }

    .user-cell {
      display: flex;
      align-items: center;
      gap: var(--space-3);
    }

    .avatar-sm {
      width: 32px;
      height: 32px;
      border-radius: var(--radius-full);
      background: var(--gray-200);
      color: var(--gray-600);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: var(--weight-bold);
      flex-shrink: 0;
    }

    .avatar-sm[data-role="admin"] { background: var(--danger-100); color: var(--danger-600); }
    .avatar-sm[data-role="organizador"] { background: var(--brand-100); color: var(--brand-600); }
    .avatar-sm[data-role="jurado"] { background: var(--warning-100); color: var(--warning-600); }
    .avatar-sm[data-role="staff"] { background: var(--success-100); color: var(--success-600); }

    .user-name {
      font-weight: var(--weight-medium);
      color: var(--gray-900);
    }

    .text-muted {
      color: var(--gray-500);
      font-size: var(--text-xs);
    }

    .role-badge {
      display: inline-block;
      padding: 2px 10px;
      border-radius: var(--radius-full);
      font-size: var(--text-xs);
      font-weight: var(--weight-semibold);
      text-transform: capitalize;
    }

    .role-badge[data-role="admin"] { background: var(--danger-50); color: var(--danger-600); }
    .role-badge[data-role="organizador"] { background: var(--brand-50); color: var(--brand-600); }
    .role-badge[data-role="jurado"] { background: var(--warning-50); color: var(--warning-600); }
    .role-badge[data-role="staff"] { background: var(--success-50); color: var(--success-600); }

    .status-dot {
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--gray-300);
      margin-right: var(--space-1);
    }

    .status-dot.active {
      background: var(--success-500);
    }

    .actions-cell {
      display: flex;
      gap: var(--space-1);
    }

    .btn-icon {
      width: 32px;
      height: 32px;
      border-radius: var(--radius-md);
      border: none;
      background: none;
      color: var(--gray-500);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all var(--transition-fast);
    }

    .btn-icon:hover {
      background: var(--gray-100);
      color: var(--gray-700);
    }

    .btn-icon.btn-danger:hover {
      background: var(--danger-50);
      color: var(--danger-600);
    }

    .btn-icon:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    .empty-state {
      text-align: center;
      padding: var(--space-16) var(--space-6);
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
      text-align: center;
      padding: var(--space-16) var(--space-6);
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

    @keyframes spin { to { transform: rotate(360deg); } }

    /* Modal */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: var(--space-4);
    }

    .modal {
      background: #fff;
      border-radius: var(--radius-xl);
      box-shadow: 0 20px 60px rgba(0,0,0,0.2);
      width: 100%;
      max-width: 520px;
      max-height: 90vh;
      overflow-y: auto;
    }

    .modal-sm { max-width: 400px; }

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--space-5) var(--space-6);
      border-bottom: 1px solid var(--gray-100);
    }

    .modal-header h2 {
      font-size: 1.125rem;
      font-weight: var(--weight-semibold);
      color: var(--gray-900);
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

    .btn-close:hover {
      background: var(--gray-100);
      color: var(--gray-600);
    }

    .modal-body {
      padding: var(--space-6);
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: var(--space-3);
      padding: var(--space-4) var(--space-6);
      border-top: 1px solid var(--gray-100);
    }

    .form-group {
      margin-bottom: var(--space-5);
    }

    .form-label {
      display: block;
      font-size: var(--text-sm);
      font-weight: var(--weight-medium);
      color: var(--gray-700);
      margin-bottom: var(--space-1);
    }

    .form-input,
    .form-select {
      width: 100%;
      padding: 10px var(--space-3);
      font-size: var(--text-sm);
      color: var(--gray-900);
      background: #fff;
      border: 1.5px solid var(--gray-300);
      border-radius: var(--radius-lg);
      outline: none;
      transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
    }

    .form-input:focus,
    .form-select:focus {
      border-color: var(--brand-500);
      box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
    }

    .form-select {
      appearance: none;
      background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
      background-position: right 0.5rem center;
      background-repeat: no-repeat;
      background-size: 1.5em 1.5em;
      padding-right: 2.5rem;
    }

    .role-options {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }

    .role-option {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-3) var(--space-4);
      border: 1.5px solid var(--gray-200);
      border-radius: var(--radius-lg);
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .role-option input { display: none; }

    .role-option:hover {
      border-color: var(--gray-300);
      background: var(--gray-50);
    }

    .role-option.selected {
      border-color: var(--brand-500);
      background: var(--brand-50);
    }

    .role-icon {
      width: 36px;
      height: 36px;
      border-radius: var(--radius-md);
      background: var(--gray-100);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--gray-500);
      flex-shrink: 0;
    }

    .role-option.selected .role-icon {
      background: var(--brand-100);
      color: var(--brand-600);
    }

    .role-name {
      display: block;
      font-size: var(--text-sm);
      font-weight: var(--weight-medium);
      color: var(--gray-900);
    }

    .role-desc {
      display: block;
      font-size: var(--text-xs);
      color: var(--gray-500);
    }

    .alert-error {
      padding: var(--space-3) var(--space-4);
      background: var(--danger-50);
      color: var(--danger-600);
      border-radius: var(--radius-lg);
      font-size: var(--text-sm);
    }

    .invite-success {
      text-align: center;
      padding: var(--space-4) 0;
    }

    .success-icon-lg {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: var(--success-50);
      color: var(--success-600);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto var(--space-4);
    }

    .invite-success h3 {
      font-size: 1.125rem;
      font-weight: var(--weight-semibold);
      color: var(--gray-900);
      margin-bottom: var(--space-2);
    }

    .invite-success p {
      font-size: var(--text-sm);
      color: var(--gray-600);
      margin-bottom: var(--space-4);
    }

    .temp-credentials {
      background: var(--gray-50);
      border: 1px solid var(--gray-200);
      border-radius: var(--radius-lg);
      padding: var(--space-3) var(--space-4);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-3);
      margin-bottom: var(--space-3);
    }

    .cred-label {
      font-size: var(--text-sm);
      color: var(--gray-600);
    }

    .cred-value {
      font-family: monospace;
      font-size: var(--text-sm);
      background: #fff;
      padding: 4px 10px;
      border-radius: var(--radius-md);
      border: 1px solid var(--gray-200);
      color: var(--brand-600);
      font-weight: var(--weight-semibold);
    }

    .cred-note {
      font-size: var(--text-xs) !important;
      color: var(--gray-400) !important;
    }

    .edit-user-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
      margin-bottom: var(--space-5);
      padding-bottom: var(--space-4);
      border-bottom: 1px solid var(--gray-100);
    }

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

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-primary {
      background: var(--brand-600);
      color: #fff;
    }

    .btn-primary:hover:not(:disabled) { background: var(--brand-700); }

    .btn-secondary {
      background: var(--gray-100);
      color: var(--gray-700);
    }

    .btn-secondary:hover { background: var(--gray-200); }

    .spinner {
      width: 14px;
      height: 14px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }
  `]
})
export class AdminPageComponent implements OnInit {
  private http = inject(HttpClient);

  users = signal<User[]>([]);
  allUsers = signal<User[]>([]);
  loading = signal(true);
  showInviteModal = signal(false);
  inviting = signal(false);
  inviteError = signal('');
  inviteResult = signal<InviteResult | null>(null);
  editingUser = signal<User | null>(null);
  editRole = '';
  activeTab = signal('all');
  currentUserId = signal('');

  inviteForm = { email: '', full_name: '', role: 'jurado' };

  tabs = [
    { key: 'all', label: 'Todos' },
    { key: 'jurado', label: 'Jurado' },
    { key: 'organizador', label: 'Organizador' },
    { key: 'staff', label: 'Staff' },
    { key: 'admin', label: 'Admin' },
  ];

  roleOptions = [
    { value: 'jurado', label: 'Jurado', desc: 'Evalúa a los artistas con rúbricas', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>' },
    { value: 'staff', label: 'Staff', desc: 'Personal de apoyo en la operación', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 20a6 6 0 0 0-12 0"/><circle cx="12" cy="10" r="4"/><circle cx="12" cy="12" r="10"/></svg>' },
    { value: 'organizador', label: 'Organizador', desc: 'Gestiona el festival completo', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect width="8" height="4" x="8" y="2" rx="1"/></svg>' },
  ];

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);
    const roleParam = this.activeTab() !== 'all' ? `?role=${this.activeTab()}` : '';
    this.http.get<User[]>(`${environment.apiUrl}/admin/users${roleParam}`).subscribe({
      next: (users) => {
        this.allUsers.set(users);
        this.filterUsers();
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  filterUsers(): void {
    const tab = this.activeTab();
    const users = this.allUsers();
    this.users.set(tab === 'all' ? users : users.filter(u => u.role === tab));
  }

  getCountForRole(role: string): number {
    if (role === 'all') return this.allUsers().length;
    return this.allUsers().filter(u => u.role === role).length;
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  getRoleLabel(role: string): string {
    const labels: Record<string, string> = {
      admin: 'Admin',
      organizador: 'Organizador',
      jurado: 'Jurado',
      staff: 'Staff',
    };
    return labels[role] || role;
  }

  formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  sendInvite(): void {
    if (!this.inviteForm.email || !this.inviteForm.full_name) return;
    this.inviting.set(true);
    this.inviteError.set('');

    this.http.post<InviteResult>(`${environment.apiUrl}/admin/users/invite`, this.inviteForm).subscribe({
      next: (result) => {
        this.inviting.set(false);
        this.inviteResult.set(result);
        this.loadUsers();
      },
      error: (err) => {
        this.inviting.set(false);
        this.inviteError.set(err.error?.detail || 'Error al enviar la invitación');
      }
    });
  }

  closeInviteModal(): void {
    this.showInviteModal.set(false);
    this.inviteResult.set(null);
    this.inviteError.set('');
    this.inviteForm = { email: '', full_name: '', role: 'jurado' };
  }

  editUser(user: User): void {
    this.editingUser.set(user);
    this.editRole = user.role;
  }

  saveUser(): void {
    const user = this.editingUser();
    if (!user) return;

    this.http.patch(`${environment.apiUrl}/admin/users/${user.id}`, { role: this.editRole }).subscribe({
      next: () => {
        this.editingUser.set(null);
        this.loadUsers();
      }
    });
  }

  deactivateUser(user: User): void {
    if (!confirm(`¿Desactivar a ${user.full_name}?`)) return;
    this.http.delete(`${environment.apiUrl}/admin/users/${user.id}`).subscribe({
      next: () => this.loadUsers()
    });
  }
}
