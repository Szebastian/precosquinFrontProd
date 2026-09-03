import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { InscriptionVisibilityService } from '../../core/services/inscription-visibility.service';

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

interface RolePermission {
  role: string;
  label: string;
  desc: string;
  permissions: Record<string, boolean>;
}

interface SystemConfig {
  festival_name: string;
  edition: string;
  start_date: string;
  end_date: string;
  main_venue: string;
  inscriptions_open: string;
  public_registration: string;
  contract_signing: string;
  max_members: string;
  categories: string;
  email_welcome: string;
  email_approval: string;
  email_rejection: string;
  [key: string]: string;
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <!-- Header -->
      <div class="page-header">
        <div class="header-left">
          <div class="header-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </div>
          <div>
            <h1 class="page-title">Administración</h1>
            <p class="page-subtitle">Gestionar usuarios, permisos y configuración del sistema</p>
          </div>
        </div>
      </div>

      <!-- Main Tabs -->
      <div class="main-tabs">
        <button class="main-tab" [class.active]="mainTab() === 'usuarios'" (click)="mainTab.set('usuarios')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          Usuarios
        </button>
        <button class="main-tab" [class.active]="mainTab() === 'permisos'" (click)="mainTab.set('permisos')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>
          Permisos
        </button>
        <button class="main-tab" [class.active]="mainTab() === 'config'" (click)="mainTab.set('config')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          Configuración
        </button>
      </div>

      <!-- ==================== TAB: USUARIOS ==================== -->
      @if (mainTab() === 'usuarios') {
        <div class="section-header">
          <div class="section-tabs">
            @for (tab of userTabs; track tab.key) {
              <button class="filter-tab" [class.active]="userRoleTab() === tab.key" (click)="userRoleTab.set(tab.key); loadUsers()">
                {{ tab.label }}
                <span class="tab-count">{{ getUserCountForRole(tab.key) }}</span>
              </button>
            }
          </div>
          <div class="section-actions">
            <button class="btn btn-secondary" (click)="syncUsers()" [disabled]="syncing()">
              @if (syncing()) {
                <span class="spinner"></span> Sincronizando...
              } @else {
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></svg>
                Sync
              }
            </button>
            <button class="btn btn-primary" (click)="showInviteModal.set(true)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>
              Invitar Usuario
            </button>
          </div>
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
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>
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
                            <div class="avatar-sm" [attr.data-role]="user.role">{{ getInitials(user.full_name) }}</div>
                            <span class="user-name">{{ user.full_name }}</span>
                          </div>
                        </td>
                        <td><span class="text-email">{{ user.email }}</span></td>
                        <td><span class="role-badge" [attr.data-role]="user.role">{{ getRoleLabel(user.role) }}</span></td>
                        <td>
                          <span class="status-dot" [class.active]="user.is_active"></span>
                          {{ user.is_active ? 'Activo' : 'Inactivo' }}
                        </td>
                        <td><span class="text-muted">{{ formatDate(user.created_at) }}</span></td>
                        <td>
                          <div class="actions-cell">
                            <button class="btn-icon" title="Editar" (click)="editUser(user)">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                            </button>
                            <button class="btn-icon" title="Resetear contraseña" (click)="resetPassword(user)" [disabled]="user.id === currentUserId()">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                            </button>
                            <button class="btn-icon btn-danger" title="Desactivar" (click)="deactivateUser(user)" [disabled]="user.id === currentUserId()">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="17" x2="22" y1="11" y2="16"/></svg>
                            </button>
                            <button class="btn-icon btn-danger" title="Eliminar" (click)="deleteUser(user)" [disabled]="user.id === currentUserId()">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
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
      }

      <!-- ==================== TAB: PERMISOS ==================== -->
      @if (mainTab() === 'permisos') {
        <div class="card">
          <div class="card-header-row">
            <div>
              <h2 class="card-heading">Matriz de Permisos por Rol</h2>
              <p class="card-desc">Define qué puede hacer cada rol en el sistema</p>
            </div>
          </div>
          <div class="card-body">
            <div class="permissions-table-wrapper">
              <table class="permissions-table">
                <thead>
                  <tr>
                    <th class="perm-feature-col">Módulo / Funcionalidad</th>
                    @for (role of rolesList; track role.key) {
                      <th class="perm-role-col">
                        <span class="perm-role-badge" [attr.data-role]="role.key">{{ role.label }}</span>
                      </th>
                    }
                  </tr>
                </thead>
                <tbody>
                  @for (feature of permissionsFeatures; track feature.key) {
                    <tr>
                      <td class="perm-feature-name">
                        <span class="perm-feature-icon" [innerHTML]="sanitizeIcon(feature.icon)"></span>
                        <span>{{ feature.label }}</span>
                      </td>
                      @for (role of rolesList; track role.key) {
                        <td class="perm-cell">
                          <label class="perm-toggle" [class.perm-on]="isPermissionEnabled(role.key, feature.key)">
                            <input type="checkbox" [checked]="isPermissionEnabled(role.key, feature.key)" (change)="togglePermission(role.key, feature.key)" />
                            <span class="perm-toggle-track">
                              <span class="perm-toggle-thumb"></span>
                            </span>
                          </label>
                        </td>
                      }
                    </tr>
                  }
                </tbody>
              </table>
            </div>
            <div class="perm-legend">
              <span class="perm-legend-item"><span class="perm-dot perm-dot-on"></span> Permitido</span>
              <span class="perm-legend-item"><span class="perm-dot perm-dot-off"></span> Denegado</span>
            </div>
          </div>
        </div>
      }

      <!-- ==================== TAB: CONFIGURACION ==================== -->
      @if (mainTab() === 'config') {
        <div class="config-grid">
          <!-- Festival Config -->
          <div class="card config-card">
            <div class="card-header-row">
              <div>
                <h2 class="card-heading">Datos del Festival</h2>
                <p class="card-desc">Información general del Pre-Cosquín</p>
              </div>
            </div>
            <div class="card-body">
              <div class="config-form">
                <div class="form-group">
                  <label class="form-label">Nombre del Festival</label>
                  <input type="text" class="form-input" [(ngModel)]="config.festival_name" placeholder="Pre Cosquín 2026" />
                </div>
                <div class="form-group">
                  <label class="form-label">Edición</label>
                  <input type="text" class="form-input" [(ngModel)]="config.edition" placeholder="Puerto Pirámides 2026" />
                </div>
                <div class="form-group">
                  <label class="form-label">Fecha de Inicio</label>
                  <input type="date" class="form-input" [(ngModel)]="config.start_date" />
                </div>
                <div class="form-group">
                  <label class="form-label">Fecha de Fin</label>
                  <input type="date" class="form-input" [(ngModel)]="config.end_date" />
                </div>
                <div class="form-group">
                  <label class="form-label">Sede Principal</label>
                  <input type="text" class="form-input" [(ngModel)]="config.main_venue" placeholder="Puerto Pirámides, Chubut" />
                </div>
              </div>
            </div>
          </div>

          <!-- Inscripciones Config -->
          <div class="card config-card">
            <div class="card-header-row">
              <div>
                <h2 class="card-heading">Inscripciones</h2>
                <p class="card-desc">Configuración del proceso de inscripción</p>
              </div>
            </div>
            <div class="card-body">
              <div class="config-form">
                <div class="config-toggle-row">
                  <div class="config-toggle-info">
                    <span class="config-toggle-label">Inscripciones Abiertas</span>
                    <span class="config-toggle-desc">Permitir nuevas inscripciones de artistas</span>
                  </div>
                  <label class="perm-toggle" [class.perm-on]="config.inscriptions_open === 'true'">
                    <input type="checkbox" [checked]="config.inscriptions_open === 'true'" (change)="config.inscriptions_open = config.inscriptions_open === 'true' ? 'false' : 'true'" />
                    <span class="perm-toggle-track"><span class="perm-toggle-thumb"></span></span>
                  </label>
                </div>
                <div class="config-toggle-row">
                  <div class="config-toggle-info">
                    <span class="config-toggle-label">Registro Público</span>
                    <span class="config-toggle-desc">Mostrar formulario de inscripción en la web</span>
                  </div>
                  <label class="perm-toggle" [class.perm-on]="config.public_registration === 'true'">
                    <input type="checkbox" [checked]="config.public_registration === 'true'" (change)="config.public_registration = config.public_registration === 'true' ? 'false' : 'true'" />
                    <span class="perm-toggle-track"><span class="perm-toggle-thumb"></span></span>
                  </label>
                </div>
                <div class="config-toggle-row">
                  <div class="config-toggle-info">
                    <span class="config-toggle-label">Firma de Contratos</span>
                    <span class="config-toggle-desc">Habilitar firma digital de contratos</span>
                  </div>
                  <label class="perm-toggle" [class.perm-on]="config.contract_signing === 'true'">
                    <input type="checkbox" [checked]="config.contract_signing === 'true'" (change)="config.contract_signing = config.contract_signing === 'true' ? 'false' : 'true'" />
                    <span class="perm-toggle-track"><span class="perm-toggle-thumb"></span></span>
                  </label>
                </div>
                <div class="form-group">
                  <label class="form-label">Máximo de Integrantes por Grupo</label>
                  <input type="number" class="form-input" [(ngModel)]="config.max_members" min="1" max="50" />
                </div>
                <div class="form-group">
                  <label class="form-label">Categorías Habilitadas</label>
                  <div class="checkbox-group">
                    <label class="checkbox-item">
                      <input type="checkbox" [checked]="config.categories.includes('musica')" (change)="toggleCategory('musica')" />
                      <span>Música</span>
                    </label>
                    <label class="checkbox-item">
                      <input type="checkbox" [checked]="config.categories.includes('danza')" (change)="toggleCategory('danza')" />
                      <span>Danza</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Notificaciones Config -->
          <div class="card config-card">
            <div class="card-header-row">
              <div>
                <h2 class="card-heading">Notificaciones</h2>
                <p class="card-desc">Avisos automáticos del sistema</p>
              </div>
            </div>
            <div class="card-body">
              <div class="config-form">
                <div class="config-toggle-row">
                  <div class="config-toggle-info">
                    <span class="config-toggle-label">Email de Bienvenida</span>
                    <span class="config-toggle-desc">Enviar email al registrar un artista</span>
                  </div>
                  <label class="perm-toggle" [class.perm-on]="config.email_welcome === 'true'">
                    <input type="checkbox" [checked]="config.email_welcome === 'true'" (change)="config.email_welcome = config.email_welcome === 'true' ? 'false' : 'true'" />
                    <span class="perm-toggle-track"><span class="perm-toggle-thumb"></span></span>
                  </label>
                </div>
                <div class="config-toggle-row">
                  <div class="config-toggle-info">
                    <span class="config-toggle-label">Notificación de Aprobación</span>
                    <span class="config-toggle-desc">Avisar al artista cuando se aprueba</span>
                  </div>
                  <label class="perm-toggle" [class.perm-on]="config.email_approval === 'true'">
                    <input type="checkbox" [checked]="config.email_approval === 'true'" (change)="config.email_approval = config.email_approval === 'true' ? 'false' : 'true'" />
                    <span class="perm-toggle-track"><span class="perm-toggle-thumb"></span></span>
                  </label>
                </div>
                <div class="config-toggle-row">
                  <div class="config-toggle-info">
                    <span class="config-toggle-label">Notificación de Rechazo</span>
                    <span class="config-toggle-desc">Avisar al artista cuando se rechaza</span>
                  </div>
                  <label class="perm-toggle" [class.perm-on]="config.email_rejection === 'true'">
                    <input type="checkbox" [checked]="config.email_rejection === 'true'" (change)="config.email_rejection = config.email_rejection === 'true' ? 'false' : 'true'" />
                    <span class="perm-toggle-track"><span class="perm-toggle-thumb"></span></span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- Guardar -->
          <div class="config-save-bar">
            <span class="config-save-status" [class.show]="configSaved()">
              @if (configSaved()) {
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 11 3 3L22 4"/></svg>
                Configuración guardada
              }
            </span>
            <button class="btn btn-primary" (click)="saveConfig()" [disabled]="savingConfig()">
              @if (savingConfig()) {
                <span class="spinner"></span> Guardando...
              } @else {
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                Guardar Configuración
              }
            </button>
          </div>
        </div>
      }

      <!-- ==================== MODALS ==================== -->

      <!-- Invite Modal -->
      @if (showInviteModal()) {
        <div class="modal-overlay" (click)="showInviteModal.set(false)">
          <div class="modal" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h2>Invitar Usuario</h2>
              <button class="btn-close" (click)="showInviteModal.set(false)">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
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
                        <span class="role-icon" [innerHTML]="sanitizeIcon(role.icon)"></span>
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
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
                  </div>
                  <h3>Invitación Enviada</h3>
                  <p>Se creó la cuenta para <strong>{{ inviteResult()!.email }}</strong></p>
                  <div class="temp-credentials">
                    <span class="cred-label">Contraseña temporal:</span>
                    <code class="cred-value">{{ inviteResult()!.temp_password }}</code>
                  </div>
                  <p class="cred-note">Compartí esta contraseña con el usuario.</p>
                </div>
              }
            </div>
            <div class="modal-footer">
              @if (!inviteResult()) {
                <button class="btn btn-secondary" (click)="showInviteModal.set(false)">Cancelar</button>
                <button class="btn btn-primary" (click)="sendInvite()" [disabled]="!inviteForm.email || !inviteForm.full_name || inviting()">
                  @if (inviting()) { <span class="spinner"></span> Enviando... } @else { Enviar Invitación }
                </button>
              } @else {
                <button class="btn btn-primary" (click)="closeInviteModal()">Cerrar</button>
              }
            </div>
          </div>
        </div>
      }

      <!-- Edit Modal -->
      @if (editingUser()) {
        <div class="modal-overlay" (click)="editingUser.set(null)">
          <div class="modal modal-sm" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h2>Editar Usuario</h2>
              <button class="btn-close" (click)="editingUser.set(null)">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            <div class="modal-body">
              <div class="form-group">
                <label class="form-label">Nombre</label>
                <input type="text" class="form-input" [(ngModel)]="editName" />
              </div>
              <div class="form-group">
                <label class="form-label">Email</label>
                <input type="email" class="form-input" [(ngModel)]="editEmail" />
              </div>
              <div class="form-group">
                <label class="form-label">Rol</label>
                <select class="form-select" [(ngModel)]="editRole">
                  <option value="jurado">Jurado</option>
                  <option value="organizador">Organizador</option>
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                  <option value="sede">Sede Cosquín</option>
                </select>
              </div>
              @if (editError()) {
                <div class="alert alert-error">{{ editError() }}</div>
              }
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" (click)="editingUser.set(null)">Cancelar</button>
              <button class="btn btn-primary" (click)="saveUser()" [disabled]="saving()">
                @if (saving()) { <span class="spinner"></span> Guardando... } @else { Guardar }
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Reset Password Modal -->
      @if (resetResult()) {
        <div class="modal-overlay" (click)="resetResult.set(null)">
          <div class="modal modal-sm" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h2>Contraseña Reseteada</h2>
              <button class="btn-close" (click)="resetResult.set(null)">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            <div class="modal-body">
              <p>Nueva contraseña para <strong>{{ resetResult()!.email }}</strong></p>
              <div class="temp-credentials">
                <span class="cred-label">Contraseña temporal:</span>
                <code class="cred-value">{{ resetResult()!.temp_password }}</code>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-primary" (click)="resetResult.set(null)">Cerrar</button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }

    .page-container { max-width: 1100px; margin: 0 auto; padding: 1.5rem 2rem; }

    /* Header */
    .page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 1.5rem; }
    .header-left { display: flex; align-items: center; gap: 1rem; }
    .header-icon { width: 44px; height: 44px; border-radius: 0.75rem; display: flex; align-items: center; justify-content: center; background: rgba(96, 165, 250, 0.12); color: var(--brand-400, #60a5fa); flex-shrink: 0; }
    .page-title { font-family: var(--font-display); font-size: 1.5rem; font-weight: 800; color: var(--gray-900); margin: 0; letter-spacing: -0.02em; }
    .page-subtitle { font-size: 0.8125rem; color: var(--gray-500); margin: 0.25rem 0 0; }

    /* Main Tabs */
    .main-tabs { display: flex; gap: 0.25rem; margin-bottom: 1.5rem; background: var(--gray-100); border-radius: 0.75rem; padding: 0.25rem; border: 1px solid var(--gray-200); }
    .main-tab { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.625rem 1.125rem; font-size: 0.8125rem; font-weight: 600; color: var(--gray-500); background: none; border: none; border-radius: 0.5rem; cursor: pointer; transition: all 0.15s; font-family: inherit; }
    .main-tab:hover { color: var(--gray-700); background: rgba(255,255,255,0.5); }
    .main-tab.active { color: var(--brand-600, #2563eb); background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
    :host-context(.dark) .main-tabs { background: var(--gray-700); border-color: var(--gray-600); }
    :host-context(.dark) .main-tab { color: var(--gray-400); }
    :host-context(.dark) .main-tab:hover { color: var(--gray-200); background: rgba(255,255,255,0.05); }
    :host-context(.dark) .main-tab.active { color: var(--brand-400); background: var(--gray-800); }

    /* Section Header */
    .section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; gap: 1rem; flex-wrap: wrap; }
    .section-tabs { display: flex; gap: 0.25rem; flex-wrap: wrap; }
    .filter-tab { display: inline-flex; align-items: center; gap: 0.375rem; padding: 0.4375rem 0.75rem; font-size: 0.8125rem; font-weight: 500; color: var(--gray-500); background: none; border: 1px solid transparent; border-radius: 0.5rem; cursor: pointer; transition: all 0.15s; font-family: inherit; white-space: nowrap; }
    .filter-tab:hover { color: var(--gray-700); background: var(--gray-100); }
    .filter-tab.active { color: var(--brand-400, #60a5fa); background: rgba(96, 165, 250, 0.1); border-color: rgba(96, 165, 250, 0.2); font-weight: 600; }
    .tab-count { font-size: 0.6875rem; font-weight: 600; background: var(--gray-200); padding: 0.0625rem 0.375rem; border-radius: 999px; min-width: 1.25rem; text-align: center; }
    .filter-tab.active .tab-count { background: rgba(96, 165, 250, 0.2); color: var(--brand-400, #60a5fa); }
    .section-actions { display: flex; gap: 0.5rem; }

    /* Card */
    .card { background: var(--gray-100); border: 1px solid var(--gray-200); border-radius: 0.875rem; overflow: hidden; margin-bottom: 1.5rem; }
    .card-body { padding: 0; }
    .card-header-row { display: flex; align-items: center; justify-content: space-between; padding: 1.25rem; border-bottom: 1px solid var(--gray-200); }
    .card-heading { font-size: 0.9375rem; font-weight: 700; color: var(--gray-900); margin: 0; }
    .card-desc { font-size: 0.75rem; color: var(--gray-500); margin: 0.25rem 0 0; }

    /* Table */
    .table-wrapper { overflow-x: auto; }
    .table { width: 100%; border-collapse: collapse; }
    .table th { text-align: left; padding: 0.75rem 1rem; font-size: 0.6875rem; font-weight: 700; color: var(--gray-500); text-transform: uppercase; letter-spacing: 0.04em; background: var(--gray-200); border-bottom: 1px solid var(--gray-200); }
    .table td { padding: 0.625rem 1rem; font-size: 0.8125rem; color: var(--gray-700); border-bottom: 1px solid var(--gray-200); }
    .table tr:last-child td { border-bottom: none; }
    .table tr:hover td { background: rgba(255,255,255,0.3); }
    :host-context(.dark) .table th { background: var(--gray-700); border-color: var(--gray-600); }
    :host-context(.dark) .table td { border-color: var(--gray-700); }
    :host-context(.dark) .table tr:hover td { background: rgba(255,255,255,0.03); }

    .user-cell { display: flex; align-items: center; gap: 0.625rem; }
    .avatar-sm { width: 32px; height: 32px; border-radius: 50%; background: var(--gray-200); color: var(--gray-600); display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; flex-shrink: 0; }
    .avatar-sm[data-role="admin"] { background: rgba(239,68,68,0.12); color: #ef4444; }
    .avatar-sm[data-role="organizador"] { background: rgba(96,165,250,0.12); color: #3b82f6; }
    .avatar-sm[data-role="jurado"] { background: rgba(251,191,36,0.12); color: #f59e0b; }
    .avatar-sm[data-role="staff"] { background: rgba(34,197,94,0.12); color: #22c55e; }
    .avatar-sm[data-role="sede"] { background: rgba(168,85,247,0.12); color: #a855f7; }
    :host-context(.dark) .avatar-sm { background: var(--gray-600); color: var(--gray-300); }

    .user-name { font-weight: 600; color: var(--gray-900); }
    :host-context(.dark) .user-name { color: var(--gray-100); }
    .text-muted { color: var(--gray-400); font-size: 0.75rem; }
    .text-email { color: var(--gray-600); font-size: 0.8125rem; }
    :host-context(.dark) .text-email { color: var(--gray-300); }

    .role-badge { display: inline-block; padding: 2px 10px; border-radius: 999px; font-size: 0.6875rem; font-weight: 600; text-transform: capitalize; }
    .role-badge[data-role="admin"] { background: rgba(239,68,68,0.1); color: #ef4444; }
    .role-badge[data-role="organizador"] { background: rgba(96,165,250,0.1); color: #3b82f6; }
    .role-badge[data-role="jurado"] { background: rgba(251,191,36,0.1); color: #f59e0b; }
    .role-badge[data-role="staff"] { background: rgba(34,197,94,0.1); color: #22c55e; }
    .role-badge[data-role="sede"] { background: rgba(168,85,247,0.1); color: #a855f7; }
    :host-context(.dark) .role-badge[data-role="admin"] { background: rgba(239,68,68,0.15); color: #fca5a5; }
    :host-context(.dark) .role-badge[data-role="organizador"] { background: rgba(96,165,250,0.15); color: #93c5fd; }
    :host-context(.dark) .role-badge[data-role="jurado"] { background: rgba(251,191,36,0.15); color: #fcd34d; }
    :host-context(.dark) .role-badge[data-role="staff"] { background: rgba(34,197,94,0.15); color: #86efac; }
    :host-context(.dark) .role-badge[data-role="sede"] { background: rgba(168,85,247,0.15); color: #c084fc; }

    .status-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: var(--gray-300); margin-right: 0.25rem; }
    .status-dot.active { background: #22c55e; }
    .actions-cell { display: flex; gap: 0.25rem; }
    .btn-icon { width: 30px; height: 30px; border-radius: 0.375rem; border: none; background: none; color: var(--gray-500); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.15s; }
    .btn-icon:hover { background: var(--gray-200); color: var(--gray-700); }
    .btn-icon.btn-danger:hover { background: rgba(239,68,68,0.1); color: #ef4444; }
    .btn-icon:disabled { opacity: 0.3; cursor: not-allowed; }

    /* Empty / Loading */
    .empty-state { text-align: center; padding: 4rem 2rem; }
    .empty-icon { color: var(--gray-300); margin-bottom: 1rem; }
    .empty-title { font-size: 1rem; font-weight: 700; color: var(--gray-900); margin: 0 0 0.5rem; }
    :host-context(.dark) .empty-title { color: var(--gray-200); }
    .empty-desc { font-size: 0.8125rem; color: var(--gray-500); max-width: 360px; margin: 0 auto; }
    .loading-state { text-align: center; padding: 4rem 2rem; color: var(--gray-500); }
    .spinner-lg { width: 32px; height: 32px; border: 3px solid var(--gray-200); border-top-color: var(--brand-500); border-radius: 50%; animation: spin 0.6s linear infinite; margin: 0 auto 1rem; }
    :host-context(.dark) .spinner-lg { border-color: var(--gray-600); border-top-color: var(--brand-400); }
    @keyframes spin { to { transform: rotate(360deg); } }
    .spinner { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.6s linear infinite; display: inline-block; vertical-align: middle; }

    /* Buttons */
    .btn { display: inline-flex; align-items: center; gap: 0.375rem; padding: 0.5rem 1rem; font-size: 0.8125rem; font-weight: 600; border-radius: 0.5rem; border: none; cursor: pointer; transition: all 0.15s; font-family: inherit; white-space: nowrap; }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-primary { background: var(--brand-500, #4c8be6); color: #fff; }
    .btn-primary:hover:not(:disabled) { background: var(--brand-600, #2563eb); }
    .btn-secondary { background: var(--gray-200); color: var(--gray-700); border: 1px solid var(--gray-200); }
    .btn-secondary:hover { background: var(--gray-300); }
    :host-context(.dark) .btn-secondary { background: var(--gray-700); color: var(--gray-300); border-color: var(--gray-600); }
    :host-context(.dark) .btn-secondary:hover { background: var(--gray-600); }

    /* ========== PERMISSIONS TABLE ========== */
    .permissions-table-wrapper { overflow-x: auto; }
    .permissions-table { width: 100%; border-collapse: collapse; }
    .permissions-table th { padding: 0.75rem 1rem; font-size: 0.6875rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: var(--gray-500); background: var(--gray-200); border-bottom: 1px solid var(--gray-200); text-align: center; }
    .permissions-table th:first-child { text-align: left; }
    :host-context(.dark) .permissions-table th { background: var(--gray-700); border-color: var(--gray-600); }
    .perm-feature-col { min-width: 220px; }
    .perm-role-col { min-width: 90px; }
    .perm-role-badge { font-size: 0.6875rem; font-weight: 600; padding: 0.125rem 0.5rem; border-radius: 999px; }
    .perm-role-badge[data-role="admin"] { background: rgba(239,68,68,0.1); color: #ef4444; }
    .perm-role-badge[data-role="organizador"] { background: rgba(96,165,250,0.1); color: #3b82f6; }
    .perm-role-badge[data-role="jurado"] { background: rgba(251,191,36,0.1); color: #f59e0b; }
    .perm-role-badge[data-role="staff"] { background: rgba(34,197,94,0.1); color: #22c55e; }
    .perm-role-badge[data-role="sede"] { background: rgba(168,85,247,0.1); color: #a855f7; }
    :host-context(.dark) .perm-role-badge[data-role="admin"] { background: rgba(239,68,68,0.15); color: #fca5a5; }
    :host-context(.dark) .perm-role-badge[data-role="organizador"] { background: rgba(96,165,250,0.15); color: #93c5fd; }
    :host-context(.dark) .perm-role-badge[data-role="jurado"] { background: rgba(251,191,36,0.15); color: #fcd34d; }
    :host-context(.dark) .perm-role-badge[data-role="staff"] { background: rgba(34,197,94,0.15); color: #86efac; }
    :host-context(.dark) .perm-role-badge[data-role="sede"] { background: rgba(168,85,247,0.15); color: #c084fc; }

    .permissions-table td { padding: 0.625rem 1rem; border-bottom: 1px solid var(--gray-200); text-align: center; vertical-align: middle; }
    :host-context(.dark) .permissions-table td { border-color: var(--gray-700); }
    .permissions-table tr:last-child td { border-bottom: none; }
    .permissions-table tr:hover td { background: rgba(255,255,255,0.3); }
    :host-context(.dark) .permissions-table tr:hover td { background: rgba(255,255,255,0.03); }
    .perm-feature-name { display: flex; align-items: center; gap: 0.625rem; text-align: left; font-size: 0.8125rem; font-weight: 600; color: var(--gray-800); }
    :host-context(.dark) .perm-feature-name { color: var(--gray-200); }
    .perm-feature-icon { width: 28px; height: 28px; border-radius: 0.375rem; background: var(--gray-200); color: var(--gray-500); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    :host-context(.dark) .perm-feature-icon { background: var(--gray-600); color: var(--gray-400); }
    .perm-cell { width: 90px; }

    /* Toggle Switch */
    .perm-toggle { position: relative; display: inline-flex; cursor: pointer; }
    .perm-toggle input { display: none; }
    .perm-toggle-track { width: 36px; height: 20px; border-radius: 10px; background: var(--gray-300); transition: background 0.2s; display: flex; align-items: center; padding: 2px; }
    :host-context(.dark) .perm-toggle-track { background: var(--gray-600); }
    .perm-toggle-thumb { width: 16px; height: 16px; border-radius: 50%; background: #fff; transition: transform 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.2); }
    .perm-toggle.perm-on .perm-toggle-track { background: #22c55e; }
    .perm-toggle.perm-on .perm-toggle-thumb { transform: translateX(16px); }

    .perm-legend { display: flex; gap: 1.5rem; padding: 1rem 1.25rem; border-top: 1px solid var(--gray-200); }
    :host-context(.dark) .perm-legend { border-color: var(--gray-700); }
    .perm-legend-item { display: flex; align-items: center; gap: 0.375rem; font-size: 0.75rem; color: var(--gray-500); }
    .perm-dot { width: 10px; height: 10px; border-radius: 50%; }
    .perm-dot-on { background: #22c55e; }
    .perm-dot-off { background: var(--gray-300); }

    /* ========== CONFIG ========== */
    .config-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; }
    .config-card { margin-bottom: 0; }
    .config-card:last-of-type { grid-column: 1 / -1; }
    .config-form { padding: 1.25rem; display: flex; flex-direction: column; gap: 1rem; }

    .config-toggle-row { display: flex; align-items: center; justify-content: space-between; padding: 0.75rem; background: var(--gray-200); border-radius: 0.5rem; gap: 1rem; }
    :host-context(.dark) .config-toggle-row { background: var(--gray-700); }
    .config-toggle-info { flex: 1; min-width: 0; }
    .config-toggle-label { display: block; font-size: 0.8125rem; font-weight: 600; color: var(--gray-800); }
    :host-context(.dark) .config-toggle-label { color: var(--gray-200); }
    .config-toggle-desc { display: block; font-size: 0.6875rem; color: var(--gray-500); margin-top: 0.125rem; }

    .config-save-bar { grid-column: 1 / -1; display: flex; align-items: center; justify-content: flex-end; gap: 1rem; padding: 1rem 0; }
    .config-save-status { display: inline-flex; align-items: center; gap: 0.375rem; font-size: 0.8125rem; color: #22c55e; font-weight: 600; opacity: 0; transition: opacity 0.3s; }
    .config-save-status.show { opacity: 1; }

    .checkbox-group { display: flex; gap: 1.5rem; }
    .checkbox-item { display: inline-flex; align-items: center; gap: 0.5rem; font-size: 0.8125rem; color: var(--gray-700); cursor: pointer; }
    :host-context(.dark) .checkbox-item { color: var(--gray-300); }
    .checkbox-item input { width: 16px; height: 16px; accent-color: var(--brand-500); }

    /* Forms */
    .form-group { display: flex; flex-direction: column; gap: 0.375rem; }
    .form-label { font-size: 0.75rem; font-weight: 600; color: var(--gray-600); }
    :host-context(.dark) .form-label { color: var(--gray-400); }
    .form-input, .form-select { padding: 0.5rem 0.75rem; border: 1px solid var(--gray-200); border-radius: 0.5rem; font-size: 0.8125rem; font-family: inherit; color: var(--gray-800); background: var(--gray-200); transition: border-color 0.15s; }
    :host-context(.dark) .form-input, :host-context(.dark) .form-select { background: var(--gray-700); border-color: var(--gray-600); color: var(--gray-100); }
    .form-input:focus, .form-select:focus { outline: none; border-color: var(--brand-500); box-shadow: 0 0 0 3px rgba(76,139,230,0.15); }
    .form-select { appearance: none; background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e"); background-position: right 0.5rem center; background-repeat: no-repeat; background-size: 1.5em; padding-right: 2.5rem; }

    /* Modal */
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem; }
    .modal { background: #fff; border-radius: 1rem; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); width: 100%; max-width: 520px; max-height: 90vh; overflow-y: auto; }
    :host-context(.dark) .modal { background: var(--gray-800); }
    .modal-sm { max-width: 400px; }
    .modal-header { display: flex; align-items: center; justify-content: space-between; padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--gray-100); }
    :host-context(.dark) .modal-header { border-color: var(--gray-700); }
    .modal-header h2 { font-size: 1.0625rem; font-weight: 700; color: var(--gray-900); margin: 0; }
    :host-context(.dark) .modal-header h2 { color: var(--gray-100); }
    .btn-close { width: 32px; height: 32px; border-radius: 0.375rem; border: none; background: none; color: var(--gray-400); cursor: pointer; display: flex; align-items: center; justify-content: center; }
    .btn-close:hover { background: var(--gray-100); color: var(--gray-600); }
    :host-context(.dark) .btn-close:hover { background: var(--gray-700); }
    .modal-body { padding: 1.5rem; }
    .modal-body p { color: var(--gray-700); font-size: 0.875rem; }
    :host-context(.dark) .modal-body p { color: var(--gray-300); }
    .modal-footer { display: flex; justify-content: flex-end; gap: 0.625rem; padding: 1rem 1.5rem; border-top: 1px solid var(--gray-100); }
    :host-context(.dark) .modal-footer { border-color: var(--gray-700); }

    .role-options { display: flex; flex-direction: column; gap: 0.5rem; }
    .role-option { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; border: 1.5px solid var(--gray-200); border-radius: 0.625rem; cursor: pointer; transition: all 0.15s; }
    :host-context(.dark) .role-option { border-color: var(--gray-600); }
    .role-option input { display: none; }
    .role-option:hover { border-color: var(--gray-300); background: var(--gray-50); }
    :host-context(.dark) .role-option:hover { border-color: var(--gray-500); }
    .role-option.selected { border-color: var(--brand-500); background: rgba(76,139,230,0.05); }
    :host-context(.dark) .role-option.selected { background: rgba(76,139,230,0.1); }
    .role-icon { width: 36px; height: 36px; border-radius: 0.5rem; background: var(--gray-200); color: var(--gray-500); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    :host-context(.dark) .role-icon { background: var(--gray-700); color: var(--gray-400); }
    .role-option.selected .role-icon { background: rgba(76,139,230,0.12); color: var(--brand-500); }
    .role-name { display: block; font-size: 0.8125rem; font-weight: 600; color: var(--gray-900); }
    :host-context(.dark) .role-name { color: var(--gray-100); }
    .role-desc { display: block; font-size: 0.6875rem; color: var(--gray-500); }

    .alert-error { padding: 0.625rem 0.875rem; background: rgba(239,68,68,0.08); color: #ef4444; border-radius: 0.5rem; font-size: 0.8125rem; }
    :host-context(.dark) .alert-error { background: rgba(239,68,68,0.12); color: #fca5a5; }

    .invite-success { text-align: center; padding: 1rem 0; }
    .success-icon-lg { width: 56px; height: 56px; border-radius: 50%; background: rgba(34,197,94,0.1); color: #22c55e; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; }
    .invite-success h3 { font-size: 1rem; font-weight: 700; color: var(--gray-900); margin: 0 0 0.5rem; }
    :host-context(.dark) .invite-success h3 { color: var(--gray-100); }
    .invite-success p { font-size: 0.8125rem; color: var(--gray-600); margin-bottom: 1rem; }
    :host-context(.dark) .invite-success p { color: var(--gray-400); }
    .temp-credentials { background: var(--gray-100); border: 1px solid var(--gray-200); border-radius: 0.5rem; padding: 0.625rem 1rem; display: flex; align-items: center; justify-content: center; gap: 0.625rem; margin-bottom: 0.75rem; }
    :host-context(.dark) .temp-credentials { background: var(--gray-700); border-color: var(--gray-600); }
    .cred-label { font-size: 0.8125rem; color: var(--gray-600); }
    :host-context(.dark) .cred-label { color: var(--gray-400); }
    .cred-value { font-family: monospace; font-size: 0.875rem; background: #fff; padding: 4px 10px; border-radius: 0.375rem; border: 1px solid var(--gray-200); color: var(--brand-500); font-weight: 700; }
    :host-context(.dark) .cred-value { background: var(--gray-800); border-color: var(--gray-600); color: var(--brand-400); }
    .cred-note { font-size: 0.75rem !important; color: var(--gray-400) !important; }

    /* Responsive */
    @media (max-width: 768px) {
      .page-container { padding: 1rem; }
      .config-grid { grid-template-columns: 1fr; }
      .section-header { flex-direction: column; align-items: stretch; }
      .section-actions { justify-content: flex-end; }
      .main-tabs { overflow-x: auto; }
    }
  `]
})
export class AdminPageComponent implements OnInit {
  private http = inject(HttpClient);
  private sanitizer = inject(DomSanitizer);
  private inscriptionVisibility = inject(InscriptionVisibilityService);

  // Main tab
  mainTab = signal<'usuarios' | 'permisos' | 'config'>('usuarios');

  // Users
  users = signal<User[]>([]);
  allUsers = signal<User[]>([]);
  loading = signal(true);
  showInviteModal = signal(false);
  inviting = signal(false);
  inviteError = signal('');
  inviteResult = signal<InviteResult | null>(null);
  editingUser = signal<User | null>(null);
  editRole = '';
  editName = '';
  editEmail = '';
  editError = signal('');
  saving = signal(false);
  userRoleTab = signal('all');
  currentUserId = signal('');
  resetResult = signal<{ email: string; temp_password: string } | null>(null);
  syncing = signal(false);
  inviteForm = { email: '', full_name: '', role: 'jurado' };

  userTabs = [
    { key: 'all', label: 'Todos' },
    { key: 'jurado', label: 'Jurado' },
    { key: 'organizador', label: 'Organizador' },
    { key: 'staff', label: 'Staff' },
    { key: 'admin', label: 'Admin' },
    { key: 'sede', label: 'Sede' },
  ];

  roleOptions = [
    { value: 'jurado', label: 'Jurado', desc: 'Evalúa a los artistas con rúbricas', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>' },
    { value: 'staff', label: 'Staff', desc: 'Personal de apoyo en la operación', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 20a6 6 0 0 0-12 0"/><circle cx="12" cy="10" r="4"/></svg>' },
    { value: 'organizador', label: 'Organizador', desc: 'Gestiona el festival completo', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect width="8" height="4" x="8" y="2" rx="1"/></svg>' },
    { value: 'admin', label: 'Admin', desc: 'Control total del sistema', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>' },
    { value: 'sede', label: 'Sede Cosquín', desc: 'Consulta y exporta datos de la sede central', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18"/><path d="M5 21V7l8-4v18"/><path d="M19 21V11l-6-4"/><path d="M9 9h.01"/><path d="M9 13h.01"/><path d="M9 17h.01"/></svg>' },
  ];

  // Permissions
  rolesList = [
    { key: 'admin', label: 'Admin' },
    { key: 'organizador', label: 'Organizador' },
    { key: 'staff', label: 'Staff' },
    { key: 'jurado', label: 'Jurado' },
    { key: 'sede', label: 'Sede' },
  ];

  permissionsFeatures = [
    { key: 'view_dashboard', label: 'Ver Dashboard', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>' },
    { key: 'manage_inscriptions', label: 'Gestionar Inscripciones', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect width="8" height="4" x="8" y="2" rx="1"/></svg>' },
    { key: 'approve_inscriptions', label: 'Aprobar/Rechazar Inscripciones', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 11 3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>' },
    { key: 'manage_schedule', label: 'Gestionar Cronograma', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="4" rx="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>' },
    { key: 'manage_accreditations', label: 'Gestionar Acreditaciones', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>' },
    { key: 'manage_jury', label: 'Gestionar Jurado', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>' },
    { key: 'manage_contracts', label: 'Gestionar Contratos', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>' },
    { key: 'manage_communications', label: 'Gestionar Comunicaciones', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/></svg>' },
    { key: 'manage_news', label: 'Gestionar Noticias', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/></svg>' },
    { key: 'manage_gallery', label: 'Gestionar Galería', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>' },
    { key: 'manage_users', label: 'Gestionar Usuarios', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>' },
    { key: 'manage_roles', label: 'Gestionar Permisos', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>' },
    { key: 'system_config', label: 'Configuración del Sistema', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33"/></svg>' },
    { key: 'view_reports', label: 'Ver Reportes', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>' },
    { key: 'export_data', label: 'Exportar Datos', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>' },
  ];

  rolePermissions: Record<string, Record<string, boolean>> = {
    admin: {
      view_dashboard: true, manage_inscriptions: true, approve_inscriptions: true,
      manage_schedule: true, manage_accreditations: true, manage_jury: true,
      manage_contracts: true, manage_communications: true, manage_news: true,
      manage_gallery: true, manage_users: true, manage_roles: true,
      system_config: true, view_reports: true, export_data: true,
    },
    organizador: {
      view_dashboard: true, manage_inscriptions: true, approve_inscriptions: true,
      manage_schedule: true, manage_accreditations: true, manage_jury: true,
      manage_contracts: true, manage_communications: true, manage_news: true,
      manage_gallery: true, manage_users: false, manage_roles: false,
      system_config: false, view_reports: true, export_data: true,
    },
    staff: {
      view_dashboard: true, manage_inscriptions: true, approve_inscriptions: false,
      manage_schedule: true, manage_accreditations: true, manage_jury: false,
      manage_contracts: false, manage_communications: true, manage_news: true,
      manage_gallery: true, manage_users: false, manage_roles: false,
      system_config: false, view_reports: false, export_data: false,
    },
    jurado: {
      view_dashboard: true, manage_inscriptions: false, approve_inscriptions: false,
      manage_schedule: false, manage_accreditations: false, manage_jury: false,
      manage_contracts: false, manage_communications: false, manage_news: false,
      manage_gallery: false, manage_users: false, manage_roles: false,
      system_config: false, view_reports: false, export_data: false,
    },
    sede: {
      view_dashboard: true, manage_inscriptions: false, approve_inscriptions: false,
      manage_schedule: false, manage_accreditations: false, manage_jury: false,
      manage_contracts: false, manage_communications: false, manage_news: false,
      manage_gallery: false, manage_users: false, manage_roles: false,
      system_config: false, view_reports: true, export_data: true,
    },
  };

  // Config
  config: SystemConfig = {
    festival_name: 'Pre Cosquín',
    edition: 'Puerto Pirámides 2026',
    start_date: '',
    end_date: '',
    main_venue: 'Puerto Pirámides, Chubut',
    inscriptions_open: 'true',
    public_registration: 'true',
    contract_signing: 'true',
    max_members: '20',
    categories: 'musica,danza',
    email_welcome: 'true',
    email_approval: 'true',
    email_rejection: 'true',
  };
  savingConfig = signal(false);
  configSaved = signal(false);
  private configEndpointAvailable = true;
  private usersEndpointAvailable = true;

  sanitizeIcon(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  ngOnInit(): void {
    this.loadUsers();
    this.loadConfig();
  }

  // ========== USERS ==========
  loadUsers(): void {
    if (!this.usersEndpointAvailable) { this.loading.set(false); return; }
    this.loading.set(true);
    this.http.get<User[]>(`${environment.apiUrl}/admin/users`).subscribe({
      next: (users) => {
        this.allUsers.set(users);
        this.filterUsers();
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        if (err.status === 500 || err.status === 0) {
          this.usersEndpointAvailable = false;
        }
      }
    });
  }

  filterUsers(): void {
    const tab = this.userRoleTab();
    const users = this.allUsers();
    this.users.set(tab === 'all' ? users : users.filter(u => u.role === tab));
  }

  getUserCountForRole(role: string): number {
    if (role === 'all') return this.allUsers().length;
    return this.allUsers().filter(u => u.role === role).length;
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  getRoleLabel(role: string): string {
    const labels: Record<string, string> = { admin: 'Admin', organizador: 'Organizador', jurado: 'Jurado', staff: 'Staff' };
    return labels[role] || role;
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  sendInvite(): void {
    if (!this.inviteForm.email || !this.inviteForm.full_name) return;
    this.inviting.set(true);
    this.inviteError.set('');
    this.http.post<InviteResult>(`${environment.apiUrl}/admin/users/invite`, this.inviteForm).subscribe({
      next: (result) => { this.inviting.set(false); this.inviteResult.set(result); this.loadUsers(); },
      error: (err) => { this.inviting.set(false); this.inviteError.set(err.error?.detail || 'Error al enviar la invitación'); }
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
    this.editName = user.full_name;
    this.editEmail = user.email;
    this.editError.set('');
  }

  saveUser(): void {
    const user = this.editingUser();
    if (!user || !this.editName.trim() || !this.editEmail.trim()) { this.editError.set('Nombre y email son requeridos'); return; }
    this.saving.set(true);
    this.http.patch(`${environment.apiUrl}/admin/users/${user.id}`, {
      full_name: this.editName.trim(), email: this.editEmail.trim(), role: this.editRole,
    }).subscribe({
      next: () => { this.saving.set(false); this.editingUser.set(null); this.loadUsers(); },
      error: (err) => { this.saving.set(false); this.editError.set(err.error?.detail || 'Error al guardar'); }
    });
  }

  deleteUser(user: User): void {
    if (!confirm(`¿Eliminar permanentemente a ${user.full_name}?`)) return;
    this.http.delete(`${environment.apiUrl}/admin/users/${user.id}/permanent`).subscribe({
      next: () => this.loadUsers(),
      error: (err) => alert(err.error?.detail || 'Error al eliminar')
    });
  }

  deactivateUser(user: User): void {
    if (!confirm(`¿Desactivar a ${user.full_name}?`)) return;
    this.http.delete(`${environment.apiUrl}/admin/users/${user.id}`).subscribe({ next: () => this.loadUsers() });
  }

  resetPassword(user: User): void {
    if (!confirm(`¿Resetear la contraseña de ${user.full_name}?`)) return;
    this.http.post<{ email: string; temp_password: string }>(`${environment.apiUrl}/admin/users/${user.id}/reset-password`, {}).subscribe({
      next: (result) => this.resetResult.set(result),
      error: (err) => alert(err.error?.detail || 'Error al resetear contraseña')
    });
  }

  syncUsers(): void {
    this.syncing.set(true);
    this.http.post<{ synced: number; emails: string[] }>(`${environment.apiUrl}/admin/users/sync`, {}).subscribe({
      next: (result) => {
        this.syncing.set(false);
        alert(result.synced > 0 ? `Se sincronizaron ${result.synced} usuario(s)` : 'Todos los usuarios ya estaban sincronizados');
        this.loadUsers();
      },
      error: (err) => { this.syncing.set(false); alert(err.error?.detail || 'Error al sincronizar'); }
    });
  }

  // ========== PERMISSIONS ==========
  isPermissionEnabled(role: string, feature: string): boolean {
    return this.rolePermissions[role]?.[feature] ?? false;
  }

  togglePermission(role: string, feature: string): void {
    if (!this.rolePermissions[role]) this.rolePermissions[role] = {};
    this.rolePermissions[role][feature] = !this.rolePermissions[role][feature];
  }

  // ========== CONFIG ==========
  loadConfig(): void {
    if (!this.configEndpointAvailable) return;
    this.http.get<SystemConfig>(`${environment.apiUrl}/admin/event-config`).subscribe({
      next: (cfg) => {
        this.config = { ...this.config, ...cfg };
        // Sync inscription visibility service with config
        if (this.config.public_registration === 'true') {
          this.inscriptionVisibility.show();
        } else {
          this.inscriptionVisibility.hide();
        }
      },
      error: (err) => {
        if (err.status === 404) {
          this.configEndpointAvailable = false;
        }
      }
    });
  }

  saveConfig(): void {
    // Sync inscription visibility immediately
    if (this.config.public_registration === 'true') {
      this.inscriptionVisibility.show();
    } else {
      this.inscriptionVisibility.hide();
    }

    if (!this.configEndpointAvailable) {
      this.configSaved.set(true);
      setTimeout(() => this.configSaved.set(false), 3000);
      return;
    }
    this.savingConfig.set(true);
    const payload = {
      fecha_inicio: this.config['start_date'] || null,
      fecha_fin: this.config['end_date'] || null,
      inscription_open: this.config['inscriptions_open'] === 'true',
      cupos: { max_members: parseInt(this.config['max_members'] || '20', 10) },
      reglas: { categories: (this.config['categories'] || '').split(',').filter(Boolean) },
    };
    this.http.patch(`${environment.apiUrl}/admin/event-config`, payload).subscribe({
      next: () => { this.savingConfig.set(false); this.configSaved.set(true); setTimeout(() => this.configSaved.set(false), 3000); },
      error: (err) => { this.savingConfig.set(false); if (err.status === 404) { this.configEndpointAvailable = false; this.configSaved.set(true); setTimeout(() => this.configSaved.set(false), 3000); } else { alert(err.error?.detail || 'Error al guardar'); } }
    });
  }

  toggleCategory(cat: string): void {
    const cats = (this.config['categories'] || '').split(',').filter(Boolean);
    if (cats.includes(cat)) {
      this.config['categories'] = cats.filter(c => c !== cat).join(',');
    } else {
      this.config['categories'] = [...cats, cat].join(',');
    }
  }
}
