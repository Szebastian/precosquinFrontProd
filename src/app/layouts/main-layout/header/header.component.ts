import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '@core/auth/auth.service';
import { ThemeService } from '@core/services/theme.service';
import { OrganizationStore } from '@core/state/organization.store';
import { UserStore } from '@core/state/user.store';
import { ToastService } from '@shared/components/toast/toast.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <header class="app-header">
      <div class="header-inner">
        <div class="header-left">
          <button
            (click)="sidebarOpen.set(!sidebarOpen())"
            class="btn-ghost btn-icon mobile-menu-btn"
            aria-label="Toggle menu"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              @if (sidebarOpen()) {
                <line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/>
              } @else {
                <line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/>
              }
            </svg>
          </button>
          <a routerLink="/dashboard" class="header-brand">
            <div class="brand-icon">
              <img src="assets/logoballena.png" alt="Precosquin Logo" class="h-full w-full object-contain" />
            </div>
            <span class="brand-text">Precosquin</span>
          </a>
        </div>

        <div class="header-right">
          <div class="org-switcher sm-down-hide">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-muted">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <select
              [value]="orgStore.currentOrgId()"
              (change)="onOrgChange($event)"
              class="org-select"
              aria-label="Seleccionar organizacion"
            >
              @for (org of orgStore.organizations(); track org.id) {
                <option [value]="org.id">{{ org.name }}</option>
              }
            </select>
          </div>

          <button
            class="btn-ghost btn-icon notification-btn"
            (click)="notificationsOpen.set(!notificationsOpen())"
            aria-label="Notificaciones"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
            </svg>
            <span class="notification-badge">3</span>
          </button>

          <button
            class="btn-ghost btn-icon theme-toggle"
            (click)="themeService.toggle()"
            [attr.aria-label]="themeService.isDark() ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
          >
            @if (themeService.isDark()) {
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>
              </svg>
            } @else {
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
              </svg>
            }
          </button>

          @if (notificationsOpen()) {
            <div class="dropdown-menu dropdown-menu-right animate-fade-in-down">
              <div class="dropdown-header">
                <span class="font-semibold">Notificaciones</span>
              </div>
              <div class="dropdown-scroll">
                @for (notif of mockNotifications; track notif.id) {
                  <a [routerLink]="notif.link" class="dropdown-item notification-item">
                    <div>
                      <p class="text-sm font-medium">{{ notif.title }}</p>
                      <p class="text-xs text-muted">{{ notif.time }}</p>
                    </div>
                  </a>
                }
              </div>
              <div class="dropdown-footer">
                <a routerLink="/notifications" class="text-sm text-brand font-medium">Ver todas</a>
              </div>
            </div>
          }

          <div class="user-menu">
            <button
              (click)="userMenuOpen.set(!userMenuOpen())"
              class="user-menu-trigger"
              aria-label="Menu de usuario"
            >
              <div class="avatar">
                {{ initials() }}
              </div>
              <span class="user-name sm-down-hide">{{ auth.profile()?.full_name || 'Usuario' }}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-muted">
                <path d="m6 9 6 6 6-6"/>
              </svg>
            </button>

            @if (userMenuOpen()) {
              <div class="dropdown-menu dropdown-menu-right animate-fade-in-down">
                <div class="dropdown-header">
                  <p class="font-semibold">{{ auth.profile()?.full_name }}</p>
                  <p class="text-xs text-muted">{{ auth.profile()?.email }}</p>
                  <span class="badge badge-brand mt-1" [class.jurado-header-role]="auth.isJurado()">{{ auth.profile()?.role }}</span>
                </div>
                <div class="dropdown-divider"></div>
                <a routerLink="/settings" class="dropdown-item">Configuracion</a>
                <a routerLink="/profile" class="dropdown-item">Mi perfil</a>
                <div class="dropdown-divider"></div>
                <button (click)="logout()" class="dropdown-item text-danger">
                  Cerrar sesion
                </button>
              </div>
            }
          </div>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .app-header {
      position: sticky;
      top: 0;
      z-index: var(--z-sticky);
      background-color: #fff;
      border-bottom: 1px solid var(--gray-200);
      height: var(--header-height);
    }

    :host-context(.dark) .app-header {
      background-color: var(--gray-100);
      border-bottom-color: var(--gray-200);
    }

    .header-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 100%;
      padding: 0 var(--space-4);
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: var(--space-3);
    }

    .mobile-menu-btn {
      display: none;
    }

    @media (max-width: 1023px) {
      .mobile-menu-btn {
        display: flex;
      }
    }

    .header-brand {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      text-decoration: none;
    }

    .brand-icon {
      width: 32px;
      height: 32px;
      border-radius: var(--radius-lg);
      background-color: var(--brand-600);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .brand-text {
      font-size: var(--text-lg);
      font-weight: var(--weight-bold);
      color: var(--gray-900);
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      position: relative;
    }

    .org-switcher {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      padding: var(--space-1) var(--space-3);
      background-color: var(--gray-50);
      border-radius: var(--radius-lg);
    }

    :host-context(.dark) .org-switcher {
      background-color: var(--gray-200);
    }

    .org-select {
      border: none;
      background: transparent;
      font-size: var(--text-sm);
      font-weight: var(--weight-medium);
      color: var(--gray-700);
      cursor: pointer;
      outline: none;
      padding-right: var(--space-6);
    }

    .notification-btn {
      position: relative;
    }

    .notification-badge {
      position: absolute;
      top: 2px;
      right: 2px;
      width: 18px;
      height: 18px;
      background-color: var(--danger-500);
      color: #fff;
      font-size: 10px;
      font-weight: var(--weight-bold);
      border-radius: var(--radius-full);
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid #fff;
    }

    :host-context(.dark) .notification-badge {
      border-color: var(--gray-100);
    }

    .user-menu {
      position: relative;
    }

    .user-menu-trigger {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      padding: var(--space-1);
      border: none;
      background: transparent;
      border-radius: var(--radius-lg);
      cursor: pointer;
      transition: background-color var(--transition-fast);
    }

    .user-menu-trigger:hover {
      background-color: var(--gray-100);
    }

    :host-context(.dark) .user-menu-trigger:hover {
      background-color: var(--gray-200);
    }

    .user-name {
      font-size: var(--text-sm);
      font-weight: var(--weight-medium);
      color: var(--gray-700);
    }

    .dropdown-menu {
      position: absolute;
      top: calc(100% + 4px);
      right: 0;
      min-width: 200px;
      background-color: #fff;
      border: 1px solid var(--gray-200);
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-lg);
      z-index: var(--z-dropdown);
      overflow: hidden;
    }

    :host-context(.dark) .dropdown-menu {
      background-color: var(--gray-100);
      border-color: var(--gray-200);
    }

    .dropdown-menu-right {
      right: 0;
    }

    .dropdown-header {
      padding: var(--space-3) var(--space-4);
      border-bottom: 1px solid var(--gray-100);
    }

    .dropdown-scroll {
      max-height: 256px;
      overflow-y: auto;
    }

    .dropdown-footer {
      padding: var(--space-2) var(--space-4);
      text-align: center;
      border-top: 1px solid var(--gray-100);
    }

    .dropdown-item {
      display: block;
      width: 100%;
      padding: var(--space-2) var(--space-4);
      font-size: var(--text-sm);
      color: var(--gray-700);
      text-align: left;
      border: none;
      background: none;
      cursor: pointer;
      transition: background-color var(--transition-fast);
      text-decoration: none;
    }

    .dropdown-item:hover {
      background-color: var(--gray-50);
    }

    :host-context(.dark) .dropdown-item:hover {
      background-color: var(--gray-200);
    }

    .dropdown-item.text-danger {
      color: var(--danger-600);
    }

    .jurado-header-role {
      background-color: rgba(255, 193, 7, 0.15);
      color: #ffc107;
      font-weight: 700;
      padding: 0.2em 0.5em;
      border-radius: 0.5em;
      line-height: 1;
      display: inline-block;
    }

    .notification-item {
      display: flex;
      align-items: flex-start;
      gap: var(--space-3);
    }

    @media (max-width: 640px) {
      .sm-down-hide {
        display: none;
      }
    }
  `]
})
export class HeaderComponent {
  auth = inject(AuthService);
  themeService = inject(ThemeService);
  orgStore = inject(OrganizationStore);
  userStore = inject(UserStore);
  toast = inject(ToastService);

  sidebarOpen = signal(false);
  notificationsOpen = signal(false);
  userMenuOpen = signal(false);

  mockNotifications = [
    { id: 1, title: 'Nueva inscripcion recibida', time: 'hace 5 min', link: '/inscripciones/123' },
    { id: 2, title: 'Contrato firmado por Juan Perez', time: 'hace 1 hora', link: '/contratos/456' },
    { id: 3, title: 'Recordatorio: soundcheck manana 14:00', time: 'hace 3 horas', link: '/cronograma' }
  ];

  initials = (): string => {
    const name = this.auth.profile()?.full_name || 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  onOrgChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.orgStore.switchOrganization(select.value);
    const selectedOption = select.options[select.selectedIndex];
    this.toast.info('Organizacion cambiada', `Ahora en: ${selectedOption?.text || ''}`);
  }

  async logout(): Promise<void> {
    await this.auth.logout();
    this.userMenuOpen.set(false);
  }
}
